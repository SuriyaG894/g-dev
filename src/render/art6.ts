/** Art for Chapter VI: The Folded Sea. */
import type { ArtCtx } from './art'
import type { Pt } from './pen'

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })
const KELP = '#4f7a4a'
const PINK = '#d77a7a'
const SHELL = '#e9c9a8'
const BANDS = ['#c4532b', '#d9903a', '#d9c24a', '#5f9a5a', '#3f7aa0', '#6a4f96']

export const ART_6: Record<string, Art> = {
  wave({ pen, b, t, pal }) {
    const pts: Pt[] = []
    for (let x = b.x; x <= b.x + b.w; x += 6) pts.push(P(x, b.y + b.h * 0.55 + Math.sin(x * 0.18 + t * 3) * b.h * 0.25))
    pen.stroke([...pts, P(b.x + b.w, b.y + b.h), P(b.x, b.y + b.h)], { close: true, fill: pal.water, fillAlpha: 0.6, w: 1.6 })
    pen.ellipse(b.x + b.w * 0.7, b.y + b.h * 0.35, 4, 3, { fill: '#ffffff', w: 0 })
  },

  weed({ pen, b, t }) {
    for (let i = 0; i < 3; i++) {
      const x = b.x + 4 + i * (b.w / 3)
      pen.stroke([P(x, b.y + b.h), P(x + Math.sin(t * 2 + i) * 4, b.y + b.h * 0.5), P(x + 3 + Math.sin(t * 2 + i + 1) * 5, b.y)], { w: 2, color: KELP, plain: true })
    }
  },

  seaweed({ pen, b, t }) {
    for (let s = 0; s < 2; s++) {
      const pts: Pt[] = []
      for (let y = b.y + b.h; y >= b.y; y -= 16) {
        const k = (b.y + b.h - y) / b.h
        pts.push(P(b.x + b.w * (0.35 + s * 0.3) + Math.sin(y * 0.04 + t * 1.5 + s) * 8 * k, y))
      }
      pen.stroke(pts, { w: 5, color: KELP })
      for (let i = 2; i < pts.length; i += 2) {
        const p = pts[i]
        const d = i % 4 ? 1 : -1
        pen.ellipse(p.x + d * 9, p.y, 9, 4, { fill: KELP, fillAlpha: 0.7, w: 1, plain: true })
      }
    }
  },

  bow({ pen, b }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h * 0.45
    pen.stroke([P(cx, cy), P(b.x, b.y), P(b.x, b.y + b.h * 0.8)], { close: true, fill: PINK, w: 1.4 })
    pen.stroke([P(cx, cy), P(b.x + b.w, b.y), P(b.x + b.w, b.y + b.h * 0.8)], { close: true, fill: PINK, w: 1.4 })
    pen.line(cx - 2, cy, cx - 8, b.y + b.h, { w: 2.4, color: PINK })
    pen.line(cx + 2, cy, cx + 8, b.y + b.h, { w: 2.4, color: PINK })
    pen.ellipse(cx, cy, 4, 4, { fill: PINK, w: 1.2 })
  },

  rainbow({ c, b, t }) {
    // A low arch of colour, its top flat enough to walk on.
    const cx = b.x + b.w / 2
    const base = b.y + b.h + 50
    c.save()
    c.lineCap = 'round'
    BANDS.forEach((col, i) => {
      c.strokeStyle = col
      c.globalAlpha = 0.75 + Math.sin(t * 2 + i) * 0.05
      c.lineWidth = 5
      c.beginPath()
      c.ellipse(cx, base, b.w / 2 - i * 5, b.h + 50 - i * 5, 0, Math.PI, Math.PI * 2)
      c.stroke()
    })
    c.restore()
  },

  jelly({ pen, b, t, pal }) {
    const wob = Math.sin(t * 7) * 2
    pen.ellipse(b.x + b.w / 2, b.y + b.h - 3, b.w / 2 + 4, 4, { fill: pal.paper, w: 1.4 })
    pen.stroke([P(b.x + 4, b.y + b.h - 4), P(b.x + 6 + wob, b.y + 6), P(b.x + b.w / 2, b.y + wob * 0.5), P(b.x + b.w - 6 - wob, b.y + 6), P(b.x + b.w - 4, b.y + b.h - 4)], {
      close: true,
      fill: '#c0506a',
      fillAlpha: 0.6,
      w: 1.6,
    })
  },

  fish({ pen, b, t, pal }) {
    const cy = b.y + b.h / 2 + Math.sin(t * 3) * 2
    pen.ellipse(b.x + b.w * 0.42, cy, b.w * 0.36, b.h * 0.42, { fill: '#d9903a', fillAlpha: 0.7, w: 1.5 })
    const tx = b.x + b.w * 0.76
    pen.stroke([P(tx, cy), P(b.x + b.w, cy - b.h * 0.45 + Math.sin(t * 8) * 2), P(b.x + b.w, cy + b.h * 0.45 + Math.sin(t * 8) * 2)], { close: true, fill: '#d9903a', w: 1.3 })
    pen.ellipse(b.x + b.w * 0.2, cy - 2, 1.8, 1.8, { fill: pal.ink, w: 0 })
  },

  jellyfish({ pen, b, t }) {
    const squash = Math.sin(t * 4) * 3
    const cx = b.x + b.w / 2
    const top = b.y + squash
    pen.stroke([P(b.x, b.y + b.h * 0.55), P(b.x + 6, top + 8), P(cx, top), P(b.x + b.w - 6, top + 8), P(b.x + b.w, b.y + b.h * 0.55)], { close: true, fill: '#b06ac0', fillAlpha: 0.5, w: 1.8 })
    for (let i = 0; i < 5; i++) {
      const x = b.x + 8 + i * ((b.w - 16) / 4)
      pen.stroke([P(x, b.y + b.h * 0.55), P(x + Math.sin(t * 3 + i) * 4, b.y + b.h * 0.8), P(x + Math.sin(t * 3 + i + 1) * 5, b.y + b.h + 6)], { w: 1.2, plain: true })
    }
  },

  starfish({ pen, b, t }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const pts: Pt[] = []
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2 + Math.sin(t) * 0.05
      const r = i % 2 ? b.w * 0.2 : b.w * 0.5
      pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5))
    }
    pen.stroke(pts, { close: true, fill: '#d9703a', fillAlpha: 0.8, w: 1.6 })
  },

  sun({ pen, c, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const g = c.createRadialGradient(cx, cy, 4, cx, cy, b.w)
    g.addColorStop(0, 'rgba(240,170,80,0.5)')
    g.addColorStop(1, 'rgba(240,170,80,0)')
    c.fillStyle = g
    c.fillRect(cx - b.w, cy - b.w, b.w * 2, b.w * 2)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.2
      pen.line(cx + Math.cos(a) * b.w * 0.42, cy + Math.sin(a) * b.w * 0.42, cx + Math.cos(a) * b.w * 0.6, cy + Math.sin(a) * b.w * 0.6, { w: 1.6, color: pal.fire, plain: true })
    }
    pen.ellipse(cx, cy, b.w * 0.34, b.w * 0.34, { fill: '#f0a850', w: 2 })
  },

  flower({ pen, b, t }) {
    const cx = b.x + b.w / 2
    const hy = b.y + 9
    pen.line(cx, b.y + b.h, cx + Math.sin(t) * 2, hy, { w: 1.8, color: KELP })
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      pen.ellipse(cx + Math.cos(a) * 6, hy + Math.sin(a) * 6, 4.5, 4.5, { fill: '#e9d24a', w: 1, plain: true })
    }
    pen.ellipse(cx, hy, 3.5, 3.5, { fill: '#7b5836', w: 1 })
  },

  sunflower({ pen, b, t }) {
    const cx = b.x + b.w / 2
    const hy = b.y + 30
    pen.line(cx, b.y + b.h, cx + Math.sin(t * 0.8) * 3, hy, { w: 6, color: KELP })
    for (let y = b.y + b.h - 40; y > hy + 30; y -= 60) {
      const d = Math.round(y / 60) % 2 ? 1 : -1
      pen.ellipse(cx + d * 16, y, 16, 7, { fill: KELP, fillAlpha: 0.7, w: 1.2 })
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2
      pen.ellipse(cx + Math.cos(a) * 24, hy + Math.sin(a) * 24, 10, 6, { fill: '#e9c23a', w: 1, plain: true })
    }
    pen.ellipse(cx, hy, 17, 17, { fill: '#6b4a2a', w: 1.6 })
  },

  fly({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2 + Math.sin(t * 9) * 3
    const cy = b.y + b.h / 2 + Math.cos(t * 7) * 3
    pen.ellipse(cx, cy, 4, 3, { fill: pal.ink, w: 0.8 })
    const flap = Math.sin(t * 40) * 2
    pen.ellipse(cx - 3, cy - 4 - flap, 4, 2.5, { w: 0.8, alpha: 0.6, plain: true })
    pen.ellipse(cx + 3, cy - 4 - flap, 4, 2.5, { w: 0.8, alpha: 0.6, plain: true })
  },

  firefly({ pen, c, b, t, pal }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + Math.sin(t * 3) * 3
    const g = c.createRadialGradient(cx, cy, 1, cx, cy, 26)
    g.addColorStop(0, `rgba(245,230,120,${0.8 + Math.sin(t * 6) * 0.15})`)
    g.addColorStop(1, 'rgba(245,230,120,0)')
    c.fillStyle = g
    c.fillRect(cx - 26, cy - 26, 52, 52)
    pen.ellipse(cx, cy, 5, 4, { fill: pal.ink, w: 0.8 })
    pen.ellipse(cx + 4, cy + 1, 3.5, 3, { fill: '#f5e678', w: 0 })
    const flap = Math.sin(t * 30) * 2
    pen.ellipse(cx - 2, cy - 5 - flap, 4, 2.5, { w: 0.8, alpha: 0.6, plain: true })
  },

  horse({ pen, b, t, pal }) {
    const bot = b.y + b.h
    const sway = Math.sin(t * 1.5) * 1.5
    for (const lx of [0.2, 0.35, 0.7, 0.85]) pen.line(b.x + b.w * lx, bot - b.h * 0.45, b.x + b.w * lx + 1, bot, { w: 4, plain: true })
    pen.ellipse(b.x + b.w * 0.52, bot - b.h * 0.55, b.w * 0.38, b.h * 0.2, { fill: '#8a6a4a', fillAlpha: 0.8, w: 1.8 })
    pen.stroke([P(b.x + b.w * 0.22, bot - b.h * 0.62), P(b.x + b.w * 0.1, b.y + 6 + sway), P(b.x - 2, b.y + 16 + sway), P(b.x + b.w * 0.06, b.y + 24 + sway), P(b.x + b.w * 0.24, bot - b.h * 0.5)], {
      close: true,
      fill: '#8a6a4a',
      fillAlpha: 0.85,
      w: 1.6,
    })
    pen.stroke([P(b.x + b.w * 0.12, b.y + 4 + sway), P(b.x + b.w * 0.2, b.y + 20), P(b.x + b.w * 0.24, b.y + 34)], { w: 3, color: pal.ink, plain: true })
    pen.stroke([P(b.x + b.w * 0.88, bot - b.h * 0.6), P(b.x + b.w + 6, bot - b.h * 0.4 + Math.sin(t * 2) * 3)], { w: 3, plain: true })
    pen.ellipse(b.x + b.w * 0.07, b.y + 14 + sway, 1.6, 1.6, { fill: pal.ink, w: 0 })
  },

  seahorse({ pen, b, t, pal }) {
    const bob = Math.sin(t * 2) * 3
    const x = b.x + b.w * 0.2
    const y = b.y + bob
    // A saddle-backed seahorse, curled tail in the water.
    pen.stroke([P(x, y + 4), P(x + b.w * 0.45, y), P(x + b.w * 0.75, y + 6), P(x + b.w * 0.7, y + b.h * 0.6), P(x + b.w * 0.5, y + b.h), P(x + b.w * 0.3, y + b.h * 0.85), P(x + b.w * 0.42, y + b.h * 0.7)], {
      fill: '#3f8a9a',
      fillAlpha: 0.75,
      w: 1.8,
    })
    pen.stroke([P(x, y + 4), P(x - 14, y - 10), P(x - 22, y - 6), P(x - 8, y + 12)], { close: true, fill: '#3f8a9a', w: 1.6 })
    pen.ellipse(x - 6, y - 3, 1.8, 1.8, { fill: pal.ink, w: 0 })
    pen.rect(x + b.w * 0.1, y - 4, b.w * 0.5, 6, { fill: '#9b3b2e', w: 1.2 })
  },

  shell({ pen, b }) {
    pen.stroke([P(b.x, b.y + b.h), P(b.x + b.w * 0.2, b.y + 2), P(b.x + b.w / 2, b.y), P(b.x + b.w * 0.8, b.y + 2), P(b.x + b.w, b.y + b.h)], { close: true, fill: SHELL, w: 1.4 })
    for (let i = 1; i < 4; i++) pen.line(b.x + b.w / 2, b.y + b.h, b.x + (i * b.w) / 4, b.y + 3, { w: 0.8, alpha: 0.6, plain: true })
  },

  seashell({ pen, c, b, t }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const pts: Pt[] = []
    for (let i = 0; i < 40; i++) {
      const a = i * 0.45
      const r = 2 + i * 0.55
      pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8))
    }
    pen.ellipse(cx, cy, b.w / 2, b.h / 2, { fill: SHELL, w: 1.6 })
    pen.stroke(pts, { w: 1.2, plain: true })
    c.save()
    c.globalAlpha = 0.25 + Math.sin(t * 2) * 0.15
    pen.ellipse(cx + b.w * 0.7, cy, 6, 9, { from: -1, to: 1, w: 1.2, plain: true })
    pen.ellipse(cx + b.w * 0.7, cy, 12, 16, { from: -1, to: 1, w: 1.2, plain: true })
    c.restore()
  },
}
