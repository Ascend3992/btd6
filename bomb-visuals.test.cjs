const {test}=require('node:test');
const assert=require('node:assert/strict');
const visuals=import('../bomb-visuals.js'),three=import('../assets/vendor/three.module.js');
function dispose(root){const geometry=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)materials.add(o.material)});geometry.forEach(o=>o.dispose());materials.forEach(o=>o.dispose());}

test('base and all five top models idle and recoil without moving anchors or changing stats',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let tier=0;tier<=5;tier++){
  const t={id:1,paths:[tier,0,0],range:12.8,rate:1.5,damage:4,pierce:80,mesh:v.makeBombTopTowerMesh(tier),fireAnim:0};
  t.mesh.position.set(5,.66,3);t.mesh.rotation.y=.7;
  const anchor=t.mesh.position.clone(),heading=t.mesh.rotation.y,rig=t.mesh.userData.bombRig;
  const before=JSON.stringify({paths:t.paths,range:t.range,rate:t.rate,damage:t.damage,pierce:t.pierce});
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.y>2&&size.y<3.5);assert(size.x<4&&size.z<4);
  v.animateBomb(t,.1);const pose=[rig.weapon.position.y,rig.weapon.rotation.z,rig.weapon.rotation.x];
  v.animateBomb(t,.7);assert.notDeepEqual(pose,[rig.weapon.position.y,rig.weapon.rotation.z,rig.weapon.rotation.x]);
  assert.equal(rig.body.position.y,0,'Carriage remains planted during idle');assert(rig.wheels.every(w=>w.rotation.z===0));
  t.fireAnim=.24;v.animateBomb(t,.12);assert(rig.weapon.position.x<rig.weapon.userData.rest.x);assert(rig.wheels.every(w=>w.rotation.z<0));
  v.animateBomb(t,.3);assert.equal(rig.weapon.position.x,rig.weapon.userData.rest.x);assert(rig.wheels.every(w=>w.rotation.z===0));
  assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,heading);assert.equal(JSON.stringify({paths:t.paths,range:t.range,rate:t.rate,damage:t.damage,pierce:t.pierce}),before);
  dispose(t.mesh);
 }
});

test('upgrade silhouettes retain hollow mouths, wheels and the supplied path details',async()=>{
 const v=await visuals,models=Array.from({length:6},(_,i)=>v.makeBombTopTowerMesh(i));
 for(const model of models){assert(model.getObjectByName('hollow-bore'));assert(model.getObjectByName('bore-shadow'));assert.equal(model.userData.bombRig.wheels.length,2);}
 assert.equal(models[0].getObjectByName('colored-muzzle-band'),undefined);
 assert.equal(models[1].getObjectByName('colored-muzzle-band').material.color.getHex(),0xe40b15);
 assert(models[1].getObjectByName('left-wood-wheel'));assert(models[2].getObjectByName('left-steel-wheel'));assert(models[2].getObjectByName('rear-red-band'));
 assert.equal(models[3].getObjectByName('colored-muzzle-band').material.color.getHex(),0xf2d21a);
 assert(models[4].getObjectByName('green-rear-chevron'));assert(models[4].getObjectByName('green-body-stripe-rear'));
 assert(models[5].getObjectByName('flared-red-muzzle'));assert(models[5].getObjectByName('triangular-red-hub'));assert(models[5].getObjectByName('tire-tread'));
 let spikes=0;models[5].traverse(o=>{if(o.name==='muzzle-spike')spikes++});assert.equal(spikes,12);
 models.forEach(dispose);
});

test('all middle models idle and recoil with planted bases and unchanged anchors',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let tier=1;tier<=5;tier++){
  const t={id:2,paths:[0,tier,0],range:17.28,rate:.825,damage:1,pierce:22,mesh:v.makeBombMiddleTowerMesh(tier),fireAnim:0};
  t.mesh.position.set(4,.66,-3);t.mesh.rotation.y=1.2;
  const rig=t.mesh.userData.bombRig,anchor=t.mesh.position.clone(),stats=JSON.stringify({paths:t.paths,range:t.range,rate:t.rate,damage:t.damage,pierce:t.pierce});
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.y>2&&size.y<3.5);assert(size.x<4&&size.z<4);
  v.animateBomb(t,.1);const pitch=rig.weapon.rotation.z;v.animateBomb(t,.7);assert.notEqual(rig.weapon.rotation.z,pitch);
  if(tier>=2)assert(rig.weapon.rotation.z>.1,'Missile retains its upward resting angle');
  assert.equal(rig.body.position.y,0);t.fireAnim=.24;v.animateBomb(t,.12);assert(rig.weapon.position.x<rig.weapon.userData.rest.x);
  v.animateBomb(t,.4);assert.equal(rig.weapon.position.x,rig.weapon.userData.rest.x);assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,1.2);
  assert.equal(JSON.stringify({paths:t.paths,range:t.range,rate:t.rate,damage:t.damage,pierce:t.pierce}),stats);dispose(t.mesh);
 }
});

test('middle missile models preserve faces, fins, striped bases and matching projectiles',async()=>{
 const v=await visuals,{Vector3}=await three;
 const reload=v.makeBombMiddleTowerMesh(1);assert(reload.getObjectByName('hollow-bore'));assert(reload.getObjectByName('left-wood-wheel'));assert(reload.getObjectByName('missile-tail-fin'));dispose(reload);
 for(let tier=2;tier<=5;tier++){
  const model=v.makeBombMiddleTowerMesh(tier);for(const name of ['launcher-lip','yellow-hazard-stripe','shark-missile-body','white-shark-jaw','angry-white-eye','missile-tail-fin'])assert(model.getObjectByName(name),name);
  const p=v.makeBombMissileProjectile(tier);assert.equal(p.userData.bombMissileTier,tier);assert(p.userData.exhaust);assert(p.getObjectByName('white-shark-jaw'));
  const nose=p.getObjectByName('colored-missile-nose');nose.updateWorldMatrix(true,false);const forward=new Vector3(1,0,0).transformDirection(nose.parent.matrixWorld);assert(forward.z>.99,'Missile flight mesh faces +Z');
  assert.equal(p.getObjectByName('shark-missile-body').material.color.getHex(),model.getObjectByName('shark-missile-body').material.color.getHex());dispose(p);dispose(model);
 }
});

test('bottom models idle, recoil and settle without changing tower placement or combat stats',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let tier=1;tier<=5;tier++){
  const t={id:3,paths:[0,0,tier],rate:tier===5?.9:1.5,damage:tier===5?5:1,pierce:22,mesh:v.makeBombBottomTowerMesh(tier),fireAnim:0};
  t.mesh.position.set(-4,.66,7);t.mesh.rotation.y=.9;
  const rig=t.mesh.userData.bombRig,anchor=t.mesh.position.clone(),stats=JSON.stringify([t.paths,t.rate,t.damage,t.pierce]);
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.y>2&&size.y<3.5);assert(size.x<4&&size.z<4);
  v.animateBomb(t,.1);const pose=rig.weapon.rotation.z,glow=rig.glow?.coronaMaterial.opacity;
  v.animateBomb(t,.7);assert.notEqual(rig.weapon.rotation.z,pose);if(rig.glow)assert.notEqual(rig.glow.coronaMaterial.opacity,glow);
  assert.equal(rig.body.position.y,0);t.fireAnim=.24;v.animateBomb(t,.12);assert(rig.weapon.position.x<rig.weapon.userData.rest.x);
  v.animateBomb(t,.4);assert.equal(rig.weapon.position.x,rig.weapon.userData.rest.x);assert(rig.wheels.every(w=>w.rotation.z===0));
  assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.9);assert.equal(JSON.stringify([t.paths,t.rate,t.damage,t.pierce]),stats);dispose(t.mesh);
 }
});

test('bottom cannons retain reference details and transition from wheels to fixed pedestals',async()=>{
 const v=await visuals,models=Array.from({length:5},(_,i)=>v.makeBombBottomTowerMesh(i+1));
 assert(models[0].getObjectByName('red-target-mark'));assert(models[0].getObjectByName('left-wood-wheel'));
 assert(models[1].getObjectByName('red-frag-starburst'));assert(models[1].getObjectByName('left-steel-wheel'));
 assert(models[1].getObjectByName('thick-muzzle-rim').position.x>models[0].getObjectByName('thick-muzzle-rim').position.x);
 assert.equal(models[2].getObjectByName('rounded-cannon-shell').material.color.getHex(),0x70bc0a);
 for(let i=0;i<3;i++){assert(models[i].getObjectByName('hollow-bore'));assert.equal(models[i].userData.bombRig.wheels.length,2);}
 for(let i=3;i<5;i++){assert(models[i].getObjectByName('triangular-cannon-cradle'));assert(models[i].getObjectByName('yellow-barrel-bolt'));assert.equal(models[i].userData.bombRig.wheels.length,0);}
 assert(models[4].getObjectByName('blitz-glowing-muzzle'));assert(models[4].getObjectByName('blitz-muzzle-halo'));assert(models[4].getObjectByName('pedestal-bolt'));
 models.forEach(dispose);
});
