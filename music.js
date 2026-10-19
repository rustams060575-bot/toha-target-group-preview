/* Спокойная генеративная музыка (Web Audio): мягкие пэды, редкие колокольчики, без внешних файлов и лицензий */
(function () {
  let ctx, master, started = false, playing = false, timer, step = 0, bellTimer;
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  // Am9 – Fmaj9 – Cmaj7 – G6 (в MIDI)
  const CHORDS = [[45, 57, 60, 64, 67, 71], [41, 53, 57, 60, 64, 67], [48, 55, 59, 62, 64, 67], [43, 55, 59, 62, 64, 69]];
  const PENTA = [69, 72, 74, 76, 79, 81, 84];

  function reverb(c) {
    const len = c.sampleRate * 4.5, buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = c.createConvolver(); conv.buffer = buf; return conv;
  }
  function init() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    const wet = ctx.createGain(); wet.gain.value = .55; const dry = ctx.createGain(); dry.gain.value = .6;
    const rv = reverb(ctx);
    master.connect(dry); master.connect(rv); rv.connect(wet); dry.connect(comp); wet.connect(comp); comp.connect(ctx.destination);
    return true;
  }
  function pad(notes, t, dur) {
    notes.forEach((n, i) => {
      [-6, 6].forEach(det => {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.value = N(n); o.detune.value = det;
        f.type = 'lowpass'; f.frequency.value = 700 + i * 120; f.Q.value = .4;
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .08 + Math.random() * .1; lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency); lfo.start(t); lfo.stop(t + dur + 4);
        const peak = (i === 0 ? .1 : .045) / 2;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + dur * .38); g.gain.linearRampToValueAtTime(0, t + dur + 3);
        o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 3.2);
      });
    });
  }
  function bell() {
    if (!playing) return;
    const t = ctx.currentTime, n = PENTA[Math.floor(Math.random() * PENTA.length)];
    [[1, 1], [2.01, .22], [3.98, .08]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = N(n) * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 * a, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 4.5);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 4.6);
    });
    bellTimer = setTimeout(bell, 2600 + Math.random() * 4200);
  }
  function loop() {
    if (!playing) return;
    const dur = 8; pad(CHORDS[step % CHORDS.length], ctx.currentTime + .05, dur); step++;
    timer = setTimeout(loop, dur * 1000 - 300);
  }
  const api = window.Music = {
    get on() { return playing; },
    onchange: null,
    start() {
      if (!ctx && !init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (playing) return; playing = true;
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(.9, ctx.currentTime, 1.6);
      if (!started) { started = true; }
      loop(); bellTimer = setTimeout(bell, 1800);
      api.onchange && api.onchange(true);
    },
    stop() {
      if (!playing) return; playing = false; clearTimeout(timer); clearTimeout(bellTimer);
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, .5);
      setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 2500);
      api.onchange && api.onchange(false);
    },
    toggle() { playing ? api.stop() : api.start(); }
  };
})();
