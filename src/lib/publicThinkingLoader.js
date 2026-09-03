const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: true });
const people = require("../_data/people.js");

// Shared by src/_data/publicThinking.js (EN) and src/_data/publicThinkingDe.js
// (DE) so the content-file parsing and cross-language linking logic exists
// exactly once. Not itself an Eleventy global data file, it lives outside
// _data/ on purpose, so Eleventy doesn't also try to expose it as one.

const ALLOWED_CONFIDENCE = ["Observation", "Emerging Pattern", "Research Finding"];
const CONTENT_DIR = path.join(__dirname, "..", "..", "content", "public-thinking");

// Where scripts/generate-og-images.js writes a piece's generated card, and
// therefore also the deterministic URL used below — computed from `slug`
// alone, before that file necessarily exists on disk. Screenshot generation
// runs as a separate step after this build, so the file only has to exist
// by the time the site is actually deployed, not at template-render time.
function generatedOgImagePath(slug) {
  return `/assets/images/public-thinking/og/${slug}.png`;
}

// A content file's `authors` list is plain names: src/_data/people.js is the
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
          `See Public Source Pack → "Public Thinking: Confidence Vocabulary Map" before publishing.`
      );
    }

    const lang = data.lang || "en";
    const url = lang === "de" ? `/de/public-thinking/${data.slug}/` : `/public-thinking/${data.slug}/`;
    const fullUrl = `https://communitygeeks.ai${url}`;
    const authorNames = data.authors && data.authors.length ? data.authors : [];
    const authorNodes = authorNames.map(personNode);

    // ogImage: purely a social/Article-schema asset, never rendered on the
    // page itself (confirmed nothing in item.njk displays it) — so it's
    // named for what it does, not "hero". Explicit frontmatter override >
    // this piece's own generated card (the normal case, once motif/title/
    // deck give the generator something to compose) > the sitewide default,
    // which stays reserved for pages with no piece-level identity at all.
    const ogImageIsExplicit = Boolean(data.ogImage);
    const image = ogImageIsExplicit ? `https://communitygeeks.ai${data.ogImage}` : `https://communitygeeks.ai${generatedOgImagePath(data.slug)}`;

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
        publisher: { "@id": "https://communitygeeks.ai/#organization" },
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
      ogImage: image,
      ogImageIsExplicit,
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

  // Observation numbers follow publication order and are persistent: OBS. 001 is the first observation
  // Communitygeeks published, whatever a page sorts by. Translations share their observation's number.
  const groups = new Map();
  items.forEach((item) => { const key = item.translationKey || item.slug; const d = new Date(item.date); const g = groups.get(key) || { key, date: d }; if (d < g.date) g.date = d; groups.set(key, g); });
  const ordered = [...groups.values()].sort((a, b) => a.date - b.date || a.key.localeCompare(b.key));
  const numberByKey = new Map(ordered.map((g, i) => [g.key, String(i + 1).padStart(3, "0")]));
  items.forEach((item) => { item.obs = numberByKey.get(item.translationKey || item.slug); });

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
}

// Minimal CollectionPage/ItemList JSON-LD for the archive index: generated
// from the same items array the index page already renders, so it never
// drifts out of sync as pieces are added. Deliberately thin: the archive's
// real SEO signal is the crawlable HTML itself (real <a href> per card,
// title/deck text, canonical/OG tags), not this schema.
function buildCollectionJsonLd(items, url, name) {
  const fullUrl = `https://communitygeeks.ai${url}`;
  return `<script type="application/ld+json">\n${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      url: fullUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://communitygeeks.ai${item.url}`,
        })),
      },
    },
    null,
    2
  )}\n</script>`;
}

module.exports = { loadAll, buildCollectionJsonLd };
