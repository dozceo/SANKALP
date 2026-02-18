
import fs from 'fs';
import path from 'path';

// --- Constants ---
const APP_DIR = path.join(process.cwd(), 'src/app');
const REPORT_FILE = path.join(process.cwd(), 'UX_FLOW_ENTROPY_REPORT.md');

const STUDENT_SIDEBAR_LINKS = [
  '/home',
  '/classes',
  '/planner',
  '/syllabus',
  '/quiz',
  '/chat',
  '/rewards',
  '/mentor',
  '/brain-map',
  '/settings',
];
const TEACHER_SIDEBAR_LINKS = [
  '/teacher',
  '/teacher/students',
  '/teacher/classes',
  '/teacher/analytics',
  '/teacher/interventions',
  '/settings',
];

// Goal States
const STUDENT_GOALS = ['/quiz', '/planner', '/syllabus'];
const TEACHER_GOALS = ['/teacher/interventions', '/teacher/analytics'];

// --- Types ---
interface PageNode {
  filePath: string;
  routePath: string; // e.g. /classes/[id]
  content: string;
  metrics: {
    interactiveElements: number;
    wordCount: number;
    decisionPoints: number;
    outgoingLinks: string[]; // Explicit links found in the file
    responsiveLinks: {
      mobileOnly: number;
      desktopOnly: number;
    };
  };
  analysis: {
    cognitiveLoad: number;
    hicksComplexity: number;
    decisionEntropy: number;
    attentionBudget: number;
    isDeadEnd: boolean;
    distanceToGoal?: number;
    mobileDivergence: boolean;
  };
}

// --- Helpers ---

function getRoutePath(filePath: string): string {
  // Convert src/app/(main)/classes/[id]/page.tsx -> /classes/[id]
  let relative = path.relative(APP_DIR, filePath);
  // Remove page.tsx
  relative = path.dirname(relative);
  // Remove route groups (folders starting with parentheses)
  const parts = relative.split(path.sep).filter(p => !p.startsWith('(') && !p.endsWith(')'));
  const route = '/' + parts.join('/');
  return route === '/.' ? '/' : route; // Handle root
}

function countOccurrences(content: string, regex: RegExp): number {
  return (content.match(regex) || []).length;
}

function extractLinks(content: string): string[] {
  const links: string[] = [];
  // <Link href="...">
  const linkRegex = /<Link[^>]*href=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  // router.push("...")
  const routerRegex = /router\.push\(["']([^"']+)["']\)/g;
  while ((match = routerRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  // <a href="...">
  const aRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/g;
  while ((match = aRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  return links;
}

// --- Main Analysis Logic ---

function analyzePage(filePath: string): PageNode {
  const content = fs.readFileSync(filePath, 'utf-8');
  const routePath = getRoutePath(filePath);

  // heuristics for interactive elements
  const btnCount = countOccurrences(content, /<Button/g);
  const linkCount = countOccurrences(content, /<Link/g);
  const aCount = countOccurrences(content, /<a\s/g);
  const inputCount = countOccurrences(content, /<Input/g);
  const selectCount = countOccurrences(content, /<Select/g);
  const textareaCount = countOccurrences(content, /<Textarea/g);
  const onClickCount = countOccurrences(content, /onClick=/g);

  const interactiveElements = btnCount + linkCount + aCount + inputCount + selectCount + textareaCount + onClickCount;

  // Word count (very rough approximation)
  const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = cleanText.split(' ').length;

  const outgoingLinks = extractLinks(content);

  // Attention Budget:
  // Button=1, Paragraph (approx 50 words)=5, Input=2, Chart=10 (heuristic check for "Chart" or "Recharts")
  const chartCount = countOccurrences(content, /Chart/g) + countOccurrences(content, /Recharts/g);
  // Assume every ~50 words is a paragraph unit
  const paragraphUnits = Math.ceil(wordCount / 50);

  const attentionBudget =
    (btnCount * 1) +
    (paragraphUnits * 5) +
    (inputCount * 2) +
    (chartCount * 10);

  // Mobile/Desktop Divergence Check
  // Check for `md:hidden`, `lg:hidden` (hidden on desktop)
  // Check for `hidden md:block`, `hidden lg:block` (hidden on mobile)
  // We count occurrences of these patterns near Link or Button components
  // This is a rough heuristic.
  const mobileHiddenMatches = countOccurrences(content, /hidden\s+(sm:|md:|lg:|xl:)block/g) + countOccurrences(content, /hidden\s+(sm:|md:|lg:|xl:)flex/g);
  const desktopHiddenMatches = countOccurrences(content, /(sm:|md:|lg:|xl:)hidden/g);

  const mobileDivergence = (mobileHiddenMatches > 0 || desktopHiddenMatches > 0);

  return {
    filePath,
    routePath,
    content,
    metrics: {
      interactiveElements,
      wordCount,
      decisionPoints: interactiveElements, // Simplified
      outgoingLinks,
      responsiveLinks: {
        mobileOnly: desktopHiddenMatches,
        desktopOnly: mobileHiddenMatches
      }
    },
    analysis: {
      cognitiveLoad: 0, // Calculated later
      hicksComplexity: 0,
      decisionEntropy: 0,
      attentionBudget,
      isDeadEnd: false,
      mobileDivergence,
    }
  };
}

function getAllPageFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllPageFiles(filePath, fileList);
    } else {
      if (file === 'page.tsx') {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

// --- Execution ---

console.log("Starting UX Flow Entropy Measurement...");

const pageFiles = getAllPageFiles(APP_DIR);
const nodes: PageNode[] = pageFiles.map(analyzePage);

// Post-processing
const nodeMap = new Map<string, PageNode>();
nodes.forEach(n => nodeMap.set(n.routePath, n));

nodes.forEach(node => {
  // 1. Determine Sidebar Context
  let implicitLinks: string[] = [];
  if (node.routePath.startsWith('/teacher')) {
    implicitLinks = TEACHER_SIDEBAR_LINKS;
  } else if (!node.routePath.startsWith('/(auth)') && !node.routePath.startsWith('/api')) {
    // Assume student for main app routes not in auth/api
    implicitLinks = STUDENT_SIDEBAR_LINKS;
  }

  // 2. Total Outgoing Edges
  const explicitNavLinks = node.metrics.outgoingLinks.filter(l => l && l.startsWith('/'));
  const allLinks = Array.from(new Set([...explicitNavLinks, ...implicitLinks]));
  const validLinks = allLinks.filter(l => l && l.startsWith('/') && l !== node.routePath);

  // 3. Calculate Metrics
  // Cognitive Load: 0.05 per word (reading cost) + 2 per interactive element (action cost)
  node.analysis.cognitiveLoad = (node.metrics.wordCount * 0.05) + (node.metrics.interactiveElements * 2);

  // Hick's Law: Time T = b * log2(n + 1). We just calculate log2(n+1).
  node.analysis.hicksComplexity = Math.log2(node.metrics.interactiveElements + 1);

  // Entropy: H = log2(N) where N is number of unique outgoing paths (validLinks)
  // If 0 links, entropy is 0.
  node.analysis.decisionEntropy = validLinks.length > 0 ? Math.log2(validLinks.length) : 0;

  // Dead End Detection:
  // A "Content Dead End" is one where the *explicit* links are empty (ignoring sidebar).
  // We exclude auth pages as they might redirect via code.
  if (!node.routePath.includes('(auth)')) {
     node.analysis.isDeadEnd = explicitNavLinks.length === 0 && node.metrics.interactiveElements < 3;
  }
});

// Path Efficiency (BFS)
function calculateShortestPath(startNodeRoute: string, goalRoutes: string[]): number {
  if (!nodeMap.has(startNodeRoute)) return -1;

  const queue: { route: string, dist: number }[] = [{ route: startNodeRoute, dist: 0 }];
  const visited = new Set<string>([startNodeRoute]);

  while (queue.length > 0) {
    const { route, dist } = queue.shift()!;
    if (goalRoutes.some(g => route === g || route.startsWith(g))) return dist;

    const node = nodeMap.get(route);
    if (!node) continue;

    // Get neighbors
    let implicitLinks: string[] = [];
    if (route.startsWith('/teacher')) implicitLinks = TEACHER_SIDEBAR_LINKS;
    else implicitLinks = STUDENT_SIDEBAR_LINKS;

    const allLinks = Array.from(new Set([...node.metrics.outgoingLinks, ...implicitLinks]));
    const neighbors = allLinks
      .filter(l => l.startsWith('/'))
      .map(l => {
         if (nodeMap.has(l)) return l;
         // Try to match dynamic routes
         for (const key of nodeMap.keys()) {
             if (key.includes('[') && l.match(new RegExp('^' + key.replace(/\[.*?\]/g, '[^/]+') + '$'))) {
                 return key;
             }
         }
         return null;
      })
      .filter(Boolean) as string[];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ route: neighbor, dist: dist + 1 });
      }
    }
  }
  return -1; // Unreachable
}

const studentEntry = '/home';
const teacherEntry = '/teacher';

const studentPathEff = STUDENT_GOALS.map(goal => ({
  goal,
  steps: calculateShortestPath(studentEntry, [goal])
}));

const teacherPathEff = TEACHER_GOALS.map(goal => ({
  goal,
  steps: calculateShortestPath(teacherEntry, [goal])
}));


// --- Report Generation ---

let report = `# UX Flow Entropy Report: Multi-Path Complexity Analysis\n\n`;
report += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
report += `**Scope:** Complete student and teacher user journeys in \`src/app/(main)\`\n\n`;

report += `## Executive Summary\n`;
const totalPages = nodes.length;
const totalDeadEnds = nodes.filter(n => n.analysis.isDeadEnd).length;
const avgCognitiveLoad = nodes.reduce((sum, n) => sum + n.analysis.cognitiveLoad, 0) / totalPages;
const avgEntropy = nodes.reduce((sum, n) => sum + n.analysis.decisionEntropy, 0) / totalPages;

report += `- **Total Pages Analyzed:** ${totalPages}\n`;
report += `- **Dead Ends Detected:** ${totalDeadEnds}\n`;
report += `- **Avg Cognitive Load:** ${avgCognitiveLoad.toFixed(2)} (Target < 50)\n`;
report += `- **Avg Decision Entropy:** ${avgEntropy.toFixed(2)} bits (Target ~3 bits)\n\n`;

// 1. Interactive Flow Graph Visualization (Mermaid)
report += `## 1. Interactive Flow Graph (Mermaid)\n\n`;
report += `\`\`\`mermaid\ngraph TD\n`;
// Limit edges to avoid massive graph. Only explicit edges or key sidebar edges.
// We'll show explicit edges primarily.
nodes.forEach(node => {
  const nodeId = node.routePath.replace(/\//g, '_').replace(/\[/g, '').replace(/\]/g, '').replace(/-/g, '_') || 'root';
  const label = node.routePath === '/' ? '/ (root)' : node.routePath;

  // Style nodes based on type
  let style = '';
  if (node.analysis.isDeadEnd) style = ':::deadEnd';
  else if (node.analysis.cognitiveLoad > 80) style = ':::highLoad';

  report += `  ${nodeId}["${label}"]${style}\n`;

  // Edges
  const explicitLinks = node.metrics.outgoingLinks.filter(l => l && l.startsWith('/') && l !== node.routePath);
  explicitLinks.forEach(link => {
     let targetId = link.replace(/\//g, '_').replace(/\[/g, '').replace(/\]/g, '').replace(/-/g, '_') || 'root';
     // Handle dynamic routes in ID simply
     if (link.includes('[')) {
        // try to find matching node
         for (const key of nodeMap.keys()) {
             if (key.includes('[') && link.match(new RegExp('^' + key.replace(/\[.*?\]/g, '[^/]+') + '$'))) {
                 targetId = key.replace(/\//g, '_').replace(/\[/g, '').replace(/\]/g, '').replace(/-/g, '_');
                 break;
             }
         }
     }
     report += `  ${nodeId} --> ${targetId}\n`;
  });
});

report += `\n  classDef deadEnd fill:#f9f,stroke:#333,stroke-width:2px;\n`;
report += `  classDef highLoad fill:#f00,stroke:#333,stroke-width:2px,color:#fff;\n`;
report += `\`\`\`\n\n`;

// 2. Cognitive Load Heatmap
report += `## 2. Cognitive Load Heatmap (Top 10 High Load)\n`;
report += `| Page | Score | Words | Interactive Elements | Status |\n`;
report += `|---|---|---|---|---|\n`;
const sortedByLoad = [...nodes].sort((a, b) => b.analysis.cognitiveLoad - a.analysis.cognitiveLoad);
sortedByLoad.slice(0, 10).forEach(n => {
  const status = n.analysis.cognitiveLoad > 80 ? '🔴 Overload' : n.analysis.cognitiveLoad > 50 ? 'qh Warning' : '🟢 Optimal';
  report += `| \`${n.routePath}\` | ${n.analysis.cognitiveLoad.toFixed(1)} | ${n.metrics.wordCount} | ${n.metrics.interactiveElements} | ${status} |\n`;
});
report += `\n`;

// 3. Decision Entropy Analysis
report += `## 3. Decision Entropy Analysis (Analysis Paralysis)\n`;
report += `Pages with high entropy (> 3.5 bits) indicate too many choices without guidance.\n\n`;
report += `| Page | Entropy (bits) | Choices (Implicit + Explicit) |\n`;
report += `|---|---|---|\n`;
const sortedByEntropy = [...nodes].sort((a, b) => b.analysis.decisionEntropy - a.analysis.decisionEntropy);
sortedByEntropy.slice(0, 10).filter(n => n.analysis.decisionEntropy > 3.0).forEach(n => {
    let implicitLinks: string[] = [];
    if (n.routePath.startsWith('/teacher')) implicitLinks = TEACHER_SIDEBAR_LINKS;
    else implicitLinks = STUDENT_SIDEBAR_LINKS;
    const choiceCount = new Set([...n.metrics.outgoingLinks, ...implicitLinks]).size;
    report += `| \`${n.routePath}\` | ${n.analysis.decisionEntropy.toFixed(2)} | ${choiceCount} |\n`;
});
report += `\n`;

// 4. Path Efficiency Matrix
report += `## 4. Path Efficiency Matrix\n`;
report += `### Student Journey (From /home)\n`;
report += `| Goal | Steps | Status |\n`;
report += `|---|---|---|\n`;
studentPathEff.forEach(p => {
    const status = p.steps === -1 ? '❌ Unreachable' : p.steps > 3 ? '⚠️ Inefficient' : '✅ Efficient';
    report += `| \`${p.goal}\` | ${p.steps} | ${status} |\n`;
});
report += `\n### Teacher Journey (From /teacher)\n`;
report += `| Goal | Steps | Status |\n`;
report += `|---|---|---|\n`;
teacherPathEff.forEach(p => {
    const status = p.steps === -1 ? '❌ Unreachable' : p.steps > 3 ? '⚠️ Inefficient' : '✅ Efficient';
    report += `| \`${p.goal}\` | ${p.steps} | ${status} |\n`;
});
report += `\n`;

// 5. Dead-End Inventory
report += `## 5. Dead-End Inventory\n`;
report += `Pages with no explicit forward navigation (traps users).\n\n`;
const deadEnds = nodes.filter(n => n.analysis.isDeadEnd);
if (deadEnds.length === 0) report += "None detected.\n";
else {
    report += `| Page | Recommended Escape |\n`;
    report += `|---|---|\n`;
    deadEnds.forEach(n => {
        report += `| \`${n.routePath}\` | Add 'Back' button or primary CTA |\n`;
    });
}
report += `\n`;

// 6. Attention Budget Violations
report += `## 6. Attention Budget Violations\n`;
report += `Pages exceeding attention budget (> 100 points).\n\n`;
const budgetViolations = nodes.filter(n => n.analysis.attentionBudget > 100);
if (budgetViolations.length === 0) report += "None detected.\n";
else {
    report += `| Page | Cost | Violation Source |\n`;
    report += `|---|---|---|\n`;
    budgetViolations.forEach(n => {
        report += `| \`${n.routePath}\` | ${n.analysis.attentionBudget} | Too many elements/charts |\n`;
    });
}
report += `\n`;

// 7. Mobile-Desktop Flow Divergence
report += `## 7. Mobile-Desktop Flow Divergence\n`;
report += `Pages with responsive visibility classes on interactive elements.\n\n`;
const divergentPages = nodes.filter(n => n.analysis.mobileDivergence);
if (divergentPages.length === 0) report += "No significant flow divergence detected.\n";
else {
    report += `| Page | Mobile Hidden | Desktop Hidden |\n`;
    report += `|---|---|---|\n`;
    divergentPages.forEach(n => {
        report += `| \`${n.routePath}\` | ${n.metrics.responsiveLinks.mobileOnly} elements | ${n.metrics.responsiveLinks.desktopOnly} elements |\n`;
    });
}
report += `\n`;

// 8. Prioritized UX Improvement Backlog
report += `## 8. Prioritized UX Improvement Backlog\n\n`;
let priority = 1;

// Critical: Dead Ends
deadEnds.forEach(n => {
    report += `${priority++}. **[CRITICAL] Fix Dead End on \`${n.routePath}\`**: User is trapped. Add explicit navigation.\n`;
});

// High: Cognitive Overload
sortedByLoad.filter(n => n.analysis.cognitiveLoad > 80).forEach(n => {
    report += `${priority++}. **[HIGH] Reduce Cognitive Load on \`${n.routePath}\`**: Score ${n.analysis.cognitiveLoad.toFixed(0)}. Break content into chunks or steps.\n`;
});

// Medium: Unreachable Goals
[...studentPathEff, ...teacherPathEff].filter(p => p.steps === -1).forEach(p => {
    report += `${priority++}. **[MEDIUM] Fix Unreachable Goal \`${p.goal}\`**: No path found from entry point.\n`;
});

// Low: Inefficient Paths
[...studentPathEff, ...teacherPathEff].filter(p => p.steps > 3).forEach(p => {
    report += `${priority++}. **[LOW] Optimize Path to \`${p.goal}\`**: Takes ${p.steps} steps. Consider adding a shortcut.\n`;
});

fs.writeFileSync(REPORT_FILE, report);
console.log(`Report generated at ${REPORT_FILE}`);
