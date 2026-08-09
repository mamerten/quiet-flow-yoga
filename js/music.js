// Optional background sound during a practice. Everything here is
// generated on the fly with the Web Audio API — no audio files to record,
// license, or host. Runs independently of the spoken narration
// (js/speech.js uses the separate speechSynthesis API), so both play at
// the same time without either blocking the other.
(function () {
  let nodes = []; // oscillators/sources/gains to tear down on stop
  let timers = []; // setTimeout ids (for the singing-bowl loop)
  let masterGain = null;
  let currentTrack = 'none';

  // Overall background-sound level, relative to narration/chime. Bumped up
  // from the original tuning — the first pass was mixed too low to be
  // heard clearly, especially the low-frequency Pad tones on phone
  // speakers (which reproduce bass poorly), so Pad/Bowl also use higher,
  // more phone-speaker-friendly frequencies below.
  const MASTER_LEVEL = 1.5;

  window.MUSIC_TRACKS = [
    { id: 'none', label: 'None (narration only)' },
    { id: 'pad', label: 'Soft Pad' },
    { id: 'rain', label: 'Gentle Rain' },
    { id: 'bowl', label: 'Singing Bowl' },
    { id: 'ocean', label: 'Ocean Waves' },
  ];

  function makeNoiseBuffer(ctx, seconds) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function startPad(ctx, out) {
    // A few slow, detuned tones (open fifth + octave) with a gentle volume
    // swell — a simple ambient drone. Pitched an octave higher than the
    // original version so it's actually audible on small phone speakers,
    // which roll off heavily below ~200 Hz.
    const freqs = [220, 329.63, 440];
    const levels = [0.09, 0.055, 0.04];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      gain.gain.linearRampToValueAtTime(levels[i], ctx.currentTime + 1.5);

      osc.connect(gain).connect(out);
      osc.start();
      nodes.push(osc, gain);

      // Slow LFO so the pad breathes instead of holding a flat tone.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.015;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = levels[i] * 0.3;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);
    });
  }

  function startNoiseBed(ctx, out, opts) {
    const { filterType, freq, q, level, lfoRate, lfoDepth } = opts;
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 3);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    filter.Q.value = q;

    const gain = ctx.createGain();
    gain.gain.value = level;

    src.connect(filter).connect(gain).connect(out);
    src.start();
    nodes.push(src, filter, gain);

    if (lfoRate) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = lfoRate;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();
      nodes.push(lfo, lfoGain);
    }

    return gain;
  }

  function startBowlLoop(ctx, out) {
    // A soft struck-bowl tone roughly every 6-8 seconds, with a long decay.
    // Pitched up and boosted from the original version, and the higher
    // (more audible-on-phone-speakers) partials are no longer the
    // quietest ones.
    function strike() {
      const t = ctx.currentTime;
      const partials = [
        { freq: 440, level: 0.07 },
        { freq: 660, level: 0.06 },
        { freq: 880, level: 0.045 },
      ];
      partials.forEach(({ freq, level }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(level, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 5);
        osc.connect(gain).connect(out);
        osc.start(t);
        osc.stop(t + 5.2);
      });
      timers.push(setTimeout(strike, 6000 + Math.random() * 2000));
    }
    strike();
  }

  function startOceanWaves(ctx, out) {
    const gain = startNoiseBed(ctx, out, {
      filterType: 'lowpass',
      freq: 1200,
      q: 0.6,
      level: 0.0001,
      lfoRate: 0.1,
      lfoDepth: 200,
    });
    // Slow amplitude swell so the noise bed washes in and out like surf.
    const waveLfo = ctx.createOscillator();
    waveLfo.frequency.value = 0.08;
    const waveLfoGain = ctx.createGain();
    waveLfoGain.gain.value = 0.045;
    waveLfo.connect(waveLfoGain).connect(gain.gain);
    waveLfo.start();
    gain.gain.value = 0.045;
    nodes.push(waveLfo, waveLfoGain);
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
    if (!trackId || trackId === 'none') return;
    const ctx = window.getAudioContext && window.getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_LEVEL;
    masterGain.connect(ctx.destination);
    window.__musicMasterGain = masterGain; // debug/verification hook only

    if (trackId === 'pad') startPad(ctx, masterGain);
    else if (trackId === 'rain') {
      startNoiseBed(ctx, masterGain, { filterType: 'lowpass', freq: 1800, q: 0.5, level: 0.065, lfoRate: 0.08, lfoDepth: 300 });
    } else if (trackId === 'ocean') startOceanWaves(ctx, masterGain);
    else if (trackId === 'bowl') startBowlLoop(ctx, masterGain);

    currentTrack = trackId;
  };

  window.currentMusicTrack = function currentMusicTrack() {
    return currentTrack;
  };
})();
