"use client";

import React from "react";
import { motion } from "framer-motion";
import type { BayesianTopicMastery } from "@/types";

interface ProgressWidgetProps {
  title?: string;
  topics: BayesianTopicMastery[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ 
  title = "Cognitive Mastery State", 
  topics 
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="neumorphic-flat glass p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden w-full"
    >
      {/* Ambient Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <header className="mb-8 relative z-10 flex justify-between items-end">
        <div>
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
            Bayesian Inference
          </h2>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
            {title}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            donut_small
          </span>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 relative z-10"
      >
        {topics.map((topic) => {
          // Rule: Mastery = Probability (Beta distribution)
          // Never show point estimates, always show CI ranges
          const lowerBound = Math.round((topic.ciLower ?? 0) * 100);
          const upperBound = Math.round((topic.ciUpper ?? 0) * 100);
          const meanMastery = Math.round(topic.mastery * 100);
          
          // Rule: Uncertainty visualization via opacity modulation
          // Wider CI = more uncertainty = more transparent
          const ciWidth = (topic.ciUpper ?? 0) - (topic.ciLower ?? 0);
          const fillOpacity = Math.max(0.3, 1 - ciWidth * 1.5);

          return (
            <motion.div 
              key={topic.topicId} 
              variants={itemVariants}
              className="group cursor-pointer"
            >
              <div className="flex justify-between items-end mb-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-sm text-primary">
                      {topic.struggleFlags?.length ? "warning" : "architecture"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {topic.topicId}
                    </p>
                    {topic.struggleFlags?.length ? (
                      <p className="text-[10px] font-black text-warning uppercase tracking-widest mt-1">
                        Intervention Recommended
                      </p>
                    ) : (
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">
                        Stable Trajectory
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-primary tracking-wider">
                    {lowerBound}% - {upperBound}%
                  </span>
                </div>
              </div>

              {/* Neumorphic Progress Track */}
              <div className="w-full h-4 neumorphic-pressed rounded-full overflow-hidden bg-surface-container-highest relative">
                {/* Animated Fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${meanMastery}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-[0_0_15px_rgba(112,42,225,0.4)]"
                  style={{ opacity: fillOpacity }}
                />
                {/* CI Indicator Band (Ghost overlay showing the spread) */}
                <motion.div
                  initial={{ width: 0, left: 0 }}
                  animate={{ 
                    width: `${upperBound - lowerBound}%`,
                    left: `${lowerBound}%` 
                  }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className="absolute top-0 h-full bg-white/20 rounded-full border-x border-white/40"
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
};