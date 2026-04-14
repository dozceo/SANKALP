import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActorRole } from "@/types/common";

export interface User {
  id: string;
  role: ActorRole;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: ActorRole) => void;
  logout: () => void;
}

// Mock users for the development portal
const MOCK_USERS: Record<ActorRole, User> = {
  student: {
    id: "stu_001",
    role: "student",
    name: "Aarav",
    email: "aarav@sankalp.edu",
  },
  teacher: {
    id: "tch_001",
    role: "teacher",
    name: "Dr. Sharma",
    email: "sharma@sankalp.edu",
  },
  parent: {
    id: "par_001",
    role: "parent",
    name: "Mr. Kumar",
    email: "kumar@sankalp.edu",
  },
  admin: {
    id: "adm_001",
    role: "admin",
    name: "System Admin",
    email: "admin@sankalp.edu",
  },
  mentor: {
    id: "mnt_001",
    role: "mentor",
    name: "Guide",
    email: "guide@sankalp.edu",
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (role: ActorRole) => {
        set({ user: MOCK_USERS[role], isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "sankalp-auth-storage",
    }
  )
);