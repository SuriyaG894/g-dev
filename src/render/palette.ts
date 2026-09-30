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
}
