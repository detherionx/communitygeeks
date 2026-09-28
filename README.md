# Communitygeeks Website

Static site, built with [Eleventy](https://www.11ty.dev/). Deploys as plain static files: no server-side runtime required in production.

See `HANDOFF.md` for full context (design source, architecture rationale, content model, known limitations, unresolved decisions). This file is just the quick technical reference.

**Production since 2026-09-03 is the redesigned Communitygeeks 2.0 site** (layouts `home`, `about`, `contact`, `pt` on a shared `partials/head.njk`). The previous site is preserved as git tag `pre-2026-redesign`. Start with HANDOFF.md section 0.

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

Output goes to `_site/`. That directory is the entire deployable artifact, copy its contents to the web root on the Hetzner host.

## Adding a new Public Thinking piece

1. Copy `content/public-thinking/TEMPLATE.md.example` to a new file in the same folder, e.g. `content/public-thinking/my-new-piece.md`.
2. Fill in the frontmatter fields (see comments in the template for what each one means and which values are valid).
3. Write the body in Markdown below the second `---`.
4. Run `npm run build` (or `npm run dev` and check locally first).

The new piece appears automatically on `/public-thinking/`, gets its own page, joins the sitemap, and, if it's one of the two newest by date, shows on the Home page preview. No template or code changes needed.

A piece with a future `date` is skipped by `npm run build` and published by the daily 06:00 UTC cron build once its date arrives (00:00 UTC). `npm run dev` still shows it for preview; `PT_INCLUDE_FUTURE=1 npm run build` does too.

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

Automated via GitHub Actions (`.github/workflows/deploy.yml`): every push to `main` builds the site and uploads `_site/` to the Hetzner host over SFTP, additively (it does not delete files already on the server, see below).

**Deploy action history (2026-08-11):** originally used `wlixcc/SFTP-Deploy-Action`, dropped after two real incompatibilities with this account (SFTP-only, no SSH shell/exec access): its `delete_remote_files` option needs an exec channel (`exec request failed on channel 0`), and separately, its `sftp_only` mode never actually `cd`s into `remote_path` before uploading, so nested folders failed to resolve (`realpath ... No such file`). Neither is a config mistake; both are hard limitations of that action under a no-exec host. Now using `wangyucode/sftp-upload-action`, which operates purely over the SFTP protocol with no exec dependency at all, including for deletion, via its `removeExtraFilesOnServer` input (not currently enabled; the target folder's old WordPress install was cleared manually via konsoleH's File Manager once, before the first real deploy). If a wipe-before-upload workflow is wanted later, `removeExtraFilesOnServer` is the way to do it on this host, not `delete_remote_files` on the old action.

Required repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `HETZNER_HOST` | `your_server` |
| `HETZNER_USERNAME` | `your_username` |
| `HETZNER_PASSWORD` | Hetzner SFTP password |
| `HETZNER_REMOTE_PATH` | Web root path on the Hetzner account (confirm in KonsoleH) |

No secret is stored in this repo. To deploy manually instead: `npm run build`, then upload the contents of `_site/` to the static hosting root over SFTP.

## Cal.com fit-call booking (PHP)

Create **`api/cal.config.php` only on the PHP server**, next to `cal-slots.php` and `cal-booking.php`. Its source-tree equivalent is `public/api/cal.config.php`; do not put credentials into Eleventy data or JavaScript. Start from `public/api/cal.config.example.php`, set the API key, the numeric ID of your **30-minute** fit-call event, `Europe/Berlin`, and the exact HTTPS origins serving the site. The real configuration is git-ignored and excluded from Eleventy passthrough; Apache denies direct access to configuration and shared PHP helper files. Do not commit the real file or copy it into `_site` during a build.

Create the key in [Cal.com Settings → Security → API keys](https://cal.com/docs/api-reference/v2/introduction). Configure the event's availability, meeting location and calendar connections in Cal.com. Keep its standard name/email/notes booking fields; additional mandatory custom questions or email verification require matching form fields before enabling this integration. A host-approval event returns “Booking requested”; an accepted booking returns “Your call is booked”.

Server requirements: PHP 8.2+ with cURL, valid CA certificates, outbound HTTPS to `api.cal.com`, and a writable PHP temporary directory outside the web root. Enable Apache `.htaccess` overrides; on another web server, configure equivalent deny rules for `*.config.php`, `*.config.example.php` and `cal-common.php`. Ensure PHP is executed, never served as source. The runtime configuration stays on the server across additive uploads. No deployment was performed for this change.

The browser gets availability from `GET /api/cal-slots.php` (next 14 days). After selecting a slot, it collects personal details on `/contact/`; only **Confirm booking** posts to `POST /api/cal-booking.php`. The server fixes the event ID and timezone, validates the request, rechecks the selected slot and then creates the booking. It sends safe errors, limits each connection to 8 booking attempts and 60 availability requests per 15 minutes, and persists duplicate-submit protection in the PHP temporary directory. A timeout is treated as uncertain: retry the same request or check the invitation before creating another request. Deployments spanning multiple PHP hosts need shared rate-limit and request storage.

Plain `npm run dev -- --port=8080` keeps explicitly labelled mock times on localhost: Eleventy does not execute PHP. For a local live-integration preview, keep the git-ignored configuration at `public/api/cal.config.php` and run `npm run preview:cal`; the preview builds the site, serves it at `http://127.0.0.1:8081`, executes only the public slots and booking routes, and never copies the credential into `_site`. Do not use the PHP development server in production. Without a configuration the preview refuses to start.

Validation without credentials or invitations:

```powershell
$env:PHP_BINARY = 'C:\path\to\php.exe'
node --test scripts/test-cal-booking.cjs
```

The test runs real PHP endpoint code against a local fake transport. It covers invalid details/event IDs/origins, stale availability, accepted/pending bookings, duplicate submissions, uncertain responses, rate limits and configuration exclusion. A real Cal.com event has not been exercised until its owner configures and checks it.

API references: [availability, version 2024-09-04](https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type), [booking, version 2026-02-25](https://cal.com/docs/api-reference/v2/bookings/create-a-booking).

The local build browser can be installed without changing global setup:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.local-tools\browsers'
npx playwright install chromium
npm run build
```
