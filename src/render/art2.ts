/** Art for Chapter II: The Drowned Library. */
import type { ArtCtx } from './art'
import type { Pt } from './pen'

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })
const WOOD = '#7b5836'

export const ART_2: Record<string, Art> = {
  train({ pen, b, t, pal, ent }) {
    const moving = !!ent.veh && ent.veh.wait <= 0 && ent.veh.dx !== 0
    const bob = moving ? Math.sin(t * 18) * 0.8 : 0
    pen.rect(b.x + 6, b.y + 6 + bob, b.w - 22, b.h - 12, { fill: '#9b3b2e', fillAlpha: 0.6, w: 2 })
    pen.rect(b.x + b.w - 22, b.y - 4 + bob, 16, b.h - 2, { fill: pal.accent, fillAlpha: 0.5, w: 2 })
    pen.rect(b.x + 12, b.y - 6 + bob, 8, 12, { fill: pal.ink, w: 1.4 })
    for (const wx of [b.x + 14, b.x + b.w / 2, b.x + b.w - 14]) {
      pen.ellipse(wx, b.y + b.h - 4, 6, 6, { fill: pal.ink, w: 1.4 })
    }
    if (moving) pen.ellipse(b.x + 16, b.y - 16 - ((t * 30) % 14), 5, 4, { w: 1.2, alpha: 0.5, plain: true })
  },

  rain({ pen, c, b, t, pal }) {
    for (let i = 0; i < 26; i++) {
      const x = b.x + 20 + ((i * 97) % (b.w - 40))
      const len = 380
      const y = b.y + b.h * 0.6 + ((t * 420 + i * 53) % len)
      c.save()
      c.globalAlpha = 0.35 * (1 - (y - b.y) / (len + b.h))
      c.strokeStyle = pal.water
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(x, y)
      c.lineTo(x - 3, y + 14)
      c.stroke()
      c.restore()
    }
    for (let i = 0; i < 5; i++) {
      const cx = b.x + b.w * (0.15 + i * 0.18)
      const cy = b.y + b.h * 0.45 + Math.sin(i * 2 + t * 0.6) * 6
      pen.ellipse(cx, cy, b.w * 0.14, b.h * 0.32, { fill: '#8e8f96', fillAlpha: 0.55, w: 1.8 })
    }
  },

  drain({ pen, b, t }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: '#6f6a64', fillAlpha: 0.6, w: 2 })
    for (let x = b.x + 10; x < b.x + b.w - 4; x += 12) pen.line(x, b.y + 2, x, b.y + b.h - 2, { w: 2, plain: true })
    const cx = b.x + b.w / 2
    for (let r = 0; r < 3; r++) {
      pen.ellipse(cx, b.y - 8, 18 + r * 12, 4 + r * 2, { from: t * 3 + r, to: t * 3 + r + 4, w: 1.2, alpha: 0.5, plain: true })
    }
  },

  draft({ pen, b, t }) {
    for (let i = 0; i < 3; i++) {
      const y = b.y + 10 + i * 15
      const off = ((t * 40 + i * 30) % 60) - 30
      const pts: Pt[] = []
      for (let k = 0; k <= 8; k++) pts.push(P(b.x + k * (b.w / 8) + off, y + Math.sin(k * 0.9 + t * 3 + i) * 4))
      pen.stroke(pts, { w: 1.4, alpha: 0.45, plain: true })
    }
    pen.ellipse(b.x + b.w * 0.75, b.y + 18, 9, 7, { from: 0, to: Math.PI * 1.6, w: 1.4, alpha: 0.45 })
  },

  raft({ pen, b, t }) {
    const bob = Math.sin(t * 2.2) * 1.2
    for (let i = 0; i < 4; i++) {
      const y = b.y + 3 + i * 6 + bob
      pen.ellipse(b.x + b.w / 2, y, b.w / 2, 4.5, { fill: WOOD, fillAlpha: 0.55, w: 1.6, plain: true })
    }
    for (const x of [b.x + 18, b.x + b.w - 18]) pen.line(x, b.y + bob, x + 2, b.y + b.h - 4 + bob, { w: 1.6, color: '#c9b27a' })
  },

  rat({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2 + Math.sin(t * 1.4) * 10
    const bot = b.y + b.h
    pen.ellipse(cx, bot - 7, 13, 7, { fill: '#6d6258', w: 1.5 })
    pen.ellipse(cx - 12, bot - 10, 5, 4, { fill: '#6d6258', w: 1.2 })
    pen.stroke([P(cx + 12, bot - 6), P(cx + 24, bot - 10), P(cx + 30, bot - 4)], { w: 1.2 })
    pen.ellipse(cx - 14, bot - 11, 1, 1, { fill: pal.paper, w: 0 })
  },

  inkpot({ pen, b, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.stroke([P(cx - 13, bot), P(cx - 14, bot - 16), P(cx - 6, bot - 22), P(cx - 6, b.y), P(cx + 6, b.y), P(cx + 6, bot - 22), P(cx + 14, bot - 16), P(cx + 13, bot)], {
      close: true,
      fill: pal.ink,
      fillAlpha: 0.85,
      w: 1.6,
    })
    pen.rect(cx - 10, bot - 12, 20, 7, { fill: pal.paper, w: 1 })
  },

  sink({ pen, b, t, pal }) {
    const cx = b.x + b.w / 2
    pen.ellipse(cx, b.y + 4, b.w / 2, b.h - 4, { from: 0, to: Math.PI, fill: '#f4f1ea', w: 2.2 })
    pen.line(b.x, b.y + 4, b.x + b.w, b.y + 4, { w: 2.2 })
    for (let r = 0; r < 4; r++) {
      pen.ellipse(cx, b.y - 2 - r * 3, 30 - r * 6, 5 - r, { from: t * 4 + r, to: t * 4 + r + 4.5, w: 1.2, alpha: 0.55, color: pal.water, plain: true })
    }
  },

  eels({ pen, b, t, pal }) {
    for (let i = 0; i < 4; i++) {
      const y = b.y + 6 + i * 9
      const ox = (i % 2) * 24
      const pts: Pt[] = []
      for (let k = 0; k <= 6; k++) pts.push(P(b.x + ox + k * 24, y + Math.sin(k * 1.1 + t * 5 + i) * 4))
      pen.stroke(pts, { w: 5, color: '#2f4a3a', plain: true })
      pen.ellipse(pts[0].x, pts[0].y, 5, 4, { fill: '#2f4a3a', w: 1 })
      pen.ellipse(pts[0].x - 2, pts[0].y - 1, 1.2, 1.2, { fill: pal.glow, w: 0 })
    }
  },

  eel({ pen, b, t, pal, ent }) {
    const dir = ent.veh && ent.veh.dir < 0 ? -1 : 1
    const bot = b.y + b.h
    const pts: Pt[] = []
    for (let k = 0; k <= 6; k++) {
      const x = dir > 0 ? b.x + b.w - k * (b.w / 6) : b.x + k * (b.w / 6)
      pts.push(P(x, bot - 9 + Math.sin(k * 1.2 + t * 9) * 5))
    }
    pen.stroke(pts, { w: 8, color: '#2f4a3a' })
    pen.ellipse(pts[0].x, pts[0].y - 1, 7, 6, { fill: '#2f4a3a', w: 1.4 })
    pen.ellipse(pts[0].x + dir * 2, pts[0].y - 3, 1.6, 1.6, { fill: pal.glow, w: 0 })
  },

  cage({ pen, b }) {
    const cx = b.x + b.w / 2
    pen.ellipse(cx, b.y + 20, b.w / 2, 20, { from: Math.PI, to: Math.PI * 2, w: 2.4 })
    pen.line(b.x, b.y + 20, b.x, b.y + b.h, { w: 2.4 })
    pen.line(b.x + b.w, b.y + 20, b.x + b.w, b.y + b.h, { w: 2.4 })
    pen.line(b.x - 4, b.y + b.h, b.x + b.w + 4, b.y + b.h, { w: 3 })
    for (let x = b.x + 12; x < b.x + b.w; x += 14) pen.line(x, b.y + 12, x, b.y + b.h, { w: 1.6, plain: true })
    pen.line(cx, b.y, cx, b.y - 18, { w: 1.6 })
    pen.ellipse(cx, b.y - 22, 5, 5, { w: 1.4 })
  },

  page({ pen, b, t }) {
    const flut = Math.sin(t * 3) * 2
    pen.stroke([P(b.x, b.y + flut), P(b.x + b.w, b.y - flut), P(b.x + b.w - 2, b.y + b.h - flut), P(b.x + 3, b.y + b.h + flut)], {
      close: true,
      fill: '#fbf5e4',
      w: 1.8,
    })
    for (let i = 0; i < 3; i++) pen.line(b.x + 10, b.y + 4 + i * 3, b.x + b.w - 14 - i * 8, b.y + 4 + i * 3, { w: 0.8, alpha: 0.4, plain: true })
  },

  candle({ pen, c, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.ellipse(cx, bot - 3, 12, 4, { fill: pal.gold, fillAlpha: 0.7, w: 1.4 })
    pen.rect(cx - 5, b.y + 12, 10, b.h - 15, { fill: '#f3ead2', w: 1.4 })
    const f = Math.sin(t * 11) * 1.5
    const g = c.createRadialGradient(cx, b.y + 4, 1, cx, b.y + 4, 40)
    g.addColorStop(0, 'rgba(245,217,138,0.6)')
    g.addColorStop(1, 'rgba(245,217,138,0)')
    c.fillStyle = g
    c.fillRect(cx - 40, b.y - 36, 80, 80)
    pen.stroke([P(cx - 4, b.y + 12), P(cx + f, b.y - 4), P(cx + 4, b.y + 12)], { close: true, fill: '#eab84a', w: 1 })
  },

  crow({ pen, b, t, pal, ent }) {
    const dir = ent.veh && ent.veh.dir < 0 && ent.veh.wait <= 0 ? -1 : 1
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2 + Math.sin(t * 3) * 2
    const flap = Math.sin(t * 9) * 12
    pen.stroke([P(cx - 10, cy), P(cx - 30, cy - 8 - flap), P(cx - 46, cy - 2 - flap * 0.6)], { w: 3 })
    pen.stroke([P(cx + 10, cy), P(cx + 30, cy - 8 - flap), P(cx + 46, cy - 2 - flap * 0.6)], { w: 3 })
    pen.ellipse(cx, cy + 2, 22, 9, { fill: pal.ink, w: 1.6 })
    pen.ellipse(cx + dir * 22, cy - 2, 7, 6, { fill: pal.ink, w: 1.4 })
    pen.stroke([P(cx + dir * 28, cy - 4), P(cx + dir * 38, cy - 1), P(cx + dir * 28, cy + 1)], { close: true, fill: pal.gold, w: 1 })
    pen.ellipse(cx + dir * 24, cy - 4, 1.4, 1.4, { fill: pal.glow, w: 0 })
    pen.line(cx - dir * 20, cy + 2, cx - dir * 34, cy + 8, { w: 3 })
  },

  book({ pen, b, pal }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: pal.accent, fillAlpha: 0.55, w: 1.8 })
    pen.line(b.x + 3, b.y + b.h / 2, b.x + b.w - 3, b.y + b.h / 2, { w: 0.8, alpha: 0.5, color: pal.paper, plain: true })
  },

  books({ pen, b, pal }) {
    const colors = [pal.accent, '#9b3b2e', '#6a4f86', WOOD, '#4d7248']
    const n = 5
    const bh = b.h / n
    for (let i = 0; i < n; i++) {
      const inset = ((i * 7) % 5) - 2
      pen.rect(b.x + inset, b.y + b.h - (i + 1) * bh, b.w - Math.abs(inset) * 2, bh - 1, { fill: colors[i % colors.length], fillAlpha: 0.55, w: 1.6, plain: true })
    }
  },

  bell({ pen, c, b, t, pal }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const shake = Math.sin(t * 40) * 0.12
    c.save()
    c.translate(cx, bot - 6)
    c.rotate(shake)
    c.translate(-cx, -(bot - 6))
    pen.rect(cx - 16, bot - 6, 32, 6, { fill: WOOD, fillAlpha: 0.7, w: 1.6 })
    pen.ellipse(cx, bot - 6, 14, 18, { from: Math.PI, to: Math.PI * 2, fill: pal.gold, fillAlpha: 0.75, w: 1.8 })
    pen.ellipse(cx, bot - 26, 3, 3, { fill: pal.ink, w: 1 })
    c.restore()
    for (let i = 0; i < 3; i++) {
      const r = 18 + ((t * 40 + i * 12) % 36)
      pen.ellipse(cx, bot - 14, r, r * 0.8, { from: -0.9, to: 0.9, w: 1.2, alpha: 1 - r / 54, plain: true })
      pen.ellipse(cx, bot - 14, r, r * 0.8, { from: Math.PI - 0.9, to: Math.PI + 0.9, w: 1.2, alpha: 1 - r / 54, plain: true })
    }
  },

  roar({ pen, b, t }) {
    const cx = b.x + b.w / 2
    const cy = b.y + b.h / 2
    const pts: Pt[] = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2
      const r = (i % 2 ? 0.55 : 1) * (b.w / 2) * (1 + Math.sin(t * 20 + i) * 0.06)
      pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5))
    }
    pen.stroke(pts, { close: true, fill: '#eab84a', fillAlpha: 0.5, w: 2 })
  },

  librarian({ pen, c, b, t, pal, ent }) {
    const g = ent.guard
    const f = g?.facing ?? -1
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    const walking = g && (g.state === 'going' || g.state === 'return')
    const sway = walking ? Math.sin(t * 7) * 3 : Math.sin(t * 1.2) * 1.5
    c.save()
    c.translate(cx, 0)
    c.scale(f, 1)
    c.translate(-cx, 0)
    // Coat.
    pen.stroke([P(cx - 26, bot), P(cx - 16 + sway * 0.3, b.y + 34), P(cx + 12, b.y + 30), P(cx + 24, bot)], { close: true, fill: pal.ink, fillAlpha: 0.9, w: 2 })
    pen.line(cx - 22, bot - 4, cx + 20, bot - 4, { w: 2, color: pal.gold })
    pen.line(cx - 2, b.y + 34, cx - 4, bot - 6, { w: 1.4, color: pal.gold, alpha: 0.8 })
    // Hooded head, leaning forward.
    pen.ellipse(cx + 6, b.y + 20, 15, 17, { fill: pal.ink, w: 2 })
    // Spectacles that catch the light.
    const glow = 0.6 + Math.sin(t * 2) * 0.3
    for (const dx of [10, 18]) pen.ellipse(cx + dx, b.y + 20, 4, 4, { fill: pal.glow, fillAlpha: glow, w: 1.2, color: pal.gold })
    // One hand holds a lantern; the other shushes.
    if (g?.state === 'shush') {
      pen.line(cx + 8, b.y + 44, cx + 22, b.y + 30, { w: 3 })
      pen.line(cx + 22, b.y + 30, cx + 22, b.y + 18, { w: 2.4 })
    } else {
      pen.line(cx + 8, b.y + 46, cx + 20, b.y + 62, { w: 3 })
    }
    pen.line(cx - 14, b.y + 46, cx - 24, b.y + 66, { w: 3 })
    pen.line(cx - 24, b.y + 66, cx - 24, b.y + 74, { w: 1.4, color: pal.gold })
    pen.rect(cx - 30, b.y + 74, 12, 16, { fill: pal.glow, fillAlpha: 0.7, w: 1.4, color: pal.gold })
    c.restore()
  },

  rope({ pen, b, t }) {
    const cx = b.x + b.w / 2
    const pts: Pt[] = []
    for (let y = b.y; y <= b.y + b.h; y += 26) pts.push(P(cx + Math.sin(y * 0.04 + t * 1.3) * 3, y))
    pen.stroke(pts, { w: 4, color: '#9a7b4f' })
    for (let y = b.y + 30; y < b.y + b.h; y += 44) pen.ellipse(cx + Math.sin(y * 0.04 + t * 1.3) * 3, y, 4, 3, { fill: '#9a7b4f', w: 1.2 })
    pen.line(cx - 16, b.y, cx + 16, b.y, { w: 3, color: WOOD })
  },

  flood({ c, b, t }) {
    c.save()
    c.fillStyle = 'rgba(255,255,255,0.55)'
    for (let x = b.x + 8; x < b.x + b.w; x += 26) {
      const y = b.y + Math.sin(x * 0.07 + t * 3) * 2.5
      c.beginPath()
      c.arc(x, y, 2 + Math.abs(Math.sin(x + t)) * 2, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  },

  floor({ pen, b }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: WOOD, fillAlpha: 0.6, w: 2.4 })
    for (let x = b.x + 60; x < b.x + b.w; x += 60) pen.line(x, b.y + 2, x, b.y + b.h - 2, { w: 1.2, alpha: 0.6, plain: true })
    pen.line(b.x, b.y + b.h / 2, b.x + b.w, b.y + b.h / 2, { w: 0.8, alpha: 0.3, plain: true })
  },
}
