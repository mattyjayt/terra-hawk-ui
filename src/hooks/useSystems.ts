import { useState, useEffect } from "react";

export interface SystemCamera {
  type: string;
  stream_url: string;
  whep_url?: string;
  inference: {
    enabled: boolean;
    runs_on: string;
  };
}

export interface SystemSensors {
  type: string;
  mqtt_topic_in: string;
  mqtt_topic_out: string;
  capabilities: string[];
}

export interface SystemInfo {
  id: string;
  name: string;
  location: string;
  status: string;
  controller: {
    type: string;
    ip: string;
  };
  components: {
    camera: SystemCamera | null;
    sensors: SystemSensors | null;
    actuators: { actions: string[] } | null;
  };
}

function getApiBase(): string {
  const streamUrl = import.meta.env.VITE_LIVESTREAM_URL as string | undefined;
  if (streamUrl) {
    try {
      const hostname = new URL(streamUrl).hostname;
      return `http://${hostname}:8000`;
    } catch { /* fall through */ }
  }
  return "http://localhost:8000";
}

export function useSystems() {
  const [systems, setSystems] = useState<SystemInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getApiBase();

    const fetchSystems = async () => {
      try {
        const res = await fetch(`${base}/systems`);
        const data = await res.json();
        setSystems(data.systems);
      } catch (e) {
        console.error("[useSystems] fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
    // Poll status every 30s
    const id = setInterval(fetchSystems, 30000);
    return () => clearInterval(id);
  }, []);

  return { systems, loading };
}
