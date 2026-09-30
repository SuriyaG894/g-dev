import { beforeAll, describe, expect, it } from 'vitest'
import { World, type Entity } from '../src/game/world'
import { levelById } from '../src/levels'
import { Bot, loadDictionary } from './helpers'

beforeAll(loadDictionary)

function play(id: string): Bot {
  return new Bot(new World(levelById(id)!))
}

function ent(b: Bot, id: string): Entity {
  return b.w.words.get(id)!.ent
}

/** Waits for a shuttle to be parked at its starting end, then boards it. */
function board(b: Bot, id: string, dir: 1 | -1 = 1): Entity {
  const e = ent(b, id)
  b.hold({}, () => e.veh!.s === 0 && e.veh!.wait > 0.5, 20, `${id} parked`)
  b.hold(dir > 0 ? { right: true } : { left: true }, (w) => w.player.ground === e, 3, `board ${id}`)
  return e
}

describe('chapter II rules', () => {
  it('rain raises the pool and the raft floats up with it', () => {
    const w = new World(levelById('2-1')!)
    w.player.x = 480
    const pool = w.pools[0]
    expect(pool.surface).toBe(470)
    expect(w.pluckLetter('draft', 0)).toBe(true)
    const raft = w.words.get('draft')!.ent
    expect(raft.box.y + raft.box.h - 8).toBeCloseTo(470)
    expect(w.pluckLetter('train', 0)).toBe(true)
    for (let i = 0; i < 400; i++) w.step(1 / 120, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, upPressed: false })
    expect(pool.surface).toBe(310)
    expect(raft.box.y).toBeCloseTo(310 - 26 + 8)
  })

  it('lost letters go into the quill, and undo gives them back to the air', () => {
    const b = play('2-4')
    b.walkTo(150)
    expect(b.w.quill).toEqual(['S'])
    b.walkTo(215)
    b.edit({ type: 'place', word: 'book', index: 4, letter: 'S' })
    expect(b.w.quill).toEqual([])
    b.w.undo()
    expect(b.w.quill).toEqual(['S'])
    expect(b.w.freeLetters()).toHaveLength(0)
  })

  it('the Librarian hunts noise and silences it', () => {
    const b = play('2-4')
    const lib = ent(b, 'librarian')
    b.w.player.x = 640
    b.w.player.y = 460
    b.edit({ type: 'pluck', word: 'bring', index: 0 })
    b.w.player.x = 90 // stay out of its way
    b.hold({}, () => lib.guard!.state === 'shush', 15, 'shush')
    b.hold({}, (w) => w.words.get('bring')!.text === 'HUSH', 4, 'silenced')
    b.hold({}, () => lib.guard!.state === 'post', 30, 'back at post')
  })

  it('gold words refuse the quill', () => {
    const w = new World(levelById('2-1')!)
    w.player.x = 190
    expect(w.canEdit('silence')).toBe('gold')
  })

  it('the flood rises only while FLOOD exists, and FLOOR floats where it stopped', () => {
    const w = new World(levelById('2-5')!)
    const pool = w.pools[0]
    const idle = { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, upPressed: false }
    for (let i = 0; i < 120 * 8; i++) w.step(1 / 120, idle)
    const before = pool.base
    expect(before).toBeLessThan(1700)
    // The Reader is still standing on the (just dry) floor, right by the FLOOD label.
    // Pretend they have an R.
    w.quill.push('R')
    expect(w.pluckLetter('flood', 4)).toBe(true)
    for (let i = 0; i < 240; i++) w.step(1 / 120, idle)
    expect(pool.base).toBe(before)
    expect(w.placeLetter('flood', 4, w.quill.indexOf('R'))).toBe(true)
    const floor = w.words.get('flood')!.ent
    expect(floor.kind.solid).toBe(true)
    expect(floor.box.y).toBeCloseTo(pool.surface - 22)
  })
})

describe('chapter II playthroughs', () => {
  it('2-1 The Reading Room', () => {
    const b = play('2-1')
    b.walkTo(480)
    b.edit({ type: 'pluck', word: 'draft', index: 0 }) // RAFT
    b.edit({ type: 'pluck', word: 'train', index: 0 }) // RAIN
    b.hold({}, (w) => w.pools[0].surface <= 311, 5, 'water rises')
    const raft = board(b, 'draft')
    b.hold({}, () => raft.veh!.s >= 1, 15, 'crossing')
    b.hold({ right: true }, (w) => w.player.x > 1760 && w.player.ground === 'terrain', 3, 'far shelf')
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('2-2 The Stacks', () => {
    const b = play('2-2')
    b.walkTo(505)
    b.hold({}, (w) => w.canEdit('eels') === null, 15, 'eels in reach')
    b.edit({ type: 'pluck', word: 'eels', index: 3 }) // EEL
    b.edit({ type: 'place', word: 'ink', index: 0, letter: 'S' }) // SINK
    b.hold({}, (w) => w.pools[0].surface >= 499, 5, 'drained')
    const eel = ent(b, 'eels')
    // Drop in, wait for the eel to come flopping toward you, hop it, then run.
    b.walkTo(640)
    b.hold({}, () => eel.veh!.s === 0 && eel.veh!.wait > 0.6, 20, 'eel resting at its turn')
    b.jump(1, 0.35)
    b.walkTo(1800)
    b.jumpTo(1860)
    b.jumpTo(1960)
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('2-3 The Archive of Lost Words', () => {
    const b = play('2-3')
    b.walkTo(490)
    b.jumpTo(700)
    expect(b.w.quill).toEqual(['P'])
    b.walkTo(800)
    b.edit({ type: 'pluck', word: 'cage', index: 0 }) // AGE
    b.edit({ type: 'place', word: 'cage', index: 0, letter: 'P' }) // PAGE
    const page = ent(b, 'cage')
    b.walkTo(850)
    expect(b.w.player.ground).toBe(page)
    b.hold({}, () => page.veh!.s >= 1, 10, 'lift')
    b.hold({ right: true }, (w) => w.player.x > 930 && w.player.ground === 'terrain', 3, 'top shelf')
    b.walkTo(1200)
    b.jumpUp()
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(1480)
    b.edit({ type: 'place', word: 'row', index: 0, letter: 'C' }) // CROW
    const crow = board(b, 'row')
    b.hold({}, () => crow.veh!.s >= 1, 10, 'flight')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('2-4 The Librarian', () => {
    const b = play('2-4')
    b.walkTo(150)
    b.walkTo(215)
    b.edit({ type: 'place', word: 'book', index: 4, letter: 'S' }) // BOOKS
    b.jumpTo(262)
    b.jumpTo(340)
    expect(b.w.player.y).toBe(320)
    b.walkTo(640)
    b.edit({ type: 'pluck', word: 'bring', index: 0 }) // RING
    const lib = ent(b, 'librarian')
    b.hold({}, () => lib.guard!.state === 'shush', 15, 'lured below')
    b.finish(15)
    expect(b.w.edits).toBe(2)
  })

  it('2-4: ringing from the floor leaves the Librarian between you and the exit', () => {
    const b = play('2-4')
    b.w.player.x = 600
    b.edit({ type: 'pluck', word: 'bring', index: 0 })
    const lib = ent(b, 'librarian')
    b.hold({}, () => lib.guard!.state === 'return', 20, 'returning')
    expect(() => b.finish(30)).toThrow(/died/)
  })

  it('2-5 The Flood', () => {
    const b = play('2-5')
    b.walkTo(200)
    b.edit({ type: 'pluck', word: 'trope', index: 0 }) // ROPE
    b.walkTo(300)
    b.climbTo(1178)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 1200, 3, 'onto L1')
    b.walkTo(450)
    b.edit({ type: 'place', word: 'rain', index: 0, letter: 'T' }) // TRAIN
    b.edit({ type: 'pluck', word: 'trope', index: 0 }) // OPE, keep the R
    const train = board(b, 'rain')
    b.hold({}, () => train.veh!.s >= 1, 8, 'train ride')
    b.hold({ right: true }, (w) => w.player.x > 1015 && w.player.ground === 'terrain', 3, 'landing')
    b.jumpTo(900)
    b.jumpTo(1050)
    b.jumpTo(930)
    b.walkTo(900)
    b.jumpUp()
    expect(b.w.quill).toEqual(['R', 'L'])
    b.walkTo(540)
    b.edit({ type: 'place', word: 'adder', index: 0, letter: 'L' }) // LADDER
    b.walkTo(460)
    b.climbTo(678)
    b.hold({ left: true }, (w) => w.player.grounded && w.player.y === 700, 3, 'onto L4')
    b.walkTo(150)
    b.hold({}, (w) => w.pools[0].surface <= 750, 40, 'water close')
    b.edit({ type: 'pluck', word: 'flood', index: 4 }) // FLOO
    expect(b.w.rising).toBe(false)
    b.edit({ type: 'place', word: 'flood', index: 4, letter: 'R' }) // FLOOR
    b.walkTo(700)
    b.jumpTo(880)
    b.finish()
    expect(b.w.edits).toBe(6)
  })
})
