// Repository of calisthenics/mobility exercises — the counterpart to
// js/poses.js for Calisthenics mode.
//
// Most of these are drawn directly from what Markus Kneissl (@markus.moves,
// a no-gym mobility/strength coach) actually teaches — his belly-pooch
// flow (hip extensions, L-sit-to-crab, Z-lifts, scapula push-ups, W-slides),
// his shoulder routine (L-Pull/T-Raise/Y-Raise/Prone W-Rotation), his
// posture routine (Elbow Lift Hold, Collarbone Look-Up, Hands-Behind-Back
// Pull-Down, Book Balance Walk), his morning mobility flow (Beast
// Kickthrough, World's Greatest Stretch, Scorpion Heel Taps, 90/90
// Switch), his bedtime hip-release flow (Lying Knee Drops, Windshield
// Wipers, Heel-to-Toe Rock), his towel routine (High Pull Down,
// Straight-Arm Pull, Front Raise, Arm Circles), and his named strength
// circuit (push-ups, jump squats, dips, reverse lunges, wall sits). His
// content doesn't use consistent cute names, so names/descriptions here
// are original, written for this app. A handful (Plank Hold, Mountain
// Climber, Couch Stretch, Bird Dog Reach, Side Plank Hold) are standard
// bodyweight staples that fit his style and content but aren't verbatim
// from a specific post — everything else is.
//
// Schema (deliberately different from poses.js — see README):
//   id             unique string
//   name           short, memorable name (shown + spoken)
//   cue            what gets spoken and displayed
//   figure         key into FIGURES (js/figures.js)
//   surface        'standing' | 'ground' — exactly one. Whether you need a
//                  mat (ground) or just floor space (standing).
//   needsFurniture optional: true if a simple prop is required — a chair,
//                  a wall, a towel, even a book. Independent of `surface`.
//   sided          optional: true if it's done once per side (auto-paired
//                  left/right by js/calisthenics-workout.js)
//
// There's no `duration` field — unlike yoga, Calisthenics mode is
// self-paced (see README): the app shows one exercise at a time and waits
// for you to say "next", swipe, or tap a button, rather than auto-advancing
// on a timer.

window.EXERCISES = [
  // --- Standing, no equipment ---
  {
    id: 'deep-squat-hold',
    name: 'Deep Squat Hold',
    figure: 'deepSquat',
    surface: 'standing',
    cue: 'Sink into a deep squat, feet flat on the floor, chest tall. Reach your arms forward for balance and hold.',
  },
  {
    id: 'reverse-hunchback',
    name: 'Reverse Hunchback',
    figure: 'standingArmsUp',
    surface: 'standing',
    cue: 'Clasp your hands behind you and lift your arms, opening your chest. Great for undoing a day at the desk.',
  },
  {
    id: 'jump-squat',
    name: 'Jump Squat',
    figure: 'jumpSquat',
    surface: 'standing',
    cue: 'Squat down, then explode up into a jump, swinging your arms up with you. Land soft and go straight into the next one.',
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    figure: 'reverseLunge',
    surface: 'standing',
    sided: true,
    cue: 'Step one foot back and lower into a lunge, front knee tracking over your foot. Push through your front heel to return.',
  },
  {
    id: 'elbow-lift-hold',
    name: 'Elbow Lift Hold',
    figure: 'armsGoalpost',
    surface: 'standing',
    cue: 'Lift your elbows out and up to shoulder height and hold, breathing slowly. This wakes up the upper back that keeps you tall.',
  },
  {
    id: 'collarbone-look-up',
    name: 'Collarbone Look-Up',
    figure: 'standingNeutral',
    surface: 'standing',
    cue: 'Find your collarbone with your fingers, keep your ribs down, and look up smoothly. Unloads a stiff, forward-jutted neck.',
  },
  {
    id: 'hands-behind-pulldown',
    name: 'Hands-Behind-Back Pull-Down',
    figure: 'armsBehindBack',
    surface: 'standing',
    cue: 'Lace your fingers behind you and pull your hands down, not up. Opens your shoulders so they stop rounding forward.',
  },

  // --- Ground / mat ---
  {
    id: 'plank-hold',
    name: 'Plank Hold',
    figure: 'tabletop',
    surface: 'ground',
    cue: 'Hold a straight line from head to heels, forearms or hands under your shoulders. Keep your hips level.',
  },
  {
    id: 'push-up-flow',
    name: 'Push-Up Flow',
    figure: 'tabletop',
    surface: 'ground',
    cue: 'Lower your chest toward the floor and press back up, keeping your body in one straight line.',
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climber',
    figure: 'mountainClimber',
    surface: 'ground',
    cue: 'From a plank, drive your knees toward your chest one at a time, at a quick and steady pace.',
  },
  {
    id: 'worlds-greatest-stretch',
    name: "World's Greatest Stretch",
    figure: 'kneelTwist',
    surface: 'ground',
    sided: true,
    cue: 'From a deep kneeling lunge, rotate your torso and open one arm toward the ceiling. Move slow enough to control the range.',
  },
  {
    id: 'couch-stretch',
    name: 'Couch Stretch',
    figure: 'lungeArmsUp',
    surface: 'ground',
    sided: true,
    cue: 'Sink your hips forward and down in a deep kneeling lunge, opening the front of your hip. Breathe into it.',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog Reach',
    figure: 'birdDog',
    surface: 'ground',
    sided: true,
    cue: 'From hands and knees, reach one arm forward and extend the opposite leg back. Keep your hips level and steady.',
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    figure: 'lyingBack',
    surface: 'ground',
    cue: 'Lie on your back, feet flat, and lift your hips toward the ceiling, squeezing your glutes at the top.',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    figure: 'deadBug',
    surface: 'ground',
    sided: true,
    cue: 'Lie on your back, arms up and knees bent to 90 degrees. Slowly extend one arm and the opposite leg, then switch.',
  },
  {
    id: 'side-plank',
    name: 'Side Plank Hold',
    figure: 'sidePlank',
    surface: 'ground',
    sided: true,
    cue: 'Prop up on one forearm with your body in a straight line, hips lifted. Reach your top arm toward the ceiling.',
  },
  {
    id: 'kneeling-rest',
    name: 'Kneeling Rest',
    figure: 'kneelingFold',
    surface: 'ground',
    cue: 'Sit back onto your heels and fold forward, arms stretched out or resting by your sides. A good reset between rounds.',
  },
  {
    id: 'frog-sit-opener',
    name: 'Frog Sit Opener',
    figure: 'frogStretch',
    surface: 'ground',
    cue: 'On hands and knees, spread your knees wide and rock your hips slowly back and forward, opening through your hips.',
  },
  {
    id: 'butterfly-rock',
    name: 'Butterfly Rock',
    figure: 'seatedNeutral',
    surface: 'ground',
    cue: 'Sit with the soles of your feet together, knees out. Gently rock side to side with a steady, easy breath.',
  },
  {
    id: 'scapular-pushup',
    name: 'Scapular Push-Up',
    figure: 'tabletop',
    surface: 'ground',
    cue: 'From a plank, keep your arms straight and push the floor away, letting your shoulder blades spread apart, then release.',
  },
  {
    id: 'prone-w-rotation',
    name: 'Prone W-Rotation',
    figure: 'lyingFront',
    surface: 'ground',
    sided: true,
    cue: 'Lie on your stomach, arms in a W shape. Rotate one forearm up toward your ear, then back down. Switch sides.',
  },
  {
    id: 'w-slide',
    name: 'W-Slide',
    figure: 'armsGoalpost',
    surface: 'ground',
    cue: 'Arms in a W at your sides, slide them up overhead into a Y, then back down to a W. Keep your low back settled.',
  },
  {
    id: 'l-pull',
    name: 'L-Pull',
    figure: 'armsGoalpost',
    surface: 'ground',
    cue: 'Elbows bent by your ribs, pull your hands back and squeeze your shoulder blades together. Slow and controlled.',
  },
  {
    id: 't-raise',
    name: 'T-Raise',
    figure: 'armsGoalpost',
    surface: 'ground',
    cue: 'Arms out to the sides in a T, lift them slightly and squeeze between your shoulder blades. Small, controlled range.',
  },
  {
    id: 'y-raise',
    name: 'Y-Raise',
    figure: 'standingArmsUp',
    surface: 'ground',
    cue: 'Arms overhead in a Y shape, lift them slightly using your lower shoulder blade muscles. Keep your neck relaxed.',
  },
  {
    id: 'crab-lift',
    name: 'Crab Lift',
    figure: 'lyingBack',
    surface: 'ground',
    cue: 'From an L-sit, hands by your hips, press down and lift your hips up into a crab position. Lower with control and repeat.',
  },
  {
    id: 'z-sit-lift',
    name: 'Z-Sit Lift',
    figure: 'seatedNeutral',
    surface: 'ground',
    cue: 'Sit with one leg bent in front and one bent out to the side in a Z shape. Press your hands down and lift your hips slightly.',
  },
  {
    id: 'beast-kickthrough',
    name: 'Beast Kickthrough',
    figure: 'mountainClimber',
    surface: 'ground',
    sided: true,
    cue: 'From hands and feet, hips low, rotate and thread one leg underneath your body to the opposite side. Return and switch.',
  },
  {
    id: 'scorpion-heel-taps',
    name: 'Scorpion Heel Taps',
    figure: 'lyingFront',
    surface: 'ground',
    sided: true,
    cue: 'Lie on your stomach, arms out to the sides. Swing one heel up and across toward the opposite hand, then reset.',
  },
  {
    id: 'ninety-ninety-switch',
    name: '90/90 Switch',
    figure: 'seatedNeutral',
    surface: 'ground',
    cue: 'Sit with both knees bent at 90 degrees, one in front and one to the side. Rotate your knees to switch which leg is which.',
  },
  {
    id: 'lying-knee-drops',
    name: 'Lying Knee Drops',
    figure: 'lyingKneesBent',
    surface: 'ground',
    cue: 'Lie on your back, knees bent and together. Slowly let your knees fall open, then draw them back to center.',
  },
  {
    id: 'windshield-wipers',
    name: 'Windshield Wipers',
    figure: 'lyingKneesBent',
    surface: 'ground',
    cue: 'Lie on your back, knees bent and together. Slowly sway both knees side to side like a windshield wiper.',
  },
  {
    id: 'heel-to-toe-rock',
    name: 'Heel-to-Toe Rock',
    figure: 'lyingKneesBent',
    surface: 'ground',
    cue: 'Lie on your back, feet flat and hip-width apart. Slowly rock your knees and feet in and out, heels to toes.',
  },

  // --- Needs a chair, wall, towel, or book ---
  {
    id: 'chair-dip',
    name: 'Chair Tricep Dip',
    figure: 'chairDip',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Hands on the edge of a chair behind you, lower your hips down and press back up, bending at the elbows.',
  },
  {
    id: 'chair-step-up',
    name: 'Chair Step-Up',
    figure: 'chairStepUp',
    surface: 'standing',
    needsFurniture: true,
    sided: true,
    cue: 'Step one foot up onto a sturdy chair or step, and drive up through your heel. Step down with control.',
  },
  {
    id: 'chair-split-squat',
    name: 'Chair Split Squat',
    figure: 'chairSplitSquat',
    surface: 'standing',
    needsFurniture: true,
    sided: true,
    cue: 'Rest the top of your back foot on a chair behind you, and bend your front knee into a lunge.',
  },
  {
    id: 'wall-sit-hold',
    name: 'Wall Sit Hold',
    figure: 'wallSit',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Back flat against a wall, slide down until your thighs are parallel to the floor, knees at 90 degrees. Hold.',
  },
  {
    id: 'book-balance-walk',
    name: 'Book Balance Walk',
    figure: 'bookWalk',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Balance a book on your head and walk slowly and tall. A simple way to re-teach your body good alignment.',
  },
  {
    id: 'towel-high-pulldown',
    name: 'Towel High Pull Down',
    figure: 'towelPull',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Hold a towel overhead with tension between your hands, and pull it down behind your head and back up.',
  },
  {
    id: 'towel-straight-arm-pull',
    name: 'Towel Straight-Arm Pull',
    figure: 'towelPull',
    surface: 'standing',
    needsFurniture: true,
    sided: true,
    cue: 'Hold a towel with tension, arms straight, and pull down and across your body toward one hip. Switch sides.',
  },
  {
    id: 'towel-front-raise',
    name: 'Towel Front Raise',
    figure: 'towelPull',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Hold a towel with tension between your hands and raise your straight arms out in front to shoulder height.',
  },
  {
    id: 'towel-arm-circles',
    name: 'Towel Arm Circles',
    figure: 'towelPull',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Hold a towel with tension between your hands and trace big, slow circles in the air, both directions.',
  },
];

window.exercisesBySurface = function exercisesBySurface(surface) {
  return window.EXERCISES.filter((e) => e.surface === surface);
};
