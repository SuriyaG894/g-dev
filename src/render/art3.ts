/** Art for Chapter III: The Clockwork Tower. */
import type { ArtCtx } from './art'
import type { Pen, Pt } from './pen'

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })
const BRASS = '#a0772b'
const WOOD = '#7b5836'

/** A toothed wheel. */
export function gearShape(pen: Pen, cx: number, cy: number, r: number, teeth: number, angle: number, o: { w?: number; alpha?: number; fill?: string; fillAlpha?: number } = {}): void {
  const pts: Pt[] = []
  for (let i = 0; i < teeth * 2; i++) {
    const a = angle + (i / (teeth * 2)) * Math.PI * 2
    const rr = i % 2 ? r : r * 1.16
    pts.push(P(cx + Math.cos(a - 0.08) * rr, cy + Math.sin(a - 0.08) * rr))
    pts.push(P(cx + Math.cos(a + 0.08) * rr, cy + Math.sin(a + 0.08) * rr))
  }
  pen.stroke(pts, { close: true, w: o.w ?? 2, alpha: o.alpha, fill: o.fill, fillAlpha: o.fillAlpha, plain: true, wob: 0.6 })
  pen.ellipse(cx, cy, r * 0.3, r * 0.3, { w: (o.w ?? 2) * 0.8, alpha: o.alpha, plain: true })
}

export const ART_3: Record<string, Art> = {
  sprout({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.ellipse(cx, bot - 3, 8, 3, { fill: '#6b4a2c', fillAlpha: 0.6, w: 1.2 })
    const sway = Math.sin(t * 2) * 1.5
    pen.stroke([P(cx, bot - 3), P(cx + sway, bot - 12)], { w: 1.6, color: pal.leaf })
    pen.ellipse(cx + sway - 4, bot - 13, 4, 2.5, { fill: pal.leaf, fillAlpha: 0.8, w: 1 })
    pen.ellipse(cx + sway + 4, bot - 14, 4, 2.5, { fill: pal.leaf, fillAlpha: 0.8, w: 1 })
  },

  tree({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.rect(cx - 7, bot - b.h * 0.55, 14, b.h * 0.55, { fill: WOOD, fillAlpha: 0.6, w: 2 })
    const sway = Math.sin(t * 0.9) * 2
    for (const [dx, dy, r] of [
      [0, 0.18, 0.62],
      [-0.35, 0.36, 0.45],
      [0.35, 0.36, 0.45],
    ] as const) {
      pen.ellipse(cx + dx * b.w + sway, b.y + dy * b.h + 10, b.w * r, b.h * 0.16, { fill: pal.leaf, fillAlpha: 0.45, w: 2 })
    }
  },

  cub({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const hop = Math.abs(Math.sin(t * 3)) * 2
    pen.ellipse(cx + 3, bot - 11 - hop, 15, 10, { fill: '#6d5a48', w: 1.6 })
    pen.ellipse(cx - 11, bot - 18 - hop, 8, 8, { fill: '#6d5a48', w: 1.4 })
    pen.ellipse(cx - 15, bot - 25 - hop, 3, 3, { fill: '#6d5a48', w: 1 })
    pen.ellipse(cx - 7, bot - 26 - hop, 3, 3, { fill: '#6d5a48', w: 1 })
    pen.ellipse(cx - 13, bot - 19 - hop, 1.3, 1.3, { fill: pal.paper, w: 0 })
  },

  cube({ pen, b }) {
    pen.rect(b.x, b.y + 8, b.w - 8, b.h - 8, { fill: '#b9ab91', fillAlpha: 0.85, w: 2.4 })
    pen.stroke([P(b.x, b.y + 8), P(b.x + 8, b.y), P(b.x + b.w, b.y), P(b.x + b.w - 8, b.y + 8)], { close: true, fill: '#cfc2a6', w: 2 })
    pen.stroke([P(b.x + b.w - 8, b.y + 8), P(b.x + b.w, b.y), P(b.x + b.w, b.y + b.h - 8), P(b.x + b.w - 8, b.y + b.h)], { close: true, fill: '#9d8f75', w: 2 })
    pen.hatch(b.x + 4, b.y + 12, b.w - 16, b.h - 16, { gap: 8, alpha: 0.15 })
  },

  iron({ pen, b }) {
    pen.line(b.x - 4, b.y, b.x + b.w + 4, b.y, { w: 3, color: '#4a4744' })
    for (let x = b.x + 4; x <= b.x + b.w - 4; x += 9) {
      pen.line(x, b.y, x, b.y + b.h, { w: 3, color: '#4a4744' })
      pen.stroke([P(x - 3, b.y), P(x, b.y - 8), P(x + 3, b.y)], { close: true, fill: '#4a4744', w: 1 })
    }
    pen.line(b.x - 4, b.y + b.h * 0.5, b.x + b.w + 4, b.y + b.h * 0.5, { w: 2.4, color: '#4a4744' })
  },

  rust({ pen, b }) {
    const bot = b.y + b.h
    pen.stroke([P(b.x, bot), P(b.x + 10, bot - 10), P(b.x + 24, bot - 6), P(b.x + 36, bot - b.h), P(b.x + 48, bot - 8), P(b.x + b.w, bot)], { close: true, fill: '#9c5a32', fillAlpha: 0.6, w: 1.6 })
    for (let i = 0; i < 4; i++) pen.line(b.x + 8 + i * 12, bot - 2, b.x + 14 + i * 12, bot - 14 + (i % 2) * 6, { w: 2, color: '#6e3b22', plain: true })
  },

  wheat({ pen, b, t }) {
    const bot = b.y + b.h
    for (let x = b.x + 4; x < b.x + b.w; x += 10) {
      const sway = Math.sin(t * 1.6 + x * 0.1) * 3
      pen.line(x, bot, x + sway, b.y + 8, { w: 1.2, color: '#9a7b3a', plain: true })
      pen.ellipse(x + sway, b.y + 6, 2.5, 6, { fill: '#c9a24a', fillAlpha: 0.8, w: 0.8 })
    }
  },

  spark({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t * 4
      const r = 6 + Math.sin(t * 20 + i) * 3
      pen.line(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, { w: 1.4, color: pal.fire, plain: true })
    }
    pen.ellipse(cx, cy, 2.5, 2.5, { fill: '#eab84a', w: 0 })
  },

  corn({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const sway = Math.sin(t * 1.3) * 2
    pen.line(cx, bot, cx + sway, b.y, { w: 2.4, color: pal.leaf })
    pen.ellipse(cx + sway + 5, b.y + 18, 4, 9, { fill: '#e2c35a', fillAlpha: 0.85, w: 1.2 })
    pen.stroke([P(cx, bot - 14), P(cx - 12, bot - 26), P(cx - 16, bot - 22)], { w: 1.4, color: pal.leaf })
  },

  oak({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.stroke([P(cx - 20, bot), P(cx - 12, bot - b.h * 0.5), P(cx - 16, b.y + 70), P(cx + 16, b.y + 70), P(cx + 12, bot - b.h * 0.5), P(cx + 22, bot)], {
      close: true,
      fill: WOOD,
      fillAlpha: 0.65,
      w: 2.2,
    })
    for (let y = bot - 30; y > b.y + 90; y -= 34) pen.line(cx - 8, y, cx + 6, y - 10, { w: 1, alpha: 0.5, plain: true })
    const sway = Math.sin(t * 0.7) * 3
    for (const [dx, dy, rx, ry] of [
      [0, 30, 0.75, 40],
      [-0.45, 60, 0.5, 34],
      [0.45, 60, 0.5, 34],
      [0, 80, 0.6, 30],
    ] as const) {
      pen.ellipse(cx + dx * b.w + sway, b.y + dy, b.w * rx, ry, { fill: pal.leaf, fillAlpha: 0.4, w: 2 })
    }
  },

  gear({ pen, b, t, ent }) {
    const cx = b.x + b.w / 2
    const moving = !!ent.veh && ent.veh.dy !== 0
    gearShape(pen, cx, b.y + b.h + 20, 36, 10, moving ? t * 1.5 : t * 0.6, { w: 1.8, alpha: 0.8, fill: BRASS, fillAlpha: 0.25 })
    pen.rect(b.x, b.y, b.w, b.h, { fill: BRASS, fillAlpha: 0.55, w: 2.2 })
    for (let x = b.x + 10; x < b.x + b.w; x += 16) pen.line(x, b.y + 3, x, b.y + b.h - 3, { w: 1, alpha: 0.5, plain: true })
  },

  cog({ pen, b }) {
    const cx = b.x + b.w / 2
    gearShape(pen, cx, b.y + b.h + 20, 36, 10, 0.3, { w: 1.8, alpha: 0.6, fill: '#9c5a32', fillAlpha: 0.2 })
    pen.rect(b.x, b.y, b.w, b.h, { fill: '#9c5a32', fillAlpha: 0.45, w: 2.2 })
    pen.line(b.x + 12, b.y + 6, b.x + 30, b.y + 12, { w: 1, alpha: 0.5, plain: true })
  },

  drip({ c, pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    pen.rect(cx - 12, b.y - 200, 24, 200, { fill: '#6f6a64', fillAlpha: 0.45, w: 2 })
    pen.rect(cx - 16, b.y - 4, 32, 10, { fill: '#6f6a64', fillAlpha: 0.6, w: 2 })
    const phase = (t * 1.2) % 1
    c.save()
    c.fillStyle = pal.water
    c.globalAlpha = 0.8
    c.beginPath()
    c.ellipse(cx, b.y + 10 + phase * (b.h + 60), 3, 5, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  },

  clock({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    pen.rect(b.x + 6, b.y + 44, b.w - 12, b.h - 44, { fill: WOOD, fillAlpha: 0.55, w: 2 })
    const sw = Math.sin(t * 2.2) * 0.35
    pen.line(cx, b.y + 44, cx + Math.sin(sw) * 34, b.y + 44 + Math.cos(sw) * 34, { w: 1.6, color: BRASS })
    pen.ellipse(cx + Math.sin(sw) * 34, b.y + 44 + Math.cos(sw) * 34, 5, 5, { fill: BRASS, w: 1.2 })
    pen.ellipse(cx, b.y + 24, 24, 24, { fill: '#f6efd9', w: 2.2 })
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      pen.line(cx + Math.cos(a) * 18, b.y + 24 + Math.sin(a) * 18, cx + Math.cos(a) * 21, b.y + 24 + Math.sin(a) * 21, { w: 1, plain: true })
    }
    pen.line(cx, b.y + 24, cx + Math.sin(t * 0.5) * 14, b.y + 24 - Math.cos(t * 0.5) * 14, { w: 1.8 })
    pen.line(cx, b.y + 24, cx + Math.sin(t * 6) * 18, b.y + 24 - Math.cos(t * 6) * 18, { w: 1, color: pal.fire })
  },

  padlock({ pen, b, pal }) {
    const cx = b.x + b.w / 2
    pen.ellipse(cx, b.y + 16, 12, 14, { from: Math.PI, to: Math.PI * 2, w: 3.2, color: '#6f6a64' })
    pen.rect(b.x + 2, b.y + 16, b.w - 4, b.h - 16, { fill: pal.gold, fillAlpha: 0.75, w: 2 })
    pen.ellipse(cx, b.y + 30, 3, 3, { fill: pal.ink, w: 0 })
  },
}
