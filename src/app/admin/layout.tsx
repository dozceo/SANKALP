import React, { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-full space-y-8">
      {/* Admin Sub-navigation Shell */}
      <nav className="neumorphic-flat p-4 rounded-[2rem] flex items-center gap-8 px-8 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-4 mr-4 shrink-0">
          <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
            <span 
              className="material-symbols-outlined text-primary" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              admin_panel_settings
            </span>
          </div>
          <span className="font-headline font-extrabold text-xl tracking-tight text-primary uppercase">
            Admin Cockpit
          </span>
        </div>
        
        <Link 
          href="/admin/dashboard" 
          className="text-sm font-bold text-primary border-b-2 border-primary pb-1 shrink-0"
        >
          System Health
        </Link>
        <Link 
          href="/admin/users" 
          className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          User Management
        </Link>
        <Link 
          href="/admin/models" 
          className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          ML Models
        </Link>
        <Link 
          href="/admin/config" 
          className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          Configuration
        </Link>
      </nav>

      {/* Main Admin Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}