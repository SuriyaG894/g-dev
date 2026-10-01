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
  {
    id: 'diary-7',
    title: 'A page from the stuck drawer',
    body: [
      'I stopped writing on page two hundred and twelve.',
      'Every time I tried to write the end, the ink spread, and spread, until there was nothing on the page but black.',
      'I think that is what the Blot is. What an ending looks like, when nobody will write it.',
      '— A.',
    ],
  },
  {
    id: 'diary-8',
    title: 'The page under her pillow',
    body: [
      'This one isn’t mine. It’s Mira’s, in pencil.',
      '“Dear whoever finishes the book. Don’t let it end sad. And if it does, write it again.”',
      'In the corner she has drawn a little figure made of ink, with a red scarf.',
      '— M.',
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
  8: [
    'The pencil drawing smiles up from the back of the card.',
    'Far ahead, on page two hundred and twelve, the Blot shivers, and does not know why.',
    'Endings can be changed, if they are written in pencil.',
    'Now you know what the last word should be.',
  ],
}

/** The last page: you write the last word, and the word decides how the book ends. */
export const LAST_PAGE = [
  'Page two hundred and twelve is blank.',
  'The Blot has stopped at its edge, as if it were waiting to see what you will write.',
  'The Author’s pen is lying on the page. It still has ink in it.',
  'Write the last word.',
]

export interface Ending {
  title: string
  lines: string[]
}

export const ENDINGS: Record<string, Ending> = {
  HOPE: {
    title: 'The Hopeful Ending',
    lines: [
      'You write HOPE, and the page holds its breath.',
      'The Blot creeps to the edge of the word, and stops. It is only ink. It has always been only ink.',
      'Somewhere outside the book, a pencil is picked up again.',
      'The Author has started a new page.',
    ],
  },
  HOME: {
    title: 'The Homeward Ending',
    lines: [
      'You write HOME.',
      'The pages turn back, all of them, faster and faster, to the Margin Woods, where you first woke up.',
      'The bear is a bear again. The bridge is a bridge. Everything remembers its first word.',
      'The book closes, gently, like a door at night.',
    ],
  },
  OPEN: {
    title: 'The Open Ending',
    lines: [
      'You write OPEN.',
      'The last page doesn’t end. It goes on, white and wide, and the Blot draws back from it.',
      'The book will never be finished. Whoever reads it next can write the next word.',
      'Somewhere, someone turns the page.',
    ],
  },
  MIRA: {
    title: 'The True Ending',
    lines: [
      'You write MIRA.',
      'The Blot shudders, and folds, and is a drawing in pencil of a girl with her arms out, a little smudged.',
      'It was never eating the book. It was the shape grief makes, when it has no word to be.',
      '“Endings can’t be changed,” the Author told her, once. “Then write it in pencil,” she said.',
      'The Author did. You are what they wrote. And now the book is finished.',
    ],
  },
}

/** What the Author says to a last word that isn't an ending. */
export const NOT_AN_ENDING = {
  nope: 'Not that. Not after all this.',
  word: 'That’s a word. It isn’t an ending.',
  nonsense: 'That isn’t a word. The Blot would like that.',
  short: 'An ending needs more than that.',
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}
