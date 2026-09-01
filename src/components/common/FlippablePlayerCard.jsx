import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import playerCardTushar from '../../assets/characters/player_card_tushar.webp'
import playerCardNormal from '../../assets/characters/player_card_normal.webp'

// Both card artworks are 1054x1492 — keep that ratio everywhere so the
// frame never crops the artwork.
const CARD_RATIO = '1054 / 1492'

// Persistent player card. Sits in the top-left corner of every screen
// after the opening; clicking it opens the full-size card, which rotates
// between the two faces (tushar front, normal back).
export default function FlippablePlayerCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  // Esc closes; reset the face so the next open always starts on front.
  useEffect(() => {
    if (!isOpen) {
      setIsFlipped(false)
      return
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <>
      {/* Corner thumbnail */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open player card"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[70] focus:outline-none"
      >
        <div
          style={{ aspectRatio: CARD_RATIO }}
          className="w-16 sm:w-20 overflow-hidden rounded-sm border border-gold/50 bg-black/60 shadow-[0_0_18px_rgba(0,0,0,0.6)] hover:border-gold transition-colors"
        >
          <img src={playerCardTushar} alt="Player card" className="h-full w-full object-cover" />
        </div>
        <span className="mt-1 block text-center font-mono text-[8px] uppercase tracking-[0.2em] text-ash">
          Player
        </span>
      </motion.button>

      {/* Full-size, rotatable card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="player-card-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black/85 p-6 backdrop-blur-md"
          >
            <motion.button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close player card"
              className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-gold/40 bg-black/60 text-lg text-gold hover:bg-gold/15 transition-colors"
              whileHover={{ scale: 1.12, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>

            {/* perspective must sit on the direct parent of the rotating element */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: '1400px', aspectRatio: CARD_RATIO }}
              className="h-[62vh] max-h-[620px]"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 70, damping: 14 }}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => setIsFlipped((f) => !f)}
                className="relative h-full w-full cursor-pointer"
              >
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 overflow-hidden rounded-lg border-2 border-gold/50 bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)]"
                >
                  <img
                    src={playerCardTushar}
                    alt="Player card — Tushar"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 overflow-hidden rounded-lg border-2 border-gold/50 bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)]"
                >
                  <img
                    src={playerCardNormal}
                    alt="Player card — reverse"
                    className="h-full w-full object-contain"
                  />
                </div>
              </motion.div>
            </div>

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped((f) => !f)
              }}
              className="border border-gold/40 bg-gold/5 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-gold hover:bg-gold/15 hover:border-gold transition-all"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {isFlipped ? 'Flip back' : 'Rotate card'} ↻
            </motion.button>

            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash/60">
              Tap the card to rotate · Esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
