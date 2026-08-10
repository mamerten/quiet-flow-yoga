# Quiet Flow — Yoga Timer

A tiny, dependency-free web app for short, guided yoga practices — like Apple Fitness+'s time-based workouts, but yoga-only. Pick 5, 7, 10, or 15 minutes, and it narrates you through a sequence of poses with a simple reference image for each, a 3-2-1 countdown between poses, and optional background sound.

**[Live demo →](https://quiet-flow-yoga.matmerten.com)** (also reachable at [quiet-flow-yoga.pages.dev](https://quiet-flow-yoga.pages.dev)) — installable as a home-screen app, and works offline once loaded.

## What it does

- **Pick a length.** 5 / 7 / 10 / 15 minutes.
- **It builds a flow for you.** Each practice moves through phases — centering, warm-up, standing poses, balance, seated/twists, and a closing relaxation — pulling poses from a small library and sizing each hold to fit the total time. The sequence is shuffled a bit each time, so repeat practices don't feel identical.
- **A 3-second countdown between poses.** Before each pose starts, a brief "Get ready for &lt;pose&gt;" countdown (3-2-1, with its own soft tick and the upcoming pose already on screen) gives you a moment to get into position.
- **Audible instructions.** Uses the browser's built-in text-to-speech (Web Speech API) to speak the pose name and cue at the start of each pose — no audio files, no recording, no hosting cost.
- **Pick your narration voice.** Voice quality comes from whatever the device/OS ships, and the difference between a legacy voice and a neural one is night and day. The app ranks the available voices (neural/"Enhanced"/"Premium"/"Natural" engines first, classic robotic engines and novelty voices last, female-sounding names preferred as a tiebreaker), marks the best one **recommended**, and lets you audition any of them with a **Preview** button. Your choice is remembered.
- **Optional background music.** None (default), None (exercise title only), Soft Piano, Gentle Strings, or Wind Chimes — a slow, quiet four-chord loop played back three different ways, generated on the fly with the Web Audio API. Runs independently of narration, so both play together, with narration mixed slightly under the music so neither drowns out the other. *Exercise title only* trims the spoken guidance down to just the pose name (the written cue stays on screen).
- **Minimal visuals.** Each pose has a simple, original stick-figure illustration (inline SVG) with a gentle "breathing" animation, plus the written cue on screen for anyone who can't rely on audio.
- **Controls.** Pause/Resume, Skip, End, plus an overall progress bar, a compact timer in the top bar once a pose is live, and a per-pose countdown/timer.
- **Version + source link.** A small footer shows the current version and links back to this repo.
- **Installable, works offline.** A web app manifest + service worker let you add it to your phone's home screen (opens full-screen, no browser chrome) and run a practice with no connection once you've loaded it at least once.

## Why it's built this way

- **Zero build step, zero dependencies.** Plain HTML/CSS/JS, loaded as ordinary `<script>` tags (not ES modules), so it works whether you double-click `index.html` and open it straight from disk, or serve the folder from any static host. Easy to drop straight into a static site (e.g. matmerten.com) or GitHub Pages.
- **No copyrighted media.** All illustrations are small original SVGs authored for this project; all narration and background music are generated locally (speech synthesis + Web Audio), not recordings.
- **Responsive for phones.** Portrait keeps the usual stacked card layout. In landscape on a phone (short, wide viewport), the workout screen splits into two columns — the pose image on the left, the name/cue/timer/controls on the right — so a full practice fits without scrolling.
- **Light/dark mode.** Follows the system's `prefers-color-scheme` automatically — no toggle needed.

## Project structure

```
wrangler.toml         Cloudflare Pages config (build output = public/)
public/index.html     Screens: home, active workout, complete
public/css/style.css  All styling, incl. the phone-landscape split layout and dark mode
public/js/poses.js    The pose repository (name, cue, category, default duration, figure)
public/js/figures.js  A handful of simple stick-figure SVG templates, reused across poses
public/js/workout.js  Builds a timed sequence of poses for a given number of minutes
public/js/speech.js   Text-to-speech, chime/tick sounds, and the shared AudioContext (Web Speech / Web Audio API)
public/js/music.js    Optional procedural background music tracks (Web Audio API)
public/js/app.js      Screen/timer/countdown state machine and UI wiring
public/manifest.json  Web app manifest (installable home-screen app)
public/sw.js          Service worker: caches the app shell for offline use
public/icons/         App icons (192/512/512-maskable/apple-touch) + favicon.svg
```

## Extending the pose library

Add an entry to `POSES` in [`public/js/poses.js`](public/js/poses.js):

```js
{
  id: 'unique-id',
  name: 'Pose Name',
  sanskrit: 'Optional Sanskrit Name',
  category: 'centering' | 'warmup' | 'standing' | 'balance' | 'seated' | 'relaxation',
  figure: 'one of the keys in public/js/figures.js',
  duration: 30, // default hold time in seconds
  cue: 'What gets spoken and displayed for this pose.',
}
```

The workout generator picks up new poses automatically — no other changes needed. To add a new illustration, add a template to `FIGURES` in `public/js/figures.js`.

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

- **Spoken instructions** require the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (supported in Chrome, Edge, Safari; partial in Firefox). If unsupported, the app falls back to on-screen text only. **Voice quality is supplied entirely by the OS** — a web app cannot bundle its own TTS voice without a paid cloud service. If every option in the Voice dropdown still sounds robotic, install a better voice at the OS level and it will show up in the list: iOS/iPadOS *Settings → Accessibility → Spoken Content → Voices* (download an **Enhanced** or **Premium** voice); Android *Settings → Accessibility → Text-to-speech* (use **Google Speech Services**); Windows *Settings → Time & language → Speech* (add a **Natural** voice — the stock David/Zira/Mark voices are the old robotic engine).
- **Keep-awake** uses the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) where available, so the screen doesn't dim mid-practice; it degrades gracefully where unsupported.
- **Offline/installable** requires a Service Worker, which needs `http(s)` — it's skipped (silently, no error) when opening `index.html` straight from disk via `file://`. Bump `SHELL_CACHE` in `public/sw.js` whenever a cached file changes, so returning visitors pick up the update instead of serving a stale cached copy.

## License

MIT — see [LICENSE](LICENSE). Not a substitute for professional medical or fitness advice; practice within your own limits.
