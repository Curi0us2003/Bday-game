import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CinematicBackground from './CinematicBackground.jsx'
import { birthdayConfig } from '../../data/birthdayConfig.js'

const HOLD = { normal: 1800, highlight: 2300, heart: 900, subtitle: 1500, post: 1800 }

export default function BirthdayMessage({ onComplete, song }) {
  const { birthdayMessages, distance } = birthdayConfig

  const stages = useMemo(
  () => [
    ...birthdayMessages.map((text, i) => ({
      text,
      kind:
        i === birthdayMessages.length - 1
          ? 'highlight'
          : 'normal',
    })),

    { text: '❤️', kind: 'heart' },
  ],
  [birthdayMessages]
)

  const [index, setIndex] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (index >= stages.length || fadingOut) return

    const hold = HOLD[stages[index]?.kind] ?? 2000
    const t = setTimeout(() => {
      if (index === stages.length - 1) {
        setFadingOut(true)
      } else {
        setIndex((i) => i + 1)
      }
    }, hold)

    return () => clearTimeout(t)
  }, [index, stages, fadingOut])

  useEffect(() => {
    if (!fadingOut) return

    // Fade the birthday song only as we leave the emotional birthday scene.
    song?.fadeOut(1400)
    const t = setTimeout(() => onComplete?.(), 900)
    return () => clearTimeout(t)
  }, [fadingOut, onComplete, song])

  const current = stages[index]

  const styleFor = (kind) => {
    switch (kind) {
      case 'highlight':
        return 'heading-display text-4xl md:text-5xl text-bone'
      case 'heart':
        return 'text-2xl text-crimson-bright'
      case 'subtitle':
        return 'label-mono text-ash'
      case 'post':
        return 'font-sans text-bone whitespace-pre-line max-w-md text-sm md:text-base leading-relaxed'
      default:
        return 'heading-display text-2xl md:text-3xl text-bone'
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="relative h-screen min-h-[100svh] w-screen flex items-center justify-center px-6 text-center overflow-hidden"
    >
      <CinematicBackground />

      <AnimatePresence mode="wait">
        {current && !fadingOut && (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className={`relative z-10 ${styleFor(current.kind)}`}
          >
            {current.text}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 bg-void pointer-events-none z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: fadingOut ? 1 : 0 }}
        transition={{ duration: 1.35, ease: 'easeInOut' }}
      />
    </motion.section>
  )
}
