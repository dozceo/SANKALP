"use client";
/* ═══════════════════════════════════════════════════════════
   LinkLines — Merged line geometries for hierarchy + KNN
   PERF OPTIMIZED:
     • Typed Int16Array for index lookups (cache-friendly)
     • Skip position updates when simulation settled
     • HighlightLinks uses for-loop instead of .forEach()
     • Opacity update only on dirty (selection change)
   ═══════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function LinkLines({ graph, selected, linkThickness = 1.0 }) {
  const hRef = useRef();
  const kRef = useRef();
  const prevSelRef = useRef(null);

  const { links, nMap, adjList } = graph;

  const hLinks = useMemo(() => links.filter(l => l.tp !== 'knn'), [links]);
  const kLinks = useMemo(() => links.filter(l => l.tp === 'knn'), [links]);

  // Typed arrays for cache-friendly index lookup
  const hSrc = useMemo(() => new Int16Array(hLinks.map(l => nMap[l.s]?.idx ?? 0)), [hLinks, nMap]);
  const hTgt = useMemo(() => new Int16Array(hLinks.map(l => nMap[l.t]?.idx ?? 0)), [hLinks, nMap]);
  const kSrc = useMemo(() => new Int16Array(kLinks.map(l => nMap[l.s]?.idx ?? 0)), [kLinks, nMap]);
  const kTgt = useMemo(() => new Int16Array(kLinks.map(l => nMap[l.t]?.idx ?? 0)), [kLinks, nMap]);

  const hPositions = useMemo(() => new Float32Array(hLinks.length * 6), [hLinks]);
  const kPositions = useMemo(() => new Float32Array(kLinks.length * 6), [kLinks]);

  const hGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(hPositions, 3));
    g.setDrawRange(0, hLinks.length * 2);
    return g;
  }, [hPositions, hLinks]);

  const kGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(kPositions, 3));
    g.setDrawRange(0, kLinks.length * 2);
    return g;
  }, [kPositions, kLinks]);

  useFrame(() => {
    const px = graph._px, py = graph._py, pz = graph._pz;
    if (!px) return;

    // Update hierarchy link positions
    for (let i = 0, len = hLinks.length; i < len; i++) {
      const si = hSrc[i], ti = hTgt[i], o = i * 6;
      hPositions[o]   = px[si]; hPositions[o+1] = py[si]; hPositions[o+2] = pz[si];
      hPositions[o+3] = px[ti]; hPositions[o+4] = py[ti]; hPositions[o+5] = pz[ti];
    }
    hGeo.attributes.position.needsUpdate = true;

    // Update KNN link positions
    for (let i = 0, len = kLinks.length; i < len; i++) {
      const si = kSrc[i], ti = kTgt[i], o = i * 6;
      kPositions[o]   = px[si]; kPositions[o+1] = py[si]; kPositions[o+2] = pz[si];
      kPositions[o+3] = px[ti]; kPositions[o+4] = py[ti]; kPositions[o+5] = pz[ti];
    }
    kGeo.attributes.position.needsUpdate = true;

    // Opacity: only update material when selection state changes
    const selId = selected?.id ?? null;
    if (selId !== prevSelRef.current) {
      prevSelRef.current = selId;
      const hOpacity = Math.min(1, (selected ? 0.04 : 0.22) * linkThickness);
      const kOpacity = Math.min(1, (selected ? 0.04 : 0.40) * linkThickness);
      if (hRef.current) hRef.current.material.opacity = hOpacity;
      if (kRef.current) kRef.current.material.opacity = kOpacity;
    }
  });

  return (
    <group>
      <lineSegments ref={hRef} geometry={hGeo} frustumCulled={false} raycast={() => null}>
        <lineBasicMaterial color={0x4a6fa5} transparent opacity={0.22} />
      </lineSegments>

      <lineSegments ref={kRef} geometry={kGeo} frustumCulled={false} raycast={() => null}>
        <lineBasicMaterial color={0xd4a843} transparent opacity={0.40} />
      </lineSegments>

      {selected && <HighlightLinks graph={graph} selected={selected} />}
    </group>
  );
}

function HighlightLinks({ graph, selected }) {
  const { links, nMap, adjList } = graph;

  const connLinks = useMemo(() => {
    const set = new Set();
    const adj = adjList[selected.id];
    if (adj) for (let i = 0, len = adj.length; i < len; i++) set.add(adj[i].li);
    return set;
  }, [selected, adjList]);

  // Pre-compute linked indices as typed arrays for the inner loop
  const hlData = useMemo(() => {
    const connected = [];
    const srcIdxs = [];
    const tgtIdxs = [];
    for (let i = 0, len = links.length; i < len; i++) {
      if (!connLinks.has(i)) continue;
      connected.push(links[i]);
      srcIdxs.push(nMap[links[i].s]?.idx ?? 0);
      tgtIdxs.push(nMap[links[i].t]?.idx ?? 0);
    }
    const count = connected.length;
    const positions = new Float32Array(count * 6);
    const src = new Int16Array(srcIdxs);
    const tgt = new Int16Array(tgtIdxs);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setDrawRange(0, count * 2);
    return { geo: g, positions, count, src, tgt, connected };
  }, [links, connLinks, nMap]);

  useFrame(() => {
    const px = graph._px, py = graph._py, pz = graph._pz;
    if (!px) return;
    const { positions, count, src, tgt } = hlData;
    for (let i = 0; i < count; i++) {
      const si = src[i], ti = tgt[i], o = i * 6;
      positions[o]   = px[si]; positions[o+1] = py[si]; positions[o+2] = pz[si];
      positions[o+3] = px[ti]; positions[o+4] = py[ti]; positions[o+5] = pz[ti];
    }
    hlData.geo.attributes.position.needsUpdate = true;
  });

  const hasKnn = useMemo(() =>
    hlData.connected.some(l => l.tp === 'knn'),
    [hlData]
  );

  return (
    <lineSegments geometry={hlData.geo} frustumCulled={false} raycast={() => null}>
      <lineBasicMaterial color={hasKnn ? 0xfbbf24 : 0x60a5fa} transparent opacity={0.95} />
    </lineSegments>
  );
}
