import React from "react";
import Link from "next/link";

export default function TeacherOnboarding() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 font-body text-on-surface bg-surface">
      
      <div className="neumorphic-flat p-12 md:p-16 rounded-[3rem] max-w-3xl w-full relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto rounded-full neumorphic-inset flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
            </div>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
              Welcome to SANKALP-AEI
            </h1>
            <p className="text-on-surface-variant text-base max-w-md mx-auto">
              Let's configure your cognitive architecture. We'll set up your profile, import your cohorts, and align the curriculum engine.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            
            {/* Step 1 */}
            <div className="neumorphic-inset p-6 rounded-3xl flex items-center gap-6 group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-sm text-on-surface mb-1">Profile Configuration</h3>
                <p className="text-xs text-on-surface-variant">Set your academic credentials and notification preferences.</p>
              </div>
              <div className="w-8 h-8 rounded-full neumorphic-flat flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-sm">check</span>
              </div>
            </div>

            {/* Step 2 (Active) */}
            <div className="neumorphic-flat p-6 rounded-3xl flex items-center gap-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
              <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-sm text-on-surface mb-1">Cohort Import</h3>
                <p className="text-xs text-on-surface-variant">Sync your student rosters and initialize their Bayesian state.</p>
              </div>
              <div className="px-4 py-1.5 rounded-full neumorphic-inset text-[10px] font-black text-primary uppercase tracking-widest">
                Pending
              </div>
            </div>

            {/* Step 3 */}
            <div className="neumorphic-inset p-6 rounded-3xl flex items-center gap-6 opacity-60">
              <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">account_tree</span>
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-sm text-on-surface mb-1">Curriculum Alignment</h3>
                <p className="text-xs text-on-surface-variant">Map your syllabus to the SANKALP knowledge graph.</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">lock</span>
              </div>
            </div>

          </div>

          <div className="flex justify-center">
            <Link href="/teacher/dashboard" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase shadow-[0_10px_30px_rgba(112,42,225,0.3)]">
                Begin Configuration
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}