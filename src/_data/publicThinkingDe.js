const { loadAll } = require("../lib/publicThinkingLoader");

// German Public Thinking pieces: localized translations of a subset of the
// English pieces, linked back via `translationKey`. See
// src/_data/publicThinking.js for the English/default set.
module.exports = () => loadAll().filter((item) => item.lang === "de");
