import { useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import useMicrophoneBlow from '../../hooks/useMicrophoneBlow.js'
import { birthdayConfig } from '../../data/birthdayConfig.js'

// active=false tells this component the interaction is over (all candles
// out) so it releases the microphone. onBlow fires once per sustained
// blow (extinguishes one candle); onFallbackBlow fires once per tap and
// extinguishes everything remaining, since a tap can't "keep blowing".
export default function MicrophoneBlow({ active, onBlow, onFallbackBlow }) {
  const { threshold, blowDurationMs, cooldownMs } = birthdayConfig.microphone
  const { start, stop, status } = useMicrophoneBlow({
    threshold,
    blowDurationMs,
    cooldownMs,
    onBlowDetected: onBlow,
  })

  useEffect(() => {
    if (!active) stop()
  }, [active, stop])

  if (!active) return null

  const showFallback = status === 'unsupported' || status === 'denied'

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      {!showFallback && (
        <>
          <p className="label-mono">
            {status === 'listening' ? 'Blow out the candles.' : 'Ready when you are.'}
          </p>
          <button
            onClick={start}
            disabled={status === 'listening' || status === 'requesting'}
            className="flex items-center gap-2 border border-gold/40 rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest2 text-ash hover:text-bone hover:border-gold transition-colors duration-ui disabled:opacity-60"
          >
            <Mic size={14} className={status === 'listening' ? 'text-gold' : ''} />
            {status === 'listening'
              ? 'Microphone ready'
              : status === 'requesting'
              ? 'Requesting…'
              : 'Enable microphone'}
          </button>
        </>
      )}

      {showFallback && (
        <div className="flex flex-col items-center gap-3">
          <p className="label-mono flex items-center gap-2">
            <MicOff size={14} /> Can&apos;t use the microphone?
          </p>
          <button
            onClick={onFallbackBlow}
            className="border border-gold/40 rounded-full px-5 py-2 text-xs font-mono uppercase tracking-widest2 text-bone hover:border-gold transition-colors duration-ui"
          >
            Tap to blow
          </button>
        </div>
      )}
    </div>
  )
}
