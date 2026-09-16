const {test}=require('node:test'),assert=require('node:assert/strict');
const imports=Promise.all([import('../src/assets/vendor/three/three.module.min.js'),import('../src/assets/js/observatory-craft.mjs')]);
test('observatory has a dimensional silhouette and retains a coral decision core',async()=>{
 const [T,{makeCraft}]=await imports,craft=makeCraft(T),size=new T.Box3().setFromObject(craft.group).getSize(new T.Vector3());
 assert.ok(size.y>size.x*1.35&&size.z>.15, "lateral vanes must dominate the forward spine");assert.equal(craft.core.material.color.getHex(),0xe8735a);
 craft.group.traverse(o=>{if(o.geometry)for(const value of o.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
});
test('craft turns toward attention in three dimensions rather than billboarding',async()=>{
 const [T,{makeCraft}]=await imports,craft=makeCraft(T);craft.update({time:0,angle:0,still:true});const start=craft.body.quaternion.clone();
 craft.update({time:0,angle:Math.PI/2,still:true});assert.ok(start.angleTo(craft.body.quaternion)>1.5);
 const axis=new T.Vector3(1,0,0).applyQuaternion(craft.body.quaternion);assert.ok(Math.abs(axis.z)>.1);
});
test('reduced motion keeps pose and core fixed; attention increases instrumentation',async()=>{
 const [T,{makeCraft}]=await imports,craft=makeCraft(T);craft.update({time:1,angle:.3,still:true});const pose=craft.body.quaternion.clone(),core=craft.core.rotation.y,emission=craft.core.material.emissiveIntensity;
 craft.update({time:900,angle:.3,still:true});assert.ok(pose.angleTo(craft.body.quaternion)<1e-6);assert.equal(craft.core.rotation.y,core);
 craft.update({time:900,angle:.3,still:true,attention:1});assert.ok(craft.core.material.emissiveIntensity>emission);
});
