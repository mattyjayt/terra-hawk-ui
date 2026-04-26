import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import SiteNav from "@/components/SiteNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, Bot, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

function apiBase(): string {
  const streamUrl = import.meta.env.VITE_LIVESTREAM_URL as string | undefined;
  if (streamUrl) {
    try {
      const hostname = new URL(streamUrl).hostname;
      // return `http://${hostname}:8000`;
      return 'http://localhost:8000'
    } catch { /* fall through */ }
  }
  return "http://localhost:8000";
}

interface CVConfig {
  model: string;
  imgsz: number;
  confidence: number;
  iou: number;
}

interface InferenceStats {
  fps: number;
  latency_ms: number;
  active_tracks: number;
}

interface ModelInfo {
  name: string;
  format: string;
  file: string;
  size_mb: number;
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

const Settings = () => {
  // Remote state
  const [liveConfig, setLiveConfig] = useState<CVConfig | null>(null);
  const [defaults, setDefaults] = useState<CVConfig | null>(null);
  const [stats, setStats] = useState<InferenceStats | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);

  // Form state (what the user is editing)
  const [form, setForm] = useState<CVConfig | null>(null);
  const [applying, setApplying] = useState(false);

  const initialised = useRef(false);
  const base = apiBase();

  // ---- Fetch settings + models on mount ----
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, modelsRes] = await Promise.all([
          fetch(`${base}/settings`),
          fetch(`${base}/settings/models`),
        ]);
        const settingsData = await settingsRes.json();
        const modelsData = await modelsRes.json();

        setLiveConfig(settingsData.config);
        setDefaults(settingsData.defaults);
        setStats(settingsData.stats);
        setModels(modelsData.models);

        if (!initialised.current) {
          setForm(settingsData.config);
          initialised.current = true;
        }
      } catch (e) {
        console.error("[Settings] fetch failed:", e);
      }
    };

    load();
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${base}/settings`);
        const data = await res.json();
        setStats(data.stats);
        setLiveConfig(data.config);
      } catch { /* silent */ }
    }, 2000);

    return () => clearInterval(id);
  }, [base]);

  // ---- Dirty detection ----
  const isDirty = useCallback(() => {
    if (!form || !liveConfig) return false;
    return (
      form.model !== liveConfig.model ||
      form.imgsz !== liveConfig.imgsz ||
      form.confidence !== liveConfig.confidence ||
      form.iou !== liveConfig.iou
    );
  }, [form, liveConfig]);

  // ---- Build partial patch ----
  const buildPatch = useCallback(() => {
    if (!form || !liveConfig) return {};
    const patch: Record<string, unknown> = {};
    if (form.model !== liveConfig.model) patch.model = form.model;
    if (form.imgsz !== liveConfig.imgsz) patch.imgsz = form.imgsz;
    if (form.confidence !== liveConfig.confidence) patch.confidence = form.confidence;
    if (form.iou !== liveConfig.iou) patch.iou = form.iou;
    return patch;
  }, [form, liveConfig]);

  // ---- Apply ----
  const handleApply = async () => {
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) return;

    setApplying(true);
    try {
      const res = await fetch(`${base}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setLiveConfig(data.config);
      setForm(data.config);
      toast.success("Settings applied");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setApplying(false);
    }
  };

  // ---- Reset ----
  const handleReset = () => {
    if (defaults) {
      setForm({ ...defaults });
      toast.info("Reset to defaults — click Apply to save");
    }
  };

  if (!form) {
    return (
      <main className="relative min-h-screen overflow-hidden text-foreground">
        <SiteNav />
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/60 hud-text">
            <Loader2 className="h-4 w-4 animate-spin" />
            connecting to backend…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground">
      <SiteNav />

      <section className="relative mx-auto max-w-[1440px] px-6 pt-6 md:px-10">
        {/* Header */}
        <div className="relative max-w-3xl animate-fade-up py-6 md:py-10">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
            <span className="h-px w-6 bg-foreground/60" />
            configuration
          </div>
          <h2 className="mt-4 font-display text-[36px] font-light leading-[1.1] tracking-tight text-foreground/95 hud-text-strong md:text-[48px]">
            System <span className="italic text-accent/95">settings</span>
          </h2>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cv" className="mt-4 animate-fade-up delay-100">
          <TabsList className="h-auto gap-1 bg-transparent p-0">
            <TabsTrigger
              value="cv"
              className="inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55 transition data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:bg-transparent hud-text"
            >
              <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              computer vision
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="inline-flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/55 transition data-[state=active]:border-accent data-[state=active]:text-foreground data-[state=active]:bg-transparent hud-text"
            >
              <Bot className="h-3.5 w-3.5" strokeWidth={1.5} />
              agentic ai
              <Badge variant="outline" className="ml-1 rounded-sm border-foreground/20 px-1.5 py-0 font-mono text-[8px] uppercase tracking-widest text-foreground/40">
                soon
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="hairline mt-4" />

          {/* ======================== CV TAB ======================== */}
          <TabsContent value="cv" className="mt-8 space-y-12 animate-fade-up">
            {/* ---- Stats ---- */}
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
                system status · live
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-10">
                <StatBlock label="MODEL" value={liveConfig?.model ?? "—"} />
                <StatBlock label="FPS" value={stats ? stats.fps.toFixed(1) : "—"} />
                <StatBlock label="LATENCY" value={stats ? `${stats.latency_ms.toFixed(0)}` : "—"} unit="ms" />
                <StatBlock label="TRACKS" value={stats ? String(stats.active_tracks) : "—"} />
              </div>
            </div>

            <div className="hairline" />

            {/* ---- Model Selection ---- */}
            <SettingRow label="Model" description="Select the detection model to run on the edge device">
              <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                <SelectTrigger className="w-[280px] rounded-sm border-foreground/15 bg-transparent font-mono text-[11px] uppercase tracking-wider text-foreground/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-foreground/15 bg-[hsl(160_14%_8%)]">
                  {models.map((m) => (
                    <SelectItem
                      key={m.name}
                      value={m.name}
                      className="font-mono text-[11px] uppercase tracking-wider"
                    >
                      <span className="flex items-center gap-3">
                        {m.name}
                        <Badge
                          variant="outline"
                          className="rounded-sm border-foreground/20 px-1.5 py-0 font-mono text-[8px] uppercase tracking-widest text-foreground/50"
                        >
                          {m.format}
                        </Badge>
                        <span className="text-foreground/40">{m.size_mb} MB</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            {/* ---- Confidence ---- */}
            <SettingRow label="Confidence Threshold" description="Minimum detection confidence to display results">
              <div className="flex items-center gap-6">
                <Slider
                  value={[form.confidence]}
                  onValueChange={([v]) => setForm({ ...form, confidence: v })}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-[240px]"
                />
                <span className="font-display text-[28px] font-light tabular-nums leading-none text-foreground/95 hud-text-strong">
                  {form.confidence.toFixed(2)}
                </span>
              </div>
            </SettingRow>

            {/* ---- IOU ---- */}
            <SettingRow label="IOU Threshold" description="Non-max suppression overlap threshold — lower merges more boxes">
              <div className="flex items-center gap-6">
                <Slider
                  value={[form.iou]}
                  onValueChange={([v]) => setForm({ ...form, iou: v })}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-[240px]"
                />
                <span className="font-display text-[28px] font-light tabular-nums leading-none text-foreground/95 hud-text-strong">
                  {form.iou.toFixed(2)}
                </span>
              </div>
            </SettingRow>

            {/* ---- Inference Resolution ---- */}
            <SettingRow label="Inference Resolution" description="Input image size for the model — higher is more accurate but slower">
              <Select
                value={String(form.imgsz)}
                onValueChange={(v) => setForm({ ...form, imgsz: Number(v) })}
              >
                <SelectTrigger className="w-[160px] rounded-sm border-foreground/15 bg-transparent font-mono text-[11px] uppercase tracking-wider text-foreground/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-foreground/15 bg-[hsl(160_14%_8%)]">
                  {[320, 480, 640, 1024].map((sz) => (
                    <SelectItem
                      key={sz}
                      value={String(sz)}
                      className="font-mono text-[11px] uppercase tracking-wider"
                    >
                      {sz}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <div className="hairline" />

            {/* ---- Actions ---- */}
            <div className="flex items-center gap-5">
              <Button
                onClick={handleApply}
                disabled={!isDirty() || applying}
                className="rounded-sm bg-accent px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-foreground transition hover:bg-accent/80 disabled:opacity-30"
              >
                {applying ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : null}
                apply
              </Button>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="rounded-sm px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60 transition hover:text-foreground"
              >
                reset defaults
              </Button>
            </div>
          </TabsContent>

          {/* ======================== AGENTIC AI TAB ======================== */}
          <TabsContent value="ai" className="mt-8 space-y-10 animate-fade-up">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/80 hud-text">
                <span className="h-px w-6 bg-foreground/60" />
                agentic ai · configuration
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-foreground/60 hud-text">
                Autonomous decision-making and alert management will be
                configurable here. These settings are under development.
              </p>
            </div>

            <div className="hairline" />

            <PlaceholderSetting label="Agent Provider" description="LLM backend for agentic reasoning">
              <Select disabled>
                <SelectTrigger className="w-[220px] rounded-sm border-foreground/10 bg-transparent font-mono text-[11px] uppercase tracking-wider text-foreground/30">
                  <SelectValue placeholder="Claude" />
                </SelectTrigger>
              </Select>
            </PlaceholderSetting>

            <PlaceholderSetting label="Agent Model" description="Specific model variant for the selected provider">
              <Select disabled>
                <SelectTrigger className="w-[220px] rounded-sm border-foreground/10 bg-transparent font-mono text-[11px] uppercase tracking-wider text-foreground/30">
                  <SelectValue placeholder="Sonnet 4" />
                </SelectTrigger>
              </Select>
            </PlaceholderSetting>

            <PlaceholderSetting label="Agent Mode" description="Autonomous acts on alerts — Advisory only recommends">
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/25">
                <span className="rounded-sm border border-foreground/10 px-3 py-1.5">autonomous</span>
                <span className="text-foreground/15">/</span>
                <span className="rounded-sm border border-foreground/10 px-3 py-1.5 bg-foreground/[0.03]">advisory</span>
              </div>
            </PlaceholderSetting>

            <PlaceholderSetting label="Alert Thresholds" description="Sensor limits that trigger agent actions">
              <div className="flex gap-6">
                {[
                  { label: "TEMP", unit: "°C", val: "35" },
                  { label: "HUM", unit: "%", val: "30" },
                  { label: "SOIL", unit: "%", val: "20" },
                ].map((t) => (
                  <div key={t.label} className="text-center opacity-25">
                    <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/60">
                      {t.label}
                    </div>
                    <div className="mt-1 font-display text-[22px] font-light tabular-nums text-foreground/50">
                      {t.val}
                    </div>
                    <div className="font-mono text-[8px] text-foreground/40">
                      {t.unit}
                    </div>
                  </div>
                ))}
              </div>
            </PlaceholderSetting>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="relative mx-auto mt-20 max-w-[1440px] px-6 pb-10 md:px-10">
        <div className="hairline mb-6" />
        <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 hud-text md:flex-row md:items-center">
          <span className="font-display normal-case tracking-[0.45em] text-foreground/90 hud-text-strong">
            TERRA HAWK
          </span>
          <span>© 2026 · grown in the dark</span>
        </div>
      </footer>
    </main>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatBlock = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div>
    <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/60 hud-text">
      {label}
    </div>
    <div className="mt-1.5 flex items-baseline gap-1.5">
      <span className="font-display text-[28px] font-light tabular-nums leading-none text-foreground/95 hud-text-strong">
        {value}
      </span>
      {unit && (
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50 hud-text">
          {unit}
        </span>
      )}
    </div>
  </div>
);

const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="max-w-xs">
      <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/90 hud-text-strong">
        {label}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-foreground/50 hud-text">
        {description}
      </p>
    </div>
    {children}
  </div>
);

const PlaceholderSetting = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="max-w-xs">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/40 hud-text">
          {label}
        </span>
        <Badge
          variant="outline"
          className="rounded-sm border-foreground/15 px-1.5 py-0 font-mono text-[7px] uppercase tracking-widest text-foreground/30"
        >
          coming soon
        </Badge>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-foreground/30 hud-text">
        {description}
      </p>
    </div>
    {children}
  </div>
);

export default Settings;
