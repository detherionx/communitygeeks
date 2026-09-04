# Publication checklist

## Content and governance

- The piece has cleared its actual editorial and consent gates.
- Title, slug, date, format, confidence, topics, authors, links, related pieces, and language pairing are correct.
- The same approved `deck` subtitle appears on the homepage, Public Thinking overview, and article page. The `summary` separately serves metadata.
- Authored copy contains no em dash and public pages show no OBS identifier.

## Visual package

- Hero is original, on-CI, relevant to the article, and saved in the repository.
- Alt text describes the visual rather than repeating the title.
- Article, homepage, archive, OG card, and LinkedIn cards reuse the same visual identity with deliberate crops.
- LinkedIn asset count is 1, 3, or 5 and justified by the content.

## Technical checks

- `npm run build`
- Inspect screenshots of the homepage, Public Thinking overview, article, and social preview at desktop and phone sizes.
- Article, homepage, archive, metadata, image URLs, sitemap, and language alternates inspected in built output.
- Desktop, tablet, phone, 200% zoom, keyboard, reduced motion, and no-JavaScript behavior checked where relevant.
- No horizontal overflow, broken crop, missing asset, console error, or unintended layout shift.

## Release boundary

- A local build and commit do not authorize a push or production deployment.
- Before a Canva commit, show the preview and obtain explicit approval.
