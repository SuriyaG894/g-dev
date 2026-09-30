import * as ink from './ink'
import { LEXICON, SCRIBBLE, WHISPER, tierOf, whisperWidth, type Kind, type Tier } from './lexicon'
import type { Input, LetterDef, LevelDef, Op, PoolDef, Rect, Vec, WordDef } from './types'

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
}

export type EditRefusal = 'far' | 'dark' | 'gold' | 'full' | 'short' | 'power' | 'busy'

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

interface WordState {
  def: WordDef
  text: string
  ent: Entity
}

interface Snapshot {
  texts: Record<string, string>
  quill: string[]
  taken: string[]
  edit: boolean
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
  quill: string[] = []
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
  private uid = 0

  constructor(level: LevelDef) {
    this.level = level
    this.checkpoint = { ...level.spawn }
    this.reset()
  }

  /** Back to the start of the page (the diary page stays collected). */
  reset(): void {
    this.pools = (this.level.pools ?? []).map((def) => ({ def, base: def.base, surface: def.base }))
    this.taken.clear()
    this.words.clear()
    for (const def of this.level.words) {
      const ws = { def, text: def.text } as WordState
      ws.ent = this.build(ws, def.text, null)
      this.words.set(def.id, ws)
    }
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
    }
  }

  // ---------------------------------------------------------------- entities

  private build(ws: WordState, text: string, prev: Entity | null): Entity {
    const def = ws.def
    const tune = def.tune?.[text] ?? {}
    const tier = tierOf(text)
    let kind: Kind
    let ax = tune.x ?? def.x
    let ay = tune.y ?? def.y
    let w: number
    let h: number
    if (tier === 'thing') {
      kind = LEXICON[text]
      w = tune.w ?? kind.w
      h = tune.h ?? kind.h
    } else if (tier === 'whisper') {
      kind = WHISPER
      w = whisperWidth(text)
      h = WHISPER.h
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
      light: tune.light ?? kind.light ?? 0,
      labelY: tune.ly,
      anchorX: tune.x ?? def.x,
      labelX: tune.lx ?? (kind.flood ? def.x : kind.scribble ? prev?.labelX : undefined),
    }
    if (kind.vehicle || tune.dx || tune.dy) {
      ent.veh = { dx: tune.dx ?? 0, dy: tune.dy ?? 0, speed: tune.speed ?? 90, s: 0, dir: 1, wait: 1 }
    }
    if (kind.guardian) ent.guard = { x: ax, post: ax, state: 'post', timer: 0, target: null, facing: -1 }
    if (this.pools.length) this.position(ent, 0)
    return ent
  }

  entities(): Entity[] {
    return [...this.words.values()].map((w) => w.ent)
  }

  get isDark(): boolean {
    if (this.level.dark) return true
    for (const ws of this.words.values()) if (ws.ent.kind.darkness) return true
    return false
  }

  labelPos(ent: Entity): Vec {
    const cx = ent.labelX ?? ent.box.x + ent.box.w / 2
    if (ent.kind.whisper) return { x: cx, y: ent.box.y + ent.box.h / 2 }
    const y = ent.labelY ?? ent.box.y - 16
    return { x: cx, y: Math.max(22, y) }
  }

  lightPos(ent: Entity): Vec {
    if (ent.kind.art === 'lamp') return { x: ent.box.x + ent.box.w / 2, y: ent.box.y + 14 }
    return { x: ent.box.x + ent.box.w / 2, y: ent.box.y + ent.box.h / 2 }
  }

  lights(): { x: number; y: number; r: number }[] {
    const p = this.player
    const out = [{ x: p.x, y: p.y - PLAYER_H / 2, r: PLAYER_LIGHT }]
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
    this.events.push({ type: 'transform', wordId: ws.def.id, from, to: text, tier: tierOf(text), x: at.x, y: at.y })
    if (this.isDark !== wasDark) this.events.push({ type: 'dark', on: this.isDark })
    this.unstick()
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
    if (ws.def.gold) return 'gold'
    const at = this.labelPos(ws.ent)
    const p = this.player
    if (Math.hypot(at.x - p.x, at.y - (p.y - PLAYER_H / 2)) > REACH) return 'far'
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
    for (const [id, ws] of this.words) texts[id] = ws.text
    this.history.push({ texts, quill: [...this.quill], taken: [...this.taken], edit })
  }

  pluckLetter(wordId: string, index: number): boolean {
    if (!this.level.powers.includes('pluck')) return this.refuse('power')
    const why = this.canEdit(wordId)
    if (why) return this.refuse(why)
    const ws = this.words.get(wordId)!
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
    this.snapshot(true)
    this.quill.splice(quillIndex, 1)
    const at = this.labelPos(ws.ent)
    this.events.push({ type: 'place', letter, x: at.x, y: at.y })
    this.setText(ws, ink.place(ws.text, gap, letter))
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
    for (const [id, ws] of this.words) {
      const text = snap.texts[id]
      if (text !== ws.text) {
        // Restore the exact old shape rather than re-deriving a scribble from the current one.
        const ghost = [...this.ghosts].reverse().find((g) => g.ent.wordId === id && g.ent.text === text)
        this.setText(ws, text, ghost?.ent)
      }
    }
    this.quill = snap.quill
    this.taken.clear()
    for (const id of snap.taken) this.taken.add(id)
    this.events.push({ type: 'undo' })
    return true
  }

  /** Applies a solution step (used by tests and the dev hint tool). */
  apply(op: Op): boolean {
    if (op.type === 'pluck') return this.pluckLetter(op.word, op.index)
    return this.placeLetter(op.word, op.index, this.quill.indexOf(op.letter))
  }

  // ----------------------------------------------------------------- physics

  playerBox(): Rect {
    const p = this.player
    return { x: p.x - PLAYER_W / 2, y: p.y - PLAYER_H, w: PLAYER_W, h: PLAYER_H }
  }

  solids(): Solid[] {
    const out: Solid[] = this.level.terrain.map((r) => ({ r, ent: null }))
    for (const ent of this.entities()) if (ent.kind.solid) out.push({ r: ent.box, ent })
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

  freeLetters(): LetterDef[] {
    return (this.level.letters ?? []).filter((l) => !this.taken.has(l.id))
  }

  get blotFront(): number {
    const b = this.level.blot
    if (!b) return -Infinity
    return b.x + Math.max(0, this.time - b.delay) * b.speed
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
      if (p.x + PLAYER_W / 2 - 3 <= s.x0 || p.x - PLAYER_W / 2 + 3 >= s.x1) return null
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

    if (p.y - PLAYER_H > (this.level.height ?? 540) + 40) return this.die()
    for (const h of this.hazards()) if (overlap(pb, h)) return this.die()
    if (pb.x < this.blotFront) return this.die()

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
    if (d && !this.diaryTaken && (!d.onlyInDark || this.isDark)) {
      if (Math.hypot(p.x - d.x, p.y - PLAYER_H / 2 - d.y) < 36) {
        this.diaryTaken = true
        this.events.push({ type: 'diary', id: d.id })
      }
    }

    const ex = this.level.exit
    if (overlap(this.playerBox(), { x: ex.x - 22, y: ex.y - 72, w: 44, h: 72 })) {
      this.complete = true
      this.events.push({ type: 'complete', edits: this.edits })
    }
  }

  private die(): void {
    const p = this.player
    this.dead = true
    this.deathTimer = 0.9
    this.events.push({ type: 'death', x: p.x, y: p.y - PLAYER_H / 2 })
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
    for (const ent of this.entities()) {
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
    const cy = p.y - PLAYER_H / 2
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
        p.vy = -JUMP_V * 0.75
        p.buffer = 0
        this.events.push({ type: 'jump' })
      }
    } else {
      p.vx = approach(p.vx, dir * MOVE, (p.grounded ? 2600 : 1700) * dt)
      p.coyote = p.grounded ? 0.1 : p.coyote - dt
      if (p.buffer > 0 && p.coyote > 0) {
        p.vy = -JUMP_V
        p.grounded = false
        p.ground = null
        p.coyote = 0
        p.buffer = 0
        this.events.push({ type: 'jump' })
      }
      const updraft = this.zoneAt((k) => k.updraft)
      p.vy += GRAVITY * dt
      if (updraft) p.vy = Math.max(p.vy - UPDRAFT * dt, -UPDRAFT_MAX)
      else if (p.vy < 0 && !inp.jump) p.vy += GRAVITY * 0.9 * dt
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
      const stepBox = { x: b.x, y: s.r.y - PLAYER_H, w: PLAYER_W, h: PLAYER_H }
      if ((wasGrounded || p.climbing) && rise > 0 && rise <= STEP_UP && !this.overlapsSolid(stepBox, s.r)) {
        p.y = s.r.y
        continue
      }
      p.x = p.x < s.r.x + s.r.w / 2 ? s.r.x - PLAYER_W / 2 - 0.001 : s.r.x + s.r.w + PLAYER_W / 2 + 0.001
      p.vx = 0
    }
    p.x = Math.max(PLAYER_W / 2, Math.min(this.level.width - PLAYER_W / 2, p.x))

    // Vertical.
    const prevFeet = p.y
    const prevTop = p.y - PLAYER_H
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
        p.y = s.r.y + s.r.h + PLAYER_H
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
        p.vy = 0
        p.grounded = true
        p.ground = best.ent
      }
    }

    if (p.climbing) {
      const zone = this.zoneAt((k) => k.climb)
      if (zone && p.y < zone.y) {
        p.y = zone.y
        if (p.vy < 0) p.vy = 0
      }
    }

    if (p.grounded && !wasGrounded && fallSpeed > 200) this.events.push({ type: 'land', speed: fallSpeed })
    p.air = p.grounded || p.climbing ? 0 : p.air + dt
    p.walk = p.grounded && Math.abs(p.vx) > 10 ? p.walk + dt * Math.abs(p.vx) * 0.045 : p.climbing ? p.walk + dt * Math.abs(p.vy) * 0.05 : p.walk
  }
}
