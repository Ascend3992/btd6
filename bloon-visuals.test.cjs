const {test}=require('node:test');
const assert=require('node:assert/strict');
const visuals=import('../bloon-visuals.js'),three=import('../assets/vendor/three.module.js'),batches=import('../bloon-renderer.js');

test('Camo, Fortified and Regrow use independent, visible features in every combination and layer',async()=>{
 const v=await visuals,{Box3,Vector3}=await three;
 for(let layer=0;layer<12;layer++)for(let flags=0;flags<8;flags++){
  const opts={camo:!!(flags&1),fort:!!(flags&2),regrow:!!(flags&4)},mesh=v.makeReferenceBloonTemplate(layer,opts),body=mesh.getObjectByName(opts.regrow?'puffed-regrow-heart':'rounded-bloon-body');assert(body);
  assert.equal(!!mesh.getObjectByName('thick-fortified-metal-bands'),opts.fort);
  const bounds=new Box3().setFromObject(mesh).getSize(new Vector3());assert(bounds.x>1&&bounds.x<1.7&&bounds.y>1.5&&bounds.y<2.5&&bounds.z<1.7,JSON.stringify(bounds));
  const paint=body.geometry.attributes.color;assert(paint&&paint.count===body.geometry.attributes.position.count);assert([...paint.array].every(Number.isFinite));
  if(opts.camo){const distinct=new Set();for(let i=0;i<paint.count;i++)distinct.add([paint.getX(i),paint.getY(i),paint.getZ(i)].join(','));assert(distinct.size>=3);}
 }
});

test('regrow silhouette has a deep central notch, rounded lobes and a tapered point',async()=>{
 const v=await visuals,heart=v.makeReferenceBloonTemplate(0,{regrow:true}).getObjectByName('puffed-regrow-heart').geometry.attributes.position;
 let topCenter=-Infinity,topLobe=-Infinity,bottom=Infinity,maxWidth=0;
 for(let i=0;i<heart.count;i++){const x=heart.getX(i),y=heart.getY(i);if(Math.abs(x)<.01)topCenter=Math.max(topCenter,y);if(Math.abs(x)>.15)topLobe=Math.max(topLobe,y);bottom=Math.min(bottom,y);maxWidth=Math.max(maxWidth,Math.abs(x));}
 assert(topLobe-topCenter>.25);assert(bottom<-.7);assert(maxWidth>.6);
 const normals=(v.makeReferenceBloonTemplate(0,{regrow:true}).getObjectByName('puffed-regrow-heart').geometry).attributes.normal;
 let outward=0;for(let i=0;i<heart.count;i++)if(heart.getX(i)>.65)outward+=normals.getX(i);assert(outward>0,'heart normals face outward');
});

test('instanced merging preserves painted camouflage and removes those patches on decamo',async()=>{
 const v=await visuals,{Scene}=await three,{BloonRenderer}=await batches,renderer=new BloonRenderer(new Scene(),v.makeReferenceBloonTemplate);
 const a=renderer.create(0,{camo:true,fort:true,regrow:true});const camo=a.userData.bloonInstance.batch.geometry.attributes.color;
 const template=v.makeReferenceBloonTemplate(0,{camo:true,fort:true,regrow:true}),paint=template.getObjectByName('puffed-regrow-heart').geometry.attributes.color;
 for(let i=0;i<paint.count*3;i++)assert.equal(camo.array[i],paint.array[i]);
 renderer.restyle(a,0,{camo:false,fort:true,regrow:true});assert.notEqual(a.userData.bloonInstance.batch.geometry.attributes.color.array[9],undefined);
 const plain=a.userData.bloonInstance.batch.geometry.attributes.color;assert.notDeepEqual(Array.from(camo.array.slice(0,paint.count*3)),Array.from(plain.array.slice(0,paint.count*3)));
});
