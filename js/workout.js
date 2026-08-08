import { POSES, posesByCategory } from './poses.js';

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
const MAX_POSE_SECONDS = 75;

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
function fillPhase(category, budgetSeconds) {
  const pool = shuffle(posesByCategory(category));
  if (pool.length === 0) return [];

  const segments = [];
  let used = 0;
  let i = 0;
  let lastId = null;

  while (used < budgetSeconds) {
    if (i >= pool.length) {
      // reshuffle and keep going, avoiding an immediate repeat
      const reshuffled = shuffle(pool);
      pool.splice(0, pool.length, ...reshuffled);
      i = 0;
    }
    const pose = pool[i];
    i++;
    if (pose.id === lastId && pool.length > 1) continue;

    segments.push({ pose, duration: pose.duration });
    used += pose.duration;
    lastId = pose.id;

    // stop once we're close enough to the budget to avoid an overly long tail
    if (used >= budgetSeconds) break;
  }
  return segments;
}

function closingDuration(totalMinutes) {
  if (totalMinutes <= 5) return 30;
  if (totalMinutes <= 7) return 45;
  return 60;
}

/**
 * Builds a sequence of {pose, duration} segments that fills roughly
 * `totalMinutes` of practice, structured as centering -> warm-up ->
 * standing -> balance -> seated -> final relaxation.
 */
export function generateWorkout(totalMinutes) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const savasana = POSES.find((p) => p.id === 'savasana');
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
  segments = segments.map((s) => ({
    pose: s.pose,
    duration: Math.max(MIN_POSE_SECONDS, Math.min(MAX_POSE_SECONDS, Math.round(s.duration * scale))),
  }));

  segments.push({ pose: savasana, duration: Math.round(closingSeconds) });

  return segments;
}
