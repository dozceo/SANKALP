import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
}

/**
 * SANKALP-AEI GlassCard Component
 * Used for floating elements, streak cards, and overlays.
 * Utilizes backdrop-blur and semi-transparent surface colors.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = "", intensity = "medium", children, ...props }, ref) => {
    const baseStyles =
      "relative rounded-3xl shadow-[0_8px_32px_rgba(44,47,49,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden";

    const intensities = {
      low: "bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-[10px]",
      medium: "bg-surface/70 dark:bg-inverse-surface/70 backdrop-blur-[20px] saturate-[180%]",
      high: "bg-surface/50 dark:bg-inverse-surface/50 backdrop-blur-[40px] saturate-[200%]",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${intensities[intensity]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";