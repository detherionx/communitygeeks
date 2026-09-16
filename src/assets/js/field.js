// Homepage: selected work, trust band and article interactions.
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (svg) => (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).appendChild(n); return n; };

  const manifest = document.getElementById('manifest');
  if (manifest) {
    const tabs = Array.from(manifest.querySelectorAll('[role="tab"]')); const recs = Array.from(manifest.querySelectorAll('.mani-rec')); const cursor = manifest.querySelector('.mani-cursor'); const list = document.getElementById('mani-records');
    let selected = 0, shown = 0;
    const show = (i) => { shown = i; recs.forEach((r, k) => r.classList.toggle('on', k === i)); if (cursor) cursor.style.setProperty('--i', i); };
    const select = (i, focus) => { selected = i; tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; }); show(i); if (focus) tabs[i].focus({ preventScroll: true }); };
    const fitHeight = () => { let h = 0; recs.forEach((r) => { const was = r.classList.contains('on'); r.classList.add('on'); r.style.animation = 'none'; h = Math.max(h, r.offsetHeight); r.style.animation = ''; r.classList.toggle('on', was); }); list.style.setProperty('--mani-h', (h + 26) + 'px'); };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => { const n = tabs.length; let j = null; if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1; if (j !== null) { e.preventDefault(); select(j, true); } });
      if (finePointer) { t.addEventListener('mouseenter', () => show(i)); t.addEventListener('mouseleave', () => show(selected)); }
    });
    fitHeight(); window.addEventListener('resize', fitHeight); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeight);
    const cases = manifest.closest('.cases'); const enter = () => cases.classList.add('in');
    if (cases) { if ('IntersectionObserver' in window && !reduceMotion) { const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { enter(); io.disconnect(); } }); }, { threshold: 0.25 }); io.observe(cases); } else enter(); }
  }
  // F6 · the logo band: the logos slide into place once, when the band enters view
  const trust = document.querySelector('.trust');
  if (trust) { const show = () => trust.classList.add('in'); if ('IntersectionObserver' in window && !reduceMotion) { const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { show(); io.disconnect(); } }); }, { threshold: 0.2 }); io.observe(trust); } else show(); }

  const ptSection = document.querySelector('.pt');
  const ptSvg = document.getElementById('pt-signal');
  if (ptSection && ptSvg) {
    const body = document.getElementById('pt-body');
    const rows = Array.from(ptSection.querySelectorAll('.ledger-row'));
    const seeAll = document.getElementById('pt-seeall');
    const sel = mk(ptSvg);
    const rail = sel('line', { class: 'sig-rail', x1: 14, x2: 14 });
    const tail = sel('line', { class: 'sig-rail-tail', x1: 14, x2: 14 });
    const trace = sel('line', { class: 'sig-trace', x1: 14, x2: 14 });
    const pulses = rows.map(() => sel('rect', { class: 'sig-pulse', width: 9, height: 9 }));
    const pts = rows.map(() => sel('rect', { class: 'sig-pt', width: 9, height: 9 }));
    const beaconRing = sel('rect', { class: 'sig-beacon-ring', width: 11, height: 11 });
    const beacon = sel('rect', { class: 'sig-beacon', width: 7, height: 7 });
    let ys = [], beaconY = 0, top = 0, target = 0, entered = false;
    function measure() {
      const b = body.getBoundingClientRect(); top = 0;
      ptSvg.setAttribute('viewBox', '0 0 28 ' + Math.round(b.height)); ptSvg.setAttribute('width', 28); ptSvg.setAttribute('height', Math.round(b.height));
      ys = rows.map((r) => { const t = r.querySelector('.ledger-title') || r; const tb = t.getBoundingClientRect(); return tb.top - b.top + tb.height / 2; });
      const sb = (seeAll || body).getBoundingClientRect(); beaconY = sb.top - b.top + sb.height / 2;
      const lastY = ys.length ? ys[ys.length - 1] : 0;
      rail.setAttribute('y1', 0); rail.setAttribute('y2', lastY.toFixed(1));
      tail.setAttribute('y1', lastY.toFixed(1)); tail.setAttribute('y2', (beaconY - 12).toFixed(1));
      pts.forEach((p, i) => { p.setAttribute('x', 9.5); p.setAttribute('y', (ys[i] - 4.5).toFixed(1)); pulses[i].setAttribute('x', 9.5); pulses[i].setAttribute('y', (ys[i] - 4.5).toFixed(1)); });
      beacon.setAttribute('x', 10.5); beacon.setAttribute('y', (beaconY - 3.5).toFixed(1)); beaconRing.setAttribute('x', 8.5); beaconRing.setAttribute('y', (beaconY - 5.5).toFixed(1));
      const total = beaconY; trace.setAttribute('y1', 0); trace.setAttribute('y2', total.toFixed(1)); trace.style.strokeDasharray = total.toFixed(1);
      apply(false);
    }
    function apply(animate) {
      const y = ys[target] || 0; const total = beaconY || 1;
      if (!animate) trace.style.transition = 'none';
      trace.style.strokeDashoffset = entered || reduceMotion ? (total - y).toFixed(1) : total.toFixed(1);
      if (!animate) requestAnimationFrame(() => { trace.style.transition = ''; });
      pts.forEach((p, i) => { p.classList.toggle('on', (entered || reduceMotion) && i === target); pulses[i].classList.toggle('on', (entered || reduceMotion) && i === target); });
    }
    rows.forEach((r, i) => { const go = () => { target = i; apply(true); }; const back = () => { target = 0; apply(true); }; r.addEventListener('mouseenter', go); r.addEventListener('mouseleave', back); r.addEventListener('focusin', go); r.addEventListener('focusout', (e) => { if (!r.contains(e.relatedTarget)) back(); }); });
    const enter = () => { entered = true; ptSection.classList.add('in'); apply(true); };
    if ('IntersectionObserver' in window && !reduceMotion) { const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { enter(); io.disconnect(); } }); }, { threshold: 0.25 }); io.observe(body); } else enter();
    measure(); window.addEventListener('resize', measure); if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure); window.addEventListener('load', measure);
  }

  const ledgerEmpty = document.getElementById('ledger-empty');
  if (ledgerEmpty) { document.querySelectorAll('.filter-pill').forEach((pill) => pill.addEventListener('click', () => { document.querySelectorAll('.filter-pill').forEach((p) => p.setAttribute('aria-pressed', p === pill ? 'true' : 'false')); requestAnimationFrame(() => { ledgerEmpty.hidden = Array.from(document.querySelectorAll('.ledger-row')).some((r) => r.style.display !== 'none'); }); })); }

})();
