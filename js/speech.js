// Audible instruction helpers: spoken cues via the Web Speech API, plus a
// short chime for transitions. No audio files needed.

let audioCtx = null;
let voicesReady = false;
let preferredVoice = null;

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

// Shared AudioContext, reused by music.js so background sound, the chime,
// and the countdown tick all live on one audio graph — this is also what
// lets narration and music play at the same time (they're independent
// Web APIs, speechSynthesis vs. Web Audio, so neither blocks the other).
window.getAudioContext = ensureAudioCtx;

// Suspending/resuming the AudioContext pauses every sound running on it
// (music, chime, tick) in one call — used when the practice is paused.
window.pauseAllAudio = function pauseAllAudio() {
  const ctx = ensureAudioCtx();
  if (ctx && ctx.state === 'running') ctx.suspend();
};

window.resumeAllAudio = function resumeAllAudio() {
  const ctx = ensureAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
};

// Recognizable names of natural/neural-sounding voice engines (as opposed
// to older, more robotic-sounding synthesis) across major platforms.
const NATURAL_VOICE = /natural|online|neural|premium|enhanced/i;
// Recognizable names of soft-sounding female voices across major
// platforms/browsers (Windows, macOS/iOS, Chrome's Google voices, Android).
const FEMALE_VOICE = /aria|jenny|emma|ava|zira|samantha|victoria|susan|karen|moira|tessa|hazel|salli|joanna|kendra|kimberly|ivy|serena|fiona|female|woman|google us english|google uk english female/i;

function pickVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const englishVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = englishVoices.length ? englishVoices : voices;

  // Prefer a natural/neural female voice; fall back in stages toward
  // "least robotic available" rather than jumping straight to whatever
  // the browser defaults to (which is often an older, choppier voice).
  const preferred =
    pool.find((v) => NATURAL_VOICE.test(v.name) && FEMALE_VOICE.test(v.name)) ||
    pool.find((v) => FEMALE_VOICE.test(v.name)) ||
    pool.find((v) => NATURAL_VOICE.test(v.name)) ||
    pool[0];
  voicesReady = true;
  return preferred;
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickVoice();
  };
  preferredVoice = pickVoice();
}

window.speechAvailable = function speechAvailable() {
  return 'speechSynthesis' in window;
};

// Narration is mixed slightly under full volume so background music (see
// js/music.js) reads clearly alongside it rather than being drowned out.
const NARRATION_VOLUME = 0.8;

window.speak = function speak(text, { rate = 0.95, volume = NARRATION_VOLUME } = {}) {
  if (!speechAvailable()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = 1;
  utter.volume = volume;
  if (!preferredVoice && voicesReady === false) preferredVoice = pickVoice();
  if (preferredVoice) utter.voice = preferredVoice;
  window.speechSynthesis.speak(utter);
};

window.stopSpeaking = function stopSpeaking() {
  if (window.speechAvailable()) window.speechSynthesis.cancel();
};

window.chime = function chime() {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 523.25; // C5, soft and simple
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

window.countdownTick = function countdownTick() {
  // A short, higher-pitched blip for the 3-2-1 countdown — distinct from
  // the longer chime that marks a pose actually starting.
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880; // A5
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

window.unlockAudio = function unlockAudio() {
  // Call from a user gesture (e.g. the Start button) so autoplay policies
  // don't block the chime/speech later.
  const ctx = ensureAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
};
