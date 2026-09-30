import type { LevelDef } from '../game/types'
import { CHAPTER_1 } from './chapter1'

export interface ChapterInfo {
  number: number
  title: string
  power: string
  levels: LevelDef[]
}

export const CHAPTERS: ChapterInfo[] = [{ number: 1, title: 'The Margin Woods', power: 'Pluck & Place', levels: CHAPTER_1 }]

/** Chapters still being written, shown locked in the book. */
export const UPCOMING = [
  { number: 2, title: 'The Drowned Library', power: 'Longer words' },
  { number: 3, title: 'The Clockwork Tower', power: 'Page flipping' },
  { number: 4, title: 'The Mirror Desert', power: 'Mirror' },
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
