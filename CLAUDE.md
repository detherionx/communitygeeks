## Approved ring treatment — production release 30 September 2026

Use the current shared motif renderer: existing article-specific astronaut action, plain petrol disc, one thin tilted constellation ring with an opaque #FCF5D5 core and a faint separate ivory/#F29660 aura. No polygon networks or background-disc halo. This supersedes earlier orbital experiments below. User approved deployment of the ivory-ring revision.

# Communitygeeks project instructions

## Canonical article motifs — user decision, 30 September 2026

Use the approved orbital treatment in `src/lib/constellationMotifs.js`: large purposeful astronauts, a dimensional petrol disc, and a sparse constellation passing behind and in front. Every scene must depict the specific article's argument through an action and a relationship. A random pose beside an old motif is not acceptable. The AI coding inspection scene is the approved reference; `/mockups/orbital-collection/` shows the article-specific set. Read `handoff/orbital-motif-direction.md` for each article's meaning. Preserve the distinction between these compact motifs and the full editorial illustrations. Preview new interpretations before deployment.

## Canonical astronaut assets — user decision, 28 September 2026

Use `src/assets/images/crew-rear-projection/` for all active website astronauts. The shared renderer is `src/_includes/partials/participation-scenes.njk`; it selects matching pose names and dedicated `-flipped` assets. Preserve the square canvas, bottom-centre anchor and animation groups. Do not swap every scene to the same standing master.

The approved identity is a full head-sized cream quiff, one eyebrow and glasses projected from the REAR interior of the helmet, behind separate dark petrol glass. No rectangular screen, collar projector, paint on visor, external glasses or face on the back of the helmet. Rear-facing poses keep their shell panels; only physically visible visor slivers may show.

`handoff/communitygeeks-rear-projection/` is the matching export package. Its root contains the standing master and approved three-view reference. `poses/` contains all ten website orientations as SVG/PNG/WebP. SVGs embed raster artwork; they are not editable path vectors.

`crew-approved`, `crew-v40`, `crew-vector`, `crew-astra` and the old `handoff/communitygeeks-astronauts` are historical assets, not substitutes for the current full-body crew. The journal uses the approved detailed EVA gloves in `src/assets/images/journal-v45/` (`hold.png`, `write.png`, `turn.png`), with the original thumb clip in `researcher.js`. Do not replace them with `crew-vector/journal` mittens. Do not regenerate or redesign the mascot during copy/typography work. Preserve the current assets unless the user explicitly requests another mascot change.

Read `handoff/opus-5.5-copy-typography.md` for the current refinement brief. After website changes, run `npx eleventy --quiet` and `node --test scripts/test-rear-projection-crew.cjs`. Verify the running preview at http://127.0.0.1:8081/ uses the canonical folder. The test can also verify HTTP responses with `CHECK_LIVE_CREW=1`.

Preserve unrelated uncommitted work. Do not deploy without a user request.
