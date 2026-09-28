/* v60 homepage choreography. Content is visible by default; the inline head script adds html.motion only when
   motion is allowed, and this file then stages the hero and reveals [data-reveal] blocks once as they enter.
   The hero drift pauses off-screen. Turning on reduced motion mid-visit shows everything immediately. */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('motion')) return;
  const hero = document.querySelector('.participation-hero');
  const start = () => requestAnimationFrame(() => hero && hero.classList.add('is-ready'));
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(start);

  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    reveal.unobserve(entry.target);
  }), { rootMargin: '0px 0px -12% 0px', threshold: .12 });
  document.querySelectorAll('[data-reveal]').forEach(el => reveal.observe(el));

  // crew idle loops run only while their scene is visible
  const live = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('crew-live', entry.isIntersecting)));
  new Set([...document.querySelectorAll('[data-crew-motion]')].map(actor => actor.closest('svg'))).forEach(svg => live.observe(svg));

  if (hero) new IntersectionObserver(([entry]) => hero.classList.toggle('is-offscreen', !entry.isIntersecting)).observe(hero);

  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
    if (!event.matches) return;
    reveal.disconnect();
    live.disconnect();
    root.classList.remove('motion');
  });
})();
