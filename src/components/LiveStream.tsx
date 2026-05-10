import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import simTerrariumAsset from "@/assets/sim-terrarium.mp4.asset.json";

/**
 * HLS live stream via MediaMTX.
 *
 * Env var (set in your .env):
 *   VITE_LIVESTREAM_URL=https://stream.terra-hawk.com/stream/
 *
 * MediaMTX serves an HLS playlist at <url>/index.m3u8
 * Falls back to a looping simulated terrarium feed if unreachable.
 */

type Status = "idle" | "connecting" | "live" | "simulated";

export interface StreamStats {
  fps: number;
  latency: number;
}

interface Props {
  className?: string;
  onStatusChange?: (s: Status) => void;
  onStats?: (stats: StreamStats) => void;
}

const STREAM_URL = import.meta.env.VITE_LIVESTREAM_URL as string | undefined;
const CONNECT_TIMEOUT_MS = 10000;

const LiveStream = ({ className, onStatusChange, onStats }: Props) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const simVideoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Report basic stats when live
  useEffect(() => {
    if (status !== "live" || !liveVideoRef.current) return;

    const interval = setInterval(() => {
      const video = liveVideoRef.current;
      if (!video) return;

      // Estimate latency from buffered range
      let latency = 0;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        latency = (bufferedEnd - video.currentTime) * 1000;
      }

      // HLS doesn't expose FPS directly; use webkitDecodedFrameCount if available
      const vAny = video as any;
      const fps = vAny.webkitDecodedFrameCount
        ? Math.round(vAny.webkitDecodedFrameCount / Math.max(video.currentTime, 1))
        : 0;

      onStats?.({ fps, latency });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, onStats]);

  useEffect(() => {
    let cancelled = false;
    const video = liveVideoRef.current;

    const fallback = (reason: string) => {
      if (cancelled) return;
      console.warn("[LiveStream] falling back to simulated:", reason);
      setStatus("simulated");
      simVideoRef.current?.play().catch(() => {});
    };

    const connect = () => {
      if (!STREAM_URL || !video) {
        fallback("VITE_LIVESTREAM_URL not set");
        return;
      }

      // Build the m3u8 URL — append index.m3u8 if not already present
      const hlsUrl = STREAM_URL.endsWith(".m3u8")
        ? STREAM_URL
        : `${STREAM_URL.replace(/\/$/, "")}/index.m3u8`;

      console.info("[LiveStream] connecting to HLS:", hlsUrl);
      setStatus("connecting");

      const timeout = setTimeout(() => {
        if (status !== "live") fallback("connect timeout");
      }, CONNECT_TIMEOUT_MS);

      // Safari has native HLS support
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", () => {
          clearTimeout(timeout);
          if (!cancelled) {
            video.play().catch(() => {});
            setStatus("live");
          }
        });
        video.addEventListener("error", () => {
          clearTimeout(timeout);
          fallback("native HLS error");
        });
        return;
      }

      // Other browsers use hls.js
      if (!Hls.isSupported()) {
        fallback("HLS not supported in this browser");
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
      });
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearTimeout(timeout);
        if (!cancelled) {
          video.play().catch(() => {});
          setStatus("live");
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn("[LiveStream] HLS error:", data.type, data.details);
        if (data.fatal) {
          clearTimeout(timeout);
          hls.destroy();
          hlsRef.current = null;
          fallback(`HLS fatal: ${data.details}`);
        }
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const showLive = status === "live" || status === "connecting";

  return (
    <div className={className}>
      <video
        ref={liveVideoRef}
        className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        autoPlay
        playsInline
        muted
        style={{
          filter: "saturate(118%) contrast(1.06) brightness(0.95)",
          opacity: showLive ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />
      {status !== "live" && (
        <video
          ref={simVideoRef}
          src={simTerrariumAsset.url}
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
          autoPlay
          loop
          muted
          playsInline
          style={{ filter: "saturate(118%) contrast(1.06) brightness(0.95)" }}
        />
      )}
    </div>
  );
};

export default LiveStream;
export type { Status as StreamStatus };
