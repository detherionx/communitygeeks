# English and German publication workflow

Communitygeeks is English first in its website architecture, but every publication may have an English and German route. Determine the human-authored source language before translating.

## Authorship boundary

- When Katharina authors or drafts a piece in German, her German wording is canonical human-authored copy. Do not rewrite, polish, shorten, normalize, or back-translate it unless she or the user explicitly requests an edit to that source text.
- Translate Katharina's German source into English through DeepL. Manually verify and edit only the derived English version.
- When the source is written in English, translate it into German through DeepL. Manually verify and edit the derived German version.
- Never use changes made during translation as silent justification for altering the human-authored source.

## DeepL and manual verification

DeepL is the required first translation pass, not the final editorial authority. Review the full output against the source before publishing. Check:

- meaning, uncertainty, evidence level, and paragraph logic;
- title, standardized `deck`, `summary`, headings, captions, alt text, open question, research thread, topics, and related-piece titles;
- names, companies, job titles, product names, links, quotations, dates, and number formatting;
- idiomatic German or English sentence structure without adding claims or smoothing away deliberate authorial choices;
- Communitygeeks terminology and potentially loaded alternatives.

Use `Partizipation` as the normal German equivalent of “participation” in Communitygeeks research. Do not default to `Teilhabe`, which carries stronger social-policy and inclusion connotations, unless the source specifically intends that meaning. Keep `Community`, `Developer Relations`, and `DevRel` as established field terms when a literal German translation would distort the concept.

If a term remains materially ambiguous after contextual review, show the user the relevant alternatives and ask before publishing. Record meaningful terminology decisions in the completion report so later pieces stay consistent.

## Pair integrity

- Match counterpart files through `translationKey` and correct `lang` values.
- Verify reciprocal language links, canonical URLs, metadata, shared dates, authors, confidence, topics, images, captions, and related links.
- The visible subtitle is the `deck` field in each language and must render consistently on that language's homepage, Public Thinking overview, and article page.
