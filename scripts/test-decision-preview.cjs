// Run against the local server: node scripts/test-decision-preview.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:8765/?preview=decisions-1#questions',{waitUntil:'domcontentloaded'});await p.locator('#questions').scrollIntoViewIfNeeded();await p.waitForSelector('.decision-ready');
 assert.equal(await p.locator('[data-intent]').count(),0);assert.equal(await p.locator('button[data-domain]').count(),3);
 for(let i=0;i<3;i++){
  await p.locator('button[data-domain]').nth(i).click();assert.equal(await p.locator('#questions').getAttribute('data-option'),'-1');
  await p.locator('#questions').screenshot({path:path.resolve('../../outputs/advisory-preview/decision-'+i+'.png')});
  for(let j=0;j<2;j++){await p.locator('button[data-option]').nth(j).click();assert.equal(await p.locator('.decision-label').textContent(),'An option to assess');assert.ok((await p.locator('.decision-description').textContent()).length>30);}
  await p.locator('.decision-reset').click();assert.equal(await p.locator('.decision-label').textContent(),"What we'd look at");
 }
 await p.locator('[data-step="1"]').click();assert.equal(await p.locator('#questions').getAttribute('data-domain'),'0');await p.locator('[data-step="-1"]').click();assert.equal(await p.locator('#questions').getAttribute('data-domain'),'2');
 await p.locator('button[data-domain]').last().focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#questions').getAttribute('data-domain'),'0');
 await p.setViewportSize({width:390,height:844});await p.locator('button[data-option]').first().click();await p.locator('#questions').screenshot({path:path.resolve('../../outputs/advisory-preview/decision-mobile.png')});
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.locator('.decision-reset').click();await p.emulateMedia({reducedMotion:'no-preference'});await p.addStyleTag({content:'.bar{visibility:hidden}html{scroll-behavior:auto!important}'});const canvas=p.locator('.decision-stage canvas');await canvas.scrollIntoViewIfNeeded();const moving=await canvas.screenshot();await p.waitForTimeout(700);assert.notDeepEqual(await canvas.screenshot(),moving,'Scene moves without input');await p.locator('.decision-pause').click();await canvas.scrollIntoViewIfNeeded();await p.waitForTimeout(150);const stopped=await canvas.screenshot();await p.waitForTimeout(400);assert.ok((await canvas.screenshot()).equals(stopped),'Pause holds the scene still');
 const touch=await p.context().newCDPSession(p);await touch.send('Emulation.setTouchEmulationEnabled',{enabled:true});await canvas.scrollIntoViewIfNeeded();const rect=await canvas.boundingBox(),y=rect.y+rect.height/2;
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width*.8,y}]});
 for(let i=1;i<=5;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:rect.x+rect.width*(.8-.12*i),y}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await p.locator('#questions').getAttribute('data-domain'),'1','Swipe advances the scene');
 assert.deepEqual(errors,[]);console.log('PASS: domains, options, circular arrows, touch swipe, keyboard, reduced motion, mobile, ambient motion and pause.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
