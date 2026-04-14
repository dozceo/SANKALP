import React from 'react';

interface StudentRisk {
  id: string;
  name: string;
  masteryLower: number;
  masteryUpper: number;
  trend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  struggleArea: string;
}

const mockStudents: StudentRisk[] = [
  { id: 's1', name: 'Aarav Patel', masteryLower: 72, masteryUpper: 89, trend: 'improving', riskLevel: 'low', struggleArea: 'None' },
  { id: 's2', name: 'Maya Sharma', masteryLower: 45, masteryUpper: 62, trend: 'declining', riskLevel: 'high', struggleArea: 'Quantum States' },
  { id: 's3', name: 'Rohan Gupta', masteryLower: 38, masteryUpper: 55, trend: 'declining', riskLevel: 'critical', struggleArea: 'Thermodynamics' },
];

export default function TeacherDashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Cohort Overview
          </h1>
          <p className="text-on-surface-variant text-lg font-body">
            Class 12 Physics • <span className="text-primary font-bold">24 Students</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[220px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full mastery-arc flex items-center justify-center relative">
                <div className="w-[85%] h-[85%] bg-surface rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-black text-on-surface">68-75%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">COHORT MASTERY</p>
              <p className="text-lg font-bold text-primary tracking-tighter leading-none">Stable Trend</p>
            </div>
          </div>
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[180px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">INTERVENTIONS</p>
              <p className="text-lg font-bold text-error tracking-tighter leading-none">2 Required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Left Rail: Risk Heatmap */}
        <section className="col-span-12 lg:col-span-8 space-y-10">
          <div className="neumorphic-flat p-8 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-label text-[10px] uppercase font-black tracking-widest text-primary">COHORT RISK HEATMAP</h2>
              <button className="px-4 py-2 rounded-full neumorphic-inset font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                View Full Roster
              </button>
            </div>
            
            <div className="space-y-4">
              {mockStudents.map((student) => {
                const ciWidth = student.masteryUpper - student.masteryLower;
                const opacityClass = ciWidth > 15 ? 'opacity-60' : 'opacity-100';

                return (
                  <div key={student.id} className="neumorphic-inset p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface font-body">{student.name}</p>
                        <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mt-1">
                          STRUGGLE: <span className={student.riskLevel === 'critical' ? 'text-error' : 'text-warning'}>{student.struggleArea}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">MASTERY (95% CI)</p>
                        <p className={`text-sm font-black text-primary ${opacityClass}`}>{student.masteryLower}-{student.masteryUpper}%</p>
                      </div>
                      <div className="w-24 h-2 neumorphic-pressed rounded-full overflow-hidden bg-surface-container-highest">
                        <div 
                          className={`h-full rounded-full ${student.riskLevel === 'critical' ? 'bg-error' : student.riskLevel === 'high' ? 'bg-warning' : 'bg-tertiary'}`}
                          style={{ width: `${student.masteryLower}%` }}
                        ></div>
                      </div>
                      <button className="w-8 h-8 rounded-full neumorphic-flat flex items-center justify-center hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Rail: Actionable Alerts */}
        <aside className="col-span-12 lg:col-span-4 space-y-10">
          <div className="neumorphic-flat p-8 rounded-[2.5rem] bg-gradient-to-br from-surface to-surface-container-low">
            <h3 className="font-label text-[10px] uppercase font-black tracking-widest text-error mb-6">REQUIRED INTERVENTIONS</h3>
            <div className="space-y-6">
              <div className="neumorphic-inset p-5 rounded-2xl border border-error/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                <h4 className="font-bold text-sm text-on-surface mb-2 font-body">Rohan Gupta</h4>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-body">
                  Mastery in Thermodynamics has collapsed below 40%. High uncertainty detected.
                </p>
                <button className="w-full py-3 rounded-full bg-error/10 text-error font-label text-[10px] uppercase font-black tracking-widest hover:bg-error/20 transition-colors">
                  INITIATE SUPPORT
                </button>
              </div>
              
              <div className="neumorphic-inset p-5 rounded-2xl border border-warning/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>
                <h4 className="font-bold text-sm text-on-surface mb-2 font-body">Maya Sharma</h4>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-body">
                  Declining engagement trend over the last 3 sessions.
                </p>
                <button className="w-full py-3 rounded-full bg-warning/10 text-warning font-label text-[10px] uppercase font-black tracking-widest hover:bg-warning/20 transition-colors">
                  SEND ENCOURAGEMENT
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}