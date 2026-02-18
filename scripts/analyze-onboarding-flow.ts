import fs from 'fs';
import path from 'path';

const AUTH_DIR = 'src/app/(auth)';
const VALIDATION_FILE = 'src/lib/validations/auth.ts';
const REPORT_FILE = 'STUDENT_ONBOARDING_FRICTION_REPORT.md';

function analyzeZodSchemas(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Regex to find schema definitions: export const schemaName = z.object({ ... });
  const schemaRegex = /export const (\w+) = z\.object\({([\s\S]*?)}\);/g;

  const schemas: any[] = [];
  let match;

  while ((match = schemaRegex.exec(content)) !== null) {
    const schemaName = match[1];
    const schemaBody = match[2];

    // Count fields by counting keys (naive approach: key followed by :)
    // This might catch some false positives but good enough for audit.
    const fieldCount = (schemaBody.match(/^\s*[a-zA-Z0-9_]+:/gm) || []).length;

    // Count validations (calls like .min, .max, .email, .regex, .refine)
    const validationCount = (schemaBody.match(/\.(min|max|email|regex|refine|length)/g) || []).length;

    schemas.push({ name: schemaName, fieldCount, validationCount });
  }

  return schemas;
}

function analyzePageFiles(dir: string, fileList: any[] = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            analyzePageFiles(filePath, fileList);
        } else if (file.endsWith('page.tsx')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const inputCount = (content.match(/<Input|<Select|<Textarea|<RadioGroup/g) || []).length;
            const stepCount = (content.match(/step|currentStep/gi) || []).length > 0 ? 'Multi-step detected' : 'Single page';

            fileList.push({
                path: filePath,
                inputCount,
                stepCount
            });
        }
    });
    return fileList;
}

function generateReport(schemas: any[], pages: any[]) {
    let report = '# Student Onboarding Friction Report\n\n';
    report += 'This report identifies friction points in the student onboarding flow by analyzing form complexity and validation strictness.\n\n';

    report += '## Form Schema Complexity (Zod)\n';
    report += '| Schema Name | Field Count | Validation Rules | Friction Risk |\n';
    report += '|---|---|---|---|\n';

    schemas.forEach(s => {
        let risk = 'Low';
        if (s.fieldCount > 5 || s.validationCount > 5) risk = 'Medium';
        if (s.fieldCount > 8 || s.validationCount > 10) risk = 'High';

        report += `| ${s.name} | ${s.fieldCount} | ${s.validationCount} | ${risk} |\n`;
    });

    report += '\n## UI Complexity (Page Analysis)\n';
    report += '| Page Path | Input Elements | Flow Type | Friction Risk |\n';
    report += '|---|---|---|---|\n';

    pages.forEach(p => {
        const shortPath = p.path.replace('src/app/(auth)/', '');
        let risk = 'Low';
        if (p.inputCount > 5) risk = 'Medium';
        if (p.inputCount > 10) risk = 'High';

        report += `| ${shortPath} | ${p.inputCount} | ${p.stepCount} | ${risk} |\n`;
    });

    report += '\n## Critical Friction Points\n';
    const highRiskSchemas = schemas.filter(s => s.fieldCount > 8 || s.validationCount > 10);
    const highRiskPages = pages.filter(p => p.inputCount > 10);

    if (highRiskSchemas.length === 0 && highRiskPages.length === 0) {
        report += "No critical friction points detected based on field counts.\n";
    } else {
        if (highRiskSchemas.length > 0) {
            report += "### Complex Data Models:\n";
            highRiskSchemas.forEach(s => report += `- **${s.name}**: ${s.fieldCount} fields, ${s.validationCount} validations. Consider breaking into multiple steps.\n`);
        }
        if (highRiskPages.length > 0) {
            report += "\n### Overloaded UI Pages:\n";
            highRiskPages.forEach(p => report += `- **${p.path}**: ${p.inputCount} inputs. High cognitive load for a single screen.\n`);
        }
    }

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated at ${REPORT_FILE}`);
}

const schemas = analyzeZodSchemas(VALIDATION_FILE);
const pages = analyzePageFiles(AUTH_DIR);
generateReport(schemas, pages);
