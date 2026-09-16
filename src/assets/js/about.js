/* Four registered plates: original foreground, matte, clear landscape, moving cloud texture. */
(() => {
 const deck=document.querySelector('.deck'),canvas=document.querySelector('.valley-clouds');if(!canvas)return;
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false});if(!gl)return;
 const original=deck.querySelector('.wanderer-landscape > img'),toggle=document.querySelector('.wind-toggle');
 const vs='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
 const fs=`precision highp float;varying vec2 uv;uniform sampler2D original;uniform sampler2D matte;uniform sampler2D landscape;uniform sampler2D clouds;uniform vec2 viewport;uniform vec4 placement;uniform float wind;uniform float travel;
 float coverage(vec2 p){vec3 m=texture2D(matte,p).rgb;float hi=max(m.r,max(m.g,m.b)),lo=min(m.r,min(m.g,m.b));return max(1.-smoothstep(.18,.30,hi),smoothstep(.07,.19,(hi-lo)/max(hi,.01)));}
 void main(){vec2 p=(vec2(uv.x,1.-uv.y)*viewport-placement.xy)/placement.zw;
 vec3 base=texture2D(landscape,p).rgb;vec3 m=texture2D(matte,p).rgb;
 float hi=max(m.r,max(m.g,m.b)),lo=min(m.r,min(m.g,m.b));
 float solid=max(1.-smoothstep(.18,.30,hi),smoothstep(.07,.19,(hi-lo)/max(hi,.01)));
 float soft=0.;for(int j=-2;j<=2;j++){for(int i=-2;i<=2;i++){soft+=coverage(p+vec2(float(i)*.004,float(j)*.006));}}soft/=25.;
 float observer=(1.-smoothstep(.065,.11,abs(p.x-.65)))*smoothstep(.20,.27,p.y);
 solid=mix(soft,solid,observer);
 float x=p.x+wind*.007+travel*(.22+p.y*.35);
 // Crossfade overlapping tiles to zero before either texture boundary wraps.
 float a=fract(x),b=fract(x+.5);
 float wa=smoothstep(0.,.2,a)*smoothstep(0.,.2,1.-a);
 float wb=smoothstep(0.,.2,b)*smoothstep(0.,.2,1.-b);
 vec3 cloud=(texture2D(clouds,vec2(a,p.y)).rgb*wa+texture2D(clouds,vec2(b,p.y+.045)).rgb*wb)/(wa+wb);
 float depth=smoothstep(.27,.52,p.y);
 vec3 atmosphere=1.-(1.-base)*(1.-cloud*.78*depth);
 vec3 result=mix(atmosphere,base,solid);
 gl_FragColor=vec4(result,1.);}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;}catch(e){console.warn(e);return;}gl.useProgram(program);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['viewport','placement','wind','travel'].map(n=>[n,gl.getUniformLocation(program,n)]));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let ready=false,paused=reduced.matches,visible=true,frame=0,last=0,wind=0,travel=0;
 function draw(){if(!ready)return;gl.uniform1f(uniforms.wind,wind);gl.uniform1f(uniforms.travel,travel);gl.drawArrays(gl.TRIANGLES,0,6);}
 function resize(){const r=canvas.getBoundingClientRect(),i=original.getBoundingClientRect(),d=Math.min(devicePixelRatio,1.5);canvas.width=r.width*d;canvas.height=r.height*d;gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.viewport,r.width,r.height);const s=Math.max(i.width/1536,i.height/1024);gl.uniform4f(uniforms.placement,(i.width-1536*s)*.65,i.top-r.top+(i.height-1024*s)*(innerWidth<=700?1:.48),1536*s,1024*s);draw();}
 function tick(now){frame=0;if(paused||!visible)return;const dt=Math.min((now-last)/1000,.05);last=now;wind+=dt;const r=deck.getBoundingClientRect();travel+=(Math.max(0,Math.min(1,-r.top/r.height))-travel)*(1-Math.exp(-dt*7));draw();frame=requestAnimationFrame(tick);}
 function start(){if(ready&&!paused&&visible&&!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
 Promise.all(['wanderer-constellation.png','wanderer-foreground-matte.png','wanderer-landscape-still.png','wanderer-clouds-black.png'].map((file,i)=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(program,['original','matte','landscape','clouds'][i]),i);resolve();};image.onerror=reject;image.src='/assets/images/'+file;}))).then(()=>{ready=true;resize();canvas.classList.add('clouds-ready');start();}).catch(()=>console.warn('Cloud plates unavailable; keeping original artwork.'));
 toggle.addEventListener('click',()=>{paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Resume wind':'Pause wind';start();});reduced.addEventListener('change',()=>{paused=reduced.matches;start();});new ResizeObserver(resize).observe(canvas);new IntersectionObserver(([e])=>{visible=e.isIntersecting;start();}).observe(deck);
})();
