// Simple, original stick-figure illustrations for yoga poses and
// calisthenics exercises.
// Each is a self-contained inline SVG (viewBox 0 0 100 140), stroke=currentColor.
// A small shared set of "template" body shapes is reused across poses that look
// similar (this is a low-detail visual reference, not anatomical art).

const STROKE = 'stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const HEAD = (cx, cy, r = 8) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`;
const LINE = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${STROKE}/>`;
const POLY = (pts) => `<polyline points="${pts}" ${STROKE}/>`;

// Everything that isn't the body: the floor, a wall, a chair, a pull-up bar, a
// mat outline. Drawn thinner and faded so it reads as scenery and the figure
// still reads as the subject.
const PROP = (d) =>
  `<path d="${d}" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`;

// A floor line. Worth more than it looks: it's the only thing that tells you a
// Jump Squat is airborne, a Calf Raise has its heels up, or a Bear Crawl's
// knees are hovering rather than down.
const GROUND = (x1, x2, y) => PROP(`M${x1} ${y} H${x2}`);

// The outline of a mat, for the figures drawn from directly overhead (the
// lying-down hip and core work). Without it a bird's-eye body reads as someone
// standing up and facing you.
const MAT = PROP('M14 8 H86 V136 H14 Z');

// A towel held taut between two hands. Slightly thinner than a limb and hanging
// with a little slack, so it doesn't read as a third arm.
const TOWEL = (x1, y1, x2, y2, sag = 7) =>
  `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

function svg(inner) {
  return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${inner}</svg>`;
}

// Wraps 2-4 frames (each written the same way a single svg() call's inner
// content is) into one auto-cycling "flip book" for exercises that are a
// repeated motion rather than a held position — Jump Squat actually
// jumping, Push-Up going up and down, W-Slide sliding between its two
// named shapes. The cycling itself is pure CSS (see .figure-frames in
// style.css), so this needs no JS timer and nothing in app.js changes.
function animatedFigure(frames) {
  return `<div class="figure-frames frames-${frames.length}">${frames.map(svg).join('')}</div>`;
}

// A stick figure built from named joints rather than free-floating line
// segments. Every figure drawn with it shares one anatomy — a head on a neck,
// arms hanging off shoulders, legs off a single hip — which is what keeps a
// pose legible at thumbnail size on a phone. Segments are drawn back to front
// (scenery, legs, torso, arms, head) so the head always sits on top.
//
//   head       [x, y]  centre of the head circle
//   headR      head radius (8 for front-on figures, 7 for side/overhead ones,
//              which are drawn slightly smaller so they read as further away)
//   neck       [x, y]  top of the spine; also the default arm origin
//   hip        [x, y]  pelvis; every leg starts here
//   shoulders  [[x,y],[x,y]] optional. Draws a shoulder bar and starts arms[0]
//              and arms[1] from its two ends — worth it for front-on figures,
//              where arms sprouting from a single neck point read as growing
//              out of the head. Omitted for side views, where you only see one
//              shoulder anyway.
//   arms       [[elbow, hand], ...]  0-2 entries; one is normal for side views
//   legs       [[knee, foot], ...]   0-2 entries
//   spineBow   optional curve on the torso instead of a straight line
//   prop       raw SVG for scenery, drawn behind everything
//   extra      raw SVG drawn last, on top (a tucked foot, a towel)
//
// Returns inner SVG content, not a finished <svg> — so the same call works
// standalone (wrapped in svg()) or as one frame of an animatedFigure().
// One limb segment, drawn as a filled tapered capsule rather than a stroked
// line: the outline of the two end circles plus their outer tangents. Chaining
// two of them (upper arm then forearm) joins seamlessly as long as they share
// the radius at the joint, so no separate joint dots are needed.
function BONE(x1, y1, x2, y2, r1, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  // Degenerate cases: zero length, or one end circle swallowing the other.
  if (d < 0.01 || Math.abs(r1 - r2) >= d) {
    const r = Math.max(r1, r2);
    return r1 >= r2 ? HEAD(x1, y1, r) : HEAD(x2, y2, r);
  }
  const ux = dx / d;
  const uy = dy / d;
  const sin = (r1 - r2) / d;
  const cos = Math.sqrt(1 - sin * sin);
  // Left-hand normal (in SVG's y-down space).
  const nx = -uy;
  const ny = ux;
  const p = (x, y, r, side) => [
    x + r * (side * nx * cos + ux * sin),
    y + r * (side * ny * cos + uy * sin),
  ];
  const [ax1, ay1] = p(x1, y1, r1, 1);
  const [bx1, by1] = p(x2, y2, r2, 1);
  const [ax2, ay2] = p(x1, y1, r1, -1);
  const [bx2, by2] = p(x2, y2, r2, -1);
  return `<path d="M${ax1} ${ay1} L${bx1} ${by1} A${r2} ${r2} 0 0 0 ${bx2} ${by2} `
    + `L${ax2} ${ay2} A${r1} ${r1} 0 0 0 ${ax1} ${ay1} Z" fill="currentColor"/>`;
}

// A curved bone (only the spine needs one — Cat-Cow's arch and round),
// approximated as a short chain of straight capsules sampled along a quadratic
// Bezier, with the radius tapering across the whole run.
function BONE_CURVED(x1, y1, x2, y2, r1, r2, bow, steps = 5) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + bow;
  const at = (t) => [
    (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
    (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2,
  ];
  let out = '';
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const [sx, sy] = at(t0);
    const [ex, ey] = at(t1);
    out += BONE(sx, sy, ex, ey, r1 + (r2 - r1) * t0, r1 + (r2 - r1) * t1);
  }
  return out;
}

// Limb thicknesses, as capsule radii in viewBox units. Each segment tapers
// toward the far end and hands its end radius to the next segment, so the
// figure reads as a body that narrows toward the hands and feet instead of as
// uniform wire. Tuned by rendering the whole set and checking it still reads at
// thumbnail size — going much heavier closes the gaps in a deep squat.
const W = {
  torso: [5.6, 4.6],     // neck -> hip
  shoulder: 3.2,         // the shoulder bar
  upperArm: [3.2, 2.6],  // shoulder -> elbow
  forearm: [2.6, 2.0],   // elbow -> hand
  thigh: [4.2, 3.4],     // hip -> knee
  shin: [3.4, 2.4],      // knee -> foot
  neck: 2.6,             // neck -> head
  foot: [2.4, 1.8],      // ankle -> toe, for the two figures that draw one
};

function stick(spec) {
  const {
    head, neck, hip, shoulders = null, arms = [], legs = [],
    headR = 8, spineBow = 0, prop = '', extra = '',
  } = spec;
  let out = prop;
  legs.forEach(([knee, foot]) => {
    out += BONE(hip[0], hip[1], knee[0], knee[1], W.thigh[0], W.thigh[1]);
    out += BONE(knee[0], knee[1], foot[0], foot[1], W.shin[0], W.shin[1]);
  });
  out += spineBow
    ? BONE_CURVED(neck[0], neck[1], hip[0], hip[1], W.torso[0], W.torso[1], spineBow)
    : BONE(neck[0], neck[1], hip[0], hip[1], W.torso[0], W.torso[1]);
  if (shoulders) {
    out += BONE(shoulders[0][0], shoulders[0][1], shoulders[1][0], shoulders[1][1],
      W.shoulder, W.shoulder);
  }
  arms.forEach(([elbow, hand], i) => {
    const from = (shoulders && shoulders[i]) || neck;
    out += BONE(from[0], from[1], elbow[0], elbow[1], W.upperArm[0], W.upperArm[1]);
    out += BONE(elbow[0], elbow[1], hand[0], hand[1], W.forearm[0], W.forearm[1]);
  });
  out += BONE(neck[0], neck[1], head[0], head[1], W.neck, W.neck);
  out += HEAD(head[0], head[1], headR);
  if (extra) out += extra;
  return out;
}

// Shared bases. Several exercises differ only in what the arms are doing, and
// several flip books deliberately hold the lower body fixed across frames so
// the eye reads the one thing that actually moves.
const STAND_FRONT = { head: [50, 17], neck: [50, 28], shoulders: [[38, 33], [62, 33]], hip: [50, 80] };
const LEGS_FRONT = [[[45, 106], [43, 133]], [[55, 106], [57, 133]]];
const LEGS_SIDE = [[[46, 106], [43, 133]], [[52, 106], [55, 133]]];
const FLOOR_STAND = GROUND(10, 90, 133);
// Plank: one straight diagonal from head to heels, held up by a vertical arm.
const PLANK = {
  head: [16, 52], headR: 7, neck: [24, 58], hip: [58, 84],
  arms: [[[24, 84], [24, 110]]], legs: [[[76, 97], [92, 110]]],
  prop: GROUND(8, 98, 112),
};

window.FIGURES = {
  // ============================================================
  // Yoga figures (public/js/poses.js)
  //
  // These predate stick() above and are still written as hand-placed line
  // segments. Left alone deliberately: the Calisthenics rebuild had no reason
  // to churn the yoga set, and anything reused by both libraries now has a
  // separate calisthenics-side key so editing one can't disturb the other.
  // ============================================================

  // T1 — standing, arms relaxed at sides (Mountain)
  standingNeutral: svg(
    HEAD(50, 16) +
    LINE(50, 24, 50, 74) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 34, 66) +
    LINE(62, 30, 66, 66) +
    LINE(50, 74, 40, 132) +
    LINE(50, 74, 60, 132)
  ),

  // T2 — standing, arms reaching overhead (Chair, sun reach)
  standingArmsUp: svg(
    HEAD(50, 16) +
    LINE(50, 24, 50, 74) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 30, 10) +
    LINE(62, 30, 70, 10) +
    LINE(50, 74, 40, 132) +
    LINE(50, 74, 60, 132)
  ),

  // T3 — standing, wide stance, arms out to a T (Warrior II, Triangle, Side Angle)
  standingArmsOutT: svg(
    HEAD(50, 16) +
    LINE(50, 24, 50, 74) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 10, 30) +
    LINE(62, 30, 90, 30) +
    POLY('50,74 30,105 15,132') +
    LINE(50, 74, 85, 132)
  ),

  // T4 — standing forward fold (Uttanasana)
  standingForwardFold: svg(
    HEAD(46, 112, 7) +
    LINE(50, 74, 48, 100) +
    LINE(40, 102, 56, 102) +
    LINE(40, 102, 35, 128) +
    LINE(56, 102, 58, 128) +
    LINE(50, 74, 40, 132) +
    LINE(50, 74, 60, 132)
  ),

  // T5 — tabletop, side view: hands AND knees, both "legs" roughly
  // vertical (Cat-Cow) — NOT a plank; see `plank` below for the
  // straight-line-off-the-floor shape.
  tabletop: svg(
    HEAD(18, 58, 7) +
    LINE(26, 60, 72, 58) +
    LINE(28, 62, 28, 98) +
    LINE(72, 58, 72, 98) +
    LINE(72, 98, 92, 96)
  ),

  // T6 — downward dog, side view, inverted V
  downdog: svg(
    HEAD(18, 88, 7) +
    LINE(55, 32, 20, 96) +
    LINE(55, 32, 92, 96)
  ),

  // T7 — lunge, front knee bent, arms overhead (Warrior I, Low Lunge)
  lungeArmsUp: svg(
    HEAD(50, 20) +
    LINE(50, 28, 50, 74) +
    LINE(50, 34, 38, 8) +
    LINE(50, 34, 62, 8) +
    POLY('50,74 35,100 30,132') +
    LINE(50, 74, 80, 130)
  ),

  // T8 — kneeling, sitting back on the heels with the torso folded all
  // the way forward and one arm stretched out along the floor (Child's
  // Pose) — a clear grounded base (hips down near the heels) with the
  // back arching up and over to a head that's close to the floor, rather
  // than a shape that reads as cut off partway through.
  kneelingFold: svg(
    LINE(25, 100, 15, 125) +
    LINE(25, 100, 35, 125) +
    LINE(25, 100, 55, 75) +
    LINE(55, 75, 68, 98) +
    HEAD(72, 100, 7) +
    LINE(55, 75, 92, 85)
  ),

  // T9 — seated, cross-legged (Easy Seat, Forward Fold, Twist, Cow Face)
  seatedNeutral: svg(
    HEAD(50, 30) +
    LINE(50, 38, 50, 80) +
    LINE(38, 42, 62, 42) +
    LINE(38, 42, 35, 70) +
    LINE(62, 42, 65, 70) +
    LINE(50, 80, 20, 95) +
    LINE(20, 95, 45, 100) +
    LINE(50, 80, 80, 95) +
    LINE(80, 95, 55, 100)
  ),

  // T10 — lying on back (Happy Baby, Bridge, Savasana)
  lyingBack: svg(
    HEAD(15, 70, 7) +
    LINE(22, 70, 70, 70) +
    LINE(22, 70, 15, 85) +
    LINE(70, 70, 75, 45) +
    LINE(75, 45, 85, 50)
  ),

  // T11 — lying on stomach, chest lifted (Cobra)
  lyingFront: svg(
    HEAD(25, 68, 7) +
    LINE(32, 72, 70, 90) +
    LINE(70, 90, 95, 92) +
    LINE(40, 75, 45, 90)
  ),

  // T12 — balancing on one leg, arms reaching up near the head (Tree,
  // Eagle, Warrior III). NOT used for the plain Single-Leg Balance Hold
  // test in Calisthenics — see balanceArmsOut below for that.
  balanceOneLeg: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 74) +
    LINE(50, 32, 42, 10) +
    LINE(50, 32, 58, 10) +
    LINE(50, 74, 50, 132) +
    POLY('50,74 65,95 45,90')
  ),

  // T13 — wide stance, straight legs, torso tilted sideways, one arm
  // reaching down toward the front foot and one reaching straight up
  // (Triangle) — distinct from T3's upright, level "T" arms.
  triangleReach: svg(
    HEAD(24, 36, 7) +
    LINE(28, 43, 50, 72) +
    LINE(28, 43, 18, 95) +
    LINE(28, 43, 58, 8) +
    LINE(50, 72, 18, 132) +
    LINE(50, 72, 85, 128)
  ),

  // T14 — wide stance with a bent front knee, torso tilted sideways over
  // it, front arm reaching down and back arm reaching overhead in one
  // long diagonal line (Extended Side Angle) — distinct from both T3
  // (Warrior II's upright T arms) and T13 (Triangle's straight legs).
  sideAngleReach: svg(
    HEAD(22, 48, 7) +
    LINE(28, 55, 50, 74) +
    LINE(28, 55, 15, 96) +
    LINE(28, 55, 60, 14) +
    POLY('50,74 30,100 15,128') +
    LINE(50, 74, 88, 128)
  ),

  // ============================================================
  // Calisthenics figures (public/js/exercises.js)
  //
  // All built with stick() above. Three rules learned from the version
  // these replaced, where a lot of figures read as a pile of sticks:
  //
  //  1. Anything that folds, hinges, squats or planks is drawn from the
  //     SIDE. A forward fold seen head-on is just a blob.
  //  2. Anything whose whole point is what the legs do relative to each
  //     other while lying down (knee drops, wipers, 90/90, bicycle, frog)
  //     is drawn from OVERHEAD, on a mat outline so it doesn't read as
  //     standing up.
  //  3. If the exercise is a rep rather than a hold, it's a flip book, and
  //     the parts that don't move are held byte-identical across frames so
  //     the eye only tracks the thing that actually moves.
  // ============================================================

  // --- Standing, no equipment ---

  // C1 — side view, hips dropped below knee height with the arms reaching
  // forward as a counterweight (Deep Squat Hold). Side-on because the whole
  // point is squat DEPTH, which a front view can't show, and because "reach
  // your arms forward" is invisible head-on.
  // The hips sit low and stacked OVER the heels rather than behind them:
  // drawn behind, the figure reads as perched on an invisible stool.
  deepSquat: svg(stick({
    head: [58, 68], headR: 7, neck: [56, 80], hip: [52, 116],
    arms: [[[72, 88], [88, 88]]],
    legs: [[[84, 100], [58, 130]], [[78, 104], [52, 130]]],
    prop: GROUND(8, 96, 132),
  })),

  // C2 — side view, hands clasped behind the back and the arms lifted UP
  // and away, chest open (Reverse Hunchback). Side-on so "behind you" is
  // unambiguous, and paired deliberately with armsBehindBackDown below:
  // same view, opposite arm direction, because those two exercises start
  // identically and are told apart only by which way the arms travel.
  armsBehindBackLift: svg(stick({
    head: [42, 18], headR: 7, neck: [48, 28], hip: [50, 80],
    arms: [[[61, 48], [78, 62]]],
    legs: LEGS_SIDE,
    prop: FLOOR_STAND,
  })),

  // C3 — side view, fingers laced behind the back and the hands pulled
  // DOWN below the hips, shoulders dropping away from the ears
  // (Hands-Behind-Back Pull-Down). The mirror of armsBehindBackLift.
  armsBehindBackDown: svg(stick({
    head: [42, 18], headR: 7, neck: [48, 28], hip: [50, 80],
    arms: [[[56, 52], [60, 76]]],
    legs: LEGS_SIDE,
    prop: FLOOR_STAND,
  })),

  // C4 — 2-frame flip book: loaded crouch, then airborne with the knees
  // tucked and arms swung overhead (Jump Squat). The floor line is doing
  // the real work here — it's what makes the second frame read as "off the
  // ground" rather than just "shorter".
  jumpSquatFlow: animatedFigure([
    stick({
      head: [50, 34], neck: [50, 44], shoulders: [[39, 49], [61, 49]], hip: [50, 86],
      arms: [[[32, 62], [26, 80]], [[68, 62], [74, 80]]],
      legs: [[[32, 100], [28, 132]], [[68, 100], [72, 132]]],
      prop: GROUND(10, 90, 132),
    }),
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[39, 35], [61, 35]], hip: [50, 68],
      arms: [[[30, 22], [24, 8]], [[70, 22], [76, 8]]],
      legs: [[[38, 86], [44, 106]], [[62, 86], [56, 106]]],
      prop: GROUND(10, 90, 132),
    }),
  ]),

  // C5 — 2-frame flip book, side view: stepping back with the hips still
  // high, then the bottom of the lunge with the back knee low and the
  // front shin vertical (Reverse Lunge).
  reverseLungeFlow: animatedFigure([
    stick({
      head: [44, 20], headR: 7, neck: [48, 30], hip: [50, 78],
      arms: [[[56, 52], [52, 74]]],
      legs: [[[62, 104], [66, 133]], [[34, 106], [20, 133]]],
      prop: GROUND(8, 94, 133),
    }),
    stick({
      head: [44, 36], headR: 7, neck: [48, 46], hip: [50, 92],
      arms: [[[58, 66], [56, 88]]],
      legs: [[[72, 98], [74, 133]], [[30, 124], [16, 133]]],
      prop: GROUND(8, 94, 133),
    }),
  ]),

  // C6 — standing, elbows lifted out to shoulder height in a goalpost
  // shape (Elbow Lift Hold).
  armsGoalpost: svg(stick({
    ...STAND_FRONT,
    arms: [[[28, 34], [26, 16]], [[72, 34], [74, 16]]],
    legs: LEGS_FRONT,
    prop: FLOOR_STAND,
  })),

  // C7 — standing, one hand reaching across to the opposite collarbone
  // with the head tilted up and away over that shoulder (Collarbone
  // Look-Up). The neck line keeps the tilted head visibly attached, which
  // the previous version of this figure didn't.
  collarboneLookUp: svg(stick({
    head: [59, 18], neck: [50, 30], shoulders: [[38, 35], [62, 35]], hip: [50, 80],
    arms: [[[34, 54], [32, 74]], [[56, 48], [42, 40]]],
    legs: LEGS_FRONT,
    prop: FLOOR_STAND,
  })),

  // C8 — standing on one leg with the arms out level for control
  // (Single-Leg Balance Hold). The floor line is what makes the lifted
  // foot read as lifted.
  balanceArmsOut: svg(stick({
    ...STAND_FRONT,
    arms: [[[24, 33], [12, 32]], [[76, 33], [88, 32]]],
    legs: [[[50, 106], [50, 133]], [[68, 98], [80, 112]]],
    prop: FLOOR_STAND,
  })),

  // C9 — 3-frame flip book, side view: standing tall, hinging to
  // horizontal, then folded with the hands at the feet (Standing Toe
  // Touch). Legs stay straight throughout — that's the whole difference
  // from squatFoldFlow below, which bends them. Hips and legs are
  // identical across all three frames so only the torso moves.
  toeTouchFlow: animatedFigure([
    stick({
      head: [36, 18], headR: 7, neck: [40, 28], hip: [40, 80],
      arms: [[[44, 52], [46, 74]]],
      legs: [[[38, 106], [36, 133]], [[44, 106], [43, 133]]],
      prop: GROUND(8, 92, 133),
    }),
    stick({
      head: [83, 64], headR: 7, neck: [74, 70], hip: [40, 80],
      arms: [[[76, 86], [74, 102]]],
      legs: [[[38, 106], [36, 133]], [[44, 106], [43, 133]]],
      prop: GROUND(8, 92, 133),
    }),
    stick({
      head: [57, 122], headR: 7, neck: [52, 112], hip: [42, 80],
      arms: [[[56, 124], [50, 133]]],
      legs: [[[38, 106], [36, 133]], [[44, 106], [43, 133]]],
      prop: GROUND(8, 92, 133),
    }),
  ]),

  // C10 — 3-frame flip book, side view: standing, folded with the hands
  // planted and the legs straight, then the knees bending underneath into
  // a deep squat without the hands leaving the floor (Squat Fold).
  squatFoldFlow: animatedFigure([
    stick({
      head: [36, 18], headR: 7, neck: [40, 28], hip: [40, 80],
      arms: [[[44, 52], [46, 74]]],
      legs: [[[38, 106], [36, 133]], [[44, 106], [43, 133]]],
      prop: GROUND(8, 92, 133),
    }),
    stick({
      head: [57, 122], headR: 7, neck: [52, 112], hip: [42, 80],
      arms: [[[56, 124], [50, 133]]],
      legs: [[[38, 106], [36, 133]], [[44, 106], [43, 133]]],
      prop: GROUND(8, 92, 133),
    }),
    stick({
      head: [58, 68], headR: 7, neck: [50, 78], hip: [40, 108],
      arms: [[[60, 96], [64, 131]]],
      legs: [[[70, 100], [62, 132]], [[62, 104], [50, 132]]],
      prop: GROUND(8, 92, 133),
    }),
  ]),

  // C11 — 2-frame flip book: a wide squat held byte-identical across both
  // frames while the torso swings from a forward, hands-down lean up into
  // a full rotation with one arm reaching for the ceiling (Squat and
  // Twist).
  squatTwistFlow: animatedFigure([
    stick({
      head: [50, 62], neck: [50, 72], shoulders: [[40, 76], [60, 76]], hip: [50, 108],
      arms: [[[36, 94], [38, 114]], [[64, 94], [62, 114]]],
      legs: [[[26, 104], [30, 132]], [[74, 104], [70, 132]]],
      prop: GROUND(8, 92, 132),
    }),
    stick({
      head: [58, 62], neck: [52, 72], shoulders: [[43, 77], [61, 73]], hip: [50, 108],
      arms: [[[38, 95], [36, 113]], [[70, 56], [78, 40]]],
      legs: [[[26, 104], [30, 132]], [[74, 104], [70, 132]]],
      prop: GROUND(8, 92, 132),
    }),
  ]),

  // C12 — side view, up on the balls of the feet with a clear gap between
  // the heels and the floor line (Calf Raises). The range is too small to
  // animate meaningfully, so this shows the top position and lets the
  // floor line carry the "raised" part. `extra` draws the two feet, angled
  // down to toes still in contact.
  calfRaise: svg(stick({
    head: [46, 18], headR: 7, neck: [50, 28], hip: [50, 80],
    arms: [[[54, 52], [56, 74]]],
    legs: [[[46, 104], [45, 122]], [[52, 104], [51, 122]]],
    prop: GROUND(10, 90, 133),
    extra: BONE(45, 122, 34, 133, W.foot[0], W.foot[1])
      + BONE(51, 122, 40, 133, W.foot[0], W.foot[1]),
  })),

  // C13 — standing, one leg stepped behind AND across the other so the
  // shins cross, which is the only thing separating this from every other
  // lunge in the file (Curtsy Lunge).
  curtsyLunge: svg(stick({
    head: [50, 17], neck: [50, 28], shoulders: [[38, 33], [62, 33]], hip: [50, 78],
    arms: [[[36, 52], [32, 74]], [[64, 52], [68, 74]]],
    legs: [[[42, 104], [40, 133]], [[64, 102], [30, 130]]],
    prop: FLOOR_STAND,
  })),

  // --- Ground / mat ---

  // C14 — side view, seated on the floor with the knees up and the arms
  // folded across the chest, deliberately nowhere near the ground — the
  // starting position for standing up without using your hands
  // (Sit-to-Stand, No Hands).
  sitToStand: svg(stick({
    head: [44, 62], headR: 7, neck: [40, 72], hip: [34, 124],
    arms: [[[54, 84], [34, 90]]],
    legs: [[[68, 90], [74, 130]]],
    prop: GROUND(8, 92, 131),
  })),

  // C15 — side view, one straight diagonal from head to heels held up by a
  // vertical support arm, hand and foot both on the floor line (Plank
  // Hold). The base for most of the face-down work below.
  plank: svg(stick(PLANK)),

  // C16 — 2-frame flip book on the plank base: straight-armed at the top,
  // then lower with the elbow bent back alongside the ribs (Push-Up).
  pushUpFlow: animatedFigure([
    stick(PLANK),
    stick({
      head: [16, 66], headR: 7, neck: [24, 72], hip: [58, 92],
      arms: [[[32, 92], [24, 110]]],
      legs: [[[76, 101], [92, 110]]],
      prop: GROUND(8, 98, 112),
    }),
  ]),

  // C17 — plank with one knee driven up under the torso (Mountain
  // Climber).
  mountainClimber: svg(stick({
    head: [16, 52], headR: 7, neck: [24, 58], hip: [58, 84],
    arms: [[[24, 84], [24, 110]]],
    legs: [[[76, 97], [92, 110]], [[40, 78], [34, 94]]],
    prop: GROUND(8, 98, 112),
  })),

  // C18 — 3-frame flip book, all sharing the same kneeling-lunge base and
  // the same planted supporting arm: hand down, mid-rise, then fully
  // rotated with the free arm reaching for the ceiling (World's Greatest
  // Stretch). Showing the rotation reads far better than any single frame
  // of it.
  worldsGreatestFlow: animatedFigure([
    stick({
      head: [58, 55], headR: 7, neck: [54, 64], hip: [46, 90],
      arms: [[[58, 84], [62, 130]], [[64, 82], [68, 130]]],
      legs: [[[72, 92], [76, 132]], [[26, 120], [10, 130]]],
      prop: GROUND(6, 96, 132),
    }),
    stick({
      head: [56, 48], headR: 7, neck: [52, 58], hip: [46, 90],
      arms: [[[58, 84], [62, 130]], [[66, 62], [78, 52]]],
      legs: [[[72, 92], [76, 132]], [[26, 120], [10, 130]]],
      prop: GROUND(6, 96, 132),
    }),
    stick({
      head: [56, 42], headR: 7, neck: [50, 54], hip: [46, 90],
      arms: [[[58, 84], [62, 130]], [[64, 36], [76, 16]]],
      legs: [[[72, 92], [76, 132]], [[26, 120], [10, 130]]],
      prop: GROUND(6, 96, 132),
    }),
  ]),

  // C19 — side view, back knee down and that shin propped straight up
  // against a wall behind, hips sunk forward (Couch Stretch). The wall is
  // drawn in because the exaggerated shin angle only makes sense once you
  // can see what it's leaning on.
  couchStretch: svg(stick({
    head: [50, 42], headR: 7, neck: [54, 54], hip: [58, 102],
    arms: [[[48, 76], [36, 96]]],
    legs: [[[30, 102], [30, 132]], [[78, 130], [84, 101]]],
    prop: PROP('M86 20 V132') + GROUND(6, 90, 132),
  })),

  // C20 — side view tabletop (knees down, unlike plank), opposite arm
  // reaching forward and opposite leg reaching back in one long line
  // (Bird Dog).
  // Thigh and shin are kept to roughly equal lengths: drawn from a high hip
  // the thigh becomes one long post to the floor with a stub of a shin, and
  // the whole figure reads as a table rather than as someone kneeling.
  birdDog: svg(stick({
    head: [19, 83], headR: 7, neck: [32, 84], hip: [64, 86],
    arms: [[[30, 103], [28, 122]], [[20, 69], [6, 60]]],
    legs: [[[62, 119], [92, 123]], [[80, 72], [96, 58]]],
    prop: GROUND(6, 96, 124),
  })),

  // C21 — side view, shoulders resting on the floor with shoulder, hip and
  // knee in one unbroken line and the shin dropping to a flat foot (Glute
  // Bridge) — the straight line IS the exercise, so it's drawn as one.
  gluteBridge: svg(stick({
    head: [14, 108], headR: 7, neck: [24, 104], hip: [58, 86],
    arms: [[[16, 116], [5, 120]]],
    legs: [[[86, 76], [90, 120]]],
    prop: GROUND(6, 96, 124),
  })),

  // C22 — side view, lying on the back with one arm and the opposite leg
  // reaching away while the other pair stays stacked over the torso (Dead
  // Bug).
  deadBug: svg(stick({
    head: [14, 96], headR: 7, neck: [22, 94], hip: [58, 96],
    arms: [[[24, 74], [24, 56]], [[16, 80], [6, 70]]],
    legs: [[[58, 64], [72, 60]], [[78, 94], [94, 96]]],
    prop: GROUND(6, 96, 108),
  })),

  // C23 — propped on one forearm with the body in a straight line from
  // head to heels and the top arm reaching for the ceiling (Side Plank
  // Hold). The forearm runs along the floor rather than straight down,
  // which is what separates it from a plank.
  sidePlank: svg(stick({
    head: [18, 48], headR: 7, neck: [26, 54], hip: [62, 88],
    arms: [[[24, 118], [6, 116]], [[30, 36], [34, 16]]],
    legs: [[[78, 102], [94, 120]]],
    prop: GROUND(6, 96, 124),
  })),

  // C24 — side view, hips sitting back on the heels with the torso folded
  // all the way forward and the arms stretched out along the floor
  // (Kneeling Rest). A calisthenics-side twin of the yoga `kneelingFold`,
  // kept separate so editing one can't disturb the other.
  kneelingRest: svg(stick({
    head: [22, 110], headR: 7, neck: [34, 104], hip: [76, 82],
    arms: [[[20, 114], [6, 116]]],
    legs: [[[78, 116], [93, 112]]],
    prop: GROUND(6, 96, 124),
  })),

  // C25 — seated with the soles of the feet together and the knees dropped
  // wide (Butterfly Rock) — the diamond the legs make is the whole shape,
  // and it's why this can't reuse the yoga `seatedNeutral`, which is
  // cross-legged.
  butterflySit: svg(stick({
    head: [50, 30], neck: [50, 40], shoulders: [[40, 45], [60, 45]], hip: [50, 88],
    arms: [[[34, 58], [42, 84]], [[66, 58], [58, 84]]],
    legs: [[[22, 96], [48, 106]], [[78, 96], [52, 106]]],
    prop: GROUND(8, 92, 110),
  })),

  // C26 — 2-frame flip book on the plank base with the arms locked
  // straight the whole time: shoulder blades pinched together so the chest
  // sinks between them, then pushed apart so the upper back rounds up
  // (Scapular Push-Up). The only thing that changes is shoulder height,
  // because that's the only thing that moves.
  scapPushUpFlow: animatedFigure([
    stick({
      head: [15, 64], headR: 7, neck: [24, 70], hip: [58, 86],
      arms: [[[24, 90], [24, 110]]],
      legs: [[[76, 98], [92, 110]]],
      prop: GROUND(8, 98, 112),
    }),
    stick({
      head: [15, 48], headR: 7, neck: [24, 54], hip: [58, 84],
      arms: [[[24, 82], [24, 110]]],
      legs: [[[76, 97], [92, 110]]],
      prop: GROUND(8, 98, 112),
    }),
  ]),

  // C27 — 2-frame flip book seen from directly overhead, face down on a
  // mat, arms bent in a "W": one forearm rotates up toward the ear, then
  // the other (Prone W-Rotation). Overhead because the exercise is about
  // arm shape and rotation relative to the body, which a side view flattens
  // to nothing; the mat outline is what says "lying down", not "standing".
  proneWFlow: animatedFigure([
    stick({
      head: [50, 22], neck: [50, 32], shoulders: [[36, 38], [64, 38]], hip: [50, 92],
      arms: [[[24, 46], [28, 18]], [[76, 46], [72, 38]]],
      legs: [[[44, 112], [42, 132]], [[56, 112], [58, 132]]],
      prop: MAT,
    }),
    stick({
      head: [50, 22], neck: [50, 32], shoulders: [[36, 38], [64, 38]], hip: [50, 92],
      arms: [[[24, 46], [28, 38]], [[76, 46], [72, 18]]],
      legs: [[[44, 112], [42, 132]], [[56, 112], [58, 132]]],
      prop: MAT,
    }),
  ]),

  // C28 — 2-frame flip book alternating a bent-elbow "W" with a
  // straight-arm overhead "Y" (W-Slide) — the exercise is literally named
  // for sliding between these two shapes.
  wSlideFlow: animatedFigure([
    stick({
      ...STAND_FRONT,
      arms: [[[28, 34], [26, 16]], [[72, 34], [74, 16]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
    }),
    stick({
      ...STAND_FRONT,
      arms: [[[30, 18], [18, 6]], [[70, 18], [82, 6]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
    }),
  ]),

  // C29 — 2-frame flip book, side view: the elbow pinned at rib height
  // with the forearm forward (the "L"), then driven straight back past the
  // ribs as the shoulder blade squeezes (L-Pull). Side-on because the pull
  // travels backwards, which a front view can't show at all.
  lPullFlow: animatedFigure([
    stick({
      head: [46, 18], headR: 7, neck: [50, 28], hip: [48, 80],
      arms: [[[50, 52], [72, 52]]],
      legs: LEGS_SIDE,
      prop: FLOOR_STAND,
    }),
    stick({
      head: [46, 18], headR: 7, neck: [50, 28], hip: [48, 80],
      arms: [[[34, 54], [58, 50]]],
      legs: LEGS_SIDE,
      prop: FLOOR_STAND,
    }),
  ]),

  // C30 — standing, arms straight out to the sides in a level T
  // (T-Raise). Ordinary hip-width legs, NOT the wide warrior stance of the
  // yoga `standingArmsOutT` — this is a shoulder-blade squeeze, and its
  // cue never mentions a stance at all.
  standingTArms: svg(stick({
    ...STAND_FRONT,
    arms: [[[24, 33], [10, 33]], [[76, 33], [90, 33]]],
    legs: LEGS_FRONT,
    prop: FLOOR_STAND,
  })),

  // C31 — standing, straight arms overhead and splayed wider than the head
  // into a clear Y (Y-Raise). Deliberately wider than the yoga
  // `standingArmsUp`, whose arms sit close enough to the head to read as a
  // goalpost — which would make this indistinguishable from W-Slide.
  standingYArms: svg(stick({
    ...STAND_FRONT,
    arms: [[[28, 20], [18, 6]], [[72, 20], [82, 6]]],
    legs: LEGS_FRONT,
    prop: FLOOR_STAND,
  })),

  // C32 — 2-frame flip book: an L-sit (sitting tall, legs straight ahead,
  // hands planted by the hips), then the lift itself — hips pressed up so
  // shoulders, hips and knees make a tabletop (Crab Lift).
  crabLiftFlow: animatedFigure([
    stick({
      head: [28, 58], headR: 7, neck: [34, 66], hip: [34, 104],
      arms: [[[26, 86], [22, 120]]],
      legs: [[[62, 108], [92, 110]]],
      prop: GROUND(6, 96, 124),
    }),
    stick({
      head: [24, 66], headR: 7, neck: [32, 74], hip: [60, 80],
      arms: [[[22, 96], [16, 120]]],
      legs: [[[84, 84], [88, 120]]],
      prop: GROUND(6, 96, 124),
    }),
  ]),

  // C33 — seated with one leg folded in front and the other folded back on
  // the opposite side, hands planted beside the hips to press up (Z-Sit
  // Lift). Deliberately asymmetric — that asymmetry is the "Z".
  zSit: svg(stick({
    head: [48, 30], neck: [48, 40], shoulders: [[38, 45], [58, 45]], hip: [50, 88],
    arms: [[[30, 60], [26, 92]], [[70, 60], [76, 92]]],
    legs: [[[22, 94], [52, 104]], [[78, 92], [62, 118]]],
    prop: GROUND(8, 94, 122),
  })),

  // C34 — 2-frame flip book seen from overhead: both knees at 90 degrees
  // pointing one way, then rotated over to point the other (90/90 Switch).
  // The switch is the exercise, so it has to move; the torso stays fixed.
  ninetyNinetyFlow: animatedFigure([
    stick({
      head: [50, 24], neck: [50, 34], shoulders: [[38, 40], [62, 40]], hip: [50, 74],
      arms: [[[32, 54], [28, 74]], [[68, 54], [72, 74]]],
      legs: [[[80, 86], [50, 104]], [[30, 96], [34, 126]]],
      prop: MAT,
    }),
    stick({
      head: [50, 24], neck: [50, 34], shoulders: [[38, 40], [62, 40]], hip: [50, 74],
      arms: [[[32, 54], [28, 74]], [[68, 54], [72, 74]]],
      legs: [[[20, 86], [50, 104]], [[70, 96], [66, 126]]],
      prop: MAT,
    }),
  ]),

  // C35 — 2-frame flip book, side view: the bear position (hands and feet
  // down, knees hovering), then one leg threaded through underneath to the
  // opposite side as the hips turn open and the free arm lifts (Beast
  // Kickthrough).
  beastKickthroughFlow: animatedFigure([
    stick({
      head: [16, 54], headR: 7, neck: [24, 58], hip: [66, 58],
      arms: [[[24, 86], [24, 116]]],
      legs: [[[68, 88], [74, 116]], [[60, 88], [54, 116]]],
      prop: GROUND(6, 96, 120),
    }),
    stick({
      head: [18, 58], headR: 7, neck: [26, 62], hip: [64, 74],
      arms: [[[26, 90], [26, 116]], [[24, 44], [18, 28]]],
      legs: [[[74, 96], [80, 118]], [[52, 96], [30, 116]]],
      prop: GROUND(6, 96, 120),
    }),
  ]),

  // C36 — side view, lying face down with one leg swung high up and across
  // the body toward the opposite hand — the actual "scorpion" shape this
  // is named for (Scorpion Heel Taps).
  scorpionTwist: svg(stick({
    head: [16, 96], headR: 7, neck: [24, 94], hip: [62, 98],
    arms: [[[18, 104], [8, 110]]],
    legs: [[[80, 100], [94, 104]], [[70, 64], [44, 52]]],
    prop: GROUND(6, 96, 116),
  })),

  // C37 — 2-frame flip book seen from overhead: knees bent and squeezed
  // together, then allowed to fall open to the sides (Lying Knee Drops).
  // Symmetric — both knees move away from each other, which is what makes
  // it a different exercise from the wipers below and not just a
  // relabelled copy the way it used to be.
  kneeDropsFlow: animatedFigure([
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[45, 104], [45, 130]], [[55, 104], [55, 130]]],
      prop: MAT,
    }),
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[22, 100], [36, 128]], [[78, 100], [64, 128]]],
      prop: MAT,
    }),
  ]),

  // C38 — 2-frame flip book seen from overhead: both knees stay together
  // and sway to one side, then the other (Windshield Wipers). The
  // both-knees-same-direction motion is exactly what separates this from
  // kneeDropsFlow above.
  windshieldWiperFlow: animatedFigure([
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[26, 98], [40, 126]], [[34, 102], [48, 130]]],
      prop: MAT,
    }),
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[74, 98], [60, 126]], [[66, 102], [52, 130]]],
      prop: MAT,
    }),
  ]),

  // C39 — 2-frame flip book seen from overhead: one knee drawn in with the
  // opposite shoulder rotating toward it, then mirrored (Bicycle
  // Crunches). Overhead is the only view that shows the cross-body part,
  // which is the whole exercise.
  bicycleFlow: animatedFigure([
    stick({
      head: [50, 26], neck: [50, 36], shoulders: [[38, 40], [62, 48]], hip: [50, 84],
      arms: [[[30, 34], [42, 24]], [[68, 42], [58, 28]]],
      legs: [[[64, 96], [58, 120]], [[40, 106], [36, 132]]],
      prop: MAT,
    }),
    stick({
      head: [50, 26], neck: [50, 36], shoulders: [[38, 48], [62, 40]], hip: [50, 84],
      arms: [[[30, 42], [42, 28]], [[68, 34], [58, 24]]],
      legs: [[[36, 96], [42, 120]], [[60, 106], [64, 132]]],
      prop: MAT,
    }),
  ]),

  // C40 — 2-frame flip book, side view: lying flat with the arms overhead
  // and the legs long, then folded shut with the torso and legs lifting to
  // meet over the hips (Suitcase Crunches).
  suitcaseFlow: animatedFigure([
    stick({
      head: [14, 100], headR: 7, neck: [22, 98], hip: [56, 102],
      arms: [[[18, 80], [8, 68]]],
      legs: [[[74, 104], [92, 106]]],
      prop: GROUND(6, 96, 118),
    }),
    stick({
      head: [28, 70], headR: 7, neck: [36, 78], hip: [56, 104],
      arms: [[[40, 64], [50, 56]]],
      legs: [[[74, 74], [84, 56]]],
      prop: GROUND(6, 96, 118),
    }),
  ]),

  // C41 — 2-frame flip book, side view: seated in a reclined V with the
  // feet lifted, clasped hands swinging from one side to the other. Legs
  // and torso are held fixed across both frames so only the twist reads
  // (Russian Twists).
  // The seat sits ON the floor line. Floated clear of it the figure reads as
  // hovering in a crunch, and this exercise is defined by balancing on your
  // backside.
  russianTwistFlow: animatedFigure([
    stick({
      head: [28, 77], headR: 7, neck: [34, 88], hip: [50, 118],
      arms: [[[50, 96], [66, 100]]],
      legs: [[[76, 96], [90, 118]]],
      prop: GROUND(6, 96, 124),
    }),
    stick({
      head: [28, 77], headR: 7, neck: [34, 88], hip: [50, 118],
      arms: [[[26, 96], [14, 98]]],
      legs: [[[76, 96], [90, 118]]],
      prop: GROUND(6, 96, 124),
    }),
  ]),

  // C42 — 2-frame flip book on the plank base: both hands down, then the
  // near hand lifted across to the opposite shoulder while the hips stay
  // level (Shoulder Taps).
  shoulderTapFlow: animatedFigure([
    stick({
      head: [16, 52], headR: 7, neck: [24, 58], hip: [58, 84],
      arms: [[[24, 84], [24, 110]], [[32, 84], [34, 110]]],
      legs: [[[76, 97], [92, 110]]],
      prop: GROUND(8, 98, 112),
    }),
    stick({
      head: [16, 52], headR: 7, neck: [24, 58], hip: [58, 84],
      arms: [[[24, 84], [24, 110]], [[34, 74], [26, 62]]],
      legs: [[[76, 97], [92, 110]]],
      prop: GROUND(8, 98, 112),
    }),
  ]),

  // C43 — 2-frame flip book, side view: a low lunge held fixed while the
  // arm sweeps through a full arc — down and back near the floor, then
  // around and up overhead (Lunge Reach and Twist). A wider arc than
  // worldsGreatestFlow's single rotation, which stops at vertical.
  lungeReachFlow: animatedFigure([
    stick({
      head: [38, 42], headR: 7, neck: [44, 52], hip: [48, 84],
      arms: [[[30, 66], [16, 74]]],
      legs: [[[72, 94], [78, 132]], [[26, 110], [12, 128]]],
      prop: GROUND(6, 96, 132),
    }),
    stick({
      head: [42, 36], headR: 7, neck: [46, 48], hip: [48, 84],
      arms: [[[56, 26], [72, 10]]],
      legs: [[[72, 94], [78, 132]], [[26, 110], [12, 128]]],
      prop: GROUND(6, 96, 132),
    }),
  ]),

  // C44 — side view, kneeling with the hands down, the front foot planted
  // and the back knee resting while that foot's toes stay tucked under and
  // loaded (Toe Flexor Hold). `extra` draws the tuck itself — the tiny
  // detail the whole exercise is named for.
  toeFlexorHold: svg(stick({
    head: [66, 44], headR: 7, neck: [58, 52], hip: [40, 82],
    arms: [[[64, 74], [72, 124]]],
    legs: [[[56, 96], [64, 126]], [[26, 110], [10, 124]]],
    prop: GROUND(6, 96, 128),
    extra: BONE(10, 124, 17, 127, W.foot[0], W.foot[1]),
  })),

  // C45 — 2-frame flip book, side view tabletop: the spine sagging and the
  // head lifting (cow), then rounding up with the chin tucked (cat). Drawn
  // with a curved spine rather than a straight one, because the arch IS the
  // exercise — the yoga `tabletop` this used to borrow is a flat back that
  // never moves.
  catCowFlow: animatedFigure([
    stick({
      head: [18, 46], headR: 7, neck: [28, 54], hip: [66, 62], spineBow: 10,
      arms: [[[28, 88], [28, 120]]],
      legs: [[[66, 120], [82, 124]]],
      prop: GROUND(6, 96, 124),
    }),
    stick({
      head: [24, 68], headR: 7, neck: [30, 60], hip: [66, 58], spineBow: -12,
      arms: [[[28, 88], [28, 120]]],
      legs: [[[66, 120], [82, 124]]],
      prop: GROUND(6, 96, 124),
    }),
  ]),

  // C46 — side view, lower back pressed flat to the floor with the
  // shoulders and legs both hovering just off it, arms reaching past the
  // head (Hollow Body Hold). A hold, not a rep, so a single frame. Read
  // against supermanHold below: same shallow dish, but low, flat and with
  // the arms in line with the body.
  hollowBodyHold: svg(stick({
    head: [26, 84], headR: 7, neck: [34, 88], hip: [58, 110],
    arms: [[[24, 78], [10, 70]]],
    legs: [[[80, 96], [94, 80]]],
    prop: GROUND(6, 96, 116),
  })),

  // C62 - 2-frame flip book, side view: propped back on the hands with the
  // legs straight, swinging from just off the floor up past hip height (Leg
  // Raises). Everything above the hips is identical across both frames, so
  // the only thing that moves is what the exercise actually moves.
  legRaiseFlow: animatedFigure([
    stick({
      head: [24, 79], headR: 7, neck: [30, 90], hip: [46, 116],
      arms: [[[24, 104], [18, 120]]],
      legs: [[[70, 112], [94, 108]]],
      prop: GROUND(6, 96, 124),
    }),
    stick({
      head: [24, 79], headR: 7, neck: [30, 90], hip: [46, 116],
      arms: [[[24, 104], [18, 120]]],
      legs: [[[64, 96], [80, 74]]],
      prop: GROUND(6, 96, 124),
    }),
  ]),

  // C64 - 2-frame flip book seen from overhead: legs straight, swung together
  // to one side of an object on the floor and then the other (Two-Leg Side
  // Sweep). Overhead because a side view cannot show lateral travel at all —
  // it is the whole exercise. Straight legs are what separate this from
  // windshieldWiperFlow above, which sweeps with the knees bent.
  twoLegSweepFlow: animatedFigure([
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[38, 102], [26, 126]], [[44, 104], [32, 128]]],
      prop: MAT + PROP('M44 116 H56 V126 H44 Z'),
    }),
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[62, 102], [74, 126]], [[56, 104], [68, 128]]],
      prop: MAT + PROP('M44 116 H56 V126 H44 Z'),
    }),
  ]),

  // C65 - 2-frame flip book seen from overhead: one straight leg crosses over
  // the object while the other stays put, then they swap (Single-Leg Side
  // Sweep). The stationary leg is the point — it is what tells this apart from
  // twoLegSweepFlow, where both legs travel together.
  singleLegSweepFlow: animatedFigure([
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[60, 102], [72, 126]], [[46, 104], [44, 130]]],
      prop: MAT + PROP('M44 116 H56 V126 H44 Z'),
    }),
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[38, 36], [62, 36]], hip: [50, 78],
      arms: [[[30, 50], [22, 70]], [[70, 50], [78, 70]]],
      legs: [[[40, 102], [28, 126]], [[54, 104], [56, 130]]],
      prop: MAT + PROP('M44 116 H56 V126 H44 Z'),
    }),
  ]),

  // C63 - 2-frame flip book, side view: the hips lift high into an
  // upside-down V, then roll forward and sink low as the chest opens (Down-Up
  // Dogs). The hands stay planted in the same spot across both frames, which
  // is what makes this read as the body rolling over them rather than as two
  // unrelated poses. Limb lengths are held equal frame to frame so nothing
  // appears to grow or shrink mid-flow.
  downUpDogFlow: animatedFigure([
    stick({
      head: [18, 100], headR: 7, neck: [30, 92], hip: [58, 68],
      arms: [[[23, 108], [16, 124]]],
      legs: [[[67, 96], [76, 124]]],
      prop: GROUND(6, 96, 126),
    }),
    stick({
      head: [16, 66], headR: 7, neck: [14, 80], hip: [38, 108],
      arms: [[[12, 98], [10, 116]]],
      legs: [[[67, 115], [96, 122]]],
      prop: GROUND(6, 96, 126),
    }),
  ]),

  // C47 — side view, face down with the chest clearly lifted, both arms
  // reaching forward and the legs raised behind, only the hips touching
  // down (Superman Hold). The mirror of hollowBodyHold: the head sits much
  // higher off the floor and both arms are visible out front, which is what
  // stops the two from reading as the same picture.
  supermanHold: svg(stick({
    head: [20, 64], headR: 7, neck: [30, 74], hip: [62, 102],
    arms: [[[20, 66], [6, 60]], [[24, 58], [10, 50]]],
    legs: [[[80, 92], [94, 76]]],
    prop: GROUND(6, 96, 116),
  })),

  // C48 — side view, hands and feet down with the knees bent and hovering
  // just off the floor line, one arm reaching to suggest the crawl (Bear
  // Crawl). A held "ready" position rather than an animated crawl.
  bearCrawl: svg(stick({
    head: [16, 54], headR: 7, neck: [24, 58], hip: [66, 58],
    arms: [[[24, 86], [24, 116]], [[34, 80], [42, 112]]],
    legs: [[[68, 88], [74, 116]], [[60, 88], [54, 116]]],
    prop: GROUND(6, 96, 120),
  })),

  // C49 — 3-frame flip book built from shapes used elsewhere in this file,
  // because a burpee actually is a squat, a plank and a jump chained
  // together. All three share one floor line at the same height so the
  // ground doesn't jump around between frames (Burpee). The crouch and the
  // plank also face the same way - mirrored, the figure appears to spin 180
  // degrees mid-rep, which is the one thing a burpee never does.
  burpeeFlow: animatedFigure([
    stick({
      head: [58, 68], headR: 7, neck: [50, 78], hip: [40, 108],
      arms: [[[60, 96], [64, 131]]],
      legs: [[[70, 100], [62, 132]], [[62, 104], [50, 132]]],
      prop: GROUND(8, 96, 132),
    }),
    stick({
      head: [84, 72], headR: 7, neck: [76, 78], hip: [42, 104],
      arms: [[[76, 104], [76, 130]]],
      legs: [[[24, 117], [8, 130]]],
      prop: GROUND(8, 96, 132),
    }),
    stick({
      head: [50, 20], neck: [50, 30], shoulders: [[39, 35], [61, 35]], hip: [50, 68],
      arms: [[[30, 22], [24, 8]], [[70, 22], [76, 8]]],
      legs: [[[38, 86], [44, 106]], [[62, 86], [56, 106]]],
      prop: GROUND(8, 96, 132),
    }),
  ]),

  // --- Needs a chair, wall, towel, book, or bar ---

  // C50 — side view, hands on the edge of a chair behind, hips hanging in
  // front of it and the legs extended forward (Chair Tricep Dip).
  chairDip: svg(stick({
    head: [44, 58], headR: 7, neck: [50, 66], hip: [56, 98],
    arms: [[[58, 82], [68, 92]]],
    legs: [[[34, 112], [12, 128]]],
    prop: PROP('M62 92 H96 M64 92 V132 M94 92 V132') + GROUND(6, 98, 132),
  })),

  // C51 — standing with one foot up on a step, ready to drive through that
  // heel (Chair Step-Up).
  chairStepUp: svg(stick({
    head: [46, 17], neck: [46, 28], shoulders: [[34, 33], [58, 33]], hip: [46, 80],
    arms: [[[30, 52], [28, 74]], [[62, 52], [64, 74]]],
    legs: [[[40, 106], [38, 132]], [[64, 92], [68, 106]]],
    prop: PROP('M58 106 H94 M60 106 V132 M92 106 V132') + GROUND(4, 96, 132),
  })),

  // C52 — front lunge with the top of the back foot resting on a step
  // behind (Chair Split Squat).
  chairSplitSquat: svg(stick({
    head: [36, 24], headR: 7, neck: [38, 34], shoulders: [[28, 38], [48, 38]], hip: [42, 86],
    arms: [[[22, 58], [20, 80]], [[54, 58], [56, 80]]],
    legs: [[[28, 108], [24, 132]], [[64, 100], [78, 102]]],
    prop: PROP('M66 104 H96 M68 104 V132 M94 104 V132') + GROUND(4, 98, 132),
  })),

  // C53 — back flat against a wall with the thighs horizontal and the
  // shins vertical, an invisible chair (Wall Sit Hold).
  wallSit: svg(stick({
    head: [78, 32], headR: 7, neck: [80, 42], hip: [80, 84],
    arms: [[[68, 62], [58, 84]]],
    legs: [[[44, 86], [44, 132]], [[50, 90], [50, 132]]],
    prop: PROP('M88 12 V132') + GROUND(6, 94, 132),
  })),

  // C54 — standing tall with a book balanced flat on the head (Book
  // Balance Walk).
  bookWalk: svg(stick({
    head: [50, 22], neck: [50, 33], shoulders: [[38, 38], [62, 38]], hip: [50, 84],
    arms: [[[40, 58], [36, 80]], [[60, 58], [64, 80]]],
    legs: [[[45, 108], [43, 133]], [[55, 108], [57, 133]]],
    prop: PROP('M38 5 H62 V12 H38 Z') + FLOOR_STAND,
  })),

  // C55 — standing with both arms overhead gripping a towel held taut, the
  // starting position before pulling it down behind the head (Towel High
  // Pull Down).
  towelPullOverhead: svg(stick({
    head: [50, 20], neck: [50, 31], shoulders: [[38, 36], [62, 36]], hip: [50, 82],
    arms: [[[32, 24], [26, 10]], [[68, 24], [74, 10]]],
    legs: [[[45, 108], [43, 133]], [[55, 108], [57, 133]]],
    prop: FLOOR_STAND,
    extra: TOWEL(26, 10, 74, 10),
  })),

  // C56 — standing with straight arms holding a towel taut out in front at
  // shoulder height (Towel Front Raise).
  towelPull: svg(stick({
    ...STAND_FRONT,
    arms: [[[34, 42], [26, 54]], [[66, 42], [74, 54]]],
    legs: LEGS_FRONT,
    prop: FLOOR_STAND,
    extra: TOWEL(26, 54, 74, 54),
  })),

  // C57 — 3-frame flip book: the taut towel traced through a big slow
  // circle, low on one side, overhead, then low on the other (Towel Arm
  // Circles). It shared a static figure with Towel Front Raise before,
  // which made the two indistinguishable and showed no circle at all.
  towelCirclesFlow: animatedFigure([
    stick({
      ...STAND_FRONT,
      arms: [[[32, 44], [20, 58]], [[62, 44], [52, 70]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
      extra: TOWEL(20, 58, 52, 70, 5),
    }),
    stick({
      ...STAND_FRONT,
      arms: [[[34, 24], [26, 10]], [[66, 24], [74, 10]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
      extra: TOWEL(26, 10, 74, 10),
    }),
    stick({
      ...STAND_FRONT,
      arms: [[[38, 44], [48, 70]], [[68, 44], [80, 58]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
      extra: TOWEL(48, 70, 80, 58, 5),
    }),
  ]),

  // C58 — 2-frame flip book: the taut towel held up and out to one side,
  // then pulled down and across the body toward the opposite hip (Towel
  // Straight-Arm Pull). The pull travels from one place to another, so a
  // single static frame could never show it.
  towelPullAcrossFlow: animatedFigure([
    stick({
      ...STAND_FRONT,
      arms: [[[42, 26], [46, 10]], [[68, 28], [84, 18]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
      extra: TOWEL(46, 10, 84, 18, 5),
    }),
    stick({
      ...STAND_FRONT,
      arms: [[[32, 44], [22, 62]], [[54, 50], [44, 78]]],
      legs: LEGS_FRONT,
      prop: FLOOR_STAND,
      extra: TOWEL(22, 62, 44, 78, 5),
    }),
  ]),

  // C59 — hanging from an overhead bar with straight arms and the
  // shoulders relaxed, feet clear of the floor (Dead Hang). The bar is
  // drawn as scenery so it doesn't read as part of the arms.
  deadHang: svg(stick({
    head: [50, 36], neck: [50, 46], shoulders: [[38, 48], [62, 48]], hip: [50, 92],
    arms: [[[36, 30], [36, 14]], [[64, 30], [64, 14]]],
    legs: [[[46, 114], [44, 134]], [[54, 114], [56, 134]]],
    prop: PROP('M16 12 H84 M20 12 V4 M80 12 V4'),
  })),

  // C60 — 2-frame flip book on the same bar: the straight-armed hang, then
  // pulled up with the elbows driven down and back and the chin at the bar
  // (Pull-Up).
  pullUpFlow: animatedFigure([
    stick({
      head: [50, 36], neck: [50, 46], shoulders: [[38, 48], [62, 48]], hip: [50, 92],
      arms: [[[36, 30], [36, 14]], [[64, 30], [64, 14]]],
      legs: [[[46, 114], [44, 134]], [[54, 114], [56, 134]]],
      prop: PROP('M16 12 H84 M20 12 V4 M80 12 V4'),
    }),
    stick({
      head: [50, 28], neck: [50, 38], shoulders: [[38, 40], [62, 40]], hip: [50, 84],
      arms: [[[28, 34], [36, 14]], [[72, 34], [64, 14]]],
      legs: [[[46, 106], [44, 128]], [[54, 106], [56, 128]]],
      prop: PROP('M16 12 H84 M20 12 V4 M80 12 V4'),
    }),
  ]),

  // C61 — seen from overhead, on hands and knees with the knees spread
  // wide and the hips rocking back (Frog Sit Opener). Overhead because
  // "knees wide" is the entire exercise and a side view hides it
  // completely.
  frogStretch: svg(stick({
    head: [50, 20], neck: [50, 30], shoulders: [[36, 36], [64, 36]], hip: [50, 76],
    arms: [[[30, 26], [26, 12]], [[70, 26], [74, 12]]],
    legs: [[[16, 86], [20, 116]], [[84, 86], [80, 116]]],
    prop: MAT,
  })),
};
