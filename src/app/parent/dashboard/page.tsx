import React from 'react';

export default function ParentDashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Aarav's Journey
          </h1>
          <p className="text-on-surface-variant text-lg font-body">
            Aarav is showing great curiosity in <span className="text-primary font-bold">Science</span> this week.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[220px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_very_satisfied</span>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">WELLBEING INDEX</p>
              <p className="text-lg font-bold text-tertiary tracking-tighter leading-none">Thriving</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Left Rail */}
        <section className="col-span-12 lg:col-span-8 space-y-10">
          <div className="neumorphic-flat p-10 rounded-[2.5rem]">
            <h2 className="font-label text-[10px] uppercase font-black tracking-widest text-primary mb-8">RECENT MILESTONES</h2>
            
            <div className="space-y-6">
              <div className="neumorphic-inset p-6 rounded-3xl flex items-start gap-6 group hover:scale-[1.01] transition-transform">
                <div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface mb-2 font-headline">Mastered Cell Division</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                    Aarav successfully completed all challenges related to Cell Division. He showed exceptional problem-solving skills and persistence.
                  </p>
                </div>
              </div>

              <div className="neumorphic-inset p-6 rounded-3xl flex items-start gap-6 group hover:scale-[1.01] transition-transform">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">local_fire_department</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface mb-2 font-headline">14-Day Learning Streak</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                    Consistency is key! Aarav has logged in and completed his daily missions for two weeks straight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Rail */}
        <aside className="col-span-12 lg:col-span-4 space-y-10">
          <div className="neumorphic-flat p-8 rounded-[2.5rem]">
            <h3 className="font-label text-[10px] uppercase font-black tracking-widest text-secondary mb-6">HOW YOU CAN HELP</h3>
            <div className="neumorphic-inset p-6 rounded-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-sm">lightbulb</span>
                </div>
                <h4 className="font-bold text-sm text-on-surface font-body">Dinner Table Topic</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-body">
                Aarav is currently learning about Thermodynamics. Ask him to explain why ice melts faster on a metal spoon than a plastic one!
              </p>
              <button className="w-full py-4 rounded-full neumorphic-flat text-secondary font-label text-[10px] uppercase font-black tracking-widest hover:scale-[0.98] transition-transform border border-outline-variant/15">
                VIEW MORE IDEAS
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}