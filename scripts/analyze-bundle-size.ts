import { exec } from 'child_process';
import fs from 'fs';

const REPORT_FILE = 'BUNDLE_SIZE_REPORT.md';

console.log('Starting build for bundle analysis...');

// Mock env vars potentially needed for build to avoid crashes due to missing keys
const env = {
  ...process.env,
  GOOGLE_GENAI_API_KEY: 'mock_key_for_build',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock_project_id',
  GEMINI_API_KEY: 'mock_key'
};

const buildProcess = exec('npm run build', { env, maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
  let output = stdout + '\n' + stderr;

  if (error) {
    console.error('Build failed:', error);
    fs.writeFileSync(REPORT_FILE, `# Bundle Size Analysis Failed\n\nBuild failed with error:\n\`\`\`\n${stderr}\n\`\`\``);
    return;
  }

  // Parse stdout for the table
  // Look for "Route (app)" header
  const lines = output.split('\n');
  let tableLines = [];
  let capturing = false;

  for (const line of lines) {
    // Next.js build output table usually starts with headers like "Route (app)" or just "Page"
    if (line.includes('Route (app)') || line.includes('First Load JS')) {
      capturing = true;
    }

    if (capturing) {
      // Stop capturing if we hit typical end messages
      if (line.includes('Build finished')) break;
      tableLines.push(line);
    }
  }

  // If no table found, dump the last 50 lines
  let content = '';
  if (tableLines.length > 0) {
    content = tableLines.join('\n');
  } else {
    content = lines.slice(-50).join('\n');
  }

  // Format report
  const report = `# Bundle Size Analysis

**Date:** ${new Date().toISOString()}

## Build Output Summary

\`\`\`
${content}
\`\`\`

## Recommendations
- Analyze large pages (>150kB First Load JS).
- Use dynamic imports (\`next/dynamic\`) for heavy components.
- Check \`package.json\` for unused large dependencies.
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report saved to ${REPORT_FILE}`);
});

// Stream output to console so we can see progress
buildProcess.stdout?.pipe(process.stdout);
buildProcess.stderr?.pipe(process.stderr);
