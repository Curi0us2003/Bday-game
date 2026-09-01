// Shown while a lazily-loaded scene's chunk and assets arrive. Deliberately
// quiet and in-theme rather than a spinner, so a slow connection reads as part
// of the experience instead of a stall.
export default function SceneLoader({ label = 'LOADING ARCHIVE' }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-void">
      <div className="h-[2px] w-40 overflow-hidden bg-gold/15">
        <div className="h-full w-1/3 animate-[sceneSweep_1.1s_ease-in-out_infinite] bg-gold" />
      </div>
      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-ash">{label}</p>
      <style>{`
        @keyframes sceneSweep {
          0%   { transform: translateX(-120%) }
          100% { transform: translateX(320%) }
        }
      `}</style>
    </div>
  )
}
