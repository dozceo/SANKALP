"use client";
/* ═══════════════════════════════════════════════════════════
   SANKALP Brain Map — Premium 3D Preview
   App Root: Canvas + UI Overlays
   ═══════════════════════════════════════════════════════════ */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import GraphScene from './scene/GraphScene';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
import StatsPanel from './ui/StatsPanel';
import MiniCards from './ui/MiniCards';
import Legend from './ui/Legend';
import Tooltip from './ui/Tooltip';
import { buildGraph, COL_HEX } from './data/fixtures';

export default function App() {
  const graph = useMemo(() => buildGraph(), []);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState(0);

  const handleHover = useCallback((nd, x, y) => {
    setHovered(nd);
    setMousePos({ x, y });
  }, []);

  return (
    <div className="app">
      {/* ── 3D Canvas ─────────────────────────────────── */}
      <Canvas
        className="canvas-3d"
        camera={{ position: [0, 25, 80], fov: 55, near: 0.1, far: 2000 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
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
          onFps={setFps}
        />
      </Canvas>

      {/* ── UI Overlays ───────────────────────────────── */}
      <Header />
      <Sidebar />
      <StatsPanel stats={graph.stats} />
      <MiniCards stats={graph.stats} />
      <Legend />
      <Tooltip node={hovered} x={mousePos.x} y={mousePos.y} />

      <div className="perf-counter">{fps} fps · {graph.nodes.length} nodes · {graph.links.length} edges</div>
    </div>
  );
}
