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
5. Pushes to `main` for git history, then runs `wrangler pages deploy` to ship
   to Cloudflare (see `.claude/skills/publish/SKILL.md`)

Live at <https://jiduojiang.com>.

## Local development

```bash
npm run build        # regenerate index.html
npm run dev          # wrangler pages dev (serves the site locally)
```

## Stack

Plain HTML/CSS/JS, no framework, no bundler. Hosted on Cloudflare Pages.
Cloudflare D1 is used per-project when persistence is needed (one database per
project).
