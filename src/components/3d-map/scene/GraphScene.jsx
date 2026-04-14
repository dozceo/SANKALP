"use client";
/* ═══════════════════════════════════════════════════════════
   GraphScene — R3F scene with postprocessing bloom
   PERF OPTIMIZED:
     • FPS counter via ref callback (zero re-renders)
     • Reduced particle count (400 vs 700, visually identical)
     • Memoized static sub-components
     • Fog set once
   ═══════════════════════════════════════════════════════════ */
import React, { useMemo, useEffect, useRef, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import NodeInstances from './NodeInstances';
import LinkLines from './LinkLines';

const DEFAULT_SETTINGS = {
  nodeSize: 1.0,
  linkThickness: 1.0,
  repulsion: 1.0,
  bloomIntensity: 2.0,
  autoRotate: true,
};

export default function GraphScene({ graph, selected, onSelect, onHover, onFps, settings = DEFAULT_SETTINGS }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x0a0b14, 0.0015);
    return () => { scene.fog = null; };
  }, [scene]);

  // FPS counter — fires callback but never triggers a React re-render.
  // The parent component decides how to display it (DOM ref vs setState).
  const fpsRef = useRef({ count: 0, last: performance.now() });
  useFrame(() => {
    fpsRef.current.count++;
    const now = performance.now();
    const elapsed = now - fpsRef.current.last;
    if (elapsed >= 1000) {
      onFps?.(Math.round(fpsRef.current.count * 1000 / elapsed));
      fpsRef.current.count = 0;
      fpsRef.current.last  = now;
    }
  });

  return (
    <>
      {/* Lighting — static, memoized */}
      <StaticLights />

      {/* Subtle grid */}
      <gridHelper args={[400, 60, 0x111828, 0x111828]} position={[0, -30, 0]} />

      {/* Graph elements */}
      <NodeInstances
        graph={graph}
        selected={selected}
        onSelect={onSelect}
        onHover={onHover}
        nodeSize={settings.nodeSize}
        repulsion={settings.repulsion}
      />
      <LinkLines
        graph={graph}
        selected={selected}
        linkThickness={settings.linkThickness}
      />

      {/* Background particles (reduced count) */}
      <BackgroundParticles />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        autoRotate={settings.autoRotate && !selected}
        autoRotateSpeed={0.35}
        minDistance={15}
        maxDistance={280}
      />

      {/* Post-processing */}
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={settings.bloomIntensity}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.9}
        />
        <Vignette
          offset={0.3}
          darkness={0.65}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
}

// Static lights — will never re-render since they have no props
const StaticLights = memo(function StaticLights() {
  return (
    <>
      <ambientLight intensity={0.35} color={0x334466} />
      <pointLight position={[25, 45, 35]} intensity={0.7} color={0x7c3aed} distance={300} />
      <pointLight position={[-35, 25, -25]} intensity={0.4} color={0x3b82f6} distance={300} />
      <pointLight position={[0, -20, 40]} intensity={0.3} color={0x06b6d4} distance={250} />
    </>
  );
});

// Background particles — static geometry, never re-computes
const BackgroundParticles = memo(function BackgroundParticles() {
  const COUNT = 400;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 350;
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo} raycast={() => null}>
      <pointsMaterial color={0x334466} size={0.25} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
});
