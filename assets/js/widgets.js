/* ============================================================
   Sternenflunk-Widgets: Sternenhimmel, Kalender, Orakel,
   Konfetti, Countdown, Toast.
   ============================================================ */
'use strict';

const SFWidgets = (() => {
  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------ Sternenhimmel

  function starfield(canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shooting = null;
    let raf = null;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((innerWidth * innerHeight) / 8500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
        warm: Math.random() < 0.18,
      }));
    }

    function draw(ts) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const t = ts / 1000;
      for (const s of stars) {
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed));
        ctx.globalAlpha = tw * 0.85;
        ctx.fillStyle = s.warm ? '#e2b45f' : '#cfd4ef';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Sternschnuppe: selten, dezent
      if (!shooting && Math.random() < 0.0012) {
        shooting = {
          x: Math.random() * innerWidth * 0.7 + innerWidth * 0.15,
          y: Math.random() * innerHeight * 0.3,
          vx: 7 + Math.random() * 5,
          vy: 3 + Math.random() * 2,
          life: 1,
        };
      }
      if (shooting) {
        const sh = shooting;
        ctx.strokeStyle = `rgba(226,180,95,${sh.life * 0.9})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 6, sh.y - sh.vy * 6);
        ctx.stroke();
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.02;
        if (sh.life <= 0 || sh.x > innerWidth + 80) shooting = null;
      }

      raf = requestAnimationFrame(draw);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const s of stars) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = s.warm ? '#e2b45f' : '#cfd4ef';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener('resize', () => {
      resize();
      if (reducedMotion()) drawStatic();
    });

    if (reducedMotion()) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
      if (reducedMotion()) return;
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!document.hidden && !raf) {
        raf = requestAnimationFrame(draw);
      }
    });
  }

  // ---------------------------------------------------------------- Konfetti

  function confettiBurst(canvas, colors = ['#e2b45f', '#5fc6da', '#ef7d9c', '#efeafd']) {
    if (reducedMotion()) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const parts = Array.from({ length: 150 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.35,
      y: innerHeight * 0.28,
      vx: (Math.random() - 0.5) * 9,
      vy: -(4 + Math.random() * 7),
      size: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    let running = true;
    setTimeout(() => { running = false; }, 3200);

    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = false;
      for (const p of parts) {
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (alive && running) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
      }
    })();
  }

  // ------------------------------------------------------------------- Toast

  let toastTimer = null;
  function toast(message, ms = 3600) {
    const node = document.getElementById('toast');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, ms);
  }

  // ---------------------------------------------------------------- Kalender

  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
    'August', 'September', 'Oktober', 'November', 'Dezember'];

  function calendar({ modal, getEpoch, getToday, getSelected, onPick }) {
    const titleEl = modal.querySelector('#calTitle');
    const gridEl = modal.querySelector('#calGrid');
    const prevBtn = modal.querySelector('#calPrev');
    const nextBtn = modal.querySelector('#calNext');
    let viewYear = 0;
    let viewMonth = 0; // 0-basiert

    const ym = (d) => [Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1];
    const pad = (n) => String(n).padStart(2, '0');

    function render() {
      const epoch = getEpoch();
      const today = getToday();
      const selected = getSelected();
      const [eY, eM] = ym(epoch);
      const [tY, tM] = ym(today);

      titleEl.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
      prevBtn.disabled = viewYear === eY && viewMonth === eM;
      nextBtn.disabled = viewYear === tY && viewMonth === tM;

      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const firstCol = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mo = 0

      gridEl.replaceChildren();
      for (let i = 0; i < firstCol; i++) {
        const filler = document.createElement('span');
        filler.className = 'cal-day is-empty';
        gridEl.appendChild(filler);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal-day';
        btn.textContent = String(d);

        if (iso > today) {
          btn.classList.add('is-future');
          btn.disabled = true;
          btn.textContent = '🔒';
          btn.title = 'Die Zukunft bleibt versiegelt.';
        } else if (iso < epoch) {
          btn.disabled = true;
          btn.title = 'Vor Sternenflunk-Zeitrechnung.';
        } else {
          if (iso < today) btn.classList.add('is-past');
          if (iso === today) btn.classList.add('is-today');
          if (iso === selected) btn.classList.add('is-selected');
          btn.addEventListener('click', () => {
            close();
            onPick(iso);
          });
        }
        gridEl.appendChild(btn);
      }
    }

    function open() {
      const selected = getSelected() || getToday();
      [viewYear, viewMonth] = ym(selected);
      render();
      modal.hidden = false;
      modal.querySelector('.cal-close').focus();
    }

    function close() {
      modal.hidden = true;
    }

    prevBtn.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });
    nextBtn.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });
    modal.querySelectorAll('[data-close]').forEach((n) => n.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    return { open, close };
  }

  // ----------------------------------------------------------------- Orakel

  const ORACLE_ANSWERS = [
    'Ja. Aber zieh was Schickes an.',
    'Nein. Merkur ist rückläufig, und du weißt es.',
    'Frag noch mal, wenn der Kaffee wirkt.',
    'Die Sterne sagen: kommt drauf an, wer kocht.',
    'Signal unklar — Router neu starten. Hilft immer. Fast.',
    'Zu 87,5 % ja. Der Rest ist Glitzer.',
    'Definitiv. Die Sterne haben applaudiert.',
    'Eher nein — aber die Alternative wird besser.',
    'Ja, wenn ihr es zusammen macht.',
    'Das Universum enthält sich, nickt aber unauffällig.',
    'Absolut. Und zwar noch heute.',
    'Nur, wenn danach Eis gegessen wird.',
    'Die Antwort liegt im Kühlschrank. Ernsthaft, schau nach.',
    'Nein, und das ist ein Geschenk.',
    'Vielleicht. Das Orakel braucht mehr Kontext und einen Keks.',
    'Ziemlich sicher. Sicherer als der Wetterbericht allemal.',
    'Heute ja, morgen fraglich — also los.',
    'Das Orakel lacht. Das heißt normalerweise ja.',
    'Kommt drauf an, ob vorher gestretcht wurde.',
    'Die Wahrscheinlichkeit steigt mit jedem Kuss.',
    'Alle Zeichen stehen auf Ja. Sogar die Straßenschilder.',
    'Nö. Aber schön, dass du fragst.',
    'Ja!!! (Das Orakel ist heute leicht überkoffeiniert.)',
    'Erst aufräumen, dann sehen wir weiter.',
    'Das bleibt zwischen dir und dem Mond.',
    'Ja — und einer von euch wusste es schon.',
  ];

  const ORACLE_LIMIT = 3;

  function oracleQuota(today) {
    try {
      const raw = JSON.parse(localStorage.getItem('sflunk_oracle') || '{}');
      return raw.date === today ? raw.count : 0;
    } catch {
      return 0;
    }
  }

  function oracleUse(today) {
    const count = oracleQuota(today) + 1;
    localStorage.setItem('sflunk_oracle', JSON.stringify({ date: today, count }));
    return count;
  }

  function mountOracle(container, today) {
    const used = oracleQuota(today);

    container.innerHTML = `
      <div class="eyebrow">Direkter Draht · Liebesorakel</div>
      <h3>Das Orakel hat geöffnet</h3>
      <p>Eine Ja/Nein-Frage stellen, kurz warten, Antwort ernst nehmen (optional).</p>
      <div class="oracle-form">
        <input type="text" class="oracle-input" maxlength="120"
               placeholder="z. B. Sollten wir heute Pizza bestellen?" aria-label="Frage an das Orakel">
        <button type="button" class="btn btn--gold oracle-ask">Orakel befragen</button>
      </div>
      <div class="oracle-answer" aria-live="polite">
        <span class="oracle-ball" aria-hidden="true">🔮</span>
        <span class="oracle-text">…</span>
      </div>
      <p class="oracle-quota"></p>`;

    const askBtn = container.querySelector('.oracle-ask');
    const input = container.querySelector('.oracle-input');
    const answer = container.querySelector('.oracle-answer');
    const answerText = container.querySelector('.oracle-text');
    const quotaEl = container.querySelector('.oracle-quota');

    function renderQuota(count) {
      const left = Math.max(0, ORACLE_LIMIT - count);
      if (left === 0) {
        quotaEl.textContent = 'Kontingent erschöpft — das Orakel schnarcht. Morgen wieder.';
        askBtn.disabled = true;
      } else {
        quotaEl.textContent = `Noch ${left} von ${ORACLE_LIMIT} Fragen heute.`;
      }
    }
    renderQuota(used);

    askBtn.addEventListener('click', () => {
      if (askBtn.disabled) return;
      askBtn.disabled = true;
      answer.classList.add('shaking');
      answerText.textContent = 'Das Orakel schüttelt die Sterne …';

      setTimeout(() => {
        answer.classList.remove('shaking');
        answerText.textContent = ORACLE_ANSWERS[Math.floor(Math.random() * ORACLE_ANSWERS.length)];
        const count = oracleUse(today);
        renderQuota(count);
        if (count < ORACLE_LIMIT) askBtn.disabled = false;
        input.value = '';
      }, reducedMotion() ? 60 : 750);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') askBtn.click();
    });
  }

  // --------------------------------------------------------------- Countdown

  function countdown(el, onMidnight) {
    let lastDay = new Date().getDate();
    setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight - now);
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      el.textContent = `${h}:${m}:${s}`;

      if (now.getDate() !== lastDay) {
        lastDay = now.getDate();
        onMidnight();
      }
    }, 1000);
  }

  return { starfield, confettiBurst, toast, calendar, mountOracle, countdown };
})();
