import { beforeAll, describe, expect, it } from 'vitest'
import { World } from '../src/game/world'
import { levelById } from '../src/levels'
import { Bot, loadDictionary } from './helpers'

beforeAll(loadDictionary)

function play(id: string): Bot {
  return new Bot(new World(levelById(id)!))
}

/** Every page is completed through real physics, with par edits. */
describe('playthroughs', () => {
  it('1-1 The Margin', () => {
    const b = play('1-1')
    b.walkTo(640)
    b.edit({ type: 'pluck', word: 'bear', index: 0 }) // EAR
    b.walkTo(700)
    b.jump(1)
    b.walkTo(1180)
    b.edit({ type: 'pluck', word: 'bridge', index: 0 }) // RIDGE
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('1-2 Firs & Thorns', () => {
    const b = play('1-2')
    b.walkTo(560)
    b.edit({ type: 'pluck', word: 'fire', index: 3 }) // FIR
    b.walkTo(662)
    b.climbTo(260)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.x > 720, 5, 'ledge')
    b.walkTo(1080)
    b.edit({ type: 'pluck', word: 'climb', index: 0 }) // LIMB
    b.walkTo(1700)
    b.edit({ type: 'pluck', word: 'thorns', index: 5 }) // THORN
    b.walkTo(1850)
    b.jump(1)
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('1-3 The Knight’s Crossing', () => {
    const b = play('1-3')
    b.walkTo(870)
    b.edit({ type: 'pluck', word: 'knight', index: 0 }) // NIGHT
    expect(b.w.isDark).toBe(true)
    b.walkTo(1555)
    expect(b.w.diaryTaken).toBe(true)
    b.edit({ type: 'pluck', word: 'clamp', index: 0 }) // LAMP
    b.walkTo(1680)
    b.edit({ type: 'pluck', word: 'stream', index: 2 }) // STEAM
    b.hold({ right: true }, (w) => w.player.grounded && w.player.x > 1960, 8, 'ride the steam')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('1-3 alternative: climb the stem', () => {
    const b = play('1-3')
    b.walkTo(870)
    b.edit({ type: 'pluck', word: 'knight', index: 0 })
    b.walkTo(1555)
    b.edit({ type: 'pluck', word: 'clamp', index: 0 })
    b.walkTo(1680)
    b.edit({ type: 'pluck', word: 'stream', index: 2 }) // STEAM
    b.edit({ type: 'pluck', word: 'stream', index: 3 }) // STEM
    b.walkTo(1690)
    b.tick({ right: true, jump: true, jumpPressed: true })
    b.hold({ right: true, jump: true, up: true }, (w) => w.player.climbing, 2, 'grab the stem')
    b.climbTo(210)
    b.tick({ right: true, jump: true, jumpPressed: true })
    b.hold({ right: true, jump: true }, (w) => w.player.grounded, 3, 'land on the cliff')
    expect(b.w.player.y).toBe(250)
    b.finish()
  })

  it('1-4 The Quill Remembers', () => {
    const b = play('1-4')
    b.walkTo(560)
    b.edit({ type: 'pluck', word: 'bloat', index: 1 }) // BOAT, L kept
    expect(b.w.quill).toEqual(['L'])
    b.walkTo(650)
    const boat = b.w.words.get('bloat')!.ent
    expect(b.w.player.ground).toBe(boat)
    b.hold({}, () => boat.veh!.s >= 1, 12, 'boat crossing')
    b.hold({ right: true }, (w) => w.player.x > 1200 && w.player.ground === 'terrain', 3, 'far bank')
    b.walkTo(1560)
    b.edit({ type: 'place', word: 'adder', index: 0, letter: 'L' }) // LADDER
    b.walkTo(1678)
    b.climbTo(260)
    b.finish()
    expect(b.w.edits).toBe(2)
  })

  it('1-5 The Blot', () => {
    const b = play('1-5')
    b.walkTo(560)
    b.edit({ type: 'pluck', word: 'stone', index: 0 }) // TONE, S kept
    b.walkTo(1250)
    b.edit({ type: 'place', word: 'lope', index: 0, letter: 'S' }) // SLOPE
    b.walkTo(1880)
    b.edit({ type: 'pluck', word: 'planet', index: 5 }) // PLANE
    const plane = b.w.words.get('planet')!.ent
    b.hold({ right: true }, (w) => w.player.ground === plane, 12, 'board the plane')
    b.hold({}, () => plane.veh!.s >= 1, 12, 'flight')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('1-5: the Blot catches anyone who dawdles', () => {
    const w = new World(levelById('1-5')!)
    let died = false
    for (let t = 0; t < 12 && !died; t += 1 / 120) {
      w.step(1 / 120, { left: false, right: false, up: false, down: false, jump: false, jumpPressed: false, upPressed: false })
      died = w.events.some((e) => e.type === 'death')
      w.events = []
    }
    expect(died).toBe(true)
  })
})
