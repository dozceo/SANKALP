"use client";

import { QueryClient, QueryClientProvider, useIsFetching, useIsMutating } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";

/**
 * Global Fetching Indicator
 * Adheres to "The Cognitive Architect" design system:
 * - Neumorphic flat shadow
 * - Pill-shaped container (rounded-full)
 * - Strict No-Line Rule (no 1px solid borders for containment)
 * - Typography: Inter, 10px, weight-900, tracking-widest
 * - Micro-interactions: Fade in/out
 */
function GlobalNetworkIndicator() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Debounce the indicator to prevent flickering on fast requests
    const active = isFetching > 0 || isMutating > 0;
    let timer: NodeJS.Timeout;
    
    if (active) {
      timer = setTimeout(() => setIsVisible(true), 300);
    } else {
      setIsVisible(false);
    }

    return () => clearTimeout(timer);
  }, [isFetching, isMutating]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-fadeIn pointer-events-none">
      <div className="neumorphic-flat bg-surface px-5 py-3 rounded-full flex items-center gap-3 transition-all duration-300">
        {/* Spinner uses border for the shape, not containment, which is allowed */}
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <span className="font-label text-[10px] font-black uppercase tracking-widest text-primary">
          Syncing State
        </span>
      </div>
    </div>
  );
}

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider for SANKALP-AEI
 * Manages global server state, caching, and request deduplication.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // SANKALP requires fresh data for accurate Bayesian updates, 
            // but we allow a short stale time to prevent waterfall re-renders
            staleTime: 1000 * 30, // 30 seconds
            gcTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: true, // Crucial for attention retention tracking
            retry: (failureCount, error) => {
              // Do not retry on authentication or authorization errors
              if (error && typeof error === "object" && "status" in error) {
                const status = (error as { status: number }).status;
                if (status === 401 || status === 403 || status === 404) {
                  return false;
                }
              }
              // Retry standard network failures up to 2 times
              return failureCount < 2;
            },
          },
          mutations: {
            retry: 0, // Never retry mutations automatically to prevent duplicate state updates
          }
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GlobalNetworkIndicator />
    </QueryClientProvider>
  );
}