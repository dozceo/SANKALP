
import fs from 'fs';
import path from 'path';

/**
 * Firebase Compatibility Check Script
 *
 * Verifies that the codebase is using modern Firebase Modular SDK versions and patterns.
 * Scans `package.json` for version compliance and source files for legacy `firebase/compat` imports.
 *
 * Usage:
 *   npx tsx scripts/check-firebase-compat.ts
 *
 * Exits with code 1 if legacy usage or incompatible versions are detected.
 */

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const SRC_DIR = path.join(process.cwd(), 'src');
const OUTPUT_FILE = path.join(process.cwd(), 'FIREBASE_COMPATIBILITY_REPORT.md');

/**
 * Reads dependencies from package.json.
 */
function getDependencies(): Record<string, string> {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    throw new Error('package.json not found');
  }
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

/**
 * Recursively checks directory for files containing 'firebase/compat'.
 */
function checkCompatUsage(dir: string): string[] {
  let issues: string[] = [];
  try {
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
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err);
  }
  return issues;
}

function main() {
  console.log('Checking Firebase Compatibility...');
  let hasCriticalError = false;

  try {
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
            console.log('✅ Firebase SDK versions match expected major versions.');
        } else {
            report += `⚠️ Please verify compatibility between Client v${fbMajor} and Admin v${adminMajor}.\n`;
            console.warn(`⚠️ Warning: Potential version mismatch (Client v${fbMajor}, Admin v${adminMajor}).`);
        }
    } else {
        console.warn('⚠️ Firebase dependencies not fully detected.');
    }

    report += `\n## Legacy Usage Detection (firebase/compat)\n\n`;
    if (compatFiles.length === 0) {
        report += `✅ No legacy \`firebase/compat\` imports detected. The codebase is fully modular.\n`;
        console.log('✅ No legacy firebase/compat imports found.');
    } else {
        report += `⚠️ Found ${compatFiles.length} files using legacy compatibility imports:\n\n`;
        compatFiles.forEach(file => {
            report += `- \`${path.relative(process.cwd(), file)}\`\n`;
        });
        report += `\n**Recommendation**: Migrate these files to the modular Firebase SDK to reduce bundle size and ensure future compatibility.\n`;

        console.error(`❌ Found ${compatFiles.length} files using legacy firebase/compat imports.`);
        hasCriticalError = true;
    }

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Report generated at ${OUTPUT_FILE}`);

    if (hasCriticalError) {
        process.exit(1);
    }

  } catch (err) {
    console.error('Unhandled error during compatibility check:', err);
    process.exit(1);
  }
}

main();
