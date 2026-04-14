"use client";
/* ═══════════════════════════════════════════════════════════
   NodeInstances — InstancedMesh with native R3F pointer events
   PERF OPTIMIZED:
     • Dirty-flag color updates (skip when selection/hover unchanged)
     • Pre-allocated Set for connNodes (no per-frame GC)
     • Module-level reusable Vector3 for hover projection
     • Reduced glow geometry segments (invisible difference)
     • Matrix updates skipped for static nodes when sim settled
   ═══════════════════════════════════════════════════════════ */
import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COL } from '../data/fixtures';

// Module-level reusables — zero per-frame allocation
const _dummy     = new THREE.Object3D();
const _tempColor = new THREE.Color();
const _projVec   = new THREE.Vector3();

export default function NodeInstances({
  graph, selected, onSelect, onHover,
  nodeSize = 1.0, repulsion = 1.0
}) {
  const meshRef = useRef();
  const glowRef = useRef();
  const { camera } = useThree();

  const { nodes, adjList, nMap } = graph;
  const N = nodes.length;

  // ── Typed arrays ──────────────────────────────────────────
  const px = useMemo(() => new Float32Array(N), [N]);
  const py = useMemo(() => new Float32Array(N), [N]);
  const pz = useMemo(() => new Float32Array(N), [N]);
  const vx = useMemo(() => new Float32Array(N), [N]);
  const vy = useMemo(() => new Float32Array(N), [N]);
  const vz = useMemo(() => new Float32Array(N), [N]);

  const hLinks = useMemo(() => graph.links.filter(l => l.tp !== 'knn'), [graph]);
  const kLinks = useMemo(() => graph.links.filter(l => l.tp === 'knn'),  [graph]);
  const hSrc = useMemo(() => new Int16Array(hLinks.map(l => nMap[l.s]?.idx ?? 0)), [hLinks, nMap]);
  const hTgt = useMemo(() => new Int16Array(hLinks.map(l => nMap[l.t]?.idx ?? 0)), [hLinks, nMap]);
  const kSrc = useMemo(() => new Int16Array(kLinks.map(l => nMap[l.s]?.idx ?? 0)), [kLinks, nMap]);
  const kTgt = useMemo(() => new Int16Array(kLinks.map(l => nMap[l.t]?.idx ?? 0)), [kLinks, nMap]);

  // Pre-compute indices of pulsing nodes (weakness / strength) so
  // we can skip them in the "settled, nothing changed" fast path.
  const pulsingIdxs = useMemo(() => {
    const arr = [];
    nodes.forEach((nd, i) => { if (nd.t === 'weakness' || nd.t === 'strength') arr.push(i); });
    return arr;
  }, [nodes]);

  // ── Initial positions (wide spread) ───────────────────────
  useEffect(() => {
    nodes.forEach((nd, i) => {
      const ang  = (i / N) * Math.PI * 2 + Math.random() * 0.5;
      const tier =
        nd.t === 'student' ? 0 :
        nd.t === 'subject' ? 30 :
        nd.t === 'chapter' ? 60 :
        80 + Math.random() * 35;
      px[i] = Math.cos(ang) * tier + (Math.random() - 0.5) * 20;
      py[i] = (Math.random() - 0.5) * 38;
      pz[i] = Math.sin(ang) * tier + (Math.random() - 0.5) * 20;
    });
  }, [nodes, N, px, py, pz]);

  // ── Seed instance colors ──────────────────────────────────
  useEffect(() => {
    if (!meshRef.current || !glowRef.current) return;
    for (let i = 0; i < N; i++) {
      _tempColor.copy(COL[nodes[i].t] || COL.topic);
      meshRef.current.setColorAt(i, _tempColor);
      _tempColor.multiplyScalar(0.4);
      glowRef.current.setColorAt(i, _tempColor);
    }
    meshRef.current.instanceColor.needsUpdate = true;
    glowRef.current.instanceColor.needsUpdate = true;
  }, [N, nodes]);

  // ── Dirty-tracking refs ───────────────────────────────────
  const hoveredIdx = useRef(-1);
  const simRef     = useRef({ alpha: 1.0 });

  // Pre-allocated connected-nodes set — cleared each frame, never recreated
  const connNodesSet = useMemo(() => new Set(), []);

  // Track previous selection/hover to skip redundant color loops
  const prevSelId   = useRef(null);
  const prevHoverIdx = useRef(-1);

  // ── useFrame: simulation + matrix/color ───────────────────
  useFrame((state) => {
    const mesh = meshRef.current, glow = glowRef.current;
    if (!mesh || !glow) return;

    // ─── Physics ────────────────────────────────────
    const sim = simRef.current;
    const simActive = sim.alpha > 0.001;
    if (simActive) {
      sim.alpha *= 0.993;
      const alpha    = sim.alpha * 0.18;
      const friction = 0.86;
      const rep      = 220 * repulsion;

      // O(N²) repulsion
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = px[j] - px[i], dy = py[j] - py[i], dz = pz[j] - pz[i];
          const d2 = dx * dx + dy * dy + dz * dz || 0.01;
          const d  = Math.sqrt(d2);
          const f  = rep / d2;
          const fx = dx / d * f, fy = dy / d * f, fz = dz / d * f;
          vx[i] -= fx * alpha; vy[i] -= fy * alpha; vz[i] -= fz * alpha;
          vx[j] += fx * alpha; vy[j] += fy * alpha; vz[j] += fz * alpha;
        }
      }

      const hRest = 22 * (1 / repulsion + 0.5);
      for (let i = 0, len = hLinks.length; i < len; i++) {
        const si = hSrc[i], ti = hTgt[i];
        const dx = px[ti] - px[si], dy = py[ti] - py[si], dz = pz[ti] - pz[si];
        const d  = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        const f  = (d - hRest) * 0.018;
        const fx = dx / d * f, fy = dy / d * f, fz = dz / d * f;
        vx[si] += fx * alpha; vy[si] += fy * alpha; vz[si] += fz * alpha;
        vx[ti] -= fx * alpha; vy[ti] -= fy * alpha; vz[ti] -= fz * alpha;
      }

      const kRest = 55 * (1 / repulsion + 0.3);
      for (let i = 0, len = kLinks.length; i < len; i++) {
        const si = kSrc[i], ti = kTgt[i];
        const dx = px[ti] - px[si], dy = py[ti] - py[si], dz = pz[ti] - pz[si];
        const d  = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        const f  = (d - kRest) * 0.0015;
        const fx = dx / d * f, fy = dy / d * f, fz = dz / d * f;
        vx[si] += fx * alpha; vy[si] += fy * alpha; vz[si] += fz * alpha;
        vx[ti] -= fx * alpha; vy[ti] -= fy * alpha; vz[ti] -= fz * alpha;
      }

      for (let i = 0; i < N; i++) {
        vx[i] = (vx[i] - px[i] * 0.0005) * friction;
        vy[i] = (vy[i] - py[i] * 0.0005) * friction;
        vz[i] = (vz[i] - pz[i] * 0.0005) * friction;
        px[i] += vx[i]; py[i] += vy[i]; pz[i] += vz[i];
      }
    }

    // ─── Dirty detection ────────────────────────────
    const selId  = selected?.id ?? null;
    const hovIdx = hoveredIdx.current;
    const colorDirty = selId !== prevSelId.current || hovIdx !== prevHoverIdx.current;
    prevSelId.current   = selId;
    prevHoverIdx.current = hovIdx;

    // Build connected set (only when selected)
    connNodesSet.clear();
    if (selected) {
      connNodesSet.add(selected.id);
      const adj = adjList[selected.id];
      if (adj) for (let k = 0, len = adj.length; k < len; k++) connNodesSet.add(adj[k].nb);
    }

    // ─── Matrix + color update ──────────────────────
    // If simulation settled AND colors unchanged AND no pulsing nodes,
    // we could skip entirely. But pulsing means we always need at
    // least the pulsing subset. So: always update matrices if sim
    // is active; otherwise update only pulsing nodes.

    const time = state.clock.elapsedTime;
    const needFullMatrix = simActive;

    if (needFullMatrix) {
      // Full update: all N nodes
      for (let i = 0; i < N; i++) {
        const nd = nodes[i];
        let scale = nd.r * nodeSize;
        if (selected) {
          if (nd.id === selId) scale *= 2.2;
          else if (connNodesSet.has(nd.id)) scale *= 1.5;
          else scale *= 0.3;
        } else if (hovIdx === i) {
          scale *= 1.7;
        }
        if (nd.t === 'weakness') scale += Math.sin(time * 3.5 + i) * 0.12 * nodeSize;
        if (nd.t === 'strength') scale += Math.sin(time * 2.0 + i) * 0.08 * nodeSize;

        _dummy.position.set(px[i], py[i], pz[i]);
        _dummy.scale.setScalar(scale);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);

        _dummy.scale.setScalar(scale * 1.8);
        _dummy.updateMatrix();
        glow.setMatrixAt(i, _dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      glow.instanceMatrix.needsUpdate = true;
    } else if (pulsingIdxs.length > 0) {
      // Settled: only update matrices for pulsing nodes
      for (let k = 0, len = pulsingIdxs.length; k < len; k++) {
        const i  = pulsingIdxs[k];
        const nd = nodes[i];
        let scale = nd.r * nodeSize;
        if (selected) {
          if (nd.id === selId) scale *= 2.2;
          else if (connNodesSet.has(nd.id)) scale *= 1.5;
          else scale *= 0.3;
        } else if (hovIdx === i) {
          scale *= 1.7;
        }
        if (nd.t === 'weakness') scale += Math.sin(time * 3.5 + i) * 0.12 * nodeSize;
        if (nd.t === 'strength') scale += Math.sin(time * 2.0 + i) * 0.08 * nodeSize;

        _dummy.position.set(px[i], py[i], pz[i]);
        _dummy.scale.setScalar(scale);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);

        _dummy.scale.setScalar(scale * 1.8);
        _dummy.updateMatrix();
        glow.setMatrixAt(i, _dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      glow.instanceMatrix.needsUpdate = true;
    }

    // ─── Color update (only when dirty) ─────────────
    if (colorDirty) {
      for (let i = 0; i < N; i++) {
        const nd      = nodes[i];
        const baseCol = COL[nd.t] || COL.topic;

        if (selected) {
          if (nd.id === selId)              _tempColor.copy(baseCol).multiplyScalar(4.5);
          else if (connNodesSet.has(nd.id)) _tempColor.copy(baseCol).multiplyScalar(2.5);
          else                              _tempColor.setRGB(0.04, 0.04, 0.08);
        } else {
          _tempColor.copy(baseCol).multiplyScalar(hovIdx === i ? 3.0 : 1.6);
        }
        mesh.setColorAt(i, _tempColor);

        if (selected && !connNodesSet.has(nd.id)) _tempColor.setRGB(0, 0, 0);
        else _tempColor.copy(baseCol).multiplyScalar(1.2);
        glow.setColorAt(i, _tempColor);
      }
      mesh.instanceColor.needsUpdate = true;
      glow.instanceColor.needsUpdate = true;
    }

    // Publish positions for LinkLines
    graph._px = px;
    graph._py = py;
    graph._pz = pz;
  });

  // ── Pointer events (zero per-event allocation) ────────────
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    const idx = e.instanceId;
    if (idx == null) return;
    hoveredIdx.current = idx;
    document.body.style.cursor = 'pointer';
    const nd = nodes[idx];
    _projVec.set(px[idx], py[idx], pz[idx]);
    _projVec.project(camera);
    const x = (_projVec.x *  0.5 + 0.5) * window.innerWidth;
    const y = (_projVec.y * -0.5 + 0.5) * window.innerHeight;
    onHover(nd, x + 20, y - 10);
  }, [nodes, camera, onHover, px, py, pz]);

  const handlePointerOut = useCallback(() => {
    hoveredIdx.current = -1;
    document.body.style.cursor = 'grab';
    onHover(null, 0, 0);
  }, [onHover]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const idx = e.instanceId;
    if (idx == null) return;
    const nd = nodes[idx];
    onSelect(selected?.id === nd.id ? null : nd);
  }, [nodes, selected, onSelect]);

  const handleMissedClick = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  return (
    <group onPointerMissed={handleMissedClick}>
      {/* Glow halos — reduced geometry (8 segments visually identical for blurry additive blobs) */}
      <instancedMesh ref={glowRef} args={[null, null, N]} frustumCulled={false} raycast={() => null}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial
          transparent opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Solid nodes */}
      <instancedMesh
        ref={meshRef}
        args={[null, null, N]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
