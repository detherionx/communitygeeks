// Original celestial field: deterministic matter, a persistent anomaly, and a tested route.
export function makeStellarField(T, host) {
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,70),pointer=new T.Vector2(99,99);
 const uniforms={time:{value:0},change:{value:0},diagnosis:{value:0},pilot:{value:0},pilotClock:{value:0},dpr:{value:1},pointer:{value:pointer}};
 const materials=[],geometries=[];let mobile=false;
 const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1)),f.x),f.y),f.z);}float fbm(vec3 p){return .56*noise(p)+.28*noise(p*2.07)+.14*noise(p*4.13);}`;
 function shader(fragment, extra={}){const m=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:fragment,...extra});materials.push(m);return m;}
 function plane(w,h,material,x,y,z){const g=new T.PlaneGeometry(w,h);geometries.push(g);const o=new T.Mesh(g,material);o.position.set(x,y,z);scene.add(o);return o;}
 // Dust is a continuous luminous volume, not a collection of tailed swimmers.
 const cloudShader=shader(`varying vec2 v;uniform float time,change,diagnosis;${noise}
 void main(){vec2 p=(v-.5)*vec2(18.,9.);vec2 c=vec2(1.45,.15);vec2 d=p-c;float r=length(d);float lens=.34*exp(-r*.9);vec2 w=p+normalize(d+vec2(.001))*lens;float stream=-.8+sin(w.x*.56)*.9+change*exp(-pow(abs((w.x-1.1)*.7),2.))*1.5;
 float n=fbm(vec3(w*1.7,time*.017));
float filaments=fbm(vec3(w*vec2(.8,5.),time*.012));
float band=exp(-pow(abs((w.y-stream)*1.15),2.));
float downstream=mix(.15,1.,change);
float density=band*mix(1.,downstream,smoothstep(1.7,3.,p.x));
float nursery=exp(-length((p-vec2(-2.,-.8))*vec2(.6,1.3)))*.5;
 float cut=smoothstep(.43,.82,r);float a=(density*pow(abs(n),2.)*.8+nursery*n*.32)*filaments*cut;vec3 color=mix(vec3(.12,.36,.31),vec3(.56,.69,.54),n);gl_FragColor=vec4(color,a*(1.-diagnosis*.92));}`);
 const cloud=plane(18,9,cloudShader,0,0,-1.8);
 const backCloud=plane(18,9,cloudShader,.4,.5,-4.2);backCloud.rotation.z=-.12;
 // The dark mass persists after intervention. A tilted, irregular accretion sheet catches light around it.
 const anomaly=new T.Group();anomaly.position.set(1.45,.15,0);scene.add(anomaly);
 const coreGeometry=new T.SphereGeometry(.48,40,24);geometries.push(coreGeometry);
 const coreMaterial=new T.ShaderMaterial({transparent:true,depthWrite:true,vertexShader:'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 n;void main(){float edge=smoothstep(.02,.48,n.z+.045*sin(n.x*17.+n.y*9.));gl_FragColor=vec4(.022,.073,.085,edge);}'});materials.push(coreMaterial);
 const core=new T.Mesh(coreGeometry,coreMaterial);anomaly.add(core);
 const diskMaterial=shader(`varying vec2 v;uniform float time,diagnosis;${noise}
 void main(){vec2 p=(v-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float n=fbm(vec3(p*8.,time*.035));float ridge=exp(-pow(abs((r-.40-.055*sin(a*3.)-.035*sin(a*5.))*48.),2.));float dust=exp(-pow(abs((r-.60)*5.),2.))*pow(abs(n),3.);float arc=.05+.95*pow(abs(.5+.5*sin(a*2.+r*12.-time*.04)),5.);float fade=smoothstep(.28,.38,r)*(1.-smoothstep(.8,1.,r));vec3 color=mix(vec3(.33,.61,.53),vec3(.94,.80,.61),ridge);color=mix(color,vec3(.85,.48,.34),diagnosis*.25);gl_FragColor=vec4(color,(ridge*.42+dust*3.)*arc*fade);}`,{side:T.DoubleSide,blending:T.AdditiveBlending});
 const disk=plane(3.9,3.9,diskMaterial,1.45,.15,0);disk.rotation.set(1.02,-.2,.32);
 const lensMaterial=shader(`varying vec2 v;uniform float time,diagnosis;void main(){vec2 p=(v-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float rim=exp(-pow(abs((r-.44)*65.),2.));float arcs=pow(abs(max(0.,cos(a*2.-.6))),6.);float contour=exp(-pow(abs((r-.69)*100.),2.))*diagnosis*.22;float halo=exp(-pow(abs((r-.48)*10.),2.))*.06;gl_FragColor=vec4(.59,.78,.68,rim*(.015+arcs*.35)+halo+contour);}`,{blending:T.AdditiveBlending});
 plane(2.3,2.3,lensMaterial,1.45,.15,.5);
 const seeds=[],types=[];const count=7000;
 for(let i=0;i<count;i++){seeds.push((i*.61803398875)%1,(i*.754877666)%1,(i*.56984029)%1);types.push(i<12?2:i%31===0?3:i%9===0?1:0);}
 const geometry=new T.BufferGeometry();geometries.push(geometry);geometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(count*3),3));geometry.setAttribute('seed',new T.Float32BufferAttribute(seeds,3));geometry.setAttribute('kind',new T.Float32BufferAttribute(types,1));
 const particleMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexShader:`attribute vec3 seed;attribute float kind;uniform float time,change,diagnosis,pilot,pilotClock,dpr;uniform vec2 pointer;varying vec3 tint;varying float alpha,type;
 void main(){type=kind;float q=fract(seed.x+time*(.009+seed.z*.018));vec3 p;float brightness=.2+pow(abs(seed.z),6.)*1.7;float size=1.;
 if(kind>2.5){float a=seed.x*6.283;float r=pow(abs(seed.y),1.8)*1.2;p=vec3(5.+cos(a)*r,1.8+sin(a)*r,(seed.z-.5)*1.5-1.);alpha=(.25+seed.z*.65)*(1.-diagnosis*.94)*(1.-pilot*.55);size=1.+seed.z*3.;tint=vec3(.72,.83,.66);
 }else if(kind>1.5){q=clamp(mod(pilotClock,12.)*.12-seed.x*.24,0.,1.);float x=-4.8+q*11.;float arch=sin(clamp((q-.30)/.49,0.,1.)*3.14159);p=vec3(x,-.8+sin(x*.56)*.9+arch*1.9,arch*1.3);float fail=step(.74,seed.y);p=mix(p,vec3(1.45,.15,0.),fail*smoothstep(.5,.76,q));alpha=pilot*(1.-fail*smoothstep(.65,.85,q));size=7.;tint=vec3(.98,.79,.57);
 }else if(kind>.5){p=vec3((seed.x-.5)*25.,(seed.y-.5)*12.,-10.+seed.z*15.);p.x+=sin(time*.025+seed.y*6.)*.12;p.y+=cos(time*.012+seed.x*6.)*.1;alpha=(.23+seed.z*.4)*(1.-diagnosis*.94);size=1.+pow(abs(seed.y),9.)*7.;tint=mix(vec3(.42,.67,.60),vec3(.95,.91,.77),seed.y);
 }else{float x=-6.5+q*14.;float spread=.35+seed.z*.8;float spin=seed.z*6.283+q*3.;vec3 route=vec3(x,-.8+sin(x*.56)*.9+sin(spin)*spread,(seed.y-.5)*3.8+cos(spin)*.4);float good=step(seed.y,.12+change*.65);float arch=sin(clamp((q-.32)/.48,0.,1.)*3.14159);route.y+=arch*change*1.8;route.z+=arch*change*1.1;
 float pull=smoothstep(.38,.7,q)*(1.-good);float radius=mix(1.5,.12,smoothstep(.43,.88,q));float angle=seed.z*6.283+q*13.;vec3 captured=vec3(1.45+cos(angle)*radius,.15+sin(angle)*radius*.48,sin(angle)*radius*.8);p=mix(route,captured,pull);alpha=brightness*(1.-(1.-good)*smoothstep(.75,.94,q));alpha*=mix(1.,.035,diagnosis);alpha*=1.-pilot*.72;size=.7+pow(abs(seed.z),9.)*4.;tint=mix(vec3(.27,.55,.46),vec3(.88,.88,.70),seed.z);tint=mix(tint,vec3(.76,.50,.34),pull*.28);}
 float near=1.-smoothstep(0.,1.4,distance(p.xy,pointer));alpha*=1.+near*.4;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float depth=clamp(14./-mv.z,.45,2.);gl_PointSize=max(1.,size*dpr*depth);alpha*=smoothstep(0.,.025,q)*(1.-smoothstep(.96,1.,q));}
 `,fragmentShader:`varying vec3 tint;varying float alpha,type;void main(){vec2 p=gl_PointCoord-.5;float r=length(p)*2.;float glow=pow(abs(max(0.,1.-r)),2.);if(type>1.5&&type<2.5)glow+=exp(-pow(abs((r-.65)*15.),2.))*.45;gl_FragColor=vec4(tint,alpha*glow);}`});materials.push(particleMaterial);const points=new T.Points(geometry,particleMaterial);points.frustumCulled=false;scene.add(points);
 // A small orbital landmark and a distant stellar nursery establish astronomical scale.
 const orbMaterial=new T.MeshStandardMaterial({color:0x284e4e,roughness:.62,metalness:.35});materials.push(orbMaterial);const orbGeometry=new T.SphereGeometry(.19,24,16);geometries.push(orbGeometry);const orb=new T.Mesh(orbGeometry,orbMaterial);orb.position.set(-1.2,.8,-.7);scene.add(orb);
 const light=new T.PointLight(0xdde5ca,9,10);light.position.set(-2,3,3);scene.add(light,new T.AmbientLight(0x396966,1));
 const ringGeometry=new T.TorusGeometry(.37,.003,4,80);geometries.push(ringGeometry);const ringMaterial=new T.MeshBasicMaterial({color:0x8eb7a1,transparent:true,opacity:.35});materials.push(ringMaterial);const orbit=new T.Mesh(ringGeometry,ringMaterial);orbit.position.copy(orb.position);orbit.rotation.set(.85,.4,.2);scene.add(orbit);
 const clusterMaterial=shader(`varying vec2 v;${noise}void main(){vec2 p=(v-.5)*2.;float r=length(p);float n=fbm(vec3(p*7.,2.));float ray=exp(-abs(p.x)*70.)*.12+exp(-abs(p.y)*70.)*.07;float a=exp(-r*r*15.)*.24+exp(-r*r*4.)*n*.18+ray*exp(-r*4.);gl_FragColor=vec4(.62,.78,.64,a);}`,{blending:T.AdditiveBlending});plane(3.4,3.4,clusterMaterial,5.,1.8,-1);
 // Only three close fragments: their changing perspective supplies depth without a meteor shower.
 const fragmentGeometry=new T.OctahedronGeometry(.045,0);geometries.push(fragmentGeometry);const fragmentMaterial=new T.MeshStandardMaterial({color:0x7c9589,metalness:.45,roughness:.5,emissive:0x19302c,emissiveIntensity:.35});materials.push(fragmentMaterial);const fragments=[];for(let i=0;i<3;i++){const o=new T.Mesh(fragmentGeometry,fragmentMaterial);o.scale.set(1.6+i*.4,.65,1);scene.add(o);fragments.push(o);}
 const routeGeometry=new T.BufferGeometry();geometries.push(routeGeometry);const routePositions=[];for(let i=0;i<100;i++){const q=.27+i/99*.58,x=-4.8+q*11.,arch=Math.sin(Math.min(1,Math.max(0,(q-.30)/.49))*Math.PI);routePositions.push(x,-.8+Math.sin(x*.56)*.9+arch*1.9,arch*1.3);}routeGeometry.setAttribute('position',new T.Float32BufferAttribute(routePositions,3));const routeMaterial=new T.LineBasicMaterial({color:0xe8735a,transparent:true,opacity:0});materials.push(routeMaterial);scene.add(new T.Line(routeGeometry,routeMaterial));

 // Research reveals four authored trajectory histories instead of another moving particle frame.
 const diagnostic=new T.Group();scene.add(diagnostic);const diagnosticMaterials=[];
 const histories=[
  [[-2,-.5,0],[-.2,.25,.3],[.9,.95,.6],[2.2,.75,.3],[1.7,-.3,0],[.9,.05,.2]],
  [[-1.8,-1,-.5],[-.2,-.6,0],[.7,-.2,.2],[.82,-.08,.2]],
  [[-.8,1.5,-.3],[.65,1.25,0],[1.2,.85,.2],[2.4,1.45,1.1],[3.7,2.3,1.4]],
  [[-2,-1.3,0],[-.5,.5,.6],[.6,1.9,1.2],[2.9,1.8,1],[4,.6,0]]
 ];
 histories.forEach((path,i)=>{const curve=new T.CatmullRomCurve3(path.map(p=>new T.Vector3(...p))),g=new T.BufferGeometry().setFromPoints(curve.getPoints(100));geometries.push(g);const m=new T.LineDashedMaterial({color:i===1?0xf0c7aa:0x9bc4b1,transparent:true,opacity:0,dashSize:i===1?1:.075,gapSize:i===1?.015:.045});materials.push(m);diagnosticMaterials.push([m,i===1?.95:.65]);const line=new T.Line(g,m);line.computeLineDistances();diagnostic.add(line);
 const markerGeometry=new T.RingGeometry(.045,.065,24);geometries.push(markerGeometry);const markerMaterial=new T.MeshBasicMaterial({color:0xeed6b5,side:T.DoubleSide,transparent:true,opacity:0,depthTest:false});materials.push(markerMaterial);diagnosticMaterials.push([markerMaterial,.8]);const marker=new T.Mesh(markerGeometry,markerMaterial);marker.position.copy(curve.getPoint(1));diagnostic.add(marker);});
 for(let i=0;i<2;i++){const points=[];for(let j=0;j<=120;j++){const angle=j/120*Math.PI*1.6,r=.9+i*.4;points.push(new T.Vector3(1.45+Math.cos(angle)*r,.15+Math.sin(angle)*r*.43,Math.sin(angle)*r*.75));}const g=new T.BufferGeometry().setFromPoints(points);geometries.push(g);const m=new T.LineBasicMaterial({color:0x78a99a,transparent:true,opacity:0});materials.push(m);diagnosticMaterials.push([m,.12+i*.018]);diagnostic.add(new T.Line(g,m));}
 const projected=new T.Vector3();
 function project(position){projected.set(...position).project(camera);return [(projected.x+1)/2,(1-projected.y)/2];}
 function resize(w,h,isMobile){mobile=isMobile;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.7));renderer.setSize(w,h);camera.aspect=w/h;camera.fov=mobile?52:40;uniforms.dpr.value=renderer.getPixelRatio();geometry.setDrawRange(0,mobile?3500:count);camera.updateProjectionMatrix();}
 const corners=[[-.7,.85],[-.7,-.85],[.7,.85],[.7,-.85]],framePoints=[];
 for(const [x,y] of corners){framePoints.push(new T.Vector3(1.45+x-Math.sign(x)*.18,.15+y,.15),new T.Vector3(1.45+x,.15+y,.15),new T.Vector3(1.45+x,.15+y,.15),new T.Vector3(1.45+x,.15+y-Math.sign(y)*.18,.15));}
 const observationGeometry=new T.BufferGeometry().setFromPoints(framePoints),observationMaterial=new T.LineBasicMaterial({color:0xadc5b4,transparent:true,opacity:0});geometries.push(observationGeometry);materials.push(observationMaterial);diagnosticMaterials.push([observationMaterial,.55]);diagnostic.add(new T.LineSegments(observationGeometry,observationMaterial));
 function draw(state,time,progress,shotTime=6){uniforms.time.value=time;uniforms.pilotClock.value=shotTime;for(const key of ['change','diagnosis','pilot'])uniforms[key].value=state[key];routeMaterial.opacity=state.pilot*.6;diagnosticMaterials.forEach(([m,opacity])=>m.opacity=state.diagnosis*opacity);
 const d=state.diagnosis,p=state.pilot,c=state.change;
 camera.position.set((mobile?1.3:0)+d*(mobile?1.5:4.8)+p*.8+c*.45,.1+d*1.6+p*.55,(mobile?11.8:12.8)-d*(mobile?2.2:4.7)-p*1.1+c*.3);camera.lookAt((mobile?1.3:.4)+d*.05+c*.5,.1+d*.1,0);cloud.rotation.y=p*.06;disk.rotation.z=.32+Math.sin(time*.04)*.035;
 fragments.forEach((o,i)=>{o.visible=d<.5;o.position.set(-3+i*3.8+Math.sin(time*.03+i)*.13+(progress-.5)*(i-1)*1.1,-1.8+i*1.6,2.5+i*.25);o.rotation.set(time*.035+i,time*.045+i,progress*.65+i);});renderer.render(scene,camera);}
 return {renderer,pointer,resize,draw,camera,project,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();}};
}
