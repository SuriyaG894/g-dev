import type { LevelDef } from '../game/types'
import { CHAPTER_1 } from './chapter1'
import { CHAPTER_2 } from './chapter2'
import { CHAPTER_3 } from './chapter3'
import { CHAPTER_4 } from './chapter4'
import { CHAPTER_5 } from './chapter5'
import { CHAPTER_6 } from './chapter6'
import { CHAPTER_7 } from './chapter7'
import { PAST_PAGE } from './pastpage'

export interface ChapterInfo {
  number: number
  title: string
  power: string
  blurb: string
  levels: LevelDef[]
}

export const CHAPTERS: ChapterInfo[] = [
  {
    number: 1,
    title: 'The Margin Woods',
    power: 'Pluck & Place',
    blurb: 'Where the Reader wakes, the woods remember their words, and something black waits at the edge of the page.',
    levels: CHAPTER_1,
  },
  {
    number: 2,
    title: 'The Drowned Library',
    power: 'Tides, lost letters, gold ink',
    blurb: 'A library under ink-dark water, where a Librarian in gold keeps every word the Author threw away.',
    levels: CHAPTER_2,
  },
  {
    number: 3,
    title: 'The Clockwork Tower',
    power: 'Then & Now',
    blurb: 'A tower of stopped clocks, where every page exists twice: as it was, and as it is. Plant something Then, and it grows up by Now.',
    levels: CHAPTER_3,
  },
  {
    number: 4,
    title: 'The Mirror Desert',
    power: 'Mirror & Swap',
    blurb: 'A desert of reflections, where nothing is quite the right way round, and a Sphinx waits for the right words.',
    levels: CHAPTER_4,
  },
  {
    number: 5,
    title: 'The City of Ink',
    power: 'Name',
    blurb: 'A city where everything wears a name, and a name can be lifted off one thing and given to another. Even yours.',
    levels: CHAPTER_5,
  },
  {
    number: 6,
    title: 'The Folded Sea',
    power: 'Fold',
    blurb: 'A sea of pages folded so often the words stick together. Fold two words into one, even across the crease, where facing pages touch.',
    levels: CHAPTER_6,
  },
  {
    number: 7,
    title: 'The Blank',
    power: 'Every power',
    blurb: 'The last pages, being unwritten as you read them. Everything you have learned, all at once, and at the very end, a blank page that somebody has to write.',
    levels: CHAPTER_7,
  },
]

/** The secret chapter: THE LAST PAGE, with one letter changed. */
export const SECRET: ChapterInfo = {
  number: 8,
  title: 'The Past Page',
  power: 'Pluck, Place, Then & Now',
  blurb: 'Not a page of the story. The page the story was written on: a hospital ward, a clock four minutes fast, and a drawing in pencil.',
  levels: PAST_PAGE,
}

/** Chapters still being written, shown locked in the book. */
export const UPCOMING: { number: number; title: string; power: string }[] = []

export const ALL_LEVELS: LevelDef[] = CHAPTERS.flatMap((c) => c.levels)

/** Every chapter with pages, the secret one included. */
export const BOOK: ChapterInfo[] = [...CHAPTERS, SECRET]

export function levelById(id: string): LevelDef | undefined {
  return ALL_LEVELS.find((l) => l.id === id) ?? SECRET.levels.find((l) => l.id === id)
}

/** The page after this one, in its own chapter's book (the secret chapter reads on by itself). */
export function nextLevel(id: string): LevelDef | undefined {
  const list = SECRET.levels.some((l) => l.id === id) ? SECRET.levels : ALL_LEVELS
  const i = list.findIndex((l) => l.id === id)
  return i >= 0 ? list[i + 1] : undefined
}

export function chapterOf(level: LevelDef): ChapterInfo {
  return BOOK.find((c) => c.levels.includes(level))!
}

export function chapterLabel(n: number): string {
  return n === SECRET.number ? '★' : ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][n] ?? String(n)
}
