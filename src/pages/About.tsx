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
    d: "Capillary micro-doses of water delivered exactly when roots ask for them. Terra Hawk never floods, never starves — it answers.",
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

      {/* Intro — containerless HUD */}
      <section className="relative mx-auto max-w-[1440px] px-6 pt-6 md:px-10">
        <div className="relative max-w-3xl animate-fade-up py-10 md:py-16">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
            <span className="h-px w-6 bg-foreground/60" />
            about · system
          </div>
          <h2 className="mt-6 font-display text-[36px] font-light leading-[1.1] tracking-tight text-foreground/95 hud-text-strong md:text-[56px]">
            Four quiet senses,{" "}
            <span className="italic text-accent/95">one</span> living decision.
          </h2>
          <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-foreground/80 hud-text">
            Terra Hawk is a closed-loop precision-farming platform. Each
            sealed dome is a small, transparent world — and our job is to keep
            it honest. We sense, we hydrate, we illuminate, and the plant
            grows.
          </p>
        </div>
      </section>

      {/* Pillars — hairline HUD rows */}
      <section className="relative mx-auto mt-6 max-w-[1440px] px-6 md:px-10">
        <div className="border-t border-foreground/15">
          {pillars.map(({ icon: Icon, tag, t, d }, i) => (
            <article
              key={tag}
              className="group relative grid grid-cols-1 gap-5 border-b border-foreground/15 py-8 animate-fade-up md:grid-cols-[80px_1fr_2fr_40px] md:items-center md:gap-10 md:py-10"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/65 hud-text">
                  {tag}
                </span>
                <Icon
                  className="h-5 w-5 text-foreground/80 transition group-hover:text-accent"
                  strokeWidth={1.25}
                />
              </div>
              <h3 className="font-display text-[28px] font-light leading-none text-foreground/95 hud-text-strong md:text-[40px]">
                {t}
              </h3>
              <p className="font-mono text-[11px] leading-[1.9] text-foreground/80 hud-text md:text-[12px]">
                {d}
              </p>
              <ArrowUpRight
                className="hidden h-4 w-4 text-foreground/50 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent md:block"
                strokeWidth={1.25}
              />
            </article>
          ))}
        </div>
      </section>

      {/* Support / Contact — HUD callout */}
      <section className="relative mx-auto mt-20 max-w-[1440px] px-6 pb-20 md:px-10">
        <div className="hud-frame relative px-6 py-12 md:px-10 md:py-16 animate-fade-up">
          <span className="hud-c1" />
          <span className="hud-c2" />
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
                <span className="h-px w-6 bg-foreground/60" />
                support
              </div>
              <h3 className="mt-5 font-display text-[28px] font-light tracking-tight text-foreground/95 hud-text-strong md:text-[36px]">
                Talk to a grower.
              </h3>
              <p className="mt-3 text-[12px] leading-relaxed text-foreground/80 hud-text">
                Every chamber ships with a human on the other end. Reach us
                anytime — we answer in the language of the plant.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <a
                href="mailto:hello@terrahawk.farm"
                className="group inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.25em] text-foreground/95 hud-text-strong transition hover:text-accent"
              >
                <span className="h-px w-8 bg-foreground/60 transition-all group-hover:w-12 group-hover:bg-accent" />
                hello@terrahawk.farm
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
              <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/65 hud-text">
                support · 24/7
              </span>
            </div>
          </div>
        </div>

        <div className="hairline mt-12 mb-6" />
        <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hud-text md:flex-row md:items-center">
          <span className="font-display normal-case tracking-[0.45em] text-foreground/90 hud-text-strong">
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
