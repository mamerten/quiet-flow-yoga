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
// Every session deals from a freshly shuffled deck, and nothing is remembered
// between sessions: each eligible exercise is equally likely in every session,
// regardless of what came up yesterday or when it was added to the library.
// Within a session nothing repeats until the whole deck has been dealt.
//
// Groups: a few families of near-identical moves (the kicks, the punches, the
// 90/90s, the leg raises and sweeps, the push-ups) carry a `group` in
// exercises.js, and a run deals at most ONE exercise from each - or the number
// in window.GROUP_LIMITS where a family is allowed more (the push-ups: two).
// Picked fairly at random, four kicks in one 25-exercise session is ordinary
// luck, and it reads as the app being stuck on kicks. The first of a group to
// be dealt counts toward its limit; once the limit is reached the rest of that
// group are skipped for the whole run, however long it is. A left/right pair
// counts as one exercise.
// (An earlier version carried the deck over between sessions so everything
// came up once before anything repeated; that was dropped by request, partly
// because it made newly added exercises turn up noticeably more often.)

function shuffleExercises(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns a sequencer with a `.next()` method that yields one
 * {pose, side, duration: null} segment per call, working through a fresh
 * shuffle of every eligible exercise before any repeats, and never giving the
 * same exercise twice in a row. `duration` is always null — Calisthenics mode
 * has no fixed hold time; it's here only so a segment has the same shape as a
 * yoga one for the shared rendering code in app.js.
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
  let remaining = shuffleExercises(all);
  let lastId = null;
  let pendingRightSide = null; // sided exercise whose right side comes next
  const groupCount = new Map(); // how many of each group have been dealt this run
  const limitOf = (g) => (window.GROUP_LIMITS && window.GROUP_LIMITS[g]) || 1;
  const eligible = (e) => !(e.group && (groupCount.get(e.group) || 0) >= limitOf(e.group));

  // The next exercise from the deck, passing over any whose group has already
  // used up its limit this run (those are dropped, not put back). The deck can only
  // run dry of eligible exercises if every exercise left is in a used group -
  // a pool made of nothing but groups - and then the limit is lifted rather
  // than looping forever.
  function take() {
    let refills = 0;
    for (;;) {
      if (remaining.length === 0) {
        if (refills >= 1) groupCount.clear();
        remaining = shuffleExercises(all);
        refills++;
      }
      const e = remaining.shift();
      if (eligible(e)) return e;
    }
  }

  return {
    next() {
      if (all.length === 0) return null;

      if (pendingRightSide) {
        const exercise = pendingRightSide;
        pendingRightSide = null;
        return { pose: exercise, side: 'right', duration: null };
      }

      let exercise = take();
      // Never the same exercise twice running - only possible right after a
      // reshuffle. Swapped with a random later one so it still gets its turn.
      if (exercise.id === lastId) {
        const later = remaining.map((e, k) => k).filter((k) => eligible(remaining[k]));
        if (later.length > 0) {
          const j = later[Math.floor(Math.random() * later.length)];
          [exercise, remaining[j]] = [remaining[j], exercise];
        }
      }
      lastId = exercise.id;
      if (exercise.group) groupCount.set(exercise.group, (groupCount.get(exercise.group) || 0) + 1);

      if (exercise.sided) {
        pendingRightSide = exercise; // due on the very next call, immediately
        return { pose: exercise, side: 'left', duration: null };
      }
      return { pose: exercise, side: null, duration: null };
    },
  };
};
