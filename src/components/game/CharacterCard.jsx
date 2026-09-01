import { motion } from 'framer-motion'

export default function CharacterCard({ character, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(character.id)}
      whileHover={{ y: -8 }}
      animate={{
        scale: selected ? 1.02 : 1,
        opacity: selected === false ? 0.58 : 1,
      }}
      transition={{ duration: 0.25 }}
      className={`group relative min-h-[570px] overflow-hidden border text-left bg-[#050507] transition-all duration-300 ${
        selected
          ? 'border-gold shadow-[0_0_45px_-10px_rgba(212,175,106,0.75)]'
          : 'border-white/10 hover:border-gold/60'
      }`}
    >
      <div className="relative h-[315px] overflow-hidden bg-black">
        <img
          src={character.image}
          alt={character.title}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050507] to-transparent" />
        <span className="absolute left-4 top-4 font-mono text-[10px] tracking-[0.3em] text-gold">{character.number}</span>
        <span className="absolute right-4 top-4 border border-white/15 bg-black/65 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/70">
          LEVEL 03
        </span>
      </div>

      <div className="relative p-5 pt-2">
        <p className="heading-display text-base tracking-[0.08em] text-bone">{character.title}</p>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
          POWER // {character.powerName}
        </p>
        <p className="mt-2 min-h-8 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-white/65">
          {character.power}
        </p>

        <div className="mt-4 space-y-1.5 border-y border-white/10 py-3">
          {character.stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between gap-3 font-mono text-[8px] uppercase tracking-[0.12em] text-white/50">
              <span>{stat.label}</span>
              <span className="text-gold tracking-[-0.12em]">{'▰'.repeat(stat.value)}{'▱'.repeat(Math.max(0, 5 - stat.value))}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 min-h-[46px] text-[12px] leading-5 text-white/55 italic">{character.description}</p>

        <div className={`mt-4 font-mono text-[8px] uppercase tracking-[0.22em] transition-opacity ${selected ? 'text-gold opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>
          {selected ? 'FORM SELECTED // POWER ARMED' : 'SELECT FORM'}
        </div>
      </div>
    </motion.button>
  )
}
