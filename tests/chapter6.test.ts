import { beforeAll, describe, expect, it } from 'vitest'
import { NO_INPUT } from '../src/game/types'
import { World } from '../src/game/world'
import { levelById } from '../src/levels'
import { Bot, loadDictionary } from './helpers'

beforeAll(loadDictionary)

function play(id: string): Bot {
  return new Bot(new World(levelById(id)!))
}

function idle(w: World, seconds: number): void {
  for (let t = 0; t < seconds; t += 1 / 120) w.step(1 / 120, NO_INPUT)
}

/** Jumps onto something BOUNCY at `on`, then steers toward x until the Reader lands at height `y`. */
function bounceTo(b: Bot, on: number, x: number, y: number): void {
  const steer = (tx: number) => {
    const d = tx - b.w.player.x
    return Math.abs(d) < 4 ? {} : d > 0 ? { right: true } : { left: true }
  }
  b.tick({ ...steer(on), jump: true, jumpPressed: true })
  for (let t = 0; !b.w.player.boost; t += 1 / 120) {
    if (t > 3) throw new Error(`never bounced (x=${b.w.player.x.toFixed(1)})`)
    b.tick({ ...steer(on), jump: true })
  }
  for (let t = 0; t < 6 && !(b.w.player.grounded && Math.abs(b.w.player.y - y) < 1); t += 1 / 120) b.tick({ ...steer(x), jump: true })
  if (!(b.w.player.grounded && Math.abs(b.w.player.y - y) < 1)) throw new Error(`bounce never landed at y=${y} (x=${b.w.player.x.toFixed(1)} y=${b.w.player.y.toFixed(1)})`)
  b.hold({}, (w) => Math.abs(w.player.vx) < 1, 2, 'settle')
}

describe('chapter VI rules', () => {
  it('folds two words into one; the other is gone', () => {
    const w = new World(levelById('6-1')!)
    w.player.x = 600
    expect(w.foldPartners('rain')).toContain('bow')
    expect(w.foldWords('rain', 'bow', 'after')).toBe(true)
    expect(w.entityOf('rain')!.text).toBe('RAINBOW')
    expect(w.entityOf('rain')!.kind.platform).toBe(true)
    expect(w.entityOf('bow')).toBeNull()
    expect(w.edits).toBe(1)
  })

  it('the wrong order is nonsense', () => {
    const w = new World(levelById('6-1')!)
    w.player.x = 600
    w.foldWords('rain', 'bow', 'before')
    expect(w.entityOf('rain')!.text).toBe('BOWRAIN')
    expect(w.entityOf('rain')!.kind.scribble).toBe(true)
  })

  it('undo unfolds', () => {
    const w = new World(levelById('6-1')!)
    w.player.x = 600
    w.foldWords('rain', 'bow', 'after')
    expect(w.undo()).toBe(true)
    expect(w.entityOf('rain')!.text).toBe('RAIN')
    expect(w.entityOf('bow')!.text).toBe('BOW')
    expect(w.edits).toBe(0)
  })

  it('words too far apart cannot fold, unless they face each other across the crease', () => {
    const w = new World(levelById('6-2')!)
    w.player.x = 2060
    expect(w.canFoldWith('flower', 'shell')).toBe('apart')
    expect(w.meetsAcross('flower', 'sun')).toBe(true)
    expect(w.canFoldWith('flower', 'sun')).toBeNull()
    // From the other side, the flower is out of reach, but the sun is near and facing it.
    w.player.x = 345
    expect(w.canFoldWith('flower', 'sun')).toBeNull()
  })

  it('SEASHELL uncovers the diary page', () => {
    const w = new World(levelById('6-2')!)
    w.player.x = 1700
    expect(w.diaryVisible).toBe(false)
    expect(w.foldWords('shell', 'sea', 'before')).toBe(true)
    expect(w.diaryVisible).toBe(true)
  })

  it('the Blot will not be folded into nonsense, and an INKBLOT is only a picture', () => {
    const w = new World(levelById('6-5')!)
    w.player.x = 2200
    w.player.y = 280
    while (!w.meetsAcross('blot', 'ink')) idle(w, 0.05)
    expect(w.foldWords('blot', 'ink', 'after')).toBe(false)
    expect(w.foldWords('blot', 'ink', 'before')).toBe(true)
    expect(w.isInkblot).toBe(true)
    const front = w.blotFront
    idle(w, 3)
    expect(w.blotFront).toBe(front)
  })
})

describe('chapter VI playthroughs', () => {
  it('6-1 Low Tide', () => {
    const b = play('6-1')
    b.walkTo(600)
    b.edit({ type: 'fold', word: 'rain', other: 'bow', order: 'after' })
    b.walkTo(1600)
    b.edit({ type: 'fold', word: 'weed', other: 'sea', order: 'before' })
    b.walkTo(1680)
    b.climbTo(150)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 160, 3, 'onto the cliff')
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('6-2 The Gutter (with the diary)', () => {
    const b = play('6-2')
    b.walkTo(540)
    b.edit({ type: 'fold', word: 'jelly', other: 'fish', order: 'after' })
    b.walkTo(520)
    bounceTo(b, 600, 760, 280)
    b.walkTo(1140)
    b.jumpTo(1300)
    b.walkTo(1700)
    b.edit({ type: 'fold', word: 'shell', other: 'sea', order: 'before' })
    b.walkTo(1740)
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(1990)
    b.edit({ type: 'fold', word: 'flower', other: 'sun', order: 'before' })
    b.walkTo(2055)
    b.climbTo(130)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 140, 3, 'onto the cliff')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('6-3 Night Fishing', () => {
    const b = play('6-3')
    b.walkTo(300)
    b.edit({ type: 'fold', word: 'fire', other: 'fly', order: 'after' })
    b.walkTo(760)
    b.hold({}, (w) => w.canEdit('hoarse') === null, 15, 'the firefly lights the horse')
    b.edit({ type: 'pluck', word: 'hoarse', index: 2 })
    b.hold({}, (w) => w.canFoldWith('hoarse', 'sea') === null, 20, 'the firefly lights the sea')
    b.edit({ type: 'fold', word: 'hoarse', other: 'sea', order: 'before' })
    const ride = b.w.entityOf('hoarse')!
    b.hold({}, () => ride.veh!.s === 0 && ride.veh!.wait > 0.4, 5, 'seahorse waiting')
    b.walkTo(840)
    expect(b.w.player.ground).toBe(ride)
    b.hold({}, () => ride.veh!.s >= 1, 15, 'across the sea')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('6-4 The Folded Sky', () => {
    const b = play('6-4')
    b.walkTo(240)
    b.edit({ type: 'fold', word: 'jelly', other: 'fish', order: 'after' })
    bounceTo(b, 300, 420, 700)
    b.walkTo(680)
    b.edit({ type: 'fold', word: 'weed', other: 'sea', order: 'before' })
    b.walkTo(780)
    b.climbTo(390)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 400, 3, 'onto the cloud')
    b.walkTo(1200)
    expect(b.w.canEdit('sun')).toBe('far')
    b.edit({ type: 'fold', word: 'flower', other: 'sun', order: 'before' })
    b.walkTo(1275)
    b.climbTo(70)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 80, 3, 'onto the top cloud')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('6-5 The Inkblot (folded across the gutter)', () => {
    const b = play('6-5')
    b.walkTo(600)
    b.edit({ type: 'fold', word: 'rain', other: 'bow', order: 'after' })
    b.walkTo(1440)
    b.jumpTo(1600)
    b.walkTo(2060)
    b.edit({ type: 'fold', word: 'weed', other: 'sea', order: 'before' })
    b.walkTo(2130)
    b.climbTo(270)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 280, 3, 'onto the rock')
    b.hold({}, (w) => w.canFoldWith('blot', 'ink') === null, 15, 'the Blot facing the ink')
    expect(b.w.blotFront).toBeLessThan(1500)
    b.edit({ type: 'fold', word: 'blot', other: 'ink', order: 'before' })
    expect(b.w.isInkblot).toBe(true)
    b.finish()
    expect(b.w.edits).toBe(3)
  })
})

describe('chapter VI: the last page', () => {
  it('6-5: running past the ink gets you nowhere; the page will not turn while the Blot comes', () => {
    const b = play('6-5')
    b.walkTo(600)
    b.edit({ type: 'fold', word: 'rain', other: 'bow', order: 'after' })
    b.walkTo(1440)
    b.jumpTo(1600)
    expect(() => b.finish(30)).toThrow(/died/)
  })
})
