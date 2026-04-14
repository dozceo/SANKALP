import React from "react";
import Link from "next/link";

// --- Types ---
interface ClassMetric {
  id: string;
  name: string;
  alpha: number;
  beta: number;
  masteryRange: [number, number]; // Beta(α,β) 95% CI
  ciWidth: number;
  strugglingCount: number;
  icon: string;
}

interface Alert {
  id: string;
  studentName: string;
  topic: string;
  probabilityDrop: string;
  urgency: "high" | "medium";
}

// --- Mock Data ---
const CLASS_METRICS: ClassMetric[] = [
  { id: "c1", name: "AP Physics C", alpha: 78, beta: 22, masteryRange: [72, 85], ciWidth: 13, strugglingCount: 3, icon: "experiment" },
  { id: "c2", name: "Calculus BC", alpha: 71, beta: 29, masteryRange: [68, 74], ciWidth: 6, strugglingCount: 5, icon: "functions" },
  { id: "c3", name: "Quantum Mechanics Intro", alpha: 63, beta: 37, masteryRange: [45, 82], ciWidth: 37, strugglingCount: 1, icon: "science" },
];

const ACTIVE_ALERTS: Alert[] = [
  { id: "a1", studentName: "Aarav Patel", topic: "Kinematics", probabilityDrop: "12%", urgency: "high" },
  { id: "a2", studentName: "Sarah Chen", topic: "Derivatives", probabilityDrop: "8%", urgency: "medium" },
];

export default function TeacherDashboard() {
  return (
    <main className="pt-28 pb-12 px-8 max-w-[1600px] mx-auto font-body text-on-surface min-h-screen">
      {/* Header Section */}
      <section className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Good morning, Professor.
          </h1>
          <p className="text-on-surface-variant text-lg">
            System confidence is stabilizing. <span className="text-primary font-bold">3 students</span> require your attention today.
          </p>
        </div>
        <div className="flex gap-6">
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[220px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center relative">
                <div className="w-[85%] h-[85%] bg-surface rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-black text-primary">74-81%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-on-surface-variant leading-none mb-1 tracking-[0.2em]">
                Cohort Mastery
              </p>
              <p className="text-lg font-bold text-primary tracking-tighter leading-none">
                Nominal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* Left Rail: Class Overview */}
        <section className="col-span-12 lg:col-span-8 space-y-10">
          <div className="neumorphic-flat p-8 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline font-bold text-on-surface-variant uppercase text-[10px] tracking-[0.2em]">
                Active Cohorts
              </h2>
              <Link href="/teacher/overview" className="text-xs font-bold text-primary hover:text-primary-dim transition-colors">
                View All Details &rarr;
              </Link>
            </div>

            <div className="space-y-6">
              {CLASS_METRICS.map((cls) => (
                <div 
                  key={cls.id} 
                  className="neumorphic-inset p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full neumorphic-flat flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {cls.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface">{cls.name}</h3>
                      <p className="text-xs font-medium text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        {cls.strugglingCount} struggling
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[150px]">
                    <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] mb-2">
                      Mastery (95% CI)
                    </p>
                    {/* Uncertainty Visualization: Wider CI = Lower Opacity */}
                    <div 
                      className="px-4 py-2 rounded-full neumorphic-flat font-black text-sm text-primary"
                      style={{ opacity: Math.max(0.4, 1 - (cls.ciWidth / 100)) }}
                    >
                      {cls.masteryRange[0]}% - {cls.masteryRange[1]}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Rail: Struggle Detection */}
        <aside className="col-span-12 lg:col-span-4 space-y-10">
          <div className="neumorphic-flat p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  radar
                </span>
              </div>
              <h2 className="font-headline font-bold text-error uppercase text-[10px] tracking-[0.2em]">
                Struggle Detection
              </h2>
            </div>

            <div className="space-y-5">
              {ACTIVE_ALERTS.map((alert) => (
                <div key={alert.id} className="neumorphic-inset p-5 rounded-2xl relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.urgency === 'high' ? 'bg-error' : 'bg-tertiary-fixed-dim'}`}></div>
                  <div className="pl-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-on-surface">{alert.studentName}</h4>
                      <span className="text-[10px] font-black text-error bg-error/10 px-2 py-1 rounded-full">
                        -{alert.probabilityDrop}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Declining mastery chain detected in <span className="font-bold text-on-surface">{alert.topic}</span>.
                    </p>
                    <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dim transition-colors">
                      Intervene &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 rounded-full neumorphic-flat text-primary font-black text-xs uppercase tracking-widest hover:scale-[0.98] transition-all">
              View All Alerts
            </button>
          </div>
        </aside>

      </div>
    </main>
  );
}