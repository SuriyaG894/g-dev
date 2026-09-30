import type { App } from './app'
import type { Action } from './input'
import { LEXICON } from './game/lexicon'
import type { LevelDef, NoteTrigger } from './game/types'
import { PLAYER_H, World, type EditRefusal } from './game/world'
import { Particles } from './render/particles'
import { EVENT_NOTES, pick } from './story/text'
import { h, roman, words } from './ui/dom'
import { Hud } from './ui/hud'
import { QuillPanel } from './ui/quill'

const STEP = 1 / 120
const SLOW = 0.06

/** One page being played. */
export class Play {
  readonly world: World
  readonly level: LevelDef
  particles = new Particles()
  paused = false
  ended = false
  debug = false
  private acc = 0
  private hover: string | null = null
  private hud: Hud
  private panel: QuillPanel
  private fired = new Set<number>()
  private hintIndex = 0
  private shake = 0
  private seen = new Set<string>()
  private lastRefusal = 0
  private touchEl: HTMLElement | null = null
  private cleanup: (() => void)[] = []

  constructor(
    private app: App,
    level: LevelDef,
  ) {
    this.level = level
    this.world = new World(level)
    if (app.save.diary.includes(level.diary?.id ?? '')) this.world.diaryTaken = true
    this.hud = new Hud(app.hudRoot, this.world, {
      flip: () => this.flip(),
      hint: () => this.hint(),
      undo: () => this.undo(),
      restart: () => this.restart(),
      sound: () => app.toggleMute(),
      pause: () => this.togglePause(),
    }, app.sound.isMuted)
    this.panel = new QuillPanel(app.uiRoot, {
      pluck: (i) => this.edit(() => this.world.pluckLetter(this.panel.wordId!, i)),
      place: (gap, q) => this.edit(() => this.world.placeLetter(this.panel.wordId!, gap, q)),
      discard: (q) => {
        this.world.discard(q)
        this.app.sound.play('click')
        this.panel.render(this.world)
        this.drain()
      },
      close: () => this.closePanel(),
    })
    app.renderer.follow(this.world, 0, true)
    app.controls.onAction = (a) => this.action(a)
    this.bindPointer()
    if (app.isTouch) this.buildTouch()
    this.titleCard()
    app.sound.startAmbient(level.theme)
  }

  // ------------------------------------------------------------------ frame

  frame(dt: number, t: number): void {
    const app = this.app
    if (!this.paused) {
      const scale = this.panel.isOpen ? SLOW : 1
      this.acc += Math.min(dt, 0.05) * scale
      const input = app.controls.read()
      let first = true
      while (this.acc >= STEP) {
        this.world.step(STEP, first ? input : { ...input, jumpPressed: false, upPressed: false })
        first = false
        this.acc -= STEP
      }
      if (!first) app.controls.consume()
      this.particles.update(dt * scale)
      this.drain()
      this.positionNotes()
      this.inkTrail(dt)
      this.shake = Math.max(0, this.shake - dt * 30)
    }
    app.renderer.follow(this.world, dt)
    app.renderer.draw(this.world, {
      t,
      hover: this.hover,
      selected: this.panel.wordId,
      reduced: app.save.settings.reducedMotion,
      particles: this.particles,
      shake: app.save.settings.reducedMotion ? 0 : this.shake,
      debug: this.debug,
    })
    this.hud.update(this.world)
    if (this.level.blot && !this.ended) {
      const gap = this.world.player.x - this.world.blotFront
      app.sound.blotHum(this.world.time > this.level.blot.delay ? 1 - gap / 700 : 0)
    } else if (this.world.rising && !this.ended) {
      // The flood hums as it closes in.
      const pool = this.world.pools[0]
      app.sound.blotHum(pool ? 1 - (pool.surface - this.world.player.y) / 500 : 0)
    } else if (this.level.pools?.some((p) => p.rise)) {
      app.sound.blotHum(0)
    }
  }

  private inkTrail(dt: number): void {
    const p = this.world.player
    if (!p.grounded || Math.abs(p.vx) < 60 || this.world.dead) return
    if (Math.random() < dt * 6) this.particles.add({ x: p.x - p.facing * 4, y: p.y - 2, vx: -p.facing * 20, vy: -40, r: 1.6, life: 0.4, gravity: 500 })
  }

  // ------------------------------------------------------------------ notes

  private trigger(match: (w: NoteTrigger) => boolean): void {
    this.level.notes.forEach((n, i) => {
      if (!this.fired.has(i) && match(n.when)) {
        this.fired.add(i)
        this.app.notes.say(n.text)
      }
    })
  }

  private positionNotes(): void {
    const w = this.world
    this.trigger((n) => ('start' in n && w.time >= n.start) || ('x' in n && w.player.x >= n.x) || ('y' in n && w.player.y <= n.y))
  }

  private say(key: string, text: string, always = false): void {
    if (!always && this.seen.has(key)) return
    this.seen.add(key)
    this.app.notes.say(text)
  }

  // ----------------------------------------------------------------- events

  private drain(): void {
    const app = this.app
    const w = this.world
    for (const e of w.events) {
      switch (e.type) {
        case 'transform': {
          app.sound.play(e.tier)
          if (LEXICON[e.to]?.noise) app.sound.play('bell')
          if (LEXICON[e.to]?.tide || LEXICON[e.from]?.tide) app.sound.play('water')
          this.particles.splash(e.x, e.y, e.tier === 'scribble' ? 26 : 16, e.tier === 'scribble' ? '#3b1712' : '#1e1914', 220)
          if (e.tier === 'thing') this.particles.sparkle(e.x, e.y + 20, 14)
          if (e.tier === 'scribble') {
            this.shake = 6
            this.say('scribble', pick(EVENT_NOTES.scribble))
          }
          if (e.tier === 'whisper' && !this.level.notes.some((n) => 'word' in n.when && n.when.word === e.to)) {
            this.say('whisper', pick(EVENT_NOTES.whisper))
          }
          this.trigger((n) => 'word' in n && n.word === e.to)
          break
        }
        case 'pluck':
          app.sound.play('pluck')
          this.particles.letter(e.x, e.y - 6, e.letter)
          break
        case 'place':
          app.sound.play('place')
          this.particles.splash(e.x, e.y, 8, '#1e1914', 140)
          break
        case 'refused':
          this.refused(e.reason)
          break
        case 'undo':
          app.sound.play('undo')
          break
        case 'jump':
          app.sound.play('jump')
          break
        case 'land':
          app.sound.play('land')
          for (let i = 0; i < 5; i++) this.particles.add({ x: w.player.x + (Math.random() - 0.5) * 16, y: w.player.y, vx: (Math.random() - 0.5) * 90, vy: -60 - Math.random() * 40, r: 1.5, life: 0.35, gravity: 400, color: '#7a6a55' })
          break
        case 'death':
          app.sound.play('death')
          this.particles.splash(e.x, e.y, 40, '#1e1914', 380)
          this.shake = 10
          this.closePanel()
          if (!this.restarts && Math.random() < 0.5) this.say('death' + w.time, pick(EVENT_NOTES.death), true)
          break
        case 'respawn':
          if (this.restarts) {
            this.particles.clear()
            this.say('pageDeath', this.level.blot ? EVENT_NOTES.blotDeath : EVENT_NOTES.pageDeath)
          }
          app.renderer.follow(w, 0, this.restarts)
          break
        case 'restart':
          this.particles.clear()
          app.renderer.follow(w, 0, true)
          break
        case 'checkpoint':
          app.sound.play('checkpoint')
          this.particles.sparkle(e.x + 10, e.y - 40, 8, '#9b3b2e')
          break
        case 'dark':
          if (e.on) {
            app.sound.play('dark')
            this.trigger((n) => 'event' in n && n.event === 'dark')
          }
          break
        case 'diary':
          app.sound.play('diary')
          this.particles.sparkle(w.player.x, w.player.y - PLAYER_H, 24)
          app.foundDiary(e.id)
          this.trigger((n) => 'event' in n && n.event === 'diary')
          window.setTimeout(() => {
            if (this.ended) return
            this.setPaused(true, false)
            app.showDiaryPage(e.id, () => this.setPaused(false, false))
          }, 900)
          break
        case 'complete':
          this.ended = true
          this.closePanel()
          app.sound.play('complete')
          app.sound.stopHum()
          this.particles.sparkle(w.level.exit.x, w.level.exit.y - 40, 40)
          window.setTimeout(() => app.levelComplete(this.level, e.edits), 1100)
          break
        case 'letter':
          app.sound.play('letter')
          this.particles.sparkle(e.x, e.y, 16)
          this.trigger((n) => 'event' in n && n.event === 'letter')
          break
        case 'lure':
          this.trigger((n) => 'event' in n && n.event === 'lure')
          break
        case 'shush':
          app.sound.play('shush')
          this.shake = 3
          this.trigger((n) => 'event' in n && n.event === 'shush')
          break
        case 'flip':
          app.sound.play(e.forced ? 'chime' : 'flip')
          this.particles.sparkle(w.player.x, w.player.y - PLAYER_H / 2, 18, e.era === 'past' ? '#d9b27a' : '#a0772b')
          if (e.forced) {
            this.shake = 4
            this.trigger((n) => 'event' in n && n.event === 'strike')
          }
          this.trigger((n) => 'event' in n && n.event === e.era)
          break
        case 'grow':
          this.trigger((n) => 'event' in n && n.event === 'grow')
          if (w.era === 'past' && e.from) {
            app.sound.play('whisper')
            this.say('grew', EVENT_NOTES.grew)
          }
          this.trigger((n) => 'word' in n && n.word === e.to)
          break
        case 'tick':
          app.sound.play('tick')
          break
        case 'discard':
          break
      }
    }
    w.events = []
  }

  /** Pages where death starts everything over. */
  private get restarts(): boolean {
    return !!this.level.blot || !!this.level.restartOnDeath
  }

  private refused(reason: EditRefusal): void {
    this.app.sound.play('refuse')
    const now = performance.now()
    if (now - this.lastRefusal < 1500) return
    this.lastRefusal = now
    const text: Partial<Record<EditRefusal, string>> = {
      far: EVENT_NOTES.far,
      dark: EVENT_NOTES.dark,
      gold: EVENT_NOTES.gold,
      full: EVENT_NOTES.full,
      short: EVENT_NOTES.short,
      echo: EVENT_NOTES.echo,
      blocked: EVENT_NOTES.blocked,
    }
    const t = text[reason]
    if (t) this.app.notes.say(t, { urgent: true })
  }

  // ------------------------------------------------------------------ edits

  private edit(op: () => boolean): void {
    if (op()) this.closePanel()
    else if (this.panel.isOpen) this.panel.render(this.world)
    this.drain()
  }

  openWord(id: string): void {
    if (this.ended || this.paused) return
    const why = this.world.canEdit(id)
    if (why) {
      this.refused(why)
      return
    }
    this.app.sound.play('click')
    this.app.controls.enabled = false
    this.panel.open(this.world, id)
    if (this.world.canPlace && this.world.quill.length > 0) this.trigger((n) => 'event' in n && n.event === 'firstQuill')
  }

  closePanel(): void {
    if (!this.panel.isOpen) return
    this.panel.close()
    this.app.controls.enabled = true
    this.app.canvas.focus({ preventScroll: true })
  }

  private nearestWord(): string | null {
    const w = this.world
    let best: { id: string; d: number } | null = null
    for (const ent of w.entities()) {
      if (w.canEdit(ent.wordId)) continue
      const at = w.labelPos(ent)
      const d = Math.hypot(at.x - w.player.x, at.y - w.player.y)
      if (!best || d < best.d) best = { id: ent.wordId, d }
    }
    return best?.id ?? null
  }

  private hint(): void {
    const hints = this.level.hints
    if (!hints.length) return
    this.app.notes.say(hints[this.hintIndex % hints.length], { urgent: true })
    this.hintIndex++
  }

  private flip(): void {
    if (this.paused || this.ended) return
    this.closePanel()
    this.world.flip()
    this.drain()
  }

  private undo(): void {
    this.closePanel()
    if (!this.world.undo()) this.app.sound.play('refuse')
    this.drain()
  }

  private restart(): void {
    this.closePanel()
    this.world.restart()
    this.app.sound.play('page')
    this.drain()
  }

  private action(a: Action): void {
    if (this.ended) return
    switch (a) {
      case 'pause':
        if (this.panel.isOpen) this.closePanel()
        else this.togglePause()
        break
      case 'edit':
        if (!this.panel.isOpen && !this.paused) {
          const id = this.nearestWord()
          if (id) this.openWord(id)
          else this.refused('far')
        }
        break
      case 'undo':
        if (!this.paused) this.undo()
        break
      case 'restart':
        if (!this.paused) this.restart()
        break
      case 'hint':
        this.hint()
        break
      case 'mute':
        this.app.toggleMute()
        break
      case 'flip':
        if (this.world.canFlip) this.flip()
        break
      case 'debug':
        if (import.meta.env.DEV) this.debug = !this.debug
        break
    }
  }

  setMuted(m: boolean): void {
    this.hud.setMuted(m)
  }

  togglePause(): void {
    this.setPaused(!this.paused, true)
  }

  setPaused(p: boolean, overlay: boolean): void {
    if (this.ended && p) return
    this.paused = p
    this.app.controls.enabled = !p && !this.panel.isOpen
    if (p) {
      this.closePanel()
      if (overlay) this.app.showPause(this)
    } else {
      this.app.hidePause()
    }
  }

  // ---------------------------------------------------------------- pointer

  private bindPointer(): void {
    const canvas = this.app.canvas
    const hit = (e: PointerEvent): string | null => {
      const r = this.app.renderer
      const pt = r.toWorld(e.clientX, e.clientY)
      const pad = e.pointerType === 'touch' ? 14 : 4
      for (const l of r.labels) {
        if (pt.x >= l.x - pad && pt.x <= l.x + l.w + pad && pt.y >= l.y - pad && pt.y <= l.y + l.h + pad) return l.wordId
      }
      return null
    }
    const move = (e: PointerEvent) => {
      this.hover = hit(e)
      canvas.style.cursor = this.hover ? 'pointer' : 'default'
    }
    const down = (e: PointerEvent) => {
      this.app.sound.unlock()
      const id = hit(e)
      if (id) this.openWord(id)
      else if (this.panel.isOpen) this.closePanel()
    }
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', down)
    this.cleanup.push(() => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', down)
      canvas.style.cursor = 'default'
    })
  }

  private buildTouch(): void {
    const c = this.app.controls
    const pad = (label: string, key: keyof typeof c.touch, cls: string, aria: string) => {
      const b = h('button', { class: `tbtn ${cls}`, text: label, attrs: { type: 'button', 'aria-label': aria } })
      const on = (e: PointerEvent) => {
        e.preventDefault()
        b.setPointerCapture(e.pointerId)
        c.touch[key] = true
        if (key === 'jump') c.pressJump()
        if (key === 'up') c.pressUp()
        b.classList.add('down')
      }
      const off = () => {
        c.touch[key] = false
        b.classList.remove('down')
      }
      b.addEventListener('pointerdown', on)
      b.addEventListener('pointerup', off)
      b.addEventListener('pointercancel', off)
      b.addEventListener('lostpointercapture', off)
      return b
    }
    this.touchEl = h(
      'div',
      { class: 'touch' },
      h('div', { class: 'touch-left' }, pad('◀', 'left', 'tb-left', 'Move left'), pad('▶', 'right', 'tb-right', 'Move right')),
      h(
        'div',
        { class: 'touch-right' },
        this.world.canFlip ? h('button', { class: 'tbtn tb-flip', text: '⟲', attrs: { type: 'button', 'aria-label': 'Turn time' }, on: { pointerdown: (e) => (e.preventDefault(), this.flip()) } }) : null,
        pad('▼', 'down', 'tb-down', 'Climb down'),
        pad('▲', 'up', 'tb-up', 'Climb up'),
        pad('⤒', 'jump', 'tb-jump', 'Jump'),
      ),
    )
    this.app.uiRoot.append(this.touchEl)
  }

  private titleCard(): void {
    const lvl = this.level
    const card = h(
      'div',
      { class: 'titlecard', attrs: { 'aria-live': 'polite' } },
      h('div', { class: 'tc-chapter', text: `Chapter ${roman(lvl.chapter)} · Page ${words(lvl.page)}` }),
      h('div', { class: 'tc-title', text: lvl.title }),
      h('div', { class: 'tc-sub', text: lvl.subtitle }),
    )
    this.app.uiRoot.append(card)
    window.setTimeout(() => card.classList.add('leaving'), 2600)
    window.setTimeout(() => card.remove(), 3400)
    this.cleanup.push(() => card.remove())
  }

  destroy(): void {
    this.closePanel()
    this.hud.destroy()
    this.touchEl?.remove()
    this.app.sound.stopHum()
    this.app.controls.onAction = () => {}
    for (const c of this.cleanup) c()
  }
}

