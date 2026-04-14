"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition
 * 
 * Orchestrates route changes using the SANKALP-AEI standard 400ms crossfade
 * with a cubic-bezier easing curve to prevent jarring shifts and maintain
 * cognitive flow (Attention Retention metric).
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
}) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1], // SANKALP standard easing curve
        }}
        className={`w-full h-full flex flex-col ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};