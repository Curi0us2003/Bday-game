// Shared background atmosphere for Layer 2. Kept separate so the
// grain/vignette/glow treatment stays identical across all three screens
// without copy-pasting it into each one.
export default function CinematicBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-ink overflow-hidden pointer-events-none">
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />

      {/* Slow drifting warm glow, off-center and very faint */}
      <div className="absolute -top-1/4 left-1/2 w-[60vw] h-[60vw] rounded-full bg-gold/5 blur-3xl animate-drift" />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay animate-grain"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
