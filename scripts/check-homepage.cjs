const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');

const stage = process.argv[2] || 'after';
const url = process.env.PREVIEW_URL || 'http://localhost:8091/';
assert(['before', 'after'].includes(stage));
const out = path.resolve(process.env.QA_OUTPUT || 'design/proof-polish');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = [];
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['tablet', 768, 1024], ['narrow', 320, 740]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += height) {
        await page.evaluate(y => scrollTo(0, y), y);
        await page.waitForTimeout(60);
      }
      for (const card of await page.locator('.jm-card').all()) {
        await card.scrollIntoViewIfNeeded();
        await card.locator('img').evaluate(img => img.complete ? undefined : new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, {once: true});
          img.addEventListener('error', () => reject(new Error(`Missing image: ${img.src}`)), {once: true});
        }));
      }
      if (await page.locator('.jm-shelf').count()) await page.locator('.jm-shelf').evaluate(x => x.scrollTo({left: 0, behavior: 'instant'}));
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(400);
      const metrics = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
        journalY: document.querySelector('#thinking').getBoundingClientRect().top + scrollY,
        frontierWords: document.querySelector('#frontier').innerText.trim().split(/\s+/).length,
        words: document.querySelector('main').innerText.trim().split(/\s+/).length,
        typography: Object.fromEntries(['.hero-kicker', 'h1', '#frontier h2', '.frontier-context', '.jm-lead h3', '.jm-card h3', '.jm-meta', '#system h2', '.engagement-tier h3', '.tier-price', '.bar-nav a'].filter(s => document.querySelector(s)).map(s => {
          const style = getComputedStyle(document.querySelector(s));
          return [s, {family: style.fontFamily, weight: style.fontWeight, size: style.fontSize, optical: style.fontVariationSettings}];
        })),
        headings: [...document.querySelectorAll('main h2')].map(x => x.textContent.trim()),
        brokenImages: [...document.images].filter(x => !x.complete || !x.naturalWidth).map(x => x.src),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"],a[href^="/#"]')].filter(x => !document.getElementById(x.hash.slice(1))).map(x => x.getAttribute('href'))
      }));
      if (['desktop', 'mobile', 'tablet'].includes(name)) {
        await page.screenshot({ path: path.join(out, `${stage}-${name}.png`), fullPage: true });
        fs.writeFileSync(path.join(out, `${stage}-${name}-copy.txt`), await page.locator('main').innerText());
        if (stage === 'after') for (const id of ['field', 'frontier', 'participation', 'system', 'approach', 'thinking', 'talk']) {
          await page.locator(`#${id}`).screenshot({ path: path.join(out, `${name}-${id}.png`), style: '.bar,.skip-link{visibility:hidden}' });
        }
      }
      if (stage === 'after') {
        assert(metrics.width <= width, `${name}: horizontal overflow`);
        assert.deepEqual(metrics.brokenImages, [], `${name}: missing images`);
        assert.deepEqual(metrics.brokenAnchors, [], `${name}: missing anchors`);
        assert.deepEqual(errors, [], `${name}: runtime errors`);
        await page.getByRole('link', { name: 'See how we help' }).click();
        assert.equal(new URL(page.url()).hash, '#frontier');
        assert(await page.locator('#frontier').isVisible());
        if (width <= 768) {
          await page.getByRole('button', { name: 'Open menu' }).click();
          assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'true');
          await page.locator('#nav-menu').getByRole('link', { name: 'Services', exact: true }).click();
          assert.equal(new URL(page.url()).hash, '#approach');
        }
        assert.equal(await page.locator('.engagement-tier').count(), 3);
        const support = page.locator('#support');
        assert.equal(await support.getByRole('link', { name: 'Get in touch' }).getAttribute('href'), '#talk', `${name}: custom tier contact link`);
        assert(!/€|\$/.test(await support.innerText()), `${name}: custom tier shows no price figure`);
        const offerText = await page.locator('#approach').innerText();
        for (const t of ['€14,000', '€42,000', '€28,000', 'stop gate', '13 weeks', '4 weeks']) assert(offerText.toLowerCase().includes(t), `${name}: offer shows ${t}`);
        assert(!/€12,000|€48,000|€8,500|€39,500|€31,000|€36,000|credited|creditable|Partnership|Programme Lead|16 weeks|pre-registered/.test(await page.locator('main').innerText()), `${name}: no retired or unapproved offer terms`);
        const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
        assert.deepEqual(ld.hasOfferCatalog.itemListElement.map(o => [o.name, o.priceSpecification?.price ?? null]), [['Decision Review', 14000], ['Programme Build', 42000], ['Programme Support', null]]);
        assert(await page.getByRole('link', { name: 'Discuss a decision', exact: true }).isVisible());
        await page.locator('.engagement-scope summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('.engagement-scope').getAttribute('open'), '');
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('iframe').count(), 0);
        assert.equal(await page.getByRole('link', { name: 'Book a conversation' }).getAttribute('href'), 'https://cal.com/communitygeeks/30min');
        assert.equal(await page.locator('main > section').count(), 6);
        assert.equal(await page.locator('.jm-card img').count(), 3);
        assert.equal(await page.locator('.jm-lead img').count(), 1);
        assert.equal(await page.locator('.jm-lead h3 a').getAttribute('href'), '/public-thinking/builder-ecosystems/');
        assert.equal(await page.locator('.jm-research a').getAttribute('href'), '/public-thinking/#research');
        assert.equal(await page.locator('#system .crew-render').count(), 3);
        assert.deepEqual(await page.locator('main > section').evaluateAll(xs => xs.map(x => x.id)), ['field','frontier','system','approach','thinking','talk']);
        assert(!/Beyond AI|Our bet|Understand\. Decide\. Implement\./.test(await page.locator('main').innerText()));
        assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' '), 'Launch the programmes your builders need.');
        assert.equal(await page.locator('#experience .work-logo').count(), 3);
        assert.equal(await page.locator('.participation-evidence').count(), 0);
        const panels = await page.locator('#system .mission-moment').evaluateAll(xs => xs.map(x => {const r=x.getBoundingClientRect();return {height:r.height,top:r.top};}));
        assert(Math.max(...panels.map(x=>x.height))-Math.min(...panels.map(x=>x.height)) < 1, 'Equal-height work scenes');
        if(width > 760) assert(Math.max(...panels.map(x=>x.top))-Math.min(...panels.map(x=>x.top)) < 1, 'Aligned work scenes');
        // Final builder copy pass (18 Oct 2026): the brief sets no quota ("do not add prose to meet a quota"), so the
        // reading-flow check keeps only the 950-word ceiling from the structure pass, counted on the rendered page
        // excluding SVG text, aria-hidden decoration, closed disclosure bodies and the site footer.
        const flowWords = await page.evaluate(() => {
          const main = document.querySelector('main').cloneNode(true);
          main.querySelectorAll('svg, [aria-hidden="true"], details > :not(summary), script, style, footer').forEach(e => e.remove());
          document.body.appendChild(main); main.style.cssText = 'position:absolute;left:-99999px;width:' + innerWidth + 'px';
          const n = (main.innerText.trim().match(/\S+/g) || []).length; main.remove(); return n;
        });
        assert(flowWords <= 950, `${name}: reading-flow words ${flowWords} at most 950`);
        const readability = await page.evaluate(() => [...document.querySelectorAll('main p')].filter(p => p.offsetParent && p.innerText.trim().length > 140).map(p => {
          const cs = getComputedStyle(p); const fs = parseFloat(cs.fontSize); const t = p.innerText.trim();
          const lines = Math.max(1, Math.round(p.getBoundingClientRect().height / parseFloat(cs.lineHeight)));
          return { text: t.slice(0, 50), fs, perLine: t.length / lines };
        }));
        for (const r of readability) {
          assert(r.fs >= 15, `${name}: body paragraph at least 15px: ${r.text}`);
          assert(r.perLine <= 85, `${name}: paragraph lines of 85 characters or fewer: ${r.text}`);
        }
        const levels = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4')].filter(h => h.offsetParent).map(h => +h.tagName[1]));
        levels.reduce((prev, lvl) => { assert(lvl <= prev + 1, `${name}: heading levels do not skip (h${prev} to h${lvl})`); return lvl; }, 1);
        assert(!/OpenAI|Anthropic|LangChain|Godot|Codex|Claude|Model Context|MCP|Nebius/.test(await page.locator('#frontier, #system').allInnerTexts().then(t => t.join(' '))), `${name}: no outside-company examples in the frontier or method`);
        const talkText = await page.locator('#talk').innerText();
        for (const proof of ['EU Academy', 'Gaming communities for Tencent, through ZAM']) assert(talkText.includes(proof), `${name}: founder section keeps approved experience: ${proof}`);
        assert(await page.locator('#talk [aria-label="DeepL"]').count() === 1, `${name}: DeepL proof row`);
        assert(!/DeepL|EU Academy|Tencent/.test(await page.locator('#frontier').innerText()), `${name}: experience appears once, in the founder section`);
        assert((await page.locator('#approach').innerText()).includes('The Review is the first phase of the Programme Build. Continue with an agreed scope for a further €28,000.'), `${name}: approved continuation wording`);
        assert(await page.locator('.engagement-scope li').count() >= 5, `${name}: operational terms in the disclosure`);
        assert((await page.locator('#build .tier-followup').innerText()).includes('90 days after handover'), `${name}: follow-up after handover on the Build card`);
        assert.equal(await page.locator('#talk blockquote').count(), 0, `${name}: founder quotation removed`);
        const css = await page.evaluate(async () => {
          const sheet = [...document.styleSheets].find(x => x.href && x.href.includes('ecosystem-home'));
          const text = (await (await fetch(sheet.href)).text()).replace(/\/\*[\s\S]*?\*\//g, '');
          let parsed = 0; const walk = rs => { for (const r of rs) { if (r instanceof CSSMediaRule) walk(r.cssRules); else if (r instanceof CSSStyleRule) parsed++; } }; walk(sheet.cssRules);
          return { source: (text.match(/\{/g) || []).length - (text.match(/@media/g) || []).length, parsed, unclosedComment: /\/\*(?![\s\S]*?\*\/)/.test(text) };
        });
        assert.equal(css.parsed, css.source, `${name}: every ecosystem-home.css rule parses (no swallowed rules)`);
        assert(!css.unclosedComment, `${name}: no unclosed comment in ecosystem-home.css`);
        assert.equal(await page.locator('#frontier .frontier-examples > li').count(), 3, `${name}: three frontier examples`);
        const scope = await page.locator('.engagement-scope').evaluate(d => d.textContent);
        for (const term of ['introductions by day 3', 'access by day 5', 'about four hours a week from week 5', 'approvals within five working days', 'remobilisation', '€14,000 at week 5 and €14,000 at week 10', 'Not included']) assert(scope.includes(term), `${name}: disclosure keeps "${term}"`);
        assert(await page.locator('#system .mission-output').count() === 3, `${name}: each method step names its output`);
        assert(!/sits unreviewed because nobody owns the queue/.test(await page.locator('main').innerText()), `${name}: no causal pull-request claim`);
        if (width <= 640) {
          await page.locator('.jm-card-link').last().focus();
          assert(await page.locator('.jm-shelf').evaluate(x => x.scrollLeft > 0), `${name}: keyboard can reach every illustrated card`);
        }
        if (width <= 860) assert.equal(await page.locator('.hero-kicker').evaluate(x => getComputedStyle(x).fontSize), '13px');
        const journal = JSON.parse(await page.locator('#researcher-scene').getAttribute('data-journal'));
        const expectedJournal = require('../src/_data/journalPages')();
        assert.equal(journal.right.headline, expectedJournal.right.headline);
        assert.equal(journal.left.headline, expectedJournal.left.headline);
      }
      results.push({ name, ...metrics, errors });
      await page.close();
    }
    if (stage === 'after') {
      const motion = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await motion.goto(url);
      await motion.waitForFunction(() => window.__researcher);
      const journalY = await motion.locator('#thinking').evaluate(x => x.offsetTop);
      await motion.evaluate(y => scrollTo(0, y - 700), journalY);
      await motion.waitForTimeout(200);
      const start = await motion.evaluate(() => window.__researcher.progress());
      await motion.evaluate(y => scrollTo(0, y + 400), journalY);
      await motion.waitForTimeout(200);
      const end = await motion.evaluate(() => window.__researcher.progress());
      assert(end > start, 'Journal progresses with scroll');
      await motion.evaluate(y => scrollTo(0, y - 700), journalY);
      await motion.waitForTimeout(200);
      assert(await motion.evaluate(() => window.__researcher.progress()) < end, 'Journal reverses with scroll');
      await motion.close();
      const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 720, height: 500 } });
      await page.goto(url);
      assert(await page.locator('#first-step').isVisible());
      assert(await page.locator('#thinking h3').first().isVisible());
      assert(await page.getByRole('link', { name: 'Discuss a decision', exact: true }).isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.close();
    }
    fs.writeFileSync(path.join(out, `${stage}-metrics.json`), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results.map(({typography, ...metrics}) => metrics)));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
