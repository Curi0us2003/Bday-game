import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { playSound } from '../../utils/audio.js'

export default function GiftButton({ label = 'OPEN YOUR GIFT', onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover="hover"
      onClick={() => {
        playSound('/assets/audio/click.mp3')
        onClick?.()
      }}
      className="group mt-10 px-8 py-3 border border-gold/50 text-bone font-mono text-xs uppercase tracking-widest2 hover:border-gold hover:shadow-[0_0_20px_-6px_rgba(212,175,106,0.5)] transition-all duration-ui"
    >
      <span className="flex items-center gap-2">
        {label}
        <motion.span variants={{ hover: { x: 4 } }} className="inline-flex transition-transform">
          <ArrowRight size={14} />
        </motion.span>
      </span>
    </motion.button>
  )
}
