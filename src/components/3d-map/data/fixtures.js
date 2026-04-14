/* ─────────────────────────────────────────────────────────────
   Graph Data Fixtures — KNN + Louvain + Bayesian States
   This is PREVIEW data only. Production uses Firestore.
   ───────────────────────────────────────────────────────────── */
import * as THREE from 'three';

// ── Bayesian Student States ──────────────────────────────
const BS = [
  { id:'ohms-law',       n:"Ohm's Law",         ch:'Electrical', subj:'Physics', a:17,b:3,  m:.85,cL:.72,cU:.94,sl:.03, fl:[] },
  { id:'kirchhoff',      n:"Kirchhoff's Laws",  ch:'Electrical', subj:'Physics', a:14,b:4,  m:.78,cL:.63,cU:.89,sl:.05, fl:[] },
  { id:'rc-circuits',    n:'RC Circuits',        ch:'Electrical', subj:'Physics', a:5, b:7,  m:.42,cL:.22,cU:.63,sl:-.03,fl:['ci'] },
  { id:'rl-circuits',    n:'RL Circuits',        ch:'Electrical', subj:'Physics', a:4, b:7.5,m:.35,cL:.16,cU:.57,sl:-.06,fl:['dec','ci'] },
  { id:'newtons-laws',   n:"Newton's Laws",      ch:'Mechanics',  subj:'Physics', a:23,b:2,  m:.92,cL:.83,cU:.97,sl:.01, fl:[] },
  { id:'projectile',     n:'Projectile Motion',  ch:'Mechanics',  subj:'Physics', a:18,b:2.5,m:.88,cL:.76,cU:.95,sl:.02, fl:[] },
  { id:'calculus-deriv', n:'Derivatives',        ch:'Calculus',   subj:'Math',    a:11,b:4,  m:.72,cL:.55,cU:.85,sl:.04, fl:[] },
  { id:'calculus-int',   n:'Integration',        ch:'Calculus',   subj:'Math',    a:7, b:6,  m:.55,cL:.35,cU:.73,sl:.0,  fl:[] },
  { id:'linear-algebra', n:'Linear Algebra',     ch:'Advanced',   subj:'Math',    a:3, b:9,  m:.25,cL:.09,cU:.46,sl:-.08,fl:['dec'] },
  { id:'diff-eq',        n:'Diff. Equations',    ch:'Advanced',   subj:'Math',    a:4.5,b:7.5,m:.38,cL:.18,cU:.60,sl:-.04,fl:['ci'] },
  { id:'laplace',        n:'Laplace Transform',  ch:'Advanced',   subj:'Math',    a:2, b:11, m:.15,cL:.04,cU:.33,sl:-.10,fl:['dec','low','ci'] },
  { id:'fourier',        n:'Fourier Series',     ch:'Advanced',   subj:'Math',    a:2.5,b:10,m:.20,cL:.06,cU:.40,sl:-.07,fl:['dec','low'] },
];

// ── Embeddings (simulated 16-dim) ────────────────────────
const EBASES = {
  elec:[.8,.7,.6,.1,.1,.2,.9,.8,.3,.1,.2,.1,.7,.6,.5,.1],
  circ:[.7,.8,.7,.2,.1,.3,.8,.9,.4,.2,.3,.2,.6,.7,.6,.2],
  mech:[.1,.2,.1,.9,.8,.7,.2,.1,.8,.9,.7,.6,.1,.2,.1,.8],
  calc:[.3,.4,.3,.4,.5,.3,.4,.3,.5,.4,.6,.3,.4,.3,.4,.5],
  advm:[.2,.3,.4,.3,.4,.5,.3,.4,.6,.5,.8,.7,.3,.4,.3,.6],
};
const jit = (b, a = .03) => b.map(v => v + (Math.random() - .5) * a * 2);
const EMB = {
  'ohms-law':jit(EBASES.elec),'kirchhoff':jit(EBASES.elec),
  'rc-circuits':jit(EBASES.circ),'rl-circuits':jit(EBASES.circ),
  'newtons-laws':jit(EBASES.mech),'projectile':jit(EBASES.mech),
  'calculus-deriv':jit(EBASES.calc),'calculus-int':jit(EBASES.calc),
  'linear-algebra':jit(EBASES.advm),'diff-eq':jit(EBASES.advm),
  'laplace':jit(EBASES.advm),'fourier':jit(EBASES.advm),
};

// ── KNN (cosine similarity) ─────────────────────────────
function cosim(a, b) {
  let d = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i]*b[i]; ma += a[i]*a[i]; mb += b[i]*b[i]; }
  const dn = Math.sqrt(ma) * Math.sqrt(mb);
  return dn ? d / dn : 0;
}

function knn(ids) {
  const edges = [], seen = new Set();
  for (const s of ids) {
    const nb = [];
    for (const t of ids) {
      if (s === t) continue;
      const sim = cosim(EMB[s], EMB[t]);
      if (sim >= .6) nb.push({ id: t, sim });
    }
    nb.sort((a, b) => b.sim - a.sim);
    nb.slice(0, 5).forEach((x) => {
      const k = [s, x.id].sort().join('|');
      if (!seen.has(k)) { seen.add(k); edges.push({ s, t: x.id, sim: x.sim }); }
    });
  }
  return edges;
}

// ── Salience (Bayesian) ─────────────────────────────────
function sal(s) {
  if (!s) return .5;
  const ci = s.cU - s.cL;
  return .3 * (s.m * (1 - ci)) + .25 * (1 - ci) +
    .25 * (1 - Math.max(0, 1 - Math.exp(-3 / Math.max(1, s.m * 10 / Math.max(ci, .1))))) +
    .2 * Math.max(0, Math.min(1, .5 + (s.sl > .05 ? .2 : s.sl > 0 ? .1 : s.sl < -.05 ? -.2 : 0)));
}

// ── Louvain ─────────────────────────────────────────────
function louvain(nids, edges, salM) {
  const n = nids.length, ix = {};
  nids.forEach((id, i) => ix[id] = i);
  const adj = Array.from({ length: n }, () => new Map());
  let tw = 0;
  for (const e of edges) {
    const si = ix[e.s ?? e.source], ti = ix[e.t ?? e.target];
    if (si === undefined || ti === undefined || si === ti) continue;
    const ss = salM[e.s ?? e.source] ?? 0.5, ts = salM[e.t ?? e.target] ?? 0.5;
    const w = (e.sim ? (e.sim * .8) : 1) * (ss + ts) / 2;
    adj[si].set(ti, (adj[si].get(ti) ?? 0) + w);
    adj[ti].set(si, (adj[ti].get(si) ?? 0) + w);
    tw += w;
  }
  const com = Array.from({ length: n }, (_, i) => i);
  const str = Array(n).fill(0);
  for (let i = 0; i < n; i++) for (const [, w] of adj[i]) str[i] += w;
  const m2 = tw * 2;
  if (!m2) { const r = {}; nids.forEach((id, i) => r[id] = `c${i}`); return r; }
  for (let it = 0; it < 50; it++) {
    let mv = false;
    for (let i = 0; i < n; i++) {
      const cur = com[i]; const cw = new Map();
      for (const [j, w] of adj[i]) cw.set(com[j], (cw.get(com[j]) ?? 0) + w);
      const cs = new Map();
      for (let j = 0; j < n; j++) cs.set(com[j], (cs.get(com[j]) ?? 0) + str[j]);
      const ki = str[i], kiIn = cw.get(cur) ?? 0, sT = cs.get(cur) ?? 0;
      const rG = kiIn - (sT - ki) * ki / m2;
      let bC = cur, bG = 0;
      for (const [tc, wIn] of cw) {
        if (tc === cur) continue;
        const dQ = wIn - (cs.get(tc) ?? 0) * ki / m2 - rG;
        if (dQ > bG) { bG = dQ; bC = tc; }
      }
      if (bC !== cur && bG > 1e-6) { com[i] = bC; mv = true; }
    }
    if (!mv) break;
  }
  const rm = {}; let cc = 0; const res = {};
  for (let i = 0; i < n; i++) {
    if (!(com[i] in rm)) rm[com[i]] = `cluster-${cc++}`;
    res[nids[i]] = rm[com[i]];
  }
  return res;
}

// Golden-angle palette
function cpal(n) {
  const c = [];
  for (let i = 0; i < n; i++) {
    const h = (i * 137.508) % 360;
    c.push(new THREE.Color(`hsl(${h},${65 + i % 3 * 10}%,${55 + i % 2 * 8}%)`));
  }
  return c;
}

// ── Node colors ─────────────────────────────────────────
export const COL = {
  student:  new THREE.Color(0x9333ea),
  subject:  new THREE.Color(0x3b82f6),
  chapter:  new THREE.Color(0x06b6d4),
  topic:    new THREE.Color(0x94a3b8),
  weakness: new THREE.Color(0xef4444),
  strength: new THREE.Color(0x22c55e),
};

export const COL_HEX = {
  student: '#9333ea', subject: '#3b82f6', chapter: '#06b6d4',
  topic: '#94a3b8', weakness: '#ef4444', strength: '#22c55e',
};

// ── Build Graph ─────────────────────────────────────────
export function buildGraph() {
  const nodes = [], links = [];

  nodes.push({ id:'student', n:'Test Student', t:'student', r:2.2, m:null, cL:null, cU:null, sl:null, fl:[] });
  ['Physics','Math'].forEach(s => {
    nodes.push({ id:`s-${s}`, n:s, t:'subject', r:1.6, m:null, cL:null, cU:null, sl:null, fl:[] });
    links.push({ s:'student', t:`s-${s}`, tp:'h' });
  });

  [...new Set(BS.map(x => x.ch))].forEach(ch => {
    const subj = BS.find(x => x.ch === ch).subj;
    nodes.push({ id:`c-${ch}`, n:ch, t:'chapter', r:1.2, m:null, cL:null, cU:null, sl:null, fl:[] });
    links.push({ s:`s-${subj}`, t:`c-${ch}`, tp:'h' });
  });

  BS.forEach(s => {
    const isW = s.m < .35 || s.fl.length > 1;
    const isS = s.m > .8 && (s.cU - s.cL) < .15;
    nodes.push({
      id:s.id, n:s.n,
      t: isW ? 'weakness' : isS ? 'strength' : 'topic',
      r: .7 + s.m * .5,
      m:s.m, cL:s.cL, cU:s.cU, sl:s.sl, fl:s.fl, a:s.a, b:s.b
    });
    links.push({ s:`c-${s.ch}`, t:s.id, tp:'h' });
  });

  const knnEdges = knn(BS.map(x => x.id));
  knnEdges.forEach(e => links.push({ s:e.s, t:e.t, tp:'knn', sim:e.sim }));

  // Salience & Louvain
  const salM = {};
  nodes.forEach(nd => {
    const bs = BS.find(x => x.id === nd.id);
    salM[nd.id] = bs ? sal(bs) : .5;
    nd.salience = salM[nd.id];
  });

  const coms = louvain(
    nodes.map(x => x.id),
    links.map(l => ({ s:l.s, t:l.t, source:l.s, target:l.t, sim:l.sim })),
    salM
  );
  const cids = [...new Set(Object.values(coms))];
  const pal = cpal(cids.length);
  const ccolMap = {};
  cids.forEach((c, i) => ccolMap[c] = pal[i]);

  nodes.forEach(nd => {
    nd.cluster = coms[nd.id];
    nd.clusterColor = ccolMap[nd.cluster];
  });

  // Build adjacency
  const nMap = {};
  nodes.forEach((nd, i) => { nd.idx = i; nMap[nd.id] = nd; });
  const adjList = {};
  nodes.forEach(nd => adjList[nd.id] = []);
  links.forEach((l, i) => {
    if (!adjList[l.s]) adjList[l.s] = [];
    if (!adjList[l.t]) adjList[l.t] = [];
    adjList[l.s].push({ nb: l.t, li: i });
    adjList[l.t].push({ nb: l.s, li: i });
  });

  // Compute cluster stats
  const topics = nodes.filter(n => ['topic','weakness','strength'].includes(n.t));
  const avgM = topics.reduce((s, n) => s + (n.m || 0), 0) / topics.length;
  const avgCI = topics.filter(n => n.cL != null).reduce((s, n) => s + (n.cU - n.cL), 0) / topics.length;
  const wk = topics.filter(n => n.t === 'weakness').length;
  const st = topics.filter(n => n.t === 'strength').length;
  const avgSal = topics.reduce((s, n) => s + (n.salience || .5), 0) / topics.length;

  return {
    nodes, links, nMap, adjList,
    cids, ccolMap,
    stats: { topics: topics.length, avgM, avgCI, wk, st, avgSal, knnEdges: knnEdges.length, clusters: cids.length },
  };
}
