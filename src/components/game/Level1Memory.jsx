import { motion } from 'framer-motion'
import { gameConfig } from '../../data/gameConfig.js'
import GameBackground from './GameBackground.jsx'
import GameMusicControl from './GameMusicControl.jsx'

export default function Level1Memory({ onContinue, gameSong }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-screen overflow-hidden bg-abyss flex items-center justify-center px-6 py-12"
    >
      <GameBackground />
      <GameMusicControl song={gameSong} />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 w-full max-w-3xl border border-gold/45 bg-black/35 px-6 py-10 text-center shadow-[0_0_45px_rgba(176,138,62,0.08)] md:px-16 md:py-14"
      >
        <p className="label-mono text-gold mb-4">MEMORY UNLOCKED</p>
        <h1 className="heading-display text-3xl text-bone md:text-5xl">
          The first memory.
        </h1>

        <div className="mx-auto my-8 h-px w-24 bg-gold/60" />

        <p className="whitespace-pre-line text-ash text-base leading-relaxed md:text-lg">
          {gameConfig.level1.memoryMessage}
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="mt-10 border border-gold/60 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold transition-all hover:border-gold hover:bg-gold/10 hover:text-bone"
        >
          Continue to the cake
        </motion.button>
      </motion.section>
    </motion.main>
  )
}
