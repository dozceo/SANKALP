"use client";
/* ═══════════════════════════════════════════════════════════
   TeacherNetworkMap — Student Learning Network (Teacher View)
   Each student is a node. Edges = shared curriculum + KNN similarity.
   Static DOM sidebars for all labels/analytics, no 3D HTML overlays.
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import GraphScene from './scene/GraphScene';

const DEFAULT_SETTINGS = {
  nodeSize: 1.0,
  linkThickness: 1.0,
  repulsion: 1.0,
  bloomIntensity: 2.0,
  autoRotate: true,
};

// ── Class Student Data ───────────────────────────────────────
const STUDENTS = [
  { id: 'st-arya',    name: 'Arya Stark',       level: 42, avgM: 0.71, trend: +0.03, subject: 'Physics',   weakTopics: ['RC Circuits', 'RL Circuits'],      strongTopics: ["Newton's Laws", 'Projectile Motion'] },
  { id: 'st-jon',     name: 'Jon Snow',          level: 38, avgM: 0.63, trend: +0.01, subject: 'Physics',   weakTopics: ['Laplace Transform', 'Fourier Series'], strongTopics: ['Ohm\'s Law'] },
  { id: 'st-sansa',   name: 'Sansa Stark',       level: 35, avgM: 0.55, trend: -0.02, subject: 'Math',      weakTopics: ['Linear Algebra', 'Diff. Equations'],   strongTopics: ['Derivatives'] },
  { id: 'st-bran',    name: 'Bran Stark',        level: 29, avgM: 0.44, trend: -0.05, subject: 'Math',      weakTopics: ['Linear Algebra', 'Laplace Transform', 'Fourier Series'], strongTopics: [] },
  { id: 'st-cersei',  name: 'Cersei Lannister',  level: 51, avgM: 0.88, trend: +0.04, subject: 'Physics',   weakTopics: [],                                 strongTopics: ["Newton's Laws", "Ohm's Law", 'Kirchhoff\'s Laws'] },
  { id: 'st-tyrion',  name: 'Tyrion Lannister',  level: 48, avgM: 0.82, trend: +0.02, subject: 'Math',      weakTopics: [],                                 strongTopics: ['Derivatives', 'Integration', "Newton's Laws"] },
  { id: 'st-daenerys',name: 'Daenerys Targaryen', level: 44, avgM: 0.76, trend: +0.05, subject: 'Physics',  weakTopics: ['RC Circuits'],                     strongTopics: ['Projectile Motion', "Newton's Laws"] },
  { id: 'st-jaime',   name: 'Jaime Lannister',   level: 33, avgM: 0.50, trend: -0.01, subject: 'Math',      weakTopics: ['Fourier Series', 'Diff. Equations'], strongTopics: ['Integration'] },
];

// ── Shared curriculum topics (appear once, connected to many students) ──
const CURRICULUM_TOPICS = [
  { id: 'ct-newtons', name: "Newton's Laws",    subj: 'Physics', color: '#3b82f6' },
  { id: 'ct-circuits', name: 'RC/RL Circuits',  subj: 'Physics', color: '#ef4444' },
  { id: 'ct-calculus', name: 'Calculus',         subj: 'Math',   color: '#06b6d4' },
  { id: 'ct-linalg',   name: 'Linear Algebra',   subj: 'Math',   color: '#ef4444' },
  { id: 'ct-signals',  name: 'Signals & Systems', subj: 'Math', color: '#f59e0b' },
  { id: 'ct-mechanics',name: 'Mechanics',         subj: 'Physics', color: '#22c55e' },
];

function buildStudentNetwork() {
  const nodes = [];
  const links = [];
  const nMap = {};
  const adjList = {};

  // Add curriculum topic nodes
  CURRICULUM_TOPICS.forEach((ct, i) => {
    const nd = { id: ct.id, n: ct.name, t: 'subject', r: 1.0, m: null, cL: null, cU: null, sl: null, fl: [], salience: 0.7, idx: i };
    nodes.push(nd);
    nMap[ct.id] = nd;
    adjList[ct.id] = [];
  });

  // Add student nodes
  STUDENTS.forEach((st, i) => {
    const isWeak = st.avgM < 0.5;
    const isStrong = st.avgM > 0.8;
    const nd = {
      id: st.id,
      n: st.name,
      t: isWeak ? 'weakness' : isStrong ? 'strength' : 'topic',
      r: 1.0 + st.avgM * 0.8,
      m: st.avgM,
      cL: Math.max(0, st.avgM - 0.12),
      cU: Math.min(1, st.avgM + 0.12),
      sl: st.trend,
      fl: st.weakTopics.length > 1 ? ['ci'] : [],
      salience: st.avgM,
      idx: CURRICULUM_TOPICS.length + i,
      studentData: st,
    };
    nodes.push(nd);
    nMap[st.id] = nd;
    adjList[st.id] = [];
  });

  // Connect students to their shared curriculum topics
  const topicToId = {
    "Newton's Laws":   'ct-newtons',
    'RC Circuits':     'ct-circuits',
    'RL Circuits':     'ct-circuits',
    'Linear Algebra':  'ct-linalg',
    'Diff. Equations': 'ct-linalg',
    'Laplace Transform':'ct-signals',
    'Fourier Series':  'ct-signals',
    'Derivatives':     'ct-calculus',
    'Integration':     'ct-calculus',
    'Projectile Motion':'ct-mechanics',
    "Ohm's Law":       'ct-newtons',
    "Kirchhoff's Laws":'ct-newtons',
  };

  const linkIdx = { current: 0 };
  function addLink(s, t, tp, sim = 1.0) {
    const li = linkIdx.current++;
    links.push({ s, t, tp, sim });
    if (!adjList[s]) adjList[s] = [];
    if (!adjList[t]) adjList[t] = [];
    adjList[s].push({ nb: t, li });
    adjList[t].push({ nb: s, li });
  }

  STUDENTS.forEach(st => {
    const topicsSet = new Set([...st.weakTopics, ...st.strongTopics]);
    topicsSet.forEach(topic => {
      const ctId = topicToId[topic];
      if (ctId) addLink(st.id, ctId, 'h', 0.8);
    });
  });

  // KNN links between similar students (same subject + similar mastery)
  for (let i = 0; i < STUDENTS.length; i++) {
    for (let j = i + 1; j < STUDENTS.length; j++) {
      const a = STUDENTS[i], b = STUDENTS[j];
      const masteryDiff = Math.abs(a.avgM - b.avgM);
      const sameSubject = a.subject === b.subject;
      const sim = (sameSubject ? 0.6 : 0.2) + (1 - masteryDiff) * 0.4;
      if (sim > 0.6) addLink(a.id, b.id, 'knn', sim);
    }
  }

  // Build final index mapping
  nodes.forEach((nd, i) => { nd.idx = i; nMap[nd.id] = nd; });

  const allStudentNodes = nodes.filter(n => STUDENTS.find(s => s.id === n.id));
  const avgM = allStudentNodes.reduce((s, n) => s + (n.m || 0), 0) / allStudentNodes.length;
  const wk = allStudentNodes.filter(n => n.t === 'weakness').length;
  const st = allStudentNodes.filter(n => n.t === 'strength').length;
  const knnEdges = links.filter(l => l.tp === 'knn').length;

  return {
    nodes, links, nMap, adjList,
    cids: ['cluster-0', 'cluster-1'],
    ccolMap: {},
    stats: { topics: allStudentNodes.length, avgM, avgCI: 0.12, wk, st, avgSal: avgM, knnEdges, clusters: 3 },
    _px: null, _py: null, _pz: null,
  };
}

// ── Component ──────────────────────────────────────────────
export default function TeacherNetworkMap() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState(null);

  const fpsRef     = useRef(null);
  const tooltipRef = useRef(null);
  const hoveredRef = useRef(null);

  const graph = useMemo(() => buildStudentNetwork(), []);

  const handleFps = useCallback((v) => {
    if (fpsRef.current) {
      fpsRef.current.textContent = `${v} fps · ${graph.nodes.length} nodes · ${graph.links.length} edges · ${graph.stats.knnEdges} KNN`;
    }
  }, [graph]);

  const handleHover = useCallback((nd, x, y) => {
    hoveredRef.current = nd;
    const el = tooltipRef.current;
    if (!el) return;
    if (!nd) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.style.left = `${Math.min(x + 270, window.innerWidth - 270)}px`;
    el.style.top  = `${Math.min(y, window.innerHeight - 200)}px`;
    const mPct = nd.m != null ? Math.round(nd.m * 100) : null;
    const mCol = nd.m > 0.7 ? '#22c55e' : nd.m > 0.4 ? '#f59e0b' : '#ef4444';
    const st = nd.studentData;
    el.innerHTML = `<div style="font-weight:700;font-size:13px;color:#e2e8f0;margin-bottom:4px">${st ? st.name : nd.n}</div>`
      + `<div style="font-size:10px;color:#64748b;margin-bottom:4px">${st ? `Level ${st.level} · ${st.subject}` : nd.t}</div>`
      + (mPct != null ? `<div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8"><span>Mastery</span><span style="color:${mCol};font-weight:700">${mPct}%</span></div>` : '');
  }, []);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const classAvg = Math.round(graph.stats.avgM * 100);
  const struggling = STUDENTS.filter(s => s.avgM < 0.5);
  const excelling = STUDENTS.filter(s => s.avgM > 0.8);

  // When a student node is selected
  const selectedStudent = selected ? STUDENTS.find(s => s.id === selected.id) : null;

  return (
    <div className="brain-map-root">

      {/* ── Left Sidebar – Class Analytics ── */}
      <aside style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 20,
        width: 270, display: 'flex', flexDirection: 'column', gap: 10,
        padding: '16px 14px',
        background: 'linear-gradient(90deg, rgba(10,11,20,0.97) 0%, rgba(10,11,20,0.82) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>SANKALP · TEACHER</div>
          <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #4ade80, #22d3ee, #60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Learning Network
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Physics Section B · 8 students</div>
        </div>

        {/* Class average */}
        <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 12, padding: 14, border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ fontSize: 9, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>CLASS AVERAGE</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>{classAvg}%</div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 10 }}>
            <div style={{ height: '100%', width: `${classAvg}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#64748b' }}>
            <span>⚠ {graph.stats.wk} struggling</span>
            <span>✅ {graph.stats.st} excelling</span>
          </div>
        </div>

        {/* Student roster */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>STUDENT ROSTER</div>
          {STUDENTS.map(st => (
            <div
              key={st.id}
              onClick={() => {
                const nd = graph.nMap[st.id];
                setSelected(selected?.id === st.id ? null : nd);
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 8px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                background: selected?.id === st.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                border: `1px solid ${selected?.id === st.id ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: st.avgM > 0.8 ? '#22c55e' : st.avgM > 0.5 ? '#f59e0b' : '#ef4444',
                  boxShadow: `0 0 6px ${st.avgM > 0.8 ? '#22c55e88' : st.avgM > 0.5 ? '#f59e0b88' : '#ef444488'}`,
                }} />
                <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{st.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: st.avgM > 0.8 ? '#4ade80' : st.avgM > 0.5 ? '#f59e0b' : '#f87171' }}>
                  {Math.round(st.avgM * 100)}%
                </div>
                <div style={{ fontSize: 9, color: st.trend > 0 ? '#4ade80' : '#f87171' }}>
                  {st.trend > 0 ? '▲' : '▼'} {Math.abs(st.trend * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Struggling students */}
        {struggling.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.07)', borderRadius: 12, padding: 12, border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#f87171', textTransform: 'uppercase', marginBottom: 8 }}>⚠ INTERVENTION NEEDED</div>
            {struggling.map(st => (
              <div key={st.id} style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>
                {st.name} · {st.weakTopics.join(', ')}
              </div>
            ))}
          </div>
        )}

        {/* Common weaknesses */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>CURRICULUM NODES</div>
          {CURRICULUM_TOPICS.map(ct => {
            const count = STUDENTS.filter(s => [...s.weakTopics, ...s.strongTopics].some(t => {
              const map = { "Newton's Laws": 'ct-newtons', "Ohm's Law": 'ct-newtons', "Kirchhoff's Laws": 'ct-newtons', 'RC Circuits': 'ct-circuits', 'RL Circuits': 'ct-circuits', 'Derivatives': 'ct-calculus', 'Integration': 'ct-calculus', 'Linear Algebra': 'ct-linalg', 'Diff. Equations': 'ct-linalg', 'Laplace Transform': 'ct-signals', 'Fourier Series': 'ct-signals', 'Projectile Motion': 'ct-mechanics' };
              return map[t] === ct.id;
            })).length;
            return (
              <div key={ct.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 10 }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{ct.name}</span>
                <span style={{ color: ct.color, fontWeight: 700 }}>{count} students</span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Backdrop */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'transparent', pointerEvents: 'auto' }} />
      )}

      {/* ── Right Panel – position:fixed to stay above WebGL canvas ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 40,
        width: 288, display: 'flex', flexDirection: 'column', gap: 12,
        padding: '20px 18px',
        background: 'rgba(6,7,16,0.98)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto',
        transform: selected ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: selected ? 'auto' : 'none',
        fontFamily: 'Inter, -apple-system, sans-serif',
        boxShadow: '-12px 0 60px rgba(0,0,0,0.6)',
      }}>
        {selected && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.3 }}>
                  {selectedStudent ? selectedStudent.name : selected.n}
                </div>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 }}>
                  {selectedStudent ? `Level ${selectedStudent.level} · ${selectedStudent.subject}` : selected.t}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>✕</button>
            </div>

            {selectedStudent ? (
              <>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>MASTERY</div>
                  <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: selectedStudent.avgM > 0.8 ? '#4ade80' : selectedStudent.avgM > 0.5 ? '#f59e0b' : '#f87171' }}>
                    {Math.round(selectedStudent.avgM * 100)}%
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, marginTop: 10 }}>
                    <div style={{ height: '100%', width: `${selectedStudent.avgM * 100}%`, background: selectedStudent.avgM > 0.8 ? '#22c55e' : selectedStudent.avgM > 0.5 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, marginTop: 8, fontWeight: 600, color: selectedStudent.trend > 0 ? '#4ade80' : '#f87171' }}>
                    {selectedStudent.trend > 0 ? '📈 Improving' : '📉 Declining'}: {(Math.abs(selectedStudent.trend) * 100).toFixed(0)}% / session
                  </div>
                </div>

                {selectedStudent.strongTopics.length > 0 && (
                  <div style={{ background: 'rgba(34,197,94,0.07)', borderRadius: 12, padding: 12, border: '1px solid rgba(34,197,94,0.15)' }}>
                    <div style={{ fontSize: 9, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>✅ STRONG TOPICS</div>
                    {selectedStudent.strongTopics.map(t => (
                      <div key={t} style={{ fontSize: 11, color: '#86efac', fontWeight: 600, padding: '3px 0' }}>{t}</div>
                    ))}
                  </div>
                )}

                {selectedStudent.weakTopics.length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.07)', borderRadius: 12, padding: 12, border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ fontSize: 9, color: '#f87171', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>⚠ WEAK TOPICS</div>
                    {selectedStudent.weakTopics.map(t => (
                      <div key={t} style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600, padding: '3px 0' }}>{t}</div>
                    ))}
                  </div>
                )}

                <div style={{ background: 'rgba(124,58,237,0.1)', borderRadius: 12, padding: 12, border: '1px solid rgba(124,58,237,0.2)', marginTop: 'auto' }}>
                  <div style={{ fontSize: 9, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>RECOMMENDED ACTION</div>
                  <div style={{ fontSize: 12, color: '#c4b5fd', lineHeight: 1.5 }}>
                    {selectedStudent.weakTopics.length > 0
                      ? `Assign remediation on: ${selectedStudent.weakTopics[0]}`
                      : `Continue advanced curriculum for ${selectedStudent.name}`}
                  </div>
                </div>
              </>
            ) : (
              /* Curriculum topic node selected */
              selected.m == null ? (
                <div style={{ background: 'rgba(59,130,246,0.08)', borderRadius: 12, padding: 14, border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ fontSize: 9, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>CURRICULUM NODE</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>Shared topic connecting multiple students in the learning network.</div>
                </div>
              ) : null
            )}
          </>
        )}
      </div>

      {/* ── Settings drawer ── */}
      {showSettings && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 50, width: 340,
          background: 'rgba(12,14,28,0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
          padding: 24, color: '#e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>⚙️ Graph Settings</div>
            <button onClick={() => setShowSettings(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>✕</button>
          </div>
          {[
            { key: 'nodeSize', label: 'Node Size', min: 0.3, max: 3.0, step: 0.1 },
            { key: 'linkThickness', label: 'Link Opacity', min: 0.1, max: 2.0, step: 0.1 },
            { key: 'repulsion', label: 'Repulsion / Spread', min: 0.2, max: 3.0, step: 0.1 },
            { key: 'bloomIntensity', label: 'Bloom Intensity', min: 0.0, max: 4.0, step: 0.2 },
          ].map(({ key, label, min, max, step }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>{settings[key].toFixed(1)}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step}
                value={settings[key]}
                onChange={e => handleSettingChange(key, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#22c55e', cursor: 'pointer' }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Auto-Rotate</span>
            <button
              onClick={() => handleSettingChange('autoRotate', !settings.autoRotate)}
              style={{
                background: settings.autoRotate ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${settings.autoRotate ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: settings.autoRotate ? '#4ade80' : '#64748b',
                borderRadius: 8, padding: '4px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}
            >{settings.autoRotate ? 'ON' : 'OFF'}</button>
          </div>
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            style={{ display: 'block', width: '100%', marginTop: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '8px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >Reset to Defaults</button>
        </div>
      )}

      {/* ── Settings button ── */}
      <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 30, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{
            background: showSettings ? 'rgba(34,197,94,0.2)' : 'rgba(12,14,28,0.8)',
            border: `1px solid ${showSettings ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: showSettings ? '#4ade80' : '#94a3b8',
            borderRadius: 10, padding: '6px 14px', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, backdropFilter: 'blur(12px)',
          }}
        >⚙ Settings</button>
      </div>

      {/* ── 3D Canvas — always full width minus left sidebar ── */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0,
        left: 270, right: 0,
      }}>
        <Canvas
          camera={{ position: [0, 30, 110], fov: 55, near: 0.1, far: 2000 }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0a0b14');
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }}
        >
          <GraphScene
            graph={graph}
            selected={selected}
            onSelect={setSelected}
            onHover={handleHover}
            onFps={handleFps}
            settings={settings}
          />
        </Canvas>

        <div
          ref={fpsRef}
          style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, color: 'rgba(100,116,139,0.5)', pointerEvents: 'none',
            fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px',
          }}
        >
          0 fps · {graph.nodes.length} nodes · {graph.links.length} edges · {graph.stats.knnEdges} KNN
        </div>
      </div>

      {/* Hover tooltip — DOM ref, no React re-renders */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed', zIndex: 55, pointerEvents: 'none', display: 'none',
          background: 'rgba(6,7,16,0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '10px 14px', minWidth: 180, maxWidth: 260,
          fontFamily: 'Inter, -apple-system, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 280, zIndex: 15,
        display: 'flex', gap: 16, alignItems: 'center',
        background: 'rgba(12,14,28,0.8)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
        padding: '8px 16px', fontSize: 10, color: '#64748b', fontWeight: 600,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
          <span>Struggling</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <span>Average</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span>Excelling</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 1, background: '#4a6fa5', opacity: 0.8 }} />
          <span>Hierarchy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 1, background: '#d4a843', opacity: 0.8 }} />
          <span>KNN-Similarity</span>
        </div>
      </div>
    </div>
  );
}
