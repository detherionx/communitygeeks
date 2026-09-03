// Communitygeeks: HOMEPAGE CONCEPT "Participation is a living system".
// Correction pass: the field engine drives the hero (composed inside a safe
// box, with its own mobile layout) and the System sequence (now signalling
// that the five named groups are examples, not the whole model). The
// question instrument is a separate orrery: the product at the centre,
// participant groups on offset elliptical orbits, six states for the six
// real questions. Progressive enhancement only; all copy is server-rendered.
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = () => window.matchMedia('(max-width: 860px)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const L = (a, b, t) => a + (b - a) * t;
  const seed = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const mk = (svg) => (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };

  const GROUPS = [
    { id: 'users', label: 'Users', desc: 'adoption · usage' },
    { id: 'developers', label: 'Developers', desc: 'integrations · tooling' },
    { id: 'creators', label: 'Creators', desc: 'content · education' },
    { id: 'partners', label: 'Partners', desc: 'distribution · services' },
    { id: 'advocates', label: 'Advocates', desc: 'trust · referrals' },
  ];
  const MEMBERS = 6;

  // ======================================================= FIELD ENGINE
  function createField(svg) {
    const el = mk(svg);
    const gGrid = el('g', { class: 'f-grid' });
    for (let x = 100; x < 1000; x += 100) el('line', { x1: x, y1: 0, x2: x, y2: 620 }, gGrid);
    for (let y = 100; y < 620; y += 100) el('line', { x1: 0, y1: y, x2: 1000, y2: y }, gGrid);
    const gContainers = el('g', { class: 'f-containers' });
    const containers = [0, 1, 2].map(() => ({ rect: el('rect', { class: 'f-container' }, gContainers), text: el('text', { class: 'f-ctext' }, gContainers) }));
    const gHalos = el('g', { class: 'f-halos' });
    const halos = GROUPS.map(() => el('circle', { class: 'f-halo' }, gHalos));
    const openArc = el('path', { class: 'f-open', d: 'M700,378 A72,72 0 1 0 856,452' }, gHalos);
    const gBoundary = el('g', {});
    const boundary = el('circle', { class: 'f-boundary' }, gBoundary);
    const btextIn = el('text', { class: 'f-btext' }, gBoundary); btextIn.textContent = 'owned internally';
    const btextOut = el('text', { class: 'f-btext' }, gBoundary); btextOut.textContent = 'owned externally';
    const gLinks = el('g', { class: 'f-links' });
    const links = Array.from({ length: 90 }, () => ({ el: el('line', { class: 'f-link' }, gLinks), o: 0, w: 1, value: false, dash: '' }));
    const gNodes = el('g', { class: 'f-nodes' });
    const members = [];
    GROUPS.forEach((g, gi) => { for (let k = 0; k < MEMBERS; k++) members.push({ id: g.id + k, gi, k, el: el('circle', { class: 'f-member' }, gNodes), x: 500, y: 310, r: 3, o: 0 }); });
    const hubs = GROUPS.map((g, gi) => ({ gi, el: el('circle', { class: 'f-hub' }, gNodes), x: 500, y: 310, r: 7, o: 0 }));
    // unnamed bodies: the model extends beyond the five named examples
    const extras = Array.from({ length: 8 }, () => ({ el: el('circle', { class: 'f-extra' }, gNodes), x: 500, y: 310, r: 2.5, o: 0 }));
    const gProduct = el('g', { class: 'f-product' });
    el('rect', { width: 160, height: 56 }, gProduct);
    el('rect', { class: 'f-ptick', width: 6, height: 56 }, gProduct);
    const pText = el('text', { y: 25, x: 80 }, gProduct); pText.textContent = 'YOUR PRODUCT';
    const pSub = el('text', { class: 'sub', y: 43, x: 80 }, gProduct); pSub.textContent = 'PARTICIPATION SYSTEM';
    const gLabels = el('g', { class: 'f-labels' });
    const labels = GROUPS.map((g) => { const id = el('text', { class: 'f-id' }, gLabels); const name = el('text', { class: 'f-label' }, gLabels); name.textContent = g.label; const desc = el('text', { class: 'f-desc' }, gLabels); desc.textContent = g.desc; return { id, name, desc }; });
    const gMarks = el('g', { class: 'f-marks' });
    const marks = [0, 1, 2, 3].map(() => { const t = el('text', { class: 'f-mark' }, gMarks); t.textContent = '?'; return t; });
    const annots = [0, 1, 2, 3].map(() => el('text', { class: 'f-annot' }, gMarks));

    const cur = { containers: containers.map(() => ({ x: 0, y: 0, w: 0, h: 0, o: 0 })), halos: GROUPS.map(() => ({ x: 500, y: 310, r: 0, fo: 0, so: 0 })), boundary: { o: 0, r: 0 }, product: { x: 500, y: 310, o: 0 }, labels: GROUPS.map(() => ({ x: 500, y: 310, o: 0, doff: 0, ido: 0 })), marks: marks.map(() => ({ x: 500, y: 310, o: 0 })), annots: annots.map(() => ({ x: 500, y: 310, o: 0 })), grid: 0, open: 0 };
    let target = null, time = 0, activity = 0;
    function resolve(ref) { if (ref === 'product') return cur.product; if (typeof ref === 'object') return ref; const n = ref.startsWith('hub:') ? hubs[+ref.slice(4)] : members.find((m) => m.id === ref); if (!n) return cur.product; return { x: n.x + (n.dx || 0), y: n.y + (n.dy || 0) }; }
    function step(dt) {
      if (!target) return;
      time += dt;
      const t = reduceMotion ? 1 : Math.min(1, dt * 4.2);
      members.forEach((m) => {
        const tg = target.members[m.gi][m.k];
        m.x = L(m.x, tg.x, t); m.y = L(m.y, tg.y, t); m.r = L(m.r, tg.r, t);
        let o = tg.o;
        if (activity > 0.01 && !reduceMotion) { const blink = 0.5 + 0.5 * Math.sin(time * (1.5 + seed(m.gi * 7 + m.k) * 3) + seed(m.k * 13 + m.gi) * 6.28); o = o * (1 - activity * 0.7) + o * activity * blink; }
        m.o = L(m.o, o, t);
        // slow drift (hero only): each dot breathes on its own phase, ±2.8 units, never idle-looping as a whole
        const drift = reduceMotion ? 0 : (target.drift || 0);
        m.dx = drift ? Math.sin(time * (0.35 + seed(m.gi * 7 + m.k) * 0.4) + seed(m.k * 13 + m.gi) * 6.28) * 2.8 * drift : 0;
        m.dy = drift ? Math.cos(time * (0.3 + seed(m.gi * 5 + m.k * 3) * 0.4) + seed(m.k * 17 + m.gi * 3) * 6.28) * 2.8 * drift : 0;
        m.el.setAttribute('cx', (m.x + m.dx).toFixed(1)); m.el.setAttribute('cy', (m.y + m.dy).toFixed(1)); m.el.setAttribute('r', m.r.toFixed(2)); m.el.setAttribute('fill-opacity', m.o.toFixed(3));
      });
      hubs.forEach((h) => { const tg = target.hubs[h.gi]; h.x = L(h.x, tg.x, t); h.y = L(h.y, tg.y, t); h.r = L(h.r, tg.r, t); h.o = L(h.o, tg.o, t); const drift = reduceMotion ? 0 : (target.drift || 0); h.dx = drift ? Math.sin(time * 0.28 + seed(h.gi * 11) * 6.28) * 1.4 * drift : 0; h.dy = drift ? Math.cos(time * 0.24 + seed(h.gi * 19) * 6.28) * 1.4 * drift : 0; h.el.setAttribute('cx', (h.x + h.dx).toFixed(1)); h.el.setAttribute('cy', (h.y + h.dy).toFixed(1)); h.el.setAttribute('r', h.r.toFixed(2)); h.el.setAttribute('opacity', h.o.toFixed(3)); });
      extras.forEach((x, i) => { const tg = (target.extras && target.extras[i]) || { x: x.x, y: x.y, r: 2.5, o: 0 }; x.x = L(x.x, tg.x, t); x.y = L(x.y, tg.y, t); x.r = L(x.r, tg.r, t); x.o = L(x.o, tg.o, t); x.el.setAttribute('cx', x.x.toFixed(1)); x.el.setAttribute('cy', x.y.toFixed(1)); x.el.setAttribute('r', x.r.toFixed(2)); x.el.setAttribute('opacity', x.o.toFixed(3)); });
      links.forEach((ln, i) => {
        const tg = target.links[i];
        if (!tg) { ln.o = L(ln.o, 0, t); ln.el.setAttribute('opacity', ln.o < 0.01 ? 0 : ln.o.toFixed(3)); return; }
        const a = resolve(tg.a), b = resolve(tg.b);
        ln.o = L(ln.o, tg.o, t); ln.w = L(ln.w, tg.w || 1, t);
        ln.el.setAttribute('x1', a.x.toFixed(1)); ln.el.setAttribute('y1', a.y.toFixed(1)); ln.el.setAttribute('x2', b.x.toFixed(1)); ln.el.setAttribute('y2', b.y.toFixed(1));
        ln.el.setAttribute('opacity', ln.o.toFixed(3)); ln.el.setAttribute('stroke-width', ln.w.toFixed(2));
        if (ln.value !== !!tg.value) { ln.value = !!tg.value; ln.el.classList.toggle('value', ln.value); }
        const dash = tg.dash || ''; if (ln.dash !== dash) { ln.dash = dash; if (dash) ln.el.setAttribute('stroke-dasharray', dash); else ln.el.removeAttribute('stroke-dasharray'); }
      });
      containers.forEach((c, i) => { const s = cur.containers[i], tg = target.containers[i] || { x: s.x, y: s.y, w: s.w, h: s.h, o: 0 }; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.w = L(s.w, tg.w, t); s.h = L(s.h, tg.h, t); s.o = L(s.o, tg.o, t); c.rect.setAttribute('x', s.x); c.rect.setAttribute('y', s.y); c.rect.setAttribute('width', Math.max(0, s.w)); c.rect.setAttribute('height', Math.max(0, s.h)); c.rect.setAttribute('opacity', s.o.toFixed(3)); c.text.setAttribute('x', s.x); c.text.setAttribute('y', s.y - 12); c.text.setAttribute('opacity', s.o.toFixed(3)); if (tg.label) c.text.textContent = tg.label; });
      halos.forEach((h, i) => { const s = cur.halos[i], tg = target.halos[i]; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.r = L(s.r, tg.r, t); s.fo = L(s.fo, tg.fo, t); s.so = L(s.so, tg.so, t); h.setAttribute('cx', s.x.toFixed(1)); h.setAttribute('cy', s.y.toFixed(1)); h.setAttribute('r', Math.max(0, s.r).toFixed(1)); h.setAttribute('fill-opacity', s.fo.toFixed(3)); h.setAttribute('stroke-opacity', s.so.toFixed(3)); if (tg.dash) h.setAttribute('stroke-dasharray', '4 7'); else h.removeAttribute('stroke-dasharray'); });
      cur.open = L(cur.open, target.open || 0, t); openArc.setAttribute('opacity', cur.open.toFixed(3));
      const bs = cur.boundary, bt = target.boundary || { o: 0, r: 0, x: 500, y: 310 };
      bs.o = L(bs.o, bt.o, t); bs.r = L(bs.r, bt.r, t);
      boundary.setAttribute('cx', bt.x || 500); boundary.setAttribute('cy', bt.y || 310); boundary.setAttribute('r', Math.max(0, bs.r)); boundary.setAttribute('opacity', bs.o.toFixed(3));
      btextIn.setAttribute('x', bt.x || 500); btextIn.setAttribute('y', (bt.y || 310) + 50); btextIn.setAttribute('opacity', bs.o.toFixed(3));
      btextOut.setAttribute('x', bt.x || 500); btextOut.setAttribute('y', (bt.y || 310) - bs.r - 12); btextOut.setAttribute('opacity', bs.o.toFixed(3));
      const ps = cur.product, pt = target.product; ps.x = L(ps.x, pt.x, t); ps.y = L(ps.y, pt.y, t); ps.o = L(ps.o, pt.o, t);
      gProduct.setAttribute('transform', 'translate(' + (ps.x - 80).toFixed(1) + ',' + (ps.y - 28).toFixed(1) + ')'); gProduct.setAttribute('opacity', ps.o.toFixed(3));
      labels.forEach((lb, i) => { const s = cur.labels[i], tg = target.labels[i]; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.o = L(s.o, tg.o, t); s.doff = L(s.doff, tg.desc ? 1 : 0, t); s.ido = L(s.ido, tg.id ? 1 : 0, t); lb.name.setAttribute('x', s.x.toFixed(1)); lb.name.setAttribute('y', s.y.toFixed(1)); lb.name.setAttribute('opacity', s.o.toFixed(3)); lb.desc.setAttribute('x', s.x.toFixed(1)); lb.desc.setAttribute('y', (s.y + 16).toFixed(1)); lb.desc.setAttribute('opacity', (s.o * s.doff).toFixed(3)); lb.id.setAttribute('x', s.x.toFixed(1)); lb.id.setAttribute('y', (s.y - 18).toFixed(1)); lb.id.setAttribute('opacity', (s.o * s.ido).toFixed(3)); lb.id.textContent = '0' + (i + 1); });
      marks.forEach((mkEl, i) => { const s = cur.marks[i], tg = (target.marks && target.marks[i]) || { x: s.x, y: s.y, o: 0 }; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.o = L(s.o, tg.o, t); mkEl.setAttribute('x', s.x.toFixed(1)); mkEl.setAttribute('y', s.y.toFixed(1)); mkEl.setAttribute('opacity', s.o.toFixed(3)); });
      annots.forEach((an, i) => { const s = cur.annots[i], tg = (target.annots && target.annots[i]) || { x: s.x, y: s.y, o: 0, text: an.textContent }; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.o = L(s.o, tg.o, t); if (tg.text && an.textContent !== tg.text) an.textContent = tg.text; if (tg.anchor) an.setAttribute('text-anchor', tg.anchor); an.setAttribute('x', s.x.toFixed(1)); an.setAttribute('y', s.y.toFixed(1)); an.setAttribute('opacity', s.o.toFixed(3)); });
      cur.grid = L(cur.grid, target.grid || 0, t); gGrid.setAttribute('opacity', cur.grid.toFixed(3));
      activity = L(activity, target.activity || 0, t);
    }
    return { setTarget: (l) => { target = sanitize(l); }, step };
  }

  // ------------------------------------------------------------ safe area
  // Every field layout is expressed in one 1000x620 coordinate space and
  // passed through here before it is drawn: text bounds are estimated from
  // glyph counts and clamped inside the safe area, so no label, descriptor
  // or annotation can leave the frame in any state or transition.
  const SAFE = { x0: 48, x1: 952, y0: 40, y1: 584 };
  const textW = (s, em) => (s || '').length * em;
  function clampX(x, w, anchor) {
    let left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
    if (left < SAFE.x0) left = SAFE.x0;
    if (left + w > SAFE.x1) left = SAFE.x1 - w;
    return anchor === 'start' ? left : anchor === 'end' ? left + w : left + w / 2;
  }
  const clampY = (y, size) => Math.min(Math.max(y, SAFE.y0 + size), SAFE.y1);
  function sanitize(l) {
    GROUPS.forEach((g, i) => {
      const lb = l.labels[i]; if (!lb) return;
      const w = Math.max(textW(g.label, 9.4), lb.desc ? textW(g.desc, 6.2) : 0);
      lb.x = clampX(lb.x, w, 'middle'); lb.y = clampY(lb.y, lb.id ? 30 : 13);
      if (lb.desc) lb.y = Math.min(lb.y, SAFE.y1 - 22); // the descriptor sits 16 below the name
    });
    (l.annots || []).forEach((a) => { a.anchor = a.anchor || 'middle'; a.x = clampX(a.x, textW(a.text, 7.6), a.anchor); a.y = clampY(a.y, 15); });
    (l.containers || []).forEach((c) => { const need = Math.max(c.w, textW(c.label, 10.5)); c.x = Math.max(SAFE.x0, Math.min(c.x, SAFE.x1 - need)); });
    return l;
  }

  // ------------------------------------------------------------ layouts
  const blank = () => ({ members: GROUPS.map(() => Array.from({ length: MEMBERS }, () => ({ x: 500, y: 310, r: 3, o: 0 }))), hubs: GROUPS.map(() => ({ x: 500, y: 310, r: 7, o: 0 })), links: [], containers: [], halos: GROUPS.map(() => ({ x: 500, y: 310, r: 0, fo: 0, so: 0 })), product: { x: 500, y: 310, o: 0 }, labels: GROUPS.map(() => ({ x: 500, y: 310, o: 0 })), marks: [], annots: [], extras: [], grid: 0, activity: 0, open: 0 });
  function ring(layout, gi, cx, cy, radius, jitter, r, o) { for (let k = 0; k < MEMBERS; k++) { const a = (k / MEMBERS) * Math.PI * 2 + seed(gi * 31 + k) * 0.8; const rr = radius * (0.7 + seed(gi * 17 + k * 3) * jitter); layout.members[gi][k] = { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r, o }; } }
  function hubLink(layout, gi, o, dash) { for (let k = 0; k < MEMBERS; k++) layout.links.push({ a: GROUPS[gi].id + k, b: 'hub:' + gi, o, w: 1, dash }); }
  const pent = (cx, cy, R) => GROUPS.map((g, i) => { const a = -Math.PI / 2 + (i * Math.PI * 2) / 5; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
  // the same eight unnamed bodies in every System state after the containers
  const EXTRA_POS = [[762, 420], [806, 468], [842, 372], [716, 522], [296, 176], [246, 236], [872, 292], [690, 146]];
  function extrasAt(o, r) { return EXTRA_POS.map(([x, y]) => ({ x, y, r: r || 2.6, o })); }

  function layoutContainers() {
    const l = blank();
    l.containers = [{ x: 80, y: 170, w: 250, h: 290, o: 1, label: 'A forum' }, { x: 385, y: 130, w: 250, h: 330, o: 1, label: 'A Discord server' }, { x: 690, y: 200, w: 240, h: 260, o: 1, label: 'An engagement calendar' }];
    GROUPS.forEach((g, gi) => { for (let k = 0; k < MEMBERS; k++) { const c = l.containers[(gi * MEMBERS + k) % 3]; l.members[gi][k] = { x: c.x + 24 + seed(gi * 53 + k * 7) * (c.w - 48), y: c.y + 24 + seed(gi * 11 + k * 29 + 5) * (c.h - 48), r: 3.2, o: 0.9 }; l.hubs[gi] = { x: c.x + c.w / 2, y: c.y + c.h / 2, r: 4, o: 0 }; } });
    l.activity = 1;
    return l;
  }
  const OVERLAP_CENTERS = [[320, 330], [455, 235], [575, 345], [430, 435], [665, 265]];
  function layoutOverlap(dashed) {
    const l = blank();
    OVERLAP_CENTERS.forEach(([cx, cy], gi) => { ring(l, gi, cx, cy, 58, 0.5, 3.2, 0.85); l.hubs[gi] = { x: cx, y: cy, r: 4, o: dashed ? 0.5 : 0 }; l.halos[gi] = { x: cx, y: cy, r: 118, fo: 0.07, so: dashed ? 0.7 : 0, dash: dashed }; l.labels[gi] = { x: cx, y: cy - 132, o: 1 }; });
    l.labels[3].y = OVERLAP_CENTERS[3][1] + 150;
    // the model is extensible: unnamed bodies and an open boundary, with the
    // label in its own row beneath the cluster (clamped by sanitize())
    l.extras = extrasAt(0.5);
    l.open = 0.55;
    l.annots = [{ x: 800, y: 562, o: 1, text: 'other participant groups …', anchor: 'middle' }];
    if (dashed) {
      l.marks = [{ x: 388, y: 292, o: 1 }, { x: 515, y: 300, o: 1 }, { x: 505, y: 400, o: 1 }, { x: 622, y: 306, o: 1 }];
      for (let i = 0; i < 8; i++) { const ga = i % 5, gb = (i * 3 + 1) % 5; if (ga === gb) continue; l.links.push({ a: GROUPS[ga].id + (i % MEMBERS), b: GROUPS[gb].id + ((i * 2) % MEMBERS), o: 0.22, w: 1, dash: '2 5' }); }
    }
    return l;
  }
  // Mapped stage: the survey annotation owns a dedicated row at the top
  // (y 46); every numbered group sits below it, "05" attached to Advocates.
  const MAP_CENTERS = [[270, 345], [455, 222], [640, 345], [430, 468], [730, 212]];
  function layoutMapped() {
    const l = blank();
    MAP_CENTERS.forEach(([cx, cy], gi) => { ring(l, gi, cx, cy, 58, 0.4, 3, 0.85); l.hubs[gi] = { x: cx, y: cy, r: 7, o: 1 }; l.halos[gi] = { x: cx, y: cy, r: 88, fo: 0, so: 0.3, dash: false }; l.labels[gi] = { x: cx, y: cy - 106, o: 1, id: true }; hubLink(l, gi, 0.35, '2 4'); });
    l.labels[3].y = MAP_CENTERS[3][1] + 116;
    l.grid = 1;
    l.extras = extrasAt(0.3);
    // survey row: top-right, so it clears the HTML stage list that occupies
    // the figure's top-left corner on desktop
    l.annots = [{ x: 952, y: 46, o: 1, text: 'survey · who participates, where value is created, where it breaks down', anchor: 'end' }, { x: 800, y: 562, o: 0.8, text: 'other participant groups …', anchor: 'middle' }];
    return l;
  }
  function layoutLegible(value, opts) {
    opts = opts || {};
    const l = blank();
    const C = opts.center || [500, 318];
    const pts = pent(C[0], C[1], opts.R || 210);
    pts.forEach(([cx, cy], gi) => {
      ring(l, gi, cx, cy, opts.ringR || 46, 0.35, 3, 0.9);
      l.hubs[gi] = { x: cx, y: cy, r: 8, o: 1 };
      l.halos[gi] = { x: cx, y: cy, r: 0, fo: 0, so: 0 };
      const above = cy < C[1];
      l.labels[gi] = { x: cx, y: above ? cy - 78 : cy + 88, o: 1, desc: true, id: false };
      hubLink(l, gi, 0.4);
      l.links.push({ a: 'hub:' + gi, b: 'product', o: value ? 0.95 : 0.6, w: value ? 2.4 : 1.2, value: !!value });
      l.links.push({ a: 'hub:' + gi, b: 'hub:' + ((gi + 1) % 5), o: 0.25, w: 1 });
    });
    l.product = { x: C[0], y: C[1], o: 1 };
    l.grid = opts.grid == null ? 0.5 : opts.grid;
    // a faint outer set keeps the resolved system open-ended
    l.extras = [[170, 150], [860, 130], [900, 470], [120, 480], [520, 40]].map(([x, y]) => ({ x, y, r: 2.4, o: value ? 0.35 : 0.28 }));
    l.annots = [{ x: 900, y: 520, o: 0.7, text: 'other participant groups …', anchor: 'end' }];
    if (value) l.annots.push({ x: C[0], y: C[1] - 60, o: 1, text: 'gather · contribute · connect · create value', anchor: 'middle' });
    return l;
  }
  // HERO: every named group, its label and its members sit inside the
  // viewBox with ≥40 units of clearance; the SVG box itself keeps the
  // safe area from the bar and edges (see field.css). Mobile gets its own
  // spread across the full width because no text sits beside it there.
  const HERO_DESKTOP = [[600, 140], [860, 240], [840, 480], [600, 485], [470, 320]];
  const HERO_MOBILE = [[190, 150], [500, 110], [820, 160], [320, 450], [720, 470]];
  // s = normalised scroll progress through the hero (0 at the top, 1 as it
  // leaves). The assembly rotates about its centroid and rides a shallow arc
  // across the empty field; labels and relationships follow. Sanitize keeps
  // every label inside the frame in every state.
  // Orbital choreography. e = eased scroll progress, k = internal scale about
  // the centroid. The assembly rotates about its own centre (42° desktop, 10°
  // mobile) while the route (--hx/--hy, computed in update()) carries the
  // whole SVG up and then left across the open field. Labels stay upright
  // because they are positioned per hub, never rotated.
  const heroCentroid = (base) => [base.reduce((a, c) => a + c[0], 0) / base.length, base.reduce((a, c) => a + c[1], 0) / base.length];
  function heroHubs(mobile, e, k) {
    const base = mobile ? HERO_MOBILE : HERO_DESKTOP; const [cxm, cym] = heroCentroid(base);
    const rot = (mobile ? 10 : 42) * e * Math.PI / 180, cosR = Math.cos(rot), sinR = Math.sin(rot);
    return base.map(([x, y]) => { const rx = (x - cxm) * k, ry = (y - cym) * k; return [cxm + rx * cosR - ry * sinR, cym + rx * sinR + ry * cosR]; });
  }
  function layoutHero(p, mobile, e, k) {
    const l = blank();
    e = e || 0; k = k == null ? 1 : k;
    const moved = heroHubs(mobile, e, k);
    moved.forEach(([cx, cy], gi) => {
      const spread = (80 - 34 * p) * (0.72 + 0.28 * k);
      ring(l, gi, cx, cy, spread, 0.5, 3.2, 0.55 + 0.4 * p);
      l.hubs[gi] = { x: cx, y: cy, r: 7, o: p };
      l.labels[gi] = { x: cx, y: cy - 62, o: Math.max(0, (p - 0.55) / 0.45), desc: k > 0.6 }; // descriptors fade out once the assembly is compact, so names never collide with them
      hubLink(l, gi, 0.35 * p);
      l.links.push({ a: 'hub:' + gi, b: 'hub:' + ((gi + 1) % 5), o: 0.35 * Math.max(0, (p - 0.3) / 0.7), w: 1 });
      l.links.push({ a: 'hub:' + gi, b: 'hub:' + ((gi + 2) % 5), o: 0.18 * Math.max(0, (p - 0.5) / 0.5), w: 1 });
    });
    l.grid = 0.25 + 0.55 * p;
    l.drift = p; // the field keeps breathing after it has connected
    return l;
  }

  // ======================================================= ORRERY
  // Product at the centre; participant groups on offset elliptical orbits;
  // a faint outer orbit carries unnamed bodies (groups specific to the
  // product). Six states, one per real question. Nothing here is a
  // measurement: positions and emphasis are the argument of each question.
  function createOrrery(svg) {
    const el = mk(svg);
    const C = { x: 340, y: 290 };
    const ORBITS = [
      { rx: 104, ry: 62, rot: -15, dx: -12, dy: 4 },
      { rx: 164, ry: 96, rot: 20, dx: 8, dy: 6 },
      { rx: 214, ry: 118, rot: -8, dx: -18, dy: 10 },
      { rx: 260, ry: 150, rot: 12, dx: 14, dy: -6 },
      { rx: 288, ry: 190, rot: -22, dx: -8, dy: 2 },
    ];
    const OUTER = { rx: 316, ry: 214, rot: 5, dx: 0, dy: 0 };
    const rad = (d) => d * Math.PI / 180;
    function pos(o, th, off) {
      const c = Math.cos(rad(o.rot)), s = Math.sin(rad(o.rot));
      const ex = o.rx * Math.cos(th), ey = o.ry * Math.sin(th);
      let x = C.x + o.dx + ex * c - ey * s, y = C.y + o.dy + ex * s + ey * c;
      if (off) { const nx = x - (C.x + o.dx), ny = y - (C.y + o.dy); const n = Math.hypot(nx, ny) || 1; x += nx / n * off; y += ny / n * off; }
      return { x, y };
    }
    // regions (question 4)
    const gRegions = el('g', { class: 'o-regions' });
    const regInner = el('circle', { class: 'o-region', cx: C.x, cy: C.y, r: 126 }, gRegions);
    const regShared = el('circle', { class: 'o-region o-region-shared', cx: C.x, cy: C.y, r: 212 }, gRegions);
    const regLabels = [['owned internally', C.x, C.y - 104], ['shared', C.x, C.y - 190], ['owned externally', C.x, C.y - 236]].map(([tx, x, y]) => { const t = el('text', { class: 'o-region-label', x, y, 'text-anchor': 'middle' }, gRegions); t.textContent = tx; return t; });
    // orbits
    const gOrbits = el('g', { class: 'o-orbits' });
    const orbitEls = ORBITS.map((o) => el('ellipse', { class: 'o-orbit', cx: C.x + o.dx, cy: C.y + o.dy, rx: o.rx, ry: o.ry, transform: 'rotate(' + o.rot + ' ' + (C.x + o.dx) + ' ' + (C.y + o.dy) + ')' }, gOrbits));
    const outerEl = el('ellipse', { class: 'o-orbit o-orbit-outer', cx: C.x, cy: C.y, rx: OUTER.rx, ry: OUTER.ry, transform: 'rotate(' + OUTER.rot + ' ' + C.x + ' ' + C.y + ')' }, gOrbits);
    // lenses (shared space) + intersection marks
    const gMarks = el('g', {});
    const lenses = [0, 1, 2, 3].map(() => el('circle', { class: 'o-lens', r: 0 }, gMarks));
    const markEls = [0, 1, 2, 3].map(() => el('circle', { class: 'o-mark', r: 7 }, gMarks));
    // trails (signals) and departures
    const gTrails = el('g', {});
    const trails = Array.from({ length: 8 }, () => ({ path: el('path', { class: 'o-trail' }, gTrails), end: el('circle', { class: 'o-trail-end', r: 3 }, gTrails), o: 0 }));
    const departs = [0, 1].map(() => el('path', { class: 'o-depart' }, gTrails));
    // product
    const gProduct = el('g', { class: 'o-product' });
    el('circle', { cx: C.x, cy: C.y, r: 30 }, gProduct);
    el('circle', { class: 'o-product-ring', cx: C.x, cy: C.y, r: 40 }, gProduct);
    const pt1 = el('text', { x: C.x, y: C.y - 4 }, gProduct); pt1.textContent = 'YOUR';
    const pt2 = el('text', { x: C.x, y: C.y + 11 }, gProduct); pt2.textContent = 'PRODUCT';
    // bodies
    const gBodies = el('g', {});
    const bodies = GROUPS.map((g, i) => ({ i, circle: el('circle', { class: 'o-body' }, gBodies), label: el('text', { class: 'o-body-label' }, gBodies), th: rad(-100 + i * 70), r: 7, o: 1, off: 0 }));
    bodies.forEach((b, i) => { b.label.textContent = GROUPS[i].label; });
    const extrasEl = [0, 1, 2].map(() => el('circle', { class: 'o-extra', r: 3 }, gBodies));
    const extraLabel = el('text', { class: 'o-extra-label' }, gBodies); extraLabel.textContent = 'other participant groups …';
    const caption = el('text', { class: 'o-caption', x: C.x, y: 546, 'text-anchor': 'middle' }, gBodies);

    const cur = { orbits: ORBITS.map(() => ({ o: 0.4, w: 1 })), outer: 0.35, regions: 0, lenses: [0, 1, 2, 3].map(() => ({ x: C.x, y: C.y, r: 0, o: 0 })), marks: [0, 1, 2, 3].map(() => ({ x: C.x, y: C.y, o: 0, filled: 0 })), extras: 0.6, departs: [0, 0], caption: 0 };
    let target = null;
    const EXTRA_TH = [rad(50), rad(170), rad(285)];

    // orbital intersections, found once by sampling
    function intersections(a, b) {
      let best = [];
      for (let i = 0; i < 360; i += 2) { const p = pos(ORBITS[a], rad(i)); let dmin = 1e9, tj = 0; for (let j = 0; j < 360; j += 2) { const q = pos(ORBITS[b], rad(j)); const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < dmin) { dmin = d; tj = j; } } if (dmin < 3.5) best.push({ x: p.x, y: p.y, ta: rad(i), tb: rad(tj), d: dmin }); }
      // de-duplicate clusters
      const out = []; best.forEach((c) => { if (!out.some((o) => Math.hypot(o.x - c.x, o.y - c.y) < 30)) out.push(c); });
      return out;
    }
    const X01 = intersections(0, 1), X12 = intersections(1, 2), X23 = intersections(2, 3), X34 = intersections(3, 4);
    const pick = (arr, k) => arr[k % Math.max(1, arr.length)] || { x: C.x, y: C.y, ta: 0, tb: 0 };

    const BASE_TH = [rad(-100), rad(200), rad(20), rad(140), rad(-30)];
    function state(q) {
      const s = { th: BASE_TH.slice(), r: [7, 7, 7, 7, 7], o: [1, 1, 1, 1, 1], off: [0, 0, 0, 0, 0], orbits: ORBITS.map(() => ({ o: 0.45, w: 1, dash: '' })), outer: 0.3, regions: 0, lenses: [], marks: [], trails: [], departs: [0, 0], extras: 0.55, extraLabel: 0.7, caption: '' };
      switch (q) {
        case 0: s.extras = 0.8; s.extraLabel = 1; s.caption = 'bodies present across several orbits · and others specific to the product'; break;
        case 1: s.trails = bodies.map((b, i) => ({ from: i, to: 'product', o: 0.9 })); s.trails.push({ from: 2, to: 4, o: 0.5 }, { from: 0, to: 1, o: 0.5 }); s.extras = 0.3; s.extraLabel = 0; s.caption = 'exchange paths · what each group contributes'; break;
        case 2: { const a = pick(X01, 0), b = pick(X23, 0), c = pick(X34, 1), d = pick(X12, 0); s.th[0] = a.ta; s.th[1] = a.tb; s.th[2] = b.ta; s.th[3] = b.tb; s.th[4] = c.tb; s.lenses = [{ x: a.x, y: a.y, r: 34, o: 1 }, { x: b.x, y: b.y, r: 34, o: 1 }, { x: c.x, y: c.y, r: 26, o: 0.7 }, { x: d.x, y: d.y, r: 26, o: 0.7 }]; s.marks = [a, b, c, d].map((m) => ({ x: m.x, y: m.y, o: 1, filled: 0 })); s.extras = 0.3; s.extraLabel = 0; s.caption = 'orbital intersections · where groups actually meet'; break; }
        case 3: s.regions = 1; s.orbits.forEach((o) => { o.o = 0.3; }); s.extras = 0.4; s.extraLabel = 0; s.caption = 'internal · shared · external'; break;
        case 4: { const dist = bodies.map((b, i) => { const p = pos(ORBITS[i], BASE_TH[i]); return { i, d: Math.hypot(p.x - C.x, p.y - C.y) }; }).sort((a, b) => a.d - b.d); const hot = [dist[0].i, dist[1].i]; ORBITS.forEach((o, i) => { const on = hot.includes(i); s.orbits[i] = { o: on ? 0.95 : 0.18, w: on ? 2.2 : 1, dash: '' }; s.r[i] = on ? 10 : 5; s.o[i] = on ? 1 : 0.45; }); s.trails = hot.map((i) => ({ from: i, to: 'product', o: 1, w: 2 })); s.extras = 0.2; s.extraLabel = 0; s.caption = 'emphasis · the relationships gaining weight'; break; }
        case 5: { s.off[1] = 46; s.off[3] = 38; s.o[1] = 0.7; s.o[3] = 0.7; s.orbits[2] = { o: 0.45, w: 1, dash: '160 46' }; s.orbits[1].o = 0.25; s.orbits[3].o = 0.25; s.departs = [1, 1]; const m = pick(X23, 1); s.marks = [{ x: m.x, y: m.y, o: 1, filled: 0 }]; s.trails = [{ from: 0, to: 'product', o: 0.35, dashed: true }]; s.extras = 0.25; s.extraLabel = 0; s.caption = 'drift · interrupted trajectories · signal loss'; break; }
      }
      return s;
    }
    function angleLerp(a, b, t) { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
    function step(dt) {
      if (!target) return;
      const t = reduceMotion ? 1 : Math.min(1, dt * 3.6);
      const P = [];
      bodies.forEach((b, i) => {
        b.th = angleLerp(b.th, target.th[i], t); b.r = L(b.r, target.r[i], t); b.o = L(b.o, target.o[i], t); b.off = L(b.off, target.off[i], t);
        const p = pos(ORBITS[i], b.th, b.off); P.push(p);
        b.circle.setAttribute('cx', p.x.toFixed(1)); b.circle.setAttribute('cy', p.y.toFixed(1)); b.circle.setAttribute('r', b.r.toFixed(2)); b.circle.setAttribute('opacity', b.o.toFixed(3));
      });
      // labels sit on the side away from the product; when two bodies meet
      // (intersections), the later one takes the opposite side so the two
      // names never overprint
      bodies.forEach((b, i) => {
        const p = P[i]; let right = p.x >= C.x;
        for (let j = 0; j < i; j++) { if (Math.hypot(P[j].x - p.x, P[j].y - p.y) < 40) { right = !(P[j].x >= C.x); break; } }
        b.label.setAttribute('x', (p.x + (right ? 14 : -14)).toFixed(1)); b.label.setAttribute('y', (p.y + 4.5).toFixed(1)); b.label.setAttribute('text-anchor', right ? 'start' : 'end'); b.label.setAttribute('opacity', b.o.toFixed(3));
      });
      [1, 3].forEach((bi, k) => { const d = departs[k]; const from = pos(ORBITS[bi], bodies[bi].th, 0); const to = P[bi]; cur.departs[k] = L(cur.departs[k], target.departs[k], t); d.setAttribute('d', 'M' + from.x.toFixed(1) + ',' + from.y.toFixed(1) + ' L' + to.x.toFixed(1) + ',' + to.y.toFixed(1)); d.setAttribute('opacity', cur.departs[k].toFixed(3)); });
      ORBITS.forEach((o, i) => { const s = cur.orbits[i], tg = target.orbits[i]; s.o = L(s.o, tg.o, t); s.w = L(s.w, tg.w, t); orbitEls[i].setAttribute('stroke-opacity', s.o.toFixed(3)); orbitEls[i].setAttribute('stroke-width', s.w.toFixed(2)); if (tg.dash) orbitEls[i].setAttribute('stroke-dasharray', tg.dash); else orbitEls[i].removeAttribute('stroke-dasharray'); });
      cur.outer = L(cur.outer, target.outer, t); outerEl.setAttribute('stroke-opacity', cur.outer.toFixed(3));
      cur.regions = L(cur.regions, target.regions, t); gRegions.setAttribute('opacity', cur.regions.toFixed(3));
      lenses.forEach((le, i) => { const s = cur.lenses[i], tg = target.lenses[i] || { x: s.x, y: s.y, r: 0, o: 0 }; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.r = L(s.r, tg.r, t); s.o = L(s.o, tg.o, t); le.setAttribute('cx', s.x.toFixed(1)); le.setAttribute('cy', s.y.toFixed(1)); le.setAttribute('r', Math.max(0, s.r).toFixed(1)); le.setAttribute('opacity', s.o.toFixed(3)); });
      markEls.forEach((me, i) => { const s = cur.marks[i], tg = target.marks[i] || { x: s.x, y: s.y, o: 0, filled: 0 }; s.x = L(s.x, tg.x, t); s.y = L(s.y, tg.y, t); s.o = L(s.o, tg.o, t); me.setAttribute('cx', s.x.toFixed(1)); me.setAttribute('cy', s.y.toFixed(1)); me.setAttribute('opacity', s.o.toFixed(3)); });
      trails.forEach((tr, i) => { const tg = target.trails[i]; if (!tg) { tr.o = L(tr.o, 0, t); tr.path.setAttribute('opacity', tr.o.toFixed(3)); tr.end.setAttribute('opacity', tr.o.toFixed(3)); return; } const a = P[tg.from]; const b = tg.to === 'product' ? C : P[tg.to]; const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.18, my = (a.y + b.y) / 2 - (b.x - a.x) * 0.18; tr.o = L(tr.o, tg.o, t); tr.path.setAttribute('d', 'M' + a.x.toFixed(1) + ',' + a.y.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + b.x.toFixed(1) + ',' + b.y.toFixed(1)); tr.path.setAttribute('opacity', tr.o.toFixed(3)); tr.path.setAttribute('stroke-width', tg.w || 1.2); tr.path.setAttribute('stroke-dasharray', tg.dashed ? '2 8' : '5 5'); const ex = b === C ? C.x + (a.x - C.x) / Math.hypot(a.x - C.x, a.y - C.y) * 44 : b.x; const ey = b === C ? C.y + (a.y - C.y) / Math.hypot(a.x - C.x, a.y - C.y) * 44 : b.y; tr.end.setAttribute('cx', ex.toFixed(1)); tr.end.setAttribute('cy', ey.toFixed(1)); tr.end.setAttribute('opacity', tr.o.toFixed(3)); });
      cur.extras = L(cur.extras, target.extras, t);
      extrasEl.forEach((x, i) => { const p = pos(OUTER, EXTRA_TH[i]); x.setAttribute('cx', p.x.toFixed(1)); x.setAttribute('cy', p.y.toFixed(1)); x.setAttribute('opacity', cur.extras.toFixed(3)); });
      // the "other groups" label keeps ≥48 units from the frame: it flips to
      // the left of its body if the right side would run out of room
      const lp = pos(OUTER, EXTRA_TH[0]); const vb = svg.viewBox.baseVal; const lw = extraLabel.textContent.length * 7.2;
      const fitsRight = lp.x + 12 + lw <= vb.x + vb.width - 48;
      extraLabel.setAttribute('x', (fitsRight ? lp.x + 12 : lp.x - 12).toFixed(1)); extraLabel.setAttribute('text-anchor', fitsRight ? 'start' : 'end'); extraLabel.setAttribute('y', (lp.y + 4).toFixed(1)); extraLabel.setAttribute('opacity', L(parseFloat(extraLabel.getAttribute('opacity') || '0'), target.extraLabel, t).toFixed(3));
      if (caption.textContent !== target.caption) { caption.textContent = target.caption; }
    }
    return { setState: (q) => { target = state(q); }, step };
  }

  // ======================================================= ORBIT FIELD (System)
  // Approved 2026-09-03 (A-11, Study D): the six System states in one orbital
  // vocabulary. Disc = participant group, ellipse = relationship path,
  // rectangle = constructed thing, coral = the one active signal. Geometry is
  // SVG; every label is an HTML element positioned over the SVG box by the
  // same 1000x620 coordinates and clamped to the safe area. Stage 6 is the
  // single path: all five orbits converge on one ellipse.
  function createOrbitField(svg, labelLayer) {
    const el = mk(svg);
    const rad = (d) => d * Math.PI / 180;
    const ept = (o, t) => { const c = Math.cos(rad(o.rot)), s = Math.sin(rad(o.rot)); const x = o.rx * Math.cos(t), y = o.ry * Math.sin(t); return [o.cx + x * c - y * s, o.cy + x * s + y * c]; };
    const CONT = [[110, 190, 220, 250, 'A forum'], [390, 190, 220, 250, 'A Discord server'], [670, 190, 220, 250, 'An engagement calendar']];
    const ORB = [
      { cx: 400, cy: 300, rx: 150, ry: 78, rot: -25, t: 190 },
      { cx: 520, cy: 235, rx: 150, ry: 85, rot: 20, t: 275 },
      { cx: 645, cy: 300, rx: 145, ry: 80, rot: -35, t: 350 },
      { cx: 480, cy: 400, rx: 160, ry: 70, rot: 10, t: 80 },
      { cx: 625, cy: 405, rx: 135, ry: 85, rot: 55, t: -22 },
    ];
    const OTHER = { cx: 900, cy: 430, rx: 210, ry: 100, rot: -25 };
    const ONE = { cx: 500, cy: 318, rx: 372, ry: 200, rot: -10 };
    const ONE_T = [-128, -62, 8, 96, 166];
    const PRODUCT = { x: 500, y: 320 };
    // stage 5, "relationships legible": every path passes through the product,
    // each group sits at the far end of its own path (a rosette, not nested rings)
    const ROSE = [{ rx: 150, ry: 62, phi: 200 }, { rx: 118, ry: 56, phi: 262 }, { rx: 150, ry: 66, phi: 330 }, { rx: 120, ry: 56, phi: 118 }, { rx: 150, ry: 64, phi: 44 }].map((r) => ({ cx: PRODUCT.x + r.rx * Math.cos(rad(r.phi)), cy: PRODUCT.y + r.rx * Math.sin(rad(r.phi)), rx: r.rx, ry: r.ry, rot: r.phi, t: 0 }));
    // ownership marks: where two paths cross and no group sits (computed once)
    const discPts = ORB.map((o) => ept(o, rad(o.t)));
    let cross = [];
    for (let i = 0; i < ORB.length; i++) for (let j = i + 1; j < ORB.length; j++) for (let a = 0; a < 720; a++) { const p = ept(ORB[i], a / 720 * Math.PI * 2); for (let b = 0; b < 720; b += 2) { const q = ept(ORB[j], b / 720 * Math.PI * 2); if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 1.6 && !cross.some((c) => Math.hypot(c.x - p[0], c.y - p[1]) < 40)) cross.push({ x: p[0], y: p[1] }); } }
    cross = cross.filter((m) => discPts.every(([x, y]) => Math.hypot(x - m.x, y - m.y) > 70) && m.x > 90 && m.x < 900 && m.y > 90 && m.y < 560 && !(m.x < 340 && m.y > 480));
    const MARKS = []; cross.forEach((m) => { if (MARKS.length < 4 && MARKS.every((c) => Math.hypot(c.x - m.x, c.y - m.y) > 110)) MARKS.push(m); }); while (MARKS.length < 4) MARKS.push({ x: 500, y: 320 });
    // ---- SVG elements
    const gGrid = el('g', { class: 'ob-grid' }); for (let x = 161; x < 952; x += 113) el('line', { x1: x, y1: 40, x2: x, y2: 584 }, gGrid); for (let y = 153; y < 584; y += 113) el('line', { x1: 48, y1: y, x2: 952, y2: y }, gGrid);
    const gCont = el('g', { class: 'ob-containers' }); const contEls = CONT.map(([x, y, w, h]) => el('rect', { class: 'ob-container', x, y, width: w, height: h }, gCont));
    const dotEls = []; CONT.forEach(([x, y, w, h], bi) => { for (let k = 0; k < 9; k++) dotEls.push(el('circle', { class: 'ob-dot', cx: (x + 24 + seed(bi * 53 + k * 7) * (w - 48)).toFixed(1), cy: (y + 24 + seed(bi * 11 + k * 29 + 5) * (h - 48)).toFixed(1), r: 3.2 }, gCont)); });
    const otherEl = el('ellipse', { class: 'ob-other', cx: OTHER.cx, cy: OTHER.cy, rx: OTHER.rx, ry: OTHER.ry, transform: 'rotate(' + OTHER.rot + ' ' + OTHER.cx + ' ' + OTHER.cy + ')' });
    const otherBodies = [0.3, 0.6].map((f) => { const pts = []; for (let i = 0; i < 720; i++) { const [x, y] = ept(OTHER, i / 720 * Math.PI * 2); if (x > 30 && x < 970 && y > 30 && y < 590) pts.push([x, y]); } const p = pts[Math.floor(f * (pts.length - 1))]; return el('circle', { class: 'ob-body', cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4 }); });
    const gOrb = el('g', { class: 'ob-orbits' }); const orbEls = ORB.map(() => el('ellipse', { class: 'ob-orbit' }, gOrb));
    const gArcs = el('g', { class: 'ob-arcs' });
    const onePts = ONE_T.map((d) => ept(ONE, rad(d)));
    const arcEls = [[0, 1], [1, 2], [3, 2], [4, 0], [4, 3]].map(([a, b]) => { const [x1, y1] = onePts[a], [x2, y2] = onePts[b]; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const qx = mx + (ONE.cx - mx) * 0.55, qy = my + (ONE.cy - my) * 0.55; const p = el('path', { class: 'ob-arc', d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + qx.toFixed(1) + ' ' + qy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) }, gArcs); const len = p.getTotalLength ? p.getTotalLength() : 400; p.setAttribute('stroke-dasharray', len); p.setAttribute('stroke-dashoffset', len); p.dataset.len = len; return p; });
    const gTicks = el('g', { class: 'ob-ticks' }); const tickEls = ORB.map((o) => { const [x1, y1] = ept(o, rad(o.t)); const [x2, y2] = ept({ cx: o.cx, cy: o.cy, rx: o.rx + 14, ry: o.ry + 14, rot: o.rot }, rad(o.t)); return el('line', { class: 'ob-tick', x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) }, gTicks); });
    const gProd = el('g', { class: 'ob-product' }); el('rect', { x: -75, y: -23, width: 150, height: 46 }, gProd); const pText = el('text', { x: 0, y: 5 }, gProd); pText.textContent = 'YOUR PRODUCT';
    const gMarks = el('g', { class: 'ob-marks' }); const markEls = MARKS.map(() => { const g = el('g', {}, gMarks); el('circle', { class: 'ob-mark', r: 17 }, g); const q = el('text', { class: 'ob-q', y: 10 }, g); q.textContent = '?'; return g; });
    const gDiscs = el('g', { class: 'ob-discs' }); const discEls = ORB.map(() => el('circle', { class: 'ob-disc', r: 11 }, gDiscs));
    // ---- HTML labels
    const mkLabel = (cls) => { const s = document.createElement('span'); s.className = 'nl ' + cls + ' nl-m'; s.style.opacity = '0'; labelLayer.appendChild(s); return s; };
    const groupLabels = GROUPS.map((g) => { const s = mkLabel('nl-group'); s.textContent = g.label.toUpperCase(); return s; });
    const contLabels = CONT.map((c) => { const s = mkLabel('nl-cont'); s.textContent = c[4].toUpperCase(); s.className += ' nl-s'; s.classList.remove('nl-m'); return s; });
    const annotEls = [0, 1].map(() => mkLabel('nl-annot'));
    const placeLabel = (s, st) => { s.style.left = (st.x / 10).toFixed(2) + '%'; s.style.top = (st.y / 6.2).toFixed(2) + '%'; s.style.opacity = st.o.toFixed(3); const a = st.anchor || 'middle'; s.classList.toggle('nl-s', a === 'start'); s.classList.toggle('nl-e', a === 'end'); s.classList.toggle('nl-m', a === 'middle'); };
    // ---- states
    const orbState = (o, on, w) => ({ cx: o.cx, cy: o.cy, rx: o.rx, ry: o.ry, rot: o.rot, o: on, w: w || 1 });
    const VIEWS = ['90 150 820 330', '220 120 560 420', '220 120 560 420', '250 100 580 430', '140 40 720 540', '80 80 840 480'];
    function stage(i) {
      const S = { grid: 0, conts: 0, dots: 0, other: 0, orbits: [], arcs: 0, product: 0, ticks: 0, marks: MARKS.map((m) => ({ x: m.x, y: m.y, o: 0 })), discs: [], labels: [], contLabels: 0, annots: [{ x: 944, y: 578, o: 0, text: 'other participant groups …', anchor: 'end' }, { x: 944, y: 78, o: 0, text: '', anchor: 'end' }], view: VIEWS[i] };
      if (i === 0) {
        S.conts = 1; S.dots = 0.9; S.contLabels = 1;
        S.orbits = ORB.map((o, k) => { const c = CONT[k % 3]; return { cx: c[0] + c[2] / 2, cy: c[1] + c[3] / 2, rx: 6, ry: 6, rot: o.rot, o: 0, w: 1 }; });
        S.discs = ORB.map((o, k) => { const c = CONT[k % 3]; return { x: c[0] + c[2] / 2, y: c[1] + c[3] / 2, o: 0 }; });
        S.labels = GROUPS.map(() => ({ x: 500, y: 310, o: 0, text: '' }));
        return S;
      }
      const orbs = i === 4 ? ROSE : i === 5 ? ORB.map((o, k) => Object.assign({}, ONE, { t: ONE_T[k] })) : ORB;
      S.orbits = orbs.map((o) => orbState(o, i === 3 ? 0.85 : i >= 4 ? 0.8 : 0.6, i === 3 ? 1.4 : i === 5 ? 1.5 : i === 4 ? 1.2 : 1));
      S.other = 1;
      S.discs = orbs.map((o) => { const [x, y] = ept(o, rad(o.t)); return { x, y, o: 1 }; });
      const centre = i >= 4 ? PRODUCT : { x: 520, y: 320 };
      S.labels = S.discs.map((d, k) => { const dx = d.x - centre.x, dy = d.y - centre.y, n = Math.hypot(dx, dy) || 1; let x = d.x + dx / n * 30, y = d.y + dy / n * 30, anchor = Math.abs(dx) < 50 ? 'middle' : dx > 0 ? 'start' : 'end'; if (i === 5 && d.x > 780) { anchor = 'middle'; x = d.x; y = d.y + 34; } if (i === 5 && d.x < 380 && d.y > 380) { anchor = 'middle'; x = d.x; y = d.y - 32; } if (i === 4) { anchor = 'middle'; y = d.y + (dy > 0 ? 34 : -30); x = d.x; } return { x, y, o: 1, anchor, text: (i === 3 ? '0' + (k + 1) + ' ' : '') + GROUPS[k].label.toUpperCase() }; });
      S.annots[0].o = 0.85;
      if (i === 2) S.marks = MARKS.map((m) => ({ x: m.x, y: m.y, o: 1 }));
      if (i === 3) { S.grid = 1; S.product = 1; S.ticks = 1; S.annots[1] = { x: 944, y: 78, o: 1, text: 'survey · who participates, where value is created, where it breaks down', anchor: 'end' }; }
      if (i === 4) { S.grid = 0.4; S.product = 1; S.annots[0] = { x: 944, y: 78, o: 0.85, text: 'other participant groups …', anchor: 'end' }; }
      if (i === 5) { S.product = 1; S.arcs = 1; S.annots[1] = { x: 500, y: 258, o: 1, text: 'gather · contribute · connect · create value', anchor: 'middle' }; }
      // clamp every label into the safe area
      S.labels.forEach((lb) => { const w = textW(lb.text, 9.4); lb.x = clampX(lb.x, w, lb.anchor); lb.y = clampY(lb.y, 13); });
      S.annots.forEach((a) => { if (a.text) { a.x = clampX(a.x, textW(a.text, 7.6), a.anchor); a.y = clampY(a.y, 15); } });
      return S;
    }
    // ---- interpolation
    const cur = stage(0); cur.orbits.forEach((o) => { o.o = 0; }); cur.arcs = 0; cur.conts = 0; cur.dots = 0; cur.contLabels = 0;
    let target = null, lastStage = 0;
    const normRot = (from, to) => { let r = to; while (r - from > 90) r -= 180; while (r - from < -90) r += 180; return r; };
    function setStage(i) {
      lastStage = i; target = stage(i);
      target.orbits.forEach((o, k) => { o.rot = normRot(cur.orbits[k].rot, o.rot); });
      svg.setAttribute('viewBox', narrow() ? target.view : '0 0 1000 620');
      return target;
    }
    window.addEventListener('resize', () => { if (target) svg.setAttribute('viewBox', narrow() ? target.view : '0 0 1000 620'); });
    function step(dt) {
      if (!target) return; const t = reduceMotion ? 1 : Math.min(1, dt * 4.2);
      cur.grid = L(cur.grid, target.grid, t); gGrid.setAttribute('opacity', cur.grid.toFixed(3));
      cur.conts = L(cur.conts, target.conts, t); contEls.forEach((c) => c.setAttribute('opacity', cur.conts.toFixed(3)));
      cur.dots = L(cur.dots, target.dots, t); dotEls.forEach((d) => d.setAttribute('opacity', cur.dots.toFixed(3)));
      cur.other = L(cur.other, target.other, t); otherEl.setAttribute('opacity', cur.other.toFixed(3)); otherBodies.forEach((b) => b.setAttribute('opacity', cur.other.toFixed(3)));
      cur.orbits.forEach((o, k) => { const tg = target.orbits[k]; o.cx = L(o.cx, tg.cx, t); o.cy = L(o.cy, tg.cy, t); o.rx = L(o.rx, tg.rx, t); o.ry = L(o.ry, tg.ry, t); o.rot = L(o.rot, tg.rot, t); o.o = L(o.o, tg.o, t); o.w = L(o.w, tg.w, t); const e = orbEls[k]; e.setAttribute('cx', o.cx.toFixed(1)); e.setAttribute('cy', o.cy.toFixed(1)); e.setAttribute('rx', Math.max(0, o.rx).toFixed(1)); e.setAttribute('ry', Math.max(0, o.ry).toFixed(1)); e.setAttribute('transform', 'rotate(' + o.rot.toFixed(2) + ' ' + o.cx.toFixed(1) + ' ' + o.cy.toFixed(1) + ')'); e.setAttribute('stroke-opacity', o.o.toFixed(3)); e.setAttribute('stroke-width', o.w.toFixed(2)); });
      cur.arcs = L(cur.arcs, target.arcs, t); arcEls.forEach((p) => { const len = +p.dataset.len; p.setAttribute('stroke-dashoffset', (len * (1 - cur.arcs)).toFixed(1)); p.setAttribute('opacity', cur.arcs < 0.02 ? 0 : 1); });
      cur.product = L(cur.product, target.product, t); gProd.setAttribute('transform', 'translate(' + PRODUCT.x + ',' + PRODUCT.y + ')'); gProd.setAttribute('opacity', cur.product.toFixed(3));
      cur.ticks = L(cur.ticks, target.ticks, t); gTicks.setAttribute('opacity', cur.ticks.toFixed(3));
      cur.marks.forEach((m, k) => { const tg = target.marks[k]; m.x = L(m.x, tg.x, t); m.y = L(m.y, tg.y, t); m.o = L(m.o, tg.o, t); markEls[k].setAttribute('transform', 'translate(' + m.x.toFixed(1) + ',' + m.y.toFixed(1) + ')'); markEls[k].setAttribute('opacity', m.o.toFixed(3)); });
      cur.discs.forEach((d, k) => { const tg = target.discs[k]; d.x = L(d.x, tg.x, t); d.y = L(d.y, tg.y, t); d.o = L(d.o, tg.o, t); discEls[k].setAttribute('cx', d.x.toFixed(1)); discEls[k].setAttribute('cy', d.y.toFixed(1)); discEls[k].setAttribute('opacity', d.o.toFixed(3)); });
      cur.labels.forEach((lb, k) => { const tg = target.labels[k]; lb.x = L(lb.x, tg.x, t); lb.y = L(lb.y, tg.y, t); lb.o = L(lb.o, tg.o, t); lb.anchor = tg.anchor; if (tg.text && groupLabels[k].textContent !== tg.text) groupLabels[k].textContent = tg.text; placeLabel(groupLabels[k], lb); });
      cur.contLabels = L(cur.contLabels, target.contLabels, t); contLabels.forEach((s, k) => placeLabel(s, { x: CONT[k][0], y: CONT[k][1] - 18, o: cur.contLabels, anchor: 'start' }));
      cur.annots.forEach((a, k) => { const tg = target.annots[k]; if (tg.text && annotEls[k].textContent !== tg.text) { annotEls[k].textContent = tg.text; a.x = tg.x; a.y = tg.y; } a.x = L(a.x, tg.x, t); a.y = L(a.y, tg.y, t); a.o = L(a.o, tg.o, t); placeLabel(annotEls[k], { x: a.x, y: a.y, o: a.o, anchor: tg.anchor }); });
    }
    return { setStage, step, get stage() { return lastStage; } };
  }

  // ------------------------------------------------------------ mount
  const fields = {};
  const heroSvg = document.getElementById('hero-field'); if (heroSvg) fields['hero-field'] = createField(heroSvg);
  // eslint-disable-next-line no-use-before-define -- heroGeom is defined below and only called from the frame loop
  const narSvg = document.getElementById('nar-field');
  const orbitField = narSvg ? createOrbitField(narSvg, document.getElementById('nar-labels')) : null;
  const orrerySvg = document.getElementById('orrery-field');
  const orrery = orrerySvg ? createOrrery(orrerySvg) : null;

  const hero = document.querySelector('.hero');
  const nar = document.querySelector('.narrative');
  const diag = document.querySelector('.diagnostic');
  const pathway = document.querySelector('.pathway');

  const heroStart = performance.now() + 350;
  const heroPin = hero ? hero.querySelector('.hero-pin') : null;
  const smooth = (x) => x * x * (3 - 2 * x);
  let lastHx = null, lastHy = null;
  // Route geometry, measured (not guessed) once per viewport size:
  //  k1: internal scale at the end of the rise so the assembly fits the band
  //      between the bar and the hero copy;
  //  U:  px to rise so the assembly clears the copy before travelling left;
  //  T:  px to travel left, up to 42% of the viewport, never past the left edge.
  let heroGeomCache = null;
  function heroGeom(mobile) {
    if (heroGeomCache && heroGeomCache.w === window.innerWidth && heroGeomCache.h === window.innerHeight) return heroGeomCache;
    const g = { w: window.innerWidth, h: window.innerHeight, k1: 1, U: 0, T: 0 };
    if (!heroPin || !heroSvg) return (heroGeomCache = g);
    if (mobile) { g.k1 = 0.9; g.U = 0; g.T = Math.round(window.innerWidth * 0.06); return (heroGeomCache = g); }
    const prevX = heroPin.style.getPropertyValue('--hx'), prevY = heroPin.style.getPropertyValue('--hy');
    heroPin.style.setProperty('--hx', '0px'); heroPin.style.setProperty('--hy', '0px');
    const pr = heroPin.getBoundingClientRect(), sr = heroSvg.getBoundingClientRect();
    const sc = Math.min(sr.width / 1000, sr.height / 620);
    const cLeft = sr.left - pr.left + (sr.width - 1000 * sc) / 2, cTop = sr.top - pr.top + (sr.height - 620 * sc) / 2;
    const barH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 60;
    // obstacle: the top of the hero copy block (readout or headline, whichever is higher)
    const tops = []; ['.hero-readout', '.hero-h1'].forEach((s) => { const el = hero.querySelector(s); if (el) tops.push(el.getBoundingClientRect().top - pr.top); });
    const obstacleTop = tops.length ? Math.min(...tops) : pr.height * 0.45;
    // extents of the fully rotated assembly at unit scale; they scale linearly with k
    const [, cym] = heroCentroid(HERO_DESKTOP);
    // worst case over the whole rotation sweep, so intermediate frames clear the bar and the copy too
    const sweep = [0, 0.2, 0.4, 0.6, 0.8, 1].flatMap((e) => heroHubs(false, e, 1)); const rMinY = Math.min(...sweep.map((h) => h[1])), rMaxY = Math.max(...sweep.map((h) => h[1]));
    const available = (obstacleTop - 16) - (barH + 14);
    g.k1 = Math.max(0.42, Math.min(0.88, (available / sc - 116) / (rMaxY - rMinY)));
    const botPx = cTop + (cym + (rMaxY - cym) * g.k1 + 46) * sc;
    const topPx = cTop + (cym - (cym - rMinY) * g.k1 - 70) * sc;
    g.U = Math.max(0, Math.min(botPx - (obstacleTop - 16), topPx - (barH + 14)));
    const hubsEnd = heroHubs(false, 1, g.k1); const minXu = Math.min(...hubsEnd.map((h) => h[0]));
    g.T = Math.max(0, Math.min(window.innerWidth * 0.42, cLeft + (minXu - 116) * sc - 12));
    heroPin.style.setProperty('--hx', prevX || '0px'); heroPin.style.setProperty('--hy', prevY || '0px');
    return (heroGeomCache = g);
  }
  window.addEventListener('resize', () => { heroGeomCache = null; });
  const verbs = Array.from(document.querySelectorAll('.hero-sub em'));
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('ready')));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);

  const narSteps = nar ? Array.from(nar.querySelectorAll('.nar-step')) : [];
  const notes = nar ? Array.from(nar.querySelectorAll('.note')) : [];
  const narNum = document.getElementById('nar-num');
  const narCaption = document.getElementById('nar-caption');
  const NAR_LAYOUTS = [layoutContainers, () => layoutOverlap(false), () => layoutOverlap(true), layoutMapped, () => layoutLegible(false), () => layoutLegible(true)];
  let narStage = -1;
  function setNarStage(i) {
    if (i === narStage) return; narStage = i; nar.dataset.stage = String(i);
    notes.forEach((n, k) => n.classList.toggle('on', k === i)); if (narNum) narNum.textContent = '0' + (i + 1);
    const st = orbitField ? orbitField.setStage(i) : null;
    // on narrow screens the HTML label layer is hidden and the in-figure
    // annotation becomes the caption above the graphic
    if (narCaption) narCaption.textContent = st ? (st.annots[1].o ? st.annots[1].text : st.annots[0].o ? st.annots[0].text : '') : '';
  }

  const qnodes = diag ? Array.from(diag.querySelectorAll('.qnode')) : [];
  const qcards = diag ? Array.from(diag.querySelectorAll('.q-card')) : [];
  const qLabel = document.getElementById('diag-q-label');
  function setQ(i, focus) { diag.dataset.q = String(i); qnodes.forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false')); qcards.forEach((c, k) => c.classList.toggle('on', k === i)); if (qLabel) qLabel.textContent = 'Question 0' + (i + 1); if (orrery) orrery.setState(i); if (focus) qnodes[i].focus({ preventScroll: true }); }
  qnodes.forEach((b, i) => {
    b.addEventListener('click', () => setQ(i));
    b.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setQ((i + 1) % qnodes.length, true); } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setQ((i + qnodes.length - 1) % qnodes.length, true); } });
  });
  if (diag) setQ(0);

  if (pathway) {
    // Approach V2: generated once per layout. One rising vector through three
    // modes of work; the vector draws on reveal, then the entry marks appear.
    const NSV = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => { const n = document.createElementNS(NSV, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
    const sd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
    const head = (g, x1, y1, x2, y2, hl, hw, cls) => { const a = Math.atan2(y2 - y1, x2 - x1); const bx = x2 - Math.cos(a) * hl, by = y2 - Math.sin(a) * hl, nx = -Math.sin(a) * hw, ny = Math.cos(a) * hw; return mk('polygon', { class: cls, points: `${x2},${y2} ${bx + nx},${by + ny} ${bx - nx},${by - ny}` }, g); };
    const tick = (g, x, y, a, len, delay) => { const nx = -Math.sin(a) * len / 2, ny = Math.cos(a) * len / 2; const t = mk('line', { class: 'v2-mark', x1: x + nx, y1: y + ny, x2: x - nx, y2: y - ny }, g); t.style.setProperty('--d', delay + 's'); return t; };
    const arc = (g, cx, cy, r, a0, a1) => { let d = ''; for (let i = 0; i <= 24; i++) { const a = (a0 + (a1 - a0) * i / 24) * Math.PI / 180; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1); } mk('path', { class: 'v2-loop v2-loop-arc', d }, g); const a1r = a1 * Math.PI / 180, ap = a1r - 0.05; head(g, cx + Math.cos(ap) * r, cy + Math.sin(ap) * r, cx + Math.cos(a1r) * r, cy + Math.sin(a1r) * r, r * 0.18, r * 0.08, 'v2-loophead'); };
    const lens = (g, cx, cy, r, n) => { mk('circle', { class: 'v2-lens', cx, cy, r }, g); for (let k = 0; k < n; k++) { const a = sd(k * 3 + 1) * Math.PI * 2, d = r * 0.2 + sd(k * 7 + 2) * r * 0.62; mk('circle', { class: 'v2-dot', cx: cx + Math.cos(a) * d, cy: cy + Math.sin(a) * d, r: r > 40 ? 2.8 : 2.2 }, g); } };
    const drawDesktop = (svg) => {
      const g = mk('g', {}, svg); const x1 = 60, y1 = 262, x2 = 900, y2 = 70; const yAt = (x) => y1 + (y2 - y1) * (x - x1) / (x2 - x1); const ang = Math.atan2(y2 - y1, x2 - x1);
      mk('rect', { class: 'v2-rule', x: 40, y: 296, width: 880, height: 2 }, g);
      [[400, 112, 130, 88, 1], [452, 146, 128, 84, 2], [424, 184, 128, 74, 3]].forEach(([x, y, w, h, k]) => mk('rect', { class: 'v2-field v2-f' + k, x, y, width: w, height: h }, g));
      lens(g, 190, yAt(190), 50, 7);
      mk('circle', { class: 'v2-loop', cx: 770, cy: yAt(770), r: 52 }, g); arc(g, 770, yAt(770), 62, 200, 290);
      const vec = mk('line', { class: 'v2-vector', x1, y1, x2, y2 }, g); head(g, x1, y1, x2, y2, 16, 7, 'v2-head');
      [140, 400, 718].forEach((x, i) => tick(g, x, yAt(x), ang, 18, 0.9 + i * 0.35));
      return vec;
    };
    const drawMobile = (svg) => {
      const g = mk('g', {}, svg); const x1 = 70, y1 = 536, x2 = 352, y2 = 62; const ang = Math.atan2(y2 - y1, x2 - x1);
      mk('rect', { class: 'v2-rule', x: 36, y: 34, width: 3, height: 500 }, g);
      const st = [[60, 404, 150, 96, 1], [60, 254, 200, 96, 2], [60, 104, 280, 96, 3]];
      st.forEach(([x, y, w, h, k]) => mk('rect', { class: 'v2-field v2-f' + k, x, y, width: w, height: h }, g));
      lens(g, 150, 452, 26, 4);
      mk('rect', { class: 'v2-field-edge', x: 186, y: 278, width: 96, height: 72 }, g);
      mk('circle', { class: 'v2-loop', cx: 300, cy: 152, r: 22 }, g); arc(g, 300, 152, 29, 200, 290);
      const vec = mk('line', { class: 'v2-vector', x1, y1, x2, y2 }, g); head(g, x1, y1, x2, y2, 15, 6.5, 'v2-head');
      st.forEach(([x, y, w, h], i) => { const ym = y + h / 2; const xx = x1 + (x2 - x1) * ((ym - y1) / (y2 - y1)); tick(g, xx, ym, ang, 16, 0.9 + i * 0.35); });
      return vec;
    };
    const vectors = [];
    const d = document.getElementById('v2-desktop'); if (d) vectors.push(drawDesktop(d));
    const m = document.getElementById('v2-mobile'); if (m) vectors.push(drawMobile(m));
    vectors.forEach((v) => { const len = Math.hypot(v.x2.baseVal.value - v.x1.baseVal.value, v.y2.baseVal.value - v.y1.baseVal.value); v.style.strokeDasharray = len; v.style.strokeDashoffset = reduceMotion ? 0 : len; });
    const reveal = () => { pathway.classList.add('in'); vectors.forEach((v) => { v.style.strokeDashoffset = 0; }); };
    if ('IntersectionObserver' in window && !reduceMotion) { const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { reveal(); io.disconnect(); } }); }, { threshold: 0.35 }); io.observe(pathway.querySelector('.path-stage')); } else reveal();
  }

  // No chapter readout (A-14). The hero is locked as-is (A-09): it keeps its
  // load-time self-connection, the scroll parallax, the pointer parallax
  // (restored 2026-09-03 on Carmelito's review: without it the hero read as a
  // still image) and a slow drift of the member dots. Reduced motion disables
  // all of it.
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 14).toFixed(1) + 'px'); hero.style.setProperty('--my', (((e.clientY - r.top) / Math.min(r.height, window.innerHeight) - 0.5) * 10).toFixed(1) + 'px'); });
  }

  // ============================================ PUBLIC THINKING: FIELD JOURNAL + RAIL
  // A research officer's field notebook set into the console. As the section
  // enters, the journal registers into position (panel, page, grid, then the
  // pen approaches its first coordinate). As the visitor scrolls, a geometric
  // pen writes an abstract notation: an observation index, a short ruled note,
  // a circled observation (recorded as the first finding becomes active), a
  // connection into an emerging-pattern symbol (the second finding), and an
  // arrow leading toward "See all Public Thinking". The rail left of the ledger
  // records the same states. Decorative only (aria-hidden); reduced motion shows
  // the completed notation with the pen resting at the dock.
  const ptSection = document.querySelector('.pt');
  const ptSvg = document.getElementById('pt-signal');
  const jrSvg = document.getElementById('journal-svg');
  let journal = null;
  if (ptSection && jrSvg) {
    const rows = Array.from(ptSection.querySelectorAll('.ledger-row'));
    const seeAll = document.getElementById('pt-seeall');
    const head = ptSection.querySelector('.pt-head');
    const jrWrap = jrSvg.parentElement;
    const J = mk(jrSvg);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const ease = (x) => x * x * (3 - 2 * x);
    const stroke = (u) => 0.45 * u + 0.55 * ease(u); // authored rhythm: each stroke settles in and out
    const variant = () => (window.innerWidth <= 860 ? 'mobile' : window.innerWidth <= 1100 ? 'tablet' : 'desktop');
    let V = null, marks = [], segs = [], total = 0, tObs = 0, tPat = 0, approach = [0, 0], dockPt = [0, 0];
    let panel, gPage, gridG, regG, pen, penTip, cores = {};

    // ---- geometry -------------------------------------------------------------
    function build() {
      V = variant(); while (jrSvg.firstChild) jrSvg.removeChild(jrSvg.firstChild);
      const m = V === 'mobile', t = V === 'tablet';
      const W = m ? 360 : 520, H = m ? 212 : 320; jrSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const P = m ? { x: 28, y: 18, w: 292, h: 172 } : { x: 72, y: 26, w: 392, h: 268 };
      // console: a tonal panel behind the page's lower-right, an approach rail from the left edge
      panel = J('rect', { class: 'jr-panel', x: P.x + (m ? 40 : 64), y: P.y + (m ? 60 : 96), width: P.w - (m ? 20 : 34), height: P.h - (m ? 36 : 64) });
      J('line', { class: 'jr-rail', x1: 0, y1: P.y + (m ? 40 : 64), x2: P.x - 10, y2: P.y + (m ? 40 : 64) });
      J('rect', { class: 'jr-rail-node', x: P.x - 14, y: P.y + (m ? 37 : 61), width: 6, height: 6 });
      // the page and its grid
      gPage = J('g', { class: 'jr-page' });
      J('rect', { class: 'jr-paper', x: P.x, y: P.y, width: P.w, height: P.h }, gPage);
      gridG = J('g', { class: 'jr-grid' }, gPage);
      const mx = P.x + (m ? 34 : 44);
      J('line', { class: 'jr-margin', x1: mx, y1: P.y, x2: mx, y2: P.y + P.h }, gridG);
      for (let y = P.y + 24; y < P.y + P.h - 8; y += 24) J('line', { class: 'jr-rule', x1: P.x + 12, y1: y, x2: P.x + P.w - 12, y2: y }, gridG);
      if (!m) for (let x = P.x + 24, i = 0; x < P.x + P.w; x += 24, i++) J('line', { class: 'jr-tick', x1: x, y1: P.y, x2: x, y2: P.y + (i % 4 === 3 ? 9 : 4) }, gridG);
      // registration: corner marks and a measurement scale (desktop only)
      regG = J('g', { class: 'jr-reg' });
      const corner = (x, y, sx, sy) => J('path', { class: 'jr-corner', d: `M${x + 12 * sx},${y} H${x} V${y + 12 * sy}` }, regG);
      corner(P.x - 8, P.y - 8, 1, 1); corner(P.x + P.w + 8, P.y - 8, -1, 1); corner(P.x - 8, P.y + P.h + 8, 1, -1);
      if (!m && !t) for (let i = 0; i < 10; i++) J('line', { class: 'jr-scale', x1: P.x - 14, y1: P.y + 20 + i * 24, x2: P.x - (i % 3 === 0 ? 24 : 18), y2: P.y + 20 + i * 24 }, regG);
      // the dock: where the pen rests once the notation is complete
      const D = { x: P.x + P.w + 16, y: P.y + P.h - 10 };
      J('path', { class: 'jr-dock', d: `M${D.x - 8},${D.y - 18} V${D.y + 8} H${D.x + 12}` });
      J('rect', { class: 'jr-status', x: D.x - 3, y: D.y - 9, width: 5, height: 5 });
      dockPt = [D.x - 1, D.y - 2]; approach = [W + 16, -12];
      // ink marks in writing order
      const ink = J('g', { class: 'jr-ink' });
      const nx = mx + 14;
      const defs = m ? [
        { role: 'note', d: `M${nx},${P.y + 46} c14,-2 26,3 40,1 s28,-3 44,-1 s24,3 36,1` },
        { role: 'obs', d: `M${nx + 172},${P.y + 54} a17,17 0 1 1 -12,-16 a17,17 0 0 1 12,16 a17,17 0 0 1 -7,11` },
        { role: 'conn', d: `M${nx + 160},${P.y + 68} c-12,26 -46,30 -74,42` },
        { role: 'pattern', d: `M${nx + 70},${P.y + 124} l16,-26 l16,26 z` },
        { role: 'arrow', d: `M${nx},${P.y + 150} H${P.x + P.w - 44} v-6 l10,6 l-10,6` },
      ] : [
        { role: 'index', d: `M${nx},${P.y + 36} h9 M${nx + 16},${P.y + 36} h28 M${nx},${P.y + 50} h9 M${nx + 16},${P.y + 50} h20 M${nx},${P.y + 64} h9 M${nx + 16},${P.y + 64} h24` },
        { role: 'note', d: `M${nx},${P.y + 98} c16,-3 30,4 48,1 s34,-3 54,-1 s28,3 44,1 s22,-2 34,0 M${nx},${P.y + 122} c14,-2 28,3 42,1 s26,-3 40,-1 s22,3 32,1` },
        { role: 'obs', d: `M${nx + 262},${P.y + 112} a20,20 0 1 1 -14,-19 a20,20 0 0 1 14,19 a20,20 0 0 1 -9,13` },
        { role: 'conn', d: `M${nx + 250},${P.y + 130} c-14,34 -58,36 -96,52` },
        { role: 'pattern', d: `M${nx + 136},${P.y + 206} l18,-30 l18,30 z` },
        { role: 'arrow', d: `M${nx},${P.y + 238} H${P.x + P.w - 46} v-6 l12,6 l-12,6` },
      ];
      marks = defs.map((def) => { const el = J('path', { class: 'jr-mark jr-' + def.role, d: def.d }, ink); const len = el.getTotalLength(); el.style.strokeDasharray = len.toFixed(1); el.style.strokeDashoffset = len.toFixed(1); return { role: def.role, el, len, p0: el.getPointAtLength(0), p1: el.getPointAtLength(len) }; });
      // cores: the filled signal inside the observation circle and at the pattern's centroid
      cores = {};
      const ob = marks.find((k) => k.role === 'obs'), pa = marks.find((k) => k.role === 'pattern');
      const oc = ob.el.getPointAtLength(ob.len * 0.5), oc2 = ob.el.getPointAtLength(0); const ocx = (oc.x + oc2.x) / 2, ocy = (oc.y + oc2.y) / 2;
      cores.obs = J('rect', { class: 'jr-core', x: ocx - 4, y: ocy - 4, width: 8, height: 8 }, ink);
      const pc = pa.el.getPointAtLength(pa.len * 0.62); cores.pattern = J('rect', { class: 'jr-core', x: pc.x - 3, y: pc.y - 3, width: 6, height: 6, transform: `rotate(45 ${pc.x} ${pc.y})` }, ink);
      // timeline: alternating moves (pen lifted) and strokes, in path units
      segs = []; total = 0; let prev = approach;
      marks.forEach((k) => { const d = Math.hypot(k.p0.x - prev[0], k.p0.y - prev[1]) * 0.7; segs.push({ kind: 'move', from: prev, to: [k.p0.x, k.p0.y], start: total, len: d }); total += d; segs.push({ kind: 'ink', mark: k, start: total, len: k.len }); total += k.len; if (k.role === 'obs') tObs = total; if (k.role === 'pattern') tPat = total; prev = [k.p1.x, k.p1.y]; });
      const dd = Math.hypot(dockPt[0] - prev[0], dockPt[1] - prev[1]) * 0.7; segs.push({ kind: 'move', from: prev, to: dockPt, start: total, len: dd, dock: true }); total += dd;
      // the pen: engineered, tip at the origin, body along -y; rotated per frame
      pen = J('g', { class: 'jr-pen' });
      penTip = J('path', { class: 'jr-pen-tip', d: 'M0,0 L-4,-13 L4,-13 Z' }, pen);
      J('rect', { class: 'jr-pen-body', x: -4, y: -13, width: 8, height: m ? 62 : 84, transform: 'translate(0,-' + (m ? 62 : 84) + ')' }, pen);
      J('rect', { class: 'jr-pen-band', x: -5, y: -34, width: 10, height: 4 }, pen);
      J('rect', { class: 'jr-pen-cap', x: -3, y: m ? -83 : -105, width: 6, height: 8 }, pen);
      lastR = -1; lastT = -1; if (state) applyState(state.r, state.T, true);
    }

    // ---- state -----------------------------------------------------------------
    let lastR = -1, lastT = -1, state = null, reach = 0, done = false;
    function setPen(x, y, tx, ty, lift, opacity) {
      const ang = 34 + clamp(tx * 12, -12, 12) - clamp(ty * 10, -10, 10);
      pen.setAttribute('transform', `translate(${(x + lift * 4).toFixed(1)},${(y - lift * 9).toFixed(1)}) rotate(${ang.toFixed(1)})`);
      pen.style.opacity = opacity.toFixed(2); penTip.style.opacity = (1 - 0.35 * lift).toFixed(2);
    }
    function applyState(r, T, force) {
      const newReach = T >= tPat ? 2 : T >= tObs ? 1 : 0; const newDone = T >= total;
      if (!force && newReach === reach && newDone === done && Math.abs(r - lastR) < 0.002 && Math.abs(T - lastT) < 0.25) return;
      lastR = r; lastT = T;
      // registration: three restrained movements, then the pen approaches
      const e1 = ease(clamp(r / 0.5, 0, 1)), e2 = ease(clamp((r - 0.15) / 0.5, 0, 1)), e3 = ease(clamp((r - 0.4) / 0.45, 0, 1)), e4 = ease(clamp((r - 0.55) / 0.45, 0, 1));
      panel.setAttribute('transform', `translate(${((1 - e1) * 30).toFixed(1)},0)`); panel.style.opacity = e1.toFixed(2);
      gPage.setAttribute('transform', `translate(${((1 - e2) * 22).toFixed(1)},${(-(1 - e2) * 14).toFixed(1)})`); gPage.style.opacity = e2.toFixed(2);
      gridG.style.opacity = e3.toFixed(2); regG.style.opacity = e3.toFixed(2);
      // writing
      let penPt = null;
      marks.forEach((k) => { k.el.style.strokeDashoffset = k.len.toFixed(1); });
      for (const s of segs) {
        if (T >= s.start + s.len) { if (s.kind === 'ink') s.mark.el.style.strokeDashoffset = '0'; continue; }
        if (T < s.start) break;
        const u = (T - s.start) / s.len;
        if (s.kind === 'ink') {
          const L = s.mark.len * stroke(u); s.mark.el.style.strokeDashoffset = (s.mark.len - L).toFixed(1);
          const p = s.mark.el.getPointAtLength(L), q = s.mark.el.getPointAtLength(Math.max(0, L - 3)); const dx = p.x - q.x, dy = p.y - q.y, n = Math.hypot(dx, dy) || 1;
          penPt = [p.x, p.y, dx / n, dy / n, 0];
        } else {
          const w = ease(u); const x = s.from[0] + (s.to[0] - s.from[0]) * w, y = s.from[1] + (s.to[1] - s.from[1]) * w; const dx = s.to[0] - s.from[0], dy = s.to[1] - s.from[1], n = Math.hypot(dx, dy) || 1;
          penPt = s.dock ? [x, y, -0.9 * w + (dx / n) * (1 - w), 0.6 * w + (dy / n) * (1 - w), Math.sin(Math.PI * u)] : [x, y, dx / n, dy / n, Math.sin(Math.PI * u)]; // toward the dock the pen straightens into its resting pose
        }
        break;
      }
      if (T >= total) { const p = dockPt; setPen(p[0], p[1], -0.9, 0.6, 0, 1); } // resting pose: upright against the dock
      else if (penPt) setPen(penPt[0], penPt[1], penPt[2], penPt[3], penPt[4], 1);
      else { const a = approach, b = segs[0].to; const w = e4; setPen(a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, 0.6, 0.8, 1 - w, e4); }
      cores.obs.classList.toggle('on', T >= tObs); cores.pattern.classList.toggle('on', T >= tPat);
      if (newReach !== reach || newDone !== done || force) { reach = newReach; done = newDone; rows.forEach((row, i) => row.classList.toggle('rec', i < reach)); jrWrap.classList.toggle('done', done); ptSection.classList.toggle('in', done); railApply(true); }
    }

    // ---- scroll mapping (document coordinates, measured once per layout) --------
    let S = null;
    function measure() {
      if (variant() !== V) build();
      const sy = window.scrollY, vh = window.innerHeight, maxS = Math.max(0, document.documentElement.scrollHeight - vh);
      const top = (el) => el.getBoundingClientRect().top + sy, bottom = (el) => el.getBoundingClientRect().bottom + sy;
      const r0 = top(head) - vh * 0.92, r1 = r0 + vh * 0.32;
      let s1 = rows[0] ? top(rows[0]) - vh * 0.74 : r1 + vh * 0.3, s2 = rows[1] ? top(rows[1]) - vh * 0.74 : s1 + vh * 0.3, s3 = (seeAll ? bottom(seeAll) : bottom(ptSection)) - vh;
      s1 = Math.max(s1, r1 + vh * 0.1); s2 = Math.max(s2, s1 + vh * 0.1); s3 = Math.max(s3, s2 + vh * 0.1);
      if (s3 > maxS) { const k = Math.max(0.2, (maxS - r1) / (s3 - r1)); s1 = r1 + (s1 - r1) * k; s2 = r1 + (s2 - r1) * k; s3 = maxS; }
      S = { r0, r1, s1, s2, s3 };
      railMeasure(); lastR = -1; lastT = -1; if (state) applyState(state.r, state.T, true); else journal.update(sy, vh);
    }
    journal = {
      update(sy, vh) {
        if (!S) return;
        if (reduceMotion) { if (!state) { state = { r: 1, T: total }; applyState(1, total, true); } return; }
        if (sy < S.r0 - vh) { if (state && state.r === 0) return; state = { r: 0, T: 0 }; applyState(0, 0); return; }
        if (sy > S.s3 + vh * 1.5) { if (state && state.T === total) return; state = { r: 1, T: total }; applyState(1, total); return; }
        const r = clamp((sy - S.r0) / (S.r1 - S.r0), 0, 1);
        let T = 0;
        if (sy > S.r1) { if (sy <= S.s1) T = tObs * (sy - S.r1) / (S.s1 - S.r1); else if (sy <= S.s2) T = tObs + (tPat - tObs) * (sy - S.s1) / (S.s2 - S.s1); else T = tPat + (total - tPat) * clamp((sy - S.s2) / (S.s3 - S.s2), 0, 1); }
        state = { r, T }; applyState(r, T);
      },
    };

    // ---- the rail beside the ledger: the same states as a timeline --------------
    let railMeasure = () => {}, railApply = () => {};
    if (ptSvg) {
      const body = document.getElementById('pt-body'); const sel = mk(ptSvg);
      const rail = sel('line', { class: 'sig-rail', x1: 14, x2: 14 }); const tail = sel('line', { class: 'sig-rail-tail', x1: 14, x2: 14 }); const trace = sel('line', { class: 'sig-trace', x1: 14, x2: 14 });
      const pulses = rows.map(() => sel('rect', { class: 'sig-pulse', width: 9, height: 9 })); const pts = rows.map(() => sel('rect', { class: 'sig-pt', width: 9, height: 9 }));
      const beaconRing = sel('rect', { class: 'sig-beacon-ring', width: 11, height: 11 }); const beacon = sel('rect', { class: 'sig-beacon', width: 7, height: 7 });
      let ys = [], beaconY = 0, hover = -1;
      railMeasure = () => {
        const b = body.getBoundingClientRect();
        ptSvg.setAttribute('viewBox', '0 0 28 ' + Math.round(b.height)); ptSvg.setAttribute('width', 28); ptSvg.setAttribute('height', Math.round(b.height));
        ys = rows.map((r) => { const t = r.querySelector('.ledger-title') || r; const tb = t.getBoundingClientRect(); return tb.top - b.top + tb.height / 2; });
        const sb = (seeAll || body).getBoundingClientRect(); beaconY = sb.top - b.top + sb.height / 2;
        const lastY = ys.length ? ys[ys.length - 1] : 0;
        rail.setAttribute('y1', 0); rail.setAttribute('y2', lastY.toFixed(1)); tail.setAttribute('y1', lastY.toFixed(1)); tail.setAttribute('y2', (beaconY - 12).toFixed(1));
        pts.forEach((p, i) => { p.setAttribute('x', 9.5); p.setAttribute('y', (ys[i] - 4.5).toFixed(1)); pulses[i].setAttribute('x', 9.5); pulses[i].setAttribute('y', (ys[i] - 4.5).toFixed(1)); });
        beacon.setAttribute('x', 10.5); beacon.setAttribute('y', (beaconY - 3.5).toFixed(1)); beaconRing.setAttribute('x', 8.5); beaconRing.setAttribute('y', (beaconY - 5.5).toFixed(1));
        trace.setAttribute('y1', 0); trace.setAttribute('y2', beaconY.toFixed(1)); trace.style.strokeDasharray = beaconY.toFixed(1);
        railApply(false);
      };
      railApply = (animate) => {
        const target = hover >= 0 ? hover : reach - 1; const totalL = beaconY || 1;
        const y = done && hover < 0 ? totalL : target >= 0 ? ys[target] || 0 : 0;
        if (!animate) trace.style.transition = 'none';
        trace.style.strokeDashoffset = (totalL - y).toFixed(1);
        if (!animate) requestAnimationFrame(() => { trace.style.transition = ''; });
        pts.forEach((p, i) => { const on = i < reach || i === hover; p.classList.toggle('on', on); pulses[i].classList.toggle('on', on && i === target); });
      };
      // hover or focus on a finding re-activates its journal mark and moves the trace, without replaying the sequence
      const roleFor = [['obs'], ['conn', 'pattern']];
      rows.forEach((r, i) => {
        const go = () => { hover = i; railApply(true); (roleFor[i] || []).forEach((role) => { const k = marks.find((q) => q.role === role); if (k && k.el.style.strokeDashoffset === '0') { k.el.classList.remove('hot'); void k.el.getBoundingClientRect(); k.el.classList.add('hot'); } }); };
        const back = () => { hover = -1; railApply(true); };
        r.addEventListener('mouseenter', go); r.addEventListener('mouseleave', back); r.addEventListener('focusin', go); r.addEventListener('focusout', (e) => { if (!r.contains(e.relatedTarget)) back(); });
      });
    }

    build(); measure();
    window.addEventListener('resize', measure); if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure); window.addEventListener('load', measure);
  }

  const ledgerEmpty = document.getElementById('ledger-empty');
  if (ledgerEmpty) { document.querySelectorAll('.filter-pill').forEach((pill) => pill.addEventListener('click', () => { document.querySelectorAll('.filter-pill').forEach((p) => p.setAttribute('aria-pressed', p === pill ? 'true' : 'false')); requestAnimationFrame(() => { ledgerEmpty.hidden = Array.from(document.querySelectorAll('.ledger-row')).some((r) => r.style.display !== 'none'); }); })); }

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  function update(now) {
    const vh = window.innerHeight; const mobile = narrow();
    if (hero && fields['hero-field']) {
      const p = reduceMotion ? 1 : clamp01((now - heroStart) / 2600); const e = easeOut(p);
      // scroll-linked choreography: only while the hero is in range, eased, off under reduced motion
      const heroH = hero.offsetHeight || vh; const sy = window.scrollY;
      if (sy < heroH + vh) {
        const pinH = heroPin ? heroPin.offsetHeight : vh;
        const range = mobile ? heroH * 0.85 : Math.max(1, heroH - pinH);
        const raw = reduceMotion ? 0 : clamp01(sy / range); const es = raw * raw * (3 - 2 * raw);
        const g = heroGeom(mobile);
        const rise = smooth(clamp01(es / 0.4)), travel = smooth(clamp01((es - 0.3) / 0.7));
        const k = 1 - (1 - g.k1) * rise;
        fields['hero-field'].setTarget(layoutHero(e, mobile, es, k));
        const hx = -g.T * travel, hy = -g.U * rise;
        if (hx !== lastHx || hy !== lastHy) { heroPin.style.setProperty('--hx', hx.toFixed(1) + 'px'); heroPin.style.setProperty('--hy', hy.toFixed(1) + 'px'); lastHx = hx; lastHy = hy; }
      }
      verbs.forEach((v, i) => v.classList.toggle('lit', i < Math.floor(e * 4.999)));
    }
    if (nar) { let i = 0; if (mobile) notes.forEach((n, k) => { if (n.getBoundingClientRect().top < vh * 0.62) i = k; }); else narSteps.forEach((s, k) => { if (s.getBoundingClientRect().top <= vh * 0.5) i = k; }); setNarStage(i); }
    if (journal) journal.update(window.scrollY, vh);
  }
  let last = performance.now();
  function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(now); for (const k in fields) fields[k].step(dt); if (orbitField) orbitField.step(dt); if (orrery) orrery.step(dt); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
})();
