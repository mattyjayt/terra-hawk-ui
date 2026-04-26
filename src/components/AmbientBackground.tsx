import { useLocation } from "react-router-dom";
import heroTerrarium from "@/assets/hero-terrarium.jpg";
import heroDome from "@/assets/hero-dome.jpg";

/**
 * Global ambient backdrop. Lives behind every page so all glass UI floats
 * over the same living image. Uses fixed positioning + parallax-like slow
 * zoom + colored bokeh + vignette to blend the hero into the page.
 */
const AmbientBackground = () => {
  const location = useLocation();
  const isAbout = location.pathname === "/about";
  const bgImage = isAbout ? heroDome : heroTerrarium;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Hero image — full bleed, sharp, the actual stage */}
      <img
        key={bgImage}
        src={bgImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        style={{ filter: "saturate(115%) brightness(0.92) contrast(1.05)" }}
      />

      {/* Light edge wash only — keep the image readable as the hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 45%, hsl(160 25% 3% / 0.55) 100%)",
        }}
      />

      {/* Living bokeh — drifts slowly */}
      <div
        className="absolute inset-0 opacity-70 animate-float"
        style={{
          background:
            "radial-gradient(circle at 18% 28%, hsl(38 80% 55% / 0.18), transparent 38%), radial-gradient(circle at 82% 72%, hsl(88 60% 50% / 0.16), transparent 42%), radial-gradient(circle at 50% 110%, hsl(160 60% 30% / 0.25), transparent 55%)",
        }}
      />

      {/* Scanline drifting across the whole canvas */}
      <div
        className="absolute inset-x-0 h-[2px] animate-scan"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(88 60% 55% / 0.35), transparent)",
          boxShadow: "0 0 32px hsl(88 60% 55% / 0.25)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-vignette)" }}
      />
    </div>
  );
};

export default AmbientBackground;
