"use client";

import React, { useState } from "react";

export default function StudentStudyPage() {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <main className="min-h-screen bg-surface flex flex-col font-body text-on-surface relative overflow-hidden">
      
      {/* Top Navigation Bar */}
      <nav className="h-20 w-full flex items-center justify-between px-6 md:px-10 z-50 relative">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center hover:scale-[0.95] transition-transform">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
          <div className="h-4 w-px bg-outline-variant/15" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
            Active Session • Physics
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="neumorphic-inset px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-xs font-bold text-on-surface-variant">Recording Data</span>
          </div>
        </div>
      </nav>

      {/* Main Study Area */}
      <div className="flex-grow flex items-center justify-center p-6 pb-32">
        <div className="max-w-3xl w-full">
          
          {/* Content Card */}
          <div className="neumorphic-flat p-8 md:p-12 rounded-[3rem] transition-all duration-500 relative z-10">
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
              Understanding the Heisenberg Uncertainty Principle
            </h2>
            
            <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
              <p>
                At the quantum level, the act of measuring a particle's position inherently disturbs its momentum. This isn't a limitation of our instruments, but a fundamental property of the universe.
              </p>
              
              {/* Progressive Reveal Section */}
              {!isRevealed ? (
                <div className="pt-6 flex justify-center">
                  <button 
                    onClick={() => setIsRevealed(true)}
                    className="neumorphic-flat px-8 py-4 rounded-full text-primary font-bold text-sm tracking-widest uppercase hover:scale-[1.02] transition-transform flex items-center gap-3"
                  >
                    <span>Reveal Mathematical Proof</span>
                    <span className="material-symbols-outlined">expand_more</span>
                  </button>
                </div>
              ) : (
                <div className="neumorphic-inset p-6 rounded-2xl mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <p className="font-mono text-center text-xl text-on-surface py-4">
                    Δx · Δp ≥ ℏ / 2
                  </p>
                  <p className="text-sm text-center mt-4">
                    Where <strong className="text-on-surface">Δx</strong> is uncertainty in position, and <strong className="text-on-surface">Δp</strong> is uncertainty in momentum.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Action Bar (Glassmorphism) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl glass rounded-full p-2 flex items-center justify-between z-50 shadow-[0_20px_40px_rgba(163,177,198,0.3)]">
        <button className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        
        <div className="flex gap-2">
          <button className="px-6 py-4 rounded-full neumorphic-flat text-on-surface font-black text-xs tracking-widest hover:scale-[0.98] transition-all uppercase">
            Need Review
          </button>
          <button className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-fixed text-white font-black text-xs tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase shadow-[0_4px_15px_rgba(112,42,225,0.3)]">
            Understood
          </button>
        </div>

        <button className="w-14 h-14 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
        </button>
      </div>

    </main>
  );
}