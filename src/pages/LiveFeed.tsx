import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import heroTerrarium from "@/assets/hero-terrarium.jpg";

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

const Metric = ({
  label,
  value,
  unit,
  delay = 0,
}: {
  label: string;
  value: number | string;
  unit: string;
  delay?: number;
}) => (
  <div
    className="animate-fade-up px-6 py-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-end gap-3 text-[10px] uppercase tracking-[0.3em] text-white/80 hud-text font-bold">
      <span>{label}</span>
      <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
    </div>
    <div className="mt-2 flex items-baseline justify-end gap-1.5 hud-text">
      <span className="font-display text-[40px] font-bold tabular-nums text-white transition-all duration-500">
        {value}
      </span>
      <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/80 font-bold">
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
      {/* Immersive Full-Bleed Background */}
      <img
        src={heroTerrarium}
        alt="Live computer vision feed of the dome"
        className="fixed inset-0 -z-50 h-full w-full object-cover animate-slow-zoom"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-40"
        style={{
          background:
            "linear-gradient(180deg, hsl(160 25% 4% / 0.35) 0%, transparent 40%, hsl(160 25% 4% / 0.5) 100%)",
        }}
      />

      {/* Scan line */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-30 h-[2px] animate-scan"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.55), transparent)",
          boxShadow: "0 0 24px hsl(88 60% 55% / 0.35)",
        }}
      />

      {/* CV reticle */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 -z-30 h-32 w-32 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping-slow" />
        <div className="absolute inset-3 rounded-full border border-accent/60" />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent animate-pulse-glow" />
      </div>

      {/* Corners & Overlays */}
      <div className="pointer-events-none fixed inset-0 -z-30 p-6 md:p-10">
        {[
          "left-6 top-6 md:left-10 md:top-10 border-l-2 border-t-2",
          "right-6 top-6 md:right-10 md:top-10 border-r-2 border-t-2",
          "left-6 bottom-6 md:left-10 md:bottom-10 border-l-2 border-b-2",
          "right-6 bottom-6 md:right-10 md:bottom-10 border-r-2 border-b-2",
        ].map((c, i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute h-8 w-8 border-white/40 ${c}`}
          />
        ))}
        <div className="absolute left-10 top-10 md:left-14 md:top-14 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 hud-text font-bold">
          cam · 04 · cv2
        </div>
        <div className="absolute right-10 top-10 md:right-14 md:top-14 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 hud-text font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          rec
        </div>
        <div className="absolute bottom-10 left-10 md:bottom-14 md:left-14 font-mono text-[10px] tracking-[0.2em] text-white/80 hud-text font-bold">
          detected · seedling · stable
        </div>
        <div className="absolute bottom-10 right-10 md:bottom-14 md:right-14 font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/80 hud-text font-bold">
          {new Date().toISOString().slice(11, 19)}
        </div>
      </div>

      <SiteNav />

      <section className="relative z-10 mx-auto flex max-w-[1440px] px-6 pt-10 md:px-10 justify-between items-start pointer-events-none">
        {/* Title side */}
        <div className="mb-6 flex flex-col items-start justify-between animate-fade-up">
          <div>
            <div className="hud-text inline-block text-[10px] uppercase tracking-[0.2em] text-white/90 font-bold">
              live · cv stream
            </div>
            <h2 className="mt-5 font-display text-[34px] font-bold tracking-tight text-white hud-text md:text-[44px]">
              Chamber 04 <br/><span className="italic text-accent">in real time</span>
            </h2>
          </div>
          <div className="mt-8 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 hud-text font-bold md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
            streaming · 30fps
          </div>
        </div>

        {/* Metrics side */}
        <div className="flex w-[320px] flex-col gap-2 items-end text-right pointer-events-auto mt-20 hidden md:flex">
          <Metric label="temperature" value={temp} unit="°C" delay={100} />
          <Metric label="humidity" value={humidity} unit="%" delay={200} />
          <Metric label="soil moisture" value={soil} unit="%" delay={300} />

          <div className="mt-6 px-6 py-4 animate-fade-up delay-500 max-w-[250px]">
            <p className="text-[11px] leading-relaxed text-white/70 hud-text font-bold text-right">
              Telemetry refreshes every 1.6s. All values inside nominal envelope.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LiveFeed;
