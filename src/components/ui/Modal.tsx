import React, { useEffect } from "react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

/**
 * SANKALP-AEI Modal Component
 * Uses Glassmorphism for the overlay and a GlassCard for the content.
 * Follows the No-Line rule and utilizes editorial typography.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-dim/40 dark:bg-inverse-surface/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <GlassCard
        intensity="high"
        className={`w-full ${maxWidths[maxWidth]} p-8 md:p-10 z-10 animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-4`}
      >
        <div className="flex justify-between items-start mb-8">
          {title && (
            <h2
              id="modal-title"
              className="text-2xl md:text-3xl font-extrabold font-headline text-on-surface dark:text-surface-container-lowest tracking-tight"
            >
              {title}
            </h2>
          )}
          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="ml-auto -mt-2 -mr-2"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </Button>
        </div>
        
        <div className="font-body text-on-surface-variant dark:text-outline-variant">
          {children}
        </div>
      </GlassCard>
    </div>
  );
};