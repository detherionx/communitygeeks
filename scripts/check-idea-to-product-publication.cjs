// Run after npm run build. ARTICLE_BASE_URL can point to the live site after release.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const site = path.join(root, '_site');
const output = path.join(root, 'tmp/qa');
const articles = [
  { lang: 'en', route: '/public-thinking/idea-to-product/', paid: ['Reach', 'Installs', 'Clicks', 'Creator placements'], accumulated: ['Trust', 'Reputation', 'Reusable knowledge', 'People helping each other', 'Developers building around the product', 'Shared stories and rituals', 'Advocacy'] },
  { lang: 'de', route: '/de/public-thinking/von-der-idee-zum-produkt/', paid: ['Reichweite', 'Installationen', 'Klicks', 'Platzierungen bei Creators'], accumulated: ['Vertrauen', 'Reputation', 'Wiederverwendbares Wissen', 'Menschen, die sich gegenseitig helfen', 'Entwickler, die auf dem Produkt aufbauen', 'Gemeinsame Geschichten und Rituale', 'Fürsprache'] }
];
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(site, '.' + url + (url.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(site + path.sep)) { response.writeHead(403); response.end(); return; }
  fs.readFile(file, (error, data) => {
    response.writeHead(error ? 404 : 200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(error ? 'Not found' : data);
  });
});

(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = process.env.ARTICLE_BASE_URL || 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'chrome' } : {});
  const errors = [];
  try {
    for (const article of articles) {
      for (const width of [1440, 768, 390, 320]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://cloud.umami.is/**', route => route.abort());
        assert.equal((await page.goto(base + article.route)).status(), 200);
        await page.evaluate(() => document.fonts.ready);
        await page.locator('.idea-figure img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
        assert.equal(await page.locator('html').getAttribute('lang'), article.lang);
        assert.equal(await page.locator('h1').count(), 1);
        assert.deepEqual(await page.locator('.idea-paid li').allTextContents(), article.paid);
        assert.deepEqual(await page.locator('.idea-accumulated li').allTextContents(), article.accumulated);
        assert.equal(await page.locator('.idea-attention .idea-eyebrow').count(), 1);
        assert.equal(await page.locator('.idea-attention table').count(), 0);
        assert.equal(await page.locator('.idea-before li').count(), 8);
        assert.equal(await page.locator('.idea-after li').count(), 8);
        assert.equal(await page.locator('.idea-figure').count(), 2);
        assert.equal(await page.locator('.pt-motif--spec .cm-idea-to-product').count(), 1);
        assert.equal(await page.locator('meta[name=robots]').count(), 0);
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://communitygeeks.ai' + article.route);
        assert.equal(await page.locator('link[hreflang]').count(), 3);
        assert.ok(await page.locator('.idea-hero').evaluate(element => { let count = 0; while (element = element.previousElementSibling) if (element.tagName === 'P') count++; return count >= 6; }));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, article.lang + ' overflow at ' + width);
        const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
        const schema = structured.map(JSON.parse).find(data => data['@type'] === 'Article');
        assert.equal(schema.inLanguage, article.lang);
        assert.equal(schema.url, 'https://communitygeeks.ai' + article.route);
        const og = await page.locator('meta[property="og:image"]').getAttribute('content');
        assert.equal((await page.request.get(base + new URL(og).pathname)).status(), 200);
        if (width === 1440 || width === 390) {
          await page.locator('.idea-attention').screenshot({ path: path.join(output, article.lang + '-comparison-' + width + '.png'), style: '.bar{visibility:hidden!important}' });
          await page.locator('.idea-shift').screenshot({ path: path.join(output, article.lang + '-shift-' + width + '.png'), style: '.bar{visibility:hidden!important}' });
          await page.screenshot({ path: path.join(output, article.lang + '-article-' + width + '.png'), fullPage: true });
        }
        if (width === 1440) {
          await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Zoom overflow');
        }
        if (width === 390) {
          const toggle = page.locator('.bar-toggle');
          await toggle.focus(); await page.keyboard.press('Enter');
          assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        }
        await page.close();
      }
      const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      await noJs.goto(base + article.route);
      assert.equal(await noJs.locator('.idea-accumulated li:visible').count(), 7);
      await noJs.close();
    }
    for (const [route, lang] of [['/', 'en'], ['/public-thinking/', 'en'], ['/de/public-thinking/', 'de']]) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
        assert.equal((await page.goto(base + route)).status(), 200);
        assert.ok(await page.locator('a[href="' + articles.find(article => article.lang === lang).route + '"]').count(), 'Missing article on ' + route);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route + ' overflow');
        if (route === '/') {
          const journal = page.locator('[data-journal]').first();
          assert.equal(JSON.parse(await journal.getAttribute('data-journal')).right.headline, 'WHAT ACCUMULATES');
          await page.locator('.jm-journal').screenshot({ path: path.join(output, 'journal-' + width + '.png') });
        }
        await page.close();
      }
    }
    const sitemap = await (await fetch(base + '/sitemap.xml')).text();
    for (const article of articles) assert.ok(sitemap.includes(article.route));
    assert.deepEqual(errors, []);
    console.log('PASS: EN/DE article copy, responsive layout, illustrations, motif, metadata, language links, social images, homepage/archive, journal, sitemap, zoom and no-JavaScript.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
