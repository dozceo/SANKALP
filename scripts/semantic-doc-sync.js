
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const ROOT_DIR = process.cwd();
const IGNORE_DIRS = ['.git', 'node_modules', '.genkit', '.jules', 'reports', '.idx', 'messages', '.DS_Store', 'dist', '.next'];
const IGNORE_FILES = ['DOC_SYNC_REPORT.md', 'NEW_DOC_SYNC_REPORT.md', 'CHANGELOG.md', 'DOC_DRIFT_REPORT.md'];
const REPORT_FILE = 'DOC_SYNC_REPORT.md';

// --- Helpers ---

function getAllFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(file)) {
          getAllFiles(filePath, fileList);
        }
      } else {
        fileList.push(path.relative(ROOT_DIR, filePath));
      }
    });
  } catch (e) {
    // Ignore access errors
  }
  return fileList;
}

function getMdFiles() {
  const allFiles = getAllFiles(ROOT_DIR);
  return allFiles.filter(f => f.endsWith('.md') && !IGNORE_FILES.includes(path.basename(f)));
}

function getSourceFiles() {
  const allFiles = getAllFiles(ROOT_DIR);
  return allFiles.filter(f => f.startsWith('src/') || f.startsWith('scripts/'));
}

// --- Extraction Logic ---

function extractClaims(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf-8');
  const lines = content.split('\n');
  const claims = { files: [], commands: [], features: [], endpoints: [] };

  let inCodeBlock = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Toggle Code Block
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    // 1. Extract File Paths (heuristic: contains /, ends with extension, or starts with src/)
    // Regex matches strings that look like paths: src/..., scripts/..., or ./...
    const fileRegex = /`?((?:src|scripts|\.)\/[\w\-\.\/]+)`?/g;
    let match;
    while ((match = fileRegex.exec(line)) !== null) {
      const p = match[1];
      // Filter out common false positives
      if (!p.includes(' ') && (p.includes('/') || p.includes('.')) && !p.endsWith('.')) {
         claims.files.push({ file: mdFile, line: lineNum, path: p, context: line.trim() });
      }
    }

    // 2. Extract Commands (only in code blocks or starting with $)
    if (inCodeBlock || line.trim().startsWith('$')) {
      const cmdRegex = /(npm run [\w\-:]+|python [\w\-\.]+|pip install [\w\-\.]+)/g;
      while ((match = cmdRegex.exec(line)) !== null) {
        claims.commands.push({ file: mdFile, line: lineNum, command: match[1], context: line.trim() });
      }
    }

    // 3. Extract Features & Status
    // Look for checkbox patterns: - [ ] Feature, - [x] Feature
    const pendingRegex = /- \[ \] (.*)/;
    const implementedRegex = /- \[x\] (.*)/;

    if ((match = pendingRegex.exec(line)) !== null) {
      claims.features.push({ file: mdFile, line: lineNum, feature: match[1].trim(), status: 'pending', context: line.trim() });
    } else if ((match = implementedRegex.exec(line)) !== null) {
      claims.features.push({ file: mdFile, line: lineNum, feature: match[1].trim(), status: 'implemented', context: line.trim() });
    }

    // 4. Extract API Endpoints
    const endpointRegex = /`?(\/api\/[\w\-\.\/]+)`?/g;
    while ((match = endpointRegex.exec(line)) !== null) {
       claims.endpoints.push({ file: mdFile, line: lineNum, endpoint: match[1], context: line.trim() });
    }
  });

  return claims;
}

// --- Verification Logic ---

function verifyClaims(allClaims, sourceFiles) {
  const issues = [];

  // 1. Verify File Existence
  allClaims.files.forEach(claim => {
    // Normalize path
    let p = claim.path;
    if (p.startsWith('./')) p = p.substring(2);

    // Ignore generic paths or root files that might be correct
    if (p === '.' || p === '..') return;

    // Check strict existence
    if (!fs.existsSync(path.resolve(ROOT_DIR, p))) {
        // Try fuzzy matching (e.g. .pk -> .pkl)
        let suggestion = undefined;

        // specific fix for .pk -> .pkl
        if (p.endsWith('.pk') && fs.existsSync(path.resolve(ROOT_DIR, p + 'l'))) {
            suggestion = p + 'l';
        } else if (p.endsWith('.ts') && fs.existsSync(path.resolve(ROOT_DIR, p + 'x'))) {
            suggestion = p + 'x';
        } else if (p.endsWith('.js') && fs.existsSync(path.resolve(ROOT_DIR, p.replace('.js', '.ts')))) {
            suggestion = p.replace('.js', '.ts');
        }

        issues.push({
          file: claim.file,
          type: 'broken-link',
          description: `Referenced file \`${p}\` not found.`,
          severity: 'high',
          context: claim.context,
          suggestion
        });
    }
  });

  // 2. Verify Commands
  let packageJson = {};
  try {
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  } catch (e) {}

  allClaims.commands.forEach(claim => {
    if (claim.command.startsWith('npm run')) {
      const parts = claim.command.split(' ');
      const scriptName = parts[2]; // npm run <script>
      if (packageJson.scripts && !packageJson.scripts[scriptName]) {
        issues.push({
          file: claim.file,
          type: 'invalid-command',
          description: `Script \`${scriptName}\` not found in package.json.`,
          severity: 'medium',
          context: claim.context
        });
      }
    } else if (claim.command.startsWith('python')) {
      const parts = claim.command.split(' ');
      const scriptPath = parts[1]; // python <script>
      // Check if python script exists (relative to root or src/ml/training as per common pattern)
      if (scriptPath && !fs.existsSync(scriptPath) && !fs.existsSync(path.join('src/ml/training', scriptPath)) && !fs.existsSync(path.join('src/ml/inference', scriptPath))) {
         issues.push({
            file: claim.file,
            type: 'invalid-command',
            description: `Python script \`${scriptPath}\` not found.`,
            severity: 'medium',
            context: claim.context
         });
      }
    }
  });

  // 3. Verify Features (Staleness)
  // This is tricky. We need to map feature names to files.
  // Heuristic: If feature name contains words that match a file name in sourceFiles.
  allClaims.features.forEach(claim => {
    if (claim.status === 'pending') {
      // Check if it might be implemented
      // Tokenize feature name (remove special chars, split by space)
      const tokens = claim.feature.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 3);

      if (tokens.length === 0) return;

      // Look for files containing these tokens
      const matches = sourceFiles.filter(sf => {
          const lower = sf.toLowerCase();
          // Require at least 2 tokens to match or 1 unique token if it's long enough
          const matchCount = tokens.filter(t => lower.includes(t)).length;
          return (tokens.length > 1 && matchCount >= 2) || (tokens.length === 1 && matchCount === 1);
      });

      if (matches.length > 0) {
        issues.push({
          file: claim.file,
          type: 'stale-status',
          description: `Feature "${claim.feature}" marked as [ ] (pending), but potential implementation found: \`${matches[0]}\`...`,
          severity: 'medium',
          context: claim.context,
          suggestion: `Mark as [x] and link to \`${matches[0]}\``
        });
      }
    }
  });

  // 4. Verify Endpoints
  allClaims.endpoints.forEach(claim => {
      // /api/foo/bar -> src/app/api/foo/bar/route.ts
      const relPath = claim.endpoint.replace('/api/', '');
      const possiblePaths = [
          path.join('src/app/api', relPath, 'route.ts'),
          path.join('src/app/api', relPath, 'page.tsx'), // Sometimes people confuse pages and apis
          path.join('src/app/api', relPath.split('?')[0], 'route.ts') // Handle query params
      ];

      // Also handle params like /api/users/[id]
      // This is hard with static analysis without regex.
      // We will skip if it contains [ or { or :
      if (claim.endpoint.includes('[') || claim.endpoint.includes('{') || claim.endpoint.includes(':')) {
          return;
      }

      if (!possiblePaths.some(p => fs.existsSync(p))) {
           issues.push({
              file: claim.file,
              type: 'missing-endpoint',
              description: `Endpoint \`${claim.endpoint}\` not found in \`src/app/api\`.`,
              severity: 'high',
              context: claim.context
           });
      }
  });

  return issues;
}

function checkCoverage(mdFiles, sourceFiles) {
    // Read all MD files content
    let fullDocs = '';
    try {
        fullDocs = mdFiles.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
    } catch (e) {
        return [];
    }

    const issues = [];

    // Check for major source files not mentioned
    sourceFiles.forEach(sf => {
        // Ignore test files, minor utilities, etc.
        if (sf.includes('test') || sf.includes('.d.ts') || sf.endsWith('types.ts')) return;

        // Check if file path or filename is mentioned
        if (!fullDocs.includes(sf) && !fullDocs.includes(path.basename(sf))) {
            // Only flag "important" files (e.g., in features/, flows/, api/)
            if (sf.includes('features/') || sf.includes('flows/') || sf.includes('app/api/')) {
                 issues.push({
                    file: 'Coverage Gap',
                    type: 'coverage-gap',
                    description: `Critical file \`${sf}\` is not mentioned in any documentation.`,
                    severity: 'low',
                    context: ''
                 });
            }
        }
    });

    return issues;
}

// --- Report Generation ---

function generateReport(issues) {
    let report = `# Documentation Synchronization Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;

    // Metrics
    const debt = issues.length;
    report += `## Documentation Debt Metric: ${debt} Issues\n\n`;
    report += `Trend: ${debt > 0 ? '🔴 High Debt' : '🟢 Healthy'}\n\n`;

    // 1. Staleness Audit
    report += `## 1. Staleness Audit (Status & Claims)\n\n`;
    const staleIssues = issues.filter(i => i.type === 'stale-status' || i.type === 'invalid-command');
    if (staleIssues.length === 0) report += "✅ No staleness detected.\n";
    else {
        report += `| File | Issue | Severity | Context |\n|---|---|---|---|\n`;
        staleIssues.forEach(i => {
             // sanitize context for markdown table
             const safeContext = (i.context || '').replace(/\|/g, '\\|').substring(0, 50);
             report += `| \`${i.file}\` | ${i.description} | ${i.severity} | \`${safeContext}...\` |\n`;
        });
    }

    // 2. Broken References
    report += `\n## 2. Broken Reference Inventory\n\n`;
    const brokenLinks = issues.filter(i => i.type === 'broken-link' || i.type === 'missing-endpoint');
    if (brokenLinks.length === 0) report += "✅ No broken links detected.\n";
    else {
        report += `| File | Description | Suggestion |\n|---|---|---|\n`;
        brokenLinks.forEach(i => {
             report += `| \`${i.file}\` | ${i.description} | ${i.suggestion || '-'} |\n`;
        });
    }

    // 3. Coverage Gaps
    report += `\n## 3. Coverage Gaps\n\n`;
    const gaps = issues.filter(i => i.type === 'coverage-gap');
    if (gaps.length === 0) report += "✅ High documentation coverage.\n";
    else {
        report += `The following key files are implemented but not documented:\n`;
        // Deduplicate
        const seen = new Set();
        gaps.forEach(i => {
            if (!seen.has(i.description)) {
                report += `- ${i.description.replace('Critical file ', '').replace(' is not mentioned in any documentation.', '')}\n`;
                seen.add(i.description);
            }
        });
    }

    // 4. Update Proposals
    report += `\n## 4. Update Proposals (Patches)\n\n`;
    // Group by file
    const fileIssues = issues.reduce((acc, issue) => {
        if (!acc[issue.file]) acc[issue.file] = [];
        acc[issue.file].push(issue);
        return acc;
    }, {});

    Object.keys(fileIssues).forEach(file => {
        if (file === 'Coverage Gap') return;
        report += `### ${file}\n`;
        fileIssues[file].forEach(i => {
            if (i.suggestion) {
                // If it's a broken link and we have a suggestion
                report += `**Problem:** ${i.description}\n`;

                // Construct diff
                let oldLine = i.context || '';
                let newLine = oldLine;

                if (i.type === 'broken-link' && i.suggestion) {
                    // Try to replace the broken path with suggestion in the context
                    // We need to extract the broken path from description first? No, we have it in memory but not easily accessible here without reparsing.
                    // But we know i.suggestion is the new path.
                    // We can try to replace the part that mismatches.

                    // Simple approach: just show suggestion
                    newLine = `(Suggestion: Replace broken path with ${i.suggestion})`;
                } else if (i.type === 'stale-status') {
                     newLine = i.suggestion || '';
                }

                report += `\`\`\`diff\n- ${oldLine}\n+ ${newLine}\n\`\`\`\n\n`;
            }
        });
    });

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated: ${REPORT_FILE}`);
}


// --- Main ---

async function main() {
  console.log('Starting Semantic Documentation Synchronizer...');

  const mdFiles = getMdFiles();
  const sourceFiles = getSourceFiles();

  console.log(`Found ${mdFiles.length} markdown files and ${sourceFiles.length} source files.`);

  let allIssues = [];

  for (const mdFile of mdFiles) {
    const claims = extractClaims(mdFile);
    const issues = verifyClaims(claims, sourceFiles);
    allIssues = [...allIssues, ...issues];
  }

  const coverageIssues = checkCoverage(mdFiles, sourceFiles);
  allIssues = [...allIssues, ...coverageIssues];

  generateReport(allIssues);
}

main().catch(console.error);
