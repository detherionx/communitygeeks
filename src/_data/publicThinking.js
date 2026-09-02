const { loadAll } = require("../lib/publicThinkingLoader");

// English Public Thinking pieces: the site's default/canonical language.
// See src/_data/publicThinkingDe.js for the German counterpart, and
// src/lib/publicThinkingLoader.js for the shared parsing/linking logic.
module.exports = () => loadAll().filter((item) => item.lang !== "de");
