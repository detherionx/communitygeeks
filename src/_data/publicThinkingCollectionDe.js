const { loadAll, buildCollectionJsonLd } = require("../lib/publicThinkingLoader");

// German counterpart of publicThinkingCollection.js, for /de/public-thinking/.
module.exports = () => {
  const items = loadAll().filter((item) => item.lang === "de");
  return buildCollectionJsonLd(items, "/de/public-thinking/", "Public Thinking");
};
