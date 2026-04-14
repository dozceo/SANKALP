import Link from "next/link";
import { ActorRole, ROLE_DASHBOARDS } from "@/types/common";

interface SidebarProps {
  role: ActorRole;
}

export default function Sidebar({ role }: SidebarProps) {
  // Navigation items tailored to the Cognitive Architect design
  const navItems = [
    { icon: "space_dashboard", label: "Dashboard", href: ROLE_DASHBOARDS[role], active: true },
    { icon: "psychology", label: "Brain Map™", href: `/${role}/brain-map`, active: false },
    { icon: "analytics", label: "Metacognition", href: `/${role}/metacognition`, active: false },
    { icon: "route", label: "Learning Path", href: `/${role}/path`, active: false },
    { icon: "settings", label: "Config", href: `/${role}/settings`, active: false },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] my-4 ml-4 p-6 neumorphic-flat rounded-[2.5rem] z-40 transition-all">
      {/* Logo Area */}
      <div className="flex items-center gap-4 mb-12 px-2 hover:scale-[1.02] transition-transform cursor-pointer">
        <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
          <span 
            className="material-symbols-outlined text-primary text-2xl" 
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            auto_awesome
          </span>
        </div>
        <h1 className="font-headline font-extrabold text-2xl text-primary tracking-tight">
          SANKALP
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2 px-4">
          Main Menu
        </div>
        
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              item.active 
                ? "neumorphic-inset text-primary" 
                : "text-on-surface-variant hover:text-primary hover:neumorphic-flat hover:scale-[1.02]"
            }`}
            aria-current={item.active ? "page" : undefined}
          >
            <span 
              className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform"
              style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-body font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Role Indicator */}
      <div className="mt-auto pt-8">
        <div className="neumorphic-inset p-5 rounded-3xl flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-tertiary">
              {role === "student" ? "school" : role === "teacher" ? "history_edu" : "shield_person"}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            {role} Portal
          </span>
        </div>
      </div>
    </aside>
  );
}