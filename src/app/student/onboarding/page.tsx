"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Types ---

type OnboardingStep = 1 | 2 | 3 | 4;

interface WizardState {
  focusArea: string | null;
  pace: string | null;
}

interface OptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

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

const OptionCard: React.FC<OptionCardProps> = ({ id, title, description, icon, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-6 rounded-3xl transition-all duration-400 flex items-center gap-6 text-left group ${
        isSelected
          ? "neumorphic-inset bg-primary/5"
          : "neumorphic-flat hover:scale-[1.02] hover:bg-surface-container-low"
      }`}
      aria-pressed={isSelected}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
          isSelected ? "neumorphic-pressed bg-primary/10 text-primary" : "neumorphic-inset text-on-surface-variant group-hover:text-primary"
        }`}
      >
        <MaterialIcon name={icon} filled={isSelected} className="text-2xl" />
      </div>
      <div className="flex-1">
        <h3 className={`font-headline text-lg font-bold mb-1 transition-colors ${isSelected ? "text-primary" : "text-on-surface"}`}>
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant font-body leading-relaxed">
          {description}
        </p>
      </div>
      <div className="shrink-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          isSelected ? "bg-primary text-white shadow-[0_0_10px_rgba(112,42,225,0.4)]" : "neumorphic-inset"
        }`}>
          {isSelected && <MaterialIcon name="check" className="text-sm" />}
        </div>
      </div>
    </button>
  );
};

// --- Main Page Component ---

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [direction, setDirection] = useState<number>(1);
  const [state, setState] = useState<WizardState>({
    focusArea: null,
    pace: null,
  });
  const [isLaunching, setIsLaunching] = useState(false);

  const nextStep = () => {
    if (step < 4) {
      setDirection(1);
      setStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    // Simulate API call and calibration delay
    setTimeout(() => {
      router.push("/student/dashboard");
    }, 2000);
  };

  // Framer Motion Variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 md:p-12 overflow-hidden relative selection:bg-primary/20">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step
                  ? "w-12 bg-primary shadow-[0_0_12px_rgba(112,42,225,0.4)]"
                  : i < step
                  ? "w-4 bg-primary/40"
                  : "w-4 neumorphic-inset"
              }`}
            />
          ))}
        </div>

        {/* Main Glass Card */}
        <div className="glass-strong rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="flex-1 flex flex-col"
            >
              {/* --- STEP 1: Welcome --- */}
              {step === 1 && (
                <div className="flex flex-col items-center text-center flex-1 justify-center">
                  <div className="w-24 h-24 rounded-full neumorphic-inset flex items-center justify-center mb-8">
                    <MaterialIcon name="psychology" className="text-5xl text-primary" filled />
                  </div>
                  <span className="font-label text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-4">
                    Cognitive Calibration
                  </span>
                  <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-6 leading-tight">
                    Welcome to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                      SANKALP-AEI
                    </span>
                  </h1>
                  <p className="text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed mb-10">
                    We don't do static grades here. We map your mind, adapt to your rhythm, and build a safe space for you to struggle and grow.
                  </p>
                  <button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-primary to-primary-fixed text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:scale-[0.98] transition-transform"
                  >
                    Begin Calibration
                  </button>
                </div>
              )}

              {/* --- STEP 2: Focus Area --- */}
              {step === 2 && (
                <div className="flex flex-col flex-1">
                  <span className="font-label text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-2">
                    Step 1 of 3
                  </span>
                  <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3">
                    What brings you here?
                  </h2>
                  <p className="text-on-surface-variant mb-8">
                    Select your primary goal so we can tune the Adaptive Decision Kit to your needs.
                  </p>
                  
                  <div className="flex flex-col gap-4 mb-8">
                    <OptionCard
                      id="deep_mastery"
                      title="Deep Mastery"
                      description="I want to truly understand concepts from the ground up, no matter how long it takes."
                      icon="explore"
                      isSelected={state.focusArea === "deep_mastery"}
                      onClick={() => setState({ ...state, focusArea: "deep_mastery" })}
                    />
                    <OptionCard
                      id="exam_prep"
                      title="Exam Preparation"
                      description="I have upcoming assessments and need to optimize my retention for specific dates."
                      icon="event_available"
                      isSelected={state.focusArea === "exam_prep"}
                      onClick={() => setState({ ...state, focusArea: "exam_prep" })}
                    />
                    <OptionCard
                      id="catch_up"
                      title="Catching Up"
                      description="I feel behind and need a safe, supportive path to rebuild my foundational knowledge."
                      icon="health_and_safety"
                      isSelected={state.focusArea === "catch_up"}
                      onClick={() => setState({ ...state, focusArea: "catch_up" })}
                    />
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4">
                    <button
                      onClick={prevStep}
                      className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-[0.98] transition-all"
                      aria-label="Previous step"
                    >
                      <MaterialIcon name="arrow_back" />
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!state.focusArea}
                      className={`px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 ${
                        state.focusArea
                          ? "bg-gradient-to-r from-primary to-primary-fixed text-white shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:scale-[0.98]"
                          : "neumorphic-inset text-on-surface-variant/50 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* --- STEP 3: Bayesian Explanation --- */}
              {step === 3 && (
                <div className="flex flex-col flex-1">
                  <span className="font-label text-[10px] font-black tracking-[0.2em] uppercase text-primary mb-2">
                    Step 2 of 3
                  </span>
                  <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3">
                    A New Way to Learn
                  </h2>
                  <p className="text-on-surface-variant mb-8">
                    Before we start, you need to know how we measure success.
                  </p>

                  <div className="neumorphic-inset rounded-3xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    
                    <div className="flex items-start gap-6 relative z-10">
                      <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center shrink-0 text-primary">
                        <MaterialIcon name="query_stats" filled />
                      </div>
                      <div>
                        <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                          Probability, Not Points
                        </h3>
                        <p className="text-on-surface-variant leading-relaxed text-sm mb-4">
                          We don't use point estimates or punitive grades. Your mastery is tracked as a living probability range (e.g., 72–89%). 
                        </p>
                        <p className="text-on-surface-variant leading-relaxed text-sm">
                          Wider ranges mean we are uncertain. Narrow ranges mean we are confident. Every interaction helps us understand you better.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4">
                    <button
                      onClick={prevStep}
                      className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-[0.98] transition-all"
                      aria-label="Previous step"
                    >
                      <MaterialIcon name="arrow_back" />
                    </button>
                    <button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-primary to-primary-fixed text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:scale-[0.98] transition-transform"
                    >
                      I Understand
                    </button>
                  </div>
                </div>
              )}

              {/* --- STEP 4: Launch --- */}
              {step === 4 && (
                <div className="flex flex-col items-center text-center flex-1 justify-center">
                  <div className="relative mb-10">
                    <div className="w-32 h-32 rounded-full neumorphic-inset flex items-center justify-center relative z-10">
                      {isLaunching ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="w-16 h-16 rounded-full border-4 border-surface-container-highest border-t-primary"
                        />
                      ) : (
                        <MaterialIcon name="rocket_launch" className="text-5xl text-primary" filled />
                      )}
                    </div>
                    {/* Pulse effect */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-primary/20 z-0"
                    />
                  </div>

                  <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-4">
                    {isLaunching ? "Igniting Engine..." : "Ready to Launch"}
                  </h2>
                  <p className="text-on-surface-variant max-w-sm mx-auto mb-10">
                    {isLaunching 
                      ? "Generating your initial Brain Map™ and setting up your cognitive baseline."
                      : "Your profile is calibrated. Step into your personalized learning environment."}
                  </p>

                  <div className="mt-auto flex w-full justify-center pt-4">
                    {!isLaunching && (
                      <button
                        onClick={handleLaunch}
                        className="bg-gradient-to-r from-primary to-primary-fixed text-white px-12 py-5 rounded-full font-black text-sm tracking-widest uppercase shadow-[0_12px_32px_rgba(112,42,225,0.3)] hover:scale-[0.98] transition-transform w-full md:w-auto"
                      >
                        Enter Portal
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}