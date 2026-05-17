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

- [ ] **2. Decide the category.** Three choices — you pick, don't ask him:
      - **learning** — anything aimed at practice or study: math drills, spelling,
        flashcards, reading practice ("练数学", "拼写", "背单词").
      - **games** — playable games: "贪吃蛇" / "snake" / "calculator that turns
        into a fish".
      - **tools** — small utilities: "timer" / "color picker" / "money counter".

      When in doubt between learning and tools: if the point is to get better at
      a school subject, it's learning. If it's a useful gadget, it's a tool.

- [ ] **3. Make an English slug.** Lowercase, letters/digits/hyphens only.
      Translate from Chinese if needed: 贪吃蛇 → `snake`, 画板 → `drawing-board`,
      数学题 → `math-quiz`. If it doesn't translate cleanly, use pinyin (拼写比赛 → `pinyin-bee`).
      Check `learning/{slug}/`, `games/{slug}/`, and `tools/{slug}/` don't already exist.
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
