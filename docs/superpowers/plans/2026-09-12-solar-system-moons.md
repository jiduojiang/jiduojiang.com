# Moons + Saved Progress for Solar System Explorer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 real moons orbiting 6 planets, grow the mission chain from 8 stops to 18, and auto-save progress so a refresh no longer discards the game.

**Architecture:** Moons are a second array of orbiting bodies, one orbital level down from planets: a moon's world position is its parent planet's position plus its own orbit offset. Missions stop pointing at planets and start pointing at a generic *place* (planet or moon), resolved through two helpers (`placePos`, `placeOrbit`) so that discovery, the target ring, the minimap and the direction arrow all work for either kind without branching. Progress is mirrored into `localStorage` after every discovery.

**Tech Stack:** Plain HTML/CSS/JS, no framework, no build step, no bundler. The whole game is one IIFE inside one HTML file.

**Spec:** `docs/superpowers/specs/2026-09-12-solar-system-moons-design.md`

## Global Constraints

- **No tests.** This is a play project — CLAUDE.md forbids writing tests. Every task is
  verified by serving the site locally and driving the real game. Do not add a test
  file, test framework, or `package.json` script.
- **English only** in anything written into the project: HTML text, code comments,
  identifiers, commit messages.
- **Design system.** Follow `/shared/DESIGN.md` for the page chrome. The canvas art
  (planet and moon colours) is game-world art and correctly uses its own hex values,
  exactly like the existing planet colours.
- **One file.** Every code change goes into
  `games/solar-system-explorer/index.html`.
- **Moon sizes (verbatim, do not re-derive):** Ganymede 9, Titan 8.8, Callisto 8.5,
  Io 8, Moon 7.8, Europa 7.5, Triton 7, Titania 6, Phobos 3.5, Deimos 3. These preserve
  the real size ordering and are deliberately **not** to scale.
- **Mission chain (18, verbatim order):** Earth, Moon, Mars, Phobos, Deimos, Jupiter,
  Io, Europa, Ganymede, Callisto, Venus, Mercury, Saturn, Titan, Uranus, Titania,
  Neptune, Triton.
- **Discovery radius:** `target.r + 40`, the same as today's planets.
- **Points:** 100 per planet, 100 per moon. Unchanged.
- **Commit messages:** short, English, present tense.

---

### Task 1: Rename the project slug

The page has always been titled "Solar System Explorer" but lives at `/games/space-shooter/`.
The project was published minutes ago, so nothing links to the old URL yet.

**Files:**
- Move: `games/space-shooter/` → `games/solar-system-explorer/`

**Interfaces:**
- Consumes: nothing.
- Produces: the canonical path `games/solar-system-explorer/index.html`, which every
  later task edits.

- [ ] **Step 1: Rename the folder**

```bash
cd /Users/jiduo/github/jiduojiang.com
git mv games/space-shooter games/solar-system-explorer
ls games/
```

Expected: `snake  solar-system-explorer`.

- [ ] **Step 2: Rebuild the homepage**

```bash
cd /Users/jiduo/github/jiduojiang.com && npm run build
```

Expected output includes the line:

```
  2 game(s): solar-system-explorer, snake
```

- [ ] **Step 3: Verify the page still serves at the new path**

```bash
cd /Users/jiduo/github/jiduojiang.com && python3 -m http.server 8080 &
sleep 1
curl -s http://localhost:8080/games/solar-system-explorer/ | grep -o '<title>[^<]*'
```

Expected: `<title>Solar System Explorer · jiduojiang.com`.

- [ ] **Step 4: Commit**

```bash
cd /Users/jiduo/github/jiduojiang.com
git add games/ index.html.template
git commit -m "Rename space-shooter to solar-system-explorer

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Moons exist and orbit

Adds the moon data, the position helpers, and the moon drawing. Missions are untouched
in this task, so the game still plays exactly as before — it just has moons in the sky.

**Files:**
- Modify: `games/solar-system-explorer/index.html`

**Interfaces:**
- Consumes: the existing `planets` array, `CX`, `CY`, `isVisible()`, `worldToScreen()`,
  `frameCount`.
- Produces:
  - `const moons` — array of 10 moon objects, each with `name`, `emoji`, `r`, `orbit`,
    `color`, `speed`, `desc`, `found`, `_angle`, and `parent` (a **planet object**
    after the resolve step).
  - `const places` — `planets.concat(moons)`.
  - `placePos(t)` → `{x, y}` — world position of a planet or moon.
  - `placeOrbit(t)` → number — distance from the Sun (a moon reports its parent's).
  - `drawMoon(m)` — draws one moon.

- [ ] **Step 1: Add the moon data and helpers**

Find the end of the `planets` array and the lines after it:

```js
    { name: "Neptune",  orbit: 980,  r: 26,  color: "#4b70dd", speed: 0.0012, emoji: "♆", desc: "Deep blue, farthest planet" },
  ];

  const ASTEROID_INNER = 430, ASTEROID_OUTER = 520;
```

Replace with:

```js
    { name: "Neptune",  orbit: 980,  r: 26,  color: "#4b70dd", speed: 0.0012, emoji: "♆", desc: "Deep blue, farthest planet" },
  ];

  // ── Moons ──────────────────────────────────────────────────────────
  // Sizes are compressed, NOT to scale: Phobos and Deimos are really 0.4% of
  // Ganymede's diameter, which would be sub-pixel on screen. The size ORDER is real.
  const moons = [
    { name: "Moon",     emoji: "🌙", parent: "Earth",   r: 7.8, orbit: 40,  color: "#c4c0bb", speed: 0.020, desc: "The only place people have visited!" },
    { name: "Phobos",   emoji: "🥔", parent: "Mars",    r: 3.5, orbit: 26,  color: "#7a6e64", speed: 0.030, desc: "Slowly falling — it may become a ring!" },
    { name: "Deimos",   emoji: "🪨", parent: "Mars",    r: 3,   orbit: 38,  color: "#9a8b7c", speed: 0.019, desc: "So small you could jog around it in a day!" },
    { name: "Io",       emoji: "🌋", parent: "Jupiter", r: 8,   orbit: 62,  color: "#e3c84b", speed: 0.020, desc: "Hundreds of volcanoes shooting yellow sulphur!" },
    { name: "Europa",   emoji: "🧊", parent: "Jupiter", r: 7.5, orbit: 84,  color: "#cfc6b6", speed: 0.015, desc: "Hides a big ocean under its icy shell!" },
    { name: "Ganymede", emoji: "🌕", parent: "Jupiter", r: 9,   orbit: 108, color: "#9c9288", speed: 0.011, desc: "Bigger than the planet Mercury!" },
    { name: "Callisto", emoji: "🌑", parent: "Jupiter", r: 8.5, orbit: 130, color: "#6b6055", speed: 0.008, desc: "More craters than anywhere else!" },
    { name: "Titan",    emoji: "🌫️", parent: "Saturn",  r: 8.8, orbit: 72,  color: "#dfa13a", speed: 0.012, desc: "Orange skies and lakes of liquid gas!" },
    { name: "Titania",  emoji: "❄️", parent: "Uranus",  r: 6,   orbit: 50,  color: "#9a8f88", speed: 0.013, desc: "Giant canyons over 1,000 km long!" },
    { name: "Triton",   emoji: "💠", parent: "Neptune", r: 7,   orbit: 48,  color: "#c9bdb6", speed: 0.011, desc: "Orbits backwards — and has icy volcanoes!" },
  ];
  // `parent` starts as a planet name and becomes the planet object itself.
  moons.forEach(m => { m.parent = planets.find(p => p.name === m.parent); });

  const places = planets.concat(moons);

  // A planet orbits the Sun; a moon orbits its parent. One helper for both, so
  // every call site that needs a world position stops caring which one it has.
  function placePos(t) {
    if (t.parent) {
      const pp = placePos(t.parent);
      return { x: pp.x + Math.cos(t._angle) * t.orbit, y: pp.y + Math.sin(t._angle) * t.orbit };
    }
    return { x: CX + Math.cos(t._angle) * t.orbit, y: CY + Math.sin(t._angle) * t.orbit };
  }
  // Distance from the Sun — used for the Commander's proximity hint, which for a
  // moon should describe where its planet is, not where the moon is.
  function placeOrbit(t) { return t.parent ? t.parent.orbit : t.orbit; }

  const ASTEROID_INNER = 430, ASTEROID_OUTER = 520;
```

- [ ] **Step 2: Orbit the moons**

Find in `update()`:

```js
    // Orbit everything
    planets.forEach(p => p._angle += p.speed);
```

Replace with:

```js
    // Orbit everything
    planets.forEach(p => p._angle += p.speed);
    moons.forEach(m => m._angle += m.speed);
```

- [ ] **Step 3: Draw the moons**

Find the end of `drawPlanet()` and the start of `drawAsteroid()`:

```js
  function drawAsteroid(a) {
```

Replace with a new function inserted before it:

```js
  function drawMoon(m) {
    const pos = placePos(m);
    if (!isVisible(pos.x, pos.y, m.r + 30)) return;
    const s = worldToScreen(pos.x, pos.y);

    const grad = ctx.createRadialGradient(s.x-m.r*0.2, s.y-m.r*0.3, m.r*0.1, s.x, s.y, m.r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.5, m.color);
    grad.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(s.x, s.y, m.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1; ctx.stroke();

    // Found check
    if (m.found) {
      ctx.fillStyle = "rgba(97,201,122,0.2)";
      ctx.beginPath(); ctx.arc(s.x, s.y, m.r+6, 0, Math.PI*2); ctx.fill();
    }

    // Name label
    if (m.found || unlockedUpgrades.includes("map")) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(m.name.toUpperCase(), s.x, s.y + m.r + 11);
    }
  }

  function drawAsteroid(a) {
```

`drawMoon` deliberately has no mission-target ring yet: in Task 2 missions still point
only at planets. Task 3 adds the ring once missions can target a moon.

- [ ] **Step 4: Call it from draw()**

Find:

```js
    // Planets
    planets.forEach(p => drawPlanet(p));
```

Replace with:

```js
    // Planets and moons
    planets.forEach(p => drawPlanet(p));
    moons.forEach(m => drawMoon(m));
```

- [ ] **Step 5: Verify the moons orbit**

Serve and open `http://localhost:8080/games/solar-system-explorer/`, then run this in
the browser console to count the moon-coloured discs on the canvas:

```js
(() => {
  const c = document.getElementById('board'), ctx = c.getContext('2d');
  const img = ctx.getImageData(0,0,c.width,c.height).data;
  const seen = new Set();
  for (let i = 0; i < img.length; i += 4*37) seen.add(img[i]+','+img[i+1]+','+img[i+2]);
  return 'distinct colours sampled: ' + seen.size;
})()
```

Expected by eye, watching the board:

- Earth has a small grey dot circling it, about one Earth-radius away.
- Jupiter has four dots circling it at different distances and speeds.
- Saturn's dot sits outside the rings, Mars has two, Uranus and Neptune have one each.
- Mercury and Venus have none.
- The game still plays normally: the Commander still sends you to the 8 planets, and
  flying to one still completes it.

- [ ] **Step 6: Commit**

```bash
cd /Users/jiduo/github/jiduojiang.com
git add games/solar-system-explorer/index.html
git commit -m "Add orbiting moons to Solar System Explorer

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Missions target places, not planets

Generalises the mission layer so a mission can point at a moon, extends the chain to 18,
splits the HUD counter in two, and teaches the Commander about moons.

**Files:**
- Modify: `games/solar-system-explorer/index.html`

**Interfaces:**
- Consumes: `moons`, `places`, `placePos()`, `placeOrbit()` from Task 2.
- Produces: `mission.target` (a place object) replacing `mission.planet`; the
  `isMoon` flag on each mission; module-level `foundPlanets` and `foundMoons`.

- [ ] **Step 1: Extend the mission chain**

Find:

```js
  let score, lives, foundCount, over, frameCount;
```

Replace with:

```js
  let score, lives, foundCount, foundPlanets, foundMoons, over, frameCount;
```

Then find:

```js
  const missionOrder = ["Earth", "Mars", "Jupiter", "Venus", "Mercury", "Saturn", "Uranus", "Neptune"];

  const missions = missionOrder.map(name => {
    const p = planets.find(pl => pl.name === name);
    const isEarth = name === "Earth";
    return {
      type: "planet",
      planet: p,
      text: isEarth
        ? `Visit <b>Earth 🌍</b> first! The people there will give you <b>upgrades</b>!`
        : `Fly to <b>${p.name} ${p.emoji}</b>! ${p.desc}`
    };
  });
```

Replace with:

```js
  // Planet, then its moons, then on to the next planet.
  const missionOrder = [
    "Earth", "Moon",
    "Mars", "Phobos", "Deimos",
    "Jupiter", "Io", "Europa", "Ganymede", "Callisto",
    "Venus", "Mercury",
    "Saturn", "Titan",
    "Uranus", "Titania",
    "Neptune", "Triton"
  ];

  const missions = missionOrder.map(name => {
    const t = places.find(pl => pl.name === name);
    const isEarth = name === "Earth";
    return {
      target: t,
      isMoon: Boolean(t.parent),
      text: isEarth
        ? `Visit <b>Earth 🌍</b> first! The people there will give you <b>upgrades</b>!`
        : t.parent
          ? `Fly to <b>${t.name} ${t.emoji}</b>, a moon of <b>${t.parent.name}</b>! ${t.desc}`
          : `Fly to <b>${t.name} ${t.emoji}</b>! ${t.desc}`
    };
  });
```

- [ ] **Step 2: Count planets and moons separately**

Find:

```js
  function updateUI() {
    document.getElementById("found").textContent = foundCount + "/8";
    document.getElementById("score").textContent = score;
    document.getElementById("level").textContent = upgradeLevel + 1;
  }
```

Replace with:

```js
  function updateUI() {
    document.getElementById("found").textContent = foundPlanets + "/8";
    document.getElementById("found-moons").textContent = foundMoons + "/10";
    document.getElementById("score").textContent = score;
    document.getElementById("level").textContent = upgradeLevel + 1;
  }
```

- [ ] **Step 3: Add the moons HUD chip**

Find:

```html
        <div class="score__chip"><span class="lbl">PLANETS</span><span class="num" id="found">0/8</span></div>
```

Replace with:

```html
        <div class="score__chip"><span class="lbl">PLANETS</span><span class="num" id="found">0/8</span></div>
        <div class="score__chip"><span class="lbl">MOONS</span><span class="num" id="found-moons">0/10</span></div>
```

- [ ] **Step 4: Complete any place, not just a planet**

Find:

```js
  function completeCurrentMission() {
    const m = getCurrentMission();
    if (!m) return;
    m.planet.found = true;
    foundCount++;
    score += 100;
    currentMissionIdx++;
    missionCompleteTimer = 120;

    const px = CX + Math.cos(m.planet._angle) * m.planet.orbit;
    const py = CY + Math.sin(m.planet._angle) * m.planet.orbit;
    spawnParticles(px, py, m.planet.color, 30);

    // Earth gives an upgrade!
    if (m.planet.name === "Earth") {
      giveEarthUpgrade();
    }
```

Replace with:

```js
  function completeCurrentMission() {
    const m = getCurrentMission();
    if (!m) return;
    const t = m.target;
    t.found = true;
    if (m.isMoon) foundMoons++; else foundPlanets++;
    score += 100;
    currentMissionIdx++;
    missionCompleteTimer = 120;

    const pos = placePos(t);
    spawnParticles(pos.x, pos.y, t.color, 30);

    // Earth gives an upgrade!
    if (t.name === "Earth") {
      giveEarthUpgrade();
    }
```

- [ ] **Step 5: Discover the current target wherever it is**

Find in `update()`:

```js
    // Planet discovery
    const mission = getCurrentMission();
    if (mission && mission.type === "planet") {
      const p = mission.planet;
      const px = CX + Math.cos(p._angle)*p.orbit;
      const py = CY + Math.sin(p._angle)*p.orbit;
      const dx = rocket.x - px, dy = rocket.y - py;
      if (Math.sqrt(dx*dx+dy*dy) < p.r + 40) {
        completeCurrentMission();
      }
    }
```

Replace with:

```js
    // Discovery — works for a planet or a moon. Only the CURRENT mission's target
    // can complete, so you can never finish a moon you were not sent to yet.
    const mission = getCurrentMission();
    if (mission) {
      const t = mission.target;
      const pos = placePos(t);
      const dx = rocket.x - pos.x, dy = rocket.y - pos.y;
      if (Math.sqrt(dx*dx+dy*dy) < t.r + 40) {
        completeCurrentMission();
      }
    }
```

- [ ] **Step 6: Draw planets with the shared helper**

Find in `drawPlanet()`:

```js
  function drawPlanet(p) {
    const px = CX + Math.cos(p._angle)*p.orbit;
    const py = CY + Math.sin(p._angle)*p.orbit;
    if (!isVisible(px, py, p.r + 30)) return;
```

Replace with:

```js
  function drawPlanet(p) {
    const pos = placePos(p);
    const px = pos.x, py = pos.y;
    if (!isVisible(px, py, p.r + 30)) return;
```

Then find the target indicator inside `drawPlanet()`:

```js
    const mission = getCurrentMission();
    if (mission && mission.type==="planet" && mission.planet===p && !p.found) {
```

Replace with:

```js
    const mission = getCurrentMission();
    if (mission && mission.target === p && !p.found) {
```

Then add the matching ring to `drawMoon()`. Find:

```js
    // Found check
    if (m.found) {
      ctx.fillStyle = "rgba(97,201,122,0.2)";
      ctx.beginPath(); ctx.arc(s.x, s.y, m.r+6, 0, Math.PI*2); ctx.fill();
    }

    // Name label
```

Replace with:

```js
    // Found check
    if (m.found) {
      ctx.fillStyle = "rgba(97,201,122,0.2)";
      ctx.beginPath(); ctx.arc(s.x, s.y, m.r+6, 0, Math.PI*2); ctx.fill();
    }

    // Mission target indicator
    const mission = getCurrentMission();
    if (mission && mission.target === m && !m.found) {
      const pulse = 1 + Math.sin(frameCount*0.06)*0.3;
      ctx.strokeStyle = `rgba(255,200,61,${0.6*pulse})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.arc(s.x, s.y, m.r+14*pulse, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ffc83d";
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("👇", s.x, s.y - m.r - 18);
    }

    // Name label
```

- [ ] **Step 7: Teach the Commander about moons**

Find:

```js
    if (missionCompleteTimer > 0) {
      bossAvatar.textContent = "🥳";
      const m = missions[Math.min(currentMissionIdx - 1, missions.length - 1)];
      if (m) {
        bossText.innerHTML = `<span class="highlight">${m.planet.name} ${m.planet.emoji}</span> discovered! Great work!`;
      }
      return;
    }
    if (currentMissionIdx >= missions.length) {
      bossAvatar.textContent = "🏆";
      bossText.innerHTML = 'ALL 8 planets found! You are the <span class="highlight">greatest explorer</span> in the galaxy!';
      return;
    }

    bossAvatar.textContent = "👽";
    const m = missions[currentMissionIdx];
    const p = m.planet;
    let hint = "";
    const od = p.orbit;
```

Replace with:

```js
    if (missionCompleteTimer > 0) {
      bossAvatar.textContent = "🥳";
      const m = missions[Math.min(currentMissionIdx - 1, missions.length - 1)];
      if (m) {
        const t = m.target;
        bossText.innerHTML = `<span class="highlight">${t.name} ${t.emoji}</span> discovered! ${t.desc}`;
      }
      return;
    }
    if (currentMissionIdx >= missions.length) {
      bossAvatar.textContent = "🏆";
      bossText.innerHTML = 'ALL 8 planets and ALL 10 moons! You are the <span class="highlight">greatest explorer</span> in the galaxy!';
      return;
    }

    bossAvatar.textContent = "👽";
    const m = missions[currentMissionIdx];
    const t = m.target;
    const prev = currentMissionIdx > 0 ? missions[currentMissionIdx - 1].target : null;
    const intro = (t.parent && prev === t.parent) ? "Nice — that planet is done! Now check its moons. " : "";
    let hint = "";
    const od = placeOrbit(t);
```

Then find the hint chain, which begins with the first distance test:

```js
    if (od < 200) hint = "Very close to the Sun!";
```

Replace with:

```js
    if (t.name === "Mercury" || t.name === "Venus") hint = "This planet has NO moons at all!";
    else if (od < 200) hint = "Very close to the Sun!";
```

And find the line that writes the speech:

```js
    bossText.innerHTML = `${m.text} <span style="color:var(--ink-soft);font-size:var(--t-xs)">📍 ${hint}</span>`;
```

Replace with:

```js
    bossText.innerHTML = `${intro}${m.text} <span style="color:var(--ink-soft);font-size:var(--t-xs)">📍 ${hint}</span>`;
```

- [ ] **Step 8: Indent moons in the mission list**

Find:

```js
    for (let i = 0; i < missions.length; i++) {
      const m = missions[i];
      if (i < currentMissionIdx) {
        html += `<div class="done">✅ ${m.planet.emoji} ${m.planet.name}</div>`;
      } else if (i === currentMissionIdx) {
        html += `<div class="current">🎯 ${m.planet.emoji} ${m.planet.name} ← GO!</div>`;
      } else {
        html += `<div style="opacity:0.4">⬜ ${m.planet.emoji} ${m.planet.name}</div>`;
      }
    }
```

Replace with:

```js
    for (let i = 0; i < missions.length; i++) {
      const t = missions[i].target;
      const moonCls = t.parent ? " moon" : "";
      const label = `${t.emoji} ${t.name}`;
      if (i < currentMissionIdx) {
        html += `<div class="done${moonCls}">✅ ${label}</div>`;
      } else if (i === currentMissionIdx) {
        html += `<div class="current${moonCls}">🎯 ${label} ← GO!</div>`;
      } else {
        html += `<div class="pending${moonCls}">⬜ ${label}</div>`;
      }
    }
```

The three states now carry classes instead of an inline style, so the moon indent
composes with them. Find the existing `.mission-list` rules:

```css
  .mission-list .done { text-decoration: line-through; color: var(--c4); }
  .mission-list .current { color: var(--c5); font-weight: 700; }
```

Replace with:

```css
  .mission-list .done { text-decoration: line-through; color: var(--c4); }
  .mission-list .current { color: var(--c5); font-weight: 700; }
  .mission-list .pending { opacity: 0.4; }
  .mission-list .moon { padding-left: 18px; }
```

- [ ] **Step 9: Point the minimap and the arrow at the target**

Find in `drawMinimap()`:

```js
    const mission = getCurrentMission();
    if (mission && mission.type==="planet" && !mission.planet.found) {
      const p = mission.planet;
      const px = CX + Math.cos(p._angle)*p.orbit, py = CY + Math.sin(p._angle)*p.orbit;
      const pulse = 1 + Math.sin(frameCount*0.08)*0.4;
      ctx.strokeStyle = `rgba(255,200,61,${0.7*pulse})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(mmX+px*scale, mmY+py*scale, 6*pulse, 0, Math.PI*2); ctx.stroke();
    }
```

Replace with:

```js
    const mission = getCurrentMission();
    if (mission && !mission.target.found) {
      const pos = placePos(mission.target);
      const pulse = 1 + Math.sin(frameCount*0.08)*0.4;
      ctx.strokeStyle = `rgba(255,200,61,${0.7*pulse})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(mmX+pos.x*scale, mmY+pos.y*scale, 6*pulse, 0, Math.PI*2); ctx.stroke();
    }
```

Then find in `drawDirectionArrow()`:

```js
    const mission = getCurrentMission();
    if (!mission || mission.type!=="planet" || mission.planet.found) return;
    const p = mission.planet;
    const px = CX + Math.cos(p._angle)*p.orbit;
    const py = CY + Math.sin(p._angle)*p.orbit;
    const ts = worldToScreen(px, py);
```

Replace with:

```js
    const mission = getCurrentMission();
    if (!mission || mission.target.found) return;
    const pos = placePos(mission.target);
    const ts = worldToScreen(pos.x, pos.y);
```

- [ ] **Step 10: Initialise the two counters**

Find in `reset()`:

```js
    score = 0;
    lives = 3;
    foundCount = 0;
```

Replace with:

```js
    score = 0;
    lives = 3;
    foundCount = 0;
    foundPlanets = 0;
    foundMoons = 0;
```

Also update the game-over overlay text:

```html
        <div class="gameover__sub" id="go-sub">You discovered <b id="go-found">0</b> planets.</div>
```

Replace with:

```html
        <div class="gameover__sub" id="go-sub">You discovered <b id="go-found">0</b> places.</div>
```

- [ ] **Step 11: Verify a full playthrough**

Serve and open `http://localhost:8080/games/solar-system-explorer/`. Play it by hand,
flying to each target in turn. Watch for:

- The Missions panel lists 18 entries, with moons indented under their planets.
- HUD shows `PLANETS n/8` and `MOONS n/10` moving independently, and all four chips
  (LEVEL, PLANETS, MOONS, SCORE) still fit on one row at desktop width.
- After Earth, the Commander sends you to the **Moon**, and after Mars to **Phobos**
  and **Deimos** — and says "Nice — that planet is done! Now check its moons."
- Flying near Jupiter does **not** complete Io unless Io is the current target.
- Mercury and Venus show "This planet has NO moons at all!" when they become current.
- Moons are indented in the list and get a 👇 marker on the board when they are current.
- The final mission shows the 🏆 "ALL 8 planets and ALL 10 moons!" line.

- [ ] **Step 12: Commit**

```bash
cd /Users/jiduo/github/jiduojiang.com
git add games/solar-system-explorer/index.html
git commit -m "Extend missions to moons with 18-stop chain

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Remember progress

Mirrors the run into `localStorage` so a refresh resumes instead of restarting, makes
`R` a retry that never wipes, and adds the one control that does wipe.

**Files:**
- Modify: `games/solar-system-explorer/index.html`

**Interfaces:**
- Consumes: `places`, `missions`, `currentMissionIdx`, `foundPlanets`, `foundMoons`,
  `unlockedUpgrades`, `applyUpgrade()`, `reset()`, `completeCurrentMission()`.
- Produces: `SAVE_KEY`, `saveProgress()`, `readSave()`, `clearSave()`, `retry()`,
  `startOver()`; `reset(save)` accepts an optional save object.

- [ ] **Step 1: Add the save helpers, and save on every discovery**

Find:

```js
  function getCurrentMission() {
```

Replace with:

```js
  const SAVE_KEY = "sse.progress";

  function saveProgress() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1,
        currentMissionIdx, score, lives, upgradeLevel, unlockedUpgrades,
        foundIds: places.filter(p => p.found).map(p => p.name)
      }));
    } catch { /* private mode or full quota — the game still plays, it just won't resume */ }
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
  }

  // Returns a usable save object, or null. A corrupt or stale save must never
  // break the page — anything unexpected falls back to a fresh game.
  function readSave() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (!s || s.v !== 1) return null;
      if (!Number.isInteger(s.currentMissionIdx)) return null;
      if (s.currentMissionIdx < 0 || s.currentMissionIdx > missions.length) return null;
      if (!Array.isArray(s.foundIds) || !Array.isArray(s.unlockedUpgrades)) return null;
      if (!Number.isFinite(s.score) || !Number.isFinite(s.lives)) return null;
      return s;
    } catch { return null; }
  }

  function getCurrentMission() {
```

Nothing calls `saveProgress()` yet, so without this second edit progress is only ever
recorded on death. Find the end of `completeCurrentMission()`:

```js
    // Earth gives an upgrade!
    if (t.name === "Earth") {
      giveEarthUpgrade();
    }

    updateUI();
    updateBossText();
    updateMissionList();
  }
```

Replace with:

```js
    // Earth gives an upgrade!
    if (t.name === "Earth") {
      giveEarthUpgrade();
    }

    saveProgress();
    updateUI();
    updateBossText();
    updateMissionList();
  }
```

`saveProgress()` must run *after* `giveEarthUpgrade()`: that function can award bonus
score when every upgrade is already owned, and the save has to capture the final score.

- [ ] **Step 2: Let reset() take a save**

Find the whole of:

```js
  function reset() {
    rocket = { x: CX + 270, y: CY + 20, vx: 0, vy: 0, r: 12, angle: 0 };
    camera = { x: rocket.x - VW/2, y: rocket.y - VH/2 };
    particles = [];
    score = 0;
    lives = 3;
    foundCount = 0;
    foundPlanets = 0;
    foundMoons = 0;
    over = false;
    frameCount = 0;
    currentMissionIdx = 0;
    invincibleTimer = 0;
    missionCompleteTimer = 0;
    earthVisitTimer = 0;
    upgradeLevel = 0;
    unlockedUpgrades = [];
    speedMultiplier = 1;

    planets.forEach(p => { p.found = false; p._angle = Math.random() * Math.PI * 2; });
```

Replace with:

```js
  // reset() with no argument starts a brand-new game. reset(save) resumes one.
  function reset(save) {
    rocket = { x: CX + 270, y: CY + 20, vx: 0, vy: 0, r: 12, angle: 0 };
    camera = { x: rocket.x - VW/2, y: rocket.y - VH/2 };
    particles = [];
    over = false;
    frameCount = 0;
    invincibleTimer = 0;
    missionCompleteTimer = 0;
    earthVisitTimer = 0;

    score = save ? save.score : 0;
    lives = save ? save.lives : 3;
    upgradeLevel = save ? save.upgradeLevel : 0;
    unlockedUpgrades = save ? save.unlockedUpgrades.slice() : [];
    currentMissionIdx = save ? save.currentMissionIdx : 0;
    speedMultiplier = 1;
    unlockedUpgrades.forEach(id => applyUpgrade({ id }));

    places.forEach(p => { p.found = false; p._angle = Math.random() * Math.PI * 2; });
    if (save) places.forEach(p => { if (save.foundIds.includes(p.name)) p.found = true; });
    foundPlanets = places.filter(p => !p.parent &&  p.found).length;
    foundMoons   = places.filter(p =>  p.parent &&  p.found).length;
    foundCount   = foundPlanets + foundMoons;
    resumedOnce  = Boolean(save) && currentMissionIdx > 0;
```

The lines that follow (`generateStars()`, `updateUI()`, the
`document.getElementById("gameover").hidden = true;` line) are unchanged and still
close the function.

`reset(save)` deliberately does **not** touch the stored save — only `retry()` and
`startOver()` manage it. Clearing it here would defeat the whole feature.

- [ ] **Step 3: Add retry() and start-over**

Find:

```js
  function endGame() {
    over = true;
    spawnParticles(rocket.x, rocket.y, "#ffc83d", 40);
    updateBossText();
    document.getElementById("go-found").textContent = foundCount;
    document.getElementById("gameover").hidden = false;
  }
```

Replace with:

```js
  function endGame() {
    over = true;
    saveProgress();
    spawnParticles(rocket.x, rocket.y, "#ffc83d", 40);
    updateBossText();
    document.getElementById("go-found").textContent = foundCount;
    document.getElementById("gameover").hidden = false;
  }

  // Try again after dying: keep every discovery, just refill the lives.
  function retry() {
    const save = readSave();
    if (save) { save.lives = 3; reset(save); }
    else reset();
  }

  // The only way to lose progress, and the player has to confirm it first.
  function startOver() {
    if (!confirm("Start over from the very beginning? You will lose all your progress.")) return;
    clearSave();
    reset();
  }
```

- [ ] **Step 4: Wire the keys and buttons**

Find:

```js
    if (k==="r") reset();
```

Replace with:

```js
    if (k==="r") retry();
```

Find:

```js
  // Buttons
  document.getElementById("restart").addEventListener("click", reset);
  document.getElementById("play-again").addEventListener("click", reset);

  reset();
  gameLoop();
```

Replace with:

```js
  // Buttons
  document.getElementById("restart").addEventListener("click", startOver);
  document.getElementById("play-again").addEventListener("click", retry);

  reset(readSave());
  gameLoop();
```

- [ ] **Step 5: Relabel the controls**

Find:

```html
            <span><b>R</b> restart</span>
```

Replace with:

```html
            <span><b>R</b> try again</span>
```

Find:

```html
        <button class="btn btn--primary" id="restart" style="justify-content:center;">↻ Restart</button>
```

Replace with:

```html
        <button class="btn btn--primary" id="restart" style="justify-content:center;">↻ Start over</button>
```

Find:

```html
        <button class="btn btn--primary" id="play-again">play again</button>
```

Replace with:

```html
        <button class="btn btn--primary" id="play-again">try again</button>
```

- [ ] **Step 6: Greet a returning player**

The greeting must sit *inside* the mission line and not replace it. If it returns
early, a returning player stares at "Welcome back" with no idea where to fly —
which is exactly the bug this step exists to avoid.

Declare the flag next to the other state. Find:

```js
  let score, lives, foundCount, foundPlanets, foundMoons, over, frameCount;
```

Replace with:

```js
  let score, lives, foundCount, foundPlanets, foundMoons, over, frameCount;
  let resumedOnce = false;
```

`reset(save)` already sets `resumedOnce` (Step 2). Now find in `updateBossText()`:

```js
    bossAvatar.textContent = "👽";
    const m = missions[currentMissionIdx];
    const t = m.target;
    const prev = currentMissionIdx > 0 ? missions[currentMissionIdx - 1].target : null;
    const intro = (t.parent && prev === t.parent) ? "Nice — that planet is done! Now check its moons. " : "";
    let hint = "";
    const od = placeOrbit(t);
```

Replace with:

```js
    bossAvatar.textContent = "👽";
    const m = missions[currentMissionIdx];
    const t = m.target;
    const prev = currentMissionIdx > 0 ? missions[currentMissionIdx - 1].target : null;
    const welcome = resumedOnce ? "Welcome back, cadet! " : "";
    resumedOnce = false;
    const intro = (t.parent && prev === t.parent) ? "Nice — that planet is done! Now check its moons. " : "";
    let hint = "";
    const od = placeOrbit(t);
```

And find the line that writes the speech:

```js
    bossText.innerHTML = `${intro}${m.text} <span style="color:var(--ink-soft);font-size:var(--t-xs)">📍 ${hint}</span>`;
```

Replace with:

```js
    bossText.innerHTML = `${welcome}${intro}${m.text} <span style="color:var(--ink-soft);font-size:var(--t-xs)">📍 ${hint}</span>`;
```

- [ ] **Step 7: Verify resume, retry, and start over**

Serve and open `http://localhost:8080/games/solar-system-explorer/`. Then:

1. Fly to Earth and then the Moon. HUD should read
   `PLANETS 1/8` and `MOONS 1/10`, score 200.
2. Reload the page. Expected: the Commander says "Welcome back, cadet!", the HUD still
   reads `PLANETS 1/8` / `MOONS 1/10` / score 200, and the Missions panel still shows
   the first two ticked off.
3. In the console, confirm the shape of the save:

```js
JSON.parse(localStorage.getItem('sse.progress'))
```

Expected: `currentMissionIdx: 2`, `foundIds: ["Earth","Moon"]`, `score: 200`, `lives: 3`.

4. Fly into the Sun three times to lose all lives. On the game-over box press
   **try again** (or `R`). Expected: lives back to 3, and you are still on mission 3
   with score 200 — **not** back at mission 1.
5. Click **↻ Start over** and cancel the browser dialog. Expected: nothing changes.
6. Click **↻ Start over** and accept. Expected: score 0, `PLANETS 0/8`, `MOONS 0/10`,
   mission list back to Earth, and `localStorage.getItem('sse.progress')` is `null`.
7. Corrupt-save check — paste this, then reload:

```js
localStorage.setItem('sse.progress', '{"v":1,"currentMissionIdx":999,"foundIds":[]}')
```

Expected: the game starts fresh with no console errors, rather than breaking.

- [ ] **Step 8: Commit**

```bash
cd /Users/jiduo/github/jiduojiang.com
git add games/solar-system-explorer/index.html
git commit -m "Save Solar System Explorer progress between visits

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Notes for the implementer

- `npm run build` is needed once, in Task 1, because the slug changes. It is not needed
  again — nothing else here touches `meta.json`.
- Do not run the publish skill or `wrangler deploy`. Jiduo says "发布" when he wants that.
- Leave the unrelated working-tree files alone (`.playwright-mcp/`, the stray
  `solar-system-*.png` and `space-shooter-*.png` screenshots in the repo root). Stage
  only `games/`.
- The `solar-system-*.png` screenshots in the repo root are old dev screenshots of this
  same game. They are not referenced by anything and are not part of this plan.
