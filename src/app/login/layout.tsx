import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SANKALP AEI | Join the Future of Learning",
  description:
    "Register for SANKALP AEI — an intelligence-driven learning experience tailored to your role in the education ecosystem.",
};

/**
 * Login/Registration Layout — Standalone, no sidebar/header.
 * Uses "The Cognitive Architect" light-theme aesthetic.
 * Completely separate from the authenticated app shell.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#f5f7f9" }}>
      {children}
    </div>
  );
}
