
import { execSync } from 'child_process';
import fs from 'fs';

const REPORT_FILE = 'COMMIT_QUALITY_REPORT.md';
const MAX_COMMITS = 50;

// Conventional Commits Regex
const CONVENTIONAL_REGEX = /^(feat|fix|docs|style|refactor|perf|test|chore|revert|build|ci)(\([a-z0-9-]+\))?: .+$/;

interface Commit {
  hash: string;
  message: string;
}

function getCommits(): Commit[] {
  try {
    const stdout = execSync(`git log --pretty=format:"%h|%s" -n ${MAX_COMMITS}`).toString();
    return stdout.split('\n').filter(line => line.trim()).map(line => {
      const [hash, ...msgParts] = line.split('|');
      return { hash, message: msgParts.join('|') };
    });
  } catch (e) {
    console.error('Error reading git log:', e);
    return [];
  }
}

function analyzeCommits(commits: Commit[]) {
  let report = '# Git Commit Message Quality Report\n\n';
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  report += `Analyzed last ${commits.length} commits.\n\n`;
  report += '| Hash | Message | Conventional? | Descriptive? | Verdict |\n';
  report += '| :--- | :--- | :--- | :--- | :--- |\n';

  let violationCount = 0;

  for (const commit of commits) {
    const isConventional = CONVENTIONAL_REGEX.test(commit.message);
    const isDescriptive = commit.message.length >= 10 && !commit.message.toLowerCase().match(/^(fix|update|wip|temp)$/);

    let verdict = '✅ Pass';
    if (!isConventional || !isDescriptive) {
      verdict = '❌ Violation';
      violationCount++;
    }

    const convIcon = isConventional ? '✅' : '❌';
    const descIcon = isDescriptive ? '✅' : '❌';

    report += `| ${commit.hash} | ${commit.message} | ${convIcon} | ${descIcon} | ${verdict} |\n`;
  }

  report += `\n**Summary**: Found ${violationCount} violations in the last ${commits.length} commits.\n`;

  if (violationCount > 0) {
      report += '\n### Recommendations\n';
      report += '- Use Conventional Commits format: `type(scope): description`\n';
      report += '- Avoid vague messages like "fix" or "update"\n';
      report += '- Provide context in the description\n';
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

function main() {
  const commits = getCommits();
  analyzeCommits(commits);
}

main();
