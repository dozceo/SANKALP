"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

// --- Types ---
interface Confidence {
  lowerBound: number;
  upperBound: number;
}

interface TopicMastery {
  id: string;
  title: string;
  subject: string;
  mastery: number; // Mean probability
  confidence: Confidence;
  alpha: number;
  beta: number;
  icon: string;
  struggleFlags?: string[];
}

// --- Mock Data ---
const STUDY_TOPICS: TopicMastery[] = [
  {
    id: "topic-1",
    title: "Quantum Superposition",
    subject: "Advanced Physics",
    mastery: 0.82,
    confidence: { lowerBound: 0.75, upperBound: 0.89 },
    alpha: 45,
    beta: 10,
    icon: "all_inclusive",
  },
  {
    id: "topic-2",
    title: "Bayesian Inference",
    subject: "Probability & Statistics",
    mastery: 0.65,
    confidence: { lowerBound: 0.45, upperBound: 0.85 }, // Wide CI = High Uncertainty
    alpha: 12,
    beta: 8,
    icon: "query_stats",
    struggleFlags: ["formula_recall"],
  },
  {
    id: "topic-3",
    title: "Cellular Respiration",
    subject: "Biology",
    mastery: 0.91,
    confidence: { lowerBound: 0.88, upperBound: 0.94 },
    alpha: 120,
    beta: 12,
    icon: "biotech",
  },
];

export default function StudyPage() {
  const [activeTopic, setActiveTopic] = useState<TopicMastery | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Calculate opacity based on CI width (wider CI = more transparent)
  const getUncertaintyOpacity = (ci: Confidence) => {
    const width = ci.upperBound - ci.lowerBound;
    // Max opacity 1.0 (narrow CI), Min opacity 0.4 (wide CI)
    return Math.max(0.4, 1 - width * 1.5);
  };

  return (
    <div className="min-h-full flex flex-col relative">
      {/* Header */}
      <header className="mb-12">
        <span className="label-md text-primary mb-4 block">Deep Work Pipeline</span>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
          Cognitive Focus Mode
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl font-body">
          Select a module to enter deep work. Mastery is tracked continuously using Bayesian probability distributions.
        </p>
      </header>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {STUDY_TOPICS.map((topic) => {
          const opacity = getUncertaintyOpacity(topic.confidence);
          
          return (
            <motion.div
              key={topic.id}
              layoutId={`card-${topic.id}`}
              onClick={() => setActiveTopic(topic)}
              className="neumorphic-flat rounded-3xl p-8 cursor-pointer hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full relative overflow-hidden group"
            >
              {/* Top Row: Icon & Subject */}
              <div className="flex items-center justify-between mb-8">
                <motion.div layoutId={`icon-${topic.id}`} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
                  <MaterialIcon name={topic.icon} className="text-primary text-xl" />
                </motion.div>
                <span className="label-md text-on-surface-variant">{topic.subject}</span>
              </div>

              {/* Title */}
              <motion.h3 layoutId={`title-${topic.id}`} className="font-headline text-2xl font-bold text-on-surface mb-6 flex-1">
                {topic.title}
              </motion.h3>

              {/* Bayesian Mastery Display */}
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-3">
                  <span className="label-md text-on-surface-variant">Estimated Mastery</span>
                  <motion.span 
                    layoutId={`mastery-${topic.id}`} 
                    className="font-headline font-extrabold text-primary text-xl"
                    style={{ opacity }}
                  >
                    {(topic.confidence.lowerBound * 100).toFixed(0)}–{(topic.confidence.upperBound * 100).toFixed(0)}%
                  </motion.span>
                </div>
                
                {/* Progress Track */}
                <div className="w-full h-3 neumorphic-pressed rounded-full overflow-hidden bg-surface-container-highest relative">
                  <motion.div
                    layoutId={`progress-${topic.id}`}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-fixed rounded-full"
                    style={{ 
                      width: `${topic.mastery * 100}%`,
                      opacity 
                    }}
                  />
                </div>
                
                {/* Struggle Flags */}
                {topic.struggleFlags && topic.struggleFlags.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {topic.struggleFlags.map(flag => (
                      <span key={flag} className="px-3 py-1 rounded-full bg-warning/10 text-warning label-md flex items-center gap-1">
                        <MaterialIcon name="warning" className="text-[10px]" filled />
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {activeTopic && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveTopic(null);
                setSelectedOption(null);
              }}
              className="fixed inset-0 z-40 bg-surface/60 backdrop-blur-xl"
            />

            {/* Expanded Card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div
                layoutId={`card-${activeTopic.id}`}
                className="glass-strong w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] p-8 md:p-12 flex flex-col pointer-events-auto overflow-y-auto shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <motion.div layoutId={`icon-${activeTopic.id}`} className="w-14 h-14 rounded-full neumorphic-inset flex items-center justify-center">
                      <MaterialIcon name={activeTopic.icon} className="text-primary text-2xl" />
                    </motion.div>
                    <div>
                      <span className="label-md text-primary block mb-1">Focus Mode Active</span>
                      <motion.h2 layoutId={`title-${activeTopic.id}`} className="font-headline text-3xl font-extrabold text-on-surface">
                        {activeTopic.title}
                      </motion.h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTopic(null);
                      setSelectedOption(null);
                    }}
                    className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-[0.95] transition-all"
                    aria-label="Close Focus Mode"
                  >
                    <MaterialIcon name="close" />
                  </button>
                </div>

                {/* Active Learning Area */}
                <div className="flex-1 flex flex-col">
                  <div className="mb-8">
                    <span className="label-md text-on-surface-variant mb-4 block">Current Challenge</span>
                    <p className="text-xl md:text-2xl font-body text-on-surface leading-relaxed font-medium">
                      In the context of Bayesian inference, how does a wider credible interval (CI) influence the system's next action?
                    </p>
                  </div>

                  {/* Options */}
                  <div className="flex flex-col gap-4 mb-10">
                    {[
                      "It assumes mastery is achieved and skips the topic.",
                      "It triggers a 'scaffold' teaching strategy to reduce uncertainty.",
                      "It permanently lowers the student's overall grade.",
                      "It narrows the interval automatically after 24 hours."
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`text-left p-6 rounded-2xl transition-all duration-300 font-body text-lg ${
                          selectedOption === idx 
                            ? "neumorphic-pressed text-primary" 
                            : "neumorphic-inset text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            selectedOption === idx ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          {opt}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-auto flex items-center justify-between pt-6 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent" />
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="label-md text-on-surface-variant mb-1">Current State</span>
                        <motion.span 
                          layoutId={`mastery-${activeTopic.id}`} 
                          className="font-headline font-bold text-primary"
                          style={{ opacity: getUncertaintyOpacity(activeTopic.confidence) }}
                        >
                          Beta({activeTopic.alpha}, {activeTopic.beta})
                        </motion.span>
                      </div>
                      <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors label-md">
                        <MaterialIcon name="lightbulb" className="text-lg" />
                        Request Hint
                      </button>
                    </div>
                    
                    <button 
                      disabled={selectedOption === null}
                      className={`px-10 py-5 rounded-full font-black text-sm tracking-widest uppercase transition-all duration-300 ${
                        selectedOption !== null 
                          ? "bg-gradient-to-r from-primary to-primary-container text-white shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[0.98]" 
                          : "neumorphic-flat text-on-surface-variant/50 cursor-not-allowed"
                      }`}
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}