import { readFileSync } from 'node:fs'
import { parseWords, setDictionary } from '../src/game/lexicon'
import { NO_INPUT, type Input, type Op } from '../src/game/types'
import type { World } from '../src/game/world'

export const DT = 1 / 120

export function loadDictionary(): void {
  setDictionary(parseWords(readFileSync('src/data/words.txt', 'utf8')))
}

/** Drives a World like a player would, failing loudly if the Reader dies. */
export class Bot {
  constructor(public w: World) {}

  tick(inp: Partial<Input> = {}): void {
    this.w.step(DT, { ...NO_INPUT, ...inp })
    for (const e of this.w.events) {
      if (e.type === 'death') {
        const p = this.w.player
        throw new Error(`Reader died at x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} (t=${this.w.time.toFixed(2)})`)
      }
    }
    this.w.events = []
  }

  hold(inp: Partial<Input>, until: (w: World) => boolean, maxSeconds = 20, label = 'condition'): void {
    for (let t = 0; t < maxSeconds; t += DT) {
      if (until(this.w)) return
      this.tick(inp)
    }
    const p = this.w.player
    throw new Error(`timed out waiting for ${label} at x=${p.x.toFixed(1)} y=${p.y.toFixed(1)}`)
  }

  wait(seconds: number): void {
    for (let t = 0; t < seconds; t += DT) this.tick()
  }

  walkTo(x: number): void {
    const p = () => this.w.player
    this.hold({ right: p().x < x, left: p().x > x }, (w) => Math.abs(w.player.x - x) < 6, 20, `walk to ${x}`)
    this.hold({}, (w) => Math.abs(w.player.vx) < 1 && w.player.grounded, 3, 'stop')
  }

  /** Jumps while holding a direction, then waits to land. */
  jump(dir: 1 | -1, holdSeconds = 0.35): void {
    const side = dir > 0 ? { right: true } : { left: true }
    this.tick({ ...side, jump: true, jumpPressed: true })
    for (let t = 0; t < holdSeconds; t += DT) this.tick({ ...side, jump: true })
    this.hold(side, (w) => w.player.grounded, 5, 'landing')
  }

  /** Jumps, steering toward x in the air, and waits to land. */
  jumpTo(x: number, maxSeconds = 3): void {
    const steer = () => {
      const d = x - this.w.player.x
      return Math.abs(d) < 4 ? {} : d > 0 ? { right: true } : { left: true }
    }
    this.tick({ ...steer(), jump: true, jumpPressed: true })
    for (let t = 0; t < 0.4; t += DT) this.tick({ ...steer(), jump: true })
    for (let t = 0; t < maxSeconds && !this.w.player.grounded; t += DT) this.tick(steer())
    if (!this.w.player.grounded) throw new Error(`jumpTo(${x}) never landed`)
    this.hold({}, (w) => Math.abs(w.player.vx) < 1, 2, 'settle')
  }

  jumpUp(): void {
    this.tick({ jump: true, jumpPressed: true })
    for (let t = 0; t < 0.4; t += DT) this.tick({ jump: true })
    this.hold({}, (w) => w.player.grounded, 3, 'landing')
  }

  climbTo(y: number): void {
    this.hold({ up: true }, (w) => w.player.y <= y + 1, 10, `climb to ${y}`)
  }

  edit(op: Op): void {
    if (!this.w.apply(op)) {
      const refusal = this.w.events.find((e) => e.type === 'refused')
      throw new Error(`edit refused: ${JSON.stringify(op)} ${JSON.stringify(refusal)}`)
    }
    this.w.events = []
  }

  finish(maxSeconds = 20): void {
    this.hold({ right: true }, (w) => w.complete, maxSeconds, 'page complete')
  }
}
