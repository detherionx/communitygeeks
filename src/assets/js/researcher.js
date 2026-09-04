/* Communitygeeks concept · Public Thinking · THE CELESTIAL RESEARCHER
   A presence built only from constellations holds an open field journal in
   one hand and writes into it with the other. Anatomy first (silhouette
   volumes, joints, contact points), then three celestial layers: a restrained
   translucent volume, luminous nodes at anatomical landmarks connected by thin
   constellation geometry, and sparse stellar dust inside the volume. Where a
   hand passes in front of the paper it is rendered again in teal, clipped to
   the pages, so it stays legible.

   Scroll choreography (a pure function of progress, so scrolling back unwinds):
     0.00–0.15  the holding arm resolves out of the dark
     0.12–0.30  the journal settles into the hand; the writing hand and pen arrive
     0.30–0.85  the pen writes observation 002, tip leading each stroke; the
                coral notation completes the mapped system
     0.85–1.00  the pen lifts a little; the scene holds. No loop.
   Reduced motion renders the finished scene. Decorative only: every SVG this
   builds is aria-hidden.

   Usage: <svg data-researcher='{"part":"scene","animate":true}'>   the section scene
          <svg data-researcher='{"part":"scene","view":"a"}'>        static review views
          <svg data-researcher='{"part":"bg"}'>                      background star field
          opts: mode "celestial" (default) | "construction"; view "auto" | "a" | "b" | "mobile" | "full" */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) if (a[k] !== undefined) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const mkRnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- geometry ---------------------------------------------------------------
  // Scene: viewBox 0 0 760 1000. Journal spread centred at (380,500), turned -7deg, pages 188x260 each.
  const JC = [380, 500], JA = -7 * Math.PI / 180;
  const JT = 'translate(380,500) rotate(-7)';
  const L2G = (p) => [JC[0] + p[0] * Math.cos(JA) - p[1] * Math.sin(JA), JC[1] + p[0] * Math.sin(JA) + p[1] * Math.cos(JA)];
  const PAGES = [[-190, -130], [2, -130]];
  // Writing hand frame: pen tip T (its rest pose is defined at this point), pen axis u toward the writer's elbow, side s toward the index
  const T = [442, 512], U = [0.62, 0.78], S = [0.78, -0.62];
  const P = (a, b) => [T[0] + U[0] * a + S[0] * b, T[1] + U[1] * a + S[1] * b];
  const HOLD = {
    thumb: [[240, 752], [248, 658], [270, 626], [286, 590]], thumbW: [40, 30, 26], pad: { c: [286, 590], rx: 15, ry: 12, rot: -55 },
    pinkyMcp: [176, 568], wristA: [234, 770], wristB: [168, 772],
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
  // what the pen writes on the right page (local page coordinates), in order
  const A = [40, -12], Bn = [112, -22], C = [96, 40];
  const circ = (cx, cy, r) => `M${cx + r},${cy} A${r},${r} 0 1 1 ${cx - r},${cy} A${r},${r} 0 1 1 ${cx + r},${cy}`;
  const REST = [112, 58];

  // ---- the scene -------------------------------------------------------------------
  function scene(svg, opts) {
    opts = opts || {}; const mode = opts.mode || 'celestial'; const construction = mode === 'construction';
    let view = opts.view || 'auto'; if (view === 'auto') view = window.innerWidth <= 860 ? 'mobile' : 'full';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', VIEWS[view] || VIEWS.full); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); svg.dataset.view = view;
    svg.classList.add('cel'); svg.classList.toggle('construction', construction);
    const rnd = mkRnd(23); const id = svg.id;
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: id + '-page' }, defs); const mask = el('mask', { id: id + '-off' }, defs);
    el('rect', { x: -400, y: -400, width: 1600, height: 1800, fill: '#fff' }, mask);
    const pageRects = [];
    PAGES.forEach(([x, y]) => { pageRects.push(el('rect', { x, y, width: 188, height: 260, transform: JT }, clip)); pageRects.push(el('rect', { x, y, width: 188, height: 260, transform: JT, fill: '#000' }, mask)); });
    // a group that appears in front of the paper: the original is masked off the pages, a teal clone is clipped to them.
    // Both are wrapped so the wrappers carry mask/clip in scene space and the inner groups can move freely.
    const dual = (grp) => { const parent = grp.parentNode; const off = el('g', { mask: `url(#${id}-off)` }); parent.insertBefore(off, grp); off.appendChild(grp); const on = el('g', { 'clip-path': `url(#${id}-page)` }); const clone = grp.cloneNode(true); clone.classList.add('onpage'); on.appendChild(clone); parent.insertBefore(on, off.nextSibling); return [grp, clone]; };
    const g = (cls, parent) => el('g', { class: cls }, parent || svg);
    const line = (a, b, cls, p) => el('line', { class: cls, x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1) }, p);
    const chain = (pts, cls, p) => { for (let i = 1; i < pts.length; i++) line(pts[i - 1], pts[i], cls, p); };
    const poly = (pts, cls, p) => el('polygon', { class: cls, points: pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') }, p);
    const smooth = (pts, cls, p) => { const n = pts.length; let d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; d += ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1); } return el('path', { class: cls, d: d + ' Z' }, p); };
    const node = (q, r, cls, p) => el('circle', { class: 'node' + (cls ? ' ' + cls : ''), cx: q[0].toFixed(1), cy: q[1].toFixed(1), r }, p);
    const star = (q, r, p) => { node(q, r, 'big', p); const L = r * 3.4; line([q[0] - L, q[1]], [q[0] + L, q[1]], 'ray', p); line([q[0], q[1] - L], [q[0], q[1] + L], 'ray', p); el('circle', { class: 'ring', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: (r * 2.6).toFixed(1) }, p); el('circle', { class: 'ring r2', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: (r * 4.6).toFixed(1) }, p); };
    const volume = (pts, widths, p) => { for (let i = 1; i < pts.length; i++) el('line', { class: 'vol', x1: pts[i - 1][0].toFixed(1), y1: pts[i - 1][1].toFixed(1), x2: pts[i][0].toFixed(1), y2: pts[i][1].toFixed(1), 'stroke-width': Array.isArray(widths) ? widths[i - 1] : widths }, p); };
    const dust = (pts, w, n, p) => { for (let i = 0; i < n; i++) { const seg = Math.min(pts.length - 2, Math.floor(rnd() * (pts.length - 1))); const t = rnd(); const a = pts[seg], b = pts[seg + 1]; const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; const off = (rnd() - 0.5) * w * 0.8; el('circle', { class: 'dust', cx: (x - dy / L * off).toFixed(1), cy: (y + dx / L * off).toFixed(1), r: (0.5 + rnd() * 0.9).toFixed(2), style: 'opacity:' + (0.3 + rnd() * 0.6).toFixed(2) }, p); } };

    // ===== holding arm and hand, behind the paper
    const hb = g('hand hand-hold back');
    const hbVol = g('sil', hb); smooth(HOLD.outline, 'vol-fill', hbVol);
    const hbStruct = g('struct', hb);
    line(HOLD.wristA, HOLD.wristB, 'bone', hbStruct); line(HOLD.wristA, HOLD.outline[13], 'bone faint', hbStruct); line(HOLD.wristB, HOLD.outline[0], 'bone faint', hbStruct);
    line(HOLD.armPts[0], HOLD.armPts[1], 'bone faint', hbStruct); line(HOLD.wristA, HOLD.thumb[0], 'bone faint', hbStruct); line(HOLD.thumb[0], HOLD.thumb[1], 'bone', hbStruct);
    line(HOLD.wristB, HOLD.pinkyMcp, 'bone faint', hbStruct); line(HOLD.pinkyMcp, [204, 548], 'bone faint', hbStruct);
    if (!construction) { dust([[201, 771], [146, 1005]], 66, 14, hbStruct); dust([[201, 771], [218, 690]], 60, 5, hbStruct); }
    const hbNodes = g('nodes', hb); star(HOLD.wristA, 4.4, hbNodes); node(HOLD.wristB, 3.2, 'big', hbNodes); node(HOLD.thumb[0], 3, '', hbNodes); node(HOLD.pinkyMcp, 2.6, '', hbNodes); HOLD.armPts.forEach((q) => node(q, 2.2, '', hbNodes));

    // ===== the journal
    const J = g('journal'); J.setAttribute('transform', JT);
    el('rect', { class: 'page-edge', x: -192, y: -128, width: 384, height: 262 }, J);
    el('rect', { class: 'page', x: -190, y: -130, width: 188, height: 260 }, J); el('rect', { class: 'page', x: 2, y: -130, width: 188, height: 260 }, J);
    el('rect', { class: 'spine', x: -2, y: -130, width: 4, height: 260 }, J);
    el('rect', { class: 'contact', x: -190, y: 132, width: 128, height: 7 }, J);
    el('ellipse', { class: 'contact-pad', cx: -104, cy: 78, rx: 19, ry: 14, transform: 'rotate(-50 -104 78)' }, J);
    for (let y = -104; y < 130; y += 18) { line([-178, y], [-14, y], 'rule', J); line([14, y], [178, y], 'rule', J); }
    line([-166, -130], [-166, 130], 'margin', J); line([24, -130], [24, 130], 'margin', J);
    const text = (x, y, s, cls, anchor, p) => { const t = el('text', { class: cls, x, y, 'text-anchor': anchor || 'start' }, p || J); t.textContent = s; return t; };
    // ===== journal content: the two latest published observations, read from the section's data-journal attribute
    // (built by src/_data/journalPages.js from the same piece list the ledger uses). The previous observation stands
    // complete on the left page; the newest is written on the right page by the pen. Fallback = OBS. 002 alone.
    let JD = null; try { JD = JSON.parse(svg.dataset.journal || 'null'); } catch (e) { JD = null; }
    const right = (JD && JD.right) || { obs: '002', date: '2 SEP', dateLong: '2 SEP 2026', page: 41, headline: 'PARTICIPATION', sketch: 'container', lines: ['≠ CONTAINER'] };
    const left = (JD && JD.left) || null;
    text(-160, -114, 'FIELD JOURNAL · ' + ((JD && JD.volume) || '06'), 'lbl'); text(178, -114, 'p. ' + right.page, 'lbl', 'end'); text(30, -114, right.dateLong, 'lbl'); if (left) text(-14, 122, 'p. ' + left.page, 'lbl', 'end');
    const clipText = (t, i) => { const cp = el('clipPath', { id: `${id}-t${i}` }, defs); const r = el('rect', { x: t.getAttribute('x'), y: +t.getAttribute('y') - 16, width: 0, height: 22 }, cp); const w = el('g', { 'clip-path': `url(#${id}-t${i})` }, J); w.appendChild(t); return { t, r }; };
    const ink = (q) => el('circle', { class: 'inknode', cx: q[0], cy: q[1], r: 2.2 }, J);
    const pth = (d, cls) => el('path', { class: cls || 'stroke thin', d }, J);
    const diamond = (c, a) => `M${c[0]},${c[1] - a} L${c[0] + a},${c[1]} L${c[0]},${c[1] + a} L${c[0] - a},${c[1]} Z`;
    // hand sketches in page-local x (0 = the page's left edge), journal-frame y; each returns its writing segments in
    // order. `txt` is the caller's text maker (clipped for the pen on the right page, plain on the left).
    const SKETCH = {
      reticulum(x0, txt) { const n1 = [x0 + 62, -24], n2 = [x0 + 118, -38], n3 = [x0 + 94, 14], n4 = [x0 + 146, 6];
        return [{ kind: 'node', o: ink(n1), w: 0.015 }, { kind: 'path', o: pth(`M${n1} L${n2} L${n4}`), w: 0.09 }, { kind: 'node', o: ink(n2), w: 0.015 }, { kind: 'node', o: ink(n4), w: 0.015 }, { kind: 'move', w: 0.02 },
          { kind: 'path', o: pth(`M${n1} L${n3} L${n4}`), w: 0.09 }, { kind: 'node', o: ink(n3), w: 0.015 }, { kind: 'move', w: 0.02 }, { kind: 'path', o: pth(circ(n4[0], n4[1], 8), 'coral'), w: 0.08 }]; },
      container(x0, txt) { const A = [x0 + 38, -12], B = [x0 + 110, -22], C = [x0 + 94, 40];
        return [{ kind: 'node', o: ink(A), w: 0.015 }, { kind: 'path', o: pth(`M${A} L${B}`), w: 0.07 }, { kind: 'node', o: ink(B), w: 0.015 }, { kind: 'move', w: 0.03 },
          { kind: 'path', o: pth(`M${A} Q${x0 + 44},12 ${x0 + 64},24 Q${x0 + 82},34 ${C}`), w: 0.14 }, { kind: 'node', o: ink(C), w: 0.015 }, { kind: 'move', w: 0.03 }, { kind: 'path', o: pth(circ(C[0], C[1], 9), 'coral'), w: 0.10 }]; },
      thread(x0, txt) { const s = [x0 + 34, -4], a1 = [x0 + 64, -14], a2 = [x0 + 116, 10], K = [x0 + 150, 46];
        // two guardrail apertures, their labels, then one continuous coral thread through both to the keeper
        return [{ kind: 'path', o: pth(diamond(a1, 7)), w: 0.06 }, { kind: 'move', w: 0.02 }, { kind: 'text', o: txt(x0 + 30, 36, 'GUARDRAILS', 'ink small'), w: 0.08 }, { kind: 'move', w: 0.025 },
          { kind: 'path', o: pth(diamond(a2, 7)), w: 0.06 }, { kind: 'move', w: 0.02 }, { kind: 'text', o: txt(x0 + 100, -30, 'TRUST', 'ink small'), w: 0.05 }, { kind: 'move', w: 0.03 },
          { kind: 'node', o: ink(s), w: 0.015 }, { kind: 'path', o: pth(`M${s} C${x0 + 46},-12 ${x0 + 54},-14 ${a1} C${x0 + 84},-14 ${x0 + 98},8 ${a2} C${x0 + 132},12 ${x0 + 142},30 ${K}`, 'coral'), w: 0.16 }, { kind: 'move', w: 0.02 }, { kind: 'path', o: pth(circ(K[0], K[1], 9), 'coral'), w: 0.08 }]; },
    };
    // left page: the previous observation, complete
    if (left) {
      text(-158, -84, `OBS. ${left.obs} · ${left.date}`, 'ink'); text(-158, -62, left.headline, 'ink small');
      if (SKETCH[left.sketch]) SKETCH[left.sketch](-190, (x, y, s, cls) => ({ t: text(x, y, s, cls) }));
      left.lines.forEach((s, i) => { text(-158, 64 + [0, 18, 36][i], s, 'ink small'); if (i === 0) pth('M-158,68 c30,2 60,-2 96,0'); });
    }
    // right page: the newest observation, written by the pen. Each item is one writing segment.
    let tIdx = 0; const wtxt = (x, y, s, cls) => clipText(text(x, y, s, cls), tIdx++);
    const tObs = wtxt(32, -84, `OBS. ${right.obs} · ${right.date}`, 'ink');
    const big = right.headline.length <= 15; const tHead = wtxt(32, -56, right.headline, big ? 'ink big' : 'ink');
    const uL = right.headline.length * (big ? 9.2 : 6.3) + 4;
    const under = pth(`M32,-48 c${(uL * 0.16).toFixed(1)},1.5 ${(uL * 0.35).toFixed(1)},-2 ${(uL * 0.52).toFixed(1)},-0.5 s${(uL * 0.19).toFixed(1)},1 ${(uL * 0.27).toFixed(1)},0`, 'stroke');
    const sketchSegs = SKETCH[right.sketch] ? SKETCH[right.sketch](2, wtxt) : [];
    const tLine = right.lines[0] ? wtxt(32, 74, right.lines[0], 'ink') : null;
    // the writing programme: segments with relative durations, pen moves between them
    const segs = [
      { kind: 'text', o: tObs, w: 0.10 }, { kind: 'move', w: 0.025 },
      { kind: 'text', o: tHead, w: 0.012 * right.headline.length + 0.02 }, { kind: 'move', w: 0.02 },
      { kind: 'path', o: under, w: 0.06 }, { kind: 'move', w: 0.03 },
      ...sketchSegs, { kind: 'move', w: 0.03 },
      ...(tLine ? [{ kind: 'text', o: tLine, w: 0.10 }, { kind: 'move', w: 0.03 }] : []),
      { kind: 'move', w: 0.04, to: REST },
    ];
    const total = segs.reduce((s, x) => s + x.w, 0); let acc = 0; segs.forEach((x) => { x.start = acc / total; acc += x.w; x.end = acc / total; });

    // ===== holding hand, in front of the paper: thumb and pad
    const hf = g('hand hand-hold front');
    const hfVol = g('sil', hf); volume(HOLD.thumb.slice(1), HOLD.thumbW.slice(1), hfVol); el('ellipse', { class: 'vol-fill', cx: HOLD.pad.c[0], cy: HOLD.pad.c[1], rx: HOLD.pad.rx, ry: HOLD.pad.ry, transform: `rotate(${HOLD.pad.rot} ${HOLD.pad.c[0]} ${HOLD.pad.c[1]})` }, hfVol);
    const hfStruct = g('struct', hf); chain(HOLD.thumb.slice(1), 'bone', hfStruct);
    if (!construction) dust(HOLD.thumb.slice(1), 18, 6, hfStruct);
    const hfNodes = g('nodes', hf); node(HOLD.thumb[1], 3, '', hfNodes); node(HOLD.thumb[2], 2.6, '', hfNodes); node(HOLD.thumb[3], 2.6, 'tip', hfNodes);
    const hfM = dual(hf);

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
    const wbM = dual(wb);

    // ===== the pen
    const pen = g('pen');
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
    const wfM = dual(wf);

    // ---- state: everything below is a pure function of progress p in [0,1] ----
    const lens = { path: new Map(), text: new Map() };
    const measure = () => { segs.forEach((sg) => { if (sg.kind === 'path') lens.path.set(sg.o, sg.o.getTotalLength()); else if (sg.kind === 'text') { let L = 0; try { L = sg.o.t.getComputedTextLength(); } catch (e) { L = 0; } if (!L) L = sg.o.t.textContent.length * (sg.o.t.classList.contains('big') ? 9.2 : sg.o.t.classList.contains('small') ? 5.9 : 6.3); lens.text.set(sg.o, L); } }); };
    measure();
    const setT = (m, tr, op) => { m.forEach((x) => { x.setAttribute('transform', tr); if (op !== undefined) x.style.opacity = op.toFixed(3); }); };
    const startOf = (sg) => sg.kind === 'text' ? [+sg.o.t.getAttribute('x'), +sg.o.t.getAttribute('y') - 2] : sg.kind === 'path' ? (() => { const q = sg.o.getPointAtLength(0); return [q.x, q.y]; })() : sg.kind === 'node' ? [+sg.o.getAttribute('cx'), +sg.o.getAttribute('cy')] : (sg.to || [0, 0]);
    const endOf = (sg) => sg.kind === 'text' ? [+sg.o.t.getAttribute('x') + lens.text.get(sg.o), +sg.o.t.getAttribute('y') - 2] : sg.kind === 'path' ? (() => { const q = sg.o.getPointAtLength(lens.path.get(sg.o)); return [q.x, q.y]; })() : startOf(sg);
    // where the pen tip is (local page coords), which way it moves, how far it is lifted, at writing progress w in [0,1]
    function write(w) {
      // 1) every segment's visual state (so scrolling back unwinds), 2) the active segment gives the pen its position
      let active = -1;
      for (let i = 0; i < segs.length; i++) {
        const sg = segs[i]; const u = clamp01((w - sg.start) / (sg.end - sg.start));
        if (sg.kind === 'text') { const L = lens.text.get(sg.o); sg.o.r.setAttribute('width', (L * u + (u > 0 ? 3 : 0)).toFixed(1)); }
        else if (sg.kind === 'path') { const L = lens.path.get(sg.o); const r = L * (0.5 * u + 0.5 * ease(u)); sg.o.style.strokeDasharray = L.toFixed(1); sg.o.style.strokeDashoffset = (L - r).toFixed(1); }
        else if (sg.kind === 'node') { sg.o.style.opacity = u > 0 ? '1' : '0'; }
        if (active < 0 && u < 1) active = i;
      }
      let tip = REST, tangent = [1, 0], lift = 0;
      if (active >= 0) {
        const sg = segs[active]; const u = clamp01((w - sg.start) / (sg.end - sg.start));
        if (sg.kind === 'move') {
          const from = active ? endOf(segs[active - 1]) : startOf(segs[0]); const to = sg.to || (segs[active + 1] ? startOf(segs[active + 1]) : from);
          const e = ease(u); tip = [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e]; lift = Math.sin(Math.PI * u); tangent = [to[0] - from[0], to[1] - from[1]];
        } else if (u <= 0) { tip = startOf(sg); }
        else if (sg.kind === 'text') { const L = lens.text.get(sg.o); tip = [+sg.o.t.getAttribute('x') + L * u, +sg.o.t.getAttribute('y') - 2]; }
        else if (sg.kind === 'path') { const L = lens.path.get(sg.o); const r = L * (0.5 * u + 0.5 * ease(u)); const q = sg.o.getPointAtLength(r), q0 = sg.o.getPointAtLength(Math.max(0, r - 2)); tip = [q.x, q.y]; tangent = [q.x - q0.x, q.y - q0.y]; }
        else { tip = startOf(sg); }
      }
      return { tip, tangent, lift };
    }
    function apply(p) {
      p = clamp01(p);
      const hE = ease(p / 0.15);                                        // the holding arm resolves
      setT([hb], `translate(${(-40 * (1 - hE)).toFixed(1)},${(60 * (1 - hE)).toFixed(1)})`, hE);
      const jE = ease((p - 0.12) / 0.18); const jy = 18 * (1 - jE);   // the journal settles into the hand
      J.setAttribute('transform', `translate(0,${jy.toFixed(1)}) ${JT}`); J.style.opacity = jE.toFixed(3);
      pageRects.forEach((r) => r.setAttribute('transform', `translate(0,${jy.toFixed(1)}) ${JT}`));
      setT(hfM, `translate(0,${(jy * 0.5).toFixed(1)})`, jE);
      const wE = ease((p - 0.15) / 0.15);                              // the writing hand arrives along its forearm
      const ax = 90 * (1 - wE), ay = 110 * (1 - wE);
      const w = clamp01((p - 0.30) / 0.55); const st = write(w);
      const liftE = ease((p - 0.85) / 0.15);                            // the pen lifts and rests
      const lift = Math.max(st.lift * 0.6, liftE);
      const tipG = L2G(st.tip); const dx = tipG[0] - T[0] + ax + 3 * lift, dy = tipG[1] - T[1] + ay - 7 * lift;
      const tr = `translate(${dx.toFixed(1)},${dy.toFixed(1)})`;
      setT(wbM, tr, wE); setT(wfM, tr, wE);
      const tl = Math.hypot(st.tangent[0], st.tangent[1]) || 1; const tilt = Math.max(-5, Math.min(5, (st.tangent[0] / tl) * 4 - (st.tangent[1] / tl) * 3));
      pen.setAttribute('transform', `translate(${(tipG[0] + ax + 3 * lift).toFixed(1)},${(tipG[1] + ay - 7 * lift).toFixed(1)}) rotate(${(WRITE.penAngle + tilt).toFixed(1)})`); pen.style.opacity = wE.toFixed(3);
    }
    apply(1); // built complete; the controller drives it when animated
    return { svg, apply, measure };
  }

  function background(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 1400 900'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); svg.classList.add('cel');
    const rnd = mkRnd(11);
    for (let i = 0; i < 190; i++) { const x = rnd() * 1400, y = rnd() * 900; const t = rnd(); const r = t > 0.94 ? 1.9 : t > 0.7 ? 1.3 : 0.7; const o = t > 0.94 ? 0.95 : 0.12 + rnd() * 0.55; el('circle', { class: 'bs' + (rnd() < 0.5 ? ' cy' : ''), cx: x.toFixed(1), cy: y.toFixed(1), r, style: 'opacity:' + o.toFixed(2) }, svg); }
    // faint constellation clusters in the dark space, on two layers that drift at different rates with scroll
    const CONS = {
      a: [[[120, 140], [168, 110], [214, 132], [236, 182], [190, 200]], [[1180, 200], [1230, 170], [1290, 196], [1310, 250], [1262, 268]], [[700, 800], [748, 770], [800, 790], [790, 846]]],
      b: [[[640, 90], [690, 70], [736, 104], [720, 150]], [[240, 690], [290, 650], [336, 672], [350, 720]], [[1210, 620], [1260, 592], [1318, 614], [1332, 668], [1284, 690]]],
    };
    ['a', 'b'].forEach((k) => { const g = el('g', { class: 'cons cons-' + k }, svg); CONS[k].forEach((pts) => { for (let i = 1; i < pts.length; i++) el('line', { x1: pts[i - 1][0], y1: pts[i - 1][1], x2: pts[i][0], y2: pts[i][1] }, g); pts.forEach((q, i) => el('circle', { class: i === 1 ? 'cb' : '', cx: q[0], cy: q[1], r: i === 1 ? 2.3 : 1.5 }, g)); }); });
  }

  // ---- scroll controller: progress from the field's position, measured once per layout ----
  function control(built) {
    const svg = built.svg; const field = svg.parentElement;
    if (reduceMotion) { built.apply(1); return; }
    // progress is anchored to the journal: 0 when its top edge enters at 98% of the viewport height,
    // 1 when it has risen to 10%. So the arm resolves and the book settles while they are in view.
    let top = 0, startT = 1, endT = 0, lastP = -1, queued = false;
    const progress = () => { const t = top - window.scrollY; return clamp01((startT - t) / (startT - endT)); };
    const section = field.parentElement; const bg = section ? section.querySelector('.cel-bg') : null; const consA = bg && bg.querySelector('.cons-a'), consB = bg && bg.querySelector('.cons-b');
    const drift = (p) => { if (consA) consA.setAttribute('transform', `translate(${(-8 * p).toFixed(1)},${(-46 * p).toFixed(1)})`); if (consB) consB.setAttribute('transform', `translate(${(12 * p).toFixed(1)},${(-92 * p).toFixed(1)})`); };
    const tick = () => { queued = false; const p = progress(); if (Math.abs(p - lastP) < 0.0005) return; lastP = p; built.apply(p); drift(p); };
    const measureLayout = () => { const r = field.getBoundingClientRect(); top = r.top + window.scrollY; const H = r.height, vh = window.innerHeight; const jf = svg.dataset.view === 'mobile' ? 0.035 : 0.346; startT = 0.98 * vh - jf * H; endT = 0.10 * vh - jf * H; built.measure(); lastP = -1; tick(); };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', measureLayout); window.addEventListener('load', measureLayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureLayout);
    measureLayout();
    window.__researcher = { progress, apply: built.apply }; // for QA
  }

  function boot() {
    const nodes = Array.from(document.querySelectorAll('svg[data-researcher]'));
    const build = () => nodes.forEach((svg) => { let o = {}; try { o = JSON.parse(svg.dataset.researcher || '{}'); } catch (e) { o = {}; } if (!svg.id) svg.id = 'res-' + Math.random().toString(36).slice(2, 8); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); if (o.part === 'bg') background(svg); else { const built = scene(svg, o); if (o.animate) control(built); } });
    build();
    let lastMobile = window.innerWidth <= 860;
    window.addEventListener('resize', () => { const m = window.innerWidth <= 860; if (m !== lastMobile) { lastMobile = m; build(); } });
  }
  window.CGResearcher = { scene, background };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
