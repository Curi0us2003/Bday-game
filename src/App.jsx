import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import DebugPanel from './components/DebugPanel.jsx'
import SceneLoader from './components/common/SceneLoader.jsx'

// DebugPage statically imports every scene in the game. Loading it eagerly
// pulled all of them back into the main chunk and cancelled out the code
// splitting in BirthdayExperience, so the dev route is split off too.
const DebugPage = lazy(() => import('./components/DebugPage.jsx'))

export default function App() {
  return (
    <>
      <Suspense fallback={<SceneLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/debug/*" element={<DebugPage />} />
        </Routes>
      </Suspense>

      {/* Developer-only navigation. Hidden until a debug shortcut is pressed. */}
      <DebugPanel />
    </>
  )
}
