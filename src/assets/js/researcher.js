/* Communitygeeks concept · Public Thinking · THE CELESTIAL RESEARCHER
   A presence built only from constellations holds an open field journal in
   one hand and writes into it with the other. Static scene (no animation yet):
   anatomy first (silhouette volumes, joints, contact points), then three
   celestial layers on top: a restrained translucent volume, luminous nodes at
   anatomical landmarks connected by thin constellation geometry, and sparse
   stellar dust inside the volume. Where a hand passes in front of the paper it
   is rendered again in teal, clipped to the pages, so it stays legible.
   Decorative only: every SVG this builds is aria-hidden.

   Usage: <svg data-researcher='{"part":"scene"}'>   full scene (mobile crop automatic)
          <svg data-researcher='{"part":"bg"}'>      background star field
          opts: mode "celestial" (default) | "construction"; view "auto" | "a" | "b" | "mobile" | "full" */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) if (a[k] !== undefined) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const mkRnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---- geometry ---------------------------------------------------------------
  // Scene: viewBox 0 0 760 1000. Journal spread centred at (380,500), turned -7deg, pages 188x260 each.
  const JT = 'translate(380,500) rotate(-7)';
  const PAGES = [[-190, -130], [2, -130]];
  // Writing hand frame: pen tip T, pen axis u (down-right, toward the writer's elbow), side s (index side)
  const T = [442, 512], U = [0.62, 0.78], S = [0.78, -0.62];
  const P = (a, b) => [T[0] + U[0] * a + S[0] * b, T[1] + U[1] * a + S[1] * b];
  const HOLD = {
    // thumb: metacarpal inside the thenar mass (CMC near the wrist, MCP just below the page edge),
    // then a short, slightly bowed digit in front of the page with its pad pressing the paper
    thumb: [[240, 752], [248, 658], [270, 626], [286, 590]], thumbW: [40, 30, 26], pad: { c: [286, 590], rx: 15, ry: 12, rot: -55 },
    // the four fingers lie behind the paper; what shows of them is the little-finger side of the palm past the left edge
    pinkyMcp: [176, 568],
    wristA: [234, 770], wristB: [168, 772],
    // one continuous silhouette, forearm to palm (clockwise from the ulnar exit): forearm taper, narrow wrist,
    // hypothenar bulge on the little-finger side, thenar mass feeding the thumb on the radial side
    outline: [[98, 1000], [150, 884], [168, 772], [160, 712], [165, 642], [176, 568], [206, 540], [246, 556], [268, 600], [274, 650], [262, 708], [234, 770], [222, 884], [194, 1010]],
    armPts: [[214, 880], [150, 900]],
  };
  const WRITE = {
    thumb: [P(126, -10), P(90, -24), P(52, -22), P(30, -7)], thumbW: [30, 26, 22],
    index: [P(98, 44), P(70, 30), P(46, 15), P(26, 7)], indexW: 24,
    middle: [P(108, 60), P(86, 32), P(62, 12), P(42, 3)], middleW: 25,
    ring: [P(114, 80), P(98, 84), P(90, 74), P(98, 68)], ringW: 22,
    pinky: [P(116, 98), P(108, 102), P(102, 94), P(108, 88)], pinkyW: 19,
    wristA: P(158, 24), wristB: P(158, 92), web: P(60, 10),
    armEnd: [[770, 850], [810, 770]], armPts: [[690, 730], [700, 800]],
    penLen: 150, penAngle: Math.atan2(U[1], U[0]) * 180 / Math.PI,
  };
  WRITE.palm = [WRITE.thumb[1], WRITE.thumb[0], WRITE.wristA, WRITE.wristB, WRITE.pinky[0], WRITE.ring[0], WRITE.middle[0], WRITE.index[0], WRITE.web];
  WRITE.forearm = [WRITE.wristA, WRITE.wristB, WRITE.armEnd[1], WRITE.armEnd[0]];

  const VIEWS = { full: '0 0 760 1000', mobile: '150 330 500 520', a: '90 460 320 400', b: '400 470 320 260' };

  // ---- drawing helpers ----------------------------------------------------------
  function scene(svg, opts) {
    opts = opts || {}; const mode = opts.mode || 'celestial'; const construction = mode === 'construction';
    let view = opts.view || 'auto'; if (view === 'auto') view = window.innerWidth <= 860 ? 'mobile' : 'full';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', VIEWS[view] || VIEWS.full); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); svg.dataset.view = view;
    svg.classList.add('cel'); svg.classList.toggle('construction', construction);
    const rnd = mkRnd(23);
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: svg.id + '-page' }, defs); const mask = el('mask', { id: svg.id + '-off' }, defs);
    el('rect', { x: -400, y: -400, width: 1600, height: 1800, fill: '#fff' }, mask);
    PAGES.forEach(([x, y]) => { el('rect', { x, y, width: 188, height: 260, transform: JT }, clip); el('rect', { x, y, width: 188, height: 260, transform: JT, fill: '#000' }, mask); });
    const dual = (grp) => { const c = grp.cloneNode(true); c.classList.add('onpage'); c.setAttribute('clip-path', `url(#${svg.id}-page)`); grp.setAttribute('mask', `url(#${svg.id}-off)`); grp.parentNode.insertBefore(c, grp.nextSibling); };
    const g = (cls, parent) => el('g', { class: cls }, parent || svg);
    const line = (a, b, cls, p) => el('line', { class: cls, x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1) }, p);
    const chain = (pts, cls, p) => { for (let i = 1; i < pts.length; i++) line(pts[i - 1], pts[i], cls, p); };
    const poly = (pts, cls, p) => el('polygon', { class: cls, points: pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') }, p);
    const smooth = (pts, cls, p) => { const n = pts.length; let d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; d += ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1); } return el('path', { class: cls, d: d + ' Z' }, p); };
    const node = (q, r, cls, p) => el('circle', { class: 'node' + (cls ? ' ' + cls : ''), cx: q[0].toFixed(1), cy: q[1].toFixed(1), r }, p);
    const star = (q, r, p) => { node(q, r, 'big', p); const L = r * 3.4; line([q[0] - L, q[1]], [q[0] + L, q[1]], 'ray', p); line([q[0], q[1] - L], [q[0], q[1] + L], 'ray', p); el('circle', { class: 'ring', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: (r * 2.6).toFixed(1) }, p); el('circle', { class: 'ring r2', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: (r * 4.6).toFixed(1) }, p); };
    // a finger or forearm volume: a thick round-capped polyline (widths per segment) inside the silhouette group
    const volume = (pts, widths, p) => { for (let i = 1; i < pts.length; i++) el('line', { class: 'vol', x1: pts[i - 1][0].toFixed(1), y1: pts[i - 1][1].toFixed(1), x2: pts[i][0].toFixed(1), y2: pts[i][1].toFixed(1), 'stroke-width': Array.isArray(widths) ? widths[i - 1] : widths }, p); };
    // stellar dust inside a volume: points scattered along a polyline within its width
    const dust = (pts, w, n, p) => { for (let i = 0; i < n; i++) { const seg = Math.min(pts.length - 2, Math.floor(rnd() * (pts.length - 1))); const t = rnd(); const a = pts[seg], b = pts[seg + 1]; const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; const off = (rnd() - 0.5) * w * 0.8; el('circle', { class: 'dust', cx: (x - dy / L * off).toFixed(1), cy: (y + dx / L * off).toFixed(1), r: (0.5 + rnd() * 0.9).toFixed(2), style: 'opacity:' + (0.3 + rnd() * 0.6).toFixed(2) }, p); } };

    // ===== holding hand, the parts behind the paper (forearm, palm heel, thumb base)
    const hb = g('hand hand-hold back');
    const hbVol = g('sil', hb); smooth(HOLD.outline, 'vol-fill', hbVol);
    const hbStruct = g('struct', hb);
    line(HOLD.wristA, HOLD.wristB, 'bone', hbStruct); line(HOLD.wristA, HOLD.outline[13], 'bone faint', hbStruct); line(HOLD.wristB, HOLD.outline[0], 'bone faint', hbStruct);
    line(HOLD.armPts[0], HOLD.armPts[1], 'bone faint', hbStruct); line(HOLD.wristA, HOLD.thumb[0], 'bone faint', hbStruct); line(HOLD.thumb[0], HOLD.thumb[1], 'bone', hbStruct);
    line(HOLD.wristB, HOLD.pinkyMcp, 'bone faint', hbStruct); line(HOLD.pinkyMcp, [204, 548], 'bone faint', hbStruct); // the palm's contour disappearing behind the paper
    if (!construction) { dust([[201, 771], [146, 1005]], 66, 14, hbStruct); dust([[201, 771], [218, 690]], 60, 5, hbStruct); }
    const hbNodes = g('nodes', hb); star(HOLD.wristA, 4.4, hbNodes); node(HOLD.wristB, 3.2, 'big', hbNodes); node(HOLD.thumb[0], 3, '', hbNodes); node(HOLD.pinkyMcp, 2.6, '', hbNodes); HOLD.armPts.forEach((q) => node(q, 2.2, '', hbNodes));

    // ===== the journal
    const J = g('journal'); J.setAttribute('transform', JT);
    el('rect', { class: 'page-edge', x: -192, y: -128, width: 384, height: 262 }, J); // the block of pages: visible thickness along the bottom and outer edges
    el('rect', { class: 'page', x: -190, y: -130, width: 188, height: 260 }, J); el('rect', { class: 'page', x: 2, y: -130, width: 188, height: 260 }, J);
    el('rect', { class: 'spine', x: -2, y: -130, width: 4, height: 260 }, J);
    el('rect', { class: 'contact', x: -190, y: 132, width: 128, height: 7 }, J); // the book's edge resting on the palm below
    el('ellipse', { class: 'contact-pad', cx: -104, cy: 78, rx: 19, ry: 14, transform: 'rotate(-50 -104 78)' }, J); // pressure under the thumb pad
    for (let y = -104; y < 130; y += 18) { line([-178, y], [-14, y], 'rule', J); line([14, y], [178, y], 'rule', J); }
    line([-166, -130], [-166, 130], 'margin', J); line([24, -130], [24, 130], 'margin', J);
    const text = (x, y, s, cls, anchor) => { const t = el('text', { class: cls, x, y, 'text-anchor': anchor || 'start' }, J); t.textContent = s; return t; };
    text(-160, -114, 'FIELD JOURNAL · 06', 'lbl'); text(178, -114, 'p. 41', 'lbl', 'end'); text(30, -114, '2 SEP 2026', 'lbl'); text(-14, 122, 'p. 40', 'lbl', 'end');
    text(-158, -84, 'OBS. 001 · 25 AUG', 'ink'); text(-158, -62, 'WHERE DOES IT RUN?', 'ink small');
    const n1 = [-128, -24], n2 = [-72, -38], n3 = [-96, 14], n4 = [-44, 6];
    chain([n1, n2, n4], 'stroke thin', J); line(n1, n3, 'stroke thin', J); line(n3, n4, 'stroke thin', J);
    [n1, n2, n3, n4].forEach((n) => el('circle', { class: 'inknode', cx: n[0], cy: n[1], r: 2.2 }, J));
    el('circle', { class: 'coral', cx: n4[0], cy: n4[1], r: 8 }, J);
    text(-158, 44, 'forum · discord · calendar', 'ink small'); el('path', { class: 'stroke thin', d: 'M-158,48 c30,2 60,-2 96,0' }, J);
    text(-158, 68, '→ not the container.', 'ink small'); text(-158, 86, 'who participates, how.', 'ink small');
    text(32, -84, 'OBS. 002 · 2 SEP', 'ink'); text(32, -56, 'PARTICIPATION', 'ink big'); el('path', { class: 'stroke', d: 'M32,-48 c24,1.5 52,-2 78,-0.5 s28,1 40,0' }, J);
    const a = [40, -12], b = [112, -22]; line(a, b, 'stroke thin', J); [a, b].forEach((n) => el('circle', { class: 'inknode', cx: n[0], cy: n[1], r: 2.2 }, J));
    el('path', { class: 'stroke thin', d: 'M40,-12 Q44,8 60,20' }, J); // the stroke in progress, ending under the pen tip

    // ===== holding hand, the parts in front of the paper: thumb over the page, finger tips over the left edge
    const hf = g('hand hand-hold front');
    const hfVol = g('sil', hf); volume(HOLD.thumb.slice(1), HOLD.thumbW.slice(1), hfVol); el('ellipse', { class: 'vol-fill', cx: HOLD.pad.c[0], cy: HOLD.pad.c[1], rx: HOLD.pad.rx, ry: HOLD.pad.ry, transform: `rotate(${HOLD.pad.rot} ${HOLD.pad.c[0]} ${HOLD.pad.c[1]})` }, hfVol);
    const hfStruct = g('struct', hf); chain(HOLD.thumb.slice(1), 'bone', hfStruct);
    if (!construction) dust(HOLD.thumb.slice(1), 18, 6, hfStruct);
    const hfNodes = g('nodes', hf); node(HOLD.thumb[1], 3, '', hfNodes); node(HOLD.thumb[2], 2.6, '', hfNodes); node(HOLD.thumb[3], 2.6, 'tip', hfNodes);
    dual(hf);

    // ===== writing hand: forearm, palm, middle/ring/pinky behind the pen
    const wb = g('hand hand-write back');
    const wbVol = g('sil', wb); poly(WRITE.forearm, 'vol-fill', wbVol); smooth(WRITE.palm, 'vol-fill', wbVol);
    volume(WRITE.middle, WRITE.middleW, wbVol); volume(WRITE.ring, WRITE.ringW, wbVol); volume(WRITE.pinky, WRITE.pinkyW, wbVol);
    const wbStruct = g('struct', wb);
    line(WRITE.wristA, WRITE.wristB, 'bone', wbStruct); line(WRITE.wristA, WRITE.armEnd[0], 'bone faint', wbStruct); line(WRITE.wristB, WRITE.armEnd[1], 'bone faint', wbStruct); line(WRITE.armPts[0], WRITE.armPts[1], 'bone faint', wbStruct);
    chain([WRITE.index[0], WRITE.middle[0], WRITE.ring[0], WRITE.pinky[0]], 'bone', wbStruct); line(WRITE.wristA, WRITE.index[0], 'bone faint', wbStruct); line(WRITE.wristB, WRITE.pinky[0], 'bone faint', wbStruct); line(WRITE.wristA, WRITE.thumb[0], 'bone faint', wbStruct);
    chain(WRITE.middle, 'bone', wbStruct); chain(WRITE.ring, 'bone', wbStruct); chain(WRITE.pinky, 'bone', wbStruct);
    if (!construction) { dust([WRITE.wristA, WRITE.armEnd[0]], 70, 14, wbStruct); dust([WRITE.wristB, WRITE.index[0]], 50, 6, wbStruct); }
    const wbNodes = g('nodes', wb); star(WRITE.wristB, 4.4, wbNodes); node(WRITE.wristA, 3.2, 'big', wbNodes);
    [WRITE.index[0], WRITE.middle[0], WRITE.ring[0], WRITE.pinky[0], WRITE.thumb[0]].forEach((q) => node(q, 3, '', wbNodes));
    [WRITE.middle[1], WRITE.middle[2], WRITE.ring[1], WRITE.ring[2], WRITE.pinky[1], WRITE.pinky[2]].forEach((q) => node(q, 2.4, '', wbNodes));
    [WRITE.middle[3], WRITE.ring[3], WRITE.pinky[3]].forEach((q) => node(q, 2.4, 'tip', wbNodes)); WRITE.armPts.forEach((q) => node(q, 2.2, '', wbNodes));
    dual(wb);

    // ===== the pen: tip at the writing point, barrel leaning toward the writer
    const pen = g('pen'); pen.setAttribute('transform', `translate(${T[0]},${T[1]}) rotate(${WRITE.penAngle.toFixed(1)})`);
    el('path', { class: 'pen-tip', d: 'M0,0 L16,-4 L16,4 Z' }, pen);
    el('rect', { class: 'pen-body', x: 16, y: -4, width: WRITE.penLen - 26, height: 8 }, pen);
    el('rect', { class: 'pen-band', x: 56, y: -4.8, width: 5, height: 9.6 }, pen);
    el('rect', { class: 'pen-cap', x: WRITE.penLen - 10, y: -3, width: 10, height: 6 }, pen);
    el('rect', { class: 'pen-edge', x: 16, y: -4, width: WRITE.penLen - 26, height: 8 }, pen);

    // ===== writing hand: index finger and thumb, in front of the pen
    const wf = g('hand hand-write front');
    const wfVol = g('sil', wf); volume(WRITE.index, WRITE.indexW, wfVol); volume(WRITE.thumb, WRITE.thumbW, wfVol);
    const wfStruct = g('struct', wf); chain(WRITE.index, 'bone', wfStruct); chain(WRITE.thumb, 'bone', wfStruct);
    if (!construction) dust(WRITE.thumb, 18, 5, wfStruct);
    const wfNodes = g('nodes', wf); [WRITE.index[1], WRITE.index[2], WRITE.thumb[1], WRITE.thumb[2]].forEach((q) => node(q, 2.5, '', wfNodes)); node(WRITE.index[3], 2.4, 'tip', wfNodes); node(WRITE.thumb[3], 2.4, 'tip', wfNodes);
    dual(wf);
    return svg;
  }

  function background(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 1400 900'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); svg.classList.add('cel');
    const rnd = mkRnd(11);
    for (let i = 0; i < 190; i++) { const x = rnd() * 1400, y = rnd() * 900; const t = rnd(); const r = t > 0.94 ? 1.9 : t > 0.7 ? 1.3 : 0.7; const o = t > 0.94 ? 0.95 : 0.12 + rnd() * 0.55; el('circle', { class: 'bs' + (rnd() < 0.5 ? ' cy' : ''), cx: x.toFixed(1), cy: y.toFixed(1), r, style: 'opacity:' + o.toFixed(2) }, svg); }
  }

  function boot() {
    const nodes = Array.from(document.querySelectorAll('svg[data-researcher]'));
    const build = () => nodes.forEach((svg) => { let o = {}; try { o = JSON.parse(svg.dataset.researcher || '{}'); } catch (e) { o = {}; } if (!svg.id) svg.id = 'res-' + Math.random().toString(36).slice(2, 8); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); if (o.part === 'bg') background(svg); else scene(svg, o); });
    build();
    let lastMobile = window.innerWidth <= 860;
    window.addEventListener('resize', () => { const m = window.innerWidth <= 860; if (m !== lastMobile) { lastMobile = m; build(); } });
  }
  window.CGResearcher = { scene, background };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
