const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const names = ['walk', 'walk-flipped', 'wait', 'carry', 'inspect', 'handoff', 'connect', 'connect-flipped', 'compare', 'compare-flipped'];
const folder = 'src/assets/images/crew-rear-projection/';

test('every current pose has a matching self-contained SVG and handoff image', () => {
  const manifest = JSON.parse(read(folder + 'manifest.json'));
  assert.equal(manifest.version, '2026-09-28-rear-projection');
  assert.deepEqual(manifest.assets.map(a => a.name).sort(), [...names].sort());
  for (const name of names) {
    const svg = read(folder + name + '.svg').toString();
    const match = svg.match(/href="data:image\/png;base64,([^"]+)"/);
    assert.ok(match, name);
    assert.doesNotMatch(svg, /<script|<foreignObject|href="https?:/i);
    assert.ok(Buffer.from(match[1], 'base64').equals(read('handoff/communitygeeks-rear-projection/poses/source-png/' + name + '.png')), name);
    assert.ok(read(folder + name + '.webp').equals(read('handoff/communitygeeks-rear-projection/poses/webp/' + name + '.webp')), name);
  }
});

test('built homepage preserves current crew and the approved hero scene', () => {
  const html = read('_site/index.html').toString();
  const images = [...html.matchAll(/<image class="crew-render"[^>]*href="([^"]+)"/g)];
  assert.ok(images.length > 0);
  assert.equal(images.length, [...html.matchAll(/data-crew-motion/g)].length);
  for (const [, url] of images) {
    assert.match(url, /^\/assets\/images\/crew-rear-projection\/[a-z-]+\.webp$/);
    assert.ok(read('_site' + url).equals(read('src' + url)), url);
  }
  const macro = read('src/_includes/partials/participation-scenes.njk').toString().split('{% endmacro %}')[0];
  assert.doesNotMatch(macro, /scale\(-1/);
  const scene = '/assets/images/hero-scenes/briefing-crew-v2.png';
  assert.ok(html.includes(scene));
  assert.ok(read('_site' + scene).equals(read('src' + scene)));
  assert.doesNotMatch(read('src/_includes/partials/hero-refit.njk').toString(), /scale(?:X)?\(-1/);
});

test('local HTTP preview serves current image bytes', {skip: !process.env.CHECK_LIVE_CREW}, async () => {
  const response = await fetch('http://127.0.0.1:8081/');
  assert.equal(response.status, 200);
  const html = await response.text();
  const urls = [...new Set([...html.matchAll(/<image class="crew-render"[^>]*href="([^"]+)"/g)].map(m => m[1]))];
  assert.ok(urls.length > 0);
  for (const url of urls) {
    assert.match(url, /^\/assets\/images\/crew-rear-projection\//);
    const image = await fetch('http://127.0.0.1:8081' + url);
    assert.equal(image.status, 200, url);
    assert.ok(Buffer.from(await image.arrayBuffer()).equals(read('src' + url)), url);
  }
});
