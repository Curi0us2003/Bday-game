import { useCallback, useEffect, useRef, useState } from 'react'

const FADE_MS = 1200

// Owns a single Audio instance for the birthday song across the whole
// experience. play() is meant to be called synchronously inside the
// "OPEN YOUR GIFT" click handler — calling it there, even though the
// cake scene mounts a moment later, keeps it inside the same user
// gesture in most browsers, which is what autoplay policies check for.
export default function useBirthdaySong(src) {
  const audioRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | playing | blocked | fading | stopped
  const [muted, setMuted] = useState(false)
  const [volume, setVolumeState] = useState(0.35)

  const getAudio = useCallback(() => {
    if (!audioRef.current && typeof Audio !== 'undefined') {
      const audio = new Audio(src)
      audio.volume = volume
      audio.loop = true
      audio.onerror = () =>
        console.warn(`Birthday song not found at ${src} — add the file to enable it.`)
      audioRef.current = audio
    }
    return audioRef.current
  }, [src, volume])

  const play = useCallback(() => {
    const audio = getAudio()
    if (!audio) return
    const attempt = audio.play()
    if (attempt !== undefined) {
      attempt.then(() => setStatus('playing')).catch(() => setStatus('blocked'))
    }
  }, [getAudio])

  const fadeOut = useCallback((duration = FADE_MS) => {
    const audio = audioRef.current
    if (!audio || audio.paused) return
    setStatus('fading')
    const startVolume = audio.volume
    const steps = 20
    const stepTime = duration / steps
    let step = 0
    const interval = setInterval(() => {
      step += 1
      audio.volume = Math.max(0, startVolume * (1 - step / steps))
      if (step >= steps) {
        clearInterval(interval)
        audio.pause()
        setStatus('stopped')
      }
    }, stepTime)
  }, [])

  const fadeIn = useCallback((duration = FADE_MS) => {
    const audio = getAudio()
    if (!audio) return
    audio.volume = 0
    setStatus('fading')
    const steps = 20
    const stepTime = duration / steps
    let step = 0
    const attempt = audio.play()
    if (attempt !== undefined) {
      attempt.catch(() => setStatus('blocked'))
    }
    const interval = setInterval(() => {
      step += 1
      audio.volume = Math.min(volume, (volume * step) / steps)
      if (step >= steps) {
        clearInterval(interval)
        setStatus('playing')
      }
    }, stepTime)
  }, [getAudio, volume])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setStatus('stopped')
  }, [])

  const setVolume = useCallback((nextVolume) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Math.min(1, Math.max(0, nextVolume))
    audio.volume = next
    setVolumeState(next)
    if (next > 0 && audio.muted) {
      audio.muted = false
      setMuted(false)
    }
  }, [])

  // Stop this audio instance when the owner component is unmounted.
  // This is especially important for the developer/debug routes: navigating
  // away from the main game must not leave the theme playing underneath a
  // page that no longer owns it.
  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }, [])

  return { status, muted, volume, play, pause, fadeIn, fadeOut, setVolume, toggleMute }
}
