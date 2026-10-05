import * as THREE from './assets/vendor/three.module.js';

// Pixel coordinates follow the supplied 826 x 532 reference, in travel order.
// The route crosses itself twice; crossing a segment never switches branches.
export const referenceSize={width:826,height:532};
export const meadowDepthScale=Math.hypot(68,36)/68;
export const MAP_W=66,MAP_H=MAP_W*referenceSize.height/referenceSize.width*meadowDepthScale;
export const ROAD_WIDTH=3.05,EDGE_WIDTH=3.65;
export const referenceRoutePixels=[
 [0,224],[190,224],[391,224],[405,221],[413,211],[414,196],
 [411,124],[410,112],[402,105],[387,104],[302,105],[288,106],[280,117],
 [280,245],[279,301],[277,399],[274,415],[266,425],[250,427],
 [155,427],[143,423],[138,415],[138,394],[140,327],[141,316],[149,307],
 [171,309],[219,306],[278,306],[469,305],[505,305],[518,300],[522,288],
 [524,238],[533,203],[537,192],[547,187],[573,184],[605,188],[615,194],
 [621,210],[624,272],[625,327],[623,349],[616,359],[600,365],[595,375],[587,396],
 [560,397],[483,397],[416,399],[378,408],[367,422],[362,449],[362,477],[366,509],[366,532]
];
export function meadowPixelToWorld([x,y],height=.52){return new THREE.Vector3((x/referenceSize.width-.5)*MAP_W,height,(y/referenceSize.height-.5)*MAP_H);}
export function createMeadowPath(){return referenceRoutePixels.map(p=>meadowPixelToWorld(p));}
function randomSource(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let n=Math.imul(seed^seed>>>15,1|seed);n=n+Math.imul(n^n>>>7,61|n)^n;return ((n^n>>>14)>>>0)/4294967296;};}

// Merge static details into a few meshes: extra leaves, petals and paving never
// add one draw call per object to the dense-round renderer.
function collector(){
 const positions=[],normals=[],colors=[],v=new THREE.Vector3(),n=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();
 return {add(geometry,color,position=new THREE.Vector3(),rotation=new THREE.Euler(),scale=new THREE.Vector3(1,1,1)){
  const matrix=new THREE.Matrix4().compose(position,new THREE.Quaternion().setFromEuler(rotation),scale);normalMatrix.getNormalMatrix(matrix);
  const p=geometry.attributes.position,a=geometry.attributes.normal,index=geometry.index,c=new THREE.Color(color);
  for(let i=0;i<(index?index.count:p.count);i++){
   const j=index?index.getX(i):i;v.fromBufferAttribute(p,j).applyMatrix4(matrix);n.fromBufferAttribute(a,j).applyMatrix3(normalMatrix).normalize();
   positions.push(v.x,v.y,v.z);normals.push(n.x,n.y,n.z);colors.push(c.r,c.g,c.b);
  }
  geometry.dispose();
 },finish(parent,name,shadow=true){
  if(!positions.length)return;
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.92}));mesh.name=name;mesh.castShadow=shadow;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }};
}
function grassTexture(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=660;const ctx=canvas.getContext('2d'),random=randomSource(63081);
 ctx.fillStyle='#65b72b';ctx.fillRect(0,0,1024,660);
 for(let i=0;i<100;i++){
  const x=random()*1024,y=random()*660,r=40+random()*110,g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,i%3?'rgba(164,213,47,.27)':'rgba(42,109,26,.16)');g.addColorStop(1,'rgba(80,150,28,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 for(let i=0;i<95000;i++){
  ctx.strokeStyle=i%3?'rgba(200,224,90,.11)':'rgba(38,103,28,.14)';ctx.lineWidth=.45;const x=random()*1024,y=random()*660;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(random()-.5)*3,y-1-random()*2);ctx.stroke();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function flatRoute(){return referenceRoutePixels.map(([x,y])=>new THREE.Vector3((x/826-.5)*MAP_W,0,(y/532-.5)*MAP_H/meadowDepthScale));}
function nearestRoad(x,z,path){
 let best=Infinity;
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
  best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));
 }
 return best;
}
function pavingShape(length,width,random){
 const shape=new THREE.Shape(),points=[[-.5,-.34],[-.36,-.5],[.30,-.5],[.5,-.29],[.5,.32],[.32,.5],[-.32,.5],[-.5,.32]];
 points.forEach(([x,z],i)=>{const px=(x+(random()-.5)*.075)*length,pz=(z+(random()-.5)*.09)*width;i?shape.lineTo(px,pz):shape.moveTo(px,pz);});shape.closePath();return shape;
}
export function createMeadowMap(scene){
 const root=new THREE.Group();root.name='reference-meadow';root.scale.z=meadowDepthScale;scene.add(root);const path=flatRoute(),random=randomSource(826532),obstacles=[];
 const ground=new THREE.Mesh(new THREE.BoxGeometry(MAP_W,.9,MAP_H/meadowDepthScale),new THREE.MeshStandardMaterial({map:grassTexture(),roughness:1}));ground.name='meadow-grass';ground.position.y=-.46;ground.receiveShadow=true;root.add(ground);
 const road=collector(),stones=collector(),plants=collector(),flowers=collector(),rocks=collector();
 const depth=MAP_H/meadowDepthScale;
 const pixel=([x,y],h=0)=>new THREE.Vector3((x/826-.5)*MAP_W,h,(y/532-.5)*depth);
 // A continuous dark underlay with irregular bevelled stones follows the route.
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
  road.add(new THREE.BoxGeometry(len,.18,EDGE_WIDTH),0x727b60,new THREE.Vector3((a.x+b.x)/2,.06,(a.z+b.z)/2),new THREE.Euler(0,yaw,0));
  if(i>0)road.add(new THREE.CylinderGeometry(EDGE_WIDTH/2,EDGE_WIDTH/2,.18,12),0x727b60,new THREE.Vector3(a.x,.06,a.z));
 }
 const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+path[i].distanceTo(path[i-1]));
 const placed=[];
 for(let distance=.8;distance<lengths.at(-1);distance+=1.83){
  let i=0;while(i<path.length-2&&distance>lengths[i+1])i++;
  const a=path[i],b=path[i+1],len=lengths[i+1]-lengths[i],t=(distance-lengths[i])/len,pos=a.clone().lerp(b,t);
  if(placed.some(p=>Math.hypot(p.x-pos.x,p.z-pos.z)<1.14))continue;placed.push(pos);
  const yaw=-Math.atan2(b.z-a.z,b.x-a.x),shape=pavingShape(1.85,ROAD_WIDTH+random()*.24,random),gray=[0x8d9188,0x999e93,0xa5a99e,0x7e847c,0xa6aaa0][Math.floor(random()*5)];
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.23,bevelEnabled:true,bevelSize:.09,bevelThickness:.065,bevelSegments:1,steps:1});
  stones.add(geometry,gray,new THREE.Vector3(pos.x,.18,pos.z),new THREE.Euler(-Math.PI/2,0,yaw));
  // Chipped stones around the edge echo the irregular gray border in the reference.
  if(Math.floor(distance/1.83)%2===0)for(const side of [-1,1]){
   const angle=Math.atan2(b.z-a.z,b.x-a.x),x=pos.x-Math.sin(angle)*side*1.60,z=pos.z+Math.cos(angle)*side*1.60;
   stones.add(new THREE.DodecahedronGeometry(.29+random()*.12),gray,new THREE.Vector3(x,.15,z),new THREE.Euler(0,random()*3,0),new THREE.Vector3(1,.6,1.1));
  }
 }
 road.finish(root,'continuous-stone-road-base',false);stones.finish(root,'irregular-stone-pavers',true);
 // Broad leaves have a raised center vein and pointed ends, like the leafy frame.
 function leafGeometry(){
  const g=new THREE.BufferGeometry(),p=[0,.08,0,-.15,0,-.26,0,0,-.52,0,.08,0,0,0,-.52,.15,0,-.26,0,.08,0,.15,0,-.26,0,0,.32,0,.08,0,0,0,.32,-.15,0,-.26];
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex([0,2,1,3,5,4,6,8,7,9,11,10]);g.computeVertexNormals();return g;
 }
 function leafyCluster(x,y,size,seed){
  const center=pixel([x,y]),r=randomSource(seed),colors=[0x226a27,0x337d2c,0x4b942c,0x68ac36,0x80bb41];
  plants.add(new THREE.SphereGeometry(size,9,6),0x37782b,new THREE.Vector3(center.x,size*.39,center.z),new THREE.Euler(),new THREE.Vector3(1,.58,.82));
  for(let i=0;i<190;i++){
   const a=r()*Math.PI*2,d=Math.sqrt(r())*size,px=center.x+Math.cos(a)*d,pz=center.z+Math.sin(a)*d*.86,py=size*.39+size*.58*Math.sqrt(Math.max(0,1-d*d/(size*size)))+.13;
   plants.add(leafGeometry(),colors[Math.floor(r()*colors.length)],new THREE.Vector3(px,py,pz),new THREE.Euler((r()-.5)*.8,a+(r()-.5),.20),new THREE.Vector3(1.2+r()*.75,1,1.35+r()*.8));
  }
 }
 [[4,2,3.3],[42,16,3.5],[94,9,3.4],[125,30,2.0],[11,62,2.2],[-8,102,2.2],
  [667,-4,2.6],[700,14,3.2],[754,-5,3.8],[788,30,3.4],[825,8,3.1],[820,81,3.6],
  [834,394,3.0],[800,446,3.7],[756,478,3.4],[828,490,3.5],[720,522,2.5],[784,535,3.9]
 ].forEach(([x,y,s],i)=>leafyCluster(x,y,s,400+i));
 // Palm-like fans in the lower-right corner preserve the reference's dark frame.
 for(const [x,y,size] of [[766,478,2.8],[808,425,3.0],[757,5,2.7]]){
  const p=pixel([x,y]);for(let i=0;i<13;i++){
   const a=i*Math.PI*2/13;plants.add(leafGeometry(),i%2?0x258742:0x3f9e39,new THREE.Vector3(p.x,1.5,p.z),new THREE.Euler(.5,a,0),new THREE.Vector3(1.4,1,size*2.4));
  }
 }
 // The rocks, clover and flower clusters are placed from the reference.
 for(const [x,y,s] of [[184,171,.85],[51,454,1.03],[560,456,.47],[687,396,.79],[526,347,.40]]){
  const p=pixel([x,y],s*.35);rocks.add(new THREE.DodecahedronGeometry(s),0x929d70,p,new THREE.Euler(0,random()*3,0),new THREE.Vector3(1,.6,.83));obstacles.push({x:p.x,z:p.z*meadowDepthScale,radius:s,kind:'rock'});
  rocks.add(new THREE.DodecahedronGeometry(s*.56),0xb4bc83,new THREE.Vector3(p.x+s*.8,p.y*.7,p.z+.15),new THREE.Euler(0,1,0),new THREE.Vector3(1,.6,.9));
 }
 const flowerClusters=[[196,29],[164,97],[81,162],[45,172],[113,144],[213,166],[320,136],[367,130],[321,189],[359,179],[320,263],[466,166],[582,65],[601,41],[632,111],[592,104],[675,186],[657,171],[776,285],[750,296],[746,278],[583,235],[584,311],[430,429],[410,433],[476,426],[574,430],[598,491],[625,497],[276,492],[254,503],[292,485],[310,465],[36,500],[54,491],[16,516],[84,399],[94,414],[43,309],[76,343],[56,317],[363,359],[314,47],[280,45]];
 for(const [cx,cy] of flowerClusters)for(let i=0;i<4;i++){
  const x=cx+(random()-.5)*24,y=cy+(random()-.5)*21,p=pixel([x,y],.035);if(nearestRoad(p.x,p.z,path)<EDGE_WIDTH/2+.14)continue;
  const yellow=(cx===196||cx===213||cx===592||cx===675||cx===476||cx===750)&&i%2===0;
  for(let petal=0;petal<5;petal++){const a=petal*Math.PI*2/5;flowers.add(new THREE.SphereGeometry(.092,5,3),yellow?0xffda3a:0xffffea,new THREE.Vector3(p.x+Math.cos(a)*.11,.048,p.z+Math.sin(a)*.11),new THREE.Euler(),new THREE.Vector3(1,.30,.76));}
  flowers.add(new THREE.SphereGeometry(.043,5,3),0xf2c844,new THREE.Vector3(p.x,.072,p.z),new THREE.Euler(),new THREE.Vector3(1,.4,1));
 }
 for(const [x,y] of [[731,357],[704,383],[512,428],[310,452],[121,150],[616,226],[325,484]]){
  const p=pixel([x,y],.027);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;plants.add(new THREE.SphereGeometry(.17,6,4),0x409e31,new THREE.Vector3(p.x+Math.cos(a)*.14,.035,p.z+Math.sin(a)*.14),new THREE.Euler(0,a,0),new THREE.Vector3(1,.16,1.4));}
 }
 // Grass blades overhang a few road edges at the same places as the image.
 for(const [x,y] of [[63,210],[245,181],[333,89],[404,138],[209,440],[122,310],[548,205],[641,246],[474,379],[352,440]]){
  const p=pixel([x,y]);for(let i=0;i<7;i++)plants.add(new THREE.ConeGeometry(.065,.56,3),0x83b932,new THREE.Vector3(p.x+i*.13,.21,p.z),new THREE.Euler(.4,0,-.35+random()*.7));
 }
 plants.finish(root,'leafy-corner-frame-and-grass',true);flowers.finish(root,'white-and-gold-meadow-flowers',false);rocks.finish(root,'reference-rocks',true);
 root.updateMatrixWorld(true);return {root,ground,obstacles};
}
