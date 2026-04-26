import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroTerrarium from "@/assets/hero-terrarium.jpg";
import SiteNav from "@/components/SiteNav";

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      {/* Immersive Full-Bleed Background */}
      <img
        src={heroTerrarium}
        alt="Glass dome terrarium"
        className="fixed inset-0 -z-50 h-full w-full object-cover animate-fade-in animate-slow-zoom"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-40"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 20%, hsl(160 25% 4% / 0.8) 100%)",
        }}
      />

      <SiteNav />

      {/* ============ HERO ============ */}
      <section className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="relative">
          <div className="relative min-h-[78vh] w-full pt-12">
            {/* Scan line — subtle precision farming detail */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] animate-scan"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.6), transparent)",
                boxShadow: "0 0 24px hsl(88 60% 55% / 0.4)",
              }}
            />

            {/* TOP-LEFT: tag + headline */}
            <div className="absolute left-0 top-6 max-w-md md:top-12">
              <div className="hud-text inline-block animate-fade-up text-[10px] uppercase tracking-[0.2em] text-foreground/90 font-bold">
                start
              </div>

              <h2 className="hud-text mt-8 font-display text-[44px] font-light leading-[1.05] tracking-tight text-balance text-white animate-fade-up delay-100 md:text-[60px]">
                The living world{" "}
                <span className="italic text-accent">of</span>
                <br />
                <span className="font-medium">precision farming</span>
              </h2>

              <p className="hud-text mt-5 max-w-xs text-[12px] leading-relaxed text-white animate-fade-up delay-200">
                Verdant turns sealed micro-ecosystems into measurable
                environments — sensing, deciding and growing in perfect
                balance.
              </p>

              <div className="mt-7 flex items-center gap-6 animate-fade-up delay-300">
                <Link
                  to="/live"
                  className="group hud-text inline-flex items-center gap-2 text-[12px] font-bold text-white transition hover:text-accent"
                >
                  Open live feed
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Link>
                <Link
                  to="/about"
                  className="hud-text inline-flex items-center gap-2 text-[12px] font-medium text-white/80 transition hover:text-white"
                >
                  About the system
                </Link>
              </div>
            </div>

            {/* TOP-RIGHT: connector lines + small description */}
            <div className="absolute right-0 top-12 hidden max-w-[230px] md:block">
              <div className="relative">
                <svg
                  className="absolute -left-20 top-3 h-px w-20 text-white/50"
                  viewBox="0 0 80 1"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <line
                    x1="0"
                    y1="0.5"
                    x2="80"
                    y2="0.5"
                    stroke="currentColor"
                    strokeDasharray="2 3"
                  />
                </svg>
                <p className="hud-text text-[11px] leading-[1.7] text-white animate-fade-up delay-500">
                  A simple interface for growers and engineers — transparent
                  conditions, no hidden variables, full protection for every
                  cycle of life.
                </p>
              </div>
            </div>

            {/* MIDDLE-RIGHT: viewport panel — now containerless HUD */}
            <div className="absolute right-0 top-1/2 hidden w-[44%] max-w-[520px] -translate-y-1/2 md:block">
              <div className="relative h-[180px] p-5 animate-fade-up delay-700">
                <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white font-bold hud-text">
                  <span className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
                    chamber 04
                  </span>
                  <span className="font-mono text-white/80">
                    23.4°C · 68%
                  </span>
                </div>
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                  <div className="hud-text">
                    <div className="font-display text-[34px] font-bold leading-none text-white">
                      +12.8%
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/80 font-bold">
                      yield · 7 days
                    </div>
                  </div>
                  <div className="flex h-12 items-end gap-1">
                    {[0.3, 0.5, 0.4, 0.7, 0.55, 0.85, 1].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-sm bg-accent/90 animate-bar-rise shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                        style={{
                          height: `${h * 100}%`,
                          animationDelay: `${700 + i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM-LEFT: corner index */}
            <div className="absolute bottom-0 left-0 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white font-bold hud-text">
              <span className="font-mono">01 / 04</span>
              <span className="hairline w-12 bg-white/50" />
              <span>the dome</span>
            </div>

            {/* BOTTOM-RIGHT: micro brand */}
            <div className="absolute bottom-0 right-0 font-mono text-[10px] tracking-[0.2em] text-white font-bold hud-text">
              VRD · 2026
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-30 mx-auto mt-32 max-w-[1440px] px-6 pb-10 md:px-10">
        <div className="flex flex-col items-start justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-white font-bold hud-text md:flex-row md:items-center">
          <span className="font-display normal-case tracking-[0.45em] text-white">
            VERDANT
          </span>
          <span>© 2026 · grown in the dark</span>
          <div className="flex items-center gap-5">
            <Link to="/live" className="transition hover:text-accent">
              live feed
            </Link>
            <Link to="/about" className="transition hover:text-accent">
              system
            </Link>
            <Link to="/about" className="transition hover:text-accent">
              contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
