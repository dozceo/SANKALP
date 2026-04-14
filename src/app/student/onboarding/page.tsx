import React from "react";
import Link from "next/link";

export default function StudentOnboarding() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary/5 blur-[80px] pointer-events-none"></div>

      <main className="w-full max-w-2xl relative z-10">
        <div className="neumorphic-flat p-10 md:p-16 rounded-[3rem] flex flex-col items-center text-center">
          
          {/* Step Indicators */}
          <div className="flex gap-4 mb-12">
            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(112,42,225,0.5)]"></div>
            <div className="w-3 h-3 rounded-full neumorphic-inset"></div>
            <div className="w-3 h-3 rounded-full neumorphic-inset"></div>
          </div>

          {/* Icon Header */}
          <div className="w-20 h-20 rounded-full neumorphic-inset flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              architecture
            </span>
          </div>

          {/* Typography */}
          <h1 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">
            System Initialization
          </h1>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-6">
            Welcome to SANKALP.
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg max-w-md mb-10 leading-relaxed">
            Before we construct your Cognitive Brain Map, we need to establish your baseline. This ensures every challenge is perfectly calibrated to your current state.
          </p>

          {/* Neomorphic Input */}
          <div className="w-full max-w-sm mb-10">
            <label htmlFor="nickname" className="sr-only">Preferred Name</label>
            <div className="neumorphic-inset p-2 rounded-full flex items-center px-6">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">
                person
              </span>
              <input 
                id="nickname"
                type="text" 
                className="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-4 placeholder:text-on-surface-variant/40 font-medium text-on-surface outline-none"
                placeholder="What should we call you?"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="w-full max-w-sm flex flex-col gap-4">
            <Link href="/student/dashboard" className="w-full block">
              <button className="w-full py-5 rounded-full neumorphic-flat bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase">
                Begin Calibration
              </button>
            </Link>
            <button className="w-full py-4 rounded-full text-on-surface-variant font-bold text-xs tracking-widest uppercase hover:text-primary transition-colors">
              Learn More About The Process
            </button>
          </div>

        </div>

        {/* Floating Glass Element for Visual Depth */}
        <div className="absolute -right-12 top-20 w-32 h-32 rounded-[2rem] bg-surface/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(44,47,49,0.05)] flex items-center justify-center rotate-12 pointer-events-none hidden md:flex">
           <div className="w-16 h-16 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-2xl">
                scatter_plot
              </span>
           </div>
        </div>
      </main>
    </div>
  );
}