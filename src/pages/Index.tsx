import { ArrowUpRight, Menu, Leaf, Cpu, Droplets, Sun } from "lucide-react";
import heroTerrarium from "@/assets/hero-terrarium.jpg";

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      {/* Ambient background bokeh layer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 18% 32%, hsl(38 80% 50% / 0.08), transparent 35%), radial-gradient(circle at 82% 68%, hsl(88 60% 45% / 0.06), transparent 40%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "var(--gradient-vignette)" }}
      />

      {/* ============ NAV ============ */}
      <header className="relative z-30 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-10 md:py-7">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
          v.01 · live
        </div>
        <h1 className="font-display text-[15px] font-normal tracking-[0.45em] text-foreground/95">
          VERDANT
        </h1>
        <button
          aria-label="Menu"
          className="glass flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
        >
          <Menu className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        {/* Hero image */}
        <div className="relative">
          <div className="relative h-[78vh] min-h-[640px] w-full overflow-hidden rounded-[2rem] border border-white/5">
            <img
              src={heroTerrarium}
              alt="Glass dome terrarium with a small plant growing around a microcontroller"
              className="absolute inset-0 h-full w-full object-cover animate-fade-in"
              width={1920}
              height={1080}
            />
            {/* dark gradient overlay for text legibility */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, hsl(160 25% 4% / 0.55) 0%, transparent 30%, transparent 60%, hsl(160 25% 4% / 0.7) 100%), linear-gradient(90deg, hsl(160 25% 4% / 0.65) 0%, transparent 35%, transparent 70%, hsl(160 25% 4% / 0.4) 100%)",
              }}
            />

            {/* Scan line — subtle precision farming detail */}
            <div
              aria-hidden
              className="absolute inset-x-0 h-[2px] animate-scan"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.6), transparent)",
                boxShadow: "0 0 24px hsl(88 60% 55% / 0.4)",
              }}
            />

            {/* TOP-LEFT: tag + headline */}
            <div className="absolute left-6 top-6 max-w-md md:left-12 md:top-12">
              <div className="glass-pill animate-fade-up text-foreground/85">
                start
              </div>

              <h2 className="mt-8 font-display text-[44px] font-light leading-[1.05] tracking-tight text-balance text-foreground/95 animate-fade-up delay-100 md:text-[60px]">
                The living world{" "}
                <span className="italic text-accent/90">of</span>
                <br />
                <span className="font-medium">precision farming</span>
              </h2>

              <p className="mt-5 max-w-xs text-[12px] leading-relaxed text-foreground/60 animate-fade-up delay-200">
                Verdant turns sealed micro-ecosystems into measurable
                environments — sensing, deciding and growing in perfect
                balance.
              </p>

              <div className="mt-7 flex items-center gap-2 animate-fade-up delay-300">
                <button className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[12px] font-medium text-primary-foreground transition hover:bg-primary/90">
                  Get in touch
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </button>
                <button className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-medium text-foreground/90 transition hover:bg-white/10">
                  See the dome
                </button>
              </div>
            </div>

            {/* TOP-RIGHT: connector lines + small description */}
            <div className="absolute right-6 top-12 hidden max-w-[230px] md:right-12 md:block">
              <div className="relative">
                {/* dotted connector */}
                <svg
                  className="absolute -left-20 top-3 h-px w-20 text-foreground/30"
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
                <p className="text-[11px] leading-[1.7] text-foreground/55 animate-fade-up delay-500">
                  A simple interface for growers and engineers — transparent
                  conditions, no hidden variables, full protection for every
                  cycle of life.
                </p>
              </div>
            </div>

            {/* MIDDLE-RIGHT: glass viewport panel */}
            <div className="absolute right-6 top-1/2 hidden w-[44%] max-w-[520px] -translate-y-1/2 md:right-12 md:block">
              <div className="glass-strong relative h-[180px] rounded-[1.25rem] p-5 animate-fade-up delay-700">
                <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-foreground/55">
                  <span className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    chamber 04
                  </span>
                  <span className="font-mono text-foreground/40">
                    23.4°C · 68%
                  </span>
                </div>
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
                  <div>
                    <div className="font-display text-[34px] font-light leading-none text-foreground/95">
                      +12.8%
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                      yield · 7 days
                    </div>
                  </div>
                  {/* mini bar viz */}
                  <div className="flex h-12 items-end gap-1">
                    {[0.3, 0.5, 0.4, 0.7, 0.55, 0.85, 1].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-sm bg-accent/70"
                        style={{ height: `${h * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM-LEFT: corner index */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground/45 md:bottom-8 md:left-12">
              <span className="font-mono">01 / 04</span>
              <span className="hairline w-12" />
              <span>the dome</span>
            </div>

            {/* BOTTOM-RIGHT: micro brand */}
            <div className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.2em] text-foreground/40 md:bottom-8 md:right-12">
              VRD · 2026
            </div>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE METRICS ============ */}
      <section className="relative mx-auto mt-10 max-w-[1440px] px-6 md:px-10">
        <div className="glass flex flex-wrap items-center justify-between gap-6 rounded-full px-8 py-4">
          {[
            { k: "deployments", v: "1,248" },
            { k: "live chambers", v: "412" },
            { k: "avg. uptime", v: "99.97%" },
            { k: "species supported", v: "86" },
          ].map((m) => (
            <div key={m.k} className="flex items-baseline gap-3">
              <span className="font-display text-[18px] font-light text-foreground/95">
                {m.v}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                {m.k}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative mx-auto mt-28 max-w-[1440px] px-6 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <div className="glass-pill inline-block text-foreground/80">
              system
            </div>
            <h3 className="mt-5 max-w-xl font-display text-[32px] font-light leading-tight tracking-tight text-foreground/95 md:text-[42px]">
              Four quiet senses,{" "}
              <span className="italic text-accent/90">one</span> living
              decision.
            </h3>
          </div>
          <p className="hidden max-w-[260px] text-[11px] leading-relaxed text-foreground/55 md:block">
            Each chamber is a closed loop. Verdant only intervenes when the
            ecosystem asks for it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Cpu,
              tag: "01",
              t: "Sense",
              d: "Sub-millisecond telemetry from temperature, humidity, soil and light.",
            },
            {
              icon: Droplets,
              tag: "02",
              t: "Hydrate",
              d: "Micro-doses of water delivered exactly when roots ask for them.",
            },
            {
              icon: Sun,
              tag: "03",
              t: "Illuminate",
              d: "Tunable spectrum that follows the season the plant remembers.",
            },
            {
              icon: Leaf,
              tag: "04",
              t: "Grow",
              d: "Outcomes you can measure — and a story you can replay.",
            },
          ].map(({ icon: Icon, tag, t, d }) => (
            <article
              key={tag}
              className="glass group relative h-[260px] overflow-hidden rounded-[1.5rem] p-6 transition duration-700 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between">
                <Icon
                  className="h-5 w-5 text-foreground/70 transition group-hover:text-accent"
                  strokeWidth={1.25}
                />
                <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/40">
                  {tag}
                </span>
              </div>
              <div className="absolute inset-x-6 bottom-6">
                <h4 className="font-display text-[26px] font-light text-foreground/95">
                  {t}
                </h4>
                <p className="mt-2 text-[11px] leading-relaxed text-foreground/55">
                  {d}
                </p>
              </div>
              {/* subtle inner glow on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 50% 100%, hsl(88 60% 55% / 0.18), transparent 60%)",
                }}
              />
            </article>
          ))}
        </div>
      </section>

      {/* ============ CTA STRIP ============ */}
      <section className="relative mx-auto mt-28 max-w-[1440px] px-6 pb-20 md:px-10">
        <div className="glass relative overflow-hidden rounded-[2rem] px-8 py-14 md:px-16 md:py-20">
          <div
            aria-hidden
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 80% 50%, hsl(88 50% 40% / 0.18), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="glass-pill inline-block text-foreground/80">
                begin
              </div>
              <h3 className="mt-5 font-display text-[34px] font-light leading-tight tracking-tight text-foreground/95 md:text-[48px]">
                A small dome.{" "}
                <span className="italic text-accent/90">An entire</span>{" "}
                growing system.
              </h3>
              <p className="mt-4 max-w-md text-[12px] leading-relaxed text-foreground/55">
                Reserve your first chamber. We ship calibrated, sealed and
                already listening.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <button className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-[12px] font-medium text-primary-foreground transition hover:bg-primary/90">
                Reserve a chamber
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </button>
              <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/40">
                ships q2 · 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative mx-auto max-w-[1440px] px-6 pb-10 md:px-10">
        <div className="hairline mb-6" />
        <div className="flex flex-col items-start justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-foreground/40 md:flex-row md:items-center">
          <span className="font-display normal-case tracking-[0.45em] text-foreground/70">
            VERDANT
          </span>
          <span>© 2026 · grown in the dark</span>
          <div className="flex items-center gap-5">
            <a href="#" className="transition hover:text-foreground/80">
              system
            </a>
            <a href="#" className="transition hover:text-foreground/80">
              journal
            </a>
            <a href="#" className="transition hover:text-foreground/80">
              contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
