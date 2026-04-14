import React, { ReactNode } from "react";
import Link from "next/link";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Minimal TopAppBar for Auth Flow */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-primary font-headline uppercase hover:opacity-80 transition-opacity">
            SANKALP AEI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-bold hidden sm:inline-block">
              Need help?
            </span>
            <Link href="/support" className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center hover:scale-[0.98] transition-transform">
              <span className="material-symbols-outlined text-primary text-sm">help</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-20 px-6 w-full flex items-center justify-center">
        <div className="max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}