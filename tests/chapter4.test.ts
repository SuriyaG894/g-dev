import { beforeAll, describe, expect, it } from 'vitest'
import { NO_INPUT } from '../src/game/types'
import { World, type Entity } from '../src/game/world'
import { levelById } from '../src/levels'
import { Bot, loadDictionary } from './helpers'

beforeAll(loadDictionary)

function play(id: string): Bot {
  return new Bot(new World(levelById(id)!))
}

function ent(b: Bot, id: string): Entity {
  return b.w.entityOf(id)!
}

function idle(w: World, seconds: number): void {
  for (let t = 0; t < seconds; t += 1 / 120) w.step(1 / 120, NO_INPUT)
}

describe('chapter IV rules', () => {
  it('a mirage is harmless and hollow until it is turned the right way round', () => {
    const w = new World(levelById('4-1')!)
    const m = w.entityOf('egdirb')!
    expect(m.kind.mirage).toBe(true)
    expect(m.kind.hazard).toBeFalsy()
    expect(m.mirrorOf).toBe('BRIDGE')
    w.player.x = 780
    expect(w.mirrorWord('egdirb')).toBe(true)
    expect(w.entityOf('egdirb')!.text).toBe('BRIDGE')
    // And back again: a real bridge in a mirror is a mirage once more.
    expect(w.mirrorWord('egdirb')).toBe(true)
    expect(w.entityOf('egdirb')!.kind.mirage).toBe(true)
  })

  it('swaps trade two letters, and refuses to swap a letter with its twin', () => {
    const w = new World(levelById('4-2')!)
    w.player.x = 640
    expect(w.swapLetters('salt', 1, 2)).toBe(true)
    expect(w.entityOf('salt')!.text).toBe('SLAT')
    expect(w.edits).toBe(1)
    w.player.x = 1440
    expect(w.swapLetters('lemon', 1, 1)).toBe(false)
    expect(w.events.some((e) => e.type === 'refused' && e.reason === 'same')).toBe(true)
  })

  it('DAIRY → DIARY uncovers the diary page', () => {
    const w = new World(levelById('4-2')!)
    expect(w.diaryVisible).toBe(false)
    w.player.x = 1060
    w.swapLetters('dairy', 1, 2)
    expect(w.diaryVisible).toBe(true)
  })

  it('the Sphinx will not move until both answers exist', () => {
    const w = new World(levelById('4-4')!)
    w.player.x = 1500
    idle(w, 0.1)
    expect(w.riddlesSolved('sphinx')).toBe(0)
    expect(w.solids().some((s) => s.ent?.text === 'SPHINX')).toBe(true)
    w.player.x = 760
    w.mirrorWord('emit')
    w.player.x = 1500
    idle(w, 0.1)
    expect(w.riddlesSolved('sphinx')).toBe(1)
    w.player.x = 1380
    w.swapLetters('icon', 0, 1)
    w.swapLetters('icon', 1, 2)
    idle(w, 0.1)
    expect(w.riddlesSolved('sphinx')).toBe(2)
    expect(w.solids().some((s) => s.ent?.text === 'SPHINX')).toBe(false)
  })

  it('a STOP sign halts the sandstorm', () => {
    const w = new World(levelById('4-5')!)
    w.player.x = 200
    expect(w.swapLetters('spot', 1, 3)).toBe(true)
    idle(w, 12)
    expect(w.blotFront).toBe(-220)
    expect(w.dead).toBe(false)
  })
})

describe('chapter IV playthroughs', () => {
  it('4-1 Mirage', () => {
    const b = play('4-1')
    b.walkTo(780)
    b.edit({ type: 'mirror', word: 'egdirb' }) // BRIDGE
    b.walkTo(1560)
    b.edit({ type: 'mirror', word: 'rats' }) // STAR
    b.walkTo(1660)
    b.jumpTo(1720)
    expect(b.w.player.y).toBe(360)
    b.jumpTo(1830)
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('4-2 The Swapping Sands (with the diary)', () => {
    const b = play('4-2')
    b.walkTo(640)
    b.edit({ type: 'swap', word: 'salt', i: 1, j: 2 }) // SLAT
    b.walkTo(1060)
    b.edit({ type: 'swap', word: 'dairy', i: 1, j: 2 }) // DIARY
    b.walkTo(1110)
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(1440)
    b.edit({ type: 'swap', word: 'lemon', i: 0, j: 2 }) // MELON
    b.jumpTo(1500)
    b.jumpTo(1600)
    b.finish()
    expect(b.w.edits).toBe(3) // one more than par: the diary is a detour
  })

  it('4-3 The Oasis at Night', () => {
    const b = play('4-3')
    b.walkTo(400)
    b.edit({ type: 'swap', word: 'palm', i: 0, j: 2 }) // LAPM
    b.edit({ type: 'swap', word: 'palm', i: 2, j: 3 }) // LAMP
    b.hold({}, (w) => w.canEdit('wolf') === null, 12, 'wolf in the light')
    b.edit({ type: 'mirror', word: 'wolf' }) // FLOW
    b.walkTo(1300)
    b.edit({ type: 'swap', word: 'lamp', i: 0, j: 3 }) // PAML
    b.edit({ type: 'swap', word: 'lamp', i: 2, j: 3 }) // PALM
    b.walkTo(1370)
    b.climbTo(180)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 200, 3, 'onto the ledge')
    b.finish()
    expect(b.w.edits).toBe(5)
  })

  it('4-3: in the dark, the wolf cannot be read', () => {
    const w = new World(levelById('4-3')!)
    w.player.x = 450
    expect(w.canEdit('wolf')).toBe('dark')
  })

  it('4-4 The Sphinx', () => {
    const b = play('4-4')
    b.walkTo(700)
    b.edit({ type: 'mirror', word: 'emit' }) // TIME
    b.walkTo(1060)
    const snake = ent(b, 'snake')
    b.hold({}, () => snake.veh!.s === 0 && snake.veh!.wait > 0.6, 10, 'snake resting')
    b.jumpTo(1240)
    b.walkTo(1380)
    b.edit({ type: 'swap', word: 'icon', i: 0, j: 1 }) // CION
    b.edit({ type: 'swap', word: 'icon', i: 1, j: 2 }) // COIN
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('4-4: without the answers, the Sphinx blocks the way', () => {
    const b = play('4-4')
    b.walkTo(1060)
    const snake = ent(b, 'snake')
    b.hold({}, () => snake.veh!.s === 0 && snake.veh!.wait > 0.6, 10, 'snake resting')
    b.jumpTo(1240)
    expect(() => b.finish(6)).toThrow(/timed out/)
    expect(b.w.player.x).toBeLessThan(1920)
  })

  it('4-5 The Sandstorm (outrun it)', () => {
    const b = play('4-5')
    b.walkTo(620)
    b.edit({ type: 'mirror', word: 'straw' }) // WARTS
    b.walkTo(1478)
    b.edit({ type: 'mirror', word: 'epor' }) // ROPE
    b.climbTo(261)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 280, 3, 'onto the ledge')
    b.walkTo(2190)
    b.edit({ type: 'mirror', word: 'enalp' }) // PLANE
    const plane = ent(b, 'enalp')
    b.hold({}, () => plane.veh!.s === 0 && plane.veh!.wait > 0.5, 12, 'plane parked')
    b.hold({ right: true }, (w) => w.player.ground === plane, 3, 'board')
    b.hold({}, () => plane.veh!.s >= 1, 10, 'flight')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('4-5 The Sandstorm (stop it first)', () => {
    const b = play('4-5')
    b.walkTo(200)
    b.edit({ type: 'swap', word: 'spot', i: 1, j: 3 }) // STOP
    b.wait(15) // take your time
    b.walkTo(620)
    b.edit({ type: 'mirror', word: 'straw' })
    b.walkTo(1478)
    b.edit({ type: 'mirror', word: 'epor' })
    b.climbTo(261)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 280, 3, 'onto the ledge')
    b.walkTo(2190)
    b.edit({ type: 'mirror', word: 'enalp' })
    const plane = ent(b, 'enalp')
    b.hold({}, () => plane.veh!.s === 0 && plane.veh!.wait > 0.5, 12, 'plane parked')
    b.hold({ right: true }, (w) => w.player.ground === plane, 3, 'board')
    b.hold({}, () => plane.veh!.s >= 1, 10, 'flight')
    b.finish()
    expect(b.w.edits).toBe(4)
  })
})
