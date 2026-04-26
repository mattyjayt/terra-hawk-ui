import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const links = [
  { to: "/", label: "dome" },
  { to: "/live", label: "live feed" },
  { to: "/about", label: "system" },
];

const SiteNav = () => {
  const { pathname } = useLocation();
  return (
    <header className="relative z-30 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-10 md:py-7">
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
      <button
        aria-label="Menu"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/30 text-foreground/80 hud-text transition hover:border-foreground/60 md:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <div className="hidden h-8 w-8 md:block" aria-hidden />
    </header>
  );
};

export default SiteNav;
