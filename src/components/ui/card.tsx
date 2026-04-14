import React, { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "inset" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "flat", padding = "lg", className = "", ...props }, ref) => {
    const baseStyles = "overflow-hidden transition-all duration-300";
    
    const variants = {
      flat: "neumorphic-flat rounded-[2.5rem] bg-surface",
      inset: "neumorphic-inset rounded-2xl bg-surface",
      glass:
        "bg-surface/70 backdrop-blur-[20px] saturate-[180%] shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[2.5rem]",
    };

    const paddings = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";