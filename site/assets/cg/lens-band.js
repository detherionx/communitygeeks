// Lens exhibit (10 Nov 2026): one open question at a time, the matching card on the board, and a one-time entrance. Markup: _build/lens.py.
document.querySelectorAll('[data-lens]').forEach(x => {
  const qs = [...x.querySelectorAll('.lens-x-q')];
  const pick = q => qs.forEach(b => {
    const on = b === q, n = b.dataset.n;
    b.setAttribute('aria-expanded', on);
    x.querySelector(`.lens-x-a[data-n="${n}"]`).classList.toggle('is-on', on);
    x.querySelector(`.lens-x-hl[data-n="${n}"]`).classList.toggle('is-on', on);
  });
  qs.forEach(b => b.addEventListener('click', () => pick(b)));
  pick(qs[0]);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window) || x.getBoundingClientRect().top < innerHeight) return;
  x.classList.add('is-pre');
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { x.classList.remove('is-pre'); io.disconnect(); }
  }, { threshold: 0.15 });
  io.observe(x);
});
