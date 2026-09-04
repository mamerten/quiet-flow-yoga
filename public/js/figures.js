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

  // T5 — tabletop, side view (Cat-Cow, Plank)
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

  // T8 — kneeling, folded forward (Child's Pose)
  kneelingFold: svg(
    HEAD(22, 85, 7) +
    LINE(30, 88, 65, 95) +
    LINE(30, 88, 8, 92) +
    LINE(65, 95, 75, 120) +
    LINE(65, 95, 55, 122)
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

  // T11 — lying on stomach, chest lifted (Cobra)
  lyingFront: svg(
    HEAD(25, 68, 7) +
    LINE(32, 72, 70, 90) +
    LINE(70, 90, 95, 92) +
    LINE(40, 75, 45, 90)
  ),

  // T12 — balancing on one leg (Tree, Eagle, Warrior III)
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

  // --- Calisthenics figures (public/js/exercises.js) ---

  // C1 — standing, deep knee bend, arms reaching forward for balance
  // (Deep Squat Hold)
  deepSquat: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 80) +
    LINE(38, 34, 62, 34) +
    LINE(38, 34, 30, 58) +
    LINE(62, 34, 70, 58) +
    POLY('50,80 30,105 35,132') +
    POLY('50,80 70,105 65,132')
  ),

  // C6 — plank with one knee driven up under the torso (Mountain Climber)
  mountainClimber: svg(
    HEAD(18, 58, 7) +
    LINE(26, 60, 72, 58) +
    LINE(28, 62, 28, 98) +
    POLY('72,58 50,75 45,92') +
    LINE(72, 58, 94, 96)
  ),

  // C7 — kneeling lunge with the torso rotated and one arm opening
  // upward (World's Greatest Lunge)
  kneelTwist: svg(
    HEAD(50, 20) +
    LINE(50, 28, 50, 70) +
    LINE(50, 34, 30, 50) +
    LINE(50, 34, 75, 10) +
    POLY('50,70 35,100 30,132') +
    LINE(50, 70, 80, 128)
  ),

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

  // C18 — airborne, knees tucked mid-jump, arms swung up (Jump Squat)
  jumpSquat: svg(
    HEAD(50, 20) +
    LINE(50, 28, 50, 68) +
    LINE(50, 32, 30, 15) +
    LINE(50, 32, 70, 15) +
    POLY('50,68 38,85 42,105') +
    POLY('50,68 62,85 58,105')
  ),

  // C19 — standing, one leg stepped back into a lunge (Reverse Lunge)
  reverseLunge: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 30, 62, 30) +
    LINE(38, 30, 34, 55) +
    LINE(62, 30, 66, 55) +
    POLY('50,72 45,100 48,130') +
    LINE(50, 72, 85, 125)
  ),

  // C20 — standing, elbows bent and lifted level with the shoulders, a
  // goalpost/W arm shape. Reused for the several small shoulder-mobility
  // moves that only really differ in rep tempo, not silhouette (Elbow
  // Lift Hold, W-Slide, L-Pull, T-Raise).
  armsGoalpost: svg(
    HEAD(50, 18) +
    LINE(50, 26, 50, 72) +
    LINE(38, 32, 62, 32) +
    POLY('38,32 30,32 28,14') +
    POLY('62,32 70,32 72,14') +
    LINE(50, 72, 40, 132) +
    LINE(50, 72, 60, 132)
  ),

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
  // between the hands. Reused for all four towel exercises.
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
};
