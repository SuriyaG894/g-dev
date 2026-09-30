import type { World } from '../game/world'
import { button, h, words } from './dom'

export interface HudActions {
  hint: () => void
  undo: () => void
  restart: () => void
  sound: () => void
  pause: () => void
}

/** Page title, ink counter, quill slots and the corner buttons. */
export class Hud {
  readonly el: HTMLElement
  private ink: HTMLElement
  private slots: HTMLElement
  private soundBtn: HTMLButtonElement
  private last = ''

  constructor(root: HTMLElement, world: World, actions: HudActions, muted: boolean) {
    const lvl = world.level
    this.ink = h('div', { class: 'hud-ink' })
    this.slots = h('div', { class: 'quill-slots', attrs: { 'aria-label': 'Your quill' } })
    this.soundBtn = button(muted ? '♪̸' : '♪', actions.sound, 'icon-btn', { 'aria-label': 'Toggle sound (M)', title: 'Sound (M)' })
    this.el = h(
      'div',
      { class: 'hud' },
      h(
        'div',
        { class: 'hud-left' },
        h('div', { class: 'hud-page', text: `Page ${words(lvl.page)} · ${lvl.title}` }),
        this.ink,
        world.canPlace ? this.slots : null,
      ),
      h(
        'div',
        { class: 'hud-right' },
        button('?', actions.hint, 'icon-btn', { 'aria-label': 'Hint (H)', title: 'Hint (H)' }),
        button('↶', actions.undo, 'icon-btn', { 'aria-label': 'Undo (Z)', title: 'Undo (Z)' }),
        button('↻', actions.restart, 'icon-btn', { 'aria-label': 'Restart page (R)', title: 'Restart page (R)' }),
        this.soundBtn,
        button('❚❚', actions.pause, 'icon-btn', { 'aria-label': 'Pause (Esc)', title: 'Pause (Esc)' }),
      ),
    )
    root.append(this.el)
    this.update(world)
  }

  setMuted(m: boolean): void {
    this.soundBtn.textContent = m ? '♪̸' : '♪'
  }

  update(world: World): void {
    const key = `${world.edits}|${world.quill.join('')}`
    if (key === this.last) return
    this.last = key
    this.ink.textContent = `Ink used ${world.edits} · Perfect ${world.level.par}`
    this.ink.classList.toggle('over', world.edits > world.level.par)
    if (world.canPlace) {
      this.slots.replaceChildren(
        h('span', { class: 'quill-label', text: 'Quill' }),
        ...Array.from({ length: world.level.quill }, (_, i) => h('span', { class: 'slot' + (world.quill[i] ? ' full' : ''), text: world.quill[i] ?? '' })),
      )
    }
  }

  destroy(): void {
    this.el.remove()
  }
}
