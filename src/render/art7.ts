/** Art for Chapter VII: The Blank, and the Past Page. */
import type { ArtCtx } from './art'
import type { Pt } from './pen'

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })
const WOOD = '#7b5836'
const CREAM = '#f3e3c3'
const BERRY = '#b0406a'

export const ART_7: Record<string, Art> = {
  stressed({ pen, b, t }) {
    // A crackling knot of scribble.
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const pts: Pt[] = []
    for (let i = 0; i < 60; i++) {
      const a = i * 0.9 + t * 3
      const r = (0.3 + ((i * 37) % 10) / 14) * Math.min(b.w, b.h) * 0.5
      pts.push(P(cx + Math.cos(a) * r * (b.w / b.h), cy + Math.sin(a * 1.3) * r))
    }
    pen.stroke(pts, { w: 1.8, color: '#3b1712' })
    for (let i = 0; i < 4; i++) {
      const a = t * 5 + i * 1.6
      pen.line(cx + Math.cos(a) * b.w * 0.45, cy + Math.sin(a) * b.h * 0.45, cx + Math.cos(a) * b.w * 0.6, cy + Math.sin(a) * b.h * 0.6, { w: 2, color: '#c4532b' })
    }
  },

  desserts({ pen, b, t }) {
    const tiers = 3
    const th = b.h / tiers
    for (let i = 0; i < tiers; i++) {
      const w = b.w * (1 - i * 0.22)
      const x = b.x + (b.w - w) / 2
      const y = b.y + b.h - (i + 1) * th
      pen.rect(x, y, w, th, { fill: i % 2 ? CREAM : '#e9b7c4', w: 1.8 })
      for (let k = 0; k < 4; k++) pen.ellipse(x + (w / 4) * (k + 0.5), y + 3, w / 10, 4, { from: 0, to: Math.PI, w: 1.2, fill: '#fbf5e4' })
    }
    pen.ellipse(b.x + b.w / 2, b.y - 4 + Math.sin(t * 3), 6, 6, { fill: BERRY, w: 1.2 })
  },

  stair({ pen, b }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: WOOD, fillAlpha: 0.5, w: 1.6 })
    pen.line(b.x, b.y + 4, b.x + b.w, b.y + 4, { w: 1, alpha: 0.5, plain: true })
  },

  case({ pen, b, pal }) {
    pen.rect(b.x, b.y + b.h * 0.2, b.w, b.h * 0.8, { fill: '#8a5a44', fillAlpha: 0.6, w: 1.8 })
    pen.stroke([P(b.x + b.w * 0.35, b.y + b.h * 0.2), P(b.x + b.w * 0.35, b.y), P(b.x + b.w * 0.65, b.y), P(b.x + b.w * 0.65, b.y + b.h * 0.2)], { w: 1.8 })
    for (const k of [0.2, 0.8]) pen.line(b.x + b.w * k, b.y + b.h * 0.2, b.x + b.w * k, b.y + b.h, { w: 1.2, color: pal.gold, plain: true })
  },

  staircase({ pen, b }) {
    const n = 8
    const sw = b.w / n
    const sh = b.h / n
    const pts: Pt[] = [P(b.x, b.y + b.h)]
    for (let i = 0; i < n; i++) {
      pts.push(P(b.x + i * sw, b.y + b.h - (i + 1) * sh))
      pts.push(P(b.x + (i + 1) * sw, b.y + b.h - (i + 1) * sh))
    }
    pts.push(P(b.x + b.w, b.y + b.h))
    pen.stroke(pts, { close: true, fill: WOOD, fillAlpha: 0.4, w: 2 })
    pen.line(b.x + 4, b.y + b.h - 30, b.x + b.w - 4, b.y - 30, { w: 1.6, alpha: 0.6 })
  },

  mark({ pen, b, pal }) {
    pen.line(b.x, b.y, b.x + b.w, b.y + b.h, { w: 3, color: pal.fire })
    pen.line(b.x + b.w, b.y, b.x, b.y + b.h, { w: 3, color: pal.fire })
  },

  bookmark({ pen, b, t }) {
    const sway = Math.sin(t * 1.2) * 4
    pen.stroke([P(b.x, b.y), P(b.x + b.w, b.y), P(b.x + b.w + sway, b.y + b.h), P(b.x + b.w / 2 + sway, b.y + b.h - 16), P(b.x + sway, b.y + b.h)], { close: true, fill: '#9b3b2e', fillAlpha: 0.75, w: 1.6 })
    for (let y = b.y + 20; y < b.y + b.h - 20; y += 28) pen.line(b.x + 6 + sway * ((y - b.y) / b.h), y, b.x + b.w - 6 + sway * ((y - b.y) / b.h), y, { w: 0.8, alpha: 0.4, plain: true })
  },

  drawer({ pen, b, pal }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: WOOD, fillAlpha: 0.55, w: 1.8 })
    pen.rect(b.x + 6, b.y + 6, b.w - 12, b.h - 12, { w: 1.2, alpha: 0.6 })
    pen.ellipse(b.x + b.w / 2, b.y + b.h / 2, 4, 3, { fill: pal.gold, w: 1 })
  },

  boast({ pen, c, b, font }) {
    pen.stroke([P(b.x, b.y + b.h), P(b.x + b.w / 2, b.y), P(b.x + b.w, b.y + b.h)], { close: true, fill: '#fbf5e4', w: 1.6 })
    c.save()
    c.font = `11px ${font}`
    c.textAlign = 'center'
    c.fillStyle = '#9b3b2e'
    c.fillText('GET WELL SOON!', b.x + b.w / 2, b.y + b.h - 6)
    c.restore()
  },

  endwall({ pen, c, b, font, pal }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: pal.paperDark, fillAlpha: 0.8, w: 2.4 })
    c.save()
    c.translate(b.x + b.w / 2, b.y + b.h / 2)
    c.rotate(-Math.PI / 2)
    c.font = `40px ${font}`
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillStyle = pal.ink
    c.fillText('THE END', 0, 0)
    c.restore()
  },
}
