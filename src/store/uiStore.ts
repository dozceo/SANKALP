import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { DecisionAction } from "@/types/decision";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export type ThemeMode = "light" | "dark" | "system";

interface UIState {
  // Layout & Theming
  sidebarOpen: boolean;
  theme: ThemeMode;

  // ADK Action State (Drives the UX Architecture & Visual State Manager)
  currentActionState: DecisionAction | "idle";

  // Overlays & Modals
  activeModal: string | null;
  isInterventionActive: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setActionState: (action: DecisionAction | "idle") => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  triggerIntervention: (isActive: boolean) => void;
}

// ----------------------------------------------------------------------
// Zustand Store Implementation
// ----------------------------------------------------------------------

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Default to dark mode as per SANKALP "Cognitive Architect" design system
        theme: "dark",
        sidebarOpen: true,
        
        // UX Architecture: ActionStateRouter defaults to idle
        currentActionState: "idle",
        
        activeModal: null,
        isInterventionActive: false,

        toggleSidebar: () => 
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
          
        setSidebarOpen: (isOpen) => 
          set({ sidebarOpen: isOpen }),
          
        setTheme: (theme) => 
          set({ theme }),
          
        setActionState: (action) => 
          set({ currentActionState: action }),
          
        openModal: (modalId) => 
          set({ activeModal: modalId }),
          
        closeModal: () => 
          set({ activeModal: null }),
          
        triggerIntervention: (isActive) => 
          set({ isInterventionActive: isActive }),
      }),
      {
        name: "sankalp-ui-storage",
        // Only persist user preferences, not transient UI states like modals or interventions
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: "UIStore" }
  )
);