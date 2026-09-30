import { describe, expect, it } from 'vitest'
import { pluck, place } from '../src/game/ink'

describe('ink', () => {
  it('plucks a letter', () => {
    expect(pluck('BRIDGE', 0)).toEqual({ text: 'RIDGE', letter: 'B' })
    expect(pluck('PLANET', 5)).toEqual({ text: 'PLANE', letter: 'T' })
  })

  it('places a letter into a gap', () => {
    expect(place('ADDER', 0, 'L')).toBe('LADDER')
    expect(place('CAT', 3, 'S')).toBe('CATS')
    expect(place('CAT', 2, 'R')).toBe('CART')
  })

  it('rejects bad indices and letters', () => {
    expect(() => pluck('CAT', 3)).toThrow()
    expect(() => place('CAT', 4, 'S')).toThrow()
    expect(() => place('CAT', 0, 'ss')).toThrow()
  })
})
