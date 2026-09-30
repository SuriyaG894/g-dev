export type ParticleKind = 'drop' | 'letter' | 'spark' | 'stain'

export interface Particle {
  kind: ParticleKind
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  r: number
  color: string
  text?: string
  gravity: number
}

/** World-space ink drops, flying letters and sparks. */
export class Particles {
  list: Particle[] = []

  add(p: Partial<Particle> & { x: number; y: number }): void {
    const life = p.life ?? 0.8
    this.list.push({
      kind: 'drop',
      vx: 0,
      vy: 0,
      r: 3,
      color: '#1e1914',
      gravity: 900,
      ...p,
      life,
      max: life,
    })
    if (this.list.length > 600) this.list.splice(0, this.list.length - 600)
  }

  splash(x: number, y: number, n: number, color = '#1e1914', power = 260): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = power * (0.3 + Math.random() * 0.7)
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - power * 0.4, r: 1.5 + Math.random() * 3, color, life: 0.5 + Math.random() * 0.6 })
    }
  }

  sparkle(x: number, y: number, n: number, color = '#f5d98a'): void {
    for (let i = 0; i < n; i++) {
      this.add({
        kind: 'spark',
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 70,
        r: 1.5 + Math.random() * 2,
        color,
        gravity: 0,
        life: 0.6 + Math.random() * 0.8,
      })
    }
  }

  letter(x: number, y: number, text: string, color = '#1e1914'): void {
    this.add({ kind: 'letter', x, y, vx: (Math.random() - 0.5) * 40, vy: -90, text, color, gravity: 60, life: 1.1, r: 22 })
  }

  update(dt: number): void {
    for (const p of this.list) {
      p.life -= dt
      p.vy += p.gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.kind === 'drop') p.vx *= 1 - dt * 1.5
    }
    this.list = this.list.filter((p) => p.life > 0)
  }

  clear(): void {
    this.list = []
  }

  draw(c: CanvasRenderingContext2D, font: string): void {
    for (const p of this.list) {
      const a = Math.max(0, p.life / p.max)
      c.globalAlpha = p.kind === 'spark' ? a * (0.6 + Math.random() * 0.4) : Math.min(1, a * 1.6)
      c.fillStyle = p.color
      if (p.kind === 'letter') {
        c.font = `${p.r}px ${font}`
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillText(p.text ?? '', p.x, p.y)
      } else {
        c.beginPath()
        c.arc(p.x, p.y, p.r * (p.kind === 'spark' ? 1 : 0.6 + a * 0.4), 0, Math.PI * 2)
        c.fill()
      }
    }
    c.globalAlpha = 1
  }
}
