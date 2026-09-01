import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import SceneErrorBoundary from './components/SceneErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* index.css already honours prefers-reduced-motion for CSS animations;
          this extends the same respect to every Framer Motion animation. */}
      <MotionConfig reducedMotion="user">
        <SceneErrorBoundary>
          <App />
        </SceneErrorBoundary>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
)
