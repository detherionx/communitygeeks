# Visual system and Canva handoff

## Asset 1: catalogue constellation motif

This is the compact publication identity, not the article's editorial illustration. It is rendered by `src/lib/constellationMotifs.js` from the article's `motif` frontmatter and reused unchanged in the homepage preview, Public Thinking overview, and article masthead. Preserve that working system.

Before drawing a new motif, research a real constellation, asterism, or star system that fits the article through its name, history, geometry, or scientific meaning. Prefer authoritative astronomical sources and record the reference. Use real geometry as a constraint or conceptual foundation where it fits. The finished motif may translate the article into a recognizable object, as the gaming controller does, but it must still read as a deliberately plotted star system rather than arbitrary lines.

Match the published motifs for line weight, node hierarchy, orbital or registration marks, responsive simplification, negative space, scale, and the single coral focal signal. Add a new motif key and useful English and German alternative text. Do not modify existing motifs or globally restyle the renderer unless the user explicitly requests a system change.

## Asset 2: editorial constellation illustration

This is the richer, article-specific illustration used inside the article and potentially in its LinkedIn sequence. It never replaces the catalogue motif.

Inspect `#graphic-assets` first. It is the main reference point for this CI and may already contain an illustration inspired by an earlier creative discussion, including concepts developed before the article itself. If a plausible candidate exists, show or identify it and ask the user whether to use it. Do not create a redundant replacement before that decision.

Use deep petrol teal `#1F4B4C`, warm ivory `#F6F4EF`, mist `#C0CFCC`, pale blue-green facets, and coral `#E8735A` as the single active signal. The image should feel like a Bauhaus observatory or precise starship instrument, not generic science fiction.

Build one deliberate metaphor from the article. Figures, vehicles, or objects are constructed from sparse ivory constellation nodes, fine connecting lines, restrained translucent planes, measured circular instruments, and one meaningful coral path or node. Preserve useful negative space. Avoid mustard yellow, neon gradients, busy star noise, faux holographic UI, random polygons, decorative text, logos, and generic AI imagery.

Prefer one strong composition over several unrelated motifs. Design for its actual article placement and likely LinkedIn crops. Do not force it into the homepage, overview, or article masthead, which belong to the catalogue motif.

Record the final image prompt and the Slack assets used as references in the completion report. When reusing an approved Slack asset, record which asset was selected and do not regenerate it.

## Asset 3: optional source material

Ask the user whether the publication uses any photographs, screenshots, scans, diagrams, or local files. Expect these to be the exception, not the default. Do not search the user's hard drive broadly. Use only files the user identifies or supplies, then place them according to the article's evidence and narrative needs. Preserve provenance and add accurate alt text, captions, and attribution where appropriate.

## LinkedIn cards

Cards are 1080x1350. Use the editorial constellation illustration and any approved source material when they strengthen the narrative. The catalogue motif may provide a secondary identity mark but is not a substitute for the richer illustration. Use Communitygeeks typography and registration marks. Headlines must be readable at feed size. Do not put citations or entire paragraphs on cards.

Create the local PNGs first. Then import or update them in Canva without Canva AI. If an existing article design exists, update it. Otherwise import the PNGs into a clearly titled design. Canva is the editable delivery surface, not the visual generator.

Use the approved [Who Keeps the Thread? design](https://www.canva.com/design/DAHUNl4v-oU/N5X0ZeVGtgfgNT4xES1wyg/edit) as the workflow reference. Study its page setup, editable handoff, spacing, typography, CI colors, and asset placement. Adapt the content rather than mechanically copying its composition.
