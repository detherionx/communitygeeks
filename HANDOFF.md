# HANDOFF.md — Communitygeeks Website

**Read this whole file before writing or changing any code.** This is a design-implementation task, not a fresh website-generation prompt. The design is already approved. Your job is to build, refine, and eventually deploy it — not redesign it — unless Carmelito explicitly asks for a redesign.

---

## 1. What this project is

Communitygeeks is Carmelito Bauer's ecosystem research and advisory practice. This repo is its public marketing website: a small, static, mostly-text site (five pages) whose main job is to look like a credible boutique research consultancy and to host a growing "Public Thinking" body of research findings, one-pagers, case studies, and field notes.

The site was designed conversationally with a different Claude instance (in claude.ai, with Figma/Notion access), over a long session, then handed to me (a Claude Code instance with no memory of that conversation) to implement. This file is the entire bridge between that session and this one. If something seems unexplained, it's probably genuinely unresolved — check "Section 8: Remaining ambiguities" before guessing.

## 2. Where the design came from

- **Figma file**: `https://www.figma.com/design/uSuq8toZ8FiwWJHz9oHf9V` — was intended to hold 11 pages (one "Design Tokens & Components" page, then a Desktop and Mobile frame for each of the 5 site pages). **As of 2026-08-10, only the "Design Tokens & Components" page is reachable** — Carmelito confirmed this is a sync issue on his end, not a deliberate removal, and asked not to reconstruct the missing 5 pages from this file's prose. Decision (2026-08-10): **this repo's existing HTML/CSS is now the visual source of truth**, not Figma, until Carmelito says Figma access is fixed. The tokens page itself is still reachable and still matches `tokens.json` exactly.
- **Communitygeeks OS → Public Source Pack** (copy source of truth): a Notion page that is the approved boundary between internal research and public-facing language. If you're ever asked to add or change copy, and the answer isn't already in this codebase, that Notion page — not the general Communitygeeks OS — is where to check first. You will not have access to it directly; ask Carmelito to paste the relevant section if you need it.
- **This codebase was built by manually translating the same content into Figma and code in parallel, by the same design session**, not by an automated Figma-to-code export. That means: trust the actual text and values already in this repo as the real approved content. Don't re-derive colors/type/copy from Figma screenshots if you can avoid it — they should already match exactly. If you ever find a discrepancy between what's in this repo and what you can see of the Figma file, that's worth flagging to Carmelito rather than silently picking one.

## 3. Chosen architecture: Eleventy (11ty), static output

**Why Eleventy:** the production constraint is hard — Communitygeeks is hosted on Hetzner legacy static webhosting, so the live site must be plain HTML/CSS/JS with no persistent Node server. Eleventy's whole model is "build static files locally/in CI, deploy the output folder" — it needs Node only at build time, never in production. It also stays close to the plain HTML/CSS this site was originally designed in, so the translation from approved mockup to templates was close to 1:1, minimizing the chance of introducing new bugs or drifting from what was approved.

Other options considered and rejected: Astro (more capable, but more opinionated/heavier than this project needs — five mostly-static pages don't need component islands or a JS framework runtime); a plain hand-written HTML site with no build step (would work, but loses the content-collection pattern for Public Thinking, meaning every new piece would require manually duplicating card markup in two places — this is explicitly what Section 6 of the original brief asked to avoid).

**No database, no CMS, no server-side runtime.** Content is Markdown files with frontmatter. This is deliberate, not a shortcut — the brief was explicit about this constraint and there's no concrete requirement here that needs more than that.

## 4. Page inventory

| Page | Route | Template | Notes |
|---|---|---|---|
| Home | `/` | `src/index.njk` | Hero, trust strip, ecosystem diagram, "How we think" question grid, Approach summary, Selected Work, Public Thinking preview (live, pulls 2 newest pieces), Founder, closing CTA |
| About | `/about/` | `src/about.njk` | Founder bio (long version), "How We Think" principles (public-facing, translated from internal Constitution language — see Section 7) |
| Approach | `/approach/` | `src/approach.njk` | Diagnostic question grid, 3 approach categories in detail |
| Contact | `/contact/` | `src/contact.njk` | Direct email + a **non-functional** form mock — see Section 8, item 1 |
| Public Thinking index | `/public-thinking/` | `src/public-thinking/index.njk` | Filterable index: real pieces (from content/) + case-study placeholders (from clients data) + an honest empty-state for Field Notes |
| Public Thinking item | `/public-thinking/{slug}/` | `src/public-thinking/item.njk` | One page per Markdown file in `content/public-thinking/`, via Eleventy pagination |
| Sitemap | `/sitemap.xml` | `src/sitemap.njk` | Auto-generated from `collections.all`, includes new Public Thinking pieces automatically |

Every page shares: a nav (`src/_includes/partials/nav.njk`, active-state highlighting via `page.url`), a footer with the real legal address (`partials/footer.njk`), and — except Contact, which *is* the CTA destination — a closing CTA block driven by front matter (`closingCta.secondaryLabel` / `secondaryUrl`).

## 5. Component inventory

- `partials/node-mark.njk` — the two-circle-plus-bridge-line signature graphic, derived from the actual Communitygeeks icon's glasses shape. Used as a small marker next to section labels throughout. Don't scale it up into a "mascot"; the whole point (per the original design brief) was restraint.
- `partials/ecosystem-diagram.njk` — hand-built SVG diagram (product node connected to Users/Developers/Creators/Partners/Advocates), currently used once, in Home's Problem section. Deliberately not overused — one instance was judged to "solve the problem" of the site otherwise being too text-heavy, per the founder's own call.
- `.pt-card` / `.index-card` — Public Thinking preview cards (Home) and index cards (`/public-thinking/`). Both support a `.placeholder` variant (dashed border, muted styling) for honest "not yet published" states — used for case studies and the field-notes empty state. **Never remove the placeholder styling to make the site look more populated than it is** — that's a deliberate honesty choice already made by the founder, not an oversight.
- `.work-cell` — Selected Work grid cards on Home, data-driven from `src/_data/clients.json`.
- Buttons: `.btn-primary` (filled), `.btn-secondary` (underlined text) — also exist as real Figma components (`Button/Primary`, `Button/Secondary`) if you need to cross-check exact padding/sizing.

## 6. Design tokens

`src/_data/tokens.json` has the full color/type/breakpoint values, matching the Figma "Communitygeeks/*" Paint Styles and Text Styles exactly (they were authored identically from the start). The actual CSS custom properties live at the top of `src/assets/css/style.css` — same values, just as CSS variables rather than JSON, because the site doesn't have a build step that would let templates consume tokens.json as CSS (no Sass/PostCSS token pipeline was set up — this was judged unnecessary for a five-page site, but flag it to Carmelito if the site grows enough that hand-syncing two token sources becomes a real maintenance cost).

Fonts: Fraunces (display serif — note it has no "Medium" weight, only Regular/SemiBold; the design uses SemiBold for all display headings), Archivo (body/UI), IBM Plex Mono (dates, tags, confidence labels, data). Loaded from Google Fonts via `<link>` in `layouts/base.njk` — no self-hosting set up. Consider self-hosting for performance/privacy if that becomes a priority; not done here to keep the initial implementation simple.

## 7. Content architecture: Public Thinking

This is the part of the brief most worth understanding properly before touching it.

**Why content/ lives outside src/:** so a non-technical editor (Katharina or Gaza) has exactly one folder to look in when adding a new piece, with zero risk of accidentally touching a template. The tradeoff: Eleventy's collections API only sees files inside the configured input directory (`src`), so `content/public-thinking/*.md` is invisible to `collectionApi.getFilteredByGlob()` — **I initially built this wrong, assuming glob-filtering worked across the whole project; it doesn't, and the build silently produced zero item pages with no error.** The actual fix: `src/_data/publicThinking.js` is a global data file that reads `content/public-thinking/*.md` directly via Node's `fs`, parses frontmatter with `gray-matter`, and renders the Markdown body with `markdown-it`. This is a normal, documented Eleventy pattern for content outside the input directory — not a hack — but it's worth understanding, because if you ever "simplify" this back to a plain `addCollection` + `getFilteredByGlob`, it will silently break again exactly the way it did for me.

**How to add a new piece:** copy `content/public-thinking/TEMPLATE.md.example` to a new file in the same directory (real filename, ending in `.md`, not `.md.example`), fill in the frontmatter, write the body in Markdown. It will automatically appear on `/public-thinking/`, get its own page at `/public-thinking/{slug}/`, appear in the sitemap, and — if it's one of the two newest pieces by date — on Home's preview grid. No template code needs to change.

**The confidence-label safeguard is real and tested**, not just a comment: `src/_data/publicThinking.js` throws a build-breaking error if any content file's `confidence` field isn't exactly `"Observation"`, `"Emerging Pattern"`, or `"Research Finding"` — these are the only public-facing labels approved in the Public Source Pack. Internal OS labels (Low/Medium/High/Validated, or Weak/Emerging/Strong) must never reach this repo. I deliberately broke this during verification (set an invalid value, confirmed the build failed with a clear message, then reverted) — see the build log if you want proof this actually works before trusting it.

**CMS decision (2026-08-11): holding off on Decap CMS for now.** It came up as a "still open" item, but adding it means standing up an OAuth backend to authenticate editors against GitHub (Netlify Identity, or a self-hosted proxy) — real new infrastructure that cuts against the whole static-site-on-Hetzner rationale in Section 3. With only two placeholder pieces and low expected publishing cadence, the existing copy-template-and-commit workflow is simple enough. Revisit once there are a few real published pieces, or if a non-technical editor needs to publish without going through Git at all.

**The two existing content files are not real yet.** `community-devrel-partnerships-overlap.md` and `moat-or-funnel-diagnostic.md` were introduced as illustrative card copy during the design phase — plausible titles that mirror real research directions in the OS, but never checked against an actual finished writeup. Their bodies currently say exactly that, explicitly, in an HTML comment and in the visible body text. **Do not write real-sounding analysis into these files yourself** — that would be fabricating research findings, which the original brief explicitly prohibited. Wait for Carmelito or Katharina to supply real content, or ask.

## 8. Remaining ambiguities (do not silently resolve these)

1. **Contact form backend: switched to Typeform, embedded (2026-08-11).** Formspree was wired up first (form `xdengeqk`), then replaced same-day once Typeform access became available — Carmelito judged building the form directly in Typeform simpler than hand-maintaining the raw HTML form's fields. `src/contact.njk` now embeds `https://form.typeform.com/to/ScREZMGC` (three fields: name, email, message — same as the old form; no welcome screen, since the embed sits inside the page's own hero copy) via a plain `<iframe>`, not Typeform's embed.js widget — kept intentionally simple, one fewer script for a static site to load. Styled via `.typeform-embed` in style.css (border matching `--line`, fixed height). The Formspree account still exists but is unused; nothing references it anymore.
2. **OG image is placeholder-quality.** `src/assets/images/og-image.png` was generated programmatically (icon + system-font text on the paper background) so that Open Graph tags have *something* real rather than nothing, but it wasn't designed by hand and doesn't use the actual Fraunces/Archivo fonts (a font-rendering pipeline wasn't set up for this). Worth a real design pass before this site is actually promoted on social media.
3. **Favicon set is programmatically generated**, not hand-optimized. Functional, but a designer pass (proper padding, maybe a simplified mark at very small sizes) would likely improve it.
4. **Client logos added (2026-08-11), 5 of 6.** Sourced directly from each company's own official site (not third-party logo databases), saved to `src/assets/images/logos/`, wired into `clients.json` via `logoPath` and rendered in the Selected Work grid (`.work-logo` in `index.njk`/`style.css`) — the trust strip stays plain text on purpose, kept deliberately quiet rather than turned into a logo wall. Carmelito confirmed usage clearance for all of these before sourcing. Each `clients.json` entry has a `logoSourceNote` recording exactly where its logo came from and why — read those before touching this again:
   - **DeepL, Tencent, Billbee** — straightforward, official marks from each company's own site.
   - **EU Academy** — the platform itself has no logo *file* (its header renders "eu|academy" as styled text). Using the European Commission's own logo instead, since the Commission owns the platform — Carmelito's explicit call, not a default guess.
   - **GB Foods** — the name is ambiguous (a large Spanish FMCG multinational vs. an unrelated US snack company); Carmelito confirmed it's the former (thegbfoods.com). Only regional marks exist (Europe/Africa) — using Europe, no plain unqualified "GB Foods" logo exists.
   - **Space Whale — not wired in.** Their official mark (`src/assets/images/logos/space-whale-white.svg`, saved unmodified) is white-only — their entire site is dark-background, no light-background variant exists anywhere. Recoloring it would mean editing their trademark artwork, which wasn't done unilaterally. Carmelito is deciding the display treatment (e.g. a small dark badge behind the unmodified logo) separately — don't add a `logoPath` for this entry until that's resolved, and don't recolor the saved SVG without his explicit go-ahead.
5. **Two Public Thinking content files are placeholder-only** — see Section 7's last paragraph. Don't treat this as "content missing, fill it in"; treat it as "content missing, ask before writing."
6. **Copyright year in the footer (`partials/footer.njk`) is hardcoded to "2026"**, matching what was approved in Figma/HTML at design time. Whether this should become dynamic (always show the current year) is a small product decision nobody's made explicitly — leaving it static for now rather than guessing.
7. **Logo-as-link behavior**: I made the header logo/wordmark a link to `/` (`partials/nav.njk`) since that's near-universal web convention and the original design's brand block was a plain non-interactive `<div>`. This is a small, low-risk assumption, not a silent redesign, but flagging it per the instruction not to invent missing behavior silently.

## 9. Current limitations

- No automated tests (no test framework set up — reasonable for a five-page static marketing site, but worth reconsidering if the Public Thinking section grows to dozens of pieces with more complex logic).
- No image optimization pipeline (Eleventy Image plugin, etc.) — `founder.jpg` and other images are served at their source resolution. Worth adding if page-load performance becomes a concern.
- No self-hosted fonts (see Section 6).
- Accessibility: semantic HTML and alt text were applied throughout, and the ecosystem diagram has an `aria-label` describing it, but a full accessibility audit (screen reader pass, color contrast check against WCAG AA, keyboard navigation check) has not been done.
- No analytics of any kind set up.

## 10. Install, run, build

```bash
npm install
npm run dev      # local dev server with live reload, http://localhost:8080
npm run build    # writes production-ready static files to _site/
```

**Build output directory: `_site/`.** Everything in there is what gets deployed — it's plain HTML/CSS/JS/images, ready to be copied directly into the Hetzner static hosting root. Nothing in `_site/` needs a server process to run.

I ran `npm install` and `npm run build` myself before finishing this handoff, fixed two real bugs I found in the process (see Section 7's pagination note, and a separate Eleventy quirk where only the *first* page of a paginated set is added to `collections.all` by default — fixed via `addAllPagesToCollections: true` in `src/public-thinking/item.njk`), and verified every internal link/asset in the built output actually resolves to a real file. The build works as of this handoff. If it doesn't work for you, something changed — check `npm install` completed cleanly first.

## 11. Fixed bug (2026-08-11): missing media-query closing brace

`src/assets/css/style.css` had a missing `}` after the `.pt-grid{grid-template-columns:1fr;}` line inside `@media (max-width:860px){...}`. Everything from the "Shared page-header pattern" comment through the end of the file — all of About, Approach, Contact, and the Public Thinking index page's actual styling (`.index-card`, `.index-grid`, `.filter-bar`, `.filter-pill`, `.card-title`, `.form-mock`, `.contact-grid`, `.principle-list`, `.approach-detail`, etc.) — was accidentally nested inside that mobile-only media query, so none of it applied at normal desktop widths. Only discovered after DNS/deploy went live and the real site was checked in a browser; `curl` never caught it because the file transferred byte-identical either way — this was a CSS authoring bug, not a deploy problem. Fixed by closing the media query after the legitimate mobile overrides (line ~140) instead of after all the later content. Verified via computed-style checks in a real browser (not just visual inspection) that `.index-card`, `.contact-grid`, and form inputs pick up their real rules now.

## 12. Fixed bug (2026-08-11): no mobile nav, and two more un-collapsed grids

Two separate mobile-layout problems, found by actually testing at a 375px viewport (not just visual inspection):

1. **The nav bar never had a mobile version at all.** `.navlinks` + `.nav-cta` were plain desktop flex children of `nav` with no collapse behavior — at narrow widths they simply overflowed instead of wrapping, pushing "About" and "Compare notes" off-screen entirely (present but unreachable without horizontal scrolling — this is what looked like "menu links do nothing"). Fixed by adding a real hamburger: `nav.njk` now wraps `.navlinks` + `.nav-cta` in `#nav-menu`, with a `.nav-toggle` button before it; `src/assets/js/nav-toggle.js` toggles a `.open` class + `aria-expanded`; CSS hides `.nav-toggle` and shows `.nav-menu` inline above 860px (the token breakpoint that already existed in `tokens.json` but was never actually wired to anything), and the reverse below it, as an absolutely-positioned dropdown.
2. **`.contact-grid` and `.approach-detail` never collapsed to one column** — no override existed for either, so at mobile widths the two-column grid (`0.85fr 1fr` / `80px 1fr`) squeezed the second column down to ~1px, which for Contact meant the Typeform embed rendered at effectively zero width.

**A cascade-order trap worth remembering**: my first attempt at fixing (2) added the overrides to the *first* `@media (max-width:860px)` block (the one near the top of the file, right after nav/hero). That block sits *before* `.contact-grid`'s and `.approach-detail`'s own base rules further down the file (CONTACT PAGE / APPROACH PAGE sections) — and since both rules have equal specificity, the *later* one in source order wins regardless of the media condition being true. The override was being correctly parsed and served, and still doing nothing, which looks exactly like a caching problem until you check rule order specifically. Fix: moved both overrides into the *second*, smaller `@media` block at the very end of the file, which comes after every page-specific section. **Any future mobile override for a selector defined in one of the later page-specific sections must go in that final media block, not the early shared one** — check where the base rule actually sits before adding an override, don't assume "inside any `@media` block" is sufficient.

Verified all of this with real computed-style / `document.documentElement.scrollWidth` checks at a 375px viewport (not just visual inspection) on every page: `/`, `/about/`, `/approach/`, `/contact/`, `/public-thinking/`, and a Public Thinking item page.

## 13. Structured data added (2026-08-11)

Schema.org JSON-LD, per the OS decision in Public Source Pack → "Website Technical Decisions" (decided 8 Aug, never actually coded until now):
- **Organization** — `src/_includes/layouts/base.njk`, sitewide, `@id` `https://communitygeeks.de/#organization`. Description reuses the exact approved sentence from `public/llms.txt`; address reuses the exact legal address already public in the footer. No `sameAs` — no verified social profile URLs exist anywhere in this repo or the Public Source Pack, so none were added; don't add one without a real, approved link.
- **Person** (founder) — `src/about.njk`, via the existing (previously unused) `extraHead` front-matter mechanism. `@id` `https://communitygeeks.de/about/#founder`, `worksFor` links back to the Organization `@id`. Bio text is the exact approved About-page version, not paraphrased.
- **Article** — one per Public Thinking piece, computed in `src/_data/publicThinking.js` (as a precomputed `articleJsonLd` string, using `JSON.stringify` for safe escaping — deliberately not hand-templated in Nunjucks, see the bug below) and injected via `item.njk`'s `eleventyComputed.extraHead`. `author` links to the founder `@id` when `piece.author` is "Carmelito Bauer", otherwise a plain `Person` with just a name (no fabricated jobTitle/worksFor for people we don't have public data on).

**Bug found and fixed while wiring this up**: `item.njk`'s `eleventyComputed.title` / `description` (`"{{ piece.title }}"` / `"{{ piece.summary }}"`) were being HTML-escaped at that front-matter templating stage, then escaped *again* when `base.njk` wrote them into `<title>`, `og:title`, `description`, `og:og:description`. Any piece title with an apostrophe (e.g. "...where they don't") rendered as literal `don&amp;#39;t` in the actual page source — broken in the browser tab, social previews, and search snippets, for every Public Thinking piece, since before this session. Fixed by adding `| safe` at the `eleventyComputed` stage so escaping happens exactly once, at the real point of writing HTML in `base.njk`. Same root cause hit `extraHead` while adding the Article schema above — fixed the same way.

Verified all three schema types actually parse as valid JSON in a real browser (not just visually) on Home, About, and both Public Thinking item pages, and confirmed the `@id` links between Article→author→Organization actually resolve to the same object rather than duplicating it.

## 14. Explicit reminder

**Do not redesign the approved site unless Carmelito requests it.** If you notice something that looks like it could be improved visually, that's worth a note to Carmelito, not a unilateral change. Content bugs (wrong copy, broken links, accessibility issues) are fine to fix outright — those aren't design decisions.
