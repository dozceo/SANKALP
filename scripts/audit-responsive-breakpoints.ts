
import fs from 'fs';
import path from 'path';

const SEARCH_DIRS = ['src/app', 'src/components'];
const IGNORE_FILES = ['layout.tsx', 'globals.css']; // Layout often has global constraints

interface Violation {
    file: string;
    line: number;
    class: string;
    reason: string;
}

const VIOLATIONS: Violation[] = [];

function scanFile(filePath: string) {
    if (IGNORE_FILES.includes(path.basename(filePath))) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        // Simple regex to find className contents. Not perfect but good heuristic.
        const classNameMatch = /className=['"`]([^'"`]+)['"`]/g;
        let match;
        while ((match = classNameMatch.exec(line)) !== null) {
            const classes = match[1].split(/\s+/);
            checkClasses(classes, filePath, idx + 1);
        }
    });
}

function checkClasses(classes: string[], filePath: string, line: number) {
    // Check for fixed widths that might overflow mobile
    const fixedWidths = classes.filter(c => /^w-(64|72|80|96|\d{3,})$/.test(c));
    const hasMaxWidth = classes.some(c => c.startsWith('max-w-'));
    const hasResponsiveWidth = classes.some(c => /^(sm|md|lg|xl|2xl):w-/.test(c));

    fixedWidths.forEach(c => {
        if (!hasMaxWidth && !hasResponsiveWidth) {
            VIOLATIONS.push({
                file: filePath,
                line: line,
                class: c,
                reason: "Fixed width > 16rem (256px) without max-width or responsive override. May overflow mobile."
            });
        }
    });

    // Check for arbitrary large widths
    const arbWidths = classes.filter(c => /^w-\[(\d+)px\]$/.test(c));
    arbWidths.forEach(c => {
        const val = parseInt(c.match(/\d+/)![0]);
        if (val > 300 && !hasMaxWidth && !hasResponsiveWidth) {
            VIOLATIONS.push({
                file: filePath,
                line: line,
                class: c,
                reason: `Fixed arbitrary width ${val}px > 300px. May overflow mobile.`
            });
        }
    });

    // Check for multi-column grids without responsive prefix
    const gridCols = classes.filter(c => /^grid-cols-(\d+)$/.test(c));
    const hasResponsiveGrid = classes.some(c => /^(sm|md|lg|xl|2xl):grid-cols-/.test(c));

    gridCols.forEach(c => {
        const cols = parseInt(c.match(/\d+/)![0]);
        if (cols > 1 && !hasResponsiveGrid) {
            VIOLATIONS.push({
                file: filePath,
                line: line,
                class: c,
                reason: `Grid with ${cols} columns on mobile. Consider starting with grid-cols-1 and adding md:grid-cols-${cols}.`
            });
        }
    });
}

function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.tsx')) {
            scanFile(fullPath);
        }
    });
}

function generateReport() {
    SEARCH_DIRS.forEach(dir => walkDir(dir));

    const report: string[] = [];
    report.push("# Mobile Responsive Breakpoint Coverage Audit");
    report.push("");
    report.push("## Overview");
    report.push("This report identifies UI components that use fixed dimensions or multi-column layouts without responsive breakpoints, potentially breaking the mobile user experience.");
    report.push("");

    if (VIOLATIONS.length === 0) {
        report.push("✅ No significant responsive violations found.");
    } else {
        report.push(`⚠️ Found ${VIOLATIONS.length} potential responsive design violations.`);
        report.push("");
        report.push("| File | Line | Class | Issue |");
        report.push("|---|---|---|---|");

        VIOLATIONS.forEach(v => {
            const relativePath = path.relative(process.cwd(), v.file);
            report.push(`| \`${relativePath}\` | ${v.line} | \`${v.class}\` | ${v.reason} |`);
        });

        report.push("");
        report.push("## Recommendations");
        report.push("1. Replace fixed widths (`w-96`) with `w-full max-w-sm` or add `sm:w-96`.");
        report.push("2. Ensure grids start as `grid-cols-1` on mobile and expand on larger screens (`md:grid-cols-3`).");
    }

    fs.writeFileSync('RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md', report.join('\n'));
    console.log("Report generated: RESPONSIVE_BREAKPOINT_COVERAGE_REPORT.md");
}

generateReport();
