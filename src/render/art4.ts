/** Art for Chapter IV: The Mirror Desert. */
import { LEXICON } from '../game/lexicon'
import { ART, type ArtCtx } from './art'
import type { Pt } from './pen'

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })
const SAND = '#d8b273'
const WOOD = '#7b5836'

export const ART_4: Record<string, Art> = {
  /** A reflection: the real thing, flipped, faint, and wavering in the heat. */
  mirage(a) {
    const { c, b, t, ent } = a
    const real = ent.mirrorOf ? LEXICON[ent.mirrorOf] : undefined
    const art = real ? ART[real.art] : undefined
    c.save()
    c.globalAlpha *= 0.32 + Math.sin(t * 3) * 0.06
    const cx = b.x + b.w / 2
    c.translate(cx + Math.sin(t * 2.3) * 3, 0)
    c.scale(-1, 1)
    c.translate(-cx, 0)
    if (art && real) art({ ...a, ent: { ...ent, kind: real } })
    else a.pen.rect(b.x, b.y, b.w, b.h, { w: 1.4 })
    c.restore()
    // Heat haze.
    c.save()
    c.globalAlpha = 0.25
    c.strokeStyle = '#ffffff'
    c.lineWidth = 1.2
    for (let i = 0; i < 3; i++) {
      const y = b.y + b.h * (0.25 + i * 0.25)
      c.beginPath()
      for (let x = b.x; x <= b.x + b.w; x += 8) c.lineTo(x, y + Math.sin(x * 0.12 + t * 4 + i) * 2)
      c.stroke()
    }
    c.restore()
  },

  rats({ pen, b, t, pal }) {
    for (let i = 0; i < 6; i++) {
      const x = b.x + 12 + i * 21 + Math.sin(t * 6 + i) * 5
      const bot = b.y + b.h
      pen.ellipse(x, bot - 7 - (i % 2) * 6, 10, 6, { fill: '#6d6258', w: 1.2, plain: true })
      pen.line(x + 9, bot - 6 - (i % 2) * 6, x + 18, bot - 10, { w: 1, plain: true })
      pen.ellipse(x - 8, bot - 9 - (i % 2) * 6, 1, 1, { fill: pal.fire, w: 0 })
    }
  },

  star({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + Math.sin(t * 2) * 2
    const pts: Pt[] = []
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2
      const r = i % 2 ? b.h * 0.55 : b.w * 0.55
      pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6))
    }
    pen.stroke(pts, { close: true, fill: pal.glow, fillAlpha: 0.9, w: 2 })
  },

  salt({ pen, b }) {
    const bot = b.y + b.h
    pen.stroke([P(b.x, bot), P(b.x + b.w * 0.4, b.y), P(b.x + b.w * 0.6, b.y + 4), P(b.x + b.w, bot)], { close: true, fill: '#f7f4ec', w: 1.8 })
    for (let i = 0; i < 6; i++) pen.ellipse(b.x + 10 + i * 8, bot - 6 - (i % 3) * 5, 1.2, 1.2, { fill: '#b9b1a0', w: 0 })
  },

  slat({ pen, b }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: WOOD, fillAlpha: 0.6, w: 2 })
    for (let x = b.x + 30; x < b.x + b.w; x += 50) pen.ellipse(x, b.y + b.h / 2, 2, 2, { fill: '#3a2a1a', w: 0 })
  },

  lemon({ pen, b }) {
    pen.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, { fill: '#e8cf3a', fillAlpha: 0.85, w: 1.8 })
  },

  melon({ pen, b }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    pen.ellipse(cx, cy, b.w / 2, b.h / 2, { fill: '#6f9a4a', fillAlpha: 0.75, w: 2.2 })
    for (let i = -2; i <= 2; i++) pen.ellipse(cx + i * 12, cy, 4, b.h / 2 - 3, { w: 1.2, color: '#3f6a2a', alpha: 0.7, plain: true })
  },

  churn({ pen, b }) {
    const cx = b.x + b.w / 2
    pen.stroke([P(cx - 14, b.y + b.h), P(cx - 16, b.y + 16), P(cx - 7, b.y + 6), P(cx + 7, b.y + 6), P(cx + 16, b.y + 16), P(cx + 14, b.y + b.h)], { close: true, fill: '#bfc3c4', w: 1.8 })
    pen.rect(cx - 8, b.y, 16, 7, { fill: '#9ea3a5', w: 1.4 })
  },

  diarybook({ pen, b, t, pal }) {
    const y = b.y + Math.sin(t * 2) * 2
    pen.rect(b.x, y, b.w, b.h, { fill: '#7a3b2e', fillAlpha: 0.75, w: 2 })
    pen.line(b.x + 6, y + 2, b.x + 6, y + b.h - 2, { w: 1.2, color: pal.gold })
  },

  palm({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const pts: Pt[] = []
    for (let y = bot; y >= b.y + 30; y -= 30) pts.push(P(cx + Math.sin((bot - y) * 0.008) * 10, y))
    pen.stroke(pts, { w: 9, color: '#8a6a43' })
    for (let y = bot - 20; y > b.y + 40; y -= 22) pen.line(cx - 5, y, cx + 5, y - 4, { w: 1, alpha: 0.5, plain: true })
    const top = pts[pts.length - 1]
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI + (i / 5) * Math.PI + Math.sin(t * 1.2 + i) * 0.08
      const ex = top.x + Math.cos(a) * 60
      const ey = top.y + Math.sin(a) * 26 + 24
      pen.stroke([P(top.x, top.y), P((top.x + ex) / 2, top.y - 10 + Math.sin(a) * 10), P(ex, ey)], { w: 4, color: pal.leaf })
    }
  },

  wolf({ pen, b, t, pal, ent }) {
    const dir = ent.veh && ent.veh.dir < 0 ? -1 : 1
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const step = Math.sin(t * 9) * 5
    for (const lx of [-26, -12, 12, 26]) pen.line(cx + lx, bot - 22, cx + lx + (lx > 0 ? step : -step), bot, { w: 4, plain: true })
    pen.ellipse(cx, bot - 32, 36, 16, { fill: '#4a4a52', w: 2 })
    pen.stroke([P(cx + dir * 28, bot - 38), P(cx + dir * 50, bot - 50), P(cx + dir * 58, bot - 40), P(cx + dir * 44, bot - 30)], { close: true, fill: '#4a4a52', w: 1.8 })
    pen.stroke([P(cx + dir * 38, bot - 50), P(cx + dir * 40, bot - 64), P(cx + dir * 46, bot - 52)], { close: true, fill: '#4a4a52', w: 1.4 })
    pen.ellipse(cx + dir * 48, bot - 45, 2, 2, { fill: pal.glow, w: 0 })
    pen.stroke([P(cx - dir * 34, bot - 36), P(cx - dir * 52, bot - 46 + Math.sin(t * 5) * 3)], { w: 4 })
  },

  trickle({ pen, b, t, pal }) {
    const pts: Pt[] = []
    for (let x = b.x; x <= b.x + b.w; x += 10) pts.push(P(x, b.y + b.h / 2 + Math.sin(x * 0.1 + t * 4) * 2))
    pen.stroke(pts, { w: 4, color: pal.water, alpha: 0.6 })
  },

  sphinx({ pen, c, b, t, pal, ent }) {
    const bot = b.y + b.h
    const resting = !!ent.resting
    const h = resting ? b.h * 0.55 : b.h
    const top = bot - h
    // Lion body.
    pen.stroke([P(b.x, bot), P(b.x + 6, top + h * 0.45), P(b.x + b.w * 0.55, top + h * 0.4), P(b.x + b.w, bot)], { close: true, fill: SAND, fillAlpha: 0.9, w: 2.4 })
    pen.hatch(b.x + 10, top + h * 0.5, b.w - 20, h * 0.5, { gap: 9, alpha: 0.18 })
    // Paws.
    pen.rect(b.x - 16, bot - 16, 50, 16, { fill: SAND, w: 2 })
    // Head with a striped headdress.
    const hx = b.x + b.w * 0.18
    const hy = top + (resting ? 10 : 0)
    pen.stroke([P(hx - 30, hy + 70), P(hx - 24, hy + 16), P(hx, hy), P(hx + 24, hy + 16), P(hx + 30, hy + 70)], { close: true, fill: pal.gold, fillAlpha: 0.7, w: 2.2 })
    for (let i = 0; i < 4; i++) pen.line(hx - 22 + i * 3, hy + 24 + i * 11, hx + 22 - i * 3, hy + 24 + i * 11, { w: 1.4, color: '#1f4f63', plain: true })
    pen.ellipse(hx, hy + 38, 14, 18, { fill: SAND, w: 1.8 })
    const glow = resting ? 0.2 : 0.6 + Math.sin(t * 1.4) * 0.3
    c.save()
    c.globalAlpha = glow
    c.fillStyle = pal.glow
    for (const dx of [-6, 6]) {
      c.beginPath()
      c.ellipse(hx + dx, hy + 34, 3, resting ? 0.8 : 2, 0, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  },

  vent({ pen, b, t }) {
    const cx = b.x + b.w / 2
    pen.rect(b.x, b.y + b.h - 14, b.w, 14, { fill: '#8a7a64', fillAlpha: 0.7, w: 2 })
    for (let i = 0; i < 4; i++) {
      const off = (t * 40 + i * 20) % 60
      pen.ellipse(cx + Math.sin(t * 2 + i) * 6, b.y + b.h - 18 - off, 6 + off * 0.2, 4 + off * 0.1, { w: 1.2, alpha: 0.5 * (1 - off / 60), plain: true })
    }
  },

  hourglass({ pen, b, t }) {
    const cx = b.x + b.w / 2
    pen.line(b.x, b.y, b.x + b.w, b.y, { w: 3, color: WOOD })
    pen.line(b.x, b.y + b.h, b.x + b.w, b.y + b.h, { w: 3, color: WOOD })
    pen.stroke([P(b.x + 5, b.y + 3), P(b.x + b.w - 5, b.y + 3), P(cx + 3, b.y + b.h / 2), P(b.x + b.w - 5, b.y + b.h - 3), P(b.x + 5, b.y + b.h - 3), P(cx - 3, b.y + b.h / 2)], {
      close: true,
      fill: '#eef2f2',
      fillAlpha: 0.5,
      w: 1.6,
    })
    const k = (t * 0.1) % 1
    pen.stroke([P(cx - 10 * (1 - k), b.y + 10 + 12 * k), P(cx + 10 * (1 - k), b.y + 10 + 12 * k), P(cx, b.y + b.h / 2)], { close: true, fill: SAND, w: 0 })
    pen.stroke([P(cx - 12 * k, b.y + b.h - 4), P(cx + 12 * k, b.y + b.h - 4), P(cx, b.y + b.h - 4 - 16 * k)], { close: true, fill: SAND, w: 0 })
    pen.line(cx, b.y + b.h / 2, cx, b.y + b.h - 6, { w: 1, color: SAND, plain: true })
  },

  tablet({ pen, b, pal }) {
    pen.stroke([P(b.x, b.y + b.h), P(b.x, b.y + 14), P(b.x + b.w / 2, b.y), P(b.x + b.w, b.y + 14), P(b.x + b.w, b.y + b.h)], { close: true, fill: '#b9ab91', w: 2 })
    pen.ellipse(b.x + b.w / 2, b.y + 28, 9, 9, { w: 1.6, color: pal.accent })
    pen.line(b.x + 12, b.y + 46, b.x + b.w - 12, b.y + 46, { w: 1.2, alpha: 0.5, plain: true })
  },

  coin({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const spin = Math.abs(Math.cos(t * 2))
    pen.ellipse(cx, cy, (b.w / 2) * (0.3 + spin * 0.7), b.h / 2, { fill: pal.gold, fillAlpha: 0.85, w: 1.8 })
  },

  bale({ pen, b }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: '#d9b85a', fillAlpha: 0.8, w: 2.2 })
    for (let y = b.y + 12; y < b.y + b.h; y += 12) pen.line(b.x + 3, y, b.x + b.w - 3, y + 2, { w: 1, alpha: 0.4, plain: true })
    for (const x of [b.x + b.w * 0.3, b.x + b.w * 0.7]) pen.line(x, b.y, x, b.y + b.h, { w: 2, color: '#8a6a43' })
  },

  shade({ c, b }) {
    c.save()
    c.globalAlpha = 0.18
    c.fillStyle = '#3a2a1a'
    c.beginPath()
    c.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  },

  stopsign({ pen, b }) {
    const cx = b.x + b.w / 2
    pen.line(cx, b.y + b.h, cx, b.y + 36, { w: 3 })
    const pts: Pt[] = []
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + (i / 8) * Math.PI * 2
      pts.push(P(cx + Math.cos(a) * 20, b.y + 20 + Math.sin(a) * 20))
    }
    pen.stroke(pts, { close: true, fill: '#b53a2e', fillAlpha: 0.9, w: 2 })
  },
}
