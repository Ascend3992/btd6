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
