// Pre-generated narration playback.
//
// The app ships real neural-TTS audio (see tools/generate-voice.py) so the
// narration sounds the same natural voice on every device, instead of
// whatever text-to-speech engine the OS happens to include — which on many
// phones and on Windows is an old, robotic one.
//
// Falls back to the device's built-in speech synthesis (js/speech.js) if a
// clip is missing or the audio fails to load, so narration never goes
// silent.
(function () {
  const STORAGE_KEY = 'quietflow.voicePack';

  // Bundled voice packs, in public/audio/<id>/. Keep ids in sync with
  // tools/generate-voice.py.
  window.VOICE_PACKS = [
    { id: 'lessac', label: 'Clara — clear and steady', dir: 'audio/lessac' },
    { id: 'amy', label: 'Amy — warm and soft', dir: 'audio/amy' },
    { id: 'device', label: 'Device voice', dir: null },
  ];

  const manifests = {}; // packId -> { clips: {key: filename} }

  // A single, reused <audio> element for every clip, rather than a fresh
  // `new Audio()` per call. This matters on iOS Safari specifically: the
  // "may only autoplay after a user gesture" unlock it grants applies to
  // the ELEMENT that was played during the gesture, not to the page as a
  // whole — a brand-new element created later is treated as un-unlocked
  // and silently blocked. Reusing one element keeps every subsequent play
  // inside that original unlock.
  let audioEl = null;
  function getAudioEl() {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = 'auto';
    }
    return audioEl;
  }

  // 45-byte silent WAV. Playing (and immediately releasing) this from
  // directly inside a user gesture — before any `await`/promise turn —
  // is what actually grants the unlock; see unlockVoiceAudio() below.
  const SILENT_WAV =
    'data:audio/wav;base64,UklGRiUAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQEAAACA';

  // Call synchronously from the very top of a click handler (before any
  // `await`), once per session is enough. Safe to call repeatedly.
  window.unlockVoiceAudio = function unlockVoiceAudio() {
    const el = getAudioEl();
    const prevSrc = el.src;
    el.src = SILENT_WAV;
    const p = el.play();
    if (p && p.catch) p.catch(() => {});
    el.pause();
    try {
      el.currentTime = 0;
    } catch (e) {
      // Some browsers throw setting currentTime before metadata loads —
      // harmless, the unlock already happened.
    }
    if (prevSrc) el.src = prevSrc;
  };

  function storedPackId() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  window.getVoicePackId = function getVoicePackId() {
    const saved = storedPackId();
    if (saved && window.VOICE_PACKS.some((p) => p.id === saved)) return saved;
    return window.VOICE_PACKS[0].id;
  };

  window.setVoicePackId = function setVoicePackId(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      // Storage unavailable — the choice still applies for this session.
    }
    loadManifest(id);
  };

  function packById(id) {
    return window.VOICE_PACKS.find((p) => p.id === id) || null;
  }

  function loadManifest(packId) {
    const pack = packById(packId);
    if (!pack || !pack.dir || manifests[packId]) return Promise.resolve(manifests[packId] || null);
    return fetch(pack.dir + '/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        manifests[packId] = json;
        return json;
      })
      .catch(() => null);
  }

  window.preloadVoicePack = loadManifest;

  // Resolves once whatever is currently narrating — bundled audio OR
  // device speech synthesis — is done. Reassigned on every narrate() call
  // to cover that call's *entire* lifecycle, including the manifest fetch
  // that happens before playback even starts (which matters: without this,
  // a caller could check "is anything playing?" during that brief async
  // gap, before .play() was ever invoked, and wrongly conclude nothing
  // was happening).
  let activePromise = Promise.resolve();

  function waitForSpeechEnd() {
    if (!window.speechSynthesis || !window.speechSynthesis.speaking) return Promise.resolve();
    return new Promise((resolve) => {
      (function poll() {
        if (!window.speechSynthesis.speaking) resolve();
        else setTimeout(poll, 150);
      })();
    });
  }

  window.stopNarration = function stopNarration() {
    if (audioEl && !audioEl.paused) audioEl.pause();
    if (window.stopSpeaking) window.stopSpeaking();
    // Release anyone in finishNarrationThen waiting on the in-flight
    // narration — this is an explicit user action (Skip/Pause/End), so
    // waiting any further is wrong. (Reassigning here doesn't retroactively
    // settle the old promise object; callers who already attached a
    // .then() to it are protected instead by app.js's own state guard, so
    // an eventually-stale callback is a safe no-op rather than a bug.)
    activePromise = Promise.resolve();
  };

  /**
   * Calls `callback` once whatever is currently narrating finishes, or
   * immediately if nothing is. Used so a new sound (the transition chime)
   * doesn't cut an in-progress line off mid-sentence. Bounded by
   * `maxWaitMs` in case something never resolves — narration must never
   * get permanently stuck.
   *
   * Default is deliberately generous: measured "Up next: <longer pose
   * name>, left/right side" clips already run to ~4s on their own, so a
   * tight default here would just reintroduce a milder version of the
   * cutting-off-narration bug this exists to fix.
   */
  window.finishNarrationThen = function finishNarrationThen(callback, maxWaitMs) {
    let done = false;
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      callback();
    }
    const timer = setTimeout(finish, maxWaitMs || 8000);
    activePromise.then(finish);
  };

  /**
   * Speak a line. `key` selects a pre-generated clip; `fallbackText` is
   * spoken by the device's TTS if that clip isn't available.
   */
  window.narrate = function narrate(key, fallbackText, opts) {
    window.stopNarration();

    const packId = (opts && opts.packId) || window.getVoicePackId();
    const pack = packById(packId);

    const useDeviceVoice = () => {
      if (window.speak) window.speak(fallbackText, opts || {});
      return waitForSpeechEnd();
    };

    if (!pack || !pack.dir) {
      activePromise = Promise.resolve().then(useDeviceVoice);
      return;
    }

    activePromise = loadManifest(packId).then((manifest) => {
      const file = manifest && manifest.clips && manifest.clips[key];
      if (!file) return useDeviceVoice();

      const el = getAudioEl();
      el.src = pack.dir + '/' + file;
      el.volume = 1;
      return el.play().then(
        () => new Promise((resolve) => el.addEventListener('ended', resolve, { once: true })),
        // Autoplay blocked or decode failed — don't lose the instruction.
        () => useDeviceVoice()
      );
    });
  };

  // Warm the manifest for the saved pack as soon as the app loads.
  loadManifest(window.getVoicePackId());
})();
