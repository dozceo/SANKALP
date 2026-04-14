import React from 'react';

interface SubjectMastery {
  id: string;
  name: string;
  icon: string;
  color: string;
  ciLower: number;
  ciUpper: number;
}

const mockSubjects: SubjectMastery[] = [
  { id: '1', name: 'Mathematics', icon: 'architecture', color: 'text-primary', ciLower: 82, ciUpper: 89 },
  { id: '2', name: 'Physics', icon: 'experiment', color: 'text-secondary', ciLower: 64, ciUpper: 78 },
  { id: '3', name: 'Biochemistry', icon: 'biotech', color: 'text-tertiary', ciLower: 88, ciUpper: 94 },
];

export default function StudentDashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fadeIn">
      {/* Cognitive State Snapshot Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Good morning, Aarav.
          </h1>
          <p className="text-on-surface-variant text-lg font-body">
            Your cognitive clarity is peaking. Perfect time for <span className="text-primary font-bold">Quantum Mechanics</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[220px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full mastery-arc flex items-center justify-center relative">
                <div className="w-[85%] h-[85%] bg-surface rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-black text-on-surface">72-89%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">OVERALL MASTERY</p>
              <p className="text-lg font-bold text-primary tracking-tighter leading-none">Architect Level</p>
            </div>
          </div>
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[180px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">CURRENT STREAK</p>
              <p className="text-lg font-bold text-primary tracking-tighter leading-none">14 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Pane Cognitive Cockpit */}
      <div className="grid grid-cols-12 gap-10">
        {/* Left Rail */}
        <aside className="col-span-12 lg:col-span-3 space-y-10">
          <div className="neumorphic-flat p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant">COGNITIVE BRAIN MAP</h3>
              <button className="w-8 h-8 rounded-full neumorphic-flat flex items-center justify-center group hover:scale-[1.02] transition-transform" aria-label="Expand Brain Map">
                <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">open_in_full</span>
              </button>
            </div>
            <div className="relative h-56 w-full neumorphic-inset rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              <div className="relative z-10 flex gap-4">
                <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>functions</span>
                </div>
                <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center translate-y-6 bg-tertiary-container/10 hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
                </div>
                <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-primary-dim text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant px-2">SUBJECT MASTERY</h3>
            <div className="space-y-4">
              {mockSubjects.map((subject) => {
                const ciWidth = subject.ciUpper - subject.ciLower;
                // Uncertainty visualization: wider CI = more transparent
                const opacityClass = ciWidth > 15 ? 'opacity-60' : ciWidth > 10 ? 'opacity-80' : 'opacity-100';
                
                return (
                  <div key={subject.id} className="neumorphic-flat p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
                        <span className={`material-symbols-outlined text-sm ${subject.color}`}>{subject.icon}</span>
                      </div>
                      <span className="font-bold text-sm text-on-surface font-body">{subject.name}</span>
                    </div>
                    <span className={`text-xs font-black ${subject.color} px-2 ${opacityClass}`}>
                      {subject.ciLower}-{subject.ciUpper}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Workspace */}
        <section className="col-span-12 lg:col-span-6 space-y-10">
          <div className="neumorphic-flat p-10 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-6 right-6">
              <span className="px-4 py-1.5 neumorphic-inset text-primary font-label text-[10px] uppercase font-black tracking-widest rounded-full border border-outline-variant/15">CHALLENGE MODE</span>
            </div>
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="font-label text-[10px] uppercase font-black tracking-widest text-primary mb-3">TODAY'S MISSION</h2>
                <h3 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Advanced Thermodynamics: Phase Transitions</h3>
              </div>
              
              <div className="neumorphic-inset p-6 rounded-3xl mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">psychology_alt</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant leading-relaxed font-medium font-body">
                      Your recent interactions show a strong grasp of entropy. Let's push that understanding into phase transitions. We'll focus on the Clausius-Clapeyron relation today.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-label text-[10px] uppercase font-black tracking-widest hover:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(112,42,225,0.2)]">
                  Launch Mission
                </button>
                <button className="px-8 py-5 rounded-full neumorphic-flat text-primary font-label text-[10px] uppercase font-black tracking-widest hover:scale-[0.98] transition-all border border-outline-variant/15">
                  Review Theory
                </button>
              </div>
            </div>
            {/* Decorative glassmorphism blur */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
          </div>
        </section>

        {/* Right Rail */}
        <aside className="col-span-12 lg:col-span-3 space-y-10">
          <div className="neumorphic-flat p-6 rounded-3xl">
            <h3 className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-6">REVISION QUEUE</h3>
            <div className="space-y-4">
              {[
                { id: 'r1', topic: 'Kinematics', urgency: 'critical', time: '12 mins', icon: 'speed' },
                { id: 'r2', topic: 'Cell Division', urgency: 'high', time: '8 mins', icon: 'science' },
              ].map((item) => (
                <div key={item.id} className="neumorphic-inset p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full neumorphic-flat flex items-center justify-center">
                      <span className="material-symbols-outlined text-xs text-on-surface-variant">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface font-body">{item.topic}</p>
                      <p className="font-label text-[8px] uppercase font-black tracking-widest text-on-surface-variant mt-0.5">{item.time}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${item.urgency === 'critical' ? 'bg-error' : 'bg-warning'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}