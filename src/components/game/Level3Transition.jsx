import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GameMusicControl from './GameMusicControl.jsx'

const LINES = [
  'THE WATCHLIST HAS BEEN SEALED.',
  'THE ARCHIVE IS NO LONGER HOLDING.',
  'A SECOND REALITY IS BLEEDING THROUGH.',
  'PLAYER: TUSHAR',
  'FORM: SELECTED',
  'POWER: ARMED',
  'OBJECTIVE: SURVIVE',
]

export default function Level3Transition({ character, onComplete, gameSong }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= LINES.length - 1) return undefined
    const timer = setTimeout(() => setIndex((value) => value + 1), index === 0 ? 2400 : 1450)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-[#020204] text-bone flex items-center justify-center px-6"
    >
      <GameMusicControl song={gameSong} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,106,0.12),transparent_34%),radial-gradient(circle_at_65%_55%,rgba(123,55,170,0.18),transparent_42%)]" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'conic-gradient(from 180deg at 50% 50%, transparent, rgba(212,175,106,.12), transparent, rgba(160,70,220,.13), transparent)' }}
      />
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <motion.div
        initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: 'easeOut' }}
        className="absolute left-0 right-0 top-0 h-1 origin-center bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_25px_rgba(212,175,106,.7)]"
      />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <p className="label-mono text-gold mb-8">LEVEL 03 // REALITY BREACH</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
            transition={{ duration: 0.65 }}
          >
            <p className={`${index === 1 || index === 2 ? 'text-xl md:text-3xl text-violet-200' : 'text-sm md:text-lg text-white/75'} font-mono uppercase tracking-[0.24em]`}>
              {LINES[index]}
            </p>
            {index >= 4 && character && (
              <div className="mt-5 flex items-center justify-center gap-4">
                <div className="h-12 w-9 overflow-hidden border border-gold/40 bg-black"><img src={character.image} alt="" className="h-full w-full object-cover object-top" /></div>
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold">{character.title} // {character.powerName}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {index === LINES.length - 1 && (
          <motion.button
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
            type="button" onClick={onComplete}
            className="mt-10 border border-gold bg-gold/5 px-12 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-gold transition-all hover:bg-gold/10 hover:shadow-[0_0_40px_rgba(212,175,106,.18)]"
          >
            ENTER THE BREACH →
          </motion.button>
        )}
      </div>
    </motion.main>
  )
}
