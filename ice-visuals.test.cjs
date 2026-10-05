const {test}=require('node:test');
const assert=require('node:assert/strict');
const visuals=import('../ice-visuals.js'),three=import('../assets/vendor/three.module.js');

test('Ice reference model idles and casts without moving its root or planted feet',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 const t={id:3,mesh:v.makeBaseIceTowerMesh(),paths:[0,0,0],damage:1,freeze:1.5,range:8,rate:2.4,fireAnim:0};t.mesh.position.set(3,.66,-4);t.mesh.rotation.y=.40;
 const rig=t.mesh.userData.iceRig,anchor=t.mesh.position.clone(),feet=rig.feet.map(f=>f.position.clone()),stats=JSON.stringify([t.paths,t.damage,t.freeze,t.range,t.rate]);
 const size=new Box3().setFromObject(t.mesh).getSize(new Vector3());assert(size.x<3.5&&size.z<2.4&&size.y>3&&size.y<3.8);
 v.animateIce(t,.1);const idle=rig.body.position.y;v.animateIce(t,.5);assert.notEqual(rig.body.position.y,idle);
 t.fireAnim=.24;v.animateIce(t,.12);assert(rig.arms[0].rotation.z<-.15&&rig.arms[1].rotation.z>.15);assert(rig.sparks.every(s=>s.visible));assert(rig.handsMat.emissiveIntensity>.5);
 v.animateIce(t,.5);assert.equal(t.fireAnim,0);assert(rig.sparks.every(s=>!s.visible));assert(rig.arms.every(a=>Math.abs(a.rotation.z)<.05));
 assert(t.mesh.position.equals(anchor));assert.equal(t.mesh.rotation.y,.40);assert(rig.feet.every((f,i)=>f.position.equals(feet[i])));assert.equal(JSON.stringify([t.paths,t.damage,t.freeze,t.range,t.rate]),stats);
});

test('Ice blink animation keeps its face, tail and crown attached',async()=>{
 const v=await visuals,t={id:0,mesh:v.makeBaseIceTowerMesh(),iceIdleTime:4.8,fireAnim:0},rig=t.mesh.userData.iceRig;
 v.animateIce(t,.08);assert(rig.eyes.every(e=>e.scale.y===.12));v.animateIce(t,.2);assert(rig.eyes.every(e=>e.scale.y===1));
 assert(t.mesh.getObjectByName('cyan-eye-mask'));assert(t.mesh.getObjectByName('white-tall-tuft'));assert(t.mesh.getObjectByName('curled-white-tail'));
 assert.equal(rig.tail.parent,rig.body);assert.equal(rig.head.parent,rig.body);
});

test('all five top references have their distinct features and animate without shifting planted feet',async()=>{
 const v=await visuals,{Vector3,Box3}=await three;
 const features=['permafrost-snowflake','silver-snowflake-medallion','silver-diamond-crown','silver-lightning-crest','super-brittle-ice-wall'];
 for(let tier=1;tier<=5;tier++){
  const mesh=v.makeIceTopTowerMesh(tier),t={id:tier,mesh,fireAnim:0},rig=mesh.userData.iceRig;
  assert(mesh.getObjectByName(features[tier-1]),features[tier-1]);assert.equal(mesh.userData.iceModelTier,tier);assert.equal(mesh.userData.iceModelPath,0);
  const size=new Box3().setFromObject(mesh).getSize(new Vector3());assert(size.x<4.5&&size.y<4.3&&size.z<2.8,JSON.stringify(size));
  const feet=rig.feet.map(f=>f.getWorldPosition(new Vector3()));v.animateIce(t,.1);const idle=rig.body.position.y;v.animateIce(t,.4);assert.notEqual(rig.body.position.y,idle);
  const idleArm=rig.arms[1].rotation.z;t.fireAnim=.24;v.animateIce(t,.12);assert(rig.arms[1].rotation.z>idleArm+.15);assert(rig.sparks.every(s=>s.visible));
  assert(rig.feet.every((f,i)=>f.getWorldPosition(new Vector3()).equals(feet[i])));
  // All parts, including feet and ice platforms, belong to the replaceable frame.
  assert(mesh.children.every(child=>child===mesh.userData.body));
  if(tier>=3)assert(rig.crystals.length>0);
 }
});

test('middle references have earmuffs, a knit hat, parkas, scarves, hovering and an icy mask, with idle and cast motion',async()=>{
 const v=await visuals,{Vector3,Box3}=await three;
 const features=['red-earmuff','white-hat-pompom','orange-arctic-parka','snowstorm-ice-mountain','faceted-absolute-zero-mask'];
 for(let tier=1;tier<=5;tier++){
  const mesh=v.makeIceMiddleTowerMesh(tier),t={id:tier,mesh,fireAnim:0},rig=mesh.userData.iceRig;
  assert(mesh.getObjectByName(features[tier-1]));assert.equal(mesh.userData.iceModelPath,1);assert.equal(mesh.userData.iceModelTier,tier);
  v.animateIce(t,.1);const y=rig.body.position.y,z=rig.arms[1].rotation.z;v.animateIce(t,.4);assert.notEqual(rig.body.position.y,y);
  t.fireAnim=.24;t.iceAbilityAnim=.8;v.animateIce(t,.12);assert(rig.arms[1].rotation.z>z+.15);assert(rig.sparks.every(s=>s.visible));assert(rig.handsMat.emissiveIntensity>.5);
  assert(mesh.position.equals(new Vector3()));assert(mesh.children.every(child=>child===mesh.userData.body));
  const size=new Box3().setFromObject(mesh).getSize(new Vector3());assert(size.x<4&&size.y<4.3&&size.z<3,JSON.stringify(size));
  if(tier>=3)assert(rig.scarves.length);if(tier>=4)assert.equal(rig.hover,true);
 }
});

test('bottom references keep their fists, visor, cannon, armor and impale spike animated and anchored',async()=>{
 const v=await visuals,{Vector3,Box3}=await three;
 const features=['determined-ice-mouth','dark-cryo-sunglasses','cryo-snowball-cannon','armored-icicles-cannon','loaded-white-impale-spike'];
 for(let tier=1;tier<=5;tier++){
  const mesh=v.makeIceBottomTowerMesh(tier),t={id:tier,mesh,x:3,z:-4,fireAnim:0},rig=mesh.userData.iceRig;mesh.position.set(3,.66,-4);mesh.rotation.y=.5;
  assert(mesh.getObjectByName(features[tier-1]));assert.equal(mesh.userData.iceModelPath,2);assert.equal(mesh.userData.iceModelTier,tier);
  const anchor=mesh.position.clone(),feet=rig.feet.map(f=>f.getWorldPosition(new Vector3()));v.animateIce(t,.1);const y=rig.body.position.y;v.animateIce(t,.4);assert.notEqual(rig.body.position.y,y);
  if(tier>=3){const origin=v.iceMuzzleOrigin(t);assert(origin.distanceTo(rig.muzzle.getWorldPosition(new Vector3()))<1e-10);assert(origin.distanceTo(anchor)>1);}
  t.fireAnim=.24;v.animateIce(t,.12);assert(rig.sparks.every(s=>s.visible));
  if(tier>=3){assert(rig.cannon.position.z<rig.cannonRestZ);assert(rig.cannonGlow.emissiveIntensity>1);}
  if(tier===5){assert(rig.iceCape);assert.equal(rig.loadedIcicle.visible,false);}
  v.animateIce(t,.4);if(tier>=3)assert.equal(rig.cannon.position.z,rig.cannonRestZ);if(tier===5)assert.equal(rig.loadedIcicle.visible,true);
  assert(mesh.position.equals(anchor));assert.equal(mesh.rotation.y,.5);assert(rig.feet.every((f,i)=>f.getWorldPosition(new Vector3()).equals(feet[i])));
  const size=new Box3().setFromObject(mesh).getSize(new Vector3());assert(size.x<4&&size.y<4&&size.z<3.5,JSON.stringify(size));
 }
});
