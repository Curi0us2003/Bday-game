import { useCallback, useEffect, useRef, useState } from 'react'

// Detects a sustained "blow" into the microphone using RMS amplitude
// over time, rather than reacting to a single loud spike (so talking
// or a cough doesn't trigger it).
//
// status: 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported'
export default function useMicrophoneBlow({ threshold, blowDurationMs, cooldownMs, onBlowDetected }) {
  const [status, setStatus] = useState('idle')

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const sustainedSinceRef = useRef(null)
  const cooldownUntilRef = useRef(0)

  // Keep the latest callback in a ref so the animation-frame loop
  // never closes over a stale version of it.
  const onBlowDetectedRef = useRef(onBlowDetected)
  useEffect(() => {
    onBlowDetectedRef.current = onBlowDetected
  }, [onBlowDetected])

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    analyserRef.current = null
    sustainedSinceRef.current = null

    setStatus((current) => (current === 'listening' ? 'idle' : current))
  }, [])

  const tick = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const data = new Uint8Array(analyser.fftSize)
    analyser.getByteTimeDomainData(data)

    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - 128) / 128
      sumSquares += normalized * normalized
    }
    const rms = Math.sqrt(sumSquares / data.length)
    const now = performance.now()

    if (rms > threshold && now > cooldownUntilRef.current) {
      if (sustainedSinceRef.current === null) {
        sustainedSinceRef.current = now
      } else if (now - sustainedSinceRef.current >= blowDurationMs) {
        sustainedSinceRef.current = null
        cooldownUntilRef.current = now + cooldownMs
        onBlowDetectedRef.current?.()
      }
    } else if (rms <= threshold) {
      sustainedSinceRef.current = null
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [threshold, blowDurationMs, cooldownMs])

  const start = useCallback(async () => {
    const hasMic = navigator.mediaDevices?.getUserMedia
    const AudioCtx = window.AudioContext || window.webkitAudioContext

    if (!hasMic || !AudioCtx) {
      setStatus('unsupported')
      return
    }

    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      source.connect(analyser)
      analyserRef.current = analyser

      setStatus('listening')
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      setStatus('denied')
    }
  }, [tick])

  // Always release the mic/AudioContext on unmount.
  useEffect(() => stop, [stop])

  return { start, stop, status }
}
