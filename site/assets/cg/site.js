// Header panels: one open at a time; Escape, outside click and Close return focus to the trigger.
(() => {
  const hdr = document.querySelector('.cg-hdr'), nav = document.getElementById('cg-nav'), tog = document.querySelector('.cg-toggle');
  if (!hdr || !nav || !tog) return;
  const trigs = [...nav.querySelectorAll('.cg-trig')];
  const panel = t => document.getElementById(t.getAttribute('aria-controls'));
  const close = back => trigs.forEach(t => {
    if (t.getAttribute('aria-expanded') !== 'true') return;
    t.setAttribute('aria-expanded', 'false'); panel(t).hidden = true; if (back) t.focus();
  });
  const closeAll = () => { close(); nav.classList.remove('open'); tog.setAttribute('aria-expanded', 'false'); tog.textContent = 'Menu'; document.body.classList.remove('cg-menu-open'); };
  trigs.forEach(t => t.addEventListener('click', () => {
    const open = t.getAttribute('aria-expanded') === 'true'; close();
    if (!open) { t.setAttribute('aria-expanded', 'true'); panel(t).hidden = false; panel(t).querySelector('a').focus({ preventScroll: true }); }
  }));
  nav.querySelectorAll('.cg-x').forEach(b => b.addEventListener('click', () => close(true)));
  tog.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    tog.setAttribute('aria-expanded', String(open)); tog.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('cg-menu-open', open); if (!open) close();
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeAll));
  document.addEventListener('click', e => { if (!hdr.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const t = trigs.find(t => t.getAttribute('aria-expanded') === 'true');
    if (t) close(true); else if (nav.classList.contains('open')) { closeAll(); tog.focus(); }
  });
  // Event links expire after BIG Bilbao (12 Dec 2026), in the visitor's local time.
  if (new Date() >= new Date(2026, 11, 13)) document.querySelectorAll('[data-event]').forEach(el => el.remove());
})();
