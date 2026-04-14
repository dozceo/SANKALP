"use client";
/* ═══════════════════════════════════════════════════════════
   ClusterLabels — HTML-based billboard labels near cluster centroids
   Uses drei Html instead of Text to avoid woff2 font crashes
   ═══════════════════════════════════════════════════════════ */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const LABEL_MAP = {
  student:  'STUDENTS',
  subject:  'SUBJECTS',
  topic:    'TOPICS',
  weakness: 'WEAKNESS',
  strength: 'STRENGTH',
};

const LABEL_COLORS = {
  STUDENTS:  '#a78bfa',
  SUBJECTS:  '#60a5fa',
  TOPICS:    '#94a3b8',
  WEAKNESS:  '#f87171',
  STRENGTH:  '#4ade80',
};

export default function ClusterLabels({ graph }) {
  const { nodes } = graph;
  const groupRefs = useRef({});

  // Determine which labels to show
  const labels = useMemo(() => {
    const seen = new Set();
    return nodes
      .filter(nd => {
        const label = LABEL_MAP[nd.t];
        if (!label || seen.has(label)) return false;
        seen.add(label);
        return true;
      })
      .map(nd => ({ label: LABEL_MAP[nd.t], color: LABEL_COLORS[LABEL_MAP[nd.t]] }));
  }, [nodes]);

  useFrame(() => {
    const px = graph._px, py = graph._py, pz = graph._pz;
    if (!px) return;

    const centroids = {};
    const counts = {};

    nodes.forEach((nd, i) => {
      const label = LABEL_MAP[nd.t];
      if (!label) return;
      if (!centroids[label]) { centroids[label] = [0, 0, 0]; counts[label] = 0; }
      centroids[label][0] += px[i];
      centroids[label][1] += py[i];
      centroids[label][2] += pz[i];
      counts[label]++;
    });

    for (const [label, pos] of Object.entries(centroids)) {
      const c = counts[label];
      const ref = groupRefs.current[label];
      if (ref) {
        ref.position.set(pos[0] / c, pos[1] / c + 7, pos[2] / c);
      }
    }
  });

  return (
    <group>
      {labels.map(({ label, color }) => (
        <group key={label} ref={el => { if (el) groupRefs.current[label] = el; }}>
          <Html center distanceFactor={60} style={{ pointerEvents: 'none' }}>
            <div style={{
              fontSize: 14,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              color,
              textShadow: `0 0 20px ${color}88, 0 0 40px ${color}44`,
              letterSpacing: '3px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}>
              {label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

