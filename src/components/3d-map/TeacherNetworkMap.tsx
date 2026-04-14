"use client";

import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Sphere, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { BayesianTopicMastery, KnowledgeNode } from "@/types";

// --- MOCK DATA ---
const MOCK_NODES: (KnowledgeNode & { position: [number, number, number]; masteryData: BayesianTopicMastery })[] = [
  {
    id: "topic_1",
    type: "topic",
    label: "Kinematics",
    metadata: {},
    position: [0, 1, 0],
    masteryData: {
      topicId: "topic_1",
      mastery: 0.88,
      retentionStrength: 0.85,
      lastAssessedAt: new Date().toISOString(),
      attempts: 34,
      posteriorAlpha: 38,
      posteriorBeta: 5,
      posteriorVariance: 0.015,
      ciLower: 0.82,
      ciUpper: 0.94,
      uncertainty: 0.12,
      trajectorySlope: 0.02,
      struggleFlags: [],
      forgettingStrength: 0.8,
      recentScores: [0.8, 0.9, 0.85],
    },
  },
  {
    id: "topic_2",
    type: "topic",
    label: "Newton's Laws",
    metadata: {},
    position: [2, -0.5, 1],
    masteryData: {
      topicId: "topic_2",
      mastery: 0.45,
      retentionStrength: 0.5,
      lastAssessedAt: new Date().toISOString(),
      attempts: 22,
      posteriorAlpha: 10,
      posteriorBeta: 12,
      posteriorVariance: 0.09,
      ciLower: 0.25,
      ciUpper: 0.65,
      uncertainty: 0.40, // High uncertainty
      trajectorySlope: -0.08,
      struggleFlags: ["free_body_diagrams", "vector_resolution"],
      forgettingStrength: 0.4,
      recentScores: [0.5, 0.4, 0.45],
    },
  },
  {
    id: "topic_3",
    type: "topic",
    label: "Work & Energy",
    metadata: {},
    position: [-2, -1, -1],
    masteryData: {
      topicId: "topic_3",
      mastery: 0.72,
      retentionStrength: 0.7,
      lastAssessedAt: new Date().toISOString(),
      attempts: 18,
      posteriorAlpha: 18,
      posteriorBeta: 7,
      posteriorVariance: 0.04,
      ciLower: 0.60,
      ciUpper: 0.84,
      uncertainty: 0.24,
      trajectorySlope: 0.05,
      struggleFlags: [],
      forgettingStrength: 0.7,
      recentScores: [0.6, 0.7, 0.75],
    },
  },
];

const MOCK_EDGES = [
  { source: "topic_1", target: "topic_2" },
  { source: "topic_2", target: "topic_3" },
];

// --- SHADERS ---
const teacherVertexShader = `
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

const teacherFragmentShader = `
  uniform vec3 baseColor;
  uniform float uncertainty;
  uniform float time;
  uniform float isStruggling;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    float fresnel = dot(normal, viewDir);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.0);

    // Analytical stripes for teachers (sharper, more clinical)
    float stripe = step(0.5, fract((vUv.y + time * 0.1) * (10.0 + uncertainty * 40.0)));
    
    float alpha = 1.0 - (uncertainty * 0.4); 
    float stripeEffect = mix(1.0, 0.6 + stripe * 0.4, uncertainty);

    vec3 finalColor = mix(baseColor * stripeEffect, vec3(1.0), fresnel * 0.5);
    
    // Pulse effect if struggling
    if (isStruggling > 0.5) {
      float pulse = sin(time * 3.0) * 0.5 + 0.5;
      finalColor = mix(finalColor, vec3(0.96, 0.62, 0.04), pulse * 0.4); // Warning amber pulse
    }

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// --- COMPONENTS ---

interface NetworkNodeProps {
  node: typeof MOCK_NODES[0];
  isSelected: boolean;
  onClick: (node: typeof MOCK_NODES[0]) => void;
}

const NetworkNode: React.FC<NetworkNodeProps> = ({ node, isSelected, onClick }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const isStruggling = node.masteryData.struggleFlags && node.masteryData.struggleFlags.length > 0;

  const colorHex = useMemo(() => {
    if (node.masteryData.mastery >= 0.8) return "#22c55e"; // success
    if (node.masteryData.mastery >= 0.5) return "#702ae1"; // primary
    return "#ef4444"; // danger (clinical view for teachers)
  }, [node.masteryData.mastery]);

  const uniforms = useMemo(
    () => ({
      baseColor: { value: new THREE.Color(colorHex) },
      uncertainty: { value: node.masteryData.uncertainty },
      time: { value: 0.0 },
      isStruggling: { value: isStruggling ? 1.0 : 0.0 },
    }),
    [colorHex, node.masteryData.uncertainty, isStruggling]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
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
          vertexShader={teacherVertexShader}
          fragmentShader={teacherFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </Sphere>
      
      <Html position={[0, -0.8, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
        <div className={`transition-all duration-300 ${isSelected ? "opacity-100 scale-110" : "opacity-80 scale-100"}`}>
          <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg border border-outline-variant/15">
            {isStruggling && (
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            )}
            <span className="text-on-surface font-headline font-bold text-xs whitespace-nowrap">
              {node.label}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

const NetworkEdges: React.FC = () => {
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
            opacity={0.3}
            transparent
            lineWidth={2}
          />
        );
      })}
    </group>
  );
};

export default function TeacherNetworkMap() {
  const [selectedNode, setSelectedNode] = useState<typeof MOCK_NODES[0] | null>(MOCK_NODES[0]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-surface rounded-3xl overflow-hidden neumorphic-inset">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#EBEDF0"]} />
        <ambientLight intensity={0.6} />
        
        <NetworkEdges />
        {MOCK_NODES.map((node) => (
          <NetworkNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={setSelectedNode}
          />
        ))}

        <OrbitControls enablePan={true} minDistance={3} maxDistance={20} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={0.8} />
        </EffectComposer>
      </Canvas>

      {/* Teacher Analytical Overlay */}
      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="glass-strong p-6 rounded-3xl w-96 pointer-events-auto transition-all duration-500 neumorphic-flat">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  monitoring
                </span>
              </div>
              <div>
                <h2 className="font-headline text-lg font-extrabold text-on-surface">Diagnostic View</h2>
                <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black">
                  Student: Alex Chen
                </p>
              </div>
            </div>
          </div>

          {selectedNode ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="pb-4 border-b border-outline-variant/15">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
                  {selectedNode.label}
                </h3>
                <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black">
                  ID: {selectedNode.id} • {selectedNode.masteryData.attempts} Interactions
                </p>
              </div>

              {/* Clinical Data Container */}
              <div className="neumorphic-inset p-5 rounded-2xl space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black">
                      Probability Range (95% CI)
                    </span>
                    <span className="font-headline text-sm font-bold text-on-surface">
                      {Math.round(selectedNode.masteryData.ciLower * 100)}% - {Math.round(selectedNode.masteryData.ciUpper * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden relative mt-2">
                    <div 
                      className="absolute h-full bg-primary/30 rounded-full"
                      style={{ 
                        left: `${selectedNode.masteryData.ciLower * 100}%`, 
                        width: `${(selectedNode.masteryData.ciUpper - selectedNode.masteryData.ciLower) * 100}%` 
                      }}
                    />
                    <div 
                      className="absolute h-full w-1 bg-primary z-10"
                      style={{ left: `${selectedNode.masteryData.mastery * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-surface p-3 rounded-xl border border-outline-variant/15">
                    <span className="block font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black mb-1">
                      Beta Distribution
                    </span>
                    <span className="font-headline text-sm font-bold text-on-surface">
                      α: {selectedNode.masteryData.posteriorAlpha} | β: {selectedNode.masteryData.posteriorBeta}
                    </span>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-outline-variant/15">
                    <span className="block font-label text-[10px] tracking-widest text-on-surface-variant uppercase font-black mb-1">
                      CI Width
                    </span>
                    <span className={`font-headline text-sm font-bold ${selectedNode.masteryData.uncertainty > 0.25 ? 'text-warning' : 'text-success'}`}>
                      {(selectedNode.masteryData.uncertainty * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Struggle Detection Panel */}
              {selectedNode.masteryData.struggleFlags && selectedNode.masteryData.struggleFlags.length > 0 ? (
                <div className="neumorphic-flat bg-surface p-4 rounded-2xl border-l-4 border-warning">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-warning text-sm">warning</span>
                    <span className="font-label text-[10px] tracking-widest text-warning uppercase font-black">
                      Active Struggle Flags
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {selectedNode.masteryData.struggleFlags.map((flag, i) => (
                      <li key={i} className="text-xs font-medium text-on-surface bg-surface-container-low px-2 py-1 rounded-md inline-block mr-2">
                        {flag.replace('_', ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="neumorphic-inset p-4 rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                  <span className="text-sm font-medium text-on-surface-variant">No active struggle flags detected.</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 rounded-full neumorphic-flat text-primary font-black text-xs tracking-widest uppercase hover:scale-[0.98] transition-transform border border-primary/15">
                  View History
                </button>
                <button className="flex-1 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-xs tracking-widest uppercase hover:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(112,42,225,0.2)]">
                  Intervene
                </button>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-on-surface-variant text-sm font-medium">
              Select a node to view diagnostic data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}