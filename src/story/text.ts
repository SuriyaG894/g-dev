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
  same: 'That changes nothing. Some words look the same in any mirror.',
  carrying: 'Your quill already holds a name. Give it to something first.',
  empty: 'Your quill holds no name. Lift one off something first.',
  fixed: 'That word can’t be respelled. It can only be named.',
  apart: 'Too far apart to fold. Words have to be close, or face each other across the crease.',
}

export const TAB_WHISPERS = ['Come back…', 'The Blot is waiting.', 'Don’t leave me on this page.', 'Are you still reading?', 'What are you called, out there?']

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
  {
    id: 'diary-4',
    title: 'The diary itself',
    body: [
      'Mira liked to read words backwards to make me laugh.',
      '“Stressed is desserts,” she said, “if you turn it round.”',
      'I have been turning everything round ever since,',
      'looking for the side of it that isn’t so heavy.',
      '— A.',
    ],
  },
  {
    id: 'diary-5',
    title: 'A page from the locked chest',
    body: [
      'Mira gave everything in the ward a name.',
      'The drip stand was Tall Geoffrey. The night nurse was the Gentle Lion.',
      '“If you give a thing a name,” she said, “it has to be kind to you.”',
      'Afterwards, I tried it on the dark. The dark didn’t answer.',
      '— A.',
    ],
  },
  {
    id: 'diary-6',
    title: 'A page folded inside a shell',
    body: [
      'We folded paper boats from the get-well cards and sailed them down the ward.',
      'Mira said every fold is a promise: the paper remembers it, even flattened out.',
      'I have unfolded this book a hundred times, looking for the crease where she is.',
      'It is still there. I can feel it with my thumb.',
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
  4: [
    'The storm stops at the edge of the sand.',
    'In its eye, two pale lights blink, and look away.',
    'The desert was only ever a reflection of something.',
    'Ahead, a city is being written in ink.',
  ],
  5: [
    'The last lamp in the city comes on by itself.',
    'Under it, somebody has chalked a name on the cobbles: MIRA.',
    'The Blot creeps up to the word, slowly, and does not touch it.',
    'Beyond the rooftops, the page smells of salt.',
  ],
  6: [
    'The inkblot dries on the folded page, the same on both sides.',
    'Look at it long enough and it is two people, holding hands across the crease.',
    'Then it is only ink again.',
    'After the sea, there are no more pages. Only white.',
  ],
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}
