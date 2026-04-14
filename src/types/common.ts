/**
 * SANKALP-AEI Shared Frontend Types
 *
 * Core type definitions used across the frontend application.
 * These mirror the backend ActorRole enum from src/core/interfaces.
 */

/** The five actor roles in the SANKALP-AEI ecosystem */
export type ActorRole = "student" | "teacher" | "parent" | "admin" | "mentor";

/** Dashboard paths (role → shell) */
export const ROLE_DASHBOARDS: Record<ActorRole, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  admin: "/admin/dashboard",
  mentor: "/teacher/dashboard", // Mentors share the teacher portal
};
