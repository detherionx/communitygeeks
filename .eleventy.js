const { DateTime } = require("luxon");

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
