# Quiet Flow — Yoga Timer

Guided yoga practice web app (Apple Fitness-style time-based workouts, yoga-only).
Full details live in [README.md](README.md); this file is quick orientation for working in the codebase.

## Stack & structure

Static site, zero build step, zero JS dependencies. Plain `<script>` tags (not ES modules) so
it also runs opened directly from disk (`file://`).

```
public/index.html     Screens: home, active workout, complete
public/css/style.css  All styling — phone-landscape split layout, light/dark mode
public/js/poses.js    Pose repository (name, cue, category, duration, figure, sided)
public/js/figures.js  Stick-figure SVG templates, reused across poses
public/js/workout.js  Builds a timed pose sequence for N minutes; left/right pairing logic
public/js/voice.js    Plays pre-generated narration clips; device-TTS fallback
public/js/speech.js   Device text-to-speech + chime/tick sounds (Web Speech / Web Audio)
public/js/music.js    Procedural background music (Web Audio)
public/js/app.js      Screen/timer/countdown state machine, UI wiring
public/audio/         Pre-generated neural narration, one folder per voice pack
public/manifest.json + public/sw.js   PWA: installable, offline-capable
tools/generate-voice.py   Build-time script — renders public/audio/ via Piper (not shipped to browser)
wrangler.toml          Cloudflare Pages config (build output = public/)
```

## Commands

```bash
npx serve public        # local static server
npm run dev              # via Wrangler, matches production
npm run deploy            # manual deploy (needs `wrangler login` once)
python tools/generate-voice.py   # regenerate narration audio after editing poses.js
```

No test suite. Verify changes by loading the app in a browser (Browser pane tools) and exercising
the flow — see recent commit messages for the verification patterns used so far (console-error
checks, generated-workout invariants, audio playback checks).

## Deployment

Cloudflare Pages, auto-deploys on push to `main` (connected GitHub repo, same setup as the
ADAMS Searcher project). Live at quiet-flow-yoga.matmerten.com and quiet-flow-yoga.pages.dev.

**Service worker caching**: bump `SHELL_CACHE` in `public/sw.js` whenever a cached file changes,
or returning visitors keep serving a stale version.

## Conventions worth knowing

- **Pose schema** (`public/js/poses.js`): each pose has `id`, `name`, `sanskrit`, `category`,
  `figure` (key into `figures.js`), `duration` (seconds), optional `sided: true` for one-sided
  poses (auto-scheduled as a left/right pair by `workout.js`), and `cue` (spoken/displayed text).
- **Roman numerals**: pose names ending in a bare Roman numeral ("Warrior I/II/III") are correct
  on screen but must be converted to spoken words ("Warrior One") for narration — see
  `spoken_name()` in `generate-voice.py` and `spokenPoseName()` in `app.js`. Keep both in sync.
- **After editing any pose's `name` or `cue`**, re-run `python tools/generate-voice.py` — it
  reads `poses.js` directly, content-hashes filenames (so stale audio can't be served), and
  prunes clips no longer referenced.
- **Versioning**: version lives in `package.json` + `public/js/app.js` (`APP_VERSION`) + git tags.
  Bump only when explicitly asked — this project has previously stayed pinned at one version
  across many feature commits by request.
- **No copyrighted media**: illustrations are original SVGs, music is synthesized (Web Audio),
  narration is rendered locally by Piper (open-source, MIT-licensed voices) — see README's
  "Why it's built this way" for the reasoning.
