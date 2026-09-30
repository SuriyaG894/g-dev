import { h } from './dom'

interface Queued {
  text: string
  sign: boolean
  by: string
}

/** The Author's handwritten margin notes, one at a time. */
export class Notes {
  private root: HTMLElement
  private queue: Queued[] = []
  private current: HTMLElement | null = null
  private shownAt = 0
  private timer = 0
  private typer = 0
  onShow: () => void = () => {}

  constructor(root: HTMLElement) {
    this.root = root
  }

  say(text: string, opts: { sign?: boolean; urgent?: boolean; by?: string } = {}): void {
    const item = { text, sign: opts.sign ?? true, by: opts.by ?? '— the Author' }
    if (opts.urgent) {
      this.queue.unshift(item)
      this.next(true)
    } else if (!this.current) {
      this.queue.push(item)
      this.next()
    } else if (performance.now() - this.shownAt > 1600) {
      // Keep up with the Reader: a note that has had its moment gives way.
      this.queue.unshift(item)
      this.next(true)
    } else {
      this.queue.push(item)
    }
  }

  clear(): void {
    this.queue = []
    this.dismiss(true)
  }

  private next(force = false): void {
    if (this.current && !force) return
    if (this.current) this.dismiss(true)
    const item = this.queue.shift()
    if (!item) return
    const body = h('span', { class: 'note-text' })
    const el = h('div', { class: 'note', attrs: { role: 'status' } }, body, item.sign ? h('span', { class: 'note-sign', text: item.by }) : null)
    el.addEventListener('click', () => this.dismiss())
    this.root.append(el)
    this.current = el
    this.shownAt = performance.now()
    this.onShow()
    // Written out a few letters at a time, like a pen moving.
    let i = 0
    const write = () => {
      i = Math.min(item.text.length, i + 2)
      body.textContent = item.text.slice(0, i)
      if (i < item.text.length) this.typer = window.setTimeout(write, 22)
    }
    write()
    const ms = 2600 + item.text.length * 55
    this.timer = window.setTimeout(() => this.dismiss(), ms)
  }

  private dismiss(instant = false): void {
    clearTimeout(this.timer)
    clearTimeout(this.typer)
    const el = this.current
    if (!el) return
    this.current = null
    if (instant) el.remove()
    else {
      el.classList.add('leaving')
      window.setTimeout(() => el.remove(), 400)
    }
    if (!instant) window.setTimeout(() => this.next(), 420)
  }
}
