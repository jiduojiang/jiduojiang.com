---
name: add-external
description: Use when Jiduo wants to list someone else's tool, game, or learning site on his homepage — e.g., "把 X 加到列表里", "帮我列上这个网站", "加个链接到首页", "add this site to my list", "list X". The card lives on jiduojiang.com but clicks open the external URL in a new tab.
---

# add-external

Jiduo wants to put an existing external site on his homepage. He's not building
anything — just curating a list. The card looks like our own cards, but clicks
go to the outside URL.

## Checklist

- [ ] **1. Pick the category.** Same three as `new-project`:
      - **learning** — practice / study tools (typing, math drills, kids' coding…)
      - **games** — games someone else made that Jiduo wants on his shelf
      - **tools** — small utilities (color picker, unit converter, etc.)

      You decide. Don't ask him.

- [ ] **2. Make a slug.** Lowercase letters / digits / hyphens. Usually the
      product name or domain works: `type.review` → `type-review`,
      `monkeytype.com` → `monkeytype`. Check the slug doesn't already exist in
      `learning/`, `games/`, or `tools/`.

- [ ] **3. Create the folder with ONLY `meta.json`.** No `index.html`. No
      `functions/` folder. Path: `{type}/{slug}/meta.json`.

      Shape:
      ```json
      {
        "title": "Short product name",
        "description": "One sentence, kid-readable, what it does",
        "emoji": "⌨️",
        "created": "YYYY-MM-DD",
        "external": "https://full-url-with-https/"
      }
      ```

      - `title`: keep it short, English, sentence-case.
      - `description`: one sentence, max ~80 chars, what the tool does (not why
        it's cool — that's marketing).
      - `emoji`: one emoji that matches.
      - `created`: today's ISO date.
      - `external`: REQUIRED — the full URL including `https://`. The build
        script's presence-of-this-field is what flips the card to external mode
        (target="_blank", domain instead of date, ↗ arrow instead of →).

- [ ] **4. Run `npm run build`.** Confirm the slug shows up in the output list.

- [ ] **5. Show him.** Run `npm run dev` or open `index.html` and confirm the
      new card is there with the ↗ arrow. Tell him in Chinese: "加好了，点一下
      就会跳到那个网站。"

- [ ] **6. Publish when he says ship.** Follow `.claude/skills/publish/SKILL.md`
      as usual — the new `meta.json` is the only file to stage.

## What goes into "external"

Yes:
- Polished tools/games other people built that Jiduo enjoys or uses to learn.
- Sites with no ads, no tracking surprises, no paywalls for the main feature.

No:
- Anything age-inappropriate.
- Sites that require a login to use the main thing.
- Sites that won't be around in a year (random hackathon demos, etc.).

Use your judgment. Thorb can be asked for adult input on borderline cases —
never Jiduo.

## How external cards differ visually (FYI, not something to set)

The build script handles this automatically when it sees `external`:
- The card's `<a>` gets `target="_blank" rel="noopener noreferrer"`.
- The arrow becomes `↗` instead of `→`.
- The bottom-left text shows the domain (e.g., `type.review`) instead of the
  creation date.
- The card gets an extra `card--external` class for any future styling.

You don't write any of this — `scripts/build-index.mjs` does it. Just write the
`meta.json` correctly.
