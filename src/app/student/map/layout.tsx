// Full-screen layout for Brain Map — bypasses the padded student <main>
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MapLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#0a0b14",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Back button overlay */}
      <Link
        href="/student/dashboard"
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "rgba(12,14,28,0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          color: "#e2e8f0",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>
      {children}
    </div>
  );
}
