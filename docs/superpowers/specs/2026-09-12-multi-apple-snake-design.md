# Multi-Apple Snake — Design Spec

**Date:** 2026-09-12
**Project:** `/games/snake/`

## Summary

Let the player choose how many apples are on the board at once. A setting in the
sidebar cycles between 1 and 5 apples.

The apples behave as a **batch**: when the board is cleared, a whole fresh batch
spawns. Eating one apple out of two leaves one apple on the board with no
replacement until the second is eaten.

Default stays 1, so the game plays exactly as it does today until the setting is
changed.

## Gameplay

- The board holds `appleCount` apples at a time. `appleCount` is 1–5, default 1.
- Each apple is still worth **10 points** and still grows the snake by one segment.
- Eating an apple removes only that apple. No replacement spawns.
- When the **last** apple is eaten, a fresh batch of `appleCount` apples spawns
  on the same tick. The board never stays empty.
- Apples never spawn on a snake body or on an obstacle. Apples in the same batch
  never spawn on the same cell as each other.
- Two-player mode is unchanged in structure: both snakes compete for the same
  shared batch of apples. Either snake can eat any apple. A snake eats at most
  one apple per tick (its head lands on exactly one cell).
- Nothing else changes: score, best score, difficulty, wall-warp, obstacles,
  death conditions, and win/lose logic all behave as before.

## UI Changes

### New sidebar panel

A new panel sits in the sidebar between **🍎 Goal** and **⚙️ Rules**:

```html
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
```

- Reuses the existing page-local `.diff` segmented-control style — the same look
  as the slow / medium / fast buttons in the HUD.
- One page-local sizing rule, `#apples button { flex: 1; padding: 6px 0; }`,
  lets the five chips share the row evenly. Without it, the existing
  `.diff button` padding makes the row wider than the 240px sidebar.
- Clicking a number sets the apple count, saves it, and restarts the game
  (same behavior as clicking a rule toggle).
- The active button reflects the saved value on page load.

### Unchanged

- The HUD (score chips, best, difficulty buttons) is untouched.
- The 🍎 Goal panel copy stays accurate as-is ("Every apple makes you longer
  and gives you 10 points") — no edit needed.

## Technical Approach

All changes are inside the single existing IIFE in `/games/snake/index.html`.

1. **State.** `let apple` (single `{x, y}`) becomes `let apples` (an array).

2. **Config.** Add `appleCount: 1` to `DEFAULT_CONFIG` so the existing
   `{ ...DEFAULT_CONFIG, ...saved }` merge fills it in for players with an
   already-saved `snake.config`. Clamp the merged value to the 1..5 range and
   round it, so a corrupted or stale stored value can't break the game.
   Add a `MAX_APPLES = 5` constant next to the existing `OBSTACLE_COUNT`.

3. **Placement.** `placeApple()` becomes `placeApples()`, which fills `apples`
   with `config.appleCount` apples. Each candidate cell must pass the existing
   `isOccupied()` check (snake bodies + obstacles) and must not already hold an
   apple from the same batch. Follow the `tries` guard pattern already used by
   `placeObstacles()` so a nearly-full board stops early instead of spinning
   forever; the loop exits as soon as `apples.length === config.appleCount` or
   the try budget runs out.

4. **Eating.** In `step()`, the current logic uses a single `appleEaten` flag to
   stop the second snake from eating an apple the first one already took. With
   multiple apples that flag is wrong — both snakes should be able to eat
   different apples on the same tick. Replace it: after a snake unshifts its new
   head, look for an apple at that cell (`findIndex`). If found, splice that
   apple out and add 10 points; otherwise pop the tail as usual. After all
   snakes have moved, if `apples.length === 0`, call `placeApples()` to spawn
   the next batch.

5. **Drawing.** `draw()` iterates `apples` and renders each with the existing
   apple style.

6. **Setting binding.** Add a click handler over `#apples button` that mirrors
   the existing `#diff button` handler: clear `is-active` from its siblings, set
   `is-active` on the clicked button, write `config.appleCount`, `saveConfig()`,
   then `reset()`. On load, run the same "clear all, then set one" step so
   exactly one button — the one whose `data-count` matches the saved
   `config.appleCount` — carries `is-active`.

7. **Sizing.** Add one page-local CSS rule beside the existing `.diff` rules:
   `#apples button { flex: 1; padding: 6px 0; }`. Five chips at the existing
   `.diff button` padding overflow the 240px sidebar; flexing them fits any
   width and gives mobile larger tap targets.

## Edge Cases

- **Board nearly full.** The `tries` guard exits the placement loop early; the
  game runs with fewer apples than requested rather than hanging.
- **Batch cleared on a losing tick.** If the last apple is eaten on the same tick
  a snake dies, `placeApples()` runs and then `endGame()` shows the overlay.
  Harmless: the overlay covers the board and `reset()` re-places apples anyway.
- **Old saved config.** A player whose saved `snake.config` predates this feature
  gets `appleCount: 1` from the defaults — identical to today's behavior.

## Files Changed

- `/games/snake/index.html` — HTML structure and JS (all inline in the single file).

## Design System Compliance

- Reuses the page-local `.diff` segmented control. The only new CSS is the one
  page-local sizing rule described in UI Changes.
- No new colors, fonts, shadows, or tokens.
- Panel uses the existing `.panel` class.
- Sidebar order and the existing `.rule` / `.diff` interaction patterns are
  preserved.
