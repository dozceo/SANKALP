
import fs from 'fs';
import path from 'path';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const SRC_DIR = path.join(process.cwd(), 'src');
const OUTPUT_FILE = path.join(process.cwd(), 'FIREBASE_COMPATIBILITY_REPORT.md');

function getDependencies(): Record<string, string> {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

function checkCompatUsage(dir: string): string[] {
  let issues: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      issues = issues.concat(checkCompatUsage(filePath));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('firebase/compat')) {
          issues.push(filePath);
        }
      }
    }
  });
  return issues;
}

function main() {
  console.log('Checking Firebase Compatibility...');
  const deps = getDependencies();
  const firebaseVer = deps['firebase'];
  const adminVer = deps['firebase-admin'];

  const compatFiles = checkCompatUsage(SRC_DIR);

  let report = `# Firebase SDK Compatibility Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;

  report += `## Installed Versions\n\n`;
  report += `- **firebase**: \`${firebaseVer || 'Not Installed'}\`\n`;
  report += `- **firebase-admin**: \`${adminVer || 'Not Installed'}\`\n\n`;

  if (firebaseVer && adminVer) {
      report += `## Compatibility Status\n\n`;
      // Check for major version mismatch (heuristic)
      const fbMajor = parseInt(firebaseVer.replace(/[^0-9]/g, ''));
      const adminMajor = parseInt(adminVer.replace(/[^0-9]/g, ''));

      if (fbMajor >= 11 && adminMajor >= 13) {
          report += `✅ Versions appear compatible (Firebase v11+ and Admin v13+).\n`;
      } else {
          report += `⚠️ Please verify compatibility between Client v${fbMajor} and Admin v${adminMajor}.\n`;
      }
  }

  report += `\n## Legacy Usage Detection (firebase/compat)\n\n`;
  if (compatFiles.length === 0) {
      report += `✅ No legacy \`firebase/compat\` imports detected. The codebase is fully modular.\n`;
  } else {
      report += `⚠️ Found ${compatFiles.length} files using legacy compatibility imports:\n\n`;
      compatFiles.forEach(file => {
          report += `- \`${path.relative(process.cwd(), file)}\`\n`;
      });
      report += `\n**Recommendation**: Migrate these files to the modular Firebase SDK to reduce bundle size and ensure future compatibility.\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

main();
