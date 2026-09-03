/* Constellation motifs · Public Thinking V2.
   One semantic motif per piece (frontmatter `motif`), rendered as celestial construction. Pure function returning an
   SVG string, so the same geometry serves the homepage record, the archive glyph, the article masthead and the OG card.
   Styling lives in CSS on the root classes: .cm (base) + .cm--dark | .cm--paper (ground) + .cm--record | .cm--catalogue |
   .cm--masthead | .cm--og (context). Geometry never changes per context; only material does. Every drawing keeps an
   inset of at least 10 units inside its viewBox and the SVG uses preserveAspectRatio="xMidYMid meet", so no container
   crop, mask or responsive scale can remove a contour; contexts must not compensate with offsets.
   Hierarchy (approved 2026-09-03): celestial researcher = the practice; constellation motif = one captured finding
   (static); journal notation = how findings are recorded.
   Motifs:
   - gaming: a universal game controller, ~1.7:1, compact shoulders, subtle grips, a lower central indentation, one
     closed exterior contour, d-pad cross and four-button diamond; the coral ring is the observation (top button).
   - reticulum: the real constellation Reticulum ("the Reticle", IAU abbreviation Ret), named after the reticle used to
     measure stellar positions. Stars are plotted from their J2000 positions (Hipparcos): the IAU stick figure is the
     compact quadrilateral alpha–beta–delta–epsilon; gamma, iota, theta, kappa and the zeta pair are unconnected field
     points. The coral observation marker sits on zeta Reticuli, the body outside the figure: participation beyond the
     container. Chosen deliberately (2026-09-03) to replace an arbitrary network; do not swap it for another generic
     graph. Positional reference: IAU/Sky & Telescope Reticulum chart (iauarchive.eso.org/public/themes/constellations),
     meaning: eso.org/public/news/eso0527. Sky convention: right ascension increases to the left, north is up. */
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
  const label = (x, y, text) => `<text class="cm-label" x="${x}" y="${y}">${text}</text>`;

  // Reticulum, J2000 (right ascension in degrees, declination in degrees), Hipparcos-based catalogue values
  const RET = {
    alpha: [63.606, -62.474], beta: [56.050, -64.807], epsilon: [64.121, -59.302], delta: [59.687, -61.400],
    gamma: [60.225, -62.159], iota: [59.790, -61.070], theta: [64.420, -63.250], kappa: [52.345, -62.937], zeta: [49.440, -62.580],
  };
  // gnomonic-free small-field projection: x = -(RA - RA0)·cos(Dec0), y = Dec0 - Dec (north up, east left), normalised
  const projectRet = (() => { const RA0 = 58, DEC0 = -62.3, c = Math.cos(DEC0 * Math.PI / 180); const raw = {}; for (const k in RET) raw[k] = [-(RET[k][0] - RA0) * c, DEC0 - RET[k][1]]; const xs = Object.values(raw).map((p) => p[0]), ys = Object.values(raw).map((p) => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2; const s = Math.min(236 / (Math.max(...xs) - Math.min(...xs)), 190 / (Math.max(...ys) - Math.min(...ys))); const out = {}; for (const k in raw) out[k] = [150 + (raw[k][0] - cx) * s, 118 + (raw[k][1] - cy) * s]; return out; })();

  const MOTIFS = {
    gaming: { viewBox: '0 0 300 220', alt: { en: 'A game controller drawn as a constellation: a closed silhouette with compact shoulders and grips, a directional cross on the left, four buttons on the right, one marked in coral.', de: 'Ein Gamecontroller als Sternbild: geschlossene Silhouette mit kompakten Schultern und Griffen, Steuerkreuz links, vier Tasten rechts, eine in Koralle markiert.' }, build() {
      // exterior contour: one closed path, ~240 x 140 units (1.71:1), inset >= 28 units. Shoulders compact, grips subtle,
      // a shallow central indentation on the lower edge.
      const contour = 'M96,52 L204,52 C232,52 248,60 254,84 L266,148 C270,178 258,190 242,190 C226,190 214,178 206,164 C192,152 172,148 150,148 C128,148 108,152 94,164 C86,178 74,190 58,190 C42,190 30,178 34,148 L46,84 C52,60 68,52 96,52 Z';
      const shoulderL = [46, 84], shoulderR = [254, 84], topL = [96, 52], topR = [204, 52], gripL = [58, 190], gripR = [242, 190], dip = [150, 148];
      const dpad = { c: [92, 118], arms: [[92, 98], [112, 118], [92, 138], [72, 118]] };
      const btn = [[208, 98], [228, 118], [208, 138], [188, 118]];
      let s = `<path class="cm-vol cm-body" d="${contour}"/>` + dust([56, 62, 188, 92], 18, 7);
      s += `<path class="cm-contour" d="${contour}"/>`;
      s += dpad.arms.map((a) => line(dpad.c, a, 'cm-line')).join('') + chain(btn, 'cm-line cm-faint', true);
      s += line(dpad.arms[1], btn[3], 'cm-line cm-faint');
      s += star(shoulderL, 2.8) + star(shoulderR, 2.8) + node(topL, 1.8) + node(topR, 1.8) + node(gripL, 1.8, 'cm-minor') + node(gripR, 1.8, 'cm-minor') + node(dip, 1.6, 'cm-minor');
      s += node(dpad.c, 2.2) + dpad.arms.map((a) => node(a, 2)).join('') + btn.map((p, i) => (i === 1 ? star(p, 3) : node(p, 2.2))).join('');
      s += mark(btn[0], 8);
      return s;
    } },
    reticulum: { viewBox: '0 0 300 240', alt: { en: 'The constellation Reticulum, the Reticle: alpha, beta, delta and epsilon Reticuli plotted as a compact diamond, with zeta Reticuli marked in coral outside the figure.', de: 'Das Sternbild Reticulum, das Netz: Alpha, Beta, Delta und Epsilon Reticuli als kompakte Raute, Zeta Reticuli außerhalb der Figur in Koralle markiert.' }, build() {
      const P = projectRet;
      let s = dust([24, 20, 252, 200], 14, 19);
      // the IAU stick figure: alpha - beta - delta - epsilon - alpha
      s += chain([P.alpha, P.beta, P.delta, P.epsilon], 'cm-line', true);
      // faint construction: the reticle's cross-hair through the figure's centre
      const cx = (P.alpha[0] + P.beta[0] + P.delta[0] + P.epsilon[0]) / 4, cy = (P.alpha[1] + P.beta[1] + P.delta[1] + P.epsilon[1]) / 4;
      s += line([cx - 22, cy], [cx + 22, cy], 'cm-frame cm-faint') + line([cx, cy - 22], [cx, cy + 22], 'cm-frame cm-faint');
      s += star(P.alpha, 3) + node(P.beta, 2.6) + node(P.delta, 2.4) + node(P.epsilon, 2.6);
      [P.gamma, P.iota, P.theta, P.kappa].forEach((q) => node(q, 1.7, 'cm-minor'));
      s += node([P.zeta[0] - 2.4, P.zeta[1] + 1], 1.9) + node([P.zeta[0] + 2.4, P.zeta[1] - 1], 1.9); // the zeta pair
      s += mark(P.zeta, 8);
      s += label(14, 226, 'RET · RETICULUM / THE RETICLE');
      return s;
    } },
  };
  // legacy slug from the first Public Thinking pass; the frontmatter now says `reticulum`
  MOTIFS['people-beyond-container'] = MOTIFS.reticulum;

  function motifSvg(kind, ctx, ground, lang) {
    const m = MOTIFS[kind]; if (!m) return '';
    ctx = ctx || 'record'; ground = ground || 'dark';
    const conveys = ctx === 'masthead'; // the masthead specimen carries meaning; elsewhere the motif is ambient
    const a11y = conveys ? `role="img" aria-label="${(m.alt[lang] || m.alt.en).replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
    return `<svg class="cm cm--${ctx} cm--${ground} cm-${kind}" viewBox="${m.viewBox}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" ${a11y} focusable="false">${m.build()}</svg>`;
  }
  return { motifSvg, kinds: Object.keys(MOTIFS), reticulum: projectRet };
});
