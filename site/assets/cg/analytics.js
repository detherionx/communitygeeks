// Umami events for the production site (28 Oct 2026). The Umami script records pageviews itself; this file adds
// click events. outbound_click keeps the live site's event name and properties (url, domain), so Cal.com bookings
// and other external links stay comparable with the data since 25 Aug 2026.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || !window.umami) return;
  let url;
  try { url = new URL(link.href, location.href); } catch (err) { return; }
  const page = location.pathname;
  if (url.protocol === 'mailto:') umami.track('email_click', { page });
  else if (url.pathname.endsWith('.pdf')) umami.track('pdf_download', { file: url.pathname, page });
  else if (url.protocol.startsWith('http') && url.hostname !== location.hostname) umami.track('outbound_click', { url: url.href, domain: url.hostname, page });
});
