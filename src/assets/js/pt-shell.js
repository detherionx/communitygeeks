// Concept Public Thinking index: after the live filter script toggles rows,
// show the "nothing in this format yet" line when a format has no rows.
// Also mirrors aria-pressed on the pills for assistive tech.
document.addEventListener('DOMContentLoaded', () => {
  const empty = document.getElementById('ledger-empty');
  const pills = document.querySelectorAll('.filter-pill');
  if (!empty || !pills.length) return;
  pills.forEach((pill) => pill.addEventListener('click', () => {
    pills.forEach((p) => p.setAttribute('aria-pressed', p === pill ? 'true' : 'false'));
    requestAnimationFrame(() => {
      const visible = Array.from(document.querySelectorAll('[data-type]')).some((r) => r.style.display !== 'none');
      empty.hidden = visible;
    });
  }));
});
