import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GameBackground from './GameBackground.jsx'
import { birthdayConfig } from '../../data/birthdayConfig.js'
import { gameConfig } from '../../data/gameConfig.js'
import GameMusicControl from './GameMusicControl.jsx'

const HOLD_MS = 2500

export default function GameAwakening({ onComplete, gameSong }) {
  const lines = [
    gameConfig.awakening.systemLine,
    gameConfig.awakening.archiveLine,
    gameConfig.awakening.playerDetectedLine,
    gameConfig.awakening.playerLabel,
    birthdayConfig.name.toUpperCase(),
    gameConfig.awakening.profileLoadedLine,
    gameConfig.awakening.missionAvailableLine,
  ]

  const [stage, setStage] = useState(-1) // -1 = seal mark only, no text yet

  useEffect(() => {
    const t = setTimeout(() => setStage(0), 1000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (stage < 0) return
    if (stage >= lines.length - 1) {
      const t = setTimeout(() => onComplete?.(), HOLD_MS + 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStage((s) => s + 1), HOLD_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center overflow-hidden"
    >
      <GameBackground />
      <GameMusicControl song={gameSong} />

      <SealMark />

      <AnimatePresence mode="wait">
        {stage >= 0 && (
          <motion.p
            key={stage}
            initial={{ opacity: 0, x: -2 }}
            animate={{ opacity: [1, 0.7, 1], x: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="label-mono relative z-10 text-ash"
          >
            {lines[stage]}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

// Original abstract geometric seal — not based on any real emblem,
// crest, or copyrighted mark. Evokes "ancient system" without copying
// any specific cultural or franchise symbol.
function SealMark() {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
      animate={{ opacity: 0.85, scale: 1, rotate: 0 }}
      transition={{ duration: 1.2 }}
      viewBox="0 0 80 80"
      className="w-14 h-14 relative z-10"
      fill="none"
    >
      <circle cx="40" cy="40" r="36" stroke="#b08a3e" strokeWidth="1" opacity="0.7" />
      <circle cx="40" cy="40" r="26" stroke="#8c1f28" strokeWidth="0.75" opacity="0.6" />
      <path d="M40 16 L40 64 M16 40 L64 40" stroke="#b08a3e" strokeWidth="0.5" opacity="0.5" />
      <path d="M24 24 L56 56 M56 24 L24 56" stroke="#b08a3e" strokeWidth="0.4" opacity="0.35" />
    </motion.svg>
  )
}
