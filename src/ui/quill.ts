import * as ink from '../game/ink'
import { describe } from '../game/lexicon'
import type { World } from '../game/world'
import { button, h } from './dom'

export interface QuillActions {
  pluck: (index: number) => void
  place: (gap: number, quillIndex: number) => void
  discard: (quillIndex: number) => void
  close: () => void
}

/** The editing card: a word, enlarged, with its letters and gaps. */
export class QuillPanel {
  wordId: string | null = null
  private el: HTMLElement | null = null
  private sel = 0

  constructor(
    private root: HTMLElement,
    private actions: QuillActions,
  ) {}

  get isOpen(): boolean {
    return this.wordId !== null
  }

  open(world: World, wordId: string): void {
    this.wordId = wordId
    this.sel = Math.min(this.sel, Math.max(0, world.quill.length - 1))
    this.render(world)
  }

  close(): void {
    this.wordId = null
    this.el?.remove()
    this.el = null
  }

  render(world: World): void {
    if (!this.wordId) return
    const ws = world.words.get(this.wordId)
    if (!ws) return this.close()
    const text = ws.text
    const canPlace = world.canPlace && world.quill.length > 0
    const letter = world.quill[this.sel]
    const preview = h('div', { class: 'qp-preview', text: ' ' })
    const setPreview = (s: string | null) => {
      preview.textContent = s ? `→ ${s}` : ' '
      preview.classList.toggle('on', !!s)
    }

    const row = h('div', { class: 'qp-word', attrs: { role: 'group', 'aria-label': `Letters of ${text}` } })
    const gap = (i: number) => {
      if (!canPlace || !letter) return null
      const b = button('+', () => this.actions.place(i, this.sel), 'qp-gap', { 'aria-label': `Write ${letter} here` })
      b.addEventListener('pointerenter', () => setPreview(ink.place(text, i, letter)))
      b.addEventListener('focus', () => setPreview(ink.place(text, i, letter)))
      b.addEventListener('pointerleave', () => setPreview(null))
      return b
    }
    for (let i = 0; i < text.length; i++) {
      const g = gap(i)
      if (g) row.append(g)
      const b = button(text[i], () => this.actions.pluck(i), 'qp-letter', { 'aria-label': `Pluck ${text[i]}` })
      if (text.length <= 1) b.disabled = true
      b.addEventListener('pointerenter', () => setPreview(ink.pluck(text, i).text))
      b.addEventListener('focus', () => setPreview(ink.pluck(text, i).text))
      b.addEventListener('pointerleave', () => setPreview(null))
      row.append(b)
    }
    const last = gap(text.length)
    if (last) row.append(last)
    row.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const items = [...row.querySelectorAll<HTMLButtonElement>('button:not([disabled])')]
      const i = items.indexOf(document.activeElement as HTMLButtonElement)
      items[Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowLeft' ? -1 : 1)))]?.focus()
      e.stopPropagation()
    })

    let help: string
    if (!world.canPlace) help = 'Click a letter to pluck it out. Nonsense turns to wild ink.'
    else if (world.quill.length === 0) help = 'Pluck a letter to keep it in your quill.'
    else help = `Pluck a letter, or click a + to write ${letter} into the word.`

    const quillRow = world.canPlace
      ? h(
          'div',
          { class: 'qp-quill' },
          h('span', { class: 'qp-quill-label', text: `Quill ${world.quill.length}/${world.level.quill}` }),
          ...world.quill.map((q, i) =>
            h(
              'span',
              { class: 'qp-chip' + (i === this.sel ? ' sel' : '') },
              button(q, () => {
                this.sel = i
                this.render(world)
              }, 'qp-chip-letter', { 'aria-label': `Use ${q}`, 'aria-pressed': String(i === this.sel) }),
              button('×', () => this.actions.discard(i), 'qp-chip-x', { 'aria-label': `Shake off ${q}`, title: 'Shake off' }),
            ),
          ),
        )
      : null

    const el = h(
      'div',
      { class: 'quill-panel card', attrs: { role: 'dialog', 'aria-label': `Edit ${text}` } },
      button('×', () => this.actions.close(), 'qp-close', { 'aria-label': 'Close (Esc)' }),
      h('div', { class: 'qp-desc', text: describe(text) }),
      row,
      preview,
      quillRow,
      h('div', { class: 'qp-help', text: help }),
    )
    this.el?.remove()
    this.el = el
    this.root.append(el)
    const first = el.querySelector<HTMLButtonElement>('.qp-letter:not([disabled])')
    first?.focus({ preventScroll: true })
  }
}
