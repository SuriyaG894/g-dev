import * as ink from '../game/ink'
import type { World } from '../game/world'
import { button, h } from './dom'

export interface QuillActions {
  pluck: (index: number) => void
  place: (gap: number, quillIndex: number) => void
  swap: (i: number, j: number) => void
  mirror: () => void
  discard: (quillIndex: number) => void
  /** Lifts an adjective into the quill. */
  lift: (tagId: string) => void
  /** Names the open word with the adjective in the quill. */
  name: () => void
  /** Folds `take` into `keep`. */
  fold: (keep: string, take: string, order: 'before' | 'after') => void
  /** Switches the card to another word (a thing's adjective, say). */
  open: (wordId: string) => void
  close: () => void
}

type Tool = 'pluck' | 'swap' | 'fold'

function off(b: HTMLButtonElement, disabled: boolean): HTMLButtonElement {
  b.disabled = disabled
  return b
}

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
    // The Reader and the Blot keep their spelling: they can only be named.
    const fixed = !!ws.def.nameOnly
    const mirrors = world.level.powers.includes('mirror') && !fixed
    const folds = world.canFold && ws.role !== 'tag' && ws.role !== 'reader'
    if (this.tool === 'swap' && !mirrors) this.tool = 'pluck'
    if (this.tool === 'fold' && !folds) this.tool = 'pluck'
    // The Blot's only edit is a fold.
    if (fixed && folds) this.tool = 'fold'
    const folding = this.tool === 'fold'
    const swapping = this.tool === 'swap'
    const canPlace = !fixed && !swapping && world.canPlace && world.quill.length > 0
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

    const row = h('div', {
      class: 'qp-word' + (swapping ? ' swapping' : '') + (ws.role === 'tag' ? ' naming' : '') + (fixed ? ' fixed' : ''),
      attrs: { role: 'group', 'aria-label': `Letters of ${text}` },
    })
    const gap = (i: number) => {
      if (!canPlace || !letter) return null
      const b = button('+', () => this.actions.place(i, this.sel), 'qp-gap', { 'aria-label': `Write ${letter} here` })
      hover(b, () => ink.place(text, i, letter))
      return b
    }
    for (let i = 0; i < text.length; i++) {
      if (fixed) {
        row.append(h('span', { class: 'qp-letter static', text: text[i] }))
        continue
      }
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

    const tools =
      mirrors || folds
        ? h(
            'div',
            { class: 'qp-tools', attrs: { role: 'toolbar', 'aria-label': 'Ink tools' } },
            fixed ? null : this.toolButton('✒ Pluck', 'pluck', world),
            mirrors ? this.toolButton('⇄ Swap', 'swap', world) : null,
            mirrors
              ? (() => {
                  const b = button('◐ Mirror', () => this.actions.mirror(), 'qp-tool', { 'aria-label': 'Mirror the whole word' })
                  hover(b, () => ink.mirror(text))
                  return b
                })()
              : null,
            folds ? this.toolButton('⧉ Fold', 'fold', world) : null,
          )
        : null

    // Folding: every word this one can touch, and the two ways to fold them.
    const foldList = folding ? h('div', { class: 'qp-folds', attrs: { role: 'group', 'aria-label': 'Fold with' } }) : null
    if (foldList) {
      const options = world.foldOptions(this.wordId)
      for (const { keep, take } of options) {
        const k = world.words.get(keep)!.text
        const t = world.words.get(take)!.text
        const partner = keep === this.wordId ? take : keep
        const across = world.meetsAcross(keep, take) && !world.entityOf(partner)?.kind.chaser ? ' (across the crease)' : ''
        const opt = (order: 'before' | 'after') => {
          const result = order === 'before' ? t + k : k + t
          const b = button(result, () => this.actions.fold(keep, take, order), 'qp-fold-btn', { 'aria-label': `Fold into ${result}` })
          hover(b, () => result)
          return b
        }
        foldList.append(
          h('div', { class: 'qp-fold' }, h('span', { class: 'qp-fold-with', text: `with ${world.words.get(partner)!.text}${across}` }), opt('before'), opt('after')),
        )
      }
      if (!options.length) foldList.append(h('div', { class: 'qp-fold-none', text: 'Nothing to fold with. Words must be near each other, or face each other across the crease.' }))
    }

    let help: string
    if (folding) help = 'Fold two words into one. One stays where it is; the other is folded into it.'
    else if (fixed) help = world.carriedText ? `This word can’t be respelled. But it can be named ${world.carriedText}.` : 'This word can’t be respelled, only named. Lift a name from something first.'
    else if (ws.role === 'tag') help = 'A name. Lift it off to give it to something else, or respell it like any word.'
    else if (swapping) help = this.first === null ? 'Pick a letter, then another, to trade their places.' : `Now pick the letter to trade with ${text[this.first]}.`
    else if (!world.canPlace) help = 'Click a letter to pluck it out. Nonsense turns to wild ink.'
    else if (world.quill.length === 0) help = 'Pluck a letter to keep it in your quill.'
    else help = `Pluck a letter, or click a + to write ${letter} into the word.`

    const quillRow =
      world.canPlace && !swapping && !fixed && !folding
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
      { class: 'quill-panel card', attrs: { role: 'dialog', 'aria-label': `Edit ${world.fullName(this.wordId)}` } },
      button('×', () => this.actions.close(), 'qp-close', { 'aria-label': 'Close (Esc)' }),
      h('div', { class: 'qp-desc', text: ent.kind.desc }),
      world.canName ? this.names(world, this.wordId) : null,
      tools,
      folding ? foldList : row,
      preview,
      quillRow,
      h('div', { class: 'qp-help', text: help }),
    )
    this.el?.remove()
    this.el = el
    this.root.append(el)
    const focus =
      el.querySelector<HTMLButtonElement>('.qp-letter.picked') ??
      (folding ? el.querySelector<HTMLButtonElement>('.qp-tool.on') : null) ??
      (world.carriedText ? el.querySelector<HTMLButtonElement>('.qp-name-btn.on') : null) ??
      el.querySelector<HTMLButtonElement>('.qp-letter:not([disabled]):not(.static)') ??
      el.querySelector<HTMLButtonElement>('.qp-name-btn:not([disabled])')
    focus?.focus({ preventScroll: true })
    // Opening the card shouldn't announce what plucking the first letter would spell.
    if (!swapping || this.first === null) setPreview(null)
  }

  /** The Name power: what this word is called, lifting a name off, giving one. */
  private names(world: World, id: string): HTMLElement | null {
    const ws = world.words.get(id)!
    const carried = world.carriedText
    const items: (HTMLElement | null)[] = []
    if (ws.role === 'tag') {
      const of = ws.of ? world.words.get(ws.of) : null
      items.push(h('span', { class: 'qp-names-on', text: of ? `naming ${of.text}` : '' }))
      items.push(off(button(`⤴ Lift ${ws.text}`, () => this.actions.lift(id), 'qp-tool qp-name-btn', { 'aria-label': `Lift ${ws.text} into your quill` }), !!carried || !!ws.def.gold))
    } else {
      const tag = world.tagOn(id)
      if (tag) {
        items.push(button(tag.text, () => this.actions.open(tag.def.id), 'qp-name-chip', { 'aria-label': `Respell ${tag.text}`, title: 'Respell this name' }))
        items.push(off(button('⤴ Lift', () => this.actions.lift(tag.def.id), 'qp-tool qp-name-btn', { 'aria-label': `Lift ${tag.text} into your quill` }), !!carried || !!tag.def.gold))
      }
      if (carried) {
        const label = `✒ Name it ${carried}` + (tag ? ` (${tag.text} comes off)` : '')
        items.push(button(label, () => this.actions.name(), 'qp-tool qp-name-btn on', { 'aria-label': label }))
      }
    }
    if (!items.some(Boolean)) return null
    return h('div', { class: 'qp-names', attrs: { role: 'group', 'aria-label': 'Names' } }, ...items)
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
