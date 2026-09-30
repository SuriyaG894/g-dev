import type { App } from '../app'
import type { LevelDef } from '../game/types'
import { ALL_LEVELS, CHAPTERS, UPCOMING, chapterOf, type ChapterInfo } from '../levels'
import { CHAPTER_ENDS, DIARY, PROLOGUE } from '../story/text'
import { button, h, roman, words } from './dom'

// ------------------------------------------------------------------- title

export function titleScreen(app: App): HTMLElement {
  const title = 'THE LAST PAGE'
  const letters = h('h1', { class: 'title', attrs: { 'aria-label': 'The Last Page' } })
  let lIndex = -1
  // Letters are grouped per word so the title only ever wraps between words.
  let word = h('span', { class: 'tw' })
  letters.append(word)
  ;[...title].forEach((ch, i) => {
    if (ch === ' ') {
      word = h('span', { class: 'tw' })
      letters.append(word)
      return
    }
    const span = h('span', { class: 'tl' + (ch === 'L' ? ' tl-l' : ''), text: ch, attrs: { 'aria-hidden': 'true' } })
    span.style.animationDelay = `${i * 70}ms`
    if (ch === 'L') lIndex = i
    span.addEventListener('click', () => {
      app.sound.unlock()
      span.classList.remove('wobble')
      void span.offsetWidth
      span.classList.add('wobble')
      if (i === lIndex) {
        app.sound.play('refuse')
        app.secret('title-L')
        app.notes.say(
          app.save.completed.includes('1-5')
            ? 'Soon. When you can write, try this letter again. The past is waiting.'
            : 'Not yet. Come back when you can write.',
          { urgent: true },
        )
      } else app.sound.play('pluck')
    })
    word.append(span)
  })
  if (app.save.completed.includes('1-5')) letters.classList.add('stirring')

  const next = app.nextUnfinished()
  const started = app.save.completed.length > 0 || app.save.seenPrologue
  const menu = h(
    'div',
    { class: 'menu' },
    button(started ? `Continue · ${next.title}` : 'Begin reading', () => app.begin(), 'btn primary'),
    button('Pages', () => app.showBook(), 'btn'),
    button('Diary', () => app.showDiary(() => app.showTitle()), 'btn'),
    button('Settings', () => app.showSettings(() => app.showTitle()), 'btn'),
  )
  return h(
    'div',
    { class: 'screen title-screen' },
    h('div', { class: 'title-kicker', text: 'an unfinished storybook' }),
    letters,
    h('p', { class: 'tagline', text: 'Every world is written. Every word can be unwritten.' }),
    menu,
    h('div', { class: 'title-foot', text: `v0.2 · Chapters I–${roman(CHAPTERS.length)} of VII · Headphones recommended` }),
  )
}

// -------------------------------------------------------------------- book

/** A page is open once the page before it (in reading order) is finished. */
export function isOpen(app: App, lvl: LevelDef): boolean {
  const i = ALL_LEVELS.indexOf(lvl)
  return i === 0 || app.save.completed.includes(lvl.id) || app.save.completed.includes(ALL_LEVELS[i - 1].id)
}

export function bookScreen(app: App, chapter?: ChapterInfo): HTMLElement {
  const ch = chapter ?? chapterOf(app.nextUnfinished())
  const pages = h('ol', { class: 'pages' })
  ch.levels.forEach((lvl) => {
    const done = app.save.completed.includes(lvl.id)
    const open = isOpen(app, lvl)
    const best = app.save.best[lvl.id]
    const perfect = done && best !== undefined && best <= lvl.par
    const status = !open ? 'the ink is still wet' : perfect ? '✒ Perfect Ink' : done ? `complete · ink ${best}` : 'unread'
    const item = h(
      'button',
      { class: 'page-item' + (open ? '' : ' locked') + (perfect ? ' perfect' : ''), attrs: { type: 'button' } },
      h('span', { class: 'pi-num', text: roman(lvl.page) }),
      h('span', { class: 'pi-title', text: lvl.title }),
      h('span', { class: 'pi-status', text: status }),
    )
    if (open) item.addEventListener('click', () => app.startLevel(lvl))
    else item.disabled = true
    pages.append(h('li', {}, item))
  })
  const tabs = h(
    'div',
    { class: 'chapter-tabs', attrs: { role: 'tablist' } },
    ...CHAPTERS.map((c) => {
      const open = isOpen(app, c.levels[0])
      const b = button(`${roman(c.number)} · ${c.title}`, () => app.showBook(c, true), 'tab' + (c === ch ? ' on' : ''), {
        role: 'tab',
        'aria-selected': String(c === ch),
      })
      if (!open) {
        b.disabled = true
        b.textContent = `${roman(c.number)} · locked`
      }
      return b
    }),
  )
  const upcoming = h(
    'ul',
    { class: 'upcoming' },
    ...UPCOMING.map((u) => h('li', {}, h('span', { class: 'up-num', text: roman(u.number) }), h('span', { text: u.title }), h('span', { class: 'up-note', text: 'still being written' }))),
  )
  return h(
    'div',
    { class: 'screen book-screen' },
    tabs,
    h(
      'div',
      { class: 'book card' },
      h(
        'div',
        { class: 'book-left' },
        h('div', { class: 'bl-kicker', text: `Chapter ${roman(ch.number)}` }),
        h('h2', { text: ch.title }),
        h('p', { text: ch.blurb }),
        h('p', { class: 'bl-power', text: `Ink powers: ${ch.power}` }),
        upcoming,
      ),
      h('div', { class: 'book-right' }, h('div', { class: 'br-kicker', text: 'Pages' }), pages),
    ),
    h('div', { class: 'row' }, button('← Back', () => app.showTitle(), 'btn'), button('Diary', () => app.showDiary(() => app.showBook()), 'btn')),
  )
}

// ------------------------------------------------------------------- diary

export function diaryScreen(app: App, back: () => void): HTMLElement {
  const entries = DIARY.map((d) =>
    app.save.diary.includes(d.id)
      ? h('article', { class: 'diary-entry' }, h('h3', { text: d.title }), ...d.body.map((line) => h('p', { text: line })))
      : h('article', { class: 'diary-entry missing' }, h('h3', { text: 'A torn stub' }), h('p', { text: 'Something was written here once. It only shows itself in the dark.' })),
  )
  return h(
    'div',
    { class: 'screen diary-screen' },
    h('div', { class: 'card diary-card' }, h('h2', { text: 'The Author’s Diary' }), h('p', { class: 'muted', text: `${app.save.diary.length} of ${DIARY.length} pages found` }), ...entries),
    button('← Back', back, 'btn'),
  )
}

export function diaryModal(id: string, onClose: () => void): HTMLElement {
  const d = DIARY.find((e) => e.id === id)!
  const el = h(
    'div',
    { class: 'screen modal-screen' },
    h(
      'div',
      { class: 'card diary-card reveal' },
      h('div', { class: 'muted', text: 'You found a torn page' }),
      h('h2', { text: d.title }),
      ...d.body.map((line, i) => {
        const p = h('p', { text: line })
        p.style.animationDelay = `${0.4 + i * 0.7}s`
        return p
      }),
      button('Keep reading', () => onClose(), 'btn primary'),
    ),
  )
  return el
}

// ---------------------------------------------------------------- settings

export function settingsScreen(app: App, back: () => void): HTMLElement {
  const s = app.save.settings
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => {
    const input = h('input', { attrs: { type: 'checkbox' } })
    input.checked = value
    input.addEventListener('change', () => set(input.checked))
    return h('label', { class: 'setting' }, h('span', { text: label }), input)
  }
  const vol = h('input', { attrs: { type: 'range', min: '0', max: '1', step: '0.05', 'aria-label': 'Volume' } })
  vol.value = String(s.volume)
  vol.addEventListener('input', () => app.updateSettings({ volume: Number(vol.value) }))
  let armed = false
  const reset = button('Erase all progress', () => {
    if (!armed) {
      armed = true
      reset.textContent = 'Really erase? Click again'
      return
    }
    app.resetProgress()
  }, 'btn danger')
  return h(
    'div',
    { class: 'screen settings-screen' },
    h(
      'div',
      { class: 'card settings-card' },
      h('h2', { text: 'Settings' }),
      h('label', { class: 'setting' }, h('span', { text: 'Volume' }), vol),
      toggle('Music', s.music, (v) => app.updateSettings({ music: v })),
      toggle('Reduced motion', s.reducedMotion, (v) => app.updateSettings({ reducedMotion: v })),
      toggle('Easy-read font', s.readableFont, (v) => app.updateSettings({ readableFont: v })),
      h(
        'div',
        { class: 'keys' },
        h('h3', { text: 'Controls' }),
        h('p', { text: '← → or A D: walk · Space: jump · ↑ W: climb' }),
        h('p', { text: 'Click a word (or press E) to edit it · Z: undo · R: restart · H: hint · M: mute · Esc: pause' }),
      ),
      reset,
    ),
    button('← Back', back, 'btn'),
  )
}

// ---------------------------------------------------------------- prologue

export function prologueScreen(then: () => void): HTMLElement {
  const lines = PROLOGUE.map((l, i) => {
    const p = h('p', { text: l })
    p.style.animationDelay = `${0.5 + i * 1.6}s`
    return p
  })
  const go = button('Open the book', then, 'btn light')
  go.style.animationDelay = `${0.5 + PROLOGUE.length * 1.6}s`
  const el = h('div', { class: 'screen dark-screen prologue' }, h('div', { class: 'dark-lines' }, ...lines), go, button('skip', then, 'skip'))
  return el
}

// ------------------------------------------------------------------- pause

export function pauseScreen(app: App, resume: () => void, restart: () => void): HTMLElement {
  return h(
    'div',
    { class: 'screen modal-screen' },
    h(
      'div',
      { class: 'card pause-card' },
      h('h2', { text: 'The page holds its breath' }),
      button('Resume', resume, 'btn primary'),
      button('Restart page', restart, 'btn'),
      button('Pages', () => app.showBook(), 'btn'),
      button('Settings', () => app.showSettings(() => app.hideSettingsOverPause()), 'btn'),
      button('Title', () => app.showTitle(), 'btn'),
    ),
  )
}

// ---------------------------------------------------------------- complete

export function completeScreen(app: App, level: LevelDef, edits: number, prevBest: number | undefined, next: LevelDef | undefined): HTMLElement {
  const perfect = edits <= level.par
  return h(
    'div',
    { class: 'screen modal-screen' },
    h(
      'div',
      { class: 'card complete-card' },
      h('div', { class: 'muted', text: `Page ${words(level.page)} complete` }),
      h('h2', { text: level.title }),
      h('div', { class: 'ink-line' }, h('span', { text: `Ink used: ${edits}` }), h('span', { text: `Perfect Ink: ${level.par}` })),
      perfect ? h('div', { class: 'seal', text: 'Perfect Ink' }) : h('p', { class: 'muted', text: `Solve it in ${level.par} edits for Perfect Ink.` }),
      prevBest !== undefined && prevBest < edits ? h('p', { class: 'muted', text: `Your best: ${prevBest}` }) : null,
      h(
        'div',
        { class: 'row' },
        next ? button('Turn the page →', () => app.startLevel(next), 'btn primary') : null,
        button('Replay', () => app.startLevel(level), 'btn'),
        button('Pages', () => app.showBook(), 'btn'),
      ),
    ),
  )
}

// ------------------------------------------------------------- chapter end

export function chapterEndScreen(app: App, chapter: ChapterInfo): HTMLElement {
  const text = CHAPTER_ENDS[chapter.number] ?? []
  const lines = text.map((l, i) => {
    const p = h('p', { text: l })
    p.style.animationDelay = `${0.6 + i * 1.8}s`
    return p
  })
  const next = CHAPTERS.find((c) => c.number === chapter.number + 1)
  const upcoming = UPCOMING.find((u) => u.number === chapter.number + 1)
  const found = app.save.diary.length
  const card = h(
    'div',
    { class: 'card chapter-card' },
    h('div', { class: 'muted', text: `Chapter ${roman(chapter.number)} complete` }),
    h('h2', { text: chapter.title }),
    h('p', { text: `Diary pages found: ${found} of ${DIARY.length}` }),
    next
      ? h('p', { class: 'muted', text: `Chapter ${roman(next.number)}, ${next.title}, is open.` })
      : upcoming
        ? h('p', { class: 'muted', text: `Chapter ${roman(upcoming.number)}, ${upcoming.title}, is still being written.` })
        : null,
    h('p', { class: 'whisper', text: 'Something on the title page has changed.' }),
    h(
      'div',
      { class: 'row' },
      next ? button(`Begin Chapter ${roman(next.number)} →`, () => app.startLevel(next.levels[0]), 'btn primary') : null,
      button('Share', () => app.share(), next ? 'btn' : 'btn primary'),
      button('Diary', () => app.showDiary(() => app.showTitle()), 'btn'),
      button('Title', () => app.showTitle(), 'btn'),
    ),
  )
  card.style.animationDelay = `${0.6 + text.length * 1.8}s`
  return h('div', { class: 'screen dark-screen chapter-end' }, h('div', { class: 'dark-lines' }, ...lines), card)
}
