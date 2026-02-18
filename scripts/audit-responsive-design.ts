
import fs from 'fs';
import path from 'path';

/**
 * Mobile Responsive Design Audit Script
 *
 * Scans the codebase for CSS classes that indicate fixed dimensions without responsive modifiers.
 * Helps identify areas where the UI might break on smaller screens.
 *
 * Usage:
 *   npx tsx scripts/audit-responsive-design.ts [options]
 *
 * Options:
 *   --src <path>        Root directory to scan (default: src)
 *   --output <path>     Path to output report file (default: RESPONSIVE_COVERAGE_REPORT.md)
 *   --ignore <pattern>  Comma-separated list of file patterns to ignore (e.g., "test,stories")
 *   --json              Output result as JSON to stdout
 *   --fail-on-issues    Exit with code 1 if any issues are found
 */

const DEFAULTS = {
  SRC_DIR: 'src',
  REPORT_FILE: 'RESPONSIVE_COVERAGE_REPORT.md',
  IGNORE_PATTERNS: ['test', 'spec', 'stories', 'node_modules'],
};

interface ResponsiveIssue {
  file: string;
  line: number;
  class: string;
  category: string;
}

interface SuspiciousPattern {
  regex: RegExp;
  exclude?: string[];
  filter?: (match: RegExpMatchArray) => boolean;
  category: string;
  checkResponsive: (tokens: string[]) => boolean;
}

const SUSPICIOUS_PATTERNS: SuspiciousPattern[] = [
  {
    regex: /^w-(\d+|\d+\/\d+|\[.*\])$/,
    exclude: ['w-full', 'w-screen', 'w-fit', 'w-auto', 'w-min', 'w-max'],
    category: 'Fixed Width',
    checkResponsive: (tokens) => tokens.some(t => /^(sm|md|lg|xl|2xl):w-/.test(t))
  },
  {
    regex: /^h-(\d+|\[.*\])$/,
    exclude: ['h-full', 'h-screen', 'h-fit', 'h-auto', 'h-min', 'h-max'],
    category: 'Fixed Height',
    checkResponsive: (tokens) => tokens.some(t => /^(sm|md|lg|xl|2xl):h-/.test(t))
  },
  {
    regex: /^p[axy]?-(\d+)$/,
    filter: (match) => parseInt(match[1]) >= 8, // padding >= 8 (2rem)
    category: 'Large Padding',
    checkResponsive: (tokens) => tokens.some(t => /^(sm|md|lg|xl|2xl):p[axy]?-/.test(t))
  },
  {
    regex: /^m[axy]?-(\d+)$/,
    filter: (match) => parseInt(match[1]) >= 8, // margin >= 8 (2rem)
    category: 'Large Margin',
    checkResponsive: (tokens) => tokens.some(t => /^(sm|md|lg|xl|2xl):m[axy]?-/.test(t))
  },
  {
    regex: /^grid-cols-(\d+)$/,
    filter: (match) => parseInt(match[1]) > 1,
    category: 'Multi-column Grid',
    checkResponsive: (tokens) => tokens.some(t => /^(sm|md|lg|xl|2xl):grid-cols-/.test(t))
  },
  {
    regex: /^flex-row$/,
    category: 'Flex Row (Potential Stack Issue)',
    checkResponsive: (tokens) => tokens.some(t => /^(sm|md|lg|xl|2xl):flex-(row|col)/.test(t))
  }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    srcDir: path.join(process.cwd(), DEFAULTS.SRC_DIR),
    outputPath: path.join(process.cwd(), DEFAULTS.REPORT_FILE),
    ignorePatterns: [...DEFAULTS.IGNORE_PATTERNS],
    jsonOutput: false,
    failOnIssues: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--src':
        config.srcDir = path.resolve(args[++i]);
        break;
      case '--output':
        config.outputPath = path.resolve(args[++i]);
        break;
      case '--ignore':
        const patterns = args[++i].split(',');
        config.ignorePatterns.push(...patterns);
        break;
      case '--json':
        config.jsonOutput = true;
        break;
      case '--fail-on-issues':
        config.failOnIssues = true;
        break;
    }
  }
  return config;
}

function getAllFiles(dir: string, ignorePatterns: string[], fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);

    // Check ignore patterns
    if (ignorePatterns.some(p => filePath.includes(p))) return;

    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, ignorePatterns, fileList);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

function processFile(filePath: string): ResponsiveIssue[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Regex to capture className attributes:
  // 1. className="..." or className='...' -> Group 2
  // 2. className={`...`} -> Group 3
  // 3. className={"..."} or className={'...'} -> Group 5
  const classNameRegex = /className=(?:(["'])([\s\S]*?)\1|\{`([\s\S]*?)`\}|\{(["'])([\s\S]*?)\4\})/g;

  const issues: ResponsiveIssue[] = [];
  const processedTokens = new Set<string>();

  let match;
  while ((match = classNameRegex.exec(content)) !== null) {
    // Extract class string from the matching group
    const classString = match[2] || match[3] || match[5];
    if (!classString) continue;

    const tokens = classString.split(/\s+/).filter(t => t.trim() !== '');

    // Calculate line number
    const index = match.index;
    const line = content.substring(0, index).split('\n').length;

    tokens.forEach(token => {
      // Analyze token
      for (const pattern of SUSPICIOUS_PATTERNS) {
        const m = token.match(pattern.regex);
        if (m) {
          if (pattern.exclude && pattern.exclude.includes(token)) continue;
          if (pattern.filter && !pattern.filter(m)) continue;

          // Check if it's responsive
          if (!pattern.checkResponsive(tokens)) {
            // Check deduplication
            const issueKey = `${line}-${token}-${pattern.category}`;
            if (!processedTokens.has(issueKey)) {
                issues.push({
                  file: filePath,
                  line,
                  class: token,
                  category: pattern.category
                });
                processedTokens.add(issueKey);
            }
          }
        }
      }
    });
  }
  return issues;
}

function main() {
  const config = parseArgs();

  if (!config.jsonOutput) {
    console.log(`Scanning ${config.srcDir} for mobile responsiveness issues...`);
    console.log(`Ignoring patterns: ${config.ignorePatterns.join(', ')}`);
  }

  const files = getAllFiles(config.srcDir, config.ignorePatterns);
  const allIssues: ResponsiveIssue[] = [];

  files.forEach(file => {
    const issues = processFile(file);
    allIssues.push(...issues);
  });

  // Generate Report
  if (config.jsonOutput) {
    console.log(JSON.stringify(allIssues, null, 2));
  } else {
    let md = `# Mobile Responsive Breakpoint Coverage Audit Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n`;
    md += `**Scope:** \`${config.srcDir}\`\n`;
    md += `**Ignored:** \`${config.ignorePatterns.join(', ')}\`\n\n`;

    md += `## Summary\n`;
    md += `- **Files Scanned:** ${files.length}\n`;
    md += `- **Issues Found:** ${allIssues.length}\n`;

    const status = allIssues.length > 0 ? '⚠️ RESPONSIVE GAPS DETECTED' : '✅ EXCELLENT COVERAGE';
    md += `\n**Status:** ${status}\n\n`;

    if (allIssues.length > 0) {
      md += `## Findings\n\n`;

      // Group by file
      const issuesByFile: Record<string, ResponsiveIssue[]> = {};
      allIssues.forEach(i => {
        if (!issuesByFile[i.file]) issuesByFile[i.file] = [];
        issuesByFile[i.file].push(i);
      });

      Object.entries(issuesByFile).forEach(([file, issues]) => {
        const relativePath = path.relative(process.cwd(), file);
        md += `### \`${relativePath}\`\n`;
        md += `| Line | Class | Category | Suggestion |\n`;
        md += `|---|---|---|---|\n`;
        issues.forEach(issue => {
          md += `| ${issue.line} | \`${issue.class}\` | ${issue.category} | Add \`sm:\`, \`md:\`, or \`lg:\` variant |\n`;
        });
        md += `\n`;
      });
    }

    fs.writeFileSync(config.outputPath, md);
    console.log(`Report generated at ${config.outputPath}`);
  }

  if (config.failOnIssues && allIssues.length > 0) {
    console.error(`Failure: ${allIssues.length} responsive design issues found.`);
    process.exit(1);
  }
}

main();
