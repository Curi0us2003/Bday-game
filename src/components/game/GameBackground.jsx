// Game-mode atmosphere. Deliberately distinct from birthday's
// CinematicBackground (purple/crimson glow instead of gold, heavier
// vignette) so Act III reads as a different world the instant it mounts.
export default function GameBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-abyss overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.78)_100%)]" />

      <div
        className="absolute top-1/3 left-1/2 w-[55vw] h-[55vw] rounded-full bg-mist/10 blur-3xl animate-drift"
        style={{ transform: 'translateX(-50%)' }}
      />
      <div
        className="absolute bottom-0 left-1/2 w-[40vw] h-[40vw] rounded-full bg-crimson/10 blur-3xl"
        style={{ transform: 'translateX(-50%)' }}
      />

      {/* Very faint scanlines — premium CRT/system-terminal texture, not a glitch effect */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(237,232,223,0.5) 0px, rgba(237,232,223,0.5) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay animate-grain"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
