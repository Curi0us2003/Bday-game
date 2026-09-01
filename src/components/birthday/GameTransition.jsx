import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CinematicBackground from './CinematicBackground.jsx'

// Stands in for Layer 3 until it exists. When Layer 3 is built, this
// component's timed sequence gets replaced by the real game disclaimer —
// CakeScene and BirthdayExperience don't need to change.
const STAGES = ['SYSTEM READY', 'GAME INITIALIZING...', 'Layer 3 coming next.']

export default function GameTransition() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage >= STAGES.length - 1) return
    const t = setTimeout(() => setStage((s) => s + 1), stage === 0 ? 1400 : 1600)
    return () => clearTimeout(t)
  }, [stage])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative min-h-[calc(100vh-49px)] flex items-center justify-center"
    >
      <CinematicBackground />
      <AnimatePresence mode="wait">
        <motion.p
          key={stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="label-mono relative z-10 flex items-center gap-1"
        >
          {STAGES[stage]}
          {stage === 0 && <span className="inline-block w-2 h-3 bg-gold animate-blink ml-1" />}
        </motion.p>
      </AnimatePresence>
    </motion.section>
  )
}
