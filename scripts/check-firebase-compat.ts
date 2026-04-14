
import * as fs from 'fs';
import * as path from 'path';

const PKG_JSON_PATH = path.join(process.cwd(), 'package.json');
const SRC_DIR = path.join(process.cwd(), 'src');

function getPackageVersions() {
  const pkg = JSON.parse(fs.readFileSync(PKG_JSON_PATH, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return {
    firebase: deps['firebase'],
    firebaseAdmin: deps['firebase-admin']
  };
}

function scanForCompatUsage(dir: string, issues: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanForCompatUsage(fullPath, issues);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Check 1: firebase/compat
      if (/from\s+['"]firebase\/compat/.test(content)) {
        issues.push(`- **Compat Import**: \`${path.relative(process.cwd(), fullPath)}\` imports from \`firebase/compat\`. This indicates legacy v8 API usage.`);
      }

      // Check 2: Default import from firebase/app (v8 style)
      // v9 modular: import { initializeApp } from "firebase/app";
      // v8: import firebase from "firebase/app";
      if (/import\s+firebase\s+from\s+['"]firebase\/app['"]/.test(content)) {
         issues.push(`- **Legacy Import**: \`${path.relative(process.cwd(), fullPath)}\` imports default \`firebase\` from \`firebase/app\`. This is v8 style. v9+ uses named exports.`);
      }

      // Check 3: firebase-admin legacy
      // v10+ recommends: import { initializeApp } from "firebase-admin/app";
      // Legacy: import * as admin from "firebase-admin";
      // This is less critical as admin SDK supports both well, but good to know.
      // I will mark it as "Suggestion" rather than issue if generic import is used.
    }
  }
  return issues;
}

const versions = getPackageVersions();
const issues = scanForCompatUsage(SRC_DIR);

const reportPath = path.join(process.cwd(), 'FIREBASE_COMPATIBILITY_REPORT.md');
const reportContent = `# Firebase Compatibility Report

Generated on: ${new Date().toISOString()}

## SDK Versions
- **firebase**: \`${versions.firebase || 'Not Installed'}\`
- **firebase-admin**: \`${versions.firebaseAdmin || 'Not Installed'}\`

## Compatibility Analysis
${issues.length === 0 ? 'No legacy compatibility issues detected. The codebase appears to use modern modular SDKs.' : issues.join('\n')}

## Recommendations
- Ensure \`firebase\` is v9+ (Modular).
- Ensure \`firebase-admin\` is v10+ (Modular support).
- Avoid \`firebase/compat/*\` imports to reduce bundle size.
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`Generated ${reportPath}`);
