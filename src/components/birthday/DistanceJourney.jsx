import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// A deliberately simplified but recognizable India silhouette. The landing
// page uses a regional crop so the two cities stay legible at 100% zoom.
const INDIA_OUTLINE = `
M 334 52
L 372 58 L 401 72 L 421 91 L 448 101 L 470 119
L 492 125 L 515 143 L 532 157 L 552 163 L 573 178
L 599 187 L 620 203 L 646 211 L 668 228 L 688 248
L 680 266 L 659 266 L 644 281 L 625 277 L 611 292
L 592 286 L 576 301 L 558 296 L 542 309 L 523 301
L 508 314 L 493 304 L 482 321 L 470 346 L 462 374
L 453 403 L 442 433 L 430 465 L 417 497 L 402 530
L 386 561 L 368 592 L 349 623 L 331 652 L 313 674
L 294 686 L 276 675 L 258 655 L 242 631 L 226 606
L 215 578 L 202 550 L 193 520 L 181 490 L 171 458
L 160 428 L 150 396 L 139 365 L 128 337 L 117 309
L 105 283 L 112 259 L 132 245 L 155 235 L 178 220
L 201 205 L 220 190 L 242 174 L 263 156 L 282 137
L 301 119 L 316 96 L 325 74 Z`

// Cropped-region state-like guide lines. They are intentionally subtle and
// decorative; the city route remains the hero.
const REGION_LINES = [
  'M 250 184 C 295 200 338 214 392 214 C 430 214 468 205 505 198',
  'M 190 285 C 250 300 305 315 360 310 C 410 306 455 292 520 275',
  'M 175 365 C 230 380 286 393 340 389 C 400 384 452 365 500 345',
  'M 190 445 C 245 455 295 468 344 462 C 390 456 425 438 455 420',
  'M 225 535 C 260 525 300 525 338 535 C 375 545 400 535 420 520',
]

// Coordinates are placed on the map itself, not on an arbitrary arc.
const BANGALORE = { x: 302, y: 570 }
const KOLKATA = { x: 530, y: 300 }
const ROUTE_D = `M ${BANGALORE.x} ${BANGALORE.y}
  C 326 548 345 520 365 494
  C 390 462 410 433 428 405
  C 450 371 478 342 502 322
  C 514 312 522 305 ${KOLKATA.x} ${KOLKATA.y}`

export default function DistanceJourney({ from, to, distance }) {
  const [stage, setStage] = useState('start')

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('map'), 250),
      setTimeout(() => setStage('origin'), 850),
      setTimeout(() => setStage('destination'), 1200),
      setTimeout(() => setStage('route'), 1600),
      setTimeout(() => setStage('traveling'), 2700),
      setTimeout(() => setStage('revealed'), 4900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const visible = (name) => {
    const order = ['start', 'map', 'origin', 'destination', 'route', 'traveling', 'revealed']
    return order.indexOf(stage) >= order.indexOf(name)
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[620px] h-[250px] sm:h-[270px] md:h-[285px] overflow-hidden">
        <svg
          viewBox="150 205 430 410"
          className="absolute inset-0 w-full h-full"
          fill="none"
          role="img"
          aria-label={`Map journey from ${from} to ${to}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="goldGlowJourney" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d={INDIA_OUTLINE}
            stroke="#b08a3e"
            strokeWidth="1.35"
            strokeLinejoin="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: visible('map') ? 0.72 : 0, pathLength: visible('map') ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {REGION_LINES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="#b08a3e"
              strokeWidth="0.55"
              opacity={visible('route') ? 0.16 : 0}
              transition={{ duration: 0.8, delay: i * 0.05 }}
            />
          ))}

          <motion.path
            d={ROUTE_D}
            stroke="#e2bf70"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="7 7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: visible('route') ? 1 : 0, opacity: visible('route') ? 0.95 : 0 }}
            transition={{ duration: 1.25, ease: 'easeInOut' }}
          />

          <CityMarker point={BANGALORE} visible={visible('origin')} pulse={false} />
          <CityMarker point={KOLKATA} visible={visible('destination')} pulse={stage === 'revealed'} />

          {stage === 'traveling' && (
            <circle r="5" fill="#f4d991" filter="url(#goldGlowJourney)">
              <animateMotion dur="2.15s" fill="freeze" path={ROUTE_D} />
            </circle>
          )}

          <text x={BANGALORE.x - 13} y={BANGALORE.y + 25} textAnchor="end" fill="#b7b1a6" fontSize="11" letterSpacing="3.2">
            {from.toUpperCase()}
          </text>
          <text x={KOLKATA.x + 14} y={KOLKATA.y - 12} textAnchor="start" fill="#b7b1a6" fontSize="11" letterSpacing="3.2">
            {to.toUpperCase()}
          </text>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={stage === 'revealed' ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.6 }}
        className="text-center -mt-1"
      >
        <p className="heading-display text-3xl md:text-4xl text-gold-bright tracking-wide">{distance}</p>
        <p className="label-mono mt-1">away</p>
      </motion.div>
    </div>
  )
}

function CityMarker({ point, visible, pulse }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.65 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.65 }}
      transition={{ duration: 0.45 }}
      style={{ transformOrigin: `${point.x}px ${point.y}px` }}
    >
      <circle cx={point.x} cy={point.y} r="12" fill="#d4af6a" opacity="0.08" />
      <motion.circle
        cx={point.x}
        cy={point.y}
        r="4"
        fill="#e5c57b"
        filter="url(#goldGlowJourney)"
        animate={pulse ? { r: [4, 9, 4], opacity: [1, 0.35, 1] } : {}}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
    </motion.g>
  )
}
