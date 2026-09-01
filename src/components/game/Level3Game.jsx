import React, { useEffect, useRef, useState } from 'react'
import './Level3Game.css'

const CHARACTERS = {
  disciplined: {
    title: 'THE DISCIPLINED ONE',
    ability: 'SECOND WIND',
    color: '#e7c75f',
    description: 'The first mistake costs nothing. Keep running.',
  },
  cinephile: {
    title: 'THE CINEPHILE',
    ability: 'SLOW MOTION',
    color: '#9b8cff',
    description: 'Slow the world for a few seconds when it gets ugly.',
  },
  detective: {
    title: 'THE DETECTIVE',
    ability: 'BAT-SENSE',
    color: '#65c7ff',
    description: 'Read the road before it reaches you.',
  },
  shadow: {
    title: 'THE SHADOW WEAVER',
    ability: 'VOID STEP',
    color: '#b56cff',
    description: 'Phase through danger and surge forward.',
  },
}

const WIDTH = 1600
const HEIGHT = 900
const GROUND = 735
const FINISH = 900

const normalize = (value) => (value === 'shadow-weaver' ? 'shadow' : value)

export default function Level3Game({
  selectedCharacter = 'shadow',
  characterId,
  startingXP = 1250,
  onComplete,
}) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [state, setState] = useState('intro')
  const [ui, setUi] = useState({ distance: 0, speed: 1, health: 3, phase: 1, ability: 100, score: 0 })

  const characterKey = normalize(characterId || selectedCharacter)
  const character = CHARACTERS[characterKey] || CHARACTERS.shadow

  if (!gameRef.current) {
    gameRef.current = makeGame(characterKey, startingXP)
  }

    // ============================================================
  // LEVEL 3 KEYBOARD CONTROLS
  // Directly trigger the game actions on keydown.
  // This does NOT depend on the canvas having focus.
  // ============================================================
  useEffect(() => {
    const onKeyDown = (event) => {
      const game = gameRef.current
      if (!game) return

      const code = event.code

      // Prevent browser scrolling / page shortcuts.
      if (
        code === 'Space' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'KeyW' ||
        code === 'KeyS' ||
        code === 'ShiftLeft' ||
        code === 'ShiftRight' ||
        code === 'KeyE'
      ) {
        event.preventDefault()
      }

      // Ignore key repeat.
      // One press = one action.
      if (event.repeat) return

      // -------------------------
      // JUMP
      // SPACE / W / UP
      // -------------------------
      if (
        code === 'Space' ||
        code === 'KeyW' ||
        code === 'ArrowUp'
      ) {
        if (game.mode === 'playing') {
          game.jumpQueued = true
          game.keys.Space = true

          // Directly give the player upward velocity.
          // This makes the control work even if the game loop
          // misses the exact frame in which the key was pressed.
          if (game.player.grounded) {
            game.player.vy = -18
            game.player.grounded = false
            game.player.anim = 'jump'
          }
        }

        return
      }

      // -------------------------
      // SLIDE
      // S / DOWN
      // -------------------------
      if (
        code === 'KeyS' ||
        code === 'ArrowDown'
      ) {
        if (game.mode === 'playing') {
          game.keys.ArrowDown = true
          game.player.sliding = true
          game.player.anim = 'slide'
        }

        return
      }

      // -------------------------
      // CHARACTER POWER
      // SHIFT / E
      // -------------------------
      if (
        code === 'ShiftLeft' ||
        code === 'ShiftRight' ||
        code === 'KeyE'
      ) {
        if (
          game.mode === 'playing' &&
          game.cooldown <= 0
        ) {
          activate(game, characterKey)
        }

        return
      }

      // -------------------------
      // RESTART
      // -------------------------
      if (code === 'KeyR') {
        if (game.mode === 'dead') {
          event.preventDefault()
          restartGame()
        }

        return
      }

      // -------------------------
      // DEBUG FINISH
      // M
      // -------------------------
      if (code === 'KeyM') {
        event.preventDefault()
        finishGame(true)
      }
    }

    const onKeyUp = (event) => {
      const game = gameRef.current
      if (!game) return

      const code = event.code

      if (
        code === 'Space' ||
        code === 'KeyW' ||
        code === 'ArrowUp'
      ) {
        game.keys.Space = false
      }

      if (
        code === 'KeyS' ||
        code === 'ArrowDown'
      ) {
        game.keys.ArrowDown = false

        if (game.mode === 'playing' && game.player.grounded) {
          game.player.sliding = false
          game.player.anim = 'run'
        }
      }
    }

    // Window is used rather than the canvas.
    // The player therefore never needs to click the game first.
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
    }
  }, [characterKey])

  useEffect(() => {
    const timer = setTimeout(() => {
      gameRef.current.mode = 'playing'
      gameRef.current.last = performance.now()
      setState('playing')
    }, 2600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let raf = 0
    const frame = (now) => {
      const game = gameRef.current
      const dt = Math.min((now - (game.last || now)) / 16.667, 2)
      game.last = now
      if (game.mode === 'playing') update(game, dt)
      render(canvasRef.current, game, character)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [characterKey])

  function syncUi(game) {
    setUi({
      distance: Math.floor(game.distance),
      speed: game.speed,
      health: game.health,
      phase: game.phase,
      ability: Math.max(0, Math.round((1 - game.cooldown / game.cooldownMax) * 100)),
      score: Math.floor(game.score),
    })
  }

  function update(game, dt) {
    const c = canvasRef.current
    if (!c) return

    const slowFactor = game.slowTimer > 0 ? 0.48 : 1
    const worldDt = dt * slowFactor
    const p = game.player

    const jump = game.keys.Space || game.keys.ArrowUp || game.keys.KeyW
    const slide = game.keys.ArrowDown || game.keys.KeyS
    const ability = game.keys.ShiftLeft || game.keys.ShiftRight || game.keys.KeyE

    // jumpQueued makes a tap reliable even when the key is pressed between
    // two animation frames. Holding jump still behaves normally.
    if ((jump || game.jumpQueued) && !game.jumpLatch && p.grounded) {
      p.vy = -18
      p.grounded = false
      p.anim = 'jump'
      game.jumpLatch = true
      game.jumpQueued = false
    }
    if (!jump) {
      game.jumpLatch = false
      game.jumpQueued = false
    }
    p.sliding = slide && p.grounded
    if (p.sliding) p.anim = 'slide'
    else if (p.grounded && p.anim !== 'hurt') p.anim = 'run'

    p.vy += 0.95 * worldDt
    p.y += p.vy * worldDt
    if (p.y >= GROUND - p.height) {
      p.y = GROUND - p.height
      p.vy = 0
      p.grounded = true
    }

    if (ability && !game.abilityLatch && game.cooldown <= 0) {
      activate(game, characterKey)
      game.abilityLatch = true
    }
    if (!ability) game.abilityLatch = false

    if (game.cooldown > 0) game.cooldown -= dt
    if (game.slowTimer > 0) game.slowTimer -= dt
    if (game.senseTimer > 0) game.senseTimer -= dt
    if (game.invulnerable > 0) game.invulnerable -= dt
    if (game.hitFlash > 0) game.hitFlash -= dt
    if (game.nearMiss > 0) game.nearMiss -= dt

    game.speed = Math.min(13.5, 6.2 + game.distance / 125)
    game.distance += game.speed * worldDt * 0.105
    game.score += game.speed * worldDt * 0.7

    const newPhase = game.distance < 280 ? 1 : game.distance < 590 ? 2 : 3
    if (newPhase !== game.phase) {
      game.phase = newPhase
      game.phaseFlash = 60
      game.shake = 8
    }
    if (game.phaseFlash > 0) game.phaseFlash -= dt

    game.spawnTimer -= worldDt
    if (game.spawnTimer <= 0) {
      spawnPattern(game)
      game.spawnTimer = Math.max(48, 92 - game.speed * 2.2) + Math.random() * 24
    }

    for (const o of game.obstacles) {
      o.x -= game.speed * worldDt * (o.kind === 'drone' ? 1.04 : 1)
      o.anim += worldDt
    }

    checkCollisions(game)
    game.obstacles = game.obstacles.filter((o) => !o.dead && o.x + o.width > -140)

    updateParticles(game, worldDt)
    game.chaser += (game.phase === 3 ? 0.018 : 0.008) * worldDt
    game.chaser = Math.max(0, Math.min(100, game.chaser))

    if (game.distance >= FINISH) {
      game.distance = FINISH
      finishGame(false)
      return
    }

    if (game.health <= 0 || game.chaser >= 100) {
      game.mode = 'dead'
      setState('dead')
      syncUi(game)
      return
    }

    syncUi(game)
  }

  function activate(game, key) {
    const duration = 2.5 * 60
    game.cooldownMax = 8 * 60
    game.cooldown = game.cooldownMax
    if (key === 'disciplined') {
      game.shield = true
      game.invulnerable = 50
    } else if (key === 'cinephile') {
      game.slowTimer = duration
    } else if (key === 'detective') {
      game.senseTimer = 3.8 * 60
    } else {
      game.invulnerable = duration
      game.player.x += 95
      game.chaser = Math.max(0, game.chaser - 16)
      for (const o of game.obstacles) if (o.x > 70 && o.x < 420) o.x += 180
    }
    burst(game, game.player.x + 30, game.player.y + 45, character.color, 18)
  }

  function checkCollisions(game) {
    const p = game.player
    const ph = p.sliding ? 42 : 72
    const py = p.y + (p.height - ph)
    const box = { x: p.x + 14, y: py + 8, width: p.width - 24, height: ph - 10 }

    for (const o of game.obstacles) {
      if (o.dead) continue
      const hit = box.x < o.x + o.width && box.x + box.width > o.x && box.y < o.y + o.height && box.y + box.height > o.y
      if (!hit) continue

      const forgiving = o.kind === 'low' && p.y < GROUND - 82
      if (forgiving) continue

      if (game.invulnerable > 0 || (characterKey === 'disciplined' && game.shield)) {
        o.dead = true
        game.shield = false
        burst(game, p.x + 20, p.y + 35, character.color, 14)
        continue
      }

      o.dead = true
      game.health -= 1
      game.chaser = Math.min(100, game.chaser + 27)
      game.hitFlash = 16
      game.shake = 12
      p.anim = 'hurt'
      game.nearMiss = 0
      burst(game, p.x + 20, p.y + 35, '#ffffff', 20)
      setTimeout(() => { if (game.mode === 'playing') p.anim = 'run' }, 260)
    }

    for (const o of game.obstacles) {
      if (o.dead || o.passed || o.x + o.width >= p.x) continue
      o.passed = true
      const gap = Math.abs(o.x + o.width - p.x)
      if (gap < 34) {
        game.nearMiss = 22
        game.score += 45
        burst(game, p.x, p.y + 20, character.color, 6)
      }
    }
  }

  function spawnPattern(game) {
    const start = WIDTH + 60
    const r = Math.random()
    if (game.phase === 1) {
      addObstacle(game, r < 0.5 ? 'low' : 'overhead', start)
      if (Math.random() < 0.25) addObstacle(game, 'low', start + 260)
    } else if (game.phase === 2) {
      if (r < 0.33) {
        addObstacle(game, 'low', start)
        addObstacle(game, 'low', start + 250)
      } else if (r < 0.66) {
        addObstacle(game, 'overhead', start)
        addObstacle(game, 'low', start + 230)
      } else {
        addObstacle(game, 'drone', start)
      }
    } else {
      if (r < 0.3) {
        addObstacle(game, 'low', start)
        addObstacle(game, 'overhead', start + 210)
        addObstacle(game, 'low', start + 450)
      } else if (r < 0.65) {
        addObstacle(game, 'drone', start)
        addObstacle(game, 'low', start + 270)
      } else {
        addObstacle(game, 'wall', start)
      }
    }
  }

  function addObstacle(game, kind, x) {
    if (kind === 'low') game.obstacles.push({ kind, x, y: GROUND - 54, width: 70, height: 54, anim: 0 })
    if (kind === 'overhead') game.obstacles.push({ kind, x, y: GROUND - 148, width: 120, height: 38, anim: 0 })
    if (kind === 'wall') game.obstacles.push({ kind, x, y: GROUND - 165, width: 58, height: 165, anim: 0 })
    if (kind === 'drone') game.obstacles.push({ kind, x, y: GROUND - 190, width: 76, height: 48, anim: 0, baseY: GROUND - 190 })
  }

  function burst(game, x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 1 + Math.random() * 5
      game.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 18 + Math.random() * 24, color })
    }
  }

  function updateParticles(game, dt) {
    for (const p of game.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.08 * dt
      p.life -= dt
    }
    game.particles = game.particles.filter((p) => p.life > 0)
  }

  function restartGame() {
    gameRef.current = makeGame(characterKey, startingXP)
    gameRef.current.mode = 'playing'
    gameRef.current.last = performance.now()
    setState('playing')
    setUi({ distance: 0, speed: 1, health: 3, phase: 1, ability: 100, score: 0 })
  }

  function finishGame(debug) {
    const game = gameRef.current
    if (game.finished) return
    game.finished = true
    game.mode = 'victory'
    setState('victory')
    setUi((old) => ({ ...old, distance: FINISH, score: Math.floor(game.score + (debug ? 0 : 500)) }))
  }

  return (
    <div className="level3" style={{ '--accent': character.color }}>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />

      {state === 'intro' && (
        <div className="run-overlay intro-overlay">
          <div className="run-kicker">LEVEL 03 // THE FINAL RUN</div>
          <h1>THE IMPOSSIBLE RUN</h1>
          <p>TUSHAR HAS ONE JOB. KEEP MOVING.</p>
          <div className="ability-card">
            <span>{character.title}</span>
            <strong>{character.ability}</strong>
            <small>{character.description}</small>
          </div>
          <div className="intro-count">THE ROAD IS ABOUT TO START</div>
        </div>
      )}

      {state === 'playing' && (
        <>
          <div className="run-hud run-hud-left">
            <div className="hud-title">TUSHAR <span>// LV.03</span></div>
            <div className="hud-line"><span>RUN</span><b>{ui.distance}m / {FINISH}m</b></div>
            <div className="hud-meter"><i style={{ width: `${(ui.distance / FINISH) * 100}%` }} /></div>
            <div className="hud-line"><span>HEART</span><b className="hearts">{'◆'.repeat(ui.health)}<em>{'◇'.repeat(3 - ui.health)}</em></b></div>
          </div>

          <div className="run-hud run-hud-right">
            <div className="hud-title">{ui.phase === 3 ? 'FINAL STRETCH' : `PHASE 0${ui.phase}`}</div>
            <div className="chase-label">THE CHASER</div>
            <div className="chase-meter"><i style={{ width: `${gameRef.current.chaser}%` }} /></div>
            <div className="hud-small">DISTANCE FROM DANGER</div>
          </div>

          <div className="ability-hud">
            <span>SHIFT / E</span>
            <strong>{character.ability}</strong>
            <div><i style={{ width: `${ui.ability}%` }} /></div>
          </div>

          <div className="run-controls">
            <span><b>SPACE / W</b> JUMP</span>
            <span><b>S / ↓</b> SLIDE</span>
            <span><b>SHIFT / E</b> POWER</span>
          </div>

          <div className="run-touch-controls" aria-label="Game controls">
            <button type="button" onPointerDown={(e) => { e.preventDefault(); gameRef.current.jumpQueued = true; gameRef.current.keys.Space = true }} onPointerUp={() => { gameRef.current.keys.Space = false }} onPointerCancel={() => { gameRef.current.keys.Space = false }}>JUMP</button>
            <button type="button" onPointerDown={(e) => { e.preventDefault(); gameRef.current.keys.ArrowDown = true }} onPointerUp={() => { gameRef.current.keys.ArrowDown = false }} onPointerCancel={() => { gameRef.current.keys.ArrowDown = false }}>SLIDE</button>
            <button type="button" onPointerDown={(e) => { e.preventDefault(); if (gameRef.current.mode === 'playing' && gameRef.current.cooldown <= 0) activate(gameRef.current, characterKey) }}>POWER</button>
          </div>

          {ui.nearMiss > 0 && <div className="near-miss">CLEAN</div>}
        </>
      )}

      {state === 'dead' && (
        <div className="run-overlay dead-overlay">
          <div className="run-kicker">THE CHASER CAUGHT UP</div>
          <h1>{ui.distance}M</h1>
          <p>GOOD RUN. NOT GOOD ENOUGH.</p>
          <button type="button" onClick={restartGame}>RUN IT AGAIN</button>
          <small>PRESS R TO RESTART</small>
        </div>
      )}

      {state === 'victory' && (
        <div className="run-overlay victory-overlay">
          <div className="run-kicker">RUN COMPLETE</div>
          <h1>900M</h1>
          <p>YOU OUTRAN THE IMPOSSIBLE.</p>
          <div className="victory-score">SCORE // {Math.floor(ui.score).toLocaleString()}</div>
          <button type="button" onClick={() => onComplete?.({ xp: startingXP + 500, distance: FINISH, character: characterKey })}>
            SEE WHAT WAS WAITING AT THE END →
          </button>
        </div>
      )}
    </div>
  )
}

function makeGame(characterKey, xp) {
  return {
    mode: 'intro',
    finished: false,
    keys: {},
    last: 0,
    player: { x: 220, y: GROUND - 78, width: 64, height: 78, vy: 0, grounded: true, sliding: false, anim: 'run', phase: 0 },
    obstacles: [],
    particles: [],
    distance: 0,
    speed: 6.2,
    phase: 1,
    health: characterKey === 'disciplined' ? 4 : 3,
    xp,
    score: 0,
    chaser: 12,
    spawnTimer: 75,
    cooldown: 0,
    cooldownMax: 480,
    slowTimer: 0,
    senseTimer: 0,
    invulnerable: 0,
    shield: false,
    hitFlash: 0,
    nearMiss: 0,
    phaseFlash: 0,
    shake: 0,
    jumpLatch: false,
    jumpQueued: false,
    abilityLatch: false,
  }
}

function render(canvas, game, character) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const shakeX = game.shake > 0 ? (Math.random() - 0.5) * game.shake : 0
  const shakeY = game.shake > 0 ? (Math.random() - 0.5) * game.shake : 0
  game.shake = Math.max(0, game.shake - 0.45)
  ctx.save()
  ctx.translate(shakeX, shakeY)
  drawSky(ctx, game)
  drawCity(ctx, game)
  drawRoad(ctx, game)
  drawObstacles(ctx, game)
  drawChaser(ctx, game)
  drawRunner(ctx, game, character)
  drawParticles(ctx, game)
  if (game.hitFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${game.hitFlash / 55})`
    ctx.fillRect(0, 0, width, height)
  }
  ctx.restore()
}

function drawSky(ctx, game) {
  const g = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  g.addColorStop(0, game.phase === 3 ? '#110b18' : '#070a13')
  g.addColorStop(0.62, '#090d18')
  g.addColorStop(1, '#030407')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  const moonX = 1250 - game.distance * 0.04
  const moonY = 155
  ctx.shadowBlur = 45
  ctx.shadowColor = 'rgba(230,214,167,.18)'
  ctx.fillStyle = 'rgba(215,205,170,.18)'
  ctx.beginPath()
  ctx.arc(moonX, moonY, 66, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.strokeStyle = 'rgba(255,255,255,.08)'
  ctx.lineWidth = 2
  for (let i = 0; i < 70; i++) {
    const x = (i * 137 + game.distance * 4) % (WIDTH + 80) - 40
    const y = (i * 83) % 650
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 25); ctx.stroke()
  }
}

function drawCity(ctx, game) {
  const base = GROUND + 5
  for (let i = 0; i < 17; i++) {
    const w = 90 + (i % 4) * 34
    const h = 170 + ((i * 71) % 250)
    const x = ((i * 130 - game.distance * 2.2) % (WIDTH + 180)) - 180
    ctx.fillStyle = i % 2 ? '#0d1220' : '#101522'
    ctx.fillRect(x, base - h, w, h)
    for (let wy = base - h + 30; wy < base - 25; wy += 40) {
      for (let wx = x + 18; wx < x + w - 10; wx += 31) {
        const lit = ((i * 11 + Math.floor(wy) + Math.floor(wx)) % 7) < 2
        if (lit) { ctx.fillStyle = 'rgba(224,195,104,.28)'; ctx.fillRect(wx, wy, 4, 4) }
      }
    }
  }
}

function drawRoad(ctx, game) {
  ctx.fillStyle = '#05070c'
  ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND)
  ctx.strokeStyle = 'rgba(212,175,106,.35)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(WIDTH, GROUND); ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,.035)'
  ctx.lineWidth = 3
  const offset = (game.distance * 18) % 120
  for (let x = -120 + offset; x < WIDTH; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, GROUND + 30); ctx.lineTo(x - 42, HEIGHT); ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255,255,255,.035)'
  for (let i = 0; i < 16; i++) {
    const x = ((i * 183 - game.distance * 7) % (WIDTH + 160)) - 80
    ctx.fillRect(x, GROUND + 58 + (i % 3) * 28, 80, 3)
  }
}

function drawObstacles(ctx, game) {
  for (const o of game.obstacles) {
    ctx.save()
    if (game.senseTimer > 0) {
      ctx.shadowBlur = 22
      ctx.shadowColor = '#65c7ff'
    }
    if (o.kind === 'low') drawSpikeCluster(ctx, o.x, o.y, o.width, o.height)
    if (o.kind === 'overhead') drawBeam(ctx, o.x, o.y, o.width, o.height)
    if (o.kind === 'wall') drawGate(ctx, o.x, o.y, o.width, o.height)
    if (o.kind === 'drone') drawDrone(ctx, o)
    ctx.restore()
  }
}

function drawSpikeCluster(ctx, x, y, w, h) {
  ctx.fillStyle = '#1a1220'
  ctx.strokeStyle = '#d05b72'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, GROUND)
  for (let i = 0; i < 4; i++) {
    const px = x + i * (w / 4)
    ctx.lineTo(px + w / 8, y)
    ctx.lineTo(px + w / 4, GROUND)
  }
  ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#d05b72'
  ctx.globalAlpha = .5
  ctx.fillRect(x + 7, y + h - 5, w - 14, 3)
  ctx.globalAlpha = 1
}

function drawBeam(ctx, x, y, w, h) {
  ctx.fillStyle = '#111827'
  ctx.strokeStyle = '#7c8fc4'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 10, y + h); ctx.lineTo(x + 10, y + h); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(155,140,255,.45)'
  ctx.beginPath(); ctx.moveTo(x + 15, y + h - 8); ctx.lineTo(x + w - 15, y + h - 8); ctx.stroke()
}

function drawGate(ctx, x, y, w, h) {
  ctx.strokeStyle = '#a44f78'
  ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(x + 5, GROUND); ctx.lineTo(x + 5, y + 10); ctx.lineTo(x + w - 5, y + 10); ctx.lineTo(x + w - 5, GROUND); ctx.stroke()
  ctx.strokeStyle = 'rgba(212,175,106,.5)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 12); ctx.lineTo(x + w / 2, GROUND); ctx.stroke()
}

function drawDrone(ctx, o) {
  const y = o.baseY + Math.sin(o.anim * .11) * 18
  ctx.translate(0, y - o.y)
  ctx.fillStyle = '#101722'; ctx.strokeStyle = '#65c7ff'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(o.x, o.y + 22); ctx.lineTo(o.x + 18, o.y + 4); ctx.lineTo(o.x + 58, o.y + 4); ctx.lineTo(o.x + 76, o.y + 22); ctx.lineTo(o.x + 58, o.y + 44); ctx.lineTo(o.x + 18, o.y + 44); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = 'rgba(101,199,255,.4)'; ctx.beginPath(); ctx.moveTo(o.x + 8, o.y + 22); ctx.lineTo(o.x - 12, o.y + 12); ctx.moveTo(o.x + 68, o.y + 22); ctx.lineTo(o.x + 88, o.y + 12); ctx.stroke()
  ctx.fillStyle = '#e7c75f'; ctx.fillRect(o.x + 34, o.y + 19, 8, 5)
}

function drawChaser(ctx, game) {
  const x = Math.max(25, 155 - game.chaser * 1.05)
  const y = GROUND - 66
  ctx.save();
  ctx.globalAlpha = .3 + game.chaser / 180
  ctx.shadowBlur = 30; ctx.shadowColor = '#a44f78'
  ctx.strokeStyle = '#a44f78'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(x + 34, y + 12); ctx.lineTo(x + 14, y + 35); ctx.lineTo(x + 28, y + 54); ctx.lineTo(x + 42, y + 34); ctx.lineTo(x + 58, y + 54); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + 34, y + 12); ctx.lineTo(x + 48, y + 28); ctx.lineTo(x + 42, y + 58); ctx.stroke()
  ctx.restore()
}

function drawRunner(ctx, game, character) {
  const p = game.player
  const x = p.x
  const y = p.y
  const bob = p.grounded ? Math.sin(p.phase * .35) * 2.5 : 0
  p.phase += game.speed * .13
  const sliding = p.sliding
  const scaleX = sliding ? 1.28 : 1

  ctx.save()
  ctx.translate(x + 32, y + bob + 38)
  ctx.scale(scaleX, 1)
  if (game.invulnerable > 0) {
    ctx.shadowBlur = 28; ctx.shadowColor = character.color
    ctx.globalAlpha = .88
  }

  // Coat / torso: deliberately drawn as a single comic silhouette rather than UI geometry.
  ctx.fillStyle = '#151923'; ctx.strokeStyle = character.color; ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(-19, 30); ctx.lineTo(-13, -2); ctx.lineTo(-9, -19); ctx.lineTo(0, -27); ctx.lineTo(12, -20); ctx.lineTo(18, 3); ctx.lineTo(22, 30); ctx.lineTo(7, 35); ctx.lineTo(0, 28); ctx.lineTo(-8, 35); ctx.closePath(); ctx.fill(); ctx.stroke()

  // Head / hair.
  ctx.fillStyle = '#c99572'; ctx.strokeStyle = '#1a1720'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-8, -26); ctx.quadraticCurveTo(-3, -39, 9, -36); ctx.quadraticCurveTo(18, -33, 16, -21); ctx.lineTo(8, -15); ctx.lineTo(-5, -17); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#16151b'
  ctx.beginPath(); ctx.moveTo(-9, -27); ctx.quadraticCurveTo(-2, -43, 13, -36); ctx.lineTo(18, -28); ctx.lineTo(9, -31); ctx.lineTo(2, -25); ctx.lineTo(-3, -30); ctx.closePath(); ctx.fill()

  // Scarf and arm movement.
  ctx.strokeStyle = character.color; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(-9, -13); ctx.quadraticCurveTo(-20, 3, -4, 13); ctx.quadraticCurveTo(6, 21, 12, 7); ctx.stroke()
  ctx.strokeStyle = '#b87e63'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-23, 18 + (p.anim === 'run' ? Math.sin(p.phase) * 7 : 0)); ctx.moveTo(13, 0); ctx.lineTo(24, 18 - (p.anim === 'run' ? Math.sin(p.phase) * 7 : 0)); ctx.stroke()

  // Legs with proper running motion.
  ctx.strokeStyle = '#10131a'; ctx.lineWidth = 7
  const swing = p.grounded && !sliding ? Math.sin(p.phase) * 11 : 0
  ctx.beginPath(); ctx.moveTo(-7, 30); ctx.lineTo(-13 + swing, 50); ctx.lineTo(-20 - swing, 66); ctx.moveTo(7, 30); ctx.lineTo(13 - swing, 50); ctx.lineTo(20 + swing, 66); ctx.stroke()
  ctx.strokeStyle = character.color; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(-20 - swing, 66); ctx.lineTo(-29 - swing, 66); ctx.moveTo(20 + swing, 66); ctx.lineTo(29 + swing, 66); ctx.stroke()

  ctx.restore()
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life / 40)
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, 3, 3)
  }
  ctx.globalAlpha = 1
}
