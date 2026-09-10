// FIGURES, generateWorkout, and the audio helpers are attached to `window`
// by figures.js / workout.js / speech.js / voice.js, which load before
// this file.
const {
  FIGURES,
  generateWorkout,
  narrate,
  stopNarration,
  chime,
  countdownTick,
  unlockAudio,
  speechAvailable,
  pauseAllAudio,
  resumeAllAudio,
} = window;

const APP_VERSION = '0.2.1';
const COUNTDOWN_SECONDS = 2;

const homeScreen = document.getElementById('screen-home');
const workoutScreen = document.getElementById('screen-workout');
const completeScreen = document.getElementById('screen-complete');

const durationButtons = document.querySelectorAll('.duration-btn');
const modeTabs = document.querySelectorAll('.mode-tab');
const homeTagline = document.getElementById('home-tagline');
const voiceSelect = document.getElementById('voice-select');
const voicePreviewBtn = document.getElementById('voice-preview-btn');
const titleOnlyCheckbox = document.getElementById('title-only-toggle');
const equipmentRow = document.getElementById('equipment-row');
const matToggle = document.getElementById('mat-toggle');
const furnitureToggle = document.getElementById('furniture-toggle');
const barToggle = document.getElementById('bar-toggle');
const audioNote = document.getElementById('audio-note');
const appVersionEl = document.getElementById('app-version');

const figureHost = document.getElementById('figure-host');

const holdView = document.getElementById('hold-view');
const poseName = document.getElementById('pose-name');
const poseSanskrit = document.getElementById('pose-sanskrit');
const poseCue = document.getElementById('pose-cue');
const poseProgressRow = document.getElementById('pose-progress-row');
const poseTimeLeft = document.getElementById('pose-time-left');
const poseProgressBar = document.getElementById('pose-progress-bar');
const advanceHint = document.getElementById('advance-hint');
const voiceControlBtn = document.getElementById('voice-control-btn');

const countdownView = document.getElementById('countdown-view');
const countdownNumber = document.getElementById('countdown-number');
const countdownNext = document.getElementById('countdown-next');

const overallProgressBar = document.getElementById('overall-progress-bar');
const stepLabel = document.getElementById('step-label');
const topTimer = document.getElementById('top-timer');
const nextLabel = document.getElementById('next-label');
const pauseBtn = document.getElementById('pause-btn');
const skipBtn = document.getElementById('skip-btn');
const endBtn = document.getElementById('end-btn');

const summaryText = document.getElementById('summary-text');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

// state.phase is 'countdown' (the brief pause before a pose) or 'hold'
// (actively in the pose). One shared 1-second interval drives both.
//
// state.mode is 'yoga' or 'calisthenics' — see README for how the two
// differ. Yoga: state.segments is a fixed, fully precomputed array and
// state.totalSeconds is its sum; poses auto-advance when state.remaining
// (this pose's remaining hold time) hits 0. Calisthenics: state.sequencer
// (js/calisthenics-workout.js) generates exercises on demand, so
// state.segments grows lazily via ensureSegment() as you advance through
// it yourself (button/voice/swipe) — nothing auto-advances. Instead
// state.sessionRemaining is an overall session clock that counts down
// throughout and ends the session on its own when it reaches 0.
let state = null;

let currentMode = 'yoga';

const HOME_TAGLINES = {
  yoga: "A short, guided yoga practice. Pick a length and press start — I'll walk you through it.",
  calisthenics: 'A short calisthenics session, at your own pace. Pick a length, then say "next", swipe, or tap Next whenever you\'re ready to move on.',
};

function setMode(mode) {
  currentMode = mode;
  modeTabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  if (homeTagline) homeTagline.textContent = HOME_TAGLINES[mode] || '';
  // Equipment (mat/step-up) only matters for filtering Calisthenics
  // exercises — yoga poses aren't flagged for surface/furniture at all.
  if (equipmentRow) equipmentRow.classList.toggle('hidden', mode !== 'calisthenics');
}

modeTabs.forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

function showScreen(screen) {
  [homeScreen, workoutScreen, completeScreen].forEach((s) => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      return await navigator.wakeLock.request('screen');
    }
  } catch (e) {
    // Not fatal — the practice still works, the screen just might sleep.
  }
  return null;
}

function releaseWakeLock() {
  if (state && state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderFigure(pose) {
  figureHost.innerHTML = `<div class="pose-figure">${FIGURES[pose.figure] || ''}</div>`;
}

// One-sided poses are shown/spoken with the side, so it's unambiguous which
// leg or arm is working — and so the mirrored repeat reads as deliberate.
function poseLabel(seg) {
  if (!seg.side) return seg.pose.name;
  return `${seg.pose.name} — ${seg.side === 'left' ? 'Left' : 'Right'} side`;
}

// Pose names end in a bare Roman numeral by yoga convention (Warrior I/II/
// III), which is correct on screen but wrong out loud — TTS reads a lone
// "I" as the pronoun, and "II"/"III" as nonsense. Mirrors spoken_name() in
// tools/generate-voice.py, which does the same for the pre-generated audio;
// this copy only matters for the device-voice fallback path.
const ROMAN_TO_WORD = { I: 'One', II: 'Two', III: 'Three' };
function spokenPoseName(pose) {
  return pose.name.replace(/\b(III|II|I)$/, (m) => ROMAN_TO_WORD[m]);
}
function spokenLabel(seg) {
  const name = spokenPoseName(seg.pose);
  return seg.side ? `${name} — ${seg.side === 'left' ? 'Left' : 'Right'} side` : name;
}

// Key into the pre-generated audio manifest (see tools/generate-voice.py).
function clipKey(kind, seg) {
  return seg.side ? `${kind}-${seg.pose.id}-${seg.side}` : `${kind}-${seg.pose.id}`;
}

// Calisthenics only: state.segments is filled lazily, one pull from the
// sequencer at a time, as rendering code asks to look at index `i` (the
// current exercise, or the next one for the "Next: ..." preview). A no-op
// in yoga mode, where segments are already fully precomputed.
function ensureSegment(i) {
  if (!state || state.mode !== 'calisthenics') return;
  while (state.segments.length <= i) {
    const next = state.sequencer.next();
    if (!next) break; // the exercise pool is empty — shouldn't happen
    state.segments.push(next);
  }
}

function updateOverallProgress(index, holdElapsed = 0) {
  if (state.mode === 'calisthenics') {
    // No fixed pose count to divide by — track session time elapsed instead.
    const elapsed = state.sessionSeconds - state.sessionRemaining;
    const pct = (elapsed / state.sessionSeconds) * 100;
    overallProgressBar.style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
    return;
  }
  const elapsedBefore = state.segments.slice(0, index).reduce((s, x) => s + x.duration, 0);
  const pct = ((elapsedBefore + holdElapsed) / state.totalSeconds) * 100;
  overallProgressBar.style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
}

// Brief pause before a pose starts: shows a 2-1 countdown and previews
// the pose image so there's time to get into position.
function startCountdown(index) {
  ensureSegment(index);
  ensureSegment(index + 1); // for the "Next: ..." preview below
  const seg = state.segments[index];
  const next = state.segments[index + 1];

  state.phase = 'countdown';
  state.remaining = COUNTDOWN_SECONDS;

  renderFigure(seg.pose);
  stepLabel.textContent = state.mode === 'calisthenics'
    ? `Exercise ${index + 1}`
    : `Pose ${index + 1} of ${state.segments.length}`;
  nextLabel.textContent = next ? `Next: ${poseLabel(next)}` : 'Next: Finish';

  holdView.classList.add('hidden');
  countdownView.classList.remove('hidden');
  countdownNumber.textContent = String(state.remaining);
  countdownNext.textContent = poseLabel(seg);
  // Yoga: nothing to show yet until the pose actually starts. Calisthenics:
  // the overall session clock keeps running right through the countdown.
  topTimer.textContent = state.mode === 'calisthenics' ? formatTime(state.sessionRemaining) : '';

  updateOverallProgress(index);
  // Yoga auto-advances, so hearing what's coming during the countdown is
  // useful. Calisthenics is self-paced — you just pressed Next yourself,
  // and the name is right there on screen — so a spoken "Up next" is
  // redundant with the cue that plays a moment later in startHold().
  if (state.mode !== 'calisthenics') {
    narrate(clipKey('next', seg), `Up next: ${spokenLabel(seg)}`);
  }
}

// Actively holding the pose: narrate the full cue and start its timer.
function startHold(index) {
  const seg = state.segments[index];

  state.phase = 'hold';
  state.remaining = seg.duration;

  countdownView.classList.add('hidden');
  holdView.classList.remove('hidden');

  poseName.textContent = poseLabel(seg);
  poseSanskrit.textContent = seg.pose.sanskrit || '';
  poseCue.textContent = seg.pose.cue;
  poseTimeLeft.textContent = formatTime(state.remaining);
  poseProgressBar.style.width = '100%';
  // Yoga: this pose's own countdown. Calisthenics: no per-exercise timer —
  // keep showing the overall session clock (poseProgressRow is hidden
  // there entirely; see setupWorkoutUIForMode).
  topTimer.textContent = state.mode === 'calisthenics'
    ? formatTime(state.sessionRemaining)
    : formatTime(state.remaining);

  // Let the "Up next: ..." announcement from the countdown finish playing
  // before the chime and the cue narration start — otherwise a longer
  // announcement (a full pose name plus "left/right side") routinely gets
  // cut off partway through by the chime, since the countdown is a fixed
  // 2 seconds regardless of how long that sentence takes to say.
  window.finishNarrationThen(() => {
    // The wait can outlast this pose (End/Pause/Skip during it) — bail
    // rather than fire a chime and narration into a state that moved on.
    if (!state || state.paused || state.index !== index) return;
    chime();
    // "Exercise title only" mode skips the long spoken cue — the written
    // cue stays on screen either way.
    if (state.titleOnly) {
      narrate(clipKey('name', seg), spokenLabel(seg));
    } else {
      narrate(clipKey('cue', seg), `${spokenLabel(seg)}. ${seg.pose.cue}`);
    }
  });
}

function tick() {
  if (!state) return;

  if (state.mode === 'calisthenics') {
    tickCalisthenics();
    return;
  }

  state.remaining -= 1;

  if (state.phase === 'countdown') {
    if (state.remaining > 0) {
      countdownNumber.textContent = String(state.remaining);
      countdownTick();
    } else {
      startHold(state.index);
    }
    return;
  }

  // Holding a pose.
  const seg = state.segments[state.index];
  const timeLeft = formatTime(Math.max(state.remaining, 0));
  poseTimeLeft.textContent = timeLeft;
  topTimer.textContent = timeLeft;
  poseProgressBar.style.width = `${Math.max((state.remaining / seg.duration) * 100, 0)}%`;
  updateOverallProgress(state.index, seg.duration - state.remaining);

  if (state.remaining <= 0) {
    advance();
  }
}

// Calisthenics: the countdown still runs the same 2-1 as yoga, but once
// an exercise goes "live" there's no per-exercise timer at all — you
// decide when to move on. The only thing that ticks on its own is the
// overall session clock, which ends the session when it runs out
// regardless of which exercise you're on.
function tickCalisthenics() {
  if (state.phase === 'countdown') {
    state.remaining -= 1;
    if (state.remaining > 0) {
      countdownNumber.textContent = String(state.remaining);
      countdownTick();
    } else {
      startHold(state.index);
    }
  }

  state.sessionRemaining -= 1;
  topTimer.textContent = formatTime(Math.max(state.sessionRemaining, 0));
  updateOverallProgress(state.index);

  if (state.sessionRemaining <= 0) {
    finishWorkout();
  }
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 1000);
}

function advance() {
  state.index += 1;
  // Yoga: segments are a fixed list — running past the end means the
  // practice is over. Calisthenics: segments grow on demand (ensureSegment,
  // called from startCountdown below), so this is never the end condition
  // there — only the session clock (tickCalisthenics) ends the session.
  if (state.mode !== 'calisthenics' && state.index >= state.segments.length) {
    finishWorkout();
    return;
  }
  startCountdown(state.index);
}

function finishWorkout() {
  clearInterval(state.timerId);
  stopNarration();
  stopVoiceControlIfActive();
  releaseWakeLock();
  overallProgressBar.style.width = '100%';
  if (state.mode === 'calisthenics') {
    const count = state.index + 1;
    summaryText.textContent = `Great job — you completed your ${state.totalMinutes}-minute session (${count} exercise${count === 1 ? '' : 's'}).`;
    narrate('complete-calisthenics', 'Great job. You completed your session.');
  } else {
    summaryText.textContent = `Great job — you completed your ${state.totalMinutes}-minute practice (${state.segments.length} poses).`;
    narrate('complete', 'Great job. You completed your practice. Namaste.');
  }
  showScreen(completeScreen);
}

// "Name only" narration toggle, shared by both modes: skips the full
// spoken cue and just says the pose/exercise name (the written cue stays
// on screen either way). begin*Workout() both read this when building state.
function currentTitleOnly() {
  return !!(titleOnlyCheckbox && titleOnlyCheckbox.checked);
}

// Calisthenics-only equipment toggles — see createCalisthenicsSequencer()
// in js/calisthenics-workout.js for how these filter the exercise pool.
function currentHasMat() {
  return matToggle ? matToggle.checked : true;
}

function currentHasFurniture() {
  return furnitureToggle ? furnitureToggle.checked : true;
}

// A pull-up bar is its own question: a chair or a towel is something almost
// everyone can find, but a bar is a real piece of kit you either own or
// don't. Defaults to false for that reason, unlike the other two.
function currentHasBar() {
  return barToggle ? barToggle.checked : false;
}

async function beginWorkout(totalMinutes) {
  if (currentMode === 'calisthenics') {
    await beginCalisthenicsWorkout(totalMinutes);
  } else {
    await beginYogaWorkout(totalMinutes);
  }
}

async function beginYogaWorkout(totalMinutes) {
  unlockAudio();
  const segments = generateWorkout(totalMinutes);
  const totalSeconds = segments.reduce((s, x) => s + x.duration, 0);
  const wakeLock = await requestWakeLock();

  state = {
    mode: 'yoga',
    segments,
    index: 0,
    remaining: 0,
    phase: 'countdown',
    paused: false,
    timerId: null,
    totalMinutes,
    totalSeconds,
    wakeLock,
    titleOnly: currentTitleOnly(),
  };

  setupWorkoutUIForMode();
  showScreen(workoutScreen);
  startCountdown(0);
  startTimer();
}

// Calisthenics is self-paced (see README): rather than a fixed,
// precomputed sequence, state.sequencer hands out one exercise at a time
// as you ask for it (ensureSegment, called from startCountdown), and only
// an overall session clock (state.sessionRemaining) runs on its own.
async function beginCalisthenicsWorkout(totalMinutes) {
  unlockAudio();
  // Re-arm hands-free control HERE, before the first await below. On WebKit —
  // which is every iOS browser, Chrome and Safari alike, since Apple requires
  // it — SpeechRecognition.start() is only honoured while the tap that started
  // the workout is still the active user gesture, and awaiting the wake lock
  // spends it. Armed after that await, this silently fails on exactly the
  // devices most likely to be used for a workout.
  if (window.voiceControlSupported
      && loadBoolPref('quietflow.voiceControl', false)) {
    startVoiceControlUI();
  }
  const sequencer = window.createCalisthenicsSequencer({
    hasMat: currentHasMat(),
    hasFurniture: currentHasFurniture(),
    hasBar: currentHasBar(),
  });
  const first = sequencer.next();
  if (!first) return; // no exercises defined — shouldn't happen
  const wakeLock = await requestWakeLock();
  const sessionSeconds = Math.round(totalMinutes * 60);

  state = {
    mode: 'calisthenics',
    sequencer,
    segments: [first],
    index: 0,
    remaining: 0,
    phase: 'countdown',
    paused: false,
    timerId: null,
    totalMinutes,
    sessionSeconds,
    sessionRemaining: sessionSeconds,
    wakeLock,
    titleOnly: currentTitleOnly(),
  };

  setupWorkoutUIForMode();
  showScreen(workoutScreen);
  startCountdown(0);
  startTimer();
}

// Shows/hides the bits of the workout screen that only make sense in one
// mode: yoga's per-pose countdown bar vs. calisthenics' "advance whenever
// you're ready" hint and voice-control button.
function setupWorkoutUIForMode() {
  const isCalisthenics = state.mode === 'calisthenics';
  if (poseProgressRow) poseProgressRow.classList.toggle('hidden', isCalisthenics);
  if (advanceHint) advanceHint.classList.toggle('hidden', !isCalisthenics);
  if (voiceControlBtn) {
    const showMic = isCalisthenics && window.voiceControlSupported;
    voiceControlBtn.hidden = !showMic;
    voiceControlBtn.classList.toggle('hidden', !showMic);
  }
  skipBtn.textContent = isCalisthenics ? 'Next ▶' : 'Skip';
  pauseBtn.textContent = 'Pause';
  resetVoiceControlButton();
}

function togglePause() {
  if (!state) return;
  state.paused = !state.paused;
  if (state.paused) {
    clearInterval(state.timerId);
    stopNarration();
    stopVoiceControlIfActive();
    pauseAllAudio(); // also pauses the shared chime/tick AudioContext
    pauseBtn.textContent = 'Resume';
  } else {
    resumeAllAudio();
    startTimer();
    pauseBtn.textContent = 'Pause';
  }
}

// The primary "move on" action — the Skip button in yoga, the Next button
// in calisthenics (same button, different label; see setupWorkoutUIForMode)
// — and also what the voice-control "next" command and the swipe gesture
// both trigger in calisthenics mode.
function skipSegment() {
  if (!state) return;
  stopNarration();
  if (state.phase === 'countdown') {
    startHold(state.index); // skip straight past the countdown into the pose
  } else {
    advance();
  }
}

function endWorkout() {
  if (!state) return;
  clearInterval(state.timerId);
  stopNarration();
  stopVoiceControlIfActive();
  releaseWakeLock();
  state = null;
  showScreen(homeScreen);
}

// --- wire up UI ---

durationButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Must run synchronously, before beginWorkout's internal `await`s —
    // that's what actually grants the mobile browser's audio-playback
    // unlock. Doing it any later (e.g. inside beginWorkout) is why the
    // very first narration clip of a practice would silently fail to
    // play on phones while every clip after it worked fine.
    if (window.unlockVoiceAudio) window.unlockVoiceAudio();
    unlockAudio();
    const minutes = Number(btn.dataset.minutes);
    beginWorkout(minutes);
  });
});

pauseBtn.addEventListener('click', togglePause);
skipBtn.addEventListener('click', skipSegment);
endBtn.addEventListener('click', endWorkout);
restartBtn.addEventListener('click', () => {
  showScreen(homeScreen);
});
homeBtn.addEventListener('click', () => showScreen(homeScreen));

// --- Calisthenics: voice control ("say next") ---
// js/voice-control.js does the actual SpeechRecognition work; this is just
// the button/state glue. Support varies by browser (see that file), so the
// button is hidden entirely (setupWorkoutUIForMode) where it's unsupported
// — swipe and the Next button always work regardless.
function resetVoiceControlButton() {
  if (!voiceControlBtn) return;
  // Never stomp a live session: setupWorkoutUIForMode() calls this on every
  // workout start, which now happens after the mic has already been armed.
  if (window.isVoiceControlActive && window.isVoiceControlActive()) {
    voiceControlBtn.textContent = '🎤 Listening… say "next"';
    voiceControlBtn.classList.add('listening');
    return;
  }
  voiceControlBtn.textContent = '🎤 Listen for "next"';
  voiceControlBtn.classList.remove('listening');
}

function stopVoiceControlIfActive() {
  if (window.isVoiceControlActive && window.isVoiceControlActive()) {
    window.stopVoiceControl();
  }
  resetVoiceControlButton();
}

// Shared by the mic button and the automatic re-arm above, so both paths put
// the button into exactly the same state.
function startVoiceControlUI() {
  if (!voiceControlBtn || !window.voiceControlSupported) return false;
  if (window.unlockVoiceAudio) window.unlockVoiceAudio();
  const started = window.startVoiceControl(() => {
    if (state && state.mode === 'calisthenics' && !state.paused) {
      skipSegment();
    }
  });
  if (started) {
    voiceControlBtn.textContent = '🎤 Listening… say "next"';
    voiceControlBtn.classList.add('listening');
  } else {
    voiceControlBtn.textContent = 'Voice control unavailable';
    setTimeout(resetVoiceControlButton, 2000);
  }
  return started;
}

if (voiceControlBtn) {
  voiceControlBtn.addEventListener('click', () => {
    if (window.isVoiceControlActive && window.isVoiceControlActive()) {
      stopVoiceControlIfActive();
      saveBoolPref('quietflow.voiceControl', false);
      return;
    }
    // Only remember it once it actually started — storing true on a failed
    // start would re-attempt (and re-fail) at the top of every session.
    if (startVoiceControlUI()) saveBoolPref('quietflow.voiceControl', true);
  });
}

// Called by voice-control.js if the mic permission prompt is denied.
window.onVoiceControlDenied = () => {
  // Forget the preference too, so a revoked permission doesn't leave every
  // future session trying to re-arm a mic it can never get.
  saveBoolPref('quietflow.voiceControl', false);
  resetVoiceControlButton();
  if (voiceControlBtn) {
    voiceControlBtn.textContent = 'Mic permission denied';
    setTimeout(resetVoiceControlButton, 2500);
  }
};

// --- Calisthenics: swipe to advance ---
// A generous swipe (either direction) anywhere on the workout card moves
// to the next exercise — the same action as the Next button/voice command.
(function setupSwipeGesture() {
  const workoutCard = document.querySelector('.workout-card');
  if (!workoutCard) return;
  let startX = null;
  let startY = null;

  workoutCard.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    startX = t.clientX;
    startY = t.clientY;
  }, { passive: true });

  workoutCard.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    startX = null;
    startY = null;
    const isHorizontalSwipe = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5;
    if (isHorizontalSwipe && state && state.mode === 'calisthenics' && !state.paused) {
      skipSegment();
    }
  }, { passive: true });
})();

// --- Voice picker ---
// The app ships real neural-TTS audio (js/voice.js + public/audio/) in two
// packs, Clara and Amy. Device text-to-speech is no longer a user-facing
// choice, but js/voice.js still falls back to it automatically (silently)
// if a clip is ever missing or fails to play, so narration never goes
// fully silent.
const PREVIEW_TEXT = 'Mountain Pose. Stand tall, and take a deep breath in, and out.';

function previewCurrentVoice() {
  if (window.unlockVoiceAudio) window.unlockVoiceAudio();
  unlockAudio();
  const packId = voiceSelect ? voiceSelect.value : null;
  window.narrate('preview', PREVIEW_TEXT, { packId });
}

function populateVoicePacks() {
  if (!voiceSelect || !window.VOICE_PACKS) return;
  voiceSelect.innerHTML = '';
  window.VOICE_PACKS.forEach((pack) => {
    const opt = document.createElement('option');
    opt.value = pack.id;
    opt.textContent = pack.label;
    voiceSelect.appendChild(opt);
  });
  voiceSelect.value = window.getVoicePackId();
}

populateVoicePacks();

if (voiceSelect) {
  voiceSelect.addEventListener('change', () => {
    window.setVoicePackId(voiceSelect.value);
    previewCurrentVoice();
  });
}

if (voicePreviewBtn) {
  voicePreviewBtn.addEventListener('click', previewCurrentVoice);
}

// --- "Name only" narration toggle + Calisthenics equipment toggles ---
// All three are simple booleans persisted in localStorage so you don't
// have to re-answer every time you open the app.
function loadBoolPref(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? defaultValue : raw === 'true';
  } catch (e) {
    return defaultValue;
  }
}

function saveBoolPref(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    // Storage unavailable — the choice still applies for this session.
  }
}

if (titleOnlyCheckbox) {
  titleOnlyCheckbox.checked = loadBoolPref('quietflow.titleOnly', false);
  titleOnlyCheckbox.addEventListener('change', () => {
    saveBoolPref('quietflow.titleOnly', titleOnlyCheckbox.checked);
  });
}

// Mat and furniture default to true (assume available) — those toggles are
// for the exception, not the common case: no mat, or nowhere to prop a foot
// up. The bar defaults to false, since not owning one is the common case.
if (matToggle) {
  matToggle.checked = loadBoolPref('quietflow.hasMat', true);
  matToggle.addEventListener('change', () => {
    saveBoolPref('quietflow.hasMat', matToggle.checked);
  });
}

if (furnitureToggle) {
  furnitureToggle.checked = loadBoolPref('quietflow.hasFurniture', true);
  furnitureToggle.addEventListener('change', () => {
    saveBoolPref('quietflow.hasFurniture', furnitureToggle.checked);
  });
}

if (barToggle) {
  barToggle.checked = loadBoolPref('quietflow.hasBar', false);
  barToggle.addEventListener('change', () => {
    saveBoolPref('quietflow.hasBar', barToggle.checked);
  });
}

if (appVersionEl) appVersionEl.textContent = `v${APP_VERSION}`;

if (!speechAvailable()) {
  audioNote.textContent = 'Your browser does not support spoken instructions — visual cues and text will still guide you.';
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state && state.wakeLock === null && !state.paused) {
    requestWakeLock().then((wl) => {
      if (state) state.wakeLock = wl;
    });
  }
});

showScreen(homeScreen);

// Register the service worker for offline support / installability.
// Service workers require http(s) — silently skip under file:// (opening
// index.html directly still works, it just won't be installable/offline).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Not fatal — the app still works fully online without it.
    });
  });

  // When a new service worker takes over, reload once so the page isn't
  // left running the previous version's JS against newer HTML.
  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadedForUpdate) return;
    reloadedForUpdate = true;
    window.location.reload();
  });
}
