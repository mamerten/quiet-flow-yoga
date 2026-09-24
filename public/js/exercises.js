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
// toe/ankle isometric hold (Kneeling Ankle Stretch, first named Toe Flexor
// Hold after the tissue it stretches; renamed because that name told nobody
// what the exercise was, and the ankle is where it actually gets felt). Three
// more (Squat Knee Drops, Squat Hip Pulses, Squatting Heel Raise) come from a
// Markus deep-squat mobility reel; that reel's fourth move, "deep squat
// folds", is already in here as Squat Fold.
//
// A later pass (Pull-Up, Hollow Body Hold, Superman Hold, Calf Raises,
// Curtsy Lunge, Bear Crawl, Cat-Cow, Burpee) filled in gaps the library
// otherwise had no coverage for at all — pulling strength, calf/ankle
// work, lateral lunging, locomotion, a core "anti-pair" beyond Plank Hold,
// and (oddly, given how foundational it is) Cat-Cow — rather than being
// sourced from any one place; these are standard, widely-taught bodyweight
// moves. Everything else in the file is Markus's.
//
// The kickboxing set (Jab-Cross, Hooks, Uppercuts, Bob and Weave, Front
// Kicks, Roundhouse Kicks, Knee Strikes, Side Kicks) is standard
// shadowboxing, chosen for cardio variety rather than taken from any one
// source: no bag, no gloves, all standing, and every move alternates on the
// spot, so none of them is a left/right pair.
//
// Crab Reach, A-Skips, Deep Squat Reach, Front Arm Circles, Good Mornings,
// Open the Gate and 90/90 Fold come from one five-minute mobility reel. Three
// of them land close to something already here and are kept deliberately
// distinct: Deep Squat Reach Upward plants a hand on the floor and reaches
// straight up, where Squat and Twist keeps both hands free and turns right
// around; Open the Gate whips the knee through a full circle where Standing
// Hip Opener eases it open and pauses there, and its figure cycles at double
// speed to say so; and 90/90 Rotate and Fold turns and folds where the other
// three 90/90s only switch sides.
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
//   mixedSides     optional: true if both sides are worked inside the one
//                  set, left and right mixed together as you go - the
//                  kickboxing moves. Not paired and not scheduled any
//                  differently; it exists so the exercise reference can say
//                  "Mixed" instead of "Single", which read as one side only.
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
    id: 'squat-knee-drops',
    name: 'Squat Knee Drops',
    figure: 'squatKneeDropFlow',
    surface: 'standing',
    cue: 'Sink into a deep squat with your feet fairly close together and your hands clasped in front of your chest. Let one knee sink in toward the floor while both feet stay flat, then bring it back up and let the other one sink. Side to side, slow and controlled.',
  },
  {
    id: 'squat-hip-pulses',
    name: 'Squat Hip Pulses',
    figure: 'squatHipPulseFlow',
    surface: 'standing',
    cue: 'Sink into a deep squat with your arms reaching forward for balance. Press both knees out wide, then let them come back in, and keep pulsing out and in without standing up. Small range, steady pace.',
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
    cue: 'Cross one arm over and rest your fingers on the opposite collarbone, keep your ribs down, and look up and away from that hand. Alternate sides as you go. Unloads a stiff, forward-jutted neck.',
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
    cue: 'Sink into a squat and keep both hands free. Holding your hips low and square, turn your chest around to one side and sweep that arm away behind you at shoulder height, looking back past your hand as far as you can see. Come back to the middle and twist around the other way.',
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
    id: 'push-up-lunge-reach',
    name: 'Push-Up Lunge Reach',
    figure: 'pushUpLungeReachFlow',
    surface: 'ground',
    cue: 'Do a push-up. At the top, step one foot up beside your hand and lift that same hand off the floor, reaching it forward. Step back to plank, do another push-up, and switch sides each rep.',
  },
  {
    id: 'crawl-position-push-up',
    name: 'Crawl Position Push-Up',
    figure: 'crawlPushUpFlow',
    surface: 'ground',
    cue: 'Get into a crawl position on your hands and feet with your hips high and your knees pulled forward toward your elbows, hovering just off the floor. Bend your elbows and lower your head toward the floor between your hands, keeping your knees off the ground, then press back up.',
  },
  {
    id: 'cross-body-foot-tap',
    name: 'Cross-Body Foot Tap',
    figure: 'crossBodyFootTapFlow',
    surface: 'ground',
    cue: 'Start on your hands and knees with your toes tucked under. Lift one hand and reach it back and across your body to tap your opposite foot, letting your hips lift high into the air as you reach. Both feet stay planted on the floor. Put that hand down and tap with the other one, alternating as you go.',
  },
  {
    id: 'reverse-tabletop-hold',
    name: 'Reverse Tabletop Hold',
    figure: 'reverseTabletop',
    surface: 'ground',
    cue: 'Sit with your knees bent and feet flat, hands on the floor behind you with your fingers toward your feet. Press your hips up until they are level with your knees and your body forms a flat table. Squeeze your glutes and hold.',
  },
  {
    id: 'bear-to-crab',
    name: 'Bear to Crab',
    figure: 'bearToCrabFlow',
    surface: 'ground',
    cue: 'Start in a bear, on hands and feet with your knees hovering just off the floor. Lift one hand and turn through onto your back into a crab with your hips up, then turn back into the bear. Alternate the direction you turn each time.',
  },
  {
    id: 'pike-push-up',
    name: 'Pike Push-Ups',
    figure: 'pikePushUpFlow',
    surface: 'ground',
    cue: 'From a plank, walk your feet in and lift your hips high into an upside-down V. Bend your elbows to lower the top of your head toward the floor between your hands, then press back up, keeping your hips high throughout.',
  },
  {
    id: 'spiderman-push-up',
    name: 'Spiderman Push-Ups',
    figure: 'spidermanPushUpFlow',
    surface: 'ground',
    cue: 'Do a push-up, and as you lower, draw one knee out to the side and up toward that same elbow. Press back up as the leg returns, and switch sides each rep.',
  },
  {
    id: 'wide-push-up',
    name: 'Wide Push-Ups',
    figure: 'widePushUpFlow',
    surface: 'ground',
    cue: 'Set your hands well wider than your shoulders and do a push-up, lowering your chest between your hands with your body in one straight line. Press back up with control.',
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
    cue: 'From a deep kneeling lunge — front foot planted, back knee down — place both hands inside your front foot. Rotate your torso and reach the arm on the same side as your front foot straight up toward the ceiling, following it with your eyes. Move slow enough to control the range.',
  },
  {
    id: 'couch-stretch',
    name: 'Couch Stretch',
    figure: 'couchStretch',
    surface: 'ground',
    needsWall: true,
    cue: 'Kneel with your back knee in the corner where the floor meets a wall, and let that shin run up the wall behind you. Plant your other foot forward, knee bent about 90 degrees. Sink your hips down, squeeze the back glute, and bring your chest upright. Hold, then switch sides halfway through. A deep stretch through the front of the hip and thigh.',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    figure: 'birdDog',
    surface: 'ground',
    cue: 'From hands and knees, reach one arm forward and extend the opposite leg back. Keep your hips level and steady, alternating sides each rep.',
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
    name: "Child's Pose",
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
    id: 'seated-scapular-slides',
    name: 'Seated Scapular Slides',
    figure: 'seatedScapSlideFlow',
    surface: 'ground',
    cue: 'Sit cross-legged and tall, arms out to the sides with your elbows bent and palms forward. Slide your arms straight up overhead, reaching tall without letting your ribs flare or your shoulders climb toward your ears, then lower back down. Slow and controlled.',
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
    id: 'beast-kickthrough',
    name: 'Beast Kickthrough',
    figure: 'beastKickthroughFlow',
    surface: 'ground',
    cue: 'From hands and feet with your knees hovering, lift one foot and the opposite hand off the floor. Rotate your hips and kick that leg through underneath you toward the side your hand came off, keeping the other hand and foot planted. Return, and alternate sides each rep.',
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
    cue: 'Sit tall with both knees bent at 90 degrees, one leg in front of you and the other out to the side behind you, hands on the floor for support. Lift your knees and swing them over to the other side, turning your chest with them so your whole torso rotates 90 degrees to face the new front leg.',
  },
  {
    id: 'ninety-ninety-overhead',
    name: '90/90 Switch, Arms Overhead',
    figure: 'ninetyNinetyOverheadFlow',
    surface: 'ground',
    cue: 'Sit tall with both knees bent and your arms stretched straight overhead, hands clasped. Swing your knees from one side to the other without putting a hand down, keeping your chest lifted the whole time.',
  },
  {
    id: 'ninety-ninety-elbow-switch',
    name: '90/90 Elbow Switch',
    figure: 'ninetyNinetyElbowFlow',
    surface: 'ground',
    cue: 'Sit tall in a 90/90 with your forearms up in front of your chest and both hands off the floor. Swing your knees over to the other side and back, turning your chest with them, keeping the arms where they are so the hips do all the work. Slow and controlled.',
  },
  {
    id: 'z-sit-lift',
    name: 'Z-Sit Lift',
    figure: 'zSit',
    surface: 'ground',
    sided: true,
    cue: 'Sit with both legs folded to the same side in a Z shape, front knee bent in front of you and back knee bent out to the side, both knees pointing the same way. Press your hands into the floor beside your hips and lift your hips slightly, then lower with control.',
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
    cue: 'From a low lunge, reach one arm forward, then rotate your torso open and sweep that arm straight back at shoulder height, following it with your eyes. Bring it forward again and repeat, slow and controlled.',
  },
  {
    id: 'kneeling-ankle-stretch',
    name: 'Kneeling Ankle Stretch',
    figure: 'kneelingAnkleStretch',
    surface: 'ground',
    sided: true,
    cue: 'Kneel on one knee with the toes of that foot tucked under and the heel pointing straight up. Front foot flat, hands on the floor for balance. Sit your weight back over the tucked foot until the stretch builds through the ball of the foot, the arch, and up into the ankle. Hold and breathe.',
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
    id: 'two-leg-side-sweep',
    name: 'Two-Leg Side Sweep',
    figure: 'twoLegSweepFlow',
    surface: 'ground',
    cue: 'Sit propped back on your hands, legs straight out in front. Put a shoe or a cushion on the floor ahead of you to clear — or just pick a spot. Lift both legs together and sweep them across to one side of it, then back across to the other, keeping them straight and off the floor the whole way.',
  },
  {
    id: 'single-leg-side-sweep',
    name: 'Single-Leg Side Sweep',
    figure: 'singleLegSweepFlow',
    surface: 'ground',
    cue: 'Sit propped back on your hands, legs straight out in front. Put a shoe or a cushion on the floor ahead of you to clear — or just pick a spot. Lift one leg and sweep it across over that marker and back, alternating legs, without letting either heel touch down.',
  },
  {
    id: 'single-leg-rdl',
    name: 'Single-Leg Romanian Deadlift',
    figure: 'singleLegRdlFlow',
    surface: 'standing',
    sided: true,
    cue: 'Stand on one leg with a soft knee. Hinge forward from the hip, letting your other leg reach straight back as your chest lowers, until your body is close to level. Keep your hips square to the floor, then squeeze the standing glute to come back up.',
  },
  {
    id: 'touch-the-potato',
    name: 'Touch the Potato',
    figure: 'touchPotatoFlow',
    surface: 'standing',
    cue: 'Balance on one foot and picture potatoes scattered on the floor in a circle around you. Reach out with your free foot and tap each one lightly, in front, to the side, and behind, without putting that foot down between taps. Keep a soft bend in the standing knee. Switch feet halfway through.',
  },
  {
    id: 'standing-hip-opener',
    name: 'Standing Hip Opener',
    figure: 'hipOpenerFlow',
    surface: 'standing',
    cue: 'Stand tall with your hands on your hips. Lift one knee up in front of you, then open it out to the side as slowly as you can, pausing at the end of the range before you set the foot down. Stay in control the whole way and keep the standing leg quiet. Alternate legs.',
  },
  {
    id: 'squat-and-reach',
    name: 'Squat and Reach',
    figure: 'squatReachFlow',
    surface: 'standing',
    cue: 'Sink down into a squat, reaching both arms straight up overhead as you go and keeping your chest lifted. Stand back up as your arms come down, and repeat.',
  },
  {
    id: 'lunge-crunch',
    name: 'Lunge Crunch',
    figure: 'lungeCrunchFlow',
    surface: 'standing',
    cue: 'With your hands behind your head, step one foot back into a lunge. As you stand, drive that back knee up in front of you and crunch your elbow down to meet it. Alternate legs each rep.',
  },
  {
    id: 'standing-torso-twist',
    name: 'Standing Torso Twist',
    figure: 'torsoTwistFlow',
    surface: 'standing',
    cue: 'Stand with your feet hip-width apart and your hands on your hips. Keeping your hips facing forward, turn your chest and shoulders to one side and then the other, in a smooth, steady rhythm.',
  },
  {
    id: 'single-leg-hops',
    name: 'Single-Leg Hops',
    figure: 'singleLegHopFlow',
    surface: 'standing',
    cue: 'Balance on one foot and hop in place with small, springy hops, landing softly on the ball of your foot with the knee a little bent. Switch feet halfway through.',
  },
  {
    id: 'pistol-squat-hold-45',
    name: '45-Degree Pistol Squat Hold',
    figure: 'pistolSquatHold',
    surface: 'standing',
    cue: 'Stand on one leg and hold the other straight out in front of you, just off the floor. Sit your hips back until the standing knee is bent about 45 degrees, arms reaching forward for balance, and hold. Switch legs halfway through.',
  },
  {
    id: 'standing-quad-stretch',
    name: 'Standing Quad Stretch',
    figure: 'standingQuadStretch',
    surface: 'standing',
    cue: 'Stand tall on one leg, bend the other knee, and hold that ankle behind you, drawing the heel toward your glute. Keep your knees close together and your hips tucked under, and reach the free arm out in front for balance. Hold, then switch legs halfway through.',
  },
  {
    id: 'wall-ankle-stretch',
    name: 'Wall Ankle Stretch',
    figure: 'wallAnkleStretch',
    surface: 'standing',
    needsWall: true,
    cue: 'Face a wall and set the ball of one foot up against it, heel on the floor. Keeping that heel down, drive your knee forward toward the wall until you feel the stretch through your ankle and calf. Hold, then switch feet halfway through. A step or any sturdy edge works too.',
  },
  {
    id: 'windmill',
    name: 'Windmill',
    figure: 'windmillFlow',
    surface: 'standing',
    cue: 'Stand with your feet wide and your arms straight out in a T. Rotate and fold down to touch one foot with the opposite hand, letting the other arm reach up toward the ceiling. Come back to the T and alternate sides.',
  },
  {
    id: 'kneeling-shoulder-rocks',
    name: 'Kneeling Shoulder Rocks',
    figure: 'kneelingShoulderRockFlow',
    surface: 'ground',
    cue: 'Kneel and walk your hands out wide on the floor, head relaxed down. Keeping your hands planted, slowly rock your body over to one side and then the other, easing into a stretch through each shoulder in turn.',
  },
  {
    id: 'kneeling-thoracic-rotation',
    name: 'Kneeling Thoracic Rotation',
    figure: 'kneelingThoracicRotationFlow',
    surface: 'ground',
    cue: 'Kneel, sit back toward your heels and fold forward, lacing your hands behind your head with both elbows dropping toward the floor. Open one elbow up toward the ceiling, following it with your eyes, then lower it and alternate sides.',
  },
  {
    id: 'squat-roll-hip-lift',
    name: 'Squat Roll to Hip Lift',
    figure: 'squatRollHipLiftFlow',
    surface: 'ground',
    cue: 'Squat on the balls of your feet with your heels up and your hands on the floor behind you. Roll forward, lowering your knees to the floor with your toes tucked flat underneath, then lift your hips up and forward as you open the front of your body. Roll back into the squat and repeat.',
  },
  {
    id: 'kneeling-hip-hinge',
    name: 'Kneeling Hip Hinge',
    figure: 'kneelingHipHingeFlow',
    surface: 'ground',
    cue: 'Kneel tall on both knees with the tops of your feet flat on the floor and your hips stacked over your knees. Keeping your back flat and your ribs down, push your hips back and let your chest travel forward, then squeeze your glutes to drive the hips forward and stand tall on your knees again.',
  },
  {
    id: 'toe-squat-hold',
    name: 'Toe Squat Hold',
    figure: 'toeSquatHold',
    surface: 'standing',
    cue: 'Squat all the way down onto the balls of your feet with your heels lifted, balancing there with your arms reaching forward and your hands off the floor. Let the stretch work through your toes and the soles of your feet. Hold and breathe.',
  },
  {
    id: 'squatting-heel-raise',
    name: 'Squatting Heel Raise',
    figure: 'squattingHeelRaiseFlow',
    surface: 'standing',
    cue: 'Sink into a deep squat with your feet flat and your arms reaching forward for balance. Lift both heels until you are up on the balls of your feet, then lower them back down with control. Stay down in the squat the whole time.',
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
    cue: 'Step one foot up onto a sturdy chair or step and drive up through that heel until you are standing on it, then step down with control. Alternate legs each rep.',
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
    cue: 'Hold a towel with tension, arms straight, and pull down and across your body toward one hip, alternating sides. Keep the arms locked out the whole way.',
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
    id: 'crab-reach',
    name: 'Crab Reach',
    figure: 'crabReachFlow',
    surface: 'ground',
    mixedSides: true,
    cue: 'Sit with your knees bent and feet flat, hands on the floor behind you, and press your hips up into a tabletop. Lift one hand and reach it back over your head, turning your chest up toward the ceiling and following the hand with your eyes. Plant it again and reach with the other hand, alternating as you go.',
  },
  {
    id: 'a-skips',
    name: 'A-Skips',
    figure: 'aSkipFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Skip on the spot. Drive one knee up above hip height as you push off the ball of the other foot, swinging the opposite arm forward. Land soft and drive the other knee up. Quick, light and springy.',
  },
  {
    id: 'deep-squat-reach-upward',
    name: 'Deep Squat Reach Upward',
    figure: 'squatOpenReachFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Sink into a wide, deep squat with your feet flat. Plant one hand on the floor between your feet, then open your chest and reach the other arm straight up toward the ceiling, following it with your eyes. Come back down, swap hands, and reach with the other arm.',
  },
  {
    id: 'front-arm-circles',
    name: 'Front Arm Circles',
    figure: 'frontArmCircleFlow',
    surface: 'standing',
    cue: 'Stand tall with your arms down by your sides. Swing both arms forward and all the way up overhead, brushing past your ears, then carry them back and around in one big circle. Keep your elbows straight and make the circle as big as your shoulders will allow.',
  },
  {
    id: 'good-mornings',
    name: 'Good Mornings',
    figure: 'goodMorningFlow',
    surface: 'standing',
    cue: 'Stand with your feet hip width and your hands behind your head, elbows wide. Keeping your back flat and a soft bend in your knees, push your hips back and hinge your chest forward until your torso is about parallel to the floor. Squeeze your glutes to stand back up.',
  },
  {
    id: 'open-the-gate',
    name: 'Open the Gate',
    figure: 'openGateFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Stand tall with your arms out to the sides for balance. Drive one knee up and whip it out and around to the side in one fast circle, as if kicking a gate open, and plant the foot back down. Go straight into the other leg. This one is quick and punchy, not slow and careful.',
  },
  {
    id: 'ninety-ninety-rotate-fold',
    name: '90/90 Rotate and Fold',
    figure: 'ninetyNinetyFoldFlow',
    surface: 'ground',
    mixedSides: true,
    cue: 'Sit in a 90/90, with one shin in front of you and the other out to the side behind you, both knees bent square. Turn your torso toward the back leg, reaching both hands to the floor beside it and looking behind you over that shoulder, then come back up tall. Switch which leg is in front halfway through.',
  },
  {
    id: 'jab-cross',
    name: 'Jab-Cross',
    figure: 'jabCrossFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Stand with one foot forward, knees soft, fists up by your chin. Snap your lead hand straight out, then drive your rear hand out as you turn your hips and pivot your back foot. Bring each hand straight back to your chin. Quick and light.',
  },
  {
    id: 'hooks',
    name: 'Hooks',
    figure: 'hookFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Stand with one foot forward, knees soft, fists up by your chin. Lift one elbow to shoulder height and swing that fist in a flat arc across in front of you, turning your hips with it. Back to guard, then hook with the other hand.',
  },
  {
    id: 'uppercuts',
    name: 'Uppercuts',
    figure: 'uppercutFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Stand with one foot forward, fists up by your chin. Dip your knees, then drive one fist upward in front of you as if under a chin, pushing up through your legs. Back to guard, then the other hand.',
  },
  {
    id: 'bob-and-weave',
    name: 'Bob and Weave',
    figure: 'bobWeaveFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Stand with your feet wide and your fists up by your chin. Bend your knees and duck your head down and across in a U shape, as if slipping under a punch, then come up on the other side. Keep your eyes forward and your hands up.',
  },
  {
    id: 'front-kicks',
    name: 'Front Kicks',
    figure: 'frontKickFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Fists up by your chin. Lift one knee high, then snap that foot straight out in front of you at hip height, pushing through the ball of your foot. Pull it back, set it down, and kick with the other leg.',
  },
  {
    id: 'roundhouse-kicks',
    name: 'Roundhouse Kicks',
    figure: 'roundhouseKickFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Stand with one foot forward and your fists up. Pivot on your standing foot and swing your other leg around sideways, striking with your shin at hip height as your body leans away. Set it down and switch legs.',
  },
  {
    id: 'knee-strikes',
    name: 'Knee Strikes',
    figure: 'kneeStrikeFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Reach both hands up in front of you as if taking hold of someone by the shoulders. Drive one knee up hard toward your chest while pulling your hands down to meet it. Set it down and drive the other knee.',
  },
  {
    id: 'side-kicks',
    name: 'Side Kicks',
    figure: 'sideKickFlow',
    surface: 'standing',
    mixedSides: true,
    cue: 'Fists up by your chin. Draw one knee up across your body, then push that heel straight out to the side, leaning your body away from the kick. Pull the knee back in, set it down, and switch legs.',
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
