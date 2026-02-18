import { execSync } from 'child_process';
import fs from 'fs';

const OUTPUT_REPORT = 'COMMIT_QUALITY_REPORT.md';
const CONVENTIONAL_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
const TYPE_REGEX = new RegExp(`^(${CONVENTIONAL_TYPES.join('|')})(\\(.+\\))?: .+`);

interface Commit {
  hash: string;
  message: string;
}

function getCommits(): Commit[] {
  try {
    const output = execSync('git log --pretty=format:"%h - %s" -n 50', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean).map(line => {
      // Split by first occurrence of " - " to separate hash from message
      const firstSeparatorIndex = line.indexOf(' - ');
      if (firstSeparatorIndex === -1) return { hash: line, message: '' };

      const hash = line.substring(0, firstSeparatorIndex);
      const message = line.substring(firstSeparatorIndex + 3);
      return { hash, message };
    });
  } catch (error) {
    console.error('Error fetching git log:', error);
    return [];
  }
}

function analyzeCommit(commit: Commit) {
  const issues: string[] = [];

  if (commit.message.length < 10) {
    issues.push('Too short (< 10 chars)');
  }

  if (!TYPE_REGEX.test(commit.message)) {
    issues.push('Non-conventional format (expected "type: description")');
  }

  // Check for vague words
  const vague = ['fix', 'update', 'stuff', 'wip', 'change'];
  if (vague.includes(commit.message.toLowerCase())) {
      issues.push('Vague message content');
  }

  return issues;
}

function generateReport(commits: Commit[]) {
  let report = `# Commit Message Quality Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
  report += `Analyzed the last ${commits.length} commits.\n\n`;
  report += `| Hash | Message | Issues | Status |\n`;
  report += `|---|---|---|---|\n`;

  let violationCount = 0;

  commits.forEach(commit => {
    const issues = analyzeCommit(commit);
    const status = issues.length === 0 ? 'PASS' : 'FAIL';
    if (status === 'FAIL') violationCount++;

    report += `| ${commit.hash} | ${commit.message} | ${issues.join(', ') || '-'} | ${status} |\n`;
  });

  report += `\n**Summary:**\n- Total Commits: ${commits.length}\n- Violations: ${violationCount}\n- Compliance Rate: ${((commits.length - violationCount) / commits.length * 100).toFixed(1)}%\n`;

  fs.writeFileSync(OUTPUT_REPORT, report);
  console.log(`Report generated at ${OUTPUT_REPORT}`);
}

const commits = getCommits();
generateReport(commits);
