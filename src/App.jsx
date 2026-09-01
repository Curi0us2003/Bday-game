import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import DebugPage from './components/DebugPage.jsx'
import DebugPanel from './components/DebugPanel.jsx'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/debug/*" element={<DebugPage />} />
      </Routes>

      {/* Developer-only navigation. Hidden until a debug shortcut is pressed. */}
      <DebugPanel />
    </>
  )
}
