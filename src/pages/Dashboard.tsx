import { useState } from "react";
import { Crosshair, Link2, Minus, Plus, Radio, Satellite, Settings2, Target, Wifi } from "lucide-react";

const sourceImage = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Real-Time%20Drone%20Mission%20Control%20Dashboard%20-%20UAV%20Command%20Center%20UI-pgEo9KemNI8HD8KnVzzjhQd6vaKh6k.jpeg";

const waypoints = ["LAUNCH", "WP1", "WP2", "WP3", "WP4", "WP5", "RTB"];

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="panel-title"><span className="panel-glyph">◇</span>{title}</div>
      {children}
    </section>
  );
}

function Dashboard() {
  const [mode, setMode] = useState<"2D" | "3D">("2D");
  const [mapZoom, setMapZoom] = useState(0);

  return (
    <main className="dashboard-shell" style={{ backgroundImage: `url("${sourceImage}")` }}>
      <div className="dashboard-wash" />
      <div className="dashboard-topbar">
        <div className="view-switch"><button className={mode === "2D" ? "selected" : ""} onClick={() => setMode("2D")}>2D</button><button className={mode === "3D" ? "selected" : ""} onClick={() => setMode("3D")}>3D</button></div>
        <div className="scale-readout"><b>500m</b><span /></div>
        <div className="status-chip"><Wifi /> WPS</div>
      </div>

      <div className="map-labels" aria-hidden="true">
        <span className="map-tag tag-wp1">● WP1</span><span className="map-tag tag-wp2">● WP2</span><span className="map-tag tag-wp3">● WP3</span><span className="map-tag tag-wp4">● WP4</span><span className="map-tag tag-wp5">● WP5</span><span className="map-tag tag-rtb">● RTB</span><span className="map-tag tag-launch">● LAUNCH</span>
      </div>

      <div className="drone-callout"><div className="drone-id">MR-1022</div><div className="patrol"><Radio /> ON PATROL</div><div className="callout-divider" /><small>◌ &nbsp;Last Contact</small><strong>02:41:02 UTC</strong><small>▥ &nbsp;Signal</small><em>STRONG</em></div>
      <div className="drone-orbit"><span className="drone-dot" /><span className="orbit-ring" /></div>
      <div className="target-zone"><span>WP2</span></div>

      <aside className="map-tools"><button onClick={() => setMapZoom((z) => z + 1)} aria-label="Zoom in"><Plus /></button><button onClick={() => setMapZoom((z) => z - 1)} aria-label="Zoom out"><Minus /></button><button aria-label="Recenter"><Crosshair /></button><button aria-label="Layers"><Link2 /></button><small>{mapZoom > 0 ? `+${mapZoom}` : mapZoom}</small></aside>

      <div className="compass"><span>N</span><b>W&nbsp;&nbsp;·&nbsp;&nbsp;E</b><span>S</span><i /></div>
      <div className="distance-ring"><span>20</span><span>10</span><span>0</span><b>◉</b></div>

      <div className="route-timeline"><div className="route-line" />{waypoints.map((point, index) => <div className={`route-point point-${index}`} key={point}><span className={point === "WP2" ? "active" : ""} /><label>{point}</label></div>)}</div>

      <div className="dashboard-panels">
        <Panel title="MISSION STATUS" className="mission-status"><div className="progress-ring"><span>82%</span><small>COMPLETE</small></div><div className="mission-details"><div>State <b>EN ROUTE</b></div><div>Phase <b>CRUISE</b></div><div>Next Waypoint <b>WP3</b></div><div>ETA (Return) <b>00:47:57</b></div><div>Distance to RP <b className="big-value">24.7 <small>km</small></b></div></div></Panel>
        <Panel title="FLIGHT MODE" className="flight-mode"><div className="mode-row"><span>RC Override</span><b className="pill muted">INACTIVE</b></div><div className="mode-row"><span>Control Mode</span><b className="pill green">AUTO <i /></b></div><div className="sensor-grid">{["NAV", "ALT", "SPD", "HDG", "RTL"].map((x, i) => <div className={i === 1 ? "sensor dim" : "sensor"} key={x}><b>{x}</b><span>●</span></div>)}</div></Panel>
        <Panel title="NAVIGATION" className="navigation"><div className="nav-stats"><div>Distance<strong>9.37 <small>KM</small></strong></div><div>Bearing<strong>168°</strong></div><div>ETA<strong>00:10:37</strong></div></div><div className="route-caption">ROUTE PROGRESS</div><div className="mini-chart"><svg viewBox="0 0 320 52" preserveAspectRatio="none"><path d="M0 40 L35 36 L68 40 L105 26 L140 37 L170 32 L205 42 L235 22 L275 31 L320 16" /></svg><div><span>WP1</span><span>WP2</span><span>WP3</span><span>FIN</span></div></div></Panel>
      </div>

      <div className="mission-badge"><Target /> <span>MISSION<br /><b>HAWK EYE</b></span></div><div className="dashboard-corner"><Settings2 /></div><Satellite className="satellite-icon" />
    </main>
  );
}

export default Dashboard;
