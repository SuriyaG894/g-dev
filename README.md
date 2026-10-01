# The Last Page

> *Every world is written. Every word can be unwritten.*

A mysterious puzzle adventure that runs in the browser. You're a small ink figure trapped in an unfinished storybook, and you change the world by editing its words. Pluck the **B** out of **BRIDGE** and it becomes a **RIDGE** you can climb. **FIRE** becomes a **FIR** tree. Put a stray **L** in front of **ADDER** and you have a **LADDER**.

**v1.0 is the whole book: seven chapters, 35 pages, four endings, and a secret chapter.**
- **Chapter I, *The Margin Woods*:** pluck and place letters; darkness; the first appearance of the Blot.
- **Chapter II, *The Drowned Library*:** tides that raise and lower the water, things that float and swim, lost letters to catch, gold words nobody can change, the Librarian (a guardian you can only distract), and a vertical escape from a rising FLOOD.
- **Chapter III, *The Clockwork Tower*:** **Then & Now**. Press **F** to turn time. Every page exists twice; bridges stand Then and are gone Now, iron rusts, and what you change in the past grows up (SEED → TREE, CUB → BEAR, SPARK → FIRE). At *Midnight*, the clock turns time by itself.
- **Chapter IV, *The Mirror Desert*:** **Mirror & Swap**. ◐ Mirror reverses a word (RATS → STAR, WOLF → FLOW), ⇄ Swap trades two letters (SALT → SLAT, PALM ↔ LAMP). Backwards *mirages* are only reflections until you turn them round, a Sphinx asks riddles you answer by making words, and a sandstorm chases you, unless you read the signs.
- **Chapter V, *The City of Ink*:** **Name**. Adjectives are words too: ⤴ lift FROZEN off a sign and ✒ name the canal with it, and the water turns to ice. Respell a name (MEAT → TAME) to calm a lion, take BROKEN off a lamp to light the street, and name *yourself*: LIT YOU glows, TINY YOU fits through a tiny door. In the finale, even the Blot can be named.
- **Chapter VI, *The Folded Sea*:** **Fold**. ⧉ Fold two words into one: RAIN + BOW → a RAINBOW bridge, JELLY + FISH → a bouncy JELLYFISH, HORSE + SEA → a SEAHORSE to ride. Pages have a *crease*: words facing each other across it can be folded together however far apart they are, and every word shows faintly through the paper, back to front, where it would touch. In the finale you fold INK into the Blot and it dries into an INKBLOT: only a picture.
- **Chapter VII, *The Blank*:** every power at once, while the book is being unwritten: write lost letters back, plant a seed in the past where Now has been rubbed out, read a nonsense name in a mirror (NEPO GATE), fold facing pages into a STAIRCASE and a BOOKMARK, and outrun the Blot to page two hundred and twelve, where you write the last word yourself. HOPE, HOME and OPEN each end the book differently; a fourth, true ending needs every diary page.
- **★ *The Past Page* (secret):** the title can be rewritten. One letter changed opens a short chapter set where the book was written.

Eight hidden diary pages continue the Author's story.

## Play locally

```bash
npm install
npm run dev        # http://localhost:5173
```

In dev mode you can jump straight to a page with `?level=2-5`, and press <kbd>`</kbd> to show hitboxes.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Rule tests plus a bot that completes every page through the real physics |
| `npm run build` | Type-check, then build a static site into `dist/` |
| `npm run preview` | Serve the production build locally |

## Controls

- **Walk:** ← → or A D
- **Jump:** Space (hold to jump higher)
- **Climb:** ↑ ↓ or W S
- **Turn time (Chapter III):** F or Q, or the ⟲ button
- **Your own word (Chapter V):** Y, or click the YOU above your head
- **Fold (Chapter VI):** open a word, choose ⧉ Fold, and pick which way round to join it with a word nearby (or one facing it across the crease)
- **Edit a word:** click it, or press **E** for the nearest one. Click a letter to pluck it, or click a **+** to write a letter from your quill.
- **Undo:** Z · **Restart:** R · **Hint:** H · **Mute:** M · **Pause:** Esc
- **Touch:** on-screen buttons; tap words to edit them.

## Deploy to Vercel

The game is a static Vite site with no server and no environment variables.

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "The Last Page v0.1"
   git branch -M main
   git remote add origin https://github.com/<you>/the-last-page.git
   git push -u origin main
   ```
2. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the repository.
3. Vercel reads `vercel.json`. Framework **Vite**, build `npm run build`, output `dist`. Click **Deploy**.
4. You get a public URL like `the-last-page.vercel.app`. Add your own domain under **Settings → Domains**.

After that, every push to `main` redeploys the live game, and every other branch or pull request gets its own preview URL.

You can also deploy from the terminal: `npm i -g vercel && vercel --prod`.

## How it's built

| Area | Where |
|---|---|
| Rules, physics, edits (no DOM, fully testable) | `src/game/world.ts`, `src/game/ink.ts` |
| Words and what they become | `src/game/lexicon.ts` |
| Pages | `src/levels/chapter1.ts` … `chapter7.ts`, `pastpage.ts` |
| Hand-drawn renderer (Canvas 2D, wobbly "boiling" ink lines) | `src/render/` |
| Procedural sound and music (Web Audio, no audio files) | `src/audio/sound.ts` |
| Menus, HUD, quill panel, margin notes | `src/ui/` |
| Story text, diary, browser tricks | `src/story/` |

**How a spelling resolves.** A spelling in the lexicon becomes a real thing with a shape and a behaviour. A real English word the lexicon doesn't cover becomes a harmless floating *whisper*. Anything else becomes *wild ink*: it keeps the old shape and it's dangerous. A short blocklist keeps crude words and slurs out of the dictionary, so they read as nonsense. The dictionary (`src/data/words.txt`, about 30k words) is generated by `node scripts/build-dict.mjs` and loaded as a separate chunk.

**Adding a page.** Add a `LevelDef` to `src/levels/`, including its `solution`. `npm test` checks that the solution spells real words in `par` edits, and `tests/playthrough.test.ts` is where you script a bot run through the physics.

See `PLAN.md` for the full design and roadmap, and `IDEAS.md` for the other game concepts.
