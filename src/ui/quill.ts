import * as ink from '../game/ink'
import type { World } from '../game/world'
import { button, h } from './dom'

export interface QuillActions {
  pluck: (index: number) => void
  place: (gap: number, quillIndex: number) => void
  swap: (i: number, j: number) => void
  mirror: () => void
  discard: (quillIndex: number) => void
  close: () => void
}

type Tool = 'pluck' | 'swap'

/** The editing card: a word, enlarged, with its letters and gaps. */
export class QuillPanel {
  wordId: string | null = null
  private el: HTMLElement | null = null
  private sel = 0
  private tool: Tool = 'pluck'
  /** In swap mode, the first letter picked. */
  private first: number | null = null

  constructor(
    private root: HTMLElement,
    private actions: QuillActions,
  ) {}

  get isOpen(): boolean {
    return this.wordId !== null
  }

  open(world: World, wordId: string): void {
    this.wordId = wordId
    this.first = null
    this.sel = Math.min(this.sel, Math.max(0, world.quill.length - 1))
    this.render(world)
  }

  close(): void {
    this.wordId = null
    this.first = null
    this.el?.remove()
    this.el = null
  }

  render(world: World): void {
    if (!this.wordId) return
    const ws = world.words.get(this.wordId)
    const ent = world.entityOf(this.wordId)
    if (!ws || !ent) return this.close()
    const text = ws.text
    const mirrors = world.level.powers.includes('mirror')
    if (!mirrors) this.tool = 'pluck'
    const swapping = this.tool === 'swap'
    const canPlace = !swapping && world.canPlace && world.quill.length > 0
    const letter = world.quill[this.sel]
    const preview = h('div', { class: 'qp-preview', text: ' ' })
    const setPreview = (s: string | null) => {
      preview.textContent = s ? `→ ${s}` : ' '
      preview.classList.toggle('on', !!s)
    }
    const hover = (b: HTMLElement, s: () => string | null) => {
      b.addEventListener('pointerenter', () => setPreview(s()))
      b.addEventListener('focus', () => setPreview(s()))
      b.addEventListener('pointerleave', () => setPreview(null))
    }

    const row = h('div', { class: 'qp-word' + (swapping ? ' swapping' : ''), attrs: { role: 'group', 'aria-label': `Letters of ${text}` } })
    const gap = (i: number) => {
      if (!canPlace || !letter) return null
      const b = button('+', () => this.actions.place(i, this.sel), 'qp-gap', { 'aria-label': `Write ${letter} here` })
      hover(b, () => ink.place(text, i, letter))
      return b
    }
    for (let i = 0; i < text.length; i++) {
      const g = gap(i)
      if (g) row.append(g)
      const picked = swapping && this.first === i
      const label = swapping ? (this.first === null ? `Pick ${text[i]} to swap` : `Swap with ${text[i]}`) : `Pluck ${text[i]}`
      const b = button(
        text[i],
        () => {
          if (!swapping) return this.actions.pluck(i)
          if (this.first === null) {
            this.first = i
            return this.render(world)
          }
          if (this.first === i) {
            this.first = null
            return this.render(world)
          }
          const j = this.first
          this.first = null
          this.actions.swap(j, i)
        },
        'qp-letter' + (picked ? ' picked' : ''),
        { 'aria-label': label, 'aria-pressed': String(picked) },
      )
      if (!swapping && text.length <= 1) b.disabled = true
      hover(b, () => (swapping ? (this.first === null || this.first === i ? null : ink.swap(text, this.first, i)) : ink.pluck(text, i).text))
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

    const tools = mirrors
      ? h(
          'div',
          { class: 'qp-tools', attrs: { role: 'toolbar', 'aria-label': 'Ink tools' } },
          this.toolButton('✒ Pluck', 'pluck', world),
          this.toolButton('⇄ Swap', 'swap', world),
          (() => {
            const b = button('◐ Mirror', () => this.actions.mirror(), 'qp-tool', { 'aria-label': 'Mirror the whole word' })
            hover(b, () => ink.mirror(text))
            return b
          })(),
        )
      : null

    let help: string
    if (swapping) help = this.first === null ? 'Pick a letter, then another, to trade their places.' : `Now pick the letter to trade with ${text[this.first]}.`
    else if (!world.canPlace) help = 'Click a letter to pluck it out. Nonsense turns to wild ink.'
    else if (world.quill.length === 0) help = 'Pluck a letter to keep it in your quill.'
    else help = `Pluck a letter, or click a + to write ${letter} into the word.`

    const quillRow =
      world.canPlace && !swapping
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
      h('div', { class: 'qp-desc', text: ent.kind.desc }),
      tools,
      row,
      preview,
      quillRow,
      h('div', { class: 'qp-help', text: help }),
    )
    this.el?.remove()
    this.el = el
    this.root.append(el)
    const focus = el.querySelector<HTMLButtonElement>('.qp-letter.picked') ?? el.querySelector<HTMLButtonElement>('.qp-letter:not([disabled])')
    focus?.focus({ preventScroll: true })
  }

  private toolButton(label: string, tool: Tool, world: World): HTMLButtonElement {
    const on = this.tool === tool
    return button(
      label,
      () => {
        this.tool = tool
        this.first = null
        this.render(world)
      },
      'qp-tool' + (on ? ' on' : ''),
      { 'aria-pressed': String(on) },
    )
  }
}
