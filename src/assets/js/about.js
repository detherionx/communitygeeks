// About operator station: one load-time resolve (portrait aperture opens,
// registration marks align), driven by CSS once .ready lands. No scan line
// (approval A-05). Reduced motion shows the resolved state.
(function () {
  const deck = document.getElementById('deck');
  if (!deck) return;
  requestAnimationFrame(() => requestAnimationFrame(() => deck.classList.add('ready')));
})();
