/* ============================================================
   SFReport — der amtliche Tagesbericht als PDF, im Look der App.
   Baut auf SFPdf (Writer) und SFCharts (Original-SVGs) auf:
   Hintergrund-Nebel & Emojis rastert ein Canvas, die Charts
   werden 1:1 aus den App-SVGs gerastert — der Bericht sieht
   aus wie die Website, nur auf A4 gebannt.

   Aufbau: Cover (Großwetterlage) → Teil 1 Gemeinsam →
   Teil 2 Person Eins → Teil 3 Person Zwei. Alle Inhalte des
   Tages, drei Ansichten, ein Dokument.
   ============================================================ */
'use strict';

const SFReport = (() => {
  // ------------------------------------------------ Konstanten & Farben

  const W = 595.28;
  const H = 841.89;
  const M = 40;            // Seitenrand
  const MT = 36;           // oberer Startpunkt
  const BOT = 46;          // Fußzone (Footer + Luft)
  const GUT = 10;          // Grid-Gutter (12 Spalten wie die Website)
  const PADX = 13;         // Karten-Innenabstand
  const PADT = 11;
  const PADB = 12;

  const INK = '#efeafd';
  const INK2 = '#b3a9d6';
  const INK3 = '#7d739f';
  const GOLD = '#b37e27';
  const GOLD_SOFT = '#e2b45f';
  const PA = '#2596ac';
  const PA_SOFT = '#5fc6da';
  const PB = '#c74468';
  const PB_SOFT = '#ef7d9c';
  const BAD = '#e66767';
  const WARN = '#c98500';
  const CARD_BG = '#1a1433';
  const WHITE = '#ffffff';

  const de = (n) => String(n).replace('.', ',');
  const tglyph = (g) => g + '︎'; // Tierkreis als Textglyphe erzwingen

  // ------------------------------------------------------- Zufall (Sterne)

  function rng(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    let s = h || 88675123;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  // ------------------------------------------------------- Emoji-Raster

  const SEG = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter('de', { granularity: 'grapheme' }) : null;
  const graphemes = (s) => (SEG ? [...SEG.segment(s)].map((x) => x.segment) : [...s]);
  const EMO = /\p{Extended_Pictographic}/u;

  /**
   * Rastert ein Emoji (oder eine Textglyphe wie ♌︎ — die erbt die Farbe)
   * über Canvas und bettet es als PDF-Bild ein. Gecacht pro (Sequenz, Farbe).
   */
  function emo(B, seq, color) {
    const key = seq + '|' + color;
    let em = B.cache.get(key);
    if (em) return em;

    const px = 64;
    const pad = 5;
    const c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    const font = `${px}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.font = font;
    const m = ctx.measureText(seq);
    const left = Math.ceil(Math.max(0, m.actualBoundingBoxLeft ?? 0));
    const right = Math.ceil(m.actualBoundingBoxRight ?? m.width) || px;
    const asc = Math.ceil(m.actualBoundingBoxAscent ?? px * 0.85) || px;
    const desc = Math.ceil(m.actualBoundingBoxDescent ?? px * 0.25);

    c.width = left + right + pad * 2;
    c.height = asc + desc + pad * 2;
    ctx = c.getContext('2d');
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(seq, left + pad, asc + pad);

    const id = ctx.getImageData(0, 0, c.width, c.height);
    em = {
      ref: B.doc.addImage({ width: c.width, height: c.height, rgba: id.data }),
      px, w: c.width, h: c.height, asc: asc + pad, pl: left + pad,
      adv: (m.width || px) / px,
    };
    B.cache.set(key, em);
    return em;
  }

  // ------------------------------------------------------- Text-Engine

  /**
   * Bricht einen String in Zeilen um; Emojis werden als Bild-Runs
   * mitgeführt, nicht WinAnsi-fähige Zeichen fallen still weg.
   */
  function layoutText(B, str, o) {
    const font = o.font || 'H';
    const size = o.size || 9.5;
    const lh = o.lh || 1.5;
    const tracking = o.tracking || 0;
    const color = o.color || INK2;
    const maxW = o.maxW ?? 1e9;

    let s = String(str).normalize('NFC');
    if (o.upper) s = s.toUpperCase();

    const spaceW = SFPdf.measure(' ', font, size) + tracking;
    const words = [];
    for (const raw of s.split(/\s+/)) {
      if (!raw) continue;
      const runs = [];
      let txt = '';
      const flush = () => {
        if (txt) {
          runs.push({ t: txt, w: SFPdf.measure(txt, font, size, tracking) });
          txt = '';
        }
      };
      for (const g of graphemes(raw)) {
        if (EMO.test(g)) {
          flush();
          const em = emo(B, g, color);
          runs.push({ em, w: size * em.adv + size * 0.08 });
        } else if ([...g].every(SFPdf.canEncode)) {
          txt += g;
        }
      }
      flush();
      if (runs.length) words.push({ runs, w: runs.reduce((a, r) => a + r.w, 0) });
    }

    const lines = [];
    let cur = [];
    let curW = 0;
    for (const wd of words) {
      if (cur.length && curW + spaceW + wd.w > maxW + 0.4) {
        lines.push({ words: cur, w: curW });
        cur = [];
        curW = 0;
      }
      if (cur.length) curW += spaceW;
      cur.push(wd);
      curW += wd.w;
    }
    if (cur.length) lines.push({ words: cur, w: curW });

    return {
      lines, spaceW, font, size, lh, tracking, color,
      h: lines.length ? (lines.length - 1) * size * lh + size * 1.16 : 0,
    };
  }

  function drawText(B, page, L, x, y, o = {}) {
    let by = y + L.size * 0.83;
    for (const line of L.lines) {
      let lx = x;
      if (o.align === 'center') lx = x + ((o.width ?? 0) - line.w) / 2;
      else if (o.align === 'right') lx = x + (o.width ?? 0) - line.w;
      for (let i = 0; i < line.words.length; i++) {
        if (i) lx += L.spaceW;
        for (const r of line.words[i].runs) {
          if (r.t !== undefined) {
            page.text(r.t, lx, by, {
              font: L.font, size: L.size, color: L.color,
              tracking: L.tracking, opacity: o.opacity,
            });
          } else {
            const em = r.em;
            const s = L.size;
            page.image(em.ref, lx - s * (em.pl / em.px) + s * 0.04, by - s * (em.asc / em.px),
              s * (em.w / em.px), s * (em.h / em.px), { opacity: o.opacity });
          }
          lx += r.w;
        }
      }
      by += L.size * L.lh;
    }
  }

  /** Absatz messen (page = null) oder zeichnen. Liefert die Höhe. */
  function para(B, page, str, x, y, w, o = {}) {
    const L = layoutText(B, str, { ...o, maxW: w });
    if (page) drawText(B, page, L, x, y, { align: o.align, width: w, opacity: o.opacity });
    return L.h;
  }

  // ------------------------------------------------------- Raster: Deko

  function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /** Accent-Verlaufsstreifen (transparent → Farbe → transparent). */
  function strip(B, color) {
    let s = B.strips.get(color);
    if (s) return s;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 3;
    const ctx = c.getContext('2d');
    const [r, g, b] = hexRgb(color);
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 3);
    const id = ctx.getImageData(0, 0, 256, 3);
    s = { ref: B.doc.addImage({ width: 256, height: 3, rgba: id.data }) };
    B.strips.set(color, s);
    return s;
  }

  /** Nachthimmel wie styles.css: Grundverlauf + drei Nebel (Saison/Feiertag). */
  function makeBg(B, season, holiday) {
    const c = document.createElement('canvas');
    c.width = Math.round(W);
    c.height = Math.round(H);
    const ctx = c.getContext('2d');

    const lin = ctx.createLinearGradient(0, 0, 0, c.height);
    lin.addColorStop(0, '#0b0820');
    lin.addColorStop(0.6, '#171034');
    lin.addColorStop(1, '#120d2c');
    ctx.fillStyle = lin;
    ctx.fillRect(0, 0, c.width, c.height);

    let n1 = [123, 91, 214, 0.22];
    let n2 = [37, 150, 172, 0.14];
    let n3 = [199, 68, 104, 0.13];
    const SEASON = {
      fruehling: { n2: [105, 190, 130, 0.13] },
      sommer: { n3: [226, 160, 80, 0.15] },
      herbst: { n1: [200, 140, 60, 0.18] },
      winter: { n2: [120, 170, 220, 0.15] },
    };
    const HOLIDAY = {
      xmas: { n1: [190, 60, 70, 0.16], n2: [80, 160, 110, 0.14] },
      silvester: { n1: [212, 175, 55, 0.18] },
      valentin: { n3: [230, 100, 140, 0.19] },
      halloween: { n1: [230, 130, 40, 0.20], n2: [110, 70, 160, 0.16] },
      ostern: { n2: [150, 200, 120, 0.14], n3: [220, 170, 90, 0.13] },
    };
    const ov = { ...(SEASON[season] || {}), ...(HOLIDAY[holiday] || {}) };
    if (ov.n1) n1 = ov.n1;
    if (ov.n2) n2 = ov.n2;
    if (ov.n3) n3 = ov.n3;

    const f = c.width / 1080;
    for (const [nw, nh, fx, fy, col] of [
      [1100, 700, 0.85, -0.10, n1],
      [900, 600, -0.10, 0.30, n2],
      [800, 700, 0.70, 1.10, n3],
    ]) {
      const rx = nw * f * 1.35;
      const ry = nh * f * 1.35;
      const cx = fx * c.width;
      const cy = fy * c.height;
      const sc = ry / rx;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, sc);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${col[3]})`);
      g.addColorStop(0.62, `rgba(${col[0]},${col[1]},${col[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-cx - rx, -cy / sc - ry, c.width + 2 * rx, c.height / sc + 2 * ry);
      ctx.restore();
    }

    const id = ctx.getImageData(0, 0, c.width, c.height);
    return B.doc.addImage({ width: c.width, height: c.height, rgba: id.data });
  }

  // ------------------------------------------------------- Chart-Raster

  /** Rastert ein SFCharts-SVG hochauflösend und bettet es als Bild ein. */
  async function rasterSvg(B, svg, scale) {
    const vb = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    const vw = vb[2];
    const vh = vb[3];
    const clone = svg.cloneNode(true);
    clone.setAttribute('width', String(Math.round(vw * scale)));
    clone.setAttribute('height', String(Math.round(vh * scale)));
    clone.setAttribute('style',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;');
    const xml = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = Math.round(vw * scale);
      c.height = Math.round(vh * scale);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const id = ctx.getImageData(0, 0, c.width, c.height);
      return { ref: B.doc.addImage({ width: c.width, height: c.height, rgba: id.data }), w: vw, h: vh };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function makeCharts(B, day) {
    const host = document.createElement('div');
    const grab = async (scale) => {
      const svg = host.querySelector('svg');
      const im = await rasterSvg(B, svg, scale);
      host.replaceChildren();
      return im;
    };

    for (const key of ['a', 'b']) {
      const P = day[key];
      const col = key === 'a' ? PA : PB;
      SFCharts.radar(host, {
        labels: [...P.categories.map((c) => c.title.split(' ')[0]), 'Gesamt'],
        values: [...P.categories.map((c) => c.score), P.stars * 20],
        color: col,
      });
      B.charts['radar_' + key] = await grab(3);
      SFCharts.energy(host, {
        series: [{ name: P.name, color: col, points: P.energie.points, peak: P.energie.peakZeit }],
      });
      B.charts['energy_' + key] = await grab(2.2);
    }

    SFCharts.energy(host, {
      series: [
        { name: day.a.name, color: PA, points: day.a.energie.points, peak: day.a.energie.peakZeit },
        { name: day.b.name, color: PB, points: day.b.energie.points, peak: day.b.energie.peakZeit },
      ],
      window: day.couple.fenster,
    });
    B.charts.energy_c = await grab(2.2);

    const ctrl = SFCharts.orbit(host, {
      pct: day.couple.kompatibilitaet.pct,
      aColor: PA_SOFT, bColor: PB_SOFT,
      aGlyph: tglyph(day.a.glyph), bGlyph: tglyph(day.b.glyph),
    });
    ctrl.destroy();
    B.charts.orbit = await grab(3);

    // 2.0: Sternbild des Tages (ältere Tage ohne Sektion → kein Bild)
    if (day.sternbild) {
      SFCharts.constellation(host, {
        form: day.sternbild.form, seed: day.sternbild.seed,
        aColor: PA_SOFT, bColor: PB_SOFT,
        aLabel: day.a.name.slice(0, 1).toUpperCase(),
        bLabel: day.b.name.slice(0, 1).toUpperCase(),
      });
      B.charts.sternbild = await grab(3);
    }
  }

  // ------------------------------------------------------- Bausteine

  function star5(page, cx, cy, R, color, o = {}) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? R * 0.45 : R;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    page.poly(pts, { fill: color, opacity: o.opacity });
  }

  function diamond(page, cx, cy, r, color) {
    page.poly([[cx, cy - r], [cx + r * 0.55, cy], [cx, cy + r], [cx - r * 0.55, cy]], { fill: color });
  }

  function dashed(page, x1, y, x2) {
    page.line(x1, y, x2, y, { stroke: WHITE, strokeOpacity: 0.09, lineWidth: 0.7, dash: [2, 3] });
  }

  /** Eyebrow im Website-Stil: Mono, Uppercase, Accent + Linie (bricht um). */
  function eyebrow(B, page, x, y, w, text, color) {
    const L = layoutText(B, text, { font: 'CB', size: 6.8, lh: 1.45, tracking: 1.05, upper: true, color, maxW: w });
    if (page) {
      drawText(B, page, L, x, y, {});
      const last = L.lines[L.lines.length - 1];
      const tw = last ? last.w : 0;
      const ly = y + 3.6 + (L.lines.length - 1) * 6.8 * 1.45;
      if (tw + 10 < w) {
        page.line(x + tw + 8, ly, x + w, ly, { stroke: WHITE, strokeOpacity: 0.09, lineWidth: 0.7 });
      }
    }
    return Math.max(16, L.h + 7);
  }

  function meter(B, page, x, y, w, label, valStr, pct, fillColor) {
    if (page) {
      para(B, page, label, x, y, w - 40, { font: 'H', size: 8.6, color: INK2 });
      page.text(valStr, x + w, y + 7.6, { font: 'CB', size: 8.6, color: INK, align: 'right' });
    }
    const ty = y + 13.5;
    if (page) {
      page.rect(x, ty, w, 6.5, { fill: WHITE, opacity: 0.07, radius: 3.25 });
      page.rect(x, ty, Math.max(4, (w * Math.min(100, pct)) / 100), 6.5, { fill: fillColor, radius: 3.25 });
    }
    return 26;
  }

  function legend(B, page, x, y, items) {
    let lx = x;
    for (const it of items) {
      if (page) {
        page.rect(lx, y + 2.2, 6.5, 6.5, { fill: it.color, radius: 2 });
        page.text(it.name, lx + 10.5, y + 8.2, { font: 'H', size: 8, color: INK2 });
      }
      lx += 10.5 + SFPdf.measure(it.name, 'H', 8) + 15;
    }
    return 14;
  }

  function pill(B, page, x, y, text) {
    const w = SFPdf.measure(text.toUpperCase(), 'C', 6.6, 0.7) + 14;
    if (page) {
      page.rect(x, y, w, 13, { stroke: WHITE, strokeOpacity: 0.14, lineWidth: 0.7, radius: 6.5 });
      page.text(text.toUpperCase(), x + 7, y + 9, { font: 'C', size: 6.6, color: INK2, tracking: 0.7 });
    }
    return w;
  }

  function battleRow(B, page, x, y, w, row, aName, bName) {
    if (page) {
      const L = layoutText(B, row.label, { font: 'C', size: 6.4, tracking: 0.9, upper: true, color: INK3, maxW: 1e9 });
      drawText(B, page, L, x + (w - (L.lines[0]?.w || 0)) / 2, y, {});

      const aWin = row.a > row.b + 4;
      const bWin = row.b > row.a + 4;
      const by = y + 13;
      const valW = 20;
      const vsW = 16;
      const gap = 5;
      const trackW = (w - vsW - 2 * valW - 4 * gap) / 2;
      const tAx = x + valW + gap;
      const tBx = x + valW + gap + trackW + gap + vsW + gap;

      // Person Eins: Wert links, Balken wächst zur Mitte
      page.text(String(row.a), x + valW, by + 6.6, { font: 'CB', size: 8, color: INK, align: 'right' });
      if (aWin) star5(page, x + 4, by + 3.6, 3.2, GOLD_SOFT);
      page.rect(tAx, by, trackW, 6.5, { fill: WHITE, opacity: 0.07, radius: 3.25 });
      const aw = Math.max(3, (trackW * row.a) / 100);
      page.rect(tAx + trackW - aw, by, aw, 6.5, { fill: PA, radius: 3.25 });

      page.text('vs', x + valW + gap + trackW + gap + vsW / 2, by + 6.4,
        { font: 'C', size: 6.4, color: INK3, align: 'center' });

      page.rect(tBx, by, trackW, 6.5, { fill: WHITE, opacity: 0.07, radius: 3.25 });
      page.rect(tBx, by, Math.max(3, (trackW * row.b) / 100), 6.5, { fill: PB, radius: 3.25 });
      page.text(String(row.b), x + w - valW, by + 6.6, { font: 'CB', size: 8, color: INK });
      if (bWin) star5(page, x + w - 4, by + 3.6, 3.2, GOLD_SOFT);
    }
    return 27;
  }

  /** Chip/Zelle mit Kopf, optionaler Mono-Zeile und Fließtext. */
  function chipBox(B, page, x, y, w, h, d) {
    const pi = 9;
    if (page) {
      page.rect(x, y, w, h, {
        fill: WHITE, opacity: 0.045, radius: 9,
        stroke: WHITE, strokeOpacity: 0.09, lineWidth: 0.7,
      });
    }
    let yy = y + pi;
    yy += para(B, page, d.head, x + pi, yy, w - 2 * pi, { font: 'HB', size: 8.6, color: INK, lh: 1.35 });
    if (d.mono) {
      yy += 2.5;
      yy += para(B, page, d.mono, x + pi, yy, w - 2 * pi, { font: 'C', size: 7.2, color: INK2, lh: 1.35 });
    }
    if (d.text) {
      yy += 3;
      yy += para(B, page, d.text, x + pi, yy, w - 2 * pi, { font: 'H', size: 7.6, color: INK3, lh: 1.42 });
    }
    return yy - y + pi;
  }

  // ------------------------------------------------------- Seiten-Gerüst

  function newPage(B) {
    B.page = B.doc.addPage();
    B.pageIdx++;
    B.y = MT;
    B.page.image(B.bgRef, 0, 0, W, H);
    const r = rng(B.day.date + '#' + B.pageIdx);
    for (let i = 0; i < 85; i++) {
      B.page.circle(r() * W, r() * H, 0.25 + r() * 0.7, { fill: INK, opacity: 0.1 + r() * 0.4 });
    }
    for (let i = 0; i < 3; i++) {
      const x = r() * (W - 60) + 30;
      const y = r() * (H - 60) + 30;
      B.page.line(x - 4, y, x + 4, y, { stroke: INK, strokeOpacity: 0.35, lineWidth: 0.4 });
      B.page.line(x, y - 4, x, y + 4, { stroke: INK, strokeOpacity: 0.35, lineWidth: 0.4 });
      B.page.circle(x, y, 0.8, { fill: INK, opacity: 0.5 });
    }
  }

  function chrome(B, page, x, y, w, h, accent) {
    page.rect(x, y, w, h, {
      fill: CARD_BG, opacity: 0.72, radius: 12,
      stroke: WHITE, strokeOpacity: 0.09, lineWidth: 0.8,
    });
    page.image(strip(B, accent).ref, x + 8, y, w - 16, 1.6, { opacity: 0.85 });
  }

  /**
   * 12-Spalten-Fluss wie das Website-Grid: Karten füllen Rows,
   * Rows brechen bei Bedarf auf die nächste Seite um.
   */
  function flow(B, cards) {
    const CW = W - 2 * M;
    let i = 0;
    while (i < cards.length) {
      const row = [];
      let span = 0;
      while (i < cards.length && span + cards[i].span <= 12) {
        row.push(cards[i]);
        span += cards[i].span;
        i++;
      }
      const items = row.map((c) => {
        const w = ((CW + GUT) * c.span) / 12 - GUT;
        return { c, w, h: c.body(B, null, 0, 0, w - 2 * PADX) + PADT + PADB };
      });
      const rh = Math.max(...items.map((it) => it.h));
      if (B.y + rh > H - BOT) newPage(B);
      let x = M;
      for (const it of items) {
        chrome(B, B.page, x, B.y, it.w, rh, it.c.accent);
        if (it.c.deco) it.c.deco(B, B.page, x, B.y, it.w, rh);
        it.c.body(B, B.page, x + PADX, B.y + PADT, it.w - 2 * PADX);
        x += it.w + GUT;
      }
      B.y += rh + GUT;
    }
  }

  const card = (span, accent, body, deco) => ({ span, accent, body, deco });

  function section(B, no, glyphSeq, glyphColor, title, sub, accent) {
    newPage(B);
    const p = B.page;
    let y = B.y + 4;
    p.text(`TEIL ${no} · ${sub}`, M, y + 7, { font: 'CB', size: 7, color: accent, tracking: 1.6 });
    y += 10;
    const em = emo(B, glyphSeq, glyphColor);
    const gh = 19;
    const gw = gh * (em.w / em.h);
    p.image(em.ref, M, y + 5, gw, gh);
    p.text(title, M + gw + 8, y + 21, { font: 'TBI', size: 22, color: INK });
    y += 27;
    p.image(strip(B, accent).ref, M, y, W - 2 * M, 1.6, { opacity: 0.9 });
    B.y = y + 8;
  }

  function footers(B, meta) {
    const n = B.doc.pages.length;
    B.doc.pages.forEach((pg, i) => {
      const fy = H - 26;
      pg.line(M, fy - 9, W - M, fy - 9, { stroke: WHITE, strokeOpacity: 0.08, lineWidth: 0.7 });
      pg.text(`Sternenflunk ${meta.version || ''} · Amtlicher Tagesbericht`, M, fy,
        { font: 'C', size: 6, color: INK3 });
      if (meta.disclaimer) {
        pg.text(meta.disclaimer, W / 2, fy, { font: 'HO', size: 6.6, color: INK3, align: 'center' });
      }
      pg.text(`Seite ${i + 1}/${n}`, W - M, fy, { font: 'C', size: 6, color: INK3, align: 'right' });
    });
  }

  // ------------------------------------------------------- Cover

  function tile(B, p, cx, y, person, softColor) {
    const ts = 46;
    p.rect(cx - ts / 2, y, ts, ts, {
      fill: WHITE, opacity: 0.05, radius: 11,
      stroke: WHITE, strokeOpacity: 0.13, lineWidth: 0.8,
    });
    const em = emo(B, tglyph(person.glyph), softColor);
    const gh = 26;
    const gw = gh * (em.w / em.h);
    p.image(em.ref, cx - gw / 2, y + (ts - gh) / 2, gw, gh);
    p.text(person.name, cx, y + ts + 16, { font: 'HB', size: 12.5, color: INK, align: 'center' });
    p.text(`${person.sign} · ${person.element}`.toUpperCase(), cx, y + ts + 28,
      { font: 'C', size: 6, color: INK3, align: 'center', tracking: 1 });
  }

  function cover(B, day, meta) {
    newPage(B);
    const p = B.page;
    let y = 96;

    star5(p, W / 2 - 26, y, 5, GOLD_SOFT);
    diamond(p, W / 2, y - 1, 6.5, GOLD_SOFT);
    star5(p, W / 2 + 26, y, 5, GOLD_SOFT);
    y += 19;

    p.text('Sternenflunk', W / 2, y + 30, { font: 'TBI', size: 36, color: INK, align: 'center' });
    y += 45;
    p.text('TÄGLICH FRISCH GEFLUNKERT · EMOTIONAL TREFFSICHER', W / 2, y + 6,
      { font: 'CB', size: 6.2, color: INK3, align: 'center', tracking: 1.4 });
    y += 32;

    p.line(W / 2 - 92, y, W / 2 - 13, y, { stroke: GOLD, strokeOpacity: 0.55, lineWidth: 0.7 });
    p.line(W / 2 + 13, y, W / 2 + 92, y, { stroke: GOLD, strokeOpacity: 0.55, lineWidth: 0.7 });
    star5(p, W / 2, y, 4.2, GOLD_SOFT);
    y += 36;

    p.text('AMTLICHER TAGESBERICHT', W / 2, y + 8, { font: 'CB', size: 9.5, color: GOLD_SOFT, align: 'center', tracking: 2.4 });
    y += 27;
    p.text(day.displayDate, W / 2, y + 18, { font: 'TB', size: 21, color: INK, align: 'center' });
    y += 48;

    tile(B, p, W / 2 - 110, y, day.a, PA_SOFT);
    p.text('×', W / 2, y + 30, { font: 'TI', size: 19, color: GOLD_SOFT, align: 'center' });
    tile(B, p, W / 2 + 110, y, day.b, PB_SOFT);
    y += 112;

    // Großwetterlage + ggf. Retro-Banner + Specials als Karten
    B.y = y;
    const a = day.astro;
    const cards = [];

    cards.push(card(12, GOLD_SOFT, (B2, pg, x, yy0, w) => {
      let yy = yy0 + eyebrow(B2, pg, x, yy0, w, `Kosmische Großwetterlage · ${day.weekday}`, GOLD_SOFT) + 2;
      const cw = (w - 8) / 2;
      const chips = [
        { head: `${a.moon.emoji} ${a.moon.name}`, mono: `${a.moon.illumination} % beleuchtet`, text: a.moon.text },
        { head: `☀️ Sonne über ${a.sun.location}`, mono: `${a.sun.rise}–${a.sun.set} Uhr · ${a.sun.dayLength}`, text: a.sun.trendText },
        { head: `${tglyph(a.season.glyph)} ${a.season.sign}-Saison`, text: a.season.text },
        { head: `🔢 Tageszahl ${a.numerology.digit}`, text: a.numerology.text },
      ];
      const h1 = Math.max(chipBox(B2, null, 0, 0, cw, 0, chips[0]), chipBox(B2, null, 0, 0, cw, 0, chips[1]));
      if (pg) {
        chipBox(B2, pg, x, yy, cw, h1, chips[0]);
        chipBox(B2, pg, x + cw + 8, yy, cw, h1, chips[1]);
      }
      yy += h1 + 8;
      const h2 = Math.max(chipBox(B2, null, 0, 0, cw, 0, chips[2]), chipBox(B2, null, 0, 0, cw, 0, chips[3]));
      if (pg) {
        chipBox(B2, pg, x, yy, cw, h2, chips[2]);
        chipBox(B2, pg, x + cw + 8, yy, cw, h2, chips[3]);
      }
      yy += h2 + 9;
      yy += para(B2, pg, `🛰️ Beziehungswetter: ${a.weather}`, x, yy, w, { font: 'H', size: 8.6, color: INK2, lh: 1.45 });
      return yy - yy0;
    }));

    if (a.mercury.retro) {
      cards.push(card(12, WARN, (B2, pg, x, yy, w) =>
        para(B2, pg, `⚠️ ${a.mercury.text}`, x, yy, w, { font: 'HB', size: 9.2, color: '#ffd9a0', lh: 1.5 })));
    }
    for (const s of Array.isArray(day.special) ? day.special : []) {
      cards.push(card(12, GOLD_SOFT, (B2, pg, x, yy0, w) => {
        let yy = yy0 + para(B2, pg, `${s.emoji} ${s.title}`, x, yy0, w, { font: 'HB', size: 9.6, color: INK });
        yy += 3;
        yy += para(B2, pg, s.text, x, yy, w, { font: 'H', size: 8.8, color: INK2, lh: 1.45 });
        return yy - yy0;
      }));
    }
    flow(B, cards);

    B.page.text(
      `INHALT · TEIL 1 GEMEINSAM · TEIL 2 ${day.a.name.toUpperCase()} · TEIL 3 ${day.b.name.toUpperCase()}`,
      W / 2, H - 46, { font: 'C', size: 6, color: INK3, align: 'center', tracking: 1 });
  }

  // ------------------------------------------------------- Teil 1: Paar

  function coupleCards(B, day) {
    const c = day.couple;
    const k = c.kompatibilitaet;
    const pa = day.a;
    const pb = day.b;
    const cards = [];

    // Orbit-Duett + Kompatibilität (Text vertikal zentriert neben dem Orbit)
    cards.push(card(12, GOLD_SOFT, (B2, p, x, y, w) => {
      const img = B2.charts.orbit;
      const imgW = Math.min(228, w * 0.42);
      const imgH = (imgW * img.h) / img.w;
      const tx = x + imgW + 14;
      const tw = w - imgW - 14;

      const textBlock = (pp, ty) => {
        let yy = ty;
        yy += eyebrow(B2, pp, tx, yy, tw, 'Paar-Protokoll · Orbit-Duett', GOLD_SOFT) + 1;
        if (k.special === 'jackpot' || k.special === 'chaos') {
          const label = k.special === 'jackpot' ? 'JACKPOT-TAG' : 'KOSMISCHE STÖRUNG';
          const bc = k.special === 'jackpot' ? GOLD : BAD;
          const tc = k.special === 'jackpot' ? GOLD_SOFT : '#f0918f';
          const bw = SFPdf.measure(label, 'CB', 6.6, 0.9) + 26;
          if (pp) {
            pp.rect(tx, yy, bw, 14, { fill: bc, opacity: 0.18, stroke: bc, strokeOpacity: 0.8, lineWidth: 0.8, radius: 7 });
            star5(pp, tx + 10, yy + 7, 3.4, tc);
            pp.text(label, tx + 17, yy + 9.6, { font: 'CB', size: 6.6, color: tc, tracking: 0.9 });
          }
          yy += 20;
        }
        if (pp) {
          const bw = pp.text(de(k.pct), tx, yy + 25, { font: 'HB', size: 30, color: INK });
          pp.text(' %', tx + bw + 2, yy + 25, { font: 'HB', size: 15, color: INK2 });
        }
        yy += 32;
        if (pp) pp.text('KOMPATIBILITÄT HEUTE', tx, yy + 6, { font: 'CB', size: 6.2, color: INK3, tracking: 1.2 });
        yy += 14;
        yy += para(B2, pp, k.text, tx, yy, tw, { font: 'H', size: 9.4, color: INK2, lh: 1.5 });
        return yy - ty;
      };

      const th = textBlock(null, y);
      const rowH = Math.max(th, imgH);
      if (p) {
        textBlock(p, y + Math.max(0, (rowH - th) / 2));
        p.image(img.ref, x - 6, y + (rowH - imgH) / 2, imgW, imgH);
      }
      return rowH;
    }));

    // Klimadaten
    cards.push(card(6, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Klimadaten · Beziehung', GOLD_SOFT) + 2;
      yy += meter(B2, p, x, yy, w, '🫂 Kuschel-Index', `${c.kuschelIndex} %`, c.kuschelIndex, GOLD_SOFT) + 5;
      yy += meter(B2, p, x, yy, w, '🌩️ Streit-Risiko', `${c.streitRisiko} %`, c.streitRisiko, BAD) + 7;
      yy += para(B2, p, `Wahrscheinlichster Auslöser laut Sternen: ${c.streitThema}.`, x, yy, w,
        { font: 'H', size: 8.2, color: INK3, lh: 1.45 });
      return yy - y;
    }));

    // Schiedsspruch
    const rechtName = {
      a: `${pa.name} ${pa.emoji}`,
      b: `${pb.name} ${pb.emoji}`,
      beide: 'Beide 🤝',
      universum: 'Das Universum 🌌',
    }[c.recht.wer] || '—';
    cards.push(card(6, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Schiedsspruch des Tages', GOLD_SOFT) + 1;
      yy += para(B2, p, 'Wer hat heute recht?', x, yy, w, { font: 'TBI', size: 11.5, color: INK }) + 4;
      yy += para(B2, p, rechtName, x, yy, w, { font: 'HB', size: 13.5, color: INK }) + 4;
      yy += para(B2, p, c.recht.text, x, yy, w, { font: 'H', size: 9, color: INK2, lh: 1.5 });
      return yy - y;
    }));

    // Sternbild des Tages (2.0) — wird hinter dem Synchronlauf einsortiert,
    // damit es die Lücke unten auf Seite 2 füllt statt den Chart zu verdrängen.
    const sb = day.sternbild;
    const sternbildCard = !(sb && B.charts.sternbild) ? null
      : card(12, GOLD_SOFT, (B2, p, x, y, w) => {
        const img = B2.charts.sternbild;
        const imgW = Math.min(150, w * 0.3);
        const imgH = (imgW * img.h) / img.w;
        const tx = x + imgW + 16;
        const tw = w - imgW - 16;
        const textBlock = (pp, ty) => {
          let yy = ty;
          yy += eyebrow(B2, pp, tx, yy, tw, 'Sternwarte · Euer Sternbild des Tages', GOLD_SOFT) + 1;
          yy += para(B2, pp, sb.name, tx, yy, tw, { font: 'TBI', size: 13, color: INK }) + 4;
          yy += para(B2, pp, sb.text, tx, yy, tw, { font: 'H', size: 9, color: INK2, lh: 1.5 }) + 5;
          yy += para(B2, pp,
            `Helligkeit ${de(Number(sb.helligkeit).toFixed(1))} mag · Entfernung ${sb.entfernung} Lichtjahre · sichtbar ab ${sb.sichtbarAb} Uhr`,
            tx, yy, tw, { font: 'H', size: 7.8, color: INK3, lh: 1.45 });
          return yy - ty;
        };
        const th = textBlock(null, y);
        const rowH = Math.max(th, imgH);
        if (p) {
          textBlock(p, y + Math.max(0, (rowH - th) / 2));
          p.image(img.ref, x, y + (rowH - imgH) / 2, imgW, imgH);
        }
        return rowH;
      });

    // Synchronlauf
    cards.push(card(12, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Synchronlauf · Beide Kurven', GOLD_SOFT) + 2;
      yy += legend(B2, p, x, yy, [{ name: pa.name, color: PA }, { name: pb.name, color: PB }]) + 2;
      const img = B2.charts.energy_c;
      const ih = (w * img.h) / img.w;
      if (p) p.image(img.ref, x, yy, w, ih);
      yy += ih + 6;
      yy += para(B2, p,
        `Gemeinsames Energiefenster: ${c.fenster.von}–${c.fenster.bis} Uhr — ${c.fenster.text}`,
        x, yy, w, { font: 'H', size: 8.5, color: INK2, lh: 1.45 });
      return yy - y;
    }));

    if (sternbildCard) cards.push(sternbildCard);

    // Duell des Tages
    const duell = c.battle.reduce((best, row) =>
      (Math.abs(row.a - row.b) > Math.abs(best.a - best.b) ? row : best), c.battle[0]);
    cards.push(card(6, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Duell des Tages', GOLD_SOFT) + 2;
      yy += legend(B2, p, x, yy, [{ name: pa.name, color: PA }, { name: pb.name, color: PB }]) + 3;
      for (let i = 0; i < c.battle.length; i++) {
        yy += battleRow(B2, p, x, yy, w, c.battle[i]);
        if (i < c.battle.length - 1) {
          if (p) dashed(p, x, yy + 1, x + w);
          yy += 6;
        }
      }
      yy += 5;
      yy += para(B2, p, duell.kommentar, x, yy, w, { font: 'H', size: 8.2, color: INK3, lh: 1.45 });
      return yy - y;
    }));

    // Flaggen-Bericht
    cards.push(card(6, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Flaggen-Bericht', GOLD_SOFT) + 2;
      yy += para(B2, p, '🚩', x, yy, w, { size: 11.5 }) + 3;
      yy += para(B2, p, c.redFlag, x, yy, w, { font: 'H', size: 9.2, color: INK, lh: 1.5 }) + 8;
      if (p) dashed(p, x, yy, x + w);
      yy += 8;
      yy += para(B2, p, '💚', x, yy, w, { size: 11.5 }) + 3;
      yy += para(B2, p, c.greenFlag, x, yy, w, { font: 'H', size: 9.2, color: INK, lh: 1.5 });
      return yy - y;
    }));

    // Direktiven
    const mini = (title, text) => card(4, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, title, GOLD_SOFT) + 2;
      yy += para(B2, p, text, x, yy, w, { font: 'H', size: 8.8, color: INK, lh: 1.5 });
      return yy - y;
    });
    cards.push(mini('Date-Direktive', `💡 ${c.dateIdee}`));
    cards.push(mini('Gesprächsstoff', `💬 ${c.gespraech}`));
    cards.push(mini('Paar-Mission', `🎯 ${c.mission}`));

    // Elementar-Funk + Klugscheißer-Fakt
    cards.push(card(6, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, `Elementar-Funk · ${c.elementarFunk.kombi}`, GOLD_SOFT) + 2;
      yy += para(B2, p, `⚗️ ${c.elementarFunk.text}`, x, yy, w, { font: 'H', size: 9, color: INK, lh: 1.5 });
      return yy - y;
    }));
    cards.push(card(6, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Klugscheißer-Fakt · echt wahr', GOLD_SOFT) + 2;
      yy += para(B2, p, `🔭 ${day.astro.fact}`, x, yy, w, { font: 'H', size: 9, color: INK, lh: 1.5 });
      return yy - y;
    }));

    // Prophezeiung
    cards.push(card(12, GOLD_SOFT, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Prophezeiung', GOLD_SOFT) + 3;
      if (p) star5(p, x + 5, yy + 6, 4.2, GOLD_SOFT);
      yy += para(B2, p, c.prophezeiung, x + 15, yy, w - 15, { font: 'TI', size: 12.5, color: INK, lh: 1.55 });
      return yy - y + 2;
    }));

    return cards;
  }

  // ------------------------------------------------- Teil 2/3: Personen

  function personCards(B, P, accent, accentSoft) {
    const cards = [];

    // Hero: Motto + Sterne (+ Wasserzeichen-Emoji über die ganze Karte)
    cards.push(card(8, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, `Tagesprotokoll · ${tglyph(P.glyph)} ${P.sign}`, accentSoft) + 3;
      yy += para(B2, p, `„${P.motto}“`, x, yy, w, { font: 'TI', size: 14.5, color: INK, lh: 1.4 }) + 9;
      if (p) {
        for (let i = 0; i < 5; i++) {
          star5(p, x + 8 + i * 17, yy + 6.5, 7, GOLD_SOFT, { opacity: i < P.stars ? 1 : 0.22 });
        }
        pill(B2, p, x + 5 * 17 + 8, yy, `${P.stars}/5 · ${P.starsLabel}`);
      }
      yy += 18;
      return yy - y;
    }, (B2, p, cx, cy, cw, ch) => {
      const em = emo(B2, P.emoji, INK);
      const eh = 58;
      const ew = eh * (em.w / em.h);
      p.image(em.ref, cx + cw - ew - 8, cy + ch - eh - 4, ew, eh, { opacity: 0.08 });
    }));

    // Laborwerte · Glück
    const g = P.glueck;
    cards.push(card(4, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Laborwerte · Glück', accentSoft) + 2;
      const cw = (w - 7) / 2;
      const cell = (cx, cy, chH, drawFn, label) => {
        if (p) {
          p.rect(cx, cy, cw, chH, {
            fill: WHITE, opacity: 0.045, radius: 8,
            stroke: WHITE, strokeOpacity: 0.09, lineWidth: 0.7,
          });
          drawFn();
          p.text(label, cx + cw / 2, cy + chH - 6, { font: 'C', size: 5.2, color: INK3, align: 'center', tracking: 0.8 });
        }
      };
      const h1 = 41;
      cell(x, yy, h1, () => {
        p.text(String(g.zahl), x + cw / 2, yy + 22, { font: 'HB', size: 16.5, color: INK, align: 'center' });
      }, 'GLÜCKSZAHL');
      cell(x + cw + 7, yy, h1, () => {
        const em = emo(B2, g.emoji, INK);
        const eh = 16;
        const ew = eh * (em.w / em.h);
        p.image(em.ref, x + cw + 7 + (cw - ew) / 2, yy + 7, ew, eh);
      }, 'GLÜCKS-EMOJI');
      yy += h1 + 6;
      const h2 = 47;
      cell(x, yy, h2, () => {
        p.circle(x + cw / 2, yy + 13.5, 6.5, { fill: g.farbe.hex, stroke: WHITE, strokeOpacity: 0.35, lineWidth: 1.2 });
        para(B2, p, g.farbe.name, x + 3, yy + 23, cw - 6, { font: 'H', size: 6.8, color: INK, align: 'center', lh: 1.25 });
      }, 'GLÜCKSFARBE');
      cell(x + cw + 7, yy, h2, () => {
        para(B2, p, g.fenster, x + cw + 10, yy + 13, cw - 6, { font: 'CB', size: 7.2, color: INK, align: 'center', lh: 1.4 });
      }, 'GLÜCKSFENSTER');
      yy += h2 + 7;
      yy += para(B2, p, `Heute Glück bringt: ${g.item}.`, x, yy, w, { font: 'H', size: 7.9, color: INK2, lh: 1.42 });
      return yy - y;
    }));

    // Radar
    cards.push(card(5, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Messwerte · Radar', accentSoft) + 1;
      yy += para(B2, p, 'Die Tageswerte', x, yy, w, { font: 'TBI', size: 11.5, color: INK }) + 4;
      const img = B2.charts['radar_' + P.slot];
      const ih = (w * img.h) / img.w;
      if (p) p.image(img.ref, x, yy, w, ih);
      yy += ih;
      return yy - y;
    }));

    // Einzelauswertung
    cards.push(card(7, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Einzelauswertung', accentSoft) + 2;
      for (let i = 0; i < P.categories.length; i++) {
        const cat = P.categories[i];
        if (p) {
          para(B2, p, cat.icon, x, yy - 1, 16, { size: 10 });
          para(B2, p, cat.title, x + 17, yy, w - 17 - 34, { font: 'HB', size: 9.2, color: INK });
          p.rect(x + w - 28, yy - 0.5, 28, 12.5, {
            fill: WHITE, opacity: 0.045, radius: 5,
            stroke: WHITE, strokeOpacity: 0.09, lineWidth: 0.7,
          });
          p.text(String(cat.score), x + w - 14, yy + 8.6, { font: 'CB', size: 7.5, color: INK, align: 'center' });
        }
        yy += 14.5;
        if (p) {
          page_bar(p, x + 17, yy, w - 17, cat.score, accent);
        }
        yy += 5.5;
        yy += para(B2, p, cat.text, x + 17, yy, w - 17, { font: 'H', size: 8.2, color: INK2, lh: 1.32 });
        if (i < P.categories.length - 1) {
          yy += 3.5;
          if (p) dashed(p, x, yy, x + w);
          yy += 5;
        }
      }
      return yy - y;
    }));

    // Zeichen-Durchsage
    cards.push(card(4, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Zeichen-Durchsage · amtlich', accentSoft) + 2;
      yy += para(B2, p, `📣 ${P.signSpruch}`, x, yy, w, { font: 'H', size: 8.9, color: INK, lh: 1.5 }) + 8;
      yy += para(B2, p, `Chronotyp laut Element (${P.element}): ${P.chronoLabel}`, x, yy, w,
        { font: 'H', size: 7.8, color: INK3, lh: 1.4 });
      return yy - y;
    }));

    // Tagesenergie
    cards.push(card(8, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Tagesenergie · Kurvenblatt', accentSoft) + 2;
      const img = B2.charts['energy_' + P.slot];
      const iw = w * 0.94;
      const ih = (iw * img.h) / img.w;
      if (p) p.image(img.ref, x + (w - iw) / 2, yy, iw, ih);
      yy += ih + 4;
      yy += para(B2, p,
        `Hoch um ${P.energie.peakZeit} Uhr — ${P.energie.peakText} Tagestief: ${P.energie.tiefZeit} Uhr (eingeplant, kein Grund zur Sorge).`,
        x, yy, w, { font: 'H', size: 8.3, color: INK2, lh: 1.4 });
      return yy - y;
    }));

    // Bettgeflüster
    cards.push(card(4, accentSoft, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Nachtprotokoll · streng vertraulich', accentSoft) + 1;
      yy += para(B2, p, 'Bettgeflüster-Barometer', x, yy, w, { font: 'TBI', size: 10.2, color: INK }) + 3;
      yy += meter(B2, p, x, yy, w, 'Knisterfaktor', `${P.spice.pct} %`, P.spice.pct, accentSoft) + 5;
      yy += para(B2, p, P.spice.text, x, yy, w, { font: 'H', size: 8.4, color: INK2, lh: 1.4 });
      return yy - y;
    }));

    // Amtliche Sternen-Warnung
    cards.push(card(8, WARN, (B2, p, x, y, w) => {
      let yy = y + eyebrow(B2, p, x, y, w, 'Amtliche Sternen-Warnung', WARN) + 2;
      yy += para(B2, p, `⚠️ ${P.warnung}`, x, yy, w, { font: 'H', size: 9.8, color: INK, lh: 1.5 });
      return yy - y;
    }));

    return cards;
  }

  function page_bar(p, x, y, w, pct, color) {
    p.rect(x, y, w, 3.5, { fill: WHITE, opacity: 0.07, radius: 1.75 });
    p.rect(x, y, Math.max(2, (w * Math.min(100, pct)) / 100), 3.5, { fill: color, radius: 1.75 });
  }

  // ------------------------------------------------------- Build & Download

  async function build(day, meta = {}) {
    const doc = new SFPdf.Doc();
    const B = {
      doc, day, page: null, y: MT, pageIdx: 0,
      cache: new Map(), strips: new Map(), charts: {},
    };
    B.bgRef = makeBg(B, meta.season, meta.holiday);
    await makeCharts(B, day);

    cover(B, day, meta);

    section(B, 1, tglyph('❍'), GOLD_SOFT, 'Gemeinsam', 'PAAR-PROTOKOLL', GOLD_SOFT);
    flow(B, coupleCards(B, day));

    section(B, 2, tglyph(day.a.glyph), PA_SOFT, day.a.name,
      `TAGESPROTOKOLL · ${day.a.sign} · ELEMENT ${day.a.element}`, PA_SOFT);
    flow(B, personCards(B, day.a, PA, PA_SOFT));

    section(B, 3, tglyph(day.b.glyph), PB_SOFT, day.b.name,
      `TAGESPROTOKOLL · ${day.b.sign} · ELEMENT ${day.b.element}`, PB_SOFT);
    flow(B, personCards(B, day.b, PB, PB_SOFT));

    footers(B, meta);
    return doc.build();
  }

  async function download(day, meta = {}) {
    const buf = await build(day, meta);
    const url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sternenflunk-tagesbericht-${day.date}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  return { build, download };
})();
