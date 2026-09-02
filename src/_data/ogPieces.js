const { loadAll } = require("../lib/publicThinkingLoader");

// Feeds src/_og/card.njk's pagination: one lightweight, deployed-then-
// screenshotted-then-deleted fragment page per Public Thinking piece that
// needs a generated OG card (see scripts/generate-og-images.js). A piece
// with an explicit `ogImage` override in its frontmatter is skipped here —
// there's nothing for the generator to render for it.
module.exports = () => loadAll().filter((item) => !item.ogImageIsExplicit);
