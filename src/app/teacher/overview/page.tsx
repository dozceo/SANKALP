"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface BayesianStudent {
  id: string;
  name: string;
  avatarUrl: string;
  ciLower: number; // 95% Credible Interval Lower Bound (0-100)
  ciUpper: number; // 95% Credible Interval Upper Bound (0-100)
  trend: "improving" | "stable" | "declining";
  struggleFlags: string[];
  lastActive: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

// --- Mock Data (Bayesian Enriched) ---
const MOCK_STUDENTS: BayesianStudent[] = [
  {
    id: "stu_1",
    name: "Elara Vance",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop",
    ciLower: 82,
    ciUpper: 94,
    trend: "improving",
    struggleFlags: [],
    lastActive: "2 mins ago",
    riskLevel: "low",
  },
  {
    id: "stu_2",
    name: "Julian Thorne",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
    ciLower: 45,
    ciUpper: 78, // Wide CI = High Uncertainty
    trend: "declining",
    struggleFlags: ["Chain Rule", "Sign Errors"],
    lastActive: "1 day ago",
    riskLevel: "high",
  },
  {
    id: "stu_3",
    name: "Maya Lin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    ciLower: 71,
    ciUpper: 79,
    trend: "stable",
    struggleFlags: [],
    lastActive: "1 hr ago",
    riskLevel: "low",
  },
  {
    id: "stu_4",
    name: "Caleb Foster",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    ciLower: 58,
    ciUpper: 65,
    trend: "declining",
    struggleFlags: ["Integration by Parts"],
    lastActive: "3 hrs ago",
    riskLevel: "medium",
  },
  {
    id: "stu_5",
    name: "Aria Solis",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop",
    ciLower: 22,
    ciUpper: 41,
    trend: "declining",
    struggleFlags: ["Limits", "Derivatives", "Focus Loss"],
    lastActive: "2 days ago",
    riskLevel: "critical",
  },
];

const HISTOGRAM_DATA = [12, 18, 35, 45, 60, 85, 90, 65, 40, 25, 15, 10];

// --- Components ---

const MaterialIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
    {name}
  </span>
);

export default function ClassOverviewPage() {
  const [sortBy, setSortBy] = useState<"name" | "mastery" | "risk">("risk");

  // Sort logic based on Bayesian properties
  const sortedStudents = useMemo(() => {
    return [...MOCK_STUDENTS].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "mastery") {
        // Sort by the lower bound of the credible interval
        return b.ciLower - a.ciLower;
      }
      if (sortBy === "risk") {
        const riskWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
      }
      return 0;
    });
  }, [sortBy]);

  return (
    <div className="space-y-12 pb-24 animate-fadeIn">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="font-label text-primary font-semibold tracking-widest text-[10px] uppercase">
            Cognitive Dashboard
          </p>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
            AP Calculus <span className="text-primary opacity-40">(Block A)</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl text-sm">
            Cohort Overview for Grade 10 spring semester. Analyzing bimodal distributions and concept-specific mastery gaps.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center text-primary hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <MaterialIcon name="tune" />
          </button>
          <button className="px-8 py-4 rounded-full font-black text-white bg-gradient-to-r from-primary to-primary-container shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-transform uppercase tracking-widest text-xs">
            Generate Report
          </button>
        </div>
      </section>

      {/* Bento Grid: Class Summary & Distributions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Summary Card */}
        <div className="lg:col-span-4 rounded-3xl p-8 neumorphic-flat flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-headline text-xl font-bold">Class Summary</h3>
                <p className="text-xs text-on-surface-variant">Active: 28 Enrolled Students</p>
              </div>
              <div className="neumorphic-inset w-12 h-12 flex items-center justify-center rounded-full">
                <MaterialIcon name="hub" className="text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="neumorphic-inset p-5 rounded-2xl">
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold font-label">
                  Absentees
                </p>
                <p className="text-3xl font-black mt-1 font-headline">2</p>
              </div>
              <div className="neumorphic-inset p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error/50"></div>
                <p className="text-[10px] uppercase tracking-wider text-error font-bold font-label">
                  At-Risk
                </p>
                <p className="text-3xl font-black text-error mt-1 font-headline">6</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider font-label">
                <span>Class Mastery CI</span>
                <span className="text-primary">
                  64-72% <span className="text-tertiary ml-1">↑</span>
                </span>
              </div>
              {/* Class Mastery Uncertainty Bar */}
              <div className="h-3 w-full neumorphic-pressed rounded-full overflow-hidden relative">
                <div 
                  className="absolute h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                  style={{ left: '64%', width: '8%', opacity: 0.9 }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium italic">
                Beta(α,β) Aggregate Distribution
              </p>
            </div>
          </div>
          <button className="mt-8 w-full py-4 rounded-full font-black text-white bg-gradient-to-r from-primary to-primary-container shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-xs">
            Launch Oracle AI Analysis
          </button>
        </div>

        {/* Performance Distribution */}
        <div className="lg:col-span-8 rounded-3xl p-8 neumorphic-flat flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-headline text-xl font-bold italic">'Logarithms' Distribution</h3>
              <p className="text-sm text-on-surface-variant">Bimodal pattern identified across 28 students</p>
            </div>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 neumorphic-inset rounded-full text-[10px] font-bold uppercase tracking-widest font-label text-primary">
                CI Width: ±8%
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 px-6 relative min-h-[200px]">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-10 px-6">
              <div className="w-full border-t border-on-surface"></div>
              <div className="w-full border-t border-on-surface"></div>
              <div className="w-full border-t border-on-surface"></div>
            </div>
            
            {/* Histogram Bars */}
            {HISTOGRAM_DATA.map((height, i) => (
              <div 
                key={i} 
                className="w-full bg-surface-container-highest rounded-t-lg relative group transition-all duration-300 hover:bg-primary-container/50"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-surface text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none z-10">
                  {height}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-6 mt-4 text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
            <span>0%</span>
            <span>Mastery Probability</span>
            <span>100%</span>
          </div>
        </div>
      </section>

      {/* Animated Student List Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="font-headline text-2xl font-bold">Cohort Intelligence</h2>
          
          {/* Neumorphic Toggle Group */}
          <div className="flex p-1 neumorphic-inset rounded-full">
            {(["risk", "mastery", "name"] as const).map((sortType) => (
              <button
                key={sortType}
                onClick={() => setSortBy(sortType)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  sortBy === sortType 
                    ? "neumorphic-flat text-primary" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {sortType}
              </button>
            ))}
          </div>
        </div>

        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-2 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
          <div className="col-span-3">Student</div>
          <div className="col-span-4">Mastery Probability (CI)</div>
          <div className="col-span-3">Active Struggles</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Animated List */}
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {sortedStudents.map((student) => {
              // Calculate uncertainty visualization properties
              const ciWidth = student.ciUpper - student.ciLower;
              // Wider CI = more uncertainty = lower opacity
              const ciOpacity = Math.max(0.25, 1 - (ciWidth / 60)); 
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  key={student.id}
                  className="grid grid-cols-12 gap-4 items-center p-4 pr-8 rounded-3xl neumorphic-flat hover:scale-[1.01] transition-transform duration-300 bg-surface"
                >
                  {/* Identity */}
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full neumorphic-inset p-1">
                      <img 
                        src={student.avatarUrl} 
                        alt={student.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{student.name}</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium">
                        Active {student.lastActive}
                      </p>
                    </div>
                  </div>

                  {/* Bayesian Mastery Visualization */}
                  <div className="col-span-4 pr-8">
                    <div className="flex justify-between mb-2 text-xs font-bold">
                      <span className="text-on-surface-variant">
                        {student.ciLower}% - {student.ciUpper}%
                      </span>
                      <span className="flex items-center gap-1">
                        {student.trend === "improving" && <MaterialIcon name="trending_up" className="text-tertiary text-sm" />}
                        {student.trend === "declining" && <MaterialIcon name="trending_down" className="text-error text-sm" />}
                        {student.trend === "stable" && <MaterialIcon name="trending_flat" className="text-on-surface-variant text-sm" />}
                      </span>
                    </div>
                    {/* Uncertainty Bar */}
                    <div className="h-2 w-full neumorphic-pressed rounded-full relative overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
                        style={{ 
                          left: `${student.ciLower}%`, 
                          width: `${ciWidth}%`,
                          opacity: ciOpacity
                        }}
                      />
                    </div>
                  </div>

                  {/* Struggle Flags */}
                  <div className="col-span-3 flex flex-wrap gap-2">
                    {student.struggleFlags.length === 0 ? (
                      <span className="text-xs text-on-surface-variant italic">No active flags</span>
                    ) : (
                      student.struggleFlags.map(flag => (
                        <span 
                          key={flag} 
                          className="px-3 py-1 rounded-full neumorphic-inset text-[10px] font-label text-error uppercase tracking-wider"
                        >
                          {flag}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex justify-end">
                    <button className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center text-primary hover:text-primary-container transition-colors group">
                      <MaterialIcon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}