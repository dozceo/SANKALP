
import fs from 'fs';
import path from 'path';

const REPORT_FILE = 'DOC_DRIFT_REPORT.md';

interface FeatureClaim {
  source: string;
  featureName: string;
  claimedLocation?: string;
  status?: string;
}

function extractClaimsFromFeaturesOverview(content: string): FeatureClaim[] {
  const claims: FeatureClaim[] = [];
  const lines = content.split('\n');
  let currentFeature = '';
  let currentStatus = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect feature header
    if (line.startsWith('#### ')) {
      currentFeature = line.replace(/####\s*\d*\.?\s*/, '').trim();
      currentStatus = ''; // Reset
    }

    // Detect Status
    if (line.startsWith('- **Status**:')) {
        const parts = line.split('**Status**:');
        if (parts.length > 1) {
            currentStatus = parts[1].trim();
        }
    }

    // Detect Location claim
    if (line.startsWith('- **Location**:')) {
      const parts = line.split('**Location**:');
      if (parts.length > 1) {
          let location = parts[1].trim();
          // Remove backticks if present
          location = location.replace(/`/g, '');

          if (currentFeature) {
            claims.push({
              source: 'docs/Features Overview.md',
              featureName: currentFeature,
              claimedLocation: location,
              status: currentStatus
            });
          }
      }
    }
  }
  return claims;
}

function extractClaimsFromReadme(content: string): FeatureClaim[] {
    const claims: FeatureClaim[] = [];
    // Regex for: ### 1. Feature Name (`path/to/file`)
    const regex = /###\s*\d+\.\s*(.*?)\s*\(`(.*?)`\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        claims.push({
            source: 'README.md',
            featureName: match[1].trim(),
            claimedLocation: match[2].trim(),
            status: 'Implied Complete' // README usually describes existing features
        });
    }
    return claims;
}

function verifyLocation(location: string): boolean {
  if (!location || location === 'TBD' || location.toLowerCase().includes('not started')) return false;

  // Resolve path relative to root
  const resolvedPath = path.resolve(process.cwd(), location);
  return fs.existsSync(resolvedPath);
}

function generateReport(claims: FeatureClaim[]) {
  let report = '# Documentation Drift Report\n\n';
  report += `Generated on: ${new Date().toISOString()}\n\n`;

  let driftCount = 0;
  let tableRows = '';

  for (const claim of claims) {
    let exists = false;
    let verdict = '✅ Verified';
    let isDrift = false;

    if (claim.claimedLocation && claim.claimedLocation !== 'TBD') {
      exists = verifyLocation(claim.claimedLocation);

      const isPlanned = claim.status?.toLowerCase().includes('planned') || claim.status?.toLowerCase().includes('not started');
      const isProgress = claim.status?.toLowerCase().includes('in progress');
      const isComplete = claim.status?.toLowerCase().includes('complete') || claim.status === 'Implied Complete';

      if (!exists) {
        if (isComplete || isProgress) {
             verdict = '❌ DRIFT (Missing Code)';
             isDrift = true;
        } else if (isPlanned) {
            verdict = '⚠️ Planned (No Code)';
        } else {
            // Default assumption if status is ambiguous but location is claimed: it should exist
            verdict = '❌ DRIFT (Missing Code)';
            isDrift = true;
        }
      }
    } else {
        const isPlanned = claim.status?.toLowerCase().includes('planned');
        if (!isPlanned) {
             verdict = '❓ No Location Claimed';
        } else {
             verdict = '📝 Planned';
        }
    }

    if (isDrift) driftCount++;

    const locationDisplay = claim.claimedLocation ? `\`${claim.claimedLocation}\`` : 'N/A';
    const existsDisplay = exists ? '✅ Yes' : '❌ No';

    tableRows += `| ${claim.featureName} | ${claim.source} | ${locationDisplay} | ${claim.status || 'Unknown'} | ${existsDisplay} | ${verdict} |\n`;
  }

  report += `**Summary**: Found ${driftCount} instances of documentation drift.\n\n`;
  report += '| Feature | Source | Claimed Location | Status | Code Exists | Verdict |\n';
  report += '| :--- | :--- | :--- | :--- | :--- | :--- |\n';
  report += tableRows;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

function main() {
  let allClaims: FeatureClaim[] = [];

  // 1. Scan docs/Features Overview.md
  const overviewPath = 'docs/Features Overview.md';
  if (fs.existsSync(overviewPath)) {
    const content = fs.readFileSync(overviewPath, 'utf-8');
    allClaims = allClaims.concat(extractClaimsFromFeaturesOverview(content));
  } else {
      console.warn(`Warning: ${overviewPath} not found.`);
  }

  // 2. Scan README.md
  const readmePath = 'README.md';
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    allClaims = allClaims.concat(extractClaimsFromReadme(content));
  } else {
      console.warn(`Warning: ${readmePath} not found.`);
  }

  generateReport(allClaims);
}

main();
