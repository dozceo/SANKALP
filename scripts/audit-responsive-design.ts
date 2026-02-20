
import fs from 'fs';
import path from 'path';

const REPORT_PATH = 'reports/RESPONSIVE_DESIGN_COVERAGE.md';

// Heuristic: Fixed dimensions without responsive prefixes
const FIXED_DIMENSION_REGEX = /\b(w-\[\d+px\]|h-\[\d+px\]|w-\d+|h-\d+|w-[1-9]\/\d|grid-cols-\d+)\b/g;
const RESPONSIVE_PREFIX_REGEX = /\b(sm:|md:|lg:|xl:|2xl:)/;

function getAllTsxFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return [];

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllTsxFiles(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

async function auditResponsiveDesign() {
    console.log('Starting Responsive Design Audit...');

    // We can use the find command from the previous step, or just walk the directories.
    // Let's walk 'src/app' and 'src/components'
    const files = [
        ...getAllTsxFiles('src/app'),
        ...getAllTsxFiles('src/components')
    ];

    let report = `# Mobile Responsive Breakpoint Coverage Audit\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n\n`;
    report += `## Methodology\n`;
    report += `- Scanned ${files.length} files.\n`;
    report += `- Flagged usage of fixed width/height/grid classes (e.g., \`w-96\`, \`grid-cols-3\`) that appear without responsive prefixes (\`sm:\`, \`md:\`, etc.) on the same line.\n`;
    report += `- **Note**: This is a heuristic. Some fixed widths are intentional (e.g., icons, avatars).\n\n`;

    report += `## Potential Violations\n\n`;

    let violationsCount = 0;

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        const fileViolations: { line: number, match: string, content: string }[] = [];

        lines.forEach((lineContent, index) => {
            // Find all fixed dimension classes
            let match;
            while ((match = FIXED_DIMENSION_REGEX.exec(lineContent)) !== null) {
                const className = match[0];

                // Check if this line has responsive prefixes (simplified check)
                // Ideally we check if *this specific class* has an override, but that requires full class parsing.
                // Fallback: if the line contains NO responsive prefixes, it's a higher risk.
                if (!RESPONSIVE_PREFIX_REGEX.test(lineContent)) {
                    // Filter out likely safe cases: icons (w-4, w-5, h-4, h-5)
                    if (!['w-4', 'w-5', 'w-6', 'h-4', 'h-5', 'h-6', 'w-full', 'h-full'].includes(className)) {
                         fileViolations.push({
                            line: index + 1,
                            match: className,
                            content: lineContent.trim().substring(0, 100) + '...'
                        });
                    }
                }
            }
        });

        if (fileViolations.length > 0) {
            report += `### \`${file}\`\n`;
            fileViolations.forEach(v => {
                report += `- **Line ${v.line}**: \`${v.match}\` - No responsive prefix detected.\n`;
                // Escape backticks in content for safety in MD report
                const safeContent = v.content.replace(/`/g, "'");
                report += `  - Context: \`${safeContent}\`\n`;
                violationsCount++;
            });
            report += `\n`;
        }
    });

    if (violationsCount === 0) {
        report += `No obvious responsive violations found (clean scan).\n`;
    } else {
        report += `**Total Potential Violations:** ${violationsCount}\n`;
    }

    // Ensure reports directory exists
    if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
    }

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Report generated at ${REPORT_PATH}`);
}

auditResponsiveDesign();
