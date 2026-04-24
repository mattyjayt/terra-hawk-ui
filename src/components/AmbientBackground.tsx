import heroTerrarium from "@/assets/hero-terrarium.jpg";

/**
 * Global ambient backdrop. Lives behind every page so all glass UI floats
 * over the same living image. Uses fixed positioning + parallax-like slow
 * zoom + colored bokeh + vignette to blend the hero into the page.
 */
const AmbientBackground = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Hero image, very soft and blurred so UI reads on top */}
      <img
        src={heroTerrarium}
        alt=""
        className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        style={{ filter: "blur(2px) saturate(110%) brightness(0.78)" }}
      />

      {/* Deep wash to keep contrast for text */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(160 25% 4% / 0.55) 0%, hsl(160 22% 5% / 0.35) 40%, hsl(160 25% 4% / 0.75) 100%)",
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
