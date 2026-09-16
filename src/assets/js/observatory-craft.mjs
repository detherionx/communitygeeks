// Signature vessel: a wide split crescent, open coral chamber and three stellar drives.
// Authored vane cross-sections produce a curved, volumetric hull; local +X is forward.
export function makeCraft(T) {
 const group=new T.Group(),body=new T.Group();group.add(body);
 const dark=new T.MeshStandardMaterial({color:0x143c40,metalness:.72,roughness:.32});
 const edge=new T.MeshStandardMaterial({color:0xb9d1c5,metalness:.7,roughness:.24});
 const coral=new T.MeshStandardMaterial({color:0xe8735a,emissive:0xe8735a,emissiveIntensity:.7,roughness:.2});
 const white=new T.MeshBasicMaterial({color:0xffebcf});
 const xyz=(x,y,z)=>new T.Vector3(y,-x,z);
 function mesh(g,m,p,parent=body){const o=new T.Mesh(g,m);if(p)o.position.copy(xyz(...p));parent.add(o);return o;}
 function line(points,material,parent=body){const o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>xyz(...p))),material);parent.add(o);return o;}
 const trim=new T.LineBasicMaterial({color:0xc7ded0,transparent:true,opacity:.85});
 // The stations define lateral span, leading edge, trailing edge and the crown height.
 const stations=[[.16,.38,-.20,.09],[.30,.37,-.32,.12],[.48,.32,-.39,.16],[.70,.22,-.35,.13],[.91,.04,-.26,.06],[1.18,-.12,-.15,.015]];
 const wings=[];
 for(const side of [-1,1]){
  const wing=new T.Group();body.add(wing);wings.push(wing);
  const positions=[],indices=[],steps=12;
  for(let layer=0;layer<2;layer++)for(const [x,front,back,z] of stations)for(let j=0;j<=steps;j++){
   const u=j/steps,y=front+(back-front)*u,zz=z+Math.sin(u*Math.PI)*.075-(layer?.055:0);
   positions.push(...xyz(x*side,y,zz).toArray());
  }
  const row=steps+1,n=stations.length*row;
  for(let layer=0;layer<2;layer++)for(let i=0;i<stations.length-1;i++)for(let j=0;j<steps;j++){
   const a=layer*n+i*row+j,b=a+row;indices.push(a,b,a+1,b,b+1,a+1);
  }
  for(let i=0;i<stations.length-1;i++)for(const j of [0,steps]){const a=i*row+j,b=a+row;indices.push(a,a+n,b,b,a+n,b+n);}
  for(const i of [0,stations.length-1])for(let j=0;j<steps;j++){const a=i*row+j;indices.push(a,a+1,a+n,a+1,a+n+1,a+n);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  // Double-sided surfaces preserve the intentionally open, thin instrument blades.
  const material=dark.clone();material.side=T.DoubleSide;mesh(geometry,material,null,wing);
  for(const edgeIndex of [1,2])line(stations.map(s=>[side*s[0],s[edgeIndex],s[3]+.013]),trim,wing);
  const glass=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{gain:{value:.3}},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;uniform float gain;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),2.);gl_FragColor=vec4(mix(vec3(.14,.36,.34),vec3(.68,.88,.77),f),.18+f*.38+gain*.12);}' });
  const skin=geometry.clone();skin.translate(0,0,.013);mesh(skin,glass,null,wing);wing.userData.glass=glass;
  const tip=mesh(new T.SphereGeometry(.038,10,8),white,[side*1.13,-.12,.045],wing);tip.scale.set(1,.45,.4);
 }
 function plate(points,material,depth=.06){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(y,-x):shape.moveTo(y,-x));shape.closePath();return mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.022,bevelThickness:.018,bevelSegments:3,curveSegments:16}),material);}
 // Forked spine frames a real aperture instead of hiding the heart under a solid hull.
 for(const side of [-1,1])plate([[0,.76],[side*.18,.40],[side*.23,.02],[side*.15,-.36],[side*.075,-.46],[side*.095,.17]],edge,.09);
 const core=mesh(new T.OctahedronGeometry(.155),coral,[0,.015,.17]);core.scale.set(.8,1,1.1);
 const coreLight=new T.PointLight(0xe8735a,.6,.85,2);coreLight.position.copy(xyz(0,0,.19));body.add(coreLight);
 const ring=new T.Group();body.add(ring);
 const collar=mesh(new T.TorusGeometry(.29,.013,8,64,Math.PI*1.6),edge,[0,0,.15],ring);collar.rotation.y=.38;collar.rotation.z=.42;
 const sensor=new T.Group();sensor.position.copy(xyz(0,.66,.1));body.add(sensor);
 mesh(new T.OctahedronGeometry(.05),white,null,sensor);
 const channels=new T.LineBasicMaterial({color:0xa9d5bd,transparent:true,opacity:.55});
 const details=new T.Group();body.add(details);
 for(const side of [-1,1]){
  line([[side*.25,.19,.18],[side*.45,.16,.24],[side*.67,.02,.21],[side*.83,-.08,.13]],channels,details);
  for(const [x,y,z] of [[.25,.19,.18],[.45,.16,.24],[.67,.02,.21],[.83,-.08,.13]])mesh(new T.SphereGeometry(.014,6,4),white,[side*x,y,z],details);
 }
 // Three crossed emissive ribbons per drive give the propulsion genuine XYZ depth.
 const plumeMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{power:{value:.7}},vertexShader:'varying vec2 p;void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 p;uniform float power;void main(){float a=pow(max(0.,1.-abs(p.x-.5)*2.),2.)*pow(p.y,1.8);vec3 c=mix(vec3(.91,.39,.28),vec3(1.,.91,.70),p.y);gl_FragColor=vec4(c,a*.65*power);}' });
 const drives=[];
 for(const [x,y] of [[-.40,-.36],[.40,-.36],[0,-.45]]){
  mesh(new T.TorusGeometry(.045,.016,8,20),edge,[x,y,.06]).rotation.y=Math.PI/2;
  mesh(new T.SphereGeometry(.037,10,8),white,[x,y,.06]);
  const drive=new T.Group();drive.position.copy(xyz(x,y-.22,.05));body.add(drive);drives.push(drive);
  for(const tilt of [0,Math.PI/3,-Math.PI/3]){const m=mesh(new T.PlaneGeometry(.10,.46),plumeMaterial,null,drive);m.rotation.z=Math.PI/2;m.rotation.x=tilt;}
 }
 const desired=new T.Quaternion(),rotation=new T.Euler();let gain=0,previousAngle=0,turn=0;
 return {group,body,core,span:2.4,update({time,angle,attention=0,pulse=0,still=false,blend=.08,scroll=0,pointer=0,discovery=0}){
  gain+=(attention-gain)*(still?1:blend);
  const change=Math.atan2(Math.sin(angle-previousAngle),Math.cos(angle-previousAngle));previousAngle=angle;
  turn+=(Math.max(-.15,Math.min(.15,change*5))-turn)*(still?1:blend);
  rotation.set(.22+.8*Math.cos(angle)**2+(still?0:Math.sin(time*.31)*.035+turn),.19+(still?0:Math.sin(time*.23)*.045+scroll*.12),angle+(still?0:Math.sin(time*.19)*.025+pointer*.04));
  desired.setFromEuler(rotation);body.quaternion.slerp(desired,still?1:blend);
  wings.forEach((w,i)=>{w.rotation.x=(i?1:-1)*(gain*.08+(still?0:turn*.4));w.position.y=(i?1:-1)*(gain*.05+discovery*.045);w.userData.glass.uniforms.gain.value=gain;});
  ring.rotation.x=still?.12:Math.sin(time*.13)*.12;ring.rotation.z=still?.2:time*.035+gain*.28+discovery*.25;
  sensor.rotation.z=still?0:pointer*.15;
  core.rotation.y=still?.6:time*.17;coral.emissiveIntensity=.55+pulse*.75+gain*.3+(still?0:Math.sin(time*.6)*.08);coreLight.intensity=.4+pulse*.25;
  details.visible=gain>.12;plumeMaterial.uniforms.power.value=.65+pulse*.3+Math.abs(turn)*2;
  drives.forEach((d,i)=>d.scale.x=still?1:1+Math.sin(time*1.6+i)*.055+Math.abs(turn)*.5);
 }};
}
