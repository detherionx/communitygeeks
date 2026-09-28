# Opus 5.5 handoff — copy, typography and usability refinement

## Task and working rules

Refine the current Communitygeeks website locally. Implement the improvements; do not stop at an audit. Preserve the existing premium “Bauhaus in space” direction, page structure and interaction logic where they work. Make conservative, coherent changes. Do not redesign from scratch, refactor unrelated code or deploy.

Project root: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website`
Local preview: http://127.0.0.1:8081/

The working tree contains substantial uncommitted work. Inspect its state and preserve it. Edit source files, not generated `_site` output. Inspect the actual running page before making judgments; old screenshots and audits are historical evidence, not measurements of today's build.

## Astronauts are outside this pass

The mascot design was addressed separately. Do not redesign, regenerate, recolour, replace or modify astronauts, visor artwork, projection, poses, proportions, anatomy or mascot animation. Preserve their placement unless a small surrounding layout adjustment is necessary for readability. Do not reopen the astronaut section of the original walkthrough brief. Visual-coherence work below applies to the rest of the site.

Latest rear-projection handoff:
- Full-body SVG: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/handoff/communitygeeks-rear-projection/communitygeeks-astronaut-full.svg`
- Full-body PNG: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/handoff/communitygeeks-rear-projection/communitygeeks-astronaut-full.png`
- Full-body WebP: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/handoff/communitygeeks-rear-projection/communitygeeks-astronaut-full.webp`
- Approved three-view reference: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/handoff/communitygeeks-rear-projection/rear-projection-reference.png`
- Asset notes: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/handoff/communitygeeks-rear-projection/README.md`

SVG exports embed raster artwork; they are not editable vector paths. The rear-projection rollout is now active on the local site. Use `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/images/crew-rear-projection/` for all website poses. Matching ten-orientation SVG/PNG/WebP exports are in `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/handoff/communitygeeks-rear-projection/poses/`. The four rear-view orientations retain their shell geometry and occluded face slivers. Do not restore the old `crew-approved` set or swap poses to the standing master. Read `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/CLAUDE.md` and run `node --test scripts/test-rear-projection-crew.cjs` after building.

## Source map

Read the active imports before choosing files; archived and retired styles are not the current cascade.

- Homepage content: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/index.njk`
- Homepage layout and active asset loading: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/layouts/home.njk`
- Active homepage styling: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/css/home.css`
- Shared typography/navigation: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/css/shell.css`
- Journal styling: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/css/journal.css`
- Offer names, problem statements, prices and duration: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_data/offersV31.json`
- Offer/service interface: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/partials/offer-paths-v31.njk`
- Working-method/relationship section: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/partials/mission-route.njk`
- Hero visual labels: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/partials/hero-system.njk`
- Recognition scenes and shared astronaut macro: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/partials/participation-scenes.njk` — text/affordances only; preserve mascot rendering.
- Booking section: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/partials/final-booking-v31.njk`
- Interaction behavior: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/js/diagnosis-selector.js`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/js/participation.js`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/js/home-motion.js`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/js/v31-booking.js`
- About page: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/about.njk`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/_includes/layouts/about.njk`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/src/assets/css/about.css`
- Historical copy context: `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/docs/communitygeeks-copy-pass-brief.md`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/docs/2026-09-25-positioning-audit-response.md`, `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/docs/2026-09-25-hero-mechanism-review.md`

## 1. Readability

Audit rendered body copy, supporting text, captions, labels, metadata, service cards, pricing details and working-method/relationship explanations. Identify the smallest recurring type rules and increase genuinely hard-to-read text at its source. Preserve hierarchy and editorial character; do not enlarge everything uniformly. Check contrast, line length and line-height alongside size. Essential information must be comfortably readable on a normal laptop at 100% zoom.

## 2. Typography consistency

Audit font families, weights, sizes, line-heights, tracking and alignment. Preserve deliberate Bauhaus/editorial variation; remove arbitrary combinations. Establish a compact, coherent hierarchy through the existing styles rather than adding competing overrides.

## 3. Practical, buyer-facing copy

Rewrite statements that need an explanation to be understood. The walkthrough flagged wording around “Partner in production …” and partners being introduced without anything happening afterward. Locate the actual current wording, identify the specific problem it is meant to describe, and make that problem concrete. Clarity first, cleverness second; keep the brand voice.

Communitygeeks serves organisations starting a community as well as improving existing programmes. Its work includes relationships across community, customers, developers, partners, products, teams and channels. Keep that breadth commercially understandable. Do not narrow the business to AI/SaaS or assume every buyer already operates a community.

The website addresses buyers directly. Avoid research-process language such as “we heard,” “someone said,” or “we are looking into.” Do not invent results, causes, statistics, capabilities or client proof. Earlier accepted/rejected sentences are not sacred. For substantive positioning changes, verify the relevant Notion/transcript evidence and enrich with Exa where useful. If searching across the interview portfolio, use the full-transcript-scan skill. Attribute speakers correctly, distinguish interviewer hypotheses from independent testimony, and do not turn correlation into causation. If source access is unavailable, say so and keep rewrites within verified facts.

## 4. Interaction cues

Review tabs, selectable cards, expandable content, service selectors, relationship maps and hover-driven elements. Add restrained but clear affordances where needed: state styling, pointer cursor, icon, short label or subtle motion. Provide equivalent keyboard focus and touch behavior; essential information must not depend on hover. Preserve reduced-motion support and avoid noisy “CLICK HERE” prompts.

## 5. Pricing

Evaluate whether longer engagements are easier to understand with a monthly equivalent prominent, duration and total commitment immediately below, and the custom-engagement route still visible.

Use existing commercial terms as the source of truth. Do not change fees, duration or payment terms. A monthly equivalent is not a promise of monthly billing; label it honestly. The current data includes a 16-week duration and total/remaining amounts: do not silently equate 16 weeks to four calendar months, double-count an initial diagnosis or imply cancellable monthly service. If a monthly presentation cannot be made unambiguous from verified terms, improve hierarchy around the duration and total instead. Never hide the total behind interaction or tiny text.

## 6. Page length and density

Review the complete homepage/service journey for redundant vertical gaps, repeated explanation, oversized sections and related information that could be grouped. Reduce needless scrolling while preserving breathing room and visual impact. Use progressive detail only where it helps; keep the basic offer, price and essential decisions visible. Check that sticky or animated sections do not prolong the journey unnecessarily.

## 7. Coherence outside the mascot

Review geometry, containers, icons, non-mascot decoration and the restrained 2D/3D mix. Simplify or restyle elements that clash with the existing visual system, without removing personality. Astronauts and their approved references are protected from this audit.

## 8. First-screen priority

Evaluate the headline, support sentence, first visual's explanatory labels, first CTA and immediate differentiation together. A visitor who reads only the first screen should understand whom Communitygeeks helps, the practical work and the next step. Do not rely on discovery of deeper interactive sections. Preserve the mascot artwork.

## 9. Validation and delivery

Capture before/after screenshots at 1440×900, 1280×800 and 390×844. Test at 100% zoom, with keyboard and touch, including reduced motion where relevant. Check the smallest recurring text, interaction discoverability, selected/focus states, pricing clarity, overflow, wrapping and overall visual coherence. Changes to shared typography should also be checked on About and Contact.

Build the local site with `npx eleventy --quiet`; inspect existing relevant checks and run those that validate the changed behavior. Use the already running preview at port 8081. If it is unavailable, inspect `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/scripts/serve-cal-preview.ps1` and the existing `npm run preview:cal` setup before starting a replacement server. Do not alter production or make bookings during validation.

Return:
1. Concrete issues found on the current build.
2. Exact changes made, with file paths and short reasons.
3. Before/after screenshots and the local preview URL.
4. Anything deliberately left unchanged and why, including any unresolved factual or commercial question.

Save the final report and screenshots under `C:/Users/Carmelito Bauer/communitygeeks-website/communitygeeks-website/docs/audits/2026-09-28-opus-copy-typography/`. Complete the authorized local refinement without repeatedly asking for confirmation on routine design decisions.
