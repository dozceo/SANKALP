import Link from "next/link";
import { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-full w-full space-y-8 animate-fadeIn">
      {/* Parent Sub-Navigation Shell */}
      <nav className="w-full max-w-[1600px] mx-auto flex gap-6">
        <div className="neumorphic-flat p-2 rounded-full flex items-center gap-2">
          <Link 
            href="/parent/dashboard" 
            className="px-6 py-3 rounded-full neumorphic-inset text-primary font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Dashboard
          </Link>
          <Link 
            href="/parent/onboarding" 
            className="px-6 py-3 rounded-full text-on-surface-variant font-bold text-[10px] uppercase tracking-widest hover:text-primary hover:bg-surface-container-low transition-all"
          >
            Onboarding & Setup
          </Link>
        </div>
      </nav>
      
      <div className="flex-1 w-full max-w-[1600px] mx-auto">
        {children}
      </div>
    </div>
  );
}