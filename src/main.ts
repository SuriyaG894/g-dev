import '@fontsource/im-fell-english/latin-400.css'
import '@fontsource/im-fell-english/latin-400-italic.css'
import '@fontsource/im-fell-english-sc/latin-400.css'
import '@fontsource/caveat/latin-500.css'
import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import './styles.css'
import './install'
import { startAnalytics } from './analytics'
import { App } from './app'
import { parseWords, setDictionary } from './game/lexicon'

async function boot(): Promise<void> {
  // The dictionary is fetched as its own chunk so the first paint stays light.
  const dictionary = import('./data/words.txt?raw').then((m) => setDictionary(parseWords(m.default)))
  const fonts = Promise.all(
    ['22px "IM Fell English SC"', 'italic 24px "IM Fell English"', '24px "IM Fell English"', '26px "Caveat"'].map((f) => document.fonts.load(f)),
  ).catch(() => undefined)
  await Promise.all([dictionary, fonts])
  document.getElementById('loading')?.remove()
  const app = new App()
  if (import.meta.env.DEV) (window as unknown as { __app: App }).__app = app
  app.start()
  startAnalytics()
}

boot().catch((err: unknown) => {
  // A failed first load (a dropped connection, usually) shouldn't leave a blank page.
  console.error(err)
  const el = document.getElementById('loading')
  if (el) el.innerHTML = '<span>The ink ran. <a href="">Try opening the book again</a>.</span>'
})

// Keep the book on the device, for offline reading and installing as an app.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}
