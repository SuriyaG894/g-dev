// Builds src/data/words.txt — the dictionary of "real" words.
// Real words that have no special shape in the lexicon become harmless whispers;
// anything else becomes wild ink (a scribble). Run: node scripts/build-dict.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const dir = 'node_modules/wordlist-english/'
const lists = ['english-words-10', 'english-words-20', 'english-words-35', 'american-words-10', 'american-words-20', 'american-words-35']
// Words the story relies on that the frequency lists miss.
const EXTRA = ['A', 'I', 'TROPE']
// Crude words and slurs never float up as whispers: they read as nonsense, like any other non-word.
const BLOCK = new Set(
  'ANAL ANUS ARSE ASS BASTARD BITCH BOOB BOOBS COCK CUNT DICK FAG FAGGOT FUCK HOOKER NIGGER NIPPLE ORGASM PENIS PISS PORN RAPE RAPED RAPES RAPIST RETARD SCROTUM SEX SEXY SHIT SLUT SPERM TIT TITS VAGINA WHORE'.split(' '),
)
const words = new Set(EXTRA)
for (const name of lists) {
  for (const w of JSON.parse(readFileSync(dir + name + '.json', 'utf8'))) {
    if (/^[a-z]{2,9}$/.test(w) && !BLOCK.has(w.toUpperCase())) words.add(w.toUpperCase())
  }
}
const sorted = [...words].sort()
writeFileSync('src/data/words.txt', sorted.join('\n') + '\n')
console.log(`wrote ${sorted.length} words`)
