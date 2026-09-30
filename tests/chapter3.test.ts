import { beforeAll, describe, expect, it } from 'vitest'
import { NO_INPUT } from '../src/game/types'
import { World } from '../src/game/world'
import { levelById } from '../src/levels'
import { Bot, flip, loadDictionary, waitEra } from './helpers'

beforeAll(loadDictionary)

function play(id: string): Bot {
  return new Bot(new World(levelById(id)!))
}

describe('chapter III rules', () => {
  it('the bridge exists only Then', () => {
    const w = new World(levelById('3-1')!)
    expect(w.terrain().some((r) => r.x === 880)).toBe(false)
    expect(w.flip()).toBe(true)
    expect(w.era).toBe('past')
    expect(w.terrain().some((r) => r.x === 880)).toBe(true)
  })

  it('what lives Then can only be changed Then, and grows up by Now', () => {
    const w = new World(levelById('3-1')!)
    w.player.x = 1400
    expect(w.canEdit('speed')).toBe('echo')
    expect(w.entityOf('speed')!.text).toBe('SPEED')
    w.flip()
    expect(w.pluckLetter('speed', 1)).toBe(true)
    expect(w.entityOf('speed')!.text).toBe('SEED')
    w.flip()
    expect(w.entityOf('speed')!.text).toBe('TREE')
    expect(w.entityOf('speed')!.kind.climb).toBe(true)
    w.undo()
    expect(w.entityOf('speed')!.text).toBe('SPEED')
  })

  it('refuses to flip you into something solid', () => {
    const w = new World(levelById('3-2')!)
    w.player.x = 1600 // where the iron gate stands, Then
    expect(w.flip()).toBe(false)
    expect(w.events.some((e) => e.type === 'refused' && e.reason === 'blocked')).toBe(true)
    expect(w.era).toBe('present')
  })

  it('a cub grows into a bear, but a cube stays a cube', () => {
    const w = new World(levelById('3-2')!)
    expect(w.entityOf('cub')!.text).toBe('BEAR')
    w.flip()
    w.quill.push('E')
    w.player.x = 540
    expect(w.placeLetter('cub', 3, 0)).toBe(true)
    w.flip()
    expect(w.entityOf('cub')!.text).toBe('CUBE')
  })

  it('the midnight clock turns time on its own, until it is locked', () => {
    const w = new World(levelById('3-5')!)
    expect(w.flip()).toBe(false) // no turning by hand up here
    for (let i = 0; i < 120 * 4.6; i++) w.step(1 / 120, NO_INPUT)
    expect(w.era).toBe('past')
    w.player.x = 820
    w.player.y = 740
    expect(w.pluckLetter('clock', 0)).toBe(true) // LOCK
    const era = w.era
    for (let i = 0; i < 120 * 10; i++) w.step(1 / 120, NO_INPUT)
    expect(w.era).toBe(era)
  })
})

describe('chapter III playthroughs', () => {
  it('3-1 The Stopped Clock', () => {
    const b = play('3-1')
    b.walkTo(870)
    flip(b)
    b.walkTo(1400)
    b.edit({ type: 'pluck', word: 'speed', index: 1 }) // SEED
    flip(b)
    b.walkTo(1515)
    b.climbTo(260)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 300, 3, 'onto the cliff')
    b.finish()
    expect(b.w.edits).toBe(1)
  })

  it('3-2 Iron & Rust', () => {
    const b = play('3-2')
    flip(b)
    b.walkTo(320)
    expect(b.w.quill).toEqual(['E'])
    b.walkTo(540)
    b.edit({ type: 'place', word: 'cub', index: 3, letter: 'E' }) // CUBE
    b.jumpTo(630)
    b.jumpTo(740)
    b.hold({ right: true }, (w) => w.player.x > 1420 && w.player.y === 460 && w.player.grounded, 6, 'down the far side')
    b.walkTo(1550)
    flip(b) // Now: the gate is rust
    b.walkTo(1780)
    flip(b) // Then: the bridge stands
    b.finish()
    expect(b.w.edits).toBe(1)
  })

  it('3-3 The Orchard of Hours', () => {
    const b = play('3-3')
    flip(b)
    b.walkTo(470)
    b.edit({ type: 'pluck', word: 'wheat', index: 3 }) // WHET, keep the A
    b.walkTo(640)
    b.jumpUp()
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(1050)
    b.edit({ type: 'pluck', word: 'spark', index: 0 }) // PARK
    flip(b)
    b.walkTo(1300)
    flip(b)
    b.walkTo(1470)
    b.edit({ type: 'place', word: 'corn', index: 0, letter: 'A' }) // ACORN
    flip(b)
    expect(b.w.entityOf('corn')!.text).toBe('OAK')
    b.walkTo(1540)
    b.climbTo(140)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 160, 3, 'onto the balcony')
    b.finish()
    expect(b.w.edits).toBe(3)
  })

  it('3-3: Now, the fire blocks the way until the spark is gone', () => {
    const b = play('3-3')
    expect(() => b.finish(8)).toThrow(/died/)
  })

  it('3-4 The Gears', () => {
    const b = play('3-4')
    flip(b)
    b.walkTo(590)
    b.jumpTo(700)
    const g2 = b.w.words.get('g2')!.ent
    const g4 = b.w.words.get('g4')!.ent
    b.walkTo(720)
    b.hold({}, () => g2.veh!.s === 1 && g2.veh!.wait > 0.6, 12, 'g2 low')
    b.jumpTo(870)
    b.walkTo(900)
    b.jumpTo(1050)
    b.walkTo(1080)
    b.hold({}, () => g4.veh!.s === 1 && g4.veh!.wait > 0.6, 12, 'g4 low')
    b.jumpTo(1230)
    b.walkTo(1260)
    b.jumpTo(1420)
    b.walkTo(1590)
    b.edit({ type: 'pluck', word: 'drip', index: 0 }) // RIP
    flip(b)
    b.finish()
    expect(b.w.edits).toBe(1)
  })

  it('3-5 Midnight', () => {
    const b = play('3-5')
    b.jumpTo(200)
    b.walkTo(270)
    waitEra(b, 'present')
    b.jumpTo(400)
    b.walkTo(470)
    b.jumpTo(600)
    b.walkTo(690)
    waitEra(b, 'past')
    b.jumpTo(820)
    b.walkTo(890)
    b.jumpTo(1020)
    b.walkTo(1040)
    waitEra(b, 'present')
    b.jumpUp()
    expect(b.w.quill).toEqual(['N'])
    b.walkTo(990)
    b.jumpTo(880)
    b.walkTo(700)
    waitEra(b, 'past')
    b.edit({ type: 'pluck', word: 'beat', index: 3 }) // BEA
    b.edit({ type: 'place', word: 'beat', index: 3, letter: 'N' }) // BEAN
    waitEra(b, 'present')
    b.walkTo(520)
    b.climbTo(362)
    b.hold({ left: true }, (w) => w.player.grounded && w.player.y === 380, 3, 'onto the high shelf')
    b.walkTo(470)
    waitEra(b, 'present')
    b.jumpTo(600)
    b.walkTo(670)
    b.jumpTo(800)
    b.walkTo(870)
    waitEra(b, 'past')
    b.jumpTo(1000)
    b.walkTo(970)
    b.jumpTo(880)
    b.hold({ left: true }, (w) => w.complete, 3, 'the exit')
    expect(b.w.edits).toBe(2)
  })

})
