"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActorRole } from "@/types/common";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ActorRole[];
}

/**
 * ProtectedRoute Higher-Order Component
 * 
 * Client-side boundary that enforces RBAC while providing a trauma-informed,
 * aesthetically premium loading and fallback experience.
 * 
 * Adheres to SANKALP UI Rules:
 * - No loading walls (uses progressive skeleton reveal)
 * - Trauma-informed fallback (empathetic language, no punitive errors)
 * - Strict No-Line Rule (uses neumorphic depth and background shifts)
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      // Artificial delay to ensure the skeleton screen is visible,
      // preventing jarring flashes of content (Progressive Reveal)
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!isMounted) return;

      // In a real implementation, this would interface with a secure Context/Provider.
      // Here we read the cookie established by the backend/middleware.
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? match[2] : null;
      };

      const storedRole = getCookie("sankalp_actor_role") as ActorRole | null;

      // Development fallback: If testing locally without cookies, you can mock the role here.
      // For strict enforcement, we check against the allowed array.
      if (storedRole && allowedRoles.includes(storedRole)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return <AuthSkeleton />;
  }

  if (isAuthorized === false) {
    return <UnauthorizedView />;
  }

  return <>{children}</>;
}

/**
 * Premium Skeleton Loader
 * Replaces traditional spinners with a structural preview of the interface.
 */
const AuthSkeleton = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
    <div className="w-full max-w-md neumorphic-flat p-10 rounded-[2.5rem] flex flex-col gap-8 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full neumorphic-inset bg-surface-container-low"></div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-5 w-3/4 bg-surface-container-highest rounded-full"></div>
          <div className="h-3 w-1/2 bg-surface-container-high rounded-full"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-3 w-full bg-surface-container-highest rounded-full"></div>
        <div className="h-3 w-5/6 bg-surface-container-highest rounded-full"></div>
        <div className="h-3 w-4/6 bg-surface-container-highest rounded-full"></div>
      </div>
      <div className="h-14 w-full rounded-full neumorphic-inset bg-surface-container-low mt-4"></div>
    </div>
  </div>
);

/**
 * Trauma-Informed Fallback View
 * Avoids aggressive "403 Forbidden" language in favor of empathetic redirection.
 */
const UnauthorizedView = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md neumorphic-flat p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6 relative overflow-hidden">
        
        {/* Glassmorphism ambient glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="w-20 h-20 rounded-full neumorphic-inset flex items-center justify-center mb-2 z-10">
          <span 
            className="material-symbols-outlined text-4xl text-primary" 
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            vpn_key
          </span>
        </div>

        <div className="flex flex-col gap-3 z-10">
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Let's get you to the right place
          </h1>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed">
            It looks like you don't have access to this specific area. Don't worry, we can guide you back to your main dashboard.
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-6 py-5 rounded-full bg-gradient-to-r from-primary to-primary-fixed text-white font-black text-xs tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase shadow-[0_8px_16px_rgba(112,42,225,0.2)] z-10"
          aria-label="Return to home page"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};