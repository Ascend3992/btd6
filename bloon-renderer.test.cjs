const {test}=require('node:test');
const assert=require('node:assert/strict');
const THREE=import('../assets/vendor/three.module.js');
const modulePromise=import('../bloon-renderer.js');

test('thousands of independent bloons share drawing, grow without limits, and keep distinct transforms',async()=>{
 const T=await THREE,{BloonRenderer}=await modulePromise,scene=new T.Scene();let factories=0;
 const renderer=new BloonRenderer(scene,()=>{factories++;const g=new T.Group();const body=new T.Mesh(new T.SphereGeometry(.6,12,8),new T.MeshStandardMaterial({color:0xef72bb}));body.position.y=1.1;g.add(body);return g;});
 const bloons=Array.from({length:3200},(_,i)=>{const mesh=renderer.create(4);mesh.position.set(i*.01,0,i%3);scene.add(mesh);return mesh;});
 renderer.flush();assert.equal(factories,1);assert.equal(renderer.batches.size,1);
 const batch=bloons[0].userData.bloonInstance.batch;assert.equal(batch.mesh.count,3200);assert(batch.capacity>=3200);
 const matrix=new T.Matrix4();batch.mesh.getMatrixAt(3199,matrix);assert(Math.abs(matrix.elements[12]-31.99)<1e-5);assert.equal(matrix.elements[14],3199%3);
 renderer.release(bloons[10]);renderer.flush();assert.equal(batch.mesh.count,3199);assert.equal(bloons[3199].userData.bloonInstance.index,10);batch.mesh.getMatrixAt(10,matrix);assert(Math.abs(matrix.elements[12]-31.99)<1e-5);
 assert.equal(bloons[10].userData.bloonInstance,undefined);
});

test('decamo and regrow stripping rebatch only the affected bloon, preserving attached status markers',async()=>{
 const T=await THREE,{BloonRenderer}=await modulePromise,scene=new T.Scene();
 const renderer=new BloonRenderer(scene,()=>{const g=new T.Group();g.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:0x33ffff})));return g;});
 const a=renderer.create(11,{camo:true,regrow:true}),b=renderer.create(11,{camo:true,regrow:true});a.position.set(3,1,7);
 const marker=new T.Group();a.add(marker);const previous=a.userData.bloonInstance.batch;
 renderer.restyle(a,11,{camo:false,regrow:false});renderer.flush();assert.equal(previous.mesh.count,1);assert.equal(b.userData.bloonInstance.batch,previous);assert.notEqual(a.userData.bloonInstance.batch,previous);
 assert.equal(marker.parent,a);assert.equal(a.position.x,3);assert.equal(a.position.z,7);
 const batches=renderer.batches.size;renderer.restyle(a,11,{});assert.equal(renderer.batches.size,batches);
 renderer.release(a);renderer.release(b);assert.equal([...renderer.batches.values()].reduce((sum,batch)=>sum+batch.mesh.count,0),0);
});

test('batched freeze markers follow parent world transforms and disappear independently without disposing shared geometry',async()=>{
 const T=await THREE,{BloonRenderer}=await modulePromise,scene=new T.Scene(),parent=new T.Group();scene.add(parent);parent.position.set(3,2,7);parent.rotation.y=.6;parent.scale.set(2,1,2);
 const renderer=new BloonRenderer(scene,()=>{const g=new T.Group();g.add(new T.Mesh(new T.TorusGeometry(.75,.065,6,20),new T.MeshBasicMaterial({color:0xb9f3ff})));return g;},{worldMatrices:true,castShadow:false,materialFactory:()=>new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.8})});
 const a=renderer.create(0),b=renderer.create(0);a.position.set(1,.8,0);parent.add(a,b);renderer.flush();
 const batch=a.userData.bloonInstance.batch,matrix=new T.Matrix4();batch.mesh.getMatrixAt(0,matrix);const expected=a.getWorldPosition(new T.Vector3());assert(Math.abs(matrix.elements[12]-expected.x)<1e-5);assert(Math.abs(matrix.elements[13]-expected.y)<1e-5);assert(Math.abs(matrix.elements[14]-expected.z)<1e-5);assert.equal(batch.mesh.castShadow,false);
 let disposed=0;batch.geometry.addEventListener('dispose',()=>disposed++);renderer.release(a);renderer.flush();assert.equal(batch.mesh.count,1);assert.equal(disposed,0);parent.position.x=5;renderer.flush();batch.mesh.getMatrixAt(0,matrix);assert.equal(matrix.elements[12],5);
});

test('disposing a popped bloon releases its attached batched marker as well as its body instance',async()=>{
 const T=await THREE,{BloonRenderer}=await modulePromise,scene=new T.Scene();
 const factory=()=>{const g=new T.Group();g.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial()));return g;};
 const bodies=new BloonRenderer(scene,factory),markers=new BloonRenderer(scene,factory,{worldMatrices:true});
 const body=bodies.create(0),marker=markers.create(0);scene.add(body);body.add(marker);
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8'),g={};vm.createContext(g);
 vm.runInContext(source.slice(source.indexOf('function disposeTransientMesh('),source.indexOf('function spawnAbilityPulse(')),g);g.disposeTransientMesh(body);
 assert.equal([...bodies.batches.values()][0].mesh.count,0);assert.equal([...markers.batches.values()][0].mesh.count,0);assert.equal(marker.userData.bloonInstance,undefined);
});
