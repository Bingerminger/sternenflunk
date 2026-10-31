/* ============================================================
   Sternenflunk-Motion (2.0): Sendestart-Vorspann, Karten-Reveal,
   Hochzähler, Licht-Glanz, Mondphase, Beziehungs-Puls.
   Alles Vanilla (Canvas, SVG, CSS) — und alles respektiert
   prefers-reduced-motion: dann gibt es Inhalt ohne Show.
   ============================================================ */
'use strict';

const SFMotion = (() => {
  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const easeOutCubic = (t) => 1 - (1 - t) ** 3;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const fmt = (v, dec) => v.toFixed(dec).replace('.', ',');

  const esc = (s) => String(s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  // --------------------------------------------------------------- Hochzähler

  /** Zählt [data-count] von 0 hoch (data-dec = Nachkommastellen). */
  function countUp(node, delay = 0) {
    const target = Number(node.dataset.count);
    const dec = Number(node.dataset.dec || 0);
    if (!Number.isFinite(target) || reducedMotion()) return;
    const dur = 900 + Math.min(900, Math.abs(target) * 8);
    let start = null;
    node.textContent = fmt(0, dec);
    const step = (ts) => {
      if (start === null) start = ts + delay;
      const t = clamp01((ts - start) / dur);
      node.textContent = fmt(target * easeOutCubic(t), dec);
      if (t < 1) requestAnimationFrame(step);
      else node.textContent = fmt(target, dec);
    };
    requestAnimationFrame(step);
  }

  // ----------------------------------------------------------- Karten-Reveal

  let observer = null;

  /**
   * Karten schweben gestaffelt ein, sobald sie sichtbar werden. Alles, was
   * darin animiert (Balken, Kurven, Sternbild, Zähler), hängt per CSS an
   * .card.is-in — die Choreografie lebt also in einem einzigen Schalter.
   */
  function reveal(root) {
    if (observer) observer.disconnect();
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      root.classList.remove('reveal-ready');
      return;
    }
    root.classList.add('reveal-ready');
    observer = new IntersectionObserver((entries) => {
      let i = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const card = entry.target;
        const d = Math.min(i++, 6) * 95;
        card.style.setProperty('--rd', `${d}ms`);
        card.classList.add('is-in');
        observer.unobserve(card);
        card.querySelectorAll('[data-count]').forEach((n) => countUp(n, d + 180));
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    root.querySelectorAll('.card').forEach((c) => observer.observe(c));
  }

  // ------------------------------------------------------------ Licht-Glanz

  /** Ein weicher Lichtfleck folgt dem Mauszeiger über die Karten (nur Desktop). */
  function glare(root) {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    root.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // --------------------------------------------------------------- Mondphase

  /** Echte Phasen-Silhouette als Mini-SVG (zunehmend = rechts beleuchtet). */
  function moonSvg(illumination, group) {
    const k = Math.max(0, Math.min(100, illumination)) / 100;
    const R = 10, cx = 12, cy = 12;
    const waxing = group !== 'abnehmend';
    const rx = Math.abs(1 - 2 * k) * R;
    const litSweep = waxing ? 1 : 0;
    const termSweep = waxing ? (k > 0.5 ? 1 : 0) : (k > 0.5 ? 0 : 1);
    const lit = k < 0.02
      ? ''
      : (k > 0.98
        ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#f4ead0"/>`
        : `<path d="M${cx},${cy - R} A${R},${R} 0 0 ${litSweep} ${cx},${cy + R} A${rx.toFixed(2)},${R} 0 0 ${termSweep} ${cx},${cy - R}Z" fill="#f4ead0"/>`);
    return `<svg class="moon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#2b2552"/>${lit}
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width=".6"/></svg>`;
  }

  // -------------------------------------------------------- Beziehungs-Puls

  /** Scrollendes EKG; ein Schlag pro Herzschlag-Periode (60/bpm s). */
  function pulse(container, { bpm, color = '#ef7d9c' }) {
    const P = 100;
    let d = 'M0,30';
    for (let i = 0; i < 5; i++) {
      const x = i * P;
      d += ` L${x + 30},30 L${x + 37},30 L${x + 41},25 L${x + 45},30 L${x + 52},30` +
           ` L${x + 56},7 L${x + 61},50 L${x + 65},30 L${x + 72},30 L${x + 79},22 L${x + 87},30 L${x + 100},30`;
    }
    const uid = `pm${Math.floor(Math.random() * 1e6)}`;
    container.innerHTML = `
      <svg class="pulse-svg" viewBox="0 0 300 56" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}g" x1="0" x2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0"/>
            <stop offset=".55" stop-color="#fff" stop-opacity=".55"/>
            <stop offset=".86" stop-color="#fff" stop-opacity="1"/>
            <stop offset="1" stop-color="#fff" stop-opacity="0"/>
          </linearGradient>
          <mask id="${uid}m"><rect width="300" height="56" fill="url(#${uid}g)"/></mask>
        </defs>
        <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
        <g mask="url(#${uid}m)">
          <g class="pulse-track" style="--beat:${(60 / bpm).toFixed(3)}s">
            <path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          </g>
        </g>
      </svg>`;
  }

  // ------------------------------------------------------- Sendestart-Vorspann

  /**
   * Kino-Vorspann: Die beiden Zeichen fliegen ein, umkreisen sich, ein
   * Sternen-Burst — dann Namen, Datum und die Kompatibilität des Tages.
   * Antippen/Taste überspringt. Resolved, sobald die App übernehmen darf.
   */
  function intro({ a, b, pct, dateLabel, special, jackpot, chaos }) {
    return new Promise((resolve) => {
      if (reducedMotion()) { resolve(); return; }

      const A = '#5fc6da', B = '#ef7d9c', G = '#e2b45f';
      const root = document.createElement('div');
      root.className = 'intro';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-label', 'Sendestart');
      root.innerHTML = `
        <canvas class="intro-canvas"></canvas>
        <div class="intro-copy">
          <div class="intro-kicker"><span class="intro-live">● On Air</span> Sendestart · ${esc(dateLabel)}</div>
          <div class="intro-names"><span class="ia">${esc(a.name)}</span><span class="amp">&amp;</span><span class="ib">${esc(b.name)}</span></div>
          <div class="intro-pct${chaos ? ' is-chaos' : ''}"><span class="intro-num">0</span><small>&thinsp;%</small></div>
          <div class="intro-sub">${jackpot ? '★ Jackpot-Tag ★' : (chaos ? '⚡ Kosmische Störung — Funkverkehr mit Rauschen' : 'Kompatibilität heute')}${special ? ` · ${esc(special)}` : ''}</div>
        </div>
        <button class="intro-skip" type="button">Überspringen ›</button>`;
      document.body.appendChild(root);
      document.body.classList.add('intro-open');

      const canvas = root.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const numEl = root.querySelector('.intro-num');
      let w = 0, h = 0;
      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        w = innerWidth; h = innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);

      const FLY = 1300, ORBIT = 1250, BURST = FLY + ORBIT, EXIT = 5200;
      const trails = { a: [], b: [] };
      const parts = [];
      let burstDone = false;
      let start = null;
      let raf = null;
      let finished = false;

      const bez = (p0, p1, p2, t) => [
        (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
        (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
      ];

      function burst(cx, cy) {
        const colors = [A, B, G, '#ffffff'];
        const n = jackpot ? 170 : 110;
        for (let i = 0; i < n; i++) {
          const ang = Math.random() * Math.PI * 2;
          const sp = 1.5 + Math.random() * (jackpot ? 9 : 7);
          parts.push({
            x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
            life: 1, decay: 0.006 + Math.random() * 0.012,
            size: 1 + Math.random() * 2.6, color: colors[i % colors.length],
            heart: jackpot && Math.random() < 0.3,
          });
        }
      }

      function drawBody(x, y, glyph, color, scale = 1) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 46 * scale);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.18, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 46 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${Math.round(30 * scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(glyph, x, y + 1);
        ctx.restore();
      }

      function drawTrail(list, color) {
        for (let i = 0; i < list.length; i++) {
          const [x, y] = list[i];
          const f = i / list.length;
          ctx.globalAlpha = f * 0.45;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 1 + f * 7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      function frame(ts) {
        if (start === null) start = ts;
        const T = ts - start;
        const cx = w / 2;
        const cy = Math.min(h * 0.34, h / 2 - 90);
        const R0 = Math.min(w, h) * 0.24;
        const R1 = R0 * 0.42;

        let pa, pb;
        if (T < FLY) {
          const p = easeOutCubic(T / FLY);
          pa = bez([-60, h * 0.85], [w * 0.1, h * 0.05], [cx - R0, cy], p);
          pb = bez([w + 60, h * 0.05], [w * 0.92, h * 0.9], [cx + R0, cy], p);
        } else {
          const q = clamp01((T - FLY) / ORBIT);
          const after = Math.max(0, T - BURST) / 1000;
          const ang = Math.PI + (q * 1.1 + q * q * 1.7) * Math.PI + after * 1.6;
          const rad = R0 - (R0 - R1) * easeInOutCubic(q);
          pa = [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad * 0.55];
          pb = [cx - Math.cos(ang) * rad, cy - Math.sin(ang) * rad * 0.55];
        }

        trails.a.push(pa); trails.b.push(pb);
        if (trails.a.length > 22) { trails.a.shift(); trails.b.shift(); }

        if (!burstDone && T >= BURST) {
          burstDone = true;
          burst(cx, cy);
          if (navigator.vibrate) navigator.vibrate(12);
        }

        ctx.clearRect(0, 0, w, h);

        // Schockwelle nach dem Burst
        if (burstDone) {
          const s = clamp01((T - BURST) / 1100);
          ctx.globalAlpha = (1 - s) * 0.7;
          ctx.strokeStyle = G;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 10 + easeOutCubic(s) * Math.max(w, h) * 0.55, 0, Math.PI * 2);
          ctx.stroke();
          const s2 = clamp01((T - BURST - 160) / 1300);
          ctx.globalAlpha = (1 - s2) * 0.35;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, 10 + easeOutCubic(s2) * Math.max(w, h) * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Funkverbindung zwischen beiden
        if (T > FLY * 0.6) {
          ctx.globalAlpha = Math.min(0.5, (T - FLY * 0.6) / 1200);
          const lg = ctx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
          lg.addColorStop(0, A); lg.addColorStop(0.5, G); lg.addColorStop(1, B);
          ctx.strokeStyle = lg;
          ctx.setLineDash([2, 6]);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }

        ctx.globalCompositeOperation = 'lighter';
        drawTrail(trails.a, A);
        drawTrail(trails.b, B);

        for (const p of parts) {
          if (p.life <= 0) continue;
          p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.025;
          p.x += p.vx; p.y += p.vy;
          p.life -= p.decay;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          if (p.heart) {
            ctx.font = `${Math.round(8 + p.size * 3)}px sans-serif`;
            ctx.fillText('♥', p.x, p.y);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        const scale = T < FLY ? 0.7 + 0.3 * easeOutCubic(T / FLY) : 1;
        drawBody(pa[0], pa[1], a.glyph, A, scale);
        drawBody(pb[0], pb[1], b.glyph, B, scale);

        // Blitz im Moment des Bursts
        if (burstDone && T - BURST < 260) {
          ctx.globalAlpha = 0.5 * (1 - (T - BURST) / 260);
          ctx.fillStyle = '#fff7e0';
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1;
        }

        // Prozentzahl zählt hoch
        const cq = clamp01((T - 2650) / 1300);
        numEl.textContent = fmt(pct * easeOutCubic(cq), 1);

        if (T >= EXIT) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }

      function finish() {
        if (finished) return;
        finished = true;
        numEl.textContent = fmt(pct, 1);
        root.classList.add('intro-out');
        document.body.classList.remove('intro-open');
        resolve();
        setTimeout(() => {
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', resize);
          document.removeEventListener('keydown', onKey);
          root.remove();
        }, 800);
      }

      const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); };
      root.addEventListener('click', finish);
      document.addEventListener('keydown', onKey);

      requestAnimationFrame((ts) => { root.classList.add('intro-in'); frame(ts); });
    });
  }

  return { reducedMotion, countUp, reveal, glare, moonSvg, pulse, intro };
})();
