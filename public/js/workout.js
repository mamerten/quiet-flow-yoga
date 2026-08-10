// Uses window.POSES / window.posesByCategory from poses.js (loaded first).

// Phases, in order, with a rough share of the total practice time.
// "centering" and "relaxation" are handled with fixed/near-fixed durations
// since they open and close every practice regardless of length.
const PHASES = [
  { category: 'centering', weight: 0.08, minPoses: 1 },
  { category: 'warmup', weight: 0.20, minPoses: 1 },
  { category: 'standing', weight: 0.36, minPoses: 1 },
  { category: 'balance', weight: 0.12, minPoses: 1 },
  { category: 'seated', weight: 0.16, minPoses: 1 },
];

const MIN_POSE_SECONDS = 15;
// One-sided poses are held twice (once per side), so they get their own,
// higher floor — dropping a single side below this makes the stretch
// useless no matter how short the practice is.
const MIN_SIDED_POSE_SECONDS = 20;
const MAX_POSE_SECONDS = 75;

// How many poses to leave between the two sides of the same pose, when the
// phase is long enough to allow it. 1 = one other pose in between, which
// reads as a real sequence rather than a mechanical "now the other side".
const SIDE_GAP = 1;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fills a time budget (seconds) with poses drawn from `category`, cycling
// through a shuffled pool so a longer workout can reuse poses without
// repeating one twice in a row.
//
// One-sided poses (pose.sided) are always emitted as a LEFT/RIGHT pair so
// the body gets an even stretch. The second side is deferred by SIDE_GAP
// poses where possible, and any still-pending second sides are flushed at
// the end of the phase — so a pose can never be left unmirrored.
function fillPhase(category, budgetSeconds) {
  const pool = shuffle(window.posesByCategory(category));
  if (pool.length === 0) return [];

  const segments = [];
  const pending = []; // [{ segment, dueAt }] second sides awaiting insertion
  let used = 0;
  let i = 0;
  let lastId = null;

  function push(pose, side) {
    segments.push({ pose, duration: pose.duration, side: side || null });
    used += pose.duration;
    lastId = pose.id;
  }

  function flushDue() {
    for (let k = pending.length - 1; k >= 0; k--) {
      if (segments.length >= pending[k].dueAt) {
        const { pose } = pending[k];
        pending.splice(k, 1);
        push(pose, 'right');
      }
    }
  }

  while (used < budgetSeconds) {
    flushDue();
    if (used >= budgetSeconds) break;

    if (i >= pool.length) {
      // reshuffle and keep going, avoiding an immediate repeat
      const reshuffled = shuffle(pool);
      pool.splice(0, pool.length, ...reshuffled);
      i = 0;
    }
    const pose = pool[i];
    i++;
    if (pose.id === lastId && pool.length > 1) continue;

    if (pose.sided) {
      push(pose, 'left');
      // Reserve the matching right side a little later in the phase.
      pending.push({ pose, dueAt: segments.length + SIDE_GAP });
      // Budget for BOTH sides now, so the pair can't overrun the phase.
      used += pose.duration;
    } else {
      push(pose);
    }

    if (used >= budgetSeconds) break;
  }

  // Anything still pending must still happen — an unmirrored stretch is
  // worse than a slightly long phase.
  pending.forEach(({ pose }) => segments.push({ pose, duration: pose.duration, side: 'right' }));

  return segments;
}

function closingDuration(totalMinutes) {
  if (totalMinutes <= 5) return 30;
  if (totalMinutes <= 7) return 45;
  return 60;
}

/**
 * Builds a sequence of {pose, duration, side} segments that fills roughly
 * `totalMinutes` of practice, structured as centering -> warm-up ->
 * standing -> balance -> seated -> final relaxation.
 *
 * `side` is 'left' | 'right' for one-sided poses, or null for symmetric
 * ones. Every one-sided pose appears exactly twice, once per side.
 */
window.generateWorkout = function generateWorkout(totalMinutes) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const savasana = window.POSES.find((p) => p.id === 'savasana');
  const closingSeconds = Math.min(closingDuration(totalMinutes), totalSeconds * 0.3);
  const phaseBudget = Math.max(totalSeconds - closingSeconds, 30);

  let segments = [];
  for (const phase of PHASES) {
    const budget = phaseBudget * phase.weight;
    segments = segments.concat(fillPhase(phase.category, budget));
  }

  // Scale durations so the whole sequence lands close to the requested time.
  const rawTotal = segments.reduce((sum, s) => sum + s.duration, 0);
  const scale = rawTotal > 0 ? phaseBudget / rawTotal : 1;
  segments = segments.map((s) => {
    const floor = s.side ? MIN_SIDED_POSE_SECONDS : MIN_POSE_SECONDS;
    return {
      pose: s.pose,
      side: s.side,
      duration: Math.max(floor, Math.min(MAX_POSE_SECONDS, Math.round(s.duration * scale))),
    };
  });

  segments.push({ pose: savasana, side: null, duration: Math.round(closingSeconds) });

  return segments;
};
