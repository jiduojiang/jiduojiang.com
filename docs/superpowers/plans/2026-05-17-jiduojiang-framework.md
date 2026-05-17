# jiduojiang.com Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the jiduojiang.com framework so a 6-year-old can build games/tools through natural-language vibe coding, with automatic GitHub → Cloudflare Pages deployment.

**Architecture:** Single repo, single Cloudflare Pages deployment. Each project is a folder under `games/{slug}/` or `tools/{slug}/` with `index.html` + `meta.json`. A Node build script scans these folders and injects card HTML into `index.html.template` to produce the homepage. Visual design strictly follows `/shared/DESIGN.md` (sticker notebook aesthetic, 6 crayon colors, BEM components in `/shared/components.css`).

**Tech Stack:** Plain HTML/CSS/JS (no framework, no bundler), Node 18+ for build script (no deps), Cloudflare Pages for hosting, Cloudflare D1 for any future per-project databases.

**Reference docs:**
- Spec: `docs/superpowers/specs/2026-05-17-jiduojiang-framework-design.md`
- Design system: will become `shared/DESIGN.md` (currently at `design/shared/DESIGN.md`)
- Homepage visual reference (don't copy code from this — it's a React preview with non-production class names): `design/jiduojiang-homepage.html`

---

## File Structure (what gets created/moved)

**Files moved out of `design/`:**
- `design/shared/{fonts.css, tokens.css, components.css, DESIGN.md}` → `shared/`
- `design/games/snake/{index.html, meta.json}` → `games/snake/`
- `design/tools/timer/{index.html, meta.json}` → `tools/timer/`

**Files moved within `design/`:**
- `design/{homepage-app.jsx, tweaks-panel.jsx}` → `design/_drafts/`

**Files created from scratch:**
- `package.json` — declares `npm run build`, no runtime deps
- `wrangler.toml` — minimal Cloudflare Pages config
- `index.html.template` — homepage template using production BEM classes
- `shared/homepage.css` — homepage-only styles (hero, portrait, footer)
- `scripts/build-index.mjs` — scans projects, generates cards, injects into template
- `CLAUDE.md` — global instructions for Claude (English)
- `.claude/skills/new-project/SKILL.md` — kid-says-new-thing skill
- `.claude/skills/publish/SKILL.md` — kid-says-ship-it skill
- `README.md` — short English readme

**Files modified:**
- `.gitignore` — add `/index.html` (build artifact), `node_modules/`, `.DS_Store`
- `games/snake/index.html` (after move) — fix `../../shared/` paths to absolute `/shared/`
- `tools/timer/index.html` (after move) — same fix

---

## Task 1: Move design/shared/ to /shared/

**Files:**
- Move: `design/shared/fonts.css` → `shared/fonts.css`
- Move: `design/shared/tokens.css` → `shared/tokens.css`
- Move: `design/shared/components.css` → `shared/components.css`
- Move: `design/shared/DESIGN.md` → `shared/DESIGN.md`

- [ ] **Step 1: Create shared/ at repo root and move files**

```bash
mkdir -p shared
git mv design/shared/fonts.css shared/fonts.css
git mv design/shared/tokens.css shared/tokens.css
git mv design/shared/components.css shared/components.css
git mv design/shared/DESIGN.md shared/DESIGN.md
rmdir design/shared
```

- [ ] **Step 2: Verify**

```bash
ls -la shared/
```

Expected: four files (`fonts.css`, `tokens.css`, `components.css`, `DESIGN.md`).

```bash
ls design/shared 2>&1 | head -3
```

Expected: directory does not exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Move design/shared/ to /shared/ as production CSS"
```

---

## Task 2: Move example projects (snake + timer) to project root

The two example projects under `design/` become the framework's initial seed projects, proving the structure works end-to-end.

**Files:**
- Move: `design/games/snake/` → `games/snake/`
- Move: `design/tools/timer/` → `tools/timer/`

- [ ] **Step 1: Create directories and move snake**

```bash
mkdir -p games tools
git mv design/games/snake games/snake
git mv design/tools/timer tools/timer
rmdir design/games design/tools
```

- [ ] **Step 2: Verify**

```bash
ls games/snake/ tools/timer/
```

Expected: each shows `index.html` and `meta.json`.

```bash
ls design/games design/tools 2>&1 | head -3
```

Expected: both directories do not exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Move snake and timer from design/ to project root as seed projects"
```

---

## Task 3: Fix relative paths in seed projects to absolute /shared/

The snake and timer `index.html` currently use `../../shared/...` (relative) paths. DESIGN.md documents `/shared/...` (absolute) as the convention because absolute paths work regardless of nesting depth and are what new projects scaffolded by Claude will use.

**Files:**
- Modify: `games/snake/index.html` (the three `<link>` tags in the `<head>`)
- Modify: `tools/timer/index.html` (the three `<link>` tags in the `<head>`)

- [ ] **Step 1: Replace relative paths in snake**

In `games/snake/index.html`, change:

```html
<link rel="stylesheet" href="../../shared/fonts.css">
<link rel="stylesheet" href="../../shared/tokens.css">
<link rel="stylesheet" href="../../shared/components.css">
```

To:

```html
<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">
```

- [ ] **Step 2: Same change in timer**

In `tools/timer/index.html`, replace the same three lines the same way.

- [ ] **Step 3: Verify no relative shared/ paths remain**

```bash
grep -rn "\.\./\.\./shared" games/ tools/ 2>&1
```

Expected: no matches.

```bash
grep -rn "/shared/" games/snake/index.html tools/timer/index.html
```

Expected: three matches per file (fonts, tokens, components).

- [ ] **Step 4: Commit**

```bash
git add games/snake/index.html tools/timer/index.html
git commit -m "Use absolute /shared/ paths in seed projects to match DESIGN.md convention"
```

---

## Task 4: Reorganize design/ — move JSX drafts, keep references

The remaining `design/` folder keeps the homepage preview (`jiduojiang-homepage.html`) and design system showcase (`design-system.html`) as visual references. The two `.jsx` files were exploratory React drafts and explicitly conflict with the "no framework" decision in the spec — move them under `_drafts/` so they're clearly marked as not-the-implementation.

**Files:**
- Move: `design/homepage-app.jsx` → `design/_drafts/homepage-app.jsx`
- Move: `design/tweaks-panel.jsx` → `design/_drafts/tweaks-panel.jsx`
- Delete: `design/.DS_Store`

- [ ] **Step 1: Move JSX files into _drafts/**

```bash
mkdir -p design/_drafts
git mv design/homepage-app.jsx design/_drafts/homepage-app.jsx
git mv design/tweaks-panel.jsx design/_drafts/tweaks-panel.jsx
rm -f design/.DS_Store
```

- [ ] **Step 2: Add a short README explaining what design/ is**

Create `design/README.md`:

```markdown
# Design References

This folder holds visual references for jiduojiang.com.
**Files here are not deployed.** The production CSS lives in `/shared/`.

- `jiduojiang-homepage.html` — design preview of the homepage (uses React + inline CSS;
  the production homepage is generated from `/index.html.template` with `/shared/components.css`)
- `design-system.html` — living style guide showing every component in `/shared/components.css`
- `_drafts/` — exploratory React drafts. Do not use; the project is plain HTML/CSS/JS.

Authoritative design rules live at `/shared/DESIGN.md`.
```

- [ ] **Step 3: Verify structure**

```bash
ls design/
```

Expected: `README.md`, `_drafts/`, `design-system.html`, `jiduojiang-homepage.html`.

```bash
ls design/_drafts/
```

Expected: `homepage-app.jsx`, `tweaks-panel.jsx`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Reorganize design/: move JSX drafts to _drafts/, add README"
```

---

## Task 5: Update .gitignore for build artifact + system files

**Files:**
- Modify: `.gitignore` (already exists; extend it)

- [ ] **Step 1: Replace .gitignore contents**

Overwrite `.gitignore` with:

```
.env
.envrc
node_modules/
.DS_Store

# Build artifact (generated by scripts/build-index.mjs)
/index.html
```

- [ ] **Step 2: Verify**

```bash
cat .gitignore
```

Expected: the five entries above.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "Extend .gitignore for build artifact and .DS_Store"
```

---

## Task 6: Create package.json (no runtime deps, just the build script)

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "jiduojiang-com",
  "version": "0.1.0",
  "private": true,
  "description": "Jiduo Jiang's playground — games and tools made with Claude Code",
  "type": "module",
  "scripts": {
    "build": "node scripts/build-index.mjs",
    "dev": "wrangler pages dev . --compatibility-date=2026-05-17"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: Verify it parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Add package.json with build and dev scripts"
```

---

## Task 7: Create minimal wrangler.toml

This is enough for `wrangler pages dev` locally. D1 bindings get appended later when a project needs persistence.

**Files:**
- Create: `wrangler.toml`

- [ ] **Step 1: Create wrangler.toml**

```toml
name = "jiduojiang"
compatibility_date = "2026-05-17"
pages_build_output_dir = "."

# D1 database bindings will be appended here as individual projects need
# persistence. Example (added automatically by Claude when needed):
#
# [[d1_databases]]
# binding = "DB_GAMES_SNAKE"
# database_name = "games-snake"
# database_id = "<uuid from wrangler d1 create>"
```

- [ ] **Step 2: Commit**

```bash
git add wrangler.toml
git commit -m "Add minimal wrangler.toml for Cloudflare Pages"
```

---

## Task 8: Create shared/homepage.css for homepage-only styles

The hero block, portrait placeholder, washi tape, and footer styles are unique to the homepage — they're not reusable components, so they don't belong in `components.css`. Keep them in a separate `homepage.css` that only `index.html` links.

**Files:**
- Create: `shared/homepage.css`

- [ ] **Step 1: Create homepage.css**

```css
/* shared/homepage.css
   ────────────────────────────────────────
   Homepage-only styles. Linked only from /index.html.
   Reusable components live in components.css.
*/

/* ─── hero ──────────────────────────────────────── */

.hero {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 40px;
  align-items: center;
  background: var(--surface);
  border: var(--stroke);
  border-radius: var(--r-2xl);
  padding: 44px 48px;
  box-shadow: var(--shadow-soft);
  position: relative;
  margin-bottom: var(--sp-8);
}

.hero__title {
  font-family: var(--f-display);
  font-size: var(--t-hero);
  line-height: 1.05;
  margin: 0 0 14px;
  letter-spacing: .01em;
}
.hero__title .wave {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: wave 3.4s ease-in-out infinite;
}

.hero__lead {
  font-family: var(--f-body);
  font-size: var(--t-md);
  color: var(--ink-soft);
  margin: 0 0 22px;
  line-height: 1.55;
  max-width: 520px;
}

.hero__facts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: var(--sp-5);
}

.hero__tape-1 {
  position: absolute;
  width: 110px; height: 26px;
  background: var(--tape-1);
  border-top: 1px dashed rgba(0,0,0,.15);
  border-bottom: 1px dashed rgba(0,0,0,.15);
  top: -13px; left: 70px;
  transform: rotate(-6deg);
}
.hero__tape-2 {
  position: absolute;
  width: 110px; height: 26px;
  background: var(--tape-2);
  border-top: 1px dashed rgba(0,0,0,.15);
  border-bottom: 1px dashed rgba(0,0,0,.15);
  top: -13px; right: 90px;
  transform: rotate(5deg);
}

/* ─── portrait placeholder ──────────────────────── */

.portrait {
  position: relative;
  aspect-ratio: 1/1;
  width: 100%;
  max-width: 360px;
  margin-left: auto;
}
.portrait__frame {
  position: absolute; inset: 0;
  background: var(--c2);
  border: var(--stroke);
  border-radius: var(--r-2xl);
  box-shadow: var(--shadow-stamp-lg);
  transform: rotate(3deg);
  overflow: hidden;
  background-image:
    repeating-linear-gradient(135deg, rgba(0,0,0,.05) 0 8px, transparent 8px 18px);
}
.portrait__frame::after {
  content: "";
  position: absolute; inset: 14px;
  border: 2px dashed rgba(0,0,0,.35);
  border-radius: var(--r-md);
}
.portrait__face {
  position: absolute; inset: 18%;
  display: grid; place-items: center;
  font-size: 120px;
}
.portrait__cap {
  position: absolute; left: 50%; bottom: 18px;
  transform: translateX(-50%);
  font-family: var(--f-mono); font-size: var(--t-xs);
  color: rgba(0,0,0,.55);
  background: rgba(255,255,255,.7);
  padding: 5px 10px;
  border-radius: var(--r-pill);
  white-space: nowrap;
}
.portrait__sticker {
  position: absolute;
  font-size: 28px;
  background: var(--surface);
  border: 2.5px solid var(--ink);
  border-radius: var(--r-pill);
  width: 56px; height: 56px;
  display: grid; place-items: center;
  box-shadow: var(--shadow-stamp);
}
.portrait__sticker--1 { top: -12px; right: 20px; transform: rotate(12deg); }
.portrait__sticker--2 { bottom: -10px; left: 10px; transform: rotate(-10deg); background: var(--c4); }
.portrait__sticker--3 { bottom: 40px; right: -18px; transform: rotate(8deg); background: var(--c5); color: white; }

/* ─── card grid tilt for homepage ───────────────── */

.grid .card:nth-child(4n+1) { --tilt: -1.2deg; }
.grid .card:nth-child(4n+2) { --tilt:  1.1deg; }
.grid .card:nth-child(4n+3) { --tilt:  -.6deg; }
.grid .card:nth-child(4n+4) { --tilt:  1.4deg; }

/* ─── animations ────────────────────────────────── */

@keyframes wave {
  0%, 60%, 100% { transform: rotate(0deg); }
  10%, 30%      { transform: rotate(18deg); }
  20%           { transform: rotate(-10deg); }
  40%           { transform: rotate(12deg); }
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/homepage.css
git commit -m "Add shared/homepage.css for homepage-only hero and portrait styles"
```

---

## Task 9: Create index.html.template

Production homepage template using the BEM classes from `shared/components.css` plus the hero/portrait styles from `shared/homepage.css`. Card lists are placeholder comments that the build script replaces.

**Files:**
- Create: `index.html.template`

- [ ] **Step 1: Create the template**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Jiduo's Lab · jiduojiang.com</title>

<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">
<link rel="stylesheet" href="/shared/homepage.css">
</head>
<body>

<div class="page">

  <header class="topbar">
    <a class="brand" href="/">
      <div class="brand-mark">J</div>
      <div>
        <div class="brand-name">jiduojiang<span class="dot">.</span>com</div>
        <div class="brand-sub">// stuff Jiduo made</div>
      </div>
    </a>
  </header>

  <section class="hero">
    <div class="hero__tape-1"></div>
    <div class="hero__tape-2"></div>

    <div>
      <h1 class="hero__title">Hi! I'm Jiduo <span class="wave">👋</span></h1>
      <p class="hero__lead">I'm 6 years old. I make games and tools with my computer.
        Click anything below to play with what I made.</p>

      <div class="hero__facts">
        <div class="fact-chip"><span class="emo">🎂</span>6 years old</div>
        <div class="fact-chip"><span class="emo">🎮</span>loves games</div>
        <div class="fact-chip"><span class="emo">✏️</span>and drawing</div>
      </div>
    </div>

    <div class="portrait">
      <div class="portrait__frame">
        <div class="portrait__face">🧒</div>
        <div class="portrait__cap">self-portrait.jpg</div>
      </div>
      <div class="portrait__sticker portrait__sticker--1">⭐</div>
      <div class="portrait__sticker portrait__sticker--2">🚀</div>
      <div class="portrait__sticker portrait__sticker--3">❤️</div>
    </div>
  </section>

  <header class="section-head">
    <span class="section-head__emoji">🎮</span>
    <h2 class="section-head__title">Games I made</h2>
    <span class="section-head__count"><!-- GAMES_COUNT --></span>
    <span class="section-head__rule"></span>
  </header>
  <div class="grid">
    <!-- GAMES_CARDS -->
  </div>

  <header class="section-head" style="margin-top: var(--sp-8);">
    <span class="section-head__emoji">🔧</span>
    <h2 class="section-head__title">Tools I made</h2>
    <span class="section-head__count"><!-- TOOLS_COUNT --></span>
    <span class="section-head__rule"></span>
  </header>
  <div class="grid">
    <!-- TOOLS_CARDS -->
  </div>

  <footer class="footer">
    <span>made by jiduo · <span class="heart">♥</span></span>
    <span>jiduojiang.com</span>
  </footer>

</div>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html.template
git commit -m "Add index.html.template using production BEM classes and card placeholders"
```

---

## Task 10: Create scripts/build-index.mjs (the build script)

Scans `games/` and `tools/`, generates BEM card HTML, replaces placeholders, writes `index.html`.

**Files:**
- Create: `scripts/build-index.mjs`

- [ ] **Step 1: Create the script**

```javascript
// scripts/build-index.mjs
// ────────────────────────────────────────
// Scans games/ and tools/ for meta.json files and generates the
// homepage by replacing card placeholders in index.html.template.
//
// Run with: npm run build

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TEMPLATE = join(ROOT, 'index.html.template');
const OUTPUT = join(ROOT, 'index.html');
const CRAYONS = ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6'];

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (iso) => {
  const d = new Date(iso + 'T00:00:00Z');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
};

function scanProjects(typeDir) {
  const dir = join(ROOT, typeDir);
  if (!existsSync(dir)) return [];

  const slugs = readdirSync(dir).filter((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() && existsSync(join(full, 'meta.json'));
  });

  const projects = slugs.map((slug) => {
    const metaPath = join(dir, slug, 'meta.json');
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    return {
      slug,
      type: typeDir,
      title: meta.title || slug,
      description: meta.description || '',
      emoji: meta.emoji || '✨',
      created: meta.created || '1970-01-01',
    };
  });

  projects.sort((a, b) => (a.created < b.created ? 1 : -1));
  return projects;
}

function renderCard(project, index) {
  const crayon = CRAYONS[index % CRAYONS.length];
  const href = `/${project.type}/${project.slug}/`;
  return `<a class="card" style="--card-bg: var(${crayon})" href="${escapeHtml(href)}">
  <div class="card__emoji">${escapeHtml(project.emoji)}</div>
  <h3 class="card__title">${escapeHtml(project.title)}</h3>
  <p class="card__desc">${escapeHtml(project.description)}</p>
  <div class="card__meta">
    <span>${escapeHtml(formatDate(project.created))}</span>
    <span class="card__go">→</span>
  </div>
</a>`;
}

function renderCardList(projects) {
  if (projects.length === 0) {
    return '<p style="grid-column: 1/-1; color: var(--ink-soft); font-family: var(--f-hand); font-size: 22px;">nothing here yet — make something! ✨</p>';
  }
  return projects.map(renderCard).join('\n');
}

function formatCount(n) {
  if (n === 0) return 'none yet';
  if (n === 1) return '1 thing';
  return `${n} things`;
}

function build() {
  const games = scanProjects('games');
  const tools = scanProjects('tools');

  let html = readFileSync(TEMPLATE, 'utf8');
  html = html.replace('<!-- GAMES_CARDS -->', renderCardList(games));
  html = html.replace('<!-- TOOLS_CARDS -->', renderCardList(tools));
  html = html.replace('<!-- GAMES_COUNT -->', formatCount(games.length));
  html = html.replace('<!-- TOOLS_COUNT -->', formatCount(tools.length));

  writeFileSync(OUTPUT, html);

  console.log(`✓ wrote ${OUTPUT}`);
  console.log(`  ${games.length} game(s): ${games.map((g) => g.slug).join(', ') || '(none)'}`);
  console.log(`  ${tools.length} tool(s): ${tools.map((t) => t.slug).join(', ') || '(none)'}`);
}

build();
```

- [ ] **Step 2: Make scripts/ directory and put it there**

```bash
mkdir -p scripts
```

Then write the file at `scripts/build-index.mjs` with the code above.

- [ ] **Step 3: Run the build**

```bash
npm run build
```

Expected output:

```
✓ wrote /Users/thorb/github/jiduojiang.com/index.html
  1 game(s): snake
  1 tool(s): timer
```

- [ ] **Step 4: Verify the generated index.html has both cards and points to correct URLs**

```bash
grep -c 'class="card"' index.html
```

Expected: `2` (one snake, one timer).

```bash
grep -E 'href="/games/snake/"|href="/tools/timer/"' index.html
```

Expected: both lines present.

```bash
grep -E 'GAMES_CARDS|TOOLS_CARDS|GAMES_COUNT|TOOLS_COUNT' index.html
```

Expected: no matches (all placeholders replaced).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-index.mjs
git commit -m "Add build-index.mjs: scans games/ and tools/, generates homepage cards"
```

---

## Task 11: Local preview — verify homepage and seed projects render correctly

Use `wrangler pages dev` to serve the site locally and visually verify nothing is broken. This is the "smoke test" for the framework.

- [ ] **Step 1: Start the local dev server**

```bash
npm run dev
```

Expected: wrangler starts on `http://localhost:8788` (or similar). If wrangler is not installed globally, install it first:

```bash
npm install -g wrangler
```

Then re-run `npm run dev`.

- [ ] **Step 2: In a browser, open `http://localhost:8788/`**

Verify (these are visual checks — confirm each before moving on):
- Hero block with "Hi! I'm Jiduo 👋" and the wave animation
- Three fact chips (6 years old / loves games / and drawing)
- Portrait placeholder on the right with stickers
- "Games I made" section with one card (Snake, 🐍, green/c4 emoji block)
- "Tools I made" section with one card (Tooth Timer, ⏱️)
- Cards have the 5px ink stamp shadow, slight tilt, dashed-rule section dividers
- Footer at the bottom

- [ ] **Step 3: Click the Snake card**

Expected: navigates to `/games/snake/`, the Snake project loads with topbar (back-to-home button works), and the game is playable.

- [ ] **Step 4: Click "← home" / brand → back to homepage**

Expected: returns to homepage cleanly.

- [ ] **Step 5: Open `/tools/timer/`**

Expected: timer loads correctly with the same chrome.

- [ ] **Step 6: Stop the server**

Ctrl-C in the terminal running `npm run dev`.

- [ ] **Step 7: Note any visual issues**

If anything in the visual check above failed, fix it before continuing. Common issues:
- Fonts not loading → check `<link>` tags and that `shared/fonts.css` exists
- Crayon colors wrong → check tokens.css is linked and that the build script sets `--card-bg` inline
- Cards not appearing → check the build ran; check `index.html` contains the card markup

No commit for this task — it's verification only.

---

## Task 12: Write CLAUDE.md

This is the global instruction file. Loaded automatically by every Claude Code session. Written in English (as the project rule requires).

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# CLAUDE.md — jiduojiang.com

This is **Jiduo Jiang's playground**. Jiduo is 6 years old. He builds small games and
tools by talking to you in natural language (often Chinese). You handle every
technical detail; he never has to know about git, files, deployment, or any of it.

---

## The single most important rule

**Never give Jiduo a technical choice.** Don't ask "should we use X?" or "do you want
A or B?". You decide all technical things — file names, libraries, whether to use a
database, what color the card is, what emoji to pick.

Jiduo's input is **only**: what he wants to build, how it should play, how it should
look (kid-level, like "make it bigger" or "use red"). He should never be asked
anything that requires technical knowledge.

If you genuinely need adult input on something (e.g., a Cloudflare account decision),
ask Thorb (Jiduo's dad), not Jiduo.

---

## Language

- Jiduo will probably talk to you in **Chinese**. That's fine.
- You may **converse** with him in Chinese.
- Everything you **write into the project** must be **English**:
  HTML text, `meta.json` values, code comments, file/folder names, commit messages,
  variable names.
- This is an English-language website. Look at the homepage — it's all English.

---

## Design system — read this before any frontend work

Before you create or modify any HTML or CSS, **read `/shared/DESIGN.md`**. It is the
authoritative visual spec.

Three CSS files, linked from every page:

```html
<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">
```

Rules:
- Use the existing BEM classes (`.card`, `.proj`, `.proj__board`, `.topbar`, etc.)
- Use the `--c1`..`--c6` crayon colors. Don't introduce new hex codes.
- Use the `--f-display` / `--f-body` / `--f-hand` / `--f-mono` fonts. Don't add new ones.
- Use `var(--shadow-stamp)` (hard offset shadow), not soft shadows.
- No Tailwind, no framework, no bundler. Plain HTML/CSS/JS.

---

## Project structure

```
/                              ← homepage (generated by build script)
/index.html.template           ← homepage source; do not edit unless changing site chrome
/shared/                       ← global CSS, fonts, DESIGN.md
/games/{slug}/                 ← one folder per game
/tools/{slug}/                 ← one folder per tool
/functions/{type}/{slug}/      ← Cloudflare Pages Functions (only when a project needs an API)
/scripts/build-index.mjs       ← generates /index.html from template + meta.json files
/.claude/skills/               ← workflow skills (new-project, publish)
/wrangler.toml                 ← Cloudflare config (D1 bindings get added here when needed)
```

Each game/tool folder needs:
- `index.html` — the entry. Must link `/shared/fonts.css`, `/shared/tokens.css`, `/shared/components.css`.
- `meta.json` — `{title, description, emoji, created}` (all English, ISO date)

`slug` is the folder name: lowercase, digits and hyphens only (`snake`, `color-picker`).
If Jiduo describes something in Chinese, translate to a simple English slug yourself.

---

## Workflows (skills)

When Jiduo says something matching these patterns, follow the corresponding skill in
`.claude/skills/`:

- **"我要做一个 X" / "I want to make a X" / "做个 X 给我玩"** → use `.claude/skills/new-project/SKILL.md`
- **"发布" / "上线" / "完成了" / "ship it"** → use `.claude/skills/publish/SKILL.md`

You should also read these skills proactively when in doubt; they encode the
checklists that keep the system stable.

---

## Database (when, and how)

**You decide whether a project needs a database — Jiduo never has to know.**

If Jiduo describes anything that needs to persist across visits or be shared between
players (high scores, saved drawings, a guestbook, a counter that remembers, etc.),
silently set up Cloudflare D1 for that project as part of building it:

1. `wrangler d1 create {type}-{slug}` — the Cloudflare API token is in `.env`, so this works without human help.
2. Append a `[[d1_databases]]` block to `wrangler.toml` with the binding `DB_{TYPE}_{SLUG}` (uppercase).
3. Create `functions/{type}/{slug}/api.ts` for the API routes.
4. In the project's `index.html`, `fetch('/{type}/{slug}/api/...')` to use it.

One D1 database per project. Don't share databases across projects.

For most projects (snake, calculator, drawing pad) you do NOT need a database. Don't
over-engineer.

---

## Deployment

Push to `main` → Cloudflare Pages auto-deploys in ~1-2 minutes. Always run
`npm run build` before committing so `index.html` reflects the current set of projects.
The build artifact (`/index.html`) is gitignored; the template (`/index.html.template`)
is what's tracked.

Commit messages: short, English, present-tense: `Add snake game`, `Fix timer bell sound`,
`Add leaderboard to snake`.

---

## What NOT to do

- Don't ask Jiduo technical questions.
- Don't suggest installing React, Vue, Tailwind, or any build tool. The framework is
  intentionally vanilla.
- Don't write tests (this is a play project; YAGNI).
- Don't write code in Chinese.
- Don't introduce new colors / fonts / shadow styles — use the design system.
- Don't share data between project databases.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Add CLAUDE.md: global instructions, design rules, language and skill pointers"
```

---

## Task 13: Write .claude/skills/new-project/SKILL.md

**Files:**
- Create: `.claude/skills/new-project/SKILL.md`

- [ ] **Step 1: Create the directory and skill file**

```bash
mkdir -p .claude/skills/new-project
```

Then write `.claude/skills/new-project/SKILL.md`:

```markdown
---
name: new-project
description: Use when Jiduo says he wants to make a new game or tool (e.g., "我要做一个X游戏", "做个X给我玩", "I want to make X"). Scaffolds the folder, generates index.html and meta.json, decides on database needs, then implements the feature.
---

# new-project

Jiduo asked for something new. Build it end-to-end without making him decide
anything technical.

## Checklist (follow in order)

- [ ] **1. Read the design system.** Open `/shared/DESIGN.md` and skim it.
      Visual consistency across all projects is mandatory; this is non-negotiable.

- [ ] **2. Decide the type.** Game or tool? You decide based on what Jiduo described.
      "贪吃蛇" / "snake" / "calculator that turns into a fish" → games.
      "timer" / "color picker" / "money counter" → tools. Don't ask him.

- [ ] **3. Make an English slug.** Lowercase, letters/digits/hyphens only.
      Translate from Chinese if needed: 贪吃蛇 → `snake`, 画板 → `drawing-board`,
      数学题 → `math-quiz`. If it doesn't translate cleanly, use pinyin (拼写比赛 → `pinyin-bee`).
      Check `games/{slug}/` and `tools/{slug}/` don't already exist.
      If a name collides, add a number: `snake-2`.

- [ ] **4. Decide if it needs a database.** Read the "Database" section of CLAUDE.md.
      Defaults to **no**. Only yes if there's a clear persistence/sharing need
      (scores across visits, saved content, leaderboard). Don't ask him — you decide.

- [ ] **5. Create the folder and skeleton files.** Write:
      - `{type}/{slug}/meta.json` with `{title, description, emoji, created}` (English, today's date)
      - `{type}/{slug}/index.html` with the standard topbar + `.proj` + `.proj__board` structure,
        linking `/shared/fonts.css`, `/shared/tokens.css`, `/shared/components.css`.
        Pick one `--c1`..`--c6` crayon as the project's color.

- [ ] **6. If database needed:** run `wrangler d1 create {type}-{slug}`,
      append the binding to `wrangler.toml`, create `functions/{type}/{slug}/api.ts`.
      (Skip this step entirely if not needed.)

- [ ] **7. Build the feature.** This is the actual creative work — implement what
      Jiduo described. Use the component classes from `/shared/components.css`.
      Keep code in vanilla JS, no frameworks. Make it work first, polish second.

- [ ] **8. Show him.** Run `npm run build` then `npm run dev` (or open the project
      file directly). Tell him to look at the result, in Chinese if he prefers.

## Reference: skeleton `index.html` for a new project

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{Title} · jiduojiang.com</title>

<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">

<style>
  /* Project-specific only. Reuse /shared/ for everything else. */
  .proj { --crayon: var(--c3); }  /* pick one of --c1..--c6 */
  .proj__emoji { --card-bg: var(--crayon); }
</style>
</head>
<body>

<header class="topbar">
  <a class="brand" href="/">
    <div class="brand-mark">J</div>
    <div>
      <div class="brand-name">jiduojiang<span class="dot">.</span>com</div>
      <div class="brand-sub">// back to all projects</div>
    </div>
  </a>
  <a class="proj__back" href="/">← home</a>
</header>

<main class="proj">
  <header class="proj__head">
    <div class="proj__emoji">{EMOJI}</div>
    <h1 class="proj__title">{Title}</h1>
  </header>
  <section class="proj__board">
    <!-- the actual game / tool goes here -->
  </section>
</main>

<script>
  // game logic here
</script>

</body>
</html>
```

## Talking to Jiduo

- It's fine to chat in Chinese while you work.
- Don't narrate technical steps to him ("I'm going to run wrangler now…"). Just do them.
- Confirm understanding ("好的，那我做一个会动的小鱼，吃到苹果就变大，对吗？"), then build.
- When done, tell him what to look at and how to play it.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/new-project/
git commit -m "Add new-project skill: scaffolds folder, autonomous DB decision, builds feature"
```

---

## Task 14: Write .claude/skills/publish/SKILL.md

**Files:**
- Create: `.claude/skills/publish/SKILL.md`

- [ ] **Step 1: Create the skill file**

```bash
mkdir -p .claude/skills/publish
```

Then write `.claude/skills/publish/SKILL.md`:

```markdown
---
name: publish
description: Use when Jiduo says he's done and wants to share — e.g., "发布", "上线", "完成了", "想让小朋友看", "ship it". Runs the build, commits, pushes; deployment to Cloudflare Pages happens automatically.
---

# publish

Jiduo wants to send what he just made out to the world.

## Checklist

- [ ] **1. Show what's changing.** Run `git status` to see modified/untracked files.
      Make sure they're all things Jiduo wants to publish (no leftover experiments).

- [ ] **2. Rebuild the homepage.** Run `npm run build`. Verify the output shows
      the new project in the list:

      ```bash
      npm run build
      ```

      Expected output mentions the new slug under "game(s)" or "tool(s)".

- [ ] **3. Stage the right files.** Add only the project folder(s) and any
      framework changes (don't stage `index.html` — it's gitignored). Examples:

      ```bash
      git add games/snake/ wrangler.toml functions/games/snake/
      ```

      Avoid `git add -A` if there are unrelated experiments lying around.

- [ ] **4. Commit with a short English message.**
      Format: imperative present tense, ≤ 60 chars.
      Examples: `Add snake game`, `Add leaderboard to snake`, `Fix timer bell volume`.

      ```bash
      git commit -m "Add {project name}"
      ```

- [ ] **5. Push.** `git push origin main`. If the branch isn't tracking, set upstream:
      `git push -u origin main`.

- [ ] **6. Tell Jiduo.** Switch to Chinese if that's how you've been talking.
      Something like: "推送好啦！过一两分钟，去 jiduojiang.com/{type}/{slug}/ 就能玩了。
      小朋友也可以打开这个链接玩。"

## If anything fails

- `npm run build` fails → fix it before pushing. Probably a malformed `meta.json`.
- `git push` rejected → fetch and rebase first. Don't force-push.
- Cloudflare doesn't show the new version after 5 min → that's a Cloudflare issue,
  ask Thorb (the dad) to check the Cloudflare Pages dashboard.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/publish/
git commit -m "Add publish skill: build, commit, push; Cloudflare deploys automatically"
```

---

## Task 15: Write a short English README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# jiduojiang.com

Jiduo Jiang's playground — small games and tools made by a 6-year-old using
Claude Code.

## What's here

- `games/` — playable games, one folder per game
- `tools/` — small tools, one folder per tool
- `shared/` — global CSS, fonts, and the [design system](shared/DESIGN.md)
- `index.html.template` — homepage source (generated `index.html` is gitignored)
- `scripts/build-index.mjs` — scans projects and generates the homepage
- `functions/` — Cloudflare Pages Functions, when a project needs an API
- `.claude/skills/` — workflow skills used by Claude Code
- `CLAUDE.md` — instructions for Claude (read this before contributing)
- `design/` — visual references and drafts (not deployed)

## How a new game / tool gets made

Jiduo says something like "我要做一个 X 游戏" to Claude Code. Claude:

1. Reads `/shared/DESIGN.md` (visual rules)
2. Creates `games/{slug}/` with `index.html` and `meta.json`
3. Builds the feature (vanilla HTML/CSS/JS)
4. Runs `npm run build` so the homepage shows the new card
5. Pushes to `main` — Cloudflare Pages auto-deploys

## Local development

```bash
npm run build        # regenerate index.html
npm run dev          # wrangler pages dev (serves the site locally)
```

## Stack

Plain HTML/CSS/JS, no framework, no bundler. Hosted on Cloudflare Pages.
Cloudflare D1 is used per-project when persistence is needed (one database per
project).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add README"
```

---

## Task 16: End-to-end re-verification with a throw-away project

Prove the workflow works by creating, building, and inspecting a temporary
third project (then deleting it). This validates that the build script handles
projects beyond the two seed examples.

- [ ] **Step 1: Create a temporary tool**

```bash
mkdir -p tools/hello
```

Write `tools/hello/meta.json`:

```json
{
  "title": "Hello Test",
  "description": "Temporary project to verify the build pipeline.",
  "emoji": "👋",
  "created": "2026-05-17"
}
```

Write `tools/hello/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Hello Test · jiduojiang.com</title>
<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">
</head>
<body>
<header class="topbar">
  <a class="brand" href="/"><div class="brand-mark">J</div><div>
    <div class="brand-name">jiduojiang<span class="dot">.</span>com</div>
    <div class="brand-sub">// back to all projects</div>
  </div></a>
  <a class="proj__back" href="/">← home</a>
</header>
<main class="proj">
  <header class="proj__head">
    <div class="proj__emoji" style="--card-bg: var(--c5)">👋</div>
    <h1 class="proj__title">Hello Test</h1>
  </header>
  <section class="proj__board">
    <p>This is a temporary test page. Delete me.</p>
  </section>
</main>
</body>
</html>
```

- [ ] **Step 2: Rebuild and verify the new card appears**

```bash
npm run build
```

Expected: output mentions `hello` under tools.

```bash
grep -c 'class="card"' index.html
```

Expected: `3` (snake, timer, hello).

```bash
grep 'href="/tools/hello/"' index.html
```

Expected: one match.

- [ ] **Step 3: Confirm in browser**

```bash
npm run dev
```

Open `http://localhost:8788/`. Confirm:
- Three cards visible (Snake, Tooth Timer, Hello Test)
- Hello Test card has the right emoji, right crayon color (different from the others)
- Click Hello Test → loads the test page
- Section count says "2 things" for tools (since the temp project is added)

Stop the server (Ctrl-C).

- [ ] **Step 4: Delete the temporary project**

```bash
rm -rf tools/hello
npm run build
```

Verify the count is back to 1 tool:

```bash
grep -c 'class="card"' index.html
```

Expected: `2`.

- [ ] **Step 5: Confirm git status is clean**

```bash
git status
```

Expected: working tree clean (no uncommitted files; `index.html` is gitignored so
not shown).

No commit for this task — it's verification.

---

## Task 17: First push and Cloudflare Pages setup (manual, by Thorb)

This is the one-time setup that connects the repo to Cloudflare Pages.
Jiduo never has to do this — Thorb does it once.

This task is **manual** and assumes the GitHub repo already exists (or will be
created here). If the repo doesn't exist yet, create it first via `gh repo create`.

- [ ] **Step 1: Verify the local repo has a clean state**

```bash
git status
git log --oneline
```

Expected: clean tree, commits from all previous tasks present.

- [ ] **Step 2: Set the remote (if not already set)**

If `git remote -v` shows nothing, ask Thorb the GitHub repo URL and add it:

```bash
git remote add origin https://github.com/{user}/jiduojiang.com.git
git push -u origin main
```

If it's already set, just push:

```bash
git push origin main
```

- [ ] **Step 3: Cloudflare Pages connection (Thorb does this in the dashboard)**

Tell Thorb to perform these one-time steps in the Cloudflare dashboard:

1. Go to **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Select the GitHub `jiduojiang.com` repo.
3. Production branch: `main`.
4. Build command: `npm run build`.
5. Build output directory: `/` (or leave blank — root).
6. Environment variables: none required for the initial framework.
7. Click **Save and Deploy**.

After the first deploy succeeds:

8. Add custom domain: **Pages project → Custom domains → Set up a custom domain → `jiduojiang.com`**.

- [ ] **Step 4: Verify the live site**

After ~1-2 minutes (and DNS propagation for the custom domain):

```bash
curl -sI https://jiduojiang.com/ | head -5
```

Expected: `HTTP/2 200`.

Open in a browser. Confirm the homepage loads with both seed projects and looks
identical to the local preview.

- [ ] **Step 5: Final commit (if anything was tweaked in the process)**

If wrangler config needed adjustments to match Cloudflare's expectations, commit
and push them:

```bash
git status
# (if there are changes:)
git add -A
git commit -m "Adjust wrangler config for Cloudflare Pages"
git push
```

---

## Done criteria

When all tasks above are complete:

1. `npm run build` regenerates `/index.html` with one card per project
2. `npm run dev` serves the site locally and everything renders per DESIGN.md
3. `games/snake/` and `tools/timer/` are live and playable
4. `CLAUDE.md` and both skills are in place so a fresh Claude Code session can
   immediately respond to "我要做一个 X" from Jiduo
5. Pushing to `main` triggers a Cloudflare Pages deploy that updates `jiduojiang.com`
   within ~2 minutes
6. The entire site contains zero Chinese characters in UI chrome
