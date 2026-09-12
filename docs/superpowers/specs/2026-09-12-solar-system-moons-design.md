# Moons + Saved Progress for Solar System Explorer — Design Spec

**Date:** 2026-09-12
**Project:** `/games/space-shooter/`, renamed to `/games/solar-system-explorer/`

## Summary

Add 10 real moons orbiting 6 of the 8 planets, grow the mission chain from 8 stops
to 18, and auto-save progress so a page refresh doesn't throw the game away.

Every moon is real, and every fact the Commander says about one is verified against
NASA/ESA sources (see **Verified Facts** below). Mercury and Venus stay moonless —
and the Commander says so, because that is worth learning.

## The Moons

| Moon | Parent | r | Orbit around parent | Colour | Commander's line |
|---|---|---|---|---|---|
| Moon 🌙 | Earth | 7.8 | 40 | `#c4c0bb` | The only place people have visited! |
| Phobos | Mars | 3.5 | 26 | `#7a6e64` | Slowly falling — it may become a ring! |
| Deimos | Mars | 3 | 38 | `#9a8b7c` | So small you could jog around it in a day! |
| Io | Jupiter | 8 | 62 | `#e3c84b` | Hundreds of volcanoes shooting yellow sulphur! |
| Europa | Jupiter | 7.5 | 84 | `#cfc6b6` | Hides a big ocean under its icy shell! |
| Ganymede | Jupiter | 9 | 108 | `#9c9288` | Bigger than the planet Mercury! |
| Callisto | Jupiter | 8.5 | 130 | `#6b6055` | More craters than anywhere else! |
| Titan | Saturn | 8.8 | 72 | `#dfa13a` | Orange skies and lakes of liquid gas! |
| Titania | Uranus | 6 | 50 | `#9a8f88` | Giant canyons over 1,000 km long! |
| Triton | Neptune | 7 | 48 | `#c9bdb6` | Orbits backwards — and has icy volcanoes! |

Sizes are **compressed, not to scale**. Phobos and Deimos are genuinely 0.4% the
diameter of Ganymede; at true scale they would be under one pixel and unfindable.
The radii above preserve the real size *ordering* while keeping every moon big
enough for a 6-year-old to fly to and see.

Orbit radii clear each planet's drawn radius and Saturn's rings (which reach
`r + 12` = 48). Moons orbit their planet the way planets orbit the Sun — same
`_angle` + `speed` + orbit-radius pattern, one level down.

## Mission Chain (18 stops)

Grouped so the Commander sends you out to a planet and then to its moons:

```
 1. Earth 🌍      6. Jupiter ♃     11. Venus ♀️     16. Titania
 2. Moon 🌙       7. Io             12. Mercury ☿️   17. Neptune ♆
 3. Mars ♂️       8. Europa         13. Saturn 🪐    18. Triton 🏆
 4. Phobos        9. Ganymede       14. Titan
 5. Deimos       10. Callisto       15. Uranus ⛢
```

Earth stays first (it hands out the upgrades), and its Moon is second — an easy
win right next to where you start.

## Gameplay Changes

- **Discovery** works identically for moons: fly within `target.r + 40` of the
  target and the mission completes. Only the *current* mission's target can
  complete, so you can never accidentally finish a moon you haven't been sent to.
- **Points**: a moon is worth the same 100 as a planet. Score is unchanged.
- **The Sun is still the only thing that can hurt you.** Moons have no collision.
- **Commander Zog gets new lines**:
  - Finishing a planet that has moons: *"Mars ♂️ done! Now check its moons!"*
  - Finishing a moon: the moon's discovery line from the table above, plus its
    emoji.
  - Finishing Mercury or Venus: *"Mercury ☿️ has NO moons at all. Nothing orbits it!"*
  - Finishing all 18: *"ALL 8 planets and ALL 10 moons! You are the greatest
    explorer in the galaxy!"*

## UI Changes

### HUD

Replace the single `PLANETS 0/8` chip with two chips:

```html
<div class="score__chip"><span class="lbl">PLANETS</span><span class="num" id="found">0/8</span></div>
<div class="score__chip"><span class="lbl">MOONS</span><span class="num" id="found-moons">0/10</span></div>
```

Both counts stay visible, so a player who has found all 8 planets can still see
there is moon work left.

### Missions panel

The list grows to 18 entries. Moons are indented under their parent planet so the
structure reads as a tree rather than a wall of 18 equal lines:

```
✅ 🌍 Earth
🎯 🌙 Moon ← GO!
⬜ ♂️ Mars
   ⬜ Phobos
   ⬜ Deimos
```

Indentation uses a page-local `.mission-list .moon { padding-left: 18px; }` rule.

### Sidebar button

A new `↻ Start over` button next to the existing restart control. It asks for
confirmation (`Start over from the very beginning? You will lose all your progress.`)
before wiping. This is the *only* way to lose progress.

## Saved Progress

Progress is written to `localStorage` under `sse.progress`:

```json
{
  "currentMissionIdx": 7,
  "foundIds": ["Earth", "Moon", "Mars", "Phobos", "Deimos", "Jupiter"],
  "score": 600,
  "lives": 3,
  "upgradeLevel": 2,
  "unlockedUpgrades": ["speed1", "shield", "speed2"]
}
```

- **Written** after every mission completion and on game over.
- **Read** on page load. If a valid save is present, the game resumes it instead
  of starting fresh. The Commander greets you: *"Welcome back, cadet!"*
- A save that fails to parse, or whose `currentMissionIdx` is out of range, is
  discarded and the game starts fresh. A corrupt save must never break the page.
- **`R` (and the after-death "try again") retries — it never wipes.** Lives go
  back to 3 and you resume from your saved mission. A kid who dies at stop 17
  must never be sent back to stop 1.
- On resume the rocket spawns at the usual start position; the yellow direction
  arrow points the way to wherever the current mission is.
- When all 18 are found, the completed save is **kept**, so reloading still shows
  the 🏆 "greatest explorer" state instead of silently throwing the trophy away.
  Pressing `↻ Start over` is how you begin a fresh game.

## Technical Approach

All changes are inside the single IIFE in `games/solar-system-explorer/index.html`.

1. **Tracked data.** Add a `moons` array. Each moon carries the same fields a
   planet uses for drawing and discovery (`name`, `emoji`, `r`, `color`, `desc`,
   `found`, `_angle`, `speed`) plus `parent` (the planet object) and `orbit`
   (distance from its parent). `planets` gains a `moons: []` back-reference.

2. **One position helper.** Two functions replace the repeated
   `CX + Math.cos(p._angle)*p.orbit` arithmetic:
   - `placePos(place)` → `{x, y}`. For a planet, orbits the Sun; for a moon,
     returns `parentPos + (cos(_angle)*orbit, sin(_angle)*orbit)`.
   - `placeOrbit(place)` → the Sun-distance used for the Commander's proximity
     hint. A moon returns `placeOrbit(place.parent)`.
   Every existing call site that computes a planet's world position switches to
   `placePos`.

3. **Missions target places, not planets.** Each mission's `planet` field becomes
   `target`, holding either a planet or a moon. Call sites in `update()` (the
   discovery check), `updateBossText()`, `updateMissionList()`, `drawPlanet()`
   (target ring), `drawMinimap()` and `drawDirectionArrow()` all use `target` and
   `placePos`.

4. **Orbiting.** In `update()`, alongside `planets.forEach(p => p._angle += p.speed)`,
   add the same for `moons`.

5. **Counters.** `foundCount` splits into `foundPlanets` and `foundMoons`,
   incremented from `completeCurrentMission()` based on whether the target is a
   moon. `updateUI()` writes both chips. `endGame()`'s overlay shows the combined
   total.

6. **Drawing.** A new `drawMoons()` draws each moon as a small shaded circle with
   the same radial-gradient treatment `drawPlanet()` uses, plus a name label for
   found moons and the target ring / 👇 indicator when a moon is the current
   target. Called from `draw()` after `planets.forEach(p => drawPlanet(p))`.

7. **Rename.** `git mv games/space-shooter games/solar-system-explorer`. The page
   title already reads "Solar System Explorer"; only the slug was wrong. The
   project was published minutes earlier so no links exist yet.

## Verified Facts

Every claim the Commander makes was checked against NASA/ESA sources before being
written into the game — all 14 confirmed, no corrections:

- Phobos (22.5 km) and Deimos (12.4 km) are Mars's only moons; Phobos is spiralling
  in, Deimos is drifting out.
- Io, Europa, Ganymede and Callisto are Jupiter's four Galilean moons.
- Io is the most volcanically active body in the solar system (~400 volcanoes).
- Europa is ice-covered with a likely subsurface liquid ocean.
- Ganymede is the largest moon in the solar system — 5,268 km across, wider than
  Mercury's 4,879 km.
- Callisto is the most heavily cratered object in the solar system.
- Titan is Saturn's largest moon, has a thick atmosphere, and has stable surface
  lakes of liquid methane and ethane.
- Titania (1,578 km) is the largest moon of Uranus.
- Triton is the largest moon of Neptune and the only large moon with a retrograde
  orbit — it was probably captured from the Kuiper Belt.
- Mercury and Venus are the only two planets with no moons at all.
- Earth's Moon is the fifth largest moon in the solar system.

Size ordering used for the compressed radii:
Ganymede (5,268 km) > Titan (5,150) > Callisto (4,821) > Io (3,643) > Moon (3,475)
> Europa (3,122) > Triton (2,707) > Titania (1,578) > Phobos (22.5) > Deimos (12.4).

## Files Changed

- `games/space-shooter/` → `games/solar-system-explorer/` (folder rename via `git mv`)
- `games/solar-system-explorer/index.html` — HTML, CSS and JS (all inline)

## Design System Compliance

- The page chrome (topbar, panels, buttons, chips) keeps using the shared classes
  and tokens, unchanged.
- Moon colours are game-world art, exactly like the existing hardcoded planet
  colours (`#b0ada6`, `#4fb3f5`, …). They are surface colours from spacecraft
  imagery, not UI colours, and correctly do not come from `--c1`..`--c6`.
- The only new CSS is the `.mission-list .moon` indent and the `.moon` label
  styling — page-local, no new tokens, fonts or shadows.
