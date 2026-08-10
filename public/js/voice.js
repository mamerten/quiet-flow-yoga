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
    { id: 'device', label: 'Device voice (robotic on some phones)', dir: null },
  ];

  const manifests = {}; // packId -> { clips: {key: filename} }
  let current = null;   // currently-playing HTMLAudioElement

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

  window.stopNarration = function stopNarration() {
    if (current) {
      current.pause();
      current = null;
    }
    if (window.stopSpeaking) window.stopSpeaking();
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
    };

    if (!pack || !pack.dir) {
      useDeviceVoice();
      return;
    }

    loadManifest(packId).then((manifest) => {
      const file = manifest && manifest.clips && manifest.clips[key];
      if (!file) {
        useDeviceVoice();
        return;
      }
      const audio = new Audio(pack.dir + '/' + file);
      audio.volume = 1;
      current = audio;
      audio.play().catch(() => {
        // Autoplay blocked or decode failed — don't lose the instruction.
        if (current === audio) current = null;
        useDeviceVoice();
      });
      audio.addEventListener('ended', () => {
        if (current === audio) current = null;
      });
    });
  };

  // Warm the manifest for the saved pack as soon as the app loads.
  loadManifest(window.getVoicePackId());
})();
