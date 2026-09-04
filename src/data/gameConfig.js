// All Layer 3 (game-mode) copy and HUD data. Kept separate from
// birthdayConfig.js since it's tonally and structurally a different act.

export const gameConfig = {
  awakening: {
    systemLine: 'SYSTEM INITIALIZING...',
    archiveLine: 'ARCHIVE CONNECTION ESTABLISHED',
    playerDetectedLine: 'PLAYER DETECTED',
    playerLabel: 'PLAYER:',
    profileLoadedLine: 'PROFILE LOADED',
    missionAvailableLine: 'MISSION AVAILABLE',
  },

  hud: {
    mission: '01',
    xp: '000',
    inventory: 'LOCKED',
    // Playful game stats, not real psychological measurements.
    stats: [
      { label: 'DISCIPLINE', value: 10 },
      { label: 'CURIOSITY', value: 8 },
      { label: 'CINEPHILE', value: 10 },
      { label: 'CONSISTENCY', value: 10 },
    ],
  },

  missionProtocol: {
    title: 'MISSION PROTOCOL',
    lines: [
      'This is no longer a birthday website.',
      'You have entered a game.',
      'Every level contains something\nI wanted you to remember.',
      'Pass every level.',
      'Each level unlocks another part of your present.',
      'Failing is allowed.',
      "But giving up isn't.",
    ],
    cta: 'ACCEPT MISSION',
  },

  characterSelect: {
    title: 'CHOOSE YOUR FORM',
    subtitle: 'Your identity. Your power. Your story. Choose the form that will face what comes through the breach.',
    cta: 'CONFIRM YOUR FORM',
  },

  level3: {
    reward: 'BIRTHDAY DLC // PHYSICAL REWARD TO BE REVEALED',
  },

  level1: {
  levelLabel: 'LEVEL 01',
  levelTitle: 'THE FIRST MEMORY',

  preparing: 'MISSION PREPARING...',

  instruction: 'Enter the date that started it all.',

  clues: [
    'You took me somewhere on this day.',
    'It happened in July.',
    'well..I said no to coffee..but',
  ],

  successMessage: 'MEMORY UNLOCKED.',

  memoryMessage: `So yes, it was Pronto — our first date.

Thank you for that lovely bracelet, and for introducing me to that amazing ramen and burger place. You made me SO full that day, I genuinely thought I wouldn't be able to walk after the ice cream at Ibaco. 😭

But honestly? It was completely worth it.

I really loved that day — the food, the evening, and just being there with you.

And if I'm being honest, I really wish that evening didn't have to end so soon. ❤️`,
},

  level2: {
    title: 'THE YOKAI ARCHIVE',

    // Crossword layout for Level 02. Rows and columns are intentionally
    // fixed so the visual puzzle stays stable across browsers.
    entries: [
      {
        id: 'prestige',
        category: 'MOVIE',
        clue: 'Are you watching closely?',
        answer: 'PRESTIGE',
        row: 8,
        col: 4,
        direction: 'across',
        success: 'The third act is revealed.',
        memoryLine: 'You made me watch this one... and honestly, the obsession was justified.',
        wrong: 'Not quite. Look closer.',
      },
      {
        id: 'batman',
        category: 'CHARACTER',
        clue: 'He has a rule. The villains keep testing it.',
        answer: 'BATMAN',
        row: 6,
        col: 8,
        direction: 'down',
        success: 'Gotham approves.',
        memoryLine: 'Thanks for making me watch this. It was long overdue.',
        wrong: 'Even Gotham would be disappointed.',
      },
      {
        id: 'cruise',
        category: 'ACTOR',
        clue: 'The actor who played Jerry Maguire.',
        answer: 'CRUISE',
        row: 3,
        col: 6,
        direction: 'down',
        success: 'It was a easy one for you',
        memoryLine: 'I know you didnt love it, but it was sweet',
        wrong: 'You have definitely seen this movie. Think again.',
      },
      {
        id: 'pulpfiction',
        category: 'MOVIE',
        clue: 'What’s in the briefcase?',
        answer: 'PULPFICTION',
        row: 3,
        col: 0,
        direction: 'across',
        success: 'You remembered the briefcase.',
        memoryLine: 'Never thought robbing a diner scene will lead to this',
        wrong: 'We start in a diner and end in a diner',
      },
      {
        id: 'craig',
        category: 'ACTOR',
        clue: 'Before the martinis, there was one very expensive poker game.',
        answer: 'CRAIG',
        row: 0,
        col: 8,
        direction: 'down',
        success: 'Bond would approve.',
        memoryLine: 'Whatever I am..I am yours.',
        wrong: 'The casino is not convinced.',
      },
      {
        id: 'got',
        category: 'SERIES',
        clue: 'A man has no name',
        answer: 'GOT',
        row: 8,
        col: 10,
        direction: 'down',
        success: 'Winter is coming. But you got this one right.',
        memoryLine: 'Everytime I started liking a character...',
        wrong: 'Valar Morghulis.',
      },
      {
        id: 'dandadan',
        category: 'ANIME',
        clue: 'Never underestimate a grandma.',
        answer: 'DANDADAN',
        row: 11,
        col: 1,
        direction: 'across',
        success: 'Momo and Okarun <3',
        memoryLine: 'I judged you a bit when you recommended it to me xD',
        wrong: 'Turbo Granny?',
      },
      {
        id: 'nolan',
        category: 'DIRECTOR',
        clue: 'He said ‘what if we made it complicated?’ and built a career.',
        answer: 'NOLAN',
        row: 11,
        col: 3,
        direction: 'down',
        success: 'Christopher would probably give you a nod.',
        memoryLine: 'Thanks for making me obsessed with his films.',
        wrong: 'Think of the man behind the camera.',
      },
      {
        id: 'tumbbad',
        category: 'MOVIE',
        clue: 'The first rule of wealth: never ask where it came from',
        answer: 'TUMBBAD',
        row: 2,
        col: 1,
        direction: 'down',
        success: 'I knew you would get this one',
        memoryLine: 'It was slightly scary, but I had you beside me..',
        wrong: 'Something ancient just woke up. Try again.',
      },
      {
        id: 'sinners',
        category: 'MOVIE',
        clue: 'You can not outrun what you invited in',
        answer: 'SINNERS',
        row: 15,
        col: 0,
        direction: 'across',
        success: 'You heard the blues.',
        memoryLine: 'Our first movie together <3',
        wrong: 'The night is not over yet.',
      },
      {
        id: 'chef',
        category: 'MOVIE',
        clue: 'The best reviews are not always written by critics.',
        answer: 'CHEF',
        row: 0,
        col: 4,
        direction: 'down',
        success: 'That’s a chef’s kiss.',
        memoryLine: 'This was such a wholesome movie. I loved it.',
        wrong: 'Back to the kitchen. Try again.',
      },
    ],
  },
}