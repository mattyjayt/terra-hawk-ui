import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Camera, ChevronDown } from "lucide-react";
import LiveStream, { type StreamStatus, type StreamStats } from "@/components/LiveStream";
import { useSensorData } from "@/hooks/useSensorData";
import { useSystems, type SystemInfo } from "@/hooks/useSystems";

type Metric = { label: string; value: string; unit: string };

const LIVE_METRIC_CONFIG: Record<string, { label: string; unit: string }> = {
  temperature: { label: "TEMP", unit: "°C" },
  humidity: { label: "HUM", unit: "%" },
  soil: { label: "SOIL", unit: "%" },
  pressure: { label: "PRES", unit: "hPa" },
  light: { label: "LUM", unit: "lx" },
  co2: { label: "CO2", unit: "ppm" },
};

type OverlayConfig = {
  boxes: boolean;
  labels: boolean;
  confidence: boolean;
};

const getInitialOverlayConfig = (): OverlayConfig => {
  const stored = localStorage.getItem("terrahawk_cv_overlay_config");
  if (stored) {
    try {
      return { boxes: true, labels: true, confidence: true, ...JSON.parse(stored) };
    } catch {
      // ignore parse errors
    }
  }
  return { boxes: true, labels: true, confidence: true };
};

/**
 * Resolve the WHEP URL for a system's camera.
 * Uses the whep_url from systems.json if available,
 * otherwise derives from VITE_WHEP_URL base by swapping the stream path.
 */
function resolveWhepUrl(system: SystemInfo | null): string | undefined {
  if (!system?.components?.camera) return undefined;
  const cam = system.components.camera;

  // If backend provides a whep_url, convert it to the external tunnel URL
  if (cam.whep_url) {
    // whep_url from backend is local (e.g. http://192.168.178.147:8889/stream/whep)
    // We need the external tunnel URL. Derive from VITE_WHEP_URL base.
    const baseWhep = import.meta.env.VITE_WHEP_URL as string | undefined;
    if (baseWhep) {
      try {
        const base = new URL(baseWhep);
        const local = new URL(cam.whep_url);
        // Replace the path with the one from the local URL
        base.pathname = local.pathname;
        return base.toString();
      } catch {
        // Fall through to direct use
      }
    }
    return cam.whep_url;
  }

  return undefined;
}

/** System / camera selector dropdown */
const SystemSwitcher = ({
  systems,
  activeId,
  onSelect,
}: {
  systems: SystemInfo[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  // Only show systems that have cameras
  const cameraSystems = systems.filter((s) => s.components?.camera);
  if (cameraSystems.length <= 1) return null;

  const active = cameraSystems.find((s) => s.id === activeId) ?? cameraSystems[0];

  return (
    <div className="pointer-events-auto relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded border border-foreground/20 bg-background/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/90 backdrop-blur-sm transition hover:border-accent hover:text-accent"
      >
        <Camera className="h-3 w-3" />
        {active?.name ?? "Select Camera"}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 flex flex-col overflow-hidden rounded border border-foreground/20 bg-background/90 backdrop-blur-md animate-fade-in">
          {cameraSystems.map((s) => {
            const isActive = s.id === active?.id;
            const isOnline = s.status === "online" || s.controller?.ip === "localhost";
            return (
              <button
                key={s.id}
                onClick={() => {
                  onSelect(s.id);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isOnline ? "bg-accent animate-pulse-glow" : "bg-foreground/30"
                  }`}
                />
                <span className="min-w-[100px]">{s.name}</span>
                <span className="text-[8px] text-foreground/40">
                  {s.components?.camera?.type ?? "camera"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CornerBrackets = ({ mounted }: { mounted: boolean }) => {
  const base = `pointer-events-none absolute z-[5] h-8 w-8 border-foreground/75 transition-opacity duration-1000 ${mounted ? "opacity-90" : "opacity-0"
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
  const [streamStats, setStreamStats] = useState<StreamStats | null>(null);
  const { systems } = useSystems();
  const [activeSystemId, setActiveSystemId] = useState<string | undefined>(undefined);
  const activeSystem = systems.find((s) => s.id === activeSystemId) ?? systems[0] ?? null;
  const activeWhepUrl = resolveWhepUrl(activeSystem);
  const { data: sensorData, cvData } = useSensorData(activeSystem?.id);
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>(getInitialOverlayConfig());
  const [isOverlayPanelOpen, setIsOverlayPanelOpen] = useState(false);
  const [trackedObjectId, setTrackedObjectId] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTrackedObjectId(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    localStorage.setItem("terrahawk_cv_overlay_config", JSON.stringify(overlayConfig));
  }, [overlayConfig]);

  useEffect(() => {
    const cameraSystems = systems.filter((s) => s.components?.camera);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'b':
          setOverlayConfig(prev => ({ ...prev, boxes: !prev.boxes }));
          break;
        case 'l':
          setOverlayConfig(prev => ({ ...prev, labels: !prev.labels }));
          break;
        case 'c':
          setOverlayConfig(prev => ({ ...prev, confidence: !prev.confidence }));
          break;
        case 'h':
          setOverlayConfig({ boxes: false, labels: false, confidence: false });
          break;
      }

      // Number keys 1-9 to switch cameras
      const num = parseInt(e.key);
      if (num >= 1 && num <= cameraSystems.length) {
        setActiveSystemId(cameraSystems[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [systems]);

  const dynamicMetrics = Object.entries(sensorData)
    .filter(([key]) => key !== "status")
    .map(([key, value]) => {
      const config = LIVE_METRIC_CONFIG[key] || {
        label: key.toUpperCase().slice(0, 4),
        unit: "",
      };
      return {
        label: config.label,
        value: value === null || value === undefined
          ? "N/A"
          : typeof value === "number"
            ? value.toFixed(key === "temperature" ? 1 : 0)
            : String(value),
        unit: value === null || value === undefined ? "" : config.unit,
      };
    });

  useEffect(() => {
    setMounted(true);
  }, []);

  // UTC clock
  useEffect(() => {

    const tick = () => {
      const d = new Date();

      const tz = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
        .formatToParts(d)
        .find(p => p.type === "timeZoneName")?.value ?? "";

      const hh = d.getHours().toString().padStart(2, "0");
      const mm = d.getMinutes().toString().padStart(2, "0");
      const ss = d.getSeconds().toString().padStart(2, "0");
      setTime(`${hh}:${mm}:${ss} ${tz}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const trackedObj = trackedObjectId ? cvData?.objects.find(o => o.id === trackedObjectId) : null;
  const crosshairX = trackedObj ? (trackedObj.bbox.x + trackedObj.bbox.width / 2) * 100 : 50;
  const crosshairY = trackedObj ? (trackedObj.bbox.y + trackedObj.bbox.height / 2) * 100 : 50;

  return (
    <main 
      className="relative min-h-screen overflow-hidden text-foreground"
      onClick={() => setTrackedObjectId(null)}
    >
      {/* Full-bleed feed — overrides the global ambient bg on this page */}
      <div aria-hidden className="fixed inset-0 -z-[5] overflow-hidden">
        <LiveStream
          className="absolute inset-0 h-full w-full"
          whepUrl={activeWhepUrl}
          onStatusChange={setStreamStatus}
          onStats={setStreamStats}
        />
        {/* Vignette only — keep the feed immersive */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 50%, transparent 50%, hsl(160 25% 3% / 0.85) 100%)",
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

      {/* Computer Vision Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {cvData?.objects.map((obj, i) => {
          // Bbox values are already normalized (0-1) from the backend
          const left = obj.bbox.x * 100;
          const top = obj.bbox.y * 100;
          const width = obj.bbox.width * 100;
          const height = obj.bbox.height * 100;
          
          return (
            <div
              key={obj.id ?? `obj-${i}`}
              onClick={(e) => {
                e.stopPropagation();
                if (obj.id) setTrackedObjectId(obj.id);
              }}
              className={`absolute z-20 cursor-pointer pointer-events-auto transition-all duration-200 ${
                trackedObjectId === obj.id
                  ? "border-2 border-accent bg-accent/20 scale-105"
                  : overlayConfig.boxes
                  ? "border border-accent/70 bg-accent/10 hover:border-accent hover:bg-accent/20"
                  : "hover:border border-accent/50 bg-accent/5"
              }`}
              style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
            >
              {/* Label at the center of the bounding box */}
              {(overlayConfig.labels || overlayConfig.confidence) && (
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-accent hud-text">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
                  {overlayConfig.labels && obj.label}
                  {overlayConfig.confidence && ` [${Math.round(obj.confidence * 100)}%]`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CornerBrackets mounted={mounted} />

      {/* Overlay Configuration Panel */}
      <div className="pointer-events-auto absolute right-10 top-24 z-30 flex flex-col items-end gap-3 animate-fade-up">
        <button
          onClick={() => setIsOverlayPanelOpen(p => !p)}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors hud-text ${
            isOverlayPanelOpen
              ? "border-accent bg-accent/10 text-accent"
              : "border-foreground/30 text-foreground/70 hover:border-foreground/60 hover:text-foreground/90"
          }`}
          aria-label="Toggle Overlay Controls"
        >
          {isOverlayPanelOpen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>

        {isOverlayPanelOpen && (
          <div className="hud-frame relative flex flex-col gap-2 p-4 animate-fade-in glass">
            <span className="hud-c1" />
            <span className="hud-c2" />
            
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60 hud-text">
              cv overlays
            </div>
            
            <label className="group flex cursor-pointer items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/80 transition hover:text-accent">
              <input
                type="checkbox"
                checked={overlayConfig.boxes}
                onChange={() => setOverlayConfig(p => ({ ...p, boxes: !p.boxes }))}
                className="hidden"
              />
              <span className={`flex h-3 w-3 items-center justify-center border transition-colors ${overlayConfig.boxes ? 'border-accent bg-accent/20' : 'border-foreground/40 group-hover:border-foreground/70'}`}>
                {overlayConfig.boxes && <span className="h-1.5 w-1.5 bg-accent" />}
              </span>
              <span className="w-16">boxes</span>
              <span className="text-[9px] text-foreground/40">[b]</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/80 transition hover:text-accent">
              <input
                type="checkbox"
                checked={overlayConfig.labels}
                onChange={() => setOverlayConfig(p => ({ ...p, labels: !p.labels }))}
                className="hidden"
              />
              <span className={`flex h-3 w-3 items-center justify-center border transition-colors ${overlayConfig.labels ? 'border-accent bg-accent/20' : 'border-foreground/40 group-hover:border-foreground/70'}`}>
                {overlayConfig.labels && <span className="h-1.5 w-1.5 bg-accent" />}
              </span>
              <span className="w-16">labels</span>
              <span className="text-[9px] text-foreground/40">[l]</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/80 transition hover:text-accent">
              <input
                type="checkbox"
                checked={overlayConfig.confidence}
                onChange={() => setOverlayConfig(p => ({ ...p, confidence: !p.confidence }))}
                className="hidden"
              />
              <span className={`flex h-3 w-3 items-center justify-center border transition-colors ${overlayConfig.confidence ? 'border-accent bg-accent/20' : 'border-foreground/40 group-hover:border-foreground/70'}`}>
                {overlayConfig.confidence && <span className="h-1.5 w-1.5 bg-accent" />}
              </span>
              <span className="w-16">conf</span>
              <span className="text-[9px] text-foreground/40">[c]</span>
            </label>
            
            <button
              onClick={() => setOverlayConfig({ boxes: false, labels: false, confidence: false })}
              className="mt-2 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50 transition hover:text-destructive"
            >
              hide all [h]
            </button>
          </div>
        )}
      </div>

      {/* Top HUD bar — back + REC + clock */}
      <div className="pointer-events-none absolute inset-x-0 top-10 z-10 mx-auto flex max-w-[1440px] items-center justify-between px-10">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="pointer-events-auto inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground hud-text transition hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            back
          </Link>

          <SystemSwitcher
            systems={systems}
            activeId={activeSystem?.id}
            onSelect={setActiveSystemId}
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground hud-text">
          {streamStatus === "live" ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              live · {activeSystem?.name ?? "cam 01"}
              {streamStats && (
                <span className="ml-2 text-foreground/70">
                  [{Math.round(streamStats.fps)}FPS · {Math.round(streamStats.latency)}MS]
                </span>
              )}
            </>
          ) : streamStatus === "connecting" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-foreground/80 animate-pulse" />
              connecting · {activeSystem?.name ?? "cam 01"}
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
              simulated · {activeSystem?.name ?? "cam 01"}
            </>
          )}
        </div>

        <div className="font-mono text-[10px] uppercase tabular-nums tracking-[0.3em] text-foreground hud-text">
          {time || "--:--:-- UTC"}
        </div>
      </div>

      {/* Center crosshair / Tracking crosshair */}
      <div
        aria-hidden
        className={`pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out ${
          mounted && trackedObjectId ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        style={{ left: `${crosshairX}%`, top: `${crosshairY}%` }}
      >
        <div className="relative h-28 w-28 drop-shadow-md">
          {/* Rotating dashed target ring */}
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border-[1.5px] border-dashed border-primary/60" />
          
          {/* Inner ring */}
          <div className="absolute inset-5 rounded-full border-[1.5px] border-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.25)]" />
          
          {/* Core dot with strong glow */}
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] animate-pulse" />
          
          {/* Crosshair outer ticks */}
          <span className="absolute left-1/2 top-[-4px] h-4 w-[1.5px] -translate-x-1/2 bg-primary/90 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          <span className="absolute left-1/2 bottom-[-4px] h-4 w-[1.5px] -translate-x-1/2 bg-primary/90 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          <span className="absolute top-1/2 left-[-4px] h-[1.5px] w-4 -translate-y-1/2 bg-primary/90 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          <span className="absolute top-1/2 right-[-4px] h-[1.5px] w-4 -translate-y-1/2 bg-primary/90 shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
        </div>
      </div>

      {/* Identity label — bottom left */}
      <div className="pointer-events-none absolute bottom-10 left-10 z-10 animate-fade-up">
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/95 hud-text">
          {activeSystem ? `${activeSystem.name} · ${activeSystem.location}` : "chamber 01 · sector a"}
        </div>
      </div>

      {/* Telemetry overlay — containerless, bottom right, AR-inspired */}
      <div className="pointer-events-none absolute bottom-10 right-10 z-10 flex items-end gap-10 animate-fade-up delay-200">
        {dynamicMetrics.map((m) => (
          <div key={m.label} className="text-right">
            <div className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/90 hud-text">
              <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
              {m.label}
            </div>
            <div className="mt-1.5 flex items-baseline justify-end gap-1.5">
              <span className="font-display text-[34px] font-light tabular-nums leading-none text-foreground hud-text-strong transition-all duration-500 md:text-[44px]">
                {m.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/80 hud-text">
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
