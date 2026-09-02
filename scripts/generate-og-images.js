// Generates each Public Thinking piece's 1200x630 social card.
//
// Pipeline (see HANDOFF.md / the architecture discussion this came out of):
//   1. `eleventy` (already run by the time this script starts, see
//      package.json's "build" script) rendered every real page AND, for
//      each piece below, a throwaway fragment page at
//      _site/og-cards/<slug>/index.html — see src/og-cards/card.njk. Those
//      fragments load the site's real stylesheet/fonts, so what gets
//      screenshotted here is never a second, parallel rendering system.
//   2. This script serves that already-built _site over local HTTP,
//      screenshots each fragment at the exact card size, and writes the
//      PNG directly into _site/assets/images/public-thinking/og/ — i.e.
//      into the same directory npm run build is about to upload, not back
//      into src/. That's what keeps this a single build: nothing here
//      requires Eleventy to run a second time.
//   3. The fragment pages themselves are then deleted from _site — they
//      exist only to be screenshotted, never to be deployed as real,
//      crawlable URLs.
//
// Any failure here throws and exits non-zero: a broken/missing card should
// fail the build loudly, not silently fall back to a stale or absent image.

const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("playwright");
const { loadAll } = require("../src/lib/publicThinkingLoader");

const SITE_DIR = path.join(__dirname, "..", "_site");
const OG_CARDS_DIR = path.join(SITE_DIR, "og-cards");
const OG_OUTPUT_DIR = path.join(SITE_DIR, "assets", "images", "public-thinking", "og");
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function serveSite() {
  const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.join(SITE_DIR, reqPath);
    if (reqPath.endsWith("/")) filePath = path.join(filePath, "index.html");
    if (!filePath.startsWith(SITE_DIR)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  if (!fs.existsSync(SITE_DIR)) {
    throw new Error(`_site not found at ${SITE_DIR} — run "eleventy" before this script.`);
  }

  const pieces = loadAll().filter((item) => !item.ogImageIsExplicit);
  if (pieces.length === 0) {
    console.log("No Public Thinking pieces need a generated OG card.");
    return;
  }

  fs.mkdirSync(OG_OUTPUT_DIR, { recursive: true });

  const server = await serveSite();
  const { port } = server.address();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: { width: CARD_WIDTH, height: CARD_HEIGHT }, deviceScaleFactor: 1 });

    for (const piece of pieces) {
      const url = `http://127.0.0.1:${port}/og-cards/${piece.slug}/`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      if (!response || !response.ok()) {
        throw new Error(`OG card page for "${piece.slug}" did not load correctly (${url}, status ${response && response.status()}).`);
      }
      await page.evaluate(() => document.fonts.ready);

      const card = page.locator(".og-card");
      const box = await card.boundingBox();
      if (!box || Math.round(box.width) !== CARD_WIDTH || Math.round(box.height) !== CARD_HEIGHT) {
        throw new Error(
          `OG card for "${piece.slug}" rendered at ${box ? `${box.width}x${box.height}` : "no size"}, expected exactly ${CARD_WIDTH}x${CARD_HEIGHT}.`
        );
      }

      const outputPath = path.join(OG_OUTPUT_DIR, `${piece.slug}.png`);
      await card.screenshot({ path: outputPath });
      console.log(`Generated OG card: ${path.relative(SITE_DIR, outputPath)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Fragment pages exist only to be screenshotted — remove them so they
  // never ship as real, crawlable URLs in the deployed site.
  fs.rmSync(OG_CARDS_DIR, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
