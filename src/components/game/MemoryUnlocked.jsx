import { useEffect } from 'react'
import { motion } from 'framer-motion'
import XPGainAnimation from './XPGainAnimation.jsx'
import GameBackground from './GameBackground.jsx'
import { gameConfig } from '../../data/gameConfig.js'
import GameMusicControl from './GameMusicControl.jsx'

export default function MemoryUnlocked({ solved, xp = 0, onContinue, gameSong }) {
  const { memoryMessage } = gameConfig.level1

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-screen overflow-hidden bg-abyss flex items-center justify-center px-6 py-12"
    >
      <GameBackground />
      <GameMusicControl song={gameSong} />

      <div className="absolute bottom-6 right-6 z-20 text-right">
        <p className="label-mono text-ash">XP</p>
        <p className="font-mono text-sm text-green-400">{String(xp).padStart(3, '0')}</p>
      </div>

      <XPGainAnimation amount={xp} total={xp} duration={4.6} />

      <div className="relative z-10 w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="border border-gold/25 bg-black/70 px-7 py-10 md:px-12 md:py-12 shadow-[0_0_50px_rgba(176,138,62,0.08)]"
        >
          <p className="label-mono text-gold mb-4">LEVEL 01 // MEMORY ARCHIVE</p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="heading-display text-3xl md:text-5xl text-bone"
          >
            MEMORY UNLOCKED.
          </motion.h1>

          <div className="mx-auto mt-7 mb-8 h-px w-20 bg-gold/40" />

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="font-mono text-xs md:text-sm uppercase tracking-[0.18em] text-gold"
          >
            {solved
              ? 'Yayy... you guessed it right!'
              : 'Aww... that was easy. But it’s okay.'}
          </motion.p>

          {!solved && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="mt-4 font-mono text-sm text-ash tracking-widest"
            >
              29 · 07 · 25
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="mt-8 text-left font-mono text-sm md:text-base leading-7 text-ash whitespace-pre-line"
          >
            {memoryMessage}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            onClick={onContinue}
            className="mt-10 px-8 py-3 border border-gold/40 text-gold font-mono text-[10px] uppercase tracking-[0.3em] hover:border-gold hover:bg-gold/5 transition-all"
          >
            Continue to Level 02 →
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}
