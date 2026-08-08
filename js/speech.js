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

function pickVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer a calm-sounding English voice if one is available; otherwise
  // fall back to whatever the browser defaults to.
  const preferred =
    voices.find((v) => /en-US|en-GB/.test(v.lang) && /female|samantha|victoria|zira/i.test(v.name)) ||
    voices.find((v) => v.lang && v.lang.startsWith('en')) ||
    voices[0];
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

window.speak = function speak(text, { rate = 0.95 } = {}) {
  if (!speechAvailable()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = 1;
  if (!preferredVoice && voicesReady === false) preferredVoice = pickVoice();
  if (preferredVoice) utter.voice = preferredVoice;
  window.speechSynthesis.speak(utter);
}

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

window.unlockAudio = function unlockAudio() {
  // Call from a user gesture (e.g. the Start button) so autoplay policies
  // don't block the chime/speech later.
  const ctx = ensureAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
};
