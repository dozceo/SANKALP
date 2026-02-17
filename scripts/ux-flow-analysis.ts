import fs from 'fs';
import path from 'path';

// --- Configuration ---
const SRC_DIR = 'src/app';
const REPORT_FILE = 'UX_FLOW_ENTROPY_REPORT.md';

// --- Types ---
interface PageNode {
  id: string; // Route path, e.g., "/quiz"
  filePath: string;
  wordCount: number;
  interactiveElementCount: number;
  outgoingLinks: string[]; // List of target routes
  decisionPoints: number; // Similar to interactive elements but focuses on distinct choices
  responsiveClasses: number; // Count of 'md:', 'lg:', 'xl:', 'hidden'
  isDeadEnd: boolean;
}

interface Graph {
  nodes: Map<string, PageNode>;
  edges: { from: string; to: string }[];
}

// --- Helpers ---

// Convert file path to route path
function getRouteFromPath(filePath: string): string {
  let route = filePath.replace(SRC_DIR, '').replace('/page.tsx', '');
  // Remove groups like (main), (auth)
  route = route.replace(/\/\([^)]+\)/g, '');
  // Normalize dynamic segments [id] -> :id or just keep as [id]
  if (route === '') return '/';
  return route;
}

// Simple regex-based parser
function parsePage(filePath: string): PageNode {
  const content = fs.readFileSync(filePath, 'utf-8');
  const route = getRouteFromPath(filePath);

  // 1. Word Count (Rough approximation)
  // Remove imports
  const codeWithoutImports = content.replace(/import .*? from .*?;/g, '');
  // Remove HTML tags
  const textContent = codeWithoutImports.replace(/<[^>]+>/g, ' ');
  // Collapse whitespace
  const words = textContent.split(/\s+/).filter(w => w.length > 2); // Filter small noise
  const wordCount = words.length;

  // 2. Interactive Elements
  // Buttons, Links, Inputs, Selects
  const buttonCount = (content.match(/<Button/g) || []).length;
  const linkCount = (content.match(/<Link/g) || []).length;
  const inputCount = (content.match(/<Input|<Textarea|<Select|<RadioGroupItem|<TabsTrigger|<Checkbox|<Switch/g) || []).length;
  // Click handlers on other elements (rough heuristic)
  const clickCount = (content.match(/onClick=\{/g) || []).length;

  // Total interactive
  const interactiveElementCount = buttonCount + linkCount + inputCount;

  // 3. Outgoing Links
  const links: string[] = [];

  // Extract hrefs from <Link href="..."> (Double/Single quotes)
  const hrefMatches = content.matchAll(/<Link[^>]*href=["']([^"']+)["'][^>]*>/g);
  for (const match of hrefMatches) {
    links.push(match[1]);
  }

  // Extract hrefs from <Link href={...}> (JSX Expression)
  // Look for `href={` and try to grab the content until `}`
  const hrefJsxMatches = content.matchAll(/href=\{`([^`]+)`\}/g);
  for (const match of hrefJsxMatches) {
      links.push(match[1]);
  }

  // Also simple strings inside curly braces: href={'/foo'}
  const hrefJsxStringMatches = content.matchAll(/href=\{["']([^"']+)["']\}/g);
  for (const match of hrefJsxStringMatches) {
      links.push(match[1]);
  }

  // Extract router.push("...")
  const routerMatches = content.matchAll(/router\.push\(["'`]?([^"'`)]+)["'`]?\)/g);
  for (const match of routerMatches) {
    links.push(match[1]);
  }

  // Detect router.back()
  const routerBackMatches = content.matchAll(/router\.back\(\)/g);
  let hasRouterBack = false;
  for (const match of routerBackMatches) {
      hasRouterBack = true;
      // We don't push a specific link but we note it's not a dead end
  }

  // Normalize links
  const normalizedLinks = links.map(l => {
    // Handle template literals: `/teacher/student/${student.id}` -> `/teacher/student/[id]`
    if (l.includes('${')) {
       // Replace ${...} with [id]
       return l.replace(/\$\{[^}]+\}/g, '[id]');
    }
    return l;
  });

  // 4. Responsive Classes
  // Count occurrences of md:, lg:, xl:, hidden
  const responsiveClasses = (content.match(/(sm:|md:|lg:|xl:|2xl:|hidden)/g) || []).length;

  // 5. Dead End Check
  // A dead end has NO outgoing links AND NO router.back() AND NO implicit 'Go Home' (like clicking a logo usually)
  // But here we rely on explicit navigation.
  // We'll consider it a dead end if outgoingLinks is empty and no router.back().
  // However, often there's a header with a logo linking to /home. If that's in a layout, we miss it here.
  // We should be careful. We are analyzing PAGES, not layouts.
  // If a page has NO links to anywhere else, it relies entirely on Layout navigation.
  // That's usually fine, but if it's a "Flow Step" (like a Quiz question), it should have explicit navigation.

  const isDeadEnd = normalizedLinks.length === 0 && !hasRouterBack;

  return {
    id: route,
    filePath,
    wordCount,
    interactiveElementCount,
    outgoingLinks: normalizedLinks,
    decisionPoints: interactiveElementCount, // Using the same for now
    responsiveClasses,
    isDeadEnd
  };
}

function findAllPages(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAllPages(fullPath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// --- Metrics ---

function calculateCognitiveLoad(node: PageNode): { score: number; status: string } {
  // Simple formula: Words/50 + Decisions * 2
  // High load if > 7 decisions (Miller's law roughly) or lots of text
  const score = (node.wordCount / 50) + (node.decisionPoints * 1.5);
  let status = 'Optimal';
  if (score > 50) status = 'Overload';
  else if (score > 25) status = 'High';
  return { score, status };
}

function calculateEntropy(node: PageNode): number {
    const n = node.outgoingLinks.length;
    if (n === 0) return 0;
    // Assuming equal probability for each link for now (max entropy)
    return Math.log2(n);
}

function generateMermaidGraph(graph: Graph): string {
    let mermaid = '```mermaid\ngraph TD\n';

    // Nodes
    for (const [id, node] of graph.nodes) {
        // Sanitize ID for mermaid
        const safeId = id.replace(/\//g, '_').replace(/\[/g, '').replace(/\]/g, '').replace(/-/g, '_');
        if (safeId === '_') continue; // Skip root if weird

        // Color code by status
        const { status } = calculateCognitiveLoad(node);
        let style = '';
        if (status === 'Overload') style = ':::overload';
        else if (status === 'High') style = ':::high';

        // Label
        mermaid += `    ${safeId}("${id}")\n`;
    }

    // Edges
    const addedEdges = new Set<string>();
    for (const edge of graph.edges) {
        const safeFrom = edge.from.replace(/\//g, '_').replace(/\[/g, '').replace(/\]/g, '').replace(/-/g, '_');
        const safeTo = edge.to.replace(/\//g, '_').replace(/\[/g, '').replace(/\]/g, '').replace(/-/g, '_');

        if (safeTo.startsWith('http')) continue; // Skip external links for cleaner graph

        const edgeKey = `${safeFrom}->${safeTo}`;
        if (addedEdges.has(edgeKey)) continue;
        addedEdges.add(edgeKey);

        mermaid += `    ${safeFrom} --> ${safeTo}\n`;
    }

    // Classes
    mermaid += '    classDef overload fill:#f87171,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef high fill:#fcd34d,stroke:#333,stroke-width:2px;\n';
    mermaid += '```\n';
    return mermaid;
}

// --- Main Analysis ---

async function runAnalysis() {
  const pageFiles = findAllPages(SRC_DIR);
  const graph: Graph = {
    nodes: new Map(),
    edges: []
  };

  console.log(`Found ${pageFiles.length} pages.`);

  // 1. Build Graph
  for (const file of pageFiles) {
    const node = parsePage(file);
    graph.nodes.set(node.id, node);
  }

  // 2. Validate Edges
  for (const [id, node] of graph.nodes) {
    for (const link of node.outgoingLinks) {
        // Try to match link to a node ID
        let targetId = link;

        // Handle basic relative links
        if (!targetId.startsWith('/') && !targetId.startsWith('http')) {
             // very rough relative resolution
             targetId = path.join(id, targetId).replace(/\\/g, '/');
        }

        // Add edge
        graph.edges.push({ from: id, to: targetId });
    }
  }

  // 3. Generate Report Content
  let report = `# UX Flow Entropy Report

## Overview
- **Total Pages**: ${graph.nodes.size}
- **Total Transitions Detected**: ${graph.edges.length}

## Interactive Flow Graph (Mermaid)
${generateMermaidGraph(graph)}

## Cognitive Load Analysis
| Page | Word Count | Interactive Elements | Load Score | Status |
|------|------------|----------------------|------------|--------|
`;

  const rows: any[] = [];
  const deadEnds: string[] = [];
  const highEntropyPages: any[] = [];
  const mobileDivergence: any[] = [];

  for (const [id, node] of graph.nodes) {
    const { score, status } = calculateCognitiveLoad(node);
    const entropy = calculateEntropy(node);

    rows.push({ id, wordCount: node.wordCount, decisions: node.decisionPoints, score: score.toFixed(1), status, entropy: entropy.toFixed(2) });

    if (node.isDeadEnd) {
        // Double check against common nav items that might be in layout
        // But for flow analysis, we care about specific next steps.
        deadEnds.push(id);
    }
    if (entropy > 2.5) { // > ~5-6 choices
        highEntropyPages.push({ id, entropy: entropy.toFixed(2), choices: node.outgoingLinks.length });
    }

    if (node.responsiveClasses >= 3) {
        mobileDivergence.push({ id, count: node.responsiveClasses });
    }
  }

  // Sort by Load Score
  rows.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

  for (const row of rows) {
    report += `| \`${row.id}\` | ${row.wordCount} | ${row.decisions} | ${row.score} | ${row.status} |\n`;
  }

  report += `
## Decision Entropy (Analysis Paralysis Risks)
Pages with high branching factors (> 5 choices) causing potential decision fatigue.

| Page | Entropy | Choices |
|------|---------|---------|
`;
  if (highEntropyPages.length === 0) {
      report += "| None | 0 | 0 |\n";
  }
  for (const p of highEntropyPages) {
    report += `| \`${p.id}\` | ${p.entropy} | ${p.choices} |\n`;
  }

  report += `
## Mobile vs. Desktop Divergence
Pages with high usage of responsive modifiers (` + '`md:`' + `, ` + '`lg:`' + `, ` + '`hidden`' + `), indicating complex adaptive layouts.

| Page | Responsive Class Count | Complexity |
|------|------------------------|------------|
`;
  mobileDivergence.sort((a, b) => b.count - a.count);
  for (const m of mobileDivergence) {
      let complexity = 'Moderate';
      if (m.count > 30) complexity = 'High';
      report += `| \`${m.id}\` | ${m.count} | ${complexity} |\n`;
  }

  report += `
## Dead-End Detection
Pages with no detected outgoing internal links (risk of abandonment).

`;
  if (deadEnds.length === 0) {
      report += "- No dead ends detected.\n";
  } else {
      for (const d of deadEnds) {
          report += `- \`${d}\`\n`;
      }
  }

  report += `
## Path Efficiency & Missing Links
*Based on static analysis of \`href\` and \`router.push\`*

### Goal: Quiz -> Revision
- **Check**: Does \`/quiz\` lead to \`/planner\`?
- **Result**: ${checkPath(graph, '/quiz', '/planner') ? '✅ Path Found' : '❌ Broken Flow (Critical Bug)'}

### Goal: Teacher Dashboard -> Intervention
- **Check**: Does \`/teacher\` lead to Intervention Actions?
- **Result**: ${checkTeacherAction(graph) ? '✅ Actions Found' : '⚠️ Potential Action Gap'}

## Recommendations
1. **Fix Dead Ends**: Ensure all pages have a clear "Next Step" or "Back" button.
2. **Reduce Load**: Pages with "Overload" status should be split or simplified.
3. **Clarify Choices**: High entropy pages should group options or highlight a primary call-to-action.
4. **Mobile Optimization**: Review pages with "High" complexity to ensure mobile experience is not compromised.
`;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Report generated at ${REPORT_FILE}`);
}

function checkPath(graph: Graph, start: string, end: string): boolean {
    const startNode = graph.nodes.get(start);
    if (!startNode) return false;

    // Direct check
    if (startNode.outgoingLinks.some(l => l === end || l.startsWith(end))) return true;

    return false;
}

function checkTeacherAction(graph: Graph): boolean {
    const teacherNode = graph.nodes.get('/teacher');
    if (!teacherNode) return false;

    const studentLink = teacherNode.outgoingLinks.find(l => l.includes('student'));
    if (studentLink) {
        return true;
    }

    return false;
}

runAnalysis();
