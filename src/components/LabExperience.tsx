import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Activity, Bell, Bot, Camera, ChevronDown, CircleUserRound, Cpu, Gauge, Leaf, Menu, Monitor, PanelsTopLeft, Power, Settings2, Sprout, Sun, Thermometer, Waves, X } from "lucide-react";
import "./LabExperience.css";

const greenhouse = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Futuristisch%20dashboard%20voor%20indoor%20farming-0zA9nSGK0K0En8ZoroINVqcowMo9Hq.png";

const nav = [
  ["/dashboard", "Dashboard", PanelsTopLeft],
  ["/crops", "Crops", Leaf],
  ["/environment", "Environment", Waves],
  ["/robotics", "Robotics", Bot],
  ["/live", "Vision", Camera],
  ["/analytics", "Analytics", Activity],
  ["/alerts", "Alerts", Bell],
] as const;

const metrics = [
  ["Temperature", "22.4°C", Thermometer, "+0.8%"],
  ["Humidity", "68%", Waves, "-1.2%"],
  ["pH Level", "5.8", Gauge, "+0.2%"],
  ["EC Level", "1.4 mS/cm", Sprout, "+3.6%"],
] as const;

function MetricCard({ item }: { item: (typeof metrics)[number] }) {
  const [label, value, Icon, delta] = item;
  return <div className="metric-card"><div className="metric-head"><Icon size={16}/><span>{label}</span><span className="metric-delta">{delta}</span></div><strong>{value}</strong><div className="sparkline"><i/><i/><i/><i/><i/><i/></div></div>;
}

function SideBar({ mobileOpen, close }: { mobileOpen: boolean; close: () => void }) {
  return <aside className={`lab-sidebar ${mobileOpen ? "is-open" : ""}`}>
    <div className="brand"><span className="brand-mark"><Leaf size={20}/></span><div><b>Personal R&D</b><small>Indoor Farming Lab</small></div><button className="mobile-close" onClick={close}><X size={18}/></button></div>
    <nav className="side-nav">{nav.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""} onClick={close}><Icon size={15}/><span>{label}</span>{label === "Alerts" && <em>3</em>}</NavLink>)}</nav>
    <div className="side-bottom"><small>SYSTEM</small><NavLink to="/settings" onClick={close}><Settings2 size={15}/>Settings</NavLink><NavLink to="/about" onClick={close}><CircleUserRound size={15}/>Profile</NavLink></div>
  </aside>;
}

function TopBar({ onMenu }: { onMenu: () => void }) { return <header className="lab-topbar"><button className="menu-button" onClick={onMenu}><Menu size={20}/></button><div className="crumb"><span>LAB /</span> <b>CONTROL CENTER</b></div><div className="top-actions"><span className="online"><i/> System Online</span><Bell size={17}/><span className="avatar">JT</span></div></header>; }

function DashboardView() {
  return <><div className="page-heading"><div><span className="eyebrow">OVERVIEW / 06:42:18 UTC</span><h1>Dashboard</h1><p>Live overview of your indoor farm</p></div><button className="select-button">Tower 1 <ChevronDown size={14}/></button></div><section className="metric-grid">{metrics.map((m) => <MetricCard key={m[0]} item={m}/>)}</section><section className="dashboard-grid"><article className="panel live-panel"><div className="panel-title"><span>Live Overview</span><span className="live-badge"><i/> LIVE</span></div><div className="camera-view"><div className="camera-hud"><span>CAM-01 / TOWER A</span><b>98.6% CONFIDENCE</b></div><div className="crop-row"><span>LETTUCE 0.96</span><span>LETTUCE 0.95</span><span>LETTUCE 0.96</span></div><div className="scan-line"/></div><div className="panel-footer"><span>Last scan 12 sec ago</span><button><Camera size={13}/> Open vision feed</button></div></article><article className="panel crop-panel"><div className="panel-title"><span>Crop Health <small>(CV Analysis)</small></span><span className="health-pill">Healthy</span></div><div className="crop-content"><div className="crop-photo"/><div className="crop-stats"><span>Lettuce (Romaine)</span><small>Growth Stage</small><b>Vegetative <i>(Day 18)</i></b><small>Health Score</small><strong>96%</strong><small>Leaf Count</small><b>12</b><small>Est. Harvest</small><b>7 days</b></div></div></article><article className="panel robot-panel"><div className="panel-title"><span>Robotics Status</span><span className="status-green">ACTIVE</span></div><div className="robot-row"><div className="robot-image"><Bot size={38}/><span>ARM-02</span></div><div><b>Watering Arm</b><small>Running cycle 2/4</small><div className="progress"><i/></div></div></div></article><article className="panel system-panel"><div className="panel-title"><span>System</span><Power size={15}/></div><div className="system-grid"><span><Sun/>Lights <b>On</b></span><span><Waves/>Pump <b>On</b></span><span><Sprout/>Fans <b>Auto</b></span><span><Gauge/>CO₂ <b>620 ppm</b></span></div></article></section></>;
}

function GenericView({ title, label, icon: Icon }: { title: string; label: string; icon: typeof Leaf }) { return <><div className="page-heading"><div><span className="eyebrow">LAB MODULE / {label}</span><h1>{title}</h1><p>Monitor, configure, and explore your indoor farming system.</p></div><button className="primary-button"><Activity size={15}/> Run analysis</button></div><section className="module-grid"><article className="panel module-hero"><Icon size={30}/><h2>{title} control layer</h2><p>Every subsystem is connected to the same real-time telemetry stream.</p><div className="module-bars"><i/><i/><i/><i/><i/></div></article>{metrics.map((m) => <MetricCard key={m[0]} item={m}/>)}</section></>; }

export default function LabExperience() {
  const { pathname } = useLocation(); const [mobileOpen, setMobileOpen] = useState(false);
  const title = useMemo(() => nav.find(([to]) => pathname.startsWith(to)) ?? (pathname.startsWith("/settings") ? ["/settings", "Settings", Settings2] as const : ["/about", "Profile", CircleUserRound] as const), [pathname]);
  const isDashboard = pathname === "/" || pathname === "/dashboard";
  const content = isDashboard ? <DashboardView/> : <GenericView title={title[1]} label={title[1].toUpperCase()} icon={title[2]}/>;
  return <div className="lab-app"><div className="lab-backdrop" style={{ backgroundImage: `url(${greenhouse})` }}/><SideBar mobileOpen={mobileOpen} close={() => setMobileOpen(false)}/><main className="lab-main"><TopBar onMenu={() => setMobileOpen(true)}/><div className="lab-content">{content}</div><footer className="lab-footer"><span>PERSONAL R&D / INDOOR FARMING LAB</span><span>BUILD 0.9.4 · ALL SYSTEMS NOMINAL</span></footer></main></div>;
}
