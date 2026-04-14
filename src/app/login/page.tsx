"use client";

import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";

// Zod schema for strict runtime validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormInputs>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormInputs, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof LoginFormInputs]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate using Zod
      loginSchema.parse(formData);
      
      // Simulate API Call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Redirect logic would go here (e.g., router.push('/student/dashboard'))
      console.log("Validation passed, logging in...", formData);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormInputs, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormInputs] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      {/* Left Side: Editorial Context */}
      <div className="lg:col-span-5 space-y-8">
        <div>
          <span className="text-primary font-label text-[10px] font-black uppercase tracking-widest mb-6 block">
            Authentication
          </span>
          <h1 className="text-5xl lg:text-6xl font-headline font-extrabold tracking-tight text-on-surface leading-[1.1] mb-6">
            Resume your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
              cognitive journey.
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
            Access your personalized Brain Map™, review your mastery probabilities, and continue expanding your knowledge architecture.
          </p>
        </div>

        <div className="p-8 bg-surface-container-low rounded-3xl space-y-4">
          <div className="flex gap-5 items-start">
            <div className="w-10 h-10 rounded-full bg-surface neumorphic-flat flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium mt-1">
              SANKALP-AEI employs strict privacy-first protocols. Your biometric and interaction data is never logged as PII.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form Card */}
      <div className="lg:col-span-7">
        <div className="neumorphic-flat rounded-[2.5rem] p-10 md:p-14">
          <div className="mb-10">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant text-sm font-medium">Enter your credentials to access your portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold ml-4 block">
                Email Address
              </label>
              <div className={`neumorphic-inset p-2 rounded-full flex items-center px-6 transition-colors ${errors.email ? 'ring-1 ring-error/30' : ''}`}>
                <span className="material-symbols-outlined text-on-surface-variant text-lg mr-4">mail</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full py-3 placeholder:text-on-surface-variant/40 font-medium outline-none text-on-surface"
                  placeholder="scholar@institution.edu"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs font-medium ml-4 mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-4 pr-4">
                <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-bold block">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] font-label uppercase tracking-widest text-primary font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className={`neumorphic-inset p-2 rounded-full flex items-center px-6 transition-colors ${errors.password ? 'ring-1 ring-error/30' : ''}`}>
                <span className="material-symbols-outlined text-on-surface-variant text-lg mr-4">lock</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full py-3 placeholder:text-on-surface-variant/40 font-medium outline-none text-on-surface"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-error text-xs font-medium ml-4 mt-2">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-5 rounded-full font-black text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Portal
                    <span className="material-symbols-outlined text-sm">login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-10 text-center">
            <p className="text-sm text-on-surface-variant font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline ml-1">
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}