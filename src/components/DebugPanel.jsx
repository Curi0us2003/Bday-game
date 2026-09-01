import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const DESTINATIONS = [
  { label: 'LEVEL 01', path: '/debug/level1' },
  { label: 'MISSION 02 PREP', path: '/debug/prep2' },
  { label: 'LEVEL 02', path: '/debug/level2' },
  { label: 'NETFLIX', path: '/debug/netflix' },
  { label: 'LV3 TRANSITION', path: '/debug/level3-transition' },
  { label: 'LEVEL 03', path: '/debug/level3' },
  { label: 'LV3 ENDING', path: '/debug/level3-ending' },
  { label: 'MEMORY LANE', path: '/debug/memory-lane' },
  { label: 'HOME', path: '/' },
]

function isTypingTarget(target) {
  if (!target) return false
  const tag = target.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

export default function DebugPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      // F8 is the reliable primary shortcut. The other two are kept as aliases.
      const toggle =
        event.code === 'F8' ||
        (event.ctrlKey && event.shiftKey && event.code === 'KeyG') ||
        (event.altKey && event.shiftKey && event.code === 'KeyD')

      if (toggle) {
        event.preventDefault()
        event.stopPropagation()
        setOpen((value) => !value)
        return
      }

      // Direct emergency shortcut: jump straight to the final memory-lane debug page.
      if (!isTypingTarget(event.target) && event.ctrlKey && event.shiftKey && event.code === 'KeyM') {
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        navigate('/debug/memory-lane')
        return
      }

      if (event.code === 'Escape') setOpen(false)
    }

    // Capture phase makes the shortcut work even when a game component has its own key listener.
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [navigate])

  if (!open) return null

  const go = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-[99999] w-72 border border-gold/40 bg-black/95 p-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ash shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between border-b border-gold/20 pb-3">
        <span className="text-gold">DEV // ARCHIVE</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ash transition-colors hover:text-bone"
          aria-label="Close debug panel"
        >
          ESC
        </button>
      </div>

      <div className="mb-3 text-[8px] tracking-[0.12em] text-ash/60">
        CURRENT // {location.pathname}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DESTINATIONS.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => go(item.path)}
            className="border border-gold/20 px-2 py-2 text-gold transition-all hover:border-gold/70 hover:bg-gold/10 hover:text-bone"
          >
            {item.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 w-full border border-crimson/30 px-2 py-2 text-crimson-bright transition-all hover:border-crimson-bright hover:bg-crimson/10"
      >
        RELOAD PAGE
      </button>

      <div className="mt-3 border-t border-gold/10 pt-3 text-center text-[8px] leading-relaxed tracking-[0.1em] text-ash/50">
        F8 // OPEN / CLOSE<br />
        CTRL + SHIFT + G // ALIAS<br />
        CTRL + SHIFT + M // MEMORY LANE
      </div>
    </div>
  )
}
