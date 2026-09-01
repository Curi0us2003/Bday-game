import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FRAME,
  GRATICULE,
  LANDMARKS,
  PATHS,
  VIEW_BOX,
  compassPoint,
  findCity,
  formatCoord,
  geodesic,
  haversineKm,
  initialBearing,
  pointsToPath,
  project,
  unitsForKm,
} from '../../data/indiaGeo.js'

const STAGES = ['start', 'grid', 'map', 'origin', 'destination', 'route', 'traveling', 'revealed']

// The whole map is projected from real latitude/longitude in indiaGeo.js, so
// the outline, the pins, the route and the printed distance all come from the
// same coordinates. Nothing here is a hand-placed pixel.
export default function DistanceJourney({ from, to, roadKm }) {
  const [stage, setStage] = useState('start')

  const route = useMemo(() => {
    const a = findCity(from)
    const b = findCity(to)
    if (!a || !b) return null
    const km = haversineKm(a, b)
    const bearing = initialBearing(a, b)
    return {
      a,
      b,
      km,
      bearing,
      compass: compassPoint(bearing),
      pathD: pointsToPath(geodesic(a, b, 64)),
      pa: project(a.lat, a.lon),
      pb: project(b.lat, b.lon),
    }
  }, [from, to])

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('grid'), 200),
      setTimeout(() => setStage('map'), 500),
      setTimeout(() => setStage('origin'), 1250),
      setTimeout(() => setStage('destination'), 1650),
      setTimeout(() => setStage('route'), 2050),
      setTimeout(() => setStage('traveling'), 2950),
      setTimeout(() => setStage('revealed'), 4900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const visible = (name) => STAGES.indexOf(stage) >= STAGES.indexOf(name)

  if (!route) return null

  const { a, b, km, bearing, compass, pathD, pa, pb } = route
  const kmLabel = Math.round(km).toLocaleString('en-IN')
  const scaleKm = 500
  const scaleUnits = unitsForKm(scaleKm)
  const scaleX = FRAME.minX + 14
  const scaleY = FRAME.minY + FRAME.height - 16

  return (
    <div className="w-full flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-3 sm:gap-6">
      {/* ------------------------------------------------------------- map */}
      <div
        className="relative shrink-0 h-[188px] sm:h-[236px] md:h-[262px]"
        style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}` }}
      >
        <svg
          viewBox={VIEW_BOX}
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
          role="img"
          aria-label={`Map of India showing the ${Math.round(km)} kilometre route from ${a.name} to ${b.name}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="jGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="jLand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af6a" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#d4af6a" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* graticule — 5-degree parallels and meridians */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('grid') ? 1 : 0 }}
            transition={{ duration: 0.9 }}
          >
            {GRATICULE.map((g) =>
              g.kind === 'lat' ? (
                <line
                  key={`lat-${g.value}`}
                  x1={g.x1}
                  y1={g.y}
                  x2={g.x2}
                  y2={g.y}
                  stroke="#b08a3e"
                  strokeWidth="0.4"
                  strokeDasharray="2 5"
                  opacity="0.28"
                />
              ) : (
                <line
                  key={`lon-${g.value}`}
                  x1={g.x}
                  y1={g.y1}
                  x2={g.x}
                  y2={g.y2}
                  stroke="#b08a3e"
                  strokeWidth="0.4"
                  strokeDasharray="2 5"
                  opacity="0.28"
                />
              ),
            )}
            {GRATICULE.filter((g) => g.kind === 'lat').map((g) => (
              <text
                key={`latl-${g.value}`}
                x={FRAME.minX + 3}
                y={g.y - 2}
                fill="#8d7a54"
                fontSize="7.5"
                fontFamily="monospace"
              >
                {g.value}°N
              </text>
            ))}
            {GRATICULE.filter((g) => g.kind === 'lon').map((g) => (
              <text
                key={`lonl-${g.value}`}
                x={g.x + 2}
                y={FRAME.minY + FRAME.height - 4}
                fill="#8d7a54"
                fontSize="7.5"
                fontFamily="monospace"
              >
                {g.value}°E
              </text>
            ))}
          </motion.g>

          {/* neighbours: Sri Lanka and the island chains */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('map') ? 0.34 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <path d={PATHS.sriLanka} stroke="#b08a3e" strokeWidth="0.9" strokeLinejoin="round" />
            <path d={PATHS.andaman} stroke="#b08a3e" strokeWidth="0.8" strokeLinejoin="round" />
            <path d={PATHS.nicobar} stroke="#b08a3e" strokeWidth="0.8" strokeLinejoin="round" />
          </motion.g>

          {/* India */}
          <motion.path
            d={PATHS.india}
            fill="url(#jLand)"
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('map') ? 1 : 0 }}
            transition={{ duration: 1.4, delay: 0.4 }}
          />
          <motion.path
            d={PATHS.india}
            stroke="#c69f52"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: visible('map') ? 1 : 0,
              opacity: visible('map') ? 0.85 : 0,
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* other metros, for scale */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('route') ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            {LANDMARKS.map((c) => {
              const p = project(c.lat, c.lon)
              return (
                <g key={c.name}>
                  <circle cx={p.x} cy={p.y} r="1.5" fill="#8d7a54" />
                  <text
                    x={p.x + (c.anchor === 'end' ? -4 : 4)}
                    y={p.y + 2.6}
                    textAnchor={c.anchor}
                    fill="#8d7a54"
                    fontSize="8"
                    fontFamily="monospace"
                    letterSpacing="0.6"
                  >
                    {c.name.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </motion.g>

          {/* the route is the true great circle between the two cities */}
          <motion.path
            id="jRoute"
            d={pathD}
            stroke="#e2bf70"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeDasharray="6 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: visible('route') ? 1 : 0,
              opacity: visible('route') ? 0.95 : 0,
            }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />

          <CityPin p={pa} show={visible('origin')} />
          <CityPin p={pb} show={visible('destination')} pulse={stage === 'revealed'} />

          {stage === 'traveling' && (
            <circle r="3.4" fill="#f4d991" filter="url(#jGlow)">
              <animateMotion dur="1.9s" fill="freeze" path={pathD} />
            </circle>
          )}

          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('origin') ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <text
              x={pa.x - 7}
              y={pa.y + 11}
              textAnchor="end"
              fill="#d8d2c6"
              fontSize="10.5"
              fontFamily="monospace"
              letterSpacing="1.6"
            >
              {a.name.toUpperCase()}
            </text>
          </motion.g>
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('destination') ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <text
              x={pb.x + 8}
              y={pb.y - 7}
              textAnchor="start"
              fill="#d8d2c6"
              fontSize="10.5"
              fontFamily="monospace"
              letterSpacing="1.6"
            >
              {b.name.toUpperCase()}
            </text>
          </motion.g>

          {/* scale bar — honest, because the projection is equidistant here */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('route') ? 0.75 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <line x1={scaleX} y1={scaleY} x2={scaleX + scaleUnits} y2={scaleY} stroke="#b08a3e" strokeWidth="1.1" />
            <line x1={scaleX} y1={scaleY - 3} x2={scaleX} y2={scaleY + 3} stroke="#b08a3e" strokeWidth="1.1" />
            <line
              x1={scaleX + scaleUnits}
              y1={scaleY - 3}
              x2={scaleX + scaleUnits}
              y2={scaleY + 3}
              stroke="#b08a3e"
              strokeWidth="1.1"
            />
            <text x={scaleX} y={scaleY - 6} fill="#8d7a54" fontSize="7.5" fontFamily="monospace">
              {scaleKm} KM
            </text>
          </motion.g>

          {/* north arrow */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: visible('map') ? 0.6 : 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <line
              x1={FRAME.minX + FRAME.width - 16}
              y1={FRAME.minY + 30}
              x2={FRAME.minX + FRAME.width - 16}
              y2={FRAME.minY + 12}
              stroke="#b08a3e"
              strokeWidth="1"
            />
            <path
              d={`M ${FRAME.minX + FRAME.width - 20} ${FRAME.minY + 16} L ${FRAME.minX + FRAME.width - 16} ${FRAME.minY + 8} L ${FRAME.minX + FRAME.width - 12} ${FRAME.minY + 16} Z`}
              fill="#b08a3e"
            />
            <text
              x={FRAME.minX + FRAME.width - 16}
              y={FRAME.minY + 39}
              textAnchor="middle"
              fill="#8d7a54"
              fontSize="8"
              fontFamily="monospace"
            >
              N
            </text>
          </motion.g>
        </svg>
      </div>

      {/* --------------------------------------------------------- readout */}
      <div className="flex w-full max-w-[280px] flex-col justify-center gap-2 sm:max-w-[220px] md:max-w-[248px]">
        <Row
          show={visible('origin')}
          label="ORIGIN"
          value={a.name.toUpperCase()}
          sub={formatCoord(a.lat, a.lon)}
        />
        <Row
          show={visible('destination')}
          label="DESTINATION"
          value={b.name.toUpperCase()}
          sub={formatCoord(b.lat, b.lon)}
        />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={visible('revealed') ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.7 }}
          className="mt-1 border-t border-gold/20 pt-2"
        >
          <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-ash/70">
            Great-circle distance
          </p>
          <p className="heading-display text-2xl leading-tight tracking-wide text-gold-bright md:text-3xl">
            {kmLabel} <span className="text-base md:text-lg">km</span>
          </p>
          <div className="mt-1.5 space-y-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-ash/70">
            <p>
              Bearing <span className="text-gold/80">{bearing.toFixed(1)}° {compass}</span>
            </p>
            {roadKm ? (
              <p>
                By road <span className="text-gold/80">≈ {roadKm.toLocaleString('en-IN')} km</span>
              </p>
            ) : null}
          </div>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-ash">away</p>
        </motion.div>
      </div>
    </div>
  )
}

function Row({ show, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
      transition={{ duration: 0.5 }}
      className="text-left"
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.28em] text-ash/60">{label}</p>
      <p className="font-mono text-[11px] tracking-[0.18em] text-bone">{value}</p>
      <p className="font-mono text-[8px] tracking-[0.1em] text-gold/55">{sub}</p>
    </motion.div>
  )
}

function CityPin({ p, show, pulse = false }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.6 }}
      transition={{ duration: 0.45 }}
      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
    >
      <circle cx={p.x} cy={p.y} r="8" fill="#d4af6a" opacity="0.1" />
      <circle cx={p.x} cy={p.y} r="4.4" stroke="#e5c57b" strokeWidth="0.8" opacity="0.5" />
      <motion.circle
        cx={p.x}
        cy={p.y}
        r="2.4"
        fill="#e5c57b"
        filter="url(#jGlow)"
        animate={pulse ? { r: [2.4, 5.2, 2.4], opacity: [1, 0.4, 1] } : {}}
        transition={{ duration: 1.2, repeat: pulse ? Infinity : 0, ease: 'easeInOut' }}
      />
    </motion.g>
  )
}
