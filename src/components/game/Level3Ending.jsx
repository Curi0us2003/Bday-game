import { motion } from 'framer-motion'

export default function Level3Ending() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6"
    >
      <div className="max-w-3xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#d4af6a]">
          CONTRACT COMPLETE
        </p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-7 text-5xl md:text-7xl font-light tracking-[0.12em]"
        >
          YOU WON.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-8 text-xl md:text-2xl text-white/70 leading-relaxed"
        >
          The game, at least.
          <br />
          Somehow, you also won my heart. ❤️
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.2 }}
          className="mt-16 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35"
        >
          One last thing...
        </motion.p>
      </div>
    </motion.main>
  )
}
