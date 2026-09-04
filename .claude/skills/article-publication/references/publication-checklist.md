# Publication checklist

## Content and governance

- The piece has cleared its actual editorial and consent gates.
- Title, slug, date, format, confidence, topics, authors, links, related pieces, and language pairing are correct.
- The human-authored source language is identified. Katharina's German source wording is unchanged unless she explicitly requested an edit.
- The derived language version was translated through DeepL and manually verified for meaning, tone, terminology, names, links, quotations, and metadata.
- The same approved `deck` subtitle appears on the homepage, Public Thinking overview, and article page. The `summary` separately serves metadata.
- Authored copy contains no em dash and public pages show no OBS identifier.

## Visual package

- The catalogue constellation motif is article-specific, grounded in researched astronomical context, and implemented through the existing motif system without restyling it.
- The catalogue motif appears correctly on the homepage preview, Public Thinking overview, and article masthead. Existing templates may also reuse it for the OG card.
- A separate editorial constellation illustration is present inside the article. It was either created for the piece or explicitly selected by the user from `#graphic-assets`.
- The user was asked whether any photographs, screenshots, diagrams, scans, or local files should be used.
- Every placed visual has accurate alt text. Article figures also have appropriate captions and provenance.
- LinkedIn cards use the editorial illustration and approved source assets deliberately; they do not collapse the two constellation asset classes into one.
- LinkedIn asset count is 1, 3, or 5 and justified by the content.

## Technical checks

- `npm run build`
- Inspect screenshots of the homepage, Public Thinking overview, article, and social preview at desktop and phone sizes.
- English and German article, homepage, archive, metadata, image URLs, sitemap, and language alternates inspected in built output.
- Desktop, tablet, phone, 200% zoom, keyboard, reduced motion, and no-JavaScript behavior checked where relevant.
- No horizontal overflow, broken crop, missing asset, console error, or unintended layout shift.

## Release boundary

- A local build and commit do not authorize a push or production deployment.
- Before a Canva commit, show the preview and obtain explicit approval.
