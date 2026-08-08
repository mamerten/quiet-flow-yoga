// FIGURES, generateWorkout, and the speech helpers are attached to `window`
// by figures.js / workout.js / speech.js, which load before this file.
const { FIGURES, generateWorkout, speak, stopSpeaking, chime, unlockAudio, speechAvailable } = window;

const homeScreen = document.getElementById('screen-home');
const workoutScreen = document.getElementById('screen-workout');
const completeScreen = document.getElementById('screen-complete');

const durationButtons = document.querySelectorAll('.duration-btn');
const customInput = document.getElementById('custom-minutes');
const customStartBtn = document.getElementById('custom-start');
const audioNote = document.getElementById('audio-note');

const figureHost = document.getElementById('figure-host');
const poseName = document.getElementById('pose-name');
const poseSanskrit = document.getElementById('pose-sanskrit');
const poseCue = document.getElementById('pose-cue');
const poseTimeLeft = document.getElementById('pose-time-left');
const poseProgressBar = document.getElementById('pose-progress-bar');
const overallProgressBar = document.getElementById('overall-progress-bar');
const stepLabel = document.getElementById('step-label');
const nextLabel = document.getElementById('next-label');
const pauseBtn = document.getElementById('pause-btn');
const skipBtn = document.getElementById('skip-btn');
const endBtn = document.getElementById('end-btn');

const summaryText = document.getElementById('summary-text');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

let state = null; // { segments, index, remaining, paused, timerId, totalMinutes, wakeLock }

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

function startSegment() {
  const seg = state.segments[state.index];
  const next = state.segments[state.index + 1];

  state.remaining = seg.duration;
  renderFigure(seg.pose);
  poseName.textContent = seg.pose.name;
  poseSanskrit.textContent = seg.pose.sanskrit || '';
  poseCue.textContent = seg.pose.cue;
  stepLabel.textContent = `Pose ${state.index + 1} of ${state.segments.length}`;
  nextLabel.textContent = next ? `Next: ${next.pose.name}` : 'Next: Finish';
  poseTimeLeft.textContent = formatTime(state.remaining);
  poseProgressBar.style.width = '100%';

  const elapsedBefore = state.segments.slice(0, state.index).reduce((s, x) => s + x.duration, 0);
  overallProgressBar.style.width = `${Math.round((elapsedBefore / state.totalSeconds) * 100)}%`;

  chime();
  speak(`${seg.pose.name}. ${seg.pose.cue}`);
}

function tick() {
  state.remaining -= 1;
  poseTimeLeft.textContent = formatTime(Math.max(state.remaining, 0));
  const seg = state.segments[state.index];
  poseProgressBar.style.width = `${Math.max((state.remaining / seg.duration) * 100, 0)}%`;

  const elapsedTotal =
    state.segments.slice(0, state.index).reduce((s, x) => s + x.duration, 0) + (seg.duration - state.remaining);
  overallProgressBar.style.width = `${Math.min((elapsedTotal / state.totalSeconds) * 100, 100)}%`;

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
  startSegment();
}

function finishWorkout() {
  clearInterval(state.timerId);
  stopSpeaking();
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

  state = {
    segments,
    index: 0,
    remaining: 0,
    paused: false,
    timerId: null,
    totalMinutes,
    totalSeconds,
    wakeLock,
  };

  pauseBtn.textContent = 'Pause';
  showScreen(workoutScreen);
  startSegment();
  startTimer();
}

function togglePause() {
  if (!state) return;
  state.paused = !state.paused;
  if (state.paused) {
    clearInterval(state.timerId);
    stopSpeaking();
    pauseBtn.textContent = 'Resume';
  } else {
    startTimer();
    pauseBtn.textContent = 'Pause';
  }
}

function skipSegment() {
  if (!state) return;
  stopSpeaking();
  advance();
}

function endWorkout() {
  if (!state) return;
  clearInterval(state.timerId);
  stopSpeaking();
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

customStartBtn.addEventListener('click', () => {
  const minutes = Number(customInput.value);
  if (minutes >= 2 && minutes <= 60) {
    beginWorkout(minutes);
  } else {
    customInput.focus();
  }
});

pauseBtn.addEventListener('click', togglePause);
skipBtn.addEventListener('click', skipSegment);
endBtn.addEventListener('click', endWorkout);
restartBtn.addEventListener('click', () => {
  showScreen(homeScreen);
});
homeBtn.addEventListener('click', () => showScreen(homeScreen));

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
