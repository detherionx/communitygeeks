const {test}=require('node:test'),assert=require('node:assert/strict');
const model=import('../src/assets/js/intent-field.mjs');
test('scroll reveals diagnosis before the pilot and changes the main system last',async()=>{
 const {fieldState}=await model;
 const observe=fieldState(.12),research=fieldState(.4),pilot=fieldState(.66),built=fieldState(1);
 assert.deepEqual([observe.phase,research.phase,pilot.phase,built.phase],[0,1,2,3]);
 assert.ok(research.diagnosis>.9);assert.equal(research.change,0);assert.equal(research.pilot,0);
 assert.equal(pilot.pilot,1);assert.equal(pilot.change,0);assert.equal(built.change,1);assert.equal(built.pilot,0);
});
test('scrubbing backwards restores the original problem without accumulated state',async()=>{
 const {fieldState}=await model,start=fieldState(.12);
 for(const p of [.4,.66,1,.66,.4])fieldState(p);
 assert.deepEqual(fieldState(.12),start);
});
test('comparison can show before and after at the same narrative position',async()=>{
 const {fieldState}=await model;
 assert.equal(fieldState(.9,0).change,0);assert.equal(fieldState(.9,1).change,1);
 assert.equal(fieldState(.9,.45).change,.45);
 assert.equal(fieldState(-1).phase,0);assert.equal(fieldState(2).phase,3);
 assert.equal(fieldState(.9,2).change,1);assert.equal(fieldState(.9,-1).change,0);
});

test('comparison removes experimental and diagnostic overlays even during the pilot',async()=>{
 const {fieldState}=await model;
 for(const value of [0,.5,1])assert.deepEqual(fieldState(.66,value),{phase:3,diagnosis:0,pilot:0,change:value});
});
