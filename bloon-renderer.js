import * as THREE from './assets/vendor/three.module.js';

// Every bloon keeps its own logical object. Only drawing is shared; no spawn cap.
export class BloonRenderer {
 constructor(scene,factory,options={}){this.scene=scene;this.factory=factory;this.options=options;this.batches=new Map();}
 key(layer,opts){return `${layer}:${+!!opts.camo}:${+!!opts.regrow}:${+!!opts.fort}`;}
 batch(layer,opts){
  const key=this.key(layer,opts);if(this.batches.has(key))return this.batches.get(key);
  const template=this.factory(layer,opts);template.updateMatrixWorld(true);
  const positions=[],normals=[],colors=[],geometries=new Set(),materials=new Set();
  template.traverse(part=>{
   if(!part.isMesh)return;
   const transformed=part.geometry.clone().applyMatrix4(part.matrixWorld);
   const geometry=transformed.index?transformed.toNonIndexed():transformed;
   const position=geometry.attributes.position,normal=geometry.attributes.normal,paint=part.material.vertexColors?geometry.attributes.color:null,color=part.material.color;
   for(let i=0;i<position.count;i++){
    positions.push(position.getX(i),position.getY(i),position.getZ(i));
    normals.push(normal.getX(i),normal.getY(i),normal.getZ(i));
    colors.push(color.r*(paint?paint.getX(i):1),color.g*(paint?paint.getY(i):1),color.b*(paint?paint.getZ(i):1));
   }
   geometry.dispose();if(geometry!==transformed)transformed.dispose();
   geometries.add(part.geometry);materials.add(part.material);
  });
  for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeBoundingSphere();
  const batch={geometry,material:this.options.materialFactory?this.options.materialFactory():new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:layer===8?.34:.38,metalness:layer===8?.58:.03}),objects:[],capacity:0,mesh:null};
  this.batches.set(key,batch);return batch;
 }
 reserve(batch){
  if(batch.objects.length<batch.capacity)return;
  const old=batch.mesh;batch.capacity=Math.max(32,batch.capacity*2);
  batch.mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.capacity);
  batch.mesh.name='batched-bloons';batch.mesh.count=batch.objects.length;
  batch.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  batch.mesh.frustumCulled=false;batch.mesh.castShadow=this.options.castShadow!==false;this.scene.add(batch.mesh);
  if(old){old.removeFromParent();old.dispose();}
 }
 attach(object,layer,opts){
  const batch=this.batch(layer,opts);this.reserve(batch);
  object.userData.bloonInstance={renderer:this,batch,index:batch.objects.length};
  batch.objects.push(object);batch.mesh.count=batch.objects.length;
 }
 create(layer,opts={}){const object=new THREE.Group();this.attach(object,layer,opts);return object;}
 release(object){
  const handle=object.userData.bloonInstance;if(!handle)return;
  const {batch,index}=handle,last=batch.objects.pop();
  if(last!==object){batch.objects[index]=last;last.userData.bloonInstance.index=index;}
  batch.mesh.count=batch.objects.length;delete object.userData.bloonInstance;
 }
 restyle(object,layer,opts){if(object.userData.bloonInstance?.batch===this.batch(layer,opts))return;this.release(object);this.attach(object,layer,opts);}
 flush(){
  for(const batch of this.batches.values()){
   if(!batch.objects.length)continue;
   for(let i=0;i<batch.objects.length;i++){const object=batch.objects[i];if(this.options.worldMatrices)object.updateWorldMatrix(true,false);else object.updateMatrix();batch.mesh.setMatrixAt(i,this.options.worldMatrices?object.matrixWorld:object.matrix);}
   batch.mesh.instanceMatrix.needsUpdate=true;
  }
 }
}
