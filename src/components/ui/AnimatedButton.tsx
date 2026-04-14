"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  /**
   * The visual hierarchy of the button.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "icon";
  /**
   * Material Symbols Outlined icon name.
   */
  iconName?: string;
  /**
   * Whether the icon should use the filled variation.
   * @default false
   */
  iconFilled?: boolean;
  /**
   * Shows a loading spinner and disables interaction.
   * @default false
   */
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * AnimatedButton
 * 
 * Primary interaction surface for SANKALP-AEI.
 * Implements strict pill-shaped radii, gradient primary states, and 
 * neumorphic inset states for icon-only variants.
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = "primary",
  iconName,
  iconFilled = false,
  isLoading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  // Base typography and structure
  const baseClasses =
    "relative inline-flex items-center justify-center font-label font-black tracking-[0.15em] uppercase text-sm transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant-specific design tokens
  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:shadow-[0_12px_32px_rgba(112,42,225,0.4)]",
    secondary:
      "neumorphic-flat text-primary px-8 py-4 rounded-full border border-outline-variant/10 hover:text-primary-dim",
    icon: "w-10 h-10 rounded-full neumorphic-inset text-primary hover:text-primary-dim",
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading State Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Button Content */}
      <span
        className={`flex items-center gap-3 ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
      >
        {/* Leading Icon (for text buttons) */}
        {iconName && variant !== "icon" && (
          <span
            className="material-symbols-outlined text-[1.25rem]"
            style={{ fontVariationSettings: `'FILL' ${iconFilled ? 1 : 0}` }}
            aria-hidden="true"
          >
            {iconName}
          </span>
        )}

        {/* Text Payload */}
        {children}

        {/* Center Icon (for icon-only buttons) */}
        {iconName && variant === "icon" && (
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: `'FILL' ${iconFilled ? 1 : 0}` }}
            aria-hidden="true"
          >
            {iconName}
          </span>
        )}
      </span>
    </motion.button>
  );
};