
import * as fs from 'fs';
import * as path from 'path';

const API_ROOT = 'src/app/api';
const REPORT_FILE = 'API_NAMING_AUDIT.md';

interface Endpoint {
  path: string;
  segments: string[];
}

function scanApiRoutes(dir: string, baseDir: string = API_ROOT): Endpoint[] {
  let endpoints: Endpoint[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      endpoints = endpoints.concat(scanApiRoutes(fullPath, baseDir));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const relativePath = path.relative(baseDir, dir);
      const urlPath = `/api/${relativePath.split(path.sep).join('/')}`;
      endpoints.push({
        path: urlPath,
        segments: relativePath.split(path.sep)
      });
    }
  }
  return endpoints;
}

function isPlural(word: string): boolean {
  // Simple heuristic: ends in 's' unless it's a known exception like 'auth' or 'status'
  if (word === 'auth' || word === 'status' || word === 'login' || word === 'logout') return true; // exception
  return word.endsWith('s');
}

function containsVerb(segment: string): boolean {
  const verbs = ['get', 'post', 'put', 'delete', 'update', 'create', 'fetch', 'list'];
  return verbs.some(v => segment.toLowerCase().startsWith(v));
}

function checkConventions(endpoints: Endpoint[]): string[] {
  const issues: string[] = [];

  for (const endpoint of endpoints) {
    const segments = endpoint.segments;
    const lastSegment = segments[segments.length - 1];

    // Check for dynamic routes (e.g. [id]) - skip naming checks for these
    if (lastSegment.startsWith('[') && lastSegment.endsWith(']')) {
      continue;
    }

    // Check 1: Pluralization (Resource names should generally be plural)
    // Heuristic: If it's not plural, flag it.
    if (!isPlural(lastSegment)) {
      issues.push(`- **${endpoint.path}**: Singular resource name \`${lastSegment}\`. Consider pluralizing to \`${lastSegment}s\` if it represents a collection.`);
    }

    // Check 2: Verbs in URL (RPC style vs REST)
    if (containsVerb(lastSegment)) {
      issues.push(`- **${endpoint.path}**: URL contains verb \`${lastSegment}\`. Use HTTP methods (GET, POST) instead of verbs in the path.`);
    }

    // Check 3: Casing (kebab-case is standard)
    if (/[A-Z]/.test(lastSegment) || /_/.test(lastSegment)) {
       // camelCase or snake_case detected
       issues.push(`- **${endpoint.path}**: Segment \`${lastSegment}\` is not kebab-case. URL paths should be lowercase and hyphen-separated.`);
    }
  }

  return issues;
}

function generateReport() {
  console.log(`Scanning ${API_ROOT}...`);
  if (!fs.existsSync(API_ROOT)) {
    console.error(`API root ${API_ROOT} not found.`);
    return;
  }

  const endpoints = scanApiRoutes(API_ROOT);
  const issues = checkConventions(endpoints);

  let reportContent = `# API Endpoint Naming & REST Convention Audit

## Executive Summary
Audit of ${endpoints.length} API endpoints for adherence to RESTful naming conventions.

## Findings

`;

  if (issues.length === 0) {
    reportContent += "No naming convention violations found.\n";
  } else {
    reportContent += `Found ${issues.length} potential violations:\n\n`;
    reportContent += issues.join('\n');
  }

  reportContent += `\n\n## Recommendations

1. **Use Plural Nouns:** \`/api/students\` instead of \`/api/student\`.
2. **Avoid Verbs:** Use \`GET /api/students\` instead of \`/api/getStudents\`.
3. **Consistent Casing:** Use kebab-case for URLs (e.g., \`/api/user-profiles\`).
`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport();
