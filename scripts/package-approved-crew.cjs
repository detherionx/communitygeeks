const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const names = ['walk', 'walk-flipped', 'wait', 'carry', 'inspect', 'handoff', 'connect', 'connect-flipped', 'compare', 'compare-flipped'];

async function main() {
  const sources = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
  assert.deepEqual(Object.keys(sources).sort(), [...names].sort(), 'Exactly ten reviewed poses required');
  const web = path.join(root, 'src/assets/images/crew-rear-projection');
  const handoff = path.join(root, 'handoff/communitygeeks-rear-projection/poses');
  for (const dir of [web, handoff, path.join(handoff, 'source-png'), path.join(handoff, 'webp')]) await fs.mkdir(dir, {recursive: true});
  const manifest = {version: '2026-09-28-rear-projection', svgFormat: 'Self-contained SVG with embedded raster PNG; not editable vector paths', assets: []};
  for (const name of names) {
    const png = await fs.readFile(sources[name]);
    const meta = await sharp(png).metadata();
    assert.equal(meta.format, 'png', name);
    assert.equal(meta.width, meta.height, name + ' square canvas');
    assert.ok(meta.hasAlpha, name + ' transparency');
    const stats = await sharp(png).stats();
    assert.equal(stats.channels.at(-1).min, 0, name + ' transparent pixels');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}" viewBox="0 0 ${meta.width} ${meta.height}" role="img"><title>Communitygeeks astronaut: ${name}</title><desc>Rear-projection identity. Embedded raster illustration, not editable vector paths.</desc><image width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${png.toString('base64')}"/></svg>\n`;
    const webp = await sharp(png).webp({lossless: true}).toBuffer();
    await fs.writeFile(path.join(handoff, 'source-png', name + '.png'), png);
    await fs.writeFile(path.join(handoff, name + '.svg'), svg);
    await fs.writeFile(path.join(web, name + '.svg'), svg);
    await fs.writeFile(path.join(web, name + '.webp'), webp);
    await fs.writeFile(path.join(handoff, 'webp', name + '.webp'), webp);
    manifest.assets.push({name, width: meta.width, height: meta.height, pngBytes: png.length, webpBytes: webp.length, svgBytes: Buffer.byteLength(svg), transparent: true, treatment: /^(connect|compare)/.test(name) ? 'Retained rear view: projection occluded by helmet shell' : 'Rear-origin internal face projection'});
  }
  await fs.writeFile(path.join(handoff, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await fs.writeFile(path.join(web, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({poses: names.length, webpBytes: manifest.assets.reduce((sum, a) => sum + a.webpBytes, 0), handoff}));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
