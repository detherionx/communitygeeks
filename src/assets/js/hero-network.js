import {worlds,anchors,story,smooth,shouldAnimate,heroScrollAngle} from './network-model.mjs?v=scroll-2';

import {focusContent,focusPhase,nextFocus,trackHero} from './orb-interaction.mjs?v=advisory-1';

const figure=document.querySelector('[data-network]');
if(figure) boot(figure);
async function boot(figure){
 const map=figure.querySelector('.network-map'),button=figure.querySelector('.network-toggle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 600px)'),pointer=matchMedia('(pointer: fine)');
 let visible=false,paused=false,lost=false,frame=0,last=0,elapsed=0,width=1,height=1;
 let selected=null,hovered=null,focusStart=0,focusOpened=0,duration=0,frameDelta=1/60,renderUpdate=()=>{};
 const panel=figure.querySelector('.orb-explanation'),back=figure.querySelector('.orb-back'),title=figure.querySelector('#orb-focus-title');
 const controls=[...figure.querySelectorAll('[data-orb]')];
 function finishDuration(){if(!selected)return;if(focusOpened)duration+=performance.now()-focusOpened;trackHero('hero_orb_focus_duration',{ecosystem:selected,duration_seconds:Math.round(duration/1000)});duration=0;focusOpened=0;}
 function select(requested){
  if(requested!==null&&!Object.hasOwn(focusContent,requested))return;
  const previous=selected,next=requested===null?null:nextFocus(selected,requested);finishDuration();selected=next;focusStart=elapsed;focusOpened=selected&&!document.hidden?performance.now():0;
  figure.classList.toggle('is-focused',!!selected);figure.dataset.focus=selected||'';panel.hidden=back.hidden=!selected;
  controls.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.orb===selected)));
  if(selected){const content=focusContent[selected];figure.querySelector('.orb-focus-eyebrow').textContent=content.label;title.textContent=content.headline;
   const steps=figure.querySelector('.orb-steps');steps.replaceChildren(...content.steps.map(([label,text])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=text;row.append(dt,dd);return row;}));
   trackHero('hero_orb_focus',{ecosystem:selected});if(previous)trackHero('hero_orb_switch',{ecosystem:selected,from:previous});if(selected==='team')trackHero('hero_system_view',{ecosystem:'team'});
  }else trackHero('hero_system_view',{ecosystem:previous||'team'});
  renderUpdate();if(mobile.matches)map.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
 }
 function hover(name){if(hovered===name)return;hovered=name;controls.forEach(b=>b.classList.toggle('is-hovered',b.dataset.orb===name));if(name)trackHero('hero_orb_hover',{ecosystem:name});renderUpdate();}
 controls.forEach(b=>{const name=b.dataset.orb;const hint=document.createElement('em');hint.textContent=focusContent[name].hint;b.append(hint);b.addEventListener('click',()=>select(name));b.addEventListener('pointerenter',()=>{if(pointer.matches&&!mobile.matches)hover(name);});b.addEventListener('pointerleave',()=>hover(null));b.addEventListener('focus',()=>hover(name));b.addEventListener('blur',()=>hover(null));});
 back.addEventListener('click',()=>{const prior=selected;select(null);controls.find(b=>b.dataset.orb===prior)?.focus({preventScroll:true});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected){e.preventDefault();back.click();}});
 map.addEventListener('click',e=>{if(e.target===map||e.target.tagName==='CANVAS')if(selected)select(null);});
 figure.querySelector('.orb-focus-cta').addEventListener('click',()=>trackHero('hero_focus_cta_click',{ecosystem:selected}));
 document.addEventListener('visibilitychange',()=>{if(!selected)return;if(document.hidden&&focusOpened){duration+=performance.now()-focusOpened;focusOpened=0;}else if(!document.hidden)focusOpened=performance.now();});
 window.addEventListener('pagehide',finishDuration);
 // The static artwork and semantic labels remain available if WebGL or loading fails.
 let T,renderer;
 try{
  T=await import('../vendor/three/three.module.min.js');
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 }catch{ return; }
 renderer.setClearColor(0x000000,0);
 renderer.domElement.setAttribute('aria-hidden','true');
 map.prepend(renderer.domElement);


 const {makeOrb}=await import('./celestial-orb.mjs?v=focus-2');
 const scene=new T.Scene(),world=new T.Group();scene.add(world);
 // Rotate the installation about the three worlds' visual mass, preserving their authored coordinates.
 const pivot=new T.Vector3(),rotatedPivot=new T.Vector3();let totalMass=0;
 Object.values(worlds).forEach(o=>{const mass=o.radius*o.radius;pivot.addScaledVector(new T.Vector3(...o.position),mass);totalMass+=mass;});pivot.divideScalar(totalMass);
 const camera=new T.PerspectiveCamera(39,1,.1,60),vector=p=>new T.Vector3(...p);
 const orbs=Object.entries(worlds).map(([name,config],kind)=>{const orb=makeOrb(T,{radius:config.radius,kind,mobile:mobile.matches});orb.group.position.copy(vector(config.position));world.add(orb.group);return orb;});
 const {makeCraft}=await import('./observatory-craft.mjs?v=signature-2');
 const craft=makeCraft(T),beacon=craft.group;beacon.position.set(-.6,-.35,.5);world.add(beacon);
 const instrumentLight=new T.DirectionalLight(0xf6f0dc,3);instrumentLight.position.set(-3,4,7);scene.add(instrumentLight,new T.HemisphereLight(0xb6d6c8,0x142b30,1.8));
 const worldLights=orbs.map(()=>{const light=new T.PointLight(0xc3e5d5,.85,7,2);world.add(light);return light;});
 let discoveryStart=-100,discovered=false;
 const craftHit=document.createElement('div');craftHit.className='orb-hit craft-hit';craftHit.setAttribute('aria-hidden','true');map.append(craftHit);
 craftHit.addEventListener('click',()=>select('team'));craftHit.addEventListener('pointerenter',()=>{if(pointer.matches&&!mobile.matches)hover('team');});craftHit.addEventListener('pointerleave',()=>hover(null));
 const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;const ctx=haloCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(232,115,90,.8)');gradient.addColorStop(.18,'rgba(232,115,90,.2)');gradient.addColorStop(1,'rgba(232,115,90,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(haloCanvas),transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:.45}));halo.position.copy(beacon.position);halo.scale.setScalar(.65);world.add(halo);
 function route(points){const curve=new T.CatmullRomCurve3(points),g=new T.BufferGeometry().setFromPoints(curve.getPoints(90)),trail=new T.Line(g,new T.LineBasicMaterial({color:0xede5d3,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false})),head=new T.Mesh(new T.SphereGeometry(.022,8,6),new T.MeshBasicMaterial({color:0xf6f4ef}));world.add(trail,head);return {curve,trail,head};}
 const origin=vector([-.8,.6,-.3]),destination=vector([.8,.3,.5]);
 const incoming=route([origin,vector([-1,.15,1]),beacon.position]);
 const outgoing=route([beacon.position,vector([.3,-.15,1.7]),destination]);
 const receivedSignals=Array.from({length:4},()=>{const dot=new T.Mesh(new T.SphereGeometry(.023,8,6),new T.MeshBasicMaterial({color:0xdcebdd}));world.add(dot);return dot;});
 const returning=route([destination,vector([.15,1.5,1.2]),origin]);
 const systemRoutes=orbs.map(()=>route([new T.Vector3(),new T.Vector3(),new T.Vector3()]));
 const labels=Object.entries(anchors).map(([name,p])=>({el:figure.querySelector('.label-'+name),point:vector(p)}));
 const decisionLabel=document.createElement('div');decisionLabel.className='orb-decision';decisionLabel.innerHTML='<strong>Your team</strong><span>Understand → decide → act</span>';decisionLabel.hidden=true;map.append(decisionLabel);
 const names=Object.keys(worlds),focusClock={phase:-1};
 const hits=names.map(name=>{const hit=document.createElement('div');hit.className='orb-hit';hit.setAttribute('aria-hidden','true');hit.addEventListener('click',()=>select(name));hit.addEventListener('pointerenter',()=>{if(pointer.matches&&!mobile.matches)hover(name);});hit.addEventListener('pointerleave',()=>hover(null));map.append(hit);return hit;});
 const projected=new T.Vector3(),edgePoint=new T.Vector3(),target={x:0,y:0},current={x:0,y:0};
 const viewCenter=new T.Vector3(),viewPosition=new T.Vector3(0,.12,11.2),goalCenter=new T.Vector3(),goalPosition=new T.Vector3(),beaconGoal=new T.Vector3();
 const gains=[0,0,0];
 let scrollDepth=0;
 const readScroll=()=>{scrollDepth=Math.min(1,Math.max(0,-figure.closest('.hero').getBoundingClientRect().top/figure.closest('.hero').offsetHeight));};
 window.addEventListener('scroll',readScroll,{passive:true});readScroll();
 const focusIncoming=route([new T.Vector3(),new T.Vector3(),new T.Vector3()]),focusOutgoing=route([new T.Vector3(),new T.Vector3(),new T.Vector3()]);
 const focusReach=route([new T.Vector3(),new T.Vector3(),new T.Vector3()]);
 function placeRoute(r,start,end,bend){r.curve.points[0].copy(start);r.curve.points[1].copy(start).lerp(end,.5).add(bend);r.curve.points[2].copy(end);const p=r.trail.geometry.attributes.position;for(let i=0;i<=90;i++){r.curve.getPoint(i/90,edgePoint);p.setXYZ(i,edgePoint.x,edgePoint.y,edgePoint.z);}p.needsUpdate=true;}

 function resize(){width=map.clientWidth;height=map.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1.25:1.75));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();orbs.forEach(o=>o.resize(height,renderer.getPixelRatio()));draw();}
 function animateRoute(r,p,active){r.head.visible=r.trail.visible=active;if(active){r.curve.getPoint(p,r.head.position);const end=Math.floor(p*90);r.trail.geometry.setDrawRange(Math.max(0,end-8),Math.min(9,end+1));}}
 function draw(){const still=reduced.matches,s=story(elapsed,still),t=still?17:elapsed,local=still?10:elapsed-focusStart,phase=focusPhase(local),index=names.indexOf(selected),focus=index>=0;
 current.x+=(target.x-current.x)*.045;current.y+=(target.y-current.y)*.045;
 const angleGoal=heroScrollAngle(selected?0:scrollDepth,still);
 if(still)world.rotation.y=0;else if(!paused)world.rotation.y+=(angleGoal-world.rotation.y)*(1-Math.exp(-frameDelta/.32));
 rotatedPivot.copy(pivot).applyQuaternion(world.quaternion);world.position.copy(pivot).sub(rotatedPivot);world.updateMatrixWorld(true);
 goalCenter.set(0,0,0);goalPosition.set(still?0:Math.sin(t*.06)*.3+current.x,.12+(still?0:current.y),10.4+(still?0:(1-smooth(0,2.5,t))*.8));
 if(selected==='team'){goalCenter.set(2,0,0);goalPosition.set(2,.12,14);}
 if(focus){const base=vector(worlds[selected].position),distance=mobile.matches?worlds[selected].radius*8.8:worlds[selected].radius*5.4;
  goalCenter.copy(base).add(new T.Vector3(mobile.matches?0:worlds[selected].radius*.95,mobile.matches?-distance*.354*(1-320/height):-.4,0));
  goalPosition.copy(goalCenter).add(new T.Vector3(still?0:current.x*.35,still?0:current.y*.35,distance));
 }
 const instant=still||paused,cameraBlend=instant?1:1-Math.exp(-frameDelta/.28);viewCenter.lerp(goalCenter,cameraBlend);viewPosition.lerp(goalPosition,cameraBlend);camera.position.copy(viewPosition);camera.lookAt(viewCenter);camera.updateMatrixWorld();
 orbs.forEach((orb,i)=>{const active=names[i]===selected;orb.group.visible=!(mobile.matches&&focus&&!active);orb.setDetail(active);const wanted=hovered===names[i]&&!selected?1:0;gains[i]+=(wanted-gains[i])*(instant?1:.09);
  orb.group.position.copy(vector(worlds[names[i]].position));orb.group.position.z+=gains[i]*.3;
  const scale=selected==='team'?(mobile.matches?.52:.7):focus&&!active?.24:1+gains[i]*.025;orb.group.scale.lerp(new T.Vector3(scale,scale,scale),cameraBlend);
  if(focus&&!active){const order=i<index?i:i-1;orb.group.position.z=worlds[selected].position[2]-3;const d=goalPosition.z-orb.group.position.z,half=d*Math.tan(39*Math.PI/360);orb.group.position.x=viewCenter.x+(order===0?-.68:.25)*half*camera.aspect;orb.group.position.y=viewCenter.y-half*.67;}
  if(selected==='team'){const d=goalPosition.z-orb.group.position.z,half=d*Math.tan(39*Math.PI/360),x=(mobile.matches?[.22,.72,.54]:[.16,.36,.24])[i],y=(mobile.matches?[.10,.19,.28]:[.26,.49,.75])[i];orb.group.position.x=viewCenter.x+(x*2-1)*half*camera.aspect;orb.group.position.y=viewCenter.y+(1-y*2)*half;}
  worldLights[i].position.copy(orb.group.position);
  orb.update(t+i*12,active?phase===0?.5:phase===2?1:.1:i===0?s.signal+s.outcome*.5:i===1?s.integration:.08);
  if(active){orb.volume.rotation.x=still?0:current.y*.15;orb.figures.rotation.y+=(still?0:current.x*.12);const branch=orb.strokes[1];branch.geometry.setDrawRange(0,phase===2?5:3);branch.material.opacity=phase===0?.25:phase===1?.4:.85;}else{orb.strokes[1].geometry.setDrawRange(0,5);orb.strokes[1].material.opacity=.4;}
  orb.setEmphasis(focus&&!active?.28:1+gains[i]*.2);
  orb.group.updateMatrixWorld();projected.copy(orb.group.position).applyMatrix4(world.matrixWorld).project(camera);edgePoint.copy(orb.group.position);edgePoint.x+=worlds[names[i]].radius*orb.group.scale.x;edgePoint.applyMatrix4(world.matrixWorld).project(camera);const diameter=Math.abs(edgePoint.x-projected.x)*width;
  hits[i].style.left=(projected.x*.5+.5)*100+'%';hits[i].style.top=(-projected.y*.5+.5)*100+'%';hits[i].style.width=hits[i].style.height=Math.max(44,diameter)+'px';hits[i].style.pointerEvents='auto';hits[i].style.display=orb.group.visible?'block':'none';
 });
 beaconGoal.set(-.6,-.35,.5);
 const watched=names.includes(hovered)?hovered:focus?selected:(!still&&s.t>=3&&s.t<8?'customers':'developers');
 const attentionPoint=orbs[names.indexOf(watched)].group.position;
 if(!selected&&!still){const approach=names.includes(hovered)?.12:smooth(4,7,s.t)*(1-smooth(12,18,s.t))*.17;beaconGoal.lerp(attentionPoint,approach);beaconGoal.x+=Math.sin(t*.34)*.035;beaconGoal.y+=Math.sin(t*.27)*.045;}
 if(hovered==='team')beaconGoal.z+=.25;
 if(selected==='team'){const half=goalPosition.z*Math.tan(39*Math.PI/360);beaconGoal.set(viewCenter.x+(mobile.matches?-.45:-.04)*half*camera.aspect,viewCenter.y+(mobile.matches?.52:-.3)*half,.5);}
 if(focus){const d=goalPosition.z-worlds[selected].position[2],half=d*Math.tan(39*Math.PI/360);beaconGoal.set(viewCenter.x+half*camera.aspect*(mobile.matches?.35:-.22),viewCenter.y+half*(mobile.matches?.4:-.28),worlds[selected].position[2]+.7);}
 beacon.position.lerp(beaconGoal,cameraBlend);
 const distance=camera.position.distanceTo(projected.copy(beacon.position).applyMatrix4(world.matrixWorld)),craftPixels=mobile.matches?62:88;
 const craftScale=(craftPixels*(hovered==='team'?1.12:1))*2*distance*Math.tan(39*Math.PI/360)/(height*craft.span);
 beacon.scale.lerp(new T.Vector3(craftScale,craftScale,craftScale),cameraBlend);
 const angle=!selected&&!hovered&&(s.t<3||s.t>16)?1.05:Math.atan2(attentionPoint.y-beacon.position.y,attentionPoint.x-beacon.position.x);
 if(hovered==='team'&&!discovered){discovered=true;discoveryStart=t;}
 const discovery=still?0:Math.sin(Math.PI*Math.min(1,Math.max(0,(t-discoveryStart)/.9)));
 craft.update({time:t,angle,attention:hovered==='team'?1:0,pulse:focus&&phase===1?1:s.decision+s.signal*.35,still:instant,blend:cameraBlend*.55,scroll:scrollDepth,pointer:current.x,discovery});
 halo.position.copy(beacon.position);halo.scale.setScalar(craftScale*.48);halo.material.opacity=.4+(focus&&phase===1?.3:s.decision*.35);
 projected.copy(beacon.position).applyMatrix4(world.matrixWorld).project(camera);const craftX=(projected.x*.5+.5)*100,craftY=(-projected.y*.5+.5)*100;
 craftHit.style.left=craftX+'%';craftHit.style.top=craftY+'%';craftHit.style.width=craftHit.style.height=(mobile.matches?82:108)+'px';
 decisionLabel.hidden=!selected||selected==='team';decisionLabel.style.left=craftX+'%';decisionLabel.style.top=`calc(${craftY}% + ${craftPixels*.45}px)`;
 placeRoute(incoming,origin,beacon.position,new T.Vector3(-.2,.2,.6));placeRoute(outgoing,beacon.position,destination,new T.Vector3(.2,-.1,.8));
 animateRoute(incoming,s.incoming,!selected&&!still&&s.t>=5&&s.t<7);animateRoute(outgoing,s.outgoing,!selected&&!still&&s.t>=8&&s.t<11);animateRoute(returning,s.returning,!selected&&!still&&s.t>=12&&s.t<15);
 systemRoutes.forEach((r,i)=>{r.head.visible=false;r.trail.visible=selected==='team';if(selected==='team'){placeRoute(r,beacon.position,orbs[i].group.position,new T.Vector3(0,.2,.5));r.trail.material.opacity=.12;}});
 if(selected==='team'){placeRoute(focusIncoming,orbs[Math.floor(local/12)%3].group.position,beacon.position,new T.Vector3(0,.3,1));placeRoute(focusOutgoing,beacon.position,orbs[(Math.floor(local/12)+1)%3].group.position,new T.Vector3(.2,-.3,1));}
 if(focus){const source=orbs[index].group.position.clone().add(new T.Vector3(.2,-.1,worlds[selected].radius*.6));placeRoute(focusIncoming,source,beacon.position,new T.Vector3(.2,.2,.6));placeRoute(focusOutgoing,beacon.position,source,new T.Vector3(-.25,-.2,.8));}
 animateRoute(focusIncoming,Math.min(1,Math.max(0,(local%12-3)/2)),!!selected&&!still&&local%12>=3&&local%12<5);
 animateRoute(focusOutgoing,Math.min(1,Math.max(0,(local%12-6)/2)),!!selected&&!still&&local%12>=6&&local%12<8);
 receivedSignals.forEach((dot,i)=>{const start=selected?3:5,clock=selected?local%12:s.t,progress=(clock-start)/2-i*.075;dot.visible=!still&&progress>=0&&progress<=1;if(dot.visible){(selected?focusIncoming:incoming).curve.getPoint(progress,dot.position);const spread=(1-progress)*.13;dot.position.y+=(i-1.5)*spread;dot.position.z+=(i%2?1:-1)*spread*.5;}});
 const reach=selected==='partners'&&phase===2;focusReach.trail.visible=reach;focusReach.head.visible=reach&&!still&&local%12<11;
 if(reach){const center=orbs[index].group.position,r=worlds.partners.radius;placeRoute(focusReach,center.clone().add(new T.Vector3(.1,-.1,r*.6)),center.clone().add(new T.Vector3(-r*1.55,-r*.4,r*.9)),new T.Vector3(0,.3,.5));const progress=still?1:Math.min(1,(local%12-8)/3);focusReach.curve.getPoint(progress,focusReach.head.position);focusReach.trail.geometry.setDrawRange(0,Math.floor(progress*90)+1);focusReach.trail.material.opacity=.32;}

 for(const [i,{el,point}] of labels.entries()){if(selected==='team'&&i<3){projected.copy(orbs[i].group.position).add(new T.Vector3(0,-worlds[names[i]].radius*orbs[i].group.scale.y-.18,0)).applyMatrix4(world.matrixWorld).project(camera);el.style.left=(projected.x*.5+.5)*100+'%';el.style.top=(-projected.y*.5+.5)*100+'%';}else if(selected==='team'&&i===3){projected.copy(beacon.position).applyMatrix4(world.matrixWorld).project(camera);el.style.left=(projected.x*.5+.5)*100+'%';el.style.top=`calc(${(-projected.y*.5+.5)*100}% + ${craftPixels*.5+26}px)`;}else if(selected){el.style.left=(12+i*25)+'%';el.style.top='94%';}else{if(i===3){projected.copy(beacon.position).applyMatrix4(world.matrixWorld).project(camera);el.style.left=(projected.x*.5+.5)*100+'%';el.style.top=`calc(${(-projected.y*.5+.5)*100}% + ${craftPixels*.5+26}px)`;continue;}projected.copy(point).applyMatrix4(world.matrixWorld).project(camera);el.style.left=((projected.x*.5+.5)*100)+'%';el.style.top=((-projected.y*.5+.5)*100)+'%';}}
 if(selected&&(selected==='team'?Math.floor(local%12/3):phase)!==focusClock.phase){figure.querySelectorAll('.orb-steps>div').forEach((row,i)=>row.classList.toggle('is-active',still||i===(selected==='team'?Math.floor(local%12/3):phase)));focusClock.phase=selected==='team'?Math.floor(local%12/3):phase;}
 renderer.render(scene,camera);
 }

 function tick(now){frame=0;frameDelta=last?Math.min((now-last)/1000,.05):1/60;elapsed+=last?frameDelta:0;last=now;draw();frame=requestAnimationFrame(tick);}
 function update(){
  cancelAnimationFrame(frame);frame=0;last=0;
  const running=shouldAnimate({visible,hidden:document.hidden,paused,reduced:reduced.matches,lost});
  figure.dataset.networkDrawCalls=renderer.info.render.calls;
  figure.dataset.networkState=lost?'fallback':reduced.matches?'still':running?'running':'paused';
  button.hidden=reduced.matches||lost;button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-label',paused?'Resume network animation':'Pause network animation');
  if(!lost){draw();if(running)frame=requestAnimationFrame(tick);}
 }
 map.addEventListener('pointermove',e=>{if(pointer.matches&&!mobile.matches&&!reduced.matches){const b=map.getBoundingClientRect();target.x=((e.clientX-b.left)/b.width-.5)*.6;target.y=-((e.clientY-b.top)/b.height-.5)*.35;}},{passive:true});
 map.addEventListener('pointerleave',()=>{target.x=target.y=0;});
 button.addEventListener('click',()=>{paused=!paused;update();});
 document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;figure.classList.remove('network-ready');update();});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;figure.classList.add('network-ready');resize();update();});
 new ResizeObserver(resize).observe(map);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();}).observe(figure);else visible=true;
 renderUpdate=()=>{focusClock.phase=-1;resize();update();};
 resize();figure.classList.add('network-ready');update();
}
