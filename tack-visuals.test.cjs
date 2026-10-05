const {test}=require('node:test');
const assert=require('node:assert/strict');
const visuals=import('../tack-visuals.js'),three=import('../assets/vendor/three.module.js');

test('base Tack idle and port recoil settle without moving the chassis or changing stats',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 const t={id:4,paths:[0,0,0],damage:1,pierce:1,tacks:8,rate:1.12,mesh:v.makeBaseTackTowerMesh(),fireAnim:0};
 t.mesh.position.set(3,.66,-5);t.mesh.rotation.y=.42;
 const rig=t.mesh.userData.tackRig,anchor=t.mesh.position.clone(),stats=JSON.stringify([t.paths,t.damage,t.pierce,t.tacks,t.rate]);
 const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.x<3.5&&size.z<3.5);assert(size.y>1.8&&size.y<2.5);
 v.animateTack(t,.1);const idle=rig.lid.position.y;v.animateTack(t,.6);assert.notEqual(rig.lid.position.y,idle);
 t.fireAnim=.24;v.animateTack(t,.12);assert(rig.ports.every(p=>Math.hypot(p.position.x,p.position.z)<Math.hypot(p.userData.rest.x,p.userData.rest.z)));
 v.animateTack(t,.4);assert.equal(t.fireAnim,0);assert(rig.ports.every(p=>Math.abs(p.position.length()-p.userData.rest.length())<.01));
 assert.equal(rig.body.position.y,0);assert.equal(rig.body.rotation.y,0);assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.42);
 assert.equal(JSON.stringify([t.paths,t.damage,t.pierce,t.tacks,t.rate]),stats);
});

test('eight hollow Tack ports expose world-space muzzles aligned with radial firing directions',async()=>{
 const v=await visuals,{Vector3}=await three,t={mesh:v.makeBaseTackTowerMesh()};
 t.mesh.position.set(6,.66,-3);t.mesh.rotation.y=.8;
 const rig=t.mesh.userData.tackRig;assert.equal(rig.ports.length,8);
 for(let i=0;i<8;i++){
  const port=rig.ports[i],origin=v.tackMuzzleOrigin(t,i),direction=new Vector3(0,0,1).transformDirection(port.matrixWorld);
  const radial=new Vector3(origin.x-t.mesh.position.x,0,origin.z-t.mesh.position.z).normalize();
  assert(direction.dot(radial)>.999);assert(Math.abs(origin.y-1.79)<.001);
  assert(port.getObjectByName('dark-port-bore'));assert(port.getObjectByName('port-bore-shadow'));assert(port.getObjectByName('silver-port-lip'));
 }
 assert(t.mesh.getObjectByName('crossed-tack-emblem'));assert(t.mesh.getObjectByName('upper-band-rivet'));assert(t.mesh.getObjectByName('lower-band-rivet'));
});

test('all top-path rigs animate and settle on their anchored chassis, including furnace and meteor surges',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let tier=1;tier<=5;tier++){
  const t={id:11,paths:[tier,0,0],damage:tier,rate:.5,mesh:v.makeTackTopTowerMesh(tier),fireAnim:0};
  const rig=t.mesh.userData.tackRig,anchor=t.mesh.position.clone(),stats=JSON.stringify([t.paths,t.damage,t.rate]);
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.x<3.9&&size.z<3.9&&size.y<3.6);
  v.animateTack(t,.1);const pose=rig.lid.position.y;v.animateTack(t,.4);assert.notEqual(rig.lid.position.y,pose);
  t.fireAnim=.24;v.animateTack(t,.12);assert(rig.ports.every(p=>Math.hypot(p.position.x,p.position.z)<1.04));
  if(tier>=4){assert(rig.flames.length>=7);assert(!t.mesh.getObjectByName('pink-top-cap'));assert(rig.glow.emissiveIntensity>1.5);
   const heights=rig.flames.map(f=>f.scale.y);v.animateTack(t,.08);assert(rig.flames.some((f,i)=>f.scale.y!==heights[i]));
  }
  if(tier===5){assert.equal(rig.jets.length,4);t.meteorAnim=.30;v.animateTack(t,.15);assert(rig.glow.emissiveIntensity>1.7);}
  v.animateTack(t,1);assert.equal(t.fireAnim,0);assert.equal(t.meteorAnim,0);assert(rig.ports.every(p=>Math.abs(p.position.length()-p.userData.rest.length())<.01));
  assert(t.mesh.position.equals(anchor));assert.equal(rig.body.rotation.y,0);assert.equal(JSON.stringify([t.paths,t.damage,t.rate]),stats);
 }
});

test('extra-tack crosspaths retain the top outfit and align every shot to a physical port',async()=>{
 const v=await visuals,{Vector3}=await three;
 for(const tier of [1,2,3])for(const count of [8,10,12]){
  const t={mesh:v.makeTackTopTowerMesh(tier,count)};t.mesh.position.set(4,.66,7);t.mesh.rotation.y=.63;
  assert.equal(t.mesh.userData.tackRig.ports.length,count);
  for(let i=0;i<count;i++){
   const origin=v.tackMuzzleOrigin(t,(count-i)%count),angle=Math.PI/2-t.mesh.rotation.y+i*Math.PI*2/count;
   const radial=new Vector3(origin.x-4,0,origin.z-7).normalize();assert(radial.dot(new Vector3(Math.cos(angle),0,Math.sin(angle)))>.999);
  }
 }
});

test('middle-path models keep the chassis grounded while their blades and rotors spin',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let tier=1;tier<=5;tier++){
  const t={id:5,paths:[0,tier,0],damage:5,rate:1.12,mesh:v.makeTackMiddleTowerMesh(tier),fireAnim:0};t.mesh.position.set(4,.66,-2);
  const rig=t.mesh.userData.tackRig,anchor=t.mesh.position.clone(),pose=rig.lid.position.y;
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.x<4&&size.z<4&&size.y<3);
  v.animateTack(t,.25);assert.notEqual(rig.lid.position.y,pose);assert(t.mesh.position.equals(anchor));assert.equal(rig.body.rotation.y,0);
  t.fireAnim=.24;v.animateTack(t,.12);assert(rig.ports.every(p=>Math.hypot(p.position.x,p.position.z)<1.04));
  if(tier>=3){const spin=rig.blades[0].rotation.z;v.animateTack(t,.05);assert.notEqual(rig.blades[0].rotation.z,spin);}
  if(tier>=4){
   t.fireAnim=0;const before=rig.rotor.rotation.y;t.activeAbility={kind:'maelstrom',direction:1};t.abilityTimer=1;v.animateTack(t,.1);assert(rig.rotor.rotation.y<before-1);
   if(tier===4){const clockwise=rig.rotor.rotation.y;t.activeAbility.direction=-1;v.animateTack(t,.1);assert(rig.rotor.rotation.y>clockwise+1);}
   t.activeAbility=null;t.abilityTimer=0;v.animateTack(t,.5);assert(Math.abs(rig.rotor.position.y-rig.rotor.userData.rest.y)<.01);
  }
  if(tier===5){assert.equal(rig.satellites.length,4);const orbit=rig.orbit.rotation.y;v.animateTack(t,.5);assert.notEqual(rig.orbit.rotation.y,orbit);}
  v.animateTack(t,.5);assert.equal(t.fireAnim,0);assert(t.mesh.position.equals(anchor));assert.equal(t.damage,5);assert.equal(t.rate,1.12);
 }
});

test('middle-path radial volleys and ability waves originate at their matching launchers',async()=>{
 const v=await visuals,{Vector3}=await three;
 for(let tier=1;tier<=5;tier++)for(const count of [8,10,12]){
  const t={mesh:v.makeTackMiddleTowerMesh(tier,count)};t.mesh.position.set(4,.66,7);t.mesh.rotation.y=.43;
  assert.equal(t.mesh.userData.tackRig.ports.length,count);
  for(let i=0;i<count;i++){
   const origin=v.tackMuzzleOrigin(t,(count-i)%count),angle=Math.PI/2-.43+i*Math.PI*2/count;
   const radial=new Vector3(origin.x-4,0,origin.z-7).normalize();assert(radial.dot(new Vector3(Math.cos(angle),0,Math.sin(angle)))>.999);
  }
  if(tier>=4){for(const angle of [0,1,2,3]){const origin=v.tackAbilityOrigin(t,angle);assert(origin.y>2.8);assert(Math.abs(origin.x-4-Math.cos(angle)*.95)<.001);assert(Math.abs(origin.z-7-Math.sin(angle)*.95)<.001);}}
 }
});

test('bottom-path port layouts align all 10/12/16/16/32 real firing directions, including staggered rows',async()=>{
 const v=await visuals,{Vector3,Box3}=await three;
 for(let tier=1;tier<=5;tier++){
  const t={mesh:v.makeTackBottomTowerMesh(tier)};t.mesh.position.set(6,.66,-3);t.mesh.rotation.y=.72;
  const rig=t.mesh.userData.tackRig,count=[10,12,16,16,32][tier-1];assert.equal(rig.ports.length,count);
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.x<3.7&&size.z<3.7&&size.y<2.6);
  const rows=new Set();
  for(let i=0;i<count;i++){
   const origin=v.tackMuzzleOrigin(t,(count-i)%count),angle=Math.PI/2-.72+i*Math.PI*2/count;
   const radial=new Vector3(origin.x-6,0,origin.z+3).normalize();assert(radial.dot(new Vector3(Math.cos(angle),0,Math.sin(angle)))>.999);rows.add(origin.y.toFixed(2));
  }
  assert.equal(rows.size,tier>=3?2:1);
  if(tier===4)assert(t.mesh.getObjectByName('overdrive-red-star'));
  if(tier===5)assert(t.mesh.getObjectByName('tack-zone-skull'));
 }
});

test('bottom-path idle and volley recoil settle without moving the chassis or altering attack stats',async()=>{
 const v=await visuals;
 for(let tier=1;tier<=5;tier++){
  const t={id:7,paths:[0,0,tier],damage:1,pierce:2,tacks:[10,12,16,16,32][tier-1],rate:.2,mesh:v.makeTackBottomTowerMesh(tier),fireAnim:0};
  const rig=t.mesh.userData.tackRig,anchor=t.mesh.position.clone(),stats=JSON.stringify([t.paths,t.damage,t.pierce,t.tacks,t.rate]);
  v.animateTack(t,.1);const pose=rig.lid.position.y;v.animateTack(t,.4);assert.notEqual(rig.lid.position.y,pose);
  t.fireAnim=.24;v.animateTack(t,.12);assert(rig.ports.every(p=>Math.hypot(p.position.x,p.position.z)<1.04));
  if(tier>=4){assert(rig.glow.emissiveIntensity>1.7);assert.equal(rig.sensors.length,8);}
  v.animateTack(t,.5);assert.equal(t.fireAnim,0);assert(rig.ports.every(p=>Math.abs(Math.hypot(p.position.x,p.position.z)-1.04)<.01));
  assert(t.mesh.position.equals(anchor));assert.equal(rig.body.rotation.y,0);assert.equal(JSON.stringify([t.paths,t.damage,t.pierce,t.tacks,t.rate]),stats);
 }
});
