
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const DEV_FILE = path.join(SRC_DIR, 'ai/dev.ts');
const REPORT_PATH = path.join(process.cwd(), 'GENKIT_SECURITY_ASSESSMENT.md');

function scanForImports(dir: string, targetFile: string, issues: string[]) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanForImports(fullPath, targetFile, issues);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      if (fullPath === targetFile) continue; // Skip self

      const content = fs.readFileSync(fullPath, 'utf-8');
      // Check for import of ai/dev
      // Pattern: import ... from '@/ai/dev' or './ai/dev' etc.
      // This is hard with relative paths.
      // But we can search for the string "ai/dev" in imports.
      if (/from\s+['"].*ai\/dev['"]/.test(content) || /import\s+['"].*ai\/dev['"]/.test(content)) {
        issues.push(`- **CRITICAL**: \`${path.relative(process.cwd(), fullPath)}\` imports \`ai/dev\`. This file is for development only and must not be included in production builds.`);
      }
    }
  }
}

const issues: string[] = [];

// Check 1: File existence
if (fs.existsSync(DEV_FILE)) {
  const content = fs.readFileSync(DEV_FILE, 'utf-8');

  // Check 2: Environment Guard
  if (!content.includes('process.env.NODE_ENV') && !content.includes('!production')) {
    issues.push(`- **Warning**: \`src/ai/dev.ts\` lacks an explicit \`process.env.NODE_ENV\` check. While safe if not imported, adding a runtime guard is recommended.`);
  }

  // Check 3: Usage
  scanForImports(SRC_DIR, DEV_FILE, issues);
} else {
  issues.push(`- **Info**: \`src/ai/dev.ts\` not found. Skipping security check.`);
}

const reportContent = `# Genkit Security Assessment

Generated on: ${new Date().toISOString()}

## Assessment Target
- **File**: \`src/ai/dev.ts\`
- **Purpose**: Development server for Genkit flows.

## Findings
${issues.length === 0 ? 'No security issues found. The dev server appears isolated from production code.' : issues.join('\n')}

## Recommendations
- Ensure \`src/ai/dev.ts\` is excluded from the build output (Next.js automatically excludes files not imported by pages/components).
- Do not import \`src/ai/dev.ts\` in any file under \`src/app\` or \`src/components\`.
`;

fs.writeFileSync(REPORT_PATH, reportContent);
console.log(`Generated ${REPORT_PATH}`);
