import { useEffect, useRef, useState } from "react";
import simTerrariumAsset from "@/assets/sim-terrarium.mp4.asset.json";

/**
 * WebRTC live stream via the WHEP protocol (the de-facto standard for
 * pulling a stream from MediaMTX, go2rtc, Janus, AntMedia, etc).
 *
 * Env var (set in your .env):
 *   VITE_LIVESTREAM_URL=https://<ip-address>/whep   (or full WHEP endpoint)
 *
 * If the var is missing OR the endpoint is unreachable, we fall back to a
 * looping simulated terrarium feed so the HUD always has something to show.
 */

type Status = "idle" | "connecting" | "live" | "simulated";

interface Props {
  className?: string;
  onStatusChange?: (s: Status) => void;
}

const STREAM_URL = import.meta.env.VITE_LIVESTREAM_URL as string | undefined;
const CONNECT_TIMEOUT_MS = 4000;

const LiveStream = ({ className, onStatusChange }: Props) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const simVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    let cancelled = false;

    const fallback = () => {
      if (cancelled) return;
      setStatus("simulated");
      simVideoRef.current?.play().catch(() => {});
    };

    const connect = async () => {
      if (!STREAM_URL) {
        fallback();
        return;
      }

      setStatus("connecting");
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // We only want to receive media
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (liveVideoRef.current && event.streams[0]) {
          liveVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (cancelled) return;
        const s = pc.connectionState;
        if (s === "connected") setStatus("live");
        if (s === "failed" || s === "disconnected" || s === "closed") {
          fallback();
        }
      };

      // Hard timeout — if we can't reach the camera, simulate.
      const timeout = setTimeout(() => {
        if (pc.connectionState !== "connected") {
          try {
            pc.close();
          } catch {
            /* noop */
          }
          fallback();
        }
      }, CONNECT_TIMEOUT_MS);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // WHEP: POST the SDP offer, receive SDP answer
        const res = await fetch(STREAM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp ?? "",
        });

        if (!res.ok) throw new Error(`WHEP ${res.status}`);
        const answerSdp = await res.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
        clearTimeout(timeout);
      } catch (err) {
        clearTimeout(timeout);
        try {
          pc.close();
        } catch {
          /* noop */
        }
        fallback();
      }
    };

    connect();

    return () => {
      cancelled = true;
      try {
        pcRef.current?.close();
      } catch {
        /* noop */
      }
      pcRef.current = null;
    };
  }, []);

  return (
    <div className={className}>
      {status === "live" ? (
        <video
          ref={liveVideoRef}
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
          autoPlay
          playsInline
          muted
          style={{ filter: "saturate(118%) contrast(1.06) brightness(0.95)" }}
        />
      ) : (
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
