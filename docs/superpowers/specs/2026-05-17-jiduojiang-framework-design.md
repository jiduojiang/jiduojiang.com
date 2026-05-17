# jiduojiang.com 框架设计

**日期**：2026-05-17
**作者**：Thorb Jiang（为 6 岁的孩子设计）
**状态**：设计中

## 背景与目标

这是一个 6 岁孩子的个人主页，用来承载他通过 vibe coding 写出来的小游戏和小工具。

孩子的中文名是"姜几多"，英文名是 **Jiduo Jiang**——网站上一律使用英文名。

孩子不懂代码，他与项目的交互方式是用自然语言告诉 Claude Code（多半是中文）"我要做一个 XX 游戏 / 工具"。从那一刻起，整个流程——开发、提交到 GitHub、部署到 Cloudflare——都应该自动完成，不需要他理解任何技术细节。

域名 `jiduojiang.com` 是给小朋友们一起玩的，所以每个项目都要能被独立访问、独立分享。

### 设计原则

1. **对孩子直观**：一个项目 = 一个文件夹。他打开 Finder 一眼就能看懂"我的游戏都在这里"
2. **对 Claude Code 友好**：约定明确、模板固定，新会话也能立刻接手
3. **默认全静态、零部署摩擦**：push 到 GitHub → Cloudflare Pages 自动部署
4. **数据库按需引入**：默认不用；某个游戏要排行榜了，再单独给它加一个 D1
5. **YAGNI**：不引入构建工具链、不写测试、不上 TypeScript（Pages Functions 例外）
6. **网站内容全英文**：UI 文本、meta.json、HTML 文案、代码注释、commit message 一律英文。Claude 听得懂中文输入，但写出来的东西全英文。
7. **严格遵守 design/ 设计系统**：视觉规范见 `design/shared/DESIGN.md`，不发明新颜色、字体、阴影

## 整体架构

**部署平台**：Cloudflare Pages（绑定 GitHub 仓库，push 即部署）

**URL 约定**：
- `jiduojiang.com/` — 首页（自我介绍 + 项目列表）
- `jiduojiang.com/tools/{slug}/` — 单个工具
- `jiduojiang.com/games/{slug}/` — 单个游戏

**项目发现机制**：构建时跑一个 Node 脚本扫描 `tools/` 和 `games/` 下的所有 `meta.json`，注入到首页 HTML 里。比每次访问都跑 Function 更简单更快。

## 目录结构

```
jiduojiang.com/
├── index.html.template         # 首页模板（含项目列表占位符）
├── index.html                  # 构建产物，不进 git
│
├── shared/                     # 全站共享 CSS/字体/JS（来自 design/shared/）
│   ├── DESIGN.md               # 视觉系统权威文档
│   ├── fonts.css
│   ├── tokens.css
│   ├── components.css
│   └── homepage.js             # 首页渲染脚本
│
├── tools/
│   └── timer/                  # 初始示例：Tooth Timer
│       ├── index.html
│       └── meta.json
│
├── games/
│   └── snake/                  # 初始示例：Snake
│       ├── index.html
│       └── meta.json
│
├── functions/                  # 仅在某项目需要后端时存在
│   └── games/{slug}/api.ts
│
├── scripts/
│   └── build-index.mjs         # 扫目录、生成首页
│
├── design/                     # 设计参考（保留，不直接部署）
│   ├── jiduojiang-homepage.html
│   ├── design-system.html
│   └── _drafts/                # 探索性的 JSX 草稿移到这里
│
├── .claude/
│   └── skills/
│       ├── new-project/SKILL.md
│       └── publish/SKILL.md
│
├── wrangler.toml
├── package.json
├── CLAUDE.md                   # 给 Claude Code 的全局指令（英文）
└── README.md                   # 英文
```

### design/ 目录的处理

`design/` 是设计稿仓库，里面的内容分三类，处理方式如下：

1. **`design/shared/*`（fonts/tokens/components/DESIGN.md）** → 拷贝/迁移到根目录 `shared/`，成为生产 CSS。这些文件**唯一存放位置就是 `/shared/`**，不在 design/ 里保留副本（避免双份维护）。
2. **`design/games/snake/` 和 `design/tools/timer/`** → 迁移到 `/games/snake/` 和 `/tools/timer/`，作为框架的初始示例项目。
3. **`design/jiduojiang-homepage.html`** → 作为 `index.html.template` 的基础（提取占卡片区为占位符 `<!-- GAMES_CARDS -->` 和 `<!-- TOOLS_CARDS -->`）。
4. **`design/design-system.html`** → 保留在 `design/` 下，作为活的样式指南（开发时本地访问）；不进入生产部署。
5. **`design/homepage-app.jsx` 和 `tweaks-panel.jsx`** → 移到 `design/_drafts/`，标注为设计探索草稿，不参与实现（DESIGN.md 已明确"no framework, no build step"）。

## 关键约定

### `meta.json` 格式

每个项目必须有一个 `meta.json`（全部字段英文）：

```json
{
  "title": "Snake",
  "description": "Eat apples and grow longer.",
  "emoji": "🐍",
  "created": "2026-05-17"
}
```

字段说明：
- `title` — 显示名（英文）
- `description` — 一句话介绍（英文）
- `emoji` — 一个表情符号当图标
- `created` — 创建日期（YYYY-MM-DD），用于在首页按时间倒序

### Slug 命名规则

文件夹名（slug）：
- 只能用小写字母、数字、连字符
- 直接做 URL 的一部分
- 例：`snake`、`color-picker`、`math-quiz`
- 即使孩子描述时用的是中文，slug 也必须是合理的英文（由 Claude 翻译/转写决定）

### 静态项目的最小骨架

```
games/snake/
├── index.html
├── meta.json
├── style.css   (可选)
└── script.js   (可选)
```

`index.html` 必须在 `<head>` 里引入：

```html
<link rel="stylesheet" href="/shared/fonts.css">
<link rel="stylesheet" href="/shared/tokens.css">
<link rel="stylesheet" href="/shared/components.css">
```

并使用 DESIGN.md 里定义的 `.topbar`、`.proj`、`.proj__board` 等组件类。不要绕过设计系统自己写颜色或字体。

## 设计系统（视觉约束）

**权威文档**：`/shared/DESIGN.md`（即 `design/shared/DESIGN.md` 的副本）。

核心要点（Claude 必须知道）：
- 视觉风格：6 岁孩子的贴纸笔记本（warm paper 背景、3px ink 描边、hard offset stamp shadow）
- 六个蜡笔色 `--c1`…`--c6`，**轮流使用，不要偏爱某一个**
- 字体：Fredoka（display & body）、Caveat（手写点缀，每页最多一处）、DM Mono（metadata）
- 不发明新颜色、新字体、新阴影类型
- 不用 Tailwind / 不写 utility class / 不用 icon font（用 emoji）

每次 Claude 新建项目，必须先读 `/shared/DESIGN.md`，再开始写代码。这一条会在 `new-project` skill 里强制。

## 首页设计

基于 `design/jiduojiang-homepage.html`，分三块：

1. **Hero / About**：Jiduo Jiang 的自我介绍（英文）。用 `.fact-chip` 等组件展示年龄、爱好。具体文案待 Thorb + Jiduo 一起填，初版用占位符。
2. **🎮 Games I made**：`games/` 下所有项目的卡片网格，用 `.card` 组件，每张卡片轮换 `--c1`..`--c6`
3. **🔧 Tools I made**：`tools/` 下所有项目的卡片网格，同上

构建脚本生成卡片的 HTML 时，按 `created` 倒序，crayon 颜色按索引轮换。

## 构建脚本

`scripts/build-index.mjs`：

1. 读 `tools/` 和 `games/` 下每个子文件夹的 `meta.json`
2. 拼成两个数组，按 `created` 倒序
3. 给每张卡片分配 crayon 颜色（按数组索引 mod 6 轮换）
4. 读取 `index.html.template`，把 `<!-- GAMES_CARDS -->` 和 `<!-- TOOLS_CARDS -->` 替换为实际的 `.card` HTML
5. 输出到仓库根的 `index.html`（这一份由 `.gitignore` 排除）

Cloudflare Pages 配置：
- Build command: `npm run build`
- Build output directory: `/`（仓库根）

## Cloudflare Pages 部署

- GitHub 仓库连接到 Cloudflare Pages
- 自动部署 main 分支
- Build command: `npm run build`
- Output directory: `/`
- 自定义域名：`jiduojiang.com`

## 数据库策略

**核心原则**：要不要用数据库，由 Claude 自己判断，孩子永远不需要做这个决定。

**判断时机**：当孩子描述功能时（无论在 `new-project` 阶段还是后续迭代），Claude 自己识别"是否需要持久化"。需要数据库的典型信号：
- 想保存分数、排行榜
- 想记住玩家名字 / 头像 / 进度
- 想让不同小朋友看到对方的内容（留言板、画廊）
- 想统计玩了多少次

只要识别到这类需求，Claude 直接走完下面的流程，**不需要问孩子，也不需要爸爸介入**（Cloudflare API token 在 `.env` 里，wrangler 可以直接调）：

1. 用 Cloudflare D1
2. 一个项目一个独立的 D1 数据库（命名 `{type}-{slug}`，例：`games-snake`）
3. 跑 `wrangler d1 create {type}-{slug}` 自动创建
4. 在 `wrangler.toml` 里加 binding
5. 在 `functions/{type}/{slug}/api.ts` 写接口（Cloudflare Pages Functions，TS 可用）
6. 在前端 `index.html` 里 `fetch('/api/...')` 接上

**默认情况**：大多数项目（贪吃蛇、计算器、画板）都是纯静态，不需要数据库。Claude 不要过度设计。

## CLAUDE.md 内容大纲

`CLAUDE.md` 是每次 Claude Code 会话自动加载的全局上下文，**用英文写**。应包含：

- 项目是什么、给谁用、目标是什么
- **最高优先级原则**：用户是 6 岁的 Jiduo Jiang。所有技术决定由 Claude 自己做，永远不要给孩子选择题（不要问"要不要 X"或"用 A 还是 B"）。只接受"我想做什么"形式的输入。
- **语言规则**：孩子可能用中文跟 Claude 说话。Claude 可以用中文跟孩子对话，但写到项目里的一切（HTML 内容、meta.json、代码注释、commit message、文件名）必须是英文。
- **设计系统**：开始任何前端工作前必须读 `/shared/DESIGN.md`，严格遵守 token 和 component 约定
- 目录结构和约定（slug、`meta.json`）
- 默认技术选择（原生 HTML/CSS/JS，不要引入框架）
- "孩子说 X 时，去看 `.claude/skills/Y`"的提示
- 部署是自动的，push 后等 1-2 分钟就能访问

## Skills 设计

放在 `.claude/skills/` 下，每个 skill 一个文件夹，包含 `SKILL.md`（英文写）。

**通则**：所有 skill 都不让孩子做技术选择题。Claude 自己判断，自己执行。孩子的输入只该是"我想做什么"。

### `new-project`

**触发**：孩子说要做新东西（"我要做一个 XX 游戏 / 工具"、"我想做一个 XX"、"做个 XX 给我玩"等）。

**步骤**：
1. **读 `/shared/DESIGN.md`**（强制，每次都读，因为视觉一致性是这个项目的核心）
2. Claude 自己判断类型（游戏 or 工具），不问孩子
3. Claude 自己造一个英文 slug；如果孩子描述用了中文，用合理的英译（"贪吃蛇" → `snake`，"画板" → `drawing-board`）。Slug 用小写字母、数字、连字符。
4. 检查 `games/{slug}/` 或 `tools/{slug}/` 是否已存在；重名自动加后缀
5. 创建文件夹，生成：
   - `index.html`（含 topbar、proj、proj__board 组件，标题用英文）
   - `meta.json`（title/description 英文，emoji 由 Claude 选择）
6. Claude 自己判断是否需要数据库（参考"数据库策略"）；需要就在这一步把 D1、wrangler.toml、`functions/` 骨架一起搭好
7. 实现孩子要的功能（真正的 vibe coding，自由发挥但必须使用 DESIGN.md 里的组件类）
8. 本地起 `wrangler pages dev` 让孩子看效果（用 Bash 后台运行）

### `publish`

**触发**："发布"、"上线"、"想让小朋友看"、"完成了"、"做好了"

**步骤**：
1. 检查改动状态（`git status`）
2. 跑 `npm run build`，确认首页能正确生成（新项目的卡片出现）
3. `git add` 相关文件 + commit（commit message **英文**，由 Claude 根据改动写，比如 `Add Snake game` 或 `Add leaderboard to Snake`）
4. `git push` 到 main
5. 告诉孩子（可中文）："已经发出去啦，过 1-2 分钟就能在 jiduojiang.com/{type}/{slug}/ 玩了"

## 拍板的小决定

- 不引入构建工具链（无 Vite/Webpack）：纯静态 + 一个 Node 脚本
- 不用 TypeScript（Pages Functions 除外）
- 不写测试
- 首页构建时生成，不运行时生成
- **commit message 用英文**（与网站内容一致；孩子也不读 commit）
- **网站文案全英文**；Claude 与孩子对话可用中文
- 样式：原生 CSS + DESIGN.md 设计系统；禁止 Tailwind / 框架
- 不用 React/JSX（design/ 里的 .jsx 文件只是探索草稿）
- 初始示例项目：`games/snake/`（来自 design/）和 `tools/timer/`（来自 design/）

## 待定 / 未来再说

- Jiduo 的自我介绍文案（爸爸跟孩子一起填，初版用占位符如 "Hi, I'm Jiduo. I'm 6. I like making games."）
- 是否要给项目加"标签"或"分类"（暂不加，先用 emoji + 时间排序 + crayon 轮换）
- 是否要支持"草稿"状态的项目不显示（暂不加，所有 meta.json 存在即显示）

## 成功标准

1. 孩子可以打开 Claude Code，说"我要做一个 XX 游戏"，5-15 分钟内有一个能玩的版本出现在 `jiduojiang.com/games/{slug}/`，且视觉符合 DESIGN.md
2. 整个流程不需要孩子理解 git、wrangler、Cloudflare 任何概念
3. 新增项目自动出现在首页，不需要手动改首页代码
4. 任何一个项目的链接可以单独分享给小朋友，独立可玩
5. 网站上看不到一个中文字符（除非孩子自己后续要求做某个中文游戏内的中文内容，但 UI chrome 一律英文）
