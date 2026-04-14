import React from "react";
import Link from "next/link";
import Image from "next/image";

// --- Types ---
interface SubjectMastery {
  id: string;
  subject: string;
  icon: string;
  alpha: number;
  beta: number;
  minMastery: number;
  maxMastery: number;
  colorClass: string;
}

interface Assessment {
  id: string;
  title: string;
  time: string;
  type: string;
}

// --- Mock Data (Adhering to Beta Distribution Laws) ---
const SUBJECT_MASTERY: SubjectMastery[] = [
  { id: "m1", subject: "Mathematics", icon: "architecture", alpha: 82, beta: 18, minMastery: 79, maxMastery: 85, colorClass: "text-primary" },
  { id: "m2", subject: "Physics", icon: "experiment", alpha: 65, beta: 35, minMastery: 61, maxMastery: 68, colorClass: "text-secondary" },
  { id: "m3", subject: "Biochemistry", icon: "biotech", alpha: 91, beta: 9, minMastery: 88, maxMastery: 94, colorClass: "text-tertiary" },
];

const UPCOMING_ASSESSMENTS: Assessment[] = [
  { id: "a1", title: "Wave Functions", time: "In 2 hours", type: "Diagnostic" },
  { id: "a2", title: "Calculus III", time: "Tomorrow", type: "Milestone" },
];

export default function StudentDashboard() {
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
              href="/student/dashboard"
              className="text-primary relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
            >
              Dashboard
            </Link>
            <Link href="/student/curriculum" className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300">
              Curriculum
            </Link>
            <Link href="/student/assessments" className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300">
              Assessments
            </Link>
            <Link href="/student/insights" className="text-on-surface opacity-70 hover:text-primary transition-colors duration-300">
              Insights
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="neumorphic-inset px-5 py-2.5 rounded-full flex items-center gap-3">
            <span className="material-symbols-outlined text-primary scale-90" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
              Focus Level: 85-91%
            </span>
          </div>
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
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  alt="Student Profile Avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxcMi-CGKA--fu385KAp7LpugeGjQM0zGol67pYo9wkiZLZRPRUTGMMQ88VAff9uz_7DV7owM0tta7omiV6QwaqVP9cfP2kojTezg6PnZj3D69fWi5eAnc28i36t-rdOBjkwr107l_9Sq1L0PgrJIyE_2TXCXf281kCCrXtbNOArrc1ek4UTZR2acPhUl02DewdhzHP0VrchAa5FiojbPjVeh1ezJeS9A3Pv8CY93FCuwoaCIblSVzZJTL1Vyuzym1oZfbNm65GfrC"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-8 max-w-[1600px] mx-auto">
        {/* Cognitive State Snapshot Header */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
              Good morning, Aarav.
            </h1>
            <p className="text-on-surface-variant text-lg">
              Your cognitive clarity is peaking. Perfect time for <span className="text-primary font-bold">Quantum Mechanics</span>.
            </p>
          </div>
          <div className="flex gap-6">
            <div className="neumorphic-flat px-6 py-4 rounded-2xl flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,#702ae1_0%,#b28cff_78%,transparent_78%_100%)] flex items-center justify-center relative">
                  <div className="w-[85%] h-[85%] bg-surface rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-black tracking-tighter">75-81%</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] leading-none mb-1">
                  Overall Mastery
                </p>
                <p className="text-lg font-bold text-primary tracking-tighter leading-none">
                  Architect Level
                </p>
              </div>
            </div>
            <div className="neumorphic-flat px-6 py-4 rounded-2xl flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] leading-none mb-1">
                  Current Streak
                </p>
                <p className="text-lg font-bold text-primary tracking-tighter leading-none">
                  14 Days
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tri-Pane Cognitive Cockpit */}
        <div className="grid grid-cols-12 gap-10">
          
          {/* Left Rail */}
          <aside className="col-span-12 lg:col-span-3 space-y-10">
            <div className="neumorphic-flat p-6 rounded-[2rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em]">
                  Cognitive Brain Map
                </h3>
                <button aria-label="Expand Brain Map" className="w-8 h-8 rounded-full neumorphic-flat flex items-center justify-center group">
                  <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">
                    open_in_full
                  </span>
                </button>
              </div>
              <div className="relative h-56 w-full neumorphic-inset rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                {/* 3D Brain Map Placeholder */}
                <div className="relative z-10 flex gap-4">
                  <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      functions
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center translate-y-6 bg-tertiary-container/10 hover:scale-105 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      science
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-primary-dim text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      history_edu
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em] px-2">
                Subject Mastery
              </h3>
              <div className="space-y-4">
                {SUBJECT_MASTERY.map((sub) => (
                  <div key={sub.id} className="neumorphic-flat p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
                        <span className={`material-symbols-outlined text-sm ${sub.colorClass}`}>
                          {sub.icon}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-on-surface">{sub.subject}</span>
                    </div>
                    <span className={`text-xs font-black ${sub.colorClass} px-2`}>
                      {sub.minMastery}-{sub.maxMastery}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Workspace */}
          <section className="col-span-12 lg:col-span-6 space-y-10">
            <div className="neumorphic-flat p-10 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-6 right-6">
                <span className="px-4 py-1.5 neumorphic-inset text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em]">
                  Challenge Mode
                </span>
              </div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">
                    Today&apos;s Mission
                  </h2>
                  <h3 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
                    Quantum Mechanics
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">
                    Your mastery in wave functions is stabilizing. Let&apos;s push the boundaries of your understanding with a dynamic drill on Schrödinger&apos;s equation.
                  </p>
                </div>

                <div className="space-y-3 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                      Module Completion
                    </span>
                    <span className="text-xs font-bold text-primary">62-68%</span>
                  </div>
                  <div className="w-full h-3 neumorphic-pressed rounded-full overflow-hidden bg-surface-container-highest">
                    <div className="w-[65%] h-full bg-gradient-to-r from-primary to-primary-fixed shadow-[0_0_15px_rgba(112,42,225,0.4)] rounded-full"></div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-5 rounded-full neumorphic-flat bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase">
                    Launch Mission
                  </button>
                  <button className="w-16 h-16 rounded-full neumorphic-flat flex items-center justify-center text-primary hover:scale-[0.98] transition-all">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Secondary Center Content - Metacognition Prompt */}
            <div className="neumorphic-inset p-8 rounded-[2rem] flex items-center gap-6">
              <div className="w-14 h-14 rounded-full neumorphic-flat flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  tips_and_updates
                </span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">Metacognitive Check-in</h4>
                <p className="text-sm text-on-surface-variant">
                  You struggled slightly with vector calculus yesterday. How confident are you feeling about applying it today?
                </p>
              </div>
            </div>
          </section>

          {/* Right Rail */}
          <aside className="col-span-12 lg:col-span-3 space-y-10">
            <div className="space-y-6">
              <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em] px-2">
                Upcoming Assessments
              </h3>
              <div className="space-y-4">
                {UPCOMING_ASSESSMENTS.map((assessment) => (
                  <div key={assessment.id} className="neumorphic-flat p-5 rounded-2xl group hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-primary">
                          quiz
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-[9px] font-black uppercase tracking-widest rounded-full">
                        {assessment.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-on-surface mb-1">{assessment.title}</h4>
                    <p className="text-xs text-primary font-semibold">{assessment.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="neumorphic-flat p-6 rounded-[2rem] bg-gradient-to-b from-surface to-surface-container-low">
              <h3 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em] mb-4">
                Cognitive Insight
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                Your retention probability for <strong className="text-on-surface">Thermodynamics</strong> has widened to a <strong className="text-tertiary">60-75%</strong> confidence interval. A quick review session is recommended to narrow the uncertainty.
              </p>
              <button className="w-full py-3 rounded-full neumorphic-inset text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container-lowest transition-colors">
                Review Topic
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}