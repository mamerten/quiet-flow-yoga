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
// Wipers, and a Dead Hang — a third move from that flow, "heel-to-toe
// rock", was dropped: as described it was indistinguishable in practice
// from the other two, and the name collides with an unrelated standing
// balance drill), his towel routine (High Pull Down, Straight-Arm Pull,
// Front Raise, Arm Circles), his named strength circuit (push-ups, jump
// squats, dips, reverse lunges, wall sits), and his "5 tests for
// longevity" post (Sit-to-Stand No Hands, Single-Leg Balance, Standing
// Toe Touch — grip strength and sit-and-reach from that same list didn't
// translate to a distinct bodyweight move and were skipped). His content
// doesn't use consistent cute names — none of this is his own naming,
// including where noted below — so names/descriptions here are original,
// written for this app. A handful (Plank Hold, Mountain Climber, Couch
// Stretch, Bird Dog, Side Plank Hold, Squat Fold, Bicycle Crunches,
// Suitcase Crunches, Russian Twists, Shoulder Taps) are standard
// bodyweight staples that fit his style and content but aren't verbatim
// from a specific post. Two more (Squat and Twist, Lunge Reach and Twist)
// come from a separate source entirely — a Primal Instinct Instagram
// mobility-flow reel — plus one built from a photo of a kneeling
// toe/ankle isometric hold (Toe Flexor Hold).
//
// A later pass (Pull-Up, Hollow Body Hold, Superman Hold, Calf Raises,
// Curtsy Lunge, Bear Crawl, Cat-Cow, Burpee) filled in gaps the library
// otherwise had no coverage for at all — pulling strength, calf/ankle
// work, lateral lunging, locomotion, a core "anti-pair" beyond Plank Hold,
// and (oddly, given how foundational it is) Cat-Cow — rather than being
// sourced from any one place; these are standard, widely-taught bodyweight
// moves. Everything else in the file is Markus's.
//
// Schema (deliberately different from poses.js — see README):
//   id             unique string
//   name           short, memorable name (shown + spoken)
//   cue            what gets spoken and displayed
//   figure         key into FIGURES (js/figures.js)
//   surface        'standing' | 'ground' — exactly one. Whether you need a
//                  mat (ground) or just floor space (standing).
//   needsFurniture optional: true if a portable prop is required — a chair,
//                  step, towel, book, or pull-up bar — something you might not
//                  have on hand. Gated by the "I have a step, chair, or other
//                  prop" toggle. Independent of `surface`.
//   needsWall      optional: true if it's done against a wall. Kept
//                  separate from needsFurniture and NOT gated by that
//                  toggle — a wall isn't something you carry around like a
//                  chair, and assuming one's nearby is a safe bet the same
//                  way floor space is assumed for `surface: 'standing'`.
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
    figure: 'armsBehindBackLift',
    surface: 'standing',
    cue: 'Clasp your hands behind you and lift your arms, opening your chest. Great for undoing a day at the desk.',
  },
  {
    id: 'jump-squat',
    name: 'Jump Squat',
    figure: 'jumpSquatFlow',
    surface: 'standing',
    cue: 'Squat down, then explode up into a jump, swinging your arms up with you. Land soft and go straight into the next one.',
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    figure: 'reverseLungeFlow',
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
    figure: 'collarboneLookUp',
    surface: 'standing',
    sided: true,
    cue: 'Cross one arm over and rest your fingers on the opposite collarbone, keep your ribs down, and look up and to that side. Unloads a stiff, forward-jutted neck.',
  },
  {
    id: 'single-leg-balance',
    name: 'Single-Leg Balance Hold',
    figure: 'balanceArmsOut',
    surface: 'standing',
    sided: true,
    cue: 'Lift one foot off the floor and hold your balance, arms out for control. Once you feel steady, try closing your eyes.',
  },
  {
    id: 'standing-toe-touch',
    name: 'Standing Toe Touch',
    figure: 'toeTouchFlow',
    surface: 'standing',
    cue: 'Fold forward from your hips and reach for your toes, knees soft. A simple check-in for your hamstrings and low back.',
  },
  {
    id: 'squat-fold',
    name: 'Squat Fold',
    figure: 'squatFoldFlow',
    surface: 'standing',
    cue: 'From standing, fold forward and plant your hands on the floor, then bend your knees to sink into a deep squat without letting go. Straighten back up and repeat.',
  },
  {
    id: 'hands-behind-pulldown',
    name: 'Hands-Behind-Back Pull-Down',
    figure: 'armsBehindBackDown',
    surface: 'standing',
    cue: 'Lace your fingers behind you and pull your hands down, not up. Opens your shoulders so they stop rounding forward.',
  },
  {
    id: 'squat-twist',
    name: 'Squat and Twist',
    figure: 'squatTwistFlow',
    surface: 'standing',
    cue: 'Sink into a squat, then rotate your torso and reach one arm up toward the ceiling, following it with your eyes. Return to the squat and switch sides.',
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    figure: 'calfRaise',
    surface: 'standing',
    cue: 'Rise up onto the balls of your feet as high as you can, then lower with control. Small range, steady pace.',
  },
  {
    id: 'curtsy-lunge',
    name: 'Curtsy Lunge',
    figure: 'curtsyLunge',
    surface: 'standing',
    sided: true,
    cue: 'Step one leg behind and across the other, like a curtsy, bending both knees. Push through your front heel to return.',
  },

  {
    id: 'w-slide',
    name: 'W-Slide',
    figure: 'wSlideFlow',
    surface: 'standing',
    cue: 'Arms in a W at your sides, slide them up overhead into a Y, then back down to a W. Keep your low back settled.',
  },
  {
    id: 'l-pull',
    name: 'L-Pull',
    figure: 'lPullFlow',
    surface: 'standing',
    cue: 'Elbows bent by your ribs, pull your hands back and squeeze your shoulder blades together. Slow and controlled.',
  },
  {
    id: 't-raise',
    name: 'T-Raise',
    figure: 'standingTArms',
    surface: 'standing',
    cue: 'Arms out to the sides in a T, lift them slightly and squeeze between your shoulder blades. Small, controlled range.',
  },
  {
    id: 'y-raise',
    name: 'Y-Raise',
    figure: 'standingYArms',
    surface: 'standing',
    cue: 'Arms overhead in a Y shape, lift them slightly using your lower shoulder blade muscles. Keep your neck relaxed.',
  },

  // --- Ground / mat ---
  {
    id: 'sit-to-stand',
    name: 'Sit-to-Stand, No Hands',
    figure: 'sitToStand',
    surface: 'ground',
    cue: 'From sitting on the floor, cross your arms over your chest and stand straight up — no hands, no rocking. Sit back down with the same control.',
  },
  {
    id: 'plank-hold',
    name: 'Plank Hold',
    figure: 'plank',
    surface: 'ground',
    cue: 'Hold a straight line from head to heels, forearms or hands under your shoulders. Keep your hips level.',
  },
  {
    id: 'push-up-flow',
    name: 'Push-Up',
    figure: 'pushUpFlow',
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
    figure: 'worldsGreatestFlow',
    surface: 'ground',
    sided: true,
    cue: 'From a deep kneeling lunge — front foot planted, back knee down — place both hands inside your front foot. Rotate your torso and reach the arm on the same side as your back knee straight up toward the ceiling, following it with your eyes. Move slow enough to control the range.',
  },
  {
    id: 'couch-stretch',
    name: 'Couch Stretch',
    figure: 'couchStretch',
    surface: 'ground',
    needsWall: true,
    sided: true,
    cue: 'Prop your back shin up behind you — against a wall or a couch, the pose’s namesake — so that knee is fully bent, then sink your hips forward and down. A deep stretch through the front of the hip and thigh.',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    figure: 'birdDog',
    surface: 'ground',
    sided: true,
    cue: 'From hands and knees, reach one arm forward and extend the opposite leg back. Keep your hips level and steady.',
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    figure: 'gluteBridge',
    surface: 'ground',
    cue: 'Lie on your back, feet flat, and lift your hips toward the ceiling, squeezing your glutes at the top.',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    figure: 'deadBug',
    surface: 'ground',
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
    figure: 'kneelingRest',
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
    figure: 'butterflySit',
    surface: 'ground',
    cue: 'Sit with the soles of your feet together, knees out. Gently rock side to side with a steady, easy breath.',
  },
  {
    id: 'scapular-pushup',
    name: 'Scapular Push-Up',
    figure: 'scapPushUpFlow',
    surface: 'ground',
    cue: 'From a plank, keep your arms straight and push the floor away, letting your shoulder blades spread apart, then release.',
  },
  {
    id: 'prone-w-rotation',
    name: 'Prone W-Rotation',
    figure: 'proneWFlow',
    surface: 'ground',
    cue: 'Lie on your stomach, arms in a W shape, thumbs up toward the ceiling. Rotate one forearm up toward your ear, then the other, alternating side to side.',
  },
  {
    id: 'crab-lift',
    name: 'Crab Lift',
    figure: 'crabLiftFlow',
    surface: 'ground',
    cue: 'From an L-sit, hands by your hips, press down and lift your hips up into a crab position. Lower with control and repeat.',
  },
  {
    id: 'z-sit-lift',
    name: 'Z-Sit Lift',
    figure: 'zSit',
    surface: 'ground',
    sided: true,
    cue: 'Sit with one leg bent in front and one bent out to the side in a Z shape. Press your hands down and lift your hips slightly.',
  },
  {
    id: 'beast-kickthrough',
    name: 'Beast Kickthrough',
    figure: 'beastKickthroughFlow',
    surface: 'ground',
    sided: true,
    cue: 'From hands and feet, hips low, rotate and thread one leg underneath your body to the opposite side. Return, and keep working this side.',
  },
  {
    id: 'scorpion-heel-taps',
    name: 'Scorpion Heel Taps',
    figure: 'scorpionTwist',
    surface: 'ground',
    sided: true,
    cue: 'Lie on your stomach, arms out to the sides. Swing one heel as far as you can, up and across towards the hand, then reset.',
  },
  {
    id: 'ninety-ninety-switch',
    name: '90/90 Switch',
    figure: 'ninetyNinetyFlow',
    surface: 'ground',
    cue: 'Sit with both knees bent at 90 degrees, one in front and one to the side. Rotate your knees to switch which leg is which.',
  },
  {
    id: 'lying-knee-drops',
    name: 'Lying Knee Drops',
    figure: 'kneeDropsFlow',
    surface: 'ground',
    cue: 'Lie on your back, knees bent and together. Slowly let your knees fall open, then draw them back to center.',
  },
  {
    id: 'windshield-wipers',
    name: 'Windshield Wipers',
    figure: 'windshieldWiperFlow',
    surface: 'ground',
    cue: 'Lie on your back, knees bent and together. Slowly sway both knees side to side like a windshield wiper.',
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    figure: 'bicycleFlow',
    surface: 'ground',
    cue: 'Lie on your back, hands behind your head. Bring one elbow toward the opposite knee while extending the other leg, then switch — a steady pedaling motion.',
  },
  {
    id: 'suitcase-crunches',
    name: 'Suitcase Crunches',
    figure: 'suitcaseFlow',
    surface: 'ground',
    cue: 'Lie on your back, arms overhead and legs extended. Fold at the waist, bringing your knees and upper body up to meet in the middle like closing a suitcase, then lower with control.',
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    figure: 'russianTwistFlow',
    surface: 'ground',
    cue: 'Sit with your knees bent, leaning back slightly, feet lifted or resting on the floor. Rotate your torso side to side, tapping the floor beside each hip.',
  },
  {
    id: 'shoulder-taps',
    name: 'Shoulder Taps',
    figure: 'shoulderTapFlow',
    surface: 'ground',
    cue: 'From a plank, tap one hand to the opposite shoulder without letting your hips rock, then switch sides.',
  },
  {
    id: 'lunge-reach-twist',
    name: 'Lunge Reach and Twist',
    figure: 'lungeReachFlow',
    surface: 'ground',
    sided: true,
    cue: 'From a low lunge, rotate your torso and sweep one arm down and back, then around and up overhead in one flowing arc. Move slow and controlled.',
  },
  {
    id: 'toe-flexor-hold',
    name: 'Toe Flexor Hold',
    figure: 'toeFlexorHold',
    surface: 'ground',
    sided: true,
    cue: 'Kneel with your back foot\'s toes tucked under, weight pressing into the ball of that foot, front knee bent and hands on the floor. Hold still and breathe.',
  },
  {
    id: 'cat-cow-mobility',
    name: 'Cat-Cow',
    figure: 'catCowFlow',
    surface: 'ground',
    cue: 'On hands and knees, arch your back and look up, then round your spine and tuck your chin. Slow and steady, following your breath.',
  },
  {
    id: 'hollow-body-hold',
    name: 'Hollow Body Hold',
    figure: 'hollowBodyHold',
    surface: 'ground',
    cue: 'Lie on your back, arms overhead and legs straight. Press your lower back into the floor and lift your shoulders and legs slightly off the ground. Hold.',
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    figure: 'legRaiseFlow',
    surface: 'ground',
    cue: 'Sit propped back on your hands with your legs straight out in front. Raise them together as high as you can, then lower them back down without letting your feet touch the floor.',
  },
  {
    id: 'down-up-dogs',
    name: 'Down-Up Dogs',
    figure: 'downUpDogFlow',
    surface: 'ground',
    cue: 'Start with your hands and feet down and your hips pushed high into an upside-down V. Roll forward until your hips sink toward the floor and your chest lifts, then push back up. Keep flowing between the two.',
  },
  {
    id: 'superman-hold',
    name: 'Superman Hold',
    figure: 'supermanHold',
    surface: 'ground',
    cue: 'Lie on your stomach, arms reaching forward. Lift your arms, chest, and legs off the floor at the same time. Hold, then release.',
  },
  {
    id: 'bear-crawl',
    name: 'Bear Crawl',
    figure: 'bearCrawl',
    surface: 'ground',
    cue: 'On hands and feet, knees hovering just off the floor, hips low. Hold the position, or crawl forward a few steps and back.',
  },
  {
    id: 'burpee',
    name: 'Burpee',
    figure: 'burpeeFlow',
    surface: 'ground',
    cue: 'Squat down and place your hands on the floor, jump or step your feet back into a plank, then jump them back in and explode up into a jump.',
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
    needsWall: true,
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
    figure: 'towelPullOverhead',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Hold a towel overhead with tension between your hands, and pull it down behind your head and back up.',
  },
  {
    id: 'towel-straight-arm-pull',
    name: 'Towel Straight-Arm Pull',
    figure: 'towelPullAcrossFlow',
    surface: 'standing',
    needsFurniture: true,
    sided: true,
    cue: 'Hold a towel with tension, arms straight, and pull down and across your body toward one hip. Keep the arms locked out the whole way.',
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
    figure: 'towelCirclesFlow',
    surface: 'standing',
    needsFurniture: true,
    cue: 'Hold a towel with tension between your hands and trace big, slow circles in the air, both directions.',
  },
  {
    id: 'dead-hang',
    name: 'Dead Hang',
    figure: 'deadHang',
    surface: 'standing',
    needsBar: true,
    cue: 'Hang from a sturdy bar or door-frame pull-up bar, arms straight, shoulders relaxed. Let your spine decompress.',
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    figure: 'pullUpFlow',
    surface: 'standing',
    needsBar: true,
    cue: 'Hang from a bar with arms straight, then pull your chin up and over the bar, elbows driving down and back. Lower with control.',
  },
];

window.exercisesBySurface = function exercisesBySurface(surface) {
  return window.EXERCISES.filter((e) => e.surface === surface);
};
