import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GameBackground from './GameBackground.jsx'
import { gameConfig } from '../../data/gameConfig.js'
import XPGainAnimation from './XPGainAnimation.jsx'
import GameMusicControl from './GameMusicControl.jsx'

const ROWS = 16
const COLS = 12

const XP_PER_ENTRY = 50

export default function Level2MoviePuzzle({ onComplete, startingXP = 0, gameSong }) {
  const entries = gameConfig.level2.entries
  const [selectedId, setSelectedId] = useState(entries[0].id)
  const [values, setValues] = useState({})
  const [status, setStatus] = useState({})
  const [mistakes, setMistakes] = useState(0)
  const [solved, setSolved] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('neutral')
  const [completed, setCompleted] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [xpGain, setXpGain] = useState(null)

  const selected = entries.find((entry) => entry.id === selectedId) || entries[0]
  const selectedValue = values[selected.id] || ''

  const grid = useMemo(() => {
    const cells = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => null)
    )

    entries.forEach((entry) => {
      const dr = entry.direction === 'down' ? 1 : 0
      const dc = entry.direction === 'across' ? 1 : 0

      ;[...entry.answer].forEach((letter, index) => {
        const row = entry.row + dr * index
        const col = entry.col + dc * index

        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return

        cells[row][col] = {
          ...(cells[row][col] || {}),
          letter,
          entries: [...(cells[row][col]?.entries || []), entry.id],
        }
      })
    })

    return cells
  }, [entries])

  const numbers = useMemo(() => {
    const result = {}
    let number = 1

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const startsHere = entries.some(
          (entry) => entry.row === row && entry.col === col
        )

        if (startsHere) {
          result[`${row}-${col}`] = number
          number += 1
        }
      }
    }

    return result
  }, [entries])

  const totalSolved = solved.length
  const progress = Math.round((totalSolved / entries.length) * 100)
  const currentXP = startingXP + earnedXP

  const chooseEntry = (id) => {
    const entry = entries.find((item) => item.id === id)
    const alreadySolved = solved.includes(id)

    setSelectedId(id)

    if (alreadySolved && entry) {
      setMessage(entry.success)
      setMessageType('correct')
    } else {
      setMessage('')
      setMessageType('neutral')
    }
  }

  const addLetter = (letter) => {
    if (completed || solved.includes(selected.id)) return

    const answer = selected.answer
    const current = values[selected.id] || ''

    if (current.length >= answer.length) return

    setValues((prev) => ({
      ...prev,
      [selected.id]: `${current}${letter}`,
    }))

    setStatus((prev) => ({
      ...prev,
      [selected.id]: Array(answer.length).fill(null),
    }))

    setMessage('')
  }

  const removeLetter = () => {
    if (completed || solved.includes(selected.id)) return

    const current = values[selected.id] || ''

    setValues((prev) => ({
      ...prev,
      [selected.id]: current.slice(0, -1),
    }))

    setStatus((prev) => ({
      ...prev,
      [selected.id]: Array(selected.answer.length).fill(null),
    }))

    setMessage('')
  }

  const clearSelected = () => {
    if (completed || solved.includes(selected.id)) return

    setValues((prev) => ({
      ...prev,
      [selected.id]: '',
    }))

    setStatus((prev) => ({
      ...prev,
      [selected.id]: Array(selected.answer.length).fill(null),
    }))

    setMessage('')
  }

  const checkSelected = () => {
    if (completed || solved.includes(selected.id)) return

    const current = values[selected.id] || ''

    if (current.length !== selected.answer.length) {
      setMessage(`Complete all ${selected.answer.length} letters first.`)
      setMessageType('neutral')
      return
    }

    const result = [...selected.answer].map((letter, index) =>
      current[index].toUpperCase() === letter.toUpperCase() ? 'correct' : 'wrong'
    )

    const isCorrect = result.every((item) => item === 'correct')

    setStatus((prev) => ({
      ...prev,
      [selected.id]: result,
    }))

    if (isCorrect) {
      const nextSolved = [...solved, selected.id]
      const nextEarnedXP = earnedXP + XP_PER_ENTRY

      setSolved(nextSolved)
      setEarnedXP(nextEarnedXP)
      setXpGain({ id: `${selected.id}-${Date.now()}`, amount: XP_PER_ENTRY, total: startingXP + nextEarnedXP })
      setMessage(selected.success)
      setMessageType('correct')

      if (nextSolved.length === entries.length) {
        setTimeout(() => setCompleted(true), 900)
      }
    } else {
      setMistakes((prev) => prev + 1)
      setMessage(selected.wrong)
      setMessageType('wrong')
    }
  }

  if (completed) {
    return (
      <CompletionScreen
        xp={earnedXP}
        totalXP={currentXP}
        mistakes={mistakes}
        onContinue={() => onComplete?.({ xp: earnedXP, mistakes })}
      />
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-screen overflow-hidden bg-abyss px-4 py-8 md:px-8"
    >
      <GameBackground />
      <GameMusicControl song={gameSong} />

      {/* Yokai atmosphere: intentionally visible, but kept behind the puzzle so it never competes with the clues. */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, rotate: -8, scale: 0.92 }}
          animate={{ opacity: [0.08, 0.15, 0.08], rotate: [-8, -2, -8], scale: [0.92, 1, 0.92] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-10 top-24 text-[10rem] md:text-[14rem] font-serif leading-none text-crimson-bright"
        >
          妖
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: 4 }}
          animate={{ opacity: [0.06, 0.13, 0.06], rotate: [4, 8, 4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute -right-5 bottom-28 text-[11rem] md:text-[15rem] font-serif leading-none text-gold"
        >
          鬼
        </motion.div>

        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-44 h-44 rounded-full border border-gold/10" />
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-32 h-32 rounded-full border border-crimson/10 rotate-45" />

        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 0.45, 0], y: [-10, -70], x: [0, i % 2 ? 18 : -18] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            className="absolute bottom-[18%] h-1 w-1 rounded-full bg-gold"
            style={{ left: `${22 + i * 13}%` }}
          />
        ))}
      </div>

      {xpGain && (
        <XPGainAnimation
          key={xpGain.id}
          amount={xpGain.amount}
          total={xpGain.total}
          onDone={() => setXpGain(null)}
          duration={4.2}
        />
      )}

      <div className="absolute bottom-6 right-6 z-30 text-right">
        <p className="label-mono text-ash">XP</p>
        <p className="font-mono text-sm text-green-400">{String(currentXP).padStart(3, '0')}</p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="text-center mb-7">
          <p className="label-mono text-gold mb-2">LEVEL 02 // THE YOKAI ARCHIVE</p>
          <h1 className="heading-display text-3xl md:text-5xl text-bone">
            THE YOKAI ARCHIVE
          </h1>
          <p className="font-mono text-[10px] md:text-xs tracking-[0.28em] text-ash uppercase mt-3">
            Recover the titles. Recover the names.
          </p>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* Crossword */}
          <div className="border border-gold/25 bg-black/55 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
              <span>ARCHIVE GRID</span>
              <span>{totalSolved}/{entries.length} CLEARED</span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className="mx-auto grid w-max"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(28px, 42px))`,
                  gridTemplateRows: `repeat(${ROWS}, minmax(28px, 42px))`,
                }}
              >
                {grid.flatMap((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`
                    const number = numbers[key]

                    if (!cell) {
                      return (
                        <div
                          key={key}
                          className="bg-transparent"
                        />
                      )
                    }

                    const solvedEntryId = cell.entries.find((id) => solved.includes(id))
                    const selectedEntryId = cell.entries.find((id) => id === selected.id)
                    const displayEntryId = solvedEntryId || selectedEntryId || cell.entries[0]
                    const entry = entries.find((item) => item.id === displayEntryId)
                    const entryIndex = entry ? getCellIndex(entry, rowIndex, colIndex) : -1
                    const entryValue = entry ? values[entry.id] || '' : ''
                    const cellStatus = entry && status[entry.id]?.[entryIndex]
                    const solvedCell = Boolean(solvedEntryId)
                    const activeCell = Boolean(selectedEntryId)
                    const displayLetter = solvedEntryId
                      ? entries.find((item) => item.id === solvedEntryId)?.answer?.[entryIndex] || ''
                      : entryValue[entryIndex] || ''

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const firstEntry = cell.entries.find((id) => !solved.includes(id)) || cell.entries[0]
                          if (firstEntry) chooseEntry(firstEntry)
                        }}
                        className={`relative border text-center font-mono text-sm md:text-base transition-all ${
                          activeCell
                            ? 'border-gold bg-gold/10'
                            : 'border-gold/20 bg-black/70'
                        } ${
                          solvedCell
                            ? 'text-green-400 border-green-400/70 bg-green-400/10'
                            : cellStatus === 'correct'
                              ? 'text-green-400'
                              : cellStatus === 'wrong'
                                ? 'text-crimson-bright bg-crimson/10 border-crimson-bright/70'
                                : 'text-bone'
                        }`}
                      >
                        {number && (
                          <span className="absolute left-1 top-0.5 text-[6px] md:text-[7px] text-gold/80">
                            {number}
                          </span>
                        )}
                        {displayLetter}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gold/15" />
              <span className="font-mono text-[8px] tracking-[0.3em] text-gold/70">
                YOKAI ARCHIVE
              </span>
              <div className="h-px flex-1 bg-gold/15" />
            </div>

            <div className="mt-4 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-ash">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="mt-2 h-1 bg-gold/10">
              <motion.div
                className="h-full bg-gold"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Clues + input */}
          <aside className="border border-gold/25 bg-black/55 p-5">
            <p className="label-mono text-gold mb-4">YOKAI CLUES</p>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {entries.map((entry, index) => {
                const isSelected = entry.id === selected.id
                const isSolved = solved.includes(entry.id)

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => chooseEntry(entry.id)}
                    className={`w-full text-left p-3 border transition-all ${
                      isSelected
                        ? 'border-gold/70 bg-gold/10'
                        : 'border-gold/10 bg-black/30 hover:border-gold/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] text-gold">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-ash">
                        {entry.category}
                      </span>
                      {isSolved && (
                        <span className="ml-auto text-green-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] leading-4 text-bone/80">
                      {entry.clue}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 border-t border-gold/15 pt-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash mb-2">
                SELECTED // {selected.category}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {Array.from({ length: selected.answer.length }).map((_, index) => {
                  const letter = selectedValue[index]
                  const cellStatus = status[selected.id]?.[index]

                  return (
                    <div
                      key={index}
                      className={`w-7 h-9 border flex items-center justify-center font-mono text-sm ${
                        cellStatus === 'correct'
                          ? 'border-green-400/70 text-green-400 bg-green-400/10'
                          : cellStatus === 'wrong'
                            ? 'border-crimson-bright/70 text-crimson-bright bg-crimson/10'
                            : 'border-gold/30 text-bone bg-black/50'
                      }`}
                    >
                      {letter || ''}
                    </div>
                  )
                })}
              </div>

              {solved.includes(selected.id) && selected.memoryLine && (
                <motion.div
                  key={`${selected.id}-memory`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 mb-4 px-3 py-2 border border-green-400/15 bg-green-400/[0.03] font-mono text-[9px] leading-4 text-green-300/80"
                >
                  {selected.memoryLine}
                </motion.div>
              )}

              <div className="mb-3 flex justify-end">
                <div className="group relative">
                  <button
                    type="button"
                    aria-label="Why there is a digital keyboard"
                    className="grid h-6 w-6 place-items-center rounded-full border border-gold/30 text-gold/80 font-mono text-[9px] hover:border-gold hover:text-gold transition-colors"
                  >
                    ?
                  </button>
                  <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-56 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 transition-all duration-200">
                    <div className="border border-gold/30 bg-black/95 px-3 py-2 text-center font-mono text-[8px] uppercase tracking-[0.12em] leading-4 text-gold shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                      cause i know you don't like typing hehe ♡
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => addLetter(letter)}
                    disabled={solved.includes(selected.id)}
                    className="h-8 border border-gold/15 bg-black/40 text-ash font-mono text-[10px] hover:border-gold/60 hover:text-gold transition-all disabled:opacity-20"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={removeLetter}
                  disabled={!selectedValue || solved.includes(selected.id)}
                  className="py-2 border border-gold/15 text-ash font-mono text-[9px] uppercase tracking-[0.2em] hover:border-gold/40 hover:text-bone disabled:opacity-20"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={clearSelected}
                  disabled={!selectedValue || solved.includes(selected.id)}
                  className="py-2 border border-gold/15 text-ash font-mono text-[9px] uppercase tracking-[0.2em] hover:border-gold/40 hover:text-bone disabled:opacity-20"
                >
                  Clear
                </button>
              </div>

              <button
                type="button"
                onClick={checkSelected}
                disabled={solved.includes(selected.id)}
                className="w-full mt-2 py-2.5 border border-gold/50 text-gold font-mono text-[9px] uppercase tracking-[0.28em] hover:bg-gold/5 hover:border-gold transition-all disabled:opacity-25"
              >
                Check Entry
              </button>

              <div className="min-h-[54px] mt-4 flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {message && (
                    <motion.p
                      key={message}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`font-mono text-[10px] leading-4 ${
                        messageType === 'correct'
                          ? 'text-green-400'
                          : messageType === 'wrong'
                            ? 'text-crimson-bright'
                            : 'text-gold'
                      }`}
                    >
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-4 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-ash/60">
              <span>YOKAI ALERT</span>
              <span>{mistakes} MISSES</span>
            </div>
          </aside>
        </div>
      </div>
    </motion.section>
  )
}

function getCellIndex(entry, row, col) {
  if (entry.direction === 'across') return col - entry.col
  return row - entry.row
}

function CompletionScreen({ xp, totalXP, mistakes, onContinue }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-screen overflow-hidden bg-abyss flex items-center justify-center px-6 py-10"
    >
      <GameBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl border border-gold/30 bg-black/70 p-8 md:p-14 text-center"
      >
        <p className="label-mono text-gold mb-4">LEVEL 02 // ARCHIVE RESTORED</p>

        <h1 className="heading-display text-3xl md:text-5xl text-bone">
          YOKAI DEFEATED.
        </h1>

        <div className="w-20 h-px bg-gold/40 mx-auto my-7" />

        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ash">
          MOVIE MEMORY ARCHIVE CLEARED
        </p>

        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-mono text-3xl text-green-400 mt-6"
        >
          +{xp} XP
        </motion.p>

        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ash/60 mt-3">
          TOTAL XP // {totalXP}
        </p>

        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ash/60 mt-2">
          {mistakes === 0
            ? 'PERFECT MEMORY // 50 XP PER ENTRY.'
            : `${mistakes} WRONG ${mistakes === 1 ? 'GUESS' : 'GUESSES'} // KEEP GOING.`}
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="mt-9 px-8 py-3 border border-gold/50 text-gold font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-gold/5 hover:border-gold transition-all"
        >
          Continue →
        </button>
      </motion.div>
    </motion.section>
  )
}
