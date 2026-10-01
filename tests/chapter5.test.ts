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

describe('chapter V rules', () => {
  it('names change things, and can be lifted off and given away', () => {
    const w = new World(levelById('5-1')!)
    expect(w.fullName('sign')).toBe('FROZEN SIGN')
    expect(w.entityOf('canal')!.kind.hazard).toBe(true)
    w.player.x = 330
    expect(w.liftName('frozen')).toBe(true)
    expect(w.carriedText).toBe('FROZEN')
    expect(w.fullName('sign')).toBe('SIGN')
    expect(w.entityOf('frozen')).toBeNull()
    w.player.x = 560
    expect(w.nameThing('canal')).toBe(true)
    const canal = w.entityOf('canal')!
    expect(w.fullName('canal')).toBe('FROZEN CANAL')
    expect(canal.kind.hazard).toBeFalsy()
    expect(canal.kind.solid).toBe(true)
    expect(w.carried).toBeNull()
    expect(w.edits).toBe(2)
  })

  it('size adjectives scale things', () => {
    const w = new World(levelById('5-1')!)
    expect(w.entityOf('wall')!.box.h).toBe(180)
    w.player.x = 1100
    w.liftName('tall')
    expect(w.entityOf('wall')!.box.h).toBe(90)
    w.player.x = 1740
    w.nameThing('ladder')
    const ladder = w.entityOf('ladder')!
    expect(ladder.box.h).toBe(400)
    expect(ladder.scale).toEqual({ x: 1, y: 2 })
  })

  it('the quill holds one name, and naming a named thing trades names', () => {
    const w = new World(levelById('5-1')!)
    w.player.x = 330
    w.liftName('frozen')
    w.player.x = 1150
    expect(w.liftName('tall')).toBe(false)
    expect(w.events.some((e) => e.type === 'refused' && e.reason === 'carrying')).toBe(true)
    expect(w.nameThing('wall')).toBe(true)
    expect(w.fullName('wall')).toBe('FROZEN WALL')
    expect(w.carriedText).toBe('TALL')
  })

  it('undo puts names back where they were', () => {
    const w = new World(levelById('5-1')!)
    w.player.x = 330
    w.liftName('frozen')
    w.player.x = 560
    w.nameThing('canal')
    expect(w.undo()).toBe(true)
    expect(w.carriedText).toBe('FROZEN')
    expect(w.entityOf('canal')!.kind.hazard).toBe(true)
    expect(w.undo()).toBe(true)
    expect(w.carried).toBeNull()
    expect(w.fullName('sign')).toBe('FROZEN SIGN')
    expect(w.edits).toBe(0)
  })

  it('a nonsense name spoils the thing it names', () => {
    const w = new World(levelById('5-2')!)
    w.player.x = 690
    expect(w.mirrorWord('meat')).toBe(true) // TAEM
    expect(w.entityOf('butcher')!.kind.scribble).toBe(true)
    expect(w.swapLetters('meat', 2, 3)).toBe(true) // TAME
    expect(w.entityOf('butcher')!.kind.scribble).toBeFalsy()
    expect(w.fullName('butcher')).toBe('TAME SIGN')
  })

  it('a tame lion is harmless, and can be stood on', () => {
    const w = new World(levelById('5-2')!)
    w.player.x = 690
    w.mirrorWord('meat')
    w.swapLetters('meat', 2, 3)
    w.liftName('meat')
    w.player.x = 900
    expect(w.nameThing('lion')).toBe(true)
    const lion = w.entityOf('lion')!
    expect(lion.kind.hazard).toBeFalsy()
    expect(lion.kind.platform).toBe(true)
  })

  it('OPEN CHEST uncovers the diary page', () => {
    const w = new World(levelById('5-2')!)
    expect(w.diaryVisible).toBe(false)
    w.player.x = 300
    w.liftName('open')
    w.nameThing('chest')
    expect(w.diaryVisible).toBe(true)
  })

  it('in the dark you can read only what is lit; LIT YOU carries light with you', () => {
    const w = new World(levelById('5-3')!)
    w.player.x = 460
    expect(w.canEdit('gate')).toBe('dark')
    w.player.x = 300
    expect(w.liftName('broken')).toBe(true)
    w.player.x = 460
    expect(w.canEdit('gate')).toBeNull()
    w.player.x = 1290
    expect(w.canEdit('cracked')).toBe('dark')
    expect(w.canEdit('you')).toBeNull()
  })

  it('the Reader cannot be respelled, only named', () => {
    const w = new World(levelById('5-4')!)
    expect(w.pluckLetter('you', 0)).toBe(false)
    expect(w.events.some((e) => e.type === 'refused' && e.reason === 'fixed')).toBe(true)
  })

  it('TINY YOU fits through the tiny door, and cannot grow back inside it', () => {
    const w = new World(levelById('5-4')!)
    expect(w.ph).toBe(38)
    w.player.x = 1200
    w.liftName('tiny')
    w.nameThing('you')
    expect(w.ph).toBe(19)
    w.player.x = 1540
    expect(w.liftName('tiny')).toBe(false)
    expect(w.events.some((e) => e.type === 'refused' && e.reason === 'blocked')).toBe(true)
    expect(w.ph).toBe(19)
  })

  it('the door is gold: its TINY cannot be lifted', () => {
    const w = new World(levelById('5-4')!)
    w.player.x = 1480
    expect(w.liftName('wee')).toBe(false)
  })

  it('a SLOW blot is slow', () => {
    const w = new World(levelById('5-5')!)
    w.player.x = 420
    w.liftName('slow')
    while (w.canEdit('blot') !== null) idle(w, 0.05)
    const before = w.blotFront
    expect(w.nameThing('blot')).toBe(true)
    idle(w, 1)
    expect(w.blotFront - before).toBeLessThan(60)
    expect(w.fullName('blot')).toBe('SLOW BLOT')
  })
})

describe('chapter V playthroughs', () => {
  it('5-1 Signs', () => {
    const b = play('5-1')
    b.walkTo(330)
    b.edit({ type: 'lift', word: 'frozen' })
    b.walkTo(560)
    b.edit({ type: 'name', word: 'canal' })
    b.walkTo(1100)
    b.edit({ type: 'lift', word: 'tall' })
    b.walkTo(1150)
    b.jumpTo(1260)
    b.walkTo(1740)
    b.edit({ type: 'name', word: 'ladder' })
    b.walkTo(1778)
    b.climbTo(150)
    b.hold({ right: true }, (w) => w.player.grounded && w.player.y === 160, 3, 'onto the ledge')
    b.finish()
    expect(b.w.edits).toBe(4)
  })

  it('5-1: the TALL WALL is too tall to jump', () => {
    const b = play('5-1')
    b.walkTo(330)
    b.edit({ type: 'lift', word: 'frozen' })
    b.walkTo(560)
    b.edit({ type: 'name', word: 'canal' })
    b.walkTo(1150)
    b.jumpTo(1260)
    expect(b.w.player.x).toBeLessThan(1176)
  })

  it('5-2 Market Street (with the diary)', () => {
    const b = play('5-2')
    b.walkTo(250)
    b.edit({ type: 'lift', word: 'open' })
    b.edit({ type: 'name', word: 'chest' })
    b.walkTo(500)
    expect(b.w.diaryTaken).toBe(true)
    b.walkTo(690)
    b.edit({ type: 'mirror', word: 'meat' })
    b.edit({ type: 'swap', word: 'meat', i: 2, j: 3 })
    b.edit({ type: 'lift', word: 'meat' })
    b.walkTo(900)
    b.edit({ type: 'name', word: 'lion' })
    b.walkTo(940)
    b.jumpTo(1030)
    expect(b.w.player.y).toBe(370)
    b.jumpTo(1160)
    expect(b.w.player.y).toBe(280)
    b.finish()
    expect(b.w.edits).toBe(6)
  })

  it('5-3 After Dark', () => {
    const b = play('5-3')
    b.walkTo(300)
    b.edit({ type: 'lift', word: 'broken' })
    b.walkTo(460)
    b.edit({ type: 'name', word: 'gate' })
    b.walkTo(900)
    b.edit({ type: 'lift', word: 'lit' })
    b.edit({ type: 'name', word: 'you' })
    b.walkTo(1290)
    b.edit({ type: 'lift', word: 'cracked' })
    b.finish()
    expect(b.w.edits).toBe(5)
  })

  it('5-4 The Tiny Door', () => {
    const b = play('5-4')
    b.walkTo(400)
    b.edit({ type: 'lift', word: 'giant' })
    b.walkTo(440)
    b.jumpTo(560)
    b.walkTo(790)
    b.edit({ type: 'name', word: 'key' })
    b.walkTo(1200)
    b.edit({ type: 'lift', word: 'tiny' })
    b.edit({ type: 'name', word: 'you' })
    b.walkTo(1700)
    b.edit({ type: 'lift', word: 'tiny' })
    b.walkTo(1860)
    b.jumpTo(1960)
    expect(b.w.player.y).toBe(380)
    b.finish()
    expect(b.w.edits).toBe(5)
  })

  it('5-4: full-size, the Reader cannot fit under the wall', () => {
    const b = play('5-4')
    b.walkTo(400)
    b.edit({ type: 'lift', word: 'giant' })
    b.walkTo(440)
    b.jumpTo(560)
    b.walkTo(790)
    b.edit({ type: 'name', word: 'key' })
    expect(() => b.walkTo(1700)).toThrow(/timed out/)
    expect(b.w.player.x).toBeLessThan(1500)
  })

  it('5-5 Ink in the Streets', () => {
    const b = play('5-5')
    b.walkTo(420)
    b.edit({ type: 'lift', word: 'slow' })
    b.hold({}, (w) => w.canEdit('blot') === null, 10, 'the Blot within reach')
    b.edit({ type: 'name', word: 'blot' })
    b.walkTo(1400)
    b.edit({ type: 'lift', word: 'broken' })
    const lift = b.w.entityOf('lift')!
    b.walkTo(1475)
    b.hold({}, () => lift.veh!.s >= 1, 12, 'up the lift')
    b.walkTo(2080)
    b.jumpTo(2260)
    b.walkTo(2560)
    b.edit({ type: 'name', word: 'gate' })
    b.finish()
    expect(b.w.edits).toBe(4)
  })

  it('5-5: at full speed, the Blot catches the lift', () => {
    const b = play('5-5')
    b.walkTo(1400)
    b.w.liftName('broken')
    b.w.events = []
    b.walkTo(1475)
    expect(() => b.hold({}, (w) => w.player.y <= 160, 14, 'up the lift')).toThrow(/died/)
  })
})
