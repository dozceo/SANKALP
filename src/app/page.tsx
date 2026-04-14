import Link from "next/link";
import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary/20 selection:text-primary">
      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl transition-all duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-5">
          <div className="text-2xl font-black tracking-tighter text-primary font-headline uppercase">
            SANKALP AEI
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-primary font-bold shadow-[0_2px_0_0_currentColor] py-1 transition-all duration-300">
              Features
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
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:block text-on-surface-variant hover:text-primary font-bold text-sm transition-all">
              Login
            </Link>
            <Link href="/login" className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all uppercase tracking-wider font-label">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,42,225,0.05)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <span className="inline-block px-5 py-2 rounded-full neumorphic-inset text-primary font-label text-[10px] font-black uppercase tracking-widest mb-8">
                Attention & Engagement Intelligence
              </span>
              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-8">
                Intelligence-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Learning</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-10 max-w-xl font-medium">
                Making the invisible processes of learning visible through adaptive intelligence. Track attention, engagement, and mastery in real-time using Bayesian probability models.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="/login" className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all flex items-center gap-2">
                  Launch Platform
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <button className="neumorphic-flat text-primary px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:scale-[0.98] transition-all">
                  Request Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden neumorphic-flat p-4 transition-transform duration-700 hover:scale-[1.02]">
                <img 
                  alt="AI Learning Visualization" 
                  className="w-full h-auto rounded-2xl opacity-90" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN-S5xomyXGcO17QW45lh9rhMOiIOYzV5CIdwCGhkFqjABO-lkRiViLFWAQkUTFraxKkbK27V2JUyd3VHEHC0htKmk9hFOouXKFQ5uXMXT0zDRIG_-KOBO6W5uJpVZeloD4Sjy0-57-aUyaj_Fp6kW-HmpnfU2LItoboJ1MMH6oYOsB5TTt7iixGygPEOJImNgPC8D4sdIOoDNhXarRPO3ZuRWmNacCZ150M5AItGYQrcfAliduWANvpRKdI-P41_4i2RKg1ZVLQL1"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-32 bg-surface-container-low/50" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <span className="text-primary font-label text-[10px] font-black uppercase tracking-widest mb-4 block">System Capabilities</span>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-on-surface">Architecting Cognitive Success</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto font-medium">
                Our platform uses advanced biometric and interaction data to craft a personalized learning journey that adapts to every nuance of your focus.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="neumorphic-flat p-10 rounded-3xl transition-all duration-300 hover:scale-[1.02] group">
                  <div className="w-14 h-14 rounded-full neumorphic-inset flex items-center justify-center mb-8 group-hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-4 text-on-surface">{feature.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm font-medium">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role-based Panels */}
        <section className="py-32 overflow-hidden" id="roles">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <span className="text-primary font-label text-[10px] font-black uppercase tracking-widest mb-4 block">Ecosystem</span>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8 text-on-surface">Empowering the Ecosystem</h2>
              <div className="w-24 h-2 neumorphic-inset rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-primary rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Students */}
              <div className="md:col-span-7 group relative rounded-3xl overflow-hidden neumorphic-flat p-4 h-[450px]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <img alt="Student Platform" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBivunnCftD7UjJO7eXRmkl0N3kmUh1wtBNdKmWm-_-3w0Oq-QO3uS7u89VmVU6zXSKD11lCUX6BVd8tsn_ADppsGZb1PDpChF1nFPbLKc7S9eYU94jNkwOWw7dQIv02D785w3QUg-kmxfs_-A81TT10Yw2TOOwT0qU4NpZ3GZNO9DnsfA38wfIhsb40NimVXzyCmQj5YTmZIhPkqlEwR1FJBWbteABnCHkgN-u2qcpZu9zPhpl7bxUHc0Wv0mRDE8-8cj6aDAUreT5" />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent flex flex-col justify-end p-10">
                    <span className="text-primary-container font-label text-[10px] font-black uppercase tracking-widest mb-3 block">Portal</span>
                    <h4 className="text-surface-container-lowest font-headline text-3xl font-extrabold mb-3">Students</h4>
                    <p className="text-surface-container-low/80 text-base font-medium max-w-md">See your knowledge grow through interactive 3D Brain Map visualizers and Beta(α,β) mastery tracking.</p>
                  </div>
                </div>
              </div>
              
              {/* Teachers */}
              <div className="md:col-span-5 group relative rounded-3xl overflow-hidden neumorphic-flat p-4 h-[450px]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface-container-low">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-10">
                    <div className="w-12 h-12 rounded-full neumorphic-flat flex items-center justify-center mb-6 bg-surface">
                      <span className="material-symbols-outlined text-primary">co_present</span>
                    </div>
                    <h4 className="text-on-surface font-headline text-3xl font-extrabold mb-3">Teachers</h4>
                    <p className="text-on-surface-variant text-base font-medium">Identify struggle patterns early with confidence interval bands and automated intervention triggers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const FEATURES = [
  {
    icon: "psychology",
    title: "Brain Map™ Visualization",
    description: "Interactive neural pathways that visualize knowledge retention and conceptual connections in a stunning 3D landscape."
  },
  {
    icon: "tune",
    title: "Adaptive Difficulty",
    description: "Dynamic challenge scaling that stays perfectly within the user's Zone of Proximal Development for optimal flow."
  },
  {
    icon: "rebase_edit",
    title: "Spaced Revision Intelligence",
    description: "AI-calculated recall sessions designed to move short-term knowledge into long-term permanent storage."
  },
  {
    icon: "monitoring",
    title: "Real-time Tracking",
    description: "Precision monitoring of interaction speed and patterns to gauge genuine mental engagement levels."
  },
  {
    icon: "smart_toy",
    title: "AI Interventions",
    description: "Proactive nudges and micro-breaks triggered automatically when the system detects cognitive fatigue."
  },
  {
    icon: "auto_stories",
    title: "Story Mode Learning",
    description: "Transforming abstract curriculum into narrative-driven quests that increase emotional resonance and retention."
  }
];