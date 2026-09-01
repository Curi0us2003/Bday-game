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
export default function BirthdayOpening({ onContinue, primeSong }) {
  const { name, distance, from, to, openingLine, openingLine2 } = birthdayConfig

  return (
    <motion.section
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.9 }}
      className="relative h-[100svh] min-h-0 w-screen overflow-hidden flex flex-col items-center justify-start gap-2 md:gap-3 px-5 pt-[4.5vh] pb-3 text-center"
    >
      <CinematicBackground />

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
        className="relative z-10 w-full max-w-[640px] shrink-0"
      >
        <DistanceJourney from={from} to={to} distance={distance} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 5.4 }}
        className="relative z-10 max-w-sm shrink-0"
      >
        <p className="text-ash font-sans text-sm md:text-base">{openingLine}</p>
        <p className="text-bone font-sans text-sm md:text-base mt-1">{openingLine2}</p>
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
      </motion.div>
    </motion.section>
  )
}
