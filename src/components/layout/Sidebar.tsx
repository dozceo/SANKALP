"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavLink {
  name: string;
  href: string;
  icon: string;
}

const TEACHER_LINKS: NavLink[] = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: "dashboard" },
  { name: "Cohort Map", href: "/teacher/overview", icon: "group" },
  { name: "Interventions", href: "/teacher/interventions", icon: "warning" },
  { name: "Analytics", href: "/teacher/analytics", icon: "insights" },
];

const STUDENT_LINKS: NavLink[] = [
  { name: "Dashboard", href: "/student/dashboard", icon: "home" },
  { name: "Study Session", href: "/student/study", icon: "menu_book" },
  { name: "Revision", href: "/student/revision", icon: "psychology" },
  { name: "Brain Map", href: "/student/map", icon: "hub" },
  { name: "Progress", href: "/student/progress", icon: "trending_up" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isTeacher = pathname?.startsWith("/teacher");
  const isStudent = pathname?.startsWith("/student");
  
  const links = isTeacher ? TEACHER_LINKS : isStudent ? STUDENT_LINKS : [];

  return (
    <aside 
      className="w-20 md:w-72 h-screen flex-shrink-0 flex flex-col glass-strong z-40 transition-all duration-300 border-r-0"
      aria-label="Main Navigation"
    >
      <div className="p-6 flex items-center justify-center md:justify-start h-24">
        <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center bg-surface">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">psychology</span>
        </div>
        <div className="hidden md:flex flex-col ml-4">
          <span className="font-headline font-extrabold text-xl tracking-tight text-primary uppercase leading-none">
            Sankalp
          </span>
          <span className="label-md text-on-surface-variant mt-1">
            {isTeacher ? "Teacher Portal" : isStudent ? "Student Portal" : "AEI System"}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-3 overflow-y-auto" aria-label="Sidebar Links">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex items-center p-3 rounded-2xl transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute inset-0 bg-surface-container-low rounded-2xl neumorphic-pressed"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  aria-hidden="true"
                />
              )}
              
              <div className="relative z-10 flex items-center w-full">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'neumorphic-inset text-primary' : 'text-on-surface-variant group-hover:text-primary group-hover:scale-110'}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }} aria-hidden="true">
                    {link.icon}
                  </span>
                </div>
                <span className={`hidden md:block ml-4 font-body font-semibold text-sm transition-colors duration-300 ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                  {link.name}
                </span>
              </div>
            </Link>
          );
        })}

        {isTeacher && (
          <div className="hidden md:flex flex-col mt-8 p-5 rounded-3xl neumorphic-inset mx-2" aria-label="Cohort Mastery Beta Distribution">
            <span className="label-md text-on-surface-variant mb-2">Cohort Mastery</span>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-headline text-2xl font-extrabold text-primary">82%</span>
              <span className="font-body text-xs font-bold text-on-surface-variant mb-1">μ</span>
            </div>
            {/* Confidence Interval Band */}
            <div className="w-full h-2 rounded-full bg-surface-container-highest relative mt-2" aria-hidden="true">
              {/* CI Band: 75% to 89% */}
              <div className="absolute left-[75%] right-[11%] h-full bg-primary-container/50 rounded-full"></div>
              {/* Mean */}
              <div className="absolute left-[82%] w-1.5 h-3 -top-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(112,42,225,0.6)]"></div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="label-md text-on-surface-variant opacity-70">CI: 75-89%</span>
              <span className="label-md text-on-surface-variant opacity-70">β(82, 18)</span>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 mt-auto mb-6">
        <Link 
          href="/settings" 
          className="relative flex items-center p-3 rounded-2xl transition-all duration-300 group hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary outline-none"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-transform duration-500 group-hover:rotate-90">
            <span className="material-symbols-outlined" aria-hidden="true">settings</span>
          </div>
          <span className="hidden md:block ml-4 font-body font-semibold text-sm text-on-surface-variant group-hover:text-on-surface">
            Settings
          </span>
        </Link>
        
        <div className="hidden md:flex items-center mt-6 p-4 rounded-3xl neumorphic-flat mx-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold shadow-inner" aria-hidden="true">
            {isTeacher ? "Dr." : "JD"}
          </div>
          <div className="ml-3 flex flex-col">
            <span className="font-body font-bold text-sm text-on-surface">
              {isTeacher ? "Dr. Sarah Chen" : "John Doe"}
            </span>
            <span className="label-md text-on-surface-variant">
              {isTeacher ? "Physics Dept" : "Grade 11"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};