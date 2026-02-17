
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const COMPONENT_DIR = path.join(SRC_DIR, 'components');
const REPORT_FILE = path.join(process.cwd(), 'RESPONSIVE_COVERAGE_REPORT.md');

// Heuristic definitions
const SUSPICIOUS_PATTERNS = [
  {
    regex: /^w-(\d+|\d+\/\d+|\[.*\])$/,
    exclude: ['w-full', 'w-screen', 'w-fit', 'w-auto', 'w-min', 'w-max'],
    category: 'Fixed Width',
    checkResponsive: (tokens: string[]) => tokens.some(t => /^(sm|md|lg|xl|2xl):w-/.test(t))
  },
  {
    regex: /^h-(\d+|\[.*\])$/,
    exclude: ['h-full', 'h-screen', 'h-fit', 'h-auto', 'h-min', 'h-max'],
    category: 'Fixed Height',
    checkResponsive: (tokens: string[]) => tokens.some(t => /^(sm|md|lg|xl|2xl):h-/.test(t))
  },
  {
    regex: /^p[axy]?-(\d+)$/,
    filter: (match: RegExpMatchArray) => parseInt(match[1]) >= 8, // padding >= 8 (2rem)
    category: 'Large Padding',
    checkResponsive: (tokens: string[]) => tokens.some(t => /^(sm|md|lg|xl|2xl):p[axy]?-/.test(t))
  },
  {
    regex: /^m[axy]?-(\d+)$/,
    filter: (match: RegExpMatchArray) => parseInt(match[1]) >= 8, // margin >= 8 (2rem)
    category: 'Large Margin',
    checkResponsive: (tokens: string[]) => tokens.some(t => /^(sm|md|lg|xl|2xl):m[axy]?-/.test(t))
  },
  {
    regex: /^grid-cols-(\d+)$/,
    filter: (match: RegExpMatchArray) => parseInt(match[1]) > 1, // multiple columns
    category: 'Multi-column Grid',
    checkResponsive: (tokens: string[]) => tokens.some(t => /^(sm|md|lg|xl|2xl):grid-cols-/.test(t))
  },
  {
    regex: /^flex-row$/,
    category: 'Flex Row',
    checkResponsive: (tokens: string[]) => tokens.some(t => /^(sm|md|lg|xl|2xl):flex-col/.test(t) || /^(sm|md|lg|xl|2xl):flex-row/.test(t))
    // If it's flex-row by default, we expect maybe flex-col on mobile?
    // Actually Tailwind is mobile-first. So flex-row means it's flex-row on mobile.
    // If we want stack on mobile, it should be flex-col md:flex-row.
    // So if we see flex-row without responsive prefix, it means it's ALWAYS row.
    // That's suspicious for mobile.
    // So we check if there is ANY flex direction responsive override?
    // Wait, if it is flex-col md:flex-row, then 'flex-col' is the base class.
    // If we see 'flex-row' as base class, it means it is row on mobile.
    // So check if there is a responsive class that changes direction?
  }
];

function getAllFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const classNameRegex = /className=["']([^"']*)["']|className=\{`([^`]*)`\}/g;

  const issues: { line: number, class: string, category: string }[] = [];

  let match;
  while ((match = classNameRegex.exec(content)) !== null) {
    const classString = match[1] || match[2];
    if (!classString) continue;

    const tokens = classString.split(/\s+/).filter(t => t.trim() !== '');

    // Determine line number
    const line = content.substring(0, match.index).split('\n').length;

    tokens.forEach(token => {
      // Check each pattern
      for (const pattern of SUSPICIOUS_PATTERNS) {
        const m = token.match(pattern.regex);
        if (m) {
          if (pattern.exclude && pattern.exclude.includes(token)) continue;
          if (pattern.filter && !pattern.filter(m)) continue;

          // Check responsive
          if (!pattern.checkResponsive(tokens)) {
             // Special case for flex-row: check if flex-col exists as responsive?
             // No, the checkResponsive logic handles it.

             // Avoid duplicates
             if (!issues.find(i => i.line === line && i.class === token)) {
                 issues.push({
                   line,
                   class: token,
                   category: pattern.category
                 });
             }
          }
        }
      }
    });
  }
  return issues;
}

function main() {
  console.log("Scanning for mobile responsiveness issues...");
  const files = [...getAllFiles(APP_DIR), ...getAllFiles(COMPONENT_DIR)];

  let report = `# Mobile Responsive Breakpoint Coverage Audit Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  report += `**Scope:** \`src/app\`, \`src/components\`\n\n`;

  let totalIssues = 0;
  let filesWithIssues = 0;

  report += `## Findings\n\n`;

  files.forEach(file => {
    const issues = processFile(file);
    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;
      const relativePath = path.relative(process.cwd(), file);
      report += `### \`${relativePath}\`\n`;
      report += `| Line | Class | Category | Suggestion |\n`;
      report += `|---|---|---|---|\n`;
      issues.forEach(issue => {
        report += `| ${issue.line} | \`${issue.class}\` | ${issue.category} | Add \`sm:\`, \`md:\`, or \`lg:\` variant |\n`;
      });
      report += `\n`;
    }
  });

  report += `## Summary\n`;
  report += `- **Files Scanned:** ${files.length}\n`;
  report += `- **Files with Issues:** ${filesWithIssues}\n`;
  report += `- **Total Potential Issues:** ${totalIssues}\n`;

  if (totalIssues > 0) {
      report += `\n**Status:** ⚠️ RESPONSIVE GAPS DETECTED\n`;
  } else {
      report += `\n**Status:** ✅ EXCELLENT COVERAGE\n`;
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

main();
