/* ============================================================
   Sternenflunk-Charts — handgerollte SVGs, keine Bibliotheken.
   Farben sind die validierten Dark-Band-Töne aus styles.css.
   ============================================================ */
'use strict';

const SFCharts = (() => {
  const INK = '#efeafd';
  const INK2 = '#b3a9d6';
  const INK3 = '#7d739f';
  const GRID = 'rgba(255,255,255,0.10)';
  const GOLD = '#b37e27';
  const GOLD_SOFT = '#e2b45f';

  const NS = 'http://www.w3.org/2000/svg';

  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(name, attrs = {}, children = []) {
    const node = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    for (const child of children) node.appendChild(child);
    return node;
  }

  function text(str, attrs = {}) {
    const node = el('text', attrs);
    node.textContent = str;
    return node;
  }

  // ---------------------------------------------------------- Radar (5 Achsen)

  function radar(container, { labels, values, color }) {
    const W = 320, H = 268, cx = 160, cy = 138, R = 94, max = 100;
    const n = labels.length;
    const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });

    // Ringe (recessive)
    for (const frac of [1 / 3, 2 / 3, 1]) {
      const points = Array.from({ length: n }, (_, i) => pt(i, R * frac).join(',')).join(' ');
      svg.appendChild(el('polygon', { points, fill: 'none', stroke: GRID, 'stroke-width': 1 }));
    }
    // Achsen
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i, R);
      svg.appendChild(el('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: GRID, 'stroke-width': 1 }));
    }

    // Werte-Polygon
    const valPts = values.map((v, i) => pt(i, (R * v) / max));
    svg.appendChild(el('polygon', {
      points: valPts.map((p) => p.join(',')).join(' '),
      fill: color, 'fill-opacity': 0.16, stroke: color, 'stroke-width': 2,
      'stroke-linejoin': 'round', class: 'sf-grow',
    }));

    // Vertex-Punkte + Wert + Titel-Tooltip
    values.forEach((v, i) => {
      const [x, y] = valPts[i];
      const dot = el('circle', { cx: x, cy: y, r: 4.5, fill: color, stroke: '#151030', 'stroke-width': 2, class: 'sf-pop', style: `--pi:${i}` });
      dot.appendChild(el('title'));
      dot.querySelector('title').textContent = `${labels[i]}: ${v}`;
      svg.appendChild(dot);

      const [lx, ly] = pt(i, (R * v) / max + (v > 84 ? -15 : 13));
      svg.appendChild(text(String(v), {
        x: lx, y: ly + 3, fill: INK2, 'font-size': 10.5, 'text-anchor': 'middle',
        'font-family': 'ui-monospace, Menlo, monospace',
      }));
    });

    // Achsen-Labels
    labels.forEach((label, i) => {
      const a = angle(i);
      const [x, y] = pt(i, R + 22);
      const anchor = Math.abs(Math.cos(a)) < 0.35 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      svg.appendChild(text(label, {
        x, y: y + 3, fill: INK3, 'font-size': 10.5, 'text-anchor': anchor,
        'letter-spacing': '0.08em',
      }));
    });

    container.replaceChildren(svg);
  }

  // ------------------------------------------- Energie-Kurven (1–2 Serien)

  function timeToSlot(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 2 + (m >= 30 ? 1 : 0);
  }

  function energy(container, { series, window: win, note }) {
    const W = 660, H = 232, L = 34, R = 12, T = 16, B = 28;
    const plotW = W - L - R, plotH = H - T - B;
    const x = (slot) => L + (slot / 47) * plotW;
    const y = (v) => T + plotH - (v / 100) * plotH;

    const wrap = document.createElement('div');
    wrap.className = 'chart-wrap';

    // Legende nur bei ≥ 2 Serien
    if (series.length > 1) {
      const legend = document.createElement('div');
      legend.className = 'chart-legend';
      legend.innerHTML = series
        .map((s) => `<span class="legend-chip"><i style="--c:${s.color}"></i>${s.name}</span>`)
        .join('');
      container.replaceChildren(legend);
    } else {
      container.replaceChildren();
    }

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });

    // Gitter + Y-Beschriftung (recessive)
    for (const v of [0, 50, 100]) {
      svg.appendChild(el('line', { x1: L, y1: y(v), x2: W - R, y2: y(v), stroke: GRID, 'stroke-width': 1 }));
      svg.appendChild(text(String(v), {
        x: L - 7, y: y(v) + 3.5, fill: INK3, 'font-size': 10, 'text-anchor': 'end',
        'font-family': 'ui-monospace, Menlo, monospace',
      }));
    }
    // X-Ticks
    for (const h of [0, 6, 12, 18, 24]) {
      const xx = x(Math.min(47, h * 2));
      svg.appendChild(text(h === 24 ? '24 Uhr' : `${h}`, {
        x: h === 24 ? xx - 8 : xx, y: H - 8, fill: INK3, 'font-size': 10,
        'text-anchor': h === 24 ? 'end' : 'middle',
        'font-family': 'ui-monospace, Menlo, monospace',
      }));
    }

    // Gemeinsames Fenster (goldene Zone)
    if (win) {
      const a = x(timeToSlot(win.von));
      const b = x(timeToSlot(win.bis));
      svg.appendChild(el('rect', {
        x: a, y: T, width: Math.max(2, b - a), height: plotH,
        fill: GOLD, 'fill-opacity': 0.09,
        stroke: GOLD, 'stroke-opacity': 0.45, 'stroke-dasharray': '3 4', 'stroke-width': 1,
        rx: 4,
      }));
    }

    // Serien: Fläche + Linie + Peak
    for (const s of series) {
      const pts = s.points.map((v, i) => [x(i), y(v)]);
      const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
      svg.appendChild(el('path', {
        d: `${line}L${x(47)},${y(0)}L${x(0)},${y(0)}Z`,
        fill: s.color, 'fill-opacity': 0.10, class: 'sf-fade',
      }));
      svg.appendChild(el('path', {
        d: line, fill: 'none', stroke: s.color, 'stroke-width': 2,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round',
        pathLength: 1, class: 'sf-draw',
      }));

      if (s.peak) {
        const slot = timeToSlot(s.peak);
        svg.appendChild(el('circle', {
          cx: x(slot), cy: y(s.points[slot]), r: 4.5,
          fill: s.color, stroke: '#151030', 'stroke-width': 2, class: 'sf-peak',
        }));
        svg.appendChild(text(`▲ ${s.peak}`, {
          x: Math.min(W - R - 4, Math.max(L + 4, x(slot))),
          y: Math.max(11, y(s.points[slot]) - 10),
          fill: INK2, 'font-size': 10, 'text-anchor': 'middle',
          'font-family': 'ui-monospace, Menlo, monospace', class: 'sf-peak',
        }));
      }
    }

    // Hover-Ebene: Crosshair + Tooltip
    const cross = el('line', { x1: 0, y1: T, x2: 0, y2: T + plotH, stroke: INK3, 'stroke-width': 1, 'stroke-dasharray': '2 3', opacity: 0 });
    svg.appendChild(cross);
    const hoverDots = series.map((s) => {
      const dot = el('circle', { r: 4, fill: s.color, stroke: '#151030', 'stroke-width': 1.5, opacity: 0 });
      svg.appendChild(dot);
      return dot;
    });

    const tip = document.createElement('div');
    tip.className = 'chart-tip';

    svg.addEventListener('pointermove', (ev) => {
      const rect = svg.getBoundingClientRect();
      const scale = W / rect.width;
      const mx = (ev.clientX - rect.left) * scale;
      const slot = Math.max(0, Math.min(47, Math.round(((mx - L) / plotW) * 47)));
      const hh = String(Math.floor(slot / 2)).padStart(2, '0');
      const mm = slot % 2 ? '30' : '00';

      cross.setAttribute('x1', x(slot));
      cross.setAttribute('x2', x(slot));
      cross.setAttribute('opacity', '0.7');
      series.forEach((s, i) => {
        hoverDots[i].setAttribute('cx', x(slot));
        hoverDots[i].setAttribute('cy', y(s.points[slot]));
        hoverDots[i].setAttribute('opacity', '1');
      });

      tip.innerHTML = `<span class="mono">${hh}:${mm} Uhr</span>` + series
        .map((s) => `<span class="row"><i style="background:${s.color}"></i>${s.name} <span class="mono">${s.points[slot]}</span></span>`)
        .join('');
      tip.style.left = `${(x(slot) / W) * rect.width}px`;
      tip.style.top = `${(T / H) * rect.height}px`;
      tip.style.opacity = '1';
    });

    svg.addEventListener('pointerleave', () => {
      cross.setAttribute('opacity', '0');
      hoverDots.forEach((d) => d.setAttribute('opacity', '0'));
      tip.style.opacity = '0';
    });

    wrap.appendChild(svg);
    wrap.appendChild(tip);
    container.appendChild(wrap);

    if (note) {
      const noteEl = document.createElement('p');
      noteEl.className = 'chart-note';
      noteEl.innerHTML = note;
      container.appendChild(noteEl);
    }
  }

  // ------------------------------------------------ Orbit-Duett (Signatur)

  /**
   * Zwei Himmelskörper umkreisen ihr gemeinsames Baryzentrum.
   * Normal: Ellipse (enger + schneller bei hoher Kompatibilität).
   * Jackpot (≥ 96 %): Die Bahn wird zum Herz, aus der Mitte steigen Herzchen.
   * Chaos (≤ 48 %): Die Bahn taumelt. Kometenschweife + Funkverbindung immer.
   * Der PDF-Bericht nutzt dieselbe Funktion und rastert den Startzustand.
   */
  function orbit(container, { pct, aColor = '#5fc6da', bColor = '#ef7d9c', aGlyph = '✶', bGlyph = '✶' }) {
    const W = 300, H = 216, cx = 150, cy = 108;
    const mode = pct >= 96 ? 'heart' : (pct <= 48 ? 'chaos' : 'ellipse');
    const r = 34 + (100 - pct) * 0.72;          // hohe Kompatibilität = enger Orbit
    const speed = 0.22 + (pct / 100) * 0.55;    // ... und schnellere Umlaufbahn
    const squash = 0.62;
    const HS = 4.4;                              // Herz-Skalierung

    // Bahnfunktion: Winkel (+ Zeit fürs Taumeln) → Position
    const pos = (a, t = 0) => {
      if (mode === 'heart') {
        const s = Math.sin(a);
        return [
          cx + HS * 16 * s * s * s,
          cy - 4 - HS * 0.82 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)),
        ];
      }
      const wob = mode === 'chaos' ? 1 + 0.17 * Math.sin(a * 3 + t * 2.3) : 1;
      return [cx + Math.cos(a) * r * wob, cy + Math.sin(a) * r * squash * wob];
    };

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Orbit-Duett, Kompatibilität ${pct} Prozent` });

    const defs = el('defs');
    for (const [id, color] of [['gA', aColor], ['gB', bColor]]) {
      const grad = el('radialGradient', { id });
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#ffffff' }));
      grad.appendChild(el('stop', { offset: '38%', 'stop-color': color }));
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }));
      defs.appendChild(grad);
    }
    const tetherGrad = el('linearGradient', { id: 'gT', gradientUnits: 'userSpaceOnUse' });
    tetherGrad.appendChild(el('stop', { offset: '0%', 'stop-color': aColor }));
    tetherGrad.appendChild(el('stop', { offset: '50%', 'stop-color': GOLD_SOFT }));
    tetherGrad.appendChild(el('stop', { offset: '100%', 'stop-color': bColor }));
    defs.appendChild(tetherGrad);
    svg.appendChild(defs);

    // Hintergrund-Sterne (funkeln im Takt ihrer Phase)
    const seeds = [[36, 30], [262, 44], [58, 178], [238, 168], [150, 22], [284, 108], [18, 96], [96, 60], [206, 192], [120, 200]];
    const bgStars = seeds.map(([sx, sy], i) => {
      const s = el('circle', { cx: sx, cy: sy, r: i % 3 === 0 ? 1.4 : 1, fill: i % 4 === 0 ? GOLD_SOFT : INK3, opacity: 0.7 });
      svg.appendChild(s);
      return s;
    });

    // Umlaufbahn
    if (mode === 'heart') {
      const pts = Array.from({ length: 97 }, (_, i) => pos((i / 96) * Math.PI * 2));
      svg.appendChild(el('path', {
        d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('') + 'Z',
        fill: GOLD_SOFT, 'fill-opacity': 0.05,
        stroke: GOLD_SOFT, 'stroke-opacity': 0.45, 'stroke-width': 1, 'stroke-dasharray': '3 5',
      }));
    } else {
      svg.appendChild(el('ellipse', {
        cx, cy, rx: r, ry: r * squash, fill: 'none',
        stroke: mode === 'chaos' ? '#e66767' : GRID,
        'stroke-opacity': mode === 'chaos' ? 0.45 : 1,
        'stroke-width': 1, 'stroke-dasharray': mode === 'chaos' ? '2 7' : '3 5',
      }));
    }

    // Funkverbindung zwischen beiden + wandernder Signal-Punkt
    const tether = el('line', { stroke: 'url(#gT)', 'stroke-width': 1.2, opacity: 0.35, 'stroke-dasharray': '1 3' });
    const signal = el('circle', { r: 1.8, fill: '#ffffff', opacity: 0 });
    svg.append(tether, signal);

    // Baryzentrum + pulsierender Ring
    const ring = el('circle', { cx, cy, r: 3, fill: 'none', stroke: GOLD_SOFT, 'stroke-width': 1, opacity: 0 });
    svg.append(ring, el('circle', { cx, cy, r: 2.4, fill: GOLD_SOFT }));

    // Jackpot: aufsteigende Herzchen
    const hearts = mode === 'heart'
      ? Array.from({ length: 4 }, () => {
        const h = text('♥', { 'font-size': 9, fill: '#ef7d9c', 'text-anchor': 'middle', opacity: 0 });
        svg.appendChild(h);
        return h;
      })
      : [];

    // Kometenschweife (aus der Bahnfunktion berechnet ⇒ auch statisch hübsch)
    const TRAIL = 12;
    const trailStep = mode === 'heart' ? 0.05 : 0.07;
    const mkTrail = (color) => Array.from({ length: TRAIL }, (_, k) => {
      const c = el('circle', { r: Math.max(0.6, 5.2 - k * 0.4), fill: color, opacity: (0.42 * (1 - k / TRAIL)).toFixed(3) });
      svg.appendChild(c);
      return c;
    });
    const trailA = mkTrail(aColor);
    const trailB = mkTrail(bColor);

    // Körper: Glow (Gradient, groß) + Kern + Zeichen-Glyphe
    const glowA = el('circle', { r: 22, fill: 'url(#gA)', opacity: 0.85 });
    const glowB = el('circle', { r: 20, fill: 'url(#gB)', opacity: 0.85 });
    const bodyA = el('circle', { r: 8, fill: aColor });
    const bodyB = el('circle', { r: 7, fill: bColor });
    const glyphA = text(aGlyph, { 'font-size': 11, fill: '#08222a', 'text-anchor': 'middle' });
    const glyphB = text(bGlyph, { 'font-size': 10, fill: '#2c0d18', 'text-anchor': 'middle' });
    svg.append(glowA, glowB, bodyA, bodyB, glyphA, glyphB);

    let angle = 0.65;
    let t = 0;
    const place = () => {
      const jit = mode === 'chaos' ? () => (Math.random() - 0.5) * 1.6 : () => 0;
      let [ax, ay] = pos(angle, t);
      let [bx, by] = pos(angle + Math.PI, t);
      ax += jit(); ay += jit(); bx += jit(); by += jit();
      for (const [node, px, py] of [[glowA, ax, ay], [bodyA, ax, ay], [glowB, bx, by], [bodyB, bx, by]]) {
        node.setAttribute('cx', px);
        node.setAttribute('cy', py);
      }
      glyphA.setAttribute('x', ax); glyphA.setAttribute('y', ay + 3.6);
      glyphB.setAttribute('x', bx); glyphB.setAttribute('y', by + 3.2);

      for (let k = 0; k < TRAIL; k++) {
        const [tax, tay] = pos(angle - (k + 1) * trailStep, t);
        const [tbx, tby] = pos(angle + Math.PI - (k + 1) * trailStep, t);
        trailA[k].setAttribute('cx', tax); trailA[k].setAttribute('cy', tay);
        trailB[k].setAttribute('cx', tbx); trailB[k].setAttribute('cy', tby);
      }

      tether.setAttribute('x1', ax); tether.setAttribute('y1', ay);
      tether.setAttribute('x2', bx); tether.setAttribute('y2', by);
      tetherGrad.setAttribute('x1', ax); tetherGrad.setAttribute('y1', ay);
      tetherGrad.setAttribute('x2', bx); tetherGrad.setAttribute('y2', by);
      return [ax, ay, bx, by];
    };
    place();

    let raf = null;
    let last = null;
    if (!reducedMotion()) {
      const tick = (ts) => {
        if (last !== null) {
          const dt = (ts - last) / 1000;
          t += dt;
          angle += speed * dt * (mode === 'chaos' ? 1 + 0.5 * Math.sin(t * 1.7) : 1);
          const [ax, ay, bx, by] = place();

          // Funkverbindung atmet, Signal pendelt hin und her
          tether.setAttribute('opacity', (0.28 + 0.2 * Math.sin(t * 2.1)).toFixed(3));
          const f = (Math.sin(t * 1.3) + 1) / 2;
          signal.setAttribute('cx', ax + (bx - ax) * f);
          signal.setAttribute('cy', ay + (by - ay) * f);
          signal.setAttribute('opacity', '0.85');

          // Puls-Ring im Baryzentrum
          const q = (t % 2.4) / 2.4;
          ring.setAttribute('r', (3 + q * 16).toFixed(2));
          ring.setAttribute('opacity', (0.6 * (1 - q)).toFixed(3));

          bgStars.forEach((s, i) => s.setAttribute('opacity', (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * (0.8 + i * 0.13) + i))).toFixed(3)));

          hearts.forEach((h, i) => {
            const hq = ((t * 0.35) + i / hearts.length) % 1;
            h.setAttribute('x', cx + Math.sin(hq * 9 + i * 2) * 8);
            h.setAttribute('y', cy - 6 - hq * 46);
            h.setAttribute('opacity', (Math.sin(hq * Math.PI) * 0.9).toFixed(3));
          });
        }
        last = ts;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    container.replaceChildren(svg);
    return { destroy: () => { if (raf) cancelAnimationFrame(raf); } };
  }

  // ------------------------------------------- Sternbild des Tages (2.0)

  /*
   * Geometrie im 100er-Raster (y nach unten): p = Sterne, l = Linienzüge als
   * Indizes in p. Schlüssel = HoroscopeGenerator::STERNBILD_FORMEN.
   */
  const SHAPES = {
    herz: { p: [[50, 30], [32, 14], [14, 28], [20, 52], [50, 86], [80, 52], [86, 28], [68, 14]], l: [[0, 1, 2, 3, 4, 5, 6, 7, 0]] },
    tasse: { p: [[22, 36], [70, 36], [66, 78], [26, 78], [82, 44], [84, 60], [68, 64], [38, 24], [42, 10], [54, 26], [58, 12], [12, 88], [80, 88]], l: [[0, 1, 2, 3, 0], [1, 4, 5, 6], [7, 8], [9, 10], [11, 12]] },
    katze: { p: [[20, 46], [24, 14], [36, 32], [64, 32], [76, 14], [80, 46], [66, 68], [34, 68], [40, 46], [60, 46], [8, 56], [30, 58], [92, 56], [70, 58]], l: [[0, 1, 2, 3, 4, 5, 6, 7, 0], [10, 11], [12, 13]] },
    rakete: { p: [[50, 6], [62, 28], [62, 66], [38, 66], [38, 28], [76, 80], [24, 80], [50, 94], [50, 40]], l: [[0, 1, 2, 3, 4, 0], [2, 5], [3, 6], [3, 7, 2]] },
    sofa: { p: [[16, 34], [84, 34], [6, 48], [94, 48], [16, 60], [84, 60], [8, 76], [92, 76], [12, 88], [88, 88]], l: [[2, 0, 1, 3], [2, 6, 7, 3], [4, 5], [6, 8], [7, 9]] },
    pizza: { p: [[50, 90], [16, 18], [50, 8], [84, 18], [44, 32], [60, 44], [48, 60]], l: [[0, 1, 2, 3, 0]] },
    schluessel: { p: [[10, 42], [24, 28], [38, 42], [24, 56], [90, 42], [80, 42], [80, 56], [68, 42], [68, 52]], l: [[0, 1, 2, 3, 0], [2, 4], [5, 6], [7, 8]] },
    krone: { p: [[14, 76], [14, 28], [32, 52], [50, 18], [68, 52], [86, 28], [86, 76], [50, 64]], l: [[0, 1, 2, 3, 4, 5, 6, 0]] },
    fisch: { p: [[12, 50], [38, 28], [64, 40], [90, 26], [90, 74], [64, 60], [38, 72], [26, 44]], l: [[0, 1, 2, 3, 4, 5, 6, 0]] },
    haus: { p: [[18, 88], [18, 46], [50, 14], [82, 46], [82, 88], [42, 88], [42, 66], [58, 66], [58, 88], [66, 58]], l: [[0, 1, 2, 3, 4, 0], [1, 3], [5, 6, 7, 8]] },
    ballon: { p: [[50, 6], [74, 18], [80, 38], [64, 60], [36, 60], [20, 38], [26, 18], [58, 76], [42, 76], [58, 90], [42, 90]], l: [[0, 1, 2, 3, 4, 5, 6, 0], [3, 7], [4, 8], [8, 7, 9, 10, 8]] },
    teekanne: { p: [[30, 36], [70, 36], [80, 60], [66, 82], [34, 82], [20, 60], [50, 22], [94, 40], [8, 44], [12, 68]], l: [[0, 1, 2, 3, 4, 5, 0], [0, 6, 1], [2, 7], [0, 8, 9, 5]] },
    schirm: { p: [[8, 46], [24, 24], [50, 12], [76, 24], [92, 46], [70, 42], [50, 46], [30, 42], [50, 82], [42, 90], [34, 84]], l: [[0, 1, 2, 3, 4, 5, 6, 7, 0], [6, 8, 9, 10]] },
    socke: { p: [[34, 8], [62, 8], [62, 54], [88, 70], [82, 90], [44, 86], [34, 66], [34, 22], [62, 22]], l: [[0, 1, 2, 3, 4, 5, 6, 0], [7, 8]] },
    pfeil: { p: [[10, 88], [88, 12], [70, 12], [88, 30], [8, 72], [26, 90], [40, 56], [50, 64], [44, 46]], l: [[0, 1], [2, 1, 3], [0, 4], [0, 5], [8, 6, 7]] },
    eis: { p: [[28, 42], [32, 22], [50, 12], [68, 22], [72, 42], [50, 92], [50, 4]], l: [[0, 1, 2, 3, 4, 0], [0, 5, 4]] },
    papierflieger: { p: [[92, 28], [10, 18], [26, 76], [42, 50], [6, 60], [14, 86]], l: [[1, 0, 2, 3, 1], [3, 0]] },
    anker: { p: [[50, 6], [57, 13], [50, 20], [43, 13], [50, 86], [32, 32], [68, 32], [22, 62], [78, 62]], l: [[0, 1, 2, 3, 0], [2, 4], [5, 6], [7, 4, 8]] },
    kerze: { p: [[50, 6], [57, 20], [50, 30], [43, 20], [50, 36], [38, 36], [62, 36], [62, 90], [38, 90]], l: [[0, 1, 2, 3, 0], [2, 4], [5, 6, 7, 8, 5]] },
    unendlich: { p: [[50, 50], [30, 30], [10, 50], [30, 70], [70, 30], [90, 50], [70, 70]], l: [[0, 1, 2, 3, 0, 4, 5, 6, 0]] },
  };

  /** Kleiner xorshift — gleicher Seed, gleiches Gefunkel. */
  function seeded(seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /**
   * Zeichnet das Paar-Sternbild. Die Animation (Sterne ploppen auf, Linien
   * ziehen sich) steuert CSS über .card.is-in — hier nur Geometrie + Delays.
   */
  function constellation(container, { form, seed, aColor = '#5fc6da', bColor = '#ef7d9c', aLabel = 'A', bLabel = 'B' }) {
    const shape = SHAPES[form] || SHAPES.herz;
    const W = 320, H = 228;
    const rnd = seeded(seed);
    const map = ([px, py]) => [60 + px * 2 + (rnd() - 0.5) * 5, 14 + py * 2 + (rnd() - 0.5) * 5];
    const pts = shape.p.map(map);

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', class: 'cst-svg', 'aria-label': 'Sternbild des Tages' });

    // Hintergrund-Gefunkel
    for (let i = 0; i < 46; i++) {
      svg.appendChild(el('circle', {
        cx: (rnd() * W).toFixed(1), cy: (rnd() * H).toFixed(1), r: (0.35 + rnd() * 0.8).toFixed(2),
        fill: rnd() < 0.2 ? GOLD_SOFT : INK2, opacity: (0.18 + rnd() * 0.4).toFixed(2),
        class: 'cst-bg', style: `--tw:${(2 + rnd() * 4).toFixed(1)}s;--td:${(-rnd() * 5).toFixed(1)}s`,
      }));
    }

    // Doppelstern: zwei Sterne gehören euch
    const ia = Math.floor(rnd() * pts.length);
    let ib = Math.floor(rnd() * pts.length);
    if (ib === ia) ib = (ia + Math.max(1, Math.floor(pts.length / 2))) % pts.length;

    // Linien (in Zeichenreihenfolge, jede mit eigenem Delay)
    let seg = 0;
    const lineStart = 260 + pts.length * 70;
    for (const poly of shape.l) {
      for (let i = 0; i < poly.length - 1; i++) {
        const [x1, y1] = pts[poly[i]];
        const [x2, y2] = pts[poly[i + 1]];
        svg.appendChild(el('line', {
          x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1),
          stroke: GOLD_SOFT, 'stroke-opacity': 0.55, 'stroke-width': 1.3, 'stroke-linecap': 'round',
          pathLength: 1, class: 'cst-line', style: `--d:${lineStart + seg * 150}ms`,
        }));
        seg++;
      }
    }

    // Sterne: Glow + Kern
    pts.forEach(([x, y], i) => {
      const special = i === ia ? aColor : (i === ib ? bColor : null);
      const rCore = special ? 3.6 : 1.7 + rnd() * 1.4;
      const g = el('g', { class: 'cst-star', style: `--d:${120 + i * 70}ms` });
      g.appendChild(el('circle', {
        cx: x.toFixed(1), cy: y.toFixed(1), r: (rCore * 3.4).toFixed(1),
        fill: special || '#efeafd', opacity: special ? 0.22 : 0.1, class: 'cst-glow',
        style: `--tw:${(2.4 + rnd() * 2.6).toFixed(1)}s`,
      }));
      g.appendChild(el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: rCore.toFixed(1), fill: special || '#f6f1ff' }));
      if (special) {
        const label = i === ia ? aLabel : bLabel;
        g.appendChild(text(label, {
          x: (x + (x > 250 ? -9 : 9)).toFixed(1), y: (y - 7).toFixed(1),
          fill: special, 'font-size': 9.5, 'text-anchor': x > 250 ? 'end' : 'start',
          'font-family': 'ui-monospace, Menlo, monospace', 'letter-spacing': '0.06em',
        }));
      }
      svg.appendChild(g);
    });

    container.replaceChildren(svg);
  }

  return { radar, energy, orbit, constellation };
})();
