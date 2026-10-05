import * as THREE from './assets/vendor/three.module.js';

const names=['Red','Blue','Green','Yellow','Pink','Black','White','Purple','Lead','Zebra','Rainbow','Ceramic'];
const colors=[0xe43c36,0x3387ff,0x39b855,0xffe33d,0xef72bb,0x25282d,0xf5f5f5,0x8c43d6,0x9aa1a8,0xffffff,0x5ee4e6,0xb86f3e];
const rainbow=[0xef445f,0xffa62b,0xf7e34b,0x50c878,0x4f8cff,0x9a5ee8];

// Large painted patches are part of the shell, rather than rings that could
// be confused with Zebra stripes or Fortified armor. Baking color into faces
// preserves the pattern when the shell is merged for instanced rendering.
export function paintBloonGeometry(geometry,base,{type='Red',camo=false}={}){
 const indexed=geometry.index,painted=indexed?geometry.toNonIndexed():geometry;
 if(indexed)geometry.dispose();
 const p=painted.attributes.position,values=[],baseColor=new THREE.Color(base),white=new THREE.Color(0xffffff),dark=new THREE.Color(0x10231a);
 for(let i=0;i<p.count;i+=3){
  let x=0,y=0,z=0;for(let j=0;j<3;j++){x+=p.getX(i+j)/3;y+=p.getY(i+j)/3;z+=p.getZ(i+j)/3;}
  let color=baseColor.clone();
  if(type==='Rainbow'){const band=Math.max(0,Math.min(5,Math.floor((y+.80)/1.6*6)));color.setHex(rainbow[band]);}
  if(type==='Zebra'){const stripe=Math.sin(y*13+Math.sin(x*9+z*5)*.85);color.setHex(stripe>.15?0x17191b:0xf4f5ec);}
  if(camo){
   const patch=Math.sin(x*8.5+Math.sin(y*7)*1.3)+Math.sin(z*8-y*6)+Math.cos(y*9+x*3)*.55;
   if(patch<-.38){
    if(type==='Black')color.setHex(0x547448);
    else if(type==='White'||type==='Zebra')color.setHex(type==='Zebra'?0x718768:0x8f9d7e);
    else color.lerp(dark,.49);
   }else if(patch>.70){
    if(type==='Black')color.setHex(0x899774);
    else color.lerp(white,.30);
   }
  }
  for(let j=0;j<3;j++)values.push(color.r,color.g,color.b);
 }
 painted.setAttribute('color',new THREE.Float32BufferAttribute(values,3));return painted;
}
function heartGeometry(){
 const outline=[],count=40,rings=10;
 for(let i=0;i<count;i++){
  const a=i*Math.PI*2/count,x=16*Math.sin(a)**3,y=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);
  outline.push([x*.043,(y+2.6)*.053]);
 }
 const positions=[],indices=[];
 for(let ring=0;ring<=rings;ring++){
  const a=-Math.PI/2+ring/rings*Math.PI,s=Math.cos(a),z=Math.sin(a)*.44;
  for(const [x,y] of outline)positions.push(x*s,y*s,z);
 }
 for(let ring=0;ring<rings;ring++)for(let i=0;i<count;i++){
  const a=ring*count+i,b=ring*count+(i+1)%count,c=(ring+1)*count+i,d=(ring+1)*count+(i+1)%count;indices.push(a,c,b,b,c,d);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export function makeReferenceBloonTemplate(layer,opts={}){
 const type=names[layer]||opts.type||'Red',color=colors[layer]??colors[0],root=new THREE.Group(),shell=new THREE.Group();
 root.name=type+' Bloon';root.userData.bloonFlags={camo:!!opts.camo,fort:!!opts.fort,regrow:!!opts.regrow};
 shell.name='bloon-shell';shell.position.y=1.16;shell.rotation.x=-.40;root.add(shell);
 const material=(color,metalness=.02,roughness=.35)=>new THREE.MeshStandardMaterial({color,flatShading:true,metalness,roughness});
 const paintedMat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,flatShading:true,roughness:type==='Lead'?.28:.31,metalness:type==='Lead'?.6:.02});
 let geometry;
 if(opts.regrow)geometry=heartGeometry();
 else {geometry=new THREE.SphereGeometry(.62,16,12);geometry.scale(.94,1.22,.88);}
 geometry=paintBloonGeometry(geometry,color,{type,camo:!!opts.camo});
 const body=new THREE.Mesh(geometry,paintedMat);body.name=opts.regrow?'puffed-regrow-heart':'rounded-bloon-body';body.castShadow=true;shell.add(body);
 const add=(name,geometry,mat,x,y,z,parent=shell)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;};
 const knotMat=material(color);
 add('bloon-knot',new THREE.ConeGeometry(.115,.22,7),knotMat,0,.37,0,root).rotation.z=Math.PI;
 add('bloon-string',new THREE.CylinderGeometry(.012,.012,.21,3),material(0xf3e6bc),0,.19,0,root);
 // White crescents are small raised highlights, never status decorations.
 const highlight=material(0xf8fff6,0,.23);
 const shine=(points)=>add('curved-shell-highlight',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),8,.026,4,false),highlight,0,0,0);
 if(opts.regrow){
  for(const side of [-1,1])shine([[side*.23,.51,.32],[side*.30,.57,.28],[side*.43,.53,.27]]);
 }else shine([[-.34,.37,.36],[-.27,.47,.34],[-.11,.56,.31]]);
 if(type==='Purple'){
  const rim=add('purple-blue-hem',new THREE.TorusGeometry(.43,.024,4,18),material(0x3da0ff),0,-.39,0);rim.rotation.x=Math.PI/2;rim.scale.z=.88;
 }
 if(type==='Lead')for(const y of [-.27,.21]){
  const ridge=add('lead-shell-seam',new THREE.TorusGeometry(.56,.028,4,18),material(0x5d6670,.72,.28),0,y,0);ridge.rotation.x=Math.PI/2;ridge.scale.z=.9;
 }
 if(type==='Ceramic'){
  const clay=material(0xd19358,0,.66);
  for(const y of [-.34,-.12,.10,.32]){const ridge=add('ceramic-shell-ridge',new THREE.TorusGeometry(.56,.044,5,18),clay,0,y,0);ridge.rotation.x=Math.PI/2;ridge.scale.z=.90;}
  add('ceramic-shell-cap',new THREE.CylinderGeometry(.29,.36,.12,12),clay,0,.67,0);
 }
 if(opts.fort){
  const armor=new THREE.Group();armor.name='thick-fortified-metal-bands';shell.add(armor);
  const bronze=material(0x956340,.50,.31),silver=material(0xe0ded4,.58,.28),seam=material(0x3c352e,.3,.43);
  for(const y of [-.23,.17]){
   const radius=opts.regrow?.635:Math.sqrt(1-(y/.756)**2)*.583+.025,zScale=opts.regrow?.68:.936;
   const ring=(name,r,tube,mat,height)=>{const mesh=add(name,new THREE.TorusGeometry(r,tube,5,24),mat,0,height,0,armor);mesh.rotation.x=Math.PI/2;mesh.scale.z=zScale;return mesh;};
   ring('bronze-fortified-band',radius,.089,bronze,y);ring('dark-armor-separator',radius+.015,.028,seam,y-.070);
   for(const edge of [-1,1])ring('silver-fortified-band-edge',radius+.012,.025,silver,y+edge*.068);
   for(const a of [-.9,0,.9,Math.PI])add('fortified-band-rivet',new THREE.SphereGeometry(.038,6,4),silver,Math.sin(a)*(radius+.078),y,Math.cos(a)*(radius+.078)*zScale,armor);
  }
 }
 return root;
}
