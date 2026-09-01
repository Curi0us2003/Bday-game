import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cake from './Cake.jsx'
import MicrophoneBlow from './MicrophoneBlow.jsx'
import MusicControl from './MusicControl.jsx'
import CinematicBackground from './CinematicBackground.jsx'
import { birthdayConfig } from '../../data/birthdayConfig.js'

export default function CakeScene({ onComplete, song }) {
  const { candleCount, cakeTitle } = birthdayConfig

  const [litCandles, setLitCandles] = useState(
    Array(candleCount).fill(true)
  )

  const [allOut, setAllOut] = useState(false)
  const [showBirthdayMessage, setShowBirthdayMessage] = useState(false)
  const [showContinue, setShowContinue] = useState(false)

  // Prevent duplicate scene transitions
  const completedRef = useRef(false)

  // Always keep the newest callback
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const litCount = litCandles.filter(Boolean).length

  /*
   * EXTINQUISH CANDLES
   *
   * When the microphone detects the blow, candles go out
   * one after another instead of disappearing instantly.
   */
  const extinguishAll = useCallback(() => {
    setLitCandles((prev) => {
      const indexes = prev
        .map((value, index) => (value ? index : -1))
        .filter((index) => index !== -1)

      indexes.forEach((index, order) => {
        setTimeout(() => {
          setLitCandles((current) => {
            const next = [...current]

            if (index < next.length) {
              next[index] = false
            }

            return next
          })
        }, order * 180)
      })

      return prev
    })
  }, [])

  /*
   * WHEN ALL CANDLES ARE OUT
   *
   * IMPORTANT:
   * We DON'T immediately leave the cake scene.
   *
   * We first:
   * 1. Show the candle-out celebration
   * 2. Show birthday message
   * 3. Show continue button
   * 4. Only then move to the game
   */
  // STEP 1 — Detect that all candles are out
  useEffect(() => {
    if (litCount === 0 && !allOut) {
      setAllOut(true)
    }
  }, [litCount, allOut])


  // STEP 2 — Once all candles are out,
  // start the birthday-message sequence
  useEffect(() => {
    if (!allOut) return

    const messageTimer = setTimeout(() => {
      setShowBirthdayMessage(true)
    }, 1200)

    const continueTimer = setTimeout(() => {
      setShowContinue(true)
    }, 5000)

    return () => {
      clearTimeout(messageTimer)
      clearTimeout(continueTimer)
    }
  }, [allOut])

  /*
   * MOVE TO NEXT SCENE
   *
   * This is deliberately kept in ONE function so both:
   * - Continue button
   * - automatic fallback
   *
   * use exactly the same transition logic.
   */
  const goToNextScene = useCallback(() => {
    if (completedRef.current) return

    completedRef.current = true

    console.log('🎂 Birthday scene complete → moving to next scene')

    if (typeof onCompleteRef.current === 'function') {
      onCompleteRef.current()
    } else {
      console.error(
        'CakeScene: onComplete callback is missing!'
      )
    }
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="
        relative
        h-screen
        min-h-[100svh]
        w-screen
        overflow-hidden
        flex
        flex-col
        items-center
        justify-center
        px-6
        text-center
      "
    >
      {/* CINEMATIC BACKGROUND */}
      <CinematicBackground />

      {/* DARKENING EFFECT AFTER BLOW */}
      <motion.div
        className="
          absolute
          inset-0
          bg-void
          pointer-events-none
        "
        animate={{
          opacity: allOut ? 0.18 : 0,
        }}
        transition={{
          duration: 1.2,
        }}
      />

      {/* WARM AMBER BURST */}
      <motion.div
        className="
          absolute
          w-[22rem]
          h-[22rem]
          rounded-full
          bg-amber/20
          blur-3xl
          pointer-events-none
        "
        animate={{
          opacity: allOut
            ? [0, 0.8, 0.35]
            : 0,

          scale: allOut
            ? [0.75, 1.2, 1]
            : 0.8,
        }}
        transition={{
          duration: 1.8,
          times: [0, 0.45, 1],
        }}
      />

      {/* FLOATING PARTICLES */}
      {allOut && <Motes />}

      <motion.div
        animate={{
          y: allOut ? -20 : 0,
          scale: allOut ? 1.02 : 1,
        }}
        transition={{
          duration: 1.2,
          ease: 'easeOut',
        }}
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          w-full
          max-w-3xl
        "
      >

        {/* -------------------------------- */}
        {/* BEFORE BLOW */}
        {/* -------------------------------- */}

        <AnimatePresence mode="wait">

          {!allOut && (
            <motion.div
              key="before-blow"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.7,
              }}
              className="flex flex-col items-center"
            >

              <p className="label-mono mb-2">
                BEFORE THE GAME BEGINS...
              </p>

              <h2 className="
                heading-display
                text-3xl
                md:text-5xl
                mb-10
              ">
                {cakeTitle}
              </h2>

              <Cake
                candleCount={candleCount}
                litCandles={litCandles}
                extinguished={false}
              />

              {/* MUSIC */}
              <MusicControl song={song} />

              {/* MICROPHONE */}
              <MicrophoneBlow
                active={true}
                onBlow={extinguishAll}
                onFallbackBlow={extinguishAll}
              />

            </motion.div>
          )}

          {/* -------------------------------- */}
          {/* AFTER BLOW */}
          {/* -------------------------------- */}

          {allOut && (
            <motion.div
              key="after-blow"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
              }}
              className="
                flex
                flex-col
                items-center
                w-full
              "
            >

              <p className="
                label-mono
                text-gold
                mb-5
              ">
                WISH MADE.
              </p>

              <Cake
                candleCount={candleCount}
                litCandles={litCandles}
                extinguished={true}
              />

              {/* -------------------------------- */}
              {/* BIRTHDAY MESSAGE */}
              {/* -------------------------------- */}

              <AnimatePresence>
                {showBirthdayMessage && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    className="
                      mt-8
                      max-w-2xl
                      px-6
                    "
                  >

                    <motion.h2
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0.2,
                        duration: 0.8,
                      }}
                      className="
                        heading-display
                        text-3xl
                        md:text-5xl
                        text-bone
                        mb-5
                      "
                    >
                      Many, many happy returns
                      of the day, Tushar.
                    </motion.h2>

                    <motion.p
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        delay: 0.7,
                        duration: 0.8,
                      }}
                      className="
                        text-ash
                        text-base
                        md:text-lg
                        leading-relaxed
                      "
                    >
                      I hope all your wishes come true,
                      you get everything you work so hard for,
                      and this year gives you a hundred reasons
                      to smile.
                    </motion.p>

                    <motion.p
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 1.1,
                        duration: 0.8,
                      }}
                      className="
                        mt-4
                        text-gold
                        text-lg
                        md:text-xl
                      "
                    >
                      Happy 25th birthday, cutie. ❤️
                    </motion.p>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* -------------------------------- */}
              {/* CONTINUE */}
              {/* -------------------------------- */}

              <AnimatePresence>
                {showContinue && (
                  <motion.button
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.6,
                    }}
                    onClick={goToNextScene}
                    className="
                      mt-8
                      border
                      border-gold/40
                      px-8
                      py-3
                      text-[10px]
                      font-mono
                      uppercase
                      tracking-[0.3em]
                      text-ash
                      hover:text-bone
                      hover:border-gold
                      hover:bg-gold/5
                      transition-all
                      duration-300
                    "
                  >
                    Enter the archive →
                  </motion.button>
                )}
              </AnimatePresence>

            </motion.div>
          )}

        </AnimatePresence>

      </motion.div>
    </motion.section>
  )
}


/* ========================================= */
/* FLOATING GOLD PARTICLES */
/* ========================================= */

function Motes() {
  return (
    <div className="
      absolute
      inset-0
      pointer-events-none
      overflow-hidden
    ">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          className="
            absolute
            w-1
            h-1
            rounded-full
            bg-gold/70
          "
          style={{
            left: `${10 + ((i * 37) % 80)}%`,
            top: `${24 + ((i * 53) % 58)}%`,
          }}
          initial={{
            opacity: 0,
            y: 10,
            scale: 0.6,
          }}
          animate={{
            opacity: [0, 0.9, 0],
            y: -50 - (i % 4) * 12,
            scale: [0.6, 1, 0.4],
          }}
          transition={{
            duration: 2.2,
            delay: i * 0.06,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}