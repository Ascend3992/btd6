const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
const visuals=import('../boomerang-visuals.js');
const three=import('../assets/vendor/three.module.js');
function dispose(root){
 root.removeFromParent();const geometries=new Set(),materials=new Set();
 root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material)});
 geometries.forEach(o=>o.dispose());materials.forEach(o=>o.dispose());
}
function tower(v,paths=[0,0,0]){
 const t={id:1,x:0,z:0,rate:1.2,damage:1,pierce:4,paths,mesh:v.makeBoomerangTowerMesh(),abilityTimer:0};
 v.updateBoomerangAppearance(t,dispose);return t;
}

test('all 15 upgrade models idle, blink and sway without moving tower anchors or stats',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let path=0;path<3;path++)for(let tier=1;tier<=5;tier++){
  const paths=[0,0,0];paths[path]=tier;const t=tower(v,paths),rig=t.mesh.userData.boomerRig;
  const before=JSON.stringify({paths:t.paths,rate:t.rate,damage:t.damage,pierce:t.pierce});
  const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());
  assert(size.y>2&&size.y<3.6,'Model stays at the existing tower scale');
  v.animateBoomerang(t,.1);const pose=[rig.body.position.y,rig.head.rotation.z,rig.tail.rotation.y,rig.offArm.rotation.x];
  v.animateBoomerang(t,.7);assert.notDeepEqual(pose,[rig.body.position.y,rig.head.rotation.z,rig.tail.rotation.y,rig.offArm.rotation.x]);
  t.boomerIdleTime=3.97;v.animateBoomerang(t,.01);assert(rig.eyes.every(eye=>eye.scale.y<.03));
  v.animateBoomerang(t,.3);assert(rig.eyes.every(eye=>eye.scale.y>.10));
  assert.deepEqual(t.mesh.position.toArray(),[0,0,0]);
  assert.equal(JSON.stringify({paths:t.paths,rate:t.rate,damage:t.damage,pierce:t.pierce}),before);
  dispose(t.mesh);
 }
});

test('throws animate the source tower during buffs and rapid throws keep moving each frame',async()=>{
 const v=await visuals,t=tower(v,[0,5,0]),attack={...t,sourceTower:t,rate:.03};
 const target={mesh:{position:{x:5,z:0}}},angles=[];
 for(let i=0;i<8;i++){
  v.triggerBoomerangThrow(attack,target);v.animateBoomerang(t,.04);
  angles.push(t.mesh.userData.boomerRig.throwArm.rotation.x);
 }
 assert(new Set(angles.map(angle=>angle.toFixed(4))).size>6);
 assert(t.boomerThrowTimer>0);assert.equal(attack.boomerThrowTimer,undefined);
 assert(t.mesh.rotation.y>1,'Tower turns toward the target');
 const rig=t.mesh.userData.boomerRig;t.abilityTimer=10;t.activeAbility={kind:'turbo'};
 v.animateBoomerang(t,.01);assert(rig.glowMaterials.every(mat=>mat.emissiveIntensity>.4));
 t.abilityTimer=0;v.animateBoomerang(t,1);assert.equal(t.boomerThrowTimer,0);assert(rig.weapon.visible);
 assert(Math.abs(rig.throwArm.rotation.x)<1e-10,'Throwing arm returns to idle');dispose(t.mesh);
});

test('crosspaths preserve the primary outfit, update the weapon and dispose replaced geometry',async()=>{
 const v=await visuals,t=tower(v,[0,3,0]),old=t.mesh.userData.boomerRig.root;let released=0;
 old.traverse(o=>{if(o.geometry)o.geometry.addEventListener('dispose',()=>released++)});
 t.paths[0]=2;v.updateBoomerangAppearance(t,dispose);
 const rig=t.mesh.userData.boomerRig;assert.equal(rig.root.name,'Bionic Boomerang');assert.equal(rig.weaponKind,'glaive');
 assert.equal(old.parent,null);assert(released>0);
 v.updateBoomerangAppearance(t,dispose);assert.equal(t.mesh.userData.boomerRig,rig,'Repeated appearance updates reuse the rig');
 t.mesh.scale.x=-1;t.paths[1]=4;v.updateBoomerangAppearance(t,dispose);assert.equal(t.mesh.scale.x,-1);
 assert.equal(t.mesh.userData.boomerRig.root.name,'Turbo Charge');dispose(t.mesh);
});

test('glaive, Kylie and charged projectile geometry matches the weapon used by the model',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(const paths of [[2,0,0],[5,0,2],[0,5,2],[0,0,3],[2,0,5]]){
  const t=tower(v,paths),kind=v.boomerangProjectileKind(t),shot=v.makeBoomerangWeapon(kind);
  assert.equal(t.mesh.userData.boomerRig.weaponKind,kind);
  if(kind.toLowerCase().includes('glaive'))assert.equal(shot.children.filter(o=>o.name==='glaive-blade').length,4);
  const size=new Box3().setFromObject(shot).getSize(new Vector3());
  assert(size.y<.4&&size.x>.5&&size.z>.5,'Flying weapons lie flat and remain visible');
  dispose(shot);dispose(t.mesh);
 }
 const t=tower(v,[0,0,4]);assert.equal(v.boomerangProjectileKind(t,true),'pressKylie');dispose(t.mesh);
});

test('Glaive Lord orbitals orbit and spin between rounds while retaining the larger damage zone',async()=>{
 const v=await visuals,g=game(),t=g.createTower('boomer',0,0);t.mesh=v.makeBoomerangTowerMesh();
 for(let i=0;i<5;i++)upgrade(g,t,0);
 g.makeProjectileMesh=v.makeBoomerangWeapon;g.disposeTransientMesh=dispose;
 const target=enemy(8);g.enemies=[target];g.updateGlaiveLord(t,0,.1);
 assert.equal(t.orbitGlaives.length,3);const orbital=t.orbitGlaives[0],position=orbital.position.clone(),spin=orbital.rotation.y;
 g.updateGlaiveLord(t,0,.25);assert(!orbital.position.equals(position));assert(orbital.rotation.y>spin);assert.equal(target.hp,10000);
 assert(Math.hypot(orbital.position.x,orbital.position.z)<3,'Orbitals visibly surround the tower');
 g.updateGlaiveLord(t,.08,0);assert.equal(target.hp,9998,'The 30-unit damage zone stays intact');
 const old=t.orbitGlaives;upgrade(g,t,2);upgrade(g,t,2);g.updateGlaiveLord(t,0,0);
 assert(old.every(mesh=>mesh.parent===null));assert(t.orbitGlaives.every(mesh=>mesh.userData.weaponKind==='hotLordGlaive'));
 dispose(t.mesh);
});
