"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { z } from "zod";

// --- Types & Validation ---

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  title: z.string().min(2, "Title is required"),
  curriculum: z.string().min(1, "Curriculum is required"),
  interventionSensitivity: z.enum(["low", "medium", "high"]),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

// --- Animation Variants ---

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1], // SANKALP standard easing
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  }),
};

// --- Sub-components ---

const IconCircle = ({ icon, active = false }: { icon: string; active?: boolean }) => (
  <div
    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
      active ? "neumorphic-pressed text-primary" : "neumorphic-inset text-on-surface-variant"
    }`}
  >
    <span
      className="material-symbols-outlined text-sm"
      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
      aria-hidden="true"
    >
      {icon}
    </span>
  </div>
);

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-12">
      <div className="flex justify-between items-center mb-4 px-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`font-label text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${
              i <= currentStep ? "text-primary" : "text-on-surface-variant/50"
            }`}
          >
            Step {i + 1}
          </div>
        ))}
      </div>
      <div className="w-full h-3 neumorphic-pressed rounded-full overflow-hidden bg-surface-container-highest">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary-fixed shadow-[0_0_15px_rgba(112,42,225,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

// --- Main Component ---

export default function TeacherOnboarding() {
  const router = useRouter();
  const [[step, direction], setStep] = useState([0, 0]);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    title: "",
    curriculum: "",
    interventionSensitivity: "medium",
  });

  const totalSteps = 4;

  const paginate = (newDirection: number) => {
    const nextStep = step + newDirection;
    if (nextStep >= 0 && nextStep < totalSteps) {
      setStep([nextStep, newDirection]);
    }
  };

  const handleComplete = () => {
    // In a real app, we would validate with Zod and submit to API here
    // const result = onboardingSchema.safeParse(formData);
    paginate(1);
    setTimeout(() => {
      router.push("/teacher/dashboard");
    }, 2500);
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 md:p-10 bg-surface">
      <div className="w-full max-w-3xl">
        <StepIndicator currentStep={step} totalSteps={totalSteps} />

        <div className="neumorphic-flat rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex-1 flex flex-col"
            >
              {/* STEP 0: Identity */}
              {step === 0 && (
                <div className="flex flex-col h-full justify-center space-y-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <IconCircle icon="person" active />
                      <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">
                        Welcome to SANKALP
                      </h2>
                    </div>
                    <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                      Let's set up your cognitive architecture. How should your students and the system address you?
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-label text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase ml-4">
                        Full Name
                      </label>
                      <div className="neumorphic-inset rounded-full flex items-center px-6">
                        <span className="material-symbols-outlined text-on-surface-variant mr-3">badge</span>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Dr. Sarah Chen"
                          className="bg-transparent border-none focus:ring-0 text-sm w-full py-5 placeholder:text-on-surface-variant/40 font-medium text-on-surface outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase ml-4">
                        Professional Title
                      </label>
                      <div className="neumorphic-inset rounded-full flex items-center px-6">
                        <span className="material-symbols-outlined text-on-surface-variant mr-3">work</span>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Senior Physics Instructor"
                          className="bg-transparent border-none focus:ring-0 text-sm w-full py-5 placeholder:text-on-surface-variant/40 font-medium text-on-surface outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Academic Context */}
              {step === 1 && (
                <div className="flex flex-col h-full justify-center space-y-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <IconCircle icon="account_balance" active />
                      <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">
                        Academic Context
                      </h2>
                    </div>
                    <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                      Select the primary curriculum framework. This anchors the Knowledge Graph™ for your cohorts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: "cbse", title: "CBSE / NCERT", desc: "Standard Indian National Curriculum" },
                      { id: "icse", title: "ICSE / ISC", desc: "Council for the Indian School Certificate" },
                      { id: "ib", title: "IB Diploma", desc: "International Baccalaureate" },
                      { id: "custom", title: "Custom Framework", desc: "Institution-specific mapping" },
                    ].map((curr) => (
                      <button
                        key={curr.id}
                        onClick={() => setFormData({ ...formData, curriculum: curr.id })}
                        className={`p-6 rounded-3xl text-left transition-all duration-300 ${
                          formData.curriculum === curr.id
                            ? "neumorphic-pressed bg-primary/5"
                            : "neumorphic-flat hover:scale-[1.02]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-headline font-bold text-lg ${formData.curriculum === curr.id ? "text-primary" : "text-on-surface"}`}>
                            {curr.title}
                          </h3>
                          {formData.curriculum === curr.id && (
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check_circle
                            </span>
                          )}
                        </div>
                        <p className="font-body text-sm text-on-surface-variant">{curr.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: AI Configuration */}
              {step === 2 && (
                <div className="flex flex-col h-full justify-center space-y-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <IconCircle icon="psychology" active />
                      <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">
                        Intervention Sensitivity
                      </h2>
                    </div>
                    <p className="font-body text-on-surface-variant text-lg leading-relaxed">
                      How aggressively should the Adaptive Decision Kit (ADK) flag students? We use Bayesian credible intervals to detect struggle early.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        id: "low",
                        title: "Empathetic & Patient",
                        desc: "Allows students more time to self-correct. Flags only when mastery drops below 40% with high certainty.",
                        icon: "self_improvement"
                      },
                      {
                        id: "medium",
                        title: "Balanced (Recommended)",
                        desc: "Standard ADK policy. Intervenes when the trajectory slope declines over 3 consecutive interactions.",
                        icon: "balance"
                      },
                      {
                        id: "high",
                        title: "Highly Proactive",
                        desc: "Flags immediately upon widening uncertainty (CI > 0.25) or early signs of forgetting.",
                        icon: "bolt"
                      },
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setFormData({ ...formData, interventionSensitivity: level.id as any })}
                        className={`w-full p-6 rounded-3xl text-left flex items-center gap-6 transition-all duration-300 ${
                          formData.interventionSensitivity === level.id
                            ? "neumorphic-pressed bg-primary/5"
                            : "neumorphic-flat hover:scale-[1.01]"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          formData.interventionSensitivity === level.id ? "bg-primary text-white shadow-[0_4px_12px_rgba(112,42,225,0.3)]" : "neumorphic-inset text-on-surface-variant"
                        }`}>
                          <span className="material-symbols-outlined">{level.icon}</span>
                        </div>
                        <div>
                          <h3 className={`font-headline font-bold text-lg mb-1 ${formData.interventionSensitivity === level.id ? "text-primary" : "text-on-surface"}`}>
                            {level.title}
                          </h3>
                          <p className="font-body text-sm text-on-surface-variant leading-relaxed">{level.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Processing / Completion */}
              {step === 3 && (
                <div className="flex flex-col h-full items-center justify-center text-center space-y-8 py-12">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-[3px] border-secondary/20 border-b-secondary animate-[spin_2s_linear_reverse]"></div>
                    <IconCircle icon="hub" active />
                  </div>
                  
                  <div>
                    <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-4">
                      Initializing Brain Map™
                    </h2>
                    <p className="font-body text-on-surface-variant text-lg max-w-md mx-auto">
                      Calibrating Bayesian priors and generating your cohort dashboard...
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Footer */}
          {step < 3 && (
            <div className="mt-auto pt-12 flex items-center justify-between">
              <button
                onClick={() => paginate(-1)}
                disabled={step === 0}
                className={`px-8 py-4 rounded-full font-label text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${
                  step === 0
                    ? "opacity-0 pointer-events-none"
                    : "neumorphic-flat text-on-surface-variant hover:text-primary hover:scale-[0.98]"
                }`}
              >
                Back
              </button>

              <button
                onClick={() => {
                  if (step === 2) handleComplete();
                  else paginate(1);
                }}
                disabled={
                  (step === 0 && (!formData.fullName || !formData.title)) ||
                  (step === 1 && !formData.curriculum)
                }
                className="bg-gradient-to-r from-primary to-primary-container text-white px-10 py-4 rounded-full font-label text-[10px] font-black tracking-[0.2em] uppercase shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {step === 2 ? "Initialize Dashboard" : "Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}