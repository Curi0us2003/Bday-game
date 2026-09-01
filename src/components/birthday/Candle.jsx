import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Candle({ lit, height = 46 }) {
  const [smoking, setSmoking] = useState(false)

  useEffect(() => {
    if (!lit) {
      setSmoking(true)
      const t = setTimeout(() => setSmoking(false), 900)
      return () => clearTimeout(t)
    }
  }, [lit])

  return (
    <div className="relative flex flex-col items-center" style={{ width: 6 }}>
      <div className="relative h-6 flex items-end justify-center">
        <AnimatePresence>
          {lit && (
            <motion.div
              key="flame"
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.2, x: 6, transition: { duration: 0.35 } }}
              className="absolute bottom-0 w-2 h-4 rounded-full origin-bottom animate-flicker"
              style={{
                background: 'radial-gradient(circle at 50% 70%, #ffd98a, #d4af6a 55%, transparent 75%)',
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {smoking && (
            <motion.div
              key="smoke"
              initial={{ opacity: 0.5, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -18, scale: 1.4 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-ash/60"
            />
          )}
        </AnimatePresence>
      </div>

      <div
        className="w-1.5 rounded-sm bg-gradient-to-b from-bone/80 to-bone/40"
        style={{ height }}
      />
    </div>
  )
}
