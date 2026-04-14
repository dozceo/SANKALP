"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  /**
   * The visual style of the card, adhering to the Neumorphic and Glassmorphism design system.
   * @default "glass"
   */
  variant?: "flat" | "inset" | "glass" | "glass-strong";
  /**
   * Enables hover micro-interactions (scale up, elevate shadow).
   * @default false
   */
  interactive?: boolean;
  /**
   * Optional metadata label rendered at the top of the card (10px, weight-900, tracking-widest).
   */
  label?: string;
  children: React.ReactNode;
}

/**
 * GlassCard
 * 
 * Core container component for SANKALP-AEI. Enforces the "No-Line Rule" by using
 * background shifts, neumorphic shadows, and glassmorphism instead of solid borders.
 * Minimum border radius is strictly 3xl (24px+).
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  variant = "glass",
  interactive = false,
  label,
  className = "",
  children,
  ...props
}) => {
  // Base structural classes
  const baseClasses = "rounded-3xl p-6 md:p-8 transition-colors duration-300 relative overflow-hidden";

  // Design system variant mapping
  const variantClasses = {
    flat: "neumorphic-flat",
    inset: "neumorphic-inset",
    glass: "glass border border-outline-variant/10",
    "glass-strong": "glass-strong border border-outline-variant/15",
  };

  // Micro-interaction classes
  const interactiveClasses = interactive ? "cursor-pointer" : "";

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      whileHover={
        interactive
          ? {
              scale: 1.02,
              y: -4,
              transition: { type: "spring", stiffness: 400, damping: 30 },
            }
          : undefined
      }
      whileTap={
        interactive
          ? { scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 30 } }
          : undefined
      }
      {...props}
    >
      {/* Optional Metadata Label */}
      {label && (
        <div className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4">
          {label}
        </div>
      )}
      
      {/* Content Payload */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* Decorative Glass Highlight (Subtle top-edge reflection) */}
      {(variant === "glass" || variant === "glass-strong") && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};