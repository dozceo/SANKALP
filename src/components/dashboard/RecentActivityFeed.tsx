"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ActivityEvent {
  id: string;
  type: "assessment" | "deep_work" | "breakthrough" | "struggle";
  topic: string;
  description: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  activities: ActivityEvent[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

const getIconForType = (type: ActivityEvent["type"]) => {
  switch (type) {
    case "assessment": return { icon: "quiz", color: "text-secondary" };
    case "deep_work": return { icon: "psychology", color: "text-primary" };
    case "breakthrough": return { icon: "tips_and_updates", color: "text-tertiary" };
    case "struggle": return { icon: "timeline", color: "text-warning" };
    default: return { icon: "history", color: "text-on-surface-variant" };
  }
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      className="neumorphic-flat glass p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden w-full"
    >
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-2">
            Interaction Stream
          </h2>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
            Recent Activity
          </h3>
        </div>
        <button 
          className="w-10 h-10 rounded-full neumorphic-flat flex items-center justify-center group hover:scale-[0.95] transition-transform active:shadow-inner"
          aria-label="View all activity"
        >
          <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">
            arrow_forward
          </span>
        </button>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        {activities.map((activity) => {
          const { icon, color } = getIconForType(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className="neumorphic-flat p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-lg ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {activity.topic}
                  </p>
                  <p className="text-xs font-medium text-on-surface-variant">
                    {activity.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0 pl-4">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  {activity.timestamp}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
};