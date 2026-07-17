/* ============================================================
   SFPdf — handgerollter Mini-PDF-Writer (PDF 1.4), keine
   Bibliotheken. Genau das, was der Tagesbericht braucht:
   Core-Fonts (WinAnsi), Vektorpfade, Transparenz (ExtGState),
   Bilder mit Alphamaske (Flate via CompressionStream).

   Koordinaten laufen wie im Browser von OBEN nach unten —
   der Writer spiegelt intern auf den PDF-Ursprung unten links.
   Textbreiten misst ein Canvas mit metrisch kompatiblen
   System-Fonts (Arial ↔ Helvetica, Times New Roman ↔ Times).
   ============================================================ */
'use strict';

const SFPdf = (() => {
  const KAPPA = 0.5522847498; // Kreis-als-Bézier-Konstante

  // Latin1-String → Bytes
  function bytes(s) {
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
    return b;
  }

  // CP1252-Sonderzone 0x80–0x9F (der Rest ist Latin-1 und mappt 1:1).
  const CP1252 = {
    0x20AC: 128, 0x201A: 130, 0x0192: 131, 0x201E: 132, 0x2026: 133,
    0x2020: 134, 0x2021: 135, 0x02C6: 136, 0x2030: 137, 0x0160: 138,
    0x2039: 139, 0x0152: 140, 0x017D: 142, 0x2018: 145, 0x2019: 146,
    0x201C: 147, 0x201D: 148, 0x2022: 149, 0x2013: 150, 0x2014: 151,
    0x02DC: 152, 0x2122: 153, 0x0161: 154, 0x203A: 155, 0x0153: 156,
    0x017E: 158, 0x0178: 159,
  };

  const canEncode = (ch) => {
    const c = ch.codePointAt(0);
    return c < 0x80 || (c >= 0xA0 && c <= 0xFF) || CP1252[c] !== undefined;
  };

  // Unicode → WinAnsi-Latin1-String; nicht Abbildbares fällt still weg
  // (der Report-Layer filtert vorher, das hier ist das Sicherheitsnetz).
  function winAnsi(str) {
    let out = '';
    for (const ch of str) {
      const c = ch.codePointAt(0);
      if (c === 0x0A || c === 0x0D) continue;
      if (c < 0x80 || (c >= 0xA0 && c <= 0xFF)) out += ch;
      else if (CP1252[c] !== undefined) out += String.fromCharCode(CP1252[c]);
    }
    return out;
  }

  const hex = (latin1) => {
    let out = '';
    for (let i = 0; i < latin1.length; i++) {
      out += (latin1.charCodeAt(i) & 0xff).toString(16).padStart(2, '0');
    }
    return out;
  };

  const num = (v) => {
    const r = Math.round(v * 100) / 100;
    return Object.is(r, -0) ? '0' : String(r);
  };

  // --------------------------------------------------- Fonts & Messung

  const FONTS = {
    H: 'Helvetica', HB: 'Helvetica-Bold', HO: 'Helvetica-Oblique', HBO: 'Helvetica-BoldOblique',
    TR: 'Times-Roman', TI: 'Times-Italic', TB: 'Times-Bold', TBI: 'Times-BoldItalic',
    C: 'Courier', CB: 'Courier-Bold',
  };

  // Metrisch kompatible CSS-Pendants für die Breitenmessung.
  const SANS = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  const SERIF = '"Times New Roman", Times, serif';
  const FONT_CSS = {
    H: `400 100px ${SANS}`, HB: `700 100px ${SANS}`,
    HO: `italic 400 100px ${SANS}`, HBO: `italic 700 100px ${SANS}`,
    TR: `400 100px ${SERIF}`, TI: `italic 400 100px ${SERIF}`,
    TB: `700 100px ${SERIF}`, TBI: `italic 700 100px ${SERIF}`,
  };

  const mctx = document.createElement('canvas').getContext('2d');

  function measure(str, font = 'H', size = 10, tracking = 0) {
    const track = tracking * Math.max(0, str.length - 1);
    if (font === 'C' || font === 'CB') return str.length * 0.6 * size + track;
    mctx.font = FONT_CSS[font] || FONT_CSS.H;
    return (mctx.measureText(str).width * size) / 100 + track;
  }

  // ------------------------------------------------------------- Farben

  const colorCache = new Map();
  function rgb(color) {
    if (Array.isArray(color)) return color.map(num).join(' ');
    let c = colorCache.get(color);
    if (!c) {
      const n = parseInt(color.slice(1), 16);
      c = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map(num).join(' ');
      colorCache.set(color, c);
    }
    return c;
  }

  // -------------------------------------------------------------- Page

  class Page {
    constructor(doc) {
      this.doc = doc;
      this.W = doc.W;
      this.H = doc.H;
      this.ops = [];
    }

    _gs(fillA, strokeA) {
      if (fillA == null && strokeA == null) return null;
      return `/GS${this.doc.gs(fillA ?? 1, strokeA ?? 1)} gs`;
    }

    /** Einzeiliger Text, y = Baseline (von oben). Liefert die Textbreite. */
    text(str, x, y, o = {}) {
      const font = o.font || 'H';
      const size = o.size || 10;
      const tracking = o.tracking || 0;
      const s = winAnsi(String(str));
      const w = measure(String(str), font, size, tracking);
      let tx = x;
      if (o.align === 'center') tx -= w / 2;
      else if (o.align === 'right') tx -= w;

      const gs = this._gs(o.opacity, o.opacity);
      this.ops.push(
        'q', ...(gs ? [gs] : []),
        'BT',
        `/${font} ${num(size)} Tf`,
        `${rgb(o.color || '#000000')} rg`,
        ...(tracking ? [`${num(tracking)} Tc`] : []),
        `1 0 0 1 ${num(tx)} ${num(this.H - y)} Tm`,
        `<${hex(s)}> Tj`,
        'ET', 'Q',
      );
      return w;
    }

    _paint(o) {
      // Malmodus aus fill/stroke ableiten (B = beides).
      if (o.fill != null && o.stroke != null) return 'B';
      if (o.stroke != null) return 'S';
      return 'f';
    }

    _style(o) {
      const ops = [];
      const fillA = o.fill != null ? (o.opacity ?? null) : null;
      const strokeA = o.stroke != null ? (o.strokeOpacity ?? o.opacity ?? null) : null;
      const gs = this._gs(fillA, strokeA);
      if (gs) ops.push(gs);
      if (o.fill != null) ops.push(`${rgb(o.fill)} rg`);
      if (o.stroke != null) {
        ops.push(`${rgb(o.stroke)} RG`, `${num(o.lineWidth ?? 1)} w`);
        if (o.lineJoin) ops.push('1 j');
        if (o.lineCap) ops.push('1 J');
      }
      if (o.dash) ops.push(`[${o.dash.map(num).join(' ')}] 0 d`);
      return ops;
    }

    /** Rechteck (x,y = obere linke Ecke), optional mit runden Ecken. */
    rect(x, y, w, h, o = {}) {
      const Y = this.H - y - h;
      const r = Math.min(o.radius || 0, w / 2, h / 2);
      const p = [];
      if (r > 0) {
        const k = KAPPA * r;
        p.push(`${num(x + r)} ${num(Y)} m`);
        p.push(`${num(x + w - r)} ${num(Y)} l`);
        p.push(`${num(x + w - r + k)} ${num(Y)} ${num(x + w)} ${num(Y + r - k)} ${num(x + w)} ${num(Y + r)} c`);
        p.push(`${num(x + w)} ${num(Y + h - r)} l`);
        p.push(`${num(x + w)} ${num(Y + h - r + k)} ${num(x + w - r + k)} ${num(Y + h)} ${num(x + w - r)} ${num(Y + h)} c`);
        p.push(`${num(x + r)} ${num(Y + h)} l`);
        p.push(`${num(x + r - k)} ${num(Y + h)} ${num(x)} ${num(Y + h - r + k)} ${num(x)} ${num(Y + h - r)} c`);
        p.push(`${num(x)} ${num(Y + r)} l`);
        p.push(`${num(x)} ${num(Y + r - k)} ${num(x + r - k)} ${num(Y)} ${num(x + r)} ${num(Y)} c`);
        p.push('h');
      } else {
        p.push(`${num(x)} ${num(Y)} ${num(w)} ${num(h)} re`);
      }
      this.ops.push('q', ...this._style(o), ...p, this._paint(o), 'Q');
    }

    line(x1, y1, x2, y2, o = {}) {
      this.ops.push(
        'q', ...this._style({ ...o, stroke: o.stroke || '#000' }),
        `${num(x1)} ${num(this.H - y1)} m`,
        `${num(x2)} ${num(this.H - y2)} l`,
        'S', 'Q',
      );
    }

    /** Polygon aus [[x,y],…]-Punkten, standardmäßig geschlossen. */
    poly(points, o = {}) {
      const p = points.map(([x, y], i) =>
        `${num(x)} ${num(this.H - y)} ${i ? 'l' : 'm'}`);
      if (o.close !== false) p.push('h');
      this.ops.push('q', ...this._style(o), ...p, this._paint(o), 'Q');
    }

    circle(cx, cy, r, o = {}) { this.ellipse(cx, cy, r, r, o); }

    ellipse(cx, cy, rx, ry, o = {}) {
      const Y = this.H - cy;
      const kx = KAPPA * rx;
      const ky = KAPPA * ry;
      this.ops.push(
        'q', ...this._style(o),
        `${num(cx - rx)} ${num(Y)} m`,
        `${num(cx - rx)} ${num(Y + ky)} ${num(cx - kx)} ${num(Y + ry)} ${num(cx)} ${num(Y + ry)} c`,
        `${num(cx + kx)} ${num(Y + ry)} ${num(cx + rx)} ${num(Y + ky)} ${num(cx + rx)} ${num(Y)} c`,
        `${num(cx + rx)} ${num(Y - ky)} ${num(cx + kx)} ${num(Y - ry)} ${num(cx)} ${num(Y - ry)} c`,
        `${num(cx - kx)} ${num(Y - ry)} ${num(cx - rx)} ${num(Y - ky)} ${num(cx - rx)} ${num(Y)} c`,
        'h', this._paint(o), 'Q',
      );
    }

    /** Bild (Index aus doc.addImage), x/y = obere linke Ecke. */
    image(ref, x, y, w, h, o = {}) {
      const gs = this._gs(o.opacity, o.opacity);
      this.ops.push(
        'q', ...(gs ? [gs] : []),
        `${num(w)} 0 0 ${num(h)} ${num(x)} ${num(this.H - y - h)} cm`,
        `/Im${ref} Do`, 'Q',
      );
    }
  }

  // --------------------------------------------------------------- Doc

  class Doc {
    constructor({ w = 595.28, h = 841.89 } = {}) {
      this.W = w;
      this.H = h;
      this.pages = [];
      this.images = [];             // { w, h, rgb, alpha|null }
      this.gstates = new Map();     // "ca|CA" → Index
    }

    addPage() {
      const p = new Page(this);
      this.pages.push(p);
      return p;
    }

    gs(ca, CA) {
      const key = `${ca}|${CA}`;
      let idx = this.gstates.get(key);
      if (idx === undefined) {
        idx = this.gstates.size;
        this.gstates.set(key, idx);
      }
      return idx;
    }

    /** RGBA-Pixel (ImageData.data) → Bild-Index; Alphamaske nur bei Bedarf. */
    addImage({ width, height, rgba }) {
      const n = width * height;
      const rgbBuf = new Uint8Array(n * 3);
      const alpha = new Uint8Array(n);
      let hasAlpha = false;
      for (let i = 0; i < n; i++) {
        rgbBuf[i * 3] = rgba[i * 4];
        rgbBuf[i * 3 + 1] = rgba[i * 4 + 1];
        rgbBuf[i * 3 + 2] = rgba[i * 4 + 2];
        alpha[i] = rgba[i * 4 + 3];
        if (alpha[i] < 255) hasAlpha = true;
      }
      this.images.push({ w: width, h: height, rgb: rgbBuf, alpha: hasAlpha ? alpha : null });
      return this.images.length - 1;
    }

    async _deflate(u8) {
      if (typeof CompressionStream === 'undefined') return { data: u8, flate: false };
      const stream = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate'));
      return { data: new Uint8Array(await new Response(stream).arrayBuffer()), flate: true };
    }

    async build() {
      // Objektnummern vergeben: 1 Catalog, 2 Pages, 3 Resources, dann
      // Fonts, ExtGStates, Bilder (+ SMasks), zuletzt Seiten + Inhalte.
      const fontKeys = Object.keys(FONTS);
      let no = 3;
      const fontNo = {};
      for (const k of fontKeys) fontNo[k] = ++no;
      const gsNo = [];
      for (let i = 0; i < this.gstates.size; i++) gsNo.push(++no);
      const imgNo = [];
      for (const im of this.images) {
        imgNo.push(++no);
        if (im.alpha) ++no; // SMask direkt dahinter
      }
      const pageNo = [];
      for (let i = 0; i < this.pages.length; i++) {
        pageNo.push(++no);
        ++no; // Content-Stream
      }

      const objs = []; // { no, body: Uint8Array }
      const push = (n, latin1OrBytes) =>
        objs.push({ no: n, body: typeof latin1OrBytes === 'string' ? bytes(latin1OrBytes) : latin1OrBytes });

      push(1, '<< /Type /Catalog /Pages 2 0 R >>');
      push(2, `<< /Type /Pages /Kids [${pageNo.map((n) => `${n} 0 R`).join(' ')}] /Count ${this.pages.length} >>`);

      const gsEntries = [...this.gstates.keys()]
        .map((_, i) => `/GS${i} ${gsNo[i]} 0 R`).join(' ');
      push(3, '<< /Font << ' + fontKeys.map((k) => `/${k} ${fontNo[k]} 0 R`).join(' ') + ' >>'
        + (gsEntries ? ` /ExtGState << ${gsEntries} >>` : '')
        + (this.images.length ? ' /XObject << ' + this.images.map((_, i) => `/Im${i} ${imgNo[i]} 0 R`).join(' ') + ' >>' : '')
        + ' >>');

      for (const k of fontKeys) {
        push(fontNo[k], `<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS[k]} /Encoding /WinAnsiEncoding >>`);
      }

      [...this.gstates.keys()].forEach((key, i) => {
        const [ca, CA] = key.split('|');
        push(gsNo[i], `<< /Type /ExtGState /ca ${num(Number(ca))} /CA ${num(Number(CA))} >>`);
      });

      const streamObj = (dict, data) => {
        const head = bytes(`<< ${dict} /Length ${data.length} >>\nstream\n`);
        const tail = bytes('\nendstream');
        const out = new Uint8Array(head.length + data.length + tail.length);
        out.set(head, 0);
        out.set(data, head.length);
        out.set(tail, head.length + data.length);
        return out;
      };

      for (let i = 0; i < this.images.length; i++) {
        const im = this.images[i];
        const rgbEnc = await this._deflate(im.rgb);
        const smaskRef = im.alpha ? ` /SMask ${imgNo[i] + 1} 0 R` : '';
        push(imgNo[i], streamObj(
          `/Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} `
          + `/ColorSpace /DeviceRGB /BitsPerComponent 8${rgbEnc.flate ? ' /Filter /FlateDecode' : ''}${smaskRef}`,
          rgbEnc.data,
        ));
        if (im.alpha) {
          const aEnc = await this._deflate(im.alpha);
          push(imgNo[i] + 1, streamObj(
            `/Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} `
            + `/ColorSpace /DeviceGray /BitsPerComponent 8${aEnc.flate ? ' /Filter /FlateDecode' : ''}`,
            aEnc.data,
          ));
        }
      }

      for (let i = 0; i < this.pages.length; i++) {
        const content = await this._deflate(bytes(this.pages[i].ops.join('\n')));
        push(pageNo[i], `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(this.W)} ${num(this.H)}] `
          + `/Resources 3 0 R /Contents ${pageNo[i] + 1} 0 R >>`);
        push(pageNo[i] + 1, streamObj(content.flate ? '/Filter /FlateDecode' : '', content.data));
      }

      // ---------------------------------------------- Assemblieren
      objs.sort((a, b) => a.no - b.no);
      const chunks = [bytes('%PDF-1.4\n%âãÏÓ\n')];
      let offset = chunks[0].length;
      const offsets = [];
      for (const o of objs) {
        offsets.push(offset);
        const head = bytes(`${o.no} 0 obj\n`);
        const tail = bytes('\nendobj\n');
        chunks.push(head, o.body, tail);
        offset += head.length + o.body.length + tail.length;
      }

      const xrefPos = offset;
      let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
      for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
      xref += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
      chunks.push(bytes(xref));

      let total = 0;
      for (const c of chunks) total += c.length;
      const out = new Uint8Array(total);
      let pos = 0;
      for (const c of chunks) {
        out.set(c, pos);
        pos += c.length;
      }
      return out;
    }
  }

  return { Doc, measure, canEncode, winAnsi };
})();
