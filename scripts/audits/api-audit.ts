
import fs from 'fs';
import path from 'path';

const API_DIR = 'src/app/api';
const REPORT_FILE = 'reports/api-naming-audit.md';

function getRouteHandlers(dir: string, baseRoute: string = '/api'): string[] {
  let routes: string[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      routes = routes.concat(getRouteHandlers(filePath, `${baseRoute}/${file}`));
    } else if (file === 'route.ts' || file === 'route.js') {
      routes.push(baseRoute);
    }
  }
  return routes;
}

function analyzeRoutes(routes: string[]) {
  let report = `# API Endpoint Naming Audit\n\n**Date:** ${new Date().toISOString()}\n\n`;
  report += `## Analyzed Routes\n\n`;

  const issues: string[] = [];
  const validRoutes: string[] = [];

  routes.forEach(route => {
    const parts = route.split('/').filter(p => p);
    const lastPart = parts[parts.length - 1];

    let issue = '';

    // check for camelCase in path segments (URLs should be kebab-case)
    if (/[A-Z]/.test(route) && !route.includes('[') && !route.includes(']')) {
        issue += `- Contains uppercase letters (should be kebab-case). `;
    }

    // check for verbs in resource names (e.g. /getStudent)
    if (/^(get|set|update|delete|create|fetch)/i.test(lastPart)) {
        issue += `- Route ends with a verb (${lastPart}). RESTful APIs should use nouns and HTTP methods. `;
    }

    // check for singular vs plural (heuristic)
    // heuristic: if it's a collection, it should be plural. Hard to know without context, but we can flag inconsistencies.
    // e.g. /student vs /students

    if (issue) {
        issues.push(`- \`${route}\`: ${issue}`);
    } else {
        validRoutes.push(route);
    }
  });

  if (issues.length > 0) {
      report += `### ⚠️ Naming Violations\n\n`;
      issues.forEach(i => report += `${i}\n`);
  } else {
      report += `No major naming violations found.\n\n`;
  }

  report += `### compliant Routes\n\n`;
  validRoutes.forEach(r => report += `- \`${r}\`\n`);

  report += `\n## Recommendations\n`;
  report += `- Use **kebab-case** for all URL segments.\n`;
  report += `- Use **nouns** for resources (e.g., \`/users\` instead of \`/getUsers\`).\n`;
  report += `- Use **plural** nouns for collections (e.g., \`/students\` instead of \`/student\`).\n`;

  const reportsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated: ${REPORT_FILE}`);
}

const routes = getRouteHandlers(API_DIR);
analyzeRoutes(routes);
