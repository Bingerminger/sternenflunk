/* ============================================================
   Sternenflunk — Hauptanwendung.
   Vanilla JS: State, Hash-Router, Onboarding/Admin, Rendering.
   ============================================================ */
'use strict';

(() => {
  const API = 'api.php';

  // Personen-Akzente sind fix (Chart-validiert fürs Dark-Band):
  // Person Eins = Türkis, Person Zwei = Magenta — unabhängig von allem.
  const COLOR = {
    pa: '#2596ac',
    paSoft: '#5fc6da',
    pb: '#c74468',
    pbSoft: '#ef7d9c',
    gold: '#b37e27',
    goldSoft: '#e2b45f',
    bad: '#e66767',
    violet: '#a58bf0',
  };

  const DISCLAIMERS = [
    'Keine Sterne wurden für dieses Flunkoskop befragt.',
    '100 % handgelesen aus Kaffeesatz und JSON.',
    'Täglich frisch geflunkert. Emotional treffsicher.',
    'Alle Angaben ohne Gewähr. Und ohne Teleskop.',
    'Wissenschaftlicher Beirat: ein Webserver im Flur.',
    'Zu Risiken und Nebenwirkungen küssen Sie Ihre bessere Hälfte.',
    'Ähnlichkeiten mit tatsächlichen Schicksalen sind rein kosmetisch.',
    'Dieses Flunkoskop enthält Spuren von Wahrheit.',
    'Von Experten empfohlen, die wir uns ausgedacht haben.',
    'Garantiert frei von echten Planetendaten. Bis auf die echten.',
    'Geprüft vom TÜV für Herzensangelegenheiten. Plakette abgelaufen, Zuneigung nicht.',
    'Die Sterne wurden artgerecht gehalten und täglich gebürstet.',
    'Serviervorschlag: Flunkoskop kann Spuren von Ironie enthalten.',
    'Bei Nebenwirkungen wie Dauergrinsen: einfach weitermachen.',
    'Astrologisch wertlos, emotional unbezahlbar.',
    'Hergestellt in Handarbeit aus 100 % wiederverwertetem Sternenstaub.',
    'Der Mond war bei der Erstellung anwesend, hat aber nichts gesagt.',
    'Prognosen-Genauigkeit: erstaunlich, solange niemand nachmisst.',
    'Dieses Flunkoskop wurde klimaneutral geflunkert.',
    'Für die Richtigkeit übernimmt das Universum die Verantwortung. Es ist groß genug.',
    'Heute frisch vom Himmelsfeld geerntet, ungespritzt und handverlesen.',
    'Kein Stern wurde beim Dreh dieser Prophezeiung verletzt.',
    'Alle Vorhersagen sind frei erfunden. Ähnlichkeiten mit eurem Glück: volle Absicht.',
    'Amtlich beglaubigt von der Sternwarte hinterm Haus.',
  ];

  // ------------------------------------------------- Saison- & Feiertags-Deko

  // Partikel-Sets: [Emojis, Dichte, Animationsklasse]
  const DECO_SETS = {
    xmas:      { emojis: ['❄', '❅', '✦', '❄'], count: 14, mode: 'fall' },
    silvester: { emojis: ['✨', '🎆', '✦', '⭐'], count: 12, mode: 'fall' },
    valentin:  { emojis: ['💗', '💘', '💞'], count: 10, mode: 'rise' },
    halloween: { emojis: ['🦇', '🎃', '🕸️'], count: 8, mode: 'float' },
    ostern:    { emojis: ['🌷', '🐣', '🌼'], count: 10, mode: 'fall' },
    meteors:   { emojis: ['🌠', '✦'], count: 6, mode: 'float' },
    fruehling: { emojis: ['🌸', '🌱'], count: 4, mode: 'fall' },
    sommer:    { emojis: ['☀️', '✨'], count: 3, mode: 'float' },
    herbst:    { emojis: ['🍂', '🍁'], count: 5, mode: 'fall' },
    winter:    { emojis: ['❄'], count: 5, mode: 'fall' },
    sofa:      { emojis: ['☕', '💛', '🫖', '✨', '🧦'], count: 10, mode: 'rise' },
  };

  // ------------------------------------------------------------ Sofa-Modus
  // Wer angeschlagen ist, bekommt die Genesungs-Edition. Gilt pro Tag und
  // Person, lebt nur auf diesem Gerät (localStorage) und vergisst sich selbst.

  function sofaStore() {
    try { return JSON.parse(localStorage.getItem('sflunk_sofa') || '{}'); } catch { return {}; }
  }

  function sofaOn(date, slot) {
    return Boolean(sofaStore()[date]?.includes(slot));
  }

  function sofaToggle(date, slot) {
    const store = sofaStore();
    const list = new Set(store[date] || []);
    if (list.has(slot)) list.delete(slot); else list.add(slot);
    store[date] = [...list];
    for (const d of Object.keys(store).sort().slice(0, -14)) delete store[d];
    try { localStorage.setItem('sflunk_sofa', JSON.stringify(store)); } catch { /* egal */ }
    return list.has(slot);
  }

  // Ostersonntag (anonyme Gauß-Formel) — Spiegel der PHP-Seite.
  function easterSunday(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function holidayFor(dateStr) {
    const mmdd = dateStr.slice(5);
    if (mmdd >= '12-01' && mmdd <= '12-26') return 'xmas';
    if (mmdd === '12-31' || mmdd === '01-01') return 'silvester';
    if (mmdd === '02-14') return 'valentin';
    if (mmdd === '10-31') return 'halloween';
    if (mmdd === '08-12' || mmdd === '12-13') return 'meteors';
    const easter = easterSunday(Number(dateStr.slice(0, 4)));
    const monday = new Date(easter + 'T12:00:00');
    monday.setDate(monday.getDate() + 1);
    if (dateStr === easter || dateStr === monday.toISOString().slice(0, 10)) return 'ostern';
    return null;
  }

  function seasonFor(dateStr) {
    const m = Number(dateStr.slice(5, 7));
    if (m >= 3 && m <= 5) return 'fruehling';
    if (m >= 6 && m <= 8) return 'sommer';
    if (m >= 9 && m <= 11) return 'herbst';
    return 'winter';
  }

  let decoKey = null;
  function applyDeco(dateStr) {
    const season = seasonFor(dateStr);
    const holiday = holidayFor(dateStr);
    const sofa = sofaOn(dateStr, 'a') || sofaOn(dateStr, 'b');
    document.body.dataset.season = season;
    if (holiday) {
      document.body.dataset.holiday = holiday;
    } else {
      delete document.body.dataset.holiday;
    }
    document.body.classList.toggle('is-sofa', sofa);

    const key = sofa ? 'sofa' : (holiday || season);
    if (key === decoKey) return;
    decoKey = key;

    const set = DECO_SETS[key];
    const deco = $('#deco');
    deco.replaceChildren();
    if (!set) return;
    for (let i = 0; i < set.count; i++) {
      const s = document.createElement('span');
      s.className = `deco-p deco-${set.mode}`;
      s.textContent = set.emojis[i % set.emojis.length];
      s.style.setProperty('--x', `${Math.random() * 100}%`);
      s.style.setProperty('--y', `${5 + Math.random() * 65}%`);
      s.style.setProperty('--dur', `${9 + Math.random() * 14}s`);
      s.style.setProperty('--delay', `${-Math.random() * 20}s`);
      s.style.setProperty('--size', `${11 + Math.random() * 11}px`);
      s.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
      s.style.setProperty('--o', `${0.3 + Math.random() * 0.35}`);
      deco.appendChild(s);
    }
  }

  const state = {
    meta: null,          // { serverToday, epoch, version, configured, couple, signs }
    date: null,          // ausgewählter Tag
    view: localStorage.getItem('sflunk_view') || 'paar',
    cache: new Map(),    // date → day
    orbitCtrl: null,
    booted: false,       // Navigation/Kalender/Countdown schon verdrahtet?
  };

  const $ = (sel) => document.querySelector(sel);
  const viewEl = $('#view');

  const esc = (s) => String(s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const de = (num) => String(num).replace('.', ',');

  const disclaimerFor = (date) =>
    DISCLAIMERS[Math.floor(new Date(date + 'T12:00:00').getTime() / 86400000) % DISCLAIMERS.length];

  // Tierkreis-Glyphen als Text-Glyphe erzwingen (kein Emoji-Kachel-Look).
  const glyphText = (g) => g + '︎';

  // ------------------------------------------------------------------- API

  async function fetchMeta() {
    const res = await fetch(`${API}?action=meta`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Der Kosmos antwortet nicht.');
    state.meta = json;
    return json;
  }

  async function fetchDay(date) {
    if (state.cache.has(date)) return state.cache.get(date);
    const url = date ? `${API}?action=day&date=${date}` : `${API}?action=day`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) {
      const err = new Error(json.error?.message || 'Der Kosmos antwortet nicht.');
      err.code = json.error?.code;
      throw err;
    }
    state.meta = { ...state.meta, serverToday: json.serverToday, epoch: json.epoch, version: json.version };
    state.cache.set(json.day.date, json.day);
    return json.day;
  }

  async function postSetup(payload) {
    const res = await fetch(`${API}?action=setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message || 'Der Kosmos nimmt gerade nichts an.');
    state.meta = json;
    return json;
  }

  // -------------------------------------------------- Stammdaten-Formular

  function coupleFormMarkup(prefill) {
    const signs = state.meta.signs;
    const card = (slot, label, pre) => `
      <div class="setup-card setup-card--${slot}">
        <div class="eyebrow">${label}</div>
        <label class="setup-label">Name
          <input type="text" class="setup-name" data-slot="${slot}" maxlength="24"
                 value="${esc(pre?.name || '')}" placeholder="${slot === 'a' ? 'z. B. Kim' : 'z. B. Alex'}"
                 autocomplete="off" autocapitalize="words">
        </label>
        <div class="setup-label">Sternzeichen</div>
        <div class="sign-grid" data-slot="${slot}" role="radiogroup" aria-label="Sternzeichen ${label}">
          ${signs.map((s) => `
            <button type="button" class="sign-btn${pre?.sign === s.key ? ' is-selected' : ''}"
                    data-sign="${s.key}" role="radio" aria-checked="${pre?.sign === s.key}">
              <span class="sign-glyph" aria-hidden="true">${glyphText(s.glyph)}</span>
              <span class="sign-name">${esc(s.name)}</span>
            </button>`).join('')}
        </div>
      </div>`;

    // PIN: beim Onboarding (oder Alt-Stand ohne PIN) festlegen,
    // sonst zur Bestätigung eingeben + optional ändern.
    const needsNewPin = !prefill || !state.meta.pinSet;
    const pinInput = (field, label, hint, autocomplete) => `
      <label class="setup-label">${label}${hint ? ` <span class="label-soft">${hint}</span>` : ''}
        <input type="password" class="setup-name setup-pin" data-field="${field}"
               inputmode="numeric" pattern="[0-9]*" maxlength="8"
               placeholder="4–8 Ziffern" autocomplete="${autocomplete}">
      </label>`;

    const pinCard = needsNewPin
      ? `<div class="setup-card setup-card--pin">
           <div class="eyebrow">Admin-PIN</div>
           <p class="pin-hint">Die PIN wird beim Ändern der Stammdaten abgefragt — eine leichte
              Barriere, damit Mitbewohner-Hände nichts verstellen. Gut merken!</p>
           ${pinInput('pin', 'PIN festlegen', '', 'new-password')}
         </div>`
      : `<div class="setup-card setup-card--pin">
           <div class="eyebrow">Admin-PIN</div>
           ${pinInput('pin', 'PIN eingeben', '(zum Speichern nötig)', 'current-password')}
           ${pinInput('newPin', 'Neue PIN', '(leer lassen = behalten)', 'new-password')}
         </div>`;

    return `
      <div class="setup-grid">
        ${card('a', 'Person Eins', prefill?.a)}
        ${card('b', 'Person Zwei', prefill?.b)}
      </div>
      ${pinCard}
      <div class="setup-actions">
        <button type="button" class="btn btn--gold setup-submit">${prefill ? 'Speichern & neu flunkern' : '✨ Funk aufnehmen'}</button>
      </div>`;
  }

  function mountCoupleForm(container, prefill, onSave) {
    container.innerHTML = coupleFormMarkup(prefill);

    container.querySelectorAll('.sign-grid').forEach((grid) => {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.sign-btn');
        if (!btn) return;
        grid.querySelectorAll('.sign-btn').forEach((b) => {
          b.classList.toggle('is-selected', b === btn);
          b.setAttribute('aria-checked', String(b === btn));
        });
      });
    });

    container.querySelector('.setup-submit').addEventListener('click', async (e) => {
      const read = (slot) => ({
        name: container.querySelector(`.setup-name[data-slot="${slot}"]`).value.trim(),
        sign: container.querySelector(`.sign-grid[data-slot="${slot}"] .sign-btn.is-selected`)?.dataset.sign || '',
      });
      const a = read('a');
      const b = read('b');
      const pin = container.querySelector('[data-field="pin"]').value.trim();
      const newPin = container.querySelector('[data-field="newPin"]')?.value.trim() || '';

      if (!a.name || !b.name) { SFWidgets.toast('Beide Namen, bitte — die Sterne duzen nur namentlich. ✍️'); return; }
      if (!a.sign || !b.sign) { SFWidgets.toast('Jede Person braucht ein Sternzeichen. Einfach eins anklicken. ♈︎–♓︎'); return; }
      if (!/^\d{4,8}$/.test(pin)) { SFWidgets.toast('Die Admin-PIN braucht 4–8 Ziffern. 🔐'); return; }
      if (newPin && !/^\d{4,8}$/.test(newPin)) { SFWidgets.toast('Auch die neue PIN braucht 4–8 Ziffern. 🔐'); return; }

      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        await postSetup(newPin ? { a, b, pin, newPin } : { a, b, pin });
        await onSave();
      } catch (err) {
        SFWidgets.toast(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  // -------------------------------------------------- Onboarding & Admin

  function showOnboarding() {
    const overlay = $('#setupOverlay');
    mountCoupleForm($('#setupForm'), null, async () => {
      overlay.hidden = true;
      SFWidgets.toast('Stammdaten empfangen. Der Sternenflunk sendet! 🛰️');
      await boot();
    });
    overlay.hidden = false;
  }

  function openAdmin() {
    const modal = $('#adminModal');
    const prefill = {
      a: { name: state.meta.couple.a.name, sign: state.meta.couple.a.signKey },
      b: { name: state.meta.couple.b.name, sign: state.meta.couple.b.signKey },
    };
    mountCoupleForm($('#adminForm'), prefill, async () => {
      modal.hidden = true;
      state.cache.clear();
      applyCouple();
      SFWidgets.toast('Neue Zeitlinie aktiviert. Frisch geflunkert! ✨');
      await goTo(state.meta.serverToday, state.view);
    });
    modal.hidden = false;
  }

  // --------------------------------------------------------- Brand & Tabs

  function applyCouple() {
    const { a, b } = state.meta.couple;

    $('#brandGlyphs').innerHTML =
      `<span class="glyph-a">${glyphText(a.glyph)}</span>` +
      '<span class="brand-spark">✦</span>' +
      `<span class="glyph-b">${glyphText(b.glyph)}</span>`;

    document.title = `Sternenflunk — das Flunkoskop für ${a.name} & ${b.name}`;

    const setTab = (id, glyph, name, sub) => {
      const tab = $(id);
      tab.querySelector('.tab-glyph').textContent = glyph;
      tab.querySelector('.tab-name').textContent = name;
      tab.querySelector('.tab-sub').textContent = sub;
    };
    setTab('#tab-a', glyphText(a.glyph), a.name, a.sign);
    setTab('#tab-b', glyphText(b.glyph), b.name, b.sign);
  }

  // ---------------------------------------------------------------- Router

  function parseHash() {
    const m = location.hash.match(/^#(\d{4}-\d{2}-\d{2})(?:\/(a|b|paar|spiel))?$/);
    return m ? { date: m[1], view: m[2] || state.view } : null;
  }

  function writeHash() {
    const next = `#${state.date}/${state.view}`;
    if (location.hash !== next) history.replaceState(null, '', next);
  }

  async function goTo(date, view = state.view) {
    try {
      viewEl.innerHTML = '<div class="skeleton">✶ Sterne werden geflunkert …</div>';
      const day = await fetchDay(date);
      state.date = date;
      state.view = view;
      localStorage.setItem('sflunk_view', view);
      writeHash();
      render(day);
    } catch (err) {
      if (err.code === 'setup_required') { showOnboarding(); return; }
      SFWidgets.toast(err.message);
      if (state.date) {
        writeHash(); // abgelehnte Navigation → Hash zurückdrehen
        render(state.cache.get(state.date));
      }
    }
  }

  // ------------------------------------------------------------- Rendering

  function render(day) {
    applyDeco(day.date);
    renderHeader(day);
    renderTicker(day);
    renderTabs();
    if (state.orbitCtrl) { state.orbitCtrl.destroy(); state.orbitCtrl = null; }

    if (state.view === 'paar') {
      renderCouple(day);
    } else if (state.view === 'spiel') {
      renderSpiel(day);
    } else {
      renderPerson(day[state.view], day);
    }

    SFMotion.reveal(viewEl);
    maybeConfetti(day);
  }

  /** Re-Render ohne Netz (Sofa-Schalter, Sprung-Links, Vorspann-Wiederholung). */
  function rerender() {
    render(state.cache.get(state.date));
  }

  function renderHeader(day) {
    $('#tabs').hidden = false;
    $('#astroTicker').hidden = false;
    $('#countdownRow').hidden = false;

    $('#dateLabel').textContent = day.displayDate;
    const { serverToday, epoch } = state.meta;
    $('#prevDay').disabled = day.date <= epoch;
    $('#nextDay').disabled = day.date >= serverToday;

    const banner = $('#retroBanner');
    if (day.astro.mercury.retro) {
      banner.hidden = false;
      banner.textContent = `⚠️ ${day.astro.mercury.text}`;
    } else {
      banner.hidden = true;
    }

    // Specials: Jubiläen, Feiertage, Sternschnuppen-Nächte, Freitag der 13. …
    // (ältere eingefrorene Tage kennen das Feld noch nicht — defensiv rendern)
    const specials = Array.isArray(day.special) ? day.special : [];
    const specialEl = $('#specialBanner');
    if (specials.length > 0) {
      specialEl.hidden = false;
      specialEl.innerHTML = specials.map((s) => `
        <div class="special-row">
          <span class="special-emoji" aria-hidden="true">${esc(s.emoji)}</span>
          <span><strong>${esc(s.title)}:</strong> ${esc(s.text)}</span>
        </div>`).join('');
    } else {
      specialEl.hidden = true;
    }

    $('#disclaimer').textContent = disclaimerFor(day.date);
    $('#appVersion').textContent = state.meta.version;
  }

  function renderTicker(day) {
    const a = day.astro;
    $('#astroTicker').innerHTML = `
      <div class="astro-chip astro-chip--moon">${SFMotion.moonSvg(a.moon.illumination, a.moon.group)}
        <div><strong>${esc(a.moon.name)}</strong><br>
        <span class="mono">${a.moon.illumination} % beleuchtet</span></div></div>
      <div class="astro-chip">☀️ <strong>${esc(a.sun.location)}</strong> <span class="mono">${a.sun.rise}–${a.sun.set}</span><br>
        ${esc(a.sun.trendText)}</div>
      <div class="astro-chip">${a.season.glyph}︎ <strong>${esc(a.season.sign)}-Saison</strong><br>
        ${esc(a.season.text)}</div>
      <div class="astro-chip">🔢 <strong>Tageszahl ${a.numerology.digit}</strong><br>
        ${esc(a.numerology.text)}</div>`;
  }

  function renderTabs() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.view === state.view));
    });
  }

  // ------------------------------------------------------------ Personen-Ansicht

  function starsMarkup(stars) {
    return '<span class="stars" aria-hidden="true">' +
      '★'.repeat(stars) + `<span class="off">${'★'.repeat(5 - stars)}</span></span>`;
  }

  function renderPerson(p, day) {
    const isA = p.slot === 'a';
    const cls = isA ? 'card--a' : 'card--b';
    const color = isA ? COLOR.pa : COLOR.pb;
    const softColor = isA ? COLOR.paSoft : COLOR.pbSoft;

    const catRows = p.categories.map((c, i) => `
      <div class="cat-row" style="--ci:${i}">
        <span class="cat-icon" aria-hidden="true">${c.icon}</span>
        <span class="cat-title">${esc(c.title)}</span>
        <span class="cat-score" data-count="${c.score}">${c.score}</span>
        <span class="cat-bar"><i style="--w:${c.score}%"></i></span>
        <p class="cat-text">${esc(c.text)}</p>
      </div>`).join('');

    // Sofa-Modus: Genesungs-Edition (ältere eingefrorene Tage ohne pflege → kein Schalter)
    const pflege = day.pflege?.[p.slot];
    const sofa = Boolean(pflege) && sofaOn(day.date, p.slot);
    const sofaBtn = pflege
      ? `<button type="button" class="sofa-toggle${sofa ? ' is-on' : ''}" aria-pressed="${sofa}" id="sofaToggle">
           <span aria-hidden="true">🛋️</span> ${sofa ? 'Sofa-Modus an' : 'Heute angeschlagen?'}</button>`
      : '';
    const sofaCard = sofa ? `
      <section class="card card--sofa s12 sofa-card">
        <div class="sofa-cup" aria-hidden="true">
          <span class="steam s1"></span><span class="steam s2"></span><span class="steam s3"></span>
          <span class="cup">☕</span>
        </div>
        <div class="sofa-body">
          <div class="eyebrow">Sofa-Edition · Genesungs-Flunkoskop für ${esc(p.name)}</div>
          <p class="sofa-prognose">${esc(pflege.prognose)}</p>
          <div class="sofa-grid">
            <div class="sofa-rezept">
              <div class="sofa-sub">Sternen-Apotheke verordnet</div>
              <ul>${pflege.rezept.map((r, i) => `<li style="--ri:${i}">${esc(r)}</li>`).join('')}</ul>
              <p class="sofa-tee">Tee des Tages: <strong>${esc(pflege.tee)}</strong></p>
            </div>
            <div class="sofa-werte">
              <div class="meter">
                <div class="meter-head"><span>🫂 Kuschelbedarf</span><span class="val"><span data-count="${pflege.kuschelBedarf}" data-dec="1">${de(pflege.kuschelBedarf)}</span> %</span></div>
                <div class="meter-track"><div class="meter-fill" style="--fill:${COLOR.goldSoft};--w:${pflege.kuschelBedarf}%"></div></div>
              </div>
              <div class="sofa-cups" aria-label="Tee-Dosis: ${pflege.tassen} Tassen">
                <span class="sofa-sub">Tee-Dosis</span>
                <span>${Array.from({ length: pflege.tassen }, (_, i) => `<i style="--ti:${i}">☕</i>`).join('')}</span>
              </div>
              <p class="sofa-g">Sofa-Gravitation heute: <strong class="mono">${de(Number(pflege.sofaG).toFixed(1))} g</strong></p>
            </div>
          </div>
          <p class="sofa-auftrag">📋 <strong>Pflegeauftrag:</strong> ${esc(pflege.auftrag)}</p>
          <p class="sofa-note">Das Flunkoskop ersetzt keinen Arztbesuch — aber gute Laune verordnet es trotzdem. Gute Besserung, ${esc(p.name)}! 💛</p>
        </div>
      </section>` : '';

    viewEl.innerHTML = `${sofaCard}
      <section class="card ${cls} s8 hero">
        <div class="eyebrow">Tagesprotokoll · ${glyphText(p.glyph)} ${esc(p.sign)}</div>
        ${sofaBtn}
        <p class="hero-motto">${esc(p.motto)}</p>
        <div class="stars-row">
          ${starsMarkup(p.stars)}
          <span class="stars-label">${p.stars}/5 · ${esc(p.starsLabel)}</span>
        </div>
        <span class="hero-watermark" aria-hidden="true">${p.emoji}</span>
      </section>

      <section class="card ${cls} s4">
        <div class="eyebrow">Laborwerte · Glück</div>
        <div class="gluck-grid">
          <div class="gluck-cell"><span class="big" data-count="${p.glueck.zahl}">${p.glueck.zahl}</span><span class="label">Glückszahl</span></div>
          <div class="gluck-cell"><span class="emoji-big">${p.glueck.emoji}</span><span class="label">Glücks-Emoji</span></div>
          <div class="gluck-cell">
            <span class="swatch" style="background:${esc(p.glueck.farbe.hex)}"></span>
            <span class="gluck-farbe-name">${esc(p.glueck.farbe.name)}</span>
            <span class="label">Glücksfarbe</span>
          </div>
          <div class="gluck-cell"><span class="big" style="font-size:1.05rem;line-height:1.9">${esc(p.glueck.fenster)}</span><span class="label">Glücksfenster</span></div>
        </div>
        <p class="gluck-extra">Heute Glück bringt: <strong>${esc(p.glueck.item)}</strong>.</p>
      </section>

      <section class="card ${cls} s5">
        <div class="eyebrow">Messwerte · Radar</div>
        <h3>Die Tageswerte</h3>
        <div id="radarChart" class="chart-wrap"></div>
      </section>

      <section class="card ${cls} s7">
        <div class="eyebrow">Einzelauswertung</div>
        ${catRows}
      </section>

      <section class="card ${cls} s4">
        <div class="eyebrow">Zeichen-Durchsage · amtlich</div>
        <p class="mini-text">📣 ${esc(p.signSpruch)}</p>
        <p class="chrono-note">Chronotyp laut Element (${esc(p.element)}): <strong>${esc(p.chronoLabel)}</strong></p>
      </section>

      <section class="card ${cls} s8">
        <div class="eyebrow">Tagesenergie · Kurvenblatt</div>
        <div id="energyChart"></div>
      </section>

      <section class="card ${cls} s4">
        <div class="eyebrow">Nachtprotokoll · streng vertraulich</div>
        <h3>Bettgeflüster-Barometer</h3>
        <div class="meter">
          <div class="meter-head"><span>Knisterfaktor</span><span class="val"><span data-count="${p.spice.pct}">${p.spice.pct}</span> %</span></div>
          <div class="meter-track"><div class="meter-fill" style="--fill:${softColor};--w:${p.spice.pct}%"></div></div>
        </div>
        <p style="margin-top:10px">${esc(p.spice.text)}</p>
      </section>

      <section class="card card--warn s8">
        <div class="eyebrow">Amtliche Sternen-Warnung</div>
        <p class="lead">⚠️ ${esc(p.warnung)}</p>
      </section>`;

    SFCharts.radar($('#radarChart'), {
      labels: [...p.categories.map((c) => c.title.split(' ')[0]), 'Gesamt'],
      values: [...p.categories.map((c) => c.score), p.stars * 20],
      color,
    });

    SFCharts.energy($('#energyChart'), {
      series: [{ name: p.name, color, points: p.energie.points, peak: p.energie.peakZeit }],
      note: `Hoch um <strong class="mono">${p.energie.peakZeit} Uhr</strong> — ${esc(p.energie.peakText)} ` +
            `Tagestief: <span class="mono">${p.energie.tiefZeit} Uhr</span> (eingeplant, kein Grund zur Sorge).`,
    });

    $('#sofaToggle')?.addEventListener('click', () => {
      const on = sofaToggle(day.date, p.slot);
      decoKey = null; // Deko neu würfeln (Tee & Herzen statt Saison)
      rerender();
      window.scrollTo({ top: viewEl.offsetTop - 90, behavior: SFMotion.reducedMotion() ? 'auto' : 'smooth' });
      SFWidgets.toast(on
        ? `Sofa-Modus für ${p.name} aktiviert. Decke, Tee, Schonung — der Kosmos hat übernommen. 💛`
        : `Willkommen zurück im Normalbetrieb, ${p.name}! ✨`);
    });
  }

  // ---------------------------------------------------------------- Paar-Ansicht

  function renderCouple(day) {
    const c = day.couple;
    const k = c.kompatibilitaet;
    const pa = day.a;
    const pb = day.b;

    const badge = k.special === 'jackpot'
      ? '<span class="badge-special jackpot">★ Jackpot-Tag</span>'
      : k.special === 'chaos'
        ? '<span class="badge-special chaos">⚡ Kosmische Störung</span>'
        : '';

    const duell = c.battle.reduce((best, row) =>
      Math.abs(row.a - row.b) > Math.abs(best.a - best.b) ? row : best, c.battle[0]);

    const battleRows = c.battle.map((row) => {
      const aWin = row.a > row.b + 4;
      const bWin = row.b > row.a + 4;
      return `
      <div class="battle-row" title="${esc(row.kommentar)}">
        <span class="battle-label">${esc(row.label)}</span>
        <div class="battle-bars">
          <span class="battle-side left">
            <span class="battle-val">${row.a}${aWin ? ' <span class="battle-win">★</span>' : ''}</span>
            <span class="battle-track"><i style="--w:${row.a}%"></i></span>
          </span>
          <span class="battle-vs">vs</span>
          <span class="battle-side right">
            <span class="battle-track"><i style="--w:${row.b}%"></i></span>
            <span class="battle-val">${bWin ? '<span class="battle-win">★</span> ' : ''}${row.b}</span>
          </span>
        </div>
      </div>`;
    }).join('');

    const rechtName = {
      a: `${esc(pa.name)} ${pa.emoji}`,
      b: `${esc(pb.name)} ${pb.emoji}`,
      beide: 'Beide 🤝',
      universum: 'Das Universum 🌌',
    }[c.recht.wer];

    // Sofa-Modus aktiv? Dann bekommt die andere Hälfte einen Pflegeauftrag.
    const pflegeCards = ['a', 'b']
      .filter((slot) => day.pflege?.[slot] && sofaOn(day.date, slot))
      .map((slot) => {
        const sick = day[slot];
        const carer = day[slot === 'a' ? 'b' : 'a'];
        return `
      <section class="card card--sofa s12 pflege-card">
        <div class="eyebrow">Sofa-Modus · Pflegeauftrag an ${esc(carer.name)}</div>
        <p class="lead">🛋️ ${esc(day.pflege[slot].auftrag)}</p>
        <button type="button" class="link-btn" data-goto="${slot}">→ Zur Sofa-Edition von ${esc(sick.name)}</button>
      </section>`;
      }).join('');

    // Beziehungs-Puls: Kuschel-Index treibt den Herzschlag, Streit macht ihn nervös.
    const bpm = Math.round(62 + c.kuschelIndex * 0.38 + c.streitRisiko * 0.12);
    const pulsLabel = bpm >= 100 ? 'Herzklopfen deluxe'
      : bpm >= 90 ? 'frisch verknallt'
        : bpm >= 80 ? 'stabil verliebt'
          : 'tiefenentspannt';

    // Teaser zählt, welche Lose heute noch unter der Folie liegen.
    let rubbel = {};
    try { rubbel = JSON.parse(localStorage.getItem('sflunk_rubbel') || '{}'); } catch { rubbel = {}; }
    const offen = ['a', 'b'].filter((s) => !rubbel[`${day.date}-${s}`]).length;
    const teaserTitle = offen === 2 ? 'Zwei Rubbellose warten auf euch.'
      : (offen === 1 ? 'Ein Rubbellos liegt noch unter der Folie.' : 'Alle Lose gerubbelt — jetzt wird eingelöst!');

    const sb = day.sternbild;
    const sternbildCard = sb ? `
      <section class="card card--c s12 sternbild-card">
        <div class="sternbild-grid">
          <div class="sternbild-stage" id="sternbildStage"></div>
          <div>
            <div class="eyebrow">Sternwarte · Euer Sternbild des Tages</div>
            <h3 class="sternbild-name">${esc(sb.name)}</h3>
            <p>${esc(sb.text)}</p>
            <dl class="sternbild-facts">
              <div><dt>Helligkeit</dt><dd class="mono">${de(Number(sb.helligkeit).toFixed(1))} mag</dd></div>
              <div><dt>Entfernung</dt><dd class="mono">${sb.entfernung} Lj</dd></div>
              <div><dt>Sichtbar ab</dt><dd class="mono">${esc(sb.sichtbarAb)} Uhr</dd></div>
            </dl>
            <p class="sternbild-legend"><span style="color:${COLOR.paSoft}">●</span> ${esc(pa.name)} &nbsp; <span style="color:${COLOR.pbSoft}">●</span> ${esc(pb.name)} — euer Doppelstern, amtlich eingetragen.</p>
          </div>
        </div>
      </section>` : '';

    viewEl.innerHTML = `${pflegeCards}
      <section class="card card--c s12">
        <div class="orbit-card">
          <div class="orbit-stage" id="orbitStage"></div>
          <div>
            <div class="eyebrow">Paar-Protokoll · Orbit-Duett</div>
            ${badge}
            <div class="orbit-value${k.special === 'chaos' ? ' is-chaos' : ''}${k.special === 'jackpot' ? ' is-jackpot' : ''}"><span data-count="${k.pct}" data-dec="1">${de(k.pct)}</span><small> %</small></div>
            <div class="orbit-label">Kompatibilität heute</div>
            <p class="orbit-text">${esc(k.text)}</p>
          </div>
        </div>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Klimadaten · Beziehung</div>
        <div class="meter">
          <div class="meter-head"><span>🫂 Kuschel-Index</span><span class="val"><span data-count="${c.kuschelIndex}">${c.kuschelIndex}</span> %</span></div>
          <div class="meter-track"><div class="meter-fill" style="--fill:${COLOR.goldSoft};--w:${c.kuschelIndex}%"></div></div>
        </div>
        <div class="meter">
          <div class="meter-head"><span>🌩️ Streit-Risiko</span><span class="val"><span data-count="${c.streitRisiko}">${c.streitRisiko}</span> %</span></div>
          <div class="meter-track"><div class="meter-fill" style="--fill:${COLOR.bad};--w:${c.streitRisiko}%"></div></div>
        </div>
        <div class="puls">
          <div class="meter-head"><span><span class="puls-heart" style="--beat:${(60 / bpm).toFixed(3)}s">❤</span> Beziehungs-Puls</span><span class="val"><span data-count="${bpm}">${bpm}</span> bpm · ${pulsLabel}</span></div>
          <div id="pulsLine" class="puls-line"></div>
        </div>
        <p class="meter-note">Wahrscheinlichster Auslöser laut Sternen: <strong>${esc(c.streitThema)}</strong>.</p>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Schiedsspruch des Tages</div>
        <h3>Wer hat heute recht?</h3>
        <p class="lead recht-name">${rechtName}</p>
        <p>${esc(c.recht.text)}</p>
      </section>

      ${sternbildCard}

      <section class="card card--c s12">
        <div class="eyebrow">Synchronlauf · Beide Kurven</div>
        <div id="coupleEnergy"></div>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Duell des Tages</div>
        <div class="chart-legend">
          <span class="legend-chip"><i style="--c:${COLOR.pa}"></i>${esc(pa.name)}</span>
          <span class="legend-chip"><i style="--c:${COLOR.pb}"></i>${esc(pb.name)}</span>
        </div>
        ${battleRows}
        <p class="chart-note">${esc(duell.kommentar)}</p>
      </section>

      <section class="card card--c s6 flag-card">
        <div class="eyebrow">Flaggen-Bericht</div>
        <span class="flag-icon" aria-hidden="true">🚩</span>
        <p>${esc(c.redFlag)}</p>
        <hr style="border:none;border-top:1px dashed var(--card-line);margin:14px 0">
        <span class="flag-icon" aria-hidden="true">💚</span>
        <p>${esc(c.greenFlag)}</p>
      </section>

      <section class="card card--c s4">
        <div class="eyebrow">Date-Direktive</div>
        <p class="mini-text">💡 ${esc(c.dateIdee)}</p>
      </section>

      <section class="card card--c s4">
        <div class="eyebrow">Gesprächsstoff</div>
        <p class="mini-text">💬 ${esc(c.gespraech)}</p>
      </section>

      <section class="card card--c s4">
        <div class="eyebrow">Paar-Mission</div>
        <p class="mini-text">🎯 ${esc(c.mission)}</p>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Elementar-Funk · ${esc(c.elementarFunk.kombi)}</div>
        <p class="mini-text">⚗️ ${esc(c.elementarFunk.text)}</p>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Klugscheißer-Fakt · echt wahr</div>
        <p class="mini-text">🔭 ${esc(day.astro.fact)}</p>
      </section>

      <section class="card card--c s12">
        <div class="eyebrow">Prophezeiung</div>
        <p class="prophecy">${esc(c.prophezeiung)}</p>
      </section>

      ${day.spiel ? `
      <section class="card card--g s12 teaser-card">
        <div class="eyebrow">Spielwiese · heute geöffnet</div>
        <div class="teaser">
          <div class="teaser-icons" aria-hidden="true"><span>🎟️</span><span>🎡</span><span>👉</span><span>💌</span><span>🔮</span></div>
          <div>
            <h3>${teaserTitle}</h3>
            <p>Plus Entscheidungsrad, Fingerzeig-Duell, Liebes-Funkspruch und das Orakel. Täglich frisch, garantiert unnütz, nachweislich lustig.</p>
          </div>
          <button type="button" class="btn btn--violet" data-goto="spiel">Zur Spielwiese ›</button>
        </div>
      </section>` : '<section class="card card--c s12" id="oracleCard"></section>'}`;

    state.orbitCtrl = SFCharts.orbit($('#orbitStage'), {
      pct: k.pct,
      aColor: COLOR.paSoft,
      bColor: COLOR.pbSoft,
      aGlyph: glyphText(pa.glyph),
      bGlyph: glyphText(pb.glyph),
    });

    SFCharts.energy($('#coupleEnergy'), {
      series: [
        { name: pa.name, color: COLOR.pa, points: pa.energie.points, peak: pa.energie.peakZeit },
        { name: pb.name, color: COLOR.pb, points: pb.energie.points, peak: pb.energie.peakZeit },
      ],
      window: c.fenster,
      note: `Gemeinsames Energiefenster: <strong class="mono">${c.fenster.von}–${c.fenster.bis} Uhr</strong> — ${esc(c.fenster.text)}`,
    });

    SFMotion.pulse($('#pulsLine'), { bpm, color: COLOR.pbSoft });

    if (sb) {
      SFCharts.constellation($('#sternbildStage'), {
        form: sb.form,
        seed: sb.seed,
        aColor: COLOR.paSoft,
        bColor: COLOR.pbSoft,
        aLabel: pa.name.slice(0, 1).toUpperCase(),
        bLabel: pb.name.slice(0, 1).toUpperCase(),
      });
    }

    if ($('#oracleCard')) SFWidgets.mountOracle($('#oracleCard'), state.meta.serverToday);
  }

  // ------------------------------------------------------------- Spielwiese

  function renderSpiel(day) {
    const pa = day.a;
    const pb = day.b;
    const sp = day.spiel;

    if (!sp) {
      // Uralter eingefrorener Tag ohne Spielwiese (sollte api.php nachrüsten)
      viewEl.innerHTML = '<section class="card card--g s12" id="oracleCard"></section>';
      SFWidgets.mountOracle($('#oracleCard'), state.meta.serverToday);
      return;
    }

    viewEl.innerHTML = `
      <section class="card card--g s12 spiel-head">
        <div class="eyebrow">Spielwiese · ${esc(day.displayDate)}</div>
        <h3>Heute im Programm: Rubbeln, Drehen, Zeigen, Funken.</h3>
        <p>Alles für zwei, alles auf einem Gerät. Der Sternenflunk übernimmt keine Haftung für Lachfalten.</p>
      </section>

      <section class="card card--a s6" id="rubbelA"></section>
      <section class="card card--b s6" id="rubbelB"></section>

      <section class="card card--g s12" id="werCard"></section>

      <section class="card card--g s6" id="wheelCard"></section>
      <section class="card card--g s6" id="funkCard"></section>

      <section class="card card--c s12" id="oracleCard"></section>`;

    const burst = () => SFWidgets.confettiBurst($('#confetti'), [COLOR.goldSoft, COLOR.paSoft, COLOR.pbSoft, '#efeafd']);

    SFGames.scratch($('#rubbelA'), {
      id: `${day.date}-a`, from: pb.name, to: pa.name, text: sp.gutschein.a, accent: COLOR.paSoft, onReveal: burst,
    });
    SFGames.scratch($('#rubbelB'), {
      id: `${day.date}-b`, from: pa.name, to: pb.name, text: sp.gutschein.b, accent: COLOR.pbSoft, onReveal: burst,
    });
    SFGames.werVonUns($('#werCard'), {
      id: day.date, fragen: sp.werVonUns.fragen, fazit: sp.werVonUns.fazit, a: pa.name, b: pb.name,
    });
    SFGames.wheel($('#wheelCard'), { a: pa.name, b: pb.name, aColor: COLOR.paSoft, bColor: COLOR.pbSoft });
    SFGames.funk($('#funkCard'), {
      a: pa.name, b: pb.name, funkA: sp.funk.a, funkB: sp.funk.b, aColor: COLOR.paSoft, bColor: COLOR.pbSoft,
    });
    SFWidgets.mountOracle($('#oracleCard'), state.meta.serverToday);
  }

  // Sprung-Links innerhalb der Ansichten (Teaser, Pflegeauftrag)
  function wireGoto() {
    viewEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-goto]');
      if (!btn) return;
      state.view = btn.dataset.goto;
      localStorage.setItem('sflunk_view', state.view);
      writeHash();
      rerender();
      window.scrollTo({ top: Math.max(0, $('#tabs').offsetTop - 12), behavior: SFMotion.reducedMotion() ? 'auto' : 'smooth' });
    });
  }

  // ----------------------------------------------------------- Extras

  /**
   * Sendestart-Vorspann: einmal pro Tag und Gerät beim ersten Öffnen von
   * „heute“ — oder auf Wunsch über den Footer-Knopf.
   */
  async function maybeIntro(day, force = false) {
    if (!force) {
      if (day.date !== state.meta.serverToday) return;
      try { if (localStorage.getItem('sflunk_intro') === day.date) return; } catch { return; }
    }
    try { localStorage.setItem('sflunk_intro', day.date); } catch { /* egal */ }
    const sp = Array.isArray(day.special) && day.special[0] ? `${day.special[0].emoji} ${day.special[0].title}` : '';
    const k = day.couple.kompatibilitaet;
    viewEl.innerHTML = '';
    await SFMotion.intro({
      a: { name: day.a.name, glyph: glyphText(day.a.glyph) },
      b: { name: day.b.name, glyph: glyphText(day.b.glyph) },
      pct: k.pct,
      dateLabel: day.displayDate,
      special: sp,
      jackpot: k.special === 'jackpot',
      chaos: k.special === 'chaos',
    });
  }

  function maybeConfetti(day) {
    const k = day.couple.kompatibilitaet;
    if (state.view !== 'paar' || k.special !== 'jackpot') return;
    if (day.date !== state.meta.serverToday) return;
    if (localStorage.getItem('sflunk_jackpot') === day.date) return;
    localStorage.setItem('sflunk_jackpot', day.date);
    SFWidgets.confettiBurst($('#confetti'));
  }

  // Tagesbericht des angezeigten Tages als PDF — komplett clientseitig
  // (SFReport rastert Charts & Emojis, SFPdf schreibt das Dokument).
  async function downloadReport() {
    const day = state.cache.get(state.date);
    if (!day) return;
    const btn = $('#reportBtn');
    btn.disabled = true;
    btn.classList.add('busy');
    try {
      await SFReport.download(day, {
        version: state.meta.version,
        disclaimer: disclaimerFor(day.date),
        season: document.body.dataset.season,
        holiday: document.body.dataset.holiday || null,
      });
      SFWidgets.toast('Tagesbericht gebeamt. 📄✨');
    } catch (err) {
      SFWidgets.toast(`Der Bericht klemmt im Kosmos: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.classList.remove('busy');
    }
  }

  function shiftDay(delta) {
    const d = new Date(state.date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    const iso = d.toISOString().slice(0, 10);
    if (iso < state.meta.epoch || iso > state.meta.serverToday) return;
    goTo(iso);
  }

  // -------------------------------------------------------------- Bootstrap

  async function boot() {
    applyCouple();

    const fromHash = parseHash();
    if (fromHash?.view) state.view = fromHash.view;

    let day;
    try {
      day = await fetchDay(null);
    } catch (err) {
      if (err.code === 'setup_required') { showOnboarding(); return; }
      viewEl.innerHTML = `<div class="skeleton">☄️ ${esc(err.message)}<br><br>
        <button class="btn" onclick="location.reload()">Neu verbinden</button></div>`;
      return;
    }

    // Deep-Link auf einen Alt-Tag?
    if (fromHash && fromHash.date !== day.date &&
        fromHash.date >= state.meta.epoch && fromHash.date <= state.meta.serverToday) {
      state.date = fromHash.date;
      await goTo(fromHash.date, state.view);
    } else {
      state.date = day.date;
      writeHash();
      await maybeIntro(day);
      render(day);
    }

    if (state.booted) return;
    state.booted = true;

    SFMotion.glare(viewEl);
    wireGoto();
    $('#replayIntro').addEventListener('click', async () => {
      const current = state.cache.get(state.date);
      if (!current) return;
      window.scrollTo({ top: 0 });
      await maybeIntro(current, true);
      rerender();
    });

    // Navigation
    $('#prevDay').addEventListener('click', () => shiftDay(-1));
    $('#nextDay').addEventListener('click', () => shiftDay(1));
    $('#reportBtn').addEventListener('click', downloadReport);
    $('#adminBtn').addEventListener('click', openAdmin);

    // Easteregg: Wer das Logo fünfmal hintereinander antippt,
    // findet den Flunk-Kern. Belohnung: Konfetti, natürlich.
    let brandTaps = 0;
    let brandTimer = null;
    document.querySelector('.brand').addEventListener('click', () => {
      brandTaps++;
      clearTimeout(brandTimer);
      brandTimer = setTimeout(() => { brandTaps = 0; }, 2500);
      if (brandTaps >= 5) {
        brandTaps = 0;
        SFWidgets.confettiBurst($('#confetti'));
        SFWidgets.toast('Flunk-Kern gefunden! Geheimlevel freigeschaltet: einfach weiter füreinander da sein. 🛸');
      }
    });

    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        state.view = tab.dataset.view;
        localStorage.setItem('sflunk_view', state.view);
        writeHash();
        render(state.cache.get(state.date));
      });
    });

    const cal = SFWidgets.calendar({
      modal: $('#calendarModal'),
      getEpoch: () => state.meta.epoch,
      getToday: () => state.meta.serverToday,
      getSelected: () => state.date,
      onPick: (date) => goTo(date),
    });
    $('#openCalendar').addEventListener('click', cal.open);

    document.querySelectorAll('#adminModal [data-close]').forEach((n) =>
      n.addEventListener('click', () => { $('#adminModal').hidden = true; }));

    window.addEventListener('hashchange', () => {
      const h = parseHash();
      if (h && (h.date !== state.date || h.view !== state.view)) goTo(h.date, h.view);
    });

    // Mitternachts-Magie: neuer Tag → frisch laden
    SFWidgets.countdown($('#countdown'), () => {
      state.cache.clear();
      location.reload();
    });
  }

  async function init() {
    SFWidgets.starfield($('#starfield'));

    try {
      await fetchMeta();
    } catch (err) {
      viewEl.innerHTML = `<div class="skeleton">☄️ ${esc(err.message)}<br><br>
        <button class="btn" onclick="location.reload()">Neu verbinden</button></div>`;
      return;
    }

    if (!state.meta.configured) {
      viewEl.innerHTML = '';
      showOnboarding();
    } else {
      await boot();
    }
  }

  init();
})();
