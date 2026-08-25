const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Static passthrough — CSS, JS, images ship as-is, no processing
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Public Thinking content is handled by src/_data/publicThinking.js instead
  // of a collection — see that file for why (Eleventy collections can't see
  // files outside the configured input directory, which content/ deliberately is).

  eleventyConfig.addFilter("readableDate", (dateObj, locale) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLL yyyy", { locale: locale || "en" });
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
