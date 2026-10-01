import type { LevelDef } from '../game/types'

const ALL = ['pluck', 'place', 'mirror', 'name', 'fold'] as LevelDef['powers']

/** Page 1: the book is being unwritten. Write it back. */
const unwritten: LevelDef = {
  id: '7-1',
  chapter: 7,
  page: 1,
  title: 'Unwritten',
  subtitle: 'the edge of the Blank',
  theme: 'blank',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 260 },
  terrain: [
    { x: 0, y: 460, w: 600, h: 80 },
    { x: 820, y: 460, w: 680, h: 80 },
    { x: 1500, y: 260, w: 900, h: 280 },
  ],
  letters: [
    { id: 'b', letter: 'B', x: 300, y: 420 },
    { id: 'l', letter: 'L', x: 1250, y: 420 },
  ],
  words: [
    { id: 'ridge', text: 'RIDGE', x: 520, y: 460, tune: { RIDGE: { w: 160, h: 100 }, BRIDGE: { x: 710, y: 480, w: 240 } } },
    { id: 'fire', text: 'FIRE', x: 1050, y: 460, tune: { FIRE: { w: 90, h: 130 } } },
    { id: 'adder', text: 'ADDER', x: 1440, y: 460, tune: { LADDER: { x: 1478 } } },
  ],
  powers: ALL,
  quill: 3,
  par: 3,
  checkpoints: [{ x: 860, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'The Blank. Something has been here first, unwriting. The bridge is only a ridge again.' },
    { when: { event: 'letter' }, text: 'A lost letter. Write it back where it belongs.' },
    { when: { word: 'BRIDGE' }, text: 'The first word you ever changed, the other way round.' },
    { when: { x: 900 }, text: 'Fire, where a tree was. Take the E away, and it remembers.' },
    { when: { x: 1300 }, text: 'An adder, at the foot of the cliff. It was a ladder, once.' },
  ],
  hints: ['Catch the B and write it into RIDGE.', 'FIRE without its E is a FIR.', 'Catch the L: L + ADDER is a LADDER.'],
  solution: [
    { type: 'place', word: 'ridge', index: 0, letter: 'B' },
    { type: 'pluck', word: 'fire', index: 3 },
    { type: 'place', word: 'adder', index: 0, letter: 'L' },
  ],
}

/** Page 2: Now has been erased. Then is still whole. */
const thenBarely: LevelDef = {
  id: '7-2',
  chapter: 7,
  page: 2,
  title: 'Then, Barely',
  subtitle: 'where Now has been rubbed out',
  theme: 'blank',
  width: 2400,
  eras: { start: 'present' },
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 160 },
  terrain: [
    { x: 0, y: 460, w: 700, h: 80 },
    { x: 700, y: 460, w: 800, h: 80, era: 'past' },
    { x: 1350, y: 460, w: 150, h: 80, era: 'present' },
    { x: 1500, y: 160, w: 900, h: 380 },
  ],
  letters: [{ id: 'a', letter: 'A', x: 1200, y: 420, era: 'past' }],
  words: [
    { id: 'clamp', text: 'CLAMP', x: 1000, y: 460, era: 'past', tune: { RUST: { y: 640 }, LAMP: { y: 640 } } },
    { id: 'corn', text: 'CORN', x: 1460, y: 460, era: 'past', tune: { OAK: { x: 1460 } } },
  ],
  powers: ALL,
  quill: 3,
  par: 2,
  checkpoints: [{ x: 600, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'Now has been rubbed out. Only the past is left in one piece. Turn time: F, or the ⟲ button.' },
    { when: { event: 'past' }, text: 'Then. The ground is still here. So is the clamp.' },
    { when: { word: 'ACORN' }, text: 'An acorn, planted in the past. Go and see what it became.' },
    { when: { word: 'OAK' }, text: 'An oak, grown up in the blank. Things you plant don’t forget.' },
  ],
  hints: ['Turn time to Then, and walk.', 'CLAMP without its C is a LAMP.', 'Catch the A. A + CORN is an ACORN, and acorns grow up.'],
  solution: [
    { type: 'pluck', word: 'clamp', index: 0 },
    { type: 'place', word: 'corn', index: 0, letter: 'A' },
  ],
}

/** Page 3: backwards. Mira's trick: turn it round and it isn't so heavy. */
const backwards: LevelDef = {
  id: '7-3',
  chapter: 7,
  page: 3,
  title: 'Backwards',
  subtitle: 'turn it round',
  theme: 'blank',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 270 },
  terrain: [
    { x: 0, y: 460, w: 1900, h: 80 },
    { x: 1900, y: 270, w: 500, h: 270 },
  ],
  words: [
    { id: 'wolf', text: 'WOLF', x: 500, y: 460, tune: { WOLF: { dx: 240, speed: 80 } } },
    { id: 'gate', text: 'GATE', x: 1000, y: 460 },
    // A name, spelled backwards. It spoils the gate it names.
    { id: 'nepo', text: 'NEPO', of: 'gate', x: 0, y: 0, mirage: true },
    { id: 'stressed', text: 'STRESSED', x: 1700, y: 460, tune: { DESSERTS: { x: 1840, h: 90 } } },
  ],
  powers: ALL,
  quill: 3,
  par: 3,
  checkpoints: [{ x: 1200, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'The Blank has got everything the wrong way round. Even the names.' },
    { when: { word: 'FLOW' }, text: 'Wolf, flow. Some things are only frightening one way round.' },
    { when: { x: 820 }, text: 'NEPO GATE. A nonsense name turns a thing to wild ink. Read it in a mirror.' },
    { when: { x: 1460 }, text: 'Mira used to say: stressed is desserts, if you turn it round.' },
    { when: { word: 'DESSERTS' }, text: 'She was right.' },
  ],
  hints: ['WOLF in a mirror is FLOW.', 'Open NEPO, the name above the gate, and mirror it.', 'STRESSED, mirrored, is DESSERTS.'],
  solution: [
    { type: 'mirror', word: 'wolf' },
    { type: 'mirror', word: 'nepo' },
    { type: 'mirror', word: 'stressed' },
  ],
}

/** Page 4: facing pages, folds and names together. */
const facingPages: LevelDef = {
  id: '7-4',
  chapter: 7,
  page: 4,
  title: 'Facing Pages',
  subtitle: 'the last of the book, folded shut',
  theme: 'blank',
  width: 2400,
  crease: { x: 1200 },
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 40 },
  terrain: [
    { x: 0, y: 460, w: 1150, h: 80 },
    { x: 1250, y: 460, w: 600, h: 80 },
    { x: 1850, y: 260, w: 300, h: 280 },
    { x: 2150, y: 40, w: 250, h: 500 },
  ],
  words: [
    { id: 'book', text: 'BOOK', x: 280, y: 258 },
    { id: 'stair', text: 'STAIR', x: 620, y: 460 },
    { id: 'drawer', text: 'DRAWER', x: 900, y: 460 },
    { id: 'case', text: 'CASE', x: 1780, y: 460, tune: { STAIRCASE: { x: 1750, y: 460 } } },
    { id: 'short', text: 'SHORT', of: 'case', x: 0, y: 0 },
    { id: 'gate', text: 'GATE', x: 2050, y: 260 },
    { id: 'mark', text: 'MARK', x: 2120, y: 260, tune: { BOOKMARK: { x: 2130 } } },
  ],
  diary: { id: 'diary-7', x: 900, y: 425, requires: 'REWARD' },
  powers: ALL,
  quill: 3,
  par: 4,
  checkpoints: [{ x: 1300, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'Two pages left. Everything on them is half of something.' },
    { when: { x: 760 }, text: 'A drawer, stuck shut. Pull it the other way.' },
    { when: { word: 'REWARD' }, text: 'A reward. My last diary page.' },
    { when: { x: 1500 }, text: 'A short case, and a stair on the other page. Neither is much use on its own.' },
    { when: { word: 'STAIRCASE' }, text: 'Up.' },
    { when: { x: 1900 }, text: 'A gate, and above it, a mark, facing the book on the other page.' },
    { when: { word: 'BOOKMARK' }, text: 'A bookmark. So you can find your place again.' },
  ],
  hints: [
    'Lift SHORT off the case first.',
    'Fold the STAIR (across the gutter) into the CASE: STAIR + CASE.',
    'Give SHORT to the gate. Then BOOK + MARK makes a bookmark to climb.',
  ],
  solution: [
    { type: 'lift', word: 'short' },
    { type: 'fold', word: 'case', other: 'stair', order: 'before' },
    { type: 'name', word: 'gate' },
    { type: 'fold', word: 'mark', other: 'book', order: 'before' },
  ],
}

/** Page 5: the last page. The Blot has eaten everything behind you. */
const lastPage: LevelDef = {
  id: '7-5',
  chapter: 7,
  page: 5,
  title: 'The Last Page',
  subtitle: 'page two hundred and twelve',
  theme: 'blank',
  width: 3400,
  spawn: { x: 150, y: 460 },
  exit: { x: 3300, y: 460 },
  terrain: [
    { x: 0, y: 460, w: 1400, h: 80 },
    { x: 1800, y: 460, w: 1600, h: 80 },
  ],
  water: [{ x: 1400, y: 478, w: 400, h: 62 }],
  words: [
    { id: 'wolf', text: 'WOLF', x: 600, y: 460, tune: { WOLF: { dx: 200, speed: 90 } } },
    { id: 'wall', text: 'WALL', x: 1000, y: 460 },
    { id: 'tall', text: 'TALL', of: 'wall', x: 0, y: 0 },
    { id: 'rain', text: 'RAIN', x: 1260, y: 330, tune: { RAIN: { w: 220, h: 80 }, RAINBOW: { x: 1600, y: 484, w: 480 } } },
    { id: 'bow', text: 'BOW', x: 1340, y: 460, tune: { RAINBOW: { x: 1600, y: 484, w: 480 } } },
  ],
  powers: ALL,
  quill: 3,
  par: 3,
  blot: { x: -260, speed: 130, delay: 2.5 },
  notes: [
    { when: { start: 0.6 }, text: 'Page two hundred and twelve. The last page. It’s right behind you.' },
    { when: { x: 420 }, text: 'Everything you’ve learned. All at once. Quickly.' },
    { when: { x: 2200 }, text: 'Don’t stop. The last page is blank. Somebody has to write it.' },
  ],
  hints: ['WOLF → FLOW.', 'Lift TALL off the wall.', 'RAIN + BOW.'],
  solution: [
    { type: 'mirror', word: 'wolf' },
    { type: 'lift', word: 'tall' },
    { type: 'fold', word: 'rain', other: 'bow', order: 'after' },
  ],
}

export const CHAPTER_7: LevelDef[] = [unwritten, thenBarely, backwards, facingPages, lastPage]
