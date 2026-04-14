import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "flat" | "inset" | "extruded" | "recessed";
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "2xl" | "3xl" | "full";
}

/**
 * SANKALP-AEI Card Component
 * Strictly forbids 1px solid borders. Uses neumorphic shadows and tonal shifts.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      variant = "flat",
      padding = "lg",
      radius = "3xl",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "relative overflow-hidden transition-all duration-300";

    const variants = {
      flat: "neumorphic-flat bg-surface dark:bg-inverse-surface",
      inset: "neumorphic-inset bg-surface dark:bg-inverse-surface",
      extruded: "neumorphic-extruded bg-surface dark:bg-inverse-surface",
      recessed: "neumorphic-recessed bg-surface dark:bg-inverse-surface",
    };

    const paddings = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8 md:p-10",
    };

    const radiuses = {
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${radiuses[radius]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";