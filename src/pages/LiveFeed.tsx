import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import LiveStream, { type StreamStatus } from "@/components/LiveStream";

type Metric = { label: string; value: string; unit: string };

const CornerBrackets = ({ mounted }: { mounted: boolean }) => {
  const base = `pointer-events-none absolute z-[5] h-8 w-8 border-foreground/75 transition-opacity duration-1000 ${
    mounted ? "opacity-90" : "opacity-0"
  }`;
  return (
    <>
      <div className={`${base} left-6 top-6 border-l border-t`} />
      <div className={`${base} right-6 top-6 border-r border-t`} />
      <div className={`${base} left-6 bottom-6 border-l border-b`} />
      <div className={`${base} right-6 bottom-6 border-r border-b`} />
    </>
  );
};

const LiveFeed = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "TEMP", value: "23.4", unit: "°C" },
    { label: "HUM", value: "68", unit: "%" },
    { label: "SOIL", value: "42", unit: "%" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // UTC clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = d.getUTCHours().toString().padStart(2, "0");
      const mm = d.getUTCMinutes().toString().padStart(2, "0");
      const ss = d.getUTCSeconds().toString().padStart(2, "0");
      setTime(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Live drift
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const base = parseFloat(m.value);
          const delta = (Math.random() - 0.5) * (m.unit === "°C" ? 0.2 : 0.8);
          const next = base + delta;
          return {
            ...m,
            value:
              m.unit === "°C" ? next.toFixed(1) : Math.round(next).toString(),
          };
        })
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      {/* Full-bleed feed — overrides the global ambient bg on this page */}
      <div aria-hidden className="fixed inset-0 -z-[5] overflow-hidden">
        <img
          src={heroTerrarium}
          alt=""
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
          style={{ filter: "saturate(118%) contrast(1.06) brightness(0.95)" }}
        />
        {/* Vignette only — keep the feed immersive */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 50%, transparent 50%, hsl(160 25% 3% / 0.6) 100%)",
          }}
        />
        {/* Faint scanline texture */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, hsl(0 0% 0%) 2px, hsl(0 0% 0%) 3px)",
          }}
        />
        {/* drifting scan line */}
        <div
          className="absolute inset-x-0 h-[2px] animate-scan"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.5), transparent)",
            boxShadow: "0 0 28px hsl(88 60% 55% / 0.35)",
          }}
        />
      </div>

      <SiteNav />
      <CornerBrackets mounted={mounted} />

      {/* Top HUD bar — back + REC + clock */}
      <div className="pointer-events-none absolute inset-x-0 top-24 z-10 mx-auto flex max-w-[1440px] items-center justify-between px-10">
        <Link
          to="/"
          className="pointer-events-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/90 hud-text transition hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          back
        </Link>

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/90 hud-text">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          rec · cam 01
        </div>

        <div className="font-mono text-[10px] uppercase tabular-nums tracking-[0.3em] text-foreground/90 hud-text">
          {time || "--:--:-- UTC"}
        </div>
      </div>

      {/* Center crosshair */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[1400ms] ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 rounded-full border border-accent/45 animate-ping-slow" />
          <div className="absolute inset-6 rounded-full border border-accent/70" />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent animate-pulse-glow" />
          <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-foreground/70" />
          <span className="absolute left-1/2 bottom-0 h-3 w-px -translate-x-1/2 bg-foreground/70" />
          <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-foreground/70" />
          <span className="absolute top-1/2 right-0 h-px w-3 -translate-y-1/2 bg-foreground/70" />
        </div>
      </div>

      {/* Identity label — bottom left */}
      <div className="pointer-events-none absolute bottom-10 left-10 z-10 animate-fade-up">
        <div className="font-display text-[42px] font-light leading-none tracking-tight text-foreground/95 hud-text-strong md:text-[56px]">
          TERRA HAWK
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
          chamber 04 · sector a
        </div>
      </div>

      {/* Telemetry overlay — containerless, bottom right, AR-inspired */}
      <div className="pointer-events-none absolute bottom-10 right-10 z-10 flex items-end gap-10 animate-fade-up delay-200">
        {metrics.map((m) => (
          <div key={m.label} className="text-right">
            <div className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
              <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
              {m.label}
            </div>
            <div className="mt-1.5 flex items-baseline justify-end gap-1.5">
              <span className="font-display text-[34px] font-light tabular-nums leading-none text-foreground/95 hud-text-strong transition-all duration-500 md:text-[44px]">
                {m.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hud-text">
                {m.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default LiveFeed;
