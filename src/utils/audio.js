// Lightweight helper for one-off sound effects (click, transition, etc).
// Never blocks the UI: a missing or blocked file just logs a warning.
export function playSound(src, volume = 0.5) {
  try {
    const audio = new Audio(src)
    audio.volume = volume
    const attempt = audio.play()
    if (attempt !== undefined) {
      attempt.catch(() => {
        console.warn(`Sound effect unavailable: ${src}`)
      })
    }
  } catch (err) {
    console.warn(`Could not play sound: ${src}`, err)
  }
}
