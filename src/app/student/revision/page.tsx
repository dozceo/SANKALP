"use client";

import React from "react";

// --- Types ---
interface RevisionNode {
  id: string;
  topic: string;
  reason: "high_uncertainty" | "decaying_mastery" | "prerequisite_struggle";
  alpha: number;
  beta: number;
  ciRange: [number, number];
  lastReviewed: string;
}

const revisionQueue: RevisionNode[] = [
  {
    id: "rev-1",
    topic: "Covalent Bonding",
    reason: "decaying_mastery",
    alpha: 63,
    beta: 37,
    ciRange: [55, 72],
    lastReviewed: "14 days ago",
  },
  {
    id: "rev-2",
    topic: "Derivatives of Trig Functions",
    reason: "high_uncertainty",
    alpha: 57,
    beta: 43,
    ciRange: [30, 85], // Very wide CI
    lastReviewed: "Never",
  },
];

export default function StudentRevisionPage() {
  return (
    <main className="min-h-screen bg-surface p-6 md:p-10 font-body text-on-surface">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full neumorphic-inset flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              all_inclusive
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface">
            Targeted Revision
          </h1>
          <p className="text-on-surface-variant text-lg">
            We've identified areas where your neural map is either fading or lacks sufficient data. Let's strengthen these connections.
          </p>
        </header>

        {/* Priority Queue */}
        <section className="space-y-6">
          <h2 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant ml-4">
            Priority Queue
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {revisionQueue.map((node) => (
              <div 
                key={node.id} 
                className="neumorphic-flat p-8 rounded-[2.5rem] flex flex-col h-full hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-secondary-container text-secondary px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-widest font-black">
                    {node.reason.replace("_", " ")}
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {node.lastReviewed}
                  </span>
                </div>
                
                <h3 className="font-headline text-2xl font-bold mb-4 flex-grow">
                  {node.topic}
                </h3>
                
                <div className="neumorphic-inset p-4 rounded-2xl mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant">Current Estimate</span>
                    <span className="text-sm font-black text-primary">
                      {node.ciRange[0]}% - {node.ciRange[1]}%
                    </span>
                  </div>
                  {/* Visualizing the uncertainty gap */}
                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden relative">
                    <div 
                      className="absolute h-full bg-primary/40 rounded-full"
                      style={{ 
                        left: `${node.ciRange[0]}%`, 
                        width: `${node.ciRange[1] - node.ciRange[0]}%` 
                      }}
                    />
                  </div>
                  {(node.ciRange[1] - node.ciRange[0]) > 30 && (
                    <p className="text-[10px] text-secondary mt-2 font-medium">
                      Wide uncertainty band. Review needed to calibrate.
                    </p>
                  )}
                </div>

                <button className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-fixed text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase shadow-[0_8px_20px_rgba(112,42,225,0.2)]">
                  Initiate Review
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}