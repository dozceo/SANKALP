import React from "react";

/**
 * BrainMapSkeleton
 * 
 * Satisfies the "No loading walls" and "Design System" mandates.
 * Uses Neumorphic depth, Glassmorphism, and strictly avoids 1px solid borders.
 * Provides a progressive reveal experience while the Bayesian graph data is fetched.
 */
export default function BrainMapSkeleton(): React.ReactElement {
  return (
    <div 
      className="w-full h-full min-h-[600px] rounded-3xl neumorphic-inset bg-surface p-8 flex flex-col gap-10 relative overflow-hidden"
      role="status"
      aria-label="Loading Brain Map visualization"
    >
      {/* Glassmorphism Header */}
      <div className="absolute top-8 left-8 z-10 glass px-6 py-4 rounded-2xl flex items-center gap-4 w-80">
        <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center animate-pulse bg-surface-container-high">
          <span 
            className="material-symbols-outlined text-primary/50 text-xl" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-3/4 bg-surface-container-highest rounded-full animate-pulse" />
          <div className="h-3 w-1/2 bg-surface-container-highest rounded-full animate-pulse" />
        </div>
      </div>

      {/* Floating Node Skeletons (Representing Bayesian Nodes) */}
      <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full neumorphic-flat bg-surface-container-low animate-pulse flex items-center justify-center">
        <div className="w-16 h-16 rounded-full neumorphic-inset opacity-50" />
      </div>
      
      <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full neumorphic-flat bg-surface-container-low animate-pulse flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <div className="w-28 h-28 rounded-full neumorphic-inset opacity-50" />
      </div>
      
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full neumorphic-flat bg-surface-container-low animate-pulse flex items-center justify-center">
        <div className="w-20 h-20 rounded-full neumorphic-inset opacity-50" />
      </div>

      {/* Connecting Ghost Lines (SVG) - Adheres to No-Line Rule by using ghost opacity */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <line 
          x1="25%" y1="33%" 
          x2="50%" y2="50%" 
          stroke="var(--color-outline-variant)" 
          strokeWidth="2" 
          strokeDasharray="6 6" 
          className="animate-pulse" 
        />
        <line 
          x1="50%" y1="50%" 
          x2="75%" y2="75%" 
          stroke="var(--color-outline-variant)" 
          strokeWidth="2" 
          strokeDasharray="6 6" 
          className="animate-pulse" 
        />
      </svg>

      {/* Bottom Legend Skeleton */}
      <div className="absolute bottom-8 left-8 z-10 glass px-6 py-4 rounded-2xl flex gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-surface-container-highest animate-pulse" />
            <div className="h-2 w-16 bg-surface-container-highest rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}