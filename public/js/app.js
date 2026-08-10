// FIGURES, generateWorkout, and the audio helpers are attached to `window`
// by figures.js / workout.js / speech.js / music.js, which load before
// this file.
const {
  FIGURES,
  generateWorkout,
  speak,
  narrate,
  stopNarration,
  chime,
  countdownTick,
  unlockAudio,
  speechAvailable,
  startMusic,
  stopMusic,
  pauseAllAudio,
  resumeAllAudio,
} = window;

const APP_VERSION = '0.1.1';
const COUNTDOWN_SECONDS = 3;

const homeScreen = document.getElementById('screen-home');
const workoutScreen = document.getElementById('screen-workout');
const completeScreen = document.getElementById('screen-complete');

const durationButtons = document.querySelectorAll('.duration-btn');
const musicSelect = document.getElementById('music-select');
const voiceSelect = document.getElementById('voice-select');
const voicePreviewBtn = document.getElementById('voice-preview-btn');
const deviceVoiceRow = document.getElementById('device-voice-row');
const deviceVoiceSelect = document.getElementById('device-voice-select');
const audioNote = document.getElementById('audio-note');
const appVersionEl = document.getElementById('app-version');

const figureHost = document.getElementById('figure-host');

const holdView = document.getElementById('hold-view');
const poseName = document.getElementById('pose-name');
const poseSanskrit = document.getElementById('pose-sanskrit');
const poseCue = document.getElementById('pose-cue');
const poseTimeLeft = document.getElementById('pose-time-left');
const poseProgressBar = document.getElementById('pose-progress-bar');

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
let state = null; // { segments, index, remaining, phase, paused, timerId, totalMinutes, totalSeconds, wakeLock, musicId }

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

function updateOverallProgress(index, holdElapsed = 0) {
  const elapsedBefore = state.segments.slice(0, index).reduce((s, x) => s + x.duration, 0);
  const pct = ((elapsedBefore + holdElapsed) / state.totalSeconds) * 100;
  overallProgressBar.style.width = `${Math.min(Math.max(pct, 0), 100)}%`;
}

// Brief pause before a pose starts: shows a 3-2-1 countdown and previews
// the pose image so there's time to get into position.
function startCountdown(index) {
  const seg = state.segments[index];
  const next = state.segments[index + 1];

  state.phase = 'countdown';
  state.remaining = COUNTDOWN_SECONDS;

  renderFigure(seg.pose);
  stepLabel.textContent = `Pose ${index + 1} of ${state.segments.length}`;
  nextLabel.textContent = next ? `Next: ${poseLabel(next)}` : 'Next: Finish';

  holdView.classList.add('hidden');
  countdownView.classList.remove('hidden');
  countdownNumber.textContent = String(state.remaining);
  countdownNext.textContent = poseLabel(seg);
  topTimer.textContent = ''; // only shown once a pose is actually live

  updateOverallProgress(index);
  narrate(clipKey('next', seg), `Up next: ${spokenLabel(seg)}`);
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
  topTimer.textContent = formatTime(state.remaining);

  // Let the "Up next: ..." announcement from the countdown finish playing
  // before the chime and the cue narration start — otherwise a longer
  // announcement (a full pose name plus "left/right side") routinely gets
  // cut off partway through by the chime, since the countdown is a fixed
  // 3 seconds regardless of how long that sentence takes to say.
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

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 1000);
}

function advance() {
  state.index += 1;
  if (state.index >= state.segments.length) {
    finishWorkout();
    return;
  }
  startCountdown(state.index);
}

function finishWorkout() {
  clearInterval(state.timerId);
  stopNarration();
  stopMusic();
  releaseWakeLock();
  overallProgressBar.style.width = '100%';
  summaryText.textContent = `Great job — you completed your ${state.totalMinutes}-minute practice (${state.segments.length} poses).`;
  narrate('complete', 'Great job. You completed your practice. Namaste.');
  showScreen(completeScreen);
}

async function beginWorkout(totalMinutes) {
  unlockAudio();
  const segments = generateWorkout(totalMinutes);
  const totalSeconds = segments.reduce((s, x) => s + x.duration, 0);
  const wakeLock = await requestWakeLock();
  const musicId = musicSelect ? musicSelect.value : 'none';
  const track = (window.MUSIC_TRACKS || []).find((t) => t.id === musicId);

  state = {
    segments,
    index: 0,
    remaining: 0,
    phase: 'countdown',
    paused: false,
    timerId: null,
    totalMinutes,
    totalSeconds,
    wakeLock,
    musicId,
    titleOnly: !!(track && track.titleOnly),
  };

  pauseBtn.textContent = 'Pause';
  showScreen(workoutScreen);
  startMusic(musicId); // independent of narration — both play together
  startCountdown(0);
  startTimer();
}

function togglePause() {
  if (!state) return;
  state.paused = !state.paused;
  if (state.paused) {
    clearInterval(state.timerId);
    stopNarration();
    pauseAllAudio(); // also pauses background music and any chime/tick
    pauseBtn.textContent = 'Resume';
  } else {
    resumeAllAudio();
    startTimer();
    pauseBtn.textContent = 'Pause';
  }
}

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
  stopMusic();
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

if (musicSelect && window.MUSIC_TRACKS) {
  window.MUSIC_TRACKS.forEach((track) => {
    const opt = document.createElement('option');
    opt.value = track.id;
    opt.textContent = track.label;
    musicSelect.appendChild(opt);
  });
  musicSelect.value = 'none';
}

// --- Voice picker ---
// The app ships real neural-TTS audio (js/voice.js + public/audio/), so the
// primary picker chooses between those bundled voices. "Device voice" is
// kept as an escape hatch, and only then does the OS voice list matter — so
// that second dropdown is revealed conditionally.
const PREVIEW_TEXT = 'Mountain Pose. Stand tall, and take a deep breath in, and out.';

function previewCurrentVoice() {
  if (window.unlockVoiceAudio) window.unlockVoiceAudio();
  unlockAudio();
  const packId = voiceSelect ? voiceSelect.value : null;
  if (packId === 'device') {
    speak(PREVIEW_TEXT, { voiceURI: deviceVoiceSelect ? deviceVoiceSelect.value : null });
  } else {
    window.narrate('preview', PREVIEW_TEXT, { packId });
  }
}

// The OS voice list only matters when "Device voice" is selected, so that
// second dropdown stays hidden otherwise. How the bundled voices work is
// documented in the README rather than explained in the UI.
function syncDeviceVoiceRow() {
  if (!deviceVoiceRow) return;
  deviceVoiceRow.hidden = !(voiceSelect && voiceSelect.value === 'device');
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
  syncDeviceVoiceRow();
}

// Device voices load asynchronously; speech.js calls this once they arrive.
function populateDeviceVoices() {
  if (!deviceVoiceSelect || !window.listVoices) return;
  const voices = window.listVoices();
  if (!voices.length) {
    deviceVoiceSelect.innerHTML = '<option>Loading voices…</option>';
    deviceVoiceSelect.disabled = true;
    return;
  }
  const currentURI = window.getPreferredVoiceURI ? window.getPreferredVoiceURI() : null;
  deviceVoiceSelect.disabled = false;
  deviceVoiceSelect.innerHTML = '';
  voices.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = v.voiceURI;
    // Already sorted best-first by speech.js.
    opt.textContent = i === 0 ? `${v.name} — best available` : v.name;
    deviceVoiceSelect.appendChild(opt);
  });
  if (currentURI) deviceVoiceSelect.value = currentURI;
}

window.onVoicesReady = populateDeviceVoices;
populateVoicePacks();
populateDeviceVoices();

if (voiceSelect) {
  voiceSelect.addEventListener('change', () => {
    window.setVoicePackId(voiceSelect.value);
    syncDeviceVoiceRow();
    previewCurrentVoice();
  });
}

if (deviceVoiceSelect) {
  deviceVoiceSelect.addEventListener('change', () => {
    if (window.setPreferredVoice) window.setPreferredVoice(deviceVoiceSelect.value);
    previewCurrentVoice();
  });
}

if (voicePreviewBtn) {
  voicePreviewBtn.addEventListener('click', previewCurrentVoice);
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
