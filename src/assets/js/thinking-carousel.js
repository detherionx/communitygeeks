/* One complete article at a time. Content remains a plain list without JS. */
(() => {
  function boot() {
    const section = document.querySelector('#thinking'), list = section?.querySelector('.ledger');
    if (!list || section.classList.contains('carousel-ready')) return;
    const rows = [...list.children];
    if (!rows.length) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    const controls = document.createElement('div'); controls.className = 'carousel-controls';
    const heading=document.createElement('p');heading.className='carousel-heading';heading.textContent='Choose an article';
    const count=document.createElement('span');count.textContent=rows.length+' articles';heading.append(count);controls.append(heading);
    const dots = document.createElement('div'); dots.className = 'carousel-dots'; dots.setAttribute('role', 'group'); dots.setAttribute('aria-label', 'Choose an article');
    function button(label, text, parent, cls) { const b = document.createElement('button'); b.type = 'button'; b.className = cls || ''; b.setAttribute('aria-label', label); b.textContent = text; parent.append(b); return b; }
    const labels={
      '/public-thinking/what-remains-human-when-ai-takes-over/':'Human judgment',
      '/public-thinking/who-keeps-the-thread/':'AI & autonomy',
      '/public-thinking/where-participation-actually-lives/':'Gamescom perspectives',
      '/public-thinking/rethinking-where-participation-happens/':'Community ecosystems'
    };
    const selectors = rows.map((row, i) => button('Show article ' + (i + 1) + ': ' + row.querySelector('h3').textContent, labels[row.querySelector('h3 a').getAttribute('href')]||row.querySelector('h3').textContent, dots, 'article-dot'));
    controls.append(dots);list.before(controls);
    const status = document.createElement('span'); status.className = 'carousel-status'; status.setAttribute('aria-live', 'polite'); controls.append(status);
    list.setAttribute('aria-label', 'Public Thinking articles');
    section.classList.add('carousel-ready');
    function show(n, manual = true, direction = 0) {
      index = (n + rows.length) % rows.length;
      rows.forEach((r, i) => { r.hidden = i !== index; r.inert = i !== index; r.setAttribute('aria-hidden', String(i !== index)); });
      selectors.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
      if (manual) status.textContent = 'Article ' + (index + 1) + ' of ' + rows.length + ': ' + rows[index].querySelector('h3').textContent;
      if (direction && !motion.matches) { list.classList.remove('swipe-left', 'swipe-right'); void list.offsetWidth; list.classList.add(direction > 0 ? 'swipe-left' : 'swipe-right'); }
    }
    selectors.forEach((b, i) => b.addEventListener('click', () => show(i)));
    dots.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1)); selectors[index].focus(); } });
    let start;
    list.addEventListener('pointerdown', e => { if (e.isPrimary && e.pointerType !== 'mouse') start = {x:e.clientX, y:e.clientY, id:e.pointerId}; });
    list.addEventListener('pointercancel', () => start = null);
    let suppressClick = false;
    list.addEventListener('pointerup', e => { if (!start || start.id !== e.pointerId) return; const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { suppressClick = true; show(index + (dx < 0 ? 1 : -1), true, dx < 0 ? 1 : -1); setTimeout(() => suppressClick = false, 350); } });
    list.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    const head = section.querySelector('.pt-head'), edit = section.querySelector('.pt-edit'), field = section.querySelector('.pt-field');
    const mobile=matchMedia('(max-width:860px)');
    function headingPosition(){if(mobile.matches)field.before(head);else edit.prepend(head);}
    mobile.addEventListener('change',headingPosition);headingPosition();
    if (rows.length === 1) controls.hidden = true;
    show(0, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
