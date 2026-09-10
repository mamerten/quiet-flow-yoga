# Quiet Flow — Yoga & Calisthenics Timer

A tiny, dependency-free web app for short, guided practices — like Apple Fitness+'s time-based workouts. Two modes, picked with a tab on the home screen:

- **Yoga** — instructor-led. Pick 5, 7, 10, or 15 minutes and it walks you through a sequence of poses, each one timed and auto-advancing, with a 3-2-1 countdown between them.
- **Calisthenics** — self-paced. Same length picker and overall session clock, but *you* decide when to move to the next exercise — say "next", swipe, or tap a button — rather than the app timing each one for you.

**[Live demo →](https://quiet-flow-yoga.matmerten.com)** (also reachable at [quiet-flow-yoga.pages.dev](https://quiet-flow-yoga.pages.dev)) — installable as a home-screen app, and works offline once loaded.

## What it does

- **Pick a length.** 5 / 7 / 10 / 15 minutes, in either mode.
- **Yoga builds a flow for you.** Each practice moves through phases — centering, warm-up, standing poses, balance, seated/twists, and a closing relaxation — pulling poses from a small library and sizing each hold to fit the total time. The sequence is shuffled a bit each time, so repeat practices don't feel identical.
- **Calisthenics is self-paced, with an overall clock.** No per-exercise timer — the app shows one exercise (name, simple illustration, description) and waits for you. A session-length countdown runs in the top bar throughout and ends the session on its own when it reaches zero, however many exercises you got through. Advance three ways: tap the **Next** button, **swipe** anywhere on the card, or (where supported) say **"next"** out loud with the 🎤 button — see [Browser support notes](#browser-support-notes) for voice reliability across devices.
- **A 3-second countdown between exercises, in both modes.** A brief "Get ready for &lt;exercise&gt;" countdown (3-2-1, with its own soft tick and the upcoming move already on screen) gives you a moment to get into position before it narrates the full cue.
- **Audible instructions.** Speaks the pose/exercise name and cue at the start. In Yoga, which auto-advances on its own, it also announces what's coming during the countdown; Calisthenics skips that pre-announcement — you just chose to move on, so it goes straight from the countdown into naming and cueing the exercise.
- **Real neural narration, built in.** Rather than depending on the device's text-to-speech (which is robotic on most phones and on Windows), the app ships pre-generated neural-TTS audio for every line it speaks, in both modes. Two voices are bundled — **Clara** (clear and steady) and **Amy** (warm and soft) — selectable with a **Preview** button. Identical on every device, works offline, no API key and no per-use cost. The device's own text-to-speech is used silently as an automatic fallback if a clip is ever missing — not something you choose, just a safety net.
- **Name only.** A checkbox next to the voice picker trims the spoken guidance down to just the pose/exercise name, skipping the full cue (the written cue stays on screen either way). Works the same in both modes.
- **Left/right balance, in both modes.** One-sided poses/exercises (yoga: Warrior I/II, Triangle, Side Angle, Low Lunge, Tree, Eagle, Warrior III, Seated Twist, Cow Face Arms; calisthenics: Reverse Lunge, World's Greatest Stretch, Couch Stretch, Bird Dog, Dead Bug, Side Plank, Chair Step-Up, and others) are always scheduled as a matched pair, so you never work one side and skip the other. In Yoga, which is timed, the mirrored side is deliberately separated by another pose rather than repeated back-to-back. In Calisthenics, since you're the one deciding when to move on, the mirrored side comes immediately after instead: finish one side, hit Next, and the very next exercise is the other side of the same move (e.g. "Chair Step-Up — Left side" then "Chair Step-Up — Right side").
- **Calisthenics equipment filter.** Two toggles on the home screen — *I have a mat* and *I have a step, chair, or other prop* — persisted between sessions (both default on). With no mat, ground-surface exercises (anything sitting or kneeling on the floor) are excluded entirely; with no prop, anything needing a chair, step, wall, towel, or book is excluded. Every entry in `public/js/exercises.js` is flagged for both.
- **Minimal visuals.** Each pose/exercise has a simple, original stick-figure illustration (inline SVG) with a gentle "breathing" animation, plus the written cue on screen for anyone who can't rely on audio. Calisthenics exercises that are a repeated motion rather than a held position (Push-Up, Jump Squat, Cat-Cow, 90/90 Switch, the towel work, and around twenty more) show 2-4 frames that auto-cycle like a flip book instead of one static frame — see "Animated figures" below.
- **Controls.** Pause/Resume, Skip (Yoga) / Next (Calisthenics), End, plus an overall progress bar and a compact timer in the top bar.
- **Version + source link.** A small footer shows the current version and links back to this repo.
- **Installable, works offline.** A web app manifest + service worker let you add it to your phone's home screen (opens full-screen, no browser chrome) and run a practice with no connection once you've loaded it at least once.

## Why it's built this way

- **Zero build step, zero dependencies.** Plain HTML/CSS/JS, loaded as ordinary `<script>` tags (not ES modules), so it works whether you double-click `index.html` and open it straight from disk, or serve the folder from any static host. Easy to drop straight into a static site (e.g. matmerten.com) or GitHub Pages.
- **No copyrighted media.** All illustrations are small original SVGs authored for this project. Narration is rendered by [Piper](https://github.com/rhasspy/piper), an open-source neural TTS, from [MIT-licensed voice models](https://huggingface.co/rhasspy/piper-voices) — no voice actor recordings, no per-use licensing.
- **Responsive for phones.** Portrait keeps the usual stacked card layout. In landscape on a phone (short, wide viewport), the workout screen splits into two columns — the pose image on the left, the name/cue/timer/controls on the right — so a full practice fits without scrolling.
- **Light/dark mode.** Follows the system's `prefers-color-scheme` automatically — no toggle needed.

## Project structure

```
wrangler.toml               Cloudflare Pages config (build output = public/)
public/index.html           Screens: home, active workout, complete
public/css/style.css        All styling, incl. the phone-landscape split layout and dark mode
public/js/poses.js          Yoga pose repository (name, cue, category, default duration, figure)
public/js/workout.js        Builds a timed yoga sequence for a given number of minutes
public/js/exercises.js      Calisthenics exercise repository (name, cue, surface, figure)
public/js/calisthenics-workout.js  Self-paced exercise sequencer (see "Calisthenics mode" below)
public/js/figures.js        Simple stick-figure SVG templates, reused across poses/exercises
public/js/speech.js         Text-to-speech, chime/tick sounds, and the shared AudioContext (Web Speech / Web Audio API)
public/js/voice.js          Plays the pre-generated narration clips (silent device-TTS fallback)
public/js/voice-control.js  Optional "say next" hands-free control (Calisthenics mode; Web Speech SpeechRecognition)
public/audio/                Pre-generated neural narration, one folder per voice pack
tools/generate-voice.py     Build-time script that renders public/audio/ with Piper
public/js/app.js            Screen/timer/countdown state machine and UI wiring
public/manifest.json        Web app manifest (installable home-screen app)
public/sw.js                Service worker: caches the app shell for offline use
public/icons/                App icons (192/512/512-maskable/apple-touch) + favicon.svg
```

## Calisthenics mode

Unlike Yoga (instructor-led — each pose is timed and the app advances on its
own), Calisthenics is self-paced: `js/calisthenics-workout.js` hands out one
exercise at a time from `js/exercises.js` on request rather than
pre-building a fixed, timed sequence. There's still an overall session
clock (same 5/7/10/15-minute picker as Yoga) counting down in the top bar
throughout — it's just that *you* decide when to move to the next exercise,
by tapping **Next**, swiping the card, or saying **"next"** — not a timer
per exercise. The session ends automatically when the overall clock runs
out, whichever exercise you're on. Because pacing is self-controlled, the
countdown skips the spoken "up next" line yoga uses (see [What it does](#what-it-does))
and one-sided exercises pair left/right back-to-back rather than deferred.

Two toggles on the home screen — *I have a mat* and *I have a step, chair,
or other prop* — filter which exercises the sequencer can hand out; see
`createCalisthenicsSequencer()` in `public/js/calisthenics-workout.js`.

The exercise library (`public/js/exercises.js`) is mostly drawn directly
from what [Markus Kneissl (@markus.moves)](https://www.instagram.com/markus.moves/),
a no-gym mobility/strength coach, actually teaches — his belly-pooch flow,
shoulder routine, posture routine, morning mobility flow, bedtime
hip-release flow, towel routine, and named strength circuit. His content
doesn't use consistent cute names, so the names/descriptions in this app
are original. A handful of standard bodyweight staples (Plank Hold,
Mountain Climber, Couch Stretch, Bird Dog Reach, Side Plank Hold) round out
the library even though they're not verbatim from a specific post.

## Extending the pose/exercise libraries

Add an entry to `POSES` in [`public/js/poses.js`](public/js/poses.js) (Yoga):

```js
{
  id: 'unique-id',
  name: 'Pose Name',
  sanskrit: 'Optional Sanskrit Name',
  category: 'centering' | 'warmup' | 'standing' | 'balance' | 'seated' | 'relaxation',
  figure: 'one of the keys in public/js/figures.js',
  duration: 30, // default hold time in seconds (use ~25 for one-sided poses)
  sided: true,  // OPTIONAL: one-sided pose, auto-scheduled as a left/right pair
  cue: 'What gets spoken and displayed for this pose.',
}
```

Or to `EXERCISES` in [`public/js/exercises.js`](public/js/exercises.js) (Calisthenics — a deliberately different shape, since it's self-paced and has no fixed hold time):

```js
{
  id: 'unique-id',
  name: 'Exercise Name',
  figure: 'one of the keys in public/js/figures.js',
  surface: 'standing' | 'ground', // exactly one — gated by the "I have a mat" toggle
  needsFurniture: true, // OPTIONAL: chair/wall/towel/etc — gated by the "I have a step..." toggle
  sided: true,           // OPTIONAL: one-sided, auto-scheduled as a left/right pair
  cue: 'What gets spoken and displayed for this exercise.',
}
```

After adding or editing either one, regenerate the narration audio so the
spoken cue matches:

```bash
pip install piper-tts imageio-ffmpeg
python tools/generate-voice.py
```

The script reads both `public/js/poses.js` and `public/js/exercises.js`
directly, renders every clip (including `left`/`right` variants for
one-sided entries) for each bundled voice, names files by content hash so
edits can't be served stale, and deletes clips that are no longer
referenced.

If a pose name ends in a bare Roman numeral (`Warrior I`, `Warrior II`) —
correct on screen, but TTS reads a lone `I` as the pronoun and `II`/`III` as
nonsense — both the generator and the device-voice fallback in
`public/js/app.js` (`spokenPoseName`) convert it to the spoken word (`Warrior
One`) automatically. No action needed when adding a similarly-named pose;
keep the two conversion tables in sync if you ever add a `IV`/`V`.

Both the Yoga workout generator and the Calisthenics sequencer pick up new
entries in their respective files automatically — no other changes needed.
To add a new illustration, add an entry to `FIGURES` in
`public/js/figures.js`. The yoga set still shares a handful of templates
across similar poses, which is intentional — it matches the low level of
visual detail elsewhere in the app. The Calisthenics set does not: every
exercise has its own figure, because sharing them there had produced pairs
that were byte-identical on screen despite being different exercises
(Plank Hold and Scapular Push-Up, Lying Knee Drops and Windshield Wipers,
and four more).

### Drawing a figure

Calisthenics figures are built with `stick()`, which takes named joints —
`head`, `neck`, `hip`, optional `shoulders`, and `arms`/`legs` as
`[elbow, hand]` / `[knee, foot]` pairs — and draws the segments between
them in a fixed back-to-front order. Each segment is a filled tapered
capsule (`BONE`), not a stroked line: it narrows toward the far end and
hands its end radius to the next segment down the limb, so a thigh flows
into a shin without a visible seam and the figure reads as a body rather
than as uniform wire. All the thicknesses live in one `W` table at the top
of the file, so the whole set can be made heavier or lighter by editing
that alone. Going through it rather than placing
lines by hand is what keeps heads attached to necks and arms hanging off
shoulders instead of out of the skull. It also takes `prop` (scenery drawn
behind the body: `GROUND`, `MAT`, a chair, a wall, a bar), `extra` (drawn
on top: a tucked foot, a `TOWEL`), and `spineBow` for a curved back.

Three conventions worth keeping to, all learned by rendering the whole set
and looking at it:

- **Pick the camera angle the exercise needs.** Anything that folds,
  hinges, squats or planks goes side-on — a forward fold drawn head-on is
  an unreadable blob. Anything about what the legs do relative to each
  other while lying down (knee drops, wipers, 90/90, bicycle, frog) goes
  overhead, on a `MAT` outline so it doesn't read as standing up.
- **Draw the floor.** `GROUND` is the only thing that tells you a Jump
  Squat is airborne, a Calf Raise has its heels up, or a Bear Crawl's knees
  are hovering. Without it those are just shapes.
- **Hold the still parts still.** In a flip book, keep the parts that don't
  move byte-identical across frames so the eye tracks only what actually
  moves.

Before committing a figure, render it and look at it:

```bash
node tools/render-figures.js              # all Calisthenics figures, light
node tools/render-figures.js --mode=yoga --dark
node tools/render-figures.js --only=plank,catCowFlow
```

That writes a labelled contact sheet PNG with flip-book frames expanded side
by side. Every problem listed above was invisible in the source and obvious in
the sheet. It needs Playwright's chromium (`npm i -D playwright && npx
playwright install chromium`); it's a dev tool and ships nothing to the
browser.

### Animated figures

Most `FIGURES` entries are a single static `svg(...)`. For exercises that
are a repeated motion rather than a held position, wrap 2-4 frames (each
written the same way a single `svg()` call's argument is) in
`animatedFigure([...])` instead:

```js
jumpSquatFlow: animatedFigure([
  stick({ /* ...crouch, feet on GROUND... */ }),
  stick({ /* ...airborne, feet clear of the same GROUND line... */ }),
]),
```

This renders as a `<div class="figure-frames">` containing all the frames
stacked on top of each other, auto-cycling via pure CSS (`.figure-frames`
in `public/css/style.css`) — no JS timer, and nothing in `app.js` needs to
know or care whether a figure is static or animated. Keep frame count to
2-4 (that's all the CSS defines keyframes for) and keep coordinates in the
same rough scale/position across frames so the cycle doesn't jump jarringly.

## Running locally

Just open [`public/index.html`](public/index.html) directly in a browser (double-click it, or drag it into a browser window) — no server required.

You can also serve the `public/` folder over HTTP if you prefer, e.g.:

```bash
npx serve public
```

or via Wrangler, matching how it runs in production:

```bash
npm run dev
```

## Deployment

Cloudflare Pages, building from the connected GitHub repo:

- **Build output directory:** `public` (see `wrangler.toml`)
- **Build command:** none — this is a static site, no build step
- **Framework preset:** None

A manual deploy from your machine is also available: `npm run deploy` (requires `wrangler login` once).

## Browser support notes

- **Narration** normally needs no browser support at all: the bundled Clara and Amy voices are plain audio files, so they sound identical everywhere and work offline. If a clip is ever missing or fails to play, the app falls back silently to the device's own [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) voice (Chrome, Edge, Safari; partial in Firefox) — this isn't a setting you pick, just a safety net so narration doesn't go silent. If neither audio nor speech is available, the on-screen written cue still guides the practice.
- **Voice control ("say next")**, Calisthenics mode only, uses [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) — solid in Chrome/Edge (desktop and Android) and supported in Safari (as `webkitSpeechRecognition`) since iOS/iPadOS 14.5; Firefox ships it disabled behind a flag. Where it's unsupported the 🎤 button is hidden entirely rather than shown broken — swiping or tapping **Next** always works everywhere, mic or no mic. It needs a mic-permission prompt (must be started from a tap) and auto-restarts itself if the browser silently stops listening after a pause in speech, which several mobile browsers do even in continuous mode.
- **Keep-awake** uses the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) where available, so the screen doesn't dim mid-practice; it degrades gracefully where unsupported.
- **Offline/installable** requires a Service Worker, which needs `http(s)` — it's skipped (silently, no error) when opening `index.html` straight from disk via `file://`. Bump `SHELL_CACHE` in `public/sw.js` whenever a cached file changes, so returning visitors pick up the update instead of serving a stale cached copy.

## License

MIT — see [LICENSE](LICENSE). Not a substitute for professional medical or fitness advice; practice within your own limits.
