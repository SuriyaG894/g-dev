import type { Theme } from '../game/types'
import { PLAYER_H, REACH, type Entity, type World } from '../game/world'
import { ART } from './art'
import { PALETTES, type Palette } from './palette'
import type { Particles } from './particles'
import { Pen, type Pt } from './pen'

export const VIEW_H = 540
const MIN_VIEW_W = 660

export interface DrawState {
  t: number
  hover: string | null
  selected: string | null
  reduced: boolean
  particles: Particles
  shake: number
  debug?: boolean
}

export interface LabelHit {
  wordId: string
  x: number
  y: number
  w: number
  h: number
}

const P = (x: number, y: number): Pt => ({ x, y })

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export class Renderer {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  readonly pen: Pen
  font = '"IM Fell English SC", Georgia, serif'
  italic = '"IM Fell English", Georgia, serif'
  dpr = 1
  cssW = 0
  cssH = 0
  scale = 1
  viewW = 960
  offY = 0
  camX = 0
  labels: LabelHit[] = []
  private noise: CanvasPattern | null = null
  private dark: HTMLCanvasElement
  private darkCtx: CanvasRenderingContext2D
  private darkAmt = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.pen = new Pen(this.ctx)
    this.dark = document.createElement('canvas')
    this.darkCtx = this.dark.getContext('2d')!
    this.noise = this.makeNoise()
    this.resize()
  }

  setReadableFont(on: boolean): void {
    this.font = on ? '"Atkinson Hyperlegible", Verdana, sans-serif' : '"IM Fell English SC", Georgia, serif'
    this.italic = on ? '"Atkinson Hyperlegible", Verdana, sans-serif' : '"IM Fell English", Georgia, serif'
  }

  private makeNoise(): CanvasPattern | null {
    const n = document.createElement('canvas')
    n.width = n.height = 256
    const c = n.getContext('2d')!
    for (let i = 0; i < 9000; i++) {
      const dark = Math.random() < 0.6
      c.fillStyle = dark ? `rgba(90,60,30,${0.02 + Math.random() * 0.05})` : `rgba(255,255,255,${0.04 + Math.random() * 0.06})`
      c.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random(), 1 + Math.random())
    }
    c.strokeStyle = 'rgba(110,80,40,0.05)'
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      c.beginPath()
      c.moveTo(x, y)
      c.quadraticCurveTo(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10, x + Math.random() * 30 - 15, y + Math.random() * 30 - 15)
      c.stroke()
    }
    return this.ctx.createPattern(n, 'repeat')
  }

  resize(): void {
    this.cssW = window.innerWidth
    this.cssH = window.innerHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.cssW * this.dpr)
    this.canvas.height = Math.round(this.cssH * this.dpr)
    this.canvas.style.width = this.cssW + 'px'
    this.canvas.style.height = this.cssH + 'px'
    this.dark.width = this.canvas.width
    this.dark.height = this.canvas.height
    this.scale = this.cssH / VIEW_H
    if (this.cssW / this.scale < MIN_VIEW_W) this.scale = this.cssW / MIN_VIEW_W
    this.viewW = this.cssW / this.scale
    this.offY = (this.cssH - VIEW_H * this.scale) / 2
  }

  toWorld(px: number, py: number): Pt {
    return { x: px / this.scale + this.camX, y: (py - this.offY) / this.scale }
  }

  toScreen(x: number, y: number): Pt {
    return { x: (x - this.camX) * this.scale, y: y * this.scale + this.offY }
  }

  follow(world: World, dt: number, snap = false): void {
    const p = world.player
    const max = Math.max(0, world.level.width - this.viewW)
    let target = p.x - this.viewW * 0.42 + p.vx * 0.25
    target = world.level.width < this.viewW ? (world.level.width - this.viewW) / 2 : Math.max(0, Math.min(max, target))
    this.camX = snap ? target : this.camX + (target - this.camX) * Math.min(1, dt * 4)
    if (snap) this.darkAmt = world.isDark ? 1 : 0
  }

  // ------------------------------------------------------------------ frame

  private paperFill(pal: Palette): void {
    const c = this.ctx
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    c.fillStyle = pal.paper
    c.fillRect(0, 0, this.cssW, this.cssH)
    if (this.noise) {
      c.fillStyle = this.noise
      c.fillRect(0, 0, this.cssW, this.cssH)
    }
  }

  private vignette(strength = 0.28): void {
    const c = this.ctx
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    const g = c.createRadialGradient(this.cssW / 2, this.cssH / 2, Math.min(this.cssW, this.cssH) * 0.35, this.cssW / 2, this.cssH / 2, Math.max(this.cssW, this.cssH) * 0.75)
    g.addColorStop(0, 'rgba(80,50,20,0)')
    g.addColorStop(1, `rgba(80,50,20,${strength})`)
    c.fillStyle = g
    c.fillRect(0, 0, this.cssW, this.cssH)
  }

  private worldTransform(shake: number): void {
    const s = this.scale * this.dpr
    const sx = shake ? (Math.random() - 0.5) * shake : 0
    const sy = shake ? (Math.random() - 0.5) * shake : 0
    this.ctx.setTransform(s, 0, 0, s, (-this.camX + sx) * s, (this.offY + sy * this.scale) * this.dpr)
  }

  draw(world: World, st: DrawState): void {
    const lvl = world.level
    const pal = PALETTES[lvl.theme]
    const pen = this.pen
    const c = this.ctx
    pen.ink = pal.ink
    pen.wobble = st.reduced ? 0.8 : 1.2
    const boil = st.reduced ? 0 : Math.floor(st.t * 6) % 4

    this.paperFill(pal)
    this.worldTransform(st.shake)

    pen.boil = 0
    this.background(lvl.theme, pal, st.t, lvl.width)
    this.stains(lvl.id)
    pen.boil = boil

    for (const w of lvl.water ?? []) this.water(w.x, w.y, w.w, w.h, pal, st.t)
    lvl.terrain.forEach((r, i) => this.terrain(r.x, r.y, r.w, r.h, i, pal, lvl.theme))
    ;(lvl.checkpoints ?? []).forEach((cp, i) => this.checkpoint(cp.x, cp.y, world.reached.has(i), pal, st.t))
    this.exit(lvl.exit.x, lvl.exit.y, pal, st.t)

    for (const g of world.ghosts) {
      c.save()
      c.globalAlpha = Math.max(0, 1 - g.age / 0.6)
      c.translate(0, -g.age * 24)
      this.entity(g.ent, pal, st, boil, 1)
      c.restore()
    }
    for (const ent of world.entities()) {
      const reveal = st.reduced ? 1 : Math.min(1, ent.age / 0.45)
      this.entity(ent, pal, st, boil, reveal)
    }
    this.labelsFor(world, pal, st)

    if (!world.dead) this.player(world, pal, st.t)
    st.particles.draw(c, this.font)
    if (lvl.blot) this.blot(world.blotFront, pal, st.t)

    // Darkness.
    const target = world.isDark ? 1 : 0
    this.darkAmt += (target - this.darkAmt) * Math.min(1, 1 / 30)
    if (this.darkAmt > 0.01) this.darkness(world, st.t)
    this.worldTransform(st.shake)
    this.diary(world, st.t)

    if (st.selected) this.editOverlay(world, pal)
    if (st.debug) this.debug(world)
    this.vignette()
  }

  // ------------------------------------------------------------- background

  private background(theme: Theme, pal: Palette, t: number, width: number): void {
    const pen = this.pen
    const c = this.ctx
    const par = 0.35
    const left = this.camX * par
    const x0 = this.camX - 40
    const x1 = this.camX + this.viewW + 40
    // Parallax space → world space.
    const wx = (px: number) => this.camX + (px - left)

    if (theme === 'night' || theme === 'blot') {
      c.save()
      for (let i = 0; i < 60; i++) {
        const px = hash(i) * (width * par + this.viewW)
        const x = wx(px)
        if (x < x0 || x > x1) continue
        c.globalAlpha = (theme === 'night' ? 0.35 : 0.18) * (0.6 + 0.4 * Math.sin(t * 2 + i))
        c.fillStyle = pal.ink
        c.fillRect(x, 20 + hash(i + 99) * 200, 2, 2)
      }
      c.restore()
    }
    if (theme === 'blot') {
      for (let i = 0; i < 26; i++) {
        const x = wx(hash(i + 7) * (width * par + this.viewW))
        if (x < x0 || x > x1) continue
        const len = 40 + hash(i + 3) * 160 + Math.sin(t * 0.7 + i) * 10
        pen.seed(i + 500)
        pen.line(x, 0, x + 2, len, { w: 3 + hash(i) * 5, color: pal.blot, alpha: 0.13, plain: true })
        c.save()
        c.globalAlpha = 0.13
        c.fillStyle = pal.blot
        c.beginPath()
        c.arc(x + 2, len, 4 + hash(i) * 4, 0, Math.PI * 2)
        c.fill()
        c.restore()
      }
    }
    // Hills.
    const hill: Pt[] = []
    for (let px = Math.floor((left - 60) / 40) * 40; px <= left + this.viewW + 60; px += 40) {
      hill.push(P(wx(px), 330 + Math.sin(px * 0.004) * 34 + Math.sin(px * 0.013) * 12))
    }
    pen.seed(1)
    pen.stroke(hill, { w: 1.6, alpha: 0.16, plain: true })
    // Distant trees.
    if (theme !== 'blot') {
      const step = 70
      for (let px = Math.floor((left - 80) / step) * step; px <= left + this.viewW + 80; px += step) {
        const k = px / step
        if (hash(k) < 0.35) continue
        const x = wx(px + hash(k + 1) * 30)
        const base = 330 + Math.sin(px * 0.004) * 34 + Math.sin(px * 0.013) * 12
        const h = 40 + hash(k + 2) * 70
        pen.seed(k * 7)
        if (theme === 'river' && hash(k + 5) < 0.5) {
          for (let r = 0; r < 3; r++) pen.line(x + r * 5, base, x + r * 6 + 4, base - h * 0.5, { w: 1.2, alpha: 0.16, plain: true })
          continue
        }
        pen.stroke([P(x - h * 0.28, base), P(x, base - h), P(x + h * 0.28, base)], { close: true, w: 1.3, alpha: 0.17, fill: pal.ink, fillAlpha: 0.035, plain: true })
      }
    }
    if (theme === 'night') {
      pen.seed(4)
      const mx = wx(left + this.viewW * 0.78)
      pen.ellipse(mx, 90, 30, 30, { w: 1.5, alpha: 0.25, plain: true })
    }
  }

  private stains(levelId: string): void {
    const c = this.ctx
    const seed = [...levelId].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7)
    c.save()
    for (let i = 0; i < 4; i++) {
      const x = hash(seed + i) * 2400 + 200
      if (x < this.camX - 200 || x > this.camX + this.viewW + 200) continue
      const y = 60 + hash(seed + i + 10) * 260
      const r = 40 + hash(seed + i + 20) * 50
      c.strokeStyle = 'rgba(120,80,35,0.075)'
      c.lineWidth = 5 + hash(seed + i + 30) * 6
      c.beginPath()
      c.ellipse(x, y, r, r * 0.92, 0, 0.3, Math.PI * 2 - 0.2)
      c.stroke()
      c.fillStyle = 'rgba(120,80,35,0.025)'
      c.fill()
    }
    c.restore()
  }

  private terrain(x: number, y: number, w: number, h: number, i: number, pal: Palette, theme: Theme): void {
    if (x > this.camX + this.viewW + 20 || x + w < this.camX - 20) return
    const pen = this.pen
    const c = this.ctx
    pen.seed(i * 1013)
    if (h <= 20) {
      for (let px = x; px < x + w; px += 18) pen.rect(px + 1, y, 15, h - 2, { fill: '#8a6a43', fillAlpha: 0.4, w: 1.5, plain: true })
      pen.line(x - 4, y - 16, x + w + 4, y - 14, { w: 1.4, alpha: 0.7 })
      for (let px = x; px <= x + w; px += 36) pen.line(px, y - 15, px, y, { w: 1.2, alpha: 0.7, plain: true })
      return
    }
    const bottom = VIEW_H + 40
    c.save()
    c.globalAlpha = 0.72
    c.fillStyle = pal.paperDark
    c.fillRect(x, y, w, bottom - y)
    c.restore()
    const vx0 = Math.max(x, this.camX - 20)
    const vx1 = Math.min(x + w, this.camX + this.viewW + 20)
    pen.hatch(vx0, y + 6, vx1 - vx0, bottom - y, { gap: 11, alpha: 0.14 })
    const top: Pt[] = []
    for (let px = x; px < x + w; px += 32) top.push(P(px, y + (hash(px + i) - 0.5) * 2))
    top.push(P(x + w, y))
    pen.stroke(top, { w: 3 })
    pen.line(x, y, x - 1, bottom, { w: 2 })
    pen.line(x + w, y, x + w + 1, bottom, { w: 2 })
    if (theme === 'blot') return
    for (let px = Math.ceil(vx0 / 22) * 22; px < vx1 - 4; px += 22) {
      if (hash(px) < 0.35) continue
      const gx = px + hash(px + 1) * 8
      pen.line(gx, y, gx - 3, y - 6 - hash(px + 2) * 5, { w: 1.2, color: pal.leaf, alpha: 0.8, plain: true })
      pen.line(gx + 2, y, gx + 5, y - 5 - hash(px + 3) * 5, { w: 1.2, color: pal.leaf, alpha: 0.8, plain: true })
    }
  }

  private water(x: number, y: number, w: number, h: number, pal: Palette, t: number): void {
    const c = this.ctx
    const pen = this.pen
    c.save()
    c.globalAlpha = 0.32
    c.fillStyle = pal.water
    c.fillRect(x, y, w, h + 40)
    c.restore()
    for (let row = 0; row < 3; row++) {
      const pts: Pt[] = []
      for (let px = x; px <= x + w; px += 16) pts.push(P(px, y + row * 18 + Math.sin(px * 0.05 + t * (1.6 + row * 0.5) + row) * 2.5))
      pen.seed(row + 77)
      pen.stroke(pts, { w: row === 0 ? 2.2 : 1, color: row === 0 ? pal.ink : pal.water, alpha: row === 0 ? 0.9 : 0.6, plain: true })
    }
  }

  private checkpoint(x: number, y: number, on: boolean, pal: Palette, t: number): void {
    const pen = this.pen
    pen.seed(x)
    pen.line(x, y, x, y - 46, { w: 1.8, alpha: on ? 1 : 0.45 })
    const f = on ? Math.sin(t * 4) * 3 : 0
    pen.stroke([P(x, y - 46), P(x + 20, y - 43 + f), P(x + 13, y - 37 + f * 0.5), P(x + 20, y - 31 + f), P(x, y - 32)], {
      close: true,
      fill: on ? '#9b3b2e' : pal.ink,
      fillAlpha: on ? 0.85 : 0.15,
      w: 1.4,
      alpha: on ? 1 : 0.45,
    })
  }

  private exit(x: number, y: number, pal: Palette, t: number): void {
    const c = this.ctx
    const pen = this.pen
    const pulse = 0.8 + Math.sin(t * 2.4) * 0.2
    const g = c.createRadialGradient(x, y - 36, 4, x, y - 36, 90)
    g.addColorStop(0, `rgba(245,217,138,${0.55 * pulse})`)
    g.addColorStop(1, 'rgba(245,217,138,0)')
    c.fillStyle = g
    c.fillRect(x - 90, y - 126, 180, 180)
    pen.seed(9)
    pen.stroke([P(x - 20, y), P(x - 20, y - 66), P(x + 8, y - 66), P(x + 20, y - 54), P(x + 20, y)], { close: true, fill: '#fbf5e4', w: 2.2 })
    pen.stroke([P(x + 8, y - 66), P(x + 8, y - 54), P(x + 20, y - 54)], { w: 1.6 })
    for (let i = 0; i < 4; i++) pen.line(x - 13, y - 52 + i * 11, x + 12 - (i === 3 ? 10 : 0), y - 52 + i * 11, { w: 1, alpha: 0.35, plain: true })
    c.save()
    c.globalAlpha = 0.5 + Math.sin(t * 3) * 0.3
    c.fillStyle = pal.gold
    c.font = `15px ${this.italic}`
    c.textAlign = 'center'
    c.fillText('turn the page', x, y - 80 + Math.sin(t * 2) * 2)
    c.restore()
  }

  // --------------------------------------------------------------- entities

  private entity(ent: Entity, pal: Palette, st: DrawState, boil: number, reveal: number): void {
    const c = this.ctx
    const b = ent.box
    if (b.x > this.camX + this.viewW + 150 || b.x + b.w < this.camX - 150) return
    const art = ART[ent.kind.art]
    c.save()
    if (reveal < 1) {
      c.beginPath()
      c.rect(b.x - 40, b.y - 140, (b.w + 80) * reveal, b.h + 200)
      c.clip()
    }
    this.pen.boil = boil
    this.pen.seed(ent.uid * 31)
    if (art) art({ pen: this.pen, c, b, t: st.t, pal, ent, font: this.italic })
    else this.pen.rect(b.x, b.y, b.w, b.h, { w: 2 })
    c.restore()
    this.pen.boil = boil
  }

  private labelsFor(world: World, pal: Palette, st: DrawState): void {
    const c = this.ctx
    this.labels = []
    c.save()
    c.font = `22px ${this.font}`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    for (const ent of world.entities()) {
      const at = world.labelPos(ent)
      if (at.x < this.camX - 80 || at.x > this.camX + this.viewW + 80) continue
      const width = c.measureText(ent.text).width
      if (ent.kind.whisper) {
        this.labels.push({ wordId: ent.wordId, x: ent.box.x, y: ent.box.y, w: ent.box.w, h: ent.box.h })
        if (st.hover === ent.wordId || st.selected === ent.wordId) this.underline(at.x, at.y + 15, ent.box.w - 10, pal.gold)
        continue
      }
      this.labels.push({ wordId: ent.wordId, x: at.x - width / 2 - 10, y: at.y - 16, w: width + 20, h: 32 })
      const why = world.canEdit(ent.wordId)
      const hot = st.hover === ent.wordId || st.selected === ent.wordId
      const alpha = why === null || why === 'gold' ? 1 : 0.55
      c.globalAlpha = 0.6 * alpha
      c.fillStyle = pal.paper
      this.roundRect(at.x - width / 2 - 8, at.y - 13, width + 16, 26, 8)
      c.fill()
      if (st.selected === ent.wordId) {
        const g = c.createRadialGradient(at.x, at.y, 2, at.x, at.y, width)
        g.addColorStop(0, 'rgba(245,217,138,0.7)')
        g.addColorStop(1, 'rgba(245,217,138,0)')
        c.globalAlpha = 1
        c.fillStyle = g
        c.fillRect(at.x - width, at.y - width, width * 2, width * 2)
      }
      c.globalAlpha = alpha
      c.fillStyle = ent.gold ? pal.gold : ent.kind.scribble ? '#6b2a1f' : pal.ink
      // Letter by letter, each one breathing slightly.
      let x = at.x - width / 2
      for (let i = 0; i < ent.text.length; i++) {
        const ch = ent.text[i]
        const cw = c.measureText(ch).width
        const jy = st.reduced ? 0 : Math.sin(st.t * 2 + i * 1.7 + ent.uid) * (ent.kind.scribble ? 2.5 : 0.8)
        c.fillText(ch, x + cw / 2, at.y + jy + (hot ? -1 : 0))
        x += cw
      }
      if (hot) this.underline(at.x, at.y + 13, width, pal.gold)
    }
    c.restore()
  }

  private underline(x: number, y: number, w: number, color: string): void {
    this.pen.seed(3)
    this.pen.line(x - w / 2, y, x + w / 2, y + 1, { w: 2, color, plain: true })
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const c = this.ctx
    c.beginPath()
    c.moveTo(x + r, y)
    c.arcTo(x + w, y, x + w, y + h, r)
    c.arcTo(x + w, y + h, x, y + h, r)
    c.arcTo(x, y + h, x, y, r)
    c.arcTo(x, y, x + w, y, r)
    c.closePath()
  }

  // ----------------------------------------------------------------- reader

  private player(world: World, pal: Palette, t: number): void {
    const p = world.player
    const pen = this.pen
    const f = p.facing
    const x = p.x
    const y = p.y
    const moving = p.grounded && Math.abs(p.vx) > 10
    const sw = moving ? Math.sin(p.walk * 2.2) : 0
    const bob = moving ? Math.abs(Math.cos(p.walk * 2.2)) * 1.5 : Math.sin(t * 2.2) * 0.6
    pen.seed(42)
    // Legs.
    if (p.climbing) {
      const k = Math.sin(p.walk * 3) * 4
      pen.line(x - 3, y - 14, x - 5, y - 2 + k, { w: 2.6, plain: true })
      pen.line(x + 3, y - 14, x + 5, y - 2 - k, { w: 2.6, plain: true })
    } else if (!p.grounded) {
      pen.line(x - 2, y - 14, x - 7 * f, y - 5, { w: 2.6, plain: true })
      pen.line(x + 2, y - 14, x + 6 * f, y - 3, { w: 2.6, plain: true })
    } else {
      pen.line(x - 2, y - 14, x - 3 + sw * 7, y, { w: 2.6, plain: true })
      pen.line(x + 2, y - 14, x + 3 - sw * 7, y, { w: 2.6, plain: true })
    }
    // Scarf, trailing behind.
    const trail = -f * (8 + Math.min(14, Math.abs(p.vx) * 0.05))
    pen.stroke([P(x, y - 30 - bob), P(x + trail * 0.6, y - 31 - bob + Math.sin(t * 9) * 1.5), P(x + trail, y - 27 - bob + Math.sin(t * 9 + 1) * 3)], {
      w: 3,
      color: '#9b3b2e',
      plain: true,
    })
    // Body: a drop of ink.
    pen.stroke([P(x, y - 33 - bob), P(x + 7, y - 20 - bob), P(x + 5, y - 13), P(x - 5, y - 13), P(x - 7, y - 20 - bob)], {
      close: true,
      fill: pal.ink,
      w: 1.5,
      wob: 0.6,
    })
    // Arms.
    if (p.climbing) {
      pen.line(x - 5, y - 24, x - 8, y - 38, { w: 2, plain: true })
      pen.line(x + 5, y - 24, x + 8, y - 36, { w: 2, plain: true })
    } else {
      pen.line(x - 5, y - 24 - bob, x - 8 - sw * 3, y - 16, { w: 2, plain: true })
      pen.line(x + 5, y - 24 - bob, x + 8 + sw * 3, y - 16, { w: 2, plain: true })
    }
    // Head, eyes and the little quill-tuft.
    const hy = y - 36 - bob
    pen.ellipse(x + f, hy, 8, 8, { fill: pal.ink, w: 1.4, wob: 0.4 })
    const c = this.ctx
    c.fillStyle = pal.paper
    const blink = Math.sin(t * 0.9) > 0.985 ? 0.4 : 2
    c.fillRect(x + f * 2 - 1, hy - 2, 2, blink)
    c.fillRect(x + f * 6 - 1, hy - 2, 2, blink)
    pen.stroke([P(x - f * 2, hy - 7), P(x - f * 5, hy - 15), P(x - f * 11, hy - 18 + Math.sin(t * 3) * 1.5)], { w: 1.6, plain: true })
  }

  // ------------------------------------------------------------------- blot

  private blot(front: number, pal: Palette, t: number): void {
    if (front < this.camX - 120) return
    const c = this.ctx
    const left = this.camX - 60
    const pts: Pt[] = [P(left, -60)]
    for (let y = -40; y <= VIEW_H + 60; y += 18) {
      pts.push(P(front + Math.sin(y * 0.021 + t * 1.7) * 16 + Math.sin(y * 0.07 - t * 3.1) * 7, y))
    }
    pts.push(P(left, VIEW_H + 60))
    c.save()
    c.fillStyle = pal.blot
    c.beginPath()
    c.moveTo(pts[0].x, pts[0].y)
    for (const p of pts) c.lineTo(p.x, p.y)
    c.closePath()
    c.fill()
    for (let i = 0; i < 7; i++) {
      const y = 40 + i * 72 + Math.sin(t + i) * 10
      const r = 10 + Math.sin(t * 2.3 + i * 1.7) * 6 + (i % 3) * 5
      c.beginPath()
      c.arc(front + 14 + Math.sin(t * 1.4 + i) * 12, y, Math.max(3, r), 0, Math.PI * 2)
      c.fill()
    }
    // Something inside is watching.
    const blink = Math.sin(t * 0.7) > 0.96 ? 0.15 : 1
    const ey = 200 + Math.sin(t * 0.5) * 20
    c.fillStyle = `rgba(241,230,207,${0.55 * blink})`
    for (const dx of [-150, -118]) {
      c.beginPath()
      c.ellipse(front + dx, ey, 7, 4 * blink, 0, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  }

  // --------------------------------------------------------------- darkness

  private darkness(world: World, t: number): void {
    const d = this.darkCtx
    const W = this.dark.width
    const H = this.dark.height
    d.globalCompositeOperation = 'source-over'
    d.clearRect(0, 0, W, H)
    d.fillStyle = 'rgba(9,8,14,0.95)'
    d.fillRect(0, 0, W, H)
    d.globalCompositeOperation = 'destination-out'
    world.lights().forEach((l, i) => {
      const s = this.toScreen(l.x, l.y)
      const sx = s.x * this.dpr
      const sy = s.y * this.dpr
      const r = l.r * this.scale * this.dpr * (1 + Math.sin(t * 7 + i * 2) * 0.015)
      const g = d.createRadialGradient(sx, sy, 0, sx, sy, r)
      g.addColorStop(0, 'rgba(0,0,0,1)')
      g.addColorStop(0.55, 'rgba(0,0,0,0.85)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      d.fillStyle = g
      d.fillRect(sx - r, sy - r, r * 2, r * 2)
    })
    const c = this.ctx
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.globalAlpha = this.darkAmt
    c.drawImage(this.dark, 0, 0)
    c.globalAlpha = 1
  }

  private diary(world: World, t: number): void {
    const d = world.level.diary
    if (!d || world.diaryTaken) return
    const visible = !d.onlyInDark || world.isDark
    const c = this.ctx
    const y = d.y + Math.sin(t * 1.8) * 5
    c.save()
    c.globalAlpha = visible ? 1 : 0.05
    const g = c.createRadialGradient(d.x, y, 2, d.x, y, 50)
    g.addColorStop(0, 'rgba(245,217,138,0.75)')
    g.addColorStop(1, 'rgba(245,217,138,0)')
    c.fillStyle = g
    c.fillRect(d.x - 50, y - 50, 100, 100)
    c.translate(d.x, y)
    c.rotate(Math.sin(t * 1.3) * 0.15)
    this.pen.seed(77)
    this.pen.stroke([P(-11, -14), P(12, -13), P(10, -3), P(13, 4), P(11, 14), P(-12, 13), P(-10, 2)], { close: true, fill: '#fbf5e4', w: 1.4 })
    for (let i = 0; i < 4; i++) this.pen.line(-7, -8 + i * 5, 7 - (i % 2) * 4, -8 + i * 5, { w: 0.8, alpha: 0.5, plain: true })
    c.restore()
  }

  private editOverlay(world: World, pal: Palette): void {
    const c = this.ctx
    const p = world.player
    c.save()
    c.globalAlpha = 0.28
    this.pen.seed(5)
    c.setLineDash([6, 8])
    c.strokeStyle = pal.gold
    c.lineWidth = 1.5
    c.beginPath()
    c.arc(p.x, p.y - PLAYER_H / 2, REACH, 0, Math.PI * 2)
    c.stroke()
    c.restore()
  }

  private debug(world: World): void {
    const c = this.ctx
    c.save()
    c.lineWidth = 1
    for (const s of world.solids()) {
      c.strokeStyle = 'blue'
      c.strokeRect(s.r.x, s.r.y, s.r.w, s.r.h)
    }
    for (const h of world.hazards()) {
      c.strokeStyle = 'red'
      c.strokeRect(h.x, h.y, h.w, h.h)
    }
    const b = world.playerBox()
    c.strokeStyle = 'magenta'
    c.strokeRect(b.x, b.y, b.w, b.h)
    c.restore()
  }

  // --------------------------------------------------------------- backdrop

  /** The paper behind menus: drifting letters, and a faint blot breathing at the bottom. */
  drawBackdrop(t: number, reduced: boolean): void {
    const pal = PALETTES.woods
    this.paperFill(pal)
    const c = this.ctx
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    c.save()
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    const letters = 'THELASTPAGEEVERYWORDCANBEUNWRITTEN'
    for (let i = 0; i < 46; i++) {
      const speed = 8 + hash(i) * 16
      const x = hash(i + 1) * this.cssW + Math.sin(t * 0.4 + i) * 12
      const span = this.cssH + 80
      const y = this.cssH + 40 - ((hash(i + 2) * span + (reduced ? 0 : t * speed)) % span)
      c.globalAlpha = 0.07 + hash(i + 3) * 0.1
      c.fillStyle = pal.ink
      c.font = `${16 + hash(i + 4) * 30}px ${this.font}`
      c.fillText(letters[i % letters.length], x, y)
    }
    c.restore()
    // The blot, waiting.
    c.save()
    c.fillStyle = pal.blot
    c.globalAlpha = 0.9
    c.beginPath()
    c.moveTo(0, this.cssH)
    for (let x = 0; x <= this.cssW + 20; x += 20) {
      const y = this.cssH - 18 - Math.sin(x * 0.012 + t * 0.8) * 10 - Math.sin(x * 0.031 - t * 1.3) * 6
      c.lineTo(x, y)
    }
    c.lineTo(this.cssW, this.cssH)
    c.closePath()
    c.fill()
    c.restore()
    this.vignette(0.35)
  }
}
