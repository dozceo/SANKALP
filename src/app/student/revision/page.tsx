"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Confidence {
  lowerBound: number;
  upperBound: number;
}

interface RevisionTopic {
  id: string;
  title: string;
  subject: string;
  urgency: "low" | "medium" | "high" | "critical";
  daysUntilForget: number;
  retentionProbability: number;
  confidence: Confidence;
  icon: string;
}

// --- Mock Data ---
const REVISION_QUEUE: RevisionTopic[] = [
  {
    id: "rev-1",
    title: "Action Potentials",
    subject: "Neurobiology",
    urgency: "critical",
    daysUntilForget: 0,
    retentionProbability: 0.42,
    confidence: { lowerBound: 0.35, upperBound: 0.51 },
    icon: "bolt",
  },
  {
    id: "rev-2",
    title: "Integration by Parts",
    subject: "Calculus II",
    urgency: "high",
    daysUntilForget: 2,
    retentionProbability: 0.68,
    confidence: { lowerBound: 0.60, upperBound: 0.75 },
    icon: "functions",
  },
  {
    id: "rev-3",
    title: "Thermodynamics Laws",
    subject: "Physics",
    urgency: "medium",
    daysUntilForget: 5,
    retentionProbability: 0.81,
    confidence: { lowerBound: 0.78, upperBound: 0.85 },
    icon: "mode_heat",
  },
];

// --- Components ---
const MaterialIcon: React.FC<{ name: string; filled?: boolean; className?: string }> = ({
  name,
  filled = false,
  className = "",
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    aria-hidden="true"
  >
    {name}
  </span>
);

export default function RevisionPage() {
  const [activeRevision, setActiveRevision] = useState<RevisionTopic | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const getUrgencyColor = (urgency: RevisionTopic["urgency"]) => {
    switch (urgency) {
      case "critical": return "text-error bg-error/10";
      case "high": return "text-warning bg-warning/10";
      case "medium": return "text-primary bg-primary/10";
      case "low": return "text-tertiary bg-tertiary/10";
    }
  };

  const getUncertaintyOpacity = (ci: Confidence) => {
    const width = ci.upperBound - ci.lowerBound;
    return Math.max(0.4, 1 - width * 2);
  };

  const handleClose = () => {
    setActiveRevision(null);
    setTimeout(() => setIsRevealed(false), 300); // Reset after animation
  };

  return (
    <div className="min-h-full flex flex-col relative">
      {/* Header */}
      <header className="mb-12">
        <span className="label-md text-warning mb-4 block">Spaced Repetition Engine</span>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
          Revision Queue
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl font-body">
          Strengthen fading neural pathways. Topics are prioritized based on your personalized Ebbinghaus forgetting curve.
        </p>
      </header>

      {/* Revision List */}
      <div className="flex flex-col gap-6 max-w-4xl">
        {REVISION_QUEUE.map((topic) => {
          const opacity = getUncertaintyOpacity(topic.confidence);
          const urgencyStyle = getUrgencyColor(topic.urgency);

          return (
            <motion.div
              key={topic.id}
              layoutId={`rev-card-${topic.id}`}
              onClick={() => setActiveRevision(topic)}
              className="neumorphic-flat rounded-3xl p-6 md:p-8 cursor-pointer hover:scale-[1.01] transition-transform duration-300 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden group"
            >
              {/* Icon */}
              <motion.div layoutId={`rev-icon-${topic.id}`} className="w-14 h-14 shrink-0 rounded-full neumorphic-inset flex items-center justify-center">
                <MaterialIcon name={topic.icon} className="text-primary text-2xl" />
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`label-md px-3 py-1 rounded-full ${urgencyStyle}`}>
                    {topic.urgency} Risk
                  </span>
                  <span className="label-md text-on-surface-variant">{topic.subject}</span>
                </div>
                <motion.h3 layoutId={`rev-title-${topic.id}`} className="font-headline text-2xl font-bold text-on-surface">
                  {topic.title}
                </motion.h3>
              </div>

              {/* Stats */}
              <div className="flex flex-row md:flex-col gap-6 md:gap-2 items-center md:items-end shrink-0">
                <div className="flex flex-col items-start md:items-end">
                  <span className="label-md text-on-surface-variant mb-1">Retention Prob.</span>
                  <motion.span 
                    layoutId={`rev-prob-${topic.id}`}
                    className="font-headline font-extrabold text-xl text-primary"
                    style={{ opacity }}
                  >
                    {(topic.confidence.lowerBound * 100).toFixed(0)}–{(topic.confidence.upperBound * 100).toFixed(0)}%
                  </motion.span>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <span className="label-md text-on-surface-variant mb-1">Timeline</span>
                  <span className="font-body font-semibold text-on-surface">
                    {topic.daysUntilForget === 0 ? "Forget Today" : `Forget in ${topic.daysUntilForget} days`}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Focus Mode Overlay (Flashcard) */}
      <AnimatePresence>
        {activeRevision && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-surface/70 backdrop-blur-xl"
            />

            {/* Expanded Flashcard */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div
                layoutId={`rev-card-${activeRevision.id}`}
                className="glass-strong w-full max-w-3xl min-h-[60vh] rounded-[2.5rem] p-8 md:p-12 flex flex-col pointer-events-auto shadow-2xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <motion.div layoutId={`rev-icon-${activeRevision.id}`} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
                      <MaterialIcon name={activeRevision.icon} className="text-primary text-xl" />
                    </motion.div>
                    <div>
                      <span className="label-md text-primary block mb-1">Active Recall</span>
                      <motion.h2 layoutId={`rev-title-${activeRevision.id}`} className="font-headline text-2xl font-extrabold text-on-surface">
                        {activeRevision.title}
                      </motion.h2>
                    </div>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-[0.95] transition-all"
                  >
                    <MaterialIcon name="close" />
                  </button>
                </div>

                {/* Flashcard Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full">
                  <span className="label-md text-on-surface-variant mb-6">Prompt</span>
                  <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-tight mb-12">
                    Describe the sequence of ion channel events that generate an action potential.
                  </p>

                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      <motion.button
                        key="reveal-btn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setIsRevealed(true)}
                        className="px-10 py-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest uppercase shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[0.98] transition-all"
                      >
                        Reveal Concept
                      </motion.button>
                    ) : (
                      <motion.div
                        key="answer-area"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center"
                      >
                        <div className="w-full p-6 rounded-2xl neumorphic-inset mb-10 text-left">
                          <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                            1. Depolarization to threshold.<br/>
                            2. Voltage-gated Na+ channels open (rapid influx).<br/>
                            3. Na+ channels inactivate, K+ channels open (efflux/repolarization).<br/>
                            4. Hyperpolarization, then return to resting state via Na+/K+ pump.
                          </p>
                        </div>

                        <span className="label-md text-on-surface-variant mb-6">Rate your recall</span>
                        <div className="flex flex-wrap justify-center gap-4 w-full">
                          <button onClick={handleClose} className="flex-1 py-4 px-6 rounded-2xl neumorphic-flat text-error font-bold hover:scale-[0.98] transition-transform">
                            Hard
                          </button>
                          <button onClick={handleClose} className="flex-1 py-4 px-6 rounded-2xl neumorphic-flat text-warning font-bold hover:scale-[0.98] transition-transform">
                            Good
                          </button>
                          <button onClick={handleClose} className="flex-1 py-4 px-6 rounded-2xl neumorphic-flat text-tertiary font-bold hover:scale-[0.98] transition-transform">
                            Easy
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Stats */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-50 pointer-events-none">
                  <motion.span 
                    layoutId={`rev-prob-${activeRevision.id}`}
                    className="font-headline font-bold text-primary"
                  >
                    Prior Retention: {(activeRevision.confidence.lowerBound * 100).toFixed(0)}–{(activeRevision.confidence.upperBound * 100).toFixed(0)}%
                  </motion.span>
                  <span className="label-md text-on-surface-variant">
                    SM-2 Algorithm Active
                  </span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}