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

export function useSensorData() {
  const [data, setData] = useState<Record<string, unknown>>({
    // Initial state matching the backend structure
    temperature: null,
    humidity: null,
    soil: null,
    status: "connecting",
  });
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Derive WS URL from VITE_LIVESTREAM_URL
    const streamUrl = import.meta.env.VITE_LIVESTREAM_URL || "http://localhost";
    let hostname = "localhost";
    try {
      const url = new URL(streamUrl);
      hostname = url.hostname;
    } catch (e) {
      console.error("Invalid VITE_LIVESTREAM_URL", e);
    }

    // const wsUrl = `ws://${hostname}:8000/ws/sensors`;
    const wsUrl = `ws://localhost:8000/ws/sensors`;
    const wsCVUrl = `ws://localhost:8000/ws/cv`;
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
        // Reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    const testComputerVision = () => {
      wsCV = new WebSocket(wsCVUrl);
      console.log("Computer vision WebSocket is open");

      wsCV.onopen = () => {
        console.log("Connected to computer vision WebSocket");
      };

      wsCV.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setCvData(parsed);
        } catch (e) {
          console.error("Failed to parse computer vision data", e);
        }
      };

      wsCV.onclose = () => {
        console.log("Disconnected from computer vision WebSocket");
      };

      wsCV.onerror = (err) => {
        console.error("Computer vision WebSocket error:", err);
        wsCV.close();
      };
    };

    connect();
    testComputerVision();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // prevent reconnect loop on unmount
        ws.close();
      }

      if (wsCV) {
        wsCV.onclose = null;
        wsCV.close();
      }
    };
  }, []);

  return { data, connected, cvData };
}
