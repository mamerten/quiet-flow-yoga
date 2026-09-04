// Optional hands-free "next" command for Calisthenics mode, via the Web
// Speech API's SpeechRecognition (not to be confused with speechSynthesis
// in js/speech.js, which is the opposite direction — text to speech).
//
// Support varies: solid in Chrome/Edge (desktop + Android) and has worked
// in Safari (as the prefixed webkitSpeechRecognition) since iOS/iPadOS
// 14.5. Firefox ships it disabled behind a flag. Where it's unsupported,
// window.voiceControlSupported is false and the app hides the mic button —
// swiping or tapping Next always works regardless.
(function () {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  window.voiceControlSupported = !!Ctor;

  // Command words that mean "advance to the next exercise". Kept short and
  // common so they're easy to recognize breathless mid-set.
  const COMMAND_RE = /\b(next|ready|continue|go)\b/i;

  let recognition = null;
  let active = false; // the user asked to be listened to
  let onCommand = null;
  let restartTimer = null;

  function buildRecognition() {
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = false;
    r.lang = 'en-US';

    r.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) continue;
        const transcript = result[0].transcript || '';
        if (COMMAND_RE.test(transcript) && onCommand) onCommand();
      }
    };

    r.onerror = (event) => {
      // 'no-speech', 'audio-capture', and 'aborted' happen routinely (e.g.
      // a quiet room) and onend already handles restarting. Only mic
      // permission being denied should actually stop listening.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        window.stopVoiceControl();
        if (window.onVoiceControlDenied) window.onVoiceControlDenied();
      }
    };

    r.onend = () => {
      // Several browsers — mobile ones especially — silently end
      // recognition after a pause in speech even with continuous:true.
      // Restart automatically for as long as the user still wants to be
      // heard.
      if (active) {
        restartTimer = setTimeout(() => {
          if (!active) return;
          try {
            recognition = buildRecognition();
            recognition.start();
          } catch (e) {
            // Ignore — a further onend/onerror will retry.
          }
        }, 300);
      }
    };

    return r;
  }

  /**
   * Starts listening for a "next"-type command, calling `callback` each
   * time one is heard. Must be called from a user gesture (mic permission
   * prompts require one). Returns false if unsupported or if starting
   * failed synchronously (e.g. permission already denied).
   */
  window.startVoiceControl = function startVoiceControl(callback) {
    if (!Ctor) return false;
    onCommand = callback;
    active = true;
    try {
      recognition = buildRecognition();
      recognition.start();
      return true;
    } catch (e) {
      active = false;
      return false;
    }
  };

  window.stopVoiceControl = function stopVoiceControl() {
    active = false;
    clearTimeout(restartTimer);
    if (recognition) {
      const r = recognition;
      recognition = null;
      r.onend = null; // this is a deliberate stop, not one to auto-restart
      try {
        r.stop();
      } catch (e) {
        // Already stopped — fine.
      }
    }
  };

  window.isVoiceControlActive = function isVoiceControlActive() {
    return active;
  };
})();
