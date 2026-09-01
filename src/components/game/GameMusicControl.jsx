import { Volume2, VolumeX, Minus, Plus } from 'lucide-react'

export default function GameMusicControl({ song }) {
  if (!song) return null

  if (song.status === 'blocked' || song.status === 'idle') {
    return (
      <button
        type="button"
        onClick={song.play}
        className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 border border-gold/30 bg-black/75 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gold hover:border-gold hover:bg-gold/5 transition-all"
      >
        ▶ Play game theme
      </button>
    )
  }

  const volumePercent = Math.round((song.volume ?? 0.35) * 100)

  return (
    <div className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 flex items-center gap-1 border border-gold/20 bg-black/70 px-2 py-1.5 backdrop-blur-sm">
      <span className="hidden sm:inline font-mono text-[8px] uppercase tracking-[0.2em] text-ash px-2">
        THEME
      </span>
      <button
        type="button"
        onClick={song.toggleMute}
        aria-label={song.muted ? 'Unmute game music' : 'Mute game music'}
        className="h-7 w-7 grid place-items-center text-ash hover:text-gold transition-colors"
      >
        {song.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>
      <button
        type="button"
        onClick={() => song.setVolume((song.volume ?? 0.35) - 0.1)}
        aria-label="Decrease game music volume"
        className="h-7 w-7 grid place-items-center text-ash hover:text-gold transition-colors"
      >
        <Minus size={12} />
      </button>
      <span className="w-8 text-center font-mono text-[8px] text-gold">{volumePercent}%</span>
      <button
        type="button"
        onClick={() => song.setVolume((song.volume ?? 0.35) + 0.1)}
        aria-label="Increase game music volume"
        className="h-7 w-7 grid place-items-center text-ash hover:text-gold transition-colors"
      >
        <Plus size={12} />
      </button>
    </div>
  )
}
