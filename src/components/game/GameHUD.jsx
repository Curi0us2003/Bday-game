import GameBackground from './GameBackground.jsx'
import { gameConfig } from '../../data/gameConfig.js'
import GameMusicControl from './GameMusicControl.jsx'

// Persistent frame for the mission/character/level-transition screens.
// Renders whatever's passed as children in the center — HUD corners
// don't change between those screens, only the center content does.
// The player card lives in BirthdayExperience so it spans every screen.
export default function GameHUD({ children, xp = 0, gameSong }) {
  const { hud } = gameConfig

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <GameBackground />
      <GameMusicControl song={gameSong} />

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
