import { useCallback, useEffect, useRef, useState } from 'react'
import GameMusicControl from './GameMusicControl.jsx'
import './CarRaceGame.css'

// ------------------------------------------------------------------ tuning
const TARGET_DISTANCE = 2500 // metres to escape
const METERS_PER_PX = 0.05 // world scale: pixels scrolled -> metres
const SPEED_MIN = 430 // px/sec on the start line
const SPEED_MAX = 900 // px/sec at the finish line
const BOOST_MULT = 1.6
const BOOST_DRAIN = 34 // meter units per second
const BOOST_GAIN_SHARD = 14
const BOOST_GAIN_NEARMISS = 6
const BOOST_MIN = 12 // can't engage below this
const START_HEALTH = 3
const INVULN_TIME = 1.4 // seconds of grace after a hit
const LAMP_GAP = 340
const MAX_DT = 0.05 // clamp dt so a tab switch can't teleport the world
const UI_TICK = 0.1 // throttle React updates to 10/sec, not 60

const PALETTE = {
  player: { body: '#e7c75f', dark: '#8a6f1f', glass: 'rgba(130,205,255,0.5)', accent: '#fff6d8' },
  car: { body: '#b56cff', dark: '#54277f', glass: 'rgba(205,175,255,0.34)', accent: '#e6d4ff' },
  truck: { body: '#4a5568', dark: '#20262f', glass: 'rgba(180,200,220,0.28)', accent: '#8fa3bf' },
  oncoming: { body: '#ff6b6b', dark: '#7f2727', glass: 'rgba(255,205,205,0.32)', accent: '#ffd9d9' },
}

// ------------------------------------------------------------------ helpers
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const lerp = (a, b, t) => a + (b - a) * t
const rand = (a, b) => a + Math.random() * (b - a)
const randInt = (a, b) => Math.floor(rand(a, b + 1))
const pick = (arr) => arr[randInt(0, arr.length - 1)]

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// Shrunken hitboxes — a pixel-exact box feels unfair at 900px/sec.
function overlap(a, b, ix, iy) {
  const aw = a.w * ix
  const ah = a.h * iy
  const ax = a.x + (a.w - aw) / 2
  const ay = a.y + (a.h - ah) / 2
  const bw = b.w * ix
  const bh = b.h * iy
  const bx = b.x + (b.w - bw) / 2
  const by = b.y + (b.h - bh) / 2
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

// Layout is derived from the real element size on every resize, so the road
// keeps its proportions instead of being stretched to fit.
function computeLayout(el) {
  const w = Math.max(320, el.clientWidth)
  const h = Math.max(360, el.clientHeight)
  const roadW = clamp(w * 0.6, 260, 620)
  const laneW = roadW / 3
  const carW = clamp(laneW * 0.52, 28, 68)
  return {
    w,
    h,
    roadW,
    roadX: (w - roadW) / 2,
    laneW,
    carW,
    carH: carW * 1.62,
    playerY: h - clamp(h * 0.2, 110, 190),
  }
}

const laneCenter = (L, lane) => L.roadX + L.laneW * (lane + 0.5)

function createGame() {
  const g = {
    mode: 'ready',
    scroll: 0,
    streaks: Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      sp: rand(1.1, 2.4),
      len: rand(30, 110),
    })),
    best: 0,
    crashes: 0,
  }
  resetRun(g)
  return g
}

function resetRun(g) {
  g.distance = 0
  g.speed = SPEED_MIN
  g.health = START_HEALTH
  g.entities = []
  g.particles = []
  g.markers = []
  g.lane = 1
  g.lanePos = 1
  g.boost = 35
  g.boosting = false
  g.boostHeld = false
  g.shards = 0
  g.nearMiss = 0
  g.invuln = 0
  g.shake = 0
  g.hitFlash = 0
  g.pickFlash = 0
  g.go = 0
  g.rowTimer = 1.5
  g.shardTimer = 2
  g.heartTimer = 12
  g.lastFree = 1
  g.countdown = 0
  g.nextMarker = 500
  g.earnedXP = 0
}

// ------------------------------------------------------------------ spawning
function makeCar(kind, lane, L) {
  const w = kind === 'truck' ? L.carW * 1.12 : L.carW
  const h = kind === 'truck' ? w * 2.25 : w * 1.62
  // truck = same-direction traffic (closes slowly), oncoming = head-on (fast)
  const rel = kind === 'truck' ? 0.66 : kind === 'oncoming' ? 1.42 : 1
  return {
    kind,
    lane,
    w,
    h,
    x: laneCenter(L, lane) - w / 2,
    y: -h - (kind === 'oncoming' ? 300 : 40),
    rel,
    passed: false,
    dead: false,
    seed: Math.random() * 6.28,
  }
}

function makePickup(kind, lane, L, stackIndex = 0) {
  const w = L.carW * (kind === 'heart' ? 0.54 : 0.46)
  return {
    kind,
    lane,
    w,
    h: w,
    x: laneCenter(L, lane) - w / 2,
    y: -w - 30 - stackIndex * w * 1.8,
    rel: 1,
    passed: true, // pickups never count as near misses
    dead: false,
    seed: Math.random() * 6.28,
  }
}

function spawnRow(g, L, progress) {
  const roll = Math.random()
  let blocked

  if (roll < 0.58 - progress * 0.26) {
    blocked = [randInt(0, 2)] // one lane
  } else if (roll < 0.94) {
    // Two lanes blocked. The gap has to be reachable from the previous gap,
    // otherwise a late row can be physically impossible to dodge.
    const free = pick([0, 1, 2].filter((l) => Math.abs(l - g.lastFree) <= 1))
    blocked = [0, 1, 2].filter((l) => l !== free)
  } else {
    blocked = [] // breather
  }

  g.lastFree = pick([0, 1, 2].filter((l) => !blocked.includes(l)))

  for (const lane of blocked) {
    const r = Math.random()
    const kind = r < 0.18 + progress * 0.12 ? 'oncoming' : r < 0.4 ? 'truck' : 'car'
    g.entities.push(makeCar(kind, lane, L))
  }
}

function burst(g, x, y, color, n, spread = 320) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const s = rand(50, spread)
    g.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(0.3, 0.8),
      max: 0.8,
      color,
      r: rand(1.4, 3.6),
    })
  }
}

// ------------------------------------------------------------------ drawing
function drawPine(ctx, cx, y, size) {
  ctx.beginPath()
  ctx.moveTo(cx, y - size)
  ctx.lineTo(cx + size * 0.5, y + size * 0.4)
  ctx.lineTo(cx - size * 0.5, y + size * 0.4)
  ctx.closePath()
  ctx.fill()
}

function drawRoadside(ctx, g, L) {
  ctx.fillStyle = '#080a0d'
  ctx.fillRect(-40, -40, L.roadX + 40, L.h + 80)
  ctx.fillRect(L.roadX + L.roadW, -40, L.w - L.roadX - L.roadW + 40, L.h + 80)

  if (L.roadX < 54) return
  const gap = 190
  const off = (g.scroll * 0.55) % gap
  const size = Math.min(L.roadX * 0.42, 46)
  ctx.fillStyle = '#0e131a'
  for (let i = -1; i * gap + off < L.h + gap; i++) {
    const y = i * gap + off
    drawPine(ctx, L.roadX * 0.42, y, size)
    drawPine(ctx, L.roadX + L.roadW + (L.w - L.roadX - L.roadW) * 0.58, y + gap * 0.5, size)
  }
}

function drawRoad(ctx, g, L) {
  const grad = ctx.createLinearGradient(L.roadX, 0, L.roadX + L.roadW, 0)
  grad.addColorStop(0, '#0f1117')
  grad.addColorStop(0.5, '#171a22')
  grad.addColorStop(1, '#0f1117')
  ctx.fillStyle = grad
  ctx.fillRect(L.roadX, -40, L.roadW, L.h + 80)

  // scrolling asphalt banding — cheap texture, strong motion cue
  ctx.save()
  ctx.beginPath()
  ctx.rect(L.roadX, -40, L.roadW, L.h + 80)
  ctx.clip()
  ctx.fillStyle = 'rgba(255,255,255,0.015)'
  const band = 26
  const boff = g.scroll % band
  for (let y = -band + boff; y < L.h + band; y += band) ctx.fillRect(L.roadX, y, L.roadW, 9)
  ctx.restore()

  // rumble strips
  const seg = 46
  const roff = g.scroll % (seg * 2)
  for (let y = -seg * 2 + roff; y < L.h + seg * 2; y += seg * 2) {
    ctx.fillStyle = 'rgba(231,199,95,0.7)'
    ctx.fillRect(L.roadX - 10, y, 10, seg)
    ctx.fillRect(L.roadX + L.roadW, y + seg, 10, seg)
    ctx.fillStyle = 'rgba(250,249,246,0.5)'
    ctx.fillRect(L.roadX - 10, y + seg, 10, seg)
    ctx.fillRect(L.roadX + L.roadW, y, 10, seg)
  }

  // lane dividers — the dash offset is what actually sells the speed
  ctx.strokeStyle = 'rgba(250,249,246,0.26)'
  ctx.lineWidth = 4
  ctx.setLineDash([48, 42])
  ctx.lineDashOffset = -(g.scroll % 90)
  for (let i = 1; i < 3; i++) {
    const x = L.roadX + L.laneW * i
    ctx.beginPath()
    ctx.moveTo(x, -60)
    ctx.lineTo(x, L.h + 60)
    ctx.stroke()
  }
  ctx.setLineDash([])
  ctx.lineDashOffset = 0
}

function drawLamps(ctx, g, L) {
  const rem = g.scroll % LAMP_GAP
  const base = Math.floor(g.scroll / LAMP_GAP)
  for (let i = -1; i * LAMP_GAP + rem < L.h + LAMP_GAP; i++) {
    const y = i * LAMP_GAP + rem
    // index by world position, not screen index, so lamps don't swap sides
    const left = (((base - i) % 2) + 2) % 2 === 0
    const baseX = left ? L.roadX - 16 : L.roadX + L.roadW + 16
    const dir = left ? 1 : -1
    const arm = Math.min(L.laneW * 1.1, 92)
    const headX = baseX + dir * arm

    const r = arm * 1.7
    const pool = ctx.createRadialGradient(headX, y + 34, 0, headX, y + 34, r)
    pool.addColorStop(0, 'rgba(255,236,180,0.15)')
    pool.addColorStop(1, 'rgba(255,236,180,0)')
    ctx.fillStyle = pool
    ctx.beginPath()
    ctx.ellipse(headX, y + 40, r, r * 0.85, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(120,132,152,0.34)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(baseX, y + 44)
    ctx.lineTo(baseX, y)
    ctx.lineTo(headX, y)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,240,200,0.85)'
    ctx.fillRect(headX - 8, y - 3, 16, 6)
  }
}

function drawMarkers(ctx, g, L) {
  ctx.save()
  ctx.font = '700 11px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const m of g.markers) {
    const x = m.left
      ? Math.max(32, L.roadX - 32)
      : Math.min(L.w - 32, L.roadX + L.roadW + 32)
    roundRect(ctx, x - 27, m.y - 14, 54, 28, 3)
    ctx.fillStyle = 'rgba(8,9,12,0.92)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(231,199,95,0.45)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#e7c75f'
    ctx.fillText(m.label, x, m.y + 1)
  }
  ctx.restore()
}

function drawStreaks(ctx, g, L) {
  const t = clamp((g.speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN), 0, 1)
  const intensity = t * (g.boosting ? 2.4 : 1)
  if (intensity < 0.03) return
  ctx.strokeStyle = `rgba(231,199,95,${clamp(0.04 + intensity * 0.11, 0, 0.4)})`
  ctx.lineWidth = 2
  for (const s of g.streaks) {
    const x = L.roadX + 8 + s.x * (L.roadW - 16)
    const y = s.y * L.h
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y + s.len * (0.5 + intensity))
    ctx.stroke()
  }
}

function drawCar(ctx, x, y, w, h, p, opts = {}) {
  const { tilt = 0, flip = false, alpha = 1 } = opts
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x + w / 2, y + h / 2)
  if (tilt) ctx.rotate(tilt)
  if (flip) ctx.rotate(Math.PI)
  ctx.translate(-w / 2, -h / 2)

  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  roundRect(ctx, 3, 7, w, h, w * 0.24)
  ctx.fill()

  // wheels
  ctx.fillStyle = '#0a0b0d'
  const ww = w * 0.15
  const wh = h * 0.2
  roundRect(ctx, -ww * 0.55, h * 0.15, ww, wh, 2)
  ctx.fill()
  roundRect(ctx, w - ww * 0.45, h * 0.15, ww, wh, 2)
  ctx.fill()
  roundRect(ctx, -ww * 0.55, h * 0.64, ww, wh, 2)
  ctx.fill()
  roundRect(ctx, w - ww * 0.45, h * 0.64, ww, wh, 2)
  ctx.fill()

  // body
  const body = ctx.createLinearGradient(0, 0, w, 0)
  body.addColorStop(0, p.dark)
  body.addColorStop(0.3, p.body)
  body.addColorStop(0.7, p.body)
  body.addColorStop(1, p.dark)
  ctx.fillStyle = body
  roundRect(ctx, 0, 0, w, h, w * 0.26)
  ctx.fill()

  // nose sheen
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, w * 0.13, h * 0.03, w * 0.74, h * 0.15, w * 0.14)
  ctx.fill()

  // windshield + rear glass
  ctx.fillStyle = p.glass
  roundRect(ctx, w * 0.15, h * 0.23, w * 0.7, h * 0.25, w * 0.1)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  roundRect(ctx, w * 0.2, h * 0.62, w * 0.6, h * 0.16, w * 0.08)
  ctx.fill()

  // racing stripe
  ctx.fillStyle = p.accent
  ctx.globalAlpha = alpha * 0.75
  ctx.fillRect(w * 0.46, h * 0.04, w * 0.08, h * 0.92)
  ctx.globalAlpha = alpha

  // headlights (front) + taillights (rear)
  ctx.fillStyle = '#fff4d0'
  roundRect(ctx, w * 0.11, -h * 0.012, w * 0.2, h * 0.05, 2)
  ctx.fill()
  roundRect(ctx, w * 0.69, -h * 0.012, w * 0.2, h * 0.05, 2)
  ctx.fill()
  ctx.fillStyle = '#ff3b30'
  roundRect(ctx, w * 0.1, h * 0.96, w * 0.21, h * 0.045, 2)
  ctx.fill()
  roundRect(ctx, w * 0.69, h * 0.96, w * 0.21, h * 0.045, 2)
  ctx.fill()

  ctx.restore()
}

function drawShard(ctx, e, t) {
  const cx = e.x + e.w / 2
  const cy = e.y + e.h / 2
  const s = e.w * (0.62 + Math.sin(t * 4 + e.seed) * 0.08)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(t * 2.2 + e.seed)
  ctx.shadowColor = 'rgba(231,199,95,0.9)'
  ctx.shadowBlur = 16
  ctx.fillStyle = '#e7c75f'
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.lineTo(s * 0.62, 0)
  ctx.lineTo(0, s)
  ctx.lineTo(-s * 0.62, 0)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.lineTo(s * 0.28, 0)
  ctx.lineTo(0, s * 0.4)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawHeart(ctx, e, t) {
  const pulse = 1 + Math.sin(t * 6 + e.seed) * 0.09
  ctx.save()
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2)
  ctx.scale(pulse, pulse)
  ctx.shadowColor = 'rgba(255,107,107,0.9)'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#ff6b6b'
  ctx.font = `700 ${Math.round(e.w * 1.5)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♥', 0, 1)
  ctx.restore()
}

function drawPlayer(ctx, g, L, t) {
  const px = laneCenter(L, g.lanePos) - L.carW / 2
  const py = L.playerY
  const tilt = clamp((g.lane - g.lanePos) * 0.42, -0.34, 0.34)

  // headlight cones
  const reach = g.boosting ? 420 : 320
  const cone = ctx.createLinearGradient(0, py, 0, py - reach)
  cone.addColorStop(0, `rgba(255,242,196,${g.boosting ? 0.2 : 0.14})`)
  cone.addColorStop(1, 'rgba(255,242,196,0)')
  ctx.fillStyle = cone
  ctx.beginPath()
  ctx.moveTo(px + L.carW * 0.18, py)
  ctx.lineTo(px - L.carW * 1.1, py - reach)
  ctx.lineTo(px + L.carW * 2.1, py - reach)
  ctx.lineTo(px + L.carW * 0.82, py)
  ctx.closePath()
  ctx.fill()

  // blink while invulnerable so the grace period is legible
  const alpha = g.invuln > 0 ? (Math.sin(t * 28) > 0 ? 0.35 : 1) : 1
  drawCar(ctx, px, py, L.carW, L.carH, PALETTE.player, { tilt, alpha })

  if (g.boosting) {
    const fl = L.carH * rand(0.4, 0.7)
    const flame = ctx.createLinearGradient(0, py + L.carH, 0, py + L.carH + fl)
    flame.addColorStop(0, 'rgba(255,214,120,0.85)')
    flame.addColorStop(0.45, 'rgba(255,120,60,0.5)')
    flame.addColorStop(1, 'rgba(255,60,40,0)')
    ctx.fillStyle = flame
    ctx.beginPath()
    ctx.moveTo(px + L.carW * 0.2, py + L.carH)
    ctx.lineTo(px + L.carW * 0.5, py + L.carH + fl)
    ctx.lineTo(px + L.carW * 0.8, py + L.carH)
    ctx.closePath()
    ctx.fill()
  }
}

function drawParticles(ctx, g) {
  for (const p of g.particles) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawOverlayFx(ctx, g, L) {
  const v = ctx.createRadialGradient(
    L.w / 2,
    L.h / 2,
    Math.min(L.w, L.h) * 0.32,
    L.w / 2,
    L.h / 2,
    Math.max(L.w, L.h) * 0.78,
  )
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.72)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, L.w, L.h)

  if (g.boosting) {
    ctx.fillStyle = 'rgba(231,199,95,0.05)'
    ctx.fillRect(0, 0, L.w, L.h)
  }
  if (g.hitFlash > 0) {
    ctx.fillStyle = `rgba(255,60,60,${g.hitFlash * 0.32})`
    ctx.fillRect(0, 0, L.w, L.h)
  }
  if (g.pickFlash > 0) {
    ctx.fillStyle = `rgba(231,199,95,${g.pickFlash * 0.12})`
    ctx.fillRect(0, 0, L.w, L.h)
  }
}

function render(ctx, g, L, t) {
  ctx.save()
  if (g.shake > 0) {
    const s = g.shake * 13
    ctx.translate(rand(-s, s), rand(-s, s))
  }

  const bg = ctx.createLinearGradient(0, 0, 0, L.h)
  bg.addColorStop(0, '#04050a')
  bg.addColorStop(0.55, '#0a0b11')
  bg.addColorStop(1, '#030306')
  ctx.fillStyle = bg
  ctx.fillRect(-40, -40, L.w + 80, L.h + 80)

  drawRoadside(ctx, g, L)
  drawRoad(ctx, g, L)
  drawLamps(ctx, g, L)
  drawMarkers(ctx, g, L)
  drawStreaks(ctx, g, L)

  for (const e of g.entities) {
    if (e.kind === 'shard') drawShard(ctx, e, t)
    else if (e.kind === 'heart') drawHeart(ctx, e, t)
    else drawCar(ctx, e.x, e.y, e.w, e.h, PALETTE[e.kind], { flip: e.kind === 'oncoming' })
  }

  drawParticles(ctx, g)
  drawPlayer(ctx, g, L, t)
  ctx.restore()
  drawOverlayFx(ctx, g, L)
}

// ------------------------------------------------------------------ component
export default function CarRaceGame({ onComplete, startingXP = 1250, gameSong }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const layoutRef = useRef(null)
  if (!gameRef.current) gameRef.current = createGame()

  const [state, setState] = useState('ready')
  const [ui, setUi] = useState({
    distance: 0,
    kmh: 120,
    health: START_HEALTH,
    boost: 35,
    shards: 0,
    nearMiss: 0,
    countdown: 3,
    crashes: 0,
    go: false,
    warn: false,
  })

  const setMode = useCallback((mode) => {
    gameRef.current.mode = mode
    setState(mode)
  }, [])

  const start = useCallback(() => {
    const g = gameRef.current
    resetRun(g)
    g.countdown = 3
    setMode('countdown')
  }, [setMode])

  const steer = useCallback((dir) => {
    const g = gameRef.current
    if (g.mode !== 'playing') return
    g.lane = clamp(g.lane + dir, 0, 2)
  }, [])

  const setBoost = useCallback((on) => {
    gameRef.current.boostHeld = on
  }, [])

  const togglePause = useCallback(() => {
    const g = gameRef.current
    if (g.mode === 'playing') setMode('paused')
    else if (g.mode === 'paused') setMode('playing')
  }, [setMode])

  // ---- canvas sizing (DPR aware, so nothing is stretched or blurry)
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const resize = () => {
      const L = computeLayout(wrap)
      layoutRef.current = L
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(L.w * dpr)
      canvas.height = Math.round(L.h * dpr)
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener('orientationchange', resize)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', resize)
    }
  }, [])

  // ---- input
  useEffect(() => {
    const onKeyDown = (e) => {
      const g = gameRef.current
      const k = e.key

      if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        steer(-1)
        e.preventDefault()
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        steer(1)
        e.preventDefault()
      } else if (k === ' ' || k === 'Shift') {
        if (g.mode === 'ready' || g.mode === 'crashed') start()
        else setBoost(true)
        e.preventDefault()
      } else if (k === 'Enter') {
        if (g.mode === 'ready' || g.mode === 'crashed') start()
        e.preventDefault()
      } else if (k === 'p' || k === 'P' || k === 'Escape') {
        togglePause()
        e.preventDefault()
      }
    }
    const onKeyUp = (e) => {
      if (e.key === ' ' || e.key === 'Shift') setBoost(false)
    }
    // Losing focus mid-run would otherwise mean a blind crash on return.
    const onBlur = () => {
      setBoost(false)
      if (gameRef.current.mode === 'playing') setMode('paused')
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onBlur)
    }
  }, [start, steer, setBoost, setMode, togglePause])

  // ---- main loop: delta-timed, so it plays identically at 60 and 144 Hz
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let uiTimer = 0
    let elapsed = 0

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, MAX_DT)
      last = now
      elapsed += dt

      const g = gameRef.current
      const L = layoutRef.current
      const canvas = canvasRef.current
      if (!L || !canvas) return
      const ctx = canvas.getContext('2d')

      // decays that run in every mode
      g.shake = Math.max(0, g.shake - dt * 2.4)
      g.hitFlash = Math.max(0, g.hitFlash - dt * 2.6)
      g.pickFlash = Math.max(0, g.pickFlash - dt * 4)
      g.go = Math.max(0, g.go - dt)

      // how fast the world scrolls in this mode
      let speed
      if (g.mode === 'playing') {
        const progress = clamp(g.distance / TARGET_DISTANCE, 0, 1)
        g.speed = lerp(SPEED_MIN, SPEED_MAX, progress)
        g.boosting = g.boostHeld && g.boost > 0
        if (g.boosting) {
          g.boost = Math.max(0, g.boost - BOOST_DRAIN * dt)
          if (g.boost === 0) g.boosting = false
        }
        speed = g.speed * (g.boosting ? BOOST_MULT : 1)
      } else {
        g.boosting = false
        speed =
          g.mode === 'ready' || g.mode === 'countdown'
            ? SPEED_MIN * 0.6
            : g.mode === 'victory'
              ? SPEED_MIN * 0.45
              : 0
      }

      g.scroll += speed * dt

      for (const s of g.streaks) {
        s.y += (speed * dt * s.sp) / L.h
        if (s.y > 1.2) {
          s.y = -0.2
          s.x = Math.random()
        }
      }

      for (const p of g.particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt + speed * dt * 0.35
        p.vx *= 0.94
        p.vy *= 0.94
        p.life -= dt
      }
      if (g.particles.length) g.particles = g.particles.filter((p) => p.life > 0)

      if (g.mode === 'countdown') {
        g.countdown -= dt
        if (g.countdown <= 0) {
          g.countdown = 0
          g.go = 0.9
          setMode('playing')
        }
      }

      if (g.mode === 'playing') {
        const progress = clamp(g.distance / TARGET_DISTANCE, 0, 1)
        g.invuln = Math.max(0, g.invuln - dt)
        g.distance += speed * dt * METERS_PER_PX

        // roadside distance signs
        while (g.nextMarker < TARGET_DISTANCE && g.distance >= g.nextMarker) {
          g.markers.push({
            y: -30,
            label: `${g.nextMarker}`,
            left: (g.nextMarker / 500) % 2 === 0,
          })
          g.nextMarker += 500
        }
        for (const m of g.markers) m.y += speed * dt
        if (g.markers.length) g.markers = g.markers.filter((m) => m.y < L.h + 50)

        // Spawn on a time interval rather than a pixel gap, so reaction time
        // stays constant as the car speeds up.
        g.rowTimer -= dt
        if (g.rowTimer <= 0) {
          spawnRow(g, L, progress)
          g.rowTimer = lerp(1.05, 0.62, progress) * rand(0.85, 1.25)
        }
        g.shardTimer -= dt
        if (g.shardTimer <= 0) {
          const lane = randInt(0, 2)
          const n = randInt(2, 4)
          for (let i = 0; i < n; i++) g.entities.push(makePickup('shard', lane, L, i))
          g.shardTimer = rand(1.8, 3.2)
        }
        g.heartTimer -= dt
        if (g.heartTimer <= 0) {
          if (g.health < START_HEALTH) g.entities.push(makePickup('heart', randInt(0, 2), L))
          g.heartTimer = rand(10, 16)
        }

        // eased lane change instead of a teleport
        g.lanePos += (g.lane - g.lanePos) * Math.min(1, dt * 15)

        const pRect = {
          x: laneCenter(L, g.lanePos) - L.carW / 2,
          y: L.playerY,
          w: L.carW,
          h: L.carH,
        }
        const pcx = pRect.x + L.carW / 2

        if (Math.random() < (g.boosting ? 0.9 : 0.35)) {
          g.particles.push({
            x: pcx + rand(-L.carW * 0.22, L.carW * 0.22),
            y: L.playerY + L.carH,
            vx: rand(-18, 18),
            vy: rand(40, 110),
            life: rand(0.18, 0.4),
            max: 0.4,
            color: g.boosting ? 'rgba(255,170,80,0.9)' : 'rgba(190,190,200,0.35)',
            r: rand(1.2, 2.6),
          })
        }

        for (const e of g.entities) {
          // re-derive size and x each frame so a mid-run resize stays correct
          if (e.kind === 'shard' || e.kind === 'heart') {
            e.w = L.carW * (e.kind === 'heart' ? 0.54 : 0.46)
            e.h = e.w
          } else {
            e.w = e.kind === 'truck' ? L.carW * 1.12 : L.carW
            e.h = e.kind === 'truck' ? e.w * 2.25 : e.w * 1.62
          }
          e.x = laneCenter(L, e.lane) - e.w / 2
          e.y += speed * dt * e.rel

          if (e.dead) continue

          if (e.kind === 'shard' || e.kind === 'heart') {
            if (overlap(pRect, e, 0.95, 0.95)) {
              e.dead = true
              g.pickFlash = 1
              if (e.kind === 'shard') {
                g.shards += 1
                g.boost = Math.min(100, g.boost + BOOST_GAIN_SHARD)
                burst(g, e.x + e.w / 2, e.y + e.h / 2, '#e7c75f', 10, 180)
              } else {
                g.health = Math.min(START_HEALTH, g.health + 1)
                burst(g, e.x + e.w / 2, e.y + e.h / 2, '#ff6b6b', 14, 200)
              }
            }
            continue
          }

          if (g.invuln <= 0 && overlap(pRect, e, 0.74, 0.8)) {
            e.dead = true
            g.health -= 1
            g.invuln = INVULN_TIME
            g.shake = 1
            g.hitFlash = 1
            g.boost = Math.max(0, g.boost - 20)
            burst(g, e.x + e.w / 2, e.y + e.h, '#ff6b6b', 24)
            burst(g, e.x + e.w / 2, e.y + e.h, '#e7c75f', 12)
            if (g.health <= 0) {
              g.best = Math.max(g.best, Math.floor(g.distance))
              g.crashes += 1
              g.boostHeld = false
              setMode('crashed')
            }
          } else if (!e.passed && e.y > L.playerY + L.carH) {
            e.passed = true
            if (Math.abs(e.x + e.w / 2 - pcx) < L.laneW * 0.9) {
              g.nearMiss += 1
              g.boost = Math.min(100, g.boost + BOOST_GAIN_NEARMISS)
            }
          }
        }

        g.entities = g.entities.filter((e) => !e.dead && e.y < L.h + 140)

        if (g.distance >= TARGET_DISTANCE) {
          g.distance = TARGET_DISTANCE
          g.best = Math.max(g.best, TARGET_DISTANCE)
          g.earnedXP = 300 + g.shards * 15 + g.nearMiss * 5 + g.health * 75
          g.boostHeld = false
          setMode('victory')
        }
      }

      render(ctx, g, L, elapsed)

      uiTimer -= dt
      if (uiTimer <= 0) {
        uiTimer = UI_TICK
        setUi({
          distance: Math.floor(g.distance),
          kmh: Math.round(speed * 0.28),
          health: g.health,
          boost: Math.round(g.boost),
          shards: g.shards,
          nearMiss: g.nearMiss,
          countdown: Math.max(1, Math.ceil(g.countdown)),
          crashes: g.crashes,
          go: g.go > 0,
          warn: g.health === 1 && g.mode === 'playing',
        })
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [setMode])

  const g = gameRef.current
  const progressPct = clamp((ui.distance / TARGET_DISTANCE) * 100, 0, 100)
  const racing = state === 'playing' || state === 'countdown' || state === 'paused'

  return (
    <div className="car-race" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="race-canvas"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          steer(e.clientX - rect.left < rect.width / 2 ? -1 : 1)
        }}
      />

      <GameMusicControl song={gameSong} />

      {racing && (
        <>
          <div className="race-progress">
            <i style={{ width: `${progressPct}%` }} />
          </div>

          <div className="race-hud race-hud-top">
            <div className="race-hud-label">DISTANCE</div>
            <div className="race-hud-big">
              {ui.distance}
              <em>/ {TARGET_DISTANCE} M</em>
            </div>
            <div className="race-hud-row">
              <span>SPEED</span>
              <b>{ui.kmh} KM/H</b>
            </div>
          </div>

          <div className="race-hud race-hud-bottom">
            <div className="race-hud-row">
              <span>ARMOUR</span>
              <b className={`race-hearts${ui.warn ? ' is-warn' : ''}`}>
                {'◆'.repeat(ui.health)}
                <em>{'◇'.repeat(Math.max(0, START_HEALTH - ui.health))}</em>
              </b>
            </div>
            <div className="race-hud-row">
              <span>NITRO</span>
              <b>{ui.boost}%</b>
            </div>
            <div className={`race-boost${ui.boost >= BOOST_MIN ? ' is-ready' : ''}`}>
              <i style={{ width: `${clamp(ui.boost, 0, 100)}%` }} />
            </div>
            <div className="race-hud-row race-hud-sub">
              <span>{'◆'} {ui.shards}</span>
              <span>{ui.nearMiss} NEAR MISS</span>
            </div>
          </div>

          <div className="race-touch">
            <button
              type="button"
              aria-label="Steer left"
              onPointerDown={(e) => {
                e.stopPropagation()
                steer(-1)
              }}
            >
              {'◀'}
            </button>
            <button
              type="button"
              className="race-touch-boost"
              aria-label="Nitro"
              onPointerDown={(e) => {
                e.stopPropagation()
                setBoost(true)
              }}
              onPointerUp={() => setBoost(false)}
              onPointerLeave={() => setBoost(false)}
              onPointerCancel={() => setBoost(false)}
            >
              NITRO
            </button>
            <button
              type="button"
              aria-label="Steer right"
              onPointerDown={(e) => {
                e.stopPropagation()
                steer(1)
              }}
            >
              {'▶'}
            </button>
          </div>

          <div className="race-hint">
            <span><b>{'←'} A {'·'} D {'→'}</b> LANE</span>
            <span><b>SPACE</b> NITRO</span>
            <span><b>P</b> PAUSE</span>
          </div>
        </>
      )}

      {state === 'countdown' && (
        <div className="race-countdown" key={ui.countdown}>
          {ui.countdown}
        </div>
      )}
      {state === 'playing' && ui.go && <div className="race-countdown race-go">GO</div>}

      {state === 'ready' && (
        <div className="race-overlay">
          <div className="race-kicker">LEVEL 03 // HIGHWAY ESCAPE</div>
          <h1>OUTRUN THE VOID</h1>
          <p>{TARGET_DISTANCE} metres of open road. Three lanes. No brakes.</p>

          <div className="race-brief">
            <div className="race-brief-title">BRIEFING</div>
            <ul>
              <li><b>{'←'} A / D {'→'}</b><span>Change lane</span></li>
              <li><b>SPACE</b><span>Nitro burst {'—'} burns the meter</span></li>
              <li><b>{'◆'}</b><span>Gold shards refill nitro</span></li>
              <li><b>{'♥'}</b><span>Repairs one armour point</span></li>
              <li><b>NEAR MISS</b><span>Squeeze past traffic for nitro</span></li>
              <li><b>P / ESC</b><span>Pause anytime</span></li>
            </ul>
          </div>

          <button type="button" className="race-btn" onClick={start}>
            START ENGINE {'→'}
          </button>
          <div className="race-tip">or press ENTER</div>
        </div>
      )}

      {state === 'paused' && (
        <div className="race-overlay race-overlay-soft">
          <div className="race-kicker">ENGINE IDLE</div>
          <h1>PAUSED</h1>
          <button type="button" className="race-btn" onClick={togglePause}>
            RESUME {'→'}
          </button>
          <div className="race-tip">or press P</div>
        </div>
      )}

      {state === 'crashed' && (
        <div className="race-overlay race-overlay-bad">
          <div className="race-kicker">RUN TERMINATED</div>
          <h1>THE VOID CAUGHT UP</h1>
          <p>Armour gone. The road resets — the road remains.</p>
          <div className="race-stats">
            <div><span>REACHED</span><b>{Math.floor(g.distance)} M</b></div>
            <div><span>BEST</span><b>{g.best} M</b></div>
            <div><span>SHARDS</span><b>{g.shards}</b></div>
            <div><span>NEAR MISSES</span><b>{g.nearMiss}</b></div>
          </div>
          <button type="button" className="race-btn" onClick={start}>
            RETRY RUN {'↻'}
          </button>
          <div className="race-tip">or press ENTER</div>

          {/* The letter is on the far side of this level — never let a hard
              run be the reason someone does not reach it. */}
          {ui.crashes >= 2 && (
            <button
              type="button"
              className="race-skip"
              onClick={() =>
                onComplete?.({ xp: startingXP, distance: gameRef.current.best })
              }
            >
              Skip ahead {'—'} there is more waiting {'→'}
            </button>
          )}
        </div>
      )}

      {state === 'victory' && (
        <div className="race-overlay race-overlay-good">
          <div className="race-kicker">ESCAPE SUCCESSFUL</div>
          <h1>YOU MADE IT</h1>
          <p>The void is behind you now.</p>
          <div className="race-stats">
            <div><span>DISTANCE</span><b>{TARGET_DISTANCE} M</b></div>
            <div><span>SHARDS</span><b>{g.shards} {'×'} 15</b></div>
            <div><span>NEAR MISSES</span><b>{g.nearMiss} {'×'} 5</b></div>
            <div><span>ARMOUR LEFT</span><b>{g.health} {'×'} 75</b></div>
          </div>
          <div className="race-xp">+{g.earnedXP} XP</div>
          <button
            type="button"
            className="race-btn"
            onClick={() => onComplete?.({ xp: startingXP + g.earnedXP, distance: g.distance })}
          >
            CONTINUE {'→'}
          </button>
        </div>
      )}
    </div>
  )
}
