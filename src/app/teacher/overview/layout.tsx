import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Overview | SANKALP AEI",
  description: "Teacher cohort overview and Bayesian mastery distributions.",
};

export default function TeacherOverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full w-full flex flex-col relative">
      {/* 
        The global layout handles the Sidebar and Header. 
        This layout acts as a specific context provider or wrapper for the overview section.
        We use a subtle background shift to ensure the neumorphic elements pop.
      */}
      <div className="flex-1 w-full max-w-screen-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}