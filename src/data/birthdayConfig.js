// All personal/editable content for Layer 2 lives here.
// Swap copy, distance, or microphone sensitivity without touching component logic.

export const birthdayConfig = {
  name: 'Tushar',
  age: 25,

  // The great-circle distance and the bearing are computed from the real
  // coordinates in src/data/indiaGeo.js -- only the road figure is a
  // published approximation, so it lives here where it can be edited.
  from: 'Bangalore',
  to: 'Kolkata',
  roadKm: 1870,

  openingLine: "I couldn't hand you a present this year.",
  openingLine2: 'So I made you one.',
  openingKicker: 'BIRTHDAY PROTOCOL',
  openingPrompt: 'A small world built for one person. Press the gift when the route is complete.',

  cakeTitle: 'Make a wish.',

  candleCount: 5,

  // Microphone-blow detection tuning.
  // threshold: normalized RMS (0–1) amplitude that counts as "blowing".
  //   Raise this if ambient room noise or talking is triggering candles.
  // blowDurationMs: how long amplitude must stay above threshold, continuously,
  //   before it counts as one sustained blow (extinguishes one candle).
  // cooldownMs: minimum gap after a detected blow before another can register,
  //   so one long breath extinguishes candles one at a time rather than all at once.
  microphone: {
    threshold: 0.06,
    blowDurationMs: 350,
    cooldownMs: 250,
  },
}
