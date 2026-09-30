export interface Vec {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export type Power = 'pluck' | 'place'

export type Theme = 'woods' | 'river' | 'night' | 'blot'

/** Per-word overrides, keyed by the word's current spelling (e.g. tune.RIDGE). */
export interface Tune {
  /** Anchor override: bottom-centre of the thing this spelling becomes. */
  x?: number
  y?: number
  w?: number
  h?: number
  /** Vehicles shuttle from the anchor to anchor + (dx, dy). */
  dx?: number
  dy?: number
  speed?: number
  light?: number
  /** Label height override, for very tall things. */
  ly?: number
}

export interface WordDef {
  id: string
  text: string
  /** Anchor: bottom-centre of the entity. */
  x: number
  y: number
  /** Gold ink: the Author's permanent words. They cannot be edited. */
  gold?: boolean
  tune?: Record<string, Tune>
}

export type NoteTrigger =
  | { start: number }
  | { x: number }
  | { word: string }
  | { event: 'dark' | 'diary' | 'firstQuill' }

export interface NoteDef {
  text: string
  when: NoteTrigger
}

export type Op =
  | { type: 'pluck'; word: string; index: number }
  | { type: 'place'; word: string; index: number; letter: string }

export interface LevelDef {
  id: string
  chapter: number
  /** 1-based page number within the chapter. */
  page: number
  title: string
  subtitle: string
  theme: Theme
  width: number
  spawn: Vec
  exit: Vec
  /** Solid ground. */
  terrain: Rect[]
  /** Water: ink dissolves in it. */
  water?: Rect[]
  words: WordDef[]
  powers: Power[]
  /** How many letters the quill can hold (only matters with the place power). */
  quill: number
  /** Fewest edits that solve the page ("Perfect Ink"). */
  par: number
  checkpoints?: Vec[]
  dark?: boolean
  blot?: { x: number; speed: number; delay: number }
  diary?: { id: string; x: number; y: number; onlyInDark?: boolean }
  notes: NoteDef[]
  hints: string[]
  /** A known solution, used by the tests. */
  solution: Op[]
}

export interface Input {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  /** Jump button held (Space / W / Up). */
  jump: boolean
  /** Space pressed this step. */
  jumpPressed: boolean
  /** W / Up pressed this step (jumps unless you're next to something climbable). */
  upPressed: boolean
}

export const NO_INPUT: Input = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  jumpPressed: false,
  upPressed: false,
}
