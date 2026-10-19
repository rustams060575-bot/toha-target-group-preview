(function () {
  'use strict';
  const COPY = window.COPY, root = document.getElementById('site'), html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PHONE = '+38 (097) 097-56-57', TEL = '+380970975657', MAIL = 'toxa_target.group@ukr.net';
  const IG = 'https://www.instagram.com/toha.target.group/';
  const UI = {
    uk: { theme: 'Змінити тему', music: 'Музика', musicHint: 'Увімкнути музику', cities: 'Київ · Одеса', viber: 'Viber', viberHint: 'Якщо чат не відкрився, додайте номер у Viber', brand: ['INTERNATIONAL RECRUITMENT', 'AND WORK FOR SOLUTION'], rights: 'Усі права захищено', demo: 'Демо-режим: заявка збережена локально в браузері.' },
    ru: { theme: 'Сменить тему', music: 'Музыка', musicHint: 'Включить музыку', cities: 'Киев · Одесса', viber: 'Viber', viberHint: 'Если чат не открылся, добавьте номер в Viber', brand: ['INTERNATIONAL RECRUITMENT', 'AND WORK FOR SOLUTION'], rights: 'Все права защищены', demo: 'Демо-режим: заявка сохранена локально в браузере.' },
    en: { theme: 'Toggle theme', music: 'Music', musicHint: 'Turn on music', cities: 'Kyiv · Odesa', viber: 'Viber', viberHint: 'If the chat did not open, add the number in Viber', brand: ['INTERNATIONAL RECRUITMENT', 'AND WORK FOR SOLUTION'], rights: 'All rights reserved', demo: 'Demo mode: the application is saved locally in your browser.' }
  };
  const EMP = ['country', 'company', 'person', 'phone', 'messengers', 'email', 'role', 'count', 'location', 'start', 'comment'];
  const CAN = ['name', 'citizenship', 'residence', 'age', 'profession', 'experience', 'destination', 'languages', 'documents', 'phone', 'candidateMessengers', 'cv'];
  const REQ = { employer: ['country', 'company', 'person', 'phone', 'email', 'role', 'count', 'location'], candidate: ['name', 'citizenship', 'residence', 'age', 'profession', 'phone'] };

  let lang = 'uk'; try { lang = localStorage.getItem('toha-language') || 'uk'; } catch (e) {}
  if (!COPY[lang]) lang = 'uk';
  let tab = 0, triggers = [], ctxs = [];

  const A = n => (window.IMG && window.IMG[n]) || ('assets/' + (n === 'logo-hd' ? 'logo' : n) + '.jpg');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const words = (t, cls) => String(t).split(/\s+/).map(w => `<span class="w"><span${cls ? ` class="${cls}"` : ''}>${esc(w)}</span></span>`).join(' ');
  const iwords = t => String(t).split(/\s+/).map(w => `<span class="iw">${esc(w)}</span>`).join(' ');

  /* ---------------- разметка ---------------- */
  function field(k, t, type) {
    const required = REQ[type].includes(k);
    const itype = ({ email: 'email', phone: 'tel', count: 'number', age: 'number', start: 'date', cv: 'file' })[k] || 'text';
    const attrs = `name="${k}" ${required ? 'required' : ''} ${itype === 'number' ? `min="1" max="${k === 'age' ? 120 : 100000}"` : ''} ${k === 'cv' ? 'accept=".pdf,.doc,.docx"' : ''} ${['name', 'person'].includes(k) ? 'autocomplete="name"' : k === 'email' ? 'autocomplete="email"' : k === 'phone' ? 'autocomplete="tel"' : ''}`;
    const full = ['comment', 'experience', 'cv'].includes(k);
    const input = ['comment', 'experience'].includes(k) ? `<textarea ${attrs} rows="3" maxlength="2000"></textarea>` : `<input type="${itype}" ${attrs} ${itype === 'text' ? 'maxlength="300"' : ''}>`;
    return `<label class="${full ? 'full' : ''}">${esc(t.fields[k])}${required ? ' *' : ''}${input}${k === 'cv' ? `<span class="field-hint">${esc(t.cvHint)}</span>` : ''}</label>`;
  }
  function form(type, idx, t) {
    const list = type === 'employer' ? EMP : CAN;
    return `<div class="panel ${idx === tab ? 'active' : ''}" id="${type}" role="tabpanel">
      <div class="top"><p class="lead">${esc(t.formIntros[idx])}</p><div class="quick"><a href="tel:${TEL}">${PHONE}</a><a href="mailto:${MAIL}">${MAIL}</a></div></div>
      <form data-kind="${type}" novalidate>${list.map(k => field(k, t, type)).join('')}
        <label class="consent"><input name="consent" type="checkbox" required><span>${esc(t.consent)}</span></label>
        <input name="website" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="submit-row"><button class="btn solid" type="submit">${esc(t.submit)}</button><p class="form-status" aria-live="polite"></p></div>
      </form></div>`;
  }
  function render() {
    const t = COPY[lang], u = UI[lang], S = t.sections;
    const imgs = [A('contracts'), A('handshake'), A('dusk')];
    const heroMedia = (window.IMG && !window.TOHA_VIDEO) ? `<img class="kb" src="${A('hero-poster')}" alt="">` : `<video autoplay muted loop playsinline preload="auto" poster="${A('hero-poster')}"><source src="${window.TOHA_VIDEO || 'assets/hero.mp4'}" type="video/mp4"></video>`;
    const dir = i => `<span>${esc(t.nav[i])}</span>`;
    root.innerHTML = `
    <header class="nav" id="nav">
      <a class="brand" href="#top" aria-label="Toha Target Group"><img src="${A('logo')}" alt="" width="40" height="40"><span class="wm"><b>TOHA</b><small>TARGET GROUP</small></span></a>
      <nav aria-label="Menu"><a href="#about">${esc(t.about.nav)}</a><a href="#services">${esc(t.nav[0])}</a><a href="#process">${esc(t.nav[1])}</a><a href="#forms">${esc(t.nav[2])}</a></nav>
      <div class="tools">
        <div class="lang" aria-label="Language">${['uk', 'ru', 'en'].map((l, i) => `${i ? '<i>|</i>' : ''}<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${l === 'uk' ? 'UA' : l.toUpperCase()}</button>`).join('')}</div>
        <button class="icon-btn theme-btn" type="button" aria-label="${u.theme}" title="${u.theme}">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button class="icon-btn music-btn" type="button" aria-label="${u.music}" title="${u.music}"><span class="bars"><b></b><b></b><b></b><b></b><b></b></span><span class="hint">${u.musicHint}</span></button>
        <div class="contact-wrap"><button class="pill-btn" type="button" aria-haspopup="true">${esc(t.contact)}</button>
          <div class="contact-pop">
            <a href="https://wa.me/${TEL.slice(1)}" target="_blank" rel="noopener">WhatsApp</a>
            <a href="https://t.me/${TEL}" target="_blank" rel="noopener">Telegram<small>${PHONE}</small></a>
            <a href="viber://chat?number=${TEL.slice(1)}">Viber<small>${esc(u.viberHint)}: ${PHONE}</small></a>
            <a href="mailto:${MAIL}">Email<small>${MAIL}</small></a>
            <a href="tel:${TEL}">${PHONE}</a>
            <a href="${IG}" target="_blank" rel="noopener">Instagram<small>@toha.target.group</small></a>
          </div></div>
      </div>
    </header>
    <main>
      <section class="hero" id="top">
        <div class="hero-media">${heroMedia}<div class="hero-shade"></div></div>
        <div class="hero-inner">
          <div class="hero-brand" data-hero><b>TOHA</b><small>TARGET GROUP</small></div>
          <p class="eyebrow" data-hero>${esc(t.title)}</p>
          <h1 data-hero-h1>${t.tagline.split(' ').map((w, i, a) => `<span class="w"><span>${i === a.length - 1 ? `<em>${esc(w)}.</em>` : esc(w)}</span></span>`).join(' ')}</h1>
          <p class="lead" data-hero>${esc(t.intro)}</p>
          <div class="cta" data-hero><a class="btn primary" href="#forms" data-tab="0">${esc(t.employer)}</a><a class="btn ghost" href="#forms" data-tab="1">${esc(t.candidate)}</a></div>
          <p class="note" data-hero>${esc(t.note)}</p>
        </div>
        <div class="scroll-cue" aria-hidden="true"></div>
      </section>

      <section class="showcase" id="showcase">
        <div class="show-card"><img class="img-night" src="${A('mecca-night')}" alt=""><img class="img-day" src="${A('london-day')}" alt=""></div>
        <div class="show-text"><h2><span class="l1">${words(t.image[0])}</span><span class="l2">${words(t.image[1])}</span></h2></div>
        <div class="sectors">${t.sectors.map(s => `<span>${esc(s)}</span>`).join('')}</div>
      </section>

      <section class="about pad" id="about"><div class="wrap">
        <div class="grid"><div><p class="eyebrow" data-reveal>${esc(t.about.nav)}</p><h2 class="h2" data-reveal>${esc(t.about.title)}</h2></div>
        <div class="col-r">${t.about.paragraphs.map(p => `<p data-reveal>${esc(p)}</p>`).join('')}</div></div>
        <p class="invite">${iwords(t.about.cta)}</p>
      </div></section>

      <section class="brand-sec" id="brand" aria-label="TOHA Target Group">
        <div class="wrap brand-in">
          <div class="logo-card" data-logo><img src="${A('logo-hd')}" alt="TOHA Target Group" loading="lazy"></div>
          <div class="giant" data-giant aria-hidden="true">${'TOHA'.split('').map(c => `<span>${c}</span>`).join('')}</div>
          <p class="giant-sub">TARGET GROUP · ${esc(t.tagline)}</p>
        </div></section>

      <section class="pad" id="services"><div class="wrap">
        <div class="head"><p class="eyebrow" data-reveal>${esc(S[0])}</p><h2 class="h2" data-reveal>${esc(t.serviceHead)}</h2><p class="lead" data-reveal>${esc(t.serviceIntro)}</p></div>
        <div class="cards">${t.services.map((s, i) => `<article class="card" data-card><img src="${imgs[i]}" alt="" loading="lazy"><span class="num">0${i + 1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p><span class="tag">${esc(s[2])}</span></article>`).join('')}</div>
      </div></section>

      <section class="pad" id="process"><div class="wrap">
        <div class="head"><p class="eyebrow" data-reveal>${esc(S[1])}</p><h2 class="h2" data-reveal>${esc(t.processHead)}</h2><p class="lead" data-reveal>${esc(t.processIntro)}</p></div>
        <div class="stack">${t.steps.map((s, i) => `<article class="step" style="--i:${i}"><div class="big">0${i + 1}</div><div><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div></article>`).join('')}</div>
      </div></section>

      <section class="faq pad" id="faq"><div class="wrap">
        <div class="head"><p class="eyebrow" data-reveal>${esc(S[2])}</p><h2 class="h2" data-reveal>${esc(t.faqHead)}</h2></div>
        <div class="list" data-reveal>${t.faq.map(f => `<details><summary>${esc(f[0])}<i></i></summary><div class="ans"><p>${esc(f[1])}</p></div></details>`).join('')}</div>
      </div></section>

      <section class="forms pad" id="forms"><div class="wrap">
        <div class="head"><p class="eyebrow" data-reveal>${esc(S[3])} · ${esc(S[4].replace(/^\d+ \/ /, ''))}</p><h2 class="h2" data-reveal>${esc(t.formHeads[0])} / ${esc(t.formHeads[1])}</h2></div>
        <div class="panel-box" data-reveal>
          <div class="tabs" role="tablist"><span class="pill"></span>${t.formHeads.map((h, i) => `<button type="button" role="tab" data-tabbtn="${i}" aria-selected="${i === tab}">${esc(h)}</button>`).join('')}</div>
          ${form('employer', 0, t)}${form('candidate', 1, t)}
          <details class="privacy"><summary>${esc(t.privacy.read)}</summary>${t.privacy.parts.map(p => `<h4>${esc(p[0])}</h4><p>${esc(p[1])}</p>`).join('')}</details>
        </div>
      </div></section>
    </main>
    <footer id="contact"><div class="wrap">
      <img class="logo" src="${A('logo-hd')}" alt="Toha Target Group" width="180" height="180">
      <h2 data-reveal>${esc(t.tagline)}.</h2>
      <div class="cta" data-reveal><a class="btn solid" style="width:auto" href="#forms" data-tab="0">${esc(t.employer)}</a><a class="btn ghost" href="#forms" data-tab="1">${esc(t.candidate)}</a></div>
      <div class="links"><a href="tel:${TEL}">${PHONE}</a><a href="mailto:${MAIL}">Email</a><a href="https://t.me/${TEL}" target="_blank" rel="noopener">Telegram</a><a href="https://wa.me/${TEL.slice(1)}" target="_blank" rel="noopener">WhatsApp</a><a href="viber://chat?number=${TEL.slice(1)}">Viber</a><a href="${IG}" target="_blank" rel="noopener">Instagram</a></div>
      <div class="legal"><span>© ${new Date().getFullYear()} TOHA TARGET GROUP · ${esc(u.rights)}</span><span>${esc(u.cities)}</span></div>
    </div></footer>`;
    html.lang = lang; document.title = 'Toha Target Group — ' + t.title;
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = t.intro;
  }

  /* ---------------- поведение ---------------- */
  function bind() {
    const nav = document.getElementById('nav');
    // язык
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
      if (b.dataset.lang === lang) return;
      const drafts = [...root.querySelectorAll('form')].map(f => ({ kind: f.dataset.kind, data: new FormData(f) }));
      lang = b.dataset.lang; try { localStorage.setItem('toha-language', lang); } catch (e) {}
      mount();
      drafts.forEach(d => { const f = root.querySelector(`[data-kind="${d.kind}"]`); for (const [k, v] of d.data) { const el = f.elements[k]; if (!el || el.type === 'file') continue; if (el.type === 'checkbox') el.checked = true; else el.value = v; } });
    });
    // тема
    root.querySelector('.theme-btn').onclick = () => setTheme(html.dataset.theme === 'day' ? 'night' : 'day', true);
    // музыка
    const mb = root.querySelector('.music-btn'), hint = mb.querySelector('.hint');
    const sync = on => mb.classList.toggle('on', on);
    window.Music.onchange = sync; sync(window.Music.on);
    mb.onclick = () => { const turnOn = !window.Music.on && !window.Music.wanted; try { localStorage.setItem('toha-music', turnOn ? 'on' : 'off'); } catch (e) {} window.Music.toggle(); hint.classList.remove('show'); };
    if (!window.Music.on && !sessionStorage.getItem('toha-hint')) { setTimeout(() => hint.classList.add('show'), 2200); setTimeout(() => hint.classList.remove('show'), 7500); try { sessionStorage.setItem('toha-hint', 1); } catch (e) {} }
    // контакты
    const pop = root.querySelector('.contact-pop');
    root.querySelector('.contact-wrap .pill-btn').onclick = e => { e.stopPropagation(); pop.classList.toggle('open'); };
    pop.onclick = e => e.stopPropagation();
    // якоря + вкладки
    root.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1); const el = id === 'top' ? document.body : document.getElementById(id); if (!el) return;
      e.preventDefault(); pop.classList.remove('open');
      if (a.dataset.tab != null) setTab(+a.dataset.tab);
      const y = id === 'top' ? 0 : el.getBoundingClientRect().top + scrollY - 40;
      smoothTo(y);
    }));
    root.querySelectorAll('[data-tabbtn]').forEach(b => b.onclick = () => setTab(+b.dataset.tabbtn));
    placePill();
    // FAQ плавное раскрытие
    root.querySelectorAll('.faq details').forEach(d => {
      const ans = d.querySelector('.ans'); const sum = d.querySelector('summary');
      sum.addEventListener('click', e => {
        e.preventDefault();
        if (d.open) { gsap.to(ans, { height: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { d.open = false; ScrollTrigger.refresh(); } }); }
        else { d.open = true; gsap.fromTo(ans, { height: 0 }, { height: 'auto', duration: .6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() }); }
      });
    });
    // формы
    root.querySelectorAll('form').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); submit(f); }));
    // шапка прячется при скролле вниз
    let last = scrollY; clearInterval(bind.nv);
    bind.nv = setInterval(() => { const y = scrollY; nav.classList.toggle('hide', y > last + 4 && y > 300 && y > innerHeight * .5 ? true : (y < last - 4 ? false : nav.classList.contains('hide'))); last = y; }, 120);
  }
  document.addEventListener('click', () => { const p = document.querySelector('.contact-pop'); p && p.classList.remove('open'); });

  function smoothTo(y) {
    if (reduce) return scrollTo(0, y);
    const o = { v: scrollY }; gsap.to(o, { v: y, duration: 1.3, ease: 'power3.inOut', onUpdate: () => scrollTo(0, o.v), overwrite: true });
  }
  function placePill() {
    const box = root.querySelector('.tabs'); if (!box) return;
    const b = box.querySelectorAll('[data-tabbtn]')[tab], pill = box.querySelector('.pill');
    pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 5}px)`;
  }
  function setTab(i) {
    tab = i;
    root.querySelectorAll('[data-tabbtn]').forEach((b, k) => b.setAttribute('aria-selected', k === i));
    root.querySelectorAll('.panel').forEach((p, k) => p.classList.toggle('active', k === i));
    placePill(); setTimeout(() => ScrollTrigger.refresh(), 100);
  }
  function submit(f) {
    const t = COPY[lang], status = f.querySelector('.form-status'), btn = f.querySelector('button[type=submit]');
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const data = new FormData(f); if (data.get('website')) return;
    const cv = data.get('cv');
    if (cv && cv.size && (cv.size > 5 * 1024 * 1024 || !/\.(pdf|docx?)$/i.test(cv.name))) { status.textContent = t.cvError; return; }
    btn.disabled = true; btn.textContent = t.sending;
    setTimeout(() => {
      const ref = 'TTG-' + Date.now().toString(36).toUpperCase().slice(-6);
      const rec = { ref, kind: f.dataset.kind, lang, at: new Date().toISOString() }; for (const [k, v] of data) if (k !== 'cv' && k !== 'website') rec[k] = v;
      try { const all = JSON.parse(localStorage.getItem('toha-applications') || '[]'); all.push(rec); localStorage.setItem('toha-applications', JSON.stringify(all)); } catch (e) {}
      status.textContent = `${t.success} ${ref}`; f.reset(); btn.disabled = false; btn.textContent = t.submit;
    }, 700);
  }

  /* ---------------- тема ---------------- */
  function setTheme(th, save) {
    html.dataset.theme = th; if (save) { try { localStorage.setItem('toha-theme', th); } catch (e) {} }
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = th === 'day' ? '#fbfbfd' : '#000000';
    window.Crown && window.Crown.setTheme && window.Crown.setTheme(th);
  }

  /* ---------------- анимации ---------------- */
  function kill() { triggers.forEach(t => t.kill()); triggers = []; ScrollTrigger.getAll().forEach(t => t.kill()); gsap.globalTimeline.clear(); }
  function st(vars) { return Object.assign({}, vars); }
  function animate() {
    gsap.registerPlugin(ScrollTrigger);
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    const C = window.Crown && window.Crown.state, small = innerWidth < 700;

    if (reduce) { $$('.invite .iw').forEach(w => w.style.opacity = 1); return; }

    // Вход героя
    const intro = gsap.timeline({ delay: .15 });
    intro.from('[data-hero-h1] .w > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .09 }, 0)
      .from('[data-hero]', { opacity: 0, y: 30, filter: 'blur(10px)', duration: 1.2, ease: 'power3.out', stagger: .12 }, .25);
    if (C) intro.from(C, { s: .2, o: 0, ry: -3, duration: 2.4, ease: 'expo.out' }, .2);

    // Hero: пин, зум видео, въезд сквозь корону
    const heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=140%', scrub: .8, pin: true, anticipatePin: 1 } });
    heroTl.to('.hero-media video, .hero-media img', { scale: 1.35, ease: 'none' }, 0)
      .to('.hero-shade', { opacity: 1.0, ease: 'none' }, 0)
      .to('.hero-inner', { yPercent: -18, opacity: 0, ease: 'power1.in', duration: .55 }, 0)
      .to('.scroll-cue', { opacity: 0, duration: .15 }, 0);
    if (C) heroTl.to(C, { x: 0, y: 0, z: 7.3, s: 1.5, rx: 1.25, ry: 2.2, ease: 'power2.in', duration: 1 }, 0);

    // Showcase: карточка разворачивается на весь экран
    const from = small ? 'inset(20% 8% round 28px)' : 'inset(14% 24% round 36px)';
    const sc = gsap.timeline({ scrollTrigger: { trigger: '.showcase', start: 'top top', end: '+=130%', scrub: .8, pin: true, anticipatePin: 1 } });
    sc.fromTo('.show-card', { clipPath: from }, { clipPath: 'inset(0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.show-card img', { scale: 1.25 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .from('.show-text .l1 .w > span', { yPercent: 115, stagger: .08, ease: 'power3.out', duration: .5 }, .25)
      .from('.show-text .l2 .w > span', { yPercent: 115, stagger: .08, ease: 'power3.out', duration: .5 }, .55)
      .from('.sectors span', { opacity: 0, y: 24, stagger: .08, duration: .4 }, .7);

    // Бренд: TOHA «наезжает» на зрителя и растворяется, из центра выпрыгивает корона
    if ($('.brand-sec')) {
      const cv = document.getElementById('crown');
      gsap.fromTo('.logo-card', { scale: .7, rotate: -6, y: 120, opacity: 0 }, { scale: 1, rotate: 0, y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.brand-sec', start: 'top 90%', end: 'top 10%', scrub: 1 } });
      gsap.set('.giant span', { transformPerspective: 700 });
      gsap.from('.giant span', { yPercent: 120, opacity: 0, rotateX: -60, stagger: .12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.giant', start: 'top 95%', once: true } });
      const bt = gsap.timeline({ scrollTrigger: { trigger: '.brand-sec', start: 'top top', end: '+=260%', scrub: .8, pin: true, anticipatePin: 1,
        onUpdate: s => { if (cv) cv.style.zIndex = s.progress > .3 ? 6 : 1; }, onLeaveBack: () => { if (cv) cv.style.zIndex = 1; } } });
      // 1) буквы летят на зрителя: каждая разлетается в свою сторону, увеличивается и растворяется в экране
      bt.to('.giant', { z: 0, duration: .01 }, 0)
        .to('.giant span', { z: 650, scale: 1.8, x: i => (i - 1.5) * (innerWidth * .32), y: i => (i % 2 ? -1 : 1) * innerHeight * .08, rotateY: i => (i - 1.5) * -22, ease: 'power3.in', duration: .5 }, .08)
        .to('.giant span', { opacity: 0, filter: 'blur(26px)', ease: 'power2.in', duration: .22 }, .34)
        .to('.logo-card', { scale: 2.6, z: 300, opacity: 0, filter: 'blur(14px)', ease: 'power3.in', duration: .45 }, .08)
        .to('.giant-sub', { opacity: 0, y: 40, duration: .2 }, .05);
      // 2) корона отступает вглубь и выпрыгивает из экрана
      if (C) {
        bt.to(C, { z: -18, o: 0, s: .5, ease: 'power2.in', duration: .22 }, 0)
          .set(C, { x: 0, y: .04, ry: -2.4, rx: .55, rz: 0 }, .26)
          .to(C, { o: 1, duration: .08, ease: 'none' }, .46)
          .to(C, { z: 3.2, s: 1.2, ry: 4.4, rx: .12, ease: 'back.out(1.15)', duration: .54 }, .46);
      }
      // после блока корона снова уходит под контент
      ScrollTrigger.create({ trigger: '#services', start: 'top 70%', onEnter: () => { if (cv) cv.style.zIndex = 1; }, onLeaveBack: () => { if (cv) cv.style.zIndex = 6; } });
    }

    // Корона: сквозной полёт по секциям
    if (C) {
      const k = (sel, from, to, start, end) => gsap.fromTo(C, from, Object.assign({ ease: 'none', immediateRender: false, scrollTrigger: { trigger: sel, start, end, scrub: 1 } }, to));
      const base = { z: 0, rz: 0, rx: .15, o: 1 };
      k('.showcase', { x: -.6, y: .1, z: -18, s: 1, rx: .1, ry: -1, o: 0 }, { x: -.6, y: .1, z: -18, s: 1, rx: .1, ry: -1, o: 0 }, 'top bottom', 'bottom top');
      k('#about', { x: -.6, y: .1, z: -18, s: 1, rx: .1, ry: -1, o: 0 }, Object.assign({}, base, { x: -.8, y: .0, s: .8, ry: 1.2, o: 1 }), 'top 90%', 'top 15%');
      k('#services', Object.assign({}, base, { x: 0, y: .04, z: 3.2, s: 1.2, ry: 4.4, rx: .12 }), Object.assign({}, base, { x: .8, y: .05, s: .7, ry: 6.4 }), 'top 75%', 'top 5%');
      k('#process', Object.assign({}, base, { x: .8, y: .05, s: .7, ry: 6.4 }), Object.assign({}, base, { x: .8, y: -.35, s: .65, ry: 8.2, rx: .3 }), 'top 85%', 'top 10%');
      k('#faq', Object.assign({}, base, { x: .8, y: -.35, s: .65, ry: 8.2, rx: .3 }), Object.assign({}, base, { x: .8, y: .3, s: .55, ry: 9.8, o: .7 }), 'top 85%', 'top 15%');
      k('#forms', Object.assign({}, base, { x: .8, y: .3, s: .55, ry: 9.8, o: .7 }), Object.assign({}, base, { x: .88, y: .5, s: .4, ry: 11, o: .25 }), 'top 85%', 'top 20%');
      k('#contact', Object.assign({}, base, { x: .88, y: .5, s: .4, ry: 11, o: .25 }), Object.assign({}, base, { x: 0, y: .62, z: -1, s: .95, ry: 13, rx: .2, o: 1 }), 'top 90%', 'top 30%');
    }

    // Параллакс фона-видео уже в heroTl; reveal-блоки
    ScrollTrigger.batch('[data-reveal]', { start: 'top 88%', once: true, onEnter: els => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: .1, overwrite: true }) });

    // Фраза-приглашение: слова загораются по скроллу
    gsap.to('.invite .iw', { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.invite', start: 'top 80%', end: 'bottom 45%', scrub: true } });

    // Карточки: въезд с глубиной + наклон
    $$('[data-card]').forEach((c, i) => {
      gsap.from(c, { y: 120, rotateX: 14, scale: .92, opacity: 0, transformPerspective: 1100, duration: 1.4, ease: 'expo.out', delay: (i % 3) * .08, scrollTrigger: { trigger: c, start: 'top 92%', once: true } });
      gsap.fromTo(c.querySelector('img'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
      if (!matchMedia('(hover: none)').matches) {
        c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; gsap.to(c, { rotateY: x * 9, rotateX: -y * 9, transformPerspective: 1100, duration: .6, ease: 'power3.out', overwrite: 'auto' }); });
        c.addEventListener('pointerleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1,.6)', overwrite: 'auto' }));
      }
    });

    // Шаги процесса: предыдущие уходят вглубь
    const steps = $$('.step');
    steps.forEach((s, i) => { if (steps[i + 1]) gsap.to(s, { scale: .93, opacity: .45, ease: 'none', scrollTrigger: { trigger: steps[i + 1], start: 'top 75%', end: 'top 25%', scrub: true } }); });


    // Подвал: логотип
    gsap.from('footer .logo', { scale: .4, opacity: 0, rotate: -40, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: 'footer', start: 'top 80%', once: true } });
  }

  function mount() {
    kill(); render(); bind();
    gsap.set('[data-reveal]', {});
    requestAnimationFrame(() => { animate(); ScrollTrigger.refresh(); });
  }

  /* ---------------- старт ---------------- */
  setTheme(html.dataset.theme);
  mount();
  addEventListener('resize', () => { placePill(); });
  addEventListener('load', () => ScrollTrigger.refresh());

  // Музыка: браузеры (особенно iOS) разрешают звук только после касания — включаем при первом настоящем тапе/клике,
  // если пользователь сам её не выключал. Слушатели остаются, пока звук реально не пошёл.
  let pref = null; try { pref = localStorage.getItem('toha-music'); } catch (e) {}
  if (pref !== 'off') {
    const evs = ['click', 'touchend', 'keydown'];
    const cleanup = () => evs.forEach(ev => removeEventListener(ev, go, true));
    function go(e) {
      if (e.target.closest && e.target.closest('.music-btn')) return;
      try { if (localStorage.getItem('toha-music') === 'off') { cleanup(); return; } } catch (err) {}
      window.Music.start();
      setTimeout(() => { if (window.Music.on) cleanup(); }, 2500);
    }
    evs.forEach(ev => addEventListener(ev, go, true));
    // заранее готовим музыку, пока пользователь читает первый экран
    setTimeout(() => { try { window.Music.prepare(); } catch (e) {} }, 3500);
  }
})();
