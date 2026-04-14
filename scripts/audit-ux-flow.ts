
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const APP_DIR = path.join(process.cwd(), 'src/app');
const OUTPUT_FILE = path.join(process.cwd(), 'UX_FLOW_ENTROPY_REPORT.md');

// --- Types ---
interface UXNode {
  id: string; // Route path (e.g., /home, /quiz/[id])
  type: 'page' | 'layout';
  interactiveElements: number;
  infoUnits: number;
  decisionPoints: number;
  wordCount: number;
  complexityScore: number; // Hick's Law
  attentionCost: number;
  isTeacher: boolean;
  hasHiddenMobile: boolean;
  hasHiddenDesktop: boolean;
}

interface UXEdge {
  source: string;
  target: string;
  type: 'global' | 'contextual'; // Global = Sidebar/Nav, Contextual = In-page link
  cost: number; // Friction (clicks/time)
  isMobileOnly: boolean;
  isDesktopOnly: boolean;
}

interface Graph {
  nodes: Map<string, UXNode>;
  edges: UXEdge[];
}

interface PathResult {
  path: string[];
  totalCost: number;
  detourRatio: number;
}

// --- Constants ---
const COST_CONTEXTUAL = 1;
const COST_GLOBAL_DESKTOP = 5; // Sidebar click
const COST_GLOBAL_MOBILE = 6;  // Hamburger + click

const ATTENTION_COSTS = {
  button: 1,
  input: 2,
  select: 2,
  p: 5,       // Paragraph = reading effort
  chart: 10,  // High cognitive load
  img: 5,
  h1: 2, h2: 2, h3: 2,
  link: 1
};

// --- Helpers ---

// recursive file scan
function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      if (file === 'page.tsx' || file === 'layout.tsx') {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

// simple regex-based parser (not perfect but sufficient for static audit)
function parseFile(content: string): Partial<UXNode> & { links: string[] } {
  const interactiveElements = (content.match(/<(Button|Input|Select|RadioGroup|Checkbox|Switch|Link|a)\b/g) || []).length;
  const infoUnits = (content.match(/<(p|span|div|h[1-6]|img|Chart|Card)\b/g) || []).length;

  // Decision points: inputs + buttons that are not just links
  const decisionPoints = (content.match(/<(Button|Input|Select|RadioGroup|Checkbox|Switch)\b/g) || []).length;

  // Words in text blocks (rough approximation)
  // Remove tags
  const textContent = content.replace(/<[^>]+>/g, ' ');
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 3).length; // Filter short words

  // Calculate Hick's Law: Time = b * log2(n + 1)
  const complexityScore = Math.log2(decisionPoints + 1);

  // Attention Cost
  let attentionCost = 0;
  attentionCost += ((content.match(/<Button/g) || []).length * ATTENTION_COSTS.button);
  attentionCost += ((content.match(/<Input/g) || []).length * ATTENTION_COSTS.input);
  attentionCost += ((content.match(/<Select/g) || []).length * ATTENTION_COSTS.select);
  attentionCost += ((content.match(/<p/g) || []).length * ATTENTION_COSTS.p);
  attentionCost += ((content.match(/<Chart/g) || []).length * ATTENTION_COSTS.chart);

  // Links
  const links: string[] = [];
  // Match <Link href="...">
  const linkMatches = content.matchAll(/<Link[^>]*href=["']([^"']+)["'][^>]*>/g);
  for (const match of linkMatches) {
    links.push(match[1]);
  }
  // Match <Link href={...}> - handle simple template literals or strings
  // Heuristic: capture content inside {} that looks like a path
  // e.g. href={`/quiz/${quiz.id}`} -> capture `/quiz/${quiz.id}`
  const dynamicLinkMatches = content.matchAll(/<Link[^>]*href=\{`([^`]+)`\}[^>]*>/g);
  for (const match of dynamicLinkMatches) {
      links.push(match[1]);
  }
  const simpleDynamicLinkMatches = content.matchAll(/<Link[^>]*href=\{(["'][^"']+["'])\}[^>]*>/g);
  for (const match of simpleDynamicLinkMatches) {
      links.push(match[1].replace(/['"]/g, ''));
  }

  // Match router.push(...)
  const routerMatches = content.matchAll(/router\.push\(["'`]?([^"'`)]+)["'`]?\)/g);
  for (const match of routerMatches) {
    links.push(match[1]);
  }

  // Detect responsive hiding
  const hasHiddenMobile = /hidden md:block/.test(content) || /lg:block/.test(content);
  const hasHiddenDesktop = /md:hidden/.test(content) || /lg:hidden/.test(content);

  return {
    interactiveElements,
    infoUnits,
    decisionPoints,
    wordCount,
    complexityScore,
    attentionCost,
    links,
    hasHiddenMobile,
    hasHiddenDesktop
  };
}

function resolveRoute(filePath: string): string {
  // Convert src/app/(main)/quiz/page.tsx -> /quiz
  // Convert src/app/(main)/quiz/[id]/page.tsx -> /quiz/:id
  let route = filePath.replace(APP_DIR, '').replace(/\\/g, '/');
  route = route.replace('/page.tsx', '').replace('/layout.tsx', '');

  // Remove route groups (x)
  route = route.replace(/\/\([^)]+\)/g, '');

  if (route === '') route = '/';

  // Normalize dynamic params
  route = route.replace(/\[([^\]]+)\]/g, ':$1');

  return route || '/';
}

function parseSidebar(filePath: string): { href: string; label: string; disabled?: boolean }[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract the array of items. This is tricky with regex.
  // We'll look for object literals with href properties.
  const items: { href: string; label: string; disabled?: boolean }[] = [];

  // Regex to find objects like { href: "...", ... }
  // This is a heuristic.
  const matches = content.matchAll(/\{[^}]*href:\s*["']([^"']+)["'][^}]*\}/g);
  for (const match of matches) {
    const objStr = match[0];
    const href = match[1];
    const labelMatch = objStr.match(/label:\s*["']([^"']+)["']/);
    const label = labelMatch ? labelMatch[1] : 'Unknown';
    const disabled = /disabled:\s*true/.test(objStr);

    items.push({ href, label, disabled });
  }

  return items;
}

// --- Main Analysis Logic ---

function buildGraph(): Graph {
  const graph: Graph = {
    nodes: new Map(),
    edges: []
  };

  const files = getFiles(APP_DIR);

  // 1. Create Nodes
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const route = resolveRoute(file);
    const parsed = parseFile(content);

    // Merge if node exists (e.g. layout + page) - usually layout wraps page, so we add costs
    if (graph.nodes.has(route)) {
      const existing = graph.nodes.get(route)!;
      existing.interactiveElements += parsed.interactiveElements || 0;
      existing.infoUnits += parsed.infoUnits || 0;
      existing.decisionPoints += parsed.decisionPoints || 0;
      existing.wordCount += parsed.wordCount || 0;
      existing.attentionCost += parsed.attentionCost || 0;
      // Recalc complexity
      existing.complexityScore = Math.log2(existing.decisionPoints + 1);
    } else {
      graph.nodes.set(route, {
        id: route,
        type: file.endsWith('page.tsx') ? 'page' : 'layout',
        interactiveElements: parsed.interactiveElements || 0,
        infoUnits: parsed.infoUnits || 0,
        decisionPoints: parsed.decisionPoints || 0,
        wordCount: parsed.wordCount || 0,
        complexityScore: parsed.complexityScore || 0,
        attentionCost: parsed.attentionCost || 0,
        isTeacher: route.startsWith('/teacher'),
        hasHiddenMobile: parsed.hasHiddenMobile || false,
        hasHiddenDesktop: parsed.hasHiddenDesktop || false,
      });
    }

    // 2. Contextual Edges
    for (const link of parsed.links) {
        // Normalize link
        let target = link;
        if (target.startsWith('.')) {
             // relative path resolution is hard statically, we'll skip complex ones
             // assume absolute mostly
        }

        // normalize dynamic segments in target
        // e.g., /quiz/${id} -> /quiz/:id
        target = target.replace(/\${[^}]+}/g, ':id');

        graph.edges.push({
            source: route,
            target: target,
            type: 'contextual',
            cost: COST_CONTEXTUAL,
            isMobileOnly: parsed.hasHiddenDesktop || false, // approximation: if link is in a hidden block
            isDesktopOnly: parsed.hasHiddenMobile || false
        });
    }
  }

  // 3. Global Edges
  const studentSidebar = parseSidebar(path.join(process.cwd(), 'src/components/app/sidebar-nav.tsx'));
  const teacherSidebar = parseSidebar(path.join(process.cwd(), 'src/components/app/teacher-sidebar-nav.tsx'));

  for (const node of graph.nodes.values()) {
    const sidebar = node.isTeacher ? teacherSidebar : studentSidebar;

    for (const item of sidebar) {
      if (item.disabled) continue;

      // Don't add self-loops for global nav
      if (item.href === node.id) continue;

      graph.edges.push({
        source: node.id,
        target: item.href,
        type: 'global',
        cost: COST_GLOBAL_DESKTOP,
        isMobileOnly: false,
        isDesktopOnly: false
      });

      // We handle mobile cost difference during analysis, not by duplicating edges yet
    }
  }

  return graph;
}

// --- Analysis Functions ---

function calculateEntropy(graph: Graph): Map<string, number> {
  const entropyMap = new Map<string, number>();

  for (const node of graph.nodes.values()) {
    const outgoing = graph.edges.filter(e => e.source === node.id);
    if (outgoing.length === 0) {
      entropyMap.set(node.id, 0);
      continue;
    }

    // Probability of choosing an action = 1 / number of actions (assuming equal likelyhood for now)
    // Or weight by visibility? Let's use uniform for simplicity (Maximum Entropy assumption)
    const p = 1 / outgoing.length;
    let entropy = 0;
    for (const _ of outgoing) {
      entropy += -p * Math.log2(p);
    }
    entropyMap.set(node.id, entropy);
  }
  return entropyMap;
}

function findShortestPath(graph: Graph, start: string, end: string, isMobile: boolean): PathResult | null {
  // Dijkstra
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const queue: string[] = [];

  for (const node of graph.nodes.keys()) {
    distances.set(node, Infinity);
    queue.push(node);
  }

  if (!distances.has(start)) return null; // Start node doesn't exist
  if (!distances.has(end)) {
      // End node doesn't exist
      return null;
  }

  distances.set(start, 0);

  while (queue.length > 0) {
    // Sort queue by distance
    queue.sort((a, b) => {
        const dA = distances.get(a);
        const dB = distances.get(b);
        const distA = dA !== undefined ? dA : Infinity;
        const distB = dB !== undefined ? dB : Infinity;
        return distA - distB;
    });
    const u = queue.shift()!;

    if (u === end) {
      // Reconstruct path
      const path: string[] = [];
      let curr: string | undefined = end;
      while (curr) {
        path.unshift(curr);
        curr = previous.get(curr);
      }
      return {
        path,
        totalCost: distances.get(end) ?? Infinity,
        detourRatio: 1 // Baseline
      };
    }

    const distU = distances.get(u);
    if (distU === Infinity || distU === undefined) break;

    const neighbors = graph.edges.filter(e => e.source === u);
    for (const edge of neighbors) {
      // Filter out mobile/desktop only edges
      if (isMobile && edge.isDesktopOnly) continue;
      if (!isMobile && edge.isMobileOnly) continue;

      let weight = edge.cost;
      if (edge.type === 'global' && isMobile) {
          weight = COST_GLOBAL_MOBILE;
      }

      const alt = distU + weight;
      const distTarget = distances.get(edge.target);
      const currentDist = distTarget !== undefined ? distTarget : Infinity;

      if (alt < currentDist) {
        distances.set(edge.target, alt);
        previous.set(edge.target, u);
      }
    }
  }

  return null; // unreachable
}

function detectDeadEnds(graph: Graph): string[] {
  const deadEnds: string[] = [];
  for (const node of graph.nodes.values()) {
    // Contextual dead end: No way out except global nav
    const contextualOutgoing = graph.edges.filter(e => e.source === node.id && e.type === 'contextual');
    if (contextualOutgoing.length === 0) {
      deadEnds.push(node.id);
    }
  }
  return deadEnds;
}

// --- Report Generation ---

function generateReport(graph: Graph) {
  const entropyMap = calculateEntropy(graph);
  const deadEnds = detectDeadEnds(graph);

  // Scenarios
  const scenarios = [
    { name: "Student: Quiz -> Revision", start: "/quiz", end: "/planner" },
    { name: "Student: Home -> Quiz", start: "/home", end: "/quiz" },
    { name: "Teacher: Dashboard -> Intervention", start: "/teacher", end: "/teacher/interventions" },
    { name: "Teacher: Dashboard -> Students", start: "/teacher", end: "/teacher/students" }
  ];

  let report = `# UX Flow Entropy Report\n\n`;

  report += `## 1. Executive Summary\n`;
  report += `- **Total States (Nodes)**: ${graph.nodes.size}\n`;
  report += `- **Total Transitions (Edges)**: ${graph.edges.length}\n`;
  report += `- **High Complexity Pages**: ${Array.from(graph.nodes.values()).filter(n => n.complexityScore > 3).length}\n`;
  report += `- **Dead-Ends (Contextual)**: ${deadEnds.length}\n\n`;

  report += `## 2. Cognitive Load Heatmap\n`;
  report += `| Page | Elements | Decisions | Complexity (Hicks) | Attention Cost | Status |\n`;
  report += `|---|---|---|---|---|---|\n`;

  const sortedNodes = Array.from(graph.nodes.values()).sort((a, b) => b.complexityScore - a.complexityScore);

  for (const node of sortedNodes) {
    let status = "🟢 Optimal";
    if (node.complexityScore > 3) status = "🟡 High";
    if (node.complexityScore > 4) status = "🔴 Overload";
    if (node.attentionCost > 100) status = "🔴 Budget Exceeded";

    report += `| \`${node.id}\` | ${node.interactiveElements} | ${node.decisionPoints} | ${node.complexityScore.toFixed(2)} | ${node.attentionCost} | ${status} |\n`;
  }
  report += `\n`;

  report += `## 3. Decision Entropy & Paralysis Risk\n`;
  report += `Pages with high entropy offer too many choices without clear guidance.\n\n`;
  report += `| Page | Entropy (bits) | Outgoing Paths (Contextual) | Risk Level |\n`;
  report += `|---|---|---|---|\n`;

  const sortedEntropy = Array.from(entropyMap.entries()).sort((a, b) => b[1] - a[1]);
  for (const [id, entropy] of sortedEntropy) {
    if (entropy === 0) continue;
    const contextualPaths = graph.edges.filter(e => e.source === id && e.type === 'contextual').length;
    let risk = "Low";
    if (entropy > 2.5) risk = "Medium";
    if (entropy > 3.5) risk = "High (Analysis Paralysis)";

    report += `| \`${id}\` | ${entropy.toFixed(2)} | ${contextualPaths} | ${risk} |\n`;
  }
  report += `\n`;

  report += `## 4. Path Efficiency Analysis\n`;
  report += `Measuring friction for critical user journeys. (Contextual Click = 1, Global Click = 5)\n\n`;
  report += `| Journey | Desktop Cost | Mobile Cost | Feasible? | Gap Analysis |\n`;
  report += `|---|---|---|---|---|\n`;

  for (const scenario of scenarios) {
    const desktopPath = findShortestPath(graph, scenario.start, scenario.end, false);
    const mobilePath = findShortestPath(graph, scenario.start, scenario.end, true);

    const feasible = desktopPath && desktopPath.totalCost < 50; // Arbitrary cutoff
    const gap = !desktopPath ? "🚨 BROKEN LINK" : (desktopPath.totalCost > 10 ? "⚠️ High Friction" : "✅ Efficient");

    report += `| ${scenario.name} | ${desktopPath ? desktopPath.totalCost : '∞'} | ${mobilePath ? mobilePath.totalCost : '∞'} | ${feasible ? 'Yes' : 'No'} | ${gap} |\n`;
  }
  report += `\n`;

  report += `## 5. Dead-End Inventory\n`;
  report += `Pages where the user must use global navigation to leave (breaking flow).\n\n`;
  for (const id of deadEnds) {
     if (id === '/') continue; // root is exempt
     report += `- \`${id}\`: No visible "Next Step" buttons.\n`;
  }
  report += `\n`;

  report += `## 6. Prioritized Backlog\n`;
  report += `Based on the audit, here are the top issues:\n\n`;

  if (deadEnds.includes('/quiz')) {
      report += `1. **CRITICAL**: The \`/quiz\` page is a dead-end. Users finish a quiz and have no direct button to "Review Weak Areas" or "Go to Planner".\n`;
  }

  // Check for Intervention gap
  const interventionPath = findShortestPath(graph, '/teacher', '/teacher/interventions', false);
  if (!interventionPath) {
      report += `2. **CRITICAL**: The Teacher Intervention flow is broken. \`/teacher/interventions\` is not reachable from the dashboard.\n`;
  }

  // Check for Complexity
  const overloaded = sortedNodes.filter(n => n.complexityScore > 4);
  if (overloaded.length > 0) {
      report += `3. **Usability**: The following pages have excessive cognitive load (>4 bits): ${overloaded.map(n => `\`${n.id}\``).join(', ')}. Simplify UI or break into steps.\n`;
  }

  // Generate Mermaid Graph
  report += `\n## 7. Interactive Flow Graph (Mermaid)\n`;
  report += `\`\`\`mermaid\ngraph TD\n`;
  // Add nodes
  for (const node of graph.nodes.values()) {
      let style = "";
      if (deadEnds.includes(node.id)) style = ":::deadEnd";
      else if (node.complexityScore > 4) style = ":::highLoad";

      report += `  "${node.id}"${style}\n`;
  }
  // Add edges (limit to Contextual to avoid clutter, or maybe just main flows?)
  // Let's include Contextual edges + Global edges ONLY if they are part of a critical path or maybe just Contextual for clarity
  // If we include all 220 edges, it will be unreadable.
  // Strategy: Show all Contextual edges. Show Global edges only if they are the ONLY way out (dead end escape).

  for (const edge of graph.edges) {
      if (edge.type === 'contextual') {
          report += `  "${edge.source}" -->|${edge.cost}| "${edge.target}"\n`;
      }
  }

  report += `  classDef deadEnd fill:#fecaca,stroke:#ef4444,stroke-width:2px;\n`;
  report += `  classDef highLoad fill:#fef08a,stroke:#eab308,stroke-width:2px;\n`;
  report += `\`\`\`\n`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`Report generated at ${OUTPUT_FILE}`);
}

// --- Execution ---

const graph = buildGraph();
generateReport(graph);
