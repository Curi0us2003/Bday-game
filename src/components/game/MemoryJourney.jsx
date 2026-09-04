import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './MemoryJourney.css'
import saibo from '../../assets/sounds/saibo.mp3'

const memoryModules = import.meta.glob('../../assets/memories/*', {
  eager: true,
  import: 'default',
})

const findMemory = (name) => {
  const match = Object.entries(memoryModules).find(([path]) => path.endsWith(`/${name}`))
  return match?.[1] || null
}

const memories = [
  { file: '01.webp', eyebrow: 'THE BEGINNING', text: 'This is where it began, the familiar top right?', placeholder: 'Add an early memory' },
  { file: '02.webp', eyebrow: 'THE LITTLE THINGS', text: 'Random spots became our go to places, our spots.', placeholder: 'Add a random / funny memory' },
  { file: '03.webp', eyebrow: 'THE PLACES', text: 'You introduced me to so many places. And somehow, the places became memories because you were there.', placeholder: 'Add a place you visited together' },
  { file: '04.webp', eyebrow: 'THE FOOD', text: 'Good food tasted even better with you beside me.', placeholder: 'Add a food / restaurant photo' },
  { file: '05.webp', eyebrow: 'YOU', text: 'I have no idea from when became goofy around you became normal.', placeholder: 'Add a favourite photo of him' },
  { file: '06.webp', eyebrow: 'MORE YOU', text: 'You have no idea how many ordinary moments you have made special just by being there.', placeholder: 'Add another candid photo' },
  { file: '07.webp', eyebrow: 'US', text: 'And then there are these. The ones I keep coming back to.', placeholder: 'Add a favourite photo of you two' },
  { file: '08.webp', eyebrow: 'THE CHAOS', text: 'Life started feeling a little easier since you were there.', placeholder: 'Add a goofy memory' },
  { file: '09.webp', eyebrow: 'THE GOOD DAYS', text: 'Some days were loud. Some were quiet. I loved having you in both.', placeholder: 'Add another shared memory' },
  { file: '10.webp', eyebrow: 'SOMEHOW', text: 'Look at us now. We have actually come a pretty long way, haven’t we?', placeholder: 'Add a recent photo together' },
  { file: '11.webp', eyebrow: 'STILL US', text: 'And somehow, after all the little moments, here we are.', placeholder: 'Add your favourite recent picture' },
]

const SpeakerIcon = ({ muted }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M4 9v6h4l5 4V5L8 9H4Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    {muted ? (
      <>
        <path d="m17 9 4 6M21 9l-4 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M16 9.5c1.6 1.3 1.6 3.7 0 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18.5 7c3 2.7 3 6.3 0 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </svg>
)

export default function MemoryJourney({ onFinish }) {
  const [index, setIndex] = useState(0)
  const [letterOpen, setLetterOpen] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const [musicVolume, setMusicVolume] = useState(0.65)
  const audioRef = useRef(null)

  const current = memories[index]
  const image = useMemo(() => findMemory(current.file), [current.file])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = musicVolume

    const startMusic = async () => {
      try {
        await audio.play()
        setMusicPlaying(true)
      } catch {
        setMusicPlaying(false)
      }
    }

    startMusic()

    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume
    }
  }, [musicVolume])

  const fadeInMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = false
    setMusicMuted(false)

    try {
      if (audio.paused) await audio.play()
      setMusicPlaying(true)
    } catch (error) {
      console.error('Memory music could not play:', error)
      return
    }

    const target = musicVolume
    audio.volume = 0
    const start = performance.now()
    const duration = 2200

    const tick = (now) => {
      if (!audioRef.current) return
      const progress = Math.min((now - start) / duration, 1)
      audio.volume = target * progress
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }

  const changeVolume = (amount) => {
    const nextVolume = Math.min(1, Math.max(0, Math.round((musicVolume + amount) * 20) / 20))
    setMusicVolume(nextVolume)

    const audio = audioRef.current
    if (audio) {
      audio.volume = nextVolume

      if (nextVolume > 0 && audio.muted) {
        audio.muted = false
        setMusicMuted(false)
      }

      if (nextVolume > 0 && audio.paused) {
        fadeInMusic()
      }
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      fadeInMusic()
      return
    }

    const nextMuted = !musicMuted
    audio.muted = nextMuted
    setMusicMuted(nextMuted)
  }

  const next = () => {
    if (index < memories.length - 1) {
      setIndex((value) => value + 1)
    } else {
      setLetterOpen(true)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return
      if (letterOpen) return

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      }

      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        setIndex((value) => value - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, letterOpen])

  return (
    <main className="memory-journey">
      <audio ref={audioRef} src={saibo} loop preload="auto" />

      <div className="memory-noise" />

      {!letterOpen && (
        <div
          className="memory-progress"
          style={{ '--progress': `${((index + 1) / memories.length) * 100}%` }}
        />
      )}

      {/* Small music control — intentionally quiet and unobtrusive. */}
      <div
        className="memory-music-control"
        aria-label="Memory music controls"
        style={{
          position: 'fixed',
          top: 18,
          right: 24,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          height: 34,
          padding: '0 9px',
          border: '1px solid rgba(202, 168, 94, 0.28)',
          borderRadius: 3,
          background: 'rgba(5, 6, 8, 0.72)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 5px 18px rgba(0,0,0,0.25)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            color: '#d6c08a',
            fontSize: 13,
            lineHeight: 1,
            marginRight: 5,
            opacity: 0.9,
          }}
        >
          ♫
        </span>

        <button
          type="button"
          onClick={() => changeVolume(-0.05)}
          aria-label="Decrease volume"
          style={{
            width: 25,
            height: 28,
            border: 0,
            background: 'transparent',
            color: '#e9e5dc',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
            opacity: 0.8,
          }}
        >
          −
        </button>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={musicMuted ? 'Unmute music' : 'Mute music'}
          style={{
            width: 27,
            height: 28,
            border: 0,
            background: 'transparent',
            color: musicMuted ? '#8e8b83' : '#d6c08a',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
            opacity: 0.9,
          }}
        >
          <SpeakerIcon muted={musicMuted} />
        </button>

        <button
          type="button"
          onClick={() => changeVolume(0.05)}
          aria-label="Increase volume"
          style={{
            width: 25,
            height: 28,
            border: 0,
            background: 'transparent',
            color: '#e9e5dc',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
            opacity: 0.8,
          }}
        >
          +
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!letterOpen ? (
          <motion.section
            key={current.file}
            className="memory-scene"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 1.02 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="memory-copy">
              <p className="memory-eyebrow">{current.eyebrow}</p>
              <p className="memory-number">
                {String(index + 1).padStart(2, '0')} / {String(memories.length).padStart(2, '0')}
              </p>
              <h1>{current.text}</h1>

              <button type="button" className="memory-next" onClick={next}>
                {index === memories.length - 1 ? 'OPEN THE LETTER →' : 'NEXT MEMORY →'}
              </button>
            </div>

            <motion.div
              className={`memory-photo ${image ? '' : 'memory-placeholder'}`}
              initial={{ rotate: index % 2 ? 2.5 : -2.5, x: 45 }}
              animate={{ rotate: index % 2 ? -1.5 : 1.5, x: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {image ? <img src={image} alt="A memory" /> : <span>{current.placeholder}</span>}
              <i />
            </motion.div>
          </motion.section>
        ) : (
          <motion.section
            key="letter"
            className="letter-scene"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="letter-paper"
              initial={{ y: 55, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="letter-kicker">THE FINAL FILE</p>

              <motion.p
                className="letter-win-line"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                You won the game.<br />
                The way you won my heart.
              </motion.p>

              <motion.div
                className="letter-divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.25, duration: 0.8 }}
              />

              <motion.div
                className="letter-body"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.45, duration: 0.9 }}
              >
                <p>Dear Tushar,</p>
                <p>I don't think I could fit everything you mean to me into one little website, but I wanted to try.</p>
                <p>Thank you for the ordinary days, the ridiculous conversations, the food, the movies, the laughs, the distance, the memories and all the little moments in between.</p>
                <p>Most of all, thank you for being you. I am really, really glad that somewhere along the way, our lives crossed.</p>
                <p>Here’s to all the memories we already have — and all the ones we haven't made yet.</p>
              </motion.div>

              <motion.p
                className="letter-sign"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.8 }}
              >
                Happy Birthday ❤️<br />
                — Sreejata
              </motion.p>

              <motion.p
                className="letter-smile"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.35, duration: 0.8 }}
              >
                Now smile. I made all of this just to see you do that.
              </motion.p>

              <button type="button" className="memory-next" onClick={() => onFinish?.()}>
                COMPLETE THE ARCHIVE →
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}
