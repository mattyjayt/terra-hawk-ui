import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "dome" },
  { to: "/live", label: "live feed" },
  { to: "/about", label: "system" },
  { to: "/settings", label: "settings" },
];

const SiteNav = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-30 mx-auto max-w-[1440px] px-6 py-6 md:px-10 md:py-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/75 hud-text">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
          v.01 · live
        </div>
        <Link
          to="/"
          className="font-display text-[15px] font-normal tracking-[0.45em] text-foreground/95 hud-text-strong transition hover:text-foreground"
        >
          TERRA HAWK
        </Link>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`font-mono text-[10px] uppercase tracking-[0.3em] transition hud-text ${
                  active
                    ? "text-foreground"
                    : "text-foreground/55 hover:text-foreground/90"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {active && <span className="h-1 w-1 rounded-full bg-accent" />}
                  {l.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
        {/* Mobile hamburger */}
        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((p) => !p)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/30 text-foreground/80 hud-text transition hover:border-foreground/60 md:hidden"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
        <div className="hidden h-8 w-8 md:block" aria-hidden />
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav className="mt-4 flex flex-col gap-1 rounded border border-foreground/15 bg-background/90 p-4 backdrop-blur-md animate-fade-in md:hidden">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.25em] transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-accent" : "bg-foreground/20"
                  }`}
                />
                {l.label}
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default SiteNav;
