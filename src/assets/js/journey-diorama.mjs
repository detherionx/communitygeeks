import {palette,participantFactory} from './visual-primitives.mjs';

// The same architectural participants as Services and Between People.
export function makeJourneyDiorama(T,host){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});host.append(renderer.domElement);renderer.setClearColor(palette.field,0);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,90),pointer=new T.Vector2(99,99);
 scene.add(new T.HemisphereLight(0xf6f0df,0x173738,2.5));const sun=new T.DirectionalLight(0xfff2d4,3);sun.position.set(-5,9,7);scene.add(sun);const rim=new T.DirectionalLight(0xadc5b4,2);rim.position.set(5,5,-5);scene.add(rim);
 const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.65,metalness:.12,...extra});
 const ivory=material(palette.ivory),mineral=material(palette.mineral),teal=material('#365e59'),dark=material('#0c2427'),coral=material(palette.coral,{emissive:palette.coral,emissiveIntensity:.18});
 const glass=material(palette.mineral,{transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false});
 function mesh(geometry,mat,parent=scene,x=0,y=0,z=0){const object=new T.Mesh(geometry,mat);object.position.set(x,y,z);parent.add(object);return object;}
 function box(parent,w,h,d,mat,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),mat,parent,x,y,z);}
 const person=participantFactory(T);
 function actor(parent,x,y,z,scale=.55){const p=person();p.scale.multiplyScalar(scale);p.position.set(x,y,z);parent.add(p);return p;}
 function line(points,color,opacity=1,parent=scene){const m=new T.LineBasicMaterial({color,transparent:true,opacity});const l=new T.Line(new T.BufferGeometry().setFromPoints(points),m);parent.add(l);return l;}
 const start=new T.Group();start.position.set(-4,0,0);scene.add(start);
 box(start,2.4,.12,2.1,teal);box(start,.9,.13,.75,mineral,-.5,.12,-.25);box(start,.8,1.15,.13,mineral,-.5,.75,-.5);box(start,.64,.87,.03,dark,-.5,.76,-.41);
 for(let i=0;i<3;i++)box(start,.38,.035,.025,i===2?coral:ivory,-.5,1-i*.19,-.385);
 actor(start,-.65,.1,.55);actor(start,.1,.1,-.55);actor(start,.7,.1,.65);
 const destination=new T.Group();destination.position.set(4,0,-.4);scene.add(destination);
 box(destination,2.3,.12,2.1,teal);box(destination,.13,1.4,.2,mineral,-.7,.76,-.45);box(destination,.13,1.4,.2,mineral,.7,.76,-.45);box(destination,1.53,.15,.2,mineral,0,1.43,-.45);
 const module=box(destination,.5,.5,.5,coral,.25,.37,.15);actor(destination,-.55,.1,.55);const arrivals=[actor(destination,.7,.1,.5),actor(destination,.2,.1,-.6)];
 // A dark gravitational interruption between the two architectural stages.
 const anomaly=new T.Group();anomaly.position.set(.2,-.4,0);scene.add(anomaly);
 const voidMaterial=new T.MeshBasicMaterial({color:'#061c20'});
 const voidBody=mesh(new T.SphereGeometry(.99,48,32),voidMaterial,anomaly,0,-.12,0);voidBody.scale.y=.4;
 const mouth=mesh(new T.TorusGeometry(1.04,.035,12,80),mineral,anomaly);mouth.rotation.x=Math.PI/2;
 for(let i=0;i<3;i++){const r=mesh(new T.TorusGeometry(1.16+i*.12,.009,6,64,Math.PI*1.45),i===0?coral:teal,anomaly);r.rotation.set(Math.PI/2+i*.12,.12,i*.8);}
 const route=new T.CatmullRomCurve3([new T.Vector3(-3,.28,0),new T.Vector3(-1.8,.45,-1.6),new T.Vector3(.2,.6,-2.3),new T.Vector3(2.1,.4,-1.6),new T.Vector3(3.6,.25,-.4)]);
 const routeLine=line(route.getPoints(80),palette.coral,.0);
 const oldLine=line([new T.Vector3(-3,.18,0),new T.Vector3(-1.4,.18,0),new T.Vector3(-.7,-.15,0),new T.Vector3(.0,-1.1,0)],palette.mineral,.4);
 function craft(){const g=new T.Group();scene.add(g);
  const shape=new T.Shape();shape.moveTo(-.66,-.32);shape.lineTo(.25,-.4);shape.lineTo(.77,0);shape.lineTo(.25,.4);shape.lineTo(-.66,.32);shape.closePath();
  const deck=mesh(new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:2,steps:1}),mineral,g);deck.rotation.x=-Math.PI/2;
  box(g,.38,.18,.3,teal,.12,.18,0);box(g,.12,.28,.42,ivory,.33,.23,0);
  actor(g,-.33,.15,-.16,.38);actor(g,-.3,.15,.2,.38);
  for(const z of [-.37,.37]){box(g,.48,.08,.14,ivory,-.12,.08,z);box(g,.12,.09,.12,coral,-.48,.07,z);}
  return g;
 }
 const ship=craft(),testShip=craft();testShip.scale.setScalar(.8);
 const diagnostic=new T.Group();scene.add(diagnostic);
 const frame=line([[-1.2,.4,.55],[-1.2,.65,.55],[-.8,.65,.55],[-.8,.65,.55]].map(p=>new T.Vector3(...p)),palette.ivory,.9,diagnostic);
 for(let i=0;i<3;i++){const ghost=box(diagnostic,.3,.015,.32,glass,-1.2+i*.38,.15-i*.33,.1);ghost.rotation.z=-i*.3;}
 let mobile=false;
 const project=p=>{const v=new T.Vector3(...p).project(camera);return[(v.x+1)/2,(1-v.y)/2];};
 function resize(w,h,phone){mobile=phone;renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(mobile?6:3,mobile?11:8,mobile?17:14);camera.fov=mobile?58:37;camera.updateProjectionMatrix();}
 function draw(state,time,progress,shotTime){
  const phase=state.phase,change=state.change,preview=phase===2;
  const close=phase===1?1:0;
  camera.position.lerp(new T.Vector3(mobile?6:3,mobile?11:8-close,mobile?17:14-close*2),.15);
  camera.lookAt(mobile?0:-1.7,mobile?1.2:1.35,0);camera.updateMatrixWorld();
  diagnostic.visible=phase===1;frame.rotation.y=Math.sin(time*.2)*.025;
  routeLine.material.opacity=phase>=2?.65:.06;routeLine.material.color.set(change>.5?palette.mineral:palette.coral);
  oldLine.material.opacity=phase===1?.9:.35;
  const loop=(time*.12)%1;
  const q=phase===1?.64:loop;
  ship.position.set(-3+Math.min(q/.7,1)*3,-Math.max(0,q-.42)*2.3,Math.sin(q*5)*.12).lerp(route.getPoint(q),change);
  const tangent=route.getTangent(q);ship.rotation.set(0,-Math.atan2(tangent.z,tangent.x)*change,-Math.max(0,q-.4)*1.2*(1-change));ship.scale.setScalar(1-Math.max(0,q-.7)*2*(1-change));
  testShip.visible=preview||change>.15;
  if(testShip.visible){const q=((preview?shotTime:time)*.12)%1;testShip.position.copy(route.getPoint(q));const tangent=route.getTangent(q);testShip.rotation.y=-Math.atan2(tangent.z,tangent.x);}
  module.visible=change>.35;arrivals.forEach(a=>a.visible=change>.5);destination.scale.setScalar(1);
  renderer.render(scene,camera);
 }
 return {renderer,camera,pointer,resize,draw,project};
}
