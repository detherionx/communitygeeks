// About · operator dossier → research navigation chart.
// 1) the operator module resolves once on load (CSS, .ready); 2) the hero field chart is drawn once (static);
// 3) the navigation chart draws its course as the section enters, activates the three principles in reading order and
// moves a coral signal along the route. Everything decorative is aria-hidden; reduced motion shows the finished chart.
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

  const deck = document.getElementById('deck');
  if (deck) requestAnimationFrame(() => requestAnimationFrame(() => deck.classList.add('ready')));

  // ---- the practice's field: four labelled coordinates, three supporting points, one plotted line -----------------
  const fc = document.getElementById('field-chart');
  if (fc) {
    // viewBox 1000x320, stretched to the chart box (non-scaling strokes keep lines crisp)
    const P = { participation: [120, 210], research: [400, 96], advisory: [640, 236], ecosystems: [880, 128], community: [270, 292], devrel: [520, 40], partnerships: [760, 300] };
    const line = (a, b, cls) => el('line', { class: cls, x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, fc);
    line(P.participation, P.research, 'fc-line'); line(P.research, P.advisory, 'fc-line'); line(P.advisory, P.ecosystems, 'fc-line');
    line(P.participation, P.community, 'fc-line faint'); line(P.research, P.devrel, 'fc-line faint'); line(P.advisory, P.partnerships, 'fc-line faint'); line(P.community, P.advisory, 'fc-line faint');
    // a tick at the left edge marks where the field meets the section's gutter
    line([0, P.participation[1]], [40, P.participation[1]], 'fc-tick');
    [P.research, P.advisory, P.ecosystems].forEach((q) => el('circle', { class: 'fc-node', cx: q[0], cy: q[1], r: 3.2 }, fc));
    el('circle', { class: 'fc-node', cx: P.participation[0], cy: P.participation[1], r: 4 }, fc); el('circle', { class: 'fc-ring', cx: P.participation[0], cy: P.participation[1], r: 11 }, fc);
    [P.community, P.devrel, P.partnerships].forEach((q) => el('circle', { class: 'fc-node minor', cx: q[0], cy: q[1], r: 2 }, fc));
    el('rect', { class: 'fc-signal', x: P.ecosystems[0] - 3, y: P.ecosystems[1] - 3, width: 6, height: 6 }, fc);
    // HTML labels next to the four primary coordinates (positioned by the same percentages)
    const labels = [['participation', 'Participation', 'field'], ['research', 'Research', '01'], ['advisory', 'Advisory', '02'], ['ecosystems', 'Ecosystems', '03']];
    const minor = [['community', 'Community'], ['devrel', 'Developer relations'], ['partnerships', 'Partnerships']];
    const place = () => {
      const box = fc.getBoundingClientRect(); const host = deck; const hb = host.getBoundingClientRect();
      document.querySelectorAll('.fc-label').forEach((n) => n.remove());
      const put = (key, text, sub, small) => { const [x, y] = P[key]; const L = document.createElement('span'); L.className = 'fc-label' + (small ? ' fc-label-minor' : ''); L.setAttribute('aria-hidden', 'true'); L.innerHTML = small ? `<i>${text}</i>` : `${text}${sub ? `<i>${sub}</i>` : ''}`; L.style.left = (box.left - hb.left + x / 1000 * box.width + 10) + 'px'; L.style.top = (box.top - hb.top + y / 320 * box.height - 8) + 'px'; host.appendChild(L); };
      labels.forEach(([k, t, s]) => put(k, t, s === 'field' ? '' : s, false)); minor.forEach(([k, t]) => put(k, t, '', true));
    };
    place(); window.addEventListener('resize', place); if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }

  // ---- the navigation chart --------------------------------------------------------------------------------------
  const chart = document.getElementById('think-chart'); const course = document.getElementById('course'); const principles = Array.from(document.querySelectorAll('.principle'));
  if (!chart || !course) return;
  const narrow = () => window.innerWidth <= 860;
  // node coordinates in the 1000x1000 chart space, matching the CSS placement of the three text groups
  const geom = () => (window.innerWidth <= 1100
    ? { entry: [1000 * 0.62, 0], way: [1000 * 0.62, 400], n: [[70, 590], [470, 465], [630, 250]], exit: [940, 1000] }
    : { entry: [1000 * 0.665, 0], way: [1000 * 0.665, 380], n: [[110, 615], [460, 425], [740, 215]], exit: [940, 1000] });
  let route, ghost, signal, signalRing, nodes = [], rings = [], total = 1, built = false, mobileSignal = null;
  function build() {
    while (course.firstChild) course.removeChild(course.firstChild); nodes = []; rings = [];
    const g = geom();
    // the registration axis arrives from the dossier above and continues faintly to the chart's floor
    el('line', { class: 'c-axis', x1: g.entry[0], y1: 0, x2: g.entry[0], y2: 1000 }, course);
    // the course follows the registration axis down past the heading, then plots 01 → 02 → 03 and continues to the handoff
    const d = `M${g.entry[0]},${g.entry[1]} L${g.way[0]},${g.way[1]} L${g.n[0][0]},${g.n[0][1]} L${g.n[1][0]},${g.n[1][1]} L${g.n[2][0]},${g.n[2][1]} L${g.exit[0]},${g.exit[1]}`;
    ghost = el('path', { class: 'c-route c-ghost', d }, course); route = el('path', { class: 'c-route', d }, course);
    // supporting points and coordinate ticks: measured, not scattered
    const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    [mid(g.way, g.n[0], 0.5), mid(g.n[0], g.n[1], 0.5), mid(g.n[1], g.n[2], 0.5), mid(g.n[2], g.exit, 0.35)].forEach((q) => el('circle', { class: 'c-pt', cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2 }, course));
    g.n.forEach((q) => { el('line', { class: 'c-tick', x1: q[0] - 14, y1: q[1], x2: q[0] - 6, y2: q[1] }, course); el('line', { class: 'c-tick', x1: q[0], y1: q[1] - 14, x2: q[0], y2: q[1] - 6 }, course); });
    g.n.forEach((q) => { rings.push(el('circle', { class: 'c-ring', cx: q[0], cy: q[1], r: 14 }, course)); nodes.push(el('circle', { class: 'c-node', cx: q[0], cy: q[1], r: 4.5 }, course)); });
    signalRing = el('circle', { class: 'c-signal-ring', cx: g.entry[0], cy: 0, r: 9 }, course); signal = el('circle', { class: 'c-signal', cx: g.entry[0], cy: 0, r: 4 }, course);
    total = route.getTotalLength(); route.style.strokeDasharray = total; route.style.strokeDashoffset = total;
    // where along the route each node sits, as a fraction of its length
    const lenTo = (i) => { let L = 0; const pts = [g.entry, g.way, ...g.n]; for (let k = 1; k <= i + 2; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return L; };
    built = { at: g.n.map((_, i) => lenTo(i) / total), rest: lenTo(2) };
    // mobile: a coral signal that travels down the vertical rail
    if (!mobileSignal) { mobileSignal = document.createElement('span'); mobileSignal.className = 'think-signal'; mobileSignal.setAttribute('aria-hidden', 'true'); document.getElementById('principles').appendChild(mobileSignal); }
    apply(lastP, true);
  }
  let lastP = -1;
  function apply(p, force) {
    if (!force && Math.abs(p - lastP) < 0.001) return; lastP = p;
    const e = ease(p);
    if (!narrow()) {
      const L = total * e; route.style.strokeDashoffset = (total - L).toFixed(1);
      // the signal resolves on 03; the course alone continues to the handoff
      const q = route.getPointAtLength(Math.min(L, built.rest)); signal.setAttribute('cx', q.x.toFixed(1)); signal.setAttribute('cy', q.y.toFixed(1)); signalRing.setAttribute('cx', q.x.toFixed(1)); signalRing.setAttribute('cy', q.y.toFixed(1));
      nodes.forEach((n, i) => { const on = e >= built.at[i] - 0.01; n.classList.toggle('on', on); rings[i].classList.toggle('on', on); principles[i].classList.toggle('on', on); });
      signal.style.opacity = p > 0 && p < 1 ? '1' : p >= 1 ? '1' : '0'; signalRing.style.opacity = p > 0 ? '0.7' : '0';
    } else {
      // vertical rail: signal at e of the list height; a principle activates when the signal reaches its node
      const list = document.getElementById('principles'); const H = list.offsetHeight; mobileSignal.style.top = (e * H).toFixed(1) + 'px';
      principles.forEach((li) => { li.classList.toggle('on', e * H >= li.offsetTop - 2); });
    }
  }
  // progress: 0 when the chart's top reaches 85% of the viewport, 1 when it has risen to 20% (or its bottom shows)
  let top = 0, height = 1, vh = 1, queued = false;
  const measure = () => { const r = chart.getBoundingClientRect(); top = r.top + window.scrollY; height = r.height; vh = window.innerHeight; };
  const progress = () => { const t = top - window.scrollY; const start = 0.85 * vh; const end = Math.max(0.2 * vh - 0, vh - height - 40); return clamp01((start - t) / (start - end)); };
  const tick = () => { queued = false; apply(progress()); };
  if (reduceMotion) { build(); apply(1, true); window.addEventListener('resize', () => { build(); apply(1, true); }); return; }
  const rebuild = () => { measure(); build(); tick(); };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
  window.addEventListener('resize', rebuild); window.addEventListener('load', rebuild); if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  rebuild();
})();
