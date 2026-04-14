"use client";

import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Sphere, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { BayesianTopicMastery, KnowledgeNode } from "@/types";

// --- MOCK DATA ---
// In a real environment, this would be passed via props or a global store.
const MOCK_NODES: (KnowledgeNode & { position: [number, number, number]; masteryData: BayesianTopicMastery })[] = [
  {
    id: "topic_1",
    type: "topic",
    label: "Quantum States",
    metadata: {},
    position: [0, 0, 0],
    masteryData: {
      topicId: "topic_1",
      mastery: 0.85,
      retentionStrength: 0.9,
      lastAssessedAt: new Date().toISOString(),
      attempts: 48,
      posteriorAlpha: 42,
      posteriorBeta: 6,
      posteriorVariance: 0.02,
      ciLower: 0.78,
      ciUpper: 0.91,
      uncertainty: 0.13,
      trajectorySlope: 0.05,
      struggleFlags: [],
      forgettingStrength: 0.8,
      recentScores: [0.8, 0.9, 0.85, 0.9],
    },
  },
  {
    id: "topic_2",
    type: "topic",
    label: "Wave Functions",
    metadata: {},
    position: [2.5, 1.5, -1],
    masteryData: {
      topicId: "topic_2",
      mastery: 0.55,
      retentionStrength: 0.6,
      lastAssessedAt: new Date().toISOString(),
      attempts: 20,
      posteriorAlpha: 12,
      posteriorBeta: 10,
      posteriorVariance: 0.08,
      ciLower: 0.35,
      ciUpper: 0.75,
      uncertainty: 0.40, // High uncertainty
      trajectorySlope: -0.02,
      struggleFlags: ["concept_confusion"],
      forgettingStrength: 0.5,
      recentScores: [0.6, 0.4, 0.5, 0.7],
    },
  },
  {
    id: "topic_3",
    type: "topic",
    label: "Schrödinger Eq",
    metadata: {},
    position: [-2, -1, 2],
    masteryData: {
      topicId: "topic_3",
      mastery: 0.30,
      retentionStrength: 0.4,
      lastAssessedAt: new Date().toISOString(),
      attempts: 15,
      posteriorAlpha: 5,
      posteriorBeta: 12,
      posteriorVariance: 0.05,
      ciLower: 0.15,
      ciUpper: 0.45,
      uncertainty: 0.30,
      trajectorySlope: 0.1,
      struggleFlags: ["math_prerequisite"],
      forgettingStrength: 0.4,
      recentScores: [0.2, 0.3, 0.25, 0.4],
    },
  },
  {
    id: "topic_4",
    type: "topic",
    label: "Probability Density",
    metadata: {},
    position: [1.5, -2.5, 1],
    masteryData: {
      topicId: "topic_4",
      mastery: 0.92,
      retentionStrength: 0.95,
      lastAssessedAt: new Date().toISOString(),
      attempts: 60,
      posteriorAlpha: 55,
      posteriorBeta: 4,
      posteriorVariance: 0.01,
      ciLower: 0.88,
      ciUpper: 0.95,
      uncertainty: 0.07,
      trajectorySlope: 0.01,
      struggleFlags: [],
      forgettingStrength: 0.9,
      recentScores: [0.9, 0.95, 0.9, 1.0],
    },
  },
];

const MOCK_EDGES = [
  { source: "topic_1", target: "topic_2" },
  { source: "topic_1", target: "topic_3" },
  { source: "topic_2", target: "topic_4" },
];

// --- SHADERS ---
// Custom shader to render uncertainty as animated stripes and opacity modulation
const uncertaintyVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const uncertaintyFragmentShader = `
  uniform vec3 baseColor;
  uniform float uncertainty;
  uniform float time;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel rim lighting for glass-like 3D feel
    float fresnel = dot(normal, viewDir);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0);

    // Animated stripes: frequency and intensity scale with uncertainty
    float stripe = sin((vUv.y + time * 0.2) * (20.0 + uncertainty * 30.0));
    stripe = smoothstep(0.4, 0.6, stripe);

    // High uncertainty = more prominent stripes, lower overall alpha
    float alpha = 1.0 - (uncertainty * 0.5); 
    float stripeEffect = mix(1.0, 0.4 + stripe * 0.6, uncertainty);

    vec3 finalColor = mix(baseColor * stripeEffect, vec3(1.0), fresnel * 0.7);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// --- COMPONENTS ---

interface BrainNodeProps {
  node: typeof MOCK_NODES[0];
  isSelected: boolean;
  onClick: (node: typeof MOCK_NODES[0]) => void;
}

const BrainNode: React.FC<BrainNodeProps> = ({ node, isSelected, onClick }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Determine color based on mastery mean (for base color only)
  const colorHex = useMemo(() => {
    if (node.masteryData.mastery >= 0.8) return "#22c55e"; // success
    if (node.masteryData.mastery >= 0.5) return "#702ae1"; // primary
    return "#f59e0b"; // warning (trauma-informed: no red for struggle)
  }, [node.masteryData.mastery]);

  const uniforms = useMemo(
    () => ({
      baseColor: { value: new THREE.Color(colorHex) },
      uncertainty: { value: node.masteryData.uncertainty },
      time: { value: 0.0 },
    }),
    [colorHex, node.masteryData.uncertainty]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + node.position[0]) * 0.1;
    }
  });

  return (
    <group position={node.position}>
      <Sphere
        ref={meshRef}
        args={[isSelected ? 0.6 : 0.4, 64, 64]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <shaderMaterial
          ref={materialRef}
          vertexShader={uncertaintyVertexShader}
          fragmentShader={uncertaintyFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </Sphere>
      
      {/* Label Overlay */}
      <Html position={[0, -0.8, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
        <div className={`transition-all duration-300 ${isSelected ? "opacity-100 scale-110" : "opacity-60 scale-100"}`}>
          <div className="glass px-4 py-1.5 rounded-full flex flex-col items-center shadow-lg">
            <span className="text-on-surface font-headline font-bold text-sm whitespace-nowrap">
              {node.label}
            </span>
            <span className="text-on-surface-variant font-label text-[10px] tracking-widest uppercase font-black">
              {Math.round(node.masteryData.ciLower * 100)}% - {Math.round(node.masteryData.ciUpper * 100)}%
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

const BrainEdges: React.FC = () => {
  return (
    <group>
      {MOCK_EDGES.map((edge, idx) => {
        const sourceNode = MOCK_NODES.find((n) => n.id === edge.source);
        const targetNode = MOCK_NODES.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;

        return (
          <Line
            key={idx}
            points={[sourceNode.position, targetNode.position]}
            color="#abadaf"
            opacity={0.2}
            transparent
            lineWidth={1.5}
          />
        );
      })}
    </group>
  );
};

export default function StudentBrainMap() {
  const [selectedNode, setSelectedNode] = useState<typeof MOCK_NODES[0] | null>(MOCK_NODES[0]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-surface rounded-3xl overflow-hidden neumorphic-inset">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#EBEDF0"]} />
        <ambientLight intensity={0.5} />
        
        <BrainEdges />
        {MOCK_NODES.map((node) => (
          <BrainNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={setSelectedNode}
          />
        ))}

        <OrbitControls enablePan={false} minDistance={3} maxDistance={15} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.2} />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay - Cognitive Architect Design System */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="glass-strong p-6 rounded-3xl max-w-sm pointer-events-auto transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div>
              <h2 className="font-headline text-xl font-extrabold text-on-surface">Brain Map™</h2>
              <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black">
                Live Cognitive State
              </p>
            </div>
          </div>

          {selectedNode ? (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">
                  {selectedNode.label}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                    Beta(α: {selectedNode.masteryData.posteriorAlpha}, β: {selectedNode.masteryData.posteriorBeta})
                  </span>
                </div>
              </div>

              <div className="neumorphic-inset p-5 rounded-2xl space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black">
                      Mastery Range (95% CI)
                    </span>
                    <span className="font-headline text-sm font-bold text-primary">
                      {Math.round(selectedNode.masteryData.ciLower * 100)}% - {Math.round(selectedNode.masteryData.ciUpper * 100)}%
                    </span>
                  </div>
                  {/* Neumorphic Progress Track */}
                  <div className="w-full h-3 neumorphic-pressed rounded-full overflow-hidden relative">
                    {/* CI Band Visualization */}
                    <div 
                      className="absolute h-full bg-gradient-to-r from-primary-container to-primary opacity-50 rounded-full"
                      style={{ 
                        left: `${selectedNode.masteryData.ciLower * 100}%`, 
                        width: `${(selectedNode.masteryData.ciUpper - selectedNode.masteryData.ciLower) * 100}%` 
                      }}
                    />
                    {/* Mean Indicator */}
                    <div 
                      className="absolute h-full w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10"
                      style={{ left: `${selectedNode.masteryData.mastery * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black mb-1">
                      Uncertainty
                    </span>
                    <span className="font-headline text-lg font-bold text-on-surface">
                      {(selectedNode.masteryData.uncertainty * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="block font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black mb-1">
                      Trajectory
                    </span>
                    <span className={`font-headline text-lg font-bold flex items-center gap-1 ${selectedNode.masteryData.trajectorySlope >= 0 ? 'text-success' : 'text-warning'}`}>
                      {selectedNode.masteryData.trajectorySlope >= 0 ? '↑' : '↓'} 
                      {Math.abs(selectedNode.masteryData.trajectorySlope * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {selectedNode.masteryData.struggleFlags && selectedNode.masteryData.struggleFlags.length > 0 && (
                <div className="bg-warning/10 p-4 rounded-2xl border border-warning/20">
                  <span className="font-label text-[10px] tracking-widest text-warning uppercase font-black block mb-2">
                    Development Area
                  </span>
                  <p className="text-sm text-on-surface font-medium">
                    We're noticing some friction here. Let's review the core concepts together.
                  </p>
                </div>
              )}

              <button className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest uppercase hover:scale-[0.98] transition-transform shadow-[0_8px_16px_rgba(112,42,225,0.2)]">
                Deep Work Session
              </button>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm font-medium">
              Select a node to view cognitive state
            </div>
          )}
        </div>
      </div>
    </div>
  );
}