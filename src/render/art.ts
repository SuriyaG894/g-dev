/** One small drawing per shaped word. Coordinates are world units; b is the entity box. */
import type { Rect } from '../game/types'
import type { Entity } from '../game/world'
import type { Palette } from './palette'
import { ART_2 } from './art2'
import { ART_3 } from './art3'
import { ART_4 } from './art4'
import type { Pen, Pt } from './pen'

export interface ArtCtx {
  pen: Pen
  c: CanvasRenderingContext2D
  b: Rect
  t: number
  pal: Palette
  ent: Entity
  font: string
}

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })

function wave(t: number, speed: number, phase = 0): number {
  return Math.sin(t * speed + phase)
}

export const ART: Record<string, Art> = {
  bear({ pen, b, t, pal }) {
    const bot = b.y + b.h
    const cx = b.x + b.w / 2
    const breathe = 1 + wave(t, 2) * 0.025
    for (const lx of [-34, -14, 12, 32]) pen.line(cx + lx, bot - 26, cx + lx + 2, bot - 2, { w: 9, plain: true })
    pen.ellipse(cx + 6, bot - 46 * breathe, 50, 34 * breathe, { fill: pal.ink, fillAlpha: 0.9, w: 2 })
    pen.ellipse(cx - 36, bot - 70, 20, 18, { fill: pal.ink, fillAlpha: 0.95, w: 2 })
    pen.ellipse(cx - 46, bot - 86, 7, 7, { fill: pal.ink, w: 1.5 })
    pen.ellipse(cx - 26, bot - 88, 7, 7, { fill: pal.ink, w: 1.5 })
    pen.ellipse(cx - 54, bot - 64, 8, 6, { fill: pal.ink, w: 1.5 })
    pen.ellipse(cx - 42, bot - 74, 2.4, 2.4, { fill: pal.paper, w: 0 })
    pen.hatch(cx - 40, bot - 78, 90, 60, { color: pal.paper, alpha: 0.18, gap: 7 })
  },

  ear({ pen, b, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    pen.ellipse(cx, cy, b.w / 2, b.h / 2, { fill: pal.paperDark, w: 2.5 })
    pen.ellipse(cx + 4, cy - 2, b.w / 3.4, b.h / 3.2, { from: -2.2, to: 2.4, w: 2 })
    pen.ellipse(cx + 8, cy, b.w / 7, b.h / 6, { from: -1.5, to: 3, w: 1.6 })
  },

  bar({ pen, b, pal }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: '#6f6a64', fillAlpha: 0.55, w: 2.2 })
    pen.hatch(b.x, b.y, b.w, b.h, { gap: 6, alpha: 0.3 })
    for (const rx of [b.x + 10, b.x + b.w - 10]) pen.ellipse(rx, b.y + b.h / 2, 2.5, 2.5, { fill: pal.ink, w: 1 })
  },

  bridge({ pen, b }) {
    const n = 7
    const pw = b.w / n
    for (let i = 0; i < n; i++) {
      pen.rect(b.x + i * pw + 1, b.y + 4, pw - 3, b.h - 4, { fill: '#8a6a43', fillAlpha: 0.35, w: 1.6, plain: true })
    }
    pen.line(b.x - 4, b.y + 2, b.x + b.w + 4, b.y + 2, { w: 2 })
  },

  ridge({ pen, b, pal, ent }) {
    const up = ent.kind.ramp !== -1
    const bot = b.y + b.h
    const lo = up ? P(b.x, bot) : P(b.x + b.w, bot)
    const hi = up ? P(b.x + b.w, b.y) : P(b.x, b.y)
    const foot = up ? P(b.x + b.w, bot) : P(b.x, bot)
    pen.stroke([lo, hi, foot], { close: true, fill: pal.paperDark, fillAlpha: 0.85, w: 0 })
    const c = pen.ctx
    c.save()
    c.beginPath()
    c.moveTo(lo.x, lo.y)
    c.lineTo(hi.x, hi.y)
    c.lineTo(foot.x, foot.y)
    c.closePath()
    c.clip()
    pen.hatch(b.x, b.y, b.w, b.h, { gap: 8, alpha: 0.2 })
    c.restore()
    pen.stroke([lo, hi], { w: 3 })
    for (let i = 1; i < 9; i++) {
      const t = i / 9
      const gx = lo.x + (hi.x - lo.x) * t
      const gy = lo.y + (hi.y - lo.y) * t
      pen.line(gx, gy, gx - 3, gy - 8, { w: 1.3, color: pal.leaf, plain: true })
      pen.line(gx + 2, gy, gx + 4, gy - 7, { w: 1.3, color: pal.leaf, plain: true })
    }
  },

  bride({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.stroke([P(cx - 16, bot), P(cx, bot - 46), P(cx + 16, bot)], { close: true, fill: '#fbf6ea', w: 2 })
    pen.ellipse(cx, bot - 56, 8, 8, { fill: pal.ink, w: 1.5 })
    const sway = wave(t, 1.5) * 4
    pen.stroke([P(cx + 2, bot - 64), P(cx + 14 + sway, bot - 50), P(cx + 18 + sway, bot - 24)], { w: 1.4, alpha: 0.7 })
    pen.ellipse(cx - 8, bot - 36, 5, 4, { fill: '#e8a0a0', w: 1 })
  },

  fire({ pen, b, t, pal }) {
    const bot = b.y + b.h
    const cx = b.x + b.w / 2
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * 16
      const hgt = b.h * (i === 1 ? 1 : 0.72) * (0.9 + wave(t, 9 + i, i) * 0.1)
      const tip = P(cx + ox + wave(t, 6, i * 2) * 5, bot - hgt)
      pen.stroke([P(cx + ox - 14, bot), P(cx + ox - 10, bot - hgt * 0.4), tip, P(cx + ox + 10, bot - hgt * 0.45), P(cx + ox + 14, bot)], {
        close: true,
        fill: pal.fire,
        fillAlpha: 0.8,
        w: 1.8,
      })
      pen.stroke([P(cx + ox - 6, bot), P(cx + ox, bot - hgt * 0.55), P(cx + ox + 6, bot)], { close: true, fill: '#eab84a', fillAlpha: 0.9, w: 0 })
    }
    for (const lx of [-18, 0, 18]) pen.line(cx + lx - 10, bot - 2, cx + lx + 10, bot - 6, { w: 3, color: '#5a3b22', plain: true })
  },

  fir({ pen, b, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.rect(cx - 5, bot - 30, 10, 30, { fill: '#6e4c2c', fillAlpha: 0.6, w: 1.8 })
    const tiers = 4
    for (let i = 0; i < tiers; i++) {
      const tw = b.w * (1 - i * 0.2)
      const top = b.y + (b.h - 30) * ((tiers - 1 - i) / tiers) * 0.95
      const base = top + (b.h - 30) / tiers + 26
      pen.stroke([P(cx - tw / 2, base), P(cx, top), P(cx + tw / 2, base)], { close: true, fill: pal.leaf, fillAlpha: 0.42, w: 2 })
    }
  },

  limb({ pen, b, pal }) {
    const y = b.y
    pen.stroke([P(b.x - 10, y + 2), P(b.x + b.w * 0.6, y + 1), P(b.x + b.w + 6, y + 5), P(b.x + b.w * 0.6, y + b.h - 4), P(b.x - 10, y + b.h)], {
      close: true,
      fill: '#7b5836',
      fillAlpha: 0.55,
      w: 2.2,
    })
    for (const tx of [0.25, 0.55, 0.8]) {
      const x = b.x + b.w * tx
      pen.line(x, y + 2, x + 16, y - 16, { w: 1.6 })
      pen.ellipse(x + 20, y - 18, 7, 4, { fill: pal.leaf, fillAlpha: 0.6, w: 1.2 })
    }
  },

  thorns({ pen, b, pal }) {
    const bot = b.y + b.h
    pen.stroke(
      Array.from({ length: Math.ceil(b.w / 20) + 1 }, (_, i) => P(b.x + i * 20, bot - 6 - (i % 2) * 5)),
      { w: 3 },
    )
    for (let x = b.x + 6; x < b.x + b.w - 4; x += 15) {
      const h = b.h * (0.5 + ((x * 13) % 7) / 14)
      pen.stroke([P(x - 5, bot - 4), P(x + 1, bot - h), P(x + 5, bot - 4)], { close: true, fill: pal.ink, w: 1.4, plain: true })
    }
  },

  thorn({ pen, b, pal }) {
    const bot = b.y + b.h
    const cx = b.x + b.w / 2
    pen.stroke([P(b.x + 4, bot), P(cx - 6, b.y + 10), P(cx + 4, b.y), P(cx + 4, b.y + 16), P(b.x + b.w - 4, bot)], {
      close: true,
      fill: pal.ink,
      w: 2,
    })
  },

  horns({ pen, b }) {
    const bot = b.y + b.h
    for (const s of [-1, 1]) {
      const cx = b.x + b.w / 2 + s * 22
      pen.stroke([P(cx - 12, bot), P(cx + s * 4, bot - b.h * 0.6), P(cx + s * 22, b.y), P(cx + s * 6, bot - b.h * 0.3), P(cx + 12, bot)], {
        close: true,
        fill: '#efe3c3',
        w: 2,
      })
    }
  },

  horn({ pen, b, pal }) {
    const cy = b.y + b.h / 2
    pen.stroke([P(b.x, cy - 3), P(b.x + b.w * 0.6, cy - 5), P(b.x + b.w, b.y), P(b.x + b.w, b.y + b.h), P(b.x + b.w * 0.6, cy + 5), P(b.x, cy + 3)], {
      close: true,
      fill: pal.gold,
      fillAlpha: 0.55,
      w: 2,
    })
  },

  knight({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.line(cx - 7, bot - 30, cx - 9, bot, { w: 5, plain: true })
    pen.line(cx + 7, bot - 30, cx + 9, bot, { w: 5, plain: true })
    pen.rect(cx - 13, bot - 64, 26, 36, { fill: '#8d8a86', fillAlpha: 0.6, w: 2 })
    pen.hatch(cx - 13, bot - 64, 26, 36, { gap: 5, alpha: 0.25 })
    pen.rect(cx - 10, bot - 86, 20, 22, { fill: '#8d8a86', fillAlpha: 0.7, w: 2 })
    pen.line(cx - 8, bot - 76, cx + 2, bot - 76, { w: 2.5 })
    pen.stroke([P(cx, bot - 86), P(cx + 6 + wave(t, 3) * 2, bot - 100), P(cx + 16, bot - 92)], { w: 3, color: pal.fire })
    pen.line(cx - 22, bot, cx - 22, b.y - 14, { w: 2.2 })
    pen.stroke([P(cx - 27, b.y - 8), P(cx - 22, b.y - 24), P(cx - 17, b.y - 8)], { close: true, fill: pal.ink, w: 1.5 })
    pen.ellipse(cx + 14, bot - 48, 11, 15, { fill: pal.accent, fillAlpha: 0.5, w: 2 })
  },

  night({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + wave(t, 1.2) * 3
    pen.ellipse(cx, cy, 24, 24, { fill: '#f7eed2', w: 2 })
    pen.ellipse(cx + 11, cy - 5, 20, 20, { fill: '#2a2638', fillAlpha: 0.92, w: 0 })
    for (let i = 0; i < 5; i++) {
      const sx = cx + Math.cos(i * 1.3) * 48
      const sy = cy + Math.sin(i * 2.1) * 30
      const tw = 0.5 + wave(t, 3, i) * 0.5
      pen.line(sx - 3, sy, sx + 3, sy, { w: 1.2, color: pal.glow, alpha: tw, plain: true })
      pen.line(sx, sy - 3, sx, sy + 3, { w: 1.2, color: pal.glow, alpha: tw, plain: true })
    }
  },

  clamp({ pen, b }) {
    pen.rect(b.x, b.y, b.w, 18, { fill: '#6f6a64', fillAlpha: 0.7, w: 2.2 })
    pen.rect(b.x, b.y + b.h - 18, b.w, 18, { fill: '#6f6a64', fillAlpha: 0.7, w: 2.2 })
    for (const bx of [b.x + 8, b.x + b.w / 2 - 5, b.x + b.w - 18]) {
      pen.rect(bx, b.y + 18, 10, b.h - 36, { fill: '#8d8a86', fillAlpha: 0.55, w: 1.8 })
    }
    pen.hatch(b.x, b.y, b.w, b.h, { gap: 6, alpha: 0.16 })
    pen.rect(b.x + 6, b.y + b.h - 72, b.w - 12, 30, { fill: '#e2d4b4', w: 1.8 })
  },

  lamp({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.line(cx, bot, cx, b.y + 26, { w: 3 })
    pen.line(cx - 12, bot, cx + 12, bot, { w: 3 })
    const flick = 0.85 + wave(t, 13) * 0.08 + wave(t, 7) * 0.07
    const g = pen.ctx.createRadialGradient(cx, b.y + 14, 2, cx, b.y + 14, 60)
    g.addColorStop(0, `rgba(245, 217, 138, ${0.55 * flick})`)
    g.addColorStop(1, 'rgba(245, 217, 138, 0)')
    pen.ctx.fillStyle = g
    pen.ctx.fillRect(cx - 60, b.y - 46, 120, 120)
    pen.stroke([P(cx - 10, b.y + 26), P(cx - 13, b.y + 4), P(cx + 13, b.y + 4), P(cx + 10, b.y + 26)], { close: true, fill: pal.glow, fillAlpha: flick, w: 2 })
    pen.line(cx - 6, b.y, cx + 6, b.y, { w: 3 })
  },

  camp({ pen, b, pal }) {
    const bot = b.y + b.h
    const cx = b.x + b.w / 2
    pen.stroke([P(b.x, bot), P(cx, b.y), P(b.x + b.w, bot)], { close: true, fill: pal.accent, fillAlpha: 0.35, w: 2.2 })
    pen.stroke([P(cx - 12, bot), P(cx, b.y + 18), P(cx + 12, bot)], { close: true, fill: pal.ink, fillAlpha: 0.7, w: 1.5 })
  },

  clam({ pen, b }) {
    const cx = b.x + b.w / 2
    pen.ellipse(cx, b.y + b.h * 0.55, b.w / 2, b.h * 0.45, { fill: '#efe3c3', w: 2 })
    for (let i = -2; i <= 2; i++) pen.line(cx, b.y + b.h - 2, cx + i * 8, b.y + 6, { w: 1, alpha: 0.6, plain: true })
  },

  stream({ pen, b, t, pal }) {
    const c = pen.ctx
    c.save()
    c.globalAlpha = 0.4
    c.fillStyle = pal.water
    c.fillRect(b.x, b.y + 4, b.w, b.h)
    c.restore()
    for (let row = 0; row < 3; row++) {
      const y = b.y + 6 + row * 16
      const pts: Pt[] = []
      for (let x = b.x; x <= b.x + b.w; x += 14) pts.push(P(x, y + Math.sin(x * 0.06 + t * (2 + row) + row) * 3))
      pen.stroke(pts, { w: row === 0 ? 2.4 : 1.2, color: row === 0 ? pal.ink : pal.water, plain: true })
    }
  },

  steam({ pen, b, t }) {
    const c = pen.ctx
    const g = c.createLinearGradient(0, b.y, 0, b.y + b.h)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(1, 'rgba(255,255,255,0.35)')
    c.fillStyle = g
    c.fillRect(b.x, b.y, b.w, b.h)
    for (let i = 0; i < 9; i++) {
      const x0 = b.x + 16 + (i * (b.w - 32)) / 8
      const off = (t * 70 + i * 47) % b.h
      const y0 = b.y + b.h - off
      const pts: Pt[] = []
      for (let k = 0; k < 6; k++) pts.push(P(x0 + Math.sin(k * 1.4 + t * 2 + i) * 8, y0 - k * 12))
      pen.stroke(pts, { w: 1.6, alpha: 0.55 * Math.min(1, off / 60) * Math.min(1, (b.h - off) / 80), plain: true })
    }
  },

  stem({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const pts: Pt[] = []
    for (let y = bot; y >= b.y; y -= 30) pts.push(P(cx + Math.sin(y * 0.03 + t * 0.8) * 4, y))
    pen.stroke(pts, { w: 5, color: '#3d6a3a' })
    let side = 1
    for (let y = bot - 40; y > b.y + 20; y -= 44) {
      pen.ellipse(cx + side * 12, y, 11, 5, { fill: pal.leaf, fillAlpha: 0.65, w: 1.5 })
      side = -side
    }
    pen.ellipse(cx, b.y + 6, 8, 9, { fill: pal.fire, fillAlpha: 0.6, w: 1.5 })
  },

  bloat({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + wave(t, 2) * 2
    const r = b.h / 2 - 4
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      pen.line(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * (r + 7), cy + Math.sin(a) * (r + 7), { w: 1.6, plain: true })
    }
    pen.ellipse(cx, cy, r + 4, r, { fill: '#e9dcb8', w: 2.2 })
    pen.ellipse(cx - 10, cy - 5, 3, 3, { fill: pal.ink, w: 0 })
    pen.stroke([P(cx + r + 2, cy), P(cx + r + 14, cy - 9), P(cx + r + 14, cy + 9)], { close: true, fill: '#e9dcb8', w: 1.8 })
  },

  boat({ pen, b }) {
    const bot = b.y + b.h
    pen.stroke([P(b.x - 6, b.y), P(b.x + b.w + 6, b.y), P(b.x + b.w - 14, bot), P(b.x + 14, bot)], {
      close: true,
      fill: '#8a6a43',
      fillAlpha: 0.55,
      w: 2.4,
    })
    pen.line(b.x + 4, b.y + 10, b.x + b.w - 4, b.y + 10, { w: 1.2, alpha: 0.6 })
    pen.line(b.x + b.w * 0.7, b.y, b.x + b.w * 0.95, b.y - 26, { w: 2 })
  },

  blot({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const pts: Pt[] = []
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      const r = (b.w / 2) * (0.75 + Math.sin(i * 2.7 + t * 2) * 0.12 + Math.sin(i * 5.1) * 0.1)
      pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r * (b.h / b.w)))
    }
    pen.stroke(pts, { close: true, fill: pal.blot, w: 1.5 })
    pen.line(cx + 10, b.y + b.h - 8, cx + 12, b.y + b.h + 12 + wave(t, 1.3) * 5, { w: 4, color: pal.blot })
  },

  bat({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2 + Math.sin(t * 1.3) * 30
    const cy = b.y + b.h / 2 - 30 + Math.sin(t * 2.7) * 14
    const flap = Math.sin(t * 16) * 8
    pen.stroke([P(cx - 20, cy - flap), P(cx - 8, cy + 2), P(cx, cy - 2), P(cx + 8, cy + 2), P(cx + 20, cy - flap)], { w: 2 })
    pen.ellipse(cx, cy, 5, 6, { fill: pal.ink, w: 1 })
  },

  boa({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    for (let i = 0; i < 3; i++) pen.ellipse(cx, bot - 8 - i * 9, 36 - i * 9, 8, { w: 6, color: '#4b6b35' })
    pen.ellipse(cx - 20, b.y + 4, 9, 6, { fill: '#4b6b35', w: 1.8 })
    pen.line(cx - 28, b.y + 4, cx - 36 + wave(t, 12) * 2, b.y + 2, { w: 1.2, color: pal.fire })
  },

  oat({ pen, b }) {
    pen.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, { fill: '#d9bf7c', w: 1.4 })
  },

  adder({ pen, b, t, pal }) {
    const bot = b.y + b.h
    const pts: Pt[] = []
    for (let x = b.x + b.w; x >= b.x + 14; x -= 10) pts.push(P(x, bot - 7 + Math.sin(x * 0.12 + t * 4) * 4))
    pen.stroke(pts, { w: 8, color: '#5a6e2f' })
    pen.stroke(pts, { w: 2, color: pal.ink, alpha: 0.5, plain: true })
    const hx = b.x + 8
    const hy = b.y + 4 + wave(t, 2) * 2
    pen.ellipse(hx, hy, 10, 7, { fill: '#5a6e2f', w: 2 })
    pen.ellipse(hx - 3, hy - 2, 1.8, 1.8, { fill: pal.paper, w: 0 })
    if (Math.sin(t * 5) > 0.3) pen.stroke([P(hx - 10, hy + 1), P(hx - 18, hy), P(hx - 21, hy - 3)], { w: 1.2, color: pal.fire })
  },

  ladder({ pen, b }) {
    pen.line(b.x + 6, b.y + b.h, b.x + 6, b.y, { w: 3 })
    pen.line(b.x + b.w - 6, b.y + b.h, b.x + b.w - 6, b.y, { w: 3 })
    for (let y = b.y + b.h - 14; y > b.y + 4; y -= 22) pen.line(b.x + 6, y, b.x + b.w - 6, y - 1, { w: 2.2 })
  },

  stone({ pen, b }) {
    const bot = b.y + b.h
    const pts = [
      P(b.x + 2, bot),
      P(b.x - 2, b.y + b.h * 0.45),
      P(b.x + b.w * 0.2, b.y + 6),
      P(b.x + b.w * 0.62, b.y),
      P(b.x + b.w + 2, b.y + b.h * 0.3),
      P(b.x + b.w, bot),
    ]
    pen.stroke(pts, { close: true, fill: '#b9ab91', fillAlpha: 0.8, w: 2.6 })
    pen.hatch(b.x + 8, b.y + b.h * 0.4, b.w - 16, b.h * 0.6, { gap: 7, alpha: 0.2 })
    pen.stroke([P(b.x + b.w * 0.4, b.y + 12), P(b.x + b.w * 0.5, b.y + 40), P(b.x + b.w * 0.42, b.y + 64)], { w: 1.4 })
  },

  planet({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + wave(t, 0.8) * 4
    const r = Math.min(b.w, b.h) / 2 - 8
    pen.ellipse(cx, cy, r, r, { fill: pal.accent, fillAlpha: 0.35, w: 2.2 })
    for (let i = 0; i < 3; i++) {
      const a = t * 0.3 + i * 2.1
      const x = cx + Math.cos(a) * r * 0.5
      if (Math.sin(a) > -0.2) pen.ellipse(x, cy - 10 + i * 12, 5, 4, { w: 1.2, alpha: 0.6 })
    }
    pen.ellipse(cx, cy + 2, r + 22, 9, { from: -0.2, to: Math.PI + 0.2, w: 2, color: pal.gold })
  },

  plane({ pen, b, t, ent }) {
    const dir = ent.veh && ent.veh.dir < 0 && ent.veh.wait <= 0 ? -1 : 1
    const bob = wave(t, 3) * 2
    const cx = b.x + b.w / 2
    const nose = P(cx + (dir * b.w) / 2, b.y + 10 + bob)
    const tail = P(cx - (dir * b.w) / 2, b.y + bob)
    pen.stroke([tail, nose, P(cx - (dir * b.w) / 2 + dir * 16, b.y + b.h + bob)], { close: true, fill: '#fbf6ea', w: 2.2 })
    pen.line(tail.x + dir * 8, tail.y + 6, nose.x, nose.y, { w: 1.4, alpha: 0.7 })
    pen.line(tail.x, tail.y, tail.x - dir * 22, tail.y - 6 + wave(t, 9) * 2, { w: 1, alpha: 0.35, plain: true })
  },

  lane({ pen, b, pal }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: pal.paperDark, fillAlpha: 0.9, w: 2.2 })
    for (let x = b.x + 12; x < b.x + b.w - 20; x += 36) pen.line(x, b.y + b.h / 2, x + 18, b.y + b.h / 2, { w: 1.6, alpha: 0.6, plain: true })
  },

  plant({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h + wave(t, 1.5) * 3
    pen.stroke([P(cx - 12, bot - 18), P(cx + 12, bot - 18), P(cx + 8, bot), P(cx - 8, bot)], { close: true, fill: '#a8603a', fillAlpha: 0.6, w: 1.8 })
    for (const s of [-1, 0, 1]) pen.ellipse(cx + s * 9, bot - 30 - Math.abs(s) * -4, 5, 11, { fill: pal.leaf, fillAlpha: 0.6, w: 1.4 })
  },

  pane({ pen, b, pal }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: '#cfe3e6', fillAlpha: 0.35, w: 2 })
    pen.line(b.x + 10, b.y + 20, b.x + 24, b.y + 8, { w: 1.4, alpha: 0.6, color: pal.water })
    pen.line(b.x + 12, b.y + 34, b.x + 36, b.y + 12, { w: 1.4, alpha: 0.6, color: pal.water })
  },

  whisper({ c, b, t, ent, font, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + Math.sin(t * 1.6 + ent.uid) * 3
    c.save()
    c.font = `italic 24px ${font}`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.globalAlpha = 0.18
    c.fillStyle = ent.gold ? pal.gold : pal.ink
    c.fillText(ent.text, cx + 2, cy + 3)
    c.globalAlpha = 0.72
    c.fillText(ent.text, cx, cy)
    c.restore()
  },

  scribble({ pen, b, t }) {
    pen.boil = Math.floor(t * 14)
    pen.seed(b.x * 7 + b.y)
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const pts: Pt[] = []
    const n = Math.round(10 + (b.w + b.h) / 12)
    for (let i = 0; i < n; i++) pts.push(P(cx + pen.jit(b.w / 2), cy + pen.jit(b.h / 2)))
    pen.stroke(pts, { w: 2, color: '#3b1712', wob: 4 })
    pen.stroke(pts.slice().reverse(), { w: 1, color: '#6b2a1f', wob: 6, alpha: 0.7, plain: true })
  },
}

Object.assign(ART, ART_2, ART_3, ART_4)
