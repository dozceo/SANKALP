"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Glassmorphism Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-surface/70 backdrop-blur-[20px] saturate-[180%] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} neumorphic-flat bg-surface p-8 rounded-[2.5rem] z-10 animate-slideUp flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between mb-8">
          {title && (
            <h2
              id="modal-title"
              className="font-headline font-extrabold text-2xl text-on-surface tracking-tight"
            >
              {title}
            </h2>
          )}
          <Button
            variant="icon"
            icon="close"
            onClick={onClose}
            aria-label="Close modal"
            className="ml-auto"
          />
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};