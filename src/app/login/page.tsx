"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "student" | "teacher" | "parent" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for micro-animation and progressive reveal
    setTimeout(() => {
      router.push(`/${role}/dashboard`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glassmorphic Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tighter uppercase mb-2">
            Sankalp AEI
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Enter your cognitive workspace
          </p>
        </div>

        <div className="neumorphic-flat p-8 rounded-3xl glass">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-black ml-2">
                Email Address
              </label>
              <div className="neumorphic-inset p-1 rounded-full flex items-center px-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg mr-3" aria-hidden="true">mail</span>
                <input 
                  type="email" 
                  required
                  defaultValue="demo@sankalp.ai"
                  aria-label="Email Address"
                  className="bg-transparent border-none focus:ring-0 text-sm w-full py-3 text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-black ml-2">
                Password
              </label>
              <div className="neumorphic-inset p-1 rounded-full flex items-center px-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg mr-3" aria-hidden="true">lock</span>
                <input 
                  type="password" 
                  required
                  defaultValue="password123"
                  aria-label="Password"
                  className="bg-transparent border-none focus:ring-0 text-sm w-full py-3 text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant font-black ml-2">
                Select Role (Demo Routing)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["student", "teacher", "parent", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold capitalize transition-all duration-300 ${
                      role === r 
                        ? "neumorphic-pressed text-primary bg-primary/5" 
                        : "neumorphic-flat text-on-surface-variant hover:scale-[1.02]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest uppercase shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[0.98] transition-transform flex items-center justify-center"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin" aria-hidden="true">sync</span>
              ) : (
                "Authenticate"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}