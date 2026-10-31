/* ============================================================
   Sternenflunk-Spielwiese (2.0): Rubbellos, Entscheidungsrad,
   „Wer von euch?“-Countdown und Funkspruch mit Umschlag.
   Spielstände leben nur im localStorage dieses Geräts.
   ============================================================ */
'use strict';

const SFGames = (() => {
  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = (s) => String(s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* egal */ } };

  // ---------------------------------------------------------- Mini-Speicher

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* privat-Modus: egal */ }
  }

  /** Nur die letzten N Einträge behalten — der Speicher soll nicht wuchern. */
  function prune(obj, keep = 40) {
    const keys = Object.keys(obj).sort();
    while (keys.length > keep) delete obj[keys.shift()];
    return obj;
  }

  // ----------------------------------------------------------------- Rubbellos

  /**
   * Gutschein unter Goldfolie. Ab ~50 % freigerubbelt fällt die Folie ab.
   * id = eindeutig pro Tag + Empfänger, damit der Zustand erhalten bleibt.
   */
  function scratch(container, { id, from, to, text, accent, onReveal }) {
    const store = load('sflunk_rubbel', {});
    const done = Boolean(store[id]);

    container.innerHTML = `
      <div class="eyebrow">Kosmisches Rubbellos · für ${esc(to)}</div>
      <div class="scratch${done ? ' is-done' : ''}" style="--accent:${accent}">
        <div class="coupon">
          <div class="coupon-head"><span>✦ Gutschein ✦</span><span class="coupon-no mono">Nr. ${esc(id.replace(/\D/g, '').slice(-6))}</span></div>
          <p class="coupon-text">${esc(text)}</p>
          <div class="coupon-foot">von <strong>${esc(from)}</strong> für <strong>${esc(to)}</strong> · ausgestellt vom Sternenflunk</div>
        </div>
        <canvas class="scratch-foil" aria-hidden="true"></canvas>
      </div>
      <p class="scratch-hint">${done ? 'Freigerubbelt. Einlösen ausdrücklich erwünscht. ✨' : `Mit Finger oder Maus freirubbeln — ${esc(to)} zuerst!`}</p>`;

    if (done) return;

    const box = container.querySelector('.scratch');
    const canvas = container.querySelector('.scratch-foil');
    const hint = container.querySelector('.scratch-hint');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let w = 0, h = 0, dpr = 1;
    let drawing = false;
    let last = null;
    let moves = 0;
    let finished = false;

    function paintFoil() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = box.offsetWidth;
      h = box.offsetHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#8a6424');
      g.addColorStop(0.35, '#e2b45f');
      g.addColorStop(0.5, '#f7e3b0');
      g.addColorStop(0.65, '#d39d42');
      g.addColorStop(1, '#7c5a1e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Folien-Struktur: feines Glitzern + Sternchen
      for (let i = 0; i < (w * h) / 90; i++) {
        ctx.globalAlpha = Math.random() * 0.22;
        ctx.fillStyle = Math.random() < 0.5 ? '#fff' : '#5b3f12';
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#fff8e6';
      ctx.font = '12px sans-serif';
      for (let i = 0; i < 14; i++) ctx.fillText('✦', Math.random() * w, Math.random() * h);

      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(60,38,8,0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'italic 700 22px Palatino, "Palatino Linotype", Georgia, serif';
      ctx.fillText('Hier rubbeln', w / 2, h / 2 - 10);
      ctx.font = '11px ui-monospace, Menlo, monospace';
      ctx.fillText(`✦  NUR FÜR ${to.toUpperCase()}  ✦`, w / 2, h / 2 + 16);
    }

    function point(e) {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * (w / r.width), (e.clientY - r.top) * (h / r.height)];
    }

    function scratchTo(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(...(last || p));
      ctx.lineTo(...p);
      ctx.stroke();
      last = p;
    }

    function cleared() {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0, total = 0;
      const step = Math.max(4, Math.floor(8 * dpr));
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          total++;
          if (data[(y * canvas.width + x) * 4 + 3] < 40) clear++;
        }
      }
      return clear / total;
    }

    function finish() {
      if (finished) return;
      finished = true;
      box.classList.add('is-done');
      hint.textContent = 'Glückwunsch! Gutschein gültig ab sofort. Einlösen ausdrücklich erwünscht. ✨';
      const s = load('sflunk_rubbel', {});
      s[id] = Date.now();
      save('sflunk_rubbel', prune(s, 60));
      buzz([10, 40, 10]);
      if (onReveal) onReveal();
    }

    canvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      last = null;
      canvas.setPointerCapture(e.pointerId);
      scratchTo(point(e));
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing || finished) return;
      scratchTo(point(e));
      if (++moves % 12 === 0 && cleared() > 0.5) finish();
    });
    const stop = () => {
      drawing = false;
      last = null;
      if (!finished && cleared() > 0.5) finish();
    };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);

    paintFoil();
    let lastW = w;
    window.addEventListener('resize', () => {
      if (!finished && box.isConnected && box.offsetWidth !== lastW) {
        lastW = box.offsetWidth;
        paintFoil();
      }
    });
  }

  // ------------------------------------------------------ Entscheidungsrad

  const WHEEL_FRAGEN = [
    'Wer kocht heute?',
    'Wer sucht den Film aus?',
    'Wer hat heute die Fernbedienung?',
    'Wer macht den Abwasch?',
    'Wer holt das Frühstück?',
    'Wer plant das nächste Date?',
    'Wer bringt den Müll runter?',
    'Wer kocht den Tee?',
    'Wer bestimmt die Musik?',
    'Wer schreibt die Einkaufsliste?',
    'Wer verteilt heute die erste Umarmung?',
    'Wer erzählt heute den schlechtesten Witz?',
    'Wer darf heute die letzte Praline?',
    'Wer ruft beim Lieferdienst an?',
    'Wer gießt die Pflanzen?',
    'Wer sagt heute zuerst „Ich hab dich lieb“?',
  ];

  const WHEEL_JOKER = [
    'Schere, Stein, Papier — best of three. Das Universum schaut zu.',
    'Wer zuerst blinzelt, verliert. Augen auf — los!',
    'Das Rad verweigert die Aussage und empfiehlt: Bestellt einfach was.',
    'Daumen-Catchen! Drei Runden, kein Einspruch.',
    'Wer als Erstes etwas Rotes in der Wohnung findet, ist raus. Lauft!',
    'Münzwurf. Die Münze ist allerdings unter das Sofa gerollt. Neu drehen?',
    'Die Sterne sagen: Wer heute weniger gelacht hat, darf entscheiden.',
  ];

  const WHEEL_SPRUCH = [
    '{NAME} ist dran. Die Sterne haben das Protokoll schon unterschrieben.',
    '{NAME}! Einspruch zwecklos — das Rad ist amtlich geeicht.',
    'Das Rad hat gesprochen: {NAME}. Applaus vom Sofa, bitte.',
    'Es trifft {NAME}. Mit 98,6 % kosmischer Gerechtigkeit.',
    '{NAME} übernimmt. Die andere Hälfte schuldet dafür ein Lächeln.',
  ];

  const WHEEL_BEIDE = [
    'Beide! Teamwork-Tag — das Rad duldet keine Ausreden.',
    'Beide zusammen. Wer schneller fertig ist, darf zuerst aufs Sofa.',
    'Ihr beide. Und zwar Hand in Hand, sonst gilt es nicht.',
  ];

  function wheel(container, { a, b, aColor, bColor }) {
    const short = (n) => (n.length > 9 ? `${n.slice(0, 8)}…` : n);
    const SEG = [
      { who: 'a', label: short(a), fill: aColor },
      { who: 'b', label: short(b), fill: bColor },
      { who: 'beide', label: 'Beide', fill: '#b37e27' },
      { who: 'a', label: short(a), fill: aColor },
      { who: 'b', label: short(b), fill: bColor },
      { who: 'joker', label: 'Joker', fill: '#7b5bd6' },
      { who: 'a', label: short(a), fill: aColor },
      { who: 'b', label: short(b), fill: bColor },
    ];
    const N = SEG.length;
    const R = 120, C = 130;
    const arc = (i) => {
      const a0 = (i / N) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
      return `M${C},${C} L${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} A${R},${R} 0 0 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} Z`;
    };
    const segs = SEG.map((s, i) => {
      const mid = ((i + 0.5) / N) * 360;
      return `<path d="${arc(i)}" fill="${s.fill}" fill-opacity="${i % 2 ? 0.78 : 0.92}" stroke="#151030" stroke-width="2"/>
        <text x="${C}" y="${C - R + 30}" transform="rotate(${mid} ${C} ${C})" text-anchor="middle"
              fill="#0b0820" font-size="13" font-weight="700" font-family="-apple-system, sans-serif">${esc(s.label)}</text>`;
    }).join('');

    container.innerHTML = `
      <div class="eyebrow">Kosmischer Schiedsrichter · Entscheidungsrad</div>
      <h3>Wer ist dran?</h3>
      <div class="wheel-q">
        <select class="wheel-select" aria-label="Frage wählen">
          ${WHEEL_FRAGEN.map((f) => `<option>${esc(f)}</option>`).join('')}
          <option value="__own">Eigene Frage …</option>
        </select>
        <input class="wheel-own oracle-input" type="text" maxlength="80" placeholder="Eure Frage" hidden>
      </div>
      <div class="wheel-stage">
        <div class="wheel-pointer" aria-hidden="true"></div>
        <svg class="wheel-svg" viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="${C}" cy="${C}" r="${R + 6}" fill="#151030" stroke="rgba(226,180,95,.5)" stroke-width="2"/>
          <g class="wheel-rot">${segs}</g>
          <circle cx="${C}" cy="${C}" r="22" fill="#151030" stroke="#e2b45f" stroke-width="2"/>
          <text x="${C}" y="${C + 6}" text-anchor="middle" fill="#e2b45f" font-size="18">✦</text>
        </svg>
      </div>
      <button type="button" class="btn btn--gold wheel-spin">Rad drehen</button>
      <p class="wheel-result" aria-live="polite"></p>`;

    const rot = container.querySelector('.wheel-rot');
    const pointer = container.querySelector('.wheel-pointer');
    const btn = container.querySelector('.wheel-spin');
    const result = container.querySelector('.wheel-result');
    const select = container.querySelector('.wheel-select');
    const own = container.querySelector('.wheel-own');
    let angle = 0;
    let spinning = false;

    select.addEventListener('change', () => {
      own.hidden = select.value !== '__own';
      if (!own.hidden) own.focus();
    });

    const segAt = (deg) => {
      // Zeiger steht oben (0°). Welches Segment liegt bei Rotation deg darunter?
      const local = ((360 - (deg % 360)) + 360) % 360;
      return Math.floor(local / (360 / N)) % N;
    };

    btn.addEventListener('click', () => {
      if (spinning) return;
      spinning = true;
      btn.disabled = true;
      result.classList.remove('is-shown');
      result.textContent = '';
      const frage = select.value === '__own' ? (own.value.trim() || 'Eure Frage') : select.value;
      const target = angle + 360 * (5 + Math.floor(Math.random() * 3)) + Math.random() * 360;
      const from = angle;
      const dur = reducedMotion() ? 10 : 4300;
      let start = null;
      let lastSeg = segAt(from);

      const tick = (ts) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / dur);
        const e = 1 - (1 - t) ** 4;
        angle = from + (target - from) * e;
        rot.setAttribute('transform', `rotate(${angle.toFixed(2)} ${C} ${C})`);
        const s = segAt(angle);
        if (s !== lastSeg) {
          lastSeg = s;
          pointer.classList.remove('tick');
          void pointer.offsetWidth; // Animation neu starten
          pointer.classList.add('tick');
          buzz(3);
        }
        if (t < 1) { requestAnimationFrame(tick); return; }

        const seg = SEG[segAt(angle)];
        const pick = (list) => list[Math.floor(Math.random() * list.length)];
        let line;
        if (seg.who === 'a' || seg.who === 'b') {
          line = pick(WHEEL_SPRUCH).replace('{NAME}', seg.who === 'a' ? a : b);
        } else if (seg.who === 'beide') {
          line = pick(WHEEL_BEIDE);
        } else {
          line = `🃏 Joker! ${pick(WHEEL_JOKER)}`;
        }
        result.innerHTML = `<span class="wheel-frage">${esc(frage)}</span>${esc(line)}`;
        result.classList.add('is-shown');
        buzz([15, 50, 15]);
        spinning = false;
        btn.disabled = false;
        btn.textContent = 'Nochmal drehen';
      };
      requestAnimationFrame(tick);
    });
  }

  // ------------------------------------------- „Wer von euch?“ mit Countdown

  function werVonUns(container, { id, fragen, fazit, a, b }) {
    const all = load('sflunk_wer', {});
    let st = all[id] || { i: 0, votes: [] };
    const persist = () => { all[id] = st; save('sflunk_wer', prune(all)); };

    function view(html) {
      const stage = container.querySelector('.wer-stage');
      stage.classList.remove('wer-enter');
      void stage.offsetWidth;
      stage.innerHTML = html;
      stage.classList.add('wer-enter');
    }

    container.innerHTML = `
      <div class="eyebrow">Fingerzeig-Duell · Wer von euch?</div>
      <div class="wer-stage"></div>`;

    function showQuestion() {
      if (st.i >= fragen.length) { showResult(); return; }
      view(`
        <div class="wer-progress mono">Frage ${st.i + 1} von ${fragen.length}</div>
        <p class="wer-q">${esc(fragen[st.i])}</p>
        <p class="wer-help">Auf drei zeigt ihr gleichzeitig auf die Person, die es ist. Nicht schummeln — die Sterne sehen alles.</p>
        <button type="button" class="btn btn--gold wer-go">3 · 2 · 1 starten</button>`);
      container.querySelector('.wer-go').addEventListener('click', countdown);
    }

    function countdown() {
      const stage = container.querySelector('.wer-stage');
      const steps = ['3', '2', '1', 'ZEIGT!'];
      let k = 0;
      const show = () => {
        stage.innerHTML = `<div class="wer-count${k === 3 ? ' is-go' : ''}">${steps[k]}</div>`;
        buzz(k === 3 ? 30 : 8);
        k++;
        if (k < steps.length) setTimeout(show, reducedMotion() ? 120 : 780);
        else setTimeout(askVote, reducedMotion() ? 120 : 1000);
      };
      show();
    }

    function askVote() {
      view(`
        <div class="wer-progress mono">Frage ${st.i + 1} von ${fragen.length}</div>
        <p class="wer-q wer-q--small">${esc(fragen[st.i])}</p>
        <p class="wer-help">Und? Wohin haben die Finger gezeigt?</p>
        <div class="wer-votes">
          <button type="button" class="btn wer-vote wer-vote--a" data-v="a">👉 ${esc(a)}</button>
          <button type="button" class="btn wer-vote wer-vote--b" data-v="b">👉 ${esc(b)}</button>
          <button type="button" class="btn wer-vote" data-v="x">Uneinig 🙈</button>
        </div>`);
      container.querySelectorAll('.wer-vote').forEach((btn) => btn.addEventListener('click', () => {
        st.votes.push(btn.dataset.v);
        st.i++;
        persist();
        showQuestion();
      }));
    }

    function showResult() {
      const einig = st.votes.filter((v) => v !== 'x').length;
      const na = st.votes.filter((v) => v === 'a').length;
      const nb = st.votes.filter((v) => v === 'b').length;
      view(`
        <div class="wer-score"><span class="mono">${einig}/${fragen.length}</span><small>einig</small></div>
        <p class="wer-fazit">${esc(fazit[einig] || '')}</p>
        <div class="wer-tally">
          <span class="legend-chip"><i style="--c:var(--pa)"></i>${esc(a)}: ${na}×</span>
          <span class="legend-chip"><i style="--c:var(--pb)"></i>${esc(b)}: ${nb}×</span>
          <span class="legend-chip"><i style="--c:var(--ink-3)"></i>uneinig: ${fragen.length - einig}×</span>
        </div>
        <button type="button" class="btn wer-again">Nochmal von vorn</button>`);
      container.querySelector('.wer-again').addEventListener('click', () => {
        st = { i: 0, votes: [] };
        persist();
        showQuestion();
      });
      if (einig === fragen.length && window.SFWidgets) SFWidgets.confettiBurst(document.getElementById('confetti'));
    }

    if (st.i === 0 && st.votes.length === 0) {
      view(`
        <p class="wer-q">Drei Fragen. Zwei Zeigefinger. Null Ausreden.</p>
        <p class="wer-help">Ihr lest die Frage, zählt gemeinsam runter und zeigt gleichzeitig auf die Person, die es ist.
          Einigkeit bringt Sternenpunkte, Uneinigkeit bringt Gesprächsstoff.</p>
        <button type="button" class="btn btn--gold wer-start">Los geht’s</button>`);
      container.querySelector('.wer-start').addEventListener('click', showQuestion);
    } else {
      showQuestion();
    }
  }

  // --------------------------------------------------- Funkspruch im Umschlag

  function funk(container, { a, b, funkA, funkB, aColor, bColor }) {
    let dir = 'a';     // 'a' = von a an b
    let idx = 0;
    let typer = null;

    container.innerHTML = `
      <div class="eyebrow">Liebes-Funkspruch · zum Verschicken</div>
      <div class="funk-dir" role="radiogroup" aria-label="Richtung">
        <button type="button" class="funk-dir-btn is-on" data-dir="a" role="radio" aria-checked="true" style="--c:${aColor}">${esc(a)} → ${esc(b)}</button>
        <button type="button" class="funk-dir-btn" data-dir="b" role="radio" aria-checked="false" style="--c:${bColor}">${esc(b)} → ${esc(a)}</button>
      </div>
      <button type="button" class="envelope" aria-label="Umschlag öffnen">
        <span class="env-back"></span>
        <span class="env-letter"><span class="env-text"></span></span>
        <span class="env-front"></span>
        <span class="env-flap"></span>
        <span class="env-seal">✶</span>
        <span class="env-hint">Antippen zum Öffnen</span>
      </button>
      <div class="funk-actions">
        <button type="button" class="btn btn--gold funk-send" disabled>📡 Funkspruch senden</button>
        <button type="button" class="btn funk-next" disabled>🎲 Anderer Spruch</button>
      </div>`;

    const env = container.querySelector('.envelope');
    const textEl = container.querySelector('.env-text');
    const sendBtn = container.querySelector('.funk-send');
    const nextBtn = container.querySelector('.funk-next');

    const current = () => (dir === 'a' ? funkA : funkB)[idx % 3];

    function type(str) {
      clearInterval(typer);
      if (reducedMotion()) { textEl.textContent = str; return; }
      let i = 0;
      textEl.textContent = '';
      textEl.classList.add('typing');
      typer = setInterval(() => {
        i += 2;
        textEl.textContent = str.slice(0, i);
        if (i >= str.length) { clearInterval(typer); textEl.classList.remove('typing'); }
      }, 26);
    }

    function open() {
      if (env.classList.contains('is-open')) return;
      env.classList.add('is-open');
      env.setAttribute('aria-label', 'Funkspruch');
      sendBtn.disabled = false;
      nextBtn.disabled = false;
      setTimeout(() => type(current()), reducedMotion() ? 0 : 650);
    }

    env.addEventListener('click', open);

    container.querySelectorAll('.funk-dir-btn').forEach((btn) => btn.addEventListener('click', () => {
      dir = btn.dataset.dir;
      idx = 0;
      container.querySelectorAll('.funk-dir-btn').forEach((x) => {
        x.classList.toggle('is-on', x === btn);
        x.setAttribute('aria-checked', String(x === btn));
      });
      if (env.classList.contains('is-open')) type(current());
    }));

    nextBtn.addEventListener('click', () => {
      idx++;
      type(current());
    });

    // Im Heimnetz (HTTP, kein „secure context“) gibt es weder navigator.share
    // noch navigator.clipboard — dann kopiert die gute alte Textarea.
    function legacyCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }

    sendBtn.addEventListener('click', async () => {
      const msg = current();
      try {
        if (navigator.share) {
          await navigator.share({ text: msg });
          return;
        }
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(msg);
        } else if (!legacyCopy(msg)) {
          throw new Error('copy');
        }
        SFWidgets.toast('Funkspruch kopiert — jetzt nur noch in den Messenger einfügen und senden. 📡');
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        if (legacyCopy(msg)) {
          SFWidgets.toast('Funkspruch kopiert — jetzt nur noch in den Messenger einfügen und senden. 📡');
          return;
        }
        SFWidgets.toast('Kopieren klemmt — einfach vorlesen. Romantischer ist das sowieso. 🎙️');
      }
    });
  }

  return { scratch, wheel, werVonUns, funk };
})();
