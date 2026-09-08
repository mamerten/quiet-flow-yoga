// Simple, original stick-figure illustrations for yoga poses.
// Each is a self-contained inline SVG (viewBox 0 0 100 140), stroke=currentColor.
// A small shared set of "template" body shapes is reused across poses that look
// similar (this is a low-detail visual reference, not anatomical art).

const STROKE = 'stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const HEAD = (cx, cy, r = 8) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`;
const LINE = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${STROKE}/>`;
const POLY = (pts) => `<polyline points="${pts}" ${STROKE}/>`;

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

window.FIGURES = {
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

  // T3b — standing, arms out to a T, ordinary hip-width standing legs —
  // NOT the wide warrior-style stance of standingArmsOutT above, which
  // doesn't belong on T-Raise (a shoulder-blade squeeze, not a wide-
  // legged pose — its cue never mentions a stance at all).
  standingTArms: svg(
    HEAD(50, 16) +
    LINE(50, 24, 50, 74) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 10, 30) +
    LINE(62, 30, 90, 30) +
    LINE(50, 74, 40, 132) +
    LINE(50, 74, 60, 132)
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

  // T4b — 3-frame flip book: standing tall, hinging forward partway, then
  // folded all the way down reaching for the toes (Calisthenics' Standing
  // Toe Touch — a distinct entry from standingForwardFold above so
  // editing one doesn't affect the other, even though the final frame
  // matches it). Legs stay straight throughout, unlike squatFoldFlow.
  toeTouchFlow: animatedFigure([
    // standing
    HEAD(50, 18) +
      LINE(50, 26, 50, 74) +
      LINE(50, 30, 40, 55) +
      LINE(50, 30, 60, 55) +
      LINE(50, 74, 40, 132) +
      LINE(50, 74, 60, 132),
    // hinging, legs still straight
    HEAD(48, 90, 7) +
      LINE(50, 74, 48, 98) +
      LINE(40, 100, 56, 100) +
      LINE(40, 100, 37, 118) +
      LINE(56, 100, 58, 118) +
      LINE(50, 74, 40, 132) +
      LINE(50, 74, 60, 132),
    // full fold, reaching the toes
    HEAD(46, 112, 7) +
      LINE(50, 74, 48, 100) +
      LINE(40, 102, 56, 102) +
      LINE(40, 102, 35, 128) +
      LINE(56, 102, 58, 128) +
      LINE(50, 74, 40, 132) +
      LINE(50, 74, 60, 132),
  ]),

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

  // T5b — plank, side view: one straight diagonal line from head to
  // heels, held up by a single vertical support arm (Plank Hold,
  // Scapular Push-Up — anything done with straight arms, elevated).
  plank: svg(
    HEAD(14, 58, 7) +
    LINE(21, 60, 88, 68) +
    LINE(21, 60, 21, 92) +
    LINE(88, 68, 96, 76)
  ),

  // T5c — 2-frame flip book: the same straight-line-off-the-floor shape
  // as `plank`, alternating with a lower, bent-elbow shape — the actual
  // up/down motion of a rep (Push-Up), rather than either single frame
  // on its own.
  pushUpFlow: animatedFigure([
    // up (straight support arm, same shape as `plank`)
    HEAD(14, 58, 7) +
      LINE(21, 60, 88, 68) +
      LINE(21, 60, 21, 92) +
      LINE(88, 68, 96, 76),
    // down (bent, flared elbow, lower overall)
    HEAD(13, 72, 7) +
      LINE(20, 76, 88, 84) +
      POLY('20,76 12,90 20,102') +
      LINE(88, 84, 96, 92),
  ]),

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

  // T7b — kneeling lunge with the back shin propped straight up behind,
  // foot high near the hip — the exaggerated deep knee bend that's the
  // whole point of a Couch Stretch, distinct from lungeArmsUp's ordinary
  // low lunge with the back leg simply stepped back and straight.
  couchStretch: svg(
    HEAD(50, 25) +
    LINE(50, 32, 50, 75) +
    LINE(50, 32, 68, 85) +
    POLY('50,75 70,90 78,118') +
    POLY('50,75 30,95 15,55')
  ),

  // T8 — kneeling, sitting back on the heels with the torso folded all
  // the way forward and one arm stretched out along the floor (Child's
  // Pose, Kneeling Rest) — a clear grounded base (hips down near the
  // heels) with the back arching up and over to a head that's close to
  // the floor, rather than a shape that reads as cut off partway through.
  kneelingFold: svg(
    LINE(25, 100, 15, 125) +
    LINE(25, 100, 35, 125) +
    LINE(25, 100, 55, 75) +
    LINE(55, 75, 68, 98) +
    HEAD(72, 100, 7) +
    LINE(55, 75, 92, 85)
  ),

  // T9 — seated, cross-legged (Easy Seat, Forward Fold, Twist, Butterfly, Cow Face)
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

  // C33 — lying on the back at the top of a bridge: shoulders resting on
  // the floor, one straight unbroken line all the way from shoulder
  // through the hip to the knee (the actual point of a bridge — torso and
  // thighs in one line), then the shin dropping straight down to a foot
  // flat on the floor (Glute Bridge) — distinct from lyingBack, which
  // bends sharply at the hip and doesn't read as a bridge.
  gluteBridge: svg(
    HEAD(12, 90, 7) +
    LINE(18, 92, 78, 52) +
    LINE(78, 52, 85, 95) +
    LINE(18, 92, 3, 88)
  ),

  // C32 — 2-frame flip book: an L-sit (sitting tall, legs straight out in
  // front, hands planted by the hips), then the crab-lift position itself
  // (hands planted behind, hips pressed up into a tabletop bridge, knees
  // bent, feet flat ahead) — the starting point and the actual lift, not
  // just one or the other (Crab Lift).
  crabLiftFlow: animatedFigure([
    // L-sit
    HEAD(25, 60, 7) +
      LINE(25, 68, 25, 90) +
      LINE(25, 68, 15, 92) +
      LINE(25, 90, 90, 86),
    // crab lift
    HEAD(25, 62, 7) +
      LINE(15, 100, 30, 68) +
      LINE(30, 68, 65, 75) +
      POLY('65,75 72,95 92,100'),
  ]),

  // T11 — lying on stomach, chest lifted (Cobra)
  lyingFront: svg(
    HEAD(25, 68, 7) +
    LINE(32, 72, 70, 90) +
    LINE(70, 90, 95, 92) +
    LINE(40, 75, 45, 90)
  ),

  // C30 — bird's-eye view, lying face down, arms bent in a "W" (elbows
  // out to the sides, hands tucked back up near the ears) — Prone
  // W-Rotation is fundamentally about arm shape and rotation relative to
  // the body, which a side view can't show nearly as clearly as looking
  // straight down at it does.
  proneWTop: svg(
    HEAD(50, 20) +
    LINE(50, 30, 50, 85) +
    LINE(50, 85, 42, 120) +
    LINE(50, 85, 58, 120) +
    LINE(35, 40, 65, 40) +
    LINE(35, 40, 20, 42) +
    LINE(20, 42, 30, 18) +
    LINE(65, 40, 80, 42) +
    LINE(80, 42, 70, 18)
  ),

  // C31 — side view, lying face down with a dramatic twist: one leg bent
  // and swung high up and back over the body toward the opposite hand —
  // the actual "scorpion" shape this is named for, distinct from a plain
  // lying-flat position with just a subtle bend.
  scorpionTwist: svg(
    HEAD(18, 72, 7) +
    LINE(25, 74, 65, 82) +
    LINE(25, 74, 8, 60) +
    LINE(25, 74, 10, 92) +
    POLY('65,82 78,50 45,25')
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

  // T12b — balancing on one leg, arms out level with the shoulders for
  // stability (Single-Leg Balance Hold) — distinct from balanceOneLeg,
  // whose arms reach up by the head, which doesn't match a plain balance
  // test.
  balanceArmsOut: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 74) +
    LINE(50, 32, 20, 30) +
    LINE(50, 32, 80, 30) +
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

  // --- Calisthenics figures (public/js/exercises.js) ---

  // C1 — standing, deep knee bend with the hips dropped close to the
  // floor and knees splayed wide (level with or above the hips, the way
  // an actual deep/ATG squat looks), arms reaching forward for balance
  // (Deep Squat Hold)
  deepSquat: svg(
    HEAD(50, 30) +
    LINE(50, 38, 50, 100) +
    LINE(38, 44, 62, 44) +
    LINE(38, 44, 20, 66) +
    LINE(62, 44, 80, 66) +
    POLY('50,100 25,92 22,130') +
    POLY('50,100 75,92 78,130')
  ),

  // C26 — standing, one arm bent across the chest with the hand landing
  // at the opposite collarbone, head tilted up and toward that side
  // (Collarbone Look-Up) — the head stays close to and clearly attached
  // to the neck (a subtler tilt than the first attempt at this figure,
  // which read as a floating, disconnected head).
  collarboneLookUp: svg(
    LINE(50, 26, 50, 74) +
    LINE(38, 30, 62, 30) +
    LINE(50, 26, 58, 16) +
    HEAD(58, 16) +
    POLY('62,30 46,36 38,30') +
    LINE(38, 30, 30, 62) +
    LINE(50, 74, 40, 132) +
    LINE(50, 74, 60, 132)
  ),

  // C6 — plank with one knee driven up under the torso (Mountain Climber)
  mountainClimber: svg(
    HEAD(18, 58, 7) +
    LINE(26, 60, 72, 58) +
    LINE(28, 62, 28, 98) +
    POLY('72,58 50,75 45,92') +
    LINE(72, 58, 94, 96)
  ),

  // C7 — 3-frame flip book, all sharing the same kneeling-lunge base
  // (front foot planted, back knee down): hands on the floor, mid-rise,
  // then fully rotated with one arm reaching for the ceiling (World's
  // Greatest Stretch) — showing the actual rotation reads far better
  // than any single frame of it, and being visibly a kneeling lunge
  // throughout was the other specific complaint about the old figure.
  worldsGreatestFlow: animatedFigure([
    // hands on the floor
    HEAD(60, 55, 7) +
      LINE(50, 72, 62, 62) +
      LINE(62, 62, 72, 95) +
      POLY('50,72 68,85 76,112') +
      LINE(50, 72, 28, 98),
    // mid-rise
    HEAD(62, 45, 7) +
      LINE(50, 72, 62, 55) +
      LINE(62, 55, 78, 60) +
      POLY('50,72 68,85 76,112') +
      LINE(50, 72, 28, 98),
    // fully rotated, arm reaching for the ceiling
    HEAD(65, 30, 7) +
      LINE(50, 72, 65, 40) +
      LINE(65, 40, 85, 15) +
      POLY('50,72 68,85 76,112') +
      LINE(50, 72, 28, 98),
  ]),

  // C8 — hands and knees, opposite arm reaching forward and opposite
  // leg reaching back (Bird Dog Reach)
  birdDog: svg(
    HEAD(16, 52, 7) +
    LINE(24, 56, 66, 56) +
    LINE(26, 58, 28, 94) +
    LINE(66, 56, 66, 92) +
    LINE(26, 58, 4, 44) +
    LINE(66, 56, 95, 46)
  ),

  // C9 — lying on back, one leg bent up, arms up with one reaching out
  // (Dead Bug)
  deadBug: svg(
    HEAD(15, 70, 7) +
    LINE(22, 70, 65, 70) +
    LINE(30, 70, 30, 40) +
    LINE(30, 70, 8, 58) +
    POLY('65,70 65,45 78,45') +
    LINE(65, 70, 95, 62)
  ),

  // C11 — lying on one side, propped on a forearm, straight line body,
  // top arm reaching up (Side Plank Hold)
  sidePlank: svg(
    HEAD(20, 50, 7) +
    LINE(26, 54, 60, 80) +
    LINE(60, 80, 92, 102) +
    LINE(26, 54, 24, 92) +
    LINE(26, 54, 8, 30)
  ),

  // C12 — hovering in front of a chair, hands behind on the seat, legs
  // extended forward (Chair Tricep Dip)
  chairDip: svg(
    LINE(75, 95, 98, 95) +
    LINE(98, 95, 98, 135) +
    LINE(75, 95, 75, 135) +
    HEAD(46, 66, 7) +
    LINE(48, 73, 54, 98) +
    LINE(52, 80, 80, 96) +
    LINE(54, 98, 22, 124)
  ),

  // C13 — standing, one foot up on a chair/step (Chair Step-Up)
  chairStepUp: svg(
    LINE(58, 110, 92, 110) +
    LINE(58, 110, 58, 132) +
    LINE(92, 110, 92, 132) +
    HEAD(50, 16) +
    LINE(50, 24, 50, 72) +
    LINE(38, 28, 62, 28) +
    LINE(38, 28, 32, 55) +
    LINE(62, 28, 68, 55) +
    LINE(50, 72, 35, 130) +
    POLY('50,72 65,95 75,110')
  ),

  // C14 — front-leg lunge with the back foot elevated on a chair/step
  // behind (Chair Split Squat)
  chairSplitSquat: svg(
    LINE(70, 108, 95, 108) +
    LINE(70, 108, 70, 132) +
    LINE(95, 108, 95, 132) +
    HEAD(35, 25) +
    LINE(35, 33, 42, 65) +
    LINE(28, 38, 48, 38) +
    LINE(28, 38, 20, 58) +
    LINE(48, 38, 55, 58) +
    POLY('42,65 30,95 25,130') +
    LINE(42, 65, 80, 105)
  ),

  // C15 — kneeling, knees wide, hips low, forearms on the floor (Frog
  // Sit Opener)
  frogStretch: svg(
    HEAD(22, 72, 7) +
    LINE(28, 75, 58, 90) +
    LINE(30, 78, 30, 110) +
    LINE(58, 90, 35, 125) +
    LINE(58, 90, 80, 122)
  ),

  // C17 — back against a wall, thighs horizontal, knees bent (Wall Sit
  // Hold)
  wallSit: svg(
    LINE(85, 10, 85, 135) +
    HEAD(78, 28, 7) +
    LINE(80, 35, 80, 78) +
    LINE(80, 40, 62, 58) +
    LINE(80, 78, 45, 80) +
    LINE(45, 80, 45, 130)
  ),

  // C18 — 2-frame flip book: loaded crouch, then airborne with knees
  // tucked and arms swung up (Jump Squat) — an actual jumping motion
  // reads much better animated than as one static frame.
  jumpSquatFlow: animatedFigure([
    // crouch / load
    HEAD(50, 30) +
      LINE(50, 38, 50, 78) +
      LINE(50, 42, 35, 55) +
      LINE(50, 42, 65, 55) +
      POLY('50,78 30,90 32,120') +
      POLY('50,78 70,90 68,120'),
    // airborne
    HEAD(50, 20) +
      LINE(50, 28, 50, 68) +
      LINE(50, 32, 30, 15) +
      LINE(50, 32, 70, 15) +
      POLY('50,68 38,85 42,105') +
      POLY('50,68 62,85 58,105'),
  ]),

  // C19 — side view, standing with one leg stepped back into a lunge:
  // front leg bent (hip-knee-foot), back leg extended straight behind —
  // legs going in two clearly opposite horizontal directions, the way an
  // actual side-on lunge looks (Reverse Lunge). The previous version drew
  // the torso/arms as if facing the camera while only the legs were
  // side-on, which read as neither view.
  // C19 — 2-frame flip book: stepping back into the lunge (front knee
  // lightly bent, back leg still extended, hips relatively high), then
  // the completed lunge (hips sunk low, front knee bent deeply, back
  // knee dropped close to the floor) — a rep has a start and a bottom,
  // not just one or the other (Reverse Lunge).
  reverseLungeFlow: animatedFigure([
    // stepping back
    HEAD(50, 18) +
      LINE(50, 26, 50, 70) +
      LINE(50, 30, 38, 52) +
      POLY('50,70 68,90 74,128') +
      LINE(50, 70, 22, 118),
    // completed lunge
    HEAD(50, 38) +
      LINE(50, 46, 50, 90) +
      LINE(50, 50, 38, 72) +
      POLY('50,90 68,100 74,128') +
      POLY('50,90 30,108 22,128'),
  ]),

  // C20 — standing, elbows bent and lifted level with the shoulders, a
  // goalpost/W arm shape. Reused for the small shoulder-mobility moves
  // that only really differ in rep tempo, not silhouette (Elbow Lift
  // Hold, L-Pull). Also the "W" half of wSlideFlow below.
  armsGoalpost: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 32, 62, 32) +
    POLY('38,32 30,32 28,14') +
    POLY('62,32 70,32 72,14') +
    LINE(50, 72, 40, 132) +
    LINE(50, 72, 60, 132)
  ),

  // C20c — standing, elbows bent and tucked down at rib height with hands
  // pulled back toward the torso — distinct from armsGoalpost's elbows-
  // at-shoulder-height shape, which doesn't match L-Pull's "elbows bent
  // by your ribs" (a much lower position).
  armsElbowsAtRibs: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 32, 62, 32) +
    POLY('38,32 32,55 46,58') +
    POLY('62,32 68,55 54,58') +
    LINE(50, 72, 40, 132) +
    LINE(50, 72, 60, 132)
  ),

  // C20b — 2-frame flip book alternating armsGoalpost's bent-elbow "W"
  // shape with standingArmsUp's straight-arm-overhead "Y" shape — W-Slide
  // is literally named for sliding between these two positions.
  wSlideFlow: animatedFigure([
    // W
    HEAD(50, 18) +
      LINE(50, 26, 50, 72) +
      LINE(38, 32, 62, 32) +
      POLY('38,32 30,32 28,14') +
      POLY('62,32 70,32 72,14') +
      LINE(50, 72, 40, 132) +
      LINE(50, 72, 60, 132),
    // Y
    HEAD(50, 16) +
      LINE(50, 24, 50, 74) +
      LINE(38, 30, 62, 30) +
      LINE(38, 30, 30, 10) +
      LINE(62, 30, 70, 10) +
      LINE(50, 74, 40, 132) +
      LINE(50, 74, 60, 132),
  ]),

  // C21 — standing, arms reaching behind and down, hands meeting behind
  // the lower back (Hands-Behind-Back Pull-Down)
  armsBehindBack: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 45, 58) +
    LINE(62, 30, 55, 58) +
    LINE(50, 72, 40, 132) +
    LINE(50, 72, 60, 132)
  ),

  // C22 — lying on back, knees bent (one pair drawn slightly offset for
  // visual interest). Reused for the lying hip-mobility family that all
  // share this base position (Lying Knee Drops, Windshield Wipers,
  // Heel-to-Toe Rock).
  lyingKneesBent: svg(
    HEAD(15, 70, 7) +
    LINE(22, 70, 55, 70) +
    LINE(30, 70, 25, 50) +
    POLY('55,70 55,45 72,45') +
    POLY('55,70 62,48 80,52')
  ),

  // C23 — standing, arms extended forward gripping a towel held taut
  // between the hands. Reused for the front-facing towel exercises
  // (Straight-Arm Pull, Front Raise, Arm Circles) — not High Pull Down,
  // which starts overhead; see towelPullOverhead below.
  // C23c — 2-frame flip book: the towel held taut up and out to one side,
  // then pulled down and across to the opposite hip — the actual motion,
  // since a single static frame (it was reusing towelPull's forward-reach
  // shape, which doesn't match this move's diagonal path at all) can't
  // show a pull that moves from one place to another (Towel Straight-Arm
  // Pull).
  towelPullAcrossFlow: animatedFigure([
    // held up and out
    HEAD(50, 18) +
      LINE(50, 26, 50, 72) +
      LINE(38, 30, 62, 30) +
      LINE(38, 30, 55, 10) +
      LINE(62, 30, 85, 15) +
      LINE(55, 10, 85, 15) +
      LINE(50, 72, 40, 132) +
      LINE(50, 72, 60, 132),
    // pulled down and across to the opposite hip
    HEAD(50, 18) +
      LINE(50, 26, 50, 72) +
      LINE(38, 30, 62, 30) +
      LINE(38, 30, 20, 60) +
      LINE(62, 30, 45, 75) +
      LINE(20, 60, 45, 75) +
      LINE(50, 72, 40, 132) +
      LINE(50, 72, 60, 132),
  ]),

  towelPull: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 25, 50) +
    LINE(62, 30, 75, 50) +
    LINE(25, 50, 75, 50) +
    LINE(50, 72, 40, 132) +
    LINE(50, 72, 60, 132)
  ),

  // C23b — standing, both arms straight overhead gripping a towel held
  // taut, matching High Pull Down's actual starting position (Towel High
  // Pull Down).
  towelPullOverhead: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 28, 10) +
    LINE(62, 30, 72, 10) +
    LINE(28, 10, 72, 10) +
    LINE(50, 72, 40, 132) +
    LINE(50, 72, 60, 132)
  ),

  // C24 — standing tall with a small book balanced on the head (Book
  // Balance Walk)
  bookWalk: svg(
    LINE(40, 10, 60, 10) +
    LINE(40, 10, 40, 14) +
    LINE(60, 10, 60, 14) +
    LINE(40, 14, 60, 14) +
    HEAD(50, 20) +
    LINE(50, 28, 50, 74) +
    LINE(38, 32, 62, 32) +
    LINE(38, 32, 32, 58) +
    LINE(62, 32, 68, 58) +
    LINE(50, 74, 40, 132) +
    LINE(50, 74, 60, 132)
  ),

  // C27 — seated on the floor, arms crossed over the chest (deliberately
  // not touching the ground), legs folded to sit — the starting position
  // for standing up without using your hands (Sit-to-Stand, No Hands).
  sitToStand: svg(
    HEAD(50, 30) +
    LINE(50, 38, 50, 78) +
    LINE(40, 45, 60, 50) +
    LINE(60, 45, 40, 50) +
    LINE(50, 78, 25, 92) +
    LINE(25, 92, 48, 98) +
    LINE(50, 78, 78, 92) +
    LINE(78, 92, 52, 98)
  ),

  // C28 — hanging from a horizontal overhead bar, arms straight, body
  // relaxed (Dead Hang).
  deadHang: svg(
    LINE(30, 8, 70, 8) +
    HEAD(50, 22) +
    LINE(50, 30, 50, 78) +
    LINE(50, 30, 35, 8) +
    LINE(50, 30, 65, 8) +
    LINE(50, 78, 42, 130) +
    LINE(50, 78, 58, 130)
  ),

  // C29 — 3-frame flip book: standing tall, hinging forward with the
  // knees starting to bend, then fully folded with hands planted on the
  // floor between wide, bent knees (Squat Fold) — the actual fold-and-
  // squat motion, not just its end position.
  squatFoldFlow: animatedFigure([
    // standing
    HEAD(50, 18) +
      LINE(50, 26, 50, 74) +
      LINE(50, 30, 40, 55) +
      LINE(50, 30, 60, 55) +
      LINE(50, 74, 40, 132) +
      LINE(50, 74, 60, 132),
    // hinging, knees starting to bend
    HEAD(44, 78, 7) +
      LINE(50, 50, 46, 84) +
      LINE(40, 86, 52, 86) +
      LINE(40, 86, 36, 110) +
      LINE(52, 86, 54, 110) +
      LINE(50, 50, 38, 128) +
      LINE(50, 50, 62, 128),
    // full fold, hands on the floor between wide, bent knees
    HEAD(46, 106, 7) +
      LINE(50, 70, 48, 96) +
      LINE(40, 98, 56, 98) +
      LINE(40, 98, 38, 118) +
      LINE(56, 98, 58, 118) +
      POLY('50,70 30,92 32,128') +
      POLY('50,70 70,92 68,128'),
  ]),

  // C25 — seated, one leg bent in front with the foot out to one side and
  // the other bent back on the opposite side, forming a "Z" with the legs;
  // hands pressing down beside the hips to lift (Z-Sit Lift). Deliberately
  // asymmetric, unlike seatedNeutral's mirrored cross-legged shape.
  zSit: svg(
    HEAD(46, 30) +
    LINE(46, 38, 50, 78) +
    LINE(36, 44, 58, 40) +
    LINE(36, 44, 28, 76) +
    LINE(58, 40, 68, 74) +
    POLY('50,78 76,80 90,60') +
    POLY('50,78 24,90 12,114')
  ),
};
