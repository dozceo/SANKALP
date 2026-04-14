
import { exec } from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);
const REPORT_FILE = 'BUILD_OPTIMIZATION_REPORT.md';
const NEXT_CONFIG_FILE = 'next.config.ts';

async function analyzeConfig() {
  let issues: string[] = [];

  if (fs.existsSync(NEXT_CONFIG_FILE)) {
    const configContent = fs.readFileSync(NEXT_CONFIG_FILE, 'utf-8');

    if (configContent.includes('@sentry/nextjs')) {
      issues.push('- **Sentry Integration**: Sentry webpack plugin is enabled. This significantly increases build times due to source map generation and uploading.');
    }

    if (configContent.includes('ignoreBuildErrors: true')) {
      issues.push('- **TypeScript Errors Ignored**: `ignoreBuildErrors: true` speeds up build but risks shipping type errors to production.');
    }

    if (configContent.includes('ignoreDuringBuilds: true')) {
      issues.push('- **ESLint Ignored**: `ignoreDuringBuilds: true` speeds up build but skips linting checks.');
    }

    if (!configContent.includes('swcMinify: true')) {
      // Next.js 13+ defaults to true, but explicit check is good.
      // Actually modern next uses SWC by default.
    }

    if (configContent.includes('transpilePackages')) {
      issues.push('- **Transpiled Packages**: Heavy usage of `transpilePackages` can slow down compilation.');
    }
  } else {
    issues.push(`- **Config Missing**: ${NEXT_CONFIG_FILE} not found.`);
  }

  return issues;
}

async function runBuildAndCaptureMetrics() {
  console.log('Running Next.js build (this may take a while)...');
  const startTime = Date.now();

  let buildOutput = '';
  let buildSuccess = false;

  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    buildOutput = stdout + '\n' + stderr;
    buildSuccess = true;
  } catch (error: any) {
    buildOutput = error.stdout + '\n' + error.stderr;
    console.error('Build failed, analyzing partial output...');
  }

  const duration = (Date.now() - startTime) / 1000;

  // Parse page timings from output
  // Next.js output format:
  // ┌ λ /page    250ms    120kB

  const pageTimings: { page: string, time: number, size: string }[] = [];
  const lines = buildOutput.split('\n');

  const timingRegex = /([●λ○])\s+([^\s]+)\s+([\d\.]+(?:ms|s))\s+([\d\.]+\s*[kM]B)/;

  lines.forEach(line => {
    // Remove ANSI codes
    const cleanLine = line.replace(/\u001b\[[0-9]{1,2}m/g, '');
    const match = cleanLine.match(timingRegex);
    if (match) {
      const timeStr = match[3];
      let timeMs = parseFloat(timeStr);
      if (timeStr.includes('s') && !timeStr.includes('ms')) {
        timeMs *= 1000;
      }

      pageTimings.push({
        page: match[2],
        time: timeMs,
        size: match[4]
      });
    }
  });

  return {
    success: buildSuccess,
    duration,
    pageTimings,
    rawOutput: buildOutput
  };
}

async function generateReport() {
  const configIssues = await analyzeConfig();
  const buildMetrics = await runBuildAndCaptureMetrics();

  let reportContent = `# Build Time Optimization Report

## Executive Summary
Analysis of the Next.js build pipeline to identify slow compilation paths and configuration inefficiencies.

**Total Build Time:** ${buildMetrics.duration.toFixed(2)}s
**Build Status:** ${buildMetrics.success ? 'Success' : 'Failed'}

## Configuration Analysis
The following settings in \`next.config.ts\` impact build performance:

${configIssues.length > 0 ? configIssues.join('\n') : 'No specific configuration issues found.'}

## Compilation Performance
`;

  if (buildMetrics.pageTimings.length > 0) {
    // Sort by time descending
    const sorted = [...buildMetrics.pageTimings].sort((a, b) => b.time - a.time);

    reportContent += `
### Slowest Compilation Units
| Page | Time | Size |
|---|---|---|
`;

    sorted.slice(0, 10).forEach(p => {
      reportContent += `| \`${p.page}\` | ${p.time}ms | ${p.size} |\n`;
    });

    reportContent += `\n*Top 10 slowest pages shown.*\n`;

  } else {
    reportContent += `
Could not extract granular page timings. This might be due to build failure or output format changes.

**Raw Build Output Snippet (last 20 lines):**
\`\`\`
${buildMetrics.rawOutput.split('\n').slice(-20).join('\n')}
\`\`\`
`;
  }

  reportContent += `
## Recommendations

1. **Sentry Optimization:** If Sentry is not needed for all builds (e.g. dev/preview), conditionally disable it using \`process.env.ENABLE_SENTRY\`.
2. **Modularize Large Pages:** Pages taking >2s to compile often contain too many imports. Use \`next/dynamic\` for heavy components (charts, maps).
3. **Cache CI Artifacts:** Ensure \`.next/cache\` is restored between CI runs.
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport().catch(console.error);
