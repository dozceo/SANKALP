import React from "react";

// --- Types ---
interface StudentRecord {
  id: string;
  name: string;
  focusLevel: number;
  alpha: number;
  beta: number;
  masteryRange: [number, number]; // Beta(α,β) bounds
  ciWidth: number;
  status: "optimal" | "struggling" | "excelling";
}

// --- Mock Data ---
const STUDENTS: StudentRecord[] = [
  { id: "s1", name: "Aarav Patel", focusLevel: 88, alpha: 81, beta: 19, masteryRange: [78, 85], ciWidth: 7, status: "optimal" },
  { id: "s2", name: "Sarah Chen", focusLevel: 92, alpha: 91, beta: 9, masteryRange: [89, 94], ciWidth: 5, status: "excelling" },
  { id: "s3", name: "Marcus Johnson", focusLevel: 45, alpha: 55, beta: 45, masteryRange: [42, 68], ciWidth: 26, status: "struggling" },
  { id: "s4", name: "Elena Rodriguez", focusLevel: 76, alpha: 75, beta: 25, masteryRange: [70, 81], ciWidth: 11, status: "optimal" },
  { id: "s5", name: "David Kim", focusLevel: 30, alpha: 55, beta: 45, masteryRange: [35, 75], ciWidth: 40, status: "struggling" },
];

export default function TeacherOverview() {
  return (
    <main className="pt-28 pb-12 px-8 max-w-[1600px] mx-auto font-body text-on-surface min-h-screen">
      
      {/* Header & Controls */}
      <section className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Student Overview
          </h1>
          <p className="text-on-surface-variant text-sm">
            Continuous Bayesian mastery updates for all active cohorts.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="neumorphic-inset p-2 rounded-full flex items-center px-5 flex-1 md:w-80">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-full py-2 px-3 placeholder:text-on-surface-variant/40 font-medium outline-none"
              placeholder="Search students..." 
              type="text"
            />
          </div>
          <button className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center hover:scale-95 transition-transform">
            <span className="material-symbols-outlined text-primary">filter_list</span>
          </button>
        </div>
      </section>

      {/* Data Container (No Lines Rule Applied) */}
      <section className="neumorphic-flat p-8 rounded-[3rem]">
        
        {/* Table Header (Visual only, no borders) */}
        <div className="grid grid-cols-12 gap-4 px-6 mb-6">
          <div className="col-span-4 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Student</div>
          <div className="col-span-3 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Cognitive Focus</div>
          <div className="col-span-3 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Mastery (95% CI)</div>
          <div className="col-span-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Status</div>
        </div>

        {/* Rows */}
        <div className="space-y-4">
          {STUDENTS.map((student) => (
            <div 
              key={student.id} 
              className="grid grid-cols-12 gap-4 items-center px-6 py-5 neumorphic-inset rounded-3xl hover:scale-[1.01] transition-all cursor-pointer group"
            >
              {/* Name & Avatar */}
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center">
                  <span className="text-primary font-black text-xs">{student.name.charAt(0)}</span>
                </div>
                <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {student.name}
                </span>
              </div>

              {/* Focus Level */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-24 h-2 neumorphic-pressed rounded-full overflow-hidden bg-surface">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-container"
                    style={{ width: `${student.focusLevel}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-on-surface-variant">{student.focusLevel}%</span>
              </div>

              {/* Mastery Range (Beta Distribution CI) */}
              <div className="col-span-3 flex items-center">
                <div 
                  className="px-4 py-1.5 rounded-full neumorphic-flat text-xs font-black text-primary"
                  style={{ opacity: Math.max(0.3, 1 - (student.ciWidth / 60)) }}
                  title={`Confidence Interval Width: ${student.ciWidth}`}
                >
                  {student.masteryRange[0]}% - {student.masteryRange[1]}%
                </div>
              </div>

              {/* Status Badge */}
              <div className="col-span-2 flex justify-end">
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest
                  ${student.status === 'struggling' ? 'text-error bg-error/5' : 
                    student.status === 'excelling' ? 'text-tertiary bg-tertiary/5' : 
                    'text-primary bg-primary/5'}`}
                >
                  {student.status}
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}