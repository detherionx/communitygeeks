const cgVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();const cgRgba=(n,a)=>{const h=cgVar(n).replace('#','');return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`};
const canvas=document.querySelector('#stars');
// Routes follow connections in the 1672 × 941 artwork. The overlay shares its crop and transform.
const lights=document.createElement('canvas');
lights.className='coral-lights';lights.width=1672;lights.height=941;
document.querySelector('.skyline').append(lights);
const lightContext=lights.getContext('2d');
// Share the skyline's 1672 × 941 coordinates, crop and drift—not the hero's layout.
const boatLayer=document.createElement('canvas');
boatLayer.className='coral-lights boat-layer';boatLayer.width=1672;boatLayer.height=941;
document.querySelector('.skyline').append(boatLayer);
const boatImage=new Image();
let boatStart=null,boatResolution=1;
function resizeBoat(){
  const bounds=boatLayer.getBoundingClientRect();
  boatResolution=Math.min(3,Math.max(1,Math.max(bounds.width/1672,bounds.height/941)*(devicePixelRatio||1)));
  boatLayer.width=Math.ceil(1672*boatResolution);
  boatLayer.height=Math.ceil(941*boatResolution);
  boatLayer.getContext('2d').setTransform(boatResolution,0,0,boatResolution,0,0);
}
addEventListener('resize',resizeBoat);resizeBoat();
function drawBoat(time){
  if(boatStart===null)return;
  const context=boatLayer.getContext('2d');
  const progress=preference.matches?1:Math.min((time-boatStart)/2400,1);
  const entrance=500*Math.pow(1-progress,3);
  context.clearRect(0,0,1672,941);
  context.imageSmoothingQuality='high';
  const x=1315+entrance,y=620;
  const height=260*boatImage.naturalHeight/boatImage.naturalWidth;
  context.drawImage(boatImage,x,y,260,height);
}
boatImage.onload=()=>{
  boatStart=time;
  drawBoat(time);
};
boatImage.src='./assets/astronaut-landing.png';
const routes=[
  [[983,431],[935,451],[870,480],[830,496]],
  [[903,516],[949,514],[981,511],[1037,523],[1112,498]],
  [[1494,582],[1566,614],[1594,628],[1660,640]],
  [[209,504],[340,578],[416,614],[473,614],[526,558]],
  // One synchronized fan-out adds roughly a quarter more travelling light.
  [[981,511],[981,483],[983,431]],
  [[981,511],[949,514],[903,516]],
  [[981,511],[1037,523]]
].map(points=>({points,lengths:points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]))}));
function drawSignals(time){
  lightContext.clearRect(0,0,1672,941);
  function burst(p,strength){
    const glow=lightContext.createRadialGradient(...p,0,...p,15);
    glow.addColorStop(0,cgRgba('--muted-on-ink',strength));glow.addColorStop(.25,cgRgba('--muted-on-ink',strength*.8));glow.addColorStop(1,cgRgba('--muted-on-ink',0));
    lightContext.fillStyle=glow;lightContext.fillRect(p[0]-15,p[1]-15,30,30);
  }
  routes.forEach((route,index)=>{
    let elapsed=(time+(index<4?index*1700:6500))%11000;
    for(let i=0;i<route.points.length;i++){
      const p=route.points[i];
      if(elapsed<240){if(i!==0||index<5)burst(p,Math.sin(elapsed/240*Math.PI));return;}
      elapsed-=240;
      if(i===route.lengths.length)return;
      const duration=route.lengths[i]/.105;
      if(elapsed<duration){
        const q=route.points[i+1],t=elapsed/duration,tail=Math.max(0,t-20/route.lengths[i]);
        const x=p[0]+(q[0]-p[0])*t,y=p[1]+(q[1]-p[1])*t;
        const tx=p[0]+(q[0]-p[0])*tail,ty=p[1]+(q[1]-p[1])*tail;
        if(t>0){const trail=lightContext.createLinearGradient(tx,ty,x,y);trail.addColorStop(0,cgRgba('--muted-on-ink',0));trail.addColorStop(1,cgRgba('--muted-on-ink',1));lightContext.strokeStyle=trail;lightContext.lineWidth=2;lightContext.shadowColor=cgRgba('--muted-on-ink',1);lightContext.shadowBlur=7;lightContext.beginPath();lightContext.moveTo(tx,ty);lightContext.lineTo(x,y);lightContext.stroke();lightContext.shadowBlur=0;}
        burst([x,y],.45);return;
      }
      elapsed-=duration;
    }
  });
}
const ctx=canvas.getContext('2d');
const control=document.querySelector('#motion');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches,width=0,height=0,frame=0,time=0,last=0;
// Deterministic sky particles keep the visual consistent across resizing.
const points=Array.from({length:52},(_,i)=>({x:((i*197+73)%997)/997,y:((i*139+37)%619)/619,r:i%9===0?1.6:.65,phase:i*1.7}));
function draw(now){
  if(!paused&&!document.hidden)time+=Math.min(now-last||0,40);last=now;
  ctx.clearRect(0,0,width,height);
  drawSignals(time);
  drawBoat(time);
  points.forEach(p=>{const alpha=.25+.4*(.5+.5*Math.sin(time*.00045+p.phase));const x=p.x*width+Math.sin(time*.00008+p.phase)*7,y=p.y*height;ctx.fillStyle=cgRgba('--paper',alpha);ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();if(p.r>1){ctx.strokeStyle=cgRgba('--paper',alpha*.65);ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke();}});
  if(!paused&&!document.hidden)frame=requestAnimationFrame(draw);
}
function resize(){const dpr=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cancelAnimationFrame(frame);last=performance.now();draw(last);}
function sync(){document.body.classList.toggle('motion-paused',paused);control.setAttribute('aria-pressed',String(paused));control.innerHTML=paused?'Resume motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';cancelAnimationFrame(frame);last=performance.now();draw(last);}
control.addEventListener('click',()=>{paused=!paused;sync();});
preference.addEventListener('change',e=>{paused=e.matches;sync();});
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=performance.now();draw(last);});
addEventListener('resize',resize);resize();sync();
const navToggle=document.querySelector('.bar .nav-toggle'),navMenu=document.querySelector('.bar #nav-menu');if(navToggle&&navMenu){
function setMenu(open){navMenu.classList.toggle('open',open);navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close menu':'Open menu');}
navToggle.addEventListener('click',()=>setMenu(!navMenu.classList.contains('open')));
navMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navMenu.classList.contains('open')){setMenu(false);navToggle.focus();}});}
