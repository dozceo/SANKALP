
import fs from 'fs';
import path from 'path';

// --- Constants ---
const APP_DIR = path.join(process.cwd(), 'src/app');
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
const STUDENT_GOALS = ['/quiz', '/planner', '/syllabus']; // Syllabus acts as "content consumption"
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
  };
  analysis: {
    cognitiveLoad: number;
    hicksComplexity: number;
    decisionEntropy: number;
    attentionBudget: number;
    isDeadEnd: boolean;
    distanceToGoal?: number;
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

  return {
    filePath,
    routePath,
    content,
    metrics: {
      interactiveElements,
      wordCount,
      decisionPoints: interactiveElements, // Simplified
      outgoingLinks,
    },
    analysis: {
      cognitiveLoad: 0, // Calculated later
      hicksComplexity: 0,
      decisionEntropy: 0,
      attentionBudget,
      isDeadEnd: false,
    }
  };
}

function getAllPageFiles(dir: string, fileList: string[] = []): string[] {
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

console.log("Starting UX Flow Analysis...");

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
  // Merge explicit and implicit, remove duplicates
  const allLinks = Array.from(new Set([...node.metrics.outgoingLinks, ...implicitLinks]));

  // Filter links that don't look like internal routes or are just "#"
  const validLinks = allLinks.filter(l => l && l.startsWith('/') && l !== node.routePath);

  // 3. Calculate Metrics
  // Cognitive Load: 0.05 per word (reading cost) + 2 per interactive element (action cost)
  node.analysis.cognitiveLoad = (node.metrics.wordCount * 0.05) + (node.metrics.interactiveElements * 2);

  // Hick's Law: Time T = b * log2(n + 1). We just calculate log2(n+1).
  // n = number of interactive elements (choices)
  node.analysis.hicksComplexity = Math.log2(node.metrics.interactiveElements + 1);

  // Entropy: H = log2(N) where N is number of unique outgoing paths (validLinks)
  // If 0 links, entropy is 0.
  node.analysis.decisionEntropy = validLinks.length > 0 ? Math.log2(validLinks.length) : 0;

  // Dead End Detection:
  // A "Content Dead End" is one where the *explicit* links are empty (ignoring sidebar).
  // This means the user MUST use the sidebar to leave, which breaks flow context.
  // We exclude form submission buttons (which might be handled via onSubmit not Link) from "dead end" check if present?
  // Actually, let's stick to the definition: No way out via content.
  // We'll verify if there are any <Button> with type="submit" or onClick which implies action,
  // but strictly navigation-wise, if explicitLinks is empty, it's a dead end.
  const explicitNavLinks = node.metrics.outgoingLinks.filter(l => l && l.startsWith('/'));
  // If no explicit nav links AND low interactive count (e.g. just text), it's a true dead end.
  // If it has buttons (e.g. "Submit"), it might be a form end state.
  node.analysis.isDeadEnd = explicitNavLinks.length === 0 && node.metrics.interactiveElements < 3;
});

// Path Efficiency (BFS)
function calculateShortestPath(startNodeRoute: string, goalRoutes: string[]): number {
  const queue: { route: string, dist: number }[] = [{ route: startNodeRoute, dist: 0 }];
  const visited = new Set<string>([startNodeRoute]);

  while (queue.length > 0) {
    const { route, dist } = queue.shift()!;
    if (goalRoutes.some(g => route === g || route.startsWith(g))) return dist;

    const node = nodeMap.get(route);
    if (!node) continue;

    // Get neighbors
    // We consider both explicit and implicit links for *possibility* of movement,
    // but for "UX Flow efficiency", reliance on sidebar is often a "reset".
    // However, for BFS, valid moves are valid moves.
    let implicitLinks: string[] = [];
    if (route.startsWith('/teacher')) implicitLinks = TEACHER_SIDEBAR_LINKS;
    else implicitLinks = STUDENT_SIDEBAR_LINKS;

    const allLinks = Array.from(new Set([...node.metrics.outgoingLinks, ...implicitLinks]));
    const neighbors = allLinks
      .filter(l => l.startsWith('/'))
      .map(l => {
         // Normalize dynamic segments for graph traversal if needed.
         // For now, exact match or simple dynamic matching
         // If link is /classes/123, we want to match /classes/[id]
         // Simple heuristic: if node map doesn't have exact link, try finding a dynamic match
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

// Detect Broken Links (Ghost Nodes)
const ghostNodes = new Set<string>();
nodes.forEach(node => {
  let implicitLinks: string[] = [];
  if (node.routePath.startsWith('/teacher')) implicitLinks = TEACHER_SIDEBAR_LINKS;
  else if (!node.routePath.startsWith('/(auth)') && !node.routePath.startsWith('/api')) implicitLinks = STUDENT_SIDEBAR_LINKS;

  const allLinks = [...node.metrics.outgoingLinks, ...implicitLinks];
  allLinks.forEach(link => {
    if (link && link.startsWith('/') && !nodeMap.has(link)) {
       // Check dynamic routes
       let isDynamicMatch = false;
       for (const key of nodeMap.keys()) {
          if (key.includes('[') && link.match(new RegExp('^' + key.replace(/\[.*?\]/g, '[^/]+') + '$'))) {
             isDynamicMatch = true;
             break;
          }
       }
       if (!isDynamicMatch) {
         ghostNodes.add(link);
       }
    }
  });
});

// Calculate Distances
const studentEntry = '/home';
const teacherEntry = '/teacher';

// Specific Path Efficiency: Entry -> Goals
const studentPathEff = STUDENT_GOALS.map(goal => ({
  goal,
  steps: calculateShortestPath(studentEntry, [goal])
}));

const teacherPathEff = TEACHER_GOALS.map(goal => ({
  goal,
  steps: calculateShortestPath(teacherEntry, [goal])
}));


// --- Output Generation ---

console.log("\n--- UX Flow Entropy Report Data ---\n");

// 0. Broken Links
if (ghostNodes.size > 0) {
  console.log("## Critical: Broken Links / Missing Routes (404 Risks)");
  ghostNodes.forEach(link => console.log(`- **${link}** (Linked but not found)`));
}

// 1. High Cognitive Load Pages (Top 5)
const highLoad = [...nodes].sort((a, b) => b.analysis.cognitiveLoad - a.analysis.cognitiveLoad).slice(0, 5);
console.log("\n## High Cognitive Load Pages (Risk of Overload)");
highLoad.forEach(n => {
  console.log(`- **${n.routePath}**: Score ${n.analysis.cognitiveLoad.toFixed(1)} (Words: ${n.metrics.wordCount}, Interactive: ${n.metrics.interactiveElements})`);
});

// 2. Decision Paralysis (High Entropy)
const highEntropy = [...nodes].sort((a, b) => b.analysis.decisionEntropy - a.analysis.decisionEntropy).slice(0, 5);
console.log("\n## Decision Paralysis Risks (High Entropy)");
highEntropy.forEach(n => {
  console.log(`- **${n.routePath}**: Entropy ${n.analysis.decisionEntropy.toFixed(2)} bits`);
});

// 3. Dead Ends
const deadEnds = nodes.filter(n => n.analysis.isDeadEnd);
console.log("\n## Dead End States (No Content Navigation)");
if (deadEnds.length === 0) console.log("None detected.");
deadEnds.forEach(n => {
  console.log(`- **${n.routePath}**`);
});

// 4. Path Efficiency
console.log("\n## Path Efficiency (Entry -> Goal)");
console.log("### Student Journey");
studentPathEff.forEach(p => console.log(`- To ${p.goal}: ${p.steps} steps`));
console.log("### Teacher Journey");
teacherPathEff.forEach(p => console.log(`- To ${p.goal}: ${p.steps} steps`));

// 5. Attention Budget Violations (> 100)
const budgetViolations = nodes.filter(n => n.analysis.attentionBudget > 100);
console.log("\n## Attention Budget Violations (>100)");
budgetViolations.forEach(n => {
  console.log(`- **${n.routePath}**: Cost ${n.analysis.attentionBudget}`);
});

// Write raw JSON for further processing if needed
fs.writeFileSync('ux_flow_data.json', JSON.stringify(nodes, null, 2));
