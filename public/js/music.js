// Optional background music during a practice. Everything here is
// generated on the fly with the Web Audio API — no audio files to record,
// license, or host. Runs independently of the spoken narration
// (js/speech.js uses the separate speechSynthesis API), so both play at
// the same time without either blocking the other.
//
// This intentionally leans toward actual soft *music* — a slow chord
// progression, arpeggiated or sustained — rather than a drone/noise-bed/
// gong ("white noise machine") sound, which is what an earlier version of
// this file did and didn't land well.
(function () {
  let nodes = []; // long-lived nodes (sustained chords) to hard-stop on stop
  let timers = []; // setTimeout ids driving note/chord scheduling
  let masterGain = null;
  let currentTrack = 'none';

  // Overall background-music level, relative to narration/chime. Kept
  // gentle on purpose — "quiet and soft" was the ask, not loud.
  const MASTER_LEVEL = 1.2;

  // A slow, calm four-chord loop (Cmaj7 - Am7 - Fmaj7 - G), shared by all
  // the music tracks below so they sound like variations on one quiet
  // piece rather than unrelated sound effects.
  const CHORD_PROGRESSION = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0], // Am7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0, 246.94, 293.66], // G
  ];

  const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

  // `titleOnly: true` also trims narration down to just the pose name (no
  // full spoken cue) — see NARRATION handling in js/app.js.
  window.MUSIC_TRACKS = [
    { id: 'none', label: 'None (narration only)' },
    { id: 'none-title', label: 'None (exercise title only)', titleOnly: true },
    { id: 'piano', label: 'Soft Piano' },
    { id: 'strings', label: 'Gentle Strings' },
    { id: 'chimes', label: 'Wind Chimes' },
  ];

  // A single soft, piano/bell-like plucked note: quick attack, gentle
  // exponential decay. Two oscillators (fundamental + quiet octave-ish
  // overtone) give it a little warmth instead of a flat, sterile tone.
  // These are short and self-stopping, so — like the existing chime/tick
  // sounds — they're not tracked in `nodes` for teardown; stopping the
  // scheduling timers just lets the last note or two ring out naturally.
  function pluckNote(ctx, out, freq, { peak = 0.08, decay = 2.2, overtoneMult = 2 } = {}) {
    const t = ctx.currentTime;
    [{ mult: 1, level: peak }, { mult: overtoneMult, level: peak * 0.22 }].forEach(({ mult, level }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(level, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + decay + 0.1);
    });
  }

  // Soft Piano: slowly arpeggiates the chord progression, one note at a
  // time, like a quiet lullaby loop.
  function startSoftPiano(ctx, out) {
    let chordIdx = 0;
    let noteIdx = 0;
    function nextNote() {
      const chord = CHORD_PROGRESSION[chordIdx];
      pluckNote(ctx, out, chord[noteIdx % chord.length], { peak: 0.09, decay: 2.4 });
      noteIdx++;
      if (noteIdx >= chord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % CHORD_PROGRESSION.length;
      }
      timers.push(setTimeout(nextNote, 1500 + Math.random() * 300));
    }
    nextNote();
  }

  // Gentle Strings: the same chord progression, but sustained and
  // crossfaded rather than plucked — a slow, soft, drifting pad that
  // actually moves between chords instead of holding one static drone.
  function startGentleStrings(ctx, out) {
    let chordIdx = 0;
    const HOLD = 6; // seconds each chord is held (incl. its fades)
    const FADE = 2.2; // seconds of fade in/out

    function playChord() {
      const freqs = CHORD_PROGRESSION[chordIdx % CHORD_PROGRESSION.length];
      const t = ctx.currentTime;
      const perNotePeak = 0.05 / freqs.length; // keep total chord loudness roughly level
      freqs.forEach((freq) => {
        [1, 1.006].forEach((detune) => { // two barely-detuned oscillators = soft chorus warmth
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.value = freq * detune;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(perNotePeak, t + FADE);
          gain.gain.setValueAtTime(perNotePeak, t + HOLD - FADE);
          gain.gain.linearRampToValueAtTime(0.0001, t + HOLD);
          osc.connect(gain).connect(out);
          osc.start(t);
          osc.stop(t + HOLD + 0.1);
          nodes.push(osc, gain);
        });
      });
      chordIdx++;
      // Next chord's fade-in overlaps this one's fade-out.
      timers.push(setTimeout(playChord, (HOLD - FADE) * 1000));
    }
    playChord();
  }

  // Wind Chimes: sparse, random soft bell tones from a pentatonic scale —
  // minimal and quiet, more like an actual wind chime than a gong strike.
  function startWindChimes(ctx, out) {
    function chime() {
      const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      pluckNote(ctx, out, freq, { peak: 0.065, decay: 3.4, overtoneMult: 2.01 });
      timers.push(setTimeout(chime, 2800 + Math.random() * 3200));
    }
    chime();
  }

  window.stopMusic = function stopMusic() {
    nodes.forEach((n) => {
      try { n.stop && n.stop(); } catch (e) { /* already stopped */ }
      try { n.disconnect && n.disconnect(); } catch (e) { /* already disconnected */ }
    });
    nodes = [];
    timers.forEach((t) => clearTimeout(t));
    timers = [];
    if (masterGain) {
      try { masterGain.disconnect(); } catch (e) { /* no-op */ }
      masterGain = null;
    }
    currentTrack = 'none';
  };

  window.startMusic = function startMusic(trackId) {
    window.stopMusic();
    // Both 'none' variants are silent — they differ only in how much gets
    // narrated, which app.js handles.
    if (!trackId || trackId === 'none' || trackId === 'none-title') return;
    const ctx = window.getAudioContext && window.getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_LEVEL;
    masterGain.connect(ctx.destination);
    window.__musicMasterGain = masterGain; // debug/verification hook only

    if (trackId === 'piano') startSoftPiano(ctx, masterGain);
    else if (trackId === 'strings') startGentleStrings(ctx, masterGain);
    else if (trackId === 'chimes') startWindChimes(ctx, masterGain);

    currentTrack = trackId;
  };

  window.currentMusicTrack = function currentMusicTrack() {
    return currentTrack;
  };
})();
