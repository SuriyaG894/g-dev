import type { LevelDef, WordDef } from '../game/types'

const NAME = ['pluck', 'place', 'mirror', 'name'] as LevelDef['powers']

/** An adjective, starting out on the thing called `of`. */
function adj(id: string, text: string, of: string, gold = false): WordDef {
  return { id, text, of, x: 0, y: 0, gold }
}

/** Page 1: names can be lifted off one thing and given to another. */
const signs: LevelDef = {
  id: '5-1',
  chapter: 5,
  page: 1,
  title: 'Signs',
  subtitle: 'the gates of the City of Ink',
  theme: 'city',
  width: 2400,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 160 },
  terrain: [
    { x: 0, y: 460, w: 600, h: 80 },
    { x: 860, y: 460, w: 940, h: 80 },
    { x: 1800, y: 160, w: 600, h: 380 },
  ],
  words: [
    { id: 'sign', text: 'SIGN', x: 330, y: 460 },
    adj('frozen', 'FROZEN', 'sign'),
    { id: 'canal', text: 'CANAL', x: 730, y: 540, tune: { CANAL: { ly: 432 } } },
    { id: 'wall', text: 'WALL', x: 1200, y: 460 },
    adj('tall', 'TALL', 'wall'),
    { id: 'ladder', text: 'LADDER', x: 1778, y: 460 },
  ],
  powers: NAME,
  quill: 3,
  par: 4,
  checkpoints: [{ x: 900, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'The City of Ink. Every lamp, every door, every stone here wears a name.' },
    { when: { x: 200 }, text: 'A frozen sign. The frost isn’t the sign’s, though. It belongs to the word: FROZEN.' },
    { when: { event: 'lift' }, text: 'A name, in your quill. Now give it to something that needs it more.' },
    { when: { word: 'FROZEN CANAL' }, text: 'Frozen solid. Ice holds ink up nicely.' },
    { when: { x: 1000 }, text: 'A tall wall. Take away the TALL, and it’s only a wall.' },
    { when: { x: 1480 }, text: 'And that ladder is too short. If only it were… taller.' },
    { when: { word: 'TALL LADDER' }, text: 'Names are only words. Words can be moved.' },
  ],
  hints: [
    'Open FROZEN (the small word above the sign) and press ⤴ Lift. Then open the canal and name it.',
    'Lift TALL off the wall. The wall shrinks to something you can jump.',
    'A TALL LADDER reaches the ledge.',
  ],
  solution: [
    { type: 'lift', word: 'frozen' },
    { type: 'name', word: 'canal' },
    { type: 'lift', word: 'tall' },
    { type: 'name', word: 'ladder' },
  ],
}

/** Page 2: a name is still a word. Respell it. */
const market: LevelDef = {
  id: '5-2',
  chapter: 5,
  page: 2,
  title: 'Market Street',
  subtitle: 'where every stall has a sign',
  theme: 'city',
  width: 2300,
  spawn: { x: 90, y: 460 },
  exit: { x: 2200, y: 280 },
  terrain: [
    { x: 0, y: 460, w: 1100, h: 80 },
    { x: 1100, y: 280, w: 1200, h: 260 },
  ],
  words: [
    { id: 'shop', text: 'SIGN', x: 250, y: 460 },
    adj('open', 'OPEN', 'shop'),
    { id: 'chest', text: 'CHEST', x: 500, y: 460 },
    { id: 'butcher', text: 'SIGN', x: 760, y: 460 },
    adj('meat', 'MEAT', 'butcher'),
    { id: 'lion', text: 'LION', x: 1030, y: 460 },
  ],
  diary: { id: 'diary-5', x: 500, y: 424, requires: 'OPEN CHEST' },
  powers: NAME,
  quill: 3,
  par: 4,
  notes: [
    { when: { start: 1 }, text: 'Market Street. Every stall has a sign, and every sign has a word on it.' },
    { when: { x: 380 }, text: 'A chest, locked tight. I kept my diary in one like that.' },
    { when: { word: 'OPEN CHEST' }, text: 'Open. Of course. A shop sign doesn’t need to be open. A chest does.' },
    { when: { x: 620 }, text: 'The butcher’s sign. MEAT. Not an adjective, but its letters are good ones.' },
    { when: { word: 'TAME' }, text: 'TAME. Now there’s a word worth hanging on something.' },
    { when: { x: 860 }, text: 'A lion guards the stair. It looks hungry. It looks… wild.' },
    { when: { word: 'TAME LION' }, text: 'Tame as a kitten. It doesn’t mind being stood on.' },
  ],
  hints: [
    'Names are words, so the quill can respell them. Mirror MEAT, then swap the last two letters.',
    'Lift TAME and name the lion with it. A tame lion is a step up.',
    'The OPEN on the shop sign could open something else.',
  ],
  solution: [
    { type: 'mirror', word: 'meat' },
    { type: 'swap', word: 'meat', i: 2, j: 3 },
    { type: 'lift', word: 'meat' },
    { type: 'name', word: 'lion' },
  ],
}

/** Page 3: night. Light is a name, too, and so are you. */
const afterDark: LevelDef = {
  id: '5-3',
  chapter: 5,
  page: 3,
  title: 'After Dark',
  subtitle: 'the lamps are out',
  theme: 'city',
  width: 2600,
  dark: true,
  you: true,
  spawn: { x: 90, y: 460 },
  exit: { x: 2500, y: 460 },
  terrain: [
    { x: 0, y: 460, w: 1300, h: 80 },
    { x: 1560, y: 460, w: 1040, h: 80 },
  ],
  water: [{ x: 1300, y: 478, w: 260, h: 62 }],
  words: [
    { id: 'lamp', text: 'LAMP', x: 300, y: 460, tune: { LAMP: { ly: 420 } } },
    adj('broken', 'BROKEN', 'lamp'),
    { id: 'gate', text: 'GATE', x: 520, y: 460 },
    { id: 'window', text: 'WINDOW', x: 900, y: 330 },
    adj('lit', 'LIT', 'window'),
    { id: 'bridge', text: 'BRIDGE', x: 1430, y: 480, tune: { BRIDGE: { w: 300 } } },
    adj('cracked', 'BROKEN', 'bridge'),
  ],
  powers: NAME,
  quill: 3,
  par: 5,
  checkpoints: [{ x: 700, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'Night in the city. The lamps are out.' },
    { when: { start: 4 }, text: 'Not out. BROKEN. Someone has written BROKEN on the lamp.' },
    { when: { word: 'LAMP' }, text: 'Light! BROKEN was only a word, and words come off.' },
    { when: { word: 'BROKEN GATE' }, text: 'A broken gate is only a gap with ideas.' },
    { when: { x: 720 }, text: 'A lit window, high up. Somebody is still awake in there.' },
    { when: { word: 'LIT YOU' }, text: 'You’re glowing. In the City of Ink, even you are only a word, and a word can be named.' },
    { when: { x: 1120 }, text: 'The bridge is out, I think. I can’t see. I can’t see anything.' },
    { when: { word: 'BRIDGE' }, text: 'Mended. Nothing was ever wrong with it but its name.' },
  ],
  hints: [
    'The lamp is only BROKEN because it says so. Lift the word off.',
    'BROKEN, on the gate, makes a way through.',
    'Lift LIT from the window, then open your own word (click YOU, or press Y) and name yourself.',
    'Then you can see the bridge. Lift BROKEN off it.',
  ],
  solution: [
    { type: 'lift', word: 'broken' },
    { type: 'name', word: 'gate' },
    { type: 'lift', word: 'lit' },
    { type: 'name', word: 'you' },
    { type: 'lift', word: 'cracked' },
  ],
}

/** Page 4: the tiny door. */
const tinyDoor: LevelDef = {
  id: '5-4',
  chapter: 5,
  page: 4,
  title: 'The Tiny Door',
  subtitle: 'too small for anyone',
  theme: 'city',
  width: 2400,
  you: true,
  spawn: { x: 90, y: 460 },
  exit: { x: 2300, y: 380 },
  terrain: [
    { x: 0, y: 460, w: 800, h: 80 },
    { x: 1000, y: 460, w: 1400, h: 80 },
    // A house wall, with a mouse-hole underneath.
    { x: 1500, y: 0, w: 80, h: 436 },
    { x: 1900, y: 380, w: 500, h: 160 },
  ],
  words: [
    { id: 'cat', text: 'CAT', x: 500, y: 460 },
    adj('giant', 'GIANT', 'cat'),
    { id: 'key', text: 'KEY', x: 740, y: 460, tune: { KEY: { w: 70 }, 'GIANT KEY': { x: 900, y: 514 } } },
    { id: 'bottle', text: 'BOTTLE', x: 1200, y: 460 },
    adj('tiny', 'TINY', 'bottle'),
    { id: 'door', text: 'DOOR', x: 1540, y: 460, gold: true, tune: { 'TINY DOOR': { w: 18, h: 24 } } },
    adj('wee', 'TINY', 'door', true),
  ],
  powers: NAME,
  quill: 3,
  par: 5,
  checkpoints: [{ x: 1050, y: 460 }],
  notes: [
    { when: { start: 1 }, text: 'This street ends in a wall. The wall has a door. The door is tiny.' },
    { when: { x: 260 }, text: 'A giant cat. It isn’t moving. Cats don’t.' },
    { when: { word: 'CAT' }, text: 'Just a cat. It was only giant because somebody said so.' },
    { when: { x: 640 }, text: 'A little key, by a big gap. Small keys open small doors. Big keys…' },
    { when: { word: 'GIANT KEY' }, text: '…make bridges.' },
    { when: { x: 1080 }, text: 'A little bottle. DRINK ME, it says. I always wanted to write that.' },
    { when: { x: 1360 }, text: 'The door is written in gold. TINY, forever. So it isn’t the door that has to change.' },
    { when: { word: 'TINY YOU' }, text: 'Tiny! Mind the mice.' },
    { when: { x: 1640 }, text: 'You’ll want your full height for that step. Your name is yours to take back.' },
  ],
  hints: [
    'Lift GIANT off the cat, and give it to the key.',
    'TINY, from the bottle, would suit you. Open your own word (YOU, or press Y) to be named.',
    'Once you’re through the door, lift TINY off yourself.',
  ],
  solution: [
    { type: 'lift', word: 'giant' },
    { type: 'name', word: 'key' },
    { type: 'lift', word: 'tiny' },
    { type: 'name', word: 'you' },
    { type: 'lift', word: 'tiny' },
  ],
}

/** Page 5: the Blot comes to town. It can read, too. */
const streets: LevelDef = {
  id: '5-5',
  chapter: 5,
  page: 5,
  title: 'Ink in the Streets',
  subtitle: 'the heart of the city',
  theme: 'city',
  width: 3200,
  spawn: { x: 150, y: 460 },
  exit: { x: 3100, y: 160 },
  terrain: [
    { x: 0, y: 460, w: 1520, h: 80 },
    { x: 1520, y: 160, w: 580, h: 380 },
    { x: 2220, y: 160, w: 980, h: 380 },
  ],
  words: [
    { id: 'sign', text: 'SIGN', x: 420, y: 460 },
    adj('slow', 'SLOW', 'sign'),
    { id: 'lift', text: 'LIFT', x: 1475, y: 460, tune: { LIFT: { y: 476, dy: -300, speed: 40 } } },
    adj('broken', 'BROKEN', 'lift'),
    { id: 'gate', text: 'GATE', x: 2650, y: 160 },
  ],
  powers: NAME,
  quill: 3,
  par: 4,
  blot: { x: -260, speed: 150, delay: 2.5, named: true },
  notes: [
    { when: { start: 0.8 }, text: 'It’s here. The Blot, in the streets. Run!' },
    { when: { x: 300 }, text: 'SLOW, says the sign. Slow for whom?' },
    { when: { start: 4.5 }, text: 'Wait. The Blot is a word too. Look at it. Let it come closer…' },
    { when: { word: 'SLOW BLOT' }, text: 'SLOW. It hates that. It can read, you know.' },
    { when: { x: 1200 }, text: 'The lift is BROKEN. Of course it is.' },
    { when: { word: 'LIFT' }, text: 'Going up. Slowly. Very slowly.' },
    { when: { x: 2400 }, text: 'One last gate. You know what to do with gates.' },
  ],
  hints: [
    'Lift SLOW from the sign, wait for the Blot to come within reach, and name it.',
    'Lift BROKEN off the lift. It is far too slow to ride with the Blot at full speed.',
    'Name the gate BROKEN.',
  ],
  solution: [
    { type: 'lift', word: 'slow' },
    { type: 'name', word: 'blot' },
    { type: 'lift', word: 'broken' },
    { type: 'name', word: 'gate' },
  ],
}

export const CHAPTER_5: LevelDef[] = [signs, market, afterDark, tinyDoor, streets]
