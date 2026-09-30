/**
 * A wobbly ink pen. Every stroke is jittered from a seed; the seed shifts a few
 * times a second ("line boil"), which gives the hand-drawn, alive look.
 */

export interface Pt {
  x: number
  y: number
}

export interface StrokeOpts {
  w?: number
  color?: string
  alpha?: number
  close?: boolean
  fill?: string
  fillAlpha?: number
  /** Jitter amount in px (default: pen.wobble). */
  wob?: number
  /** Skip the second, lighter texture pass. */
  plain?: boolean
}

export class Pen {
  ctx: CanvasRenderingContext2D
  boil = 0
  wobble = 1.2
  ink = '#1e1914'
  private s = 1

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  seed(n: number): void {
    this.s = (Math.imul(n | 0, 2654435761) ^ Math.imul(this.boil + 1, 40503)) >>> 0 || 1
  }

  rnd(): number {
    let t = (this.s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  jit(a = this.wobble): number {
    return (this.rnd() - 0.5) * 2 * a
  }

  /** Subdivides a polyline and jitters the interior points. */
  private rough(points: Pt[], wob: number, close: boolean): Pt[] {
    const out: Pt[] = []
    const pts = close ? [...points, points[0]] : points
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      const n = Math.max(1, Math.round(len / 16))
      for (let k = 0; k < n; k++) {
        const t = k / n
        const j = k === 0 && i === 0 && !close ? wob * 0.3 : wob
        out.push({ x: a.x + (b.x - a.x) * t + this.jit(j), y: a.y + (b.y - a.y) * t + this.jit(j) })
      }
    }
    const last = pts[pts.length - 1]
    out.push({ x: last.x + this.jit(wob * 0.3), y: last.y + this.jit(wob * 0.3) })
    return out
  }

  private trace(pts: Pt[]): void {
    const c = this.ctx
    c.beginPath()
    c.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2
      const my = (pts[i].y + pts[i + 1].y) / 2
      c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
    }
    const l = pts[pts.length - 1]
    c.lineTo(l.x, l.y)
  }

  stroke(points: Pt[], o: StrokeOpts = {}): void {
    if (points.length < 2) return
    const c = this.ctx
    const wob = o.wob ?? this.wobble
    const pts = this.rough(points, wob, !!o.close)
    c.save()
    c.lineCap = 'round'
    c.lineJoin = 'round'
    if (o.fill) {
      this.trace(pts)
      c.closePath()
      c.globalAlpha = (o.alpha ?? 1) * (o.fillAlpha ?? 1)
      c.fillStyle = o.fill
      c.fill()
    }
    if (o.w !== 0) {
      c.globalAlpha = o.alpha ?? 1
      c.strokeStyle = o.color ?? this.ink
      c.lineWidth = o.w ?? 2
      this.trace(pts)
      if (o.close) c.closePath()
      c.stroke()
      if (!o.plain) {
        c.globalAlpha = (o.alpha ?? 1) * 0.28
        c.lineWidth = Math.max(0.6, (o.w ?? 2) * 0.45)
        this.trace(this.rough(points, wob * 1.4, !!o.close))
        c.stroke()
      }
    }
    c.restore()
  }

  line(x1: number, y1: number, x2: number, y2: number, o: StrokeOpts = {}): void {
    this.stroke(
      [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ],
      o,
    )
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, o: StrokeOpts & { from?: number; to?: number } = {}): void {
    const from = o.from ?? 0
    const to = o.to ?? Math.PI * 2
    const full = o.from === undefined && o.to === undefined
    const n = Math.max(10, Math.round(((rx + ry) * Math.abs(to - from)) / 14))
    const pts: Pt[] = []
    for (let i = 0; i <= (full ? n - 1 : n); i++) {
      const a = from + ((to - from) * i) / n
      pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
    }
    this.stroke(pts, { ...o, close: full })
  }

  rect(x: number, y: number, w: number, h: number, o: StrokeOpts = {}): void {
    this.stroke(
      [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ],
      { ...o, close: true },
    )
  }

  /** Diagonal hatching clipped to a rectangle. */
  hatch(x: number, y: number, w: number, h: number, o: { gap?: number; color?: string; alpha?: number; w?: number; slope?: number } = {}): void {
    const c = this.ctx
    const gap = o.gap ?? 9
    const slope = o.slope ?? 0.8
    c.save()
    c.beginPath()
    c.rect(x, y, w, h)
    c.clip()
    c.strokeStyle = o.color ?? this.ink
    c.globalAlpha = o.alpha ?? 0.18
    c.lineWidth = o.w ?? 1
    c.beginPath()
    const start = Math.floor((x - h * slope) / gap) * gap
    for (let sx = start; sx < x + w; sx += gap) {
      const j = this.jit(1.5)
      c.moveTo(sx + j, y + h)
      c.lineTo(sx + h * slope + this.jit(1.5), y)
    }
    c.stroke()
    c.restore()
  }
}
