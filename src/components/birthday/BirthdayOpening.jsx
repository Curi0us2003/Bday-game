import { useEffect } from 'react'
import { motion } from 'framer-motion'
import CinematicBackground from './CinematicBackground.jsx'
import DistanceJourney from './DistanceJourney.jsx'
import GiftButton from './GiftButton.jsx'
import { birthdayConfig } from '../../data/birthdayConfig.js'

// primeSong is called synchronously inside the gift-button click, before
// onContinue changes the phase — see useBirthdaySong.js for why that
// matters for autoplay.
//
// Polish 01/02: true fullscreen landing — fixed viewport height, no
// scroll, no arbitrary top margins. Everything is one centered flex
// composition so it fits inside a single viewport at common desktop
// and mobile sizes.
export default function BirthdayOpening({ onContinue, onResume, primeSong, preloadGameSong }) {
  const { name, roadKm, from, to, openingLine, openingLine2, openingKicker, openingPrompt } = birthdayConfig

  useEffect(() => {
    preloadGameSong?.()
  }, [preloadGameSong])

  return (
    <motion.section
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.9 }}
      className="relative h-[100svh] min-h-0 w-screen overflow-hidden flex flex-col items-center justify-start gap-2 md:gap-3 px-5 pt-[4.5vh] pb-3 text-center"
    >
      <CinematicBackground />

      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.1em' }}
        animate={{ opacity: 1, letterSpacing: '0.25em' }}
        transition={{ duration: 1, delay: 0.2 }}
        className="label-mono relative z-10 text-gold"
      >
        {openingKicker}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="heading-display text-3xl sm:text-4xl md:text-6xl tracking-wide relative z-10 mt-0 shrink-0"
      >
        Happy Birthday {name}!! <span className="text-crimson-bright">&lt;3</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="label-mono relative z-10"
      >
        a small gift from
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative z-10 w-full max-w-[680px] shrink-0"
      >
        <DistanceJourney from={from} to={to} roadKm={roadKm} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 5.4 }}
        className="relative z-10 max-w-sm shrink-0"
      >
        <p className="text-ash font-sans text-sm md:text-base">{openingLine}</p>
        <p className="text-bone font-sans text-sm md:text-base mt-1">{openingLine2}</p>
        <p className="mt-3 text-xs leading-5 text-ash/70">{openingPrompt}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 6.0 }}
        className="relative z-10 shrink-0"
      >
        <GiftButton
          onClick={() => {
            primeSong?.()
            onContinue?.()
          }}
        />

        {onResume && (
          <button
            type="button"
            onClick={() => {
              primeSong?.()
              onResume()
            }}
            className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ash/70 underline decoration-gold/30 underline-offset-4 transition-colors hover:text-gold"
          >
            or continue where you left off
          </button>
        )}
      </motion.div>
    </motion.section>
  )
}
