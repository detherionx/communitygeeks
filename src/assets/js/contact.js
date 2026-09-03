// Communitygeeks: CONTACT CONCEPT "docking clearance".
// One native form, four stages shown one at a time, posted by fetch to the
// site's own endpoint (decision C-1). The station drawing reflects progress
// and nothing else: the vector advances one checkpoint per valid stage, the
// trajectory becomes a solid rule on success. Every state is announced.
(function () {
  'use strict';
  const form = document.getElementById('dock'); if (!form) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };

  // ---------------------------------------------------------------- station
  function drawStation(svg, mobile) {
    svg.innerHTML = '';
    const g = el('g', {}, svg);
    const arc = (cx, cy, r, a0, a1, cls) => { let d = ''; for (let i = 0; i <= 16; i++) { const a = (a0 + (a1 - a0) * i / 16) * Math.PI / 180; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1); } return el('path', { class: cls, d }, g); };
    const reg = (x, y, sx, sy) => el('path', { class: 'st-reg', d: 'M' + x + ' ' + (y + sy * 10) + ' V' + y + ' H' + (x + sx * 10) }, g);
    let T;
    if (mobile) {
      el('circle', { class: 'st-ring', cx: 330, cy: 128, r: 150 }, g);
      [[-150, -120], [-60, -30], [40, 70]].forEach(([a0, a1]) => arc(330, 128, 150, a0, a1, 'st-seg'));
      el('rect', { class: 'st-plane', x: 236, y: 48, width: 200, height: 160 }, g);
      el('rect', { class: 'st-opening', x: 262, y: 72, width: 160, height: 112 }, g);
      reg(268, 78, 1, 1); reg(268, 178, 1, -1);
      el('rect', { class: 'st-rule', x: 0, y: 244, width: 390, height: 3 }, g);
      T = { x1: -10, y1: 236, x2: 262, y2: 128, cp: 5, vec: 16, edge: { x: 259, y: 72, w: 3, h: 112 } };
    } else {
      el('circle', { class: 'st-ring', cx: 640, cy: 300, r: 330 }, g);
      [[-165, -140], [-95, -70], [150, 170], [100, 125]].forEach(([a0, a1]) => arc(640, 300, 330, a0, a1, 'st-seg'));
      el('rect', { class: 'st-plane', x: 360, y: 100, width: 440, height: 460 }, g);
      el('rect', { class: 'st-opening', x: 400, y: 140, width: 308, height: 380 }, g);
      reg(406, 146, 1, 1); reg(702, 146, -1, 1); reg(406, 514, 1, -1); reg(702, 514, -1, -1);
      el('rect', { class: 'st-rule', x: 0, y: 560, width: 760, height: 3 }, g);
      T = { x1: -20, y1: 470, x2: 400, y2: 330, cp: 6, vec: 20, edge: { x: 396, y: 140, w: 4, h: 380 } };
    }
    const traj = el('line', { class: 'st-traj', x1: T.x1, y1: T.y1, x2: T.x2, y2: T.y2 }, g);
    const done = el('line', { class: 'st-done', x1: T.x1, y1: T.y1, x2: T.x1, y2: T.y1 }, g);
    const cps = [0.25, 0.5, 0.75, 1].map((c) => { const cx = T.x1 + (T.x2 - T.x1) * c, cy = T.y1 + (T.y2 - T.y1) * c; return el('rect', { class: 'st-cp', x: cx - T.cp, y: cy - T.cp, width: T.cp * 2, height: T.cp * 2 }, g); });
    const ang = Math.atan2(T.y2 - T.y1, T.x2 - T.x1); const hw = T.vec * 0.42;
    const vec = el('polygon', { class: 'st-vec', points: '0,0 ' + (-T.vec) + ',' + hw + ' ' + (-T.vec) + ',' + (-hw), transform: 'translate(' + T.x1 + ' ' + T.y1 + ') rotate(' + (ang * 180 / Math.PI).toFixed(2) + ')' }, g);
    el('rect', { class: 'st-edge', x: T.edge.x, y: T.edge.y, width: T.edge.w, height: T.edge.h }, g);
    return {
      set(step, state) {
        const t = state === 'sent' ? 1 : step / 4; const vx = T.x1 + (T.x2 - T.x1) * t, vy = T.y1 + (T.y2 - T.y1) * t;
        done.setAttribute('x2', vx.toFixed(1)); done.setAttribute('y2', vy.toFixed(1));
        vec.setAttribute('transform', 'translate(' + vx.toFixed(1) + ' ' + vy.toFixed(1) + ') rotate(' + (ang * 180 / Math.PI).toFixed(2) + ')');
        cps.forEach((c, i) => { c.classList.toggle('on', state === 'sent' || i < step); c.classList.toggle('cur', state !== 'sent' && i === step); });
        svg.classList.toggle('sent', state === 'sent');
      },
    };
  }
  const stations = [];
  const sD = document.getElementById('station-svg'); if (sD) stations.push(drawStation(sD, false));
  const sM = document.getElementById('station-svg-m'); if (sM) stations.push(drawStation(sM, true));
  const paint = (step, state) => stations.forEach((s) => s.set(step, state));

  // ---------------------------------------------------------------- form
  const stages = Array.from(form.querySelectorAll('.stage'));
  const names = ['Identify', 'Open channel', 'Transmit context', 'Request clearance'];
  const stepEl = document.getElementById('dock-step'), stageEl = document.getElementById('dock-stage'), prog = Array.from(document.querySelectorAll('#dock-prog li'));
  const back = document.getElementById('dock-back'), next = document.getElementById('dock-next'), send = document.getElementById('dock-send'), doneBox = document.getElementById('dock-done'), live = document.getElementById('dock-live'), formErr = document.getElementById('form-err');
  const fields = { name: document.getElementById('c-name'), email: document.getElementById('c-email'), context: document.getElementById('c-context') };
  document.getElementById('c-t').value = String(Math.floor(Date.now() / 1000));
  document.getElementById('c-id').value = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  let current = 0, sending = false, sent = false;

  function show(i, focus) {
    current = i;
    stages.forEach((s, k) => { s.hidden = k !== i; });
    stepEl.textContent = String(i + 1); stageEl.textContent = names[i];
    prog.forEach((p, k) => { p.classList.toggle('on', k < i); p.classList.toggle('cur', k === i); });
    back.hidden = i === 0; next.hidden = i === 3; send.hidden = i !== 3;
    if (i === 3) { document.getElementById('r-name').textContent = fields.name.value.trim(); document.getElementById('r-email').textContent = fields.email.value.trim(); document.getElementById('r-context').textContent = fields.context.value.trim(); }
    paint(i, sent ? 'sent' : 'idle');
    if (focus) { const target = i === 3 ? send : stages[i].querySelector('.in'); if (target) target.focus({ preventScroll: false }); }
    live.textContent = 'Step ' + (i + 1) + ' of 4, ' + names[i] + '.';
  }
  function setError(input, msg) {
    const err = document.getElementById(input.id + '-err');
    if (msg) { err.textContent = msg; err.hidden = false; input.classList.add('err'); input.setAttribute('aria-invalid', 'true'); live.textContent = msg; }
    else { err.textContent = ''; err.hidden = true; input.classList.remove('err'); input.removeAttribute('aria-invalid'); }
  }
  function validate(i) {
    if (i === 0) { const v = fields.name.value.trim(); if (!v) { setError(fields.name, 'Enter your name so the reply can address you.'); return false; } if (v.length > 120) { setError(fields.name, 'Please keep your name under 120 characters.'); return false; } setError(fields.name, ''); return true; }
    if (i === 1) { const v = fields.email.value.trim(); if (!v) { setError(fields.email, 'Enter the email address replies should go to.'); return false; } if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setError(fields.email, 'Enter a complete email address, like name@company.com.'); return false; } setError(fields.email, ''); return true; }
    if (i === 2) { const v = fields.context.value.trim(); if (!v) { setError(fields.context, 'Tell us what is going on, even in one line.'); return false; } if (v.length > 4000) { setError(fields.context, 'Please keep this under 4000 characters.'); return false; } setError(fields.context, ''); return true; }
    return true;
  }
  next.addEventListener('click', () => { if (validate(current)) show(current + 1, true); });
  back.addEventListener('click', () => show(Math.max(0, current - 1), true));
  form.querySelectorAll('.edit').forEach((b) => b.addEventListener('click', () => show(+b.dataset.goto - 1, true)));
  Object.values(fields).forEach((inp) => { inp.addEventListener('input', () => { if (inp.classList.contains('err')) validate(current); }); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inp.tagName !== 'TEXTAREA') { e.preventDefault(); if (validate(current)) show(current + 1, true); } }); });

  // Turnstile, only when a site key is configured
  const tsKey = form.dataset.turnstileKey; let tsToken = '';
  if (tsKey) { window.onTurnstileLoad = () => { if (window.turnstile) window.turnstile.render('#turnstile', { sitekey: tsKey, size: 'flexible', appearance: 'interaction-only', callback: (tok) => { tsToken = tok; } }); }; const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'; s.async = true; s.defer = true; document.head.appendChild(s); }

  function failure(msg) {
    formErr.innerHTML = ''; formErr.textContent = msg + ' '; const a = document.createElement('a'); a.href = 'mailto:carmelito@communitygeeks.de'; a.textContent = 'carmelito@communitygeeks.de'; formErr.appendChild(a); formErr.hidden = false; live.textContent = msg;
    paint(3, 'error');
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); if (sending || sent) return;
    for (let i = 0; i < 3; i++) { if (!validate(i)) { show(i, true); return; } }
    sending = true; send.disabled = true; send.classList.add('busy'); send.querySelector('.kctl-label').textContent = 'Sending…'; formErr.hidden = true; live.textContent = 'Sending your message.';
    const body = { name: fields.name.value.trim(), email: fields.email.value.trim(), context: fields.context.value.trim(), website: document.getElementById('c-website').value, t: +document.getElementById('c-t').value, id: document.getElementById('c-id').value, token: tsToken };
    let res, data;
    try {
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 15000);
      res = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal, credentials: 'same-origin' });
      clearTimeout(timer);
      try { data = await res.json(); } catch (_) { data = {}; }
    } catch (err) {
      sending = false; send.disabled = false; send.classList.remove('busy'); send.querySelector('.kctl-label').textContent = 'Try again';
      failure('We couldn’t send your message. Please try again or email Carmelito directly:'); return;
    }
    sending = false; send.disabled = false; send.classList.remove('busy');
    if (res.ok && data && data.ok) {
      sent = true; form.classList.add('is-done'); stages.forEach((s) => { s.hidden = true; }); doneBox.hidden = false; paint(4, 'sent'); live.textContent = 'Message sent. It goes straight to Carmelito. Replies come by email to the address you entered.'; doneBox.focus();
      return;
    }
    if (res.status === 422 && data && data.errors) {
      const order = ['name', 'email', 'context']; const first = order.find((k) => data.errors[k]);
      order.forEach((k) => { if (data.errors[k]) setError(fields[k], data.errors[k]); });
      send.querySelector('.kctl-label').textContent = 'Send message'; if (first) show(order.indexOf(first), true); return;
    }
    send.querySelector('.kctl-label').textContent = 'Try again';
    failure(res.status === 429 ? 'Too many messages from this connection right now. Please wait a few minutes, or email Carmelito directly:' : 'We couldn’t send your message. Please try again or email Carmelito directly:');
  });

  show(0, false);
})();
