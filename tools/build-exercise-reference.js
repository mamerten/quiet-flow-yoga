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

// Subsections and row order within a section. The order of exercises.js means
// nothing to the app - the sequencer shuffles - so left alone it drifts into
// "the order things were added in", which is no order at all to someone
// scanning for a move. This decides a findable layout for the reference only;
// the app is untouched.
//
// A section listed here names every one of its exercises, in display order,
// under a subheading. These are explicit lists because nothing in the data says
// whether a move is upright or chest-down. A new exercise that isn't listed
// shows under "Unsorted" at the end of its section and is named by the build,
// so it gets placed; a listed id that is no longer in that section (renamed,
// moved, deleted) fails the build, so the lists can't quietly rot.
const SUBSECTIONS = {
  standing: [
    ['Upright', [
      'reverse-hunchback', 'collarbone-look-up',
      'w-slide', 'l-pull', 't-raise', 'y-raise', 'front-arm-circles', 'standing-torso-twist',
      'calf-raises', 'single-leg-balance', 'standing-lateral-leg-raise', 'touch-the-potato',
      'standing-quad-stretch',
      'wall-ankle-stretch', 'standing-hip-opener', 'open-the-gate', 'a-skips', 'single-leg-hops',
    ]],
    ['Squatting', [
      'bodyweight-squat', 'deep-squat-hold', 'toe-squat-hold', 'squatting-heel-raise',
      'squat-knee-drops',
      'squat-hip-pulses', 'squat-twist', 'deep-squat-reach-upward', 'squat-and-reach',
      'squat-fold', 'wall-sit-hold', 'pistol-squat-hold-45', 'single-leg-squat-heel-touch',
      'jump-squat',
    ]],
    ['Kickboxing', [
      'jab-cross', 'hooks', 'uppercuts', 'bob-and-weave',
      'front-kicks', 'roundhouse-kicks', 'knee-strikes', 'side-kicks',
    ]],
    ['Lunges, hinges and folds', [
      'reverse-lunge', 'curtsy-lunge', 'lunge-crunch', 'good-mornings',
      'single-leg-rdl', 'standing-toe-touch', 'windmill',
    ]],
  ],
  // The three ways you meet the mat, in the user's own words for them.
  ground: [
    ['Indian style', [
      'sit-to-stand', 'butterfly-rock', 'seated-scapular-slides', 'seated-toe-touch', 'butt-walk',
      'ninety-ninety-switch', 'ninety-ninety-overhead', 'ninety-ninety-hip-lift',
      'ninety-ninety-rotate-fold',
    ]],
    ['Chest down', [
      // planks and push-ups
      'plank-hold', 'shoulder-taps', 'push-up-flow', 'shoulder-tap-push-up', 'wide-push-up',
      'spiderman-push-up', 'pike-push-up', 'crawl-position-push-up', 'scapular-pushup',
      'push-up-lunge-reach', 'push-up-knee-forward', 'push-up-hips-back', 'push-up-kick-through', 'push-up-side-plank',
      'side-plank', 'side-plank-hand', 'side-curl', 'side-plank-leg-shift',
      'plank-opposite-toe-touch', 'kick-through', 'kick-through-from-beast', 'forward-kick-through', 'mountain-climber-kick-through',
      'shoulder-tap-kick-through', 'mountain-climber', 'side-mountain-climber-to-stand', 'burpee',
      'down-up-dogs', 'bear-crawl',
      // hands and knees
      'bird-dog', 'cat-cow-mobility', 'frog-sit-opener', 'kneeling-shoulder-rocks',
      'kneeling-thoracic-rotation', 'kneeling-rest',
      // kneeling and low lunges
      'worlds-greatest-stretch', 'lunge-reach-twist', 'couch-stretch',
      'kneeling-ankle-stretch', 'kneeling-hip-hinge', 'reverse-nordic-curl', 'kneeling-lean-rotate',
      'squat-roll-hip-lift',
      // face down
      'superman-hold', 'prone-w-rotation', 'prone-elbow-rotation', 'tennis-ball-to-toilet-paper-roll',
      'prone-neck-release', 'scorpion-heel-taps',
    ]],
    ['Chest up', [
      // crab
      'crab-hold', 'crab-hold-leg-lift', 'bear-to-crab', 'crab-lift', 'crab-toe-touch', 'crab-leg-lift-knee-touch', 'crab-reach', 'crab-to-twist',
      'reverse-plank',
      // on the back
      'glute-bridge', 'single-leg-glute-bridge', 'dead-bug', 'hollow-body-hold',
      'suitcase-crunches', 'bicycle-crunches', 'lying-knee-drops', 'windshield-wipers',
      // propped back on the hands: the leg raises
      'two-leg-side-sweep', 'single-leg-side-sweep', 'leg-raises', 'leg-in-out-rotate', 'russian-twists',
    ]],
  ],
};

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

const GROUP_NAMES = {
  kicks: 'kicks', punches: 'punches', 'ninety-ninety': '90/90s', 'leg-raises': 'leg raises and sweeps', 'push-ups': 'push-ups', 'ankle-stretches': 'ankle stretches',
};
const notes = (e) => [
  e.needsWall && 'needs a wall',
  e.group && `max ${(window.GROUP_LIMITS || {})[e.group] || 1} per session: ${GROUP_NAMES[e.group] || e.group}`,
].filter(Boolean);

const groups = {};
for (const e of exercises) (groups[groupKey(e)] = groups[groupKey(e)] || []).push(e);

// Split a section into its subsections. A section with no SUBSECTIONS entry
// is one untitled block, in exercises.js order.
function subsections(key, list) {
  const spec = SUBSECTIONS[key];
  if (!spec) return [{ title: null, list }];
  const where = GROUP_LABELS[key];
  const byId = new Map(list.map((e) => [e.id, e]));
  const placed = new Set();
  const out = spec.map(([title, ids]) => {
    const stale = ids.filter((id) => !byId.has(id));
    if (stale.length) {
      problems.push(`${where} / ${title} lists exercises that aren't in that section (renamed, moved or deleted?): ${stale.join(', ')}`);
    }
    const twice = ids.filter((id, n) => placed.has(id) || ids.indexOf(id) !== n);
    if (twice.length) problems.push(`${where}: listed more than once: ${twice.join(', ')}`);
    ids.forEach((id) => placed.add(id));
    return { title, list: ids.filter((id) => byId.has(id)).map((id) => byId.get(id)) };
  });
  const unplaced = list.filter((e) => !placed.has(e.id));
  if (unplaced.length) {
    console.warn(`${where}: not in any subsection, shown under "Unsorted": ${unplaced.map((e) => e.id).join(', ')}`);
    out.push({ title: 'Unsorted', list: unplaced });
  }
  return out.filter((s) => s.list.length);
}

const sided = exercises.filter((e) => e.sided).length;
const mixed = exercises.filter((e) => e.mixedSides).length;
const generated = new Date().toLocaleString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
});

function row(e) {
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
}

let sections = '';
for (const key of GROUP_ORDER) {
  const list = groups[key];
  if (!list || !list.length) continue;
  const rows = subsections(key, list).map((sub) => (sub.title ? `
      <tr class="subhead"><td colspan="5">${esc(sub.title)} <span class="count">(${sub.list.length})</span></td></tr>` : '')
    + sub.list.map(row).join('')).join('');
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

// The "never repeat" rules, written out at the top of the page. Built from the
// same data the app deals from (each exercise's `group`, plus GROUP_LIMITS), so
// the page can't say one thing while the app does another. Order here is the
// order they are listed in; a group missing from it is still shown, last.
const RULE_ORDER = ['push-ups', 'kicks', 'punches', 'ninety-ninety', 'leg-raises', 'ankle-stretches'];
const groupLimit = (g) => (window.GROUP_LIMITS || {})[g] || 1;
const usedGroups = [...new Set(exercises.filter((e) => e.group).map((e) => e.group))];
const unlisted = usedGroups.filter((g) => !RULE_ORDER.includes(g));
if (unlisted.length) console.warn(`Groups not in RULE_ORDER, shown last: ${unlisted.join(', ')}`);
const ruleGroups = [...RULE_ORDER.filter((g) => usedGroups.includes(g)), ...unlisted];
const groupRows = ruleGroups.map((g) => {
  const members = exercises.filter((e) => e.group === g);
  const names = members
    .map((e) => esc(e.name) + (e.sided ? ' <span class="pair">(left + right)</span>' : ''))
    .join(' <span class="sep">&middot;</span> ');
  return `
      <tr>
        <td class="g-name">${esc(GROUP_NAMES[g] || g)}</td>
        <td class="g-max">${groupLimit(g)}</td>
        <td class="g-members">${names} <span class="count">(${members.length})</span></td>
      </tr>`;
}).join('');
const grouped = exercises.filter((e) => e.group).length;
const rulesSection = `
  <section class="rules">
    <h2>Session rules: groups that never repeat</h2>
    <p>
      A few families of near-identical moves are limited so one session can't fill up with the same
      thing. A <em>session</em> is one run of Calisthenics, start to finish.
    </p>
    <table>
      <thead><tr><th>Group</th><th class="max-col">Max per session</th><th>Moves in the group</th></tr></thead>
      <tbody>${groupRows}
      </tbody>
    </table>
    <ul>
      <li><strong>The limit is per session.</strong> Once a group has used up its max, the rest of
        its moves are skipped for the whole session, however long it runs. Which ones come up is random.</li>
      <li><strong>A left + right pair counts as one move.</strong> The two sides always come back to back.</li>
      <li><strong>Everything else is unlimited.</strong> The ${exercises.length - grouped} moves in no group
        (the crabs, the kick-throughs, the planks and so on) can come up any number of times.</li>
      <li><strong>The same move never comes up twice in a row.</strong></li>
      <li><strong>Every session is a fresh shuffle.</strong> Nothing is remembered between sessions, and
        the equipment toggles on the home screen decide which moves are in the deck at all.</li>
      <li>Moves in a group are tagged <em>max N per session</em> in the Name column below. The groups are set by
        <code>group</code> on each exercise and <code>GROUP_LIMITS</code> in <code>public/js/exercises.js</code>.</li>
    </ul>
  </section>`;

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
  tr.subhead td, tr.subhead:hover td {
    background: transparent;
    border-bottom: 2px solid #d7ded9;
    padding: 26px 14px 6px;
    color: #2f3b34;
    font-size: 0.95rem;
    font-weight: 700;
  }
  tr.subhead .count { color: #9aa39d; font-weight: 400; }
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
  .rules p { margin: 0 0 12px; line-height: 1.5; font-size: 0.92rem; }
  .rules ul { margin: 14px 0 0; padding-left: 20px; line-height: 1.55; font-size: 0.9rem; }
  .rules li { margin-bottom: 4px; }
  .rules code { font-size: 0.82rem; }
  .max-col, .g-max { width: 110px; text-align: center; }
  .g-name { width: 200px; font-weight: 700; }
  .g-max { font-size: 1.15rem; font-weight: 700; color: #5f7a68; }
  .g-members { line-height: 1.6; }
  .g-members .sep { color: #c3cbc5; }
  .g-members .pair, .g-members .count { color: #9aa39d; font-size: 0.8rem; }
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
    Grouped the way the equipment toggles on the home screen group them. Standing and Ground / mat
    are split into subsections so a move is easier to find: standing into upright, squatting,
    kickboxing, and lunges and hinges; the mat into Indian style, chest down and chest up. <em>Mixed</em> means both
    sides in one set, left and right mixed together as you go. <em>Level</em> is difficulty: E easy,
    M medium, H hard. Flip-book figures show every
    frame side by side. Rebuilt from <code>public/js/exercises.js</code> and <code>public/js/figures.js</code>
    by <code>tools/build-exercise-reference.js</code> whenever the exercises change. Internal reference
    only, not part of the shipped site.
  </p>${rulesSection}${sections}
</body>
</html>
`;

fs.writeFileSync(OUT, html);
if (problems.length) {
  console.error('Problems:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`Wrote ${path.relative(ROOT, OUT)}: ${exercises.length} exercises, ${sided} sided, generated ${generated}`);
