import type { App } from '../app'
import type { LevelDef } from '../game/types'
import { isRealWord } from '../game/lexicon'
import { ALL_LEVELS, CHAPTERS, SECRET, UPCOMING, chapterLabel, chapterOf, type ChapterInfo } from '../levels'
import { CHAPTER_ENDS, DIARY, ENDINGS, LAST_PAGE, NOT_AN_ENDING, PROLOGUE } from '../story/text'
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
        app.secret('title-L')
        if (!app.save.completed.includes('1-5')) {
          app.sound.play('refuse')
          app.notes.say('Not yet. Come back when you can write.', { urgent: true })
        } else if (app.pastPageOpen) {
          app.sound.play('chime')
          app.notes.say('The past is open. It’s in the book, after the last chapter.', { urgent: true })
        } else {
          app.sound.play('pluck')
          picker.classList.toggle('open')
          picker.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
        }
      } else app.sound.play('pluck')
    })
    word.append(span)
  })
  if (app.save.completed.includes('1-5') && !app.pastPageOpen) letters.classList.add('stirring')

  // Rewriting the title: THE ?AST PAGE. One letter opens the past.
  const lSpan = () => letters.querySelector<HTMLElement>('.tl-l')
  const picker = h('div', { class: 'letter-picker', attrs: { role: 'group', 'aria-label': 'Write a letter in place of the L' } })
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    picker.append(
      button(ch, () => {
        const span = lSpan()
        if (!span) return
        const word = `${ch}AST`
        span.textContent = ch
        span.classList.remove('wobble')
        void span.offsetWidth
        span.classList.add('wobble')
        if (ch === 'P') {
          app.sound.play('diary')
          app.secret('past-page')
          picker.classList.remove('open')
          letters.classList.remove('stirring')
          letters.classList.add('past')
          letters.setAttribute('aria-label', 'The Past Page')
          app.notes.say('THE PAST PAGE. It was there all along, one letter away. It’s in the book now.', { urgent: true })
          menu.prepend(button('★ The Past Page', () => app.showBook(SECRET), 'btn primary'))
          return
        }
        app.sound.play(isRealWord(word) ? 'whisper' : 'refuse')
        app.notes.say(ch === 'L' ? 'The last page. Yes. That’s the one you know.' : isRealWord(word) ? `THE ${word} PAGE? No. But close.` : 'That isn’t a word.', { urgent: true })
        window.setTimeout(() => {
          if (span.textContent === ch) span.textContent = 'L'
        }, 1400)
      }, 'lp-letter', { 'aria-label': `Write ${ch}` }),
    )
  }

  const next = app.nextUnfinished()
  const started = app.save.completed.length > 0 || app.save.seenPrologue
  const menu = h(
    'div',
    { class: 'menu' },
    app.save.endings.length && app.save.completed.length >= ALL_LEVELS.length
      ? button('Write the last page again', () => app.showLastPage(), 'btn primary')
      : button(started ? `Continue · ${next.title}` : 'Begin reading', () => app.begin(), 'btn primary'),
    app.pastPageOpen ? button('★ The Past Page', () => app.showBook(SECRET), 'btn') : null,
    button('Pages', () => app.showBook(), 'btn'),
    button('Diary', () => app.showDiary(() => app.showTitle()), 'btn'),
    button('Settings', () => app.showSettings(() => app.showTitle()), 'btn'),
  )
  return h(
    'div',
    { class: 'screen title-screen' },
    h('div', { class: 'title-kicker', text: 'an unfinished storybook' }),
    letters,
    picker,
    h('p', { class: 'tagline', text: 'Every world is written. Every word can be unwritten.' }),
    menu,
    h('div', {
      class: 'title-foot',
      text: `v${__VERSION__} · Seven chapters${app.pastPageOpen ? ', and a secret' : ''}${app.save.endings.length ? ` · Endings found: ${app.save.endings.length} of ${Object.keys(ENDINGS).length}` : ''} · Headphones recommended`,
    }),
  )
}

// -------------------------------------------------------------------- book

/** A page is open once the page before it (in reading order) is finished. */
export function isOpen(app: App, lvl: LevelDef): boolean {
  const s = SECRET.levels.indexOf(lvl)
  if (s >= 0) return app.pastPageOpen && (s === 0 || app.save.completed.includes(lvl.id) || app.save.completed.includes(SECRET.levels[s - 1].id))
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
    ...[...CHAPTERS, ...(app.pastPageOpen ? [SECRET] : [])].map((c) => {
      const open = isOpen(app, c.levels[0])
      const b = button(`${chapterLabel(c.number)} · ${c.title}`, () => app.showBook(c, true), 'tab' + (c === ch ? ' on' : '') + (c === SECRET ? ' secret' : ''), {
        role: 'tab',
        'aria-selected': String(c === ch),
      })
      if (!open) {
        b.disabled = true
        b.textContent = `${chapterLabel(c.number)} · locked`
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
        h('div', { class: 'bl-kicker', text: ch === SECRET ? 'The secret chapter' : `Chapter ${roman(ch.number)}` }),
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
        h('p', { text: 'F (or Q): turn time, Then ↔ Now, in the Clockwork Tower' }),
        h('p', { text: 'In the Mirror Desert, the quill can ⇄ swap two letters or ◐ mirror a whole word' }),
        h('p', { text: 'In the City of Ink, ⤴ lift a name (FROZEN, TALL…) off one thing and ✒ name another with it. Y: your own word' }),
        h('p', { text: 'On the Folded Sea, ⧉ fold two words into one (SUN + FLOWER). Words facing each other across the crease can fold however far apart they are' }),
      ),
      app.canInstall ? button('Install the book as an app', () => void app.install(), 'btn') : null,
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
    h('div', { class: 'muted', text: chapter === SECRET ? 'The Past Page, read' : `Chapter ${roman(chapter.number)} complete` }),
    h('h2', { text: chapter.title }),
    h('p', { text: `Diary pages found: ${found} of ${DIARY.length}` }),
    next
      ? h('p', { class: 'muted', text: `Chapter ${roman(next.number)}, ${next.title}, is open.` })
      : upcoming
        ? h('p', { class: 'muted', text: `Chapter ${roman(upcoming.number)}, ${upcoming.title}, is still being written.` })
        : null,
    chapter === SECRET ? null : h('p', { class: 'whisper', text: 'Something on the title page has changed.' }),
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

// --------------------------------------------------------------- the end

/** Page two hundred and twelve: write the last word. */
export function lastPageScreen(app: App): HTMLElement {
  const lines = LAST_PAGE.map((l, i) => {
    const p = h('p', { text: l })
    p.style.animationDelay = `${0.6 + i * 1.6}s`
    return p
  })
  const all = DIARY.every((d) => app.save.diary.includes(d.id))
  const tiles = [...'HOPEMN', ...(all ? 'IRA' : '')]
  const word: number[] = []
  const slot = h('div', { class: 'end-slot', attrs: { 'aria-live': 'polite', 'aria-label': 'The last word' } })
  const msg = h('p', { class: 'end-msg', text: ' ' })
  const tileRow = h('div', { class: 'end-tiles', attrs: { role: 'group', 'aria-label': 'Letters' } })
  const buttons = tiles.map((ch, i) => {
    const b = button(ch, () => {
      if (word.includes(i) || word.length >= 5) return
      word.push(i)
      app.sound.play('place')
      draw()
    }, 'end-tile' + (i >= 6 ? ' gold' : ''), { 'aria-label': `Write ${ch}` })
    tileRow.append(b)
    return b
  })
  const draw = () => {
    slot.replaceChildren(...Array.from({ length: Math.max(4, word.length) }, (_, k) => h('span', { class: 'end-cell' + (word[k] !== undefined ? ' full' : ''), text: word[k] !== undefined ? tiles[word[k]] : '' })))
    buttons.forEach((b, i) => (b.disabled = word.includes(i)))
    msg.textContent = ' '
  }
  const text = () => word.map((i) => tiles[i]).join('')
  const write = () => {
    const w = text()
    if (ENDINGS[w] && (w !== 'MIRA' || all)) return app.finishBook(w)
    app.sound.play('refuse')
    msg.textContent = w.length < 3 ? NOT_AN_ENDING.short : w === 'NOPE' ? NOT_AN_ENDING.nope : isRealWord(w) ? NOT_AN_ENDING.word : NOT_AN_ENDING.nonsense
  }
  draw()
  const card = h(
    'div',
    { class: 'card end-card' },
    slot,
    tileRow,
    msg,
    h(
      'div',
      { class: 'row' },
      button('⌫', () => {
        word.pop()
        app.sound.play('pluck')
        draw()
      }, 'btn', { 'aria-label': 'Rub out the last letter' }),
      button('Write it', write, 'btn primary'),
    ),
    all ? h('p', { class: 'whisper', text: 'Every diary page is found. There are three letters more than there were.' }) : null,
  )
  card.style.animationDelay = `${0.6 + LAST_PAGE.length * 1.6}s`
  return h('div', { class: 'screen dark-screen chapter-end last-page' }, h('div', { class: 'dark-lines' }, ...lines), card)
}

/** How the book ends, for the word you wrote. */
export function endingScreen(app: App, word: string): HTMLElement {
  const ending = ENDINGS[word]
  const lines = ending.lines.map((l, i) => {
    const p = h('p', { text: l })
    p.style.animationDelay = `${0.6 + i * 2}s`
    return p
  })
  const total = Object.keys(ENDINGS).length
  const all = DIARY.every((d) => app.save.diary.includes(d.id))
  const card = h(
    'div',
    { class: 'card chapter-card end-card' },
    h('div', { class: 'the-end', text: 'The End' }),
    h('h2', { text: ending.title }),
    h('p', { class: 'muted', text: `Endings found: ${app.save.endings.length} of ${total}` }),
    word === 'MIRA'
      ? h('p', { class: 'whisper', text: 'Thank you for reading.' })
      : h('p', { class: 'whisper', text: all ? 'There is one more word. You have every letter of it now.' : `There is another ending. It needs every diary page (${app.save.diary.length} of ${DIARY.length}).` }),
    h(
      'div',
      { class: 'row' },
      button('Share your ending', () => app.share(`I finished The Last Page with the ${ending.title.toLowerCase()}. What will you write on the last page?`), 'btn primary'),
      button('Write it again', () => app.showLastPage(), 'btn'),
      button('Title', () => app.showTitle(), 'btn'),
    ),
  )
  card.style.animationDelay = `${0.6 + ending.lines.length * 2}s`
  return h('div', { class: 'screen dark-screen chapter-end' + (word === 'MIRA' ? ' true-end' : '') }, h('div', { class: 'dark-lines' }, ...lines), card)
}
