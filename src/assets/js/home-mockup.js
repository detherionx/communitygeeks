// Homepage mockup v2: motion layer. Progressive enhancement only. Every
// element this touches is fully rendered and readable with the script
// absent; home-mockup.css only hides/offsets things under html.js, which
// the layout adds inline before first paint. Four responsibilities:
//   1. masthead: condensed state + scroll-progress rule
//   2. reveals: IntersectionObserver adds .in (staggered via --d)
//   3. parallax: rAF-driven translate for [data-parallax], desktop only
//   4. the pinned "problem" sequence: which beat is centred drives
//      data-active on the section (and the figure state via CSS)
// prefers-reduced-motion disables 1's transition, 3 entirely, and makes
// 2/4 instantaneous (CSS handles the no-transition part).
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isNarrow = () => window.matchMedia('(max-width: 860px)').matches;
  const header = document.querySelector('.site-header');

  // ---- 1. masthead ------------------------------------------------------
  function setHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  setHeaderHeight();

  function updateHeader() {
    if (!header) return;
    const y = window.scrollY || 0;
    header.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    header.style.setProperty('--progress', p.toFixed(4));
  }

  // ---- 2. reveals -------------------------------------------------------
  // Stagger: any [data-stagger="ms"] container hands its direct children an
  // increasing --d, so a grid enters as a sequence rather than a block.
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const step = parseInt(group.dataset.stagger, 10) || 80;
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--d', (i * step) + 'ms');
    });
  });

  // H1 word split: wraps each word (inside or outside the <em>) so CSS can
  // rise them in one after another. Text content is unchanged.
  const h1 = document.querySelector('.split-words');
  if (h1 && !reduceMotion) {
    let index = 0;
    const wrapTextNode = (node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const w = document.createElement('span');
        w.className = 'w';
        const wi = document.createElement('span');
        wi.className = 'wi';
        wi.style.setProperty('--d', index++);
        wi.textContent = part;
        w.appendChild(wi);
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    };
    Array.from(h1.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) wrapTextNode(node);
      else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach((inner) => {
          if (inner.nodeType === Node.TEXT_NODE) wrapTextNode(inner);
        });
      }
    });
    requestAnimationFrame(() => requestAnimationFrame(() => h1.classList.add('in')));
  } else if (h1) {
    h1.classList.add('in');
  }

  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => io.observe(el));
    // First screen safety net: anything already in view when the script
    // runs reveals on the next frame regardless of what the observer
    // reports, so above-the-fold content never waits on a callback.
    requestAnimationFrame(() => {
      revealTargets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    });
  } else {
    revealTargets.forEach((el) => el.classList.add('in'));
  }

  // ---- 3. parallax ------------------------------------------------------
  // Positive speed = background (moves slower than the page), negative =
  // foreground (slightly faster). Offsets are relative to the element's
  // distance from the viewport centre, so an element is at rest exactly
  // when it is centred and never jumps on load.
  const px = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0,
    scale: el.dataset.scale ? parseFloat(el.dataset.scale) : null,
  }));

  function updateParallax() {
    if (reduceMotion || isNarrow()) {
      px.forEach((p) => { p.el.style.transform = ''; });
      return;
    }
    const vh = window.innerHeight;
    px.forEach((p) => {
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      // Undo the current transform's contribution so the centre is stable.
      const centre = (r.top + r.height / 2) - vh / 2 - (p.current || 0);
      const y = -centre * p.speed;
      p.current = y;
      p.el.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)' + (p.scale ? ' scale(' + p.scale + ')' : '');
    });
  }

  // ---- 4. pinned sequence ----------------------------------------------
  const seq = document.querySelector('.problem-seq');
  const steps = seq ? Array.from(seq.querySelectorAll('.seq-step')) : [];
  const counter = seq ? seq.querySelector('.seq-counter-now') : null;

  function setActive(i) {
    if (!seq) return;
    seq.dataset.active = String(i);
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    if (counter) counter.textContent = String(i + 1).padStart(2, '0');
  }

  function updateSequence() {
    if (!seq || !steps.length) return;
    if (isNarrow()) {
      // Unpinned: the whole paragraph reads at full emphasis, figure complete.
      seq.dataset.active = '2';
      steps.forEach((s) => s.classList.add('is-active'));
      return;
    }
    const line = window.innerHeight * 0.45;
    let active = 0;
    steps.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top <= line) active = i;
    });
    // Before the section reaches the reading line, hold the first beat.
    const first = steps[0].getBoundingClientRect();
    if (first.top > window.innerHeight * 0.9) active = 0;
    if (seq.dataset.active !== String(active)) setActive(active);
    else steps.forEach((s, k) => s.classList.toggle('is-active', k === active));
  }

  // ---- scheduler --------------------------------------------------------
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader();
      updateParallax();
      updateSequence();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { setHeaderHeight(); onScroll(); });
  window.addEventListener('load', () => { setHeaderHeight(); onScroll(); });
  setActive(0);
  onScroll();
})();
