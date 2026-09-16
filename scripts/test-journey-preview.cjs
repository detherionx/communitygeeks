// Local integration check: node scripts/test-journey-preview.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:8765/',{waitUntil:'domcontentloaded'});await page.locator('#questions').scrollIntoViewIfNeeded();await page.waitForSelector('.intent-ready');
 for(let i=0;i<4;i++){await page.locator('[data-intent]').nth(i).click();assert.equal(await page.locator('#questions').getAttribute('data-shot'),String(i));assert.ok(await page.locator('.intent-announcement').textContent());}
 const slider=page.locator('#intent-compare');await slider.fill('0');assert.equal(await page.locator('#questions').getAttribute('data-shot'),'0');await slider.fill('100');assert.equal(await page.locator('#questions').getAttribute('data-shot'),'3');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);console.log('PASS: four scenes, reduced motion, comparison, mobile width, no browser errors.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
