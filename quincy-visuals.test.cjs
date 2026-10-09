const {test}=require('node:test'),assert=require('node:assert/strict');

test('Quincy milestone models keep their reference gear and animate the bow with planted feet',async()=>{
 const v=await import('../quincy-visuals.js'),THREE=await import('../assets/vendor/three.module.js');
 assert.deepEqual(Array.from({length:20},(_,i)=>v.quincyModelLevel(i+1)),[1,1,3,3,3,3,7,7,7,10,10,10,10,10,10,10,10,10,10,20]);
 for(const level of [1,3,7,10,20]){
  const t={id:0,level,mesh:v.makeQuincyTowerMesh(level),fireAnim:0,rapidTimer:0,stormTimer:0,quincyAbilityAnim:0,rapidCd:17,stormCd:23,damage:1,pierce:9};t.mesh.position.set(2,.66,-3);t.mesh.rotation.y=.45;
  const rig=t.mesh.userData.quincyRig,feet=rig.feet.map(f=>f.getWorldPosition(new THREE.Vector3())),anchor=t.mesh.position.clone(),state=JSON.stringify([t.level,t.damage,t.pierce,t.rapidCd,t.stormCd]);
  for(const name of ['segmented-gray-quincy-helmet','compound-quincy-bow','animated-quincy-bowstring','black-quincy-quiver','right-arrow-nocking-hand','quincy-arrow-launch-point'])assert(t.mesh.getObjectByName(name),name);
  assert.equal(rig.quiver.children.filter(c=>c.name.includes('quiver-arrow')).length,level>=3?5:3);
  assert.equal(!!t.mesh.getObjectByName('yellow-striped-explosive-quiver-arrow'),level>=7);assert.equal(!!t.mesh.getObjectByName('level-10-helmet-wing'),level>=10);assert.equal(!!t.mesh.getObjectByName('orange-level-20-visor'),level===20);assert.equal(!!t.mesh.getObjectByName('level-20-orange-helmet-crest'),level===20);
  const size=new THREE.Box3().setFromObject(t.mesh).getSize(new THREE.Vector3());assert(size.x<4&&size.y<4&&size.z<4,JSON.stringify({level,size}));
  const geometries=[];t.mesh.traverse(o=>{if(o.geometry)geometries.push(o.geometry)});
  v.animateQuincy(t,.1);const idle=rig.pose.position.y;v.animateQuincy(t,.4);assert.notEqual(rig.pose.position.y,idle);
  const hand=rig.drawArm.getWorldPosition(new THREE.Vector3()),rest=t.mesh.userData.weapon.position.clone();t.fireAnim=.24;v.animateQuincy(t,.02);assert(!rig.loadedArrow.visible);v.animateQuincy(t,.10);assert(rig.loadedArrow.visible);assert(rig.drawArm.getWorldPosition(new THREE.Vector3()).distanceTo(hand)>.10);assert(rig.string.geometry.attributes.position.getZ(1)<-.7);assert(t.mesh.userData.weapon.position.z<rest.z);
  assert(v.quincyMuzzleOrigin(t).distanceTo(rig.muzzle.getWorldPosition(new THREE.Vector3()))<1e-10);v.animateQuincy(t,.5);assert(t.mesh.userData.weapon.position.equals(rest));assert(Math.abs(rig.drawArm.position.z)<1e-10);
  t.rapidTimer=8;v.animateQuincy(t,.1);assert(rig.orange.emissiveIntensity>0);t.rapidTimer=0;t.stormTimer=3;t.quincyAbilityAnim=.65;v.animateQuincy(t,.1);assert(rig.abilityArrows.every(a=>a.visible));assert(t.mesh.userData.weapon.rotation.x<0);t.stormTimer=0;v.animateQuincy(t,1);assert(rig.abilityArrows.every(a=>!a.visible));
  assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.45);assert(rig.feet.every((f,i)=>f.getWorldPosition(new THREE.Vector3()).equals(feet[i])));assert.equal(JSON.stringify([t.level,t.damage,t.pierce,t.rapidCd,t.stormCd]),state);
  const after=[];t.mesh.traverse(o=>{if(o.geometry)after.push(o.geometry)});assert.deepEqual(after,geometries);
 }
});

test('level transitions reuse the tower root, preserve combat state and dispose replaced geometry',async()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),v=await import('../quincy-visuals.js'),THREE=await import('../assets/vendor/three.module.js');
 const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8'),g={THREE,...v};vm.createContext(g);
 for(const [start,end] of [['function disposeTransientMesh(','function spawnAbilityPulse('],['function replaceTowerBody(','function makeDartTopMesh('],['function removeUpgradeVisuals(','function updateHeroAppearance('],['function updateHeroAppearance(','function createTower(']])vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),g);
 const t={id:77,type:'hero',level:1,paths:[0,0,0],mesh:v.makeQuincyTowerMesh(1),cool:.4,rapidCd:17,stormCd:23,rapidTimer:6,stormTimer:2,invest:540,target:'strong',damageDealt:123};t.mesh.position.set(2,.66,-3);t.mesh.rotation.y=.45;
 const root=t.mesh,state=JSON.stringify([t.id,t.cool,t.rapidCd,t.stormCd,t.rapidTimer,t.stormTimer,t.invest,t.target,t.damageDealt]),anchor=root.position.clone();
 for(const level of [2,3,6,7,9,10,19,20]){
  const old=t.mesh.userData.body,previous=t.mesh.userData.quincyModelLevel,geometries=new Set();old.traverse(o=>{if(o.geometry)geometries.add(o.geometry)});let disposed=0;for(const geometry of geometries)geometry.addEventListener('dispose',()=>disposed++);
  t.level=level;g.updateHeroAppearance(t);if(previous!==v.quincyModelLevel(level)){assert.equal(old.parent,null);assert.equal(disposed,geometries.size);}else{assert.equal(t.mesh.userData.body,old);assert.equal(disposed,0);}
  assert.equal(t.mesh,root);assert.equal(root.children.length,1);assert(root.position.equals(anchor));assert.equal(root.rotation.y,.45);assert.equal(JSON.stringify([t.id,t.cool,t.rapidCd,t.stormCd,t.rapidTimer,t.stormTimer,t.invest,t.target,t.damageDealt]),state);
  const body=root.userData.body;g.updateHeroAppearance(t);assert.equal(root.userData.body,body);assert.equal(root.userData.quincyRig.pose.parent,body);
 }
});
