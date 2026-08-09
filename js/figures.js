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
};
