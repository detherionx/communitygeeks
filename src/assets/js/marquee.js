// The marquee's seamless loop (CSS translateX 0 -> -50%) needs the track's
// two halves to each be at least as wide as the viewport, or the animation
// runs out of content before wrapping and shows a visible gap. Server-side
// we can only render a fixed number of logo sets (7 clients x 2 for the
// loop), which isn't enough on very wide screens. This tops the track up at
// runtime by cloning whole existing sets (decorative, aria-hidden — the one
// real accessible set from the server is never touched) until each half is
// wide enough, keeping the two-halves-of-equal-width invariant the CSS loop
// depends on.
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  function ensureWideEnough() {
    const halfWidth = track.scrollWidth / 2;
    if (halfWidth <= 0 || halfWidth >= window.innerWidth) return;

    const multiplier = Math.ceil(window.innerWidth / halfWidth) + 1;
    const currentChildren = Array.from(track.children);
    for (let i = 1; i < multiplier; i++) {
      currentChildren.forEach((el) => {
        const clone = el.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }
  }

  ensureWideEnough();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(ensureWideEnough, 200);
  });
});
