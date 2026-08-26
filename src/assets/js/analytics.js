// Sends the pageview (auto-pageview is off in base.njk so this is the only
// pageview call) and tracks outbound clicks. Reads plain data-artifact-*
// attributes off the page rather than any Umami-specific markup, so the
// analytics provider can be swapped later by rewriting only this file —
// no content template needs to know Umami exists.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.umami) return; // e.g. blocked by an ad/tracker blocker

  const article = document.querySelector('[data-artifact-slug]');
  const artifact = article
    ? {
        slug: article.dataset.artifactSlug,
        lang: article.dataset.artifactLang,
        translation_key: article.dataset.artifactTranslationKey,
        format: article.dataset.artifactFormat,
        confidence: article.dataset.artifactConfidence,
      }
    : null;

  umami.track((props) => ({ ...props, ...(artifact || {}) }));

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (err) {
      return;
    }
    if (!url.protocol.startsWith('http')) return; // skip mailto:, tel:, etc.
    if (url.hostname === window.location.hostname) return;

    umami.track('outbound_click', {
      url: url.href,
      domain: url.hostname,
      ...(artifact ? { slug: artifact.slug, translation_key: artifact.translation_key } : {}),
    });
  });
});
