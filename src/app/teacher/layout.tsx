"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* 
        Teacher-specific background effects.
        Using subtle gradients to differentiate the teacher portal.
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 flex-1 h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}