"use client";

import React, { InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;

    return (
      <div className={`flex flex-col w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-label font-black text-[10px] tracking-[0.2em] uppercase text-on-surface-variant mb-3 ml-4"
          >
            {label}
          </label>
        )}
        
        <div
          className={`neumorphic-inset p-2 rounded-full flex items-center px-5 transition-colors duration-300 ${
            error ? "bg-error-container/20" : "bg-surface"
          }`}
        >
          {icon && (
            <span
              className={`material-symbols-outlined text-lg mr-2 ${
                error ? "text-error" : "text-on-surface-variant"
              }`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-3 px-2 placeholder:text-on-surface-variant/40 font-body font-medium text-on-surface outline-none"
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>

        {error && (
          <span
            id={`${inputId}-error`}
            className="font-label font-bold text-xs text-error mt-3 ml-4 flex items-center"
            role="alert"
          >
            <span className="material-symbols-outlined text-[14px] mr-1">error</span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";