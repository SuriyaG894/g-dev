/** Art for Chapter V: The City of Ink, and the marks an adjective leaves on anything it names. */
import { ADJECTIVES } from '../game/lexicon'
import type { ArtCtx } from './art'
import type { Pt } from './pen'

type Art = (a: ArtCtx) => void

const P = (x: number, y: number): Pt => ({ x, y })
const STONE = '#9a958c'
const BRICK = '#8c5a44'
const WOOD = '#7b5836'
const IRON = '#3a3a40'
const ICE = '#cfe6f0'

export const ART_5: Record<string, Art> = {
  sign({ pen, b }) {
    const cx = b.x + b.w / 2
    const bot = b.y + b.h
    pen.line(cx, bot, cx + 1, b.y + b.h * 0.3, { w: 3 })
    const bw = b.w * 0.95
    const bh = b.h * 0.36
    pen.rect(cx - bw / 2, b.y, bw, bh, { fill: '#e9dcc0', w: 2 })
    for (let i = 0; i < 2; i++) pen.line(cx - bw / 2 + 8, b.y + 10 + i * 11, cx + bw / 2 - 8 - i * 10, b.y + 11 + i * 11, { w: 1, alpha: 0.4 })
  },

  canal({ pen, c, b, t, pal, ent }) {
    const frozen = ent.adj && ADJECTIVES[ent.adj]?.freezes
    c.save()
    c.globalAlpha = frozen ? 0.55 : 0.8
    c.fillStyle = frozen ? ICE : pal.water
    c.fillRect(b.x, b.y + 4, b.w, b.h)
    c.restore()
    if (frozen) {
      pen.line(b.x, b.y + 4, b.x + b.w, b.y + 4, { w: 2.4 })
      for (let i = 0; i < 6; i++) {
        const x = b.x + 20 + i * (b.w / 6)
        pen.stroke([P(x, b.y + 8), P(x + 12, b.y + 20), P(x + 4, b.y + 30), P(x + 18, b.y + 44)], { w: 1, alpha: 0.5, plain: true })
      }
      return
    }
    for (let row = 0; row < 3; row++) {
      const pts: Pt[] = []
      for (let x = b.x; x <= b.x + b.w; x += 14) pts.push(P(x, b.y + 8 + row * 16 + Math.sin(x * 0.06 + t * (1.4 + row * 0.4) + row) * 2.5))
      pen.stroke(pts, { w: row ? 1 : 2, color: row ? '#ffffff' : pal.ink, alpha: row ? 0.25 : 0.85, plain: true })
    }
  },

  wall({ pen, b }) {
    pen.rect(b.x, b.y, b.w, b.h, { fill: BRICK, fillAlpha: 0.45, w: 2.2 })
    const rows = Math.max(2, Math.round(b.h / 15))
    const rh = b.h / rows
    for (let r = 1; r < rows; r++) pen.line(b.x + 2, b.y + r * rh, b.x + b.w - 2, b.y + r * rh, { w: 0.9, alpha: 0.5, plain: true })
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? b.w / 2 : b.w / 4
      pen.line(b.x + off, b.y + r * rh, b.x + off, b.y + (r + 1) * rh, { w: 0.9, alpha: 0.5, plain: true })
    }
  },

  lion({ pen, b, t, pal, ent }) {
    const bot = b.y + b.h
    const cx = b.x + b.w / 2
    const calm = !ent.kind.hazard
    const breathe = calm ? 0 : Math.sin(t * 2.4) * 1.5
    // Haunches, body, front legs.
    pen.ellipse(cx + 18, bot - 30, 40, 28, { fill: STONE, fillAlpha: 0.8, w: 2 })
    pen.line(cx - 22, bot - 34, cx - 24, bot - 2, { w: 8, color: '#7d786f', plain: true })
    pen.line(cx - 6, bot - 30, cx - 6, bot - 2, { w: 8, color: '#7d786f', plain: true })
    // Tail.
    pen.stroke([P(cx + 56, bot - 30), P(cx + 66, bot - 52 + Math.sin(t * 2) * 4), P(cx + 60, bot - 64)], { w: 2.2, plain: true })
    // Mane and face.
    const hx = cx - 26
    const hy = bot - 60 - breathe
    const mane: Pt[] = []
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      const r = i % 2 ? 24 : 30
      mane.push(P(hx + Math.cos(a) * r, hy + Math.sin(a) * r))
    }
    pen.stroke(mane, { close: true, fill: '#6f675c', fillAlpha: 0.85, w: 1.6 })
    pen.ellipse(hx, hy, 16, 15, { fill: STONE, w: 1.6 })
    if (calm) {
      for (const ex of [-6, 6]) pen.ellipse(hx + ex, hy - 3, 3, 1.5, { from: 0, to: Math.PI, w: 1.2, plain: true })
    } else {
      for (const ex of [-6, 6]) pen.ellipse(hx + ex, hy - 3, 2.2, 2.2, { fill: pal.fire, w: 0 })
      pen.stroke([P(hx - 7, hy + 7), P(hx - 3, hy + 11), P(hx, hy + 7), P(hx + 3, hy + 11), P(hx + 7, hy + 7)], { w: 1.4, plain: true })
    }
    pen.ellipse(hx, hy + 3, 3, 2, { fill: pal.ink, w: 0 })
  },

  chest({ pen, b, pal, ent, t, c }) {
    const open = ent.adj && ADJECTIVES[ent.adj]?.opens
    const lidH = b.h * 0.35
    pen.rect(b.x, b.y + lidH, b.w, b.h - lidH, { fill: WOOD, fillAlpha: 0.55, w: 2 })
    pen.line(b.x + b.w / 2, b.y + lidH, b.x + b.w / 2, b.y + b.h, { w: 1.2, alpha: 0.5, plain: true })
    if (open) {
      const g = c.createRadialGradient(b.x + b.w / 2, b.y + lidH, 2, b.x + b.w / 2, b.y + lidH, b.w)
      g.addColorStop(0, `rgba(245,217,138,${0.55 + Math.sin(t * 3) * 0.1})`)
      g.addColorStop(1, 'rgba(245,217,138,0)')
      c.fillStyle = g
      c.fillRect(b.x - b.w / 2, b.y - b.w / 2, b.w * 2, b.w)
      pen.stroke([P(b.x, b.y + lidH), P(b.x - 6, b.y - lidH * 0.6), P(b.x + b.w - 6, b.y - lidH * 1.2), P(b.x + b.w, b.y + lidH)], { fill: WOOD, fillAlpha: 0.5, w: 2 })
    } else {
      pen.stroke([P(b.x, b.y + lidH), P(b.x + 4, b.y), P(b.x + b.w - 4, b.y), P(b.x + b.w, b.y + lidH)], { close: true, fill: WOOD, fillAlpha: 0.7, w: 2 })
      pen.rect(b.x + b.w / 2 - 5, b.y + lidH - 4, 10, 12, { fill: pal.gold, w: 1.2 })
    }
  },

  gate({ pen, b, ent }) {
    const open = !ent.kind.solid
    const n = 5
    pen.line(b.x - 4, b.y + 12, b.x + b.w + 4, b.y + 12, { w: 3, color: IRON })
    pen.line(b.x - 4, b.y + b.h - 14, b.x + b.w + 4, b.y + b.h - 14, { w: 3, color: IRON })
    for (let i = 0; i < n; i++) {
      const x = b.x + 4 + (i * (b.w - 8)) / (n - 1)
      if (open) {
        // Bent and fallen, a heap of bars.
        pen.line(x, b.y + b.h, x + 26 - i * 13, b.y + b.h - 40 - (i % 2) * 14, { w: 3, color: IRON })
        continue
      }
      pen.line(x, b.y + 4, x, b.y + b.h, { w: 3, color: IRON })
      pen.stroke([P(x - 4, b.y + 6), P(x, b.y - 6), P(x + 4, b.y + 6)], { w: 2, color: IRON })
    }
  },

  window({ pen, c, b, t, ent }) {
    const lit = ent.light > 0
    if (lit) {
      c.save()
      c.globalAlpha = 0.85 + Math.sin(t * 5) * 0.05
      c.fillStyle = '#f5d98a'
      c.fillRect(b.x, b.y, b.w, b.h)
      c.restore()
    }
    pen.rect(b.x - 6, b.y - 6, b.w + 12, b.h + 12, { fill: BRICK, fillAlpha: 0.25, w: 1.4 })
    pen.rect(b.x, b.y, b.w, b.h, { fill: lit ? undefined : '#2a2a35', fillAlpha: 0.75, w: 2.2 })
    pen.line(b.x + b.w / 2, b.y, b.x + b.w / 2, b.y + b.h, { w: 1.6 })
    pen.line(b.x, b.y + b.h / 2, b.x + b.w, b.y + b.h / 2, { w: 1.6 })
    pen.line(b.x - 8, b.y + b.h + 6, b.x + b.w + 8, b.y + b.h + 6, { w: 2.4 })
  },

  cat({ pen, b, t, pal }) {
    const bot = b.y + b.h
    const cx = b.x + b.w / 2
    pen.ellipse(cx, bot - b.h * 0.32, b.w * 0.42, b.h * 0.32, { fill: pal.ink, fillAlpha: 0.85, w: 1.6 })
    const hy = b.y + b.h * 0.3
    pen.ellipse(cx - b.w * 0.1, hy, b.w * 0.24, b.h * 0.24, { fill: pal.ink, w: 1.4 })
    const ex = cx - b.w * 0.1
    pen.stroke([P(ex - b.w * 0.2, hy - b.h * 0.08), P(ex - b.w * 0.16, b.y), P(ex - b.w * 0.04, hy - b.h * 0.16)], { close: true, fill: pal.ink, w: 1.2 })
    pen.stroke([P(ex + b.w * 0.2, hy - b.h * 0.08), P(ex + b.w * 0.16, b.y), P(ex + b.w * 0.04, hy - b.h * 0.16)], { close: true, fill: pal.ink, w: 1.2 })
    for (const dx of [-0.08, 0.08]) pen.ellipse(ex + b.w * dx, hy, b.w * 0.035, b.h * 0.05, { fill: pal.glow, w: 0 })
    pen.stroke([P(cx + b.w * 0.38, bot - 4), P(cx + b.w * 0.55, bot - b.h * 0.3 + Math.sin(t * 1.5) * 3), P(cx + b.w * 0.48, bot - b.h * 0.6)], { w: Math.max(2, b.w * 0.05), plain: true })
  },

  key({ pen, b, pal }) {
    const cy = b.y + b.h / 2
    const r = b.h * 0.5
    pen.ellipse(b.x + r, cy, r, r, { fill: pal.gold, fillAlpha: 0.45, w: 2 })
    pen.ellipse(b.x + r, cy, r * 0.45, r * 0.45, { w: 1.4 })
    pen.rect(b.x + r * 2, cy - b.h * 0.14, b.w - r * 2, b.h * 0.28, { fill: pal.gold, fillAlpha: 0.45, w: 1.6 })
    for (const k of [0.72, 0.88]) pen.rect(b.x + b.w * k, cy, b.w * 0.07, b.h * 0.42, { fill: pal.gold, fillAlpha: 0.45, w: 1.4 })
  },

  bottle({ pen, b, pal }) {
    const cx = b.x + b.w / 2
    pen.stroke(
      [P(cx - b.w * 0.18, b.y), P(cx - b.w * 0.18, b.y + b.h * 0.3), P(b.x, b.y + b.h * 0.5), P(b.x, b.y + b.h), P(b.x + b.w, b.y + b.h), P(b.x + b.w, b.y + b.h * 0.5), P(cx + b.w * 0.18, b.y + b.h * 0.3), P(cx + b.w * 0.18, b.y)],
      { close: true, fill: '#6a8f9a', fillAlpha: 0.45, w: 1.6 },
    )
    pen.rect(b.x + b.w * 0.1, b.y + b.h * 0.6, b.w * 0.8, b.h * 0.24, { fill: pal.paper, w: 1 })
    pen.rect(cx - b.w * 0.22, b.y - 4, b.w * 0.44, 5, { fill: WOOD, w: 1 })
  },

  door({ pen, b, pal }) {
    const r = b.w / 2
    pen.stroke([P(b.x, b.y + b.h), P(b.x, b.y + r), P(b.x + r * 0.3, b.y + r * 0.3), P(b.x + r, b.y), P(b.x + r * 1.7, b.y + r * 0.3), P(b.x + b.w, b.y + r), P(b.x + b.w, b.y + b.h)], {
      close: true,
      fill: '#5c3d2a',
      fillAlpha: 0.75,
      w: 1.6,
    })
    pen.ellipse(b.x + b.w * 0.75, b.y + b.h * 0.6, Math.max(1, b.w * 0.07), Math.max(1, b.w * 0.07), { fill: pal.gold, w: 0.8 })
  },

  lift({ pen, b, ent }) {
    const broken = !ent.kind.vehicle
    pen.rect(b.x, b.y, b.w, b.h, { fill: IRON, fillAlpha: 0.5, w: 2 })
    for (const cx of [b.x + 10, b.x + b.w - 10]) {
      if (broken) {
        pen.stroke([P(cx, b.y), P(cx + 6, b.y - 30), P(cx - 2, b.y - 52)], { w: 1.4, alpha: 0.7 })
      } else {
        pen.line(cx, b.y, cx, b.y - 600, { w: 1.4, alpha: 0.7, plain: true })
      }
    }
  },

  bed({ pen, b, pal }) {
    pen.rect(b.x, b.y + b.h * 0.35, b.w, b.h * 0.65, { fill: '#c9b48c', fillAlpha: 0.6, w: 2 })
    pen.rect(b.x - 4, b.y - b.h * 0.6, 10, b.h * 1.6, { fill: WOOD, fillAlpha: 0.7, w: 1.6 })
    pen.ellipse(b.x + 26, b.y + b.h * 0.32, 18, 8, { fill: pal.paper, w: 1.4 })
  },
}

/** The marks a name leaves: frost, cracks, wings, a ribbon, a glow… */
export function adjOverlay(a: ArtCtx, name: string): void {
  const adj = ADJECTIVES[name]
  if (!adj) return
  const { pen, c, b, t, ent } = a
  const cx = b.x + b.w / 2
  const bot = b.y + b.h
  if (adj.freezes && ent.kind.art !== 'canal') {
    c.save()
    c.globalAlpha = 0.38
    c.fillStyle = ICE
    c.fillRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6)
    c.restore()
    pen.rect(b.x - 3, b.y - 3, b.w + 6, b.h + 6, { w: 1.2, color: '#6aa6c0', alpha: 0.8 })
    for (let x = b.x + 6; x < b.x + b.w - 4; x += 14) {
      const len = 6 + ((x * 7) % 9)
      pen.stroke([P(x - 3, bot + 3), P(x, bot + 3 + len), P(x + 3, bot + 3)], { close: true, fill: ICE, w: 0.8, color: '#6aa6c0' })
    }
  }
  if (adj.breaks) {
    pen.stroke([P(b.x + b.w * 0.2, b.y), P(b.x + b.w * 0.45, b.y + b.h * 0.35), P(b.x + b.w * 0.35, b.y + b.h * 0.55), P(b.x + b.w * 0.6, b.y + b.h)], { w: 2.2, color: '#5a1f16', alpha: 0.85 })
    pen.line(b.x + b.w * 0.45, b.y + b.h * 0.35, b.x + b.w * 0.7, b.y + b.h * 0.3, { w: 1.4, color: '#5a1f16', alpha: 0.7 })
  }
  if (adj.tames && ent.kind.platform) {
    const hx = b.x + 4
    const y = b.y + 8 + Math.sin(t * 2) * 2
    pen.stroke([P(hx, y + 6), P(hx - 7, y - 1), P(hx - 3, y - 6), P(hx, y - 2), P(hx + 3, y - 6), P(hx + 7, y - 1)], { close: true, fill: '#c0506a', w: 1 })
  }
  if (adj.sleeps) {
    c.save()
    c.fillStyle = a.pal.ink
    c.textAlign = 'center'
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1
      c.globalAlpha = 1 - k
      c.font = `${12 + i * 4}px ${a.font}`
      c.fillText('z', cx + 10 + k * 18 + i * 6, b.y - 6 - k * 26)
    }
    c.restore()
  }
  if (adj.burns) {
    for (let i = 0; i < Math.max(2, Math.round(b.w / 26)); i++) {
      const x = b.x + 10 + (i * (b.w - 20)) / Math.max(1, Math.round(b.w / 26) - 1)
      const fl = 14 + Math.sin(t * 9 + i * 2) * 5
      pen.stroke([P(x - 7, b.y + 4), P(x - 3, b.y - fl * 0.6), P(x, b.y - fl), P(x + 4, b.y - fl * 0.5), P(x + 7, b.y + 4)], { close: true, fill: a.pal.fire, fillAlpha: 0.75, w: 1.2 })
    }
  }
  if (adj.light && ent.light > 0) {
    const g = c.createRadialGradient(cx, b.y + b.h / 2, 2, cx, b.y + b.h / 2, Math.max(b.w, b.h))
    g.addColorStop(0, `rgba(245,217,138,${0.35 + Math.sin(t * 3) * 0.05})`)
    g.addColorStop(1, 'rgba(245,217,138,0)')
    c.fillStyle = g
    c.fillRect(cx - Math.max(b.w, b.h), b.y + b.h / 2 - Math.max(b.w, b.h), Math.max(b.w, b.h) * 2, Math.max(b.w, b.h) * 2)
  }
  if (adj.flies) {
    const flap = Math.sin(t * 10) * 8
    for (const s of [-1, 1]) {
      const x = s < 0 ? b.x : b.x + b.w
      pen.stroke([P(x, b.y + 6), P(x + s * 26, b.y - 10 - flap), P(x + s * 18, b.y + 4), P(x + s * 30, b.y + 2 - flap * 0.5), P(x, b.y + 12)], { close: true, fill: a.pal.paper, w: 1.4 })
    }
  }
  if (adj.bouncy) {
    const coil: Pt[] = []
    for (let i = 0; i <= 8; i++) coil.push(P(cx + (i % 2 ? 10 : -10), bot - (i * b.h * 0.6) / 8))
    pen.stroke(coil, { w: 1.6, color: '#7a3466', alpha: 0.8, plain: true })
  }
  if (adj.speed !== undefined && adj.speed > 1 && ent.veh) {
    for (let i = 0; i < 3; i++) pen.line(b.x - 10 - i * 6, b.y + b.h * (0.3 + i * 0.2), b.x - 30 - i * 10, b.y + b.h * (0.3 + i * 0.2), { w: 1.2, alpha: 0.6, plain: true })
  }
  if (adj.loud || adj.hushes) {
    for (let i = 0; i < 2; i++) pen.ellipse(b.x + b.w + 4, b.y + b.h / 2, 8 + i * 7, 10 + i * 8, { from: -0.9, to: 0.9, w: 1.4, alpha: adj.loud ? 0.8 : 0.3 })
    if (adj.hushes) pen.line(b.x + b.w + 2, b.y + b.h / 2 + 14, b.x + b.w + 22, b.y + b.h / 2 - 14, { w: 1.8, color: '#9b3b2e' })
  }
}
