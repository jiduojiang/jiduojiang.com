# Multi-Apple Snake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the player choose 1–5 apples on the Snake board, spawning as a batch that refills only once the board is cleared.

**Architecture:** All changes live in the single existing IIFE in `/games/snake/index.html`. The single `apple` object becomes an `apples` array; `placeApple()` becomes `placeApples()`; the eating step loses its single-apple flag and instead removes whichever apple a snake lands on, refilling the whole batch when the array empties. A new sidebar panel writes `config.appleCount`, which persists in the existing `snake.config` localStorage blob.

**Tech Stack:** Plain HTML/CSS/JS, no framework, no build step, no bundler.

**Spec:** `docs/superpowers/specs/2026-09-12-multi-apple-snake-design.md`

## Global Constraints

- **No tests.** This is a play project — CLAUDE.md forbids writing tests. Every task
  is verified by driving the real game in a browser and observing it, not by a test
  runner. Do not add a test file, a test framework, or a `package.json` script.
- **English only** in anything written into the project: HTML text, code comments,
  identifiers, commit messages.
- **Design system.** Follow `/shared/DESIGN.md`. Use only `--c1`..`--c6`, the four
  existing fonts, `var(--shadow-stamp)`, and the existing BEM classes. No new hex
  codes, fonts, or soft shadows. No Tailwind, no framework.
- **One file.** Every code change in this plan goes into `/games/snake/index.html`.
- **Maximum apples:** `MAX_APPLES = 5`.
- **Apple count bounds:** always an integer in 1..5 inclusive.
- **Score per apple:** unchanged at 10 points.
- **Commit messages:** short, English, present tense.

---

### Task 1: Multi-apple engine

Converts the game from one apple to an array of apples, with batch respawn. Default
stays 1, so the game plays identically to today when this task lands — it is a
pure refactor from the player's point of view, verifiable by playing a round.

**Files:**
- Modify: `/games/snake/index.html`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `let apples` — an array of `{x, y}`; `placeApples()` — refills `apples`
  to `config.appleCount`; `config.appleCount` — integer 1..5, default 1;
  `MAX_APPLES = 5`. Task 2 depends on all four names exactly as written.

- [ ] **Step 1: Add the MAX_APPLES constant**

In `/games/snake/index.html`, find:

```js
  const COLS = 20, ROWS = 20;
  const OBSTACLE_COUNT = 7;
```

Replace with:

```js
  const COLS = 20, ROWS = 20;
  const OBSTACLE_COUNT = 7;
  const MAX_APPLES = 5;
```

- [ ] **Step 2: Add appleCount to config, with a clamp on load**

Find:

```js
  const DEFAULT_CONFIG = { twoPlayer: false, wrapWalls: true, obstacles: true };
  const config = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("snake.config") || "{}");
      return { ...DEFAULT_CONFIG, ...saved };
    } catch { return { ...DEFAULT_CONFIG }; }
  })();
```

Replace with:

```js
  const DEFAULT_CONFIG = { twoPlayer: false, wrapWalls: true, obstacles: true, appleCount: 1 };
  const config = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("snake.config") || "{}");
      const merged = { ...DEFAULT_CONFIG, ...saved };
      const n = Math.round(+merged.appleCount);
      merged.appleCount = n >= 1 && n <= MAX_APPLES ? n : 1;
      return merged;
    } catch { return { ...DEFAULT_CONFIG }; }
  })();
```

The clamp matters: players who already have a `snake.config` saved from before this
feature existed get `appleCount: 1` from `DEFAULT_CONFIG`, and a corrupted or
hand-edited value can't reach the placement loop.

- [ ] **Step 3: Rename the state variable**

Find:

```js
  let snakes, apple, obstacles, best, speed, timer, paused, over;
```

Replace with:

```js
  let snakes, apples, obstacles, best, speed, timer, paused, over;
```

- [ ] **Step 4: Point reset() at the new placement function**

Find:

```js
    placeObstacles();
    placeApple();
```

Replace with:

```js
    placeObstacles();
    placeApples();
```

- [ ] **Step 5: Replace placeApple() with placeApples()**

Find:

```js
  function placeApple() {
    while (true) {
      const a = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
      if (!isOccupied(a.x, a.y)) { apple = a; return; }
    }
  }
```

Replace with:

```js
  function placeApples() {
    apples = [];
    let tries = 0;
    while (apples.length < config.appleCount && tries++ < 500) {
      const a = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
      if (isOccupied(a.x, a.y)) continue;
      if (apples.some(function(p) { return p.x === a.x && p.y === a.y; })) continue;
      apples.push(a);
    }
  }
```

`isOccupied()` already rejects snake bodies and obstacles. The extra check keeps
apples in the same batch off each other's cells. The `tries` guard mirrors the
existing `placeObstacles()` pattern so a nearly-full board stops early with fewer
apples instead of spinning forever.

- [ ] **Step 6: Rewrite the eating logic in step()**

Find:

```js
    // Move alive snakes & eat
    let appleEaten = false;
    snakes.forEach(function(s) {
      if (!s.alive) return;
      const m = moves.find(function(mv) { return mv.snake === s; });
      s.body.unshift({ x: m.nx, y: m.ny });
      if (!appleEaten && m.nx === apple.x && m.ny === apple.y) {
        appleEaten = true;
        s.score += 10;
        placeApple();
      } else {
        s.body.pop();
      }
    });

    updateScoreUI();
```

Replace with:

```js
    // Move alive snakes & eat
    snakes.forEach(function(s) {
      if (!s.alive) return;
      const m = moves.find(function(mv) { return mv.snake === s; });
      s.body.unshift({ x: m.nx, y: m.ny });
      const eaten = apples.findIndex(function(a) { return a.x === m.nx && a.y === m.ny; });
      if (eaten !== -1) {
        apples.splice(eaten, 1);
        s.score += 10;
      } else {
        s.body.pop();
      }
    });

    // Batch respawn: eating the last apple brings a whole fresh set
    if (apples.length === 0) placeApples();

    updateScoreUI();
```

Note what is deliberately gone: the `appleEaten` flag existed only to stop the
second snake from re-eating the one shared apple. With separate apples both snakes
must be able to eat on the same tick, so each snake now looks up its own head cell
independently. A head occupies exactly one cell, so a snake still eats at most one
apple per tick.

- [ ] **Step 7: Draw every apple**

Find:

```js
    // apple
    ctx.fillStyle = COLOR_APPLE;
    roundedRect(apple.x*CELL + 4, apple.y*CELL + 4, CELL - 8, CELL - 8, 6);
    ctx.fill();
    ctx.strokeStyle = COLOR_INK; ctx.lineWidth = 2.5;
    ctx.stroke();
```

Replace with:

```js
    // apples
    apples.forEach(function(a) {
      ctx.fillStyle = COLOR_APPLE;
      roundedRect(a.x*CELL + 4, a.y*CELL + 4, CELL - 8, CELL - 8, 6);
      ctx.fill();
      ctx.strokeStyle = COLOR_INK; ctx.lineWidth = 2.5;
      ctx.stroke();
    });
```

- [ ] **Step 8: Verify no regression at the default of 1 apple**

Serve the site and play a round:

```bash
cd /Users/jiduo/github/jiduojiang.com && python3 -m http.server 8080
```

Open `http://localhost:8080/games/snake/`, then confirm each of these by playing:

- Exactly one apple is on the board.
- Eating it scores 10, grows the snake by one, and a new apple appears immediately.
- Two-player mode: only one apple exists and only one snake can eat it per tick.
- Obstacles are on and no apple ever sits on an obstacle or on a snake.
- Restart, pause, difficulty, and wall-warp all still work.

Expected: identical to the game before this task. No console errors.

- [ ] **Step 9: Verify multiple apples with a seeded config**

In the browser console on the game page, run:

```js
localStorage.setItem("snake.config", JSON.stringify({ appleCount: 3 })); location.reload();
```

Expected: three apples are on the board at once, none overlapping.

Now eat exactly one apple and confirm the board is left with **two** apples and no
replacement — then eat the remaining two and confirm three fresh apples appear
together on that same tick.

Expected: batch respawn, not per-apple respawn. If a new apple appears the moment
you eat one of three, the batch logic in Step 6 is wrong.

- [ ] **Step 10: Commit**

```bash
cd /Users/jiduo/github/jiduojiang.com
git add games/snake/index.html
git commit -m "Add multi-apple engine to Snake

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: The 🍎 Apples setting

Adds the sidebar control that writes `config.appleCount`, so the player can change
the count without touching the console.

**Files:**
- Modify: `/games/snake/index.html`

**Interfaces:**
- Consumes: `config.appleCount`, `placeApples()`, and `MAX_APPLES` from Task 1, used
  exactly as named there.
- Produces: `updateApplesUI()` — syncs the `is-active` chip to `config.appleCount`;
  the `#apples` element — the `.diff` button row.

- [ ] **Step 1: Add the sidebar panel**

Find the 🍎 Goal panel and the ⚙️ Rules panel, and insert the new panel between them:

```html
        <div class="panel">
          <h4>🍎 Goal</h4>
          <p style="font-size: var(--t-sm); color: var(--ink-soft); line-height: 1.55;">
            Eat the red apples. Every apple makes you longer and gives you 10 points.
            Don't bite your own tail!
          </p>
        </div>
        <div class="panel">
          <h4>⚙️ Rules</h4>
```

Replace with:

```html
        <div class="panel">
          <h4>🍎 Goal</h4>
          <p style="font-size: var(--t-sm); color: var(--ink-soft); line-height: 1.55;">
            Eat the red apples. Every apple makes you longer and gives you 10 points.
            Don't bite your own tail!
          </p>
        </div>
        <div class="panel">
          <h4>🍎 Apples</h4>
          <div class="diff" id="apples">
            <button data-count="1" class="is-active">1</button>
            <button data-count="2">2</button>
            <button data-count="3">3</button>
            <button data-count="4">4</button>
            <button data-count="5">5</button>
          </div>
        </div>
        <div class="panel">
          <h4>⚙️ Rules</h4>
```

- [ ] **Step 2: Add the sizing rule**

The existing `.diff button` padding is sized for three chips in the wide HUD row.
Five chips at that padding are wider than the 240px sidebar. Find:

```css
  .diff button.is-active {
    background: var(--crayon);
    color: var(--ink);
  }
```

Replace with:

```css
  .diff button.is-active {
    background: var(--crayon);
    color: var(--ink);
  }

  /* apple-count picker: same pill row, chips share the width evenly */
  #apples button { flex: 1; padding: 6px 0; }
```

The `#apples button` selector outranks `.diff button`, so it wins on padding.

- [ ] **Step 3: Add updateApplesUI()**

Find:

```js
  function updateControlsUI() {
    const isDuo = config.twoPlayer;
    document.getElementById("keys-solo").style.display = isDuo ? "none" : "";
    document.getElementById("keys-duo").style.display = isDuo ? "" : "none";
  }
```

Replace with:

```js
  function updateControlsUI() {
    const isDuo = config.twoPlayer;
    document.getElementById("keys-solo").style.display = isDuo ? "none" : "";
    document.getElementById("keys-duo").style.display = isDuo ? "" : "none";
  }

  function updateApplesUI() {
    document.querySelectorAll("#apples button").forEach(function(b) {
      b.classList.toggle("is-active", +b.dataset.count === config.appleCount);
    });
  }
```

- [ ] **Step 4: Call it from reset()**

Find:

```js
    updateScoreUI();
    updateControlsUI();
```

Replace with:

```js
    updateScoreUI();
    updateControlsUI();
    updateApplesUI();
```

- [ ] **Step 5: Bind the buttons**

Find:

```js
  document.getElementById("restart").addEventListener("click", reset);
  document.getElementById("play-again").addEventListener("click", reset);
```

Replace with:

```js
  document.getElementById("restart").addEventListener("click", reset);
  document.getElementById("play-again").addEventListener("click", reset);

  // ── Apple-count buttons ────────────────────────────────────────────
  document.querySelectorAll("#apples button").forEach(function(b) {
    b.addEventListener("click", function() {
      config.appleCount = +b.dataset.count;
      saveConfig();
      reset();
    });
  });
```

`reset()` calls `updateApplesUI()`, so the active chip updates without any extra
class juggling here — same shape as the existing rule toggles.

- [ ] **Step 6: Verify the setting works**

Reload `http://localhost:8080/games/snake/` and confirm:

- The 🍎 Apples panel sits between 🍎 Goal and ⚙️ Rules, with five chips reading
  `1 2 3 4 5` on one row that fits the sidebar without overflowing or wrapping.
- `1` is highlighted, and the game starts with one apple.
- Click `3` — the game restarts and three apples appear.
- Eat one of three: two remain, nothing new spawns. Eat the last two: three fresh
  apples appear together.
- Click `5` — five apples appear, none overlapping, none on an obstacle or a snake.
- Reload the page — `5` is still highlighted and five apples are on the board.
- Turn on **2 players** with 5 apples: both snakes compete for the same five apples,
  and either snake can eat any of them.
- Narrow the window below 720px: the chips row still fits and stays on one line.

- [ ] **Step 7: Confirm the design system is intact**

Check the diff adds no new colors, fonts, or shadow styles:

```bash
cd /Users/jiduo/github/jiduojiang.com && git diff games/snake/index.html -- '*.css' | grep -E '#[0-9a-fA-F]{3,6}|box-shadow' || echo "no new hex codes or shadows in CSS"
```

Expected: `no new hex codes or shadows in CSS`. The only CSS change is the
`#apples button` sizing rule.

- [ ] **Step 8: Commit**

```bash
cd /Users/jiduo/github/jiduojiang.com
git add games/snake/index.html
git commit -m "Add apple-count setting to Snake

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Notes for the implementer

- `npm run build` is not needed for this work. It regenerates `/index.html` from the
  template and `meta.json` files, and neither changes here.
- Do not run the publish skill or `wrangler deploy`. Jiduo says "发布" when he wants
  that; it is a separate step.
- Leave the unrelated working-tree changes alone (`games/bed-wars/meta.json`,
  `games/space-shooter/`, the PNG screenshots, `.playwright-mcp/`). Stage only
  `games/snake/index.html`.
