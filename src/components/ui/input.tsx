import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  containerClassName?: string;
}

/**
 * SANKALP-AEI Neumorphic Input
 * Appears slightly "recessed" into the surface using an inner shadow.
 * No traditional borders allowed.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", containerClassName = "", icon, ...props }, ref) => {
    return (
      <div
        className={`neumorphic-recessed rounded-full px-6 py-2 flex items-center space-x-4 bg-surface dark:bg-inverse-surface transition-all focus-within:ring-2 focus-within:ring-primary/20 ${containerClassName}`}
      >
        {icon && (
          <span
            className="material-symbols-outlined text-outline dark:text-outline-variant text-lg"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`bg-transparent border-none focus:ring-0 w-full text-on-surface dark:text-surface-container-lowest font-medium placeholder:text-outline/60 dark:placeholder:text-outline-variant/40 py-3 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";