// Lisbon hub (28 Oct 2026): four falling leaves over the harbour illustration. Icon pause/play button, paused while the
// scene is off-screen, and nothing runs for visitors who prefer reduced motion (CSS hides the leaves and the button).
(() => {
  const scene = document.getElementById('harbour');
  const button = document.getElementById('lx-motion');
  if (!scene || !button || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let paused = false, visible = true;
  const apply = () => scene.classList.toggle('lx-paused', paused || !visible);
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-label', paused ? 'Play leaves' : 'Pause leaves');
    scene.classList.toggle('lx-paused-user', paused);
    apply();
  });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; apply(); }).observe(scene);
})();
// Deep links (15 Nov 2026): web fonts can reflow the page after the browser has jumped to a #hash (the talk's QR code opens
// #community-week), so align the target again once fonts and images are in, unless the visitor has already scrolled.
(() => {
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target || !document.fonts) return;
  let moved = false;
  for (const t of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(t, () => { moved = true; }, { once: true, passive: true });
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
  Promise.all([document.fonts.ready, loaded]).then(() => requestAnimationFrame(() => {
    if (!moved) target.scrollIntoView({ block: 'start', behavior: 'instant' });
  }));
})();
