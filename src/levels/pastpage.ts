import type { LevelDef } from '../game/types'

/** The secret chapter, behind the title: THE LAST PAGE, one letter changed. Chapter "8" is shown as ★. */
const PEN = ['pluck', 'place'] as LevelDef['powers']

const ward: LevelDef = {
  id: 'past-1',
  chapter: 8,
  page: 1,
  title: 'The Ward',
  subtitle: 'where the book was begun',
  theme: 'ward',
  width: 2000,
  spawn: { x: 90, y: 460 },
  exit: { x: 1900, y: 300 },
  terrain: [
    { x: 0, y: 460, w: 600, h: 80 },
    { x: 900, y: 460, w: 700, h: 80 },
    { x: 1600, y: 300, w: 400, h: 240 },
  ],
  water: [{ x: 600, y: 478, w: 300, h: 62 }],
  words: [
    { id: 'clock', text: 'CLOCK', x: 300, y: 300, gold: true },
    { id: 'boast', text: 'BOAST', x: 520, y: 460, tune: { BOAT: { x: 640, y: 480, dx: 220, speed: 70 } } },
    { id: 'book', text: 'BOOK', x: 1540, y: 460 },
  ],
  powers: PEN,
  quill: 2,
  par: 2,
  notes: [
    { when: { start: 1 }, text: 'This isn’t a page of the story. This is where I wrote it. A hospital corridor, at night.' },
    { when: { x: 200 }, text: 'That clock was always four minutes fast. I never put it right.' },
    { when: { x: 400 }, text: 'The get-well cards all boasted the same thing. We folded them into boats.' },
    { when: { word: 'BOAT' }, text: 'She sailed them down the ward. The nurses pretended not to see.' },
    { when: { x: 1300 }, text: 'I read to her from one book, every night. Then from two.' },
  ],
  hints: ['Pluck the S out of BOAST.', 'Write the S into BOOK.'],
  solution: [
    { type: 'pluck', word: 'boast', index: 3 },
    { type: 'place', word: 'book', index: 4, letter: 'S' },
  ],
}

const fourMinutes: LevelDef = {
  id: 'past-2',
  chapter: 8,
  page: 2,
  title: 'Four Minutes',
  subtitle: 'the room, then and now',
  theme: 'ward',
  width: 2000,
  eras: { start: 'present' },
  spawn: { x: 90, y: 460 },
  exit: { x: 1900, y: 160 },
  terrain: [
    { x: 0, y: 460, w: 1500, h: 80 },
    { x: 1500, y: 160, w: 500, h: 380 },
  ],
  words: [
    { id: 'clock', text: 'CLOCK', x: 260, y: 300, gold: true },
    { id: 'bed', text: 'BED', x: 700, y: 460, era: 'past' },
    { id: 'speed', text: 'SPEED', x: 1440, y: 460, era: 'past', tune: { TREE: { x: 1465, h: 330 } } },
  ],
  diary: { id: 'diary-8', x: 700, y: 425, era: 'past' },
  powers: PEN,
  quill: 2,
  par: 1,
  notes: [
    { when: { start: 1 }, text: 'Her room. Now it’s just a room. Turn time, if you want to see it the way it was.' },
    { when: { event: 'past' }, text: 'There she is. Well. There her bed is. I can’t write her. I’ve tried.' },
    { when: { event: 'diary' }, text: 'The last page of the diary. It was under her pillow all along.' },
    { when: { x: 1200 }, text: 'Everything went at such a speed, at the end.' },
    { when: { word: 'SEED' }, text: 'Slow it down. Plant it. Let it grow.' },
    { when: { word: 'TREE' }, text: 'Look how tall it got, while I wasn’t looking.' },
  ],
  hints: ['Turn time to Then.', 'SPEED without its P is a SEED. Then turn time back to Now.'],
  solution: [{ type: 'pluck', word: 'speed', index: 1 }],
}

const inPencil: LevelDef = {
  id: 'past-3',
  chapter: 8,
  page: 3,
  title: 'In Pencil',
  subtitle: 'the back of a get-well card',
  theme: 'ward',
  width: 1800,
  spawn: { x: 90, y: 460 },
  exit: { x: 1700, y: 460 },
  terrain: [{ x: 0, y: 460, w: 1800, h: 80 }],
  letters: [{ id: 'm', letter: 'M', x: 640, y: 420 }],
  words: [{ id: 'end', text: 'END', x: 1200, y: 460 }],
  powers: PEN,
  quill: 2,
  par: 1,
  notes: [
    { when: { start: 1 }, text: 'Her drawing. On the back of a card, in pencil. A little figure made of ink, with a red scarf.' },
    { when: { start: 6 }, text: 'It’s you. She drew you. “Put them in the book,” she said, “so somebody finishes it.”' },
    { when: { event: 'letter' }, text: 'M. She signed everything with an M.' },
    { when: { x: 1000 }, text: 'THE END. In ink. I wrote it the night she… I wrote it in ink.' },
    { when: { word: 'MEND' }, text: 'Not an end. A mend. Endings can be changed, if you write them in pencil.' },
  ],
  hints: ['Catch the M.', 'M + END = MEND.'],
  solution: [{ type: 'place', word: 'end', index: 0, letter: 'M' }],
}

export const PAST_PAGE: LevelDef[] = [ward, fourMinutes, inPencil]
