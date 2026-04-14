
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const REPORT_PATH = path.join(process.cwd(), 'reports', 'THEME_CONSISTENCY_REPORT.md');

interface ThemeIssue {
    file: string;
    line: number;
    type: 'HARDCODED_COLOR' | 'MISSING_DARK_MODE';
    content: string;
}

const issues: ThemeIssue[] = [];
let totalFilesScanned = 0;
let filesWithDarkSupport = 0;

// Regex for arbitrary Tailwind colors e.g., bg-[#123456], text-[#abc], border-[rgb(0,0,0)]
// Also includes standard colors like bg-red-500 which might be inconsistent if we want to enforce semantic names
// For now, let's flag arbitrary values as the main issue.
const ARBITRARY_COLOR_REGEX = /(bg|text|border|ring|fill|stroke)-\[(#|rgb|hsl)[^\]]+\]/g;
const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,6}/g; // Matches raw hex codes in style props or inline styles

function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let hasDark = false;

    lines.forEach((line, index) => {
        const lineNum = index + 1;

        // Check for arbitrary tailwind values
        let match;
        while ((match = ARBITRARY_COLOR_REGEX.exec(line)) !== null) {
            issues.push({
                file: filePath,
                line: lineNum,
                type: 'HARDCODED_COLOR',
                content: match[0]
            });
        }

        // Check for raw hex codes (heuristic, might catch non-colors)
        // We skip lines that look like definitions in constants or tests for now to reduce noise
        if (!filePath.endsWith('.css') && !filePath.includes('tailwind.config')) {
             const hexMatches = line.match(HEX_COLOR_REGEX);
             if (hexMatches) {
                 // heuristic: if line contains 'color', 'background', 'fill', 'stroke' or looks like a prop
                 if (/(color|background|fill|stroke|style|className)/i.test(line)) {
                     hexMatches.forEach(hex => {
                         // Avoid some common non-color hexes if needed, but #123 is usually a color
                         issues.push({
                             file: filePath,
                             line: lineNum,
                             type: 'HARDCODED_COLOR',
                             content: hex
                         });
                     });
                 }
             }
        }

        if (line.includes('dark:')) {
            hasDark = true;
        }
    });

    totalFilesScanned++;
    if (hasDark) {
        filesWithDarkSupport++;
    } else {
        // Only flag missing dark mode if the file looks like a UI component
        // Simple heuristic: starts with uppercase and contains JSX elements or className
        const fileName = path.basename(filePath);
        if (/^[A-Z]/.test(fileName) && (content.includes('className') || content.includes('<'))) {
             // We won't log every single one as an issue to avoiding flooding,
             // but we track the stat.
        }
    }
}

function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
            scanFile(fullPath);
        }
    }
}

function generateReport() {
    let report = `# Theme Switching & Dark Mode Consistency Audit\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n`;
    report += `This audit analyzes the usage of colors in the codebase to ensure consistency with the design system and support for dark mode.\n\n`;

    report += `- **Total Files Scanned:** ${totalFilesScanned}\n`;
    report += `- **Files using \`dark:\` modifier:** ${filesWithDarkSupport} (${Math.round(filesWithDarkSupport/totalFilesScanned * 100)}%)\n`;

    const hardcodedIssues = issues.filter(i => i.type === 'HARDCODED_COLOR');
    report += `- **Hardcoded Color Instances:** ${hardcodedIssues.length}\n\n`;

    report += `## detailed Findings\n\n`;

    if (hardcodedIssues.length > 0) {
        report += `### Hardcoded Colors (Arbitrary Values)\n`;
        report += `These instances bypass the theme system (CSS variables) and may not adapt correctly to dark mode.\n\n`;
        report += `| File | Line | Content |\n`;
        report += `|------|------|---------|\n`;

        // Limit to top 100 to avoid huge file
        hardcodedIssues.slice(0, 100).forEach(item => {
            const relativePath = path.relative(process.cwd(), item.file);
            report += `| \`${relativePath}\` | ${item.line} | \`${item.content}\` |\n`;
        });

        if (hardcodedIssues.length > 100) {
            report += `\n*...and ${hardcodedIssues.length - 100} more.*\n`;
        }
        report += `\n`;
    }

    report += `## Recommendations\n`;
    report += `1. **Replace Hardcoded Colors:** Move distinct colors to \`globals.css\` as CSS variables or use standard Tailwind colors (e.g., \`bg-primary\`, \`text-muted-foreground\`).\n`;
    report += `2. **Verify Dark Mode:** Ensure components without \`dark:\` modifiers rely on semantic classes (like \`bg-background\`, \`text-foreground\`) which handle switching automatically.\n`;

    // Ensure directory exists
    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at: ${REPORT_PATH}`);
}

// Run audit
try {
    console.log('Starting Theme Consistency Audit...');
    walkDir(SRC_DIR);
    generateReport();
    console.log('Audit complete.');
} catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
}
