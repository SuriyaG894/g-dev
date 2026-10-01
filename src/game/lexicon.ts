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
  /** What this becomes, given enough time (Then → Now). */
  grows?: string
  /** A ticking clock: while it exists, time flips on its own (on pages that allow it). */
  clock?: boolean
  /** A reflection of a real thing, not yet turned the right way round. */
  mirage?: boolean
  /** A riddling guardian, solid until its riddles are answered. */
  sphinx?: boolean
  /** Halts whatever is chasing you. */
  stops?: boolean
  /** A living creature (it can be tamed, or put to sleep). */
  alive?: boolean
  /** Water, or something like it (it can be frozen). */
  liquid?: boolean
  /** A door, a gate, a lid: something that can be opened. */
  opens?: boolean
  /** Springs you high into the air when you land on it. */
  bouncy?: boolean
  /** Bobs up and down on its own. */
  flies?: boolean
  /** An adjective, naming something else. */
  tag?: boolean
  /** The Reader's own word. */
  reader?: boolean
  /** The Blot's own word, riding its edge. */
  chaser?: boolean
}

export const LEXICON: Record<string, Kind> = {
  // Page 1
  BEAR: { art: 'bear', w: 110, h: 100, hazard: true, alive: true, desc: 'A bear, guarding the way.' },
  EAR: { art: 'ear', w: 62, h: 44, solid: true, desc: 'A giant ear. It is listening.' },
  BAR: { art: 'bar', w: 90, h: 18, solid: true, desc: 'A bar of cold iron.' },
  BRIDGE: { art: 'bridge', w: 150, h: 20, platform: true, desc: 'A little plank bridge, lying on the ground.' },
  RIDGE: { art: 'ridge', w: 220, h: 150, ramp: 1, desc: 'A grassy ridge. You could walk up it.' },
  BRIDE: { art: 'bride', w: 36, h: 72, alive: true, desc: 'A bride. Nobody wrote a groom.' },

  // Page 2
  FIRE: { art: 'fire', w: 60, h: 70, hazard: true, light: 230, desc: 'Fire. Ink burns.' },
  FIR: { art: 'fir', w: 70, h: 200, climb: true, desc: 'A tall fir tree. Climbable.' },
  LIMB: { art: 'limb', w: 280, h: 20, platform: true, desc: 'A long tree limb.' },
  THORNS: { art: 'thorns', w: 320, h: 34, hazard: true, desc: 'A field of thorns.' },
  THORN: { art: 'thorn', w: 50, h: 40, hazard: true, desc: 'Just one thorn.' },
  HORNS: { art: 'horns', w: 100, h: 45, hazard: true, desc: 'A pair of horns. Still pointy.' },
  HORN: { art: 'horn', w: 50, h: 30, desc: 'A brass horn. Silent for now.' },

  // Page 3
  KNIGHT: { art: 'knight', w: 50, h: 100, hazard: true, alive: true, desc: 'A knight. He will not let you pass.' },
  NIGHT: { art: 'night', w: 70, h: 70, darkness: true, light: 90, desc: 'Night. Everything goes dark.' },
  CLAMP: { art: 'clamp', w: 60, h: 150, solid: true, opens: true, grows: 'RUST', desc: 'An iron clamp holding the path shut.' },
  LAMP: { art: 'lamp', w: 30, h: 110, light: 340, desc: 'An oil lamp. Light!' },
  CAMP: { art: 'camp', w: 90, h: 60, desc: 'A small tent. Cosy, not bright.' },
  CLAM: { art: 'clam', w: 44, h: 26, solid: true, desc: 'A clam. Tight-lipped.' },
  STREAM: { art: 'stream', w: 250, h: 60, hazard: true, liquid: true, desc: 'A deep stream. Ink dissolves in water.' },
  STEAM: { art: 'steam', w: 250, h: 330, updraft: true, desc: 'Rising steam. It could lift you.' },
  STEM: { art: 'stem', w: 40, h: 330, climb: true, desc: 'A tall stem. Climbable.' },

  // Page 4
  BLOAT: { art: 'bloat', w: 70, h: 50, alive: true, desc: 'A bloated fish. Something in it wants out.' },
  BOAT: { art: 'boat', w: 120, h: 28, vehicle: true, desc: 'A boat. It knows the way across.' },
  BLOT: { art: 'blot', w: 90, h: 60, hazard: true, desc: 'A blot. Do not write that word.' },
  BAT: { art: 'bat', w: 40, h: 24, alive: true, desc: 'A bat, flapping about.' },
  BOA: { art: 'boa', w: 90, h: 40, hazard: true, alive: true, desc: 'A boa. Very squeezy.' },
  OAT: { art: 'oat', w: 18, h: 12, desc: 'A single oat.' },
  ADDER: { art: 'adder', w: 100, h: 24, hazard: true, alive: true, desc: 'An adder. Venomous.' },
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
  RAIN: { art: 'rain', w: 420, h: 100, tide: -160, desc: 'Rain. Wherever it falls, the water rises.' },
  DRAIN: { art: 'drain', w: 80, h: 20, tide: 320, desc: 'A drain. Down it all goes.' },
  DRAFT: { art: 'draft', w: 120, h: 50, desc: 'A cold draft over the water.' },
  RAFT: { art: 'raft', w: 130, h: 26, vehicle: true, floats: 8, desc: 'A raft. It floats wherever the water is.' },
  RAT: { art: 'rat', w: 34, h: 16, alive: true, desc: 'A library rat.' },
  INK: { art: 'inkpot', w: 28, h: 30, desc: 'My inkpot. Nearly empty.' },
  SINK: { art: 'sink', w: 90, h: 30, tide: 260, desc: 'A sink with the plug pulled.' },
  EELS: { art: 'eels', w: 200, h: 40, hazard: true, swims: 30, alive: true, desc: 'A school of eels.' },
  EEL: { art: 'eel', w: 70, h: 22, hazard: true, swims: 30, alive: true, desc: 'One eel.' },
  CAGE: { art: 'cage', w: 80, h: 120, solid: true, opens: true, desc: 'An iron cage.' },
  PAGE: { art: 'page', w: 90, h: 14, vehicle: true, desc: 'A page that turns, and lifts.' },
  CANDLE: { art: 'candle', w: 16, h: 40, light: 360, desc: 'The Librarian’s candle.' },
  CROW: { art: 'crow', w: 100, h: 30, vehicle: true, alive: true, desc: 'A crow. It carries things across.' },
  BOOK: { art: 'book', w: 36, h: 12, solid: true, desc: 'A book, lying flat.' },
  BOOKS: { art: 'books', w: 50, h: 70, solid: true, desc: 'A stack of books. Good for standing on.' },
  RING: { art: 'bell', w: 40, h: 34, noise: true, desc: 'A desk bell, ringing and ringing.' },
  BELL: { art: 'bell', w: 40, h: 34, noise: true, desc: 'A bell. Loud.' },
  ROAR: { art: 'roar', w: 90, h: 40, noise: true, desc: 'A roar, with nobody making it.' },
  LIBRARIAN: { art: 'librarian', w: 60, h: 118, hazard: true, guardian: true, alive: true, desc: 'The Librarian. Gold ink, head to toe.' },
  ROPE: { art: 'rope', w: 24, h: 260, climb: true, desc: 'A rope. Climbable.' },
  FLOOD: { art: 'flood', w: 0, h: 0, flood: true, desc: 'The flood. It is rising.' },
  FLOOR: { art: 'floor', w: 1100, h: 26, solid: true, floats: 4, desc: 'A floor, floating where the flood was.' },

  // Chapter III: The Clockwork Tower. Things planted Then grow up by Now.
  SEED: { art: 'sprout', w: 20, h: 16, grows: 'TREE', desc: 'A seed. Give it time.' },
  TREE: { art: 'tree', w: 70, h: 200, climb: true, desc: 'A tree, grown from a seed. Climbable.' },
  CUB: { art: 'cub', w: 40, h: 30, grows: 'BEAR', alive: true, desc: 'A bear cub. Tiny. For now.' },
  CUBE: { art: 'cube', w: 70, h: 70, solid: true, desc: 'A stone cube. Stone doesn’t grow up.' },
  IRON: { art: 'iron', w: 40, h: 160, solid: true, grows: 'RUST', opens: true, desc: 'An iron gate. Iron rusts.' },
  RUST: { art: 'rust', w: 60, h: 18, desc: 'A heap of rust where a gate used to be.' },
  WHEAT: { art: 'wheat', w: 140, h: 44, desc: 'A field of young wheat.' },
  SPARK: { art: 'spark', w: 20, h: 20, grows: 'FIRE', desc: 'A spark. Sparks grow into fires.' },
  CORN: { art: 'corn', w: 26, h: 50, desc: 'A stalk of corn.' },
  ACORN: { art: 'sprout', w: 20, h: 16, grows: 'OAK', desc: 'An acorn. It dreams of being an oak.' },
  OAK: { art: 'oak', w: 110, h: 320, climb: true, desc: 'A great oak. Climbable.' },
  GEAR: { art: 'gear', w: 80, h: 20, vehicle: true, grows: 'COG', desc: 'A turning gear.' },
  COG: { art: 'cog', w: 80, h: 20, vehicle: true, desc: 'A cog, rusted still.' },
  DRIP: { art: 'drip', w: 40, h: 60, grows: 'POND', desc: 'A drip. Drip, drip, for years.' },
  POND: { art: 'stream', w: 300, h: 40, hazard: true, liquid: true, desc: 'A pond, from years of dripping.' },
  BEAN: { art: 'sprout', w: 20, h: 16, grows: 'STALK', desc: 'A bean. Magic, possibly.' },
  STALK: { art: 'stem', w: 40, h: 380, climb: true, desc: 'A beanstalk. Up and up.' },
  CLOCK: { art: 'clock', w: 60, h: 90, clock: true, desc: 'A clock. It strikes, and time turns.' },
  LOCK: { art: 'padlock', w: 40, h: 44, desc: 'A lock. Time holds still.' },

  // Chapter IV: The Mirror Desert
  RATS: { art: 'rats', w: 140, h: 30, hazard: true, alive: true, desc: 'A swarm of rats.' },
  STAR: { art: 'star', w: 70, h: 24, platform: true, light: 180, desc: 'A fallen star, low enough to stand on.' },
  SALT: { art: 'salt', w: 60, h: 30, desc: 'A heap of salt.' },
  SLAT: { art: 'slat', w: 200, h: 16, platform: true, desc: 'A long wooden slat.' },
  LEMON: { art: 'lemon', w: 30, h: 24, solid: true, desc: 'A lemon. Small and sour.' },
  MELON: { art: 'melon', w: 80, h: 70, solid: true, desc: 'A melon. Enormous.' },
  DAIRY: { art: 'churn', w: 36, h: 50, desc: 'A milk churn, far from any cow.' },
  DIARY: { art: 'diarybook', w: 40, h: 30, desc: 'A diary! The Author’s.' },
  PALM: { art: 'palm', w: 60, h: 280, climb: true, desc: 'A palm tree. Climbable.' },
  WOLF: { art: 'wolf', w: 90, h: 70, hazard: true, alive: true, desc: 'A wolf, prowling.' },
  FLOW: { art: 'trickle', w: 120, h: 14, liquid: true, desc: 'A trickle of water, flowing over the sand.' },
  SPHINX: { art: 'sphinx', w: 170, h: 150, solid: true, sphinx: true, desc: 'The Sphinx. It asks, and it waits.' },
  EMIT: { art: 'vent', w: 50, h: 40, desc: 'A vent, emitting steam.' },
  TIME: { art: 'hourglass', w: 36, h: 56, desc: 'An hourglass. Time.' },
  ICON: { art: 'tablet', w: 50, h: 64, desc: 'A painted icon on a stone.' },
  COIN: { art: 'coin', w: 30, h: 30, desc: 'A gold coin. Heads, tails, no body.' },
  SNAKE: { art: 'adder', w: 70, h: 22, hazard: true, alive: true, desc: 'A desert snake.' },
  STRAW: { art: 'bale', w: 90, h: 130, solid: true, desc: 'A bale of straw, too tall to climb.' },
  SPOT: { art: 'shade', w: 80, h: 10, desc: 'A spot of shade.' },
  STOP: { art: 'stopsign', w: 40, h: 90, stops: true, desc: 'STOP. Even storms can read.' },

  // Chapter V: The City of Ink. Everything here wears a name.
  SIGN: { art: 'sign', w: 64, h: 100, desc: 'A signpost. Something is written on its board.' },
  CANAL: { art: 'canal', w: 260, h: 70, hazard: true, liquid: true, desc: 'A canal of black ink-water.' },
  WALL: { art: 'wall', w: 50, h: 90, solid: true, desc: 'A brick wall. Not very high.' },
  LION: { art: 'lion', w: 120, h: 90, hazard: true, alive: true, desc: 'A stone lion. Not entirely stone.' },
  CHEST: { art: 'chest', w: 60, h: 44, opens: true, desc: 'A chest, shut tight.' },
  GATE: { art: 'gate', w: 60, h: 200, solid: true, opens: true, desc: 'An iron gate, taller than anyone.' },
  WINDOW: { art: 'window', w: 56, h: 70, desc: 'A window, high in the wall.' },
  CAT: { art: 'cat', w: 46, h: 40, solid: true, alive: true, desc: 'A cat. It will not move. Cats don’t.' },
  KEY: { art: 'key', w: 60, h: 18, platform: true, desc: 'A key. It must open something.' },
  BOTTLE: { art: 'bottle', w: 22, h: 40, desc: 'A little bottle. Its label says DRINK ME.' },
  DOOR: { art: 'door', w: 46, h: 90, opens: true, desc: 'A door. Doors are for going through.' },
  LIFT: { art: 'lift', w: 90, h: 16, vehicle: true, desc: 'A lift. Up, and down, and up.' },
  BED: { art: 'bed', w: 110, h: 34, platform: true, desc: 'A bed, out in the street. Nobody asks.' },

  // Chapter VI: The Folded Sea. Two words, folded together, make a third.
  SEA: { art: 'wave', w: 70, h: 26, liquid: true, desc: 'A little piece of the sea, washed up.' },
  WEED: { art: 'weed', w: 24, h: 30, desc: 'A wisp of weed.' },
  SEAWEED: { art: 'seaweed', w: 40, h: 320, climb: true, desc: 'Seaweed, tall as a mast. Climbable.' },
  BOW: { art: 'bow', w: 40, h: 26, desc: 'A ribbon bow, washed up on the sand.' },
  RAINBOW: { art: 'rainbow', w: 460, h: 24, platform: true, desc: 'A rainbow, low enough to walk on.' },
  JELLY: { art: 'jelly', w: 40, h: 30, desc: 'A jelly on a plate, wobbling.' },
  FISH: { art: 'fish', w: 40, h: 20, alive: true, desc: 'A fish, out of the water and not minding.' },
  JELLYFISH: { art: 'jellyfish', w: 70, h: 50, bouncy: true, platform: true, alive: true, desc: 'A jellyfish. Very bouncy, and only a little stingy.' },
  STARFISH: { art: 'starfish', w: 60, h: 22, platform: true, alive: true, desc: 'A starfish, fallen from somewhere.' },
  SUN: { art: 'sun', w: 70, h: 70, light: 300, desc: 'The sun, setting into the sea.' },
  FLOWER: { art: 'flower', w: 30, h: 40, desc: 'A small flower, growing out of the rock.' },
  SUNFLOWER: { art: 'sunflower', w: 50, h: 340, climb: true, desc: 'A sunflower, taller than a house. Climbable.' },
  FLY: { art: 'fly', w: 20, h: 14, alive: true, desc: 'A fly, buzzing round the fire.' },
  FIREFLY: { art: 'firefly', w: 24, h: 18, light: 260, alive: true, desc: 'A firefly, carrying its own little light.' },
  HORSE: { art: 'horse', w: 90, h: 80, solid: true, alive: true, desc: 'A horse, on the beach at night.' },
  SEAHORSE: { art: 'seahorse', w: 80, h: 50, vehicle: true, alive: true, desc: 'A seahorse, big enough to ride.' },
  SHELL: { art: 'shell', w: 30, h: 20, desc: 'An empty shell.' },
  SEASHELL: { art: 'seashell', w: 50, h: 40, desc: 'A seashell. Hold it to your ear.' },
  INKBLOT: { art: 'none', w: 0, h: 0, stops: true, desc: 'An inkblot. Folded, it’s only a picture. What do you see?' },

  // Chapter VII: The Blank. Every power at once, while the book is being unwritten.
  STRESSED: { art: 'stressed', w: 120, h: 90, hazard: true, desc: 'A knot of scribbles, crackling. Stressed.' },
  DESSERTS: { art: 'desserts', w: 110, h: 100, solid: true, desc: 'A stack of cakes. Stressed, turned round, is desserts.' },
  STAIR: { art: 'stair', w: 40, h: 22, desc: 'A single stair, going nowhere.' },
  CASE: { art: 'case', w: 50, h: 36, desc: 'A suitcase, packed for somewhere.' },
  STAIRCASE: { art: 'staircase', w: 200, h: 200, ramp: 1, desc: 'A staircase. Up you go.' },
  MARK: { art: 'mark', w: 30, h: 14, desc: 'An X, marking the spot.' },
  BOOKMARK: { art: 'bookmark', w: 30, h: 260, climb: true, desc: 'A bookmark, hanging from the top of the page. Climbable.' },
  DRAWER: { art: 'drawer', w: 60, h: 40, desc: 'A drawer, stuck shut.' },

  // The Past Page.
  BOAST: { art: 'boast', w: 110, h: 30, desc: 'A get-well card, boasting: GET WELL SOON!' },
  END: { art: 'endwall', w: 100, h: 230, solid: true, desc: 'THE END, written in ink, as tall as a wall.' },
}

/**
 * Adjectives: words that change whatever they name. They are generic, so any
 * thing in the book can be FROZEN, GIANT or BROKEN, not just the ones on this page.
 */
export interface Adjective {
  desc: string
  /** Size multipliers (width, height). */
  scale?: [number, number]
  /** Stretches the longer side. */
  long?: number
  freezes?: boolean
  breaks?: boolean
  tames?: boolean
  sleeps?: boolean
  hushes?: boolean
  loud?: boolean
  light?: number
  burns?: boolean
  opens?: boolean
  /** Speed multiplier for anything that moves (0 holds it still). */
  speed?: number
  flies?: boolean
  bouncy?: boolean
  /** What it does to the Reader. */
  you?: { scale?: number; speed?: number; jump?: number; light?: number }
}

export const ADJECTIVES: Record<string, Adjective> = {
  FROZEN: { desc: 'Frozen solid.', freezes: true },
  COLD: { desc: 'Cold enough to freeze.', freezes: true },
  ICY: { desc: 'Icy all the way through.', freezes: true },
  GIANT: { desc: 'Giant.', scale: [3, 3] },
  HUGE: { desc: 'Huge.', scale: [3, 3] },
  BIG: { desc: 'Big.', scale: [1.8, 1.8] },
  TINY: { desc: 'Tiny.', scale: [0.45, 0.45], you: { scale: 0.5, jump: 0.72 } },
  SMALL: { desc: 'Small.', scale: [0.6, 0.6], you: { scale: 0.75, jump: 0.86 } },
  LITTLE: { desc: 'Little.', scale: [0.6, 0.6], you: { scale: 0.75, jump: 0.86 } },
  TALL: { desc: 'Tall. Twice as tall.', scale: [1, 2] },
  SHORT: { desc: 'Short.', scale: [1, 0.5] },
  LONG: { desc: 'Long. Much longer.', long: 2.5 },
  WIDE: { desc: 'Wide.', scale: [2.5, 1] },
  BROKEN: { desc: 'Broken. It doesn’t work any more.', breaks: true },
  TAME: { desc: 'Tame. Gentle as a lamb.', tames: true },
  ASLEEP: { desc: 'Fast asleep.', sleeps: true },
  SLEEPING: { desc: 'Sleeping soundly.', sleeps: true },
  SILENT: { desc: 'Silent.', hushes: true },
  QUIET: { desc: 'Quiet.', hushes: true },
  LOUD: { desc: 'Loud. Very loud.', loud: true },
  LIT: { desc: 'Lit, and glowing.', light: 300, you: { light: 300 } },
  BRIGHT: { desc: 'Bright as day.', light: 400, you: { light: 380 } },
  BURNING: { desc: 'On fire.', burns: true, light: 240 },
  OPEN: { desc: 'Open.', opens: true },
  FAST: { desc: 'Fast.', speed: 2.5, you: { speed: 1.6 } },
  QUICK: { desc: 'Quick.', speed: 2.5, you: { speed: 1.6 } },
  SLOW: { desc: 'Slow. So slow.', speed: 0.35, you: { speed: 0.55 } },
  STILL: { desc: 'Perfectly still.', speed: 0 },
  FLYING: { desc: 'Flying, a little.', flies: true },
  BOUNCY: { desc: 'Bouncy.', bouncy: true, you: { jump: 1.3 } },
}

/** What an adjective does to a kind of thing. Anything it can't apply to, it leaves alone. */
export function named(k: Kind, a: Adjective): Kind {
  const n: Kind = { ...k }
  const off = (...keys: (keyof Kind)[]) => {
    for (const key of keys) delete n[key]
  }
  if (a.freezes) {
    if (k.liquid || k.updraft) {
      off('hazard', 'liquid', 'updraft', 'tide', 'swims', 'floats')
      n.solid = true
    } else if (k.alive || (k.hazard && k.light)) {
      off('hazard', 'guardian', 'vehicle', 'light')
      n.solid = true
    } else if (k.vehicle) {
      off('vehicle')
      n.platform = true
    }
    off('noise', 'clock')
  }
  if (a.breaks) {
    off('solid', 'platform', 'ramp', 'climb', 'vehicle', 'updraft', 'light', 'noise', 'clock', 'stops', 'guardian', 'tide', 'floats', 'bouncy', 'flies')
  }
  if (a.tames && k.alive) {
    off('hazard', 'guardian')
    if (!n.solid) n.platform = true
  }
  if (a.sleeps && k.alive) off('hazard', 'guardian', 'noise', 'vehicle')
  if (a.hushes) off('noise')
  if (a.loud) n.noise = true
  if (a.opens && k.opens) off('solid')
  if (a.burns && !k.liquid) n.hazard = true
  if (a.light && !a.breaks) n.light = Math.max(k.light ?? 0, a.light)
  if (a.flies || a.bouncy) {
    off('solid')
    n.platform = true
    if (a.flies) n.flies = true
    if (a.bouncy) n.bouncy = true
  }
  return n
}

/** Does this adjective stop a moving thing (or a creature) where it stands? */
export function holdsStill(k: Kind, a: Adjective): boolean {
  return a.speed === 0 || !!a.freezes || !!a.breaks || (!!a.sleeps && !!k.alive)
}

export type NameTier = 'adjective' | 'word' | 'nonsense'

/** How a word reads when it is used as a name. */
export function nameTier(text: string): NameTier {
  if (ADJECTIVES[text]) return 'adjective'
  return isRealWord(text) ? 'word' : 'nonsense'
}

export function describeName(text: string): string {
  const t = nameTier(text)
  if (t === 'adjective') return ADJECTIVES[text].desc
  return t === 'word' ? 'A word, but it doesn’t describe anything.' : 'Nonsense. It spoils whatever it names.'
}

export const TAG: Kind = { art: 'none', w: 0, h: 0, tag: true, desc: '' }

export const READER: Kind = {
  art: 'none',
  w: 20,
  h: 38,
  reader: true,
  desc: 'You. Here, even you are only a word.',
}

export const CHASER: Kind = {
  art: 'none',
  w: 0,
  h: 0,
  chaser: true,
  desc: 'The Blot. It eats words. It is one.',
}

export const MIRAGE: Kind = {
  art: 'mirage',
  w: 0,
  h: 0,
  mirage: true,
  desc: 'A mirage. It is only a reflection, written the wrong way round.',
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
