"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

// --- Types ---
// Adhering strictly to SANKALP-AEI Bayesian core principles
interface BayesianTopic {
  id: string;
  name: string;
  ciLower: number; // 95% credible interval lower bound
  ciUpper: number; // 95% credible interval upper bound
  uncertainty: number; // CI width
  trajectorySlope: number; // Momentum
  lastAssessed: string;
}

// --- Mock Data ---
// Never point estimates. Always Beta(α, β) distributions represented as CI ranges.
const MOCK_TOPICS: BayesianTopic[] = [
  {
    id: "t-01",
    name: "Quantum Superposition",
    ciLower: 0.78,
    ciUpper: 0.92,
    uncertainty: 0.14,
    trajectorySlope: 0.05,
    lastAssessed: "2 hours ago",
  },
  {
    id: "t-02",
    name: "Wave-Particle Duality",
    ciLower: 0.61,
    ciUpper: 0.85,
    uncertainty: 0.24,
    trajectorySlope: 0.12,
    lastAssessed: "1 day ago",
  },
  {
    id: "t-03",
    name: "Schrödinger Equation",
    ciLower: 0.45,
    ciUpper: 0.72,
    uncertainty: 0.27,
    trajectorySlope: -0.02,
    lastAssessed: "3 days ago",
  },
  {
    id: "t-04",
    name: "Heisenberg Uncertainty",
    ciLower: 0.88,
    ciUpper: 0.96,
    uncertainty: 0.08,
    trajectorySlope: 0.01,
    lastAssessed: "5 hours ago",
  },
];

// --- Helper Components ---

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

const AnimatedNumberRange: React.FC<{ lower: number; upper: number }> = ({ lower, upper }) => {
  const [displayLower, setDisplayLower] = useState(0);
  const [displayUpper, setDisplayUpper] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; // 1.5s

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // Easing function (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayLower(Math.round(ease * lower));
      setDisplayUpper(Math.round(ease * upper));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [lower, upper]);

  return (
    <span>
      {displayLower}–{displayUpper}%
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  lowerBound?: number;
  upperBound?: number;
  staticValue?: string;
  subtitle: string;
  icon: string;
  delay: number;
}> = ({ title, lowerBound, upperBound, staticValue, subtitle, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    className="neumorphic-flat p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center">
        <MaterialIcon name={icon} className="text-primary text-xl" />
      </div>
    </div>
    <h3 className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">
      {title}
    </h3>
    <div className="font-headline text-4xl font-extrabold text-on-surface mb-2">
      {staticValue ? (
        staticValue
      ) : (
        <AnimatedNumberRange lower={lowerBound || 0} upper={upperBound || 0} />
      )}
    </div>
    <p className="font-body text-sm text-on-surface-variant font-medium">
      {subtitle}
    </p>
  </motion.div>
);

const TrajectoryChart: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="glass-strong p-8 rounded-3xl relative overflow-hidden h-[340px] flex flex-col shadow-neumorphic-lg"
    >
      <div className="flex justify-between items-center mb-8 z-10">
        <h3 className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
          Cognitive Evolution (30 Days)
        </h3>
        <span className="px-3 py-1 rounded-full neumorphic-inset text-[10px] font-bold text-primary uppercase tracking-widest">
          Expanding
        </span>
      </div>
      
      <div className="flex-1 relative w-full">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible preserve-3d">
          {/* Bayesian Confidence Interval Band */}
          <motion.path
            d="M 0 28 Q 20 22, 40 24 T 80 12 T 100 8 L 100 18 T 80 22 T 40 32 Q 20 32, 0 38 Z"
            fill="var(--color-primary)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          {/* Mean Trajectory (Dashed to emphasize it's an estimate, not absolute) */}
          <motion.path
            d="M 0 33 Q 20 27, 40 28 T 80 17 T 100 13"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="0.5"
            strokeDasharray="1 1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
          />
        </svg>
      </div>

      {/* Decorative Glass Highlights */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};

const TopicProgressRow: React.FC<{ topic: BayesianTopic; delay: number }> = ({ topic, delay }) => {
  // Uncertainty visualization: wider CI = more transparent
  const opacity = Math.max(0.25, 1 - topic.uncertainty * 1.5);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex flex-col gap-4 p-6 neumorphic-inset rounded-3xl group"
    >
      <div className="flex justify-between items-end">
        <div>
          <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
            {topic.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Confidence Spread: {(topic.uncertainty * 100).toFixed(0)}%
            </span>
            {topic.trajectorySlope > 0 ? (
              <MaterialIcon name="trending_up" className="text-tertiary text-sm" />
            ) : (
              <MaterialIcon name="trending_flat" className="text-warning text-sm" />
            )}
          </div>
        </div>
        <div className="font-headline text-2xl font-extrabold text-primary">
          {Math.round(topic.ciLower * 100)}–{Math.round(topic.ciUpper * 100)}%
        </div>
      </div>

      {/* Bayesian Range Bar */}
      <div className="w-full h-5 neumorphic-pressed rounded-full overflow-hidden relative">
        <motion.div
          className="absolute top-0 h-full bg-gradient-to-r from-primary to-primary-fixed rounded-full shadow-[0_0_12px_rgba(112,42,225,0.3)]"
          style={{ opacity }}
          initial={{ 
            left: `${((topic.ciLower + topic.ciUpper) / 2) * 100}%`, 
            width: 0 
          }}
          animate={{
            left: `${topic.ciLower * 100}%`,
            width: `${topic.uncertainty * 100}%`
          }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: delay + 0.2 }}
        />
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---

export default function StudentProgressPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-20">
      
      {/* Header Section (Trauma-Informed) */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-3"
          >
            Cognitive Trajectory
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-body text-lg text-on-surface-variant max-w-2xl"
          >
            Your neural pathways are strengthening. We track your mastery as a probability, honoring the natural ebb and flow of human memory.
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-primary to-primary-fixed text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:scale-[0.98] transition-transform flex items-center gap-3"
        >
          <MaterialIcon name="psychology" />
          Enter Deep Work
        </motion.button>
      </header>

      {/* Top Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Global Retention"
          lowerBound={82}
          upperBound={89}
          subtitle="Highly stable memory pathways"
          icon="all_inclusive"
          delay={0.1}
        />
        <StatCard
          title="Active Concepts"
          staticValue="14 Nodes"
          subtitle="Currently in working memory"
          icon="hub"
          delay={0.2}
        />
        <StatCard
          title="Focus Quality"
          staticValue="Deep"
          subtitle="Sustained attention detected"
          icon="waves"
          delay={0.3}
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Chart & Progress */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <TrajectoryChart />
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Active Neural Pathways
              </h2>
              <button className="text-primary font-label text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary-dim transition-colors">
                View Brain Map →
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {MOCK_TOPICS.map((topic, index) => (
                <TopicProgressRow key={topic.id} topic={topic} delay={0.4 + index * 0.1} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Gentle Review Queue */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="neumorphic-flat p-8 rounded-3xl flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
                <MaterialIcon name="spa" className="text-tertiary text-lg" />
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Gentle Review Queue
              </h2>
            </div>
            
            <p className="font-body text-sm text-on-surface-variant mb-8 leading-relaxed">
              These concepts have widening uncertainty bands. A quick, low-pressure review will crystallize them into long-term memory.
            </p>

            <div className="flex flex-col gap-4 flex-1">
              {/* Review Item 1 */}
              <div className="neumorphic-inset p-5 rounded-2xl group cursor-pointer hover:scale-[1.02] transition-transform">
                <h4 className="font-headline text-base font-bold text-on-surface mb-1">
                  Schrödinger Equation
                </h4>
                <div className="flex justify-between items-center">
                  <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                    Fading Signal
                  </span>
                  <span className="font-body text-xs text-on-surface-variant font-medium">
                    10 min
                  </span>
                </div>
              </div>

              {/* Review Item 2 */}
              <div className="neumorphic-inset p-5 rounded-2xl group cursor-pointer hover:scale-[1.02] transition-transform">
                <h4 className="font-headline text-base font-bold text-on-surface mb-1">
                  Wave-Particle Duality
                </h4>
                <div className="flex justify-between items-center">
                  <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Consolidating
                  </span>
                  <span className="font-body text-xs text-on-surface-variant font-medium">
                    5 min
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl neumorphic-flat text-primary font-black text-sm tracking-widest uppercase hover:scale-[0.98] transition-all active:shadow-inner">
              Start Gentle Review
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}