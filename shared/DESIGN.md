# Design System — jiduojiang.com

This is what every page on jiduojiang.com should look like and feel like.
It is small on purpose. Three CSS files, no framework, no build step.

If you are Claude Code and you are building a new game or tool for Jiduo,
**read this whole file before you start.** Then use the tokens and classes
below. Don't invent new colors, new fonts, or new shadow styles.

---

## How to use

In any new project's `index.html`, paste this in the `<head>`:

```html
<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">
```

That's it. You get the typography, the paper background, the colors,
and all the reusable classes below.

---

## The look

Picture a 6-year-old's sticker notebook:

- **Warm paper background** with a faint dotted grid.
- **Thick ink-black borders** (3px) on everything that should feel like a sticker.
- **Hard offset "stamp" shadow** in the same ink color — never a soft drop shadow.
- **Six bright accent crayons** (`--c1` … `--c6`). Use them in rotation; don't pick favorites.
- **Display type** in Fredoka (chunky), **handwriting** accents in Caveat,
  **metadata** in DM Mono.

The vibe is hand-made, friendly, a little wonky. Lean into the wonk:
slight rotation on stickers, washi-tape strips on hero cards, the occasional
hand-written note with a doodled arrow.

---

## Tokens (`tokens.css`)

Everything is a CSS custom property. Read them, don't hardcode.

| Group | Token | Meaning |
|---|---|---|
| Surface | `--bg` | warm paper background (always under everything) |
| Surface | `--surface` | white for cards, panels |
| Surface | `--ink` | every stroke and primary text |
| Surface | `--ink-soft` | secondary text, metadata |
| Accents | `--c1`..`--c6` | the six crayons — pick one per card / button |
| Type | `--f-display` | Fredoka — headings, titles, big buttons |
| Type | `--f-body` | Fredoka — body copy |
| Type | `--f-hand` | Caveat — only for the occasional hand note |
| Type | `--f-mono` | DM Mono — URLs, dates, metadata |
| Type | `--t-xs`..`--t-hero` | full scale; never go below `--t-sm` (14px) |
| Spacing | `--sp-1`..`--sp-8` | 4 → 72 px |
| Radius | `--r-sm`..`--r-2xl`, `--r-pill` | rounded by default; use `--r-xl` for cards |
| Stroke | `--stroke`, `--stroke-w` | the universal 3px ink border |
| Shadow | `--shadow-stamp`, `--shadow-stamp-lg` | offset hard shadow |
| Shadow | `--shadow-soft` | only for floating UI like modals |
| Motion | `--ease-bounce`, `--dur` | use these instead of magic numbers |

### Re-skinning

To change the look of the whole site (palette, fonts), edit `tokens.css`
**only**. Don't touch `components.css`. Don't touch individual project files.

---

## Components (`components.css`)

### Layout

```html
<div class="page"> ... </div>            <!-- homepage container -->
<div class="proj"> ... </div>            <!-- single-project container -->
```

### Top bar / brand

Every project page starts with a back-to-home link:

```html
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
```

### Buttons

```html
<button class="btn">Default</button>
<button class="btn btn--primary">Primary</button>     <!-- yellow, for main CTA -->
<button class="btn btn--accent">Accent</button>       <!-- tomato, for hero actions -->
<button class="btn btn--ghost">Ghost</button>         <!-- dashed border -->
<button class="pill">Pill</button>                    <!-- nav-sized -->
```

All buttons get the press-down stamp animation automatically.

### Card

```html
<a class="card" style="--card-bg: var(--c3)" href="/games/snake/">
  <div class="card__emoji">🐍</div>
  <h3 class="card__title">Snake</h3>
  <p class="card__desc">Eat apples and grow.</p>
  <div class="card__meta">
    <span>May 17, 2026</span>
    <span class="card__go">→</span>
  </div>
</a>
```

Set `--card-bg` on the root to pick the crayon for the emoji block and arrow.

### Badge / sticker / tape

```html
<span class="badge">NEW!</span>
<span class="badge badge--corner">NEW!</span>   <!-- absolute, top-right corner -->
<div  class="sticker">⭐</div>                   <!-- round emoji bubble -->
<div  class="tape" style="top:-13px; left:80px; transform:rotate(-5deg)"></div>
```

### Fact chip

```html
<div class="fact-chip"><span class="emo">🎂</span>6 years old</div>
```

### Section header

```html
<header class="section-head">
  <span class="section-head__emoji">🎮</span>
  <h2 class="section-head__title">Games I made</h2>
  <span class="section-head__count">7 things</span>
  <span class="section-head__rule"></span>
</header>
```

### Project board (the white frame around the game/tool itself)

```html
<main class="proj">
  <header class="proj__head">
    <div class="proj__emoji" style="--card-bg: var(--c3)">🐍</div>
    <h1 class="proj__title">Snake</h1>
  </header>
  <section class="proj__board">
    <!-- the game canvas, the tool UI, whatever -->
  </section>
</main>
```

---

## Color rules

- **Don't** introduce new hex codes. If you need a 7th color, talk to Jiduo's dad.
- **Do** pick one crayon (`--c1`..`--c6`) per project and use it for that
  project's emoji block, primary button, and any decorative accent.
- The `meta.json` `emoji` is the only thing that varies between projects.
  Everything else stays in the system.

## Typography rules

- Page titles → `var(--f-display)` at `var(--t-h1)` or `--t-hero`.
- Body copy → `var(--f-body)` at `var(--t-base)`.
- Never go below `--t-sm` (14px). Kid-readable.
- Use `var(--f-hand)` **once** per page max. It's a garnish, not a sauce.

## Motion rules

- Hover: small translate + bigger shadow. That's it.
- Active: translate the other way + smaller shadow. (Press-down effect.)
- Transitions: `var(--dur) var(--ease-out)`. Don't write your own bezier.

---

## What's NOT in here

- No Tailwind, no PostCSS, no Sass. Plain CSS.
- No icon font. Use emoji.
- No utility classes like `.mt-4`. Compose components.
- No dark mode (for now — Jiduo's site is a daytime site).
- No animation library. Use CSS transitions on `transform` / `box-shadow`.
