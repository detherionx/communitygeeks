// Public Thinking format filter. Progressive enhancement only — every row is
// real server-rendered HTML with real links; this just toggles visibility.
// No filter selected still shows everything, so this is safe with JS disabled.
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.filter-pill');
  const rows = document.querySelectorAll('[data-type]');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      rows.forEach(row => {
        row.style.display = (filter === 'all' || row.dataset.type === filter) ? '' : 'none';
      });
    });
  });
});
