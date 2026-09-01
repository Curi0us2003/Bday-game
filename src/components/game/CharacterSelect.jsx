import { useState } from 'react'
import { motion } from 'framer-motion'
import CharacterCard from './CharacterCard.jsx'
import { characters } from '../../data/characterData.js'
import { gameConfig } from '../../data/gameConfig.js'

export default function CharacterSelect({ onSelect }) {
  const [selectedId, setSelectedId] = useState(null)
  const { title, subtitle, cta } = gameConfig.characterSelect

  return (
    <div className="relative w-full max-w-[1420px] px-2 md:px-5 py-4 md:py-8">
      <div className="pointer-events-none absolute inset-0 border border-gold/20" />
      <div className="pointer-events-none absolute -left-px -top-px h-8 w-8 border-l border-t border-gold" />
      <div className="pointer-events-none absolute -right-px -top-px h-8 w-8 border-r border-t border-gold" />
      <div className="pointer-events-none absolute -left-px -bottom-px h-8 w-8 border-l border-b border-gold" />
      <div className="pointer-events-none absolute -right-px -bottom-px h-8 w-8 border-r border-b border-gold" />

      <div className="relative z-10 text-center">
        <p className="label-mono text-gold">LEVEL 03 // LOADOUT</p>
        <h2 className="mt-2 heading-display text-3xl md:text-5xl tracking-[0.08em] text-gold">{title}</h2>
        <p className="mx-auto mt-3 max-w-3xl font-mono text-[10px] md:text-xs uppercase tracking-[0.22em] leading-6 text-white/55">
          {subtitle}
        </p>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.28em] text-white/30">
          Your choice sleeps through Levels 01–02. It wakes when the archive breaks.
        </p>
      </div>

      <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={selectedId === character.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      <div className="relative z-10 mt-6 flex min-h-14 items-center justify-center">
        {selectedId ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={() => onSelect(selectedId)}
            className="group relative border border-gold bg-gold/5 px-12 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold shadow-[0_0_28px_rgba(212,175,106,0.12)] transition-all hover:bg-gold/10 hover:shadow-[0_0_36px_rgba(212,175,106,0.22)]"
          >
            <span>{cta}</span>
            <span className="ml-4 transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        ) : (
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">Select a form to arm its power</p>
        )}
      </div>
    </div>
  )
}
