import { useState, useEffect } from "react";

export interface CVObject {
  id: number | null;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface CVData {
  timestamp: number;
  resolution: string;
  objects: CVObject[];
}

function getWsBase(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProtocol}//${url.host}`;
    } catch { /* fall through */ }
  }

  // Fallback: derive from stream URL
  const streamUrl = import.meta.env.VITE_LIVESTREAM_URL as string | undefined;
  if (streamUrl) {
    try {
      const url = new URL(streamUrl);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProtocol}//${url.hostname}:8000`;
    } catch { /* fall through */ }
  }
  return "ws://localhost:8000";
}

/**
 * Connects to sensor and CV WebSocket streams.
 * @param systemId — optional system ID for multi-system support.
 *   If omitted, connects to legacy `/ws/sensors` and `/ws/cv` (default system).
 */
export function useSensorData(systemId?: string) {
  const [data, setData] = useState<Record<string, unknown>>({
    temperature: null,
    humidity: null,
    soil: null,
    status: "connecting",
  });
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsBase = getWsBase();
    const sensorPath = systemId ? `/ws/sensors/${systemId}` : "/ws/sensors";
    const cvPath = systemId ? `/ws/cv/${systemId}` : "/ws/cv";
    const wsUrl = `${wsBase}${sensorPath}`;
    const wsCVUrl = `${wsBase}${cvPath}`;

    let ws: WebSocket;
    let wsCV: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse sensor data", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setData((prev) => ({ ...prev, status: "disconnected" }));
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    const connectCV = () => {
      wsCV = new WebSocket(wsCVUrl);

      wsCV.onopen = () => {
        console.log(`Connected to CV WebSocket (${cvPath})`);
      };

      wsCV.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setCvData(parsed);
        } catch (e) {
          console.error("Failed to parse CV data", e);
        }
      };

      wsCV.onclose = () => {
        console.log("Disconnected from CV WebSocket");
      };

      wsCV.onerror = (err) => {
        console.error("CV WebSocket error:", err);
        wsCV.close();
      };
    };

    connect();
    connectCV();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (wsCV) {
        wsCV.onclose = null;
        wsCV.close();
      }
    };
  }, [systemId]);

  return { data, connected, cvData };
}
