import GameBackground from './GameBackground.jsx'
import { birthdayConfig } from '../../data/birthdayConfig.js'
import { gameConfig } from '../../data/gameConfig.js'
import GameMusicControl from './GameMusicControl.jsx'

function bar(value, max = 10) {
  return '█'.repeat(value) + '░'.repeat(Math.max(0, max - value))
}

// Persistent frame for the mission/character/level-transition screens.
// Renders whatever's passed as children in the center — HUD corners
// don't change between those screens, only the center content does.
export default function GameHUD({ children, xp = 0, gameSong }) {
  const { hud } = gameConfig
  const { name } = birthdayConfig

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <GameBackground />
      <GameMusicControl song={gameSong} />

      <div className="absolute top-6 left-6 z-20 text-left">
        <p className="label-mono text-ash">PLAYER</p>
        <p className="heading-display text-xl text-bone tracking-wide">{name.toUpperCase()}</p>
        <div className="mt-3 space-y-1">
          {hud.stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 font-mono text-[10px] text-ash">
              <span className="w-24 text-left">{s.label}</span>
              <span className="text-gold tracking-tighter">{bar(s.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20 text-right">
        <p className="label-mono text-ash">MISSION</p>
        <p className="heading-display text-xl text-gold">{hud.mission}</p>
      </div>

      <div className="absolute bottom-6 right-6 z-20 text-right">
        <p className="label-mono text-ash">XP</p>
        <p className="font-mono text-sm text-bone">{String(Math.max(0, xp)).padStart(3, '0')}</p>
      </div>

      <div className="absolute bottom-6 left-6 z-20 text-left">
        <p className="label-mono text-ash">INVENTORY</p>
        <p className="font-mono text-sm text-ash">{hud.inventory}</p>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24">
        {children}
      </div>
    </div>
  )
}
