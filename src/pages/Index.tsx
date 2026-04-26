import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import CinematicText from "@/components/CinematicText";

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <SiteNav />

      {/* ============ HUD HERO ============ */}
      <section className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="relative min-h-[78vh] py-16 md:py-24">
          {/* TOP-LEFT: tag + headline (containerless) */}
          <div className="relative max-w-md animate-fade-up">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
              <span className="h-px w-6 bg-foreground/60" />
              start
            </div>

            <h2 className="mt-6 font-display text-[44px] font-light leading-[1.05] tracking-tight text-balance text-foreground/95 hud-text-strong animate-fade-up delay-100 md:text-[64px]">
              The living world{" "}
              <span className="italic text-accent/95">of</span>
              <br />
              <span className="font-medium">precision farming</span>
            </h2>

            <p className="mt-5 max-w-xs text-[12px] leading-relaxed text-foreground/80 hud-text animate-fade-up delay-200">
              Terra Hawk turns sealed micro-ecosystems into measurable
              environments — sensing, deciding and growing in perfect balance.
            </p>

            <div className="mt-7 flex items-center gap-5 animate-fade-up delay-300">
              <Link
                to="/live"
                className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/95 hud-text-strong transition hover:text-accent"
              >
                <span className="h-px w-8 bg-foreground/60 transition-all group-hover:w-12 group-hover:bg-accent" />
                open live feed
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                to="/about"
                className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/65 hud-text transition hover:text-foreground"
              >
                about the system
              </Link>
            </div>
          </div>

          {/* TOP-RIGHT: connector + micro caption */}
          <div className="absolute right-0 top-24 hidden max-w-[230px] md:block">
            <div className="relative">
              <svg
                className="absolute -left-24 top-2 h-px w-24 text-foreground/45"
                viewBox="0 0 96 1"
                preserveAspectRatio="none"
                aria-hidden
              >
                <line
                  x1="0"
                  y1="0.5"
                  x2="96"
                  y2="0.5"
                  stroke="currentColor"
                  strokeDasharray="2 3"
                  className="animate-shimmer"
                />
              </svg>
              <CinematicText
                thoughts={[
                  [
                    "transparent conditions",
                    "no hidden variables",
                    "full protection"
                  ]
                ]}
                className="font-mono text-[10px] uppercase leading-[1.9] tracking-[0.2em] text-foreground/75 hud-text animate-fade-up delay-500"
              />
            </div>
          </div>

          {/* MIDDLE-RIGHT: HUD telemetry block — no card, hairline reticle */}
          <div className="mt-16 md:absolute md:right-0 md:top-1/2 md:mt-0 md:w-[44%] md:max-w-[460px] md:-translate-y-1/2">
            <div className="hud-frame relative px-6 py-5 animate-fade-up delay-700">
              <span className="hud-c1" />
              <span className="hud-c2" />

              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/80 hud-text">
                <span className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
                  chamber 04
                </span>
                <span className="text-foreground/70 animate-tick">
                  23.4°C · 68%
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="font-display text-[44px] font-light leading-none text-foreground/95 hud-text-strong tabular-nums">
                    +12.8%
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hud-text">
                    yield · 7d
                  </div>
                </div>
                <div className="flex h-12 items-end gap-1">
                  {[0.3, 0.5, 0.4, 0.7, 0.55, 0.85, 1].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-accent/85 animate-bar-rise"
                      style={{
                        height: `${h * 100}%`,
                        animationDelay: `${700 + i * 80}ms`,
                        boxShadow: "0 0 6px hsl(88 60% 55% / 0.6)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM-LEFT: corner index */}
          <div className="mt-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/75 hud-text md:absolute md:bottom-0 md:left-0 md:mt-0">
            <span>01 / 04</span>
            <span className="hairline w-12" />
            <span>the dome</span>
          </div>

          {/* BOTTOM-RIGHT: micro brand */}
          <div className="hidden font-mono text-[10px] tracking-[0.25em] text-foreground/70 hud-text md:absolute md:bottom-0 md:right-0 md:block">
            THK · 2026
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative mx-auto mt-20 max-w-[1440px] px-6 pb-10 md:px-10">
        <div className="hairline mb-6" />
        <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hud-text md:flex-row md:items-center">
          <span className="font-display normal-case tracking-[0.45em] text-foreground/90 hud-text-strong">
            TERRA HAWK
          </span>
          <span>© 2026 · grown in the dark</span>
          <div className="flex items-center gap-5">
            <Link to="/live" className="transition hover:text-foreground">
              live feed
            </Link>
            <Link to="/about" className="transition hover:text-foreground">
              system
            </Link>
            <Link to="/about" className="transition hover:text-foreground">
              contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
