const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: true });
const people = require("../_data/people.js");

// Shared by src/_data/publicThinking.js (EN) and src/_data/publicThinkingDe.js
// (DE) so the content-file parsing and cross-language linking logic exists
// exactly once. Not itself an Eleventy global data file — it lives outside
// _data/ on purpose, so Eleventy doesn't also try to expose it as one.

const ALLOWED_CONFIDENCE = ["Observation", "Emerging Pattern", "Research Finding"];
const CONTENT_DIR = path.join(__dirname, "..", "..", "content", "public-thinking");
const DEFAULT_IMAGE = "https://communitygeeks.de/assets/images/og-image.png";

// A content file's `authors` list is plain names — src/_data/people.js is the
// single source of truth for url/image/bio, so an identity never forks across
// pieces or across EN/DE. A name with no entry there still works as a byline,
// just without a linked profile (a contributor who isn't a public author yet).
function personNode(name) {
  const p = people[name];
  const node = { "@type": "Person", name };
  if (p && p.url) {
    node["@id"] = p.url;
    node.url = p.url;
  }
  if (p && p.sameAs) node.sameAs = p.sameAs;
  return node;
}

function loadAll() {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md")); // .md.example and .md.draft are deliberately excluded by this filter

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

    const lang = data.lang || "en";
    const url = lang === "de" ? `/de/public-thinking/${data.slug}/` : `/public-thinking/${data.slug}/`;
    const fullUrl = `https://communitygeeks.de${url}`;
    const authorNames = data.authors && data.authors.length ? data.authors : [];
    const authorNodes = authorNames.map(personNode);
    const image = data.heroImage ? `https://communitygeeks.de${data.heroImage}` : DEFAULT_IMAGE;

    // Precomputed here (not templated in item.njk) so title/summary get
    // proper JSON string escaping via JSON.stringify rather than risking
    // broken JSON from a hand-templated Nunjucks string.
    const articleJsonLd = `<script type="application/ld+json">\n${JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.title,
        description: data.summary,
        image,
        datePublished: data.date,
        dateModified: data.dateModified || data.date,
        inLanguage: lang,
        url: fullUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": fullUrl },
        ...(authorNodes.length === 1 ? { author: authorNodes[0] } : authorNodes.length > 1 ? { author: authorNodes } : {}),
        publisher: { "@id": "https://communitygeeks.de/#organization" },
        ...(data.topics && data.topics.length ? { keywords: data.topics.join(", ") } : {}),
      },
      null,
      2
    )}\n</script>`;

    return {
      ...data,
      lang,
      url,
      authors: authorNames,
      contentHtml: md.render(content),
      articleJsonLd,
    };
  });

  // Cross-language linking: any two items sharing a translationKey point at
  // each other via `translations`, so the EN/DE switcher only ever links to
  // a URL that actually exists, instead of guessing a URL pattern.
  items.forEach((item) => {
    item.translations = {};
    if (!item.translationKey) return;
    items.forEach((other) => {
      if (other !== item && other.translationKey === item.translationKey) {
        item.translations[other.lang] = other.url;
      }
    });
  });

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

module.exports = { loadAll };
