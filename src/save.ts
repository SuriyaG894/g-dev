/** Progress lives in localStorage. Every access is guarded: private windows can refuse storage. */

export interface Settings {
  volume: number
  music: boolean
  reducedMotion: boolean
  readableFont: boolean
  muted: boolean
}

export interface SaveData {
  v: 1
  completed: string[]
  /** Fewest edits per page. */
  best: Record<string, number>
  diary: string[]
  secrets: string[]
  seenPrologue: boolean
  lastLevel: string | null
  settings: Settings
}

const KEY = 'the-last-page:v1'

function fresh(): SaveData {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  return {
    v: 1,
    completed: [],
    best: {},
    diary: [],
    secrets: [],
    seenPrologue: false,
    lastLevel: null,
    settings: { volume: 0.8, music: true, reducedMotion: reduce, readableFont: false, muted: false },
  }
}

export function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    const data = JSON.parse(raw) as Partial<SaveData>
    const base = fresh()
    return { ...base, ...data, settings: { ...base.settings, ...(data.settings ?? {}) } }
  } catch {
    return fresh()
  }
}

export function persist(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable; progress lasts for this visit only.
  }
}

export function wipe(): SaveData {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  return fresh()
}
