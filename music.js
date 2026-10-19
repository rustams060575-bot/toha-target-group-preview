/* Спокойная музыка без внешних файлов.
   Композиция синтезируется в браузере в готовую аудиозапись (OfflineAudioContext → WAV) и играет обычным <audio loop>.
   Так звук работает на телефонах (iOS/Android), в том числе при выключенном боковом переключателе «без звука». */
(function () {
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  const CHORDS = [[45, 57, 60, 64, 67, 71], [41, 53, 57, 60, 64, 67], [48, 55, 59, 62, 64, 67], [43, 55, 59, 62, 64, 69]]; // Am9 – Fmaj9 – Cmaj7 – G6
  const PENTA = [69, 72, 74, 76, 79, 81, 84];
  const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  const DUR = 31, SR = 22050, CHORD = 6.5;

  let audio = null, url = null, rendering = null, playing = false, wanted = false, fadeT = null;
  const api = window.Music = { onchange: null, get on() { return playing; }, get wanted() { return wanted; } };
  const emit = () => api.onchange && api.onchange(playing);

  function setSession() { try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {} }

  function makeAudio() {
    if (audio) return audio;
    audio = new Audio(); audio.loop = true; audio.preload = 'auto'; audio.setAttribute('playsinline', ''); audio.volume = 0;
    audio.addEventListener('playing', () => { if (url && audio.src === url) { playing = true; emit(); } });
    audio.addEventListener('pause', () => { if (!wanted) { playing = false; emit(); } });
    return audio;
  }

  // ---------- синтез ----------
  function wavBlob(buf) {
    const ch = buf.numberOfChannels, len = buf.length, bytes = len * ch * 2, v = new DataView(new ArrayBuffer(44 + bytes));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + bytes, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, ch, true); v.setUint32(24, buf.sampleRate, true); v.setUint32(28, buf.sampleRate * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, bytes, true);
    const d = [], o = { p: 44 }; for (let c = 0; c < ch; c++) d.push(buf.getChannelData(c));
    for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, d[c][i])); v.setInt16(o.p, s < 0 ? s * 0x8000 : s * 0x7fff, true); o.p += 2; }
    return new Blob([v], { type: 'audio/wav' });
  }

  function render() {
    if (rendering) return rendering;
    rendering = new Promise((resolve, reject) => {
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OAC) return reject(new Error('no OfflineAudioContext'));
      const c = new OAC(2, DUR * SR, SR);
      const master = c.createGain(); master.gain.value = .9;
      const comp = c.createDynamicsCompressor();
      const wet = c.createGain(); wet.gain.value = .55; const dry = c.createGain(); dry.gain.value = .6;
      const rlen = Math.floor(SR * 3.2), rb = c.createBuffer(2, rlen, SR);
      for (let ch = 0; ch < 2; ch++) { const d = rb.getChannelData(ch); for (let i = 0; i < rlen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rlen, 2.6); }
      const rv = c.createConvolver(); rv.buffer = rb;
      master.connect(dry); master.connect(rv); rv.connect(wet); dry.connect(comp); wet.connect(comp); comp.connect(c.destination);

      const chordDur = CHORD;
      CHORDS.forEach((notes, k) => {
        const t = .05 + k * chordDur;
        notes.forEach((n, i) => [-6, 6].forEach(det => {
          const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
          o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.value = N(n); o.detune.value = det;
          f.type = 'lowpass'; f.frequency.value = 700 + i * 120; f.Q.value = .4;
          const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .08 + Math.random() * .1; lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency); lfo.start(t); lfo.stop(t + chordDur + 3.2);
          const peak = (i === 0 ? .1 : .045) / 2;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + chordDur * .38); g.gain.linearRampToValueAtTime(0, t + chordDur + 3);
          o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + chordDur + 3.2);
        }));
      });
      for (let t = 2 + Math.random() * 2; t < DUR - 6; t += 2.6 + Math.random() * 4.2) {
        const n = PENTA[Math.floor(Math.random() * PENTA.length)];
        [[1, 1], [2.01, .22], [3.98, .08]].forEach(([m, a]) => {
          const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = N(n) * m;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 * a, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 4.5);
          o.connect(g); g.connect(master); o.start(t); o.stop(t + 4.6);
        });
      }
      const done = b => { try { resolve(URL.createObjectURL(wavBlob(b))); } catch (e) { reject(e); } };
      const p = c.startRendering();
      if (p && p.then) p.then(done, reject); else c.oncomplete = e => done(e.renderedBuffer); // старый Safari
    });
    rendering.catch(() => { rendering = null; });
    return rendering;
  }

  function fadeTo(v, ms) {
    clearInterval(fadeT); const a = audio, from = a.volume, t0 = performance.now();
    fadeT = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms); try { a.volume = from + (v - from) * k; } catch (e) {}
      if (k >= 1) { clearInterval(fadeT); if (v === 0 && !wanted) a.pause(); }
    }, 50);
  }

  api.prepare = () => { render().then(u => { url = u; }).catch(() => {}); };

  api.start = function () {
    wanted = true; setSession();
    const a = makeAudio();
    // 1) разблокируем плеер прямо в жесте пользователя (важно для iOS)
    if (!a.src) { a.src = SILENT; }
    const unlock = a.play(); if (unlock && unlock.catch) unlock.catch(() => {});
    // 2) когда музыка готова — подставляем её и играем
    render().then(u => {
      url = u; if (!wanted) return;
      if (a.src !== u) { const keep = a.volume; a.src = u; a.loop = true; a.volume = keep; }
      const p = a.play();
      if (p && p.then) p.then(() => fadeTo(.75, 2500)).catch(() => { playing = false; wanted = false; emit(); });
      else fadeTo(.75, 2500);
    }).catch(() => { playing = false; wanted = false; emit(); });
  };

  api.stop = function () {
    wanted = false; if (!audio) { playing = false; emit(); return; }
    fadeTo(0, 700); setTimeout(() => { if (!wanted) { audio.pause(); playing = false; emit(); } }, 800);
  };

  api.toggle = () => { (playing || wanted) ? api.stop() : api.start(); };

  document.addEventListener('visibilitychange', () => { if (document.hidden && audio && playing) audio.pause(); else if (!document.hidden && wanted && audio) audio.play().catch(() => {}); });
})();
