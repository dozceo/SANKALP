
import fs from 'fs';

const TS_TYPES_FILE = 'src/ml/inference/types.ts';
const PY_SCRIPT_FILE = 'src/ml/inference/predict_mastery.py';
const REPORT_FILE = 'POLYGLOT_TYPE_CONSISTENCY_REPORT.md';

function extractTsInterfaceProps(content: string, interfaceName: string): Set<string> {
    const props = new Set<string>();
    // Find the interface block
    const blockRegex = new RegExp(`interface\\s+${interfaceName}\\s*{([\\s\\S]*?)}`);
    const match = blockRegex.exec(content);

    if (match && match[1]) {
        const blockContent = match[1];
        // Match property lines: explicit key followed by colon
        // e.g. "avg_quiz_score: number;"
        const propRegex = /^\s*([a-zA-Z0-9_]+)\??\s*:/gm;
        let propMatch;
        while ((propMatch = propRegex.exec(blockContent)) !== null) {
            props.add(propMatch[1]);
        }
    }
    return props;
}

function extractPythonFeatureUsage(content: string): Set<string> {
    const props = new Set<string>();

    // Regex for features['key'] or features["key"]
    const bracketRegex = /features\s*\[\s*['"](.*?)['"]\s*\]/g;
    let match;
    while ((match = bracketRegex.exec(content)) !== null) {
        if (match[1]) props.add(match[1]);
    }

    // Regex for features.get('key') or features.get("key")
    const getRegex = /features\.get\(\s*['"](.*?)['"]\s*\)/g;
    while ((match = getRegex.exec(content)) !== null) {
        if (match[1]) props.add(match[1]);
    }

    return props;
}

function generateReport(tsProps: Set<string>, pyProps: Set<string>) {
    let report = '# Polyglot Type Consistency Report\n\n';
    report += `Generated on: ${new Date().toISOString()}\n\n`;
    report += '## Analysis\n\n';

    report += `**TypeScript Interface**: \`MasteryPredictionInput\` in \`${TS_TYPES_FILE}\`\n`;
    report += `**Python Script**: Usage in \`${PY_SCRIPT_FILE}\`\n\n`;

    // Union of all properties found
    const allProps = new Set([...Array.from(tsProps), ...Array.from(pyProps)]);
    const sortedProps = Array.from(allProps).sort();

    let mismatchCount = 0;
    let tableRows = '';

    for (const prop of sortedProps) {
        const inTs = tsProps.has(prop);
        const inPy = pyProps.has(prop);

        let status = '✅ Matched';
        if (inTs && inPy) {
            status = '✅ Matched';
        } else if (!inTs && inPy) {
            status = '❌ Missing in TS (Python expects it)';
            mismatchCount++;
        } else if (inTs && !inPy) {
            status = '⚠️ Unused in Python (TS defines it)';
            // Not a critical error
        }

        tableRows += `| \`${prop}\` | ${inTs ? '✅ Defined' : '❌ Missing'} | ${inPy ? '✅ Used' : '❌ Not Found'} | ${status} |\n`;
    }

    report += '| Property | TypeScript Definition | Python Usage | Status |\n';
    report += '| :--- | :--- | :--- | :--- |\n';
    report += tableRows;

    report += '\n## Summary\n';
    if (mismatchCount === 0) {
        report += '\n✅ No critical type mismatches found. Python script uses a subset or exact match of TypeScript definitions.\n';
    } else {
        report += `\n❌ Found ${mismatchCount} critical mismatches where Python expects fields not defined in TypeScript.\n`;
        report += 'Please update `src/ml/inference/types.ts` to include the missing fields.\n';
    }

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

function main() {
    if (!fs.existsSync(TS_TYPES_FILE)) {
        console.error(`TS Types file not found: ${TS_TYPES_FILE}`);
        // Attempt relative path fix if run from root
        if (fs.existsSync(TS_TYPES_FILE.replace('src/', './src/'))) {
             // path is likely correct
        } else {
             return;
        }
    }

    const tsContent = fs.readFileSync(TS_TYPES_FILE, 'utf-8');
    const pyContent = fs.readFileSync(PY_SCRIPT_FILE, 'utf-8');

    const tsProps = extractTsInterfaceProps(tsContent, 'MasteryPredictionInput');
    const pyProps = extractPythonFeatureUsage(pyContent);

    generateReport(tsProps, pyProps);
}

main();
