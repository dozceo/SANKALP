"use client";
/* ═══════════════════════════════════════════════════════════
   StudentBrainMap — Neural Copy (Student View)
   3D Canvas fills the full viewport minus left sidebar.
   Info panel slides in as an overlay on the RIGHT — no canvas resize.
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import GraphScene from './scene/GraphScene';
import { buildGraph } from './data/fixtures';

const DEFAULT_SETTINGS = {
  nodeSize: 1.0,
  linkThickness: 1.0,
  repulsion: 1.0,
  bloomIntensity: 2.0,
  autoRotate: true,
};

const CLUSTER_META = [
  { type: 'student',  label: 'STUDENTS',   color: '#a78bfa' },
  { type: 'subject',  label: 'SUBJECTS',   color: '#60a5fa' },
  { type: 'topic',    label: 'TOPICS',     color: '#94a3b8' },
  { type: 'weakness', label: 'WEAKNESSES', color: '#f87171' },
  { type: 'strength', label: 'STRENGTHS',  color: '#4ade80' },
];

export default function StudentBrainMap() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState(null);

  // FPS & tooltip via refs + direct DOM mutation — zero React re-renders
  const fpsRef     = useRef(null);
  const tooltipRef = useRef(null);
  const hoveredRef = useRef(null);  // tracks the node object

  const graph = useMemo(() => buildGraph(), []);

  const typeCounts = useMemo(() => {
    const c = {};
    graph.nodes.forEach(n => { c[n.t] = (c[n.t] || 0) + 1; });
    return c;
  }, [graph]);

  const handleFps = useCallback((v) => {
    if (fpsRef.current) {
      fpsRef.current.textContent = `${v} fps · ${graph.nodes.length} nodes · ${graph.links.length} edges`;
    }
  }, [graph]);

  const handleHover = useCallback((nd, x, y) => {
    hoveredRef.current = nd;
    const el = tooltipRef.current;
    if (!el) return;
    if (!nd) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';
    el.style.left = `${Math.min(x + 258, window.innerWidth - 270)}px`;
    el.style.top  = `${Math.min(y, window.innerHeight - 220)}px`;
    const mPct = nd.m != null ? Math.round(nd.m * 100) : null;
    const mCol = nd.m > 0.7 ? '#22c55e' : nd.m > 0.4 ? '#f59e0b' : '#ef4444';
    el.innerHTML = `<div style="color:${nd.t === 'weakness' ? '#ef4444' : nd.t === 'strength' ? '#22c55e' : '#94a3b8'};font-weight:700;font-size:13px;margin-bottom:4px">${nd.n}</div>`
      + `<div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-bottom:2px"><span>Type</span><span>${nd.t}</span></div>`
      + (mPct != null ? `<div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-bottom:2px"><span>Mastery</span><span style="color:${mCol};font-weight:700">${mPct}%</span></div>` : '')
      + (nd.salience != null ? `<div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8"><span>Salience</span><span style="color:#a78bfa;font-weight:700">${nd.salience.toFixed(3)}</span></div>` : '');
  }, []);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const weaknesses = useMemo(() =>
    graph.nodes.filter(n => n.t === 'weakness').sort((a, b) => (a.m || 0) - (b.m || 0)),
    [graph]
  );
  const strengths = useMemo(() =>
    graph.nodes.filter(n => n.t === 'strength').sort((a, b) => (b.m || 0) - (a.m || 0)),
    [graph]
  );

  // Mastery color helper
  const mColor = (m) => m > 0.7 ? '#4ade80' : m > 0.4 ? '#f59e0b' : '#f87171';

  return (
    <div className="brain-map-root">

      {/* ══════════════════════════════════════
          LEFT SIDEBAR — always visible
      ══════════════════════════════════════ */}
      <aside style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 25,
        width: 258, flexShrink: 0,
        background: 'rgba(8,9,18,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: '18px 14px',
        overflowY: 'auto',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>SANKALP AEI</div>
          <div style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#a78bfa,#60a5fa,#22d3ee)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
            Neural Copy
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>Arya Stark · Lvl 42 Neural Architect</div>
        </div>

        {/* Knowledge map breakdown */}
        <Section title="KNOWLEDGE MAP">
          {CLUSTER_META.map(({ type, label, color }) => (
            <Row key={type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Dot color={color} glow />
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
              </div>
              <Chip color={color}>{typeCounts[type] || 0}</Chip>
            </Row>
          ))}
        </Section>

        {/* Global mastery */}
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 12, padding: 12 }}>
          <Label color="#a78bfa">AVG MASTERY</Label>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
            {Math.round(graph.stats.avgM * 100)}%
          </div>
          <ProgressBar value={graph.stats.avgM} color="#7c3aed" />
        </div>

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <Section title="⚠ WEAK AREAS" accent="#f87171" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.15)">
            {weaknesses.map(n => (
              <Row key={n.id} onClick={() => setSelected(selected?.id === n.id ? null : n)} clickable selected={selected?.id === n.id}>
                <span style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600 }}>{n.n}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171' }}>{Math.round((n.m || 0) * 100)}%</span>
              </Row>
            ))}
          </Section>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <Section title="✅ STRENGTHS" accent="#4ade80" bg="rgba(34,197,94,0.06)" border="rgba(34,197,94,0.15)">
            {strengths.map(n => (
              <Row key={n.id} onClick={() => setSelected(selected?.id === n.id ? null : n)} clickable selected={selected?.id === n.id}>
                <span style={{ fontSize: 11, color: '#86efac', fontWeight: 600 }}>{n.n}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>{Math.round((n.m || 0) * 100)}%</span>
              </Row>
            ))}
          </Section>
        )}

        {/* Footer stats */}
        <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { l: 'KNN Edges', v: graph.stats.knnEdges, c: '#d4a843' },
            { l: 'Clusters',  v: graph.stats.clusters,  c: '#60a5fa' },
            { l: 'Struggling', v: graph.stats.wk,       c: '#f87171' },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginBottom: 5 }}>
              <span>{l}</span><span style={{ color: c, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══════════════════════════════════════
          3D CANVAS — fills right of sidebar
      ══════════════════════════════════════ */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 258, right: 0 }}>
        <Canvas
          camera={{ position: [0, 25, 100], fov: 55, near: 0.1, far: 2000 }}
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
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, color: 'rgba(100,116,139,0.45)', pointerEvents: 'none',
            fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px', whiteSpace: 'nowrap',
          }}
        >
          0 fps · {graph.nodes.length} nodes · {graph.links.length} edges
        </div>

        {/* Bottom legend strip */}
        <div style={{
          position: 'absolute', bottom: 10, left: 12, zIndex: 5,
          display: 'flex', gap: 14, alignItems: 'center',
          background: 'rgba(8,9,18,0.8)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18,
          padding: '7px 14px', fontSize: 10, color: '#64748b', fontWeight: 600,
        }}>
          <LegendLine color="#4a6fa5" label="Hierarchy" />
          <LegendLine color="#d4a843" label="KNN" />
          <LegendDot color="#f87171" label="Weakness" />
          <LegendDot color="#4ade80" label="Strength" />
          <LegendDot color="#94a3b8" label="Topic" />
        </div>
      </div>

      {/* Backdrop click-to-dismiss */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'transparent',
            pointerEvents: 'auto',
          }}
        />
      )}

      {/* ══════════════════════════════════════
          NODE DETAIL PANEL — fixed overlay,
          above WebGL canvas at all times
      ══════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 288, zIndex: 40,
        transform: selected ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(6,7,16,0.98)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: '20px 18px',
        overflowY: 'auto',
        fontFamily: 'Inter, -apple-system, sans-serif',
        pointerEvents: selected ? 'auto' : 'none',
        boxShadow: '-12px 0 60px rgba(0,0,0,0.6)',
      }}>
        {selected && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.3 }}>{selected.n}</div>
                <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 }}>{selected.t}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
              >✕</button>
            </div>

            {selected.m != null && (
              <InfoCard>
                <Label>MASTERY</Label>
                <div style={{ fontSize: 40, fontWeight: 900, color: mColor(selected.m), lineHeight: 1, marginTop: 4 }}>
                  {Math.round(selected.m * 100)}%
                </div>
                <ProgressBar value={selected.m} color={selected.m > 0.7 ? '#22c55e' : selected.m > 0.4 ? '#f59e0b' : '#ef4444'} />
                <div style={{ fontSize: 10, color: mColor(selected.m), marginTop: 6, fontWeight: 600 }}>
                  {selected.m > 0.8 ? '🌟 Mastered' : selected.m > 0.6 ? '📈 Learning' : selected.m > 0.4 ? '⏳ In progress' : '⚠ Needs work'}
                </div>
              </InfoCard>
            )}

            {selected.cL != null && (
              <InfoCard>
                <Label>95% CONFIDENCE INTERVAL</Label>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>
                  {selected.cL.toFixed(2)} — {selected.cU.toFixed(2)}
                </div>
                <div style={{ fontSize: 10, marginTop: 4, color: (selected.cU - selected.cL) < 0.2 ? '#4ade80' : (selected.cU - selected.cL) < 0.4 ? '#f59e0b' : '#f87171', fontWeight: 600 }}>
                  Width {((selected.cU - selected.cL) * 100).toFixed(1)}% ·{' '}
                  {(selected.cU - selected.cL) < 0.2 ? 'High confidence' : (selected.cU - selected.cL) < 0.4 ? 'Moderate' : 'Uncertain'}
                </div>
              </InfoCard>
            )}

            {selected.sl != null && (
              <InfoCard>
                <Label>TRAJECTORY</Label>
                <div style={{ fontSize: 16, fontWeight: 700, color: selected.sl > 0 ? '#4ade80' : selected.sl < 0 ? '#f87171' : '#94a3b8', marginTop: 4 }}>
                  {selected.sl > 0 ? '📈 +' : selected.sl < 0 ? '📉 ' : '→ '}
                  {selected.sl.toFixed(3)} / session
                </div>
              </InfoCard>
            )}

            {selected.salience != null && (
              <InfoCard>
                <Label>SALIENCE SCORE</Label>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa', marginTop: 4 }}>
                  {selected.salience.toFixed(3)}
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                  Priority in revision queue
                </div>
              </InfoCard>
            )}

            {selected.fl?.length > 0 && (
              <InfoCard bg="rgba(239,68,68,0.07)" border="rgba(239,68,68,0.2)">
                <Label color="#f87171">FLAGS</Label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {selected.fl.map(f => (
                    <span key={f} style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{f}</span>
                  ))}
                </div>
              </InfoCard>
            )}

            {selected.cluster && (
              <InfoCard>
                <Label>CLUSTER</Label>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginTop: 4 }}>{selected.cluster}</div>
              </InfoCard>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════
          SETTINGS BUTTON (top-right of canvas)
      ══════════════════════════════════════ */}
      <button
        onClick={() => setShowSettings(s => !s)}
        style={{
          position: 'absolute', top: 14, right: 14, zIndex: 50,
          background: showSettings ? 'rgba(124,58,237,0.25)' : 'rgba(8,9,18,0.85)',
          border: `1px solid ${showSettings ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.09)'}`,
          color: showSettings ? '#a78bfa' : '#94a3b8',
          borderRadius: 10, padding: '7px 14px', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, backdropFilter: 'blur(12px)',
          fontFamily: 'Inter, sans-serif',
        }}
      >⚙ Settings</button>

      {/* ══════════════════════════════════════
          SETTINGS MODAL
      ══════════════════════════════════════ */}
      {showSettings && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 60, width: 350,
          background: 'rgba(8,9,18,0.98)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
          padding: 24, color: '#e2e8f0',
          fontFamily: 'Inter, -apple-system, sans-serif',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>⚙️ Graph Settings</div>
            <button onClick={() => setShowSettings(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>
          {[
            { key: 'nodeSize',      label: 'Node Size',         min: 0.3, max: 3.0, step: 0.1, unit: '×' },
            { key: 'linkThickness', label: 'Link Opacity',      min: 0.1, max: 2.0, step: 0.1, unit: '×' },
            { key: 'repulsion',     label: 'Spread / Repulsion', min: 0.2, max: 3.0, step: 0.1, unit: '×' },
            { key: 'bloomIntensity',label: 'Bloom Glow',        min: 0.0, max: 4.0, step: 0.2, unit: '' },
          ].map(({ key, label, min, max, step, unit }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700 }}>{settings[key].toFixed(1)}{unit}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={settings[key]}
                onChange={e => handleSettingChange(key, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Auto-Rotate</span>
            <button
              onClick={() => handleSettingChange('autoRotate', !settings.autoRotate)}
              style={{
                background: settings.autoRotate ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${settings.autoRotate ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: settings.autoRotate ? '#a78bfa' : '#64748b',
                borderRadius: 8, padding: '5px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}
            >{settings.autoRotate ? 'ON' : 'OFF'}</button>
          </div>
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            style={{ display: 'block', width: '100%', marginTop: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 10, padding: '9px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >↺ Reset to Defaults</button>
        </div>
      )}

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
    </div>
  );
}

/* ── Tiny reusable sub-components ──────────────────────── */

function Section({ title, children, accent = '#64748b', bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.05)' }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: accent, textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ children, onClick, clickable, selected }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 6px', borderRadius: 7, marginBottom: 2,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: clickable ? 'pointer' : 'default',
        background: selected ? 'rgba(124,58,237,0.12)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >{children}</div>
  );
}

function Dot({ color, glow }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', background: color,
      boxShadow: glow ? `0 0 8px ${color}88` : 'none', flexShrink: 0,
    }} />
  );
}

function Chip({ color, children }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 18, textAlign: 'right' }}>
      {children}
    </span>
  );
}

function Label({ children, color = '#475569' }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color, textTransform: 'uppercase', marginBottom: 2 }}>
      {children}
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value * 100)}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

function InfoCard({ children, bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.06)' }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 14 }}>
      {children}
    </div>
  );
}

function LegendLine({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 20, height: 1.5, background: color, opacity: 0.8, borderRadius: 1 }} />
      <span>{label}</span>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span>{label}</span>
    </div>
  );
}
