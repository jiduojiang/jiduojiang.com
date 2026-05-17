---
name: publish
description: Use when Jiduo says he's done and wants to share — e.g., "发布", "上线", "完成了", "想让小朋友看", "ship it". Runs the build, commits, pushes to GitHub for history, then deploys to Cloudflare Pages via wrangler.
---

# publish

Jiduo wants to send what he just made out to the world.

## How deploy actually works

The Cloudflare Pages project (`jiduojiang`) is **direct-upload**, not GitHub-integrated.
That means: `git push` is for history/backup only — it does NOT deploy. You must run
`wrangler pages deploy` to make the change visible on `jiduojiang.com`. The Cloudflare
API token in `.env` lets wrangler do this without any human help.

## Checklist

- [ ] **1. Show what's changing.** Run `git status` to see modified/untracked files.
      Make sure they're all things Jiduo wants to publish (no leftover experiments).

- [ ] **2. Rebuild the homepage.** Run `npm run build`. Verify the output shows
      the new project in the list:

      ```bash
      npm run build
      ```

      Expected output mentions the new slug under "learning thing(s)", "game(s)", or "tool(s)".

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

- [ ] **5. Push to GitHub** (for history). `git push origin main`. If the branch
      isn't tracking, set upstream: `git push -u origin main`.

- [ ] **6. Deploy to Cloudflare Pages.** This is what actually puts the change
      on `jiduojiang.com`. Run:

      ```bash
      set -a && source .env && set +a
      CLOUDFLARE_ACCOUNT_ID=72d49af8da6f7afafc1361a02927b330 \
        npx --yes wrangler@latest pages deploy . \
          --project-name jiduojiang \
          --branch main \
          --commit-dirty=true
      ```

      Expected output: `✨ Success! Uploaded N files` and `✨ Deployment complete!
      Take a peek over at https://<hash>.jiduojiang.pages.dev`. Production aliases
      (`jiduojiang.com` and `www.jiduojiang.com`) update automatically.

- [ ] **7. Verify it's live.** Curl the new project's URL:

      ```bash
      curl -sI https://jiduojiang.com/{type}/{slug}/ | head -1
      ```

      Expected: `HTTP/2 200`. May take 10-30 seconds after deploy completes for
      the edge to update.

- [ ] **8. Tell Jiduo.** Switch to Chinese if that's how you've been talking.
      Something like: "上线啦！https://jiduojiang.com/{type}/{slug}/ 可以玩了。
      小朋友也可以打开这个链接玩。"

## If anything fails

- `npm run build` fails → fix it before deploying. Probably a malformed `meta.json`.
- `wrangler pages deploy` fails → check the error. Most commonly: API token expired
  in `.env`, or the project name doesn't match. Tell Thorb if the token needs renewing.
- Live URL returns 404 → wait 30 more seconds; if still 404, redeploy.
- `git push` rejected → fetch and rebase first. Don't force-push.
