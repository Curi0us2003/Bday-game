import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gameConfig } from '../../data/gameConfig.js'

export default function MissionIntro({ onAccept }) {
  const { lines, cta } = gameConfig.missionProtocol

  const [stage, setStage] = useState(0)
  const done = stage >= lines.length

  useEffect(() => {
    if (done) return

    const t = setTimeout(() => {
      setStage((s) => s + 1)
    }, 1800)

    return () => clearTimeout(t)
  }, [stage, done])

  return (
    <div className="relative flex items-center justify-center w-full max-w-2xl px-6">

      <AnimatePresence mode="wait">

        {!done ? (
          <motion.div
            key={stage}
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 1.01,
            }}
            transition={{ duration: 0.45 }}
            className="
              w-full
              border border-gold/30
              bg-black
              px-8 py-7
              text-center
              shadow-[0_0_35px_rgba(176,138,62,0.08)]
            "
          >
            <p className="
              font-mono
              text-xs md:text-sm
              uppercase
              tracking-[0.22em]
              leading-relaxed
              text-gold
              whitespace-pre-line
            ">
              {lines[stage]}
            </p>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onAccept}
            className="
              px-8 py-3
              border border-crimson/60
              text-bone
              font-mono
              text-xs
              uppercase
              tracking-widest2
              hover:border-crimson-bright
              hover:shadow-[0_0_20px_-6px_rgba(181,32,44,0.5)]
              transition-all
              duration-ui
            "
          >
            [ {cta} ]
          </motion.button>
        )}

      </AnimatePresence>
    </div>
  )
}