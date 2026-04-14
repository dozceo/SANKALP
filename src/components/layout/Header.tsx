import { ActorRole } from "@/types/common";

interface HeaderProps {
  role: ActorRole;
}

export default function Header({ role }: HeaderProps) {
  return (
    <header className="h-20 w-full flex items-center justify-between px-6 md:px-10 z-50 glass sticky top-0">
      {/* Mobile Menu Button - Hidden on Desktop */}
      <button 
        className="md:hidden w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center text-primary hover:scale-[0.98] transition-all active:neumorphic-pressed"
        aria-label="Open Menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Search Bar - Neomorphic Input Pattern */}
      <div className="hidden md:flex flex-1 max-w-md ml-4">
        <div className="neumorphic-inset p-2 rounded-full flex items-center px-5 w-full transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full py-2 placeholder:text-on-surface-variant/40 font-medium text-on-surface"
            placeholder="Search topics, modules, or metrics..."
            type="text"
            aria-label="Global Search"
          />
        </div>
      </div>

      {/* Right Actions & Metadata */}
      <div className="flex items-center gap-6 ml-auto">
        
        {/* Mastery/Status Indicator - Strict Rule: Beta distribution CI, never point estimates */}
        <div className="hidden lg:flex flex-col items-end mr-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            Global Mastery
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-headline font-extrabold text-primary text-base">
              72-89%
            </span>
            <span className="text-on-surface-variant/60 font-medium text-[10px] uppercase tracking-wider">
              (95% CI)
            </span>
          </div>
        </div>

        {/* Primary CTA - Gradient Pill Pattern */}
        <button className="hidden md:block px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-fixed text-white font-black text-xs tracking-[0.2em] hover:scale-[1.02] transition-all active:shadow-inner uppercase shadow-[0_8px_16px_rgba(112,42,225,0.2)]">
          Start Session
        </button>

        {/* Notifications - Icon Circle Pattern */}
        <button 
          className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center hover:scale-[1.02] transition-all group relative active:neumorphic-pressed"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
            notifications
          </span>
          {/* Notification Badge */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface"></span>
        </button>

        {/* User Profile - Icon Circle Pattern */}
        <button 
          className="flex items-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.98]"
          aria-label="User Profile"
        >
          <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-primary/15 transition-all">
            <span 
              className="material-symbols-outlined text-primary" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}