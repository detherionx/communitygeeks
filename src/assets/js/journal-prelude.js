/* Shared reversible scroll sequence: history skim, settle, then write. */
(() => {
  async function boot() {
    const svg = document.querySelector('#researcher-scene');
    if (!svg || !window.CGResearcher) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    // Freeze the chosen family before measuring ink. No late font swap during playback.
    try { await Promise.race([Promise.all([document.fonts.load('400 10px "IBM Plex Mono"'), document.fonts.load('500 10px "IBM Plex Mono"')]), new Promise(resolve => setTimeout(resolve, 2500))]); } catch (_) {}
    const font = document.fonts.check('400 10px "IBM Plex Mono"') ? '"IBM Plex Mono"' : 'monospace';
    svg.style.setProperty('--journal-font', font);
    let data; try { data = JSON.parse(svg.dataset.journal); } catch (_) { data = {}; }
    const built = CGResearcher.scene(svg, {view:'full'}), journal = svg.querySelector('.journal');
    function size() { svg.setAttribute('viewBox', '40 285 690 540'); }
    size(); addEventListener('resize', size);
    const NS = 'http://www.w3.org/2000/svg';
    function node(tag, attrs, parent) { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v)); parent.append(e); return e; }
    const stash = document.createElement('div'); stash.className = 'journal-history'; stash.setAttribute('aria-hidden', 'true'); stash.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;'; stash.style.setProperty('--journal-font', font); document.body.append(stash);
    const history = (data.history || []).slice(-3);
    const snapshots = history.map((page, i) => {
      const s = node('svg', {id:'journal-past-' + i}, stash); s.dataset.journal = JSON.stringify({volume:data.volume,left:page,right:page});
      CGResearcher.scene(s, {view:'full'}).apply(1);
      const j = s.querySelector('.journal').cloneNode(true); j.removeAttribute('transform'); j.style.opacity = 1;
      j.querySelectorAll('[clip-path]').forEach(e => e.removeAttribute('clip-path')); return j;
    });
    const openingSvg = node('svg', {id:'journal-opening'}, stash);
    openingSvg.dataset.journal = JSON.stringify({volume:data.volume,left:null,right:history[0] || data.right});
    CGResearcher.scene(openingSvg, {view:'full'}).apply(1);
    const opening = openingSvg.querySelector('.journal').cloneNode(true); opening.removeAttribute('transform'); opening.style.opacity = 1;
    stash.remove();
    const defs = svg.querySelector('defs');
    node('rect', {x:2,y:-130,width:188,height:260}, node('clipPath', {id:'journal-right-leaf'}, defs));
    node('rect', {x:-190,y:-130,width:188,height:260}, node('clipPath', {id:'journal-left-leaf'}, defs));
    const overlay = node('g', {class:'journal-prelude'}, journal);
    function half(j, side, parent) { const g = node('g', {'clip-path':'url(#journal-' + side + '-leaf)'}, parent); g.append(j.cloneNode(true)); return g; }
    const ease = t => t*t*(3-2*t);
    function globalPoint(x,y) { const a = -7*Math.PI/180; return [380+x*Math.cos(a)-y*Math.sin(a),500+x*Math.sin(a)+y*Math.cos(a)]; }
    function grip(x,y) { const q=globalPoint(x,y), dx=q[0]-463.58, dy=q[1]-537.74; svg.querySelectorAll('.hand-write').forEach(e => { e.setAttribute('transform','translate('+dx+','+dy+')'); e.style.opacity=1; }); const pen=svg.querySelector('.pen');pen.setAttribute('transform','translate('+(442+dx)+','+(512+dy-10)+') rotate(28)');pen.style.opacity=1; }
    function turn(k,t) {
      overlay.replaceChildren(); half(k ? snapshots[k-1] : opening,'left',overlay); if(k<snapshots.length-1) half(snapshots[k+1],'right',overlay);
      const a=ease(t)*Math.PI,c=Math.cos(a),lift=Math.sin(a)*22;
      const moving=node('g',{transform:'matrix('+c+' '+(-Math.sin(a)*.09)+' 0 1 0 0)'},overlay);
      if(c>=0) half(snapshots[k],'right',moving); else half(snapshots[k],'left',node('g',{transform:'scale(-1,1)'},moving));
      node('rect',{x:2,y:-130,width:188,height:260,fill:'#1f4b4c',opacity:Math.sin(a)*.16},moving);grip(184*c,100-lift);
    }
    const skimEnd = snapshots.length ? 450 + snapshots.length*500 : 0, settleEnd=skimEnd+(snapshots.length?300:0), duration=settleEnd+5600;
    function render(ms) {
      built.apply(.30); overlay.replaceChildren();
      if(snapshots.length && ms<450) turn(0,0);
      else if(ms<skimEnd) { const t=(ms-450)/500;turn(Math.min(snapshots.length-1,Math.floor(t)),t%1); }
      else if(ms<settleEnd) {
        const u=ease((ms-skimEnd)/300), start=globalPoint(-184,100),end=globalPoint(32,-86),x=start[0]+(end[0]-start[0])*u,y=start[1]+(end[1]-start[1])*u-30*Math.sin(Math.PI*u),dx=x-442,dy=y-512;
        svg.querySelectorAll('.hand-write').forEach(e=>e.setAttribute('transform','translate('+dx+','+dy+')'));svg.querySelector('.pen').setAttribute('transform','translate('+x+','+y+') rotate('+(28+27*u)+')');
      } else built.apply(.3+.7*Math.min(1,(ms-settleEnd)/5600));
    }
    let frame, current=0;
    function update() {
      frame=null;
      // Begin when the paper is in view, not when its enclosing SVG enters.
      const paperBottom=new DOMPoint(380,650).matrixTransform(svg.getScreenCTM()).y;
      current=motion.matches ? 1 : Math.max(0,Math.min(1,(innerHeight*.95-paperBottom)/(innerHeight*.8)));
      // The skim occupies only the first fifth; all marks reverse with scroll.
      render(current<.2 ? current/.2*settleEnd : settleEnd+(current-.2)/.8*(duration-settleEnd));
    }
    function queue() { if(!frame) frame=requestAnimationFrame(update); }
    function finish() { render(duration); }
    addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);addEventListener('load',queue);
    motion.addEventListener('change',queue);new ResizeObserver(queue).observe(document.querySelector('#thinking'));update();
    // Explicit test hook; never invoked by carousel navigation.
    window.__journalPrelude={render,duration,finish};
    window.__researcher={apply:p=>{overlay.replaceChildren();built.apply(p);},progress:()=>current};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
