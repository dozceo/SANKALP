"use client";

import React, { useState, useEffect } from "react";

// --- Types ---
interface SubjectMastery {
  id: string;
  name: string;
  alpha: number;
  beta: number;
  ciRange: [number, number];
  ciWidth: number;
  icon: string;
}

// --- Mock Data (Beta Distributions) ---
const mockMasteryData: SubjectMastery[] = [
  { id: "1", name: "Quantum Mechanics", alpha: 85, beta: 15, ciRange: [78, 89], ciWidth: 11, icon: "science" },
  { id: "2", name: "Linear Algebra", alpha: 40, beta: 60, ciRange: [32, 48], ciWidth: 16, icon: "calculate" },
  { id: "3", name: "Organic Chemistry", alpha: 12, beta: 8, ciRange: [45, 75], ciWidth: 30, icon: "experiment" }, // High uncertainty
];

export default function StudentProgressPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate progressive reveal
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  return (
    <main className="min-h-screen bg-surface p-6 md:p-10 font-body text-on-surface">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">
              Cognitive Analytics
            </h2>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">
              Your Knowledge Map
            </h1>
          </div>
          <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-black text-primary">
              Global Mastery: 68% - 74%
            </span>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Subject Breakdown */}
          <div className="lg:col-span-7 space-y-8">
            <div className="neumorphic-flat p-8 rounded-[2.5rem]">
              <h3 className="font-headline text-2xl font-bold mb-8">Subject Resolution</h3>
              
              <div className="space-y-8">
                {mockMasteryData.map((subject) => (
                  <div key={subject.id} className="group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center transition-transform group-hover:scale-[1.05]">
                          <span className="material-symbols-outlined text-sm text-primary">
                            {subject.icon}
                          </span>
                        </div>
                        <span className="font-bold text-lg">{subject.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                          Est. Mastery
                        </span>
                        <span className="font-headline font-bold text-primary">
                          {subject.ciRange[0]}% - {subject.ciRange[1]}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar with Uncertainty Visualization */}
                    <div className="w-full h-4 neumorphic-pressed rounded-full overflow-hidden relative">
                      {/* The actual probability mass */}
                      <div 
                        className="absolute h-full bg-gradient-to-r from-primary to-primary-fixed rounded-full shadow-[0_0_15px_rgba(112,42,225,0.4)] transition-all duration-1000 ease-out"
                        style={{ 
                          left: `${subject.ciRange[0]}%`, 
                          width: `${subject.ciWidth}%`,
                          opacity: subject.ciWidth > 20 ? 0.6 : 1 // Wider CI = more transparent
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant/70">
                        α: {subject.alpha} | β: {subject.beta}
                      </span>
                      {subject.ciWidth > 20 && (
                        <span className="text-xs text-secondary font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          Needs more data to resolve
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Brain Map Placeholder & Insights */}
          <div className="lg:col-span-5 space-y-10">
            {/* Brain Map Container */}
            <div className="neumorphic-inset p-2 rounded-[2.5rem] h-[300px] relative overflow-hidden flex items-center justify-center bg-surface-dim/20">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <span className="material-symbols-outlined text-4xl text-primary/40 mb-2">
                  3d_rotation
                </span>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Brain Map™ Visualization Active
                </p>
              </div>
              {/* R3F Canvas would mount here */}
              <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-br from-surface to-surface-container-low opacity-50" />
            </div>

            {/* Growth Insights */}
            <div className="neumorphic-flat p-8 rounded-[2.5rem]">
              <h3 className="font-headline text-xl font-bold mb-6">Growth Opportunities</h3>
              <div className="space-y-4">
                <div className="neumorphic-inset p-5 rounded-2xl flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-sm">trending_up</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Linear Algebra Momentum</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Your recent problem sets have narrowed the uncertainty band by 12%. Keep exploring matrices to solidify this cluster.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function ProgressSkeleton() {
  return (
    <div className="min-h-screen bg-surface p-6 md:p-10 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="h-20 w-1/3 bg-surface-container-high rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 h-[500px] bg-surface-container-high rounded-[2.5rem]" />
          <div className="lg:col-span-5 space-y-10">
            <div className="h-[300px] bg-surface-container-high rounded-[2.5rem]" />
            <div className="h-[200px] bg-surface-container-high rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}