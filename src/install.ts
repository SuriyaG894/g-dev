/**
 * Chrome and Android offer to install the book as an app. The offer can arrive before the game
 * has finished loading, so it is caught as soon as this module runs and kept for Settings.
 */
type InstallPrompt = Event & { prompt: () => Promise<void> }

let offer: InstallPrompt | null = null
const listeners: (() => void)[] = []

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  offer = e as InstallPrompt
})

window.addEventListener('appinstalled', () => {
  offer = null
  for (const l of listeners) l()
})

export function canInstall(): boolean {
  return !!offer
}

export async function install(): Promise<void> {
  const p = offer
  offer = null
  await p?.prompt().catch(() => undefined)
}

export function onInstalled(fn: () => void): void {
  listeners.push(fn)
}
