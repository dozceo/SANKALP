
import fs from 'fs';
import path from 'path';

/**
 * Genkit Security Audit Script
 *
 * Audits the Genkit development server configuration for security risks.
 * Checks for:
 * 1. Environment guards (ensuring dev tools aren't active in production).
 * 2. Accidental imports of dev-only files in production code paths.
 *
 * Usage:
 *   npx tsx scripts/audit-genkit-security.ts
 *
 * Exits with code 1 if security risks are detected.
 */

const SRC_DIR = path.join(process.cwd(), 'src');
const DEV_FILE = path.join(SRC_DIR, 'ai/dev.ts');
const OUTPUT_FILE = path.join(process.cwd(), 'GENKIT_SECURITY_ASSESSMENT.md');

/**
 * Checks for environment variable guards in the dev file.
 */
function checkDevFileGuards(): string[] {
  const issues: string[] = [];
  try {
    if (!fs.existsSync(DEV_FILE)) {
      return ['`src/ai/dev.ts` not found. Assuming secure configuration (or file moved).'];
    }
    const content = fs.readFileSync(DEV_FILE, 'utf-8');
    if (!content.includes('process.env.NODE_ENV') && !content.includes('if (typeof window === \'undefined\')')) {
      issues.push('⚠️ No explicit environment guard found in `src/ai/dev.ts`. Ensure it is not bundled in production.');
    }
    return issues;
  } catch (err) {
    console.error('Error checking dev file:', err);
    return ['Error checking `src/ai/dev.ts`.'];
  }
}

/**
 * Recursively checks source files for imports of the dev file.
 */
function checkDevImports(dir: string): string[] {
  let imports: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        imports = imports.concat(checkDevImports(filePath));
      } else {
        if ((file.endsWith('.ts') || file.endsWith('.tsx')) && filePath !== DEV_FILE) {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Check for imports
          if (content.match(/from\s+['"]@\/ai\/dev['"]/) || content.match(/from\s+['"]\.\.?\/ai\/dev['"]/)) {
             imports.push(filePath);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err);
  }
  return imports;
}

function main() {
  console.log('Auditing Genkit Security...');
  let hasSecurityRisk = false;

  try {
    const guardIssues = checkDevFileGuards();
    const importIssues = checkDevImports(SRC_DIR);

    let report = `# Genkit Dev Server Security Assessment\n\nGenerated on: ${new Date().toISOString()}\n\n`;

    report += `## Environment Guards\n\n`;
    if (guardIssues.length === 0) {
        report += `✅ \`src/ai/dev.ts\` appears to have environment checks or is safe.\n`;
        console.log('✅ Genkit dev environment guards verified.');
    } else {
        report += `⚠️ Issues Found:\n`;
        guardIssues.forEach(issue => report += `- ${issue}\n`);
        console.warn('⚠️ Warning: Potential missing environment guards in src/ai/dev.ts');
        hasSecurityRisk = true;
    }

    report += `\n## Production Code Exposure\n\n`;
    if (importIssues.length === 0) {
        report += `✅ No production code imports \`src/ai/dev.ts\`.\n`;
        console.log('✅ No production code imports of dev tools found.');
    } else {
        report += `⚠️ The following files import the dev server configuration, which may expose it in production:\n\n`;
        importIssues.forEach(file => {
            report += `- \`${path.relative(process.cwd(), file)}\`\n`;
        });
        report += `\n**Recommendation**: Remove these imports or ensure they are wrapped in \`process.env.NODE_ENV !== 'production'\` checks and tree-shaken.\n`;

        console.error(`❌ Critical: Found ${importIssues.length} imports of dev tools in production code.`);
        hasSecurityRisk = true;
    }

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);

    if (hasSecurityRisk) {
        console.error('❌ Security audit failed. Please review GENKIT_SECURITY_ASSESSMENT.md');
        process.exit(1);
    }

  } catch (err) {
    console.error('Unhandled error during security audit:', err);
    process.exit(1);
  }
}

main();
