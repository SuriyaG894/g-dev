import { beforeAll, describe, expect, it } from 'vitest'
import { World } from '../src/game/world'
import { levelById } from '../src/levels'
import { Bot, flip, loadDictionary } from './helpers'

beforeAll(loadDictionary)

function play(id: string): Bot {
  return new Bot(new World(levelById(id)!))
}

describe('chapter VII rules', () => {
  it('a nonsense name spoils its gate until it is turned round', () => {
    const w = new World(levelById('7-3')!)
    expect(w.entityOf('gate')!.kind.scribble).toBe(true)
    w.player.x = 900
    expect(w.mirrorWord('nepo')).toBe(true)
    expect(w.fullName('gate')).toBe('OPEN GATE')
    expect(w.entityOf('gate')!.kind.solid).toBeFalsy()
    expect(w.entityOf('gate')!.kind.hazard).toBeFalsy()
  })

  it('a SHORT STAIRCASE does not reach', () => {
    const w = new World(levelById('7-4')!)
    w.player.x = 1700
    expect(w.foldWords('case', 'stair', 'before')).toBe(true)
    expect(w.fullName('case')).toBe('SHORT STAIRCASE')
    expect(w.entityOf('case')!.box.h).toBe(100)
  })

  it('DRAWER → REWARD uncovers the diary page', () => {
    const w = new World(levelById('7-4')!)
    w.player.x = 850
    expect(w.diaryVisible).toBe(false)
    w.mirrorWord('drawer')
    expect(w.diaryVisible).toBe(true)
  })
})

describe('chapter VII playthroughs', () => {
  it('7-1 Unwritten', () => {
    const b = play('7-1')
    b.walkTo(300)
    expect(b.w.quill).toEqual(['B'])
    b.walkTo(430)
    b.edit({ type: 'place', word: 'ridge', index: 0, letter: 'B' })
    b.walkTo(980)
    b.edit({ type: 'pluck', word: 'fire', index: 3 })
    b.walkTo(1250)
    b.walkTo(1380)
    b.edit({ type: 'place', word: 'adder', index: 0, letter: 'L' })
    b.walkTo(1478)
    b.climbTo(260)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 260, 3, 'onto the cliff')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('7-2 Then, Barely', () => {
    const b = play('7-2')
    flip(b)
    b.walkTo(930)
    b.edit({ type: 'pluck', word: 'clamp', index: 0 })
    b.walkTo(1200)
    b.walkTo(1420)
    b.edit({ type: 'place', word: 'corn', index: 0, letter: 'A' })
    flip(b)
    expect(b.w.entityOf('corn')!.text).toBe('OAK')
    b.hold({}, (w) => w.player.grounded, 2, 'standing Now')
    b.walkTo(1460)
    b.climbTo(150)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 160, 3, 'onto the cliff')
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('7-2: Now, the middle of the page is gone', () => {
    const b = play('7-2')
    expect(() => b.walkTo(900)).toThrow(/died/)
  })

  it('7-3 Backwards', () => {
    const b = play('7-3')
    b.walkTo(380)
    b.edit({ type: 'mirror', word: 'wolf' })
    b.walkTo(900)
    b.edit({ type: 'mirror', word: 'nepo' })
    b.walkTo(1560)
    b.edit({ type: 'mirror', word: 'stressed' })
    b.walkTo(1740)
    b.jumpTo(1820)
    expect(b.w.player.y).toBe(370)
    b.jumpTo(1960)
    expect(b.w.player.y).toBe(270)
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('7-4 Facing Pages (with the diary)', () => {
    const b = play('7-4')
    b.walkTo(850)
    b.edit({ type: 'mirror', word: 'drawer' })
    b.walkTo(900)
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(1140)
    b.jumpTo(1300)
    b.walkTo(1700)
    b.edit({ type: 'lift', word: 'short' })
    b.edit({ type: 'fold', word: 'case', other: 'stair', order: 'before' })
    b.hold({ right: true }, (w) => w.player.x > 1880 && w.player.grounded && w.player.y === 260, 4, 'up the staircase')
    b.walkTo(1950)
    b.edit({ type: 'name', word: 'gate' })
    b.jumpTo(2110)
    b.edit({ type: 'fold', word: 'mark', other: 'book', order: 'before' })
    b.walkTo(2130)
    b.climbTo(30)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 40, 3, 'onto the last ledge')
    b.finish()
    expect(b.w.edits).toBe(5)
  })

  it('7-5 The Last Page', () => {
    const b = play('7-5')
    b.walkTo(480)
    b.edit({ type: 'mirror', word: 'wolf' })
    b.walkTo(900)
    b.edit({ type: 'lift', word: 'tall' })
    b.walkTo(950)
    b.jumpTo(1060)
    b.walkTo(1300)
    b.edit({ type: 'fold', word: 'rain', other: 'bow', order: 'after' })
    b.finish(30)
    expect(b.w.edits).toBe(3)
  })
})

describe('the Past Page', () => {
  it('★1 The Ward', () => {
    const b = play('past-1')
    b.walkTo(560)
    b.edit({ type: 'pluck', word: 'boast', index: 3 })
    const boat = b.w.entityOf('boast')!
    b.hold({}, () => boat.veh!.s === 0 && boat.veh!.wait > 0.5, 4, 'boat waiting')
    b.walkTo(620)
    expect(b.w.player.ground).toBe(boat)
    b.hold({}, () => boat.veh!.s >= 1, 8, 'across')
    b.walkTo(1480)
    b.edit({ type: 'place', word: 'book', index: 4, letter: 'S' })
    b.jumpTo(1540)
    expect(b.w.player.y).toBe(390)
    b.jumpTo(1660)
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('★2 Four Minutes (with the last diary page)', () => {
    const b = play('past-2')
    flip(b)
    b.walkTo(700)
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(1380)
    b.edit({ type: 'pluck', word: 'speed', index: 1 })
    flip(b)
    expect(b.w.entityOf('speed')!.text).toBe('TREE')
    b.walkTo(1465)
    b.climbTo(150)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 160, 3, 'onto the sill')
    b.finish()
    expect(b.w.edits).toBe(1)
  })

  it('★3 In Pencil', () => {
    const b = play('past-3')
    b.walkTo(640)
    b.walkTo(1100)
    b.edit({ type: 'place', word: 'end', index: 0, letter: 'M' })
    expect(b.w.entityOf('end')!.kind.whisper).toBe(true)
    b.finish()
    expect(b.w.edits).toBe(1)
  })
})
