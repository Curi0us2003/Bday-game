import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import BirthdayOpening from './BirthdayOpening.jsx'
import CakeScene from './CakeScene.jsx'
import GameAwakening from '../game/GameAwakening.jsx'
import GameHUD from '../game/GameHUD.jsx'
import MissionIntro from '../game/MissionIntro.jsx'
import CharacterSelect from '../game/CharacterSelect.jsx'
import PlayerProfile from '../game/PlayerProfile.jsx'
import MissionTransition from '../game/MissionTransition.jsx'
import Level1DatePuzzle from '../game/Level1DatePuzzle.jsx'
import MemoryUnlocked from '../game/MemoryUnlocked.jsx'
import Level2MoviePuzzle from '../game/Level2MoviePuzzle.jsx'
import useBirthdaySong from '../../hooks/useBirthdaySong.js'
import NetflixReward from '../game/NetflixReward.jsx'
import Level3Transition from '../game/Level3Transition.jsx'
import Level3Game from '../game/Level3Game.jsx'
import Level3Ending from '../game/Level3Ending.jsx'
import MemoryJourney from '../game/MemoryJourney.jsx'
import { characters } from '../../data/characterData.js'
import gotTheme from '../../assets/sounds/got-theme.mp3'

// Owns the full sequence. Existing Layer 1 / game phases are intentionally
// left intact; Level 2 is added only after the existing memory screen.
export default function BirthdayExperience() {
  const [phase, setPhase] = useState('opening')
  const [memoryResult, setMemoryResult] = useState({ solved: false, attempts: 0, xp: 0 })
  const [level2Result, setLevel2Result] = useState({ xp: 0, mistakes: 0 })
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [level3Result, setLevel3Result] = useState({ xp: 0, distance: 0 })
  const totalXP = memoryResult.xp + level2Result.xp
  const selectedCharacterData = characters.find((item) => item.id === selectedCharacter) || null
  const song = useBirthdaySong('/assets/audio/happy-birthday.mp3')
  const gameSong = useBirthdaySong(gotTheme)
  const memorySong = useBirthdaySong('/assets/sounds/saibo.mp3')

  return (
    <AnimatePresence mode="sync" initial={false}>
      {phase === 'opening' && (
        <BirthdayOpening
          key="opening"
          onContinue={() => setPhase('cake')}
          primeSong={song.play}
        />
      )}

      {phase === 'cake' && (
        <CakeScene
          key="cake"
          onComplete={() => {
            gameSong.play()
            setPhase('awakening')
          }}
          song={song}
        />
      )}

      {phase === 'awakening' && (
        <GameAwakening key="awakening" onComplete={() => setPhase('mission')} gameSong={gameSong} />
      )}

      {phase === 'mission' && (
        <GameHUD key="mission-hud" xp={totalXP} gameSong={gameSong}>
          <MissionIntro onAccept={() => setPhase('character')} />
        </GameHUD>
      )}

      {phase === 'character' && (
        <GameHUD key="character-hud" xp={totalXP} gameSong={gameSong}>
          <CharacterSelect
            onSelect={(characterId) => {
              setSelectedCharacter(characterId)
              setPhase('confirmed')
            }}
          />
        </GameHUD>
      )}

      {phase === 'confirmed' && (
        <GameHUD key="profile-hud" xp={totalXP} gameSong={gameSong}>
          <PlayerProfile onComplete={() => setPhase('transition')} />
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
            setPhase('memory')
          }}
        />
      )}

      {phase === 'memory' && (
        <MemoryUnlocked
          key="memory"
          solved={memoryResult.solved}
          xp={memoryResult.xp}
          gameSong={gameSong}
          onContinue={() => setPhase('level2prep')}
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
        <NetflixReward
          key="netflix"
          gameSong={gameSong}
          onContinue={() => setPhase('level3transition')}
        />
      )}

      {phase === 'level3transition' && (
        <Level3Transition
          key="level3transition"
          character={selectedCharacterData}
          gameSong={gameSong}
          onComplete={() => setPhase('level3')}
        />
      )}

      {phase === 'level3' && (
        <Level3Game
          key="level3"
          characterId={selectedCharacter || 'detective'}
          gameSong={gameSong}
          startingXP={totalXP}
          onComplete={(result) => {
            setLevel3Result(result ?? { xp: totalXP, distance: 1200 })
            // Let the GOT theme leave gently instead of cutting off at the win.
            gameSong.fadeOut(3200)
            setPhase('level3ending')
          }}
        />
      )}

      {phase === 'level3ending' && (
        <MemoryJourney
          key="memory-journey"
          memorySong={memorySong}
          onFinish={() => {
            memorySong.fadeOut(1800)
            setPhase('final')
          }}
        />
      )}

      {phase === 'final' && (
        <Level3Ending key="final" />
      )}
    </AnimatePresence>
  )
}
