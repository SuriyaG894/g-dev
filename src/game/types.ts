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

export type Power = 'pluck' | 'place' | 'mirror' | 'name' | 'fold'

export type Theme = 'woods' | 'river' | 'night' | 'blot' | 'library' | 'archive' | 'flood' | 'clock' | 'desert' | 'city' | 'sea'

/** Then or Now. Pages in the Clockwork Tower exist in both. */
export type Era = 'past' | 'present'

/** Ground; with an era it only exists Then or Now. */
export interface TerrainRect extends Rect {
  era?: Era
}

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
  /** Label position overrides, for very tall or very wide things. */
  ly?: number
  lx?: number
}

export interface WordDef {
  id: string
  text: string
  /** Anchor: bottom-centre of the entity. */
  x: number
  y: number
  /** Gold ink: the Author's permanent words. They cannot be edited. */
  gold?: boolean
  /** A word that exists only Then (its grown-up echo appears Now) or only Now. */
  era?: Era
  /** A reflection: while it isn't a real word it shimmers harmlessly instead of turning to wild ink. */
  mirage?: boolean
  /** For a Sphinx: riddles, answered by making the answer word exist anywhere on the page. */
  riddles?: { q: string; a: string }[]
  /**
   * Overrides keyed by spelling (tune.RIDGE), or by a full name (tune['GIANT KEY']),
   * which wins over the plain spelling.
   */
  tune?: Record<string, Tune>
  /** An adjective: the id of the thing it starts out naming. */
  of?: string
  /** Letters can't be changed, but it can still be named (the Reader, the Blot). */
  nameOnly?: boolean
}

export type NoteTrigger =
  | { start: number }
  | { x: number }
  /** Fires when the Reader climbs above this height. */
  | { y: number }
  /** A spelling, or a full name once something is named (e.g. 'FROZEN CANAL'). */
  | { word: string }
  | { event: 'dark' | 'diary' | 'firstQuill' | 'letter' | 'lure' | 'shush' | 'past' | 'present' | 'grow' | 'strike' | 'stopped' | 'lift' | 'slowed' }

/**
 * A body of water whose level can change. Tide words (RAIN, SINK…) shift it;
 * a pool that `rises` climbs on its own while a FLOOD word exists.
 */
export interface PoolDef {
  x: number
  w: number
  /** Resting surface height. */
  base: number
  /** Highest the water can reach. */
  top: number
  /** The floor of the pool (water can't go lower). */
  bottom: number
  rise?: { speed: number; delay: number }
}

/** A lost letter, drifting in the air, waiting to be caught. */
export interface LetterDef {
  id: string
  letter: string
  x: number
  y: number
  era?: Era
}

export interface ErasDef {
  start?: Era
  /** False: only the clock can turn time (default true). */
  manual?: boolean
  /** While a CLOCK ticks, time flips on its own every `period` seconds. */
  auto?: { period: number; warn: number }
}

export interface NoteDef {
  text: string
  when: NoteTrigger
}

export type Op =
  | { type: 'pluck'; word: string; index: number }
  | { type: 'place'; word: string; index: number; letter: string }
  | { type: 'mirror'; word: string }
  | { type: 'swap'; word: string; i: number; j: number }
  /** Lifts an adjective off whatever it names, into the quill. */
  | { type: 'lift'; word: string }
  /** Names a thing with the adjective in the quill. */
  | { type: 'name'; word: string }
  /**
   * Folds `other` into `word`: `word` stays where it is, spelled other+word ('before')
   * or word+other ('after'), and `other` is gone from the page.
   */
  | { type: 'fold'; word: string; other: string; order: 'before' | 'after' }

export interface LevelDef {
  id: string
  chapter: number
  /** 1-based page number within the chapter. */
  page: number
  title: string
  subtitle: string
  theme: Theme
  width: number
  /** World height; taller than the 540px view scrolls vertically. */
  height?: number
  spawn: Vec
  exit: Vec
  /** Solid ground. */
  terrain: TerrainRect[]
  /** Still water: ink dissolves in it. */
  water?: Rect[]
  pools?: PoolDef[]
  letters?: LetterDef[]
  /** Death restarts the whole page (chases, floods). */
  restartOnDeath?: boolean
  /** Then & Now. */
  eras?: ErasDef
  words: WordDef[]
  powers: Power[]
  /** How many letters the quill can hold (only matters with the place power). */
  quill: number
  /** Fewest edits that solve the page ("Perfect Ink"). */
  par: number
  checkpoints?: Vec[]
  dark?: boolean
  /** A chasing wall: the Blot, or (style 'sand') a sandstorm. A STOP word halts it. */
  blot?: { x: number; speed: number; delay: number; style?: 'ink' | 'sand'; named?: boolean; exitLocked?: boolean }
  /**
   * The page's crease: a vertical fold at x, or a horizontal one at y. Words that would
   * touch when the page is folded along it can be folded together, however far apart.
   */
  crease?: { x?: number; y?: number }
  /** The Reader has a word of its own on this page (YOU), and can be named. */
  you?: boolean
  /** requires: the page only appears once a word with this spelling (or full name) exists. */
  diary?: { id: string; x: number; y: number; onlyInDark?: boolean; era?: Era; requires?: string }
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
