// About · operator dossier → one research navigation instrument.
// 1) the operator module resolves once on load (CSS, .ready on #deck);
// 2) the instrument is server-rendered in its wide geometry; this script re-lays it out for narrow viewports and adds
//    .ready once when it enters the viewport, which runs the CSS calibration routine (orbit → hub → spokes → nodes
//    01/02/03 → principle columns). Reduced motion: the finished composition immediately. Everything is aria-hidden.
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const deck = document.getElementById('deck');
  if (deck) requestAnimationFrame(() => requestAnimationFrame(() => deck.classList.add('ready')));

  const inst = document.getElementById('instrument'); const svg = document.getElementById('inst-svg'); const plot = document.getElementById('inst-plot'); const cal = document.getElementById('inst-cal');
  if (!inst || !svg || !plot) return;
  const K = (k) => inst.querySelector('[data-k="' + k + '"]');
  const set = (k, attrs) => { const e = K(k); if (!e) return; for (const a in attrs) e.setAttribute(a, typeof attrs[a] === 'number' ? attrs[a].toFixed(1).replace(/\.0$/, '') : attrs[a]); };

  // Two geometries, one instrument. Wide: a 1000x300 field whose three nodes sit at the centres of the three principle
  // columns below (x = 1/6, 1/2, 5/6) and all lie on the one orbit around the hub. Narrow: a taller 1000x760 field.
  const GEOM = {
    wide: { W: 1000, H: 300, hub: [500, 150], rx: 400, ry: 120, n: [[166.7, 216.3], [500, 30], [833.3, 216.3]], node: 6, ring: 22, cal: [30, 46], tick: 8, hubS: 18, sig: 4, ax: 60, ay: 8, lab: [[16.667, 82], [52.4, 10], [83.333, 82]], labHub: [50, 70.5] },
    narrow: { W: 1000, H: 760, hub: [500, 400], rx: 380, ry: 300, n: [[200, 584], [500, 100], [800, 584]], node: 10, ring: 34, cal: [42, 60], tick: 12, hubS: 28, sig: 6, ax: 50, ay: 40, lab: [[20, 82.5], [53.6, 13.2], [80, 82.5]], labHub: [50, 62.5] },
  };
  let mode = '';
  function layout() {
    const m = window.innerWidth <= 860 ? 'narrow' : 'wide'; if (m === mode) return; mode = m;
    const g = GEOM[m]; const [hx, hy] = g.hub;
    svg.setAttribute('viewBox', `0 0 ${g.W} ${g.H}`); plot.style.aspectRatio = `${g.W} / ${g.H}`;
    set('orbit', { cx: hx, cy: hy, rx: g.rx, ry: g.ry });
    set('ax', { x1: g.ax, y1: hy, x2: g.W - g.ax, y2: hy }); set('ay', { x1: hx, y1: g.ay, x2: hx, y2: g.H - g.ay });
    // orbit ticks where the orbit crosses the axes (left, right, bottom; the top crossing is node 02)
    const t = g.tick * 0.75;
    set('o0', { x1: hx - g.rx, y1: hy - t, x2: hx - g.rx, y2: hy + t }); set('o1', { x1: hx + g.rx, y1: hy - t, x2: hx + g.rx, y2: hy + t }); set('o2', { x1: hx - t, y1: hy + g.ry, x2: hx + t, y2: hy + g.ry });
    set('c0', { cx: hx, cy: hy, r: g.cal[0] }); set('c1', { cx: hx, cy: hy, r: g.cal[1] });
    const r0 = g.cal[0], r1 = r0 + g.tick;
    set('t0', { x1: hx, y1: hy - r0, x2: hx, y2: hy - r1 }); set('t1', { x1: hx + r0, y1: hy, x2: hx + r1, y2: hy }); set('t2', { x1: hx, y1: hy + r0, x2: hx, y2: hy + r1 }); set('t3', { x1: hx - r0, y1: hy, x2: hx - r1, y2: hy });
    g.n.forEach((q, i) => { const k = i + 1; set('s' + k, { x1: hx, y1: hy, x2: q[0], y2: q[1] }); set('r' + k, { cx: q[0], cy: q[1], r: g.ring }); set('n' + k, { cx: q[0], cy: q[1], r: g.node }); const L = K('l' + k); if (L) { L.style.setProperty('--x', g.lab[i][0] + '%'); L.style.setProperty('--y', g.lab[i][1] + '%'); } });
    set('hub', { x: hx - g.hubS / 2, y: hy - g.hubS / 2, width: g.hubS, height: g.hubS }); set('sig', { cx: hx, cy: hy, r: g.sig });
    const LH = K('lh'); if (LH) { LH.style.setProperty('--x', g.labHub[0] + '%'); LH.style.setProperty('--y', g.labHub[1] + '%'); }
    if (cal) cal.innerHTML = `HUB ${hx} · ${hy} &nbsp;/&nbsp; ORBIT ${g.rx} × ${g.ry} &nbsp;/&nbsp; 03 NODES`;
  }
  layout(); window.addEventListener('resize', layout);

  // the calibration routine runs once, when a third of the instrument is in view
  const reveal = () => inst.classList.add('ready');
  if (reduceMotion || !('IntersectionObserver' in window)) { reveal(); return; }
  const io = new IntersectionObserver((entries) => { if (!entries.some((e) => e.isIntersecting)) return; reveal(); io.disconnect(); }, { threshold: 0.3 });
  io.observe(inst);
})();
