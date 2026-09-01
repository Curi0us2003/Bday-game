import { motion } from 'framer-motion'

export default function XPGainAnimation({ amount, total, onDone, duration = 4.2 }) {
  if (!amount) return null

  return (
    <motion.div
      key={`${amount}-${total}`}
      initial={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
        scale: 0.65,
        opacity: 0,
      }}
      animate={{
        left: ['50%', '50%', 'calc(100% - 28px)'],
        top: ['50%', '50%', 'calc(100% - 28px)'],
        x: ['-50%', '-50%', '-100%'],
        y: ['-50%', '-50%', '-100%'],
        scale: [0.65, 1.15, 0.8],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        times: [0, 0.48, 1],
        ease: 'easeInOut',
      }}
      onAnimationComplete={onDone}
      className="z-[100] pointer-events-none whitespace-nowrap font-mono text-sm md:text-base text-green-400 drop-shadow-[0_0_14px_rgba(74,222,128,0.55)]"
    >
      +{amount} XP
    </motion.div>
  )
}
