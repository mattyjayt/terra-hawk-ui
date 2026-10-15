import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity, Bell, Bot, Camera, ChevronDown, CircleGauge, Droplets, Eye,
  Fan, Gauge, Leaf, Lightbulb, Menu, Settings2, SlidersHorizontal, Sprout,
  Thermometer, UserRound, Waves, X, Zap,
} from "lucide-react";
import "./Dashboard.css";

const navItems = [
  { label: "Dashboard", icon: CircleGauge, to: "/dashboard" },
  { label: "Crops", icon: Sprout, to: "/about" },
  { label: "Environment", icon: Thermometer, to: "/dashboard" },
  { label: "Robotics", icon: Bot, to: "/live" },
  { label: "Vision", icon: Eye, to: "/live" },
  { label: "Analytics", icon: Activity, to: "/dashboard" },
  { label: "Alerts", icon: Bell, to: "/dashboard" },
];

const metrics = [
  { label: "Temperature", value: "22.4°C", detail: "Optimal range", icon: Thermometer, points: "0,24 14,19 28,22 43,9 57,17 72,14 88,20 102,8" },
  { label: "Humidity", value: "68%", detail: "Stable", icon: Droplets, points: "0,17 14,18 28,12 43,21 57,13 72,16 88,7 102,12" },
  { label: "pH Level", value: "5.8", detail: "Within range", icon: Waves, points: "0,21 14,17 28,18 43,12 57,15 72,10 88,18 102,14" },
  { label: "EC Level", value: "1.4 mS/cm", detail: "Nutrient flow normal", icon: Zap, points: "0,22 14,10 28,20 43,17 57,8 72,19 88,14 102,17" },
  { label: "Light Intensity", value: "320 µmol", detail: "Day cycle active", icon: Lightbulb, points: "0,18 14,18 28,9 43,14 57,10 72,17 88,6 102,12" },
];

function Sparkline({ points }: { points: string }) {
  return <svg className="sparkline" viewBox="0 0 102 28" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} /></svg>;
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <aside className={`farm-sidebar ${open ? "is-open" : ""}`}>
    <div className="brand"><span className="brand-mark"><Leaf /></span><div><strong>Personal R&D</strong><small>Indoor Farming Lab</small></div><button className="mobile-close" onClick={onClose}><X /></button></div>
    <div className="side-label">WORKSPACE</div>
    <nav className="side-nav">{navItems.map(({ label, icon: Icon, to }, i) => <NavLink key={`${label}-${i}`} to={to} className={({ isActive }) => `side-link ${isActive && label === "Dashboard" ? "active" : ""}`} onClick={onClose}><Icon /><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="side-label">SYSTEM</div><NavLink to="/settings" className="side-link"><Settings2 /><span>Settings</span></NavLink><NavLink to="/about" className="side-link"><UserRound /><span>Profile</span></NavLink></div>
  </aside>;
}

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [pumpOn, setPumpOn] = useState(true);
  return <main className="farm-app">
    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <section className="farm-content">
      <header className="farm-header"><button className="mobile-menu" onClick={() => setMenuOpen(true)}><Menu /></button><div><h1>Dashboard</h1><p>Live overview of your indoor farm</p></div><div className="header-actions"><span className="online"><i /> System Online</span><button className="icon-button"><Bell /></button><button className="avatar">JT</button></div></header>
      <div className="demo-note"><span><Activity /> Demo telemetry</span> Simulated readings · hardware disconnected <button><ChevronDown /></button></div>
      <section className="metric-grid">{metrics.map(({ label, value, detail, icon: Icon, points }) => <article className="glass-card metric-card" key={label}><div className="metric-head"><span>{label}</span><Icon /></div><strong>{value}</strong><small><i /> {detail}</small><Sparkline points={points} /></article>)}</section>
      <section className="dashboard-grid">
        <article className="glass-card camera-card"><header className="panel-header"><div><h2>Live Overview</h2><span>Vision stream · Tower Cam 1</span></div><span className="live-badge"><i /> DEMO</span></header><div className="camera-view"><div className="camera-grid" /><div className="camera-arm"><div className="arm-joint" /><div className="arm-bar" /><div className="arm-grip" /></div><div className="plant plant-a" /><div className="plant plant-b" /><div className="plant plant-c" /><div className="detection detection-a"><b>Lettuce 0.96</b></div><div className="detection detection-b"><b>Lettuce 0.98</b></div><span className="camera-time">14:32:08 UTC</span><div className="camera-controls"><button><Camera /></button><button><Eye /></button><span>1920×1080 · 30 FPS</span><button><SlidersHorizontal /></button></div></div></article>
        <article className="glass-card crop-card"><header className="panel-header"><div><h2>Crop Health <em>(CV Analysis)</em></h2><span>Simulated inference</span></div><span className="health-badge">Healthy</span></header><div className="crop-visual"><div className="leaf-cluster"><span /><span /><span /><span /><span /></div><div className="crop-scan" /></div><div className="crop-info"><div><small>Crop</small><strong>Lettuce (Romaine)</strong></div><div><small>Growth Stage</small><strong>Vegetative · Day 18</strong></div><div><small>Health Score</small><strong className="mint">96%</strong></div><div><small>Leaf Count</small><strong>12</strong></div><div><small>Est. Harvest</small><strong>7 days</strong></div></div></article>
        <article className="glass-card robotics-card"><header className="panel-header"><div><h2>Robotics Status</h2><span>Actuator simulation</span></div><Bot /></header><div className="robot-visual"><div className="robot-arm"><div className="robot-base" /><div className="robot-segment one" /><div className="robot-segment two" /><div className="robot-claw" /></div><span className="robot-ready"><i /> Ready</span></div><div className="robot-footer"><div><small>Watering Arm</small><strong>Running cycle 2/4</strong></div><button>Control Robot <ChevronDown /></button></div></article>
        <article className="glass-card systems-card"><header className="panel-header"><div><h2>System Controls</h2><span>Simulated devices</span></div><Gauge /></header><div className="system-list"><div className="system-row"><Lightbulb /><div><strong>Grow Lights</strong><small>On · Day cycle</small></div><button className={`toggle ${lightsOn ? "on" : ""}`} onClick={() => setLightsOn(!lightsOn)}><i /></button></div><div className="system-row"><Droplets /><div><strong>Irrigation Pump</strong><small>On · Flow normal</small></div><button className={`toggle ${pumpOn ? "on" : ""}`} onClick={() => setPumpOn(!pumpOn)}><i /></button></div><div className="system-row"><Fan /><div><strong>Ventilation</strong><small>Auto · 42%</small></div><button className="toggle on"><i /></button></div><div className="system-row"><Waves /><div><strong>CO₂ Monitor</strong><small>620 ppm · Good</small></div><span className="system-value">620 ppm</span></div></div></article>
      </section>
    </section>
  </main>;
}
