import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gameConfig } from '../../data/gameConfig.js'
import GameMusicControl from './GameMusicControl.jsx'

const STAGES = ['level', 'door', 'preparing']

export default function MissionTransition({
  onComplete,
  levelNumber = 1,
  eyebrow,
  title,
  subtitle,
  preparing,
  gameSong,
}) {
  const levelConfig = levelNumber === 1 ? gameConfig.level1 : gameConfig.level2
  const resolvedEyebrow = eyebrow || `LEVEL ${String(levelNumber).padStart(2, '0')} COMPLETE`
  const resolvedTitle = title || (levelNumber === 1 ? levelConfig.levelTitle : levelConfig.title)
  const resolvedSubtitle = subtitle || 'ANOTHER MEMORY IS WAITING.'
  const resolvedPreparing = preparing || `MISSION ${String(levelNumber).padStart(2, '0')} PREPARING...`
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) {
      const timer = setTimeout(() => onComplete?.(), 3200)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setStageIndex((current) => current + 1), 3600)
    return () => clearTimeout(timer)
  }, [stageIndex, onComplete])

  const stage = STAGES[stageIndex]

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <GameMusicControl song={gameSong} />
      <AnimatePresence mode="wait">
        {stage === 'level' && (
          <motion.div
            key="level"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
          >
            <p className="label-mono text-gold">{resolvedEyebrow}</p>
            <p className="heading-display text-3xl mt-2">{resolvedTitle}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash mt-3">
              {resolvedSubtitle}
            </p>
          </motion.div>
        )}

        {stage === 'door' && (
          <motion.div
            key="door"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 1 }}
          >
            <DoorSilhouette />
          </motion.div>
        )}

        {stage === 'preparing' && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="label-mono text-gold">{resolvedPreparing}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-ash mt-2">
              Archive connection stable.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DoorSilhouette() {
  return (
    <svg viewBox="0 0 60 90" className="w-16 h-24" fill="none" aria-hidden="true">
      <path d="M4 90 V20 Q4 4 30 4 Q56 4 56 20 V90" stroke="#b08a3e" strokeWidth="1" opacity="0.6" />
      <rect x="4" y="88" width="52" height="2" fill="#b08a3e" opacity="0.3" />
    </svg>
  )
}
