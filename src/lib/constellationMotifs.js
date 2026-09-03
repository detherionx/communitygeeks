/* Constellation motifs · Public Thinking V2.
   One semantic motif per piece (frontmatter `motif`), rendered as celestial construction. Pure function returning
   an SVG string, so the same geometry serves the homepage record, the archive glyph, the article masthead and the
   OG card. Styling lives in CSS on the root classes: .cm (base) + .cm--dark | .cm--paper (ground) + .cm--record |
   .cm--catalogue | .cm--masthead | .cm--og (context). Geometry never changes per context; only material does.
   Hierarchy (approved 2026-09-03): celestial researcher = the practice; constellation motif = one captured finding
   (static); journal notation = how findings are recorded. Used through the Nunjucks filter `constellation`
   (see .eleventy.js) and the ptConstellation() macro in partials/pt-motifs.njk. Extending: add a motif here, use its
   slug in frontmatter; the old ptMotif() watermark stays for the live (non-concept) pages. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.ConstellationMotifs = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const f = (n) => (Math.round(n * 10) / 10).toString();
  const line = (a, b, cls) => `<line class="${cls}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
  const chain = (pts, cls, close) => { let s = ''; for (let i = 1; i < pts.length; i++) s += line(pts[i - 1], pts[i], cls); if (close) s += line(pts[pts.length - 1], pts[0], cls); return s; };
  const node = (p, r, cls) => `<circle class="cm-node${cls ? ' ' + cls : ''}" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}"/>`;
  const star = (p, r) => node(p, r, 'cm-major') + line([p[0] - r * 3, p[1]], [p[0] + r * 3, p[1]], 'cm-ray') + line([p[0], p[1] - r * 3], [p[0], p[1] + r * 3], 'cm-ray') + `<circle class="cm-ring" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * 2.4)}"/>`;
  const dust = (box, n, seed) => { const r = rnd(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle class="cm-dust" cx="${f(box[0] + r() * box[2])}" cy="${f(box[1] + r() * box[3])}" r="${f(0.5 + r() * 0.9)}" style="opacity:${f(0.25 + r() * 0.6)}"/>`; return s; };
  const mark = (p, r) => `<circle class="cm-obs" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}"/><rect class="cm-obs-core" x="${f(p[0] - 2.2)}" y="${f(p[1] - 2.2)}" width="4.4" height="4.4"/>`;

  const MOTIFS = {
    // the controller: body inferred through ghost volume and two faint contours; two shoulder stars and the primary
    // face button are the major stars; the d-pad cross and the face-button diamond stay precise (they carry recognition)
    gaming: { viewBox: '0 0 300 220', build() {
      const shoulderL = [40, 100], shoulderR = [260, 100], topL = [86, 70], topR = [214, 70], gripL = [58, 188], gripR = [242, 188];
      const dpad = { c: [84, 124], arms: [[84, 104], [106, 124], [84, 144], [62, 124]] };
      const btn = [[216, 102], [238, 124], [216, 146], [194, 124]];
      let s = `<path class="cm-vol cm-body" d="M40,100 Q56,72 86,70 L214,70 Q244,72 260,100 Q272,128 268,158 Q262,186 242,188 Q216,186 204,168 Q150,160 96,168 Q84,186 58,188 Q38,186 32,158 Q28,128 40,100 Z"/>`;
      s += dust([44, 74, 212, 100], 20, 7);
      s += line(topL, topR, 'cm-line cm-faint') + line(shoulderL, topL, 'cm-line cm-faint') + line(topR, shoulderR, 'cm-line cm-faint');
      s += `<path class="cm-line cm-faint cm-contour" d="M40,100 Q28,128 32,158 Q38,186 58,188"/><path class="cm-line cm-faint cm-contour" d="M260,100 Q272,128 268,158 Q262,186 242,188"/>`;
      s += dpad.arms.map((a) => line(dpad.c, a, 'cm-line')).join('') + chain(btn, 'cm-line cm-faint', true);
      s += line(dpad.arms[1], btn[3], 'cm-line cm-faint');
      s += star(shoulderL, 2.8) + star(shoulderR, 2.8) + node(topL, 1.8) + node(topR, 1.8) + node(gripL, 1.6, 'cm-minor') + node(gripR, 1.6, 'cm-minor');
      s += node(dpad.c, 2.2) + dpad.arms.map((a) => node(a, 2)).join('') + btn.map((p, i) => (i === 1 ? star(p, 3) : node(p, 2.2))).join('');
      s += mark(btn[0], 8);
      return s;
    } },
    // participation beyond the container: bodies inside a constructed boundary, relationships that leave it
    'people-beyond-container': { viewBox: '0 0 300 240', build() {
      const box = [[52, 42], [186, 42], [186, 196], [52, 196]];
      const inside = [[96, 92], [134, 150], [152, 100]];
      const outside = [[246, 74], [262, 168], [218, 206], [272, 118]];
      let s = `<path class="cm-vol" d="M${f(box[0][0])},${f(box[0][1])} H${f(box[1][0])} V${f(box[2][1])} H${f(box[3][0])} Z"/>` + dust([56, 46, 220, 160], 18, 11);
      s += line(box[0], box[1], 'cm-frame') + line(box[0], box[3], 'cm-frame') + line(box[3], box[2], 'cm-frame') + line(box[1], [186, 90], 'cm-frame cm-faint') + line([186, 150], box[2], 'cm-frame cm-faint');
      s += chain([inside[0], inside[2], inside[1]], 'cm-line cm-faint');
      s += line(inside[2], outside[0], 'cm-line') + line(inside[1], outside[1], 'cm-line') + line(inside[0], outside[3], 'cm-line cm-faint') + line(inside[1], outside[2], 'cm-line cm-faint') + line(outside[0], outside[3], 'cm-line cm-faint') + line(outside[3], outside[1], 'cm-line cm-faint');
      s += inside.map((p, i) => (i === 2 ? star(p, 2.8) : node(p, 2.4))).join('') + outside.map((p, i) => (i === 0 ? star(p, 3) : node(p, 2.4))).join('');
      s += mark(outside[1], 8);
      return s;
    } },
  };

  function motifSvg(kind, ctx, ground) {
    const m = MOTIFS[kind]; if (!m) return '';
    return `<svg class="cm cm--${ctx || 'record'} cm--${ground || 'dark'} cm-${kind}" viewBox="${m.viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${m.build()}</svg>`;
  }
  return { motifSvg, kinds: Object.keys(MOTIFS) };
});
