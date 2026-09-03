const { DateTime } = require("luxon");
const { motifSvg } = require("./src/lib/constellationMotifs");

module.exports = function (eleventyConfig) {
  // Static passthrough: CSS, JS, images ship as-is, no processing
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Public Thinking content is handled by src/_data/publicThinking.js instead
  // of a collection, see that file for why (Eleventy collections can't see
  // files outside the configured input directory, which content/ deliberately is).

  eleventyConfig.addFilter("readableDate", (dateObj, locale) => {
    const dt = DateTime.fromJSDate(dateObj, { zone: "utc" });
    // German convention is numeric dd.mm.yyyy; everywhere else gets a spelled-out
    // month specifically to avoid the day/month ambiguity between DD/MM and MM/DD.
    return locale === "de" ? dt.toFormat("dd.LL.yyyy", { locale: "de" }) : dt.toFormat("d LLL yyyy", { locale: locale || "en" });
  });

  // Public Thinking V2: a piece's motif rendered as a constellation for a context (record | catalogue | masthead | og)
  // on a ground (dark | paper). Pure string output; mark it safe where used. See src/lib/constellationMotifs.js.
  eleventyConfig.addFilter("constellation", (motif, ctx, ground, lang) => (motif ? motifSvg(motif, ctx, ground, lang) : ""));

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISODate();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
