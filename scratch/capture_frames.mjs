import { createServer } from 'node:http';
import { existsSync, statSync, createReadStream, mkdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve('c:/Users/luisl/OneDrive/Escritorio/Programacion y proyectos/portfolio-luis-v1');
const cdpPath = pathToFileURL(join(root, '.agents/skills/taste-skill/scripts/lib/cdp.mjs')).href;
const { Browser, sleep } = await import(cdpPath);

const framesDir = resolve('c:/Users/luisl/OneDrive/Escritorio/Programacion y proyectos/portfolio-luis-v1/scratch/frames');
mkdirSync(framesDir, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

const server = createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    let f = resolve(join(root, pathname.replace(/^\/+/, '')));
    if (!existsSync(f) || statSync(f).isDirectory()) {
      f = join(root, 'index.html');
    }
    res.writeHead(200, {
      'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    createReadStream(f).pipe(res);
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
console.log('[+] Local server running at', baseUrl);

const browser = await Browser.launch({ width: 1280, height: 800 });
const page = await browser.newPage({ width: 1280, height: 800 });

let frameNum = 0;
async function capture(name) {
  frameNum++;
  const filename = `frame_${String(frameNum).padStart(2, '0')}_${name}.png`;
  const filePath = join(framesDir, filename);
  await page.screenshot({ path: filePath, format: 'png' });
  console.log(`[+] Captured frame ${frameNum}: ${filename}`);
}

try {
  // 1. Home / Hero (Dark Mode)
  await page.goto(baseUrl + '/', { settleMs: 1500 });
  await page.eval(() => window.LLP.theme.set('dark'));
  await sleep(600);
  await capture('hero');

  // 2. Command Palette (Ctrl+K)
  await page.eval(() => {
    if (window.LLP && window.LLP.openPalette) {
      window.LLP.openPalette();
      const input = document.getElementById('palette-input');
      if (input) {
        input.value = 'projects';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
  await sleep(600);
  await capture('command_palette');

  // Close palette
  await page.eval(() => {
    if (window.LLP && window.LLP.closePalette) window.LLP.closePalette();
  });
  await sleep(300);

  // 3. Home Bento Grid (scroll slightly)
  await page.wheel(450, { step: 150, pauseMs: 30 });
  await sleep(600);
  await capture('home_bento');

  // 4. Projects View (/projects) - VulnFollowUp
  await page.goto(baseUrl + '/projects', { settleMs: 1200 });
  await sleep(500);
  await capture('projects_vulnfollowup');

  // 5. Projects View - Architecture modal or scroll down to kshield
  await page.wheel(550, { step: 150, pauseMs: 30 });
  await sleep(600);
  await capture('projects_kshield');

  // 6. Interactive Lab (/lab) - whoami & skills in terminal
  await page.goto(baseUrl + '/lab', { settleMs: 1200 });
  await page.eval(() => {
    const input = document.getElementById('term-input');
    const form = document.getElementById('term-form');
    if (input && form) {
      input.value = 'skills';
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
  await sleep(600);
  await capture('terminal_skills');

  // 7. Interactive Lab (/lab) - neofetch
  await page.eval(() => {
    const input = document.getElementById('term-input');
    const form = document.getElementById('term-form');
    if (input && form) {
      input.value = 'neofetch';
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
  await sleep(600);
  await capture('terminal_neofetch');

  // 8. Trajectory (/trajectory) - Timeline & Algo Inspector
  await page.goto(baseUrl + '/trajectory', { settleMs: 1200 });
  await sleep(600);
  await capture('trajectory_timeline');

  // 9. Light Theme (Engineering Paper)
  await page.eval(() => {
    window.LLP.theme.set('light');
  });
  await sleep(600);
  await capture('light_theme');

  // 10. Return to Dark Hero
  await page.goto(baseUrl + '/', { settleMs: 1200 });
  await page.eval(() => {
    window.LLP.theme.set('dark');
  });
  await sleep(600);
  await capture('hero_dark_end');

  console.log('[+] All frames captured successfully in', framesDir);
} finally {
  await browser.close();
  server.close();
}
