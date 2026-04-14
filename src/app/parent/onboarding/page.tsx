import { Heart, BookOpen, Activity } from "lucide-react";

export default function ParentOnboardingPage() {
  return (
    <div className="w-full max-w-4xl bg-[#E9EFF2] rounded-lg p-8 md:p-12 neumorphic-extruded flex flex-col gap-10 z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl"><p className="font-label text-sm uppercase tracking-widest text-[#815600] font-bold mb-3">Onboarding Step 02</p><h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-none mb-4">Stay Connected</h1><p className="text-on-surface-variant text-lg leading-relaxed">Understand your child&apos;s journey in plain language.</p></div>
        <div className="flex gap-3 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-surface-dim neumorphic-debossed"></div><div className="w-8 h-2.5 rounded-full bg-primary shadow-sm"></div><div className="w-2.5 h-2.5 rounded-full bg-surface-dim neumorphic-debossed"></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-surface-container-low rounded-lg p-6 neumorphic-card-sm flex flex-col gap-6">
          <div className="flex justify-between items-center"><span className="font-bold text-sm text-on-surface-variant">DAILY FOCUS</span><Heart size={20} className="text-tertiary" /></div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Language Arts</span>
            <div className="h-4 w-full bg-surface-container-highest rounded-full neumorphic-debossed relative overflow-hidden"><div className="absolute inset-y-0 left-0 w-[75%] bg-tertiary rounded-full"></div></div>
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Logical Reasoning</span>
            <div className="h-4 w-full bg-surface-container-highest rounded-full neumorphic-debossed relative overflow-hidden"><div className="absolute inset-y-0 left-0 w-[45%] bg-tertiary rounded-full"></div></div>
          </div>
          <div className="mt-auto pt-4 border-t border-surface-variant/30 text-center"><p className="text-2xl font-headline font-bold text-primary">84%</p><p className="text-[10px] font-bold uppercase text-outline">Weekly Average</p></div>
        </div>
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-surface rounded-lg p-5 neumorphic-card-sm flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner shrink-0"><BookOpen size={24} /></div><div><h4 className="font-bold text-on-surface">Weekly Milestone</h4><p className="text-sm text-on-surface-variant line-clamp-2">Aarav completed 5 collaborative tasks without intervention.</p></div></div>
          <div className="bg-surface-container-lowest rounded-lg p-5 neumorphic-card-sm border-l-4 border-primary"><div className="flex items-center gap-2 mb-2"><Activity className="text-primary" size={16} /><span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Insight of the Week</span></div><p className="text-sm italic text-on-surface-variant font-medium leading-snug">&quot;Visual cues significantly improved retention during science modules.&quot;</p></div>
        </div>
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="bg-surface-container-low rounded-lg p-4 neumorphic-card-sm flex flex-col items-center justify-center text-center gap-2"><div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-container text-white shadow-lg"><Heart size={28} /></div><div><p className="text-xs font-bold text-outline uppercase">Wellbeing</p><p className="font-bold text-on-surface">Thriving</p></div></div>
          <div className="bg-surface rounded-lg p-4 neumorphic-card-sm flex flex-col items-center justify-center text-center gap-2"><div className="relative w-16 h-16 flex items-center justify-center"><svg className="absolute inset-0 w-full h-full -rotate-90"><circle className="text-surface-variant" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle><circle className="text-tertiary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="40" strokeWidth="6"></circle></svg><Activity className="text-tertiary" size={24} /></div><div><p className="text-xs font-bold text-outline uppercase">Focus</p><p className="font-bold text-on-surface">Very High</p></div></div>
        </div>
      </div>
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-surface-variant/50">
        <button className="text-on-surface-variant font-bold px-8 py-3 rounded-full hover:bg-surface-container-high transition-all active:scale-95 bg-transparent border-none">Skip Preview</button>
        <button className="bg-primary text-white font-bold px-12 py-4 rounded-full shadow-[6px_6px_15px_#B8C5D1] hover:brightness-110 active:scale-95 transition-all text-lg border-none">Next</button>
      </footer>
    </div>
  );
}
