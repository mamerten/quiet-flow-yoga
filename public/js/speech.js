// Audible instruction helpers: spoken cues via the Web Speech API, plus a
// short chime for transitions. No audio files needed.

let audioCtx = null;
let cachedVoices = [];
const VOICE_STORAGE_KEY = 'quietflow.voiceURI';

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

// --- Voice quality ranking -------------------------------------------------
//
// Web Speech quality is entirely down to which engine the OS ships, and the
// names are the only signal available. Every platform ships BOTH a legacy
// formant-synthesis voice (very robotic) and, usually, a modern neural one
// under a different label. The scoring below pushes the neural ones to the
// top and actively pushes the known-robotic ones to the bottom.

// Strongest neural markers. On iOS/macOS the good voices are literally
// labelled "(Enhanced)"/"(Premium)"; on Windows/Edge they're "... Natural" or
// "Microsoft ... Online"; Google/Android use "Google <lang>" for their
// server-backed neural voices.
const TIER_NEURAL = /neural|natural|enhanced|premium|siri|\bwavenet\b|\bstudio\b|\bjourney\b|\bpolyglot\b/i;
const TIER_GOOGLE = /^google\s/i;

// macOS/iOS novelty voices — deliberately silly, never appropriate here.
const TIER_NOVELTY = /bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|\bfred\b|junior|\bralph\b|\bkathy\b|princess|\bbruce\b|\bagnes\b/i;

// Classic formant-synthesis engines and the old SAPI/Apple voice sets. These
// are the "robotic" ones — demoted so any neural voice wins, but still
// rankable among themselves (on a stock Windows box they're all you get).
const TIER_LEGACY = /espeak|festival|flite|\bpico\b|compact|\bdavid\b|\bmark\b|\bzira\b|\bhazel\b|\bgeorge\b|\bsusan\b|\blinda\b|\brichard\b|\bsean\b|\bvicki\b|\bvictoria\b|\bdaniel\b|\bkaren\b|\bmoira\b|\btessa\b|\bfiona\b|\balex\b/i;

// Soft/female-sounding names across platforms. Used as a tiebreaker — the
// quality tier above always dominates, but among equally-ranked voices this
// prefers a woman's voice, which is what this app wants.
const FEMALE_VOICE = /aria|jenny|emma|\bava\b|samantha|allison|\bsusan\b|\bkaren\b|moira|tessa|serena|fiona|\bnora\b|\bzoe\b|joanna|salli|kendra|kimberly|\bivy\b|\bamy\b|olivia|libby|sonia|michelle|aigul|\bzira\b|\bhazel\b|\blinda\b|\bvicki\b|\bvictoria\b|\bcatherine\b|heera|\bfemale\b|\bwoman\b/i;

function scoreVoice(v) {
  const name = v.name || '';
  let score = 0;

  if (TIER_NEURAL.test(name)) score += 1000;
  else if (TIER_GOOGLE.test(name)) score += 700;

  if (TIER_NOVELTY.test(name)) score -= 5000; // never auto-pick a joke voice
  else if (TIER_LEGACY.test(name)) score -= 900;

  // localService voices are on-device. Modern on-device neural voices are
  // great, but a *non-neural* localService voice is usually the old robotic
  // engine, while a remote one is usually a cloud neural voice.
  if (!v.localService && !TIER_LEGACY.test(name)) score += 120;

  // Gender is a tiebreaker within a quality tier, so it must outweigh the
  // small locale/default nudges below but never a tier difference.
  if (FEMALE_VOICE.test(name)) score += 200;

  // Prefer en-US/en-GB over other English locales, purely for consistency.
  const lang = (v.lang || '').toLowerCase();
  if (lang === 'en-us' || lang === 'en_us') score += 40;
  else if (lang === 'en-gb' || lang === 'en_gb') score += 30;

  if (v.default) score += 10;

  return score;
}

// All English voices, best-sounding first. Exposed so the UI can build a
// picker — see the "Voice" dropdown on the home screen.
window.listVoices = function listVoices() {
  if (!window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length) cachedVoices = voices;

  const english = cachedVoices.filter((v) => (v.lang || '').toLowerCase().startsWith('en'));
  const pool = english.length ? english : cachedVoices;
  return pool.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));
};

function storedVoiceURI() {
  try {
    return localStorage.getItem(VOICE_STORAGE_KEY);
  } catch (e) {
    return null; // private mode / storage disabled
  }
}

// The user's explicit pick wins; otherwise the highest-scoring voice.
function resolveVoice() {
  const ranked = window.listVoices();
  if (!ranked.length) return null;
  const savedURI = storedVoiceURI();
  if (savedURI) {
    const saved = ranked.find((v) => v.voiceURI === savedURI);
    if (saved) return saved;
  }
  return ranked[0];
}

window.setPreferredVoice = function setPreferredVoice(voiceURI) {
  try {
    if (voiceURI) localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
    else localStorage.removeItem(VOICE_STORAGE_KEY);
  } catch (e) {
    // Storage unavailable — the pick still applies for this session.
  }
};

window.getPreferredVoiceURI = function getPreferredVoiceURI() {
  const v = resolveVoice();
  return v ? v.voiceURI : null;
};

// Voices load asynchronously in most browsers; re-cache when they arrive.
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices() || cachedVoices;
    if (typeof window.onVoicesReady === 'function') window.onVoicesReady();
  });
}

window.speechAvailable = function speechAvailable() {
  return 'speechSynthesis' in window;
};

// Narration is mixed slightly under full volume so background music (see
// js/music.js) reads clearly alongside it rather than being drowned out.
const NARRATION_VOLUME = 0.8;

// Slightly slower and a touch lower than default — even a good neural voice
// sounds brisk and clipped at rate 1.0 for something meant to be calming.
window.speak = function speak(text, { rate = 0.9, pitch = 0.95, volume = NARRATION_VOLUME, voiceURI = null } = {}) {
  if (!speechAvailable()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;

  // An explicit voiceURI (used by the settings preview button) overrides the
  // saved/auto-picked voice for this one utterance.
  let voice = null;
  if (voiceURI) {
    voice = window.listVoices().find((v) => v.voiceURI === voiceURI) || null;
  }
  if (!voice) voice = resolveVoice();
  if (voice) {
    utter.voice = voice;
    // Some engines mis-select unless lang matches the chosen voice.
    if (voice.lang) utter.lang = voice.lang;
  }

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
