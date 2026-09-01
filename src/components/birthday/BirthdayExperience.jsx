import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import BirthdayOpening from './BirthdayOpening.jsx'
import GameAwakening from '../game/GameAwakening.jsx'
import GameHUD from '../game/GameHUD.jsx'
import MissionIntro from '../game/MissionIntro.jsx'
import MissionTransition from '../game/MissionTransition.jsx'
import FlippablePlayerCard from '../common/FlippablePlayerCard.jsx'
import SceneLoader from '../common/SceneLoader.jsx'
import useBirthdaySong from '../../hooks/useBirthdaySong.js'
import gotTheme from '../../assets/sounds/got-theme.mp3'

// Heavy scenes are split out of the initial bundle. Each one drags in its own
// images, audio or video and none of it is needed to paint the landing page,
// so they load on the way in instead of up front.
const CakeScene = lazy(() => import('./CakeScene.jsx'))
const Level1DatePuzzle = lazy(() => import('../game/Level1DatePuzzle.jsx'))
const Level2MoviePuzzle = lazy(() => import('../game/Level2MoviePuzzle.jsx'))
const NetflixReward = lazy(() => import('../game/NetflixReward.jsx'))
const CarRaceGame = lazy(() => import('../game/CarRaceGame.jsx'))
const Level3Ending = lazy(() => import('../game/Level3Ending.jsx'))
const MemoryJourney = lazy(() => import('../game/MemoryJourney.jsx'))

const PROGRESS_KEY = 'archive.phase'

// Phases worth restoring after an accidental refresh or back-swipe. The
// opening primes audio inside a click, so resuming *into* it would leave the
// song blocked; and there is nothing to resume on the final card.
const RESUMABLE = new Set([
  'mission',
  'transition',
  'level1',
  'cake',
  'level2prep',
  'level2',
  'level2reward',
  'netflix',
  'level3',
  'final',
  'memories',
])

function readSavedPhase() {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY)
    return saved && RESUMABLE.has(saved) ? saved : null
  } catch {
    return null // private mode or blocked storage: just start from the top
  }
}

// Owns the full sequence so each reward unlocks the next act.
export default function BirthdayExperience() {
  const [phase, setPhase] = useState('opening')
  const [resumable] = useState(readSavedPhase)
  const [memoryResult, setMemoryResult] = useState({ solved: false, attempts: 0, xp: 0 })
  const [level2Result, setLevel2Result] = useState({ xp: 0, mistakes: 0 })
  const [level3Result, setLevel3Result] = useState({ xp: 0, distance: 0 })

  const totalXP = memoryResult.xp + level2Result.xp
  // Level 3 reports the run total (start + earned); its result used to be
  // stored and then never read, so all the race scoring was discarded.
  const finalXP = level3Result.xp || totalXP

  const song = useBirthdaySong('/assets/audio/happy-birthday.mp3')
  const gameSong = useBirthdaySong(gotTheme)

  useEffect(() => {
    try {
      if (RESUMABLE.has(phase)) localStorage.setItem(PROGRESS_KEY, phase)
      else localStorage.removeItem(PROGRESS_KEY)
    } catch {
      /* storage unavailable — progress just won't survive a refresh */
    }
  }, [phase])

  const restart = useCallback(() => {
    try {
      localStorage.removeItem(PROGRESS_KEY)
    } catch {
      /* ignore */
    }
    setMemoryResult({ solved: false, attempts: 0, xp: 0 })
    setLevel2Result({ xp: 0, mistakes: 0 })
    setLevel3Result({ xp: 0, distance: 0 })
    setPhase('opening')
  }, [])

  return (
    <>
      {/* Every screen except the opening carries the player card */}
      {phase !== 'opening' && <FlippablePlayerCard />}

      <Suspense fallback={<SceneLoader />}>
        <AnimatePresence mode="sync" initial={false}>
          {phase === 'opening' && (
            <BirthdayOpening
              key="opening"
              onContinue={() => setPhase('awakening')}
              onResume={resumable ? () => setPhase(resumable) : null}
              primeSong={song.play}
              preloadGameSong={gameSong.preload}
            />
          )}

          {phase === 'awakening' && (
            <GameAwakening key="awakening" onComplete={() => setPhase('mission')} gameSong={gameSong} />
          )}

          {phase === 'mission' && (
            <GameHUD key="mission-hud" xp={totalXP} gameSong={gameSong}>
              <MissionIntro onAccept={() => setPhase('transition')} />
            </GameHUD>
          )}

          {phase === 'transition' && (
            <GameHUD key="transition-hud" xp={totalXP} gameSong={gameSong}>
              <MissionTransition onComplete={() => setPhase('level1')} gameSong={gameSong} />
            </GameHUD>
          )}

          {phase === 'level1' && (
            <Level1DatePuzzle
              key="level1"
              gameSong={gameSong}
              onComplete={(result) => {
                setMemoryResult(result ?? { solved: false, attempts: 0, xp: 0 })
                setPhase('cake')
              }}
            />
          )}

          {phase === 'cake' && (
            <CakeScene
              key="cake"
              onComplete={() => {
                gameSong.play()
                setPhase('level2prep')
              }}
              song={song}
            />
          )}

          {phase === 'level2prep' && (
            <GameHUD key="level2-prep" xp={totalXP} gameSong={gameSong}>
              <MissionTransition
                levelNumber={2}
                eyebrow="LEVEL 01 COMPLETE"
                title="PREPARING LEVEL 02..."
                subtitle="ANOTHER MEMORY IS WAITING."
                preparing="MISSION 02 PREPARING..."
                gameSong={gameSong}
                onComplete={() => setPhase('level2')}
              />
            </GameHUD>
          )}

          {phase === 'level2' && (
            <Level2MoviePuzzle
              key="level2"
              startingXP={totalXP}
              gameSong={gameSong}
              onComplete={(result) => {
                setLevel2Result(result ?? { xp: 0, mistakes: 0 })
                setPhase('level2reward')
              }}
            />
          )}

          {phase === 'level2reward' && (
            <GameHUD key="level2-reward" xp={totalXP} gameSong={gameSong}>
              <div className="text-center max-w-xl">
                <p className="label-mono text-gold mb-4">REWARD SIGNAL DETECTED</p>
                <h2 className="heading-display text-3xl md:text-5xl text-bone">
                  ONE MONTH OF CINEMA
                </h2>
                <p className="font-mono text-xs text-ash mt-6 uppercase tracking-[0.2em]">
                  LEVEL 02 XP // {level2Result.xp} · TOTAL XP // {totalXP}
                </p>
                <p className="font-mono text-xs text-gold mt-3 uppercase tracking-[0.2em]">
                  THE NETFLIX REWARD IS READY.
                </p>
                <button
                  type="button"
                  onClick={() => setPhase('netflix')}
                  className="mt-8 px-8 py-3 border border-red-600/70 text-red-500 font-mono text-[10px] uppercase tracking-[0.28em] hover:bg-red-600/10 hover:border-red-500 transition-all"
                >
                  Open Netflix →
                </button>
              </div>
            </GameHUD>
          )}

          {phase === 'netflix' && (
            <NetflixReward key="netflix" gameSong={gameSong} onContinue={() => setPhase('level3')} />
          )}

          {phase === 'level3' && (
            <CarRaceGame
              key="level3"
              gameSong={gameSong}
              startingXP={totalXP}
              onComplete={(result) => {
                setLevel3Result(result ?? { xp: totalXP, distance: 0 })
                gameSong.fadeOut(3200)
                setPhase('final')
              }}
            />
          )}

          {phase === 'final' && (
            <Level3Ending
              key="final"
              xp={finalXP}
              distance={level3Result.distance}
              onContinue={() => setPhase('memories')}
            />
          )}

          {/* The letter at the end of the memory journey is the real finale.
              This scene was imported but never rendered, so it only existed
              on the /debug route. */}
          {phase === 'memories' && (
            <MemoryJourney key="memories" onFinish={() => setPhase('complete')} />
          )}

          {phase === 'complete' && (
            <main
              key="complete"
              className="flex min-h-screen flex-col items-center justify-center gap-6 bg-void px-6 text-center"
            >
              <p className="label-mono text-gold">ARCHIVE SEALED</p>
              <h1 className="heading-display text-4xl text-bone md:text-6xl">
                Happy Birthday, Tushar.
              </h1>
              <p className="max-w-md font-sans text-sm leading-relaxed text-ash">
                {finalXP.toLocaleString('en-IN')} XP · three levels · 1,561 km · one very long way
                of saying I am glad you exist.
              </p>
              <button
                type="button"
                onClick={restart}
                className="mt-2 border border-gold/40 px-7 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gold transition-all hover:border-gold hover:bg-gold/10"
              >
                Replay from the start ↻
              </button>
            </main>
          )}
        </AnimatePresence>
      </Suspense>
    </>
  )
}
