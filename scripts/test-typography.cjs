// Verify local fonts with external requests blocked, responsive type and service disclosure.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),output=path.resolve('../../outputs/typography-consolidated');fs.mkdirSync(output,{recursive:true});const evidence=[];
 try{
 for(const url of ['/','/about/'])for(const width of [390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const failed=[];page.on('requestfailed',r=>{if(r.url().includes('/assets/fonts/'))failed.push(r.url());});
  await page.route('**/*',route=>route.request().url().startsWith('http://localhost:8765/')?route.continue():route.abort());
  await page.goto('http://localhost:8765'+url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  assert.deepEqual(failed,[],'Local fonts must load');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${url} at ${width}: overflow`);
  const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');
  const selectors=url==='/'?{'.hero-h1 .h1-line>span':'Fraunces','.service-item':'Archivo','.service-number':'IBM Plex Mono'}:{'.deck-h1':'Fraunces','.principle p':'Archivo','.mod-label':'IBM Plex Mono'};
  const fonts=[];for(const [selector,family] of Object.entries(selectors)){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});const result=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});assert.ok(result.fonts.some(f=>f.isCustomFont&&f.familyName.includes(family)),`${selector}: actual ${family} font`);fonts.push({selector,...result});}
  if(url==='/'){
   assert.ok(await page.evaluate(()=>Math.max(...[...document.querySelectorAll('.service-deliverable')].map(e=>e.getBoundingClientRect().bottom))<=document.querySelector('.program-method').getBoundingClientRect().top),'Descriptions must end above footer');
   const headings=['.buy-section h2','.relationship-copy h2','.decision-heading h2','.cases-h2','.pt-h2','.close-h2'];
   const sizes=await page.evaluate(selectors=>selectors.map(s=>getComputedStyle(document.querySelector(s)).fontSize),headings);assert.equal(new Set(sizes).size,1,'Section headings share one scale');
   for(const item of await page.locator('.service-item').all()){await item.focus();const owner=Number(await item.getAttribute('data-owner'));assert.equal(await page.locator('.service-deliverable').nth(owner).textContent(),await item.getAttribute('aria-description'));}
  }
  if(width===1440||width===390){
   await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});
   await page.screenshot({path:path.join(output,(url==='/'?'home':'about')+'-'+width+'.png')});
   // Section captures exclude fixed navigation, which otherwise sits over arbitrary crop positions.
   await page.addStyleTag({content:'.bar{visibility:hidden}'});
   for(const selector of url==='/'?['#approach','.relationship-pin','#questions','#thinking']:['#how-we-think']){
    if(selector==='#approach')for(let i=0;i<3;i++)await page.locator('.program-column').nth(i).locator('.service-item').first().focus();
    await page.locator(selector).screenshot({path:path.join(output,selector.replace(/[.#]/g,'')+'-'+width+'.png')});
   }
  }
  evidence.push({url,width,fonts});await page.close();
 }
 // Deliberate fallback: content and service controls survive local font failure too.
 const fallback=await browser.newPage({viewport:{width:390,height:844}});await fallback.route('**/assets/fonts/**',r=>r.abort());await fallback.goto('http://localhost:8765/',{waitUntil:'domcontentloaded'});await fallback.evaluate(()=>document.fonts.ready);await fallback.locator('.service-item').last().click();assert.ok(await fallback.locator('.service-deliverable').last().textContent());assert.ok(await fallback.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await fallback.close();
 fs.writeFileSync(path.join(output,'font-verification.json'),JSON.stringify(evidence,null,2));console.log('PASS: actual local fonts with external network blocked; eight responsive views; shared heading scale; nine deliverables; fallback usability. '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
