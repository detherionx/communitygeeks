export const clamp=v=>Math.max(0,Math.min(1,v));
export function fieldState(progress,comparison=null){const p=clamp(progress);if(comparison!==null)return {phase:3,diagnosis:0,pilot:0,change:clamp(comparison)};return {phase:p<.28?0:p<.53?1:p<.78?2:3,diagnosis:Math.sin(Math.PI*clamp((p-.2)/.45)),pilot:clamp((p-.5)/.14)*(1-clamp((p-.82)/.18)),change:clamp((p-.73)/.27)};}
const section=typeof document==='undefined'?null:document.querySelector('.intent-section');
if(section)start();
async function start(){
 const host=section.querySelector('.intent-canvas'),pin=section.querySelector('.intent-pin'),range=section.querySelector('input'),buttons=[...section.querySelectorAll('[data-intent]')],pause=section.querySelector('.intent-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:760px)');
 let progress=0,comparison=null,manual=null,visible=false,paused=false,frame=0,last=0,time=0,current=0,lastPhase=-1,lastView=-1,draw=()=>{};
 const notes=[...section.querySelectorAll('.intent-note')],leaders=section.querySelector('.intent-leaders');let hasBuilt=false,shotTime=0;leaders.innerHTML='<g><path/><circle r="2"/></g>'.repeat(3);const leaderNodes=[...leaders.children];
 const shots=[
  [{title:'They start the journey.',detail:'Developers sign up and try to build.',anchor:[-4,.5,0],offset:[-100,110]}, {title:'Then they get stuck.',detail:'Too few reach a working integration.',anchor:[.2,-.4,0],offset:[40,100]}],
  [{phase:'01 / Research',title:'Find what pulls them off course.',detail:'Investigate the gap between signup and first integration.',anchor:[-1,.1,0],offset:[-120,125]}],
  [{phase:'02 / Pilot',title:'Try a supported route.',detail:'A small group tests clearer setup and hands-on support.',anchor:[.2,.6,-2.3],offset:[-80,-110]}, {title:'The original problem remains.',anchor:[.2,-.4,0],offset:[10,130]}],
  [{phase:'03 / Recommendation',title:'Give your team a route forward.',detail:'Evidence, priorities and a plan. Your team decides what to implement.',anchor:[4,.5,-.4],offset:[-180,110]}]
 ];
 function describe(p){const state=fieldState(p,comparison),view=comparison===null?state.phase:(state.change<.5?0:3);if(lastPhase!==state.phase){lastPhase=state.phase;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===state.phase)));if(state.phase===3)hasBuilt=true;section.querySelector('.intent-compare').hidden=!hasBuilt;}if(lastView!==view){lastView=view;section.dataset.shot=view;const entries=shots[view];notes.forEach((note,i)=>{const entry=entries[i];note.hidden=!entry;if(entry){note.querySelector('small').textContent=entry.phase||'';note.querySelector('h3').textContent=entry.title;note.querySelector('p').textContent=entry.detail||'';}});section.querySelector('.intent-announcement').textContent=entries.map(e=>[e.phase,e.title,e.detail].filter(Boolean).join(' ')).join(' ');}range.value=state.change*100;}
 function annotate(field){const w=pin.clientWidth,h=pin.clientHeight,small=phone.matches,entries=shots[lastView];entries.forEach((entry,i)=>{const [ax,ay]=field.project(entry.anchor),note=notes[i];let x=ax*w+entry.offset[0],y=ay*h+entry.offset[1];
 if(small){x=i===0?24:(i===1?Math.max(24,w-190):24);y=h*([lastView===0?.34:.61,.34,.47][i]);if(lastView===0&&i===1)y=h*.61;}
 const width=note.offsetWidth,height=note.offsetHeight;x=Math.max(24,Math.min(w-width-24,x));y=Math.max(small?h*.29:100,Math.min(h-height-(small?160:135),y));note.style.transform=`translate(${x}px,${y}px)`;
 const ex=Math.max(x,Math.min(x+width,ax*w)),ey=ay*h<y?y:y+Math.min(height,18);const group=leaderNodes[i];group.children[0].setAttribute('d',`M${ax*w},${ay*h} L${ex},${ey}`);group.children[1].setAttribute('cx',ax*w);group.children[1].setAttribute('cy',ay*h);});leaderNodes.forEach((g,i)=>g.style.display=i<entries.length?"":"none");}
 function onScroll(){const b=section.getBoundingClientRect();progress=reduced.matches?0:clamp((60-b.top)/Math.max(1,section.offsetHeight-pin.offsetHeight));if(!frame)render();}
 function render(now=performance.now()){frame=0;const elapsed=last?Math.max(0,(now-last)/1000):0,dt=Math.min(.5,elapsed);last=now;const p=manual??progress;current+=(p-current)*(reduced.matches||paused?1:1-Math.exp(-7*(elapsed||1/60)));const phase=fieldState(current).phase;if(phase!==lastPhase)shotTime=0;if(!reduced.matches&&!paused){shotTime+=dt;time+=dt*[2.4,.012,.22,1.5][phase];}describe(current);draw(current,time);if(visible&&!document.hidden&&!paused&&!reduced.matches)frame=requestAnimationFrame(render);}
 function wake(){cancelAnimationFrame(frame);frame=0;last=0;render();}
 buttons.forEach(b=>b.addEventListener('click',()=>{manual=+b.dataset.intent;comparison=null;wake();}));
 range.addEventListener('input',()=>{comparison=+range.value/100;manual=.8+comparison*.2;wake();});
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Resume motion':'Pause motion';pause.setAttribute('aria-pressed',String(paused));wake();});
 const release=e=>{if(e.target.closest("input,button"))return;if(!reduced.matches){manual=null;comparison=null;}};
 window.addEventListener('wheel',release,{passive:true});window.addEventListener('touchmove',release,{passive:true});window.addEventListener('keydown',e=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp'].includes(e.key)&&!e.target.closest('input,button,textarea,select'))release(e);});
 window.addEventListener('scroll',onScroll,{passive:true});document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;wake();}).observe(pin);
 await new Promise(resolve=>{const observer=new IntersectionObserver(es=>{if(es[0].isIntersecting){observer.disconnect();resolve();}},{rootMargin:"400px"});observer.observe(pin);});
 let field;try{const [T,{makeJourneyDiorama}]=await Promise.all([import('../vendor/three/three.module.min.js'),import('./journey-diorama.mjs')]);field=makeJourneyDiorama(T,host);}catch{paused=true;pause.hidden=true;section.classList.add('intent-fallback');wake();return;}
 const {renderer,camera}=field;
 const pointers=field.pointer;let dragging=false;
 pin.addEventListener('pointermove',e=>{const b=pin.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;pointers.set((x-.5)*12+camera.position.x,(.5-y)*8);if(dragging){comparison=clamp(x);manual=.8+comparison*.2;wake();}},{passive:true});
 pin.addEventListener('pointerdown',e=>{if(hasBuilt&&e.target===renderer.domElement&&e.pointerType==='mouse'){dragging=true;pin.setPointerCapture(e.pointerId);}});pin.addEventListener('pointerup',()=>dragging=false);pin.addEventListener('pointercancel',()=>dragging=false);pin.addEventListener('pointerleave',()=>{pointers.set(99,99);});
 function resize(){field.resize(pin.clientWidth,pin.clientHeight,phone.matches);wake();}
 draw=(p,t)=>{field.draw(fieldState(p,comparison),reduced.matches?11:t,p,reduced.matches||paused?6:shotTime);annotate(field);};
 new ResizeObserver(resize).observe(pin);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;draw=()=>{};pause.hidden=true;section.classList.remove('intent-ready');section.classList.add("intent-fallback");wake();});section.classList.add('intent-ready');onScroll();resize();
}
