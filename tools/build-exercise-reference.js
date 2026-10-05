#!/usr/bin/env node
/**
 * Builds docs/exercise-reference.html: every Calisthenics exercise with its
 * figure, sides, and cue, grouped the way the home-screen equipment toggles
 * group them.
 *
 * The output is a GENERATED, self-contained snapshot — no scripts, no links
 * back into public/. An earlier version of this page read exercises.js and
 * figures.js live at load time instead. That meant editing the exercises never
 * touched the HTML file, so its Modified date sat frozen for days while the
 * content changed, and it read as "the reference isn't being updated" every
 * time someone looked at it. It also only worked when opened from exactly the
 * right folder. A real file that is rebuilt with every exercise change avoids
 * both: the file date moves when the content does, and it opens anywhere —
 * straight from disk, a Dropbox preview, or a phone.
 *
 * Re-run after editing public/js/exercises.js or public/js/figures.js:
 *
 *   node tools/build-exercise-reference.js      (or: npm run reference)
 *
 * Don't hand-edit docs/exercise-reference.html; it is overwritten each run.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'exercise-reference.html');

global.window = {};
require(path.join(ROOT, 'public', 'js', 'figures.js'));
require(path.join(ROOT, 'public', 'js', 'exercises.js'));
const exercises = window.EXERCISES || [];
const figures = window.FIGURES || {};
if (!exercises.length) {
  console.error('No exercises loaded from public/js/exercises.js');
  process.exit(1);
}

// Stable keys, separate from their display text, so a typo in a label can't
// silently empty a group. needsBar is checked first: it's the one piece of kit
// you either own or don't.
function groupKey(e) {
  if (e.needsBar) return 'bar';
  if (e.needsFurniture) return 'furniture';
  if (e.surface === 'ground') return 'ground';
  return 'standing';
}
const GROUP_LABELS = {
  standing: 'Standing, no equipment',
  ground: 'Ground / mat, no equipment',
  furniture: 'Needs a chair, step, or other prop',
  bar: 'Needs a pull-up bar',
};
// Bar last: it's the only group that's off by default in the app.
const GROUP_ORDER = ['standing', 'ground', 'furniture', 'bar'];

// Row order within a section. The order of exercises.js means nothing to the
// app - the sequencer shuffles - so left alone it drifts into "the order things
// were added in", which is no order at all to someone scanning for a move.
// This decides a scannable order for the reference only; the app is untouched.
//
// Standing runs: upright moves, then squatting, then kickboxing, then the rest
// (lunges, hinges and folds). These are explicit lists because nothing in the
// data says whether a move is upright. A new standing exercise that isn't
// listed here is shown last in its section and named by the build, so it gets
// placed rather than silently landing somewhere odd.
const STANDING_ORDER = [
  // upright
  'reverse-hunchback', 'elbow-lift-hold', 'collarbone-look-up', 'hands-behind-pulldown',
  'w-slide', 'l-pull', 't-raise', 'y-raise', 'front-arm-circles', 'standing-torso-twist',
  'calf-raises', 'single-leg-balance', 'touch-the-potato', 'standing-quad-stretch',
  'wall-ankle-stretch', 'standing-hip-opener', 'open-the-gate', 'a-skips', 'single-leg-hops',
  // squatting
  'deep-squat-hold', 'toe-squat-hold', 'squatting-heel-raise', 'squat-knee-drops',
  'squat-hip-pulses', 'squat-twist', 'deep-squat-reach-upward', 'squat-and-reach',
  'squat-fold', 'wall-sit-hold', 'pistol-squat-hold-45', 'jump-squat',
  // kickboxing
  'jab-cross', 'hooks', 'uppercuts', 'bob-and-weave',
  'front-kicks', 'roundhouse-kicks', 'knee-strikes', 'side-kicks',
  // everything else: lunges, hinges, folds
  'reverse-lunge', 'curtsy-lunge', 'lunge-crunch', 'good-mornings',
  'single-leg-rdl', 'standing-toe-touch', 'windmill',
];

// Ground keeps exercises.js order, except that each cluster below is pulled
// together at the position of its first member. A cluster is one or more
// families laid down back to back, in the order listed. They are rules rather
// than lists, so a new push-up, crab move or 90/90 joins its group without
// anyone touching this file.
// The overhead test looks for the mat outline figures.js draws around every
// figure seen from directly above (its MAT constant). If that outline is ever
// redrawn this string has to follow, which is why the build fails loudly when
// it matches nothing rather than quietly scattering the group again.
const OVERHEAD_MAT = 'M14 8 H86 V136 H14 Z';
const isOverhead = (e) => (figures[e.figure] || '').includes(OVERHEAD_MAT);
const isLegRaise = (e) => /leg raise|side sweep|side curl/i.test(e.name);
const GROUND_CLUSTERS = [
  [(e) => /push-up/i.test(e.name)],
  [(e) => /crab/i.test(e.name)],
  [(e) => /90\/90|z-sit/i.test(e.name)],
  // Two asks that overlap: keep the overhead figures together, and keep the
  // leg raises together - but two of the three leg raises (the side sweeps)
  // are drawn overhead. So the overhead run ends on those two, and the third
  // leg raise follows straight on, which keeps both groups unbroken.
  [
    (e) => isOverhead(e) && !isLegRaise(e),
    (e) => isOverhead(e) && isLegRaise(e),
    (e) => isLegRaise(e) && !isOverhead(e),
  ],
];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A figure is either one <svg> or an animatedFigure() wrapper holding several.
// The app cycles those frames with CSS; here they're laid out side by side so
// every frame can be checked, and so nothing depends on the app's stylesheet.
function frames(markup) {
  return (markup || '').match(/<svg[\s\S]*?<\/svg>/g) || [];
}

const problems = [];
function figureCell(e) {
  const svgs = frames(figures[e.figure]);
  if (!svgs.length) {
    problems.push(`${e.id}: missing figure "${e.figure}"`);
    return `<em class="missing">missing figure: ${esc(e.figure)}</em>`;
  }
  // No "N frames" label: the frames sit side by side, so the count is obvious.
  return `<div class="frames">${svgs.join('')}</div>`;
}

const notes = (e) => [
  e.needsWall && 'needs a wall',
].filter(Boolean);

const groups = {};
for (const e of exercises) (groups[groupKey(e)] = groups[groupKey(e)] || []).push(e);

function orderStanding(list) {
  const rank = new Map(STANDING_ORDER.map((id, i) => [id, i]));
  const ids = new Set(list.map((e) => e.id));
  const stale = STANDING_ORDER.filter((id) => !ids.has(id));
  if (stale.length) problems.push(`STANDING_ORDER names exercises that aren't standing (renamed or moved?): ${stale.join(', ')}`);
  const unplaced = list.filter((e) => !rank.has(e.id));
  if (unplaced.length) {
    console.warn(`Standing exercises not in STANDING_ORDER, shown last: ${unplaced.map((e) => e.id).join(', ')}`);
  }
  return [...list.filter((e) => rank.has(e.id)).sort((a, b) => rank.get(a.id) - rank.get(b.id)), ...unplaced];
}

function gatherClusters(list, clusters) {
  const out = [];
  const placed = new Set();
  const place = (m) => {
    if (!placed.has(m)) { out.push(m); placed.add(m); }
  };
  for (const e of list) {
    if (placed.has(e)) continue;
    const cluster = clusters.find((c) => c.some((f) => f(e)));
    if (!cluster) { place(e); continue; }
    for (const family of cluster) list.filter(family).forEach(place);
  }
  return out;
}

if (!exercises.some(isOverhead)) {
  problems.push('No overhead (mat-outline) figures found: OVERHEAD_MAT no longer matches figures.js MAT');
}
groups.standing = orderStanding(groups.standing || []);
groups.ground = gatherClusters(groups.ground || [], GROUND_CLUSTERS);

const sided = exercises.filter((e) => e.sided).length;
const mixed = exercises.filter((e) => e.mixedSides).length;
const generated = new Date().toLocaleString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
});

let sections = '';
for (const key of GROUP_ORDER) {
  const list = groups[key];
  if (!list || !list.length) continue;
  const rows = list.map((e) => {
    const extra = notes(e);
    return `
      <tr>
        <td class="fig-cell">${figureCell(e)}</td>
        <td class="name-cell"><strong>${esc(e.name)}</strong><span class="id">${esc(e.id)}</span>${
          extra.length ? `<span class="note">${esc(extra.join(', '))}</span>` : ''}</td>
        <td class="level-cell">${e.difficulty ? esc(e.difficulty) : ''}</td>
        <td class="sides-cell">${e.sided ? 'Left + Right' : e.mixedSides ? 'Mixed' : 'Single'}</td>
        <td class="cue-cell">${esc(e.cue)}</td>
      </tr>`;
  }).join('');
  sections += `
  <section>
    <h2>${esc(GROUP_LABELS[key])} <span class="count">(${list.length})</span></h2>
    <table>
      <thead><tr><th>Figure</th><th>Name</th><th class="level-col" title="Difficulty: E easy, M medium, H hard">Level</th><th class="sides-col">Sides</th><th>Cue</th></tr></thead>
      <tbody>${rows}
      </tbody>
    </table>
  </section>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Calisthenics exercise reference</title>
<!-- GENERATED by tools/build-exercise-reference.js on ${esc(generated)}.
     Do not edit by hand; re-run that script after changing exercises.js or
     figures.js. -->
<style>
  body {
    font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
    margin: 28px 32px 60px;
    color: #2f3b34;
    background: #faf7f2;
  }
  h1 { margin: 0 0 4px; font-size: 1.8rem; font-weight: 700; }
  .meta { color: #6b7570; font-size: 0.9rem; margin: 0 0 28px; line-height: 1.5; }
  .meta strong { color: #2f3b34; }
  h2 {
    margin: 40px 0 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #d7ded9;
    color: #5f7a68;
    font-size: 1.1rem;
  }
  h2 .count { color: #9aa39d; font-weight: 400; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th, td {
    border-bottom: 1px solid #e7ece7;
    padding: 10px 14px;
    text-align: left;
    vertical-align: middle;
    font-size: 0.9rem;
  }
  th {
    background: #eef2ec;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7570;
  }
  tr:hover td { background: #f2f5f1; }
  .fig-cell { width: 1%; white-space: nowrap; }
  .frames { display: flex; gap: 3px; }
  .frames svg {
    width: 68px; height: 95px; display: block; flex: 0 0 auto;
    color: #5f7a68; background: #fff; border: 1px solid #e7ece7; border-radius: 4px;
  }
  .name-cell { width: 220px; }
  .name-cell .id, .name-cell .note { display: block; font-size: 0.72rem; margin-top: 2px; }
  .name-cell .id { color: #9aa39d; font-family: Consolas, monospace; }
  .name-cell .note { color: #a0764a; }
  .sides-cell { width: 90px; color: #6b7570; }
  .level-col, .level-cell { width: 44px; text-align: center; }
  .level-cell { font-weight: 700; color: #5f7a68; }
  .cue-cell { line-height: 1.45; }
  .missing { color: #a33; }
  @media (max-width: 700px) {
    body { margin: 16px 12px 40px; }
    th.sides-col, td.sides-cell { display: none; }
    .name-cell { width: auto; }
  }
</style>
</head>
<body>
  <h1>Calisthenics exercise reference</h1>
  <p class="meta">
    <strong>${exercises.length} exercises</strong> (${sided} split into left + right, ${mixed} mixed, the rest single) &middot;
    generated <strong>${esc(generated)}</strong><br />
    Grouped the way the equipment toggles on the home screen group them. Standing runs upright
    moves, then squatting, then kickboxing, then lunges and hinges. On the ground, push-ups, crab
    moves, the 90/90 family, the figures drawn from overhead and the leg raises are each kept
    together. <em>Mixed</em> means both
    sides in one set, left and right mixed together as you go. <em>Level</em> is difficulty: E easy,
    M medium, H hard. Flip-book figures show every
    frame side by side. Rebuilt from <code>public/js/exercises.js</code> and <code>public/js/figures.js</code>
    by <code>tools/build-exercise-reference.js</code> whenever the exercises change. Internal reference
    only, not part of the shipped site.
  </p>${sections}
</body>
</html>
`;

fs.writeFileSync(OUT, html);
if (problems.length) {
  console.error('Problems:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`Wrote ${path.relative(ROOT, OUT)}: ${exercises.length} exercises, ${sided} sided, generated ${generated}`);
