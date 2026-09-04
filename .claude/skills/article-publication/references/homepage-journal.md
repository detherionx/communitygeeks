# Homepage field journal

The homepage journal is a persistent publication ledger inside the celestial researcher scene. It is not a disposable hero graphic and must not be regenerated for each article.

## Source of truth

- `src/_data/journalPages.js` selects the two latest English Public Thinking pieces from the same canonical collection used by the homepage ledger and archive.
- `src/assets/js/researcher.js` renders the notebook, hands, pen, notation sketches, and scroll-driven writing.
- The article's `journal` frontmatter supplies its page-specific content.
- A new publication moves the former newest piece to the completed left page and places the new piece on the right page automatically. Never hardcode a homepage-only article entry.

Use this frontmatter shape on the English source article:

```yaml
journal:
  headline: "THREAD"
  sketch: "thread"
  lines:
    - "who keeps it? a human."
    - "guardrails, review, trust."
    - "boundaries matter more."
```

## Writing the page

- `headline` is the journal's compressed finding, not the article title. Keep it at 15 characters or fewer where possible so it retains the large journal type.
- `sketch` names a notation programme in `researcher.js`. Reuse an existing sketch only when its meaning genuinely fits. Otherwise add one concise, deliberate sketch derived from the article's central finding.
- `lines` contains one to three terse field-note statements. The first line is written on the current right page. All supplied lines become visible after the piece advances to the completed left page.
- Keep the notation legible at the rendered homepage size. Prefer a few meaningful nodes, one clear relationship, and a restrained coral signal over decorative complexity.
- Internal observation numbering may remain inside the journal as field-note notation even though it is not shown in article cards or mastheads.

## Animation invariants

- Preserve the established celestial hands, physical contact with the journal and pen, page occlusion, colors, line weights, star field, and scroll responsiveness.
- The animation is a single reversible scroll sequence, never an autoplay loop. The pen tip must lead the appearance of every stroke and text reveal.
- The intended shared prelude is two or three quick page turns before the newest spread settles and writing begins. Implement this once in `researcher.js`, not as bespoke code for an individual article. Keep it brief, roughly the first fifth of the existing animation, and do not increase the section's scroll distance merely to accommodate it.
- Page turns must read as leaves attached to the journal spine, with plausible direction, layering, and hand contact. Do not use generic floating rectangles or unrelated constellation marks.
- Once the prelude exists, every later publication preserves and verifies it. New articles change journal data and notation, not the page-turn mechanism.
- Reduced motion renders the final open spread immediately. Without JavaScript, the surrounding article list remains complete and usable.

## Publication QA

Check the homepage at desktop, tablet, and phone sizes:

- The left page matches the previous English article and is already complete.
- The right page matches the newest English article and writes in the intended order.
- The headline, sketch, and first note fit without clipping or collision.
- Scrolling backward cleanly reverses the writing and any implemented page turns.
- The hands stay anatomically connected to the notebook and pen throughout.
- Reduced motion shows the completed spread without intermediate blank states.
- Publication order and page numbers advance from collection data without manual homepage edits.
