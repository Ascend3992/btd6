const {test}=require('node:test'),assert=require('node:assert/strict');
test('reference Glue Gunner holds its gun, idles, blinks and recoils with stationary planted feet',async()=>{
 const v=await import('../glue-visuals.js'),THREE=await import('../assets/vendor/three.module.js');
 const t={id:0,x:4,z:-3,mesh:v.makeBaseGlueTowerMesh(),fireAnim:0};t.mesh.position.set(t.x,.66,t.z);t.mesh.rotation.y=.5;
 const rig=t.mesh.userData.glueRig,anchor=t.mesh.position.clone(),feet=rig.feet.map(f=>f.getWorldPosition(new THREE.Vector3())),size=new THREE.Box3().setFromObject(t.mesh).getSize(new THREE.Vector3());
 assert(size.x<3.9&&size.y>2.9&&size.y<3.8&&size.z<4);
 for(const name of ['yellow-backpack-glue-tank','green-backpack-strap','yellow-glue-gun-body','green-glue-nozzle','curled-brown-tail','pointed-brown-hair','gun-gripping-hand'])assert(t.mesh.getObjectByName(name),name);
 v.animateGlue(t,.1);const idle=rig.pose.position.y;v.animateGlue(t,.5);assert.notEqual(rig.pose.position.y,idle);
 const rest=t.mesh.userData.weapon.position.z;t.fireAnim=.24;v.animateGlue(t,.12);assert(t.mesh.userData.weapon.position.z<rest-.1);v.animateGlue(t,.5);assert.equal(t.fireAnim,0);assert.equal(t.mesh.userData.weapon.position.z,rest);
 assert(t.mesh.position.equals(anchor));assert(rig.feet.every((f,i)=>f.getWorldPosition(new THREE.Vector3()).equals(feet[i])));
 assert(v.glueMuzzleOrigin(t).distanceTo(rig.muzzle.getWorldPosition(new THREE.Vector3()))<1e-10);
 t.glueIdleTime=4.8;v.animateGlue(t,.03);assert(rig.eyes.every(eye=>eye.scale.y===.1));v.animateGlue(t,.2);assert(rig.eyes.every(eye=>eye.scale.y===1));
});

test('middle reference gear shoots and casts with planted feet and four reusable animated Storm hoses',async()=>{
 const v=await import('../glue-visuals.js'),THREE=await import('../assets/vendor/three.module.js');
 const features=[['pointed-brown-hair','green-bigger-globs-cannon','oversized-orange-nozzle'],['orange-splatter-hood','bronze-splatter-goggle','oversized-orange-nozzle'],['yellow-hose-hood','black-hazmat-goggle','wide-glue-hose-cannon'],['yellow-strike-hood','twin-dark-glue-reservoirs','twin-reservoir-carry-handle','long-glue-strike-cannon'],['orange-storm-hood','heavy-glue-storm-cannon','storm-auxiliary-nozzle']];
 for(let tier=1;tier<=5;tier++){
  const t={id:0,type:'glue',paths:[0,tier,0],x:3,z:-4,mesh:v.makeGlueMiddleTowerMesh(tier),damage:0,pierce:tier===1?2:5,rate:tier>=3?1/3:1,abilityCd:19,abilityTimer:7,fireAnim:0};
  t.mesh.position.set(t.x,.66,t.z);t.mesh.rotation.y=.35;
  const rig=t.mesh.userData.glueRig,feet=rig.feet.map(f=>f.getWorldPosition(new THREE.Vector3())),anchor=t.mesh.position.clone(),stats=JSON.stringify([t.paths,t.damage,t.pierce,t.rate,t.abilityCd,t.abilityTimer]);
  assert.equal(t.mesh.userData.glueModelTier,tier);assert.equal(t.mesh.userData.glueModelPath,1);for(const name of features[tier-1])assert(t.mesh.getObjectByName(name),name);
  assert(!rig.respirator);assert(!t.mesh.getObjectByName('gray-respirator-faceplate'));assert.equal(!!t.mesh.getObjectByName('tan-monkey-muzzle'),tier<=2);assert.equal(rig.glueMaterial.color.getHex(),0xffde12);
  const size=new THREE.Box3().setFromObject(t.mesh).getSize(new THREE.Vector3());assert(size.x<4&&size.y<3.8&&size.z<4,JSON.stringify({tier,size}));
  assert.equal(t.mesh.children.length,1);assert.equal(rig.stormHoses.length,tier===5?4:0);
  const geometries=[];t.mesh.traverse(o=>{if(o.geometry)geometries.push(o.geometry)});v.animateGlue(t,.1);const idle=rig.pose.position.y;v.animateGlue(t,.4);assert.notEqual(rig.pose.position.y,idle);
  const rest=t.mesh.userData.weapon.position.clone();t.fireAnim=.24;v.animateGlue(t,.12);assert(t.mesh.userData.weapon.position.z<rest.z-.1);assert(rig.sprays.every(s=>s.visible));assert(v.glueMuzzleOrigin(t).distanceTo(rig.muzzle.getWorldPosition(new THREE.Vector3()))<1e-10);
  v.animateGlue(t,.5);assert(t.mesh.userData.weapon.position.equals(rest));assert(rig.sprays.every(s=>!s.visible));
  if(tier>=4){t.glueAbilityAnim=.65;v.animateGlue(t,.325);assert(rig.sprays.every(s=>s.visible));assert(t.mesh.userData.weapon.position.z<rest.z-.1);if(tier===5){assert(rig.stormHoses.every(h=>h.jet.visible));const z=rig.stormHoses[0].pivot.rotation.z;v.animateGlue(t,.1);assert.notEqual(rig.stormHoses[0].pivot.rotation.z,z);}v.animateGlue(t,1);assert.equal(t.glueAbilityAnim,0);assert(rig.stormHoses.every(h=>!h.jet.visible));}
  assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.35);assert(rig.feet.every((f,i)=>f.getWorldPosition(new THREE.Vector3()).equals(feet[i])));assert.equal(JSON.stringify([t.paths,t.damage,t.pierce,t.rate,t.abilityCd,t.abilityTimer]),stats);
  const after=[];t.mesh.traverse(o=>{if(o.geometry)after.push(o.geometry)});assert.deepEqual(after,geometries);
 }
});

test('five reference top models have distinct gear, planted feet and attached idle/shooting rigs',async()=>{
 const v=await import('../glue-visuals.js'),THREE=await import('../assets/vendor/three.module.js');
 const features=[['gray-glue-soak-cap','green-glue-soak-gun'],['purple-corrosive-hood','bronze-corrosive-goggle','gray-corrosive-sprayer'],['blue-dissolver-hood','perforated-gray-respirator','twin-green-solvent-tanks'],['navy-liquefier-hood','capsule-fed-liquefier-cannon','gun-mounted-solvent-vial'],['green-solver-hood','solver-backpack-reactor','black-bloon-solver-cannon','solver-side-ampoule']];
 for(let tier=1;tier<=5;tier++){
  const t={id:0,type:'glue',paths:[tier,0,0],x:3,z:-4,mesh:v.makeGlueTopTowerMesh(tier),damage:0,pierce:5,rate:.5,fireAnim:0};t.mesh.position.set(t.x,.66,t.z);t.mesh.rotation.y=.35;
  const rig=t.mesh.userData.glueRig,anchor=t.mesh.position.clone(),feet=rig.feet.map(f=>f.getWorldPosition(new THREE.Vector3())),stats=JSON.stringify([t.paths,t.damage,t.pierce,t.rate]);
  assert.equal(t.mesh.userData.glueModelTier,tier);assert.equal(t.mesh.userData.glueModelPath,0);for(const name of features[tier-1])assert(t.mesh.getObjectByName(name),name);
  const size=new THREE.Box3().setFromObject(t.mesh).getSize(new THREE.Vector3());assert(size.x<4&&size.y<3.8&&size.z<4,JSON.stringify({tier,size}));
  assert(t.mesh.children.every(c=>c===t.mesh.userData.body));assert.equal(rig.head.parent,rig.pose);assert.equal(t.mesh.userData.weapon.parent,rig.pose);assert.equal(rig.tail.parent,rig.pose);
  v.animateGlue(t,.1);const idle=rig.pose.position.y,tail=rig.tail.rotation.y;v.animateGlue(t,.4);assert.notEqual(rig.pose.position.y,idle);assert.notEqual(rig.tail.rotation.y,tail);assert(rig.sprays.every(s=>!s.visible));
  const rest=t.mesh.userData.weapon.position.clone(),hand=rig.arms[0].getWorldPosition(new THREE.Vector3()),muzzle=v.glueMuzzleOrigin(t);t.fireAnim=.24;v.animateGlue(t,.12);
  assert(t.mesh.userData.weapon.position.z<rest.z-.1);assert(rig.sprays.every(s=>s.visible));assert(rig.arms[0].getWorldPosition(new THREE.Vector3()).distanceTo(hand)>.05);assert(v.glueMuzzleOrigin(t).distanceTo(muzzle)>.05);assert(v.glueMuzzleOrigin(t).distanceTo(rig.muzzle.getWorldPosition(new THREE.Vector3()))<1e-10);
  assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.35);assert(rig.feet.every((f,i)=>f.getWorldPosition(new THREE.Vector3()).equals(feet[i])));assert.equal(JSON.stringify([t.paths,t.damage,t.pierce,t.rate]),stats);
  v.animateGlue(t,.5);assert.equal(t.fireAnim,0);assert(t.mesh.userData.weapon.position.equals(rest));assert(rig.sprays.every(s=>!s.visible));assert(rig.droplet.scale.y>.10);
  if(tier>=3){assert(rig.fluids.length>=2);assert(rig.respirator);assert(rig.steam);}
 }
});

test('real upgrade appearance swaps dispose old models, preserve state, avoid duplicate rebuilding and follow dominant paths',async()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),v=await import('../glue-visuals.js'),THREE=await import('../assets/vendor/three.module.js');
 const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8'),g={THREE,makeBaseGlueTowerMesh:v.makeBaseGlueTowerMesh,makeGlueTopTowerMesh:v.makeGlueTopTowerMesh,makeGlueMiddleTowerMesh:v.makeGlueMiddleTowerMesh,mat:color=>new THREE.MeshStandardMaterial({color})};vm.createContext(g);
 for(const [start,end] of [['function disposeTransientMesh(','function spawnAbilityPulse('],['function replaceTowerBody(','function makeDartTopMesh('],['function updateWeaponAppearance(','function removeUpgradeVisuals('],['function removeUpgradeVisuals(','function updateHeroAppearance(']])vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),g);
 const t={id:77,type:'glue',paths:[0,0,0],mesh:v.makeBaseGlueTowerMesh(),cool:.4,abilityCd:15,invest:5000,damageDealt:123,fireAnim:0};t.mesh.position.set(2,.66,-3);t.mesh.rotation.y=.4;
 const root=t.mesh,state=JSON.stringify([t.id,t.cool,t.abilityCd,t.invest,t.damageDealt]),anchor=root.position.clone();
 for(let tier=1;tier<=5;tier++){
  const old=t.mesh.userData.body,geometries=new Set();old.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});let disposed=0;for(const geometry of geometries)geometry.addEventListener('dispose',()=>disposed++);
  t.paths[0]=tier;g.updateTowerAppearance(t);assert.equal(old.parent,null);assert.equal(disposed,geometries.size);assert.equal(t.mesh,root);assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.4);assert.equal(JSON.stringify([t.id,t.cool,t.abilityCd,t.invest,t.damageDealt]),state);
  const body=t.mesh.userData.body;g.updateTowerAppearance(t);assert.equal(t.mesh.userData.body,body);assert.equal(t.mesh.children.length,1);
 }
 t.paths=[5,2,0];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.glueModelTier,5);t.paths=[5,0,2];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.glueModelTier,5);
 t.paths=[2,3,0];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.glueModelTier,3);assert.equal(t.mesh.userData.glueModelPath,1);const middle=t.mesh.userData.body;t.paths=[0,3,2];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.body,middle);t.paths=[3,2,0];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.glueModelTier,3);assert.equal(t.mesh.userData.glueModelPath,0);assert.notEqual(t.mesh.userData.body,middle);t.paths=[2,0,3];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.glueModelTier,0);t.paths=[2,2,0];g.updateTowerAppearance(t);assert.equal(t.mesh.userData.glueModelTier,2);assert.equal(t.mesh.children.length,1);
});
