import { useLocation } from 'react-router-dom'
import DebugMenu from './DebugMenu.jsx'
import GameHUD from './game/GameHUD.jsx'
import MissionTransition from './game/MissionTransition.jsx'
import Level1DatePuzzle from './game/Level1DatePuzzle.jsx'
import Level2MoviePuzzle from './game/Level2MoviePuzzle.jsx'
import NetflixReward from './game/NetflixReward.jsx'
import CarRaceGame from './game/CarRaceGame.jsx'
import Level3Ending from './game/Level3Ending.jsx'
import MemoryJourney from './game/MemoryJourney.jsx'

export default function DebugPage() {
  const { pathname } = useLocation()

  if (pathname === '/debug' || pathname === '/debug/') {
    return <DebugMenu />
  }

  if (pathname === '/debug/level1') {
    return <Level1DatePuzzle onComplete={(result) => console.log('[DEBUG] Level 1 complete:', result)} />
  }

  if (pathname === '/debug/prep2') {
    return (
      <GameHUD xp={500}>
        <MissionTransition
          levelNumber={2}
          eyebrow="LEVEL 01 COMPLETE"
          title="PREPARING LEVEL 02..."
          subtitle="ANOTHER MEMORY IS WAITING."
          preparing="MISSION 02 PREPARING..."
          onComplete={() => console.log('[DEBUG] Mission 02 transition complete')}
        />
      </GameHUD>
    )
  }

  if (pathname === '/debug/level2') {
    return (
      <Level2MoviePuzzle
        startingXP={500}
        onComplete={(result) => console.log('[DEBUG] Level 2 complete:', result)}
      />
    )
  }

  if (pathname === '/debug/netflix') {
    return <NetflixReward />
  }

  if (pathname === '/debug/level3') {
    return <CarRaceGame startingXP={1250} onComplete={(result) => console.log('[DEBUG] Level 3 complete:', result)} />
  }

  if (pathname === '/debug/level3-ending') {
    return <Level3Ending />
  }

  if (pathname === '/debug/memory-lane') {
    return <MemoryJourney onFinish={() => (window.location.href = '/debug/level3-ending')} />
  }

  return null
}
