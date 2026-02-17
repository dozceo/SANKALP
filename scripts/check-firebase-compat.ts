
import * as fs from 'fs';
import * as path from 'path';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const SRC_LIB_DIR = path.join(process.cwd(), 'src', 'lib');

interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

const issues: Issue[] = [];

function checkVersions() {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    issues.push({ type: 'error', message: 'package.json not found.' });
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const firebaseVersion = deps['firebase'];
  const firebaseAdminVersion = deps['firebase-admin'];

  if (firebaseVersion) {
    const v = parseInt(firebaseVersion.replace(/[^0-9.]/g, '').split('.')[0]);
    if (v < 9) {
      issues.push({ type: 'warning', message: `firebase version ${firebaseVersion} is old. Consider upgrading to v9+ (modular SDK).` });
    } else {
      issues.push({ type: 'info', message: `firebase version ${firebaseVersion} is up-to-date (modular SDK).` });
    }
  } else {
      issues.push({ type: 'warning', message: 'firebase dependency not found.' });
  }

  if (firebaseAdminVersion) {
    const v = parseInt(firebaseAdminVersion.replace(/[^0-9.]/g, '').split('.')[0]);
    if (v < 10) {
      issues.push({ type: 'warning', message: `firebase-admin version ${firebaseAdminVersion} is old. Consider upgrading to v10+.` });
    } else {
      issues.push({ type: 'info', message: `firebase-admin version ${firebaseAdminVersion} is up-to-date.` });
    }
  }
}

function checkImports() {
  if (!fs.existsSync(SRC_LIB_DIR)) return;

  const files = fs.readdirSync(SRC_LIB_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(SRC_LIB_DIR, file), 'utf-8');

    // Check for compat imports
    // import firebase from 'firebase/app';
    // import firebase from 'firebase/compat/app';
    if (/import\s+firebase\s+from\s+['"]firebase\/app['"]/.test(content)) {
        issues.push({
            type: 'warning',
            message: `File src/lib/${file} uses default import from 'firebase/app'. This is the legacy namespace import. Use named imports (e.g. { initializeApp }) for modular SDK.`
        });
    }

    if (/import\s+.*\s+from\s+['"]firebase\/compat\/.*['"]/.test(content)) {
         issues.push({
            type: 'warning',
            message: `File src/lib/${file} uses 'firebase/compat/*' imports. Migration to modular SDK is recommended.`
        });
    }
  }
}

function main() {
    console.log('Checking Firebase SDK compatibility...');
    checkVersions();
    checkImports();

    const reportPath = 'FIREBASE_COMPATIBILITY_REPORT.md';
    let reportContent = `# Firebase SDK Compatibility Report

Generated on: ${new Date().toISOString()}

`;

    if (issues.length === 0) {
        reportContent += "No compatibility issues found.\n";
    } else {
        reportContent += "| Type | Message |\n|---|---|\n";
        issues.forEach(i => {
            reportContent += `| ${i.type.toUpperCase()} | ${i.message} |\n`;
        });
    }

    fs.writeFileSync(reportPath, reportContent);
    console.log(`Report generated at ${reportPath}`);
}

main();
