import { beforeAll, describe, expect, it } from 'vitest'
import * as ink from '../src/game/ink'
import { LEXICON, tierOf } from '../src/game/lexicon'
import { World, grow } from '../src/game/world'
import { CHAPTERS, ALL_LEVELS } from '../src/levels'
import { loadDictionary } from './helpers'

beforeAll(loadDictionary)

describe('level data', () => {
  it('has unique level ids', () => {
    const ids = ALL_LEVELS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of CHAPTERS) expect(c.levels.length).toBe(5)
  })

  for (const level of ALL_LEVELS) {
    describe(level.id, () => {
      it('starts with real words', () => {
        for (const w of level.words) if (!w.mirage) expect(tierOf(w.text), w.text).not.toBe('scribble')
      })

      it('has a spelling-valid solution whose length is par', () => {
        expect(level.solution.length).toBe(level.par)
        const texts = new Map(level.words.map((w) => [w.id, w.text]))
        // Lost letters count as already caught.
        const quill: string[] = (level.letters ?? []).map((l) => l.letter)
        for (const op of level.solution) {
          const text = texts.get(op.word)!
          if (op.type === 'pluck') {
            const r = ink.pluck(text, op.index)
            texts.set(op.word, r.text)
            quill.push(r.letter)
          } else if (op.type === 'mirror') {
            texts.set(op.word, ink.mirror(text))
          } else if (op.type === 'swap') {
            texts.set(op.word, ink.swap(text, op.i, op.j))
          } else {
            const i = quill.indexOf(op.letter)
            expect(i, `letter ${op.letter} in quill`).toBeGreaterThanOrEqual(0)
            quill.splice(i, 1)
            texts.set(op.word, ink.place(text, op.index, op.letter))
          }
          if (level.powers.includes('place')) expect(quill.length).toBeLessThanOrEqual(level.quill)
        }
        // Every page ends with something new: a shaped thing, or a different future (what it grows into).
        const changed = [...texts.values()].some((t, i) => {
          const was = level.words[i].text
          return t !== was && (tierOf(t) === 'thing' || grow(t) !== grow(was))
        })
        expect(changed).toBe(true)
      })

      it('only uses powers the page allows', () => {
        for (const op of level.solution) expect(level.powers).toContain(op.type === 'swap' ? 'mirror' : op.type)
      })

      it('has tuned spellings that exist in the lexicon', () => {
        for (const w of level.words) for (const t of Object.keys(w.tune ?? {})) expect(LEXICON[t], t).toBeDefined()
      })
    })
  }
})

describe('world rules', () => {
  const level = ALL_LEVELS[0]

  it('turns nonsense into wild ink that keeps the old shape', () => {
    const w = new World(level)
    w.player.x = 650
    const bear = w.words.get('bear')!.ent.home
    expect(w.pluckLetter('bear', 3)).toBe(true) // BEA
    const ent = w.words.get('bear')!.ent
    expect(ent.text).toBe('BEA')
    expect(ent.kind.scribble).toBe(true)
    expect(ent.home).toEqual(bear)
  })

  it('turns real-but-unshaped words into harmless whispers', () => {
    const w = new World(ALL_LEVELS[1])
    w.player.x = 560
    expect(w.pluckLetter('fire', 0)).toBe(true) // IRE
    expect(w.words.get('fire')!.ent.kind.whisper).toBe(true)
    expect(w.words.get('fire')!.ent.kind.hazard).toBeFalsy()
  })

  it('undoes edits, restoring the quill and the exact shape', () => {
    const w = new World(ALL_LEVELS[3])
    w.player.x = 560
    expect(w.pluckLetter('bloat', 1)).toBe(true)
    expect(w.quill).toEqual(['L'])
    expect(w.words.get('bloat')!.text).toBe('BOAT')
    expect(w.undo()).toBe(true)
    expect(w.quill).toEqual([])
    expect(w.words.get('bloat')!.text).toBe('BLOAT')
    expect(w.edits).toBe(0)
  })

  it('refuses edits out of reach', () => {
    const w = new World(level)
    expect(w.canEdit('bridge')).toBe('far')
  })

  it('refuses to read in the dark', () => {
    const w = new World(ALL_LEVELS[2])
    w.player.x = 870
    expect(w.pluckLetter('knight', 0)).toBe(true)
    expect(w.isDark).toBe(true)
    w.player.x = 1500
    expect(w.canEdit('clamp')).toBe('dark')
  })

  it('limits the quill', () => {
    const w = new World(ALL_LEVELS[3])
    w.player.x = 560
    expect(w.pluckLetter('bloat', 0)).toBe(true)
    expect(w.pluckLetter('bloat', 0)).toBe(true)
    expect(w.pluckLetter('bloat', 0)).toBe(false)
    expect(w.events.some((e) => e.type === 'refused' && e.reason === 'full')).toBe(true)
  })
})
