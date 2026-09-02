const { loadAll, buildCollectionJsonLd } = require("../lib/publicThinkingLoader");

// Precomputed CollectionPage/ItemList JSON-LD <script> tag for the EN
// archive index (/public-thinking/), see publicThinkingLoader.js for why
// this is built in JS rather than hand-templated in Nunjucks.
module.exports = () => {
  const items = loadAll().filter((item) => item.lang !== "de");
  return buildCollectionJsonLd(items, "/public-thinking/", "Public Thinking");
};
