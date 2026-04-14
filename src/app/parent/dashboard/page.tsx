import React from "react";
import Link from "next/link";

export default function ParentDashboardPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 px-8 h-20 bg-surface/80 backdrop-blur-md flex justify-between items-center font-headline font-semibold tracking-tight">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-black text-primary tracking-tighter uppercase">
            SANKALP AEI
          </span>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/parent/dashboard"
              className="text-primary relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
            >
              Overview
            </Link>
            <Link
              href="/parent/insights"
              className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300"
            >
              Deep Insights
            </Link>
            <Link
              href="/parent/settings"
              className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300"
            >
              Preferences
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button
              aria-label="Notifications"
              className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center hover:scale-95 transition-transform active:shadow-inner"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                notifications
              </span>
            </button>
            <div className="w-10 h-10 rounded-full neumorphic-flat p-0.5">
              <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                P
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
              Good evening, Priya.
            </h1>
            <p className="text-on-surface-variant text-lg">
              Aarav is showing strong engagement today. His confidence in{" "}
              <span className="text-primary font-bold">Algebraic Functions</span> is growing.
            </p>
          </div>
          <div className="flex gap-6">
            <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[220px]">
              <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center relative">
                  <div className="w-[85%] h-[85%] bg-surface rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-black text-primary">78-85%</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-on-surface-variant leading-none mb-1 tracking-widest">
                  Est. Mastery
                </p>
                <p className="text-lg font-bold text-primary tracking-tighter leading-none">
                  Proficient
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-10">
          {/* Left Rail: Subject Mastery */}
          <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="neumorphic-flat p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em]">
                  Subject Mastery Ranges
                </h3>
                <button
                  aria-label="Expand Brain Map"
                  className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center group"
                >
                  <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">
                    monitoring
                  </span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Subject Item */}
                <div className="group hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-primary">
                          functions
                        </span>
                      </div>
                      <span className="font-bold text-sm text-on-surface">Mathematics</span>
                    </div>
                    <span className="text-xs font-black text-primary">82–89%</span>
                  </div>
                  <div className="w-full h-2 neumorphic-inset rounded-full overflow-hidden relative">
                    <div className="absolute left-[82%] right-[11%] h-full bg-primary-container opacity-50 rounded-full"></div>
                    <div className="absolute left-0 w-[85%] h-full bg-gradient-to-r from-primary to-primary-container rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
                    High confidence. Narrow uncertainty band.
                  </p>
                </div>

                {/* Subject Item */}
                <div className="group hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-secondary">
                          science
                        </span>
                      </div>
                      <span className="font-bold text-sm text-on-surface">Physics</span>
                    </div>
                    <span className="text-xs font-black text-secondary">64–76%</span>
                  </div>
                  <div className="w-full h-2 neumorphic-inset rounded-full overflow-hidden relative">
                    <div className="absolute left-[64%] right-[24%] h-full bg-secondary-container opacity-50 rounded-full"></div>
                    <div className="absolute left-0 w-[70%] h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
                    Exploring new concepts. Wider uncertainty.
                  </p>
                </div>

                {/* Subject Item */}
                <div className="group hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-tertiary">
                          history_edu
                        </span>
                      </div>
                      <span className="font-bold text-sm text-on-surface">Literature</span>
                    </div>
                    <span className="text-xs font-black text-tertiary">88–94%</span>
                  </div>
                  <div className="w-full h-2 neumorphic-inset rounded-full overflow-hidden relative">
                    <div className="absolute left-[88%] right-[6%] h-full bg-tertiary-container opacity-50 rounded-full"></div>
                    <div className="absolute left-0 w-[91%] h-full bg-gradient-to-r from-tertiary to-tertiary-container rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 font-medium">
                    Exceptional grasp. Ready for advanced topics.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Center Workspace: Insights & Activity */}
          <section className="col-span-12 lg:col-span-8 space-y-10">
            {/* Empathetic Insight Card */}
            <div className="neumorphic-flat p-10 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      psychology_alt
                    </span>
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                      Cognitive Insight
                    </h2>
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface">
                      Aarav is finding his rhythm.
                    </h3>
                  </div>
                </div>
                
                <p className="text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
                  Over the past week, we noticed Aarav taking a bit more time with Physics problem sets. 
                  This is a completely normal part of the learning process when encountering complex phase transitions. 
                  He showed great resilience and eventually mastered the core concepts. 
                  A word of encouragement about his persistence would be wonderful today!
                </p>

                <div className="flex gap-4">
                  <button className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all shadow-lg shadow-primary/20 uppercase">
                    Send Encouragement
                  </button>
                  <button className="px-8 py-4 rounded-full neumorphic-flat text-primary font-black text-sm tracking-widest hover:scale-[0.98] transition-all uppercase border border-outline-variant/15">
                    View Physics Details
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="neumorphic-flat p-10 rounded-[2.5rem]">
              <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em] mb-8">
                Recent Learning Milestones
              </h3>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-container/50 before:to-transparent">
                
                {/* Timeline Item */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full neumorphic-inset shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#EBEDF0] z-10">
                    <span className="material-symbols-outlined text-primary text-sm">
                      emoji_events
                    </span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] neumorphic-flat p-6 rounded-2xl group-hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Today, 10:30 AM</span>
                    </div>
                    <h4 className="font-bold text-on-surface mb-1">Mastered Quadratic Equations</h4>
                    <p className="text-sm text-on-surface-variant">Probability of mastery increased to 85-91% after a successful challenge session.</p>
                  </div>
                </div>

                {/* Timeline Item */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full neumorphic-inset shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_#EBEDF0] z-10">
                    <span className="material-symbols-outlined text-secondary text-sm">
                      menu_book
                    </span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] neumorphic-flat p-6 rounded-2xl group-hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Yesterday</span>
                    </div>
                    <h4 className="font-bold text-on-surface mb-1">Deep Reading Session</h4>
                    <p className="text-sm text-on-surface-variant">Spent 45 minutes exploring advanced literature concepts with high focus.</p>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}