# jiduojiang.com 框架设计

**日期**：2026-05-17
**作者**：Thorb Jiang（为 6 岁的孩子设计）
**状态**：设计中

## 背景与目标

这是一个 6 岁孩子的个人主页，用来承载他通过 vibe coding 写出来的小游戏和小工具。

孩子不懂代码，他与项目的交互方式是用自然语言告诉 Claude Code："我要做一个 XX 游戏 / 工具"。从那一刻起，整个流程——开发、提交到 GitHub、部署到 Cloudflare——都应该自动完成，不需要他理解任何技术细节。

域名 `jiduojiang.com` 是给小朋友们一起玩的，所以每个项目都要能被独立访问、独立分享。

### 设计原则

1. **对孩子直观**：一个项目 = 一个文件夹。他打开 Finder 一眼就能看懂"我的游戏都在这里"
2. **对 Claude Code 友好**：约定明确、模板固定，新会话也能立刻接手
3. **默认全静态、零部署摩擦**：push 到 GitHub → Cloudflare Pages 自动部署
4. **数据库按需引入**：默认不用；某个游戏要排行榜了，再单独给它加一个 D1
5. **YAGNI**：不引入构建工具链、不写测试、不上 TypeScript（Pages Functions 例外）

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
├── index.html                  # 首页模板（构建时注入项目列表）
├── shared/                     # 首页用到的 CSS/JS
│   ├── styles.css
│   └── homepage.js
│
├── tools/
│   └── {slug}/
│       ├── index.html
│       ├── meta.json
│       └── (其它静态资源)
│
├── games/
│   └── {slug}/
│       ├── index.html
│       ├── meta.json
│       └── ...
│
├── functions/                  # 仅在某项目需要后端时存在
│   └── games/{slug}/api.ts     # 例：游戏的 API
│
├── scripts/
│   └── build-index.mjs         # 扫目录、生成首页数据
│
├── .claude/
│   └── skills/                 # 项目级 skills
│       ├── new-project/
│       │   └── SKILL.md
│       └── publish/
│           └── SKILL.md
│
├── wrangler.toml               # Cloudflare 配置（含 D1 bindings）
├── package.json
├── CLAUDE.md                   # 全局上下文 / 项目说明
└── README.md
```

## 关键约定

### `meta.json` 格式

每个项目（工具/游戏）必须有一个 `meta.json`，首页用它来渲染卡片：

```json
{
  "title": "贪吃蛇",
  "description": "经典的贪吃蛇游戏",
  "emoji": "🐍",
  "created": "2026-05-17"
}
```

字段说明：
- `title` — 显示名（中文）
- `description` — 一句话介绍
- `emoji` — 一个表情符号当图标，简单又有视觉效果
- `created` — 创建日期，用于在首页按时间排序（新的在前）

### Slug 命名规则

文件夹名（slug）：
- 只能用小写字母、数字、连字符
- 必须能直接做 URL 的一部分
- 例：`snake`、`color-picker`、`math-quiz`
- 中文名只放在 `meta.json` 的 `title` 字段里

### 静态项目的最小骨架

```
games/snake/
├── index.html
├── meta.json
├── style.css   (可选)
└── script.js   (可选)
```

`index.html` 是入口，所有相对路径相对于该文件夹。不要引用 `/shared/` 以外的全局资源，保证项目独立可分享。

## 首页设计

首页分三块：

1. **自我介绍**：孩子的名字、年龄、爱好、一张照片或自画像（占位）
2. **🎮 游戏开发**：`games/` 下所有项目的卡片网格
3. **🔧 工具开发**：`tools/` 下所有项目的卡片网格

每张卡片显示 emoji + title + description，点击跳转到对应项目。

样式走极简风格（白底、大字、圆角卡片），孩子能看懂、能后续自己调颜色。

## 构建脚本

`scripts/build-index.mjs` 做的事：

1. 读 `tools/` 和 `games/` 下每个子文件夹的 `meta.json`
2. 拼成两个数组（tools / games），按 `created` 倒序
3. 读取 `index.html.template`（带占位符），把数据以 `<script>window.__PROJECTS__ = {...}</script>` 注入
4. 输出到仓库根的 `index.html`（这一份不进 git，由 `.gitignore` 排除）
5. 首页的 `homepage.js` 读取 `window.__PROJECTS__` 并渲染卡片

Cloudflare Pages 配置：
- Build command: `npm run build`
- Build output directory: `/`（仓库根）

具体实现细节留到 implementation plan。

## Cloudflare Pages 部署

- GitHub 仓库连接到 Cloudflare Pages
- 自动部署 main 分支
- Build command: `npm run build`
- Output directory: 待定（取决于构建脚本是否分离 dist）
- 自定义域名：`jiduojiang.com`

## 数据库策略

**核心原则**：要不要用数据库，由 Claude 自己判断，孩子永远不需要做这个决定。

**判断时机**：当孩子描述功能时（无论在 `new-project` 阶段还是后续迭代），Claude 自己识别"是否需要持久化"。需要数据库的典型信号：
- 想保存分数、排行榜
- 想记住玩家名字 / 头像 / 进度
- 想让不同小朋友看到对方的内容（留言板、画廊）
- 想统计玩了多少次

只要识别到这类需求，Claude 直接走完下面的流程，**不需要问孩子，也不需要爸爸介入**（Cloudflare API token 已经在 `.env` 里，wrangler 可以直接调）：

1. 用 Cloudflare D1
2. 一个项目一个独立的 D1 数据库（命名 `{type}-{slug}`，例：`games-snake`）
3. 跑 `wrangler d1 create {type}-{slug}` 自动创建
4. 在 `wrangler.toml` 里加 binding
5. 在 `functions/{type}/{slug}/api.ts` 写接口（Cloudflare Pages Functions）
6. 在前端 `index.html` 里 `fetch('/api/...')` 接上

**默认情况**：大多数项目（贪吃蛇、计算器、画板）都是纯静态，不需要数据库。Claude 不要过度设计。

## CLAUDE.md 内容大纲

`CLAUDE.md` 是每次 Claude Code 会话自动加载的全局上下文，应包含：

- 项目是什么、给谁用、目标是什么
- **最高优先级原则**：用户是 6 岁孩子，所有技术决定由 Claude 自己做，永远不要给孩子选择题（"要不要 X""用 A 还是 B"都不要问）。只接受"我想做什么"形式的输入。
- 目录结构和约定（slug、`meta.json`）
- "孩子说 X 时，去看 `.claude/skills/Y`"的提示，让 skills 能被触发
- 默认技术选择（原生 HTML/CSS/JS，不要引入框架）
- 提交规范：commit message 用人话写中文，比如"添加贪吃蛇游戏"
- 部署是自动的，push 后等 1-2 分钟就能访问

## Skills 设计

放在 `.claude/skills/` 下，每个 skill 一个文件夹，包含 `SKILL.md`。

**重要原则**：所有 skill 都不让孩子做技术选择题。Claude 自己判断，自己执行。孩子的输入只该是"我想做什么"（功能、玩法、外观）。

### `new-project`

**触发词**：孩子说"我要做一个 XX 游戏"、"我要做一个 XX 工具"、"我想做一个新的小东西"

**步骤**：
1. Claude 自己判断类型（游戏 or 工具），不要问孩子"这算游戏还是工具？"
2. Claude 自己根据中文名造一个英文 slug（命名规则见上）；如果有歧义就用孩子原话的拼音或最直白的英译
3. 检查 `games/{slug}/` 或 `tools/{slug}/` 是否已存在；重名就自动加后缀（`snake-2`）
4. 创建文件夹，生成 `index.html`、`meta.json`（emoji 也由 Claude 选一个合适的）
5. Claude 自己判断这个功能是否需要数据库（参考"数据库策略"小节）；需要就在这一步就把 D1 创建、wrangler.toml、`functions/` 骨架一起搭好
6. 实现孩子要的功能（这一步是真正的 vibe coding，自由发挥）
7. 本地起 `wrangler pages dev` 让孩子看效果

### `publish`

**触发词**："发布"、"上线"、"想让小朋友看"、"完成了"、"做好了"

**步骤**：
1. 检查改动状态（`git status`），确认是想发布的内容
2. 跑 `npm run build`，确认首页能正确生成
3. `git add` + commit（commit message 用中文，由 Claude 自己根据改动写，比如"添加贪吃蛇游戏"或"给贪吃蛇加上排行榜"）
4. `git push` 到 main
5. 告诉孩子："已经推送啦，1-2 分钟后访问 jiduojiang.com/{type}/{slug}/ 就能玩了"

## 我替你拍板的小决定

- **不引入构建工具链**（无 Vite/Webpack）：纯静态 + 一个 Node 脚本
- **不用 TypeScript**（除 Pages Functions 外）
- **不写测试**：玩具项目，YAGNI
- **首页构建时生成，不运行时生成**：更简单更快
- **commit message 用中文**：孩子和爸爸都看得懂
- **样式：原生 CSS，不要 Tailwind 不要框架**

## 待定 / 未来再说

- 自我介绍内容（需要爸爸跟孩子一起填）
- 首页配色和字体（孩子自己后面挑）
- 是否要给项目加"标签"或"分类"（暂不加，先用 emoji + 时间排序）
- 是否要支持"草稿"状态的项目不显示（暂不加，所有 meta.json 存在即显示）

## 成功标准

1. 孩子可以打开 Claude Code，说"我要做一个 XX 游戏"，5-15 分钟内有一个能玩的版本出现在 `jiduojiang.com/games/XX/`
2. 整个流程不需要孩子理解 git、wrangler、Cloudflare 任何概念
3. 新增项目自动出现在首页，不需要手动改首页代码
4. 任何一个项目的链接可以单独分享给小朋友，独立可玩
