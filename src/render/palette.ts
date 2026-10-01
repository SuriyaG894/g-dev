import type { Theme } from '../game/types'

export interface Palette {
  paper: string
  paperDark: string
  ink: string
  accent: string
  leaf: string
  water: string
  fire: string
  gold: string
  glow: string
  blot: string
  /** The ink adjectives are written in. */
  name: string
}

const base: Palette = {
  paper: '#f1e6cf',
  paperDark: '#e0cfab',
  ink: '#1e1914',
  accent: '#4d7248',
  leaf: '#5e8a4f',
  water: '#2f6874',
  fire: '#c4532b',
  gold: '#b0802a',
  glow: '#f5d98a',
  blot: '#0b0806',
  name: '#7a3466',
}

export const PALETTES: Record<Theme, Palette> = {
  woods: base,
  river: { ...base, accent: '#2f6874', paper: '#eee6d2' },
  night: { ...base, accent: '#4f557f', paper: '#e8decb', paperDark: '#d6c7a8' },
  blot: { ...base, accent: '#8a2f2a', paper: '#ede0c6', paperDark: '#dac7a2' },
  library: { ...base, accent: '#2d5f73', paper: '#ebe3cf', paperDark: '#d6c8a7', water: '#1f4f63', leaf: '#557a5a' },
  archive: { ...base, accent: '#6a4f86', paper: '#e4d9c2', paperDark: '#cfbf9d', water: '#223c52' },
  flood: { ...base, accent: '#1f5a70', paper: '#e7ddc7', paperDark: '#d2c3a1', water: '#184a60' },
  clock: { ...base, accent: '#a0772b', paper: '#ede2c7', paperDark: '#d8c6a0', leaf: '#6b8a4f' },
  desert: { ...base, accent: '#c07a2c', paper: '#f0e1c0', paperDark: '#e2c88f', leaf: '#7a8a3a', water: '#3a7a8a' },
  blank: { ...base, accent: '#8a8378', paper: '#f6f3ea', paperDark: '#e8e3d5', ink: '#2a2724', leaf: '#9a968a', water: '#6f8590' },
  ward: { ...base, accent: '#8a6a4a', paper: '#efe3c8', paperDark: '#dccaa2', ink: '#2b2219', leaf: '#7f8a62', water: '#7a8f96' },
  sea: { ...base, accent: '#2e6f86', paper: '#ece8da', paperDark: '#d9d2b8', leaf: '#5f8a6a', water: '#2a6a85' },
  city: { ...base, accent: '#3f5a86', paper: '#ebe5d6', paperDark: '#d4cab3', leaf: '#5d7a62', water: '#23415c', ink: '#1b1a22' },
}
