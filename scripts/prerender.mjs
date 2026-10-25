import { chromium } from 'playwright';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const SITE_URL = 'https://drawlab.top';
const ROUTES = [
  { path: '/', name: 'index.html' },
  { path: '/er/', name: 'er/index.html' },
  { path: '/linetable/', name: 'linetable/index.html' },
  { path: '/architecture/', name: 'architecture/index.html' },
  { path: '/flowchart/', name: 'flowchart/index.html' },
  { path: '/classdiagram/', name: 'classdiagram/index.html' },
  { path: '/usecase/', name: 'usecase/index.html' },
  { path: '/sequence/', name: 'sequence/index.html' },
  { path: '/overall-er/', name: 'overall-er/index.html' },
];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await fetch(url);
      if (resp.ok) return;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Server did not start in time');
}

async function main() {
  // Start preview server
  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const server = spawn(process.execPath, [viteBin, 'preview', '--port', '5199', '--strictPort'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  let serverOutput = '';
  server.stdout.on('data', (d) => { serverOutput += d.toString(); });
  server.stderr.on('data', (d) => { serverOutput += d.toString(); });

  const BASE = 'http://localhost:5199';

  try {
    console.log('Starting preview server...');
    await waitForServer(BASE);

    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });

    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      const outPath = path.join(distDir, route.name);
      const outDir = path.dirname(outPath);

      console.log(`  Prerendering ${route.path}...`);

      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });

        // Wait for Vue app to render
        await page.waitForSelector('.app-root, .home-root, .workspace-page', {
          timeout: 10000,
        }).catch(() => {});

        // Give extra time for async rendering
        await page.waitForTimeout(1000);

        const html = await page.content();
        let finalHtml = html;
        if (finalHtml.includes('<link rel="canonical"')) {
          finalHtml = finalHtml.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${SITE_URL}${route.path}" />`);
        } else {
          finalHtml = finalHtml.replace(
            '</head>',
            `  <link rel="canonical" href="${SITE_URL}${route.path}" />\n</head>`
          );
        }

        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(outPath, finalHtml, 'utf-8');
        console.log(`    ✓ ${route.name}`);
      } catch (err) {
        console.error(`    ✗ ${route.path}: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    console.log('\nPrerendering complete!');
  } finally {
    server.kill();
    // Clean up the preview child process tree on both Windows and Unix shells.
    try {
      if (process.platform === 'win32' && server.pid) {
        execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore' });
      } else {
        execSync('pkill -f "vite preview"', { stdio: 'ignore' });
      }
    } catch {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
