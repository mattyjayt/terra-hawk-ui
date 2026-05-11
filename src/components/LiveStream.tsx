import { useEffect, useRef, useState } from "react";
import simTerrariumAsset from "@/assets/sim-terrarium.mp4.asset.json";

/**
 * WebRTC live stream via MediaMTX WHEP.
 *
 * Env var (set in your .env):
 *   VITE_WHEP_URL=https://rtc.terra-hawk.com/stream/whep
 *
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

const WHEP_URL = import.meta.env.VITE_WHEP_URL as string | undefined;
const CONNECT_TIMEOUT_MS = 10000;

const LiveStream = ({ className, onStatusChange, onStats }: Props) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const simVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Report basic stats when live
  useEffect(() => {
    if (status !== "live" || !pcRef.current) return;

    const pc = pcRef.current;
    let prevFrames = 0;
    let prevTime = performance.now();

    const interval = setInterval(async () => {
      try {
        const stats = await pc.getStats();
        let fps = 0;
        let latency = 0;

        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && report.kind === "video") {
            const now = performance.now();
            const elapsed = (now - prevTime) / 1000;
            const decoded = report.framesDecoded ?? 0;

            if (prevFrames > 0 && elapsed > 0) {
              fps = Math.round((decoded - prevFrames) / elapsed);
            }
            prevFrames = decoded;
            prevTime = now;

            // jitterBufferDelay / jitterBufferEmittedCount ≈ buffer latency
            if (report.jitterBufferDelay && report.jitterBufferEmittedCount) {
              latency = Math.round(
                (report.jitterBufferDelay / report.jitterBufferEmittedCount) * 1000
              );
            }
          }
        });

        onStats?.({ fps, latency });
      } catch {
        // stats unavailable
      }
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
      if (!WHEP_URL || !video) {
        fallback("VITE_WHEP_URL not set");
        return;
      }

      console.info("[LiveStream] connecting via WHEP:", WHEP_URL);
      setStatus("connecting");

      const timeout = setTimeout(() => {
        if (!cancelled) fallback("connect timeout");
      }, CONNECT_TIMEOUT_MS);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Receive video track → attach to <video>
      pc.ontrack = (event) => {
        clearTimeout(timeout);
        if (!cancelled) {
          video.srcObject = event.streams[0];
          video.play().catch(() => {});
          setStatus("live");
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          clearTimeout(timeout);
          fallback(`WebRTC ${pc.connectionState}`);
        }
      };

      // Create offer with recvonly video
      pc.addTransceiver("video", { direction: "recvonly" });

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          return new Promise<void>((resolve) => {
            if (pc.iceGatheringState === "complete") {
              resolve();
            } else {
              const check = () => {
                if (pc.iceGatheringState === "complete") {
                  pc.removeEventListener("icegatheringstatechange", check);
                  resolve();
                }
              };
              pc.addEventListener("icegatheringstatechange", check);
              // Safety timeout for ICE gathering
              setTimeout(resolve, 3000);
            }
          });
        })
        .then(() => {
          return fetch(WHEP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/sdp" },
            body: pc.localDescription!.sdp,
          });
        })
        .then((res) => {
          if (!res.ok) throw new Error(`WHEP ${res.status}`);
          return res.text();
        })
        .then((sdp) => {
          return pc.setRemoteDescription({ type: "answer", sdp });
        })
        .catch((err) => {
          clearTimeout(timeout);
          console.error("[LiveStream] WHEP error:", err);
          fallback(`WHEP error: ${err.message}`);
        });
    };

    connect();

    return () => {
      cancelled = true;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
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
