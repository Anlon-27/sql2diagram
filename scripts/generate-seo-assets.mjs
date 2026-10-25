import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const guidesDir = path.join(publicDir, 'guides');

const SITE_URL = 'https://drawlab.top';
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/er/', changefreq: 'weekly', priority: '0.9' },
  { path: '/linetable/', changefreq: 'weekly', priority: '0.9' },
  { path: '/architecture/', changefreq: 'weekly', priority: '0.9' },
  { path: '/flowchart/', changefreq: 'weekly', priority: '0.9' },
  { path: '/classdiagram/', changefreq: 'weekly', priority: '0.9' },
  { path: '/usecase/', changefreq: 'weekly', priority: '0.9' },
  { path: '/sequence/', changefreq: 'weekly', priority: '0.9' },
  { path: '/overall-er/', changefreq: 'weekly', priority: '0.9' },
  { path: '/guides/', changefreq: 'weekly', priority: '0.8' }
];

// ── Sitemap ──

function getFileLastMod(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return TODAY;
  }
}

function getLatestMod(paths) {
  let latest = '';
  for (const filePath of paths) {
    const value = getFileLastMod(filePath);
    if (value > latest) latest = value;
  }
  return latest;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry(entry) {
  return [
    '  <url>',
    `    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>'
  ].join('\n');
}

function getGuideEntries() {
  const guideFiles = fs
    .readdirSync(guidesDir)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .sort();

  return guideFiles.map((name) => ({
    path: `/guides/${name}`,
    lastmod: getFileLastMod(path.join(guidesDir, name)),
    changefreq: 'monthly',
    priority: name.includes('sql-to-') ? '0.8' : '0.75'
  }));
}

function generateSitemap() {
  const staticEntries = STATIC_PAGES.map((entry) => {
    let lastmod;
    if (entry.path === '/') {
      lastmod = getFileLastMod(path.join(projectRoot, 'index.html'));
    } else if (entry.path === '/guides/') {
      lastmod = getFileLastMod(path.join(guidesDir, 'index.html'));
    } else {
      const toolType = entry.path.slice(1);
      const diagramDir = path.join(projectRoot, 'src', 'diagrams', toolType);
      lastmod = getLatestMod([
        path.join(projectRoot, 'index.html'),
        path.join(projectRoot, 'src', 'content', 'toolSeoContent.js'),
        diagramDir
      ]);
    }
    return {
      ...entry,
      lastmod
    };
  });

  const guideIndexPath = path.join(guidesDir, 'index.html');
  const guideIndexEntry = staticEntries.find((entry) => entry.path === '/guides/');
  if (guideIndexEntry) {
    guideIndexEntry.lastmod = getFileLastMod(guideIndexPath);
  }

  const entries = [...staticEntries, ...getGuideEntries()];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(buildUrlEntry),
    '</urlset>',
    ''
  ].join('\n');

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  console.log('  ✓ sitemap.xml');
}

// ── robots.txt ──

function generateRobots() {
  const content = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /search-engine-submission.html',
    '',
    `# AI Agent Documentation`,
    `# ${SITE_URL}/llms.txt`,
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ''
  ].join('\n');

  fs.writeFileSync(path.join(publicDir, 'robots.txt'), content, 'utf8');
  console.log('  ✓ robots.txt');
}

// ── Run ──

console.log('SEO assets:');
generateSitemap();
generateRobots();
