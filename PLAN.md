# THE LAST PAGE — Game & Launch Plan

> *"Every world is written. Every word can be unwritten."*

A mysterious puzzle adventure that runs in the browser. You play a small ink figure trapped inside an unfinished storybook, and you change the world by editing the words it's made of. It's free to play, needs no install, works on desktop and mobile, and will be hosted on Vercel.

---

## 1. What makes it stronger than the original idea

| Original idea | Upgraded version |
|---|---|
| Remove letters from words | **5 ink powers** unlocked across the story: Pluck, Place, Mirror (anagram), Fold (merge two pages), Name (attach adjectives) |
| Separate levels | **Pages connect**: change a word on page 3 and page 7 changes too. You flip back through the book to solve later puzzles |
| A villain that erases | **The Blot**, a living ink stain that eats words in real time. You seal it off by writing WALL, DAM, or LIGHT |
| Story told in cutscenes | **Torn diary pages** hidden in levels tell the Author's story in pieces. Collecting all of them opens the true ending |
| One ending | **3 endings** decided by the final word you write (HOPE / HOME / OPEN, plus a secret one) |
| Normal game menus | **Browser tricks** (from idea #2): the title screen's letters can be edited (THE LAST PAGE → THE PAST PAGE opens a secret chapter), the tab title whispers, the Author notices when you leave, and the console holds riddles |

### The ink powers (a new one each chapter)
1. **Pluck**: pull a letter out of a word. `BRIDGE → RIDGE`, `BOAT → BOA`
2. **Place**: put a carried letter into a word. `CAT + R → CART`, `LAMP + C → CLAMP`
3. **Mirror**: rearrange a word. `EVIL → LIVE`, `STAR → RATS`, `NIGHT → THING`
4. **Fold**: fold a page corner to bring words from two pages together. `SUN` + `FLOWER` → `SUNFLOWER`
5. **Name**: attach adjectives to things. `FROZEN` + `LAKE` = a lake you can walk on, `GIANT` + `KEY`

**Rules that keep it a puzzle rather than a sandbox:**
- The quill holds only a few letters (2 at first, 4 later)
- Words not in the game's word list turn into harmless smoke, and the Author leaves a snarky note in the margin
- Each level has a **"Perfect Ink"** target, a par for the fewest edits, for replay value

---

## 2. Story

- **Premise:** The Author of *The Last Page* stopped writing halfway through. The book is falling apart, and the Blot is eating the pages.
- **You:** "The Reader," a small ink figure who wakes up in the margin.
- **Mystery layers:**
  1. Who is erasing the book? (It looks like the Blot.)
  2. The diary pages show the Author lost someone and couldn't finish the story they were writing for them.
  3. The Blot is the Author's grief. It isn't evil, it's just unfinished.
- **Twist:** The Reader is the Author's self-portrait, the one character they drew of themselves. **You are the Author.**
- **Final level:** The page is blank. You write the ending, letter by letter.

---

## 3. Chapters (7 chapters, about 35 levels, plus a secret chapter)

| # | Chapter | New power | Theme / signature puzzle |
|---|---|---|---|
| 1 | **The Margin Woods** ✅ | Pluck, then Place (page 4) | Tutorial forest. `BEAR→EAR`, `BRIDGE→RIDGE`, `KNIGHT→NIGHT`, `BLOAT→BOAT` + `L→LADDER`, `PLANET→PLANE` |
| 2 | **The Drowned Library** ✅ | Tides, lost letters, gold ink | `TRAIN→RAIN` raises the water, `EELS`+`INK`→`SINK` drains it, `CAGE→PAGE` lift, the Librarian lured by `BRING→RING`, `FLOOD→FLOOR` finale |
| 3 | **The Clockwork Tower** ✅ | Then & Now (time flipping) | Every page exists Then and Now. Change the past and it grows up: `SPEED→SEED` (a TREE Now), `CUB+E→CUBE` (no BEAR), `SPARK→PARK` (no FIRE), `DRIP→RIP` (no POND); *Midnight* flips time on its own |
| 4 | **The Mirror Desert** ✅ | Mirror & Swap | Backwards mirages (`EGDIRB→BRIDGE`), `LEMON→MELON`, `PALM↔LAMP`, a riddling Sphinx (`EMIT→TIME`, `ICON→COIN`), a sandstorm you can `STOP` |
| 5 | **The City of Ink** ✅ | Name | Lift an adjective off one thing and name another: `FROZEN CANAL`, `TALL LADDER`, `MEAT→TAME LION`, `BROKEN LAMP→BROKEN GATE`, `LIT YOU`, `GIANT KEY`, `TINY YOU` through a tiny door, and a chase where you name the Blot `SLOW` |
| 6 | **The Folded Sea** ✅ | Fold | Join two words: `RAIN+BOW`, `JELLY+FISH`, `FIRE+FLY`, `SEA+HORSE`. Words facing each other across the page's crease fold however far apart they are (shown through the paper, back to front); *The Folded Sky* folds the ocean onto the sky; the finale folds `INK` into the Blot: an `INKBLOT` |
| 7 | **The Blank** ✅ | All powers | Reprises with a twist (`RIDGE+B`, Now erased, `NEPO GATE`, `STAIR+CASE`, `BOOK+MARK`), the Blot chase to page 212, then you write the last word: `HOPE` / `HOME` / `OPEN`, or `MIRA` with every diary page |
| ★ | **The Past Page** (secret) ✅ | Pluck, Place, Then & Now | Unlocked by rewriting the title's L as P. The ward, a clock four minutes fast, and `END + M = MEND` |

**Each chapter:** 4 puzzle levels, 1 set-piece level (a chase or boss), 1 hidden diary page, and its own music layer.

---

## 4. Game feel and art

- **Art style:** Hand-drawn ink on aged paper. Lines wobble slightly, ink bleeds, and pages have coffee stains. Mostly black and sepia, with **one accent color per chapter** (green woods, teal library, brass tower, and so on).
- **Words are physical:** They sit in the world as letter blocks that sway, drip, and crumble. A changed word re-inks itself into the new object with a "writing" animation.
- **Editing mode:** Clicking a word (or pressing E) nearly stops time and opens the quill card: click a letter to pluck it, or a **+** gap to write one in.
- **Transitions:** A real page-turn animation between levels.
- **Sound:** Scratching quill, paper rustle, and ambient music written with Web Audio that gets more layers as you move through a chapter. The Blot gives off a low hum.
- **Controls:**
  - Desktop: A/D or arrow keys to move, Space to jump, mouse to edit words
  - Mobile: on-screen move, climb and jump buttons; tap a word to edit it

---

## 5. Tech architecture

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite + TypeScript** | Fast development, typed game logic, static output for Vercel |
| Rendering | **HTML5 Canvas 2D** (world) + **DOM overlay** (word editing, menus) | Canvas handles the ink look and speed, the DOM gives crisp, accessible text |
| Physics | Custom lightweight platformer physics (AABB) | Small bundle, full control |
| Levels | **Typed data modules** (`src/levels/chapter1.ts`) | Levels are pure data, and the type checker catches mistakes |
| Lexicon | `src/game/lexicon.ts` maps each word to a shape and behaviours (e.g. `BOAT: vehicle`). Real words without a shape become harmless *whispers*; nonsense becomes *wild ink* | Any valid word works anywhere, which scales to hundreds of words |
| Audio | Web Audio API, fully procedural (no audio files) | Nothing to download, tiny bundle |
| Saving | `localStorage` (progress, settings, secrets found) | No server needed |
| Offline | Manifest now; service worker in Phase 6 | Installable, plays offline |
| Testing | **Vitest**: rule tests + a bot that completes every page through the real physics | Proves every level can be solved |
| Dev tools | `?level=1-3` to jump to a page, <kbd>`</kbd> for hitboxes (dev builds only); a visual level editor later | Fast level design |

### Project structure
```
g-dev/
├─ index.html
├─ public/            # favicon, manifest
├─ scripts/           # build-dict.mjs (generates the dictionary)
├─ src/
│  ├─ game/           # world (rules + physics), ink ops, lexicon, types
│  ├─ levels/         # page data, one module per chapter
│  ├─ render/         # canvas renderer, ink pen, per-word art, particles
│  ├─ audio/          # procedural sound + music
│  ├─ ui/             # screens, HUD, quill panel, margin notes
│  ├─ story/          # prologue, diary, notes, browser tricks
│  ├─ data/           # words.txt dictionary
│  ├─ app.ts / play.ts / input.ts / save.ts / main.ts
├─ tests/
├─ IDEAS.md
├─ PLAN.md
└─ vercel.json
```

### Performance targets
- First load under **1.5 MB**, playable within **2 s** on 4G
- **60 fps** on mid-range phones
- Levels load lazily, one chapter at a time

---

## 6. Development phases

| Phase | Deliverable | Result | Status |
|---|---|---|---|
| **0. Setup** | Vite + TS project, Git repo, Vercel project, "hello" page live | A live URL on day 1 | ✅ built (Git push + Vercel import still to do, see README) |
| **1. Core engine** | Player movement, word objects, Pluck/Place, lexicon, entity behaviors | A playable test room | ✅ |
| **2. Chapter 1** | 5 Margin Woods levels, title screen, saving, page-turn transition | **v0.1 public release** | ✅ |
| **3. Polish** | Ink particles, animations, audio, diary pages, margin notes | It feels like a finished game | 🟡 mostly done early (particles, procedural audio, diary, notes) |
| **4. Chapters 2–3** | Place, page flipping, the Blot enemy | **v0.2** | ✅ Chapter II (v0.2) and Chapter III (v0.3) done |
| **5. Chapters 4–7** | Mirror, Name, Fold, 3 endings, secret chapter, browser tricks | **v1.0 full game** | ✅ v1.0: all seven chapters, four endings and the secret chapter |
| **6. Launch polish** | Mobile tuning, accessibility, PWA, share image, analytics | Ready for the public | ✅ v1.1: offline play and install (PWA), link-preview image and tags, Vercel Web Analytics (free tier, one page view per page of the book), phone-sized menus, install button |

### Accessibility
- Dyslexia-friendly font toggle
- Colour-blind-safe accent colours
- Reduced-motion mode
- Remappable keys
- Hint system: 3 levels of hints per level, delivered as the Author's margin notes

---

## 7. Hosting on Vercel

### One-time setup
1. **Create a GitHub repo** (e.g. `the-last-page`) and push this folder.
2. Go to **vercel.com → Add New → Project → Import** the repo.
3. Vercel detects Vite automatically:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy** to get a live URL like `the-last-page.vercel.app`.
5. *(Optional)* **Settings → Domains** to add a custom domain (e.g. `thelastpage.game`).

### `vercel.json`
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```

### Workflow after setup
- Push to `main` → **production** deploy (a new live version for everyone)
- Push any other branch or open a PR → **preview** URL (share test builds before release)
- Rolling back is one click in the Vercel dashboard

### Launch extras
- **Vercel Web Analytics** (free): see player counts and where they drop off
- **Open Graph image + meta tags**: good-looking link previews on WhatsApp, X, and Discord
- **"Share your ending"** button: shares which ending you got, which helps the game spread
- Later: submit to **itch.io**, **CrazyGames**, and **Poki** (Friv-style portals) using the same build

---

## 8. Open decisions (current defaults)

- **Language:** English only for v1 (the word puzzles depend on English)
- **Monetisation:** None for v1, free to play
- **Leaderboards:** Not in v1; "Perfect Ink" scores are stored locally only
