// Public Thinking figure lightbox. Progressive enhancement only: every
// figure link points at the real image file, so this still works (as a
// normal navigation) with JS disabled.
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('[data-lightbox]');
  if (!links.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'pt-lightbox-overlay';
  overlay.innerHTML = '<img class="pt-lightbox-img" alt="">';
  document.body.appendChild(overlay);
  const img = overlay.querySelector('img');

  const open = (href, alt) => {
    img.src = href;
    img.alt = alt;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sourceImg = link.querySelector('img');
      open(link.href, sourceImg ? sourceImg.alt : '');
    });
  });
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
});
