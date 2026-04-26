import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";

const useDrift = (base: number, range: number, decimals = 1) => {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setV(() => +(base + (Math.random() - 0.5) * range).toFixed(decimals));
    }, 1600);
    return () => clearInterval(id);
  }, [base, range, decimals]);
  return v;
};

const Telemetry = ({
  label,
  value,
  unit,
  delay = 0,
  align = "left",
}: {
  label: string;
  value: number | string;
  unit: string;
  delay?: number;
  align?: "left" | "right";
}) => (
  <div
    className={`animate-fade-up ${align === "right" ? "text-right" : ""}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/75 hud-text ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
      {label}
    </div>
    <div
      className={`mt-2 flex items-baseline gap-1.5 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <span className="font-display text-[40px] font-light tabular-nums leading-none text-foreground/95 hud-text-strong transition-all duration-500">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70 hud-text">
        {unit}
      </span>
    </div>
  </div>
);

const LiveFeed = () => {
  const temp = useDrift(23.4, 0.6);
  const humidity = useDrift(68, 4, 0);
  const soil = useDrift(42, 3, 0);

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <SiteNav />

      {/* Full-bleed HUD: the global background IS the camera feed */}
      <section className="relative mx-auto max-w-[1440px] px-6 pb-20 md:px-10">
        {/* TOP HUD bar */}
        <div className="flex items-end justify-between animate-fade-up">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
              <span className="h-px w-6 bg-foreground/60" />
              live · cv stream
            </div>
            <h2 className="mt-4 font-display text-[34px] font-light tracking-tight text-foreground/95 hud-text-strong md:text-[44px]">
              Chamber 04{" "}
              <span className="italic text-accent/95">in real time</span>
            </h2>
          </div>
          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/80 hud-text md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
            rec · 30fps
          </div>
        </div>

        {/* Visor — corner reticles + scan line, no panel */}
        <div className="hud-frame relative mt-10 h-[58vh] min-h-[440px] animate-fade-in">
          <span className="hud-c1" />
          <span className="hud-c2" />

          {/* horizontal scan line drifting across the visor */}
          <div
            aria-hidden
            className="absolute inset-x-0 h-[2px] animate-scan"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.55), transparent)",
              boxShadow: "0 0 24px hsl(88 60% 55% / 0.35)",
            }}
          />

          {/* center reticle */}
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-0 rounded-full border border-accent/50 animate-ping-slow" />
            <div className="absolute inset-3 rounded-full border border-accent/70" />
            <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent animate-pulse-glow" />
            {/* crosshair ticks */}
            <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-foreground/60" />
            <span className="absolute left-1/2 bottom-0 h-2 w-px -translate-x-1/2 bg-foreground/60" />
            <span className="absolute top-1/2 left-0 w-2 h-px -translate-y-1/2 bg-foreground/60" />
            <span className="absolute top-1/2 right-0 w-2 h-px -translate-y-1/2 bg-foreground/60" />
          </div>

          {/* visor labels */}
          <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/85 hud-text">
            cam · 04 · cv2
          </div>
          <div className="absolute right-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/85 hud-text">
            lat 24.8m · lon 0.0
          </div>
          <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/85 hud-text animate-blink">
            tracking · seedling
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[10px] tabular-nums tracking-[0.25em] text-foreground/85 hud-text">
            {new Date().toISOString().slice(11, 19)}
          </div>

          {/* bottom-edge telemetry — floats over the feed */}
          <div className="absolute -bottom-24 left-0 right-0 grid grid-cols-3 gap-6 md:-bottom-28">
            <Telemetry label="temperature" value={temp} unit="°C" delay={100} />
            <div className="text-center">
              <Telemetry label="humidity" value={humidity} unit="%" delay={200} />
            </div>
            <Telemetry
              label="soil moisture"
              value={soil}
              unit="%"
              delay={300}
              align="right"
            />
          </div>
        </div>

        {/* footer line */}
        <div className="mt-40 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hud-text">
          <span>telemetry · 1.6s refresh</span>
          <span>nominal envelope</span>
        </div>
      </section>
    </main>
  );
};

export default LiveFeed;
