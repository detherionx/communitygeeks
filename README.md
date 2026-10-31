# communitygeeks.ai

The Communitygeeks website, live since 28 Oct 2026.

- `site/` is the deployed website: static pages, assets, `.htaccess` (canonical host, security headers, redirects from retired URLs), `sitemap.xml`, `robots.txt` and `llms.txt`.
- A push to `main` uploads the files in `site/` that changed since the last deploy to Hetzner over SFTP (`.github/workflows/deploy.yml`, `.github/scripts/deploy-changed.sh`). One deploy runs at a time. There is no build step in CI.
- The pages are generated locally by the site-v3 build and copied into `site/`.

The previous Eleventy site (Website 2.0, Public Thinking) is retired. Its full source remains in the git history up to commit `c563187`.
