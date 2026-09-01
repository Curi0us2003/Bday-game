import React from 'react'

export default class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('[THE ARCHIVE] Scene error:', error)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="min-h-screen w-screen bg-void text-bone flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <p className="label-mono text-gold mb-4">ARCHIVE RECOVERY</p>
          <h1 className="heading-display text-3xl mb-4">The next scene lost its signal.</h1>
          <p className="text-ash text-sm leading-relaxed mb-7">
            Nothing is lost. Reload the archive and continue from the beginning.
          </p>
          <button
            onClick={this.handleReload}
            className="px-7 py-3 border border-gold/50 text-bone font-mono text-xs uppercase tracking-widest2 hover:border-gold transition-colors"
          >
            [ REOPEN ARCHIVE ]
          </button>
        </div>
      </main>
    )
  }
}
