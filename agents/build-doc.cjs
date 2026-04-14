/**
 * Build agents/doc/index.html from template.html + wiki .md files + phase prompts
 * Run: node build-doc.cjs
 */
const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, 'doc');
const PROJECT_ROOT = path.join(__dirname, '..');

// ─── Wiki Pages ───────────────────────────────────────────
const PAGES_META = [
  { slug: 'overview',        name: 'System Overview',      icon: '🌐', badge: 'Entry Point' },
  { slug: 'orchestration',   name: 'Orchestration Engine', icon: '⚙️', badge: '4 Components' },
  { slug: 'domain-agents',   name: 'Domain Agents',        icon: '🤖', badge: '6 Agents' },
  { slug: 'design-system',   name: 'Design System',        icon: '🎨', badge: '22 Screens' },
  { slug: 'llm-architecture',name: 'LLM Architecture',     icon: '🧠', badge: '30 Keys' },
  { slug: 'cli-usage',       name: 'CLI Usage',            icon: '💻', badge: '4 Commands' },
];

const PAGES = {};
for (const p of PAGES_META) {
  const mdPath = path.join(DOC_DIR, p.slug + '.md');
  if (fs.existsSync(mdPath)) {
    PAGES[p.slug] = fs.readFileSync(mdPath, 'utf-8');
  } else {
    console.warn(`  ⚠ ${p.slug}.md not found, skipping`);
  }
}

// ─── Phase Prompts ────────────────────────────────────────
const PHASE_FILE = path.join(PROJECT_ROOT, 'SANKALP_AEI_PHASE_PROMPTS.md');
let phaseFileContent = '';
if (fs.existsSync(PHASE_FILE)) {
  phaseFileContent = fs.readFileSync(PHASE_FILE, 'utf-8');
  console.log('  ✓ Read SANKALP_AEI_PHASE_PROMPTS.md');
} else {
  console.warn('  ⚠ SANKALP_AEI_PHASE_PROMPTS.md not found at', PHASE_FILE);
}

// Extract Agent Identity section
let agentIdentity = '';
const idMatch = phaseFileContent.match(/## AGENT IDENTITY[\s\S]*?(?=\n---\s*\n)/);
if (idMatch) agentIdentity = idMatch[0].trim();

// Extract Repo State section
let repoState = '';
const rsMatch = phaseFileContent.match(/## CURRENT REPO STATE[\s\S]*?(?=\n---\s*\n## PHASE)/);
if (rsMatch) repoState = rsMatch[0].trim();

// Extract individual phase blocks
const phases = [];
// Split on "## PHASE N" headers
const phaseBlocks = phaseFileContent.split(/(?=## PHASE \d+)/);
for (const block of phaseBlocks) {
  const headerMatch = block.match(/^## PHASE (\d+)\s*[—–-]\s*(.+)/);
  if (!headerMatch) continue;

  const id = parseInt(headerMatch[1]);
  const title = headerMatch[2].trim();
  // Content is everything after the first line
  const content = block.replace(/^## PHASE \d+\s*[—–-][^\n]*\n?/, '').trim();

  // Extract verification checklist items
  const checklist = [];
  const checkRE = /- \[ \]\s*(.+)/g;
  let cm;
  while ((cm = checkRE.exec(content)) !== null) {
    checklist.push(cm[1].trim());
  }

  phases.push({ id, title, content, checklist });
}

console.log(`  ✓ Parsed ${phases.length} phases`);

// ─── Serialize Data ───────────────────────────────────────
function escapeJS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/\t/g, '\\t');
}

// Wiki PAGES object: {"slug":"escaped markdown content", ...}
let pagesObj = '{';
for (const [slug, content] of Object.entries(PAGES)) {
  pagesObj += `"${slug}":"${escapeJS(content)}",`;
}
pagesObj = pagesObj.replace(/,$/, '') + '}';

// TREE array
const treeStr = '[' + PAGES_META
  .filter(p => PAGES[p.slug])
  .map(p => JSON.stringify({ name: p.name, slug: p.slug, icon: p.icon, badge: p.badge, children: [] }))
  .join(',') + ']';

// Phases JSON
const phasesJson = JSON.stringify(phases);

// Identity + Repo state as JSON strings
const identityJson = JSON.stringify(agentIdentity);
const repoStateJson = JSON.stringify(repoState);

// ─── Read Template & Inject ───────────────────────────────
const templatePath = path.join(DOC_DIR, 'template.html');
if (!fs.existsSync(templatePath)) {
  console.error('ERROR: template.html not found at', templatePath);
  process.exit(1);
}

let html = fs.readFileSync(templatePath, 'utf-8');

html = html.replace('__PAGES_DATA__', pagesObj);
html = html.replace('__TREE_DATA__', treeStr);
html = html.replace('__PHASES_DATA__', phasesJson);
html = html.replace('__IDENTITY_DATA__', identityJson);
html = html.replace('__REPOSTATE_DATA__', repoStateJson);

// ─── Write Output ─────────────────────────────────────────
const outPath = path.join(DOC_DIR, 'index.html');
fs.writeFileSync(outPath, html, 'utf-8');

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`\n  ✅ Built ${outPath}`);
console.log(`     ${kb} KB | ${phases.length} phases | ${Object.keys(PAGES).length} wiki pages`);
