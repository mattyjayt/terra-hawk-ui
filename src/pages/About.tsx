import { Cpu, Droplets, Sun, Leaf, ArrowUpRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";

const pillars = [
  {
    icon: Cpu,
    tag: "01",
    t: "Sense",
    d: "Sub-millisecond telemetry across temperature, humidity, soil moisture and spectrum. Every chamber listens before it acts — no assumption, no override.",
  },
  {
    icon: Droplets,
    tag: "02",
    t: "Hydrate",
    d: "Capillary micro-doses of water delivered exactly when roots ask for them. Verdant never floods, never starves — it answers.",
  },
  {
    icon: Sun,
    tag: "03",
    t: "Illuminate",
    d: "Tunable full-spectrum light that follows the season the plant remembers. Dawn, noon and dusk, recreated to the lumen.",
  },
  {
    icon: Leaf,
    tag: "04",
    t: "Grow",
    d: "Outcomes you can measure — and a story you can replay. Each cycle becomes data, each chamber becomes a quiet collaborator.",
  },
];

const About = () => {
  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <SiteNav />

      {/* Intro */}
      <section className="relative mx-auto max-w-[1440px] px-6 pt-6 md:px-10">
        <div className="glass glass-hover relative overflow-hidden rounded-[2rem] px-8 py-14 md:px-16 md:py-20 animate-fade-up">
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 animate-drift"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 80% 50%, hsl(88 50% 40% / 0.15), transparent 60%)",
            }}
          />
          <div className="relative max-w-3xl">
            <div className="glass-pill inline-block text-foreground/80">
              about · system
            </div>
            <h2 className="mt-6 font-display text-[36px] font-light leading-[1.1] tracking-tight text-foreground/95 md:text-[56px]">
              Four quiet senses,{" "}
              <span className="italic text-accent/90">one</span> living decision.
            </h2>
            <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-foreground/65">
              Terra Hawk is a closed-loop precision-farming platform. Each
              sealed dome is a small, transparent world — and our job is to
              keep it honest. We sense, we hydrate, we illuminate, and the
              plant grows.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative mx-auto mt-16 max-w-[1440px] px-6 md:px-10">
        <div className="space-y-4">
          {pillars.map(({ icon: Icon, tag, t, d }, i) => (
            <article
              key={tag}
              className="glass glass-hover group relative overflow-hidden rounded-[1.5rem] p-6 md:p-10 animate-fade-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[80px_1fr_2fr] md:items-start md:gap-10">
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-6">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40">
                    {tag}
                  </span>
                  <Icon
                    className="h-5 w-5 text-foreground/70 transition group-hover:text-accent"
                    strokeWidth={1.25}
                  />
                </div>
                <h3 className="font-display text-[28px] font-light leading-none text-foreground/95 md:text-[40px]">
                  {t}
                </h3>
                <p className="text-[12px] leading-[1.8] text-foreground/60 md:text-[13px]">
                  {d}
                </p>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 30% 100%, hsl(88 60% 55% / 0.12), transparent 60%)",
                }}
              />
            </article>
          ))}
        </div>
      </section>

      {/* Support / Contact */}
      <section className="relative mx-auto mt-20 max-w-[1440px] px-6 pb-20 md:px-10">
        <div className="glass glass-hover relative overflow-hidden rounded-[2rem] px-8 py-12 md:px-16 md:py-16 animate-fade-up">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-md">
              <div className="glass-pill inline-block text-foreground/80">
                support
              </div>
              <h3 className="mt-5 font-display text-[28px] font-light tracking-tight text-foreground/95 md:text-[36px]">
                Talk to a grower.
              </h3>
              <p className="mt-3 text-[12px] leading-relaxed text-foreground/60">
                Every chamber ships with a human on the other end. Reach us
                anytime — we answer in the language of the plant.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <a
                href="mailto:hello@terrahawk.farm"
                className="group inline-flex items-center gap-2 rounded-full glass-strong glass-hover px-6 py-3 text-[12px] font-medium text-foreground/95"
              >
                hello@terrahawk.farm
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </a>
              <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/40">
                support · 24/7
              </span>
            </div>
          </div>
        </div>

        <div className="hairline mt-12 mb-6" />
        <div className="flex flex-col items-start justify-between gap-4 text-[10px] uppercase tracking-[0.3em] text-foreground/40 md:flex-row md:items-center">
          <span className="font-display normal-case tracking-[0.45em] text-foreground/70">
            TERRA HAWK
          </span>
          <span>© 2026 · grown in the dark</span>
          <span>thk · 2026</span>
        </div>
      </section>
    </main>
  );
};

export default About;
