import '@fontsource/im-fell-english/latin-400.css'
import '@fontsource/im-fell-english/latin-400-italic.css'
import '@fontsource/im-fell-english-sc/latin-400.css'
import '@fontsource/caveat/latin-500.css'
import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import './styles.css'
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
}

void boot()
