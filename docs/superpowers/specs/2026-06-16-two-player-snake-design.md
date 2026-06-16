# Two-Player Snake — Design Spec

**Date:** 2026-06-16
**Project:** `/games/snake/`

## Summary

Add a two-player mode to the existing Snake game. A toggle switch lets Jiduo choose
between solo play (the current behavior) and two-player competitive play.

When two-player mode is on, both players share the same board. They compete for a
single apple. The game ends when one snake dies; the survivor wins. Head-to-head
collision is a tie.

## Gameplay

### Solo mode (toggle off)
- Behaves identically to the current snake game.
- WASD and Arrow keys both control the single snake.
- One score, one best score.

### Two-player mode (toggle on)
- Player 1: Green snake (`--c4`), controlled with **W A S D**.
- Player 2: Blue snake (`--c6`), controlled with **Arrow keys**.
- Both snakes start on opposite sides of the board:
  - P1 starts at (5, 10) heading right.
  - P2 starts at (15, 10) heading left.
- One apple on the board at a time. Either snake can eat it.
- Eating the apple: +10 points, that snake grows, a new apple spawns.
- **Death conditions** (same for both):
  - Head hits a wall (when wall-warp is off).
  - Head hits an obstacle.
  - Head hits **any** snake body — own or opponent's.
- **Head-to-head collision** (both heads occupy the same cell in the same tick):
  → Tie game.

### Game over screen
- Solo: unchanged ("Nice run!" / "Oof!", shows score).
- Two-player:
  - "Player 1 wins!" (green snake survived) or
  - "Player 2 wins!" (blue snake survived) or
  - "It's a tie!" (head-to-head or both died same tick).
  - Shows both scores.

## UI Changes

### Mode toggle
- A new toggle switch, styled like the existing `.rule` buttons, placed in the
  sidebar under "Rules" or in the HUD.
- Label: "2 players" with the `.rule__pip` pill toggle.
- State persisted in `localStorage` under `snake.config.mode` (`"solo"` | `"duo"`).

### Score display (two-player)
- When two-player mode is active, the HUD shows two score chips:
  - P1 (green): labelled "P1"
  - P2 (blue): labelled "P2"
- When solo mode, HUD shows the current single score + best (unchanged).

### Controls panel
- Updates dynamically when mode changes:
  - Solo: shows WASD + Arrow keys as equivalent.
  - Duo: shows WASD → P1, Arrows → P2.

## Technical Approach

- Single canvas, single game loop — no architectural split needed.
- The `snake` variable becomes `snakes[]` (array of two when in duo mode).
- Each snake object: `{ body[], dir, nextDir, score, alive, color }`.
- `step()` iterates over alive snakes, moves each, checks collisions.
- Collision detection checks all snake bodies (both players) + obstacles + walls.
- Only snake bodies are checked for self/opponent collision — the head is excluded
  from body lookup during move to avoid false positives.
- When one snake dies and the other is alive, the alive one wins immediately.
- When both die in the same tick (head-to-head or both hit obstacles same tick),
  it's a tie.

## Files Changed

- `/games/snake/index.html` — HTML structure, CSS, JS (all inline in the single file).

## Design System Compliance

- Uses existing `--c4` (green) for P1, `--c6` (blue) for P2.
- Toggle uses existing `.rule` + `.rule__pip` pattern.
- All typography, colors, shadows follow `DESIGN.md`.
- No new CSS tokens or hex codes.
