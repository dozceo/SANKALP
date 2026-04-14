"use client";

import { useEffect } from "react";
import { useUIStore, type ThemeMode } from "@/store/uiStore";

/**
 * ThemeProvider — Wires the Zustand theme state to the DOM.
 *
 * Responsibilities:
 * 1. Reads current theme from useUIStore (persisted to localStorage).
 * 2. Applies the `dark` or `system` class to the <html> element.
 * 3. Listens to system `prefers-color-scheme` changes when theme = "system".
 * 4. Prevents FOUC (Flash of Unstyled Content) via localStorage pre-read.
 *
 * Must be placed inside the <body> tag (client component).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    // If theme is "system", listen for OS-level changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return <>{children}</>;
}

/**
 * Apply the theme class to the <html> element.
 *
 * - "dark"   → adds `dark` class
 * - "light"  → removes `dark` class
 * - "system" → adds `system` class (CSS `@media prefers-color-scheme` takes over)
 *              and adds `dark` if the OS prefers dark.
 */
function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;

  // Clean all theme classes first
  root.classList.remove("dark", "system");

  switch (theme) {
    case "dark":
      root.classList.add("dark");
      break;
    case "system": {
      root.classList.add("system");
      // Also apply dark if OS prefers it, for JS-driven components
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      }
      break;
    }
    case "light":
    default:
      // No dark class needed
      break;
  }
}
