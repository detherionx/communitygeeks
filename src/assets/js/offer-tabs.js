// A single mobile offer reader; desktop and no-script views retain all offers.
(() => {
  const section = document.querySelector('#approach');
  if (!section) return;
  const mobile = matchMedia('(max-width: 860px)');
  const list = section.querySelector('.path-panels');
  const panels = [...list.children];
  const pilot = section.querySelector('.pilot-example');
  const bottom = section.querySelector('.approach-bottom');
  const contact = section.querySelector('.path-more');
  const intro = contact.parentElement;
  const tabs = document.createElement('div');
  tabs.className = 'offer-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Ways to work together');
  const buttons = ['Discover', 'Activate', 'Connect'].map((label, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `offer-tab-${i}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `offer-panel-${i}`);
    button.innerHTML = `<span>0${i + 1}</span>${label}`;
    panels[i].id = `offer-panel-${i}`;
    tabs.append(button);
    return button;
  });
  list.before(tabs);
  const navigation = document.createElement('div');
  navigation.className = 'offer-navigation';
  navigation.innerHTML = '<button type="button" aria-label="Previous offer">←</button><span aria-live="polite" aria-atomic="true"></span><button type="button" aria-label="Next offer">→</button>';
  list.after(navigation);
  const [previous, next] = navigation.querySelectorAll('button');
  let active = 0;
  function select(index, focus = false) {
    active = (index + panels.length) % panels.length;
    panels.forEach((panel, i) => {
      panel.hidden = mobile.matches && i !== active;
      buttons[i].setAttribute('aria-selected', String(i === active));
      buttons[i].tabIndex = i === active ? 0 : -1;
    });
    navigation.querySelector('span').textContent = `0${active + 1} / 03 · Swipe to explore`;
    if (focus) buttons[active].focus({ preventScroll: true });
  }
  function navigate(index, focus = false) {
    select(index, focus);
    if (tabs.getBoundingClientRect().top < 80) tabs.scrollIntoView({ block: 'start' });
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => navigate(i));
    button.addEventListener('keydown', event => {
      const target = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: 2 }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      navigate(target, true);
    });
  });
  previous.addEventListener('click', () => navigate(active - 1));
  next.addEventListener('click', () => navigate(active + 1));
  let start = null;
  list.addEventListener('touchstart', event => {
    start = mobile.matches && event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  list.addEventListener('touchend', event => {
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(active + (dx < 0 ? 1 : -1));
  }, { passive: true });
  list.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  function layout() {
    section.classList.toggle('offer-reader', mobile.matches);
    tabs.hidden = navigation.hidden = !mobile.matches;
    if (mobile.matches) {
      panels[1].append(pilot);
      bottom.append(contact);
      list.setAttribute('role', 'presentation');
      panels.forEach((panel, i) => {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', buttons[i].id);
        panel.tabIndex = 0;
      });
    } else {
      bottom.prepend(pilot);
      intro.append(contact);
      list.removeAttribute('role');
      panels.forEach(panel => {
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
        panel.removeAttribute('tabindex');
      });
    }
    select(active);
  }
  mobile.addEventListener('change', layout);
  layout();
})();
