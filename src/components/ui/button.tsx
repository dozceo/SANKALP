import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "icon" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

/**
 * SANKALP-AEI Button Component
 * Enforces the Cognitive Architect design system:
 * - Primary: Gradient pill-shaped with glass inner-glow
 * - Secondary: Surface-based with ghost border (15% opacity)
 * - Icon: Circular recessed/extruded containers
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none font-headline tracking-wide";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary to-primary-container text-white font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 active:shadow-inner shadow-[0_8px_32px_rgba(112,42,225,0.2)] dark:shadow-[0_8px_32px_rgba(112,42,225,0.1)] shadow-inner shadow-white/20",
      secondary:
        "neumorphic-flat text-primary dark:text-primary-container font-black hover:scale-[0.98] active:scale-95",
      icon: "neumorphic-extruded text-on-surface-variant hover:text-primary hover:neumorphic-active active:scale-95 rounded-full",
      ghost:
        "text-on-surface-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-inverse-surface/50 active:scale-95",
    };

    const sizes = {
      sm: "py-2 px-4 text-xs rounded-full",
      md: "py-4 px-8 text-sm rounded-full",
      lg: "py-5 px-10 text-base rounded-full",
      icon: "w-10 h-10 rounded-full",
    };

    // Force icon size if variant is icon
    const appliedSize = variant === "icon" ? sizes.icon : sizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${appliedSize} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";