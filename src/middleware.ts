import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SANKALP-AEI Role-Based Access Control Middleware
 *
 * Enforces strict boundary checks for role-specific portals.
 * Uses edge-compatible checks to ensure users cannot access
 * unauthorized cognitive or administrative spaces.
 *
 * Auth Flow:
 * 1. User selects role on /login → page sets cookie `sankalp_actor_role=<role>`
 * 2. In production: Email/Password → Firebase Auth → custom claims with role
 * 3. This middleware reads the cookie on every protected route
 * 4. If no cookie → redirect to /login?callbackUrl=<path>
 * 5. If wrong role → redirect to /login?redirect_reason=portal_boundary
 */

// Define route requirements mapping paths to allowed ActorRoles
const roleRoutes: Record<string, string[]> = {
  "/student": ["student"],
  "/teacher": ["teacher", "admin", "mentor"],
  "/parent": ["parent"],
  "/admin": ["admin"],
};

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Identify if the current path falls under a protected portal
  const requiredRoles = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (requiredRoles) {
    // Extract the actor's role from the session cookie
    const userRole = request.cookies.get("sankalp_actor_role")?.value;

    // If no role is found → redirect to login
    if (!userRole) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      url.searchParams.set("redirect_reason", "unauthenticated");
      return NextResponse.redirect(url);
    }

    // If role is not authorized for this portal → redirect with boundary reason
    if (!requiredRoles.includes(userRole)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect_reason", "portal_boundary");
      return NextResponse.redirect(url);
    }
  }

  // Authenticated user on /login → redirect to their dashboard
  if (pathname === "/login" || pathname === "/register") {
    const userRole = request.cookies.get("sankalp_actor_role")?.value;
    if (userRole) {
      const dashboards: Record<string, string> = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        parent: "/parent/dashboard",
        admin: "/admin/dashboard",
        mentor: "/teacher/dashboard",
      };
      const dest = dashboards[userRole] || "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // Allow the request to proceed if authorized or if the route is public
  return NextResponse.next();
}

// Optimize middleware execution by restricting it to specific portal paths + login
export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/parent/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};