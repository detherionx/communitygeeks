/* One complete article at a time. Content remains a plain list without JS. */
(() => {
  function boot() {
    const section = document.querySelector('#thinking'), list = section?.querySelector('.ledger');
    if (!list || section.classList.contains('carousel-ready')) return;
    const rows = [...list.children];
    if (!rows.length) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0, playing = !motion.matches, visible = false, hovered = false, focused = false, timer;
    const controls = document.createElement('div'); controls.className = 'carousel-controls';
    const dots = document.createElement('div'); dots.className = 'carousel-dots'; dots.setAttribute('role', 'group'); dots.setAttribute('aria-label', 'Choose an article');
    const actions = document.createElement('div'); actions.className = 'carousel-actions';
    function button(label, text, parent, cls) { const b = document.createElement('button'); b.type = 'button'; b.className = cls || ''; b.setAttribute('aria-label', label); b.textContent = text; parent.append(b); return b; }
    const selectors = rows.map((row, i) => button('Show article ' + (i + 1) + ': ' + row.querySelector('h3').textContent, '', dots, 'article-dot'));
    const play = button('Pause auto advance', 'Ⅱ', actions, 'play-toggle');
    const prev = button('Previous article', '←', actions, 'prev');
    const next = button('Next article', '→', actions, 'next');
    controls.append(dots, actions); list.after(controls);
    const status = document.createElement('span'); status.className = 'carousel-status'; status.setAttribute('aria-live', 'polite'); controls.append(status);
    list.setAttribute('aria-label', 'Public Thinking articles');
    section.classList.add('carousel-ready');
    function schedule() { clearTimeout(timer); if (playing && visible && !hovered && !focused && !document.hidden && !motion.matches && rows.length > 1) timer = setTimeout(() => { show(index + 1, false); }, 10000); }
    function setPlaying(value) { playing = value && !motion.matches; play.textContent = playing ? 'Ⅱ' : '▷'; play.setAttribute('aria-label', playing ? 'Pause auto advance' : 'Play auto advance'); schedule(); }
    function show(n, manual = true, direction = 0) {
      index = (n + rows.length) % rows.length;
      rows.forEach((r, i) => { r.hidden = i !== index; r.inert = i !== index; r.setAttribute('aria-hidden', String(i !== index)); });
      selectors.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
      if (manual) { setPlaying(false); status.textContent = 'Article ' + (index + 1) + ' of ' + rows.length + ': ' + rows[index].querySelector('h3').textContent; }
      if (direction && !motion.matches) { list.classList.remove('swipe-left', 'swipe-right'); void list.offsetWidth; list.classList.add(direction > 0 ? 'swipe-left' : 'swipe-right'); }
      schedule();
    }
    selectors.forEach((b, i) => b.addEventListener('click', () => show(i)));
    prev.addEventListener('click', () => show(index - 1)); next.addEventListener('click', () => show(index + 1)); play.addEventListener('click', () => setPlaying(!playing));
    controls.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1)); } });
    const body = section.querySelector('.pt-body');
    body.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered = true; schedule(); } }); body.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    body.addEventListener('focusin', () => { focused = true; schedule(); }); body.addEventListener('focusout', () => { focused = false; schedule(); });
    let start;
    list.addEventListener('pointerdown', e => { if (e.isPrimary && e.pointerType !== 'mouse') start = {x:e.clientX, y:e.clientY, id:e.pointerId}; });
    list.addEventListener('pointercancel', () => start = null);
    let suppressClick = false;
    list.addEventListener('pointerup', e => { if (!start || start.id !== e.pointerId) return; const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { suppressClick = true; show(index + (dx < 0 ? 1 : -1), true, dx < 0 ? 1 : -1); setTimeout(() => suppressClick = false, 350); } });
    list.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }, {threshold:0.2}); observer.observe(list);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', () => { if (motion.matches) setPlaying(false); });
    const head = section.querySelector('.pt-head'), edit = section.querySelector('.pt-edit'), field = section.querySelector('.pt-field'), mobile = matchMedia('(max-width:860px)');
    function headingPosition() { if (mobile.matches) field.before(head); else edit.prepend(head); }
    mobile.addEventListener('change', headingPosition); headingPosition();
    if (rows.length === 1) controls.hidden = true;
    show(0, false); setPlaying(playing);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
