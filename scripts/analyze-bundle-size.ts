import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPORT_PATH = 'BUNDLE_SIZE_REPORT.md';
const APP_DIR = 'src/app';

function analyzeBundleSize() {
  console.log('📦 Starting Bundle Size Analysis...');

  let buildOutput = '';
  let buildSuccess = false;

  try {
    // Attempt to run Next.js build.
    // We redirect stderr to stdout to capture everything.
    // We set NODE_ENV=production to ensure correct build size.
    console.log('   Running `next build`... (this may take a minute)');
    buildOutput = execSync('npx next build', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' }
    });
    buildSuccess = true;
    console.log('✅ Build successful.');
  } catch (error: any) {
    console.warn('⚠️ Build failed. Falling back to static file analysis.');
    if (error.stdout) buildOutput += `\nStdout:\n${error.stdout.toString()}`;
    if (error.stderr) buildOutput += `\nStderr:\n${error.stderr.toString()}`;
  }

  let reportContent = `# Bundle Size Analysis Report\n\n**Date:** ${new Date().toISOString()}\n\n`;

  if (buildSuccess) {
    // Extract the table from build output
    const lines = buildOutput.split('\n');
    let tableStarted = false;
    let tableContent = '';

    for (const line of lines) {
      if (line.includes('Route (app)') || line.includes('Size') || line.includes('First Load JS')) {
        tableStarted = true;
      }
      if (tableStarted) {
        tableContent += line + '\n';
        // Stop capturing if we hit empty lines after table (heuristic)
        if (line.trim() === '' && tableContent.length > 500) break;
      }
    }

    if (tableContent) {
        reportContent += `## Build Output Summary\n\n\`\`\`\n${tableContent}\n\`\`\`\n`;
    } else {
        reportContent += `## Build Output\n\n\`\`\`\n${buildOutput}\n\`\`\`\n`;
    }

  } else {
    reportContent += `## Build Failed\n\nThe build could not complete, likely due to missing environment variables or dependencies. Below is a static analysis of file sizes in \`src/app\`.\n\n### Static File Analysis\n\n| File Path | Size (KB) |\n|---|---|\n`;

    const files = getAllFiles(APP_DIR);
    const largeFiles = files
        .map(f => ({ path: f, size: fs.statSync(f).size / 1024 }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 20); // Top 20 largest files

    largeFiles.forEach(f => {
        reportContent += `| \`${f.path}\` | ${f.size.toFixed(2)} |\n`;
    });

    reportContent += `\n### Build Error Log\n\n\`\`\`\n${buildOutput.slice(0, 2000)}...\n\`\`\`\n`;
  }

  // Recommendations
  reportContent += `\n## Recommendations\n- **Code Splitting:** Ensure heavy components are imported dynamically using \`next/dynamic\`.\n- **Dependencies:** Analyze \`package.json\` for unused or large libraries.\n- **Images:** Use \`next/image\` for automatic optimization.\n`;

  fs.writeFileSync(REPORT_PATH, reportContent);
  console.log(`✅ Report generated: ${REPORT_PATH}`);
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

analyzeBundleSize();
