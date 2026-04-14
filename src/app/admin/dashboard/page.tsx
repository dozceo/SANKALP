import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 px-8 h-20 bg-surface/80 backdrop-blur-md flex justify-between items-center font-headline font-semibold tracking-tight border-b border-outline-variant/15">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-black text-primary tracking-tighter uppercase">
            SANKALP AEI
          </span>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/admin/dashboard"
              className="text-primary relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
            >
              Cockpit
            </Link>
            <Link
              href="/admin/users"
              className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300"
            >
              User Management
            </Link>
            <Link
              href="/admin/system"
              className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300"
            >
              System Health
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="neumorphic-inset px-5 py-2.5 rounded-full flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary scale-90" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              System Nominal
            </span>
          </div>
          <div className="w-10 h-10 rounded-full neumorphic-flat p-0.5">
            <div className="w-full h-full rounded-full bg-inverse-surface flex items-center justify-center text-surface font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
              System Cockpit
            </h1>
            <p className="text-on-surface-variant text-lg">
              Global overview of SANKALP-AEI infrastructure and active learning sessions.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-full neumorphic-flat text-primary font-black text-xs tracking-widest hover:scale-[0.98] transition-all uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh Data
            </button>
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-xs tracking-widest hover:scale-[0.98] transition-all shadow-lg shadow-primary/20 uppercase">
              Generate Report
            </button>
          </div>
        </section>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Metric 1 */}
          <div className="neumorphic-flat p-8 rounded-[2rem] flex items-center gap-6">
            <div className="w-16 h-16 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                group
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest mb-1">
                Active Sessions
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-headline font-extrabold text-on-surface leading-none">
                  1,284
                </p>
                <span className="text-xs font-bold text-tertiary flex items-center">
                  <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                  12%
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="neumorphic-flat p-8 rounded-[2rem] flex items-center gap-6">
            <div className="w-16 h-16 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                memory
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest mb-1">
                AI Inference Latency
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-headline font-extrabold text-on-surface leading-none">
                  42ms
                </p>
                <span className="text-xs font-bold text-tertiary flex items-center">
                  <span className="material-symbols-outlined text-[10px]">arrow_downward</span>
                  3ms
                </span>
              </div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="neumorphic-flat p-8 rounded-[2rem] flex items-center gap-6">
            <div className="w-16 h-16 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                dns
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest mb-1">
                Database Load
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-headline font-extrabold text-on-surface leading-none">
                  28%
                </p>
                <span className="text-xs font-bold text-on-surface-variant flex items-center">
                  Stable
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-10">
          {/* Center Workspace: System Load & Map */}
          <section className="col-span-12 lg:col-span-8 space-y-10">
            <div className="neumorphic-flat p-10 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em]">
                  Global Brain Map Updates (Real-time)
                </h3>
                <span className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  Live
                </span>
              </div>
              
              {/* Abstract Visualization Area */}
              <div className="w-full h-80 neumorphic-inset rounded-3xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(112,42,225,0.05)_0%,transparent_70%)]"></div>
                
                {/* Mock Nodes */}
                <div className="relative w-full h-full">
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(112,42,225,0.8)] animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-secondary shadow-[0_0_15px_rgba(70,71,211,0.8)] animate-pulse delay-75"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-tertiary shadow-[0_0_15px_rgba(0,105,71,0.8)] animate-pulse delay-150"></div>
                  <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-primary-container shadow-[0_0_15px_rgba(178,140,255,0.8)] animate-pulse delay-300"></div>
                  
                  {/* Connecting Lines (SVG Mock) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#702ae1" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="75%" y2="66%" stroke="#4647d3" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="66%" y2="33%" stroke="#b28cff" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="neumorphic-flat px-4 py-2 rounded-xl bg-surface/80 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">State Updates / Sec</p>
                    <p className="text-xl font-black text-primary">142.5</p>
                  </div>
                  <div className="neumorphic-flat px-4 py-2 rounded-xl bg-surface/80 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Avg CI Width</p>
                    <p className="text-xl font-black text-secondary">±4.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Rail: Alerts & Anomalies */}
          <aside className="col-span-12 lg:col-span-4 space-y-10">
            <div className="neumorphic-flat p-8 rounded-[2.5rem]">
              <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em] mb-6">
                System Anomalies
              </h3>
              
              <div className="space-y-4">
                {/* Alert Item */}
                <div className="neumorphic-inset p-5 rounded-2xl border border-outline-variant/15">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-sm text-primary">
                        model_training
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface mb-1">Model Drift Detected</h4>
                      <p className="text-xs text-on-surface-variant mb-3">
                        Knowledge tracing model showing slight deviation in early-sequence struggle detection.
                      </p>
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                        Investigate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alert Item */}
                <div className="neumorphic-inset p-5 rounded-2xl border border-outline-variant/15">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        speed
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface mb-1">High Latency Spike</h4>
                      <p className="text-xs text-on-surface-variant mb-3">
                        Region US-East experienced a 120ms spike in API response times at 10:42 AM.
                      </p>
                      <button className="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline">
                        View Logs
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              
              <button className="w-full mt-6 py-4 rounded-full neumorphic-flat text-on-surface-variant font-black text-xs tracking-widest hover:scale-[0.98] transition-all uppercase">
                View All Logs
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}