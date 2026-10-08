# Idea-to-product publication, 8 October 2026

- English source: user-approved local mockup and Google Doc `1nSTdP9piAqoYY4877BmLiVazllKdCQqQYmF9V4p_SgQ`.
- Release authorization: user explicitly requested live publication, then approved DeepL and manual German review.
- English article body preserved except the explicitly requested first comparison. Its exact labels and lists are asserted in `scripts/check-idea-to-product-publication.cjs`.
- Comparison uses an intentionally smaller coral/peach attention block and a larger petrol/mint participation block, with square/circle accents and dark text. Mobile stacks the two blocks.
- Approved chess illustration remains after six opening paragraphs; the quieter constellation workshop illustration and separate chess motif are preserved.
- German first pass: DeepL document translation, manually reviewed for meaning and fluency. Terminology: Partizipation, Co-Creation, KI-Agenten, Partizipation als Input / als Produktion. Literal translations and English alt text corrected.
- Homepage journal advances through shared data. The existing reticulum notation represents the article's accumulating human network; the approved journal animation and crew are unchanged.
- Article-specific CSS loads only for this translation pair. No homepage redesign, unrelated mockup, or preview route included.

## Verification

Run `npm run build`, `node scripts/check-idea-to-product-publication.cjs` and `node --test scripts/test-rear-projection-crew.cjs`.

The publication check covers English/German at 1440, 768, 390 and 320 pixels; exact comparison copy; both illustrations and motif; image placement; canonical, Article schema, language links and social images; homepage and both archives; journal data; sitemap; keyboard navigation; 200% zoom; reduced motion and no-JavaScript content.

Two pre-existing content warnings concern Katharina Siebert's missing author-directory entry. No structural validation errors.

For live verification, set `ARTICLE_BASE_URL=https://communitygeeks.ai` before running the publication check. LinkedIn remains a separate, unpublished launch workflow.
