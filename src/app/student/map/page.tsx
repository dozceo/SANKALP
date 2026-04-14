'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

interface IconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}

// ----------------------------------------------------------------------
// Dynamic Imports
// ----------------------------------------------------------------------

// Dynamically import the 3D Brain Map to avoid SSR issues with WebGL/Three.js
const StudentBrainMap = dynamic(
  () => import('@/components/3d-map/StudentBrainMap').catch(() => {
    // Fallback if the component is not yet implemented
    return function MockBrainMap() {
      return (
        <div className="w-full h-full flex items-center justify-center bg-surface-dim/20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full neumorphic-inset flex items-center justify-center animate-pulse">
              <MaterialIcon name="psychology" className="text-primary text-3xl" />
            </div>
            <p className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              Initializing Neural Engine...
            </p>
          </div>
        </div>
      );
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="w-24 h-24 rounded-full neumorphic-inset flex items-center justify-center animate-pulse">
          <MaterialIcon name="psychology" className="text-primary text-4xl" />
        </div>
      </div>
    ),
  }
);

// ----------------------------------------------------------------------
// Reusable UI Components
// ----------------------------------------------------------------------

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
  <div className={`glass-strong rounded-3xl p-6 shadow-neumorphic-lg ${className}`}>
    {children}
  </div>
);

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, active = false }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-[1.05] ${
      active
        ? 'neumorphic-pressed text-primary'
        : 'neumorphic-flat text-on-surface-variant hover:text-primary'
    }`}
  >
    <MaterialIcon name={icon} filled={active} />
  </button>
);

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function BrainMapPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'physics', label: 'Physics', active: true },
    { id: 'math', label: 'Mathematics', active: false },
    { id: 'chemistry', label: 'Chemistry', active: false },
  ]);

  // Ensure animations only run on the client after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFilter = (id: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  if (!isMounted) return null;

  return (
    // Full-bleed container bypassing standard layout padding
    <div className="absolute inset-0 z-0 bg-surface overflow-hidden">
      
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <StudentBrainMap />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 md:p-10">
        
        {/* Top Left: Context & Bayesian Mastery */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-6 left-6 md:top-10 md:left-10 pointer-events-auto"
        >
          <GlassCard className="w-80 flex flex-col gap-6">
            <div>
              <h1 className="font-headline text-2xl font-extrabold text-on-surface mb-1">
                Cognitive Map
              </h1>
              <p className="text-sm text-on-surface-variant font-body">
                Real-time neural topology of your knowledge state.
              </p>
            </div>

            {/* Bayesian Mastery Indicator */}
            <div className="neumorphic-inset p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Global Mastery
                </span>
                <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                  Beta(α,β)
                </span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  72-89%
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  95% CI
                </span>
              </div>

              {/* Uncertainty Band Visualization */}
              <div className="w-full h-3 mt-1 neumorphic-pressed rounded-full overflow-hidden flex relative">
                {/* Lower bound spacer */}
                <div className="h-full bg-transparent w-[72%]"></div>
                {/* Confidence Interval Band */}
                <div className="h-full bg-gradient-to-r from-primary to-primary-container opacity-60 w-[17%] relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+PC9zdmc+')] opacity-50"></div>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant text-right mt-1">
                Uncertainty width: ±8.5%
              </p>
            </div>

            {/* Primary CTA */}
            <button className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[1.02] transition-transform active:scale-[0.98]">
              Start Deep Work
            </button>
          </GlassCard>
        </motion.div>

        {/* Top Right: Subject Filters */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-6 right-6 md:top-10 md:right-10 pointer-events-auto"
        >
          <GlassCard className="p-2 flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] ${
                  filter.active
                    ? 'neumorphic-inset text-primary'
                    : 'neumorphic-flat text-on-surface-variant hover:text-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </GlassCard>
        </motion.div>

        {/* Bottom Left: Visual Legend (Trauma-Informed) */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute bottom-6 left-6 md:bottom-10 md:left-10 pointer-events-auto"
        >
          <GlassCard className="w-72">
            <h3 className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-5">
              Visual Legend
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_12px_rgba(0,105,71,0.6)]"></div>
                </div>
                <span className="text-sm font-medium text-on-surface group-hover:text-tertiary transition-colors">
                  Mastered (High Confidence)
                </span>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary opacity-40"></div>
                </div>
                <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  Learning (Wide CI Band)
                </span>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full neumorphic-inset flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-warning animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]"></div>
                </div>
                <span className="text-sm font-medium text-on-surface group-hover:text-warning transition-colors">
                  Active Challenge Zone
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Bottom Right: Map Controls */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute bottom-6 right-6 md:bottom-10 md:right-10 pointer-events-auto flex flex-col gap-4"
        >
          <GlassCard className="p-3 flex flex-col gap-3">
            <IconButton 
              icon="add" 
              label="Zoom In" 
              onClick={() => console.log('Zoom In')} 
            />
            <IconButton 
              icon="remove" 
              label="Zoom Out" 
              onClick={() => console.log('Zoom Out')} 
            />
            
            {/* Ghost divider using background shift, no solid borders */}
            <div className="w-full h-px bg-outline-variant/15 my-1 rounded-full"></div>
            
            <IconButton 
              icon="my_location" 
              label="Recenter Map" 
              onClick={() => console.log('Recenter')} 
            />
            <IconButton 
              icon="3d_rotation" 
              label="Toggle 3D/2D" 
              onClick={() => console.log('Toggle 3D')} 
              active 
            />
          </GlassCard>
        </motion.div>

      </div>
    </div>
  );
}