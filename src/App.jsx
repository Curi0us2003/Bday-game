import { Suspense, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import SceneLoader from './components/common/SceneLoader.jsx'

// The debug overlay lives in src/debug/, which is gitignored, so it never
// reaches a deployment. import.meta.glob returns {} when the folder is absent,
// which is what lets a clean clone still build — a plain `import` of a
// gitignored file would break the build for everyone else.
const debugModules = import.meta.glob('./debug/DebugOverlay.jsx')

function useDebugOverlay() {
  const [Overlay, setOverlay] = useState(null)

  useEffect(() => {
    // Compile-time constant: this branch (and the dynamic import inside it) is
    // eliminated from a production bundle.
    if (!import.meta.env.DEV) return
    const load = debugModules['./debug/DebugOverlay.jsx']
    if (!load) return
    load()
      .then((mod) => setOverlay(() => mod.default))
      .catch(() => {}) // no debug folder checked out: carry on silently
  }, [])

  return Overlay
}

export default function App() {
  const DebugOverlay = useDebugOverlay()

  return (
    <>
      <Suspense fallback={<SceneLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Suspense>

      {DebugOverlay ? <DebugOverlay /> : null}
    </>
  )
}
