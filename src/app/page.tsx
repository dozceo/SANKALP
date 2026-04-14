import React from "react";
import Link from "next/link";

// --- Types ---

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface RoleCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  colSpan: string;
}

// --- Data ---

const FEATURES: Feature[] = [
  {
    id: "brain-map",
    title: "Brain Map Visualization",
    description: "Interactive neural pathways that visualize knowledge retention and conceptual connections in a stunning 3D landscape.",
    icon: "psychology",
  },
  {
    id: "adaptive-difficulty",
    title: "Adaptive Difficulty",
    description: "Dynamic challenge scaling that stays perfectly within the user's Zone of Proximal Development for optimal flow.",
    icon: "tune",
  },
  {
    id: "spaced-revision",
    title: "Spaced Revision Intelligence",
    description: "AI-calculated recall sessions designed to move short-term knowledge into long-term permanent storage.",
    icon: "rebase_edit",
  },
  {
    id: "realtime-tracking",
    title: "Real-time Tracking",
    description: "Precision monitoring of interaction patterns and response velocity to gauge genuine mental engagement levels.",
    icon: "monitoring",
  },
  {
    id: "ai-interventions",
    title: "AI Interventions",
    description: "Proactive nudges and micro-breaks triggered automatically when the system detects cognitive fatigue.",
    icon: "smart_toy",
  },
  {
    id: "story-mode",
    title: "Story Mode Learning",
    description: "Transforming abstract curriculum into narrative-driven quests that increase emotional resonance and retention.",
    icon: "auto_stories",
  },
];

const ROLES: RoleCard[] = [
  {
    id: "student",
    title: "Students",
    description: "See your knowledge grow through interactive visualizers and Bayesian mastery tracking.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
    href: "/student/dashboard",
    colSpan: "md:col-span-7",
  },
  {
    id: "teacher",
    title: "Teachers",
    description: "Manage classrooms with predictive analytics and automated intervention tools.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1400&auto=format&fit=crop",
    href: "/teacher/dashboard",
    colSpan: "md:col-span-5",
  },
];

// --- Components ---

const MaterialIcon: React.FC<{ name: string; filled?: boolean; className?: string }> = ({
  name,
  filled = false,
  className = "",
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    aria-hidden="true"
  >
    {name}
  </span>
);

const NavBar: React.FC = () => (
  <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl transition-all duration-300">
    <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-5">
      <div className="text-2xl font-black tracking-tighter text-primary font-headline uppercase">
        SANKALP AEI
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link href="#features" className="text-primary font-bold transition-all duration-300 relative group">
          Features
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full opacity-100"></span>
        </Link>
        <Link href="#roles" className="text-on-surface-variant hover:text-primary font-label uppercase tracking-widest text-[10px] font-black transition-all duration-300">
          Roles
        </Link>
        <Link href="#pricing" className="text-on-surface-variant hover:text-primary font-label uppercase tracking-widest text-[10px] font-black transition-all duration-300">
          Pricing
        </Link>
        <Link href="#about" className="text-on-surface-variant hover:text-primary font-label uppercase tracking-widest text-[10px] font-black transition-all duration-300">
          About
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden sm:block text-on-surface-variant hover:text-primary font-semibold px-4 py-2 transition-all text-sm">
          Login
        </Link>
        <Link
          href="/register"
          className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_8px_16px_rgba(112,42,225,0.2)] hover:scale-[0.98] transition-transform"
        >
          Get Started
        </Link>
      </div>
    </div>
  </nav>
);

const HeroSection: React.FC = () => (
  <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 bg-[radial-gradient(circle_at_50%_50%,rgba(112,42,225,0.05)_0%,transparent_70%)]">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
      <div className="z-10 flex flex-col items-start">
        <span className="inline-block px-4 py-2 rounded-full neumorphic-inset text-primary font-label text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          Attention & Engagement Intelligence
        </span>
        <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-8">
          Intelligence-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Learning</span>
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-xl font-body">
          Making the invisible processes of learning visible through adaptive intelligence. Track attention, engagement, and mastery in real-time using Bayesian probability.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link
            href="/register"
            className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_8px_24px_rgba(112,42,225,0.25)] hover:scale-[0.98] transition-transform"
          >
            Launch Platform
          </Link>
          <Link
            href="#demo"
            className="neumorphic-flat text-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-[0.98] transition-transform"
          >
            Request Demo
          </Link>
        </div>
      </div>
      <div className="relative">
        <div className="relative z-10 rounded-3xl overflow-hidden neumorphic-extruded p-4 transition-transform duration-700 hover:scale-[1.02]">
          <img
            alt="AI Learning Visualization"
            className="w-full h-auto rounded-2xl shadow-inner"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN-S5xomyXGcO17QW45lh9rhMOiIOYzV5CIdwCGhkFqjABO-lkRiViLFWAQkUTFraxKkbK27V2JUyd3VHEHC0htKmk9hFOouXKFQ5uXMXT0zDRIG_-KOBO6W5uJpVZeloD4Sjy0-57-aUyaj_Fp6kW-HmpnfU2LItoboJ1MMH6oYOsB5TTt7iixGygPEOJImNgPC8D4sdIOoDNhXarRPO3ZuRWmNacCZ150M5AItGYQrcfAliduWANvpRKdI-P41_4i2RKg1ZVLQL1"
          />
        </div>
        {/* Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  </section>
);

const FeaturesSection: React.FC = () => (
  <section className="py-32 relative" id="features">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-24 flex flex-col items-center">
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-on-surface">
          Architecting Cognitive Success
        </h2>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          Our platform uses advanced interaction data to craft a personalized learning journey that adapts to every nuance of your focus and understanding.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className="neumorphic-extruded p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2 group"
          >
            <div className="w-14 h-14 rounded-full neumorphic-inset flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <MaterialIcon name={feature.icon} className="text-primary text-2xl" />
            </div>
            <h3 className="font-headline text-xl font-bold mb-4 text-on-surface">
              {feature.title}
            </h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const RolesSection: React.FC = () => (
  <section className="py-32 overflow-hidden bg-surface-container-low rounded-t-[4rem]" id="roles">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-20 flex flex-col items-start">
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8 text-on-surface">
          Empowering the Ecosystem
        </h2>
        <div className="w-24 h-2 neumorphic-inset bg-primary rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {ROLES.map((role) => (
          <Link
            key={role.id}
            href={role.href}
            className={`${role.colSpan} group relative rounded-3xl overflow-hidden neumorphic-extruded p-4 h-[450px] block`}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img
                alt={role.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src={role.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/30 to-transparent flex flex-col justify-end p-10">
                <h4 className="text-white font-headline text-3xl font-bold mb-3">
                  {role.title}
                </h4>
                <p className="text-white/80 text-lg max-w-md leading-relaxed">
                  {role.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 selection:text-primary">
      <NavBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <RolesSection />
      </main>
    </div>
  );
}