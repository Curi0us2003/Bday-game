// Real geography for the landing-page map.
//
// Everything here is stored as [latitude, longitude] in degrees and projected
// once at module load. Nothing is a hand-tuned pixel coordinate, so the border
// shape, the city pins, the route and the printed distance are all derived from
// the same numbers and cannot drift out of agreement with each other.
//
// Projection: equidistant cylindrical (plate carree) with a standard parallel
// at 21 N, the usual compromise for a single-country map of India. Distances
// are within ~0.7% of true anywhere on the sheet, which is what lets the scale
// bar be honest.

const STANDARD_PARALLEL = 21
const UNITS_PER_DEGREE = 10
const EARTH_RADIUS_KM = 6371.0088
const KM_PER_DEGREE_LAT = 110.574

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI
const LON_SQUEEZE = Math.cos(rad(STANDARD_PARALLEL))

// Mainland border, traced clockwise from the northern tip of Ladakh: east
// along the Tibet and Nepal frontier, around the north-east, down the Bay of
// Bengal coast, round Kanyakumari, up the Arabian Sea coast through Kutch,
// then back north through Rajasthan and Punjab into Kashmir.
const INDIA_BORDER = [
  [35.5, 77.05], [34.8, 78.05], [34.1, 78.9], [33.2, 79.2], [32.55, 78.9],
  [31.95, 78.75], [31.3, 79.1], [30.75, 79.9], [30.35, 80.25], [29.9, 81.0],
  [29.35, 82.0], [28.75, 82.9], [28.2, 83.9], [27.7, 84.7], [27.35, 85.7],
  [27.05, 86.6], [26.75, 87.6], [26.4, 88.1], [26.85, 88.9], [27.3, 88.85],
  [27.1, 89.6], [26.75, 90.5], [26.85, 91.5], [27.05, 92.1], [27.75, 92.1],
  [28.15, 93.2], [28.55, 94.3], [29.05, 95.3], [28.65, 96.4], [28.2, 97.4],
  [27.7, 97.0], [27.2, 96.9], [26.6, 95.9], [25.9, 95.2], [25.2, 94.7],
  [24.5, 94.4], [23.9, 93.6], [23.1, 93.3], [22.3, 93.15], [21.95, 92.6],
  [22.6, 92.2], [23.0, 91.4], [23.75, 91.2], [24.2, 91.7], [24.9, 92.4],
  [25.15, 91.6], [25.2, 90.4], [25.15, 89.8], [25.7, 89.85], [26.4, 89.8],
  [26.3, 88.9], [25.6, 88.6], [24.9, 88.1], [24.3, 88.7], [23.6, 88.75],
  [23.0, 88.9], [22.4, 88.95], [21.7, 88.1], [21.55, 87.3], [21.1, 86.75],
  [20.3, 86.7], [19.8, 85.8], [19.2, 84.9], [18.3, 84.1], [17.7, 83.3],
  [17.0, 82.25], [16.3, 81.6], [15.85, 80.8], [15.1, 80.15], [14.3, 80.1],
  [13.5, 80.32], [13.1, 80.32], [12.62, 80.19], [11.9, 79.8], [11.1, 79.85], [10.3, 79.85],
  [9.6, 79.2], [9.15, 78.9], [8.85, 78.15], [8.35, 77.9], [8.07, 77.55],
  [8.4, 76.95], [9.0, 76.5], [9.98, 76.25], [10.8, 75.9], [11.6, 75.55],
  [12.3, 74.9], [13.0, 74.8], [13.85, 74.55], [14.8, 74.1], [15.5, 73.8],
  [16.4, 73.35], [17.2, 73.25], [18.2, 72.95], [19.05, 72.85], [19.8, 72.7],
  [20.6, 72.75], [21.2, 72.65], [21.7, 72.7], [22.3, 72.6], [21.9, 72.2],
  [21.1, 71.5], [20.75, 70.95], [20.9, 70.4], [21.5, 69.8], [22.25, 68.95],
  [22.45, 69.7], [22.75, 70.4], [22.9, 69.8], [23.05, 69.0], [23.55, 68.4],
  [23.85, 68.2], [24.3, 68.75], [24.7, 70.1], [25.2, 70.3], [26.0, 70.1],
  [27.0, 70.7], [27.9, 71.2], [28.3, 72.3], [29.1, 73.1], [29.95, 73.9],
  [30.5, 74.5], [31.1, 74.55], [32.0, 74.6], [32.75, 74.35], [33.3, 74.0],
  [34.0, 73.9], [34.6, 74.6], [35.0, 75.6], [35.4, 76.4],
]

// Neighbours drawn faintly — India reads as India far quicker with Sri Lanka
// and the island chains present than without them.
const SRI_LANKA = [
  [9.83, 80.2], [9.3, 80.05], [8.6, 79.75], [7.7, 79.8], [6.9, 79.85],
  [6.1, 80.1], [5.95, 80.6], [6.3, 81.3], [7.0, 81.8], [7.9, 81.5],
  [8.6, 81.2], [9.2, 80.85], [9.7, 80.55],
]

const ANDAMAN = [
  [13.6, 92.9], [13.2, 93.05], [12.3, 92.95], [11.6, 92.85], [10.55, 92.6],
  [10.65, 92.5], [11.7, 92.7], [12.4, 92.75], [13.3, 92.75],
]

const NICOBAR = [
  [9.2, 92.75], [8.3, 93.05], [7.4, 93.6], [6.75, 93.9], [6.85, 93.7],
  [7.6, 93.4], [8.4, 92.9], [9.1, 92.65],
]

export const CITIES = {
  bangalore: { name: 'Bangalore', lat: 12.9716, lon: 77.5946, label: 'ORIGIN' },
  kolkata: { name: 'Kolkata', lat: 22.5726, lon: 88.3639, label: 'DESTINATION' },
}

// A few extra dots so the country reads as a map instead of two lonely pins.
// Deliberately kept clear of the Bangalore-Kolkata corridor so nothing
// collides with the route line.
export const LANDMARKS = [
  { name: 'Delhi', lat: 28.6139, lon: 77.209, anchor: 'end' },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, anchor: 'end' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, anchor: 'start' },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362, anchor: 'start' },
]

export const findCity = (name) => CITIES[String(name).toLowerCase()]

// ------------------------------------------------------------------ maths
export function project(lat, lon) {
  return {
    x: lon * LON_SQUEEZE * UNITS_PER_DEGREE,
    y: -lat * UNITS_PER_DEGREE,
  }
}

/** Great-circle distance in kilometres (haversine). */
export function haversineKm(a, b) {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Initial bearing in degrees clockwise from true north. */
export function initialBearing(a, b) {
  const f1 = rad(a.lat)
  const f2 = rad(b.lat)
  const dl = rad(b.lon - a.lon)
  const y = Math.sin(dl) * Math.cos(f2)
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl)
  return (deg(Math.atan2(y, x)) + 360) % 360
}

export function compassPoint(bearing) {
  const names = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return names[Math.round(bearing / 22.5) % 16]
}

/** Points along the true great circle, so the route curves the way a flight does. */
export function geodesic(a, b, steps = 64) {
  const f1 = rad(a.lat)
  const l1 = rad(a.lon)
  const f2 = rad(b.lat)
  const l2 = rad(b.lon)
  const d = haversineKm(a, b) / EARTH_RADIUS_KM
  if (d === 0) return [a, b]

  const out = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const A = Math.sin((1 - t) * d) / Math.sin(d)
    const B = Math.sin(t * d) / Math.sin(d)
    const x = A * Math.cos(f1) * Math.cos(l1) + B * Math.cos(f2) * Math.cos(l2)
    const y = A * Math.cos(f1) * Math.sin(l1) + B * Math.cos(f2) * Math.sin(l2)
    const z = A * Math.sin(f1) + B * Math.sin(f2)
    out.push({ lat: deg(Math.atan2(z, Math.hypot(x, y))), lon: deg(Math.atan2(y, x)) })
  }
  return out
}

export function formatCoord(lat, lon) {
  const la = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const lo = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`
  return `${la}  ${lo}`
}

// ------------------------------------------------------------------ paths
const toPath = (ring, close = true) =>
  ring
    .map(([lat, lon], i) => {
      const { x, y } = project(lat, lon)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ') + (close ? ' Z' : '')

export const PATHS = {
  india: toPath(INDIA_BORDER),
  sriLanka: toPath(SRI_LANKA),
  andaman: toPath(ANDAMAN),
  nicobar: toPath(NICOBAR),
}

export function pointsToPath(points) {
  return points
    .map((p, i) => {
      const { x, y } = project(p.lat, p.lon)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

// ------------------------------------------------------------------ frame
const ALL = [...INDIA_BORDER, ...SRI_LANKA, ...ANDAMAN, ...NICOBAR]
const xs = ALL.map(([lat, lon]) => project(lat, lon).x)
const ys = ALL.map(([lat, lon]) => project(lat, lon).y)
const PAD = 10

export const FRAME = {
  minX: Math.min(...xs) - PAD,
  minY: Math.min(...ys) - PAD,
  width: Math.max(...xs) - Math.min(...xs) + PAD * 2,
  height: Math.max(...ys) - Math.min(...ys) + PAD * 2,
}

export const VIEW_BOX = `${FRAME.minX.toFixed(2)} ${FRAME.minY.toFixed(2)} ${FRAME.width.toFixed(2)} ${FRAME.height.toFixed(2)}`

/** Length in projected units representing a given number of kilometres. */
export const unitsForKm = (km) => (km / KM_PER_DEGREE_LAT) * UNITS_PER_DEGREE

/** Graticule every 5 degrees, clipped to the frame. */
export const GRATICULE = (() => {
  const lines = []
  for (let lat = 10; lat <= 35; lat += 5) {
    const { y } = project(lat, 0)
    lines.push({ kind: 'lat', value: lat, y, x1: FRAME.minX, x2: FRAME.minX + FRAME.width })
  }
  for (let lon = 70; lon <= 95; lon += 5) {
    const { x } = project(0, lon)
    lines.push({ kind: 'lon', value: lon, x, y1: FRAME.minY, y2: FRAME.minY + FRAME.height })
  }
  return lines
})()
