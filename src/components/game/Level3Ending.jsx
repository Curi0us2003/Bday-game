import { motion } from 'framer-motion'

// Closes the game out and hands off to the memory journey. The run stats come
// from the race, which is why "One last thing..." is a button now — the
// memory lane and the letter follow it.
export default function Level3Ending({ xp = 0, distance = 0, onContinue }) {
  const stats = [
    { label: 'DISTANCE', value: `${Math.round(distance).toLocaleString('en-IN')} M` },
    { label: 'TOTAL XP', value: Math.round(xp).toLocaleString('en-IN') },
    { label: 'LEVELS', value: '03 / 03' },
  ]

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white"
    >
      <div className="max-w-3xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#d4af6a]">
          CONTRACT COMPLETE
        </p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-7 text-5xl font-light tracking-[0.12em] md:text-7xl"
        >
          YOU WON.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.9 }}
          className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="border border-[#d4af6a]/20 bg-white/[0.02] px-2 py-3">
              <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/40">
                {s.label}
              </p>
              <p className="mt-1 font-mono text-base font-semibold text-[#d4af6a]">{s.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-10 text-xl leading-relaxed text-white/70 md:text-2xl"
        >
          The way you won my heart. ❤️
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.2 }}
          className="mt-14"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
            One last thing...
          </p>
          <button
            type="button"
            onClick={() => onContinue?.()}
            className="mt-5 border border-[#d4af6a]/50 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#d4af6a] transition-all hover:border-[#d4af6a] hover:bg-[#d4af6a]/10"
          >
            Open it →
          </button>
        </motion.div>
      </div>
    </motion.main>
  )
}
