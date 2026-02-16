
import fs from 'fs';
import path from 'path';

function scanDirectory(dir: string, fileCallback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileCallback);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileCallback(filePath);
    }
  }
}

function checkPermissions() {
  console.log("Starting Teacher Permission Boundary Audit...");

  const teacherDir = path.join(process.cwd(), 'src', 'app', '(main)', 'teacher');
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');

  // Check Middleware
  if (fs.existsSync(middlewarePath)) {
    console.log("[PASS] Middleware found.");
    const content = fs.readFileSync(middlewarePath, 'utf-8');
    if (content.includes('/teacher')) {
      console.log("[PASS] Middleware likely protects /teacher routes.");
    } else {
      console.warn("[WARN] Middleware exists but strictly checking for '/teacher' pattern failed (might be regex).");
    }
  } else {
    console.error("[CRITICAL FAIL] src/middleware.ts is MISSING! No global route protection.");
  }

  // Check Page/Layout Components
  console.log(`\nScanning ${teacherDir} for local authorization checks...`);
  let totalFiles = 0;
  let protectedFiles = 0;

  scanDirectory(teacherDir, (filePath) => {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Naive check for auth patterns
    const hasAuthCheck =
      content.includes('getServerSession') ||
      content.includes('auth()') ||
      content.includes('currentUser') ||
      content.includes('redirect('); // Often used to redirect unauth users

    if (hasAuthCheck) {
      console.log(`[PASS] ${relativePath} seems to have auth checks.`);
      protectedFiles++;
    } else {
      console.warn(`[WARN] ${relativePath} MIGHT be unprotected (no obvious auth keywords found).`);
    }
  });

  console.log(`\nSummary:`);
  console.log(`Total Files Scanned: ${totalFiles}`);
  console.log(`Seemingly Protected: ${protectedFiles}`);
  console.log(`Potentially Unprotected: ${totalFiles - protectedFiles}`);

  if (totalFiles - protectedFiles > 0) {
     console.error("\n[FAIL] Found potentially unprotected teacher routes.");
  }
}

checkPermissions();
