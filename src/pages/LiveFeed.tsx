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
    className="glass animate-fade-up rounded-[1.25rem] px-6 py-5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-foreground/45">
      <span>{label}</span>
      <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
    </div>
    <div className="mt-3 flex items-baseline gap-1.5">
      <span className="font-display text-[32px] font-light tabular-nums text-foreground/95 transition-all duration-500">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
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

      <section className="relative mx-auto max-w-[1440px] px-6 pb-20 md:px-10">
        <div className="mb-6 flex items-end justify-between animate-fade-up">
          <div>
            <div className="glass-pill inline-block text-foreground/80">
              live · cv stream
            </div>
            <h2 className="mt-5 font-display text-[34px] font-light tracking-tight text-foreground/95 md:text-[44px]">
              Chamber 04 <span className="italic text-accent/90">in real time</span>
            </h2>
          </div>
          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/45 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
            streaming · 30fps
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* CV stream viewport — now glassy, image bleeds through page background */}
          <div className="glass relative h-[60vh] min-h-[480px] overflow-hidden rounded-[2rem]">
            <img
              src={heroTerrarium}
              alt="Live computer vision feed of the dome"
              className="absolute inset-0 h-full w-full object-cover opacity-70 animate-slow-zoom"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, hsl(160 25% 4% / 0.25) 0%, transparent 40%, hsl(160 25% 4% / 0.4) 100%)",
              }}
            />

            {/* scan line */}
            <div
              aria-hidden
              className="absolute inset-x-0 h-[2px] animate-scan"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.55), transparent)",
                boxShadow: "0 0 24px hsl(88 60% 55% / 0.35)",
              }}
            />

            {/* CV reticle */}
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 rounded-full border border-accent/40 animate-ping-slow" />
              <div className="absolute inset-3 rounded-full border border-accent/60" />
              <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent animate-pulse-glow" />
            </div>

            {/* corners */}
            {[
              "left-4 top-4 border-l border-t",
              "right-4 top-4 border-r border-t",
              "left-4 bottom-4 border-l border-b",
              "right-4 bottom-4 border-r border-b",
            ].map((c, i) => (
              <span
                key={i}
                aria-hidden
                className={`absolute h-5 w-5 border-foreground/40 ${c}`}
              />
            ))}

            <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">
              cam · 04 · cv2
            </div>
            <div className="absolute right-5 top-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              rec
            </div>
            <div className="absolute bottom-5 left-5 font-mono text-[10px] tracking-[0.2em] text-foreground/50">
              detected · seedling · stable
            </div>
            <div className="absolute bottom-5 right-5 font-mono text-[10px] tabular-nums tracking-[0.2em] text-foreground/50">
              {new Date().toISOString().slice(11, 19)}
            </div>
          </div>

          {/* Metrics */}
          <div className="flex flex-col gap-4">
            <Metric label="temperature" value={temp} unit="°C" delay={100} />
            <Metric label="humidity" value={humidity} unit="%" delay={200} />
            <Metric label="soil moisture" value={soil} unit="%" delay={300} />

            <div className="glass mt-2 rounded-[1.25rem] px-5 py-4 animate-fade-up delay-500">
              <p className="text-[11px] leading-relaxed text-foreground/55">
                Telemetry refreshes every 1.6s. All values inside nominal
                envelope.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LiveFeed;
