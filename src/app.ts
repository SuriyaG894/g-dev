import { Sound } from './audio/sound'
import type { LevelDef } from './game/types'
import { Controls } from './input'
import { ALL_LEVELS, CHAPTERS, chapterOf, levelById, nextLevel, type ChapterInfo } from './levels'
import { Play } from './play'
import { Renderer } from './render/renderer'
import { load, persist, wipe, type SaveData, type Settings } from './save'
import { installMeta } from './story/meta'
import { EVENT_NOTES } from './story/text'
import { h, wait } from './ui/dom'
import { Notes } from './ui/notes'
import * as screens from './ui/screens'

export class App {
  readonly canvas: HTMLCanvasElement
  readonly renderer: Renderer
  readonly sound = new Sound()
  readonly controls = new Controls()
  readonly notes: Notes
  readonly uiRoot: HTMLElement
  readonly hudRoot: HTMLElement
  readonly isTouch = matchMedia('(pointer: coarse)').matches
  save: SaveData
  play: Play | null = null
  private screen: HTMLElement | null = null
  private overlay: HTMLElement | null = null
  private turning = false
  private last = 0
  private t = 0

  constructor() {
    this.canvas = document.getElementById('stage') as HTMLCanvasElement
    this.uiRoot = document.getElementById('ui')!
    this.hudRoot = document.getElementById('hud')!
    this.notes = new Notes(document.getElementById('notes')!)
    this.notes.onShow = () => this.sound.play('note')
    this.renderer = new Renderer(this.canvas)
    this.save = load()
    this.applySettings()
    this.controls.attach()
    window.addEventListener('resize', () => {
      this.renderer.resize()
      this.rotateHint()
    })
    const unlock = () => {
      this.sound.unlock()
      if (!this.play) this.sound.startAmbient('woods')
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    installMeta((away) => {
      if (this.play && !this.play.ended && away > 4) this.notes.say(EVENT_NOTES.returned, { urgent: true })
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.play && !this.play.paused && !this.play.ended) this.play.setPaused(true, true)
    })
    this.rotateHint()
  }

  start(): void {
    const params = new URLSearchParams(location.search)
    const dev = import.meta.env.DEV ? params.get('level') : null
    const level = dev ? levelById(dev) : undefined
    if (level) {
      this.save.seenPrologue = true
      this.enterLevel(level)
    } else this.showTitle(true)
    requestAnimationFrame(this.loop)
  }

  private loop = (ts: number): void => {
    const dt = this.last ? Math.min(0.1, (ts - this.last) / 1000) : 0
    this.last = ts
    this.t += dt
    if (this.play) this.play.frame(dt, this.t)
    else this.renderer.drawBackdrop(this.t, this.save.settings.reducedMotion)
    requestAnimationFrame(this.loop)
  }

  // ----------------------------------------------------------------- screens

  private setScreen(el: HTMLElement | null): void {
    this.screen?.remove()
    this.screen = el
    if (el) this.uiRoot.append(el)
    el?.querySelector<HTMLElement>('.btn.primary, .btn')?.focus({ preventScroll: true })
  }

  private leavePlay(): void {
    this.hidePause()
    if (this.play) {
      this.play.destroy()
      this.play = null
      document.body.classList.remove('playing')
      this.notes.clear()
      this.sound.startAmbient('woods')
    }
  }

  /** A page turn: a sheet sweeps across, the scene changes underneath. */
  private async turn(swap: () => void): Promise<void> {
    if (this.turning) return
    this.turning = true
    this.sound.play('page')
    const sheet = h('div', { class: 'turn-sheet' + (this.save.settings.reducedMotion ? ' fade' : '') })
    document.body.append(sheet)
    await wait(this.save.settings.reducedMotion ? 250 : 430)
    swap()
    sheet.classList.add('out')
    await wait(this.save.settings.reducedMotion ? 250 : 520)
    sheet.remove()
    this.turning = false
  }

  showTitle(instant = false): void {
    const go = () => {
      this.leavePlay()
      this.setScreen(screens.titleScreen(this))
    }
    if (instant) go()
    else void this.turn(go)
  }

  showBook(chapter?: ChapterInfo, instant = false): void {
    const go = () => {
      this.leavePlay()
      this.setScreen(screens.bookScreen(this, chapter))
    }
    if (instant) go()
    else void this.turn(go)
  }

  showDiary(back: () => void): void {
    this.leavePlay()
    this.setScreen(screens.diaryScreen(this, back))
  }

  showSettings(back: () => void): void {
    if (this.play) {
      // Opened from the pause menu: keep the page, lay settings over it.
      this.overlay?.remove()
      this.overlay = screens.settingsScreen(this, back)
      this.uiRoot.append(this.overlay)
      return
    }
    this.setScreen(screens.settingsScreen(this, back))
  }

  hideSettingsOverPause(): void {
    if (this.play) this.showPause(this.play)
  }

  begin(): void {
    const level = this.nextUnfinished()
    if (!this.save.seenPrologue) {
      this.setScreen(
        screens.prologueScreen(() => {
          this.save.seenPrologue = true
          persist(this.save)
          this.startLevel(level)
        }),
      )
      return
    }
    this.startLevel(level)
  }

  nextUnfinished(): LevelDef {
    return ALL_LEVELS.find((l) => !this.save.completed.includes(l.id)) ?? levelById(this.save.lastLevel ?? '') ?? ALL_LEVELS[0]
  }

  startLevel(level: LevelDef): void {
    void this.turn(() => this.enterLevel(level))
  }

  private enterLevel(level: LevelDef): void {
    this.setScreen(null)
    this.hidePause()
    this.play?.destroy()
    this.notes.clear()
    this.play = new Play(this, level)
    document.body.classList.add('playing')
    this.save.lastLevel = level.id
    persist(this.save)
    this.canvas.focus({ preventScroll: true })
  }

  levelComplete(level: LevelDef, edits: number): void {
    this.notes.clear()
    if (!this.save.completed.includes(level.id)) this.save.completed.push(level.id)
    const prevBest = this.save.best[level.id]
    if (prevBest === undefined || edits < prevBest) this.save.best[level.id] = edits
    persist(this.save)
    const chapter = chapterOf(level)
    const next = nextLevel(level.id)
    const lastInChapter = chapter.levels[chapter.levels.length - 1] === level
    if (lastInChapter && chapter === CHAPTERS[CHAPTERS.length - 1]) {
      // Page two hundred and twelve: no chapter ending. You write it.
      void this.turn(() => {
        this.leavePlay()
        this.sound.startAmbient('blank')
        this.setScreen(screens.lastPageScreen(this))
      })
      return
    }
    if (lastInChapter) {
      void this.turn(() => {
        this.leavePlay()
        this.sound.startAmbient('night')
        this.setScreen(screens.chapterEndScreen(this, chapter))
      })
      return
    }
    // Show the result over the finished page.
    this.overlay?.remove()
    this.overlay = screens.completeScreen(this, level, edits, prevBest, next)
    this.uiRoot.append(this.overlay)
    this.overlay.querySelector<HTMLElement>('.btn.primary')?.focus({ preventScroll: true })
  }

  showPause(play: Play): void {
    this.overlay?.remove()
    this.overlay = screens.pauseScreen(
      this,
      () => play.setPaused(false, false),
      () => {
        play.setPaused(false, false)
        play.world.restart()
      },
    )
    this.uiRoot.append(this.overlay)
    this.overlay.querySelector<HTMLElement>('.btn.primary')?.focus({ preventScroll: true })
  }

  hidePause(): void {
    this.overlay?.remove()
    this.overlay = null
  }

  showDiaryPage(id: string, onClose: () => void): void {
    this.overlay?.remove()
    this.overlay = screens.diaryModal(id, () => {
      this.hidePause()
      onClose()
    })
    this.uiRoot.append(this.overlay)
    this.overlay.querySelector<HTMLElement>('.btn')?.focus({ preventScroll: true })
  }

  foundDiary(id: string): void {
    if (!this.save.diary.includes(id)) this.save.diary.push(id)
    persist(this.save)
  }

  get pastPageOpen(): boolean {
    return this.save.secrets.includes('past-page')
  }

  showLastPage(): void {
    void this.turn(() => {
      this.leavePlay()
      this.sound.startAmbient('blank')
      this.setScreen(screens.lastPageScreen(this))
    })
  }

  /** The last word is written. */
  finishBook(word: string): void {
    if (!this.save.endings.includes(word)) this.save.endings.push(word)
    persist(this.save)
    this.sound.play('complete')
    void this.turn(() => {
      this.sound.startAmbient(word === 'MIRA' ? 'ward' : 'sea')
      this.setScreen(screens.endingScreen(this, word))
    })
  }

  secret(id: string): void {
    if (!this.save.secrets.includes(id)) this.save.secrets.push(id)
    persist(this.save)
  }

  async share(message?: string): Promise<void> {
    const url = location.origin
    const text = message ?? 'I escaped the Blot in The Last Page, a storybook where every word can be unwritten. Can you?'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'The Last Page', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      this.notes.say('Link copied. Pass the book along.', { urgent: true, sign: false })
    } catch {
      // Share sheet dismissed.
    }
  }

  // ---------------------------------------------------------------- settings

  toggleMute(): void {
    this.updateSettings({ muted: !this.save.settings.muted })
    this.play?.setMuted(this.save.settings.muted)
  }

  updateSettings(patch: Partial<Settings>): void {
    Object.assign(this.save.settings, patch)
    persist(this.save)
    this.applySettings()
  }

  private applySettings(): void {
    const s = this.save.settings
    this.sound.setVolume(s.volume)
    this.sound.setMusic(s.music)
    this.sound.setMuted(s.muted)
    document.body.classList.toggle('reduced', s.reducedMotion)
    document.body.classList.toggle('readable', s.readableFont)
    this.renderer.setReadableFont(s.readableFont)
  }

  resetProgress(): void {
    this.save = wipe()
    this.applySettings()
    this.showTitle()
  }

  private rotateHint(): void {
    const show = this.isTouch && window.innerHeight > window.innerWidth
    document.body.classList.toggle('portrait', show)
  }
}
