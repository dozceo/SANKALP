import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// The Cognitive Architect Design System: Dual-font setup
const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "SANKALP AEI — Adaptive Educational Intelligence",
  description:
    "A learning intelligence system hyper-focused on attention retention, active engagement, and Bayesian mastery tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Material Symbols Outlined for system icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* FOUC Prevention — apply dark class before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = JSON.parse(localStorage.getItem('sankalp-ui-storage') || '{}');
                const theme = stored?.state?.theme || 'dark';
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else if (theme === 'system') {
                  document.documentElement.classList.add('system');
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches)
                    document.documentElement.classList.add('dark');
                }
              } catch(e) { document.documentElement.classList.add('dark'); }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex bg-background text-on-surface font-body selection:bg-primary/20 transition-colors duration-300">
        <QueryProvider>
          <ThemeProvider>
            {/* Global Layout Structure */}
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 md:p-10">
                {/* 
                  Content area uses a breathing layout. 
                  No rigid borders, relying on spacing and neumorphic depth.
                */}
                {children}
              </main>
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}