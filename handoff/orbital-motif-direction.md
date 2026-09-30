# Canonical orbital article motifs

Approved visual direction: 30 September 2026. The inspecting astronaut in `/mockups/orbital-motif/` is the reference. The complete set is implemented locally for review, not deployed.

The article determines the action. Use the canonical rear-projection crew, a petrol disc, sparse node geometry, and explicit front/back occlusion. The astronauts must occupy most of the disc. No old flat motif beside a miniature mascot. Constellation geometry here is conceptual; do not describe it as an accurate astronomical chart.

| Article | Article evidence | Scene |
|---|---|---|
| Building with AI coding agents | Repeatable recruiting loop, explicit qualification gates, uncertain decisions routed to a human | Inspecting astronaut aims a scanner at one coral review point in an orbital workflow. Approved reference. |
| What should your community platform help people do? | Begin with the exchange, then choose the structure; follow contributions through to use beyond the platform | Two astronauts share one module between open constellation spaces. The connecting route extends beyond both spaces. The shared task is central. |
| What people still need to judge for themselves when working with AI | Decide what a result means; verify against an independent reference; retain responsibility for consequences | Astronaut compares a tablet claim with a separate reference star. Two sight lines distinguish claim and independent observation. This foregrounds verification rather than pretending one icon can summarize all three theses. |
| Who sets the limits when AI and teams can do more? | Visibility, guardrails, retained context, human intervention; autonomy includes refusal | Tethered astronaut maintains a continuous coral thread through three open boundary gates. Motion is possible inside visible limits. |
| Community, developer relations and partnerships: where does the work overlap? | Six participants disagree about convergence, but describe work crossing functions and institutions | Two astronauts exchange work where distinct routes cross. Routes continue separately: the image asks about overlap without asserting that the teams merged. |
| How Glide connects community and partnerships | Six groups around the company; community is a connective layer; tending relationships beyond one channel | Astronaut connects a link among six participant nodes around one continuous orbit. Paths also link the groups to each other. |

Renderer: `src/lib/constellationMotifs.js`. Layout sizing: `src/assets/css/pt-shell.css`. The same scenes serve EN/DE articles, archives and OG cards without requiring JavaScript. Existing motif keys remain stable so article metadata and notebook notations are preserved. Bilingual image descriptions explain each scene. Main article text and photos are unchanged.

## Simplification and glow study

30 September follow-up: remove triangulated orbit edging, duplicate ellipses, tiny cluster triangles and redundant target rings. Keep one main spatial route and only article-relevant additions. Warm ivory/amber light is sampled visually from the About hero (`wanderer-constellation.png`); the preview gallery offers subtle glow and no glow. This glow treatment is a local experiment awaiting visual feedback, not a production release.

### Exact About-image palette samples

Source: `src/assets/images/wanderer-constellation.png`, native 1536 × 1024 pixels. Representative visible pixels sampled from the figure and surrounding constellation: node core `#FCF5D5` at (989,265); line `#DEBC94` at (934,413); halo `#978B72` at (1143,469); active accent `#F29660` at (1047,337). These are sampled raster colours, not inferred original design tokens. CSS uses the line colour at 80% opacity for a 2px glow and the halo colour at 50% for a 5px spread. Perceived glow differs on cream versus the About hero's dark background. Constellation geometry only; no glow on the astronaut image or disc.

### Ivory emission correction

The sampled midtone was unsuitable as the luminous core. The constellation now uses `#FCF5D5` for its 2px line and two ivory glow layers (1px at 100%, 3px at 90%); champagne is limited to a broad 6px halo at 35%. This supersedes the previous amber-dominant filter. Astronauts and petrol discs are excluded.

### Contrast repair on cream

Ivory-only emission disappeared on the archive's cream surface. Current preview uses an SVG filter: ivory bloom plus a softened petrol underlay (1.1-unit dilation, 0.7-unit blur), then the original ivory core. Only constellation geometry receives it. This replaces the stacked ivory drop shadows. Inspected at specimen and compact sizes; mobile overflow check passed. Still a local visual trial.

User-requested glow colour: `#F29660`. Added as an outer constellation-only halo (1.5-unit spread, 3.5-unit blur, 80% flood opacity) beneath the existing ivory core and softened contrast edge.

### Astral links and star-focused glow
Latest local study supersedes the tube-like filters above: expanded viewBox for breathing room, reduced orbital radius, thin angular links, and small ivory stars with #F29660 halos. Glow applies only to stars; connections remain faint, ivory over petrol and muted sage over cream. No morphology outline or continuous glowing tube. Handoff crossing passes behind the crew. Checked desktop specimens and 390px mobile, with no horizontal overflow; glow toggle works. Local preview only.


### Distinct starlight study
Removed the shared orbit generator. Article-specific networks now represent review, exchange, independent comparison, bounded autonomy, crossing functions and six participant groups. Fine links have soft #F29660 bloom; stars have ivory cores with broader radial peach emission. No thick contrast outlines. Local gallery only; desktop visual inspection and mobile overflow check completed.


### Circle and faint aura — latest direction
User rejected the constellation structures. Removed all surrounding lines, nodes, gates and targets. Retained each existing crew image and the petrol circle. Added only a diffuse, irregular cloud halo at the circle edge using ivory, muted sage and restrained #F29660. Gallery offers Faint aura / Circle only. This supersedes the prior network studies; remains local for inspection. Verified rendered large and compact sizes, aura toggle and mobile overflow.


### Clarification: aura belongs to the constellation ring
The user meant the surrounding constellation circle, not the petrol backdrop. Restored one thin tilted ring with six sparse star points, passing behind the disc and in front of the crew. Faint irregular ivory/peach aura follows that ring only. Background circle has no aura. Supersedes the preceding circle-only interpretation. Local preview: ?revision=ring-aura.


Ring colour correction: fixed opaque #FCF5D5 core on both front and rear halves; removed radial stroke colour changes and sage tint from the aura. Warm #F29660/ivory cloud remains separate. Verified rendered stroke colour across the collection. Local revision=ivory-ring.


User approved ivory-ring for production on 30 September 2026. Deploy this revision, superseding the local-only status above.

