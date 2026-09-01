import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const SRC = '/assets/audio/happy-birthday.mp3'
const FADE_MS = 1200

// Place the birthday song at /public/assets/audio/happy-birthday.mp3.
// If it's missing or autoplay is blocked, this degrades to a small
// "PLAY BIRTHDAY SONG" control instead of breaking anything.
export default function BirthdayAudio({ fadeOutSignal }) {
  const audioRef = useRef(null)
  const [needsUserPlay, setNeedsUserPlay] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.6
    const attempt = audio.play()
    if (attempt !== undefined) {
      attempt.then(() => setPlaying(true)).catch(() => setNeedsUserPlay(true))
    }
  }, [])

  // Fades the song out once the cake scene signals all candles are out.
  useEffect(() => {
    if (!fadeOutSignal) return
    const audio = audioRef.current
    if (!audio || audio.paused) return

    const startVolume = audio.volume
    const steps = 20
    const stepTime = FADE_MS / steps
    let step = 0

    const interval = setInterval(() => {
      step += 1
      audio.volume = Math.max(0, startVolume * (1 - step / steps))
      if (step >= steps) {
        clearInterval(interval)
        audio.pause()
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [fadeOutSignal])

  const handlePlayClick = () => {
    const audio = audioRef.current
    if (!audio) return
    audio
      .play()
      .then(() => {
        setPlaying(true)
        setNeedsUserPlay(false)
      })
      .catch(() => {
        console.warn('Birthday song could not be played — check /public/assets/audio/happy-birthday.mp3')
      })
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }

  return (
    <div className="mt-6 flex items-center gap-3 min-h-[28px]">
      <audio
        ref={audioRef}
        src={SRC}
        onError={() =>
          console.warn(`Birthday song not found at ${SRC} — add the file to enable it.`)
        }
      />

      {needsUserPlay && (
        <button
          onClick={handlePlayClick}
          className="label-mono border border-line rounded-full px-3 py-1.5 hover:border-gold hover:text-bone transition-colors duration-ui"
        >
          ♪ PLAY BIRTHDAY SONG
        </button>
      )}

      {playing && (
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="text-ash hover:text-bone transition-colors duration-ui"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  )
}
