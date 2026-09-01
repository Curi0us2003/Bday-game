import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GameBackground from './GameBackground.jsx'
import { gameConfig } from '../../data/gameConfig.js'
import GameMusicControl from './GameMusicControl.jsx'

const ANSWER = '290725'
const MAX_ATTEMPTS = 4

const XP_BY_ATTEMPT = {
  1: 500,
  2: 400,
  3: 300,
  4: 200,
}

export default function Level1DatePuzzle({ onComplete, gameSong }) {
  const [digits, setDigits] = useState([])
  const [results, setResults] = useState(Array(6).fill(null))
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [locked, setLocked] = useState(false)
  const [shake, setShake] = useState(false)

  const clues = gameConfig.level1.clues

  const handleDigit = (digit) => {
    if (locked || digits.length >= 6) return

    setDigits((prev) => [...prev, digit])
    setResults(Array(6).fill(null))
    setMessage('')
  }

  const checkAnswer = () => {
    if (digits.length !== 6 || locked) return

    const value = digits.join('')
    const currentAttempt = attempts + 1
    setAttempts(currentAttempt)

    // Correct answer: don't show the memory here. Move to a dedicated page.
    if (value === ANSWER) {
      setResults(Array(6).fill('correct'))
      setLocked(true)

      const timer = setTimeout(() => {
        onComplete?.({
          solved: true,
          attempts: currentAttempt,
          xp: XP_BY_ATTEMPT[currentAttempt] ?? 200,
        })
      }, 1000)

      return () => clearTimeout(timer)
    }

    // Wrong answer: only now reveal which digits were correct.
    const checkedResults = digits.map((digit, index) =>
      digit === ANSWER[index] ? 'correct' : 'wrong'
    )

    setResults(checkedResults)
    setShake(true)
    setTimeout(() => setShake(false), 500)

    // Fourth failed attempt: reveal the answer, then move to the memory page.
    if (currentAttempt >= MAX_ATTEMPTS) {
      setLocked(true)
      setMessage(
        `The answer was ${ANSWER.slice(0, 2)} ${ANSWER.slice(2, 4)} ${ANSWER.slice(4, 6)}.`
      )

      setTimeout(() => {
        onComplete?.({
          solved: false,
          attempts: currentAttempt,
          xp: XP_BY_ATTEMPT[currentAttempt] ?? 200,
        })
      }, 2400)
      return
    }

    const clueIndex = currentAttempt - 1
    setMessage(clues[clueIndex])
  }

  const removeLast = () => {
    if (locked || digits.length === 0) return

    setDigits((prev) => prev.slice(0, -1))
    setResults(Array(6).fill(null))
    setMessage('')
  }

  const clearAll = () => {
    if (locked) return

    setDigits([])
    setResults(Array(6).fill(null))
    setMessage('')
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-screen overflow-hidden bg-abyss flex items-center justify-center px-6 py-10"
    >
      <GameBackground />
      <GameMusicControl song={gameSong} />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="label-mono text-gold mb-3"
        >
          {gameConfig.level1.levelLabel}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="heading-display text-3xl md:text-5xl text-bone mb-3"
        >
          {gameConfig.level1.levelTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-xs md:text-sm tracking-widest text-ash uppercase mb-10"
        >
          {gameConfig.level1.instruction}
        </motion.p>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-3 md:gap-5 mb-6"
        >
          {Array.from({ length: 6 }).map((_, index) => {
            const digit = digits[index]
            const result = results[index]

            return (
              <motion.div
                key={index}
                animate={result === 'correct' ? { scale: [1, 1.12, 1] } : {}}
                className={`
                  w-10 h-14 md:w-14 md:h-16
                  border
                  flex items-center justify-center
                  font-mono text-xl md:text-2xl
                  transition-all duration-300
                  ${
                    result === 'correct'
                      ? 'border-green-400 text-green-400 bg-green-400/10 shadow-[0_0_18px_rgba(74,222,128,0.25)]'
                      : result === 'wrong'
                        ? 'border-crimson-bright text-crimson-bright bg-crimson/10'
                        : 'border-gold/30 text-bone bg-black/30'
                  }
                `}
              >
                {digit || '_'}
              </motion.div>
            )
          })}
        </motion.div>

        <div className="min-h-[4rem] flex items-center justify-center mb-5 px-4">
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="font-mono text-xs md:text-sm tracking-wide text-gold"
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-3 w-[230px] md:w-[270px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Key
              key={number}
              value={number}
              onClick={() => handleDigit(String(number))}
              disabled={locked || digits.length >= 6}
            />
          ))}

          <div />

          <Key
            value={0}
            onClick={() => handleDigit('0')}
            disabled={locked || digits.length >= 6}
          />

          <button
            onClick={removeLast}
            disabled={locked || digits.length === 0}
            className="h-14 border border-gold/20 text-ash font-mono text-xs hover:border-gold/50 hover:text-bone transition-all disabled:opacity-20"
          >
            ←
          </button>
        </div>

        <motion.button
          whileHover={digits.length === 6 && !locked ? { scale: 1.03 } : {}}
          whileTap={digits.length === 6 && !locked ? { scale: 0.97 } : {}}
          onClick={checkAnswer}
          disabled={digits.length !== 6 || locked}
          className="
            mt-6
            px-7 py-2.5
            border border-gold/40
            text-gold
            font-mono text-[10px]
            uppercase
            tracking-[0.3em]
            hover:border-gold
            hover:bg-gold/5
            transition-all
            disabled:opacity-20
          "
        >
          Unlock Memory
        </motion.button>

        <button
          onClick={clearAll}
          disabled={locked || digits.length === 0}
          className="
            mt-4
            font-mono
            text-[10px]
            uppercase
            tracking-[0.3em]
            text-ash
            hover:text-bone
            transition-colors
            disabled:opacity-20
          "
        >
          Clear
        </button>

        {attempts > 0 && !locked && (
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.25em] text-ash/60">
            Attempt {attempts} / {MAX_ATTEMPTS}
          </p>
        )}
      </div>
    </motion.section>
  )
}

function Key({ value, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="
        h-14 md:h-16
        border border-gold/25
        bg-black/30
        text-bone
        font-mono text-lg
        hover:border-gold/70
        hover:bg-gold/5
        transition-all
        disabled:opacity-20
      "
    >
      {value}
    </motion.button>
  )
}
