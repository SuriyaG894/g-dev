import type { LevelDef } from '../game/types'

const FOLD = ['pluck', 'place', 'mirror', 'name', 'fold'] as LevelDef['powers']

/** Page 1: two words, folded together, make a third. */
const lowTide: LevelDef = {
  id: '6-1',
  chapter: 6,
  page: 1,
  title: 'Low Tide',
  subtitle: 'the shore of the Folded Sea',
  theme: 'sea',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 160 },
  terrain: [
    { x: 0, y: 460, w: 700, h: 80 },
    { x: 1100, y: 460, w: 600, h: 80 },
    { x: 1700, y: 160, w: 700, h: 380 },
  ],
  water: [{ x: 700, y: 478, w: 400, h: 62 }],
  words: [
    { id: 'rain', text: 'RAIN', x: 560, y: 330, tune: { RAIN: { w: 220, h: 80 }, RAINBOW: { x: 900, y: 484, w: 480 } } },
    { id: 'bow', text: 'BOW', x: 640, y: 460, tune: { RAINBOW: { x: 900, y: 484, w: 480 } } },
    { id: 'sea', text: 'SEA', x: 1350, y: 460 },
    { id: 'weed', text: 'WEED', x: 1680, y: 460, tune: { SEAWEED: { x: 1680 } } },
  ],
  powers: FOLD,
  quill: 3,
  par: 2,
  checkpoints: [{ x: 1150, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'The Folded Sea. The pages here have been folded and unfolded so often, the words have started to stick together.' },
    { when: { x: 380 }, text: 'Rain, and a bow on the sand. Fold one into the other. Mind the order.' },
    { when: { word: 'RAINBOW' }, text: 'A rainbow. Two small words, folded, make a bridge.' },
    { when: { x: 1250 }, text: 'A cliff, a wisp of weed, and a little piece of the sea.' },
    { when: { word: 'SEAWEED' }, text: 'Seaweed, tall as a mast.' },
  ],
  hints: [
    'Open RAIN and choose ⧉ Fold. The bow goes after it: RAIN + BOW.',
    'Fold SEA into WEED, in front of it.',
  ],
  solution: [
    { type: 'fold', word: 'rain', other: 'bow', order: 'after' },
    { type: 'fold', word: 'weed', other: 'sea', order: 'before' },
  ],
}

/** Page 2: the crease. Words on facing pages touch when the book is folded. */
const gutter: LevelDef = {
  id: '6-2',
  chapter: 6,
  page: 2,
  title: 'The Gutter',
  subtitle: 'where two pages meet',
  theme: 'sea',
  width: 2400,
  crease: { x: 1200 },
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 140 },
  terrain: [
    { x: 0, y: 460, w: 700, h: 80 },
    { x: 700, y: 280, w: 450, h: 260 },
    { x: 1250, y: 460, w: 830, h: 80 },
    { x: 2080, y: 140, w: 320, h: 400 },
  ],
  words: [
    { id: 'sun', text: 'SUN', x: 345, y: 490 },
    { id: 'fish', text: 'FISH', x: 480, y: 460 },
    { id: 'jelly', text: 'JELLY', x: 600, y: 460 },
    { id: 'sea', text: 'SEA', x: 660, y: 466 },
    { id: 'shell', text: 'SHELL', x: 1740, y: 460 },
    { id: 'flower', text: 'FLOWER', x: 2055, y: 460, tune: { SUNFLOWER: { x: 2055 } } },
  ],
  diary: { id: 'diary-6', x: 1740, y: 426, requires: 'SEASHELL' },
  powers: FOLD,
  quill: 3,
  par: 2,
  checkpoints: [{ x: 1300, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'Two pages, facing. The gutter runs down the middle, where the book was sewn.' },
    { when: { x: 400 }, text: 'A jelly, and a fish. Something bouncy, if you fold them right.' },
    { when: { word: 'JELLYFISH' }, text: 'Boing.' },
    { when: { x: 1320 }, text: 'Close a book and its two pages touch. Words that face each other across the gutter can be folded together.' },
    { when: { x: 1900 }, text: 'A flower at the foot of the cliff. On the other page, the sun is setting in exactly the same place.' },
    { when: { word: 'SUNFLOWER' }, text: 'It turns its face to the sun, wherever the sun is. Even on another page.' },
    { when: { word: 'SEASHELL' }, text: 'Hold it to your ear. You can hear the sea. And something else.' },
  ],
  hints: [
    'Fold FISH into JELLY, after it.',
    'Open FLOWER. The SUN on the other page faces it across the gutter, so you can fold them, however far apart they are.',
    'The SHELL faces something on the other page too.',
  ],
  solution: [
    { type: 'fold', word: 'jelly', other: 'fish', order: 'after' },
    { type: 'fold', word: 'flower', other: 'sun', order: 'before' },
  ],
}

/** Page 3: night on the beach. A firefly lights the way. */
const nightFishing: LevelDef = {
  id: '6-3',
  chapter: 6,
  page: 3,
  title: 'Night Fishing',
  subtitle: 'the beach after dark',
  theme: 'sea',
  width: 2600,
  dark: true,
  spawn: { x: 90, y: 460 },
  exit: { x: 2500, y: 460 },
  terrain: [
    { x: 0, y: 460, w: 900, h: 80 },
    { x: 1700, y: 460, w: 900, h: 80 },
  ],
  water: [{ x: 900, y: 478, w: 800, h: 62 }],
  words: [
    { id: 'fly', text: 'FLY', x: 300, y: 430 },
    { id: 'fire', text: 'FIRE', x: 420, y: 460, tune: { FIRE: { w: 90, h: 130 }, FIREFLY: { x: 420, y: 400, dx: 640, speed: 60 } } },
    { id: 'hoarse', text: 'HOARSE', x: 820, y: 440, tune: { HORSE: { x: 820, y: 460 }, SEAHORSE: { x: 860, y: 510, dx: 820, speed: 90 } } },
    { id: 'sea', text: 'SEA', x: 1000, y: 470 },
  ],
  powers: FOLD,
  quill: 3,
  par: 3,
  checkpoints: [{ x: 700, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'Night on the beach. A fire, and a fly that won’t leave it alone.' },
    { when: { word: 'FIREFLY' }, text: 'A firefly. A fire small enough to carry its own light around.' },
    { when: { x: 640 }, text: 'Something hoarse is whinnying in the dark.' },
    { when: { word: 'HORSE' }, text: 'A horse. It won’t swim. But it might, if it were a different sort of horse.' },
    { when: { word: 'SEAHORSE' }, text: 'All aboard.' },
  ],
  hints: [
    'Fold FLY into FIRE, after it. The fire goes, and its light stays.',
    'HOARSE, without its A, is a HORSE. Wait for the firefly to light the way.',
    'SEA + HORSE. The firefly has to be near enough to light both words.',
  ],
  solution: [
    { type: 'fold', word: 'fire', other: 'fly', order: 'after' },
    { type: 'pluck', word: 'hoarse', index: 2 },
    { type: 'fold', word: 'hoarse', other: 'sea', order: 'before' },
  ],
}

/** Page 4: the page folds the other way. The sky is the sea's reflection. */
const foldedSky: LevelDef = {
  id: '6-4',
  chapter: 6,
  page: 4,
  title: 'The Folded Sky',
  subtitle: 'fold the ocean onto the sky',
  theme: 'sea',
  width: 2400,
  height: 1080,
  crease: { y: 540 },
  spawn: { x: 90, y: 1000 },
  exit: { x: 2300, y: 80 },
  terrain: [
    { x: 0, y: 1000, w: 2400, h: 80 },
    { x: 360, y: 700, w: 440, h: 40 },
    { x: 800, y: 400, w: 500, h: 40 },
    { x: 1300, y: 80, w: 1100, h: 40 },
  ],
  words: [
    { id: 'jelly', text: 'JELLY', x: 300, y: 1000 },
    { id: 'fish', text: 'FISH', x: 300, y: 162 },
    { id: 'weed', text: 'WEED', x: 720, y: 700, tune: { SEAWEED: { x: 780 } } },
    { id: 'sea', text: 'SEA', x: 720, y: 468 },
    { id: 'flower', text: 'FLOWER', x: 1275, y: 400, tune: { SUNFLOWER: { x: 1275 } } },
    { id: 'sun', text: 'SUN', x: 1275, y: 822 },
  ],
  powers: FOLD,
  quill: 3,
  par: 3,
  checkpoints: [{ x: 400, y: 700 }, { x: 850, y: 400 }],
  notes: [
    { when: { start: 1 }, text: 'This page is folded across the middle. Everything in the sky is a reflection of something in the sea, and the other way up.' },
    { when: { x: 200 }, text: 'A jelly on the sand. And, straight above it, a fish, swimming in the sky.' },
    { when: { word: 'JELLYFISH' }, text: 'Up you go.' },
    { when: { y: 720 }, text: 'Weed on the rock, and the sea up in the clouds. Of course.' },
    { when: { y: 420 }, text: 'A flower in the clouds. Its reflection is down there, sunk in the sea: the sun.' },
    { when: { word: 'SUNFLOWER' }, text: 'Fold the ocean onto the sky, and things grow.' },
  ],
  hints: [
    'The crease runs across the page. JELLY, on the sand, faces the FISH in the sky.',
    'WEED + SEA, with the sea in front.',
    'FLOWER, up here, faces the SUN, down there. SUN + FLOWER.',
  ],
  solution: [
    { type: 'fold', word: 'jelly', other: 'fish', order: 'after' },
    { type: 'fold', word: 'weed', other: 'sea', order: 'before' },
    { type: 'fold', word: 'flower', other: 'sun', order: 'before' },
  ],
}

/** Page 5: the Blot, at sea. Fold it, the way you fold paper to make an inkblot. */
const inkblot: LevelDef = {
  id: '6-5',
  chapter: 6,
  page: 5,
  title: 'The Inkblot',
  subtitle: 'what do you see?',
  theme: 'sea',
  width: 3000,
  crease: { x: 1500 },
  spawn: { x: 150, y: 460 },
  exit: { x: 2900, y: 460 },
  terrain: [
    { x: 0, y: 460, w: 700, h: 80 },
    { x: 1100, y: 460, w: 350, h: 80 },
    { x: 1550, y: 460, w: 1450, h: 80 },
    { x: 2150, y: 280, w: 100, h: 260 },
  ],
  water: [{ x: 700, y: 478, w: 400, h: 62 }],
  words: [
    { id: 'rain', text: 'RAIN', x: 560, y: 330, tune: { RAIN: { w: 220, h: 80 }, RAINBOW: { x: 900, y: 484, w: 480 } } },
    { id: 'bow', text: 'BOW', x: 640, y: 460, tune: { RAINBOW: { x: 900, y: 484, w: 480 } } },
    { id: 'sea', text: 'SEA', x: 1950, y: 460 },
    { id: 'weed', text: 'WEED', x: 2130, y: 460, tune: { SEAWEED: { x: 2130 } } },
    { id: 'ink', text: 'INK', x: 2200, y: 280 },
  ],
  powers: FOLD,
  quill: 3,
  par: 3,
  blot: { x: -260, speed: 110, delay: 2.5, named: true, exitLocked: true },
  notes: [
    { when: { start: 0.8 }, text: 'It learned to swim. Run!' },
    { when: { x: 380 }, text: 'The rainbow again. Quickly.' },
    { when: { x: 2500 }, text: 'The page won’t turn. Not with the Blot still coming. It has to be stopped.' },
    { when: { x: 1700 }, text: 'My inkpot! On that rock. I know what ink is for, on a folded page.' },
    { when: { y: 290 }, text: 'Look back across the gutter. When the Blot faces the ink… fold.' },
    { when: { word: 'INKBLOT' }, text: 'An inkblot. Fold a page with ink on it, and the ink becomes a picture. It’s only a picture. What do you see?' },
  ],
  hints: [
    'RAIN + BOW, then SEA + WEED to climb the rock.',
    'From the rock, open INK. When the Blot, on the other page, faces it across the gutter, fold INK into the BLOT: INK + BLOT.',
    'Miss it, and you can still fold them once the Blot is close enough to reach.',
  ],
  solution: [
    { type: 'fold', word: 'rain', other: 'bow', order: 'after' },
    { type: 'fold', word: 'weed', other: 'sea', order: 'before' },
    { type: 'fold', word: 'blot', other: 'ink', order: 'before' },
  ],
}

export const CHAPTER_6: LevelDef[] = [lowTide, gutter, nightFishing, foldedSky, inkblot]
