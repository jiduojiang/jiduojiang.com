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
      external: meta.external || null,
    };
  });

  projects.sort((a, b) => (a.created < b.created ? 1 : -1));
  return projects;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function renderCard(project, index) {
  const crayon = CRAYONS[index % CRAYONS.length];
  const isExternal = Boolean(project.external);
  const href = isExternal ? project.external : `/${project.type}/${project.slug}/`;
  const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  const cardClass = isExternal ? 'card card--external' : 'card';
  const metaLeft = isExternal
    ? `${escapeHtml(hostnameOf(project.external))}`
    : `${escapeHtml(formatDate(project.created))}`;
  const arrow = isExternal ? '↗' : '→';
  return `<a class="${cardClass}" style="--card-bg: var(${crayon})" href="${escapeHtml(href)}"${target}>
  <div class="card__emoji">${escapeHtml(project.emoji)}</div>
  <h3 class="card__title">${escapeHtml(project.title)}</h3>
  <p class="card__desc">${escapeHtml(project.description)}</p>
  <div class="card__meta">
    <span>${metaLeft}</span>
    <span class="card__go">${arrow}</span>
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
  const learning = scanProjects('learning');
  const games = scanProjects('games');
  const tools = scanProjects('tools');

  let html = readFileSync(TEMPLATE, 'utf8');
  html = html.replace('<!-- LEARNING_CARDS -->', renderCardList(learning));
  html = html.replace('<!-- GAMES_CARDS -->', renderCardList(games));
  html = html.replace('<!-- TOOLS_CARDS -->', renderCardList(tools));
  html = html.replace('<!-- LEARNING_COUNT -->', formatCount(learning.length));
  html = html.replace('<!-- GAMES_COUNT -->', formatCount(games.length));
  html = html.replace('<!-- TOOLS_COUNT -->', formatCount(tools.length));

  writeFileSync(OUTPUT, html);

  console.log(`✓ wrote ${OUTPUT}`);
  console.log(`  ${learning.length} learning thing(s): ${learning.map((l) => l.slug).join(', ') || '(none)'}`);
  console.log(`  ${games.length} game(s): ${games.map((g) => g.slug).join(', ') || '(none)'}`);
  console.log(`  ${tools.length} tool(s): ${tools.map((t) => t.slug).join(', ') || '(none)'}`);
}

build();
