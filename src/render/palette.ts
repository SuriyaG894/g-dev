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
}
