"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export const Header: React.FC = () => {
  const pathname = usePathname();
  
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const segments = pathname?.split("/").filter(Boolean) || [];
  const pageTitle = segments.length > 1 
    ? segments[segments.length - 1].replace(/-/g, " ")
    : "Dashboard";

  return (
    <header 
      className="h-24 flex-shrink-0 flex items-center justify-between px-6 md:px-10 glass z-30 sticky top-0"
      aria-label="Global Header"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <motion.h1 
            key={pageTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface capitalize"
          >
            {pageTitle}
          </motion.h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="label-md text-primary">
              {segments[0] === "teacher" ? "Cohort Analysis" : "Learning Session"}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant/50" aria-hidden="true"></span>
            <span className="label-md text-on-surface-variant">
              Live Sync Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Global Search */}
        <div className="hidden md:flex neumorphic-inset p-1 rounded-full items-center px-4 w-64 transition-all focus-within:w-80">
          <span className="material-symbols-outlined text-on-surface-variant text-lg" aria-hidden="true">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-2.5 px-3 placeholder:text-on-surface-variant/50 font-medium text-on-surface outline-none"
            placeholder="Search students, topics..." 
            type="text"
            aria-label="Global Search"
          />
          <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center" aria-hidden="true">
            <span className="text-[10px] font-bold text-on-surface-variant">⌘K</span>
          </div>
        </div>

        {/* Notifications */}
        <button 
          className="relative w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform" aria-hidden="true">notifications</span>
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-error rounded-full shadow-[0_0_8px_rgba(180,19,64,0.6)]" aria-hidden="true"></span>
        </button>

        {/* Action Button */}
        <button 
          className="hidden sm:flex px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(112,42,225,0.2)] uppercase items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface outline-none"
          aria-label="Create New Action"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
          New Action
        </button>
      </div>
    </header>
  );
};