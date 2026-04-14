"use client";

import React from "react";
import { motion } from "framer-motion";
import type { DecisionAction, DecisionPriority } from "@/types";

export interface UpcomingTask {
  id: string;
  title: string;
  actionType: DecisionAction;
  priority: DecisionPriority;
  estimatedMinutes: number;
}

interface UpcomingTasksListProps {
  tasks: UpcomingTask[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 400, damping: 30 } 
  },
};

const getPriorityStyles = (priority: DecisionPriority) => {
  switch (priority) {
    case "critical":
    case "high":
      return "text-error border-error/20 bg-error/5";
    case "medium":
      return "text-warning border-warning/20 bg-warning/5";
    default:
      return "text-primary border-primary/20 bg-primary/5";
  }
};

export const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ tasks }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="neumorphic-flat glass p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden w-full"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
            ADK Prescriptions
          </h2>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
            Recommended Missions
          </h3>
        </div>
        <div className="px-4 py-1.5 neumorphic-inset text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10">
          {tasks.length} Active
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={itemVariants}
            className="neumorphic-flat p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {task.actionType === "urgent_revision" ? "model_training" : "explore"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityStyles(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    {task.estimatedMinutes}m
                  </span>
                </div>
                <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                  {task.title}
                </h4>
              </div>
            </div>

            <button 
              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[0.98] active:scale-95 transition-all uppercase tracking-widest"
              aria-label={`Start mission: ${task.title}`}
            >
              Initiate
            </button>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};