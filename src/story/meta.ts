/** The book knows it lives inside a browser. */
import { TAB_WHISPERS } from './text'

const TITLE = 'The Last Page'

export function installMeta(onReturn: (awaySeconds: number) => void): void {
  let leftAt = 0
  let timer = 0
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      leftAt = performance.now()
      let i = 0
      document.title = TAB_WHISPERS[0]
      timer = window.setInterval(() => {
        i = (i + 1) % TAB_WHISPERS.length
        document.title = TAB_WHISPERS[i]
      }, 4000)
    } else {
      clearInterval(timer)
      document.title = TITLE
      if (leftAt) onReturn((performance.now() - leftAt) / 1000)
    }
  })

  const ink = 'font-family: Georgia, serif; font-size: 14px; color: #1e1914; background: #f1e6cf; padding: 6px 10px;'
  console.log('%cYou’re reading behind the page.', ink + 'font-style: italic;')
  console.log('%cThe past is only one letter away from the last.', ink)
}
