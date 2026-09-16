// Read-only rendered typography inventory: node scripts/audit-typography.cjs
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const roles={
 '/':['.hero-readout','.hero-h1','.hero-sub','.kctl-label','.bar a','.network-label strong','.network-label span','.service-heading .kicker','.buy-section h2','.service-choice strong','.service-outcome','.service-item','.service-deliverable','.program-method h3','.program-method p','.method-sequence','.relationship-copy h2','.relationship-copy>p','.relationship-options button','.decision-heading h2','.decision-heading>p:last-child','.decision-domains button','.decision-problem','.decision-label','.decision-description','.decision-options button','.decision-foot p','.cases-h2','.cases-lead','.pt-h2','.pt-sub','.ledger-title','.ledger-deck','.research-launch h3','.research-launch-deck','.author-name','.author-bio','.close-h2','.close-sub','.foot-tag','.foot-legal'],
 '/about/':['.mod-label','.deck-h1','.deck-def','.portrait-caption','.founder-h2','.founder-role','.founder-bio','.founder-links','.think-h2','.think-intro','.p-idx','.principle h3','.principle p','.handoff-h2','.handoff-link','.foot-tag']};
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const result=[];try{
 for(const url of Object.keys(roles))for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await page.goto('http://localhost:8765'+url,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
 const data=await page.evaluate(selectors=>{
  const style=e=>{const s=getComputedStyle(e);return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,tracking:s.letterSpacing,color:s.color};};
  const rows=selectors.flatMap(selector=>{const e=document.querySelector(selector);if(!e)return[];return[{selector,text:e.textContent.trim().replace(/\s+/g,' ').slice(0,150),visible:e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}),...style(e)}];});
  const groups=new Map();const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const text=walker.currentNode.textContent.trim(),e=walker.currentNode.parentElement;if(!text||!e||e.namespaceURI!=='http://www.w3.org/1999/xhtml'||!e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||['SCRIPT','STYLE','NOSCRIPT'].includes(e.tagName))continue;const s=style(e),key=JSON.stringify(s);if(!groups.has(key))groups.set(key,{...s,count:0,examples:[]});const g=groups.get(key);g.count++;if(g.examples.length<3)g.examples.push(text.slice(0,75));}
  return{rows,combinations:[...groups.values()].sort((a,b)=>b.count-a.count)};
 },roles[url]);
 const fonts=[];const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');for(const selector of url==='/'?['.service-item','.service-choice strong','.hero-h1']:['.principle p','.mod-label']){const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});if(nodeId)fonts.push({selector,...await cdp.send('CSS.getPlatformFontsForNode',{nodeId})});}
 result.push({url,width,...data,fonts});await page.close();
 }
 const target=path.resolve('../../outputs/typography-inventory-2026-09-15.json');fs.writeFileSync(target,JSON.stringify(result,null,2));console.log(target);for(const r of result)console.log(r.url,r.width,r.combinations.length,'rendered style combinations');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
