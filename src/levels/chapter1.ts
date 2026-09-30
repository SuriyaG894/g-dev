import type { LevelDef } from '../game/types'

const GROUND = 460

/** Page 1: move, jump, pluck. Nonsense bites. */
const margin: LevelDef = {
  id: '1-1',
  chapter: 1,
  page: 1,
  title: 'The Margin',
  subtitle: 'where the Reader wakes',
  theme: 'woods',
  width: 2000,
  spawn: { x: 90, y: GROUND },
  exit: { x: 1900, y: 310 },
  terrain: [
    { x: 0, y: GROUND, w: 1350, h: 80 },
    { x: 1350, y: 310, w: 650, h: 230 },
  ],
  words: [
    { id: 'bear', text: 'BEAR', x: 800, y: GROUND },
    { id: 'bridge', text: 'BRIDGE', x: 1240, y: GROUND },
  ],
  powers: ['pluck'],
  quill: 2,
  par: 2,
  checkpoints: [{ x: 1000, y: GROUND }],
  notes: [
    { when: { start: 1.2 }, text: 'Oh. You’re awake.' },
    { when: { start: 4.5 }, text: 'Walk with ← → (or A D). Jump with Space.' },
    { when: { x: 470 }, text: 'A bear. I wrote it to guard the way. Click its word, BEAR, to lift it into your quill.' },
    { when: { word: 'EAR' }, text: 'An ear. It’s listening now. Everything here listens.' },
    { when: { word: 'BAR' }, text: 'A bar of iron. Heavier than it looks. Like most words.' },
    { when: { x: 1030 }, text: 'Too high to jump. But BRIDGE has something hiding inside it.' },
    { when: { word: 'RIDGE' }, text: 'A ridge! You’re quicker than I was.' },
    { when: { word: 'BRIDE' }, text: 'A bride? I don’t remember writing a wedding.' },
  ],
  hints: [
    'Every word is made of letters, and every letter can be plucked.',
    'Pluck one letter from BEAR to make something harmless.',
    'BEAR → EAR. Then BRIDGE → RIDGE.',
  ],
  solution: [
    { type: 'pluck', word: 'bear', index: 0 },
    { type: 'pluck', word: 'bridge', index: 0 },
  ],
}

/** Page 2: things can become climbable, and plural can become singular. */
const firs: LevelDef = {
  id: '1-2',
  chapter: 1,
  page: 2,
  title: 'Firs & Thorns',
  subtitle: 'the Margin Woods',
  theme: 'woods',
  width: 2400,
  spawn: { x: 90, y: GROUND },
  exit: { x: 2300, y: GROUND },
  terrain: [
    { x: 0, y: GROUND, w: 700, h: 80 },
    { x: 700, y: 290, w: 400, h: 250 },
    { x: 1360, y: 290, w: 290, h: 250 },
    { x: 1650, y: GROUND, w: 750, h: 80 },
  ],
  words: [
    { id: 'fire', text: 'FIRE', x: 665, y: GROUND },
    { id: 'climb', text: 'CLIMB', x: 1230, y: 310 },
    { id: 'thorns', text: 'THORNS', x: 1930, y: GROUND },
  ],
  powers: ['pluck'],
  quill: 2,
  par: 3,
  checkpoints: [
    { x: 760, y: 290 },
    { x: 1400, y: 290 },
    { x: 1700, y: GROUND },
  ],
  notes: [
    { when: { start: 1 }, text: 'The Margin Woods. I used to walk here, when I still had ideas.' },
    { when: { x: 360 }, text: 'Fire at the foot of the cliff. Fire is one letter away from something taller.' },
    { when: { word: 'FIR' }, text: 'A fir tree. Hold ↑ (or W) to climb.' },
    { when: { word: 'IRE' }, text: 'Ire. Anger. It doesn’t help. I’ve tried.' },
    { when: { x: 930 }, text: 'Words don’t have to be things. Sometimes a word is an instruction, hiding a thing.' },
    { when: { word: 'LIMB' }, text: 'A limb! Trees give, if you ask them nicely.' },
    { when: { x: 1690 }, text: 'Thorns. Too many of them. Perhaps just one would do.' },
    { when: { word: 'THORN' }, text: 'One thorn. Much more manageable. Jump it.' },
    { when: { word: 'HORNS' }, text: 'Horns. Still pointy. Still my fault.' },
  ],
  hints: [
    'The cliff is too tall. What grows tall?',
    'FIRE → FIR. CLIMB hides a LIMB.',
    'THORNS → THORN: one thorn is small enough to jump.',
  ],
  solution: [
    { type: 'pluck', word: 'fire', index: 3 },
    { type: 'pluck', word: 'climb', index: 0 },
    { type: 'pluck', word: 'thorns', index: 5 },
  ],
}

/** Page 3: darkness. You can't edit what you can't read. */
const knight: LevelDef = {
  id: '1-3',
  chapter: 1,
  page: 3,
  title: 'The Knight’s Crossing',
  subtitle: 'where the light went out',
  theme: 'night',
  width: 2600,
  spawn: { x: 90, y: GROUND },
  exit: { x: 2500, y: 250 },
  terrain: [
    { x: 0, y: GROUND, w: 900, h: 80 },
    { x: 890, y: GROUND, w: 180, h: 14 },
    { x: 1060, y: GROUND, w: 640, h: 80 },
    { x: 1950, y: 250, w: 650, h: 290 },
  ],
  words: [
    { id: 'knight', text: 'KNIGHT', x: 980, y: GROUND },
    { id: 'clamp', text: 'CLAMP', x: 1600, y: GROUND, tune: { CLAMP: { ly: 400 } } },
    { id: 'stream', text: 'STREAM', x: 1825, y: 540, tune: { STEAM: { ly: 430 }, STEM: { x: 1850, ly: 430 } } },
  ],
  powers: ['pluck'],
  quill: 2,
  par: 3,
  checkpoints: [
    { x: 1120, y: GROUND },
    { x: 1640, y: GROUND },
    { x: 2000, y: 250 },
  ],
  diary: { id: 'diary-1', x: 1250, y: 410, onlyInDark: true },
  notes: [
    { when: { start: 1 }, text: 'Someone guards the old bridge. I wrote him brave. Too brave.' },
    { when: { x: 620 }, text: 'He won’t move. But knights are mostly silent letters anyway.' },
    { when: { word: 'NIGHT' }, text: '…and night fell. I should have seen that coming.' },
    { when: { event: 'dark' }, text: 'It’s too dark to read words far away. Find a light.' },
    { when: { word: 'NIGH' }, text: 'Nigh. Near. The night is near, but not here.' },
    { when: { x: 1300 }, text: 'An iron clamp holds the path shut.' },
    { when: { word: 'LAMP' }, text: 'Light. Thank you. I hate the dark in this chapter.' },
    { when: { word: 'CAMP' }, text: 'A tent. Cosy. Not very bright.' },
    { when: { x: 1650 }, text: 'The stream runs deep. Ink and water don’t mix. You’d dissolve.' },
    { when: { word: 'STEAM' }, text: 'Steam rises. So can you. Step in.' },
    { when: { word: 'STEM' }, text: 'A stem. Something is growing out of this story.' },
    { when: { event: 'diary' }, text: 'Wait. That page is mine. Don’t read it. …Fine. Read it.' },
  ],
  hints: [
    'KNIGHT has a silent letter.',
    'In the dark, you need light to read. CLAMP holds a LAMP.',
    'STREAM → STEAM, then step into the pit and let it lift you.',
  ],
  solution: [
    { type: 'pluck', word: 'knight', index: 0 },
    { type: 'pluck', word: 'clamp', index: 0 },
    { type: 'pluck', word: 'stream', index: 2 },
  ],
}

/** Page 4: the quill keeps what you pluck. Letters move between words. */
const quill: LevelDef = {
  id: '1-4',
  chapter: 1,
  page: 4,
  title: 'The Quill Remembers',
  subtitle: 'the river of the Margin',
  theme: 'river',
  width: 2400,
  spawn: { x: 90, y: GROUND },
  exit: { x: 2300, y: 280 },
  terrain: [
    { x: 0, y: GROUND, w: 600, h: 80 },
    { x: 1150, y: GROUND, w: 550, h: 80 },
    { x: 1700, y: 280, w: 700, h: 260 },
  ],
  water: [{ x: 600, y: 478, w: 550, h: 62 }],
  words: [
    {
      id: 'bloat',
      text: 'BLOAT',
      x: 665,
      y: 486,
      tune: { BOAT: { y: 490, dx: 420, speed: 90 } },
    },
    { id: 'adder', text: 'ADDER', x: 1650, y: GROUND, tune: { LADDER: { x: 1678 } } },
  ],
  powers: ['pluck', 'place'],
  quill: 2,
  par: 2,
  checkpoints: [
    { x: 1200, y: GROUND },
    { x: 1760, y: 280 },
  ],
  notes: [
    { when: { start: 1 }, text: 'The river. Ink and water, remember.' },
    { when: { start: 4 }, text: 'From now on, every letter you pluck stays in your quill. Look, top left.' },
    { when: { x: 330 }, text: 'That fish is terribly bloated. Something in it wants out.' },
    { when: { word: 'BOAT' }, text: 'A boat. Hop on. It knows the way.' },
    { when: { word: 'BLOT' }, text: 'Don’t write that word. Not yet. Not here.' },
    { when: { word: 'BOA' }, text: 'A boa. On a river. I’m not a very good writer.' },
    { when: { x: 1230 }, text: 'A snake at the foot of the cliff. It’s missing something. So am I.' },
    { when: { event: 'firstQuill' }, text: 'Pick a letter from your quill, then choose a gap to write it in.' },
    { when: { word: 'LADDER' }, text: 'A ladder! You’re writing now. Careful. That’s how it started for me.' },
  ],
  hints: [
    'Something is swollen inside BLOAT. Let a letter out.',
    'BLOAT → BOAT. Keep the L.',
    'Write the L at the front of ADDER.',
  ],
  solution: [
    { type: 'pluck', word: 'bloat', index: 1 },
    { type: 'place', word: 'adder', index: 0, letter: 'L' },
  ],
}

/** Page 5: the Blot arrives. Think fast. */
const blot: LevelDef = {
  id: '1-5',
  chapter: 1,
  page: 5,
  title: 'The Blot',
  subtitle: 'the edge of the Margin',
  theme: 'blot',
  width: 3000,
  spawn: { x: 160, y: GROUND },
  exit: { x: 2900, y: 310 },
  terrain: [
    { x: 0, y: GROUND, w: 1500, h: 80 },
    { x: 1500, y: 310, w: 400, h: 230 },
    { x: 2600, y: 310, w: 400, h: 230 },
  ],
  words: [
    { id: 'stone', text: 'STONE', x: 700, y: GROUND },
    { id: 'lope', text: 'LOPE', x: 1390, y: 452, tune: { SLOPE: { y: GROUND } } },
    {
      id: 'planet',
      text: 'PLANET',
      x: 2050,
      y: 230,
      tune: {
        PLANE: { x: 1970, y: 338, dx: 560, speed: 125 },
        LANE: { x: 2250, y: 330, w: 720 },
      },
    },
  ],
  powers: ['pluck', 'place'],
  quill: 2,
  par: 3,
  blot: { x: -170, speed: 58, delay: 3.2 },
  notes: [
    { when: { start: 0.8 }, text: 'No. No, no, no. It found us.' },
    { when: { start: 3 }, text: 'RUN.' },
    { when: { x: 420 }, text: 'A stone won’t move. But a stone without its S is only a sound.' },
    { when: { word: 'TONE' }, text: 'A single note. Keep that S. You’ll need it.' },
    { when: { x: 1080 }, text: 'Lope: to run with long strides. Give it a little something and it becomes a way up.' },
    { when: { word: 'SLOPE' }, text: 'Up! Go!' },
    { when: { x: 1640 }, text: 'A planet over the gap. I always put planets where I need a way out.' },
    { when: { word: 'PLANE' }, text: 'A paper plane. Of course. This whole world is paper.' },
    { when: { word: 'LANE' }, text: 'A lane across nothing. Clever.' },
    { when: { word: 'PLAN' }, text: 'The plan was always to fly.' },
  ],
  hints: [
    'STONE → TONE, and keep the S.',
    'Write the S before LOPE.',
    'PLANET → PLANE. Ride it across.',
  ],
  solution: [
    { type: 'pluck', word: 'stone', index: 0 },
    { type: 'place', word: 'lope', index: 0, letter: 'S' },
    { type: 'pluck', word: 'planet', index: 5 },
  ],
}

export const CHAPTER_1: LevelDef[] = [margin, firs, knight, quill, blot]
