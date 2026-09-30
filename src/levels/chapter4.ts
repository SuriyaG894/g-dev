import type { LevelDef } from '../game/types'

const MIRROR = ['pluck', 'place', 'mirror'] as LevelDef['powers']

/** Page 1: mirages, and the mirror. */
const mirage: LevelDef = {
  id: '4-1',
  chapter: 4,
  page: 1,
  title: 'Mirage',
  subtitle: 'the edge of the Mirror Desert',
  theme: 'desert',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 260 },
  terrain: [
    { x: 0, y: 460, w: 800, h: 80 },
    { x: 1100, y: 460, w: 700, h: 80 },
    { x: 1800, y: 260, w: 600, h: 280 },
  ],
  words: [
    { id: 'egdirb', text: 'EGDIRB', x: 950, y: 480, mirage: true, tune: { BRIDGE: { x: 950, y: 480, w: 320 } } },
    { id: 'rats', text: 'RATS', x: 1650, y: 460, tune: { STAR: { x: 1720, y: 384 } } },
  ],
  powers: MIRROR,
  quill: 3,
  par: 2,
  checkpoints: [{ x: 1150, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'The Mirror Desert. Nothing here is quite the right way round.' },
    { when: { x: 520 }, text: 'A bridge? No. A mirage, written backwards. Hold it up to the mirror.' },
    { when: { word: 'BRIDGE' }, text: 'Real, now. Reflections are only wrong until you turn them round.' },
    { when: { x: 1320 }, text: 'Rats. Out here, rats are only stars facing the wrong way.' },
    { when: { word: 'STAR' }, text: 'A star, fallen low enough to stand on.' },
  ],
  hints: [
    'Mirages are real words written backwards. Open one and press ◐ Mirror.',
    'EGDIRB, in a mirror, is BRIDGE.',
    'RATS in a mirror is STAR. Jump on it.',
  ],
  solution: [
    { type: 'mirror', word: 'egdirb' },
    { type: 'mirror', word: 'rats' },
  ],
}

/** Page 2: the swap. Two letters trade places. */
const sands: LevelDef = {
  id: '4-2',
  chapter: 4,
  page: 2,
  title: 'The Swapping Sands',
  subtitle: 'where the dunes rearrange themselves',
  theme: 'desert',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 340 },
  terrain: [
    { x: 0, y: 460, w: 700, h: 80 },
    { x: 860, y: 460, w: 700, h: 80 },
    { x: 1560, y: 340, w: 840, h: 200 },
  ],
  words: [
    { id: 'salt', text: 'SALT', x: 660, y: 460, tune: { SLAT: { x: 780, y: 476, w: 200 } } },
    { id: 'dairy', text: 'DAIRY', x: 1100, y: 460 },
    { id: 'lemon', text: 'LEMON', x: 1500, y: 460 },
  ],
  diary: { id: 'diary-4', x: 1100, y: 430, requires: 'DIARY' },
  powers: MIRROR,
  quill: 3,
  par: 2,
  checkpoints: [{ x: 900, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'The sands shift. Letters shift with them. Two at a time.' },
    { when: { x: 460 }, text: 'Salt, at the edge of a gap. Swap two of its letters and see what it’s made of.' },
    { when: { word: 'SLAT' }, text: 'A slat. Salt was only ever a plank, misspelled.' },
    { when: { x: 980 }, text: 'A milk churn. In a desert. That doesn’t look right at all.' },
    { when: { word: 'DIARY' }, text: 'My diary. I dropped it here, the way you drop things in dreams.' },
    { when: { x: 1300 }, text: 'A lemon. Small, and sour, and not much use for climbing.' },
    { when: { word: 'MELON' }, text: 'A melon! Same letters, much bigger fruit.' },
  ],
  hints: [
    'Open a word and choose ⇄ Swap, then pick two letters to trade.',
    'SALT → SLAT. LEMON → MELON.',
    'And DAIRY is only one swap from something of mine.',
  ],
  solution: [
    { type: 'swap', word: 'salt', i: 1, j: 2 },
    { type: 'swap', word: 'lemon', i: 0, j: 2 },
  ],
}

/** Page 3: night at the oasis. A palm and a lamp are the same four letters. */
const oasis: LevelDef = {
  id: '4-3',
  chapter: 4,
  page: 3,
  title: 'The Oasis at Night',
  subtitle: 'palms and lamps',
  theme: 'desert',
  width: 2200,
  dark: true,
  spawn: { x: 90, y: 460 },
  exit: { x: 2100, y: 200 },
  terrain: [
    { x: 0, y: 460, w: 1400, h: 80 },
    { x: 1400, y: 200, w: 800, h: 340 },
  ],
  words: [
    { id: 'palm', text: 'PALM', x: 380, y: 460, tune: { PALM: { ly: 420 }, LAMP: { x: 380, ly: 420 } } },
    { id: 'wolf', text: 'WOLF', x: 600, y: 460, tune: { WOLF: { dx: 300, speed: 70 } } },
    { id: 'lamp', text: 'LAMP', x: 1360, y: 460, tune: { LAMP: { ly: 420 }, PALM: { x: 1370, ly: 420 } } },
  ],
  powers: MIRROR,
  quill: 3,
  par: 5,
  checkpoints: [{ x: 1100, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'Night at the oasis. Something is prowling out there.' },
    { when: { start: 5 }, text: 'A palm tree and a lamp are the same four letters, if you don’t mind the order.' },
    { when: { word: 'LAMP' }, text: 'Light! Now you can see what’s coming.' },
    { when: { word: 'FLOW' }, text: 'A wolf, the wrong way round, is only water, flowing away.' },
    { when: { x: 1180 }, text: 'That ledge is high. The lamp could be a palm, if you give up its light.' },
    { when: { word: 'PALM' }, text: 'Climb, before your eyes forget the way.' },
  ],
  hints: [
    'You can’t read the wolf in the dark. PALM → LAMP takes two swaps.',
    'WOLF in a mirror is FLOW.',
    'LAMP → PALM, two swaps, then climb.',
  ],
  solution: [
    { type: 'swap', word: 'palm', i: 0, j: 2 },
    { type: 'swap', word: 'palm', i: 2, j: 3 },
    { type: 'mirror', word: 'wolf' },
    { type: 'swap', word: 'lamp', i: 0, j: 3 },
    { type: 'swap', word: 'lamp', i: 2, j: 3 },
  ],
}

/** Page 4: the Sphinx. Answers are words you make. */
const sphinx: LevelDef = {
  id: '4-4',
  chapter: 4,
  page: 4,
  title: 'The Sphinx',
  subtitle: 'who asks, and waits',
  theme: 'desert',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 460 },
  terrain: [{ x: 0, y: 460, w: 2400, h: 80 }],
  words: [
    { id: 'emit', text: 'EMIT', x: 800, y: 460 },
    { id: 'snake', text: 'SNAKE', x: 1150, y: 460, tune: { SNAKE: { dx: 120, speed: 50 } } },
    { id: 'icon', text: 'ICON', x: 1450, y: 460 },
    {
      id: 'sphinx',
      text: 'SPHINX',
      x: 2000,
      y: 460,
      gold: true,
      riddles: [
        { q: '“I fly without wings. You can keep me, lose me, kill me, and never have me back. What am I?”', a: 'TIME' },
        { q: '“Good. Now: I have a head, and a tail, but no body at all. What am I?”', a: 'COIN' },
      ],
    },
  ],
  powers: MIRROR,
  quill: 3,
  par: 3,
  notes: [
    { when: { start: 1 }, text: 'The Sphinx guards the only way out. It won’t move for anyone. It moves for answers.' },
    { when: { x: 600 }, text: 'A vent, emitting steam. Emit. Hm. That word is hiding something.' },
    { when: { word: 'TIME' }, text: 'Time, in an hourglass. Emit was only time, reflected.' },
    { when: { word: 'COIN' }, text: 'A coin. Heads, tails, and no body.' },
  ],
  hints: [
    'The Sphinx wants its answers to exist. Make them out of the words you pass.',
    'EMIT in a mirror is TIME.',
    'ICON → CION → COIN: two swaps.',
  ],
  solution: [
    { type: 'mirror', word: 'emit' },
    { type: 'swap', word: 'icon', i: 0, j: 1 },
    { type: 'swap', word: 'icon', i: 1, j: 2 },
  ],
}

/** Page 5: the sandstorm. Run, or read the signs. */
const sandstorm: LevelDef = {
  id: '4-5',
  chapter: 4,
  page: 5,
  title: 'The Sandstorm',
  subtitle: 'the heart of the desert',
  theme: 'desert',
  width: 3200,
  spawn: { x: 150, y: 460 },
  exit: { x: 3100, y: 280 },
  terrain: [
    { x: 0, y: 460, w: 1500, h: 80 },
    { x: 1500, y: 280, w: 700, h: 260 },
    { x: 2800, y: 280, w: 400, h: 260 },
  ],
  words: [
    { id: 'spot', text: 'SPOT', x: 260, y: 460, tune: { STOP: { x: 230 } } },
    { id: 'straw', text: 'STRAW', x: 720, y: 460 },
    { id: 'epor', text: 'EPOR', x: 1478, y: 460, mirage: true, tune: { ROPE: { x: 1478, y: 460, h: 200 } } },
    { id: 'enalp', text: 'ENALP', x: 2270, y: 308, mirage: true, tune: { PLANE: { x: 2270, y: 308, dx: 460, speed: 130 } } },
  ],
  powers: MIRROR,
  quill: 3,
  par: 3,
  blot: { x: -220, speed: 85, delay: 3.5, style: 'sand' },
  notes: [
    { when: { start: 0.8 }, text: 'A sandstorm. And inside it… those eyes again. Run!' },
    { when: { start: 3 }, text: 'Not everything has to be outrun, though.' },
    { when: { word: 'STOP' }, text: 'STOP. Even storms can read.' },
    { when: { event: 'stopped' }, text: 'It stopped. It’s watching. It doesn’t know what to do with a stop sign.' },
    { when: { x: 520 }, text: 'A bale of straw, too tall to climb. Warts and all.' },
    { when: { x: 1260 }, text: 'A rope, the wrong way round.' },
    { when: { x: 1900 }, text: 'A plane! Well, the reflection of one.' },
  ],
  hints: [
    'STRAW in a mirror is WARTS. EPOR is ROPE.',
    'ENALP is a PLANE, reflected.',
    'Or: SPOT → STOP, one swap, right at the start.',
  ],
  solution: [
    { type: 'mirror', word: 'straw' },
    { type: 'mirror', word: 'epor' },
    { type: 'mirror', word: 'enalp' },
  ],
}

export const CHAPTER_4: LevelDef[] = [mirage, sands, oasis, sphinx, sandstorm]
