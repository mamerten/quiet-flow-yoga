// FIGURES, generateWorkout, and the audio helpers are attached to `window`
// by figures.js / workout.js / speech.js / music.js, which load before
// this file.
const {
  FIGURES,
  generateWorkout,
  speak,
  stopSpeaking,
  chime,
  countdownTick,
  unlockAudio,
  speechAvailable,
  startMusic,
  stopMusic,
  pauseAllAudio,
  resumeAllAudio,
} = window;

const APP_VERSION = '0.1.0';
const COUNTDOWN_SECONDS = 3;

const homeScreen = document.getElementById('screen-home');
const workoutScreen = document.getElementById('screen-workout');
const completeScreen = document.getElementById('screen-complete');

const durationButtons = document.querySelectorAll('.duration-btn');
const musicSelect = document.getElementById('music-select');
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
  nextLabel.textContent = next ? `Next: ${next.pose.name}` : 'Next: Finish';

  holdView.classList.add('hidden');
  countdownView.classList.remove('hidden');
  countdownNumber.textContent = String(state.remaining);
  countdownNext.textContent = seg.pose.name;
  topTimer.textContent = ''; // only shown once a pose is actually live

  updateOverallProgress(index);
  speak(`Up next: ${seg.pose.name}`);
}

// Actively holding the pose: narrate the full cue and start its timer.
function startHold(index) {
  const seg = state.segments[index];

  state.phase = 'hold';
  state.remaining = seg.duration;

  countdownView.classList.add('hidden');
  holdView.classList.remove('hidden');

  poseName.textContent = seg.pose.name;
  poseSanskrit.textContent = seg.pose.sanskrit || '';
  poseCue.textContent = seg.pose.cue;
  poseTimeLeft.textContent = formatTime(state.remaining);
  poseProgressBar.style.width = '100%';
  topTimer.textContent = formatTime(state.remaining);

  chime();
  speak(`${seg.pose.name}. ${seg.pose.cue}`);
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
  stopSpeaking();
  stopMusic();
  releaseWakeLock();
  overallProgressBar.style.width = '100%';
  summaryText.textContent = `Great job — you completed your ${state.totalMinutes}-minute practice (${state.segments.length} poses).`;
  speak('Great job. You completed your practice. Namaste.');
  showScreen(completeScreen);
}

async function beginWorkout(totalMinutes) {
  unlockAudio();
  const segments = generateWorkout(totalMinutes);
  const totalSeconds = segments.reduce((s, x) => s + x.duration, 0);
  const wakeLock = await requestWakeLock();
  const musicId = musicSelect ? musicSelect.value : 'none';

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
    stopSpeaking();
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
  stopSpeaking();
  if (state.phase === 'countdown') {
    startHold(state.index); // skip straight past the countdown into the pose
  } else {
    advance();
  }
}

function endWorkout() {
  if (!state) return;
  clearInterval(state.timerId);
  stopSpeaking();
  stopMusic();
  releaseWakeLock();
  state = null;
  showScreen(homeScreen);
}

// --- wire up UI ---

durationButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
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
