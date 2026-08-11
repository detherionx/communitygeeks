const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: true });

// This file exists because Eleventy's collections API only sees files inside
// the configured input directory (src). content/public-thinking/ lives
// outside src on purpose — one obvious folder for Katharina/Gaza to add new
// pieces in, without needing to touch anything under src/. Global data files
// can run arbitrary Node code, so this reads that directory directly instead.
//
// This is also where the confidence-label rule actually gets enforced: the
// Eleventy build FAILS if any content file sets a confidence value that
// isn't one of the three approved public-facing labels. See Communitygeeks
// OS → Public Source Pack → "Public Thinking — Confidence Vocabulary Map".

const ALLOWED_CONFIDENCE = ["Observation", "Emerging Pattern", "Research Finding"];
const CONTENT_DIR = path.join(__dirname, "..", "..", "content", "public-thinking");

module.exports = () => {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md")); // .md.example (the template) is deliberately excluded by this filter

  const items = files.map((filename) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8");
    const { data, content } = matter(raw);

    if (!data.slug) {
      throw new Error(`Public Thinking content file "${filename}" is missing a "slug" field.`);
    }
    if (data.confidence && !ALLOWED_CONFIDENCE.includes(data.confidence)) {
      throw new Error(
        `Public Thinking item "${data.title}" (${filename}) has confidence "${data.confidence}", ` +
          `which is not an approved public-facing label (${ALLOWED_CONFIDENCE.join(", ")}). ` +
          `See Public Source Pack → "Public Thinking — Confidence Vocabulary Map" before publishing.`
      );
    }

    const url = `/public-thinking/${data.slug}/`;
    const fullUrl = `https://communitygeeks.de${url}`;
    const author =
      data.author === "Carmelito Bauer"
        ? { "@id": "https://communitygeeks.de/about/#founder" }
        : { "@type": "Person", name: data.author };

    // Precomputed here (not templated in item.njk) so title/summary get
    // proper JSON string escaping via JSON.stringify rather than risking
    // broken JSON from a hand-templated Nunjucks string.
    const articleJsonLd = `<script type="application/ld+json">\n${JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.title,
        description: data.summary,
        datePublished: data.date,
        url: fullUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": fullUrl },
        author,
        publisher: { "@id": "https://communitygeeks.de/#organization" },
      },
      null,
      2
    )}\n</script>`;

    return {
      ...data,
      url,
      contentHtml: md.render(content),
      articleJsonLd,
    };
  });

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
};
