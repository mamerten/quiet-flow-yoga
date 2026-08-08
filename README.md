# Quiet Flow — Yoga Timer

A tiny, dependency-free web app for short, guided yoga practices — like Apple Fitness+'s time-based workouts, but yoga-only. Pick 5, 7, or 10 minutes (or type your own length), and it narrates you through a sequence of poses with a simple reference image for each.

**[Live demo →](https://matmerten.com/)** *(update this link once deployed)*

## What it does

- **Pick a length.** 5 / 7 / 10 minutes, or any custom length from 2–60 minutes.
- **It builds a flow for you.** Each practice moves through phases — centering, warm-up, standing poses, balance, seated/twists, and a closing relaxation — pulling poses from a small library and sizing each hold to fit the total time. The sequence is shuffled a bit each time, so repeat practices don't feel identical.
- **Audible instructions.** Uses the browser's built-in text-to-speech (Web Speech API) to speak the pose name and cue at the start of each pose — no audio files, no recording, no hosting cost.
- **Minimal visuals.** Each pose has a simple, original stick-figure illustration (inline SVG) with a gentle "breathing" animation, plus the written cue on screen for anyone who can't rely on audio.
- **Controls.** Pause/Resume, Skip, End, plus an overall progress bar and per-pose countdown.

## Why it's built this way

- **Zero build step, zero dependencies.** Plain HTML/CSS/JS (ES modules). Open `index.html` in a modern browser, or serve the folder statically — that's it. Easy to drop straight into a static site (e.g. matmerten.com) or GitHub Pages.
- **No copyrighted media.** All illustrations are small original SVGs authored for this project; all narration is generated locally by the browser's speech synthesis, not a recorded voice.

## Project structure

```
index.html          Screens: home, active workout, complete
css/style.css        All styling
js/poses.js          The pose repository (name, cue, category, default duration, figure)
js/figures.js        A handful of simple stick-figure SVG templates, reused across poses
js/workout.js        Builds a timed sequence of poses for a given number of minutes
js/speech.js         Text-to-speech + a soft transition chime (Web Speech / Web Audio API)
js/app.js            Screen/timer state machine and UI wiring
```

## Extending the pose library

Add an entry to `POSES` in [`js/poses.js`](js/poses.js):

```js
{
  id: 'unique-id',
  name: 'Pose Name',
  sanskrit: 'Optional Sanskrit Name',
  category: 'centering' | 'warmup' | 'standing' | 'balance' | 'seated' | 'relaxation',
  figure: 'one of the keys in js/figures.js',
  duration: 30, // default hold time in seconds
  cue: 'What gets spoken and displayed for this pose.',
}
```

The workout generator picks up new poses automatically — no other changes needed. To add a new illustration, add a template to `FIGURES` in `js/figures.js`.

## Running locally

ES modules need to be served over HTTP (not opened via `file://`). Any static server works, e.g.:

```bash
npx serve .
```

or Python's built-in server:

```bash
python -m http.server 8000
```

Then open the printed local URL.

## Deploying

This is a static site — deploy the folder as-is to GitHub Pages, Netlify, Cloudflare Pages, or as a subdirectory of matmerten.com. No build step required.

## Browser support notes

- **Spoken instructions** require the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (supported in Chrome, Edge, Safari; partial in Firefox). If unsupported, the app falls back to on-screen text only.
- **Keep-awake** uses the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) where available, so the screen doesn't dim mid-practice; it degrades gracefully where unsupported.

## License

MIT — see [LICENSE](LICENSE). Not a substitute for professional medical or fitness advice; practice within your own limits.
