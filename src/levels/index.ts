import type { LevelDef } from '../game/types'
import { CHAPTER_1 } from './chapter1'
import { CHAPTER_2 } from './chapter2'
import { CHAPTER_3 } from './chapter3'
import { CHAPTER_4 } from './chapter4'

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
]

/** Chapters still being written, shown locked in the book. */
export const UPCOMING = [
  { number: 5, title: 'The City of Ink', power: 'Name' },
  { number: 6, title: 'The Folded Sea', power: 'Fold' },
  { number: 7, title: 'The Blank', power: 'Every power' },
]

export const ALL_LEVELS: LevelDef[] = CHAPTERS.flatMap((c) => c.levels)

export function levelById(id: string): LevelDef | undefined {
  return ALL_LEVELS.find((l) => l.id === id)
}

export function nextLevel(id: string): LevelDef | undefined {
  const i = ALL_LEVELS.findIndex((l) => l.id === id)
  return i >= 0 ? ALL_LEVELS[i + 1] : undefined
}

export function chapterOf(level: LevelDef): ChapterInfo {
  return CHAPTERS.find((c) => c.levels.includes(level))!
}
