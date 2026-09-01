import Candle from './Candle.jsx'

export default function Cake({ candleCount, litCandles, extinguished = false }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute top-0 w-72 h-48 rounded-full bg-amber/25 blur-3xl pointer-events-none" />

      <div className="flex items-end gap-3 mb-[-6px] z-10 relative">
        {Array.from({ length: candleCount }).map((_, i) => (
          <Candle key={i} lit={litCandles[i]} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center drop-shadow-[0_12px_30px_rgba(169,119,47,0.18)]">
        <div className="w-40 h-7 rounded-t-lg bg-gradient-to-b from-[#fff4dc] via-[#f2dfb4] to-[#dfc58c] shadow-[0_0_28px_-8px_rgba(242,223,180,0.65)]" />
        <div className="w-44 h-1.5 bg-gradient-to-r from-gold via-[#e6c878] to-gold" />
        <div className="w-40 h-14 bg-gradient-to-b from-[#5a2e19] via-[#402115] to-[#2a160d] border-x border-[#1c110a]" />
        <div className="w-48 h-1.5 bg-gradient-to-r from-gold via-[#e6c878] to-gold" />
        <div className="w-56 h-20 rounded-b-md bg-gradient-to-b from-[#472316] via-[#30180e] to-[#1c0d08] border-x border-b border-[#120b06]" />
        <div className="w-72 h-2.5 rounded-full bg-[#211009] border-t border-gold/30 mt-2" />
      </div>

      {extinguished && (
        <div className="absolute -bottom-12 w-64 h-8 rounded-full bg-gold/15 blur-2xl pointer-events-none" />
      )}
    </div>
  )
}
