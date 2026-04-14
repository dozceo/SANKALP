import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import "@/app/globals.css";
import { cookies } from "next/headers";
import { ActorRole } from "@/types/common";

// Load fonts as per The Cognitive Architect design system
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SANKALP-AEI | Adaptive Educational Intelligence",
  description: "Premium digital curator for the mind. Powered by Bayesian knowledge tracing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const currentRole = (cookieStore.get("userRole")?.value as ActorRole) || "student";

  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        {/* Material Symbols Outlined - Required for SANKALP Iconography */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Injecting Neumorphic Base Variables to guarantee design system compliance */}
        <style>{`
          :root {
            --nm-bg: #EBEDF0;
            --nm-shadow-dark: rgba(163, 177, 198, 0.6);
            --nm-shadow-light: rgba(255, 255, 255, 1);
          }
          body {
            background-color: var(--nm-bg);
          }
          .neumorphic-flat {
            background: var(--nm-bg);
            box-shadow: 9px 9px 16px var(--nm-shadow-dark), -9px -9px 16px var(--nm-shadow-light);
          }
          .neumorphic-inset {
            background: var(--nm-bg);
            box-shadow: inset 6px 6px 12px var(--nm-shadow-dark), inset -6px -6px 12px var(--nm-shadow-light);
          }
          .neumorphic-pressed {
            box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
          }
          .glass {
            background: rgba(235, 237, 240, 0.7);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </head>
      <body className="font-body text-on-surface antialiased min-h-screen flex overflow-hidden selection:bg-primary-container selection:text-primary-dim">
        {/* Global App Shell */}
        <Sidebar role={currentRole} />
        
        <div className="flex-1 flex flex-col h-screen relative w-full">
          <Header role={currentRole} />
          
          {/* Main Content Area - Expansive white space, breathing layout */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10 z-0">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}