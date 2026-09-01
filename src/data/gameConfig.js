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
        clue: 'Two magicians. One obsession. And absolutely no healthy communication.',
        answer: 'PRESTIGE',
        row: 8,
        col: 4,
        direction: 'across',
        success: 'The illusion is broken. You remembered it.',
        memoryLine: 'You made me watch this one... and honestly, the obsession was justified.',
        wrong: 'Not quite. Look closer.',
      },
      {
        id: 'batman',
        category: 'MOVIE',
        clue: 'Gotham\'s billionaire with unresolved childhood trauma and a rather expensive night-time hobby.',
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
        success: 'Correct. The archive remembers.',
        memoryLine: 'Jerry Maguire, Tom Cruise... apparently this one earned its place in our archive.',
        wrong: 'You have definitely seen this movie. Think again.',
      },
      {
        id: 'pulpfiction',
        category: 'MOVIE',
        clue: 'A briefcase, hitmen, burgers, dancing and several stories that somehow collide.',
        answer: 'PULPFICTION',
        row: 3,
        col: 0,
        direction: 'across',
        success: 'You remembered the briefcase.',
        memoryLine: 'A briefcase, burgers, chaos... somehow this became one of our movie memories.',
        wrong: 'That answer has been rejected by the archive.',
      },
      {
        id: 'craig',
        category: 'ACTOR',
        clue: 'Daniel ___, James Bond in Casino Royale.',
        answer: 'CRAIG',
        row: 0,
        col: 8,
        direction: 'down',
        success: 'Bond would approve.',
        memoryLine: 'Casino Royale — proof that our watchlist can still produce a very good Bond debate.',
        wrong: 'The casino is not convinced.',
      },
      {
        id: 'got',
        category: 'SERIES',
        clue: 'The series where the Iron Throne caused approximately 9000 problems.',
        answer: 'GOT',
        row: 8,
        col: 10,
        direction: 'down',
        success: 'Winter is coming. But you got this one right.',
        memoryLine: 'We really chose a show where remembering everyone is basically a survival skill.',
        wrong: 'The Iron Throne rejects your answer.',
      },
      {
        id: 'dandadan',
        category: 'ANIME',
        clue: 'Aliens, ghosts, teenagers and absolutely no possibility of having a normal day.',
        answer: 'DANDADAN',
        row: 11,
        col: 1,
        direction: 'across',
        success: 'The paranormal archive opens.',
        memoryLine: 'Our shared taste clearly has absolutely no respect for normal.',
        wrong: 'Something paranormal just rejected that answer.',
      },
      {
        id: 'nolan',
        category: 'DIRECTOR',
        clue: 'The director behind The Prestige and The Dark Knight.',
        answer: 'NOLAN',
        row: 11,
        col: 3,
        direction: 'down',
        success: 'Christopher would probably give you a nod.',
        memoryLine: 'Of course the man behind half our complicated movie conversations had to be here.',
        wrong: 'Think of the man behind the camera.',
      },
      {
        id: 'tumbbad',
        category: 'MOVIE',
        clue: 'An old Indian village, a curse, and a creature that absolutely does not want visitors.',
        answer: 'TUMBBAD',
        row: 2,
        col: 1,
        direction: 'down',
        success: 'The creature retreats into the darkness.',
        memoryLine: 'Still one of the creepiest things we watched. Excellent choice, slightly questionable sleep schedule.',
        wrong: 'Something ancient just woke up. Try again.',
      },
      {
        id: 'sinners',
        category: 'MOVIE',
        clue: 'Twins, a juke joint, and a night that gets much darker than expected.',
        answer: 'SINNERS',
        row: 15,
        col: 0,
        direction: 'across',
        success: 'Yokai defeated. You actually remembered that one.',
        memoryLine: 'That one escalated very quickly. You picked a good one.',
        wrong: 'The night is not over yet.',
      },
      {
        id: 'chef',
        category: 'MOVIE',
        clue: 'A chef leaves his fancy restaurant life and finds his passion again on a food truck.',
        answer: 'CHEF',
        row: 0,
        col: 4,
        direction: 'down',
        success: 'Okay, that one deserved the XP.',
        memoryLine: 'A movie about food was always going to be dangerous for us.',
        wrong: 'The kitchen remains closed.',
      },
    ],
  },
}