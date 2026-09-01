import disciplinedImage from '../assets/characters/disciplined.jpg'
import cinephileImage from '../assets/characters/cinephile.jpg'
import detectiveImage from '../assets/characters/detective.jpg'
import shadowWeaverImage from '../assets/characters/shadow-weaver.jpg'

// Character choices only affect Level 3. Levels 1 and 2 intentionally ignore
// this selection so the earlier birthday experience stays unchanged.
export const characters = [
  {
    id: 'disciplined', number: '01', title: 'THE DISCIPLINED ONE', powerName: 'IRON ROUTINE',
    power: '+25 MAX HP + STEADY RECOVERY',
    stats: [{ label: 'ROUTINE', value: 5 }, { label: 'ENDURANCE', value: 5 }, { label: 'CONSISTENCY', value: 5 }],
    description: 'Does not panic. Does not quit. Probably has a routine for surviving a multiverse breach.', image: disciplinedImage,
  },
  {
    id: 'cinephile', number: '02', title: 'THE CINEPHILE', powerName: 'SLOW MOTION',
    power: 'HITS SLOW HOSTILES FOR 2.5s',
    stats: [{ label: 'MOVIES', value: 5 }, { label: 'AWARENESS', value: 5 }, { label: 'TIMING', value: 5 }],
    description: 'Has seen enough action movies to know exactly when the dramatic dodge is coming.', image: cinephileImage,
  },
  {
    id: 'detective', number: '03', title: 'THE DETECTIVE', powerName: 'BAT-SENSE',
    power: 'REVEALS TRAPS + THE REAL BOSS',
    stats: [{ label: 'BATMAN', value: 5 }, { label: 'OBSERVATION', value: 5 }, { label: 'DEDUCTION', value: 5 }],
    description: 'Probably noticed the trap before the trap was finished being built.', image: detectiveImage,
  },
  {
    id: 'shadow-weaver', number: '04', title: 'THE SHADOW WEAVER', powerName: 'VOID STEP',
    power: 'DOUBLE JUMP + SHADOW DASH',
    stats: [{ label: 'DISCIPLINE', value: 5 }, { label: 'TECHNIQUE', value: 5 }, { label: 'FOCUS', value: 5 }],
    description: 'The classified form. Move like a shadow. Strike like something that never existed.', image: shadowWeaverImage,
  },
]
