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
