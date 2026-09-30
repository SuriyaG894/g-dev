/** The Author's voice: margin notes that aren't tied to one page, the prologue, and the diary. */

export const PROLOGUE = [
  'This book was never finished.',
  'Its Author stopped writing on page two hundred and twelve,',
  'and something has been eating the pages ever since.',
  'Every world in it is written.',
  'Every word can be unwritten.',
  'And now… someone is reading.',
]

export const EVENT_NOTES = {
  scribble: [
    'That’s not a word. Wild ink bites.',
    'Nonsense keeps the shape, but not the meaning. Don’t touch it.',
    'Wild ink. I made a lot of that, at the end.',
  ],
  whisper: [
    'That’s a word. I just never gave it a shape.',
    'A real word, floating. Harmless. Useless. Like me, lately.',
  ],
  death: ['Ink runs. Try again.', 'You smudged. It happens.', 'Careful. I only have so much ink.', 'Again. I’ll wait.'],
  far: 'Too far. The quill only reaches so far.',
  dark: 'Too dark to read that. Find some light.',
  gold: 'That word is written in gold. Even I can’t change it.',
  full: 'Your quill is full. Write a letter somewhere, or shake one off.',
  short: 'A word needs at least one letter to exist.',
  blotDeath: 'It took the whole page. Start again. Quicker this time.',
  pageDeath: 'The page starts over. Everything remembers where it was.',
  returned: 'You left. I noticed.',
  echo: 'That grew from something Then. Change it in the past.',
  blocked: 'You can’t be there, in that time. Something is in the way.',
  grew: 'Somewhere, Now, something just changed.',
}

export const TAB_WHISPERS = ['Come back…', 'The Blot is waiting.', 'Don’t leave me on this page.', 'Are you still reading?']

export interface DiaryEntry {
  id: string
  title: string
  body: string[]
}

export const DIARY: DiaryEntry[] = [
  {
    id: 'diary-1',
    title: 'Page from the Author’s diary',
    body: [
      'I promised Mira I would finish this book by her birthday.',
      'She said the best stories are the ones where you can change the ending.',
      'I told her endings can’t be changed.',
      'She laughed and said, “Then write it in pencil.”',
      '— A.',
    ],
  },
  {
    id: 'diary-2',
    title: 'Another page from the diary',
    body: [
      'Mira was in hospital again. I read her the first chapter.',
      'She asked what the Blot was. I said it was only a spill.',
      'She said, “Spills don’t have eyes.”',
      'I have never drawn it eyes.',
      '— A.',
    ],
  },
  {
    id: 'diary-3',
    title: 'A page hidden in the past',
    body: [
      'The clock in the hospital corridor was always four minutes fast.',
      'I set my watch by it, so I would have four more minutes with her.',
      'On the last day I didn’t look at the clock at all.',
      'I have been trying to get those four minutes back ever since.',
      '— A.',
    ],
  },
]

export const CHAPTER_ENDS: Record<number, string[]> = {
  1: [
    'The Blot stops at the edge of the page.',
    'It doesn’t follow.',
    'It waits, as if it were listening.',
    'Somewhere in the dark, a pencil begins to move.',
  ],
  2: [
    'The water goes still. The library is quiet.',
    'High in the rafters, the Librarian writes one new word in gold:',
    'REMEMBER.',
    'Far below, something black is learning to swim.',
  ],
  3: [
    'Every clock in the tower strikes midnight at once.',
    'For one long second, Then and Now are the same moment.',
    'The Reader sees two people at a bedside, a book open between them.',
    'Then the hands move on.',
  ],
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}
