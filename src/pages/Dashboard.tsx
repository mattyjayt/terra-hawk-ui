import { useState } from "react";
import { Crosshair, LocateFixed, Map, Minus, Plus, Route, Signal, Target, ZoomIn } from "lucide-react";
import "./Dashboard.css";

const checkpoints = ["LAUNCH", "WP1", "WP2", "WP3", "WP4", "RTB"];

function Metric({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return <div className="dash-metric"><span>{label}</span><strong className={tone}>{value}</strong></div>;
}

export default function Dashboard() {
  const [mode, setMode] = useState<"2D" | "3D">("2D");
  return (
    <main className="dashboard-shell">
      <div className="dashboard-map" aria-label="Drone mission map">
        <div className="dashboard-topbar">
          <div className="dimension-toggle"><button className={mode === "2D" ? "active" : ""} onClick={() => setMode("2D")}>2D</button><button className={mode === "3D" ? "active" : ""} onClick={() => setMode("3D")}>3D</button></div>
          <div className="altimeter"><span>500m</span><i /></div>
          <span className="map-chip"><Signal /> WPS</span>
        </div>
        <div className="map-tools"><button aria-label="Zoom in"><Plus /></button><button aria-label="Zoom out"><Minus /></button><button aria-label="Center map"><LocateFixed /></button><button aria-label="Routes"><Route /></button></div>
        <div className="waypoint wp-launch"><b>● LAUNCH</b></div>
        <div className="waypoint wp1"><b>● WP1</b></div>
        <div className="waypoint wp2"><b>● WP2</b></div>
        <div className="waypoint wp3"><b>● WP3</b></div>
        <div className="waypoint wp4"><b>● WP4</b></div>
        <div className="waypoint rtb"><b>● RTB</b></div>
        <div className="drone-marker"><div className="drone-card"><strong>MR-1022</strong><span className="patrol">● ON PATROL</span><small>◌ &nbsp;Last Contact</small><b>02:40:12 UTC</b><small>Signal</small><em>▥ &nbsp; STRONG</em></div><div className="drone-icon">◈</div></div>
        <div className="mission-ring"><div className="ring-dot" /></div>
        <div className="compass"><span>N</span><span>E</span><span>S</span><span>W</span><Crosshair /></div>
        <div className="route-line"><div className="route-track" />{checkpoints.map((point, i) => <div className={`route-stop stop-${i}`} key={point}><span>{i === 2 ? "◉" : "○"}</span><small>{point}</small></div>)}</div>
        <div className="map-grid" />
      </div>
      <section className="dashboard-panels">
        <article className="dash-panel status-panel"><header><Target /> MISSION STATUS</header><div className="status-content"><div className="progress-ring"><strong>82%</strong><span>COMPLETE</span></div><div className="status-list"><Metric label="State" value="EN ROUTE" /><Metric label="Phase" value="CRUISE" /><Metric label="Next Waypoint" value="WP3" /><Metric label="ETA (Return)" value="00:47:57" /><Metric label="Distance to RP" value="24.7 km" tone="bright" /></div></div></article>
        <article className="dash-panel flight-panel"><header><Crosshair /> FLIGHT MODE</header><div className="flight-content"><div><Metric label="RC Override" value="INACTIVE" /><Metric label="Control Mode" value="AUTO ▪" tone="green" /></div><div className="control-row">{["NAV", "ALT", "SPD", "HDG", "RTL"].map((x, i) => <div className="control" key={x}><span>{x}</span><b className={i === 0 || i === 3 || i === 4 ? "on" : ""}>●</b></div>)}</div></div></article>
        <article className="dash-panel navigation-panel"><header><Map /> NAVIGATION</header><div className="nav-stats"><Metric label="Distance" value="9.37 km" /><Metric label="Bearing" value="168°" /><Metric label="ETA" value="00:10:37" /></div><span className="route-label">ROUTE PROGRESS</span><div className="mini-chart"><i /><i /><i /><i /><i /></div><div className="chart-labels"><span>WP1</span><span>WP2</span><span>WP3</span><span>FIN</span></div></article>
      </section>
    </main>
  );
}
