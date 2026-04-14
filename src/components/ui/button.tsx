"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "icon" | "ghost";
  isLoading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      isLoading = false,
      icon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary:
        "py-5 px-8 rounded-full neumorphic-flat bg-gradient-to-r from-primary to-primary-fixed text-white font-label font-black text-sm tracking-[0.2em] uppercase hover:scale-[0.98] active:shadow-inner",
      secondary:
        "py-4 px-8 rounded-full neumorphic-flat text-primary font-label font-black text-sm tracking-[0.2em] uppercase bg-surface-container-low hover:scale-[0.98]",
      icon: "w-10 h-10 rounded-full neumorphic-inset text-primary hover:scale-[0.98]",
      ghost:
        "py-4 px-8 rounded-full text-on-surface-variant font-label font-bold text-sm hover:bg-surface-container-low hover:text-primary",
    };

    const widthClass = fullWidth && variant !== "icon" ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
        ) : (
          <>
            {icon && variant === "icon" && (
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            {icon && variant !== "icon" && (
              <span
                className="material-symbols-outlined mr-2 text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            {variant !== "icon" && children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";