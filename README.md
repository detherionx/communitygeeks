# Communitygeeks Website

Static site, built with [Eleventy](https://www.11ty.dev/). Deploys as plain static files — no server-side runtime required in production.

See `HANDOFF.md` for full context (design source, architecture rationale, content model, known limitations, unresolved decisions). This file is just the quick technical reference.

## Prerequisites

- Node.js 18+

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs a local server with live reload at `http://localhost:8080`.

## Production build

```bash
npm run build
```

Output goes to `_site/`. That directory is the entire deployable artifact — copy its contents to the web root on the Hetzner host.

## Adding a new Public Thinking piece

1. Copy `content/public-thinking/TEMPLATE.md.example` to a new file in the same folder, e.g. `content/public-thinking/my-new-piece.md`.
2. Fill in the frontmatter fields (see comments in the template for what each one means and which values are valid).
3. Write the body in Markdown below the second `---`.
4. Run `npm run build` (or `npm run dev` and check locally first).

The new piece appears automatically on `/public-thinking/`, gets its own page, joins the sitemap, and — if it's one of the two newest by date — shows on the Home page preview. No template or code changes needed.

**Confidence field must be exactly** `Observation`, `Emerging Pattern`, or `Research Finding`. Anything else fails the build on purpose.

## Directory structure

```
communitygeeks-website/
  HANDOFF.md              ← read this first if you're new to the project
  README.md               ← you are here
  package.json
  .eleventy.js             Eleventy config
  src/
    _data/
      tokens.json          design tokens (colors, type, breakpoints)
      nav.json             navigation + primary CTA
      clients.json         nameable client list + Selected Work copy
      publicThinking.js    reads content/public-thinking/*.md (see HANDOFF.md §7)
    _includes/
      layouts/base.njk     shared page shell (head, nav, footer, closing CTA)
      partials/            nav, footer, closing-cta, node-mark, ecosystem-diagram
    index.njk               → /
    about.njk                → /about/
    approach.njk              → /approach/
    contact.njk                → /contact/
    public-thinking/
      index.njk              → /public-thinking/
      item.njk                → /public-thinking/{slug}/ (one per content file)
    sitemap.njk              → /sitemap.xml
    assets/
      css/style.css
      js/public-thinking-filter.js
      images/               icon, founder photo, favicons, OG image
  content/
    public-thinking/
      TEMPLATE.md.example   copy this to add a new piece
      *.md                  actual Public Thinking pieces
  public/
    robots.txt              explicit AI-crawler allowances included on purpose
    llms.txt
```

## Deployment

Automated via GitHub Actions (`.github/workflows/deploy.yml`): every push to `main` builds the site and uploads `_site/` to the Hetzner host over SFTP, additively (it does not delete files already on the server — see below).

**`delete_remote_files` was tried and reverted (2026-08-11).** The Hetzner account here is SFTP-only with no SSH shell/exec access, and this action's delete step requires an exec channel — it failed with `exec request failed on channel 0` before touching anything. Don't re-enable it against this host. The target folder (`HETZNER_REMOTE_PATH`, currently `public_html/communitygeeks`) held a stale, unused WordPress install that had to be cleared manually via konsoleH's File Manager instead, once, before the first real deploy.

Required repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `HETZNER_HOST` | `www364.your-server.de` |
| `HETZNER_USERNAME` | `carmelz` |
| `HETZNER_PASSWORD` | Hetzner SFTP password |
| `HETZNER_REMOTE_PATH` | Web root path on the Hetzner account (confirm in KonsoleH) |

No secret is stored in this repo. To deploy manually instead: `npm run build`, then upload the contents of `_site/` to the static hosting root over SFTP.
