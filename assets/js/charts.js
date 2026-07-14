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
      'stroke-linejoin': 'round',
    }));

    // Vertex-Punkte + Wert + Titel-Tooltip
    values.forEach((v, i) => {
      const [x, y] = valPts[i];
      const dot = el('circle', { cx: x, cy: y, r: 4.5, fill: color, stroke: '#151030', 'stroke-width': 2 });
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
        fill: s.color, 'fill-opacity': 0.10,
      }));
      svg.appendChild(el('path', {
        d: line, fill: 'none', stroke: s.color, 'stroke-width': 2,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round',
      }));

      if (s.peak) {
        const slot = timeToSlot(s.peak);
        svg.appendChild(el('circle', {
          cx: x(slot), cy: y(s.points[slot]), r: 4.5,
          fill: s.color, stroke: '#151030', 'stroke-width': 2,
        }));
        svg.appendChild(text(`▲ ${s.peak}`, {
          x: Math.min(W - R - 4, Math.max(L + 4, x(slot))),
          y: Math.max(11, y(s.points[slot]) - 10),
          fill: INK2, 'font-size': 10, 'text-anchor': 'middle',
          'font-family': 'ui-monospace, Menlo, monospace',
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

  function orbit(container, { pct, aColor = '#5fc6da', bColor = '#ef7d9c', aGlyph = '✶', bGlyph = '✶' }) {
    const W = 300, H = 216, cx = 150, cy = 108;
    const r = 34 + (100 - pct) * 0.72;          // hohe Kompatibilität = enger Orbit
    const speed = 0.22 + (pct / 100) * 0.55;    // ... und schnellere Umlaufbahn
    const squash = 0.62;

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Orbit-Duett, Kompatibilität ${pct} Prozent` });

    const defs = el('defs');
    for (const [id, color] of [['gA', aColor], ['gB', bColor]]) {
      const grad = el('radialGradient', { id });
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#ffffff' }));
      grad.appendChild(el('stop', { offset: '38%', 'stop-color': color }));
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }));
      defs.appendChild(grad);
    }
    svg.appendChild(defs);

    // Hintergrund-Sterne
    const seeds = [[36, 30], [262, 44], [58, 178], [238, 168], [150, 22], [284, 108], [18, 96]];
    for (const [sx, sy] of seeds) {
      svg.appendChild(el('circle', { cx: sx, cy: sy, r: 1.1, fill: INK3, opacity: 0.7 }));
    }

    // Umlaufbahn
    svg.appendChild(el('ellipse', {
      cx, cy, rx: r, ry: r * squash, fill: 'none',
      stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 5',
    }));

    // Baryzentrum
    svg.appendChild(el('circle', { cx, cy, r: 2.4, fill: GOLD_SOFT }));

    // Körper: Glow (Gradient, groß) + Kern + Zeichen-Glyphe
    const glowA = el('circle', { r: 22, fill: 'url(#gA)', opacity: 0.85 });
    const glowB = el('circle', { r: 20, fill: 'url(#gB)', opacity: 0.85 });
    const bodyA = el('circle', { r: 8, fill: aColor });
    const bodyB = el('circle', { r: 7, fill: bColor });
    const glyphA = text(aGlyph, { 'font-size': 11, fill: '#08222a', 'text-anchor': 'middle' });
    const glyphB = text(bGlyph, { 'font-size': 10, fill: '#2c0d18', 'text-anchor': 'middle' });
    svg.append(glowA, glowB, bodyA, bodyB, glyphA, glyphB);

    let angle = 0.65;
    const place = () => {
      const pos = (a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash];
      const [ax, ay] = pos(angle);
      const [bx, by] = pos(angle + Math.PI);
      for (const [node, px, py] of [[glowA, ax, ay], [bodyA, ax, ay], [glowB, bx, by], [bodyB, bx, by]]) {
        node.setAttribute('cx', px);
        node.setAttribute('cy', py);
      }
      glyphA.setAttribute('x', ax); glyphA.setAttribute('y', ay + 3.6);
      glyphB.setAttribute('x', bx); glyphB.setAttribute('y', by + 3.2);
    };
    place();

    let raf = null;
    let last = null;
    if (!reducedMotion()) {
      const tick = (ts) => {
        if (last !== null) {
          angle += speed * ((ts - last) / 1000);
          place();
        }
        last = ts;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    container.replaceChildren(svg);
    return { destroy: () => { if (raf) cancelAnimationFrame(raf); } };
  }

  return { radar, energy, orbit };
})();
