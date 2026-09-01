import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { birthdayConfig } from '../../data/birthdayConfig.js'

export default function PlayerProfile({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 2200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-2"
    >
      <p className="label-mono text-gold">PLAYER CONFIRMED</p>
      <p className="heading-display text-3xl">{birthdayConfig.name.toUpperCase()}</p>
    </motion.div>
  )
}
