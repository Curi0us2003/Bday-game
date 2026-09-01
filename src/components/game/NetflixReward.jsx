import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Volume2, VolumeX, Maximize, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import mainVideo from '../../assets/netflix/main-video.mp4'
import sinners from '../../assets/posters/sinners.jpg'
import prestige from '../../assets/posters/prestige.webp'
import hatingGame from '../../assets/posters/hating_game.webp'
import midnight from '../../assets/posters/midnight.webp'
import chef from '../../assets/posters/chef.webp'
import batman from '../../assets/posters/batman.webp'
import johnWick from '../../assets/posters/john.avif'
import aboutTime from '../../assets/posters/about.webp'
import pulpFiction from '../../assets/posters/pulp.webp'
import casinoRoyale from '../../assets/posters/casino.webp'
import inglorious from '../../assets/posters/inglorius.webp'
import gameOfThrones from '../../assets/posters/got.webp'

const posterModules = import.meta.glob('../../assets/posters/*', {
  eager: true,
  import: 'default',
})

const WATCHED_BASE = [
  ['Sinners', sinners],
  ['The Prestige', prestige],
  ['The Hating Game', hatingGame],
  ['Midnight in Paris', midnight],
  ['Chef', chef],
  ['The Batman', batman],
  ['John Wick', johnWick],
  ['About Time', aboutTime],
  ['Pulp Fiction', pulpFiction],
  ['Casino Royale', casinoRoyale],
  ['Inglourious Basterds', inglorious],
  ['Game of Thrones', gameOfThrones],
]

const seenPosterSet = new Set(WATCHED_BASE.map(([, src]) => src))

const posterTitleOverrides = {
  'about.webp': 'About Time',
  'caddo.avif': 'Caddo Lake',
  'crazy.avif': 'Crazy, Stupid, Love.',
  'demon.avif': 'Demon Slayer: Kimetsu no Yaiba',
  'footloose.webp': 'Footloose',
  'got.webp': 'Game of Thrones',
  'hail.webp': 'Hail Mary',
  'hits.avif': 'The Greatest Hits',
  'jerry.webp': 'Jerry Maguire',
  'jump.avif': '21 Jump Street',
  'liberal.webp': 'The Liberal Arts',
  'mummy.webp': 'The Mummy',
  'obsession.webp': 'Obsession',
  'oh_hi.webp': 'Oh, Hi!',
  'rental.avif': 'The Rental Family',
  'tropic.webp': 'Tropical Thunder',
}

const extraPosters = Object.entries(posterModules)
  .filter(([, src]) => src && !seenPosterSet.has(src))
  .map(([path, src]) => {
    const fileName = path.split('/').pop() ?? 'Poster'
    const baseName = fileName.replace(/\.[^/.]+$/, '')
    const title = posterTitleOverrides[fileName] ?? baseName
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

    return [title, src]
  })

const WATCHED = [...WATCHED_BASE, ...extraPosters]

export default function NetflixReward({ gameSong, onContinue }) {
  const videoRef = useRef(null)
  const trackRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [captions, setCaptions] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [carouselStart, setCarouselStart] = useState(0)
  const [videoError, setVideoError] = useState('')

  const syncCaptions = (enabled) => {
    const track = trackRef.current?.track
    if (track) track.mode = enabled ? 'showing' : 'hidden'
  }

  const leaveVideo = () => {
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    }
    setPlaying(false)
    setShowVideo(false)
    gameSong?.play?.()
  }

  const enterVideo = () => {
    const video = videoRef.current
    if (!video) return

    // Keep this entirely inside the original click handler. Waiting for
    // canplay/metadata can lose Chromium's transient user-gesture permission
    // and leave an unmuted video stuck at 0:00. The browser can queue play()
    // while the MP4 is buffering.
    gameSong?.pause?.()
    setVideoError('')
    setShowVideo(true)
    video.muted = false
    video.controls = false

    const playback = video.play()

    if (playback?.then) {
      playback
        .then(() => setPlaying(true))
        .catch((error) => {
          console.error('Netflix video could not start:', error)
          setPlaying(false)
          setVideoError('VIDEO COULD NOT START. CLICK PLAY AGAIN.')
        })
    } else {
      setPlaying(true)
    }

    // Fullscreen remains intentional. It is non-blocking so a fullscreen
    // rejection can never prevent the video from starting.
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {})
    }
  }

  const toggleCaptions = () => {
    setCaptions((current) => {
      const next = !current
      syncCaptions(next)
      return next
    })
  }

  useEffect(() => {
    syncCaptions(captions)
  }, [captions])

  // Keep the GOT theme alive while Netflix is merely being browsed.
  // It yields audio focus only when the actual video starts.
  useEffect(() => {
    gameSong?.play?.()
    return () => {
      videoRef.current?.pause()
      gameSong?.play?.()
    }
    // Intentionally run once for the Netflix screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const update = () => {
      if (!video.duration) return
      setProgress((video.currentTime / video.duration) * 100)
    }

    const onPlay = () => {
      setPlaying(true)
      gameSong?.pause?.()
    }

    const onPause = () => setPlaying(false)

    video.addEventListener('timeupdate', update)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    return () => {
      video.removeEventListener('timeupdate', update)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [gameSong])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' || !showVideo) return
      event.preventDefault()
      leaveVideo()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showVideo])

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && showVideo && playing) {
        leaveVideo()
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [showVideo, playing])


  const visiblePosters = WATCHED.slice(carouselStart, carouselStart + 6)
  const canBack = carouselStart > 0
  const canForward = carouselStart + 6 < WATCHED.length

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="relative min-h-screen overflow-hidden bg-[#050505] text-white"
    >
      <header className="sticky top-0 z-40 flex h-16 items-center gap-7 bg-gradient-to-b from-black via-black/95 to-transparent px-5 md:px-10">
        <div className="font-sans text-2xl font-black tracking-[-0.08em] text-[#e50914]">N</div>
        <nav className="hidden md:flex items-center gap-5 text-xs text-white/75">
          <span className="font-semibold text-white">Home</span>
          <span>Movies</span>
          <span>Series</span>
          <span>My List</span>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-xs text-white/60">
          <span className="hidden sm:inline">TUSHAR</span>
          <div className="grid h-7 w-7 place-items-center rounded bg-[#e50914] font-bold">T</div>
        </div>
      </header>

      <section className="relative mx-auto -mt-2 w-full max-w-[1500px] px-4 pb-8 md:px-8">
        <div className="relative aspect-video overflow-hidden rounded-sm bg-neutral-900 shadow-2xl">
          <video
            ref={videoRef}
            src={mainVideo}
            className="h-full w-full object-cover"
            playsInline
            preload="none"
            controlsList="nodownload noplaybackrate"
            onLoadedMetadata={() => syncCaptions(captions)}
            onError={() => setVideoError('VIDEO COULD NOT BE LOADED. CHECK THE MP4 FILE PATH.')}
            onClick={(event) => {
              event.stopPropagation()
              if (!showVideo) {
                enterVideo()
                return
              }
              if (playing) {
                videoRef.current?.pause()
              } else {
                videoRef.current?.play().catch((error) => console.error('Netflix video play failed:', error))
              }
            }}
          >
            <track
              ref={trackRef}
              kind="subtitles"
              src="/assets/netflix/captions.vtt"
              srcLang="en"
              label="English"
            />
          </video>

          {!showVideo && (
            <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/90 via-black/45 to-transparent">
              <div className="max-w-xl px-7 md:px-14">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#e50914]">A Netflix Original-ish</p>
                <h1 className="text-4xl font-black tracking-tight md:text-7xl">ONE MORE THING.</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/75 md:text-base">
                  You cleared the archive. Now there is one final reward waiting in your watchlist.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      enterVideo()
                    }}
                    className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/85"
                  >
                    <Play size={17} fill="currentColor" /> Play
                  </button>
                  <button
                    type="button"
                    onClick={toggleCaptions}
                    className={`rounded px-5 py-2.5 text-sm font-semibold ${captions ? 'bg-white text-black' : 'bg-white/15 text-white hover:bg-white/25'}`}
                  >
                    CC
                  </button>
                </div>
              </div>
            </div>
          )}

          {showVideo && (
            <>
              {videoError && (
                <div className="absolute left-5 top-5 z-20 rounded border border-red-500/40 bg-black/85 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-red-300">
                  {videoError}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent px-5 pb-5 pt-16">
              <div className="h-1 w-full overflow-hidden rounded bg-white/20">
                <div className="h-full bg-[#e50914]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-4">
                <button type="button" onClick={() => (playing ? videoRef.current?.pause() : videoRef.current?.play())} className="text-white hover:text-white/70">
                  {playing ? 'Ⅱ' : <Play size={20} fill="currentColor" />}
                </button>
                <button type="button" onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted) }}>
                  {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>
                <button type="button" onClick={toggleCaptions} className={`rounded border px-2 py-1 text-[10px] font-bold ${captions ? 'border-white text-white' : 'border-white/40 text-white/60'}`}>CC</button>
                <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-white/50">ESC to return</span>
                <button type="button" onClick={leaveVideo} aria-label="Exit video" className="hover:text-white/70"><X size={21} /></button>
              </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">Because apparently one gift wasn't enough</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold md:text-2xl">Movies We Somehow Ended Up Watching Together</h2>
            <div className="flex gap-2">
              <button disabled={!canBack} onClick={() => setCarouselStart((n) => Math.max(0, n - 3))} className="grid h-8 w-8 place-items-center rounded bg-white/10 disabled:opacity-20"><ChevronLeft size={18} /></button>
              <button disabled={!canForward} onClick={() => setCarouselStart((n) => Math.min(WATCHED.length - 6, n + 3))} className="grid h-8 w-8 place-items-center rounded bg-white/10 disabled:opacity-20"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {visiblePosters.map(([title, src]) => (
              <PosterCard key={title} title={title} src={src} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/45">My List</p>
            <p className="mt-2 text-sm text-white/70">A suspiciously specific collection of things we watched, argued about, and somehow finished.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/45">Subtitles</p>
            <p className="mt-2 text-sm text-white/70">CC is powered by a WebVTT file, so you can change the captions later without editing the video.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/45">Reward</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/70"><Check size={15} className="text-[#46d369]" /> ONE MONTH OF CINEMA</p>
          </div>
        </section>

        {onContinue && (
          <div className="mt-12 flex justify-center border-t border-white/10 pt-8 pb-12">
            <button
              type="button"
              onClick={onContinue}
              className="group flex items-center gap-3 border border-red-600/60 bg-red-600/5 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-red-400 transition-all hover:border-red-500 hover:bg-red-600/10 hover:text-red-300"
            >
              Continue to Level 03
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        )}
      </section>
    </motion.main>
  )
}

function PosterCard({ title, src }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-sm bg-gradient-to-br from-neutral-800 via-neutral-950 to-black ring-1 ring-white/10">
      {!failed && (
        <img
          src={src}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black via-black/35 to-transparent p-4 text-center">
          <span className="text-xs font-bold text-white/90">{title}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
      <p className="absolute inset-x-3 bottom-3 text-xs font-semibold leading-4 text-white drop-shadow-md">{title}</p>
    </div>
  )
}
