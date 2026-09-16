// Original luminous observatory artwork. Each orb has independent shell, star volume,
// cloud slices and authored constellation graphics; no mesh topology is displayed.
export function makeOrb(T,{radius=1,kind=0,mobile=false}={}){
 const group=new T.Group(),volume=new T.Group(),figures=new T.Group(),clouds=new T.Group();
 group.add(clouds,volume,figures);
 const geometry=p=>new T.BufferGeometry().setFromPoints(p.map(v=>new T.Vector3(...v).multiplyScalar(radius)));
 const vertex=`varying vec3 local;varying vec3 normalView;varying vec3 eye;void main(){local=position;vec4 p=modelViewMatrix*vec4(position,1.);normalView=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`;
 // Transparent layers do not write depth. Additive light is order-independent;
 // the faint absorptive vessel is deliberately rendered before the light layers.
 const vessel=new T.Mesh(new T.SphereGeometry(radius,48,32),new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:vertex,fragmentShader:`varying vec3 normalView;varying vec3 eye;void main(){float edge=pow(1.-max(0.,dot(normalize(normalView),normalize(eye))),2.);gl_FragColor=vec4(.015,.075,.082,.16+edge*.11);}`}));vessel.renderOrder=0;group.add(vessel);
 const shell=new T.Mesh(new T.SphereGeometry(radius*1.015,64,40),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:vertex,fragmentShader:`varying vec3 normalView;varying vec3 eye;void main(){vec3 n=normalize(normalView);float rim=pow(1.-max(0.,dot(n,normalize(eye))),3.7);float light=.25+.75*pow(max(0.,dot(n,normalize(vec3(-.6,.75,.3)))),2.);vec3 color=mix(vec3(.18,.52,.48),vec3(.85,.9,.75),light);gl_FragColor=vec4(color,rim*(.24+light*.5));}`}));shell.renderOrder=5;group.add(shell);
 const outer=new T.Mesh(new T.SphereGeometry(radius*1.045,48,32),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.BackSide,vertexShader:vertex,fragmentShader:`varying vec3 normalView;varying vec3 eye;void main(){float rim=pow(1.-abs(dot(normalize(normalView),normalize(eye))),4.);gl_FragColor=vec4(.24,.55,.52,rim*.22);}`}));outer.renderOrder=5;group.add(outer);
 const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}float fbm(vec3 p){return .55*noise(p)+.27*noise(p*2.07)+.13*noise(p*4.13);}`;
 const nebulae=[];
 for(let i=0;i<3;i++){
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{time:{value:0},layer:{value:i},radius:{value:radius}},vertexShader:`varying vec2 uvLocal;void main(){uvLocal=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 uvLocal;uniform float time;uniform float layer;${noise}
   void main(){vec2 q=uvLocal;float z=(layer-1.)*.39;float boundary=1.-smoothstep(.63,1.,dot(q,q)+z*z);float a=layer*.8-.5;vec2 p=mat2(cos(a),-sin(a),sin(a),cos(a))*q;float warp=fbm(vec3(p*3.4,layer+time*.012));float band=exp(-pow((p.y+.19*sin(p.x*5.+layer)+warp*.2)*5.,2.));float cloud=fbm(vec3(p*7.+warp,layer*2.+time*.018));float tendrils=smoothstep(.32,.68,cloud);if(layer>1.5){vec2 g=(p-vec2(-.16,-.16))*vec2(1.,1.7);float r=length(g);float arms=.5+.5*sin(atan(g.y,g.x)*2.+r*19.);band=exp(-r*r*9.)*(.35+.65*pow(arms,3.));tendrils=.55+.45*tendrils;}float alpha=boundary*band*tendrils*(layer==1.?.48:.55);vec3 color=mix(vec3(.14,.45,.44),vec3(.66,.74,.60),smoothstep(.43,.69,cloud));gl_FragColor=vec4(color,alpha);}`});
  const cloud=new T.Mesh(new T.PlaneGeometry(radius*1.95,radius*1.95),material);cloud.position.z=(i-1)*radius*.39;cloud.rotation.z=.2*i;cloud.renderOrder=1;clouds.add(cloud);nebulae.push(cloud);
 }
 const count=mobile?240:480,positions=starVolume(count,kind),sizes=[],brightness=[];
 for(let i=0;i<count;i++){sizes.push(i%37===0?.13:i%9===0?.085:.035);brightness.push(i%37===0?1.3:i%9===0?.75:.46+(i%7)*.04);}
 const starGeometry=geometry(positions);starGeometry.setAttribute('size',new T.Float32BufferAttribute(sizes,1));starGeometry.setAttribute('brightness',new T.Float32BufferAttribute(brightness,1));
 const starMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{resolution:{value:600},time:{value:0},activity:{value:0}},vertexShader:`attribute float size;attribute float brightness;uniform float resolution;varying float intensity;varying float depth;varying float seed;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(size*resolution/(-p.z),2.,26.);intensity=brightness;depth=-p.z;seed=position.x*17.+position.y*13.;}`,fragmentShader:`varying float intensity;varying float depth;varying float seed;uniform float time;uniform float activity;void main(){vec2 p=gl_PointCoord-.5;float d=length(p)*2.;float glow=exp(-d*d*8.)*.35+exp(-d*d*100.);float rays=(exp(-abs(p.x)*100.)*exp(-abs(p.y)*16.)+exp(-abs(p.y)*100.)*exp(-abs(p.x)*16.))*.065*step(1.5,intensity);float a=(glow+rays)*intensity*(.86+.14*sin(seed+time*.5))*(1.+activity*.7);vec3 c=mix(vec3(.3,.62,.6),vec3(.965,.95,.89),clamp(intensity*.9,0.,1.));gl_FragColor=vec4(c,a);}`});
 const stars=new T.Points(starGeometry,starMaterial);stars.renderOrder=2;volume.add(stars);
 // Authored irregular celestial figures; edges express paths, never sphere tessellation.
 const designs=[
  [[-.59,.14],[-.43,.41],[-.12,.32],[.05,.53],[.32,.3],[.52,.38]],
  [[-.33,-.48],[-.14,-.21],[.18,-.31],[.38,-.12],[.53,-.35]],
 ];
 if(kind===1)designs[0]=[[-.5,.1],[-.27,.1],[-.27,.4],[.05,.25],[.31,.45],[.48,.16]];
 if(kind===2)designs[0]=[[-.64,.1],[-.48,.3],[-.25,.15],[.13,.45],[.4,.31],[.56,.02]];
 const strokes=[];
 designs.forEach((design,index)=>{
  const points=design.map(([x,y])=>[x,y,Math.sqrt(.79*.79-x*x-y*y)*(index===0?1:.5)]);
  const path=new T.Line(geometry(points),new T.LineBasicMaterial({color:0xede5d3,transparent:true,opacity:index===0?.68:.4,blending:T.AdditiveBlending,depthWrite:false}));path.renderOrder=3;figures.add(path);strokes.push(path);
  const g=geometry(points);g.setAttribute('size',new T.Float32BufferAttribute(points.map((_,i)=>i===1?.3:.16),1));g.setAttribute('brightness',new T.Float32BufferAttribute(points.map((_,i)=>i===1?3.2:1.6),1));const lights=new T.Points(g,starMaterial);lights.renderOrder=4;figures.add(lights);
 });
 const lightMaterials=new Set();group.traverse(o=>{if(o.material?.isShaderMaterial)lightMaterials.add(o.material);});
 lightMaterials.forEach(m=>{m.uniforms.fade={value:1};m.fragmentShader='uniform float fade;'+m.fragmentShader.replace(/}\s*$/,'gl_FragColor.a*=fade;}');});
 return {setDetail(focused){stars.geometry.setDrawRange(0,focused?count:Math.floor(count/2));},setEmphasis(value){lightMaterials.forEach(m=>m.uniforms.fade.value=value);strokes.forEach(l=>l.material.opacity*=value);},group,volume,figures,stars,nebulae,strokes,resize(height,dpr){starMaterial.uniforms.resolution.value=height*dpr;},update(t,activity=0){volume.rotation.y=t*.009;figures.rotation.y=Math.sin(t*.017)*.08;clouds.rotation.z=Math.sin(t*.011)*.025;starMaterial.uniforms.time.value=t;starMaterial.uniforms.activity.value=activity;nebulae.forEach((n,i)=>n.material.uniforms.time.value=t+i*20);strokes[0].material.opacity=.58+activity*.32;}};
}

export function starVolume(count,kind=0){
 return Array.from({length:count},(_,i)=>{const y=1-2*(i+.5)/count,a=i*2.399963+kind*.6,r=Math.cbrt((i*.754877666+.19)%1)*.94,h=Math.sqrt(1-y*y);return [Math.cos(a)*h*r,y*r,Math.sin(a)*h*r];});
}
