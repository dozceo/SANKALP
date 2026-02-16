
import * as fs from 'fs';
import * as path from 'path';

const DEV_SERVER_PATH = path.join(process.cwd(), 'src', 'ai', 'dev.ts');
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

function main() {
    console.log('Auditing Genkit Dev Server Security...');

    let reportContent = `# Genkit Dev Server Security Report

Generated on: ${new Date().toISOString()}

`;

    let risksFound = false;

    // Check src/ai/dev.ts
    if (fs.existsSync(DEV_SERVER_PATH)) {
        const content = fs.readFileSync(DEV_SERVER_PATH, 'utf-8');

        // Check for environment guard
        const hasGuard = content.includes("process.env.NODE_ENV !== 'production'") ||
                         content.includes('process.env.NODE_ENV !== "production"') ||
                         content.includes("process.env.NODE_ENV === 'production'") ||
                         content.includes('process.env.NODE_ENV === "production"');

        if (!hasGuard) {
            risksFound = true;
            reportContent += `## Risk: Missing Environment Guard in \`src/ai/dev.ts\`\n`;
            reportContent += `The file \`src/ai/dev.ts\` does not appear to check \`process.env.NODE_ENV\`. \n`;
            reportContent += `**Recommendation:** Add the following check at the top of the file to prevent execution in production:\n`;
            reportContent += "```typescript\nif (process.env.NODE_ENV === 'production') {\n  console.error('Genkit dev server cannot be run in production');\n  process.exit(1);\n}\n```\n\n";
        } else {
            reportContent += `## Check: Environment Guard in \`src/ai/dev.ts\`\n`;
            reportContent += `The file contains a check for \`process.env.NODE_ENV\`. This is good practice.\n\n`;
        }
    } else {
        reportContent += `## Note: \`src/ai/dev.ts\` not found.\n`;
        reportContent += `If the dev server is located elsewhere, please update this audit script.\n\n`;
    }

    // Check package.json
    if (fs.existsSync(PACKAGE_JSON_PATH)) {
        const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
        const scripts = pkg.scripts || {};

        if (scripts['genkit:dev']) {
             reportContent += `## Risk: \`genkit:dev\` script exposes Dev Server\n`;
             reportContent += `The \`package.json\` contains a script \`genkit:dev\`: \`${scripts['genkit:dev']}\`.\n`;
             reportContent += `Ensure this script is never executed in a production environment.\n\n`;
        }
    }

    if (!risksFound) {
        reportContent += `\n**Assessment:** No critical risks identified (assuming \`genkit:dev\` is not run in prod).\n`;
    } else {
        reportContent += `\n**Assessment:** Potential security risks identified. Please review the recommendations above.\n`;
    }

    fs.writeFileSync('GENKIT_SECURITY_REPORT.md', reportContent);
    console.log('Report generated at GENKIT_SECURITY_REPORT.md');
}

main();
