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
      <div className="hud-text flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-foreground/80">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
        v.01 · live
      </div>
      <Link
        to="/"
        className="hud-text font-display text-[15px] font-normal tracking-[0.45em] text-foreground/95 transition hover:text-foreground"
      >
        VERDANT
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        <div className="flex items-center gap-1 rounded-full p-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`hud-text rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] transition ${
                  active
                    ? "text-foreground font-bold"
                    : "text-foreground/75 hover:text-foreground"
                }`}
              >
                {l.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
      <button
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center rounded-full transition hover:text-foreground/80 md:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <div className="hidden h-10 w-10 md:block" aria-hidden />
    </header>
  );
};

export default SiteNav;
