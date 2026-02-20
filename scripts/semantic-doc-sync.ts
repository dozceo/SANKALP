
import fs from 'fs';
import path from 'path';

// --- Types ---

interface Claim {
  type: 'file_path' | 'command' | 'endpoint' | 'dependency';
  value: string;
  file: string;
  line: number;
  context: string;
}

interface VerificationResult {
  claim: Claim;
  valid: boolean;
  evidence: string;
  suggestion?: string;
}

interface Report {
  results: VerificationResult[];
  staleCount: number;
  totalClaims: number;
  coverageGaps: string[];
}

// --- Configuration ---

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.Jules',
  '.jules'
];

const IGNORED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'SEMANTIC_DOC_SYNC_REPORT.md',
  'DOC_SYNC_REPORT.md'
];

// --- Helper Functions ---

function getAllFiles(dir: string, extension?: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    if (IGNORED_PATHS.includes(file) || IGNORED_FILES.includes(file)) continue;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extension));
    } else if (!extension || file.endsWith(extension)) {
      results.push(filePath);
    }
  }
  return results;
}

function extractClaims(filePath: string, content: string): Claim[] {
  const claims: Claim[] = [];
  const lines = content.split('\n');

  // Regex Patterns
  // Included [ ] { } for dynamic file paths
  const filePathRegex = /(?:src|scripts|docs)\/[a-zA-Z0-9_\-\/\.\[\]\{\}]+/g;
  const commandRegex = /(?:npm run|python|pip install|npx) [a-zA-Z0-9_\-\:\.]+/g;
  // Included [ ] { } for dynamic routes
  const endpointRegex = /\/api\/[a-zA-Z0-9_\-\/\[\]\{\}]+/g;
  const dependencyRegex = /(?:Next\.js|React|Tailwind CSS|Genkit|Python|Firebase|FastAPI) v?([0-9\.]+)?/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Reset regex state for each line
    filePathRegex.lastIndex = 0;
    commandRegex.lastIndex = 0;
    endpointRegex.lastIndex = 0;
    dependencyRegex.lastIndex = 0;

    // File Paths
    let match;
    while ((match = filePathRegex.exec(line)) !== null) {
      claims.push({
        type: 'file_path',
        value: match[0],
        file: filePath,
        line: i + 1,
        context: line.trim()
      });
    }

    // Commands
    while ((match = commandRegex.exec(line)) !== null) {
      if (match[0].startsWith('npm run ') || match[0].startsWith('python ') || match[0].startsWith('pip install ') || match[0].startsWith('npx ')) {
         claims.push({
          type: 'command',
          value: match[0],
          file: filePath,
          line: i + 1,
          context: line.trim()
        });
      }
    }

    // Endpoints
    while ((match = endpointRegex.exec(line)) !== null) {
       claims.push({
        type: 'endpoint',
        value: match[0],
        file: filePath,
        line: i + 1,
        context: line.trim()
      });
    }

    // Dependencies
    while ((match = dependencyRegex.exec(line)) !== null) {
       claims.push({
        type: 'dependency',
        value: match[0],
        file: filePath,
        line: i + 1,
        context: line.trim()
      });
    }
  }

  return claims;
}

// --- Verification Logic ---

function verifyFilePath(claim: Claim, allSourceFiles: string[]): VerificationResult {
  const exists = fs.existsSync(claim.value);
  if (exists) {
    return { claim, valid: true, evidence: 'File exists on disk.' };
  }

  // Fuzzy match logic
  const filename = path.basename(claim.value);
  const potentialMatches = allSourceFiles.filter(f => path.basename(f) === filename);

  if (potentialMatches.length > 0) {
      return {
        claim,
        valid: false,
        evidence: 'File not found at specified path, but exists elsewhere.',
        suggestion: `Did you mean one of: ${potentialMatches.join(', ')}?`
      };
  }

  return {
    claim,
    valid: false,
    evidence: 'File not found on disk.',
    suggestion: undefined
  };
}

function verifyCommand(claim: Claim, packageJson: any): VerificationResult {
  const cmd = claim.value;

  if (cmd.startsWith('npm run ')) {
    const scriptName = cmd.replace('npm run ', '').trim();
    if (packageJson.scripts && packageJson.scripts[scriptName]) {
      return { claim, valid: true, evidence: `Script '${scriptName}' found in package.json.` };
    }
    return {
      claim,
      valid: false,
      evidence: `Script '${scriptName}' NOT found in package.json.`,
      suggestion: `Available scripts: ${Object.keys(packageJson.scripts || {}).join(', ')}`
    };
  }

  if (cmd.startsWith('python ')) {
    const scriptPath = cmd.replace('python ', '').trim();
    // Resolving python script path relative to where it might be run from is tricky.
    // Usually relative to repo root if in README, or relative to subdirectory.
    // Let's assume relative to repo root for now.
    if (fs.existsSync(scriptPath)) {
      return { claim, valid: true, evidence: `Python script '${scriptPath}' found.` };
    }
    // Try finding it anywhere
    // verifyFilePath logic applies here too if we extracted it as a file path, but here it is a command.
    return {
      claim,
      valid: false,
      evidence: `Python script '${scriptPath}' not found.`,
      suggestion: `Check if the script exists.`
    };
  }

  return { claim, valid: true, evidence: 'Command verification skipped (heuristic only).' };
}

function verifyEndpoint(claim: Claim, validEndpoints: string[]): VerificationResult {
  let endpoint = claim.value;
  // validEndpoints are likely ['/api/intelligence/student', ...]
  // claim.value might be '/api/intelligence/student' or '/api/intelligence/student/route'

  if (endpoint.endsWith('/route')) {
    endpoint = endpoint.replace('/route', '');
  }

  // Also handle potential trailing slashes
  endpoint = endpoint.replace(/\/$/, '');

  // Check for exact match
  if (validEndpoints.includes(endpoint)) {
    return { claim, valid: true, evidence: `Endpoint '${endpoint}' exists in src/app/api.` };
  }

  // Check for partial match (e.g. claim is /api/intelligence/student/submit but actual is /api/intelligence/student)
  // This is tricky because sub-paths might not be endpoints.

  const suggestions = validEndpoints.filter(e => e.includes(endpoint) || endpoint.includes(e));

  return {
    claim,
    valid: false,
    evidence: `Endpoint '${endpoint}' NOT found in src/app/api.`,
    suggestion: suggestions.length > 0 ? `Did you mean one of: ${suggestions.join(', ')}?` : undefined
  };
}

function verifyDependency(claim: Claim, packageJson: any): VerificationResult {
  // Parsing "Next.js 15" -> pkg: "next", ver: "15"
  // Parsing "React" -> pkg: "react"

  const val = claim.value.toLowerCase();
  let pkgName = '';

  if (val.includes('next.js')) pkgName = 'next';
  else if (val.includes('react')) pkgName = 'react';
  else if (val.includes('tailwind')) pkgName = 'tailwindcss';
  else if (val.includes('genkit')) pkgName = 'genkit';
  else if (val.includes('firebase')) pkgName = 'firebase';

  if (!pkgName) return { claim, valid: true, evidence: 'Dependency check skipped (unknown package mapping).' };

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const version = deps[pkgName];

  if (version) {
    return { claim, valid: true, evidence: `Package '${pkgName}' found (version ${version}).` };
  }

  return {
    claim,
    valid: false,
    evidence: `Package '${pkgName}' NOT found in package.json.`,
    suggestion: `Install '${pkgName}' or update docs.`
  };
}

// --- Data Gathering ---

function getValidEndpoints(dir: string, basePath: string = '/api'): string[] {
  let endpoints: string[] = [];
  if (!fs.existsSync(dir)) return [];

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Check if this directory has a route.ts
      if (fs.existsSync(path.join(fullPath, 'route.ts'))) {
        endpoints.push(`${basePath}/${file}`);
      }
      // Recurse
      endpoints = endpoints.concat(getValidEndpoints(fullPath, `${basePath}/${file}`));
    }
  }
  return endpoints;
}

// --- Main Execution ---

async function main() {
  console.log('Starting Semantic Documentation Synchronization...');

  // 1. Scan Markdown
  const markdownFiles = getAllFiles('.', '.md');
  console.log(`Found ${markdownFiles.length} Markdown files.`);

  let allClaims: Claim[] = [];
  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const claims = extractClaims(file, content);
    for (const c of claims) {
      allClaims.push(c);
    }
  }
  console.log(`Extracted ${allClaims.length} claims.`);

  // 2. Load Context
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const validEndpoints = getValidEndpoints('src/app/api');
  const allSourceFiles = getAllFiles('src');
  console.log(`Found ${validEndpoints.length} valid API endpoints.`);
  console.log(`Found ${allSourceFiles.length} source files for fuzzy matching.`);

  // 3. Verify
  const results: VerificationResult[] = [];

  for (const claim of allClaims) {
    let res: VerificationResult;
    switch (claim.type) {
      case 'file_path':
        res = verifyFilePath(claim, allSourceFiles);
        break;
      case 'command':
        res = verifyCommand(claim, packageJson);
        break;
      case 'endpoint':
        res = verifyEndpoint(claim, validEndpoints);
        break;
      case 'dependency':
        res = verifyDependency(claim, packageJson);
        break;
      default:
        res = { claim, valid: true, evidence: 'Unknown claim type' };
    }
    results.push(res);
  }

  const failed = results.filter(r => !r.valid);
  console.log(`Verification Complete: ${failed.length} / ${results.length} claims are potentially stale.`);

  // 4. Coverage Gaps
  // Find endpoints that are NOT mentioned in any claim
  const mentionedEndpoints = new Set(allClaims.filter(c => c.type === 'endpoint').map(c => c.value.replace('/route', '').replace(/\/$/, '')));
  const undocumentedEndpoints = validEndpoints.filter(e => !mentionedEndpoints.has(e));

  // 5. Generate Report
  const reportContent = generateReport(results, failed, undocumentedEndpoints, markdownFiles.length, allClaims.length);
  fs.writeFileSync('SEMANTIC_DOC_SYNC_REPORT.md', reportContent);
  console.log('Report generated: SEMANTIC_DOC_SYNC_REPORT.md');

  console.log('Finished.');
}

function generateReport(
  allResults: VerificationResult[],
  failedResults: VerificationResult[],
  undocumentedEndpoints: string[],
  fileCount: number,
  claimCount: number
): string {
  const timestamp = new Date().toISOString();
  let md = `# Semantic Documentation Synchronization Report
Generated: ${timestamp}

## Overview
- **Files Scanned**: ${fileCount}
- **Claims Extracted**: ${claimCount}
- **Stale Claims**: ${failedResults.length}
- **Documentation Debt**: ${Math.round((failedResults.length / claimCount) * 100)}% stale
- **Undocumented Endpoints**: ${undocumentedEndpoints.length}

## 1. Staleness Audit
The following documentation claims appear to be outdated or incorrect based on code analysis.

| File | Type | Claim | Issue | Suggestion |
|------|------|-------|-------|------------|
`;

  // Group by file
  const grouped = failedResults.reduce((acc, res) => {
    if (!acc[res.claim.file]) acc[res.claim.file] = [];
    acc[res.claim.file].push(res);
    return acc;
  }, {} as Record<string, VerificationResult[]>);

  for (const [file, failures] of Object.entries(grouped)) {
    // limit strictly long outputs
    const relativeFile = path.relative('.', file);
    failures.forEach(f => {
      md += `| \`${relativeFile}\` | ${f.claim.type} | \`${f.claim.value}\` | ${f.evidence} | ${f.suggestion || ''} |\n`;
    });
  }

  md += `\n## 2. Update Proposals
Below are specific patches to fix the detected issues.

`;

  for (const [file, failures] of Object.entries(grouped)) {
    const relativeFile = path.relative('.', file);
    md += `### ${relativeFile}\n`;
    md += `\`\`\`diff\n`;
    failures.forEach(f => {
       md += `- ${f.claim.context}\n`;
       // Heuristic for the "new" line
       let newLine = f.claim.context;
       let applied = false;

       if (f.suggestion && f.suggestion.startsWith('Did you mean one of: ')) {
           const match = f.suggestion.match(/Did you mean one of: ([^?]+)\?/);
           if (match) {
               const suggestions = match[1].split(', ');
               if (suggestions.length > 0) {
                   // Replace the old value with the first suggestion
                   // This is naive string replacement, might be risky but good for a proposal
                   // We need to be careful not to replace partial matches incorrectly
                   if (f.claim.type === 'endpoint') {
                       // Replace the endpoint part
                        newLine = newLine.replace(f.claim.value, suggestions[0]);
                        applied = true;
                   } else if (f.claim.type === 'file_path') {
                       newLine = newLine.replace(f.claim.value, suggestions[0]);
                       applied = true;
                   }
               }
           }
       }

       if (applied && newLine !== f.claim.context) {
           md += `+ ${newLine} (Proposed)\n`;
       } else {
           // If no safe replacement found, mark as stale
           md += `+ <!-- [STALE] ${f.claim.context} -->\n`;
       }
    });
    md += `\`\`\`\n\n`;
  }

  md += `\n## 3. Coverage Gaps
The following features or endpoints exist in the code but are NOT mentioned in any documentation.

### Undocumented API Endpoints
`;
  undocumentedEndpoints.forEach(e => {
    md += `- \`${e}\`\n`;
  });

  md += `\n## 4. Next Steps
1. Review the "Update Proposals" above.
2. Manually verify ambiguous suggestions.
3. Apply changes to \`.md\` files.
4. Run this script again to verify resolution.
`;

  return md;
}

if (require.main === module) {
  main().catch(console.error);
}
