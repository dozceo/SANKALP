
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const DEV_FILE = path.join(SRC_DIR, 'ai/dev.ts');
const OUTPUT_FILE = path.join(process.cwd(), 'GENKIT_SECURITY_ASSESSMENT.md');

function checkDevFileGuards(): string[] {
  const issues: string[] = [];
  if (!fs.existsSync(DEV_FILE)) {
    return ['`src/ai/dev.ts` not found. Assuming secure configuration (or file moved).'];
  }
  const content = fs.readFileSync(DEV_FILE, 'utf-8');
  if (!content.includes('process.env.NODE_ENV') && !content.includes('if (typeof window === \'undefined\')')) {
    issues.push('⚠️ No explicit environment guard found in `src/ai/dev.ts`. Ensure it is not bundled in production.');
  }
  return issues;
}

function checkDevImports(dir: string): string[] {
  let imports: string[] = [];
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
  return imports;
}

function main() {
  console.log('Auditing Genkit Security...');

  const guardIssues = checkDevFileGuards();
  const importIssues = checkDevImports(SRC_DIR);

  let report = `# Genkit Dev Server Security Assessment\n\nGenerated on: ${new Date().toISOString()}\n\n`;

  report += `## Environment Guards\n\n`;
  if (guardIssues.length === 0) {
      report += `✅ \`src/ai/dev.ts\` appears to have environment checks or is safe.\n`;
  } else {
      report += `⚠️ Issues Found:\n`;
      guardIssues.forEach(issue => report += `- ${issue}\n`);
  }

  report += `\n## Production Code Exposure\n\n`;
  if (importIssues.length === 0) {
      report += `✅ No production code imports \`src/ai/dev.ts\`.\n`;
  } else {
      report += `⚠️ The following files import the dev server configuration, which may expose it in production:\n\n`;
      importIssues.forEach(file => {
          report += `- \`${path.relative(process.cwd(), file)}\`\n`;
      });
      report += `\n**Recommendation**: Remove these imports or ensure they are wrapped in \`process.env.NODE_ENV !== 'production'\` checks and tree-shaken.\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

main();
