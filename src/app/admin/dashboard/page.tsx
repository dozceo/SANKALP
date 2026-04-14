import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            System Cockpit
          </h1>
          <p className="text-on-surface-variant text-lg font-body">
            Global ML Inference & Platform Health
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>dns</span>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">SYSTEM STATUS</p>
              <p className="text-lg font-bold text-tertiary tracking-tighter leading-none">Operational</p>
            </div>
          </div>
          <div className="neumorphic-flat px-6 py-4 rounded-3xl flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">INFERENCE LATENCY</p>
              <p className="text-lg font-bold text-primary tracking-tighter leading-none">42ms</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Left Rail */}
        <section className="col-span-12 lg:col-span-8 space-y-10">
          <div className="neumorphic-flat p-10 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-label text-[10px] uppercase font-black tracking-widest text-primary">ML MODEL CONFIDENCE (BETA DISTRIBUTIONS)</h2>
              <span className="px-3 py-1 rounded-full neumorphic-inset font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant">Live</span>
            </div>
            
            <div className="space-y-6">
              {[
                { model: 'Mastery Prediction (LightGBM)', ci: '±4.2%', status: 'Optimal' },
                { model: 'Attention Risk (XGBoost)', ci: '±6.8%', status: 'Acceptable' },
                { model: 'Forgetting Curve (SM-2+)', ci: '±3.1%', status: 'Optimal' },
              ].map((model) => (
                <div key={model.model} className="neumorphic-inset p-6 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">memory</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface font-body">{model.model}</p>
                      <p className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mt-1">AVG CI WIDTH: {model.ci}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full font-label text-[10px] uppercase font-black tracking-widest ${model.status === 'Optimal' ? 'bg-tertiary/10 text-tertiary' : 'bg-warning/10 text-warning'}`}>
                    {model.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Rail */}
        <aside className="col-span-12 lg:col-span-4 space-y-10">
          <div className="neumorphic-flat p-8 rounded-[2.5rem]">
            <h3 className="font-label text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-6">ACTIVE INTERVENTIONS</h3>
            <div className="space-y-4">
              <div className="neumorphic-inset p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-on-surface font-body">Critical Risks</p>
                  <p className="text-xs text-on-surface-variant mt-1 font-body">Requires immediate action</p>
                </div>
                <span className="text-2xl font-black text-error">12</span>
              </div>
              <div className="neumorphic-inset p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-on-surface font-body">High Risks</p>
                  <p className="text-xs text-on-surface-variant mt-1 font-body">Monitor closely</p>
                </div>
                <span className="text-2xl font-black text-warning">48</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}