import { useEffect, useRef, useState } from "react";
import simTerrariumAsset from "@/assets/sim-terrarium.mp4.asset.json";

/**
 * WebRTC live stream via the WHEP protocol (MediaMTX, go2rtc, etc).
 *
 * Env var (set in your .env):
 *   VITE_LIVESTREAM_URL=http(s)://<ip>:8889/<path>/whep
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

const STREAM_URL = import.meta.env.VITE_LIVESTREAM_URL as string | undefined;
const CONNECT_TIMEOUT_MS = 6000;

const LiveStream = ({ className, onStatusChange, onStats }: Props) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const simVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (status !== "live" || !pcRef.current) return;

    const interval = setInterval(async () => {
      try {
        const pc = pcRef.current;
        if (!pc) return;
        const stats = await pc.getStats();

        let fps = 0;
        let latency = 0;

        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && report.kind === "video") {
            if (report.framesPerSecond) fps = report.framesPerSecond;
          }
          if (report.type === "candidate-pair" && report.state === "succeeded") {
            if (report.currentRoundTripTime) latency = report.currentRoundTripTime * 1000;
          }
        });

        onStats?.({ fps, latency });
      } catch (e) {
        console.warn("[LiveStream] getStats error:", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, onStats]);

  // Attach stream to <video> whenever either changes. The live <video> is
  // always mounted, so the ref is available as soon as the stream arrives.
  useEffect(() => {
    const v = liveVideoRef.current;
    if (v && mediaStream && v.srcObject !== mediaStream) {
      v.srcObject = mediaStream;
      v.play().catch((e) => console.warn("[LiveStream] play() rejected:", e));
    }
  }, [mediaStream]);

  useEffect(() => {
    let cancelled = false;

    const fallback = (reason: string) => {
      if (cancelled) return;
      console.warn("[LiveStream] falling back to simulated:", reason);
      setStatus("simulated");
      simVideoRef.current?.play().catch(() => {});
    };

    const connect = async () => {
      if (!STREAM_URL) {
        fallback("VITE_LIVESTREAM_URL not set");
        return;
      }

      console.info("[LiveStream] connecting to", STREAM_URL);
      setStatus("connecting");

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        console.info(
          "[LiveStream] ontrack",
          event.track.kind,
          "streams:",
          event.streams.length,
        );
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        if (!cancelled) setMediaStream(stream);
      };

      pc.onconnectionstatechange = () => {
        if (cancelled) return;
        console.info("[LiveStream] connectionState:", pc.connectionState);
        if (pc.connectionState === "connected") setStatus("live");
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          fallback(`pc state ${pc.connectionState}`);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.info("[LiveStream] iceConnectionState:", pc.iceConnectionState);
      };

      const timeout = setTimeout(() => {
        if (pc.connectionState !== "connected") {
          try { pc.close(); } catch { /* noop */ }
          fallback("connect timeout");
        }
      }, CONNECT_TIMEOUT_MS);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const res = await fetch(STREAM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp ?? "",
        });

        if (!res.ok) throw new Error(`WHEP HTTP ${res.status}`);
        const answerSdp = await res.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
        console.info("[LiveStream] WHEP handshake OK");
        clearTimeout(timeout);
      } catch (err) {
        clearTimeout(timeout);
        try { pc.close(); } catch { /* noop */ }
        fallback(`handshake error: ${(err as Error).message}`);
      }
    };

    connect();

    return () => {
      cancelled = true;
      try { pcRef.current?.close(); } catch { /* noop */ }
      pcRef.current = null;
    };
  }, []);

  const showLive = status === "live" || status === "connecting";

  return (
    <div className={className}>
      {/* Always mounted so the ref exists when ontrack fires */}
      <video
        ref={liveVideoRef}
        className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        autoPlay
        playsInline
        muted
        style={{
          filter: "saturate(118%) contrast(1.06) brightness(0.95)",
          opacity: showLive && mediaStream ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />
      {/* Simulated fallback sits underneath; visible when not live */}
      {!(status === "live" && mediaStream) && (
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
