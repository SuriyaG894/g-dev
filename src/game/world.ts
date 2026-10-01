import * as ink from './ink'
import {
  ADJECTIVES,
  CHASER,
  LEXICON,
  MIRAGE,
  READER,
  SCRIBBLE,
  TAG,
  WHISPER,
  describeName,
  holdsStill,
  nameTier,
  named,
  tierOf,
  whisperWidth,
  type Adjective,
  type Kind,
  type Tier,
} from './lexicon'
import type { Era, Input, LetterDef, LevelDef, Op, PoolDef, Rect, TerrainRect, Tune, Vec, WordDef } from './types'

export const PLAYER_W = 20
export const PLAYER_H = 38
/** How far the quill reaches, from the Reader's centre to a word's label. */
export const REACH = 280
export const PLAYER_LIGHT = 100

const MOVE = 220
const GRAVITY = 1800
const JUMP_V = 640
const MAX_FALL = 900
const CLIMB_V = 150
const STEP_UP = 16
const UPDRAFT = 3100
const UPDRAFT_MAX = 330
const BOUNCE = 1050
/** How far above a thing's label its adjective sits. */
export const TAG_GAP = 24

export interface Vehicle {
  dx: number
  dy: number
  speed: number
  /** Progress from home (0) to the far end (1). */
  s: number
  dir: 1 | -1
  wait: number
}

export interface Guard {
  x: number
  post: number
  state: 'post' | 'going' | 'shush' | 'return'
  timer: number
  target: string | null
  facing: 1 | -1
}

export interface PoolState {
  def: PoolDef
  /** Where the water rests before tides (a rising pool's base climbs). */
  base: number
  surface: number
}

export interface Entity {
  uid: number
  wordId: string
  text: string
  kind: Kind
  /** Current box (vehicles move). */
  box: Rect
  /** Resting box. */
  home: Rect
  age: number
  gold: boolean
  light: number
  labelY?: number
  /** Where the word sits horizontally. */
  anchorX: number
  /** Pinned label position for very wide things (the flood and what it becomes). */
  labelX?: number
  veh?: Vehicle
  guard?: Guard
  /** Which time it belongs to. */
  era: Era | 'both'
  /** The grown-up form, Now, of a word that lives Then. It can't be edited directly. */
  echo?: boolean
  /** For a mirage: the real thing it is a reflection of. */
  mirrorOf?: string
  /** A Sphinx whose riddles are all answered lies down, and no longer blocks the way. */
  resting?: boolean
  /** The adjective naming it, when it is a real one that changed it. */
  adj?: string
  /** Its size relative to its natural shape (GIANT, TINY, TALL…). */
  scale?: { x: number; y: number }
}

export interface Ghost {
  ent: Entity
  age: number
}

export interface Player {
  x: number
  /** Feet. */
  y: number
  vx: number
  vy: number
  grounded: boolean
  ground: Entity | 'terrain' | null
  coyote: number
  buffer: number
  climbing: boolean
  facing: 1 | -1
  walk: number
  air: number
  /** Sprung (by something BOUNCY): the jump isn't cut short when the button is let go. */
  boost: boolean
}

export type EditRefusal =
  | 'far'
  | 'dark'
  | 'gold'
  | 'full'
  | 'short'
  | 'power'
  | 'busy'
  | 'echo'
  | 'blocked'
  | 'same'
  /** The quill already holds a name. */
  | 'carrying'
  /** The quill holds no name to give. */
  | 'empty'
  /** Letters can't change; it can only be named. */
  | 'fixed'
  /** Neither near enough nor across the crease: the two words can't touch. */
  | 'apart'

export type WorldEvent =
  | { type: 'transform'; wordId: string; from: string; to: string; tier: Tier; x: number; y: number }
  | { type: 'pluck'; letter: string; x: number; y: number }
  | { type: 'place'; letter: string; x: number; y: number }
  | { type: 'discard'; letter: string }
  | { type: 'refused'; reason: EditRefusal }
  | { type: 'undo' }
  | { type: 'jump' }
  | { type: 'land'; speed: number }
  | { type: 'death'; x: number; y: number }
  | { type: 'respawn' }
  | { type: 'restart' }
  | { type: 'checkpoint'; x: number; y: number }
  | { type: 'diary'; id: string }
  | { type: 'dark'; on: boolean }
  | { type: 'complete'; edits: number }
  | { type: 'letter'; letter: string; x: number; y: number }
  | { type: 'lure'; x: number }
  | { type: 'shush'; x: number; y: number }
  | { type: 'flip'; era: Era; forced: boolean }
  | { type: 'grow'; from: string; to: string }
  | { type: 'tick' }
  | { type: 'mirror'; x: number; y: number }
  | { type: 'swap'; x: number; y: number }
  | { type: 'riddle'; wordId: string; index: number }
  | { type: 'stopped' }
  | { type: 'lift'; word: string; x: number; y: number }
  /** A thing's full name changed (it was named, lost its name, or its name was respelled). */
  | { type: 'named'; wordId: string; name: string; x: number; y: number }
  | { type: 'bounce' }
  /** Two words folded into one. `crease`: they met across the page's crease. */
  | { type: 'fold'; from: string; to: string; x: number; y: number; fx: number; fy: number; crease: boolean }

/** What a word is on the page: a thing, an adjective naming a thing, the Reader, or the Blot. */
export type Role = 'thing' | 'tag' | 'reader' | 'chaser'

interface WordState {
  def: WordDef
  role: Role
  text: string
  /** For adjectives: what it names right now (null while it is in the quill). */
  of: string | null
  /** Folded into another word, and gone from the page. */
  into: string | null
  ent: Entity
  /** For words that live Then: what they have grown into, Now. */
  echo?: Entity
}

/** What a spelling becomes with time. */
export function grow(text: string): string {
  return LEXICON[text]?.grows ?? text
}

function other(era: Era): Era {
  return era === 'past' ? 'present' : 'past'
}

interface Snapshot {
  texts: Record<string, string>
  quill: string[]
  taken: string[]
  edit: boolean
  of: Record<string, string | null>
  carried: string | null
  into: Record<string, string | null>
}

interface Solid {
  r: Rect
  ent: Entity | null
}

interface Surface {
  x0: number
  x1: number
  y0: number
  y1: number
  flat: boolean
  ent: Entity
}

export function overlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function inset(r: Rect, sx: number, top: number): Rect {
  return { x: r.x + sx, y: r.y + top, w: Math.max(2, r.w - sx * 2), h: Math.max(2, r.h - top) }
}

function approach(v: number, target: number, step: number): number {
  return v < target ? Math.min(target, v + step) : Math.max(target, v - step)
}

function ease(s: number): number {
  return s * s * (3 - 2 * s)
}

export class World {
  readonly level: LevelDef
  readonly words = new Map<string, WordState>()
  /** Every word on the page, including the Reader's and the Blot's own. */
  readonly defs: WordDef[]
  quill: string[] = []
  /** The adjective lifted into the quill, waiting to name something. */
  carried: string | null = null
  history: Snapshot[] = []
  player!: Player
  time = 0
  dead = false
  deathTimer = 0
  complete = false
  checkpoint: Vec
  diaryTaken = false
  ghosts: Ghost[] = []
  events: WorldEvent[] = []
  readonly reached = new Set<number>()
  pools: PoolState[] = []
  /** Lost letters already caught. */
  readonly taken = new Set<string>()
  private fullNear: string | null = null
  era: Era = 'present'
  /** Seconds since the clock last struck. */
  clockTime = 0
  private warned = false
  /** How far the chasing wall has come. */
  blotX = -Infinity
  private stoppedOnce = false
  /** Riddles answered, per Sphinx. */
  private riddles = new Map<string, number>()
  private asked = new Set<string>()
  private uid = 0

  constructor(level: LevelDef) {
    this.level = level
    this.defs = [...level.words]
    if (level.you) this.defs.push({ id: 'you', text: 'YOU', x: 0, y: 0, nameOnly: true })
    if (level.blot?.named) this.defs.push({ id: 'blot', text: 'BLOT', x: 0, y: 0, nameOnly: true })
    this.checkpoint = { ...level.spawn }
    this.reset()
  }

  /** Back to the start of the page (the diary page stays collected). */
  reset(): void {
    this.blotX = this.level.blot ? this.level.blot.x : -Infinity
    this.stoppedOnce = false
    this.riddles.clear()
    this.asked.clear()
    this.era = this.level.eras?.start ?? 'present'
    this.clockTime = 0
    this.warned = false
    this.pools = (this.level.pools ?? []).map((def) => ({ def, base: def.base, surface: def.base }))
    this.taken.clear()
    this.words.clear()
    for (const def of this.defs) {
      const role: Role = def.of !== undefined ? 'tag' : def.id === 'you' && this.level.you ? 'reader' : def.id === 'blot' && this.level.blot?.named ? 'chaser' : 'thing'
      this.words.set(def.id, { def, role, text: def.text, of: def.of ?? null, into: null } as WordState)
    }
    // Every word exists before any is shaped, so things can see their names.
    for (const ws of this.words.values()) {
      ws.ent = this.build(ws, ws.text, null)
      if (ws.def.era === 'past') ws.echo = this.buildEcho(ws, null)
    }
    this.carried = null
    this.quill = []
    this.history = []
    this.ghosts = []
    this.time = 0
    this.dead = false
    this.complete = false
    this.reached.clear()
    this.checkpoint = { ...this.level.spawn }
    this.spawnPlayer(this.level.spawn)
    for (const p of this.pools) p.surface = this.poolTarget(p)
    for (const ent of this.entities()) this.position(ent, 0)
  }

  restart(): void {
    this.reset()
    this.events.push({ type: 'restart' })
  }

  private spawnPlayer(at: Vec): void {
    this.player = {
      x: at.x,
      y: at.y,
      vx: 0,
      vy: 0,
      grounded: true,
      ground: 'terrain',
      coyote: 0,
      buffer: 0,
      climbing: false,
      facing: 1,
      walk: 0,
      air: 0,
      boost: false,
    }
  }

  // ---------------------------------------------------------------- entities

  private build(ws: WordState, text: string, prev: Entity | null): Entity {
    if (ws.role !== 'thing') return this.buildSpecial(ws, text)
    const def = ws.def
    const name = this.nameOf(def.id)
    const full = name ? def.tune?.[`${name} ${text}`] : undefined
    const tune: Tune = { ...def.tune?.[text], ...full }
    const tier = tierOf(text)
    let kind: Kind
    let ax = tune.x ?? def.x
    let ay = tune.y ?? def.y
    let w: number
    let h: number
    let adj: Adjective | undefined
    let scale: { x: number; y: number } | undefined
    if (tier === 'thing') {
      kind = LEXICON[text]
      w = def.tune?.[text]?.w ?? kind.w
      h = def.tune?.[text]?.h ?? kind.h
      const nt = name ? nameTier(name) : null
      if (nt === 'nonsense') {
        // A nonsense name spoils the thing: it keeps its shape, and bites.
        kind = SCRIBBLE
      } else if (nt === 'adjective') {
        adj = ADJECTIVES[name!]
        kind = named(kind, adj)
        let [sx, sy] = adj.scale ?? [1, 1]
        if (adj.long) {
          if (w >= h) sx = adj.long
          else sy = adj.long
        }
        const nw = full?.w ?? w * sx
        const nh = full?.h ?? h * sy
        if (nw !== w || nh !== h) scale = { x: nw / w, y: nh / h }
        w = nw
        h = nh
      }
    } else if (tier === 'whisper') {
      kind = WHISPER
      w = whisperWidth(text)
      h = WHISPER.h
    } else if (def.mirage) {
      // A mirage keeps the shape of the thing it reflects, but nothing about it is real.
      kind = MIRAGE
      const target = ink.mirror(text)
      const real = LEXICON[target]
      const tt = def.tune?.[target] ?? {}
      if (real) {
        w = tt.w ?? real.w
        h = tt.h ?? real.h
        ax = tt.x ?? def.x
        ay = tt.y ?? def.y
      } else {
        w = whisperWidth(text)
        h = 30
      }
    } else {
      // Nonsense keeps the shape of what it was, but turns to wild ink.
      kind = SCRIBBLE
      if (prev && !prev.kind.whisper) {
        w = prev.home.w
        h = prev.home.h
        ax = prev.home.x + w / 2
        ay = prev.home.y + h
      } else {
        w = whisperWidth(text)
        h = 34
      }
    }
    const home = { x: ax - w / 2, y: ay - h, w, h }
    const ent: Entity = {
      uid: ++this.uid,
      wordId: def.id,
      text,
      kind,
      box: { ...home },
      home,
      age: 0,
      gold: !!def.gold,
      era: def.era ?? 'both',
      light: adj ? (kind.light ?? 0) : (tune.light ?? kind.light ?? 0),
      adj: adj ? name! : undefined,
      scale,
      labelY: tune.ly ?? (kind.scribble || kind.mirage ? prev?.labelY : undefined),
      anchorX: tune.x ?? def.x,
      labelX: tune.lx ?? (kind.flood ? def.x : kind.scribble ? prev?.labelX : undefined),
    }
    const still = adj ? holdsStill(LEXICON[text], adj) : false
    if (!still && (kind.vehicle || kind.flies || tune.dx || tune.dy)) {
      // FLYING things bob up and down, unless the page says where they go.
      const dy = tune.dy ?? (kind.flies && !tune.dx ? -220 : 0)
      const speed = (tune.speed ?? (kind.flies ? 70 : 90)) * (adj?.speed ?? 1)
      ent.veh = { dx: tune.dx ?? 0, dy, speed, s: 0, dir: 1, wait: 1 }
    }
    if (kind.guardian) ent.guard = { x: ax, post: ax, state: 'post', timer: 0, target: null, facing: -1 }
    if (kind.mirage) ent.mirrorOf = ink.mirror(text)
    if (kind.sphinx && (this.riddles.get(def.id) ?? 0) >= (def.riddles?.length ?? 0) && def.riddles?.length) ent.resting = true
    if (this.pools.length) this.position(ent, 0)
    return ent
  }

  /** Adjectives, the Reader and the Blot: words with no shape of their own, only a label. */
  private buildSpecial(ws: WordState, text: string): Entity {
    const kind = ws.role === 'tag' ? { ...TAG, desc: describeName(text) } : ws.role === 'reader' ? READER : CHASER
    const home = { x: 0, y: 0, w: 1, h: 1 }
    return {
      uid: ++this.uid,
      wordId: ws.def.id,
      text,
      kind,
      box: { ...home },
      home,
      age: 0,
      gold: !!ws.def.gold,
      era: 'both',
      light: 0,
      anchorX: 0,
    }
  }

  private buildEcho(ws: WordState, prev: Entity | null): Entity {
    const echo = this.build(ws, grow(ws.text), prev)
    echo.era = 'present'
    echo.echo = true
    return echo
  }

  /** What exists in the current time. */
  entities(): Entity[] {
    const out: Entity[] = []
    for (const ws of this.words.values()) {
      const e = this.activeOf(ws)
      if (e) out.push(e)
    }
    return out
  }

  /** Everything, in both times (so things keep moving while you're away). */
  private allEntities(): Entity[] {
    const out: Entity[] = []
    for (const ws of this.words.values()) {
      out.push(ws.ent)
      if (ws.echo) out.push(ws.echo)
    }
    return out
  }

  private activeOf(ws: WordState): Entity | null {
    if (ws.into) return null
    if (ws.role === 'tag') {
      // An adjective is only on the page while the thing it names is.
      const noun = ws.of ? this.words.get(ws.of) : undefined
      return noun && this.activeOf(noun) ? ws.ent : null
    }
    if (ws.role === 'chaser') return this.blotX > -Infinity ? ws.ent : null
    const era = ws.def.era
    if (!era) return ws.ent
    if (era === 'present') return this.era === 'present' ? ws.ent : null
    return this.era === 'past' ? ws.ent : (ws.echo ?? null)
  }

  /** The word's entity in the current time, if it exists now. */
  entityOf(wordId: string): Entity | null {
    const ws = this.words.get(wordId)
    return ws ? this.activeOf(ws) : null
  }

  roleOf(wordId: string): Role | null {
    return this.words.get(wordId)?.role ?? null
  }

  /** The adjective naming a thing, if it has one. */
  tagOn(wordId: string): WordState | null {
    for (const ws of this.words.values()) if (ws.role === 'tag' && ws.of === wordId) return ws
    return null
  }

  nameOf(wordId: string): string | null {
    return this.tagOn(wordId)?.text ?? null
  }

  /** A thing's full name: FROZEN CANAL, TINY YOU, or just LAMP. */
  fullName(wordId: string): string {
    const ws = this.words.get(wordId)
    if (!ws) return ''
    const n = ws.role === 'tag' ? null : this.nameOf(wordId)
    return n ? `${n} ${ws.text}` : ws.text
  }

  /** The adjective in the quill. */
  get carriedText(): string | null {
    return this.carried ? (this.words.get(this.carried)?.text ?? null) : null
  }

  get canName(): boolean {
    return this.level.powers.includes('name')
  }

  /** What the Reader's own name does to them. */
  get you(): NonNullable<Adjective['you']> | null {
    const n = this.level.you ? this.nameOf('you') : null
    return (n && ADJECTIVES[n]?.you) || null
  }

  get pw(): number {
    return PLAYER_W * (this.you?.scale ?? 1)
  }

  get ph(): number {
    return PLAYER_H * (this.you?.scale ?? 1)
  }

  /** The Blot's name, if it has been given one. */
  private get blotName(): Adjective | null {
    const n = this.level.blot?.named ? this.nameOf('blot') : null
    return (n && ADJECTIVES[n]) || null
  }

  terrain(): TerrainRect[] {
    return this.level.terrain.filter((r) => !r.era || r.era === this.era)
  }

  /** Ground that exists only in the other time (drawn faintly, as a memory or a promise). */
  otherTerrain(): TerrainRect[] {
    return this.level.terrain.filter((r) => r.era && r.era !== this.era)
  }

  get isDark(): boolean {
    if (this.level.dark) return true
    for (const ws of this.words.values()) if (ws.ent.kind.darkness) return true
    return false
  }

  labelPos(ent: Entity): Vec {
    const k = ent.kind
    if (k.tag) {
      const ws = this.words.get(ent.wordId)
      const noun = ws?.of ? this.entityOf(ws.of) : null
      if (!noun) return { x: -9999, y: -9999 }
      const at = this.labelPos(noun)
      return { x: at.x, y: at.y - TAG_GAP }
    }
    if (k.reader) return { x: this.player.x, y: Math.max(22 + TAG_GAP, this.player.y - this.ph * 0.6 - 44) }
    if (k.chaser) return { x: this.blotFront + 60, y: 230 }
    const cx = ent.labelX ?? ent.box.x + ent.box.w / 2
    if (k.whisper) return { x: cx, y: ent.box.y + ent.box.h / 2 }
    const y = ent.labelY ?? ent.box.y - 16
    return { x: cx, y: Math.max(this.tagOn(ent.wordId) ? 22 + TAG_GAP : 22, y) }
  }

  lightPos(ent: Entity): Vec {
    if (ent.kind.art === 'lamp') return { x: ent.box.x + ent.box.w / 2, y: ent.box.y + 14 }
    return { x: ent.box.x + ent.box.w / 2, y: ent.box.y + ent.box.h / 2 }
  }

  lights(): { x: number; y: number; r: number }[] {
    const p = this.player
    const out = [{ x: p.x, y: p.y - this.ph / 2, r: Math.max(PLAYER_LIGHT, this.you?.light ?? 0) }]
    for (const ent of this.entities()) {
      if (ent.light > 0) out.push({ ...this.lightPos(ent), r: ent.light })
    }
    for (const l of this.freeLetters()) out.push({ x: l.x, y: l.y, r: 70 })
    return out
  }

  isLit(pt: Vec): boolean {
    if (!this.isDark) return true
    return this.lights().some((l) => Math.hypot(pt.x - l.x, pt.y - l.y) < l.r * 0.8)
  }

  private setText(ws: WordState, text: string, prevOverride?: Entity): void {
    const prev = prevOverride ?? ws.ent
    const wasDark = this.isDark
    const ent = this.build(ws, text, prev)
    this.ghosts.push({ ent: ws.ent, age: 0 })
    const from = ws.text
    ws.text = text
    ws.ent = ent
    const at = this.labelPos(ent)
    // An adjective that means something is as good as a thing.
    const tier = ws.role === 'tag' && nameTier(text) === 'adjective' ? 'thing' : tierOf(text)
    this.events.push({ type: 'transform', wordId: ws.def.id, from, to: text, tier, x: at.x, y: at.y })
    if (ws.def.era === 'past') {
      const old = ws.echo
      const grown = grow(text)
      if (!old || old.text !== grown) {
        ws.echo = this.buildEcho(ws, old ?? null)
        if (old) this.ghosts.push({ ent: old, age: 0 })
        this.events.push({ type: 'grow', from: old?.text ?? '', to: grown })
      }
    }
    if (this.isDark !== wasDark) this.events.push({ type: 'dark', on: this.isDark })
    if (ws.role === 'tag' && ws.of) this.refresh(this.words.get(ws.of)!)
    else if (this.tagOn(ws.def.id)) this.events.push({ type: 'named', wordId: ws.def.id, name: this.fullName(ws.def.id), x: at.x, y: at.y })
    this.unstick()
  }

  /** Rebuilds a thing after its name changed. */
  private refresh(ws: WordState): void {
    const wasDark = this.isDark
    const prev = ws.ent
    const ent = this.build(ws, ws.text, prev)
    if (prev.veh && ent.veh) {
      ent.veh.s = prev.veh.s
      ent.veh.dir = prev.veh.dir
      ent.veh.wait = prev.veh.wait
    } else if (prev.veh) {
      // Stopped mid-journey: it stays where it was.
      ent.home = { ...ent.home, x: ent.home.x + prev.box.x - prev.home.x, y: ent.home.y + prev.box.y - prev.home.y }
      ent.box = { ...ent.home }
    }
    if (prev.guard && ent.guard) ent.guard = prev.guard
    this.ghosts.push({ ent: prev, age: 0 })
    ws.ent = ent
    if (!ent.veh) this.position(ent, 0)
    const at = this.labelPos(ent)
    this.events.push({ type: 'named', wordId: ws.def.id, name: this.fullName(ws.def.id), x: at.x, y: at.y })
    if (this.isDark !== wasDark) this.events.push({ type: 'dark', on: this.isDark })
    this.unstick()
  }

  /** Is there room for the Reader to be this size, right where they stand? */
  private roomFor(name: string | null): boolean {
    const s = (name && ADJECTIVES[name]?.you?.scale) || 1
    const w = PLAYER_W * s
    const h = PLAYER_H * s
    const p = this.player
    const box = { x: p.x - w / 2, y: p.y - h, w, h }
    return !this.solids().some((so) => overlap(box, so.r))
  }

  /** If a new solid appeared on top of the Reader, lift them onto it. */
  private unstick(): void {
    const p = this.player
    for (const s of this.solids()) {
      if (overlap(this.playerBox(), s.r)) {
        p.y = s.r.y
        p.vy = 0
      }
    }
  }

  // ------------------------------------------------------------------- edits

  get edits(): number {
    return this.history.filter((h) => h.edit).length
  }

  canEdit(wordId: string): EditRefusal | null {
    if (this.dead || this.complete) return 'busy'
    const ws = this.words.get(wordId)
    if (!ws) return 'busy'
    const ent = this.activeOf(ws)
    if (!ent) return 'busy'
    if (ent.echo) return 'echo'
    if (ws.def.gold) return 'gold'
    const at = this.labelPos(ent)
    const p = this.player
    if (Math.hypot(at.x - p.x, at.y - (p.y - this.ph / 2)) > REACH) return 'far'
    if (!this.isLit(at)) return 'dark'
    return null
  }

  get canPlace(): boolean {
    return this.level.powers.includes('place')
  }

  private refuse(reason: EditRefusal): false {
    this.events.push({ type: 'refused', reason })
    return false
  }

  private snapshot(edit: boolean): void {
    const texts: Record<string, string> = {}
    const of: Record<string, string | null> = {}
    const into: Record<string, string | null> = {}
    for (const [id, ws] of this.words) {
      texts[id] = ws.text
      into[id] = ws.into
      if (ws.role === 'tag') of[id] = ws.of
    }
    this.history.push({ texts, quill: [...this.quill], taken: [...this.taken], edit, of, carried: this.carried, into })
  }

  pluckLetter(wordId: string, index: number): boolean {
    if (!this.level.powers.includes('pluck')) return this.refuse('power')
    const why = this.canEdit(wordId)
    if (why) return this.refuse(why)
    const ws = this.words.get(wordId)!
    if (ws.def.nameOnly) return this.refuse('fixed')
    if (ws.text.length <= 1) return this.refuse('short')
    const keep = this.canPlace
    if (keep && this.quill.length >= this.level.quill) return this.refuse('full')
    this.snapshot(true)
    const r = ink.pluck(ws.text, index)
    if (keep) this.quill.push(r.letter)
    const at = this.labelPos(ws.ent)
    this.events.push({ type: 'pluck', letter: r.letter, x: at.x, y: at.y })
    this.setText(ws, r.text)
    return true
  }

  placeLetter(wordId: string, gap: number, quillIndex: number): boolean {
    if (!this.canPlace) return this.refuse('power')
    const why = this.canEdit(wordId)
    if (why) return this.refuse(why)
    const letter = this.quill[quillIndex]
    if (!letter) return false
    const ws = this.words.get(wordId)!
    if (ws.def.nameOnly) return this.refuse('fixed')
    this.snapshot(true)
    this.quill.splice(quillIndex, 1)
    const at = this.labelPos(ws.ent)
    this.events.push({ type: 'place', letter, x: at.x, y: at.y })
    this.setText(ws, ink.place(ws.text, gap, letter))
    return true
  }

  /** Holds the whole word up to a mirror (one ink). */
  mirrorWord(wordId: string): boolean {
    if (!this.level.powers.includes('mirror')) return this.refuse('power')
    const why = this.canEdit(wordId)
    if (why) return this.refuse(why)
    const ws = this.words.get(wordId)!
    if (ws.def.nameOnly) return this.refuse('fixed')
    const next = ink.mirror(ws.text)
    if (next === ws.text) return this.refuse('same')
    this.snapshot(true)
    const at = this.labelPos(ws.ent)
    this.events.push({ type: 'mirror', x: at.x, y: at.y })
    this.setText(ws, next)
    return true
  }

  /** Trades two letters (one ink). */
  swapLetters(wordId: string, i: number, j: number): boolean {
    if (!this.level.powers.includes('mirror')) return this.refuse('power')
    const why = this.canEdit(wordId)
    if (why) return this.refuse(why)
    const ws = this.words.get(wordId)!
    if (ws.def.nameOnly) return this.refuse('fixed')
    if (i === j || ws.text[i] === ws.text[j]) return this.refuse('same')
    this.snapshot(true)
    const at = this.labelPos(ws.ent)
    this.events.push({ type: 'swap', x: at.x, y: at.y })
    this.setText(ws, ink.swap(ws.text, i, j))
    return true
  }

  /** Lifts an adjective off whatever it names, into the quill (one ink). */
  liftName(tagId: string): boolean {
    if (!this.canName) return this.refuse('power')
    const ws = this.words.get(tagId)
    if (!ws || ws.role !== 'tag' || !ws.of) return this.refuse('busy')
    const why = this.canEdit(tagId)
    if (why) return this.refuse(why)
    if (this.carried) return this.refuse('carrying')
    const noun = this.words.get(ws.of)!
    if (noun.role === 'reader' && !this.roomFor(null)) return this.refuse('blocked')
    this.snapshot(true)
    const at = this.labelPos(ws.ent)
    ws.of = null
    this.carried = tagId
    this.events.push({ type: 'lift', word: ws.text, x: at.x, y: at.y })
    this.refresh(noun)
    return true
  }

  /** Names a thing with the adjective in the quill (one ink). A name it already had comes off into the quill. */
  nameThing(wordId: string): boolean {
    if (!this.canName) return this.refuse('power')
    if (!this.carried) return this.refuse('empty')
    const ws = this.words.get(wordId)
    if (!ws || ws.role === 'tag') return this.refuse('busy')
    const why = this.canEdit(wordId)
    if (why) return this.refuse(why)
    const tag = this.words.get(this.carried)!
    if (ws.role === 'reader' && !this.roomFor(tag.text)) return this.refuse('blocked')
    const old = this.tagOn(wordId)
    this.snapshot(true)
    tag.of = wordId
    // A fresh label, so the name writes itself in.
    tag.ent = this.build(tag, tag.text, null)
    this.carried = null
    if (old) {
      old.of = null
      this.carried = old.def.id
    }
    this.refresh(ws)
    return true
  }

  get canFold(): boolean {
    return this.level.powers.includes('fold')
  }

  /** Where a point lands when the page is folded along its crease. */
  private across(pt: Vec): Vec | null {
    const c = this.level.crease
    if (!c) return null
    if (c.x !== undefined) return { x: 2 * c.x - pt.x, y: pt.y }
    if (c.y !== undefined) return { x: pt.x, y: 2 * c.y - pt.y }
    return null
  }

  /** Would these two words touch if the page were folded along its crease? */
  meetsAcross(a: string, b: string): boolean {
    const ea = this.entityOf(a)
    const eb = this.entityOf(b)
    if (!ea || !eb) return false
    const m = this.across(this.labelPos(ea))
    if (!m) return false
    const at = this.labelPos(eb)
    return Math.hypot(m.x - at.x, m.y - at.y) < 110
  }

  /** Why `other` can't be folded into `word` right now (null if it can). */
  canFoldWith(word: string, other: string): EditRefusal | null {
    if (!this.canFold) return 'power'
    // One of the two must be within reach; the other can be near too, or facing it across the crease.
    const why = this.canEdit(word)
    if (why && why !== 'far') return why
    const ws = this.words.get(word)!
    const os = this.words.get(other)
    if (!os || other === word) return 'busy'
    const oe = this.activeOf(os)
    if (!oe) return 'busy'
    if (ws.role === 'tag' || os.role === 'tag' || ws.role === 'reader' || os.role === 'reader' || os.role === 'chaser') return 'fixed'
    if (oe.echo) return 'echo'
    if (os.def.gold) return 'gold'
    const at = this.labelPos(oe)
    if (!this.isLit(at)) return 'dark'
    const p = this.player
    const near = Math.hypot(at.x - p.x, at.y - (p.y - this.ph / 2)) <= REACH
    const across = this.meetsAcross(word, other)
    if (why === 'far') {
      if (!near || !across) return 'far'
      if (!this.isLit(this.labelPos(this.activeOf(ws)!))) return 'dark'
    } else if (!near && !across) return 'apart'
    return null
  }

  /**
   * Every fold this word can take part in. Usually it stays and the other is folded in,
   * but the Blot always stays: it can't be folded away into anything.
   */
  foldOptions(wordId: string): { keep: string; take: string }[] {
    const ws = this.words.get(wordId)
    if (!ws || !this.canFold) return []
    const out: { keep: string; take: string }[] = []
    for (const ent of this.entities()) {
      const other = ent.wordId
      if (other === wordId) continue
      if (this.words.get(other)!.role === 'chaser') {
        if (this.canFoldWith(other, wordId) === null) out.push({ keep: other, take: wordId })
      } else if (this.canFoldWith(wordId, other) === null) out.push({ keep: wordId, take: other })
    }
    return out
  }

  /** Every word that could be folded into this one. */
  foldPartners(word: string): string[] {
    const out: string[] = []
    for (const ent of this.entities()) if (this.canFoldWith(word, ent.wordId) === null) out.push(ent.wordId)
    return out
  }

  /**
   * Folds `other` into `word` (one ink). The Blot can be folded into, but only into
   * a word that means something: it won't be respelled into nonsense.
   */
  foldWords(word: string, other: string, order: 'before' | 'after'): boolean {
    const why = this.canFoldWith(word, other)
    if (why) return this.refuse(why)
    const ws = this.words.get(word)!
    const os = this.words.get(other)!
    const text = order === 'before' ? os.text + ws.text : ws.text + os.text
    if (ws.def.nameOnly && !LEXICON[text]) return this.refuse('fixed')
    this.snapshot(true)
    const from = this.labelPos(os.ent)
    const crease = !!this.across(from) && this.meetsAcross(word, other)
    const to = this.labelPos(ws.ent)
    this.ghosts.push({ ent: os.ent, age: 0 })
    os.into = word
    this.events.push({ type: 'fold', from: os.text, to: text, x: to.x, y: to.y, fx: from.x, fy: from.y, crease })
    this.setText(ws, text)
    return true
  }

  discard(quillIndex: number): void {
    const letter = this.quill[quillIndex]
    if (!letter || this.complete) return
    this.snapshot(false)
    this.quill.splice(quillIndex, 1)
    this.events.push({ type: 'discard', letter })
  }

  undo(): boolean {
    if (this.complete) return false
    const snap = this.history.pop()
    if (!snap) return false
    // Names first, so things are rebuilt knowing what they are called.
    const renamed = new Set<string>()
    for (const [id, ws] of this.words) {
      if (ws.role !== 'tag') continue
      const of = snap.of[id] ?? null
      if (of === ws.of) continue
      if (ws.of) renamed.add(ws.of)
      if (of) renamed.add(of)
      ws.of = of
      ws.ent = this.build(ws, ws.text, null)
    }
    this.carried = snap.carried
    // Unfold: words folded away come back, freshly written, where they were.
    for (const [id, ws] of this.words) {
      const into = snap.into[id] ?? null
      if (into === ws.into) continue
      ws.into = into
      if (!into) {
        ws.ent = this.build(ws, ws.text, null)
        this.position(ws.ent, 0)
      }
    }
    for (const [id, ws] of this.words) {
      const text = snap.texts[id]
      if (text !== ws.text) {
        // Restore the exact old shape rather than re-deriving a scribble from the current one.
        const ghost = [...this.ghosts].reverse().find((g) => g.ent.wordId === id && g.ent.text === text)
        this.setText(ws, text, ghost?.ent)
        renamed.delete(id)
      }
    }
    for (const id of renamed) this.refresh(this.words.get(id)!)
    this.quill = snap.quill
    this.taken.clear()
    for (const id of snap.taken) this.taken.add(id)
    this.events.push({ type: 'undo' })
    return true
  }

  /** Applies a solution step (used by tests and the dev hint tool). */
  apply(op: Op): boolean {
    if (op.type === 'pluck') return this.pluckLetter(op.word, op.index)
    if (op.type === 'mirror') return this.mirrorWord(op.word)
    if (op.type === 'swap') return this.swapLetters(op.word, op.i, op.j)
    if (op.type === 'lift') return this.liftName(op.word)
    if (op.type === 'name') return this.nameThing(op.word)
    if (op.type === 'fold') return this.foldWords(op.word, op.other, op.order)
    return this.placeLetter(op.word, op.index, this.quill.indexOf(op.letter))
  }

  // ----------------------------------------------------------------- physics

  playerBox(): Rect {
    const p = this.player
    return { x: p.x - this.pw / 2, y: p.y - this.ph, w: this.pw, h: this.ph }
  }

  solids(): Solid[] {
    const out: Solid[] = this.terrain().map((r) => ({ r, ent: null }))
    for (const ent of this.entities()) if (ent.kind.solid && !ent.resting) out.push({ r: ent.box, ent })
    return out
  }

  private surfaces(): Surface[] {
    const out: Surface[] = []
    for (const ent of this.entities()) {
      const b = ent.box
      if (ent.kind.platform || ent.kind.vehicle) {
        out.push({ x0: b.x, x1: b.x + b.w, y0: b.y, y1: b.y, flat: true, ent })
      } else if (ent.kind.ramp === 1) {
        out.push({ x0: b.x, x1: b.x + b.w, y0: b.y + b.h, y1: b.y, flat: false, ent })
      } else if (ent.kind.ramp === -1) {
        out.push({ x0: b.x, x1: b.x + b.w, y0: b.y, y1: b.y + b.h, flat: false, ent })
      }
    }
    return out
  }

  hazards(): Rect[] {
    const out: Rect[] = []
    for (const ent of this.entities()) if (ent.kind.hazard) out.push(inset(ent.box, 6, 6))
    for (const w of this.level.water ?? []) out.push(inset(w, 0, 4))
    for (const w of this.waterRects()) out.push(inset(w, 0, 4))
    return out
  }

  // ------------------------------------------------------------------ water

  private tides(): number {
    let sum = 0
    for (const ent of this.entities()) sum += ent.kind.tide ?? 0
    return sum
  }

  private poolTarget(p: PoolState): number {
    return Math.max(p.def.top, Math.min(p.def.bottom, p.base + this.tides()))
  }

  poolAt(x: number): PoolState | null {
    return this.pools.find((p) => x >= p.def.x && x <= p.def.x + p.def.w) ?? null
  }

  /** The wet part of every pool. */
  waterRects(): Rect[] {
    return this.pools
      .filter((p) => p.surface < p.def.bottom)
      .map((p) => ({ x: p.def.x, y: p.surface, w: p.def.w, h: p.def.bottom - p.surface }))
  }

  get rising(): boolean {
    return this.entities().some((e) => e.kind.flood)
  }

  private updatePools(dt: number): void {
    const rising = this.rising
    for (const p of this.pools) {
      const r = p.def.rise
      if (r && rising && this.time > r.delay) p.base -= r.speed * dt
      p.surface = approach(p.surface, this.poolTarget(p), 90 * dt)
    }
  }

  /** Can the hidden diary page be seen (and caught) right now? */
  get diaryVisible(): boolean {
    const d = this.level.diary
    if (!d) return false
    if (d.onlyInDark && !this.isDark) return false
    if (d.era && d.era !== this.era) return false
    if (d.requires && !this.entities().some((e) => e.text === d.requires || (!e.kind.tag && this.fullName(e.wordId) === d.requires))) return false
    return true
  }

  freeLetters(): LetterDef[] {
    return (this.level.letters ?? []).filter((l) => !this.taken.has(l.id) && (!l.era || l.era === this.era))
  }

  /** Letters waiting in the other time. */
  otherLetters(): LetterDef[] {
    return (this.level.letters ?? []).filter((l) => !this.taken.has(l.id) && l.era && l.era !== this.era)
  }

  // ------------------------------------------------------------------- time

  get canFlip(): boolean {
    return !!this.level.eras && this.level.eras.manual !== false
  }

  /** Is the clock still ticking (so time turns on its own)? */
  get ticking(): boolean {
    return !!this.level.eras?.auto && this.entities().some((e) => e.kind.clock)
  }

  /** Turns time: Then ↔ Now. Refused if the Reader would be inside something. */
  flip(forced = false): boolean {
    if (!this.level.eras || this.dead || this.complete) return false
    if (!forced && !this.canFlip) return this.refuse('power')
    const from = this.era
    const wasDark = this.isDark
    this.era = other(from)
    const pb = this.playerBox()
    const stuck = this.solids().some((s) => overlap(pb, s.r))
    const hurt = this.hazards().some((h) => overlap(inset(pb, 3, 3), h))
    if (!forced && (stuck || hurt)) {
      this.era = from
      return this.refuse('blocked')
    }
    if (stuck) this.unstick()
    this.player.grounded = false
    this.player.ground = null
    this.events.push({ type: 'flip', era: this.era, forced })
    if (this.isDark !== wasDark) this.events.push({ type: 'dark', on: this.isDark })
    return true
  }

  private updateClock(dt: number): void {
    const auto = this.level.eras?.auto
    if (!auto || !this.ticking) return
    this.clockTime += dt
    if (!this.warned && this.clockTime >= auto.period - auto.warn) {
      this.warned = true
      this.events.push({ type: 'tick' })
    }
    if (this.clockTime >= auto.period) {
      this.clockTime = 0
      this.warned = false
      this.flip(true)
    }
  }

  get blotFront(): number {
    return this.blotX
  }

  /** Is something on the page telling the storm to STOP? */
  /** Some pages won't turn while the Blot is still coming. */
  get exitOpen(): boolean {
    return !this.level.blot?.exitLocked || this.halted
  }

  /** The Blot, folded with ink: only a picture now. It can't hurt anyone. */
  get isInkblot(): boolean {
    return !!this.level.blot?.named && this.words.get('blot')?.text === 'INKBLOT'
  }

  get halted(): boolean {
    if (this.entities().some((e) => e.kind.stops)) return true
    const blot = this.level.blot?.named ? this.words.get('blot') : undefined
    if (blot && LEXICON[blot.text]?.stops) return true
    const a = this.blotName
    return !!a && holdsStill({ ...CHASER, alive: true }, a)
  }

  private updateBlot(dt: number): void {
    const b = this.level.blot
    if (!b || this.time <= b.delay) return
    if (this.halted) {
      if (!this.stoppedOnce) {
        this.stoppedOnce = true
        this.events.push({ type: 'stopped' })
      }
      return
    }
    this.blotX += b.speed * (this.blotName?.speed ?? 1) * dt
  }

  /** The Sphinx asks when you come near, and moves when the answer exists. */
  private updateSphinxes(): void {
    const p = this.player
    const spelled = new Set([...this.words.values()].map((w) => this.activeOf(w)?.text).filter(Boolean))
    for (const ws of this.words.values()) {
      const ent = this.activeOf(ws)
      const riddles = ws.def.riddles
      if (!ent || !ent.kind.sphinx || !riddles?.length) continue
      const id = ws.def.id
      if (!this.asked.has(id)) {
        if (Math.abs(p.x - (ent.box.x + ent.box.w / 2)) < 560) {
          this.asked.add(id)
          this.events.push({ type: 'riddle', wordId: id, index: 0 })
        }
        continue
      }
      let i = this.riddles.get(id) ?? 0
      while (i < riddles.length && spelled.has(riddles[i].a)) {
        i++
        this.riddles.set(id, i)
        this.events.push({ type: 'riddle', wordId: id, index: i })
      }
      if (i >= riddles.length) ent.resting = true
    }
  }

  riddlesSolved(wordId: string): number {
    return this.riddles.get(wordId) ?? 0
  }

  private zoneAt(test: (k: Kind) => boolean | undefined): Rect | null {
    const pb = this.playerBox()
    for (const ent of this.entities()) if (test(ent.kind) && overlap(pb, ent.box)) return ent.box
    return null
  }

  private overlapsSolid(r: Rect, except: Rect): boolean {
    return this.solids().some((s) => s.r !== except && overlap(r, s.r))
  }

  private surfaceY(s: Surface, p: Player): number | null {
    if (s.flat) {
      if (p.x + this.pw / 2 - 3 <= s.x0 || p.x - this.pw / 2 + 3 >= s.x1) return null
      return s.y0
    }
    if (p.x < s.x0 || p.x > s.x1) return null
    return s.y0 + ((s.y1 - s.y0) * (p.x - s.x0)) / (s.x1 - s.x0)
  }

  step(dt: number, input: Input): void {
    for (const g of this.ghosts) g.age += dt
    this.ghosts = this.ghosts.filter((g) => g.age < 0.6)
    for (const ent of this.entities()) ent.age += dt
    if (this.complete) return
    this.time += dt
    this.updateClock(dt)
    this.updateBlot(dt)
    this.updateSphinxes()
    this.updatePools(dt)
    this.updateGuards(dt)
    this.moveEntities(dt)

    if (this.dead) {
      this.deathTimer -= dt
      if (this.deathTimer <= 0) this.respawn()
      return
    }

    this.physics(dt, input)
    const p = this.player
    const pb = inset(this.playerBox(), 3, 3)

    if (p.y - this.ph > (this.level.height ?? 540) + 40) return this.die()
    for (const h of this.hazards()) if (overlap(pb, h)) return this.die()
    if (pb.x < this.blotFront && !this.isInkblot) return this.die()

    const cps = this.level.checkpoints ?? []
    cps.forEach((cp, i) => {
      if (!this.reached.has(i) && p.grounded && p.x >= cp.x && Math.abs(p.y - cp.y) < 40) {
        this.reached.add(i)
        this.checkpoint = { ...cp }
        this.events.push({ type: 'checkpoint', x: cp.x, y: cp.y })
      }
    })

    this.catchLetters()

    const d = this.level.diary
    if (d && !this.diaryTaken && this.diaryVisible) {
      if (Math.hypot(p.x - d.x, p.y - this.ph / 2 - d.y) < 36) {
        this.diaryTaken = true
        this.events.push({ type: 'diary', id: d.id })
      }
    }

    const ex = this.level.exit
    if (this.exitOpen && overlap(this.playerBox(), { x: ex.x - 22, y: ex.y - 72, w: 44, h: 72 })) {
      this.complete = true
      this.events.push({ type: 'complete', edits: this.edits })
    }
  }

  private die(): void {
    const p = this.player
    this.dead = true
    this.deathTimer = 0.9
    this.events.push({ type: 'death', x: p.x, y: p.y - this.ph / 2 })
  }

  private respawn(): void {
    if (this.level.blot || this.level.restartOnDeath) {
      // The Blot and the flood don't give second chances: the whole page starts over.
      this.reset()
    } else {
      this.dead = false
      this.spawnPlayer(this.checkpoint)
    }
    this.events.push({ type: 'respawn' })
  }

  /** Moves everything that moves: shuttles, floaters, swimmers, the flood, the Librarian. */
  private moveEntities(dt: number): void {
    const p = this.player
    for (const ent of this.allEntities()) {
      const px = ent.box.x
      const py = ent.box.y
      this.position(ent, dt)
      if (!this.dead && p.ground === ent) {
        p.x += ent.box.x - px
        p.y += ent.box.y - py
      }
    }
  }

  private position(ent: Entity, dt: number): void {
    if (ent.kind.tag || ent.kind.reader || ent.kind.chaser) {
      const at = this.labelPos(ent)
      ent.box = { x: at.x - 30, y: at.y - 12, w: 60, h: 24 }
      ent.home = { ...ent.box }
      return
    }
    let ox = 0
    let oy = 0
    const v = ent.veh
    if (v) {
      const len = Math.hypot(v.dx, v.dy)
      if (len > 0) {
        if (v.wait > 0) {
          v.wait -= dt
        } else {
          v.s += (v.dir * v.speed * dt) / len
          if (v.s >= 1) {
            v.s = 1
            v.dir = -1
            v.wait = 1.1
          } else if (v.s <= 0) {
            v.s = 0
            v.dir = 1
            v.wait = 1.1
          }
        }
        const e = ease(v.s)
        ox = v.dx * e
        oy = v.dy * e
      }
    }
    ent.box.x = ent.home.x + ox
    ent.box.y = ent.home.y + oy
    if (ent.guard) ent.box.x = ent.guard.x - ent.box.w / 2
    const k = ent.kind
    if (k.flood) {
      const pool = this.pools[0]
      if (pool) {
        ent.box = { x: pool.def.x, y: pool.surface, w: pool.def.w, h: Math.max(0, pool.def.bottom - pool.surface) }
        ent.home = { ...ent.box }
      }
      return
    }
    if (k.floats === undefined && k.swims === undefined) return
    const pool = this.poolAt(ent.box.x + ent.box.w / 2)
    if (!pool) return
    if (k.floats !== undefined) ent.box.y = pool.surface - ent.box.h + k.floats
    else ent.box.y = Math.min(pool.surface + (k.swims ?? 0), pool.def.bottom - ent.box.h)
  }

  // ------------------------------------------------------------ the Librarian

  private noiseNear(x: number): WordState | null {
    let best: WordState | null = null
    for (const ws of this.words.values()) {
      if (!ws.ent.kind.noise) continue
      if (!best || Math.abs(ws.ent.box.x - x) < Math.abs(best.ent.box.x - x)) best = ws
    }
    return best
  }

  private updateGuards(dt: number): void {
    for (const ent of this.entities()) {
      const g = ent.guard
      if (!g) continue
      const move = (tx: number, speed: number): boolean => {
        const d = tx - g.x
        if (Math.abs(d) > 1) g.facing = d > 0 ? 1 : -1
        g.x = approach(g.x, tx, speed * dt)
        return Math.abs(tx - g.x) < 2
      }
      const target = g.target ? this.words.get(g.target) : undefined
      const noise = this.noiseNear(g.x)
      switch (g.state) {
        case 'post':
          move(g.post + Math.sin(this.time * 0.7) * 30, 40)
          if (noise) {
            g.state = 'going'
            g.target = noise.def.id
            this.events.push({ type: 'lure', x: g.x })
          }
          break
        case 'going': {
          if (!target || !target.ent.kind.noise) {
            g.state = 'return'
            break
          }
          const nx = target.ent.box.x + target.ent.box.w / 2
          if (move(nx + (g.x >= nx ? 34 : -34), 150)) {
            g.state = 'shush'
            g.timer = 2.4
            this.events.push({ type: 'shush', x: g.x, y: ent.box.y })
          }
          break
        }
        case 'shush':
          if (!target || !target.ent.kind.noise) {
            g.state = 'return'
            break
          }
          g.timer -= dt
          if (g.timer <= 0) {
            this.setText(target, 'HUSH')
            g.state = 'return'
          }
          break
        case 'return':
          if (noise) {
            g.state = 'going'
            g.target = noise.def.id
            this.events.push({ type: 'lure', x: g.x })
          } else if (move(g.post, 70)) g.state = 'post'
          break
      }
    }
  }

  // ------------------------------------------------------------------ letters

  private catchLetters(): void {
    const p = this.player
    const cx = p.x
    const cy = p.y - this.ph / 2
    let near: string | null = null
    for (const l of this.freeLetters()) {
      if (Math.hypot(cx - l.x, cy - l.y) > 30) continue
      near = l.id
      if (!this.canPlace || this.quill.length >= this.level.quill) {
        if (this.fullNear !== l.id) this.events.push({ type: 'refused', reason: 'full' })
        continue
      }
      this.taken.add(l.id)
      this.quill.push(l.letter)
      this.events.push({ type: 'letter', letter: l.letter, x: l.x, y: l.y })
    }
    this.fullNear = near
  }

  private physics(dt: number, inp: Input): void {
    const p = this.player
    const you = this.you
    const move = MOVE * (you?.speed ?? 1)
    const jumpV = JUMP_V * (you?.jump ?? 1)
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0)
    if (dir) p.facing = dir as 1 | -1

    const climbZone = this.zoneAt((k) => k.climb)
    if (!p.climbing && climbZone && (inp.up || (inp.down && !p.grounded))) {
      p.climbing = true
      p.vy = 0
    }
    if (p.climbing && !climbZone) p.climbing = false

    const wantsJump = inp.jumpPressed || (inp.upPressed && !climbZone)
    p.buffer = wantsJump ? 0.13 : p.buffer - dt

    if (p.climbing) {
      p.vx = dir * 120
      p.vy = ((inp.down ? 1 : 0) - (inp.up ? 1 : 0)) * CLIMB_V
      if (inp.jumpPressed) {
        p.climbing = false
        p.vy = -jumpV * 0.75
        p.buffer = 0
        this.events.push({ type: 'jump' })
      }
    } else {
      p.vx = approach(p.vx, dir * move, (p.grounded ? 2600 : 1700) * dt)
      p.coyote = p.grounded ? 0.1 : p.coyote - dt
      if (p.buffer > 0 && p.coyote > 0) {
        p.vy = -jumpV
        p.grounded = false
        p.ground = null
        p.coyote = 0
        p.buffer = 0
        this.events.push({ type: 'jump' })
      }
      const updraft = this.zoneAt((k) => k.updraft)
      p.vy += GRAVITY * dt
      if (updraft) p.vy = Math.max(p.vy - UPDRAFT * dt, -UPDRAFT_MAX)
      else if (p.vy < 0 && !inp.jump && !p.boost) p.vy += GRAVITY * 0.9 * dt
      if (p.vy >= 0) p.boost = false
      p.vy = Math.min(p.vy, MAX_FALL)
    }

    const wasGrounded = p.grounded
    const fallSpeed = p.vy

    // Horizontal.
    p.x += p.vx * dt
    for (const s of this.solids()) {
      const b = this.playerBox()
      if (!overlap(b, s.r)) continue
      const rise = p.y - s.r.y
      const stepBox = { x: b.x, y: s.r.y - this.ph, w: this.pw, h: this.ph }
      if ((wasGrounded || p.climbing) && rise > 0 && rise <= STEP_UP && !this.overlapsSolid(stepBox, s.r)) {
        p.y = s.r.y
        continue
      }
      p.x = p.x < s.r.x + s.r.w / 2 ? s.r.x - this.pw / 2 - 0.001 : s.r.x + s.r.w + this.pw / 2 + 0.001
      p.vx = 0
    }
    p.x = Math.max(this.pw / 2, Math.min(this.level.width - this.pw / 2, p.x))

    // Vertical.
    const prevFeet = p.y
    const prevTop = p.y - this.ph
    p.y += p.vy * dt
    p.grounded = false
    p.ground = null
    for (const s of this.solids()) {
      if (!overlap(this.playerBox(), s.r)) continue
      if (p.vy >= 0 && prevFeet <= s.r.y + 2) {
        p.y = s.r.y
        p.vy = 0
        p.grounded = true
        p.ground = s.ent ?? 'terrain'
      } else if (p.vy < 0 && prevTop >= s.r.y + s.r.h - 2) {
        p.y = s.r.y + s.r.h + this.ph
        p.vy = 0
      }
    }
    if (!p.climbing && p.vy >= 0) {
      let best: { y: number; ent: Entity } | null = null
      for (const s of this.surfaces()) {
        const sy = this.surfaceY(s, p)
        if (sy === null) continue
        // Ramps are filled hills: anyone inside one is lifted onto its surface.
        const insideHill = !s.flat && p.y <= Math.max(s.y0, s.y1) + 1
        const fromAbove = insideHill || prevFeet <= sy + (wasGrounded ? 12 : 3)
        const reaches = p.y >= sy - (wasGrounded ? 10 : 0)
        if (fromAbove && reaches && (!best || sy < best.y)) best = { y: sy, ent: s.ent }
      }
      if (best && (!p.grounded || best.y <= p.y)) {
        p.y = best.y
        if (best.ent.kind.bouncy) {
          // Sprung back up, higher than any jump.
          p.vy = -BOUNCE
          p.grounded = false
          p.ground = null
          p.boost = true
          this.events.push({ type: 'bounce' })
        } else {
          p.vy = 0
          p.grounded = true
          p.ground = best.ent
        }
      }
    }

    if (p.climbing) {
      // Clamp against the zone we started the step in; re-testing after moving would miss the top edge.
      const zone = climbZone
      if (zone && p.y < zone.y + 1) {
        // Keep the feet just inside the zone, so stepping sideways off the top still counts as climbing.
        p.y = zone.y + 1
        if (p.vy < 0) p.vy = 0
      }
    }

    if (p.grounded && !wasGrounded && fallSpeed > 200) this.events.push({ type: 'land', speed: fallSpeed })
    p.air = p.grounded || p.climbing ? 0 : p.air + dt
    p.walk = p.grounded && Math.abs(p.vx) > 10 ? p.walk + dt * Math.abs(p.vx) * 0.045 : p.climbing ? p.walk + dt * Math.abs(p.vy) * 0.05 : p.walk
  }
}
