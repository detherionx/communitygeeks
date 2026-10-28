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
