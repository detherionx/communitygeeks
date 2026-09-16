import {palette,participantFactory} from './visual-primitives.mjs';

export const scenarios=[
 {title:"Customers try it. They don't come back.",question:"Where customers lose momentum, where they're not getting real value, and where support isn't reaching them in time.",options:[['Clearer guidance','Assess whether guidance at the point of difficulty would help. Define what customers need and where it belongs.'],['Peer support','Assess whether customers can help each other with recurring problems, and what support that would require.']]},
 {title:"Developers have access. The integration stalls.",question:"Where documentation or examples fall short, where product limits block integration, and where developers need direct support.",options:[['Working examples','Identify the missing examples and documentation needed to complete a real workflow.'],['Direct support','Assess whether developers need access to someone who can resolve technical blockers.']]},
 {title:"Partners sign. Little happens next.",question:"The incentives to act, the responsibilities on each side, and the ownership of the next step.",options:[['Clear ownership','Clarify who does what on each side, with practical responsibilities and handovers.'],['Aligned incentives','Review whether the value and expectations work for both sides before investing further.']]}
];
const section=typeof document!=='undefined'&&document.querySelector('#questions');
if(section)boot();
async function boot(){
 const domains=[...section.querySelectorAll('[data-domain]')],options=[...section.querySelectorAll('[data-option]')],reset=section.querySelector('.decision-reset'),pause=section.querySelector('.decision-pause'),host=section.querySelector('.decision-stage');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let domain=0,option=-1,paused=false,visible=false,frame=0,last=0,time=0,reveal=0,view=null;
 function content(){const data=scenarios[domain];section.querySelector('.decision-problem').textContent=data.title;section.querySelector('.decision-label').textContent=option<0?"What we'd look at":'An option to assess';section.querySelector('.decision-description').textContent=option<0?data.question:data.options[option][1];domains.forEach((b,i)=>b.setAttribute('aria-pressed',String(domain===i)));options.forEach((b,i)=>{b.textContent=data.options[i][0];b.setAttribute('aria-pressed',String(option===i));});reset.hidden=option<0;section.dataset.domain=domain;section.dataset.option=option;wake();}
 domains.forEach((b,i)=>{b.addEventListener('click',()=>{domain=i;option=-1;reveal=0;content();});b.addEventListener('keydown',e=>{const next={ArrowRight:(i+1)%3,ArrowLeft:(i+2)%3,Home:0,End:2}[e.key];if(next!==undefined){e.preventDefault();domains[next].focus();domains[next].click();}});});
 function step(direction){domains[(domain+direction+domains.length)%domains.length].click();}
 section.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.step))));
 let swipe=null;
 host.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.isPrimary){swipe={id:e.pointerId,x:e.clientX,y:e.clientY};host.setPointerCapture(e.pointerId);}});
 host.addEventListener('pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1);});
 host.addEventListener('pointercancel',()=>swipe=null);
 host.addEventListener('lostpointercapture',()=>swipe=null);
 options.forEach((b,i)=>b.addEventListener('click',()=>{option=option===i?-1:i;reveal=0;content();}));reset.addEventListener('click',()=>{option=-1;content();});pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Resume motion':'Pause motion';pause.setAttribute('aria-pressed',String(paused));wake();});
 function paint(now=performance.now()){frame=0;const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!paused&&!reduced.matches)time+=dt;reveal+=(Number(option>=0)-reveal)*(paused||reduced.matches?1:1-Math.exp(-dt*5));if(view)view.draw(domain,option,reveal,time);if(view&&visible&&!document.hidden&&!paused&&!reduced.matches)frame=requestAnimationFrame(paint);}
 function wake(){cancelAnimationFrame(frame);last=0;paint();}
 document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);content();
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake();}).observe(section);
 await new Promise(resolve=>{const o=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){o.disconnect();resolve();}},{rootMargin:'400px'});o.observe(section);});
 try{await document.fonts.load('500 64px Archivo');const T=await import('../vendor/three/three.module.min.js');view=makeScene(T,host);section.classList.add('decision-ready');new ResizeObserver(()=>{view.resize(host.clientWidth,host.clientHeight);wake();}).observe(host);view.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);view=null;section.classList.remove('decision-ready');});wake();}catch{host.hidden=true;pause.hidden=true;}
}

function makeScene(T,host){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(palette.field,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-7,7,4,-4,.1,60);camera.position.set(5,8,13);camera.lookAt(0,.4,0);
 scene.add(new T.HemisphereLight(0xfff6e0,0x183e3f,1.8));const key=new T.DirectionalLight(0xfff4dc,3);key.position.set(-4,9,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:6,bottom:-6,near:.1,far:30});key.shadow.normalBias=.035;key.shadow.radius=3;scene.add(key);const fill=new T.DirectionalLight(0xadc5b4,1.5);fill.position.set(5,4,-6);scene.add(fill);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.68,metalness:.12}),ivory=mat(palette.ivory),mineral=mat(palette.mineral),teal=mat('#426f65'),dark=mat(palette.graphite),coral=mat(palette.coral);
 const person=participantFactory(T),worlds=[];
 function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;o.position.set(x,y,z);parent.add(o);return o;}
 const box=(parent,w,h,d,m,x=0,y=0,z=0)=>mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);
 function actor(parent,x,z){const p=person();p.traverse(o=>{if(o.isMesh)o.castShadow=true;});p.position.set(x,.13,z);parent.add(p);return p;}
 function label(parent,text,x,y,z,width=1.6){const canvas=document.createElement('canvas');canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='500 64px "Archivo"';canvas.width=Math.ceil(ctx.measureText(text).width)+32;ctx.fillStyle=palette.ivory;ctx.font='500 64px "Archivo"';ctx.textAlign='center';ctx.fillText(text,canvas.width/2,88);const texture=new T.CanvasTexture(canvas);const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.position.set(x,y,z);width=Math.min(width,text.length*.15+.3);sprite.scale.set(width,width*128/canvas.width,1);parent.add(sprite);return sprite;}
 function terminal(parent,x,z,caption){const g=new T.Group();g.position.set(x,.12,z);parent.add(g);box(g,1.5,.13,1,mineral);box(g,1.15,1.8,.19,mineral,0,.96,-.18);box(g,.97,1.56,.03,dark,0,.97,-.065);label(g,caption,0,2.3,.01,1.7);for(let i=0;i<2;i++)box(g,.6,.035,.02,i?coral:ivory,0,.8-i*.22,-.04);return g;}
 function board(parent,x,z,caption){const g=new T.Group();g.position.set(x,.15,z);parent.add(g);box(g,1.25,1.45,.09,ivory,0,.8,0);for(let i=0;i<3;i++)box(g,.8,.035,.025,teal,0,1.2-i*.2,.06);label(g,caption,0,1.85,0,1.8);return g;}
 function connection(parent,points,color=palette.mineral,dashed=false){const geometry=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const material=dashed?new T.LineDashedMaterial({color,dashSize:.055,gapSize:.09,transparent:true,opacity:.65}):new T.LineBasicMaterial({color,transparent:true,opacity:.7});const l=new T.Line(geometry,material);if(dashed)l.computeLineDistances();parent.add(l);return l;}
 function base(){const g=new T.Group();scene.add(g);box(g,8.8,.12,4.1,dark,0,-.095,0);box(g,9,.1,4.3,teal,0,0,0);box(g,9,.025,.025,mineral,0,.065,2.15);
  const points=[];for(let x=-4;x<=4;x+=.5)points.push(new T.Vector3(x,.057,-1.9),new T.Vector3(x,.057,1.9));for(let z=-1.5;z<=1.5;z+=.5)points.push(new T.Vector3(-4.2,.057,z),new T.Vector3(4.2,.057,z));g.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:palette.mineral,transparent:true,opacity:.12})));
  for(const x of [-1,1])for(const z of [-1,1])connection(g,[[x*3.85,.068,z*1.92],[x*4.25,.068,z*1.92],[x*4.25,.068,z*1.52]],palette.ivory);
  return g;}
 // Customers: a product they try, and people drifting away from it.
 {
 const g=base();terminal(g,-.5,-.45,'PRODUCT');const people=[actor(g,-2.6,.6),actor(g,1.2,.3),actor(g,3,1.2),actor(g,-3,-1.3)];label(g,'TRY',-3.65,1.75,.75);connection(g,[[-3.5,1.55,.75],[-3,1.55,.75],[-2.7,1.1,.6]],palette.mineral,true);const away=label(g,'NO RETURN',3.2,2.15,1.2,2.1);away.material.color.set('#f5b09a');
 const arrivalCurve=new T.CatmullRomCurve3([new T.Vector3(-3.2,.16,-1.1),new T.Vector3(-2.6,.16,.65),new T.Vector3(-1,.16,.75),new T.Vector3(.5,.16,.8)]);mesh(new T.TubeGeometry(arrivalCurve,40,.035,8,false),coral,g);
 const arrival=box(g,.16,.12,.16,coral);const loss=mesh(new T.TorusGeometry(.32,.035,8,32),coral,g,3.55,.15,1.2);loss.rotation.x=-Math.PI/2;
 const fading=[];people[2].traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;fading.push(o.material);}});const departure=connection(g,[[1.4,.14,.9],[2.5,.14,1.2],[3.8,.14,1.2]],palette.coral,true);
 const guide=board(g,1.7,-1.15,'GUIDANCE'),peer=actor(g,2.6,-.7);
 const path=connection(g,[[-2.6,.14,.6],[-1.5,.14,.7],[.4,.14,.7],[1.7,.14,-.8]],palette.coral);
 const exchange=connection(g,[[1.2,.8,.3],[2.6,.8,-.7]],palette.coral);const token=box(g,.19,.22,.05,coral,1.8,.8,0);
 worlds.push({g,draw(option,r,t){const active=option>=0,q=(1-Math.cos(t*.45))/2;guide.visible=option===0;peer.visible=option===1;path.visible=option===0;exchange.visible=token.visible=option===1;away.visible=departure.visible=loss.visible=!active;arrival.position.copy(arrivalCurve.getPointAt((t*.16)%1));departure.material.opacity=.65+.3*q;loss.scale.setScalar(1+q*.3);people[2].position.x=3+(active?-r:q*.85);people[2].rotation.y=active?-.6:1.3;fading.forEach(m=>m.opacity=active?1:1-q*.85);guide.scale.setScalar(.65+r*.35);token.position.set(1.2+(Math.sin(t)*.5+.5)*1.4,.85,.3-(Math.sin(t)*.5+.5));}});
 }
 // Developers: a laptop, explicitly named API and an incomplete module.
 {
 const g=base();terminal(g,-1,-.6,'API');actor(g,-2.6,.7);const laptop=box(g,.9,.05,.65,mineral,-2.3,.8,1);box(laptop,.9,.5,.05,dark,0,.25,-.3);label(g,'DEVELOPER',-2.6,1.9,.7,2.2);
 const blocks=[];for(let i=0;i<4;i++)blocks.push(box(g,.46,.46,.46,i===0?coral:mineral,1.5+i%2*.68,.4+Math.floor(i/2)*.68,.1));label(g,'INTEGRATION',1.85,2.15,.1,2.3);
 const gap=connection(g,[[-.2,.25,-.1],[.6,.25,-.1]],palette.coral,true);const guide=board(g,3,-1,'EXAMPLE');const helper=actor(g,-3.1,-1.1);const bridge=connection(g,[[-.2,.25,-.1],[1.3,.25,-.1]],palette.coral);
 const pulseMaterial=new T.MeshBasicMaterial({color:palette.coral,transparent:true}),pulse=mesh(new T.SphereGeometry(.06,12,8),pulseMaterial,g);
 worlds.push({g,draw(option,r,t){guide.visible=option===0;helper.visible=option===1;bridge.visible=option>=0;gap.visible=pulse.visible=option<0;const q=(t*.3)%1;pulse.position.set(-.2+q*.8,.25,-.1);pulseMaterial.opacity=1-q*q;gap.material.opacity=.35+.3*Math.sin(t*1.8)**2;blocks.forEach((b,i)=>{b.position.x=1.5+i%2*(.68-r*.16);b.position.y=.4+Math.floor(i/2)*(.68-r*.16)+(option<0?Math.sin(t*.65+i)*.035:0);});helper.rotation.y=.7;}});
 }
 // Partners: product, partner and customer are different visible actors.
 {
 const g=base();terminal(g,-3,-.7,'PRODUCT');actor(g,0,0);label(g,'PARTNER',-1.25,2.1,.8,1.8);connection(g,[[-1.25,1.9,.8],[-.65,1.9,.8],[0,1,0]],palette.mineral,true);actor(g,3,.7);actor(g,3,-1);label(g,'CUSTOMERS',3,2.65,.1,2.2);
 const agreement=board(g,-.8,-1.65,'AGREEMENT');agreement.scale.setScalar(.65);agreement.children.find(o=>o.isSprite).position.y=3.8;connection(agreement,[[0,3.5,0],[0,1.7,0]],palette.mineral,true);
 const first=connection(g,[[-2.3,.14,-.7],[-.1,.14,0]],palette.mineral);const missing=connection(g,Array.from({length:21},(_,i)=>[.3+i/20*2.3,.14,i/20*.3]),palette.coral,true);
 const owner=board(g,.8,-1.2,'WHO DOES WHAT'),terms=board(g,-1.4,1.1,'SHARED VALUE');const route=connection(g,[[-2.3,.14,-.7],[0,.14,0],[2.6,.14,.3]],palette.coral);const token=box(g,.18,.18,.18,coral,0,.25,0);
 worlds.push({g,draw(option,r,t){owner.visible=option===0;terms.visible=option===1;route.visible=token.visible=option>=0;missing.visible=option<0;missing.geometry.setDrawRange(0,8+Math.floor((Math.sin(t*.7)+1)*4));missing.material.opacity=.2+.4*((Math.cos(t*.9)+1)/2);const q=(Math.sin(t*.7)+1)/2;token.position.set(-2.3+q*4.9,.24,-.7+q);owner.scale.setScalar(.7+r*.3);}});
 }
 return {renderer,resize(w,h){renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(w,h);const half=w<500?3.9:2.8;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();},draw(domain,option,reveal,time){worlds.forEach((w,i)=>{w.g.visible=i===domain;if(i===domain){w.g.rotation.y=Math.sin(time*.14)*.025;w.draw(option,reveal,time);}});renderer.render(scene,camera);}};
}
