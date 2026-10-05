// Calisthenics mode is self-paced (see README): unlike yoga, there's no
// per-exercise timer or fixed-length sequence — you decide when to move to
// the next exercise (button, voice, or swipe), and only an overall session
// clock runs in the background. So instead of pre-building a fixed array of
// {pose, duration} segments like js/workout.js does, this exposes a
// *sequencer* you pull one exercise from at a time, for as long as the
// session lasts.
//
// One-sided exercises: since you (not a timer) decide when to move on, the
// mirrored side comes back-to-back — left, then immediately right the next
// time you ask for the next exercise — rather than deferred and interspersed
// with something else the way yoga does it. That's the natural "user
// controlled" reading of a sided exercise here: do as many reps as you want
// on one side, then move to the other side yourself, on your own signal.
//
// The deck carries over between sessions. It used to be shuffled fresh for
// every session and thrown away at the end, after only the first quarter or so
// had been used. Each pick was perfectly fair, but across sessions that is
// independent sampling, and independent sampling clumps: over ten 25-exercise
// sessions about 6 of ~100 exercises never came up while about 19 came up four
// or more times, and something you'd just done came straight back the next
// session a quarter of the time. Fair and even are different things, and a
// workout wants even. Now every eligible exercise comes up once before any of
// them repeats, however many sessions that takes.

function shuffleExercises(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One saved deck per equipment combination, since each combination is a
// different pool of exercises. Storage can be missing or blocked (private
// browsing, some file:// setups); then every session simply deals a fresh deck,
// which is the old behaviour, and nothing breaks.
const DECK_KEY_PREFIX = 'quietflow.deck.';

function loadDeck(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null');
  } catch (e) {
    return null;
  }
}

function saveDeck(key, deck) {
  try {
    window.localStorage.setItem(key, JSON.stringify(deck));
  } catch (e) {
    // No storage: this session's deck just isn't remembered.
  }
}

/**
 * Returns a sequencer with a `.next()` method that yields one
 * {pose, side, duration: null} segment per call, working through every
 * eligible exercise once before any repeats, and never giving the same
 * exercise twice in a row. `duration` is always null — Calisthenics mode has
 * no fixed hold time; it's here only so a segment has the same shape as a yoga
 * one for the shared rendering code in app.js.
 *
 * `filter` narrows which exercises are eligible, based on the equipment
 * toggles on the home screen (js/app.js):
 *   hasMat        default true. false excludes surface: 'ground' exercises
 *                 (sitting or kneeling on a bare floor).
 *   hasFurniture  default true. false excludes needsFurniture exercises
 *                 (a chair, step, towel, or book — something you carry around
 *                 or prop a foot on, unlike a wall, which needsWall exercises
 *                 assume is available regardless of this toggle).
 *   hasBar        default FALSE, unlike the other two. A pull-up bar is real
 *                 kit rather than household furniture, so needsBar exercises
 *                 (Dead Hang, Pull-Up) are opt-in: they stay out of the pool
 *                 unless you say you have one.
 */
window.createCalisthenicsSequencer = function createCalisthenicsSequencer(filter) {
  const hasMat = !filter || filter.hasMat !== false;
  const hasFurniture = !filter || filter.hasFurniture !== false;
  // Opt-in rather than opt-out: absent a filter, assume no bar.
  const hasBar = !!filter && filter.hasBar === true;
  const all = (window.EXERCISES || []).filter((e) =>
    (hasMat || e.surface !== 'ground')
    && (hasFurniture || !e.needsFurniture)
    && (hasBar || !e.needsBar)
  );
  const byId = new Map(all.map((e) => [e.id, e]));
  const deckKey = DECK_KEY_PREFIX + [hasMat, hasFurniture, hasBar].map(Number).join('');
  const freshDeck = () => shuffleExercises(all).map((e) => e.id);

  // `remaining` is the rest of this cycle, in play order; `played` is what
  // this cycle has already dealt.
  let remaining = null;
  let played = [];
  let lastId = null;
  const saved = loadDeck(deckKey);
  if (saved && Array.isArray(saved.remaining) && Array.isArray(saved.played)) {
    // Exercises deleted since the deck was dealt drop out; exercises added
    // since are slotted into the unplayed part at random, so something new
    // turns up this cycle instead of waiting several sessions for the next.
    remaining = saved.remaining.filter((id) => byId.has(id));
    played = saved.played.filter((id) => byId.has(id));
    const known = new Set([...remaining, ...played]);
    for (const e of all) {
      if (!known.has(e.id)) {
        remaining.splice(Math.floor(Math.random() * (remaining.length + 1)), 0, e.id);
      }
    }
    lastId = typeof saved.last === 'string' ? saved.last : null;
  }
  if (!remaining || remaining.length === 0) {
    remaining = freshDeck();
    played = [];
  }

  let pendingRightSide = null; // sided exercise whose right side comes next

  // app.js always pulls one exercise ahead, for the "Next: ..." preview, so
  // the most recent deal is usually something you've only seen announced, not
  // done. The saved deck puts that one back on top: next session opens with
  // it, rather than it silently counting as played and being skipped for a
  // whole cycle. A right-side continuation is the second half of something
  // already started, so it is saved as played.
  function persist(dealtId, isNewDeal) {
    if (isNewDeal) {
      saveDeck(deckKey, {
        remaining: [dealtId, ...remaining],
        played: played.filter((id) => id !== dealtId),
        last: played.length > 1 ? played[played.length - 2] : null,
      });
    } else {
      saveDeck(deckKey, { remaining, played, last: dealtId });
    }
  }

  return {
    next() {
      if (all.length === 0) return null;

      if (pendingRightSide) {
        const exercise = pendingRightSide;
        pendingRightSide = null;
        lastId = exercise.id;
        persist(exercise.id, false);
        return { pose: exercise, side: 'right', duration: null };
      }

      if (remaining.length === 0) {
        remaining = freshDeck();
        played = [];
      }
      let id = remaining.shift();
      // Never the same exercise twice running - only possible across a cycle
      // boundary. Swapped with a random later one rather than skipped, so it
      // still gets its turn this cycle. (It used to be dropped outright.)
      if (id === lastId && remaining.length > 0) {
        const j = Math.floor(Math.random() * remaining.length);
        [id, remaining[j]] = [remaining[j], id];
      }
      played.push(id);
      lastId = id;
      persist(id, true);

      const exercise = byId.get(id);
      if (exercise.sided) {
        pendingRightSide = exercise; // due on the very next call, immediately
        return { pose: exercise, side: 'left', duration: null };
      }
      return { pose: exercise, side: null, duration: null };
    },
  };
};
