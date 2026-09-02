// Public Thinking homepage rail — an editorial carousel, not a marketing
// one. The rail is a real, natively scrollable element (CSS overflow-x +
// scroll-snap); every card is server-rendered and already in the DOM
// regardless of what this script does. This file adds one presentation
// layer on top: slow auto-advance (one card at a time, ~6s apart), paused
// the moment a reader touches the rail in any way, plus the prev/next
// buttons. No drag handling, no wheel-event hijacking, no ticker-style
// continuous scroll, no carousel library.
function initPtRail() {
  const wrap = document.querySelector('.pt-rail-wrap');
  if (!wrap) return;
  const rail = wrap.querySelector('.pt-rail');
  const prev = wrap.querySelector('.pt-rail-nav.prev');
  const next = wrap.querySelector('.pt-rail-nav.next');
  if (!rail || !prev || !next) return;

  const cards = Array.from(rail.querySelectorAll('.pt-card'));
  // One card (or zero): there is nothing to advance or navigate between —
  // the template already renders both buttons `disabled` in this case, so
  // just leave the rail as a plain, static, non-interactive block.
  if (cards.length < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTO_ADVANCE_MS = 6000;

  let currentIndex = 0;
  let timer = null;
  let paused = false;

  function nearestIndex() {
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - rail.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function goTo(index, behavior) {
    rail.scrollTo({ left: cards[index].offsetLeft, behavior });
    currentIndex = index;
  }

  // Stepping past either end loops to the other end. That loop jumps
  // instantly instead of animating across the whole rail — a smooth scroll
  // from card 12 back to card 1 would read as a fast reverse sweep, not a
  // deliberate "next piece" transition, and this is the one moment the
  // rail defines "next"/"previous" as: the very next or previous card.
  function step(delta, behavior) {
    currentIndex = nearestIndex();
    const n = cards.length;
    const target = (currentIndex + delta + n) % n;
    const wrapped = (delta > 0 && target < currentIndex) || (delta < 0 && target > currentIndex);
    goTo(target, wrapped ? 'auto' : behavior);
  }

  function armAutoAdvance() {
    clearTimeout(timer);
    if (paused || reduceMotion) return;
    timer = setTimeout(() => {
      step(1, 'smooth');
      armAutoAdvance();
    }, AUTO_ADVANCE_MS);
  }

  // pause() always just stops the pending tick. resume() always schedules
  // a fresh full-length wait — never "continues" a partially elapsed one —
  // so any interaction (a glance, a click, a swipe) buys a whole quiet
  // interval before the rail considers moving again.
  function pause() {
    paused = true;
    clearTimeout(timer);
  }

  function resume() {
    paused = false;
    armAutoAdvance();
  }

  prev.addEventListener('click', () => {
    step(-1, reduceMotion ? 'auto' : 'smooth');
    resume();
  });
  next.addEventListener('click', () => {
    step(1, reduceMotion ? 'auto' : 'smooth');
    resume();
  });

  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', resume);
  wrap.addEventListener('pointerdown', pause);
  wrap.addEventListener('pointerup', resume);
  wrap.addEventListener('touchstart', pause, { passive: true });
  wrap.addEventListener('touchend', resume, { passive: true });
  // focusin/focusout bubble from every descendant (card links, nav
  // buttons, the rail's own tabindex), so tabbing to read a card pauses
  // exactly like hovering one does — the carousel never moves while
  // keyboard focus is anywhere inside it.
  wrap.addEventListener('focusin', pause);
  wrap.addEventListener('focusout', (e) => {
    if (!wrap.contains(e.relatedTarget)) resume();
  });

  if (!reduceMotion) armAutoAdvance();
}

// document.readyState check guards against this script executing after
// DOMContentLoaded has already fired (e.g. injected by a dev-server
// live-reload rather than a normal top-to-bottom parse).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPtRail);
} else {
  initPtRail();
}
