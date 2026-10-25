// scripts/build-site.mjs
// ────────────────────────────────────────
// Builds the homepage and copies only the public site into dist/.
//
// Deploy with `wrangler pages deploy dist`. Never deploy the repo root:
// `wrangler pages deploy .` uploads every file, including .env and the
// Cloudflare API token. Cloudflare Pages has no ignore-file support, so
// a clean output directory is the only safe deploy input.
//
// Run with: npm run build

import { existsSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

// 1. Refresh /index.html from the template and the project meta.json files.
execFileSync(process.execPath, [join(ROOT, 'scripts', 'build-index.mjs')], {
  cwd: ROOT,
  stdio: 'inherit',
});

// 2. Recreate dist/ from scratch so deleted files cannot linger in it.
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// Directories that make up the public site. `functions/` is included when a
// project adds a Pages Function; `design/` is the static design gallery.
const PUBLIC_DIRS = ['shared', 'learning', 'games', 'tools', 'functions', 'design'];
// Optional root-level assets that Pages treats specially.
const PUBLIC_FILES = ['index.html', '_headers', '_redirects', '404.html', 'robots.txt', 'favicon.ico', 'sitemap.xml'];

for (const dir of PUBLIC_DIRS) {
  const src = join(ROOT, dir);
  if (existsSync(src)) cpSync(src, join(DIST, dir), { recursive: true });
}
for (const file of PUBLIC_FILES) {
  const src = join(ROOT, file);
  if (existsSync(src)) cpSync(src, join(DIST, file));
}

// 3. Hard guard: these must never end up in a deployment.
const FORBIDDEN = [
  '.env', '.envrc', '.git', '.wrangler', '.claude', '.playwright-mcp',
  'node_modules', 'wrangler.toml', 'CLAUDE.md', 'package.json',
  'scripts', 'docs', 'index.html.template',
];
const leaked = FORBIDDEN.filter((name) => existsSync(join(DIST, name)));
if (leaked.length > 0) {
  console.error('✗ refusing to build dist — private files were copied:', leaked.join(', '));
  process.exit(1);
}

console.log('✓ built dist/ — deploy this directory, never the repo root');
