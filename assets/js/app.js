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
  };

  const DISCLAIMERS = [
    'Keine Sterne wurden für dieses Horoskop befragt.',
    '100 % handgelesen aus Kaffeesatz und JSON.',
    'Täglich frisch geflunkert. Emotional treffsicher.',
    'Alle Angaben ohne Gewähr. Und ohne Teleskop.',
    'Wissenschaftlicher Beirat: ein Webserver im Flur.',
    'Zu Risiken und Nebenwirkungen küssen Sie Ihre bessere Hälfte.',
    'Ähnlichkeiten mit tatsächlichen Schicksalen sind rein kosmetisch.',
    'Dieses Horoskop enthält Spuren von Wahrheit.',
    'Von Experten empfohlen, die wir uns ausgedacht haben.',
    'Garantiert frei von echten Planetendaten. Bis auf die echten.',
  ];

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

    document.title = `Sternenflunk — das geflunkerte Horoskop für ${a.name} & ${b.name}`;

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
    const m = location.hash.match(/^#(\d{4}-\d{2}-\d{2})(?:\/(a|b|paar))?$/);
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
    renderHeader(day);
    renderTicker(day);
    renderTabs();
    if (state.orbitCtrl) { state.orbitCtrl.destroy(); state.orbitCtrl = null; }

    if (state.view === 'paar') {
      renderCouple(day);
    } else {
      renderPerson(day[state.view], day);
    }

    maybeConfetti(day);
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

    const idx = Math.floor(new Date(day.date + 'T12:00:00').getTime() / 86400000);
    $('#disclaimer').textContent = DISCLAIMERS[idx % DISCLAIMERS.length];
    $('#appVersion').textContent = state.meta.version;
  }

  function renderTicker(day) {
    const a = day.astro;
    $('#astroTicker').innerHTML = `
      <div class="astro-chip">${a.moon.emoji} <strong>${esc(a.moon.name)}</strong><br>
        <span class="mono">${a.moon.illumination} % beleuchtet</span></div>
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

    const catRows = p.categories.map((c) => `
      <div class="cat-row">
        <span class="cat-icon" aria-hidden="true">${c.icon}</span>
        <span class="cat-title">${esc(c.title)}</span>
        <span class="cat-score">${c.score}</span>
        <span class="cat-bar"><i style="width:${c.score}%"></i></span>
        <p class="cat-text">${esc(c.text)}</p>
      </div>`).join('');

    viewEl.innerHTML = `
      <section class="card ${cls} s8 hero">
        <div class="eyebrow">Tagesprotokoll · ${glyphText(p.glyph)} ${esc(p.sign)}</div>
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
          <div class="gluck-cell"><span class="big">${p.glueck.zahl}</span><span class="label">Glückszahl</span></div>
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
          <div class="meter-head"><span>Knisterfaktor</span><span class="val">${p.spice.pct} %</span></div>
          <div class="meter-track"><div class="meter-fill" style="--fill:${softColor};width:${p.spice.pct}%"></div></div>
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
            <span class="battle-track"><i style="width:${row.a}%"></i></span>
          </span>
          <span class="battle-vs">vs</span>
          <span class="battle-side right">
            <span class="battle-track"><i style="width:${row.b}%"></i></span>
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

    viewEl.innerHTML = `
      <section class="card card--c s12">
        <div class="orbit-card">
          <div class="orbit-stage" id="orbitStage"></div>
          <div>
            <div class="eyebrow">Paar-Protokoll · Orbit-Duett</div>
            ${badge}
            <div class="orbit-value">${de(k.pct)}<small> %</small></div>
            <div class="orbit-label">Kompatibilität heute</div>
            <p class="orbit-text">${esc(k.text)}</p>
          </div>
        </div>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Klimadaten · Beziehung</div>
        <div class="meter">
          <div class="meter-head"><span>🫂 Kuschel-Index</span><span class="val">${c.kuschelIndex} %</span></div>
          <div class="meter-track"><div class="meter-fill" style="--fill:${COLOR.goldSoft};width:${c.kuschelIndex}%"></div></div>
        </div>
        <div class="meter">
          <div class="meter-head"><span>🌩️ Streit-Risiko</span><span class="val">${c.streitRisiko} %</span></div>
          <div class="meter-track"><div class="meter-fill" style="--fill:${COLOR.bad};width:${c.streitRisiko}%"></div></div>
        </div>
        <p class="meter-note">Wahrscheinlichster Auslöser laut Sternen: <strong>${esc(c.streitThema)}</strong>.</p>
      </section>

      <section class="card card--c s6">
        <div class="eyebrow">Schiedsspruch des Tages</div>
        <h3>Wer hat heute recht?</h3>
        <p class="lead" style="font-size:1.3rem;margin:6px 0 8px">${rechtName}</p>
        <p>${esc(c.recht.text)}</p>
      </section>

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

      <section class="card card--c s12" id="oracleCard"></section>`;

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

    SFWidgets.mountOracle($('#oracleCard'), state.meta.serverToday);
  }

  // ----------------------------------------------------------- Extras

  function maybeConfetti(day) {
    const k = day.couple.kompatibilitaet;
    if (state.view !== 'paar' || k.special !== 'jackpot') return;
    if (day.date !== state.meta.serverToday) return;
    if (localStorage.getItem('sflunk_jackpot') === day.date) return;
    localStorage.setItem('sflunk_jackpot', day.date);
    SFWidgets.confettiBurst($('#confetti'));
  }

  async function share(day) {
    const k = day.couple.kompatibilitaet;
    const text = `🔮 Sternenflunk — ${day.displayDate}\n` +
      `${day.a.glyph} ${day.a.name}: ${day.a.stars}/5 · ${day.a.starsLabel}\n` +
      `${day.b.glyph} ${day.b.name}: ${day.b.stars}/5 · ${day.b.starsLabel}\n` +
      `💞 Kompatibilität: ${de(k.pct)} %`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Sternenflunk', text, url: location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${location.href}`);
        SFWidgets.toast('In die Zwischenablage kopiert. ✨');
      }
    } catch { /* abgebrochen — kein Drama */ }
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
      render(day);
    }

    if (state.booted) return;
    state.booted = true;

    // Navigation
    $('#prevDay').addEventListener('click', () => shiftDay(-1));
    $('#nextDay').addEventListener('click', () => shiftDay(1));
    $('#shareBtn').addEventListener('click', () => share(state.cache.get(state.date)));
    $('#adminBtn').addEventListener('click', openAdmin);

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
