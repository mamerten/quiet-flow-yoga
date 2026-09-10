#!/usr/bin/env node
/**
 * Renders every figure in public/js/figures.js to a labelled PNG contact sheet
 * so you can actually LOOK at them before shipping.
 *
 * This project has no test suite, and figures are hand-authored SVG
 * coordinates. Authoring them blind is exactly how the Calisthenics set ended
 * up with six pairs that were byte-identical on screen despite being different
 * exercises, several forward folds drawn head-on as unreadable blobs, and a
 * Cat-Cow whose back never arched. Every one of those was invisible in the
 * source and obvious the moment the set was rendered side by side.
 *
 * Flip-book frames are expanded next to each other rather than cycling, so you
 * can check each frame and see whether the parts that shouldn't move actually
 * held still.
 *
 * Usage:
 *   node tools/render-figures.js                  # all exercises, light
 *   node tools/render-figures.js --mode=yoga      # yoga poses instead
 *   node tools/render-figures.js --dark           # dark background
 *   node tools/render-figures.js --out=/tmp/x.png # where to write
 *   node tools/render-figures.js --only=plank,deepSquat   # named figures only
 *
 * Needs Playwright's chromium. If `require('playwright')` fails, either
 * `npm i -D playwright && npx playwright install chromium`, or run with
 * NODE_PATH pointed at a global install.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('playwright not found. Try:\n  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..', 'public');
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const flag = (name) => process.argv.includes(`--${name}`);

const MODE = arg('mode', 'calisthenics');
const DARK = flag('dark');
const ONLY = arg('only', '').split(',').filter(Boolean);
const OUT = path.resolve(arg('out', path.join(__dirname, `figures-${MODE}${DARK ? '-dark' : ''}.png`)));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, colorScheme: DARK ? 'dark' : 'light' });
  await page.setContent('<div></div>');
  await page.addScriptTag({ path: path.join(ROOT, 'js/figures.js') });
  await page.addScriptTag({ path: path.join(ROOT, 'js/poses.js') });
  await page.addScriptTag({ path: path.join(ROOT, 'js/exercises.js') });

  const { html, count } = await page.evaluate(({ mode, only }) => {
    const lib = mode === 'yoga' ? window.POSES : window.EXERCISES;
    let items = lib.map((e) => ({ name: e.name, key: e.figure }));
    if (only.length) items = only.map((k) => ({ name: k, key: k }));

    const cells = items.map(({ name, key }) => {
      const raw = window.FIGURES[key];
      let frames;
      if (!raw) {
        frames = '<div class="fr missing">MISSING</div>';
      } else if (raw.includes('figure-frames')) {
        // Expand the flip book so every frame is visible at once.
        frames = (raw.match(/<svg[\s\S]*?<\/svg>/g) || [])
          .map((s, i) => `<div class="fr"><span class="n">${i + 1}</span>${s}</div>`).join('');
      } else {
        frames = `<div class="fr">${raw}</div>`;
      }
      return `<figure><figcaption><b>${name}</b><br><code>${key}</code></figcaption>`
        + `<div class="frames">${frames}</div></figure>`;
    }).join('');
    return { html: cells, count: items.length };
  }, { mode: MODE, only: ONLY });

  const fg = DARK ? '#bfe4cc' : '#2f3b34';
  const bg = DARK ? '#171f1b' : '#ffffff';
  const card = DARK ? '#1c2620' : '#fafaf7';
  const line = DARK ? '#34423b' : '#d7ded9';

  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:14px;background:${bg};color:${fg};font:12px/1.3 system-ui,sans-serif}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    figure{margin:0;border:1px solid ${line};border-radius:8px;padding:6px;background:${card}}
    figcaption{text-align:center;margin-bottom:4px;font-size:11px;line-height:1.25}
    code{font-size:10px;opacity:.6}
    .frames{display:flex;gap:4px;justify-content:center}
    .fr{position:relative;width:82px;height:115px;border:1px dashed ${line}}
    .fr.missing{display:flex;align-items:center;justify-content:center;color:#b5665b;font-weight:700}
    .fr .n{position:absolute;top:1px;left:2px;font-size:9px;opacity:.45}
    svg{width:100%;height:100%;display:block}
  </style><div class="grid">${html}</div>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: OUT, fullPage: true });
  await browser.close();
  console.log(`${count} ${MODE} figures -> ${OUT}`);
})();
