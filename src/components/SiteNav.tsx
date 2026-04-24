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
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
        v.01 · live
      </div>
      <Link
        to="/"
        className="font-display text-[15px] font-normal tracking-[0.45em] text-foreground/95 transition hover:text-foreground"
      >
        TERRA HAWK
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        <div className="glass flex items-center gap-1 rounded-full p-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] transition ${
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-foreground/55 hover:text-foreground/90"
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
        className="glass flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 md:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <div className="hidden h-10 w-10 md:block" aria-hidden />
    </header>
  );
};

export default SiteNav;
