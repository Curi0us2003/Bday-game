import { useState } from 'react'
import { motion } from 'framer-motion'

// Abstract distance visual — deliberately not a map. A point travels a
// thin gold line from `from` to `to`, then the distance fades in.
export default function DistanceReveal({ from, to, distance }) {
  const [showDistance, setShowDistance] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="flex items-center justify-between label-mono mb-3">
        <span>{from.toUpperCase()}</span>
        <span>{to.toUpperCase()}</span>
      </div>

      <div className="relative h-px bg-line">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
          onAnimationComplete={() => setShowDistance(true)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(212,175,106,0.55)]"
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={showDistance ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center heading-display text-3xl md:text-4xl mt-6 text-gold-bright tracking-wide"
      >
        {distance}
      </motion.p>
    </div>
  )
}
