// Calisthenics mode is self-paced (see README): unlike yoga, there's no
// per-exercise timer or fixed-length sequence — you decide when to move to
// the next exercise (button, voice, or swipe), and only an overall session
// clock runs in the background. So instead of pre-building a fixed array of
// {pose, duration} segments like js/workout.js does, this exposes a
// *sequencer* you pull one exercise from at a time, for as long as the
// session lasts.
//
// One-sided exercises still get the same left/right fairness treatment as
// yoga: the mirrored side is deferred a couple of exercises rather than
// repeated immediately, and it's guaranteed to eventually appear.

const CALISTHENICS_SIDE_GAP = 1;

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
 * {pose, side, duration: null} segment per call, cycling through
 * window.EXERCISES indefinitely (reshuffling once exhausted, never
 * repeating the immediately-previous exercise back to back). `duration` is
 * always null — Calisthenics mode has no fixed hold time; it's here only
 * so a segment has the same shape as a yoga one for the shared rendering
 * code in app.js.
 */
window.createCalisthenicsSequencer = function createCalisthenicsSequencer() {
  const all = window.EXERCISES || [];
  let pool = shuffleExercises(all);
  let i = 0;
  let lastId = null;
  let emitted = 0;
  const pending = []; // [{ exercise, dueAt }] second sides awaiting their turn

  function emit(exercise, side) {
    emitted++;
    lastId = exercise.id;
    return { pose: exercise, side: side || null, duration: null };
  }

  function dueNow() {
    for (let k = 0; k < pending.length; k++) {
      if (emitted >= pending[k].dueAt) {
        const { exercise } = pending[k];
        pending.splice(k, 1);
        return emit(exercise, 'right');
      }
    }
    return null;
  }

  return {
    next() {
      if (all.length === 0) return null;

      const due = dueNow();
      if (due) return due;

      if (i >= pool.length) {
        pool = shuffleExercises(all);
        i = 0;
      }
      let exercise = pool[i];
      i++;
      if (exercise.id === lastId && pool.length > 1) {
        if (i >= pool.length) {
          pool = shuffleExercises(all);
          i = 0;
        }
        exercise = pool[i];
        i++;
      }

      if (exercise.sided) {
        const seg = emit(exercise, 'left');
        pending.push({ exercise, dueAt: emitted + CALISTHENICS_SIDE_GAP });
        return seg;
      }
      return emit(exercise);
    },
  };
};
