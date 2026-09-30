/**
 * The lexicon: every word the Author gave a shape to.
 *
 * A spelling resolves in three tiers:
 *   1. In the lexicon       -> a real thing with a shape and behaviour.
 *   2. In the dictionary    -> a "whisper": a harmless floating word.
 *   3. Anything else        -> wild ink (a scribble) that keeps the old shape and bites.
 */

export interface Kind {
  art: string
  w: number
  h: number
  desc: string
  /** Full collision box. */
  solid?: boolean
  /** One-way flat top you can land on. */
  platform?: boolean
  /** One-way slope: 1 rises to the right, -1 rises to the left. */
  ramp?: 1 | -1
  hazard?: boolean
  climb?: boolean
  updraft?: boolean
  vehicle?: boolean
  light?: number
  darkness?: boolean
  whisper?: boolean
  scribble?: boolean
  /** Shifts every pool's water level (negative raises it). */
  tide?: number
  /** Floats on a pool's surface, sunk this many px. */
  floats?: number
  /** Swims this many px below a pool's surface. */
  swims?: number
  /** Makes a sound the Librarian cannot bear. */
  noise?: boolean
  /** The Librarian: hunts noise, then silences it. */
  guardian?: boolean
  /** The water itself. While it exists, a rising pool keeps rising. */
  flood?: boolean
}

export const LEXICON: Record<string, Kind> = {
  // Page 1
  BEAR: { art: 'bear', w: 110, h: 100, hazard: true, desc: 'A bear, guarding the way.' },
  EAR: { art: 'ear', w: 62, h: 44, solid: true, desc: 'A giant ear. It is listening.' },
  BAR: { art: 'bar', w: 90, h: 18, solid: true, desc: 'A bar of cold iron.' },
  BRIDGE: { art: 'bridge', w: 150, h: 20, platform: true, desc: 'A little plank bridge, lying on the ground.' },
  RIDGE: { art: 'ridge', w: 220, h: 150, ramp: 1, desc: 'A grassy ridge. You could walk up it.' },
  BRIDE: { art: 'bride', w: 36, h: 72, desc: 'A bride. Nobody wrote a groom.' },

  // Page 2
  FIRE: { art: 'fire', w: 60, h: 70, hazard: true, light: 230, desc: 'Fire. Ink burns.' },
  FIR: { art: 'fir', w: 70, h: 200, climb: true, desc: 'A tall fir tree. Climbable.' },
  LIMB: { art: 'limb', w: 280, h: 20, platform: true, desc: 'A long tree limb.' },
  THORNS: { art: 'thorns', w: 320, h: 34, hazard: true, desc: 'A field of thorns.' },
  THORN: { art: 'thorn', w: 50, h: 40, hazard: true, desc: 'Just one thorn.' },
  HORNS: { art: 'horns', w: 100, h: 45, hazard: true, desc: 'A pair of horns. Still pointy.' },
  HORN: { art: 'horn', w: 50, h: 30, desc: 'A brass horn. Silent for now.' },

  // Page 3
  KNIGHT: { art: 'knight', w: 50, h: 100, hazard: true, desc: 'A knight. He will not let you pass.' },
  NIGHT: { art: 'night', w: 70, h: 70, darkness: true, light: 90, desc: 'Night. Everything goes dark.' },
  CLAMP: { art: 'clamp', w: 60, h: 150, solid: true, desc: 'An iron clamp holding the path shut.' },
  LAMP: { art: 'lamp', w: 30, h: 110, light: 340, desc: 'An oil lamp. Light!' },
  CAMP: { art: 'camp', w: 90, h: 60, desc: 'A small tent. Cosy, not bright.' },
  CLAM: { art: 'clam', w: 44, h: 26, solid: true, desc: 'A clam. Tight-lipped.' },
  STREAM: { art: 'stream', w: 250, h: 60, hazard: true, desc: 'A deep stream. Ink dissolves in water.' },
  STEAM: { art: 'steam', w: 250, h: 330, updraft: true, desc: 'Rising steam. It could lift you.' },
  STEM: { art: 'stem', w: 40, h: 330, climb: true, desc: 'A tall stem. Climbable.' },

  // Page 4
  BLOAT: { art: 'bloat', w: 70, h: 50, desc: 'A bloated fish. Something in it wants out.' },
  BOAT: { art: 'boat', w: 120, h: 28, vehicle: true, desc: 'A boat. It knows the way across.' },
  BLOT: { art: 'blot', w: 90, h: 60, hazard: true, desc: 'A blot. Do not write that word.' },
  BAT: { art: 'bat', w: 40, h: 24, desc: 'A bat, flapping about.' },
  BOA: { art: 'boa', w: 90, h: 40, hazard: true, desc: 'A boa. Very squeezy.' },
  OAT: { art: 'oat', w: 18, h: 12, desc: 'A single oat.' },
  ADDER: { art: 'adder', w: 100, h: 24, hazard: true, desc: 'An adder. Venomous.' },
  LADDER: { art: 'ladder', w: 44, h: 200, climb: true, desc: 'A ladder. Climbable.' },

  // Page 5
  STONE: { art: 'stone', w: 100, h: 130, solid: true, desc: 'A heavy stone, too tall to jump.' },
  SLOPE: { art: 'ridge', w: 220, h: 150, ramp: 1, desc: 'A slope. Up you go.' },
  PLANET: { art: 'planet', w: 110, h: 100, desc: 'A small planet, hanging in the sky.' },
  PLANE: { art: 'plane', w: 130, h: 26, vehicle: true, desc: 'A paper plane. Of course.' },
  LANE: { art: 'lane', w: 300, h: 20, platform: true, desc: 'A lane across the nothing.' },
  PLANT: { art: 'plant', w: 40, h: 52, desc: 'A potted plant, floating.' },
  PANE: { art: 'pane', w: 60, h: 60, desc: 'A pane of glass. Nothing to stand on.' },

  // Chapter II: The Drowned Library
  TRAIN: { art: 'train', w: 70, h: 24, vehicle: true, desc: 'A little train. It still runs.' },
  RAIN: { art: 'rain', w: 420, h: 100, tide: -160, desc: 'Rain, indoors. The water rises.' },
  DRAIN: { art: 'drain', w: 80, h: 20, tide: 320, desc: 'A drain. Down it all goes.' },
  DRAFT: { art: 'draft', w: 120, h: 50, desc: 'A cold draft over the water.' },
  RAFT: { art: 'raft', w: 130, h: 26, vehicle: true, floats: 8, desc: 'A raft. It floats wherever the water is.' },
  RAT: { art: 'rat', w: 34, h: 16, desc: 'A library rat.' },
  INK: { art: 'inkpot', w: 28, h: 30, desc: 'My inkpot. Nearly empty.' },
  SINK: { art: 'sink', w: 90, h: 30, tide: 260, desc: 'A sink with the plug pulled.' },
  EELS: { art: 'eels', w: 200, h: 40, hazard: true, swims: 30, desc: 'A school of eels.' },
  EEL: { art: 'eel', w: 70, h: 22, hazard: true, swims: 30, desc: 'One eel.' },
  CAGE: { art: 'cage', w: 80, h: 120, solid: true, desc: 'An iron cage.' },
  PAGE: { art: 'page', w: 90, h: 14, vehicle: true, desc: 'A page that turns, and lifts.' },
  CANDLE: { art: 'candle', w: 16, h: 40, light: 360, desc: 'The Librarian’s candle.' },
  CROW: { art: 'crow', w: 100, h: 30, vehicle: true, desc: 'A crow. It carries things across.' },
  BOOK: { art: 'book', w: 36, h: 12, solid: true, desc: 'A book, lying flat.' },
  BOOKS: { art: 'books', w: 50, h: 70, solid: true, desc: 'A stack of books. Good for standing on.' },
  RING: { art: 'bell', w: 40, h: 34, noise: true, desc: 'A desk bell, ringing and ringing.' },
  BELL: { art: 'bell', w: 40, h: 34, noise: true, desc: 'A bell. Loud.' },
  ROAR: { art: 'roar', w: 90, h: 40, noise: true, desc: 'A roar, with nobody making it.' },
  LIBRARIAN: { art: 'librarian', w: 60, h: 118, hazard: true, guardian: true, desc: 'The Librarian. Gold ink, head to toe.' },
  ROPE: { art: 'rope', w: 24, h: 260, climb: true, desc: 'A rope. Climbable.' },
  FLOOD: { art: 'flood', w: 0, h: 0, flood: true, desc: 'The flood. It is rising.' },
  FLOOR: { art: 'floor', w: 1100, h: 26, solid: true, floats: 4, desc: 'A floor, floating where the flood was.' },
}

export const WHISPER: Kind = {
  art: 'whisper',
  w: 0,
  h: 30,
  whisper: true,
  desc: 'A real word, but I never gave it a shape.',
}

export const SCRIBBLE: Kind = {
  art: 'scribble',
  w: 0,
  h: 0,
  hazard: true,
  scribble: true,
  desc: 'Wild ink. Nonsense bites.',
}

let dictionary: Set<string> = new Set(Object.keys(LEXICON))

export function setDictionary(words: Iterable<string>): void {
  dictionary = new Set([...words, ...Object.keys(LEXICON)])
}

export function isRealWord(text: string): boolean {
  return dictionary.has(text)
}

export type Tier = 'thing' | 'whisper' | 'scribble'

export function tierOf(text: string): Tier {
  if (LEXICON[text]) return 'thing'
  if (dictionary.has(text)) return 'whisper'
  return 'scribble'
}

export function describe(text: string): string {
  const k = LEXICON[text]
  if (k) return k.desc
  return tierOf(text) === 'whisper' ? WHISPER.desc : SCRIBBLE.desc
}

export function whisperWidth(text: string): number {
  return Math.max(44, text.length * 17 + 18)
}

/** Parses the dictionary file: one uppercase word per line. */
export function parseWords(raw: string): string[] {
  return raw.split(/\s+/).filter(Boolean)
}
