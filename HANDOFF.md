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

**The two existing content files are not real yet.** `community-devrel-partnerships-overlap.md` and `moat-or-funnel-diagnostic.md` were introduced as illustrative card copy during the design phase — plausible titles that mirror real research directions in the OS, but never checked against an actual finished writeup. Their bodies currently say exactly that, explicitly, in an HTML comment and in the visible body text. **Do not write real-sounding analysis into these files yourself** — that would be fabricating research findings, which the original brief explicitly prohibited. Wait for Carmelito or Katharina to supply real content, or ask.

## 8. Remaining ambiguities (do not silently resolve these)

1. **Contact form backend: decided 2026-08-10 — Formspree.** `src/contact.njk` now posts to `https://formspree.io/f/YOUR_FORM_ID`, a honeypot field (`_gotcha`) is included, and fields have `required`. **The `YOUR_FORM_ID` placeholder still needs Carmelito to create a Formspree account and drop in the real form ID** — until then the form does not actually send anywhere. The direct email address on the same page works today regardless.
2. **OG image is placeholder-quality.** `src/assets/images/og-image.png` was generated programmatically (icon + system-font text on the paper background) so that Open Graph tags have *something* real rather than nothing, but it wasn't designed by hand and doesn't use the actual Fraunces/Archivo fonts (a font-rendering pipeline wasn't set up for this). Worth a real design pass before this site is actually promoted on social media.
3. **Favicon set is programmatically generated**, not hand-optimized. Functional, but a designer pass (proper padding, maybe a simplified mark at very small sizes) would likely improve it.
4. **No client logo image files exist yet** — the trust strip and Selected Work section use plain text names (`src/_data/clients.json`), not logo marks. This was a deliberate decision during design: company logos are trademarked, and altering them (e.g., to a single flat color, which was discussed as a possible future treatment) generally requires checking each company's brand guidelines. If Carmelito provides real logo files later, they'd go in `src/assets/images/logos/` and `clients.json` would get a `logoPath` field per entry — don't add this speculatively before real files exist.
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

## 11. Explicit reminder

**Do not redesign the approved site unless Carmelito requests it.** If you notice something that looks like it could be improved visually, that's worth a note to Carmelito, not a unilateral change. Content bugs (wrong copy, broken links, accessibility issues) are fine to fix outright — those aren't design decisions.
