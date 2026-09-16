// Run against the local preview: node scripts/test-advisory-preview.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const output=path.resolve(process.env.AUDIT_SCREENSHOTS||'../../outputs/advisory-preview');fs.mkdirSync(output,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await page.goto('http://localhost:8765/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(output,'hero.png')});
  const items=page.locator('.service-item');assert.equal(await items.count(),9);
  for(let i=0;i<3;i++){const column=page.locator('.program-column').nth(i);assert.equal(await column.locator('.service-item[aria-pressed="true"]').count(),1);assert.equal(await column.locator('.service-deliverable').textContent(),await column.locator('.service-item').first().getAttribute('aria-description'));}
  for(let i=0;i<9;i++){
   const item=items.nth(i);await item.focus();
   const owner=Number(await item.getAttribute('data-owner'));
   assert.equal(await page.locator('.service-deliverable').nth(owner).textContent(),await item.getAttribute('aria-description'));
  }
  await items.first().hover();await page.locator('#approach').screenshot({path:path.join(output,'services.png')});
  for(const [url,name] of [['/about/','about'],['/','mobile-home']]){
   await page.setViewportSize({width:name==='about'?1440:390,height:1000});
   await page.goto('http://localhost:8765'+url,{waitUntil:'domcontentloaded'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
   if(name==='about')await page.locator('#how-we-think').screenshot({path:path.join(output,'about-principles.png')});
   else {await page.locator('.service-item').first().click();assert.ok(await page.locator('.service-deliverable').first().textContent());await page.locator('.program-column').first().screenshot({path:path.join(output,'mobile-service.png')});}
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto('http://localhost:8765/og-cards/site/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.locator('.og-site').screenshot({path:path.resolve('_site/assets/images/communitygeeks-2-og-2026.png')});
  console.log('PASS: nine service details, keyboard/hover/click, responsive overflow, local social preview. Screenshots: '+output);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
