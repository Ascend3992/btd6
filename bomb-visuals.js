import * as THREE from './assets/vendor/three.module.js';

// Base Bomb Shooter reference: squat blue-black cannon, open muzzle and wood wheels.
// The barrel points along +X, matching the existing Bomb Shooter aim/recoil hooks.
export function makeBaseBombTowerMesh(){
 return makeBombTopTowerMesh(0);
}

const topNames=['Bomb Shooter','Bigger Bombs','Heavy Bombs','Really Big Bombs','Bloon Impact','Bloon Crush'];
const palettes=[
 {barrel:0x262c48,rim:0x505971,band:0x262c48,wood:0x865019,edge:0x4b280e,trim:0xb27a2b},
 {barrel:0x242238,rim:0x343047,band:0xe40b15,wood:0x865019,edge:0x4b280e,trim:0xb27a2b},
 {barrel:0x242238,rim:0x343047,band:0xe40b15,wood:0x444b56,edge:0x545b68,trim:0x9297a2},
 {barrel:0xe00912,rim:0xc20c0b,band:0xf2d21a,wood:0x444950,edge:0x262a30,trim:0x838992},
 {barrel:0x1d2434,rim:0x25263b,band:0x86d916,wood:0x44494d,edge:0x272c30,trim:0x858d90},
 {barrel:0x172c48,rim:0xe21a0e,band:0x234db2,wood:0x282e38,edge:0x141b26,trim:0x485568}
];

export function makeBombTopTowerMesh(tier){
 if(!Number.isInteger(tier)||tier<0||tier>5)throw new RangeError('Invalid Bomb Shooter model tier');
 const colors=palettes[tier],crush=tier===5,metalWheels=tier>=2;
 const root=new THREE.Group(),body=new THREE.Group(),weapon=new THREE.Group();
 root.add(body);body.add(weapon);
 root.name=topNames[tier];
 root.userData={body,weapon,aimOffset:-Math.PI/2,bombBaseModel:tier===0,bombModelPath:0,bombModelTier:tier};
 body.name='bomb-carriage';weapon.name='bomb-barrel';weapon.position.set(0,crush?1.61:tier>=3?1.49:tier?1.43:1.38,0);
 weapon.scale.setScalar(crush?1.18:tier>=3?1.14:tier?1.08:1);
 const materials={
  barrel:new THREE.MeshStandardMaterial({color:colors.barrel,roughness:.58,metalness:.18,flatShading:true}),
  rim:new THREE.MeshStandardMaterial({color:colors.rim,roughness:.6,metalness:.2,flatShading:true,side:THREE.DoubleSide}),
  bore:new THREE.MeshStandardMaterial({color:0x11131c,roughness:1,flatShading:true,side:THREE.DoubleSide}),
  wood:new THREE.MeshStandardMaterial({color:colors.wood,roughness:metalWheels?.65:.9,metalness:metalWheels?.25:0,flatShading:true}),
  edge:new THREE.MeshStandardMaterial({color:colors.edge,roughness:.95,flatShading:true}),
  trim:new THREE.MeshStandardMaterial({color:colors.trim,roughness:metalWheels?.55:.85,metalness:metalWheels?.3:0,flatShading:true,side:THREE.DoubleSide}),
  band:new THREE.MeshStandardMaterial({color:colors.band,roughness:.42,metalness:.12,flatShading:true}),
  highlight:new THREE.MeshStandardMaterial({color:tier===4?0xc0f33a:tier===3?0xffeb49:0xff4925,roughness:.45,flatShading:true}),
  core:new THREE.MeshStandardMaterial({color:0xf02413,roughness:.48,metalness:.15,emissive:0xf52b13,emissiveIntensity:.08,flatShading:true})
 };
 const add=(parent,name,geometry,material,x=0,y=0,z=0)=>{
  const m=new THREE.Mesh(geometry,materials[material]);m.name=name;m.position.set(x,y,z);
  m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 };
 add(body,'wood-carriage',new THREE.BoxGeometry(1.55,.26,1.35),'edge',-.25,.48,0);
 const axle=add(body,'axle',new THREE.CylinderGeometry(.14,.14,2.12,10),'edge',-.35,.71,0);axle.rotation.x=Math.PI/2;
 const wheels=[];
 for(const side of [-1,1]){
  const wheel=new THREE.Group();wheel.name=(side<0?'left-':'right-')+(metalWheels?'steel-wheel':'wood-wheel');wheel.position.set(-.35,crush?.82:.71,side*(crush?1.02:.94));body.add(wheel);wheels.push(wheel);
  add(wheel,'wheel-rim',new THREE.TorusGeometry(crush?.64:.57,crush?.18:.14,6,16),'edge');
  add(wheel,'wheel-face',new THREE.RingGeometry(.44,crush?.71:.70,16),'trim',0,0,side*.125);
  const spokes=tier?6:8;
  for(let i=0;i<spokes;i++){
   const angle=i*Math.PI*2/spokes,spoke=add(wheel,'wheel-spoke',new THREE.BoxGeometry(.50,metalWheels?.17:.12,.20),'wood',Math.cos(angle)*.28,Math.sin(angle)*.28,0);
   spoke.rotation.z=angle;
  }
  const hub=add(wheel,'wheel-hub',new THREE.CylinderGeometry(.23,.25,.34,12),'wood',0,0,side*.06);hub.rotation.x=Math.PI/2;
  const cap=add(wheel,'hub-cap',new THREE.CylinderGeometry(.17,.17,.035,12),'trim',0,0,side*.25);cap.rotation.x=Math.PI/2;
  if(crush){
   for(let i=0;i<16;i++){
    const a=i*Math.PI/8,tread=add(wheel,'tire-tread',new THREE.BoxGeometry(.24,.14,.36),'wood',Math.cos(a)*.77,Math.sin(a)*.77,0);tread.rotation.z=a+Math.PI/2;
   }
   const core=add(wheel,'triangular-red-hub',new THREE.ConeGeometry(.31,.14,3),'core',0,0,side*.30);core.rotation.x=side*Math.PI/2;
   for(let i=0;i<6;i++){const a=i*Math.PI/3;add(wheel,'red-hub-bolt',new THREE.SphereGeometry(.065,6,4),'core',Math.cos(a)*.36,Math.sin(a)*.36,side*.24);}
  }
 }
 // A lathed shell keeps the rear rounded and the mouth visibly hollow.
 const profile=[[0,-1.10],[.36,-1.06],[.62,-.87],[.75,-.54],[.78,-.08],[.76,.43],[.86,.68],[.86,.85],[.62,.85],[.60,.65]];
 const shell=add(weapon,'rounded-cannon-shell',new THREE.LatheGeometry(profile.map(([r,x])=>new THREE.Vector2(r,x)),16),'barrel');shell.rotation.z=-Math.PI/2;
 const lip=add(weapon,'thick-muzzle-rim',new THREE.RingGeometry(.62,.89,16),'rim',.86,0,0);lip.rotation.y=Math.PI/2;
 const band=add(weapon,'muzzle-outer-band',new THREE.CylinderGeometry(.89,.86,.18,16,1,true),'rim',.77,0,0);band.rotation.z=-Math.PI/2;
 const bore=add(weapon,'hollow-bore',new THREE.CylinderGeometry(.615,.48,1.34,16,1,true),'bore',.18,0,0);bore.rotation.z=-Math.PI/2;
 const back=add(weapon,'bore-shadow',new THREE.CircleGeometry(.49,16),'bore',-.49,0,0);back.rotation.y=Math.PI/2;
 const collar=(name,profile,material)=>{
  const mesh=add(weapon,name,new THREE.LatheGeometry(profile.map(([r,x])=>new THREE.Vector2(r,x)),16),material);mesh.rotation.z=-Math.PI/2;return mesh;
 };
 if(tier){
  collar('colored-muzzle-band',[[.79,.38],[.86,.42],[.94,.52],[.94,.70],[.89,.76],[.82,.72]],'band');
  if(tier===3||tier===4){
   const trim=add(weapon,'bright-band-edge',new THREE.TorusGeometry(.933,.022,4,16),'highlight',.53,0,0);trim.rotation.y=Math.PI/2;
  }
 }
 if(tier===2)collar('rear-red-band',[[.55,-.95],[.63,-.87],[.71,-.74],[.71,-.69],[.65,-.80]],'band');
 if(tier===4){
  collar('green-body-stripe-front',[[.787,.04],[.787,.12],[.778,.12],[.778,.04]],'band');
  collar('green-body-stripe-rear',[[.78,-.20],[.78,-.12],[.772,-.12],[.772,-.20]],'band');
  for(const side of [-1,1]){
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.60,.25,side*.69,-.36,.45,side*.69,-.40,.08,side*.74],3));geometry.computeVertexNormals();
   const arrow=add(weapon,'green-rear-chevron',geometry,'band');arrow.material.side=THREE.DoubleSide;
  }
 }
 if(crush){
  collar('flared-red-muzzle',[[.81,.08],[.98,.20],[1.04,.46],[1.01,.82],[.97,.89],[.63,.89],[.62,.84]],'rim');
  const ring=add(weapon,'red-muzzle-edge',new THREE.TorusGeometry(.995,.035,4,16),'highlight',.85,0,0);ring.rotation.y=Math.PI/2;
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,spike=add(weapon,'muzzle-spike',new THREE.ConeGeometry(.13,.36,4),'rim',.30,Math.cos(a)*1.04,Math.sin(a)*1.04);
   spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(0,Math.cos(a),Math.sin(a)));
  }
  collar('blue-rear-reinforcement',[[.80,-.14],[.84,-.08],[.84,.05],[.80,.10]],'band');
  for(const side of [-1,1])add(weapon,'gold-rear-rivet',new THREE.SphereGeometry(.055,6,4),'highlight',-.55,.50,side*.57);
 }
 weapon.userData.rest=weapon.position.clone();
 root.userData.bombRig={path:0,tier,body,weapon,wheels,core:crush?materials.core:null};
 return root;
}

const middleNames=['','Faster Reload','Missile Launcher','MOAB Mauler','MOAB Assassin','MOAB Eliminator'];
const missileColors={
 2:{body:0xe0e2e3,nose:0xe91013,band:0xd91919,fin:0xda1417,ink:0x11151c,eye:0x11151c},
 3:{body:0xf4ba0b,nose:0xffd314,band:0xbf7806,fin:0xf1b511,ink:0xa26509,eye:0x9e6209},
 4:{body:0x4c5158,nose:0x535a62,band:0xf04417,fin:0x252b32,ink:0x0e1419,eye:0x0d151c},
 5:{body:0x444d43,nose:0x454e46,band:0x82c51d,fin:0x82d51b,ink:0x0d1416,eye:0x95d727}
};
function missileMaterial(color){return new THREE.MeshStandardMaterial({color,roughness:.62,metalness:.1,flatShading:true,side:THREE.DoubleSide});}
function missilePart(parent,name,geometry,material,x=0,y=0,z=0){
 const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function addMissileFins(parent,color){
 const material=missileMaterial(color),shape=new THREE.Shape();
 shape.moveTo(-.56,.48);shape.lineTo(-.77,.96);shape.lineTo(-1.20,.97);shape.lineTo(-1.04,.42);shape.closePath();
 for(const angle of [0,Math.PI/2,-Math.PI/2]){
  const fin=missilePart(parent,'missile-tail-fin',new THREE.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:false}),material,0,0,-.0375);fin.rotation.x=angle;
 }
}
function buildBombMissile(tier){
 const colors=missileColors[tier];if(!colors)throw new RangeError('Invalid missile model tier');
 const root=new THREE.Group();root.name=middleNames[tier]+' missile';
 const materials=new Map(),paints=new Map(),material=color=>{if(!materials.has(color))materials.set(color,missileMaterial(color));return materials.get(color);};
 const paint=color=>{if(!paints.has(color))paints.set(color,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));return paints.get(color);};
 const profile=[[0,-1.08],[.38,-1.05],[.58,-.88],[.63,-.40],[.64,.20],[.61,.48],[.52,.77],[.34,1.05],[0,1.25]];
 const shell=missilePart(root,'shark-missile-body',new THREE.LatheGeometry(profile.map(([r,x])=>new THREE.Vector2(r,x)),16),material(colors.body));shell.rotation.z=-Math.PI/2;
 const noseProfile=[[.65,.23],[.625,.48],[.535,.77],[.355,1.05],[0,1.265]];
 const nose=missilePart(root,'colored-missile-nose',new THREE.LatheGeometry(noseProfile.map(([r,x])=>new THREE.Vector2(r,x)),16),material(colors.nose));nose.rotation.z=-Math.PI/2;
 const band=missilePart(root,'missile-rear-band',new THREE.CylinderGeometry(.643,.62,.28,16,1,true),material(colors.band),-.55,0,0);band.rotation.z=-Math.PI/2;
 const exhaust=missilePart(root,'missile-exhaust-nozzle',new THREE.CylinderGeometry(.27,.35,.22,12),material(0x242b30),-1.14,0,0);exhaust.rotation.z=-Math.PI/2;
 addMissileFins(root,colors.fin);
 const radiusAt=x=>{
  for(let i=1;i<profile.length;i++)if(x<=profile[i][1]){const [a,ax]=profile[i-1],[b,bx]=profile[i];return a+(b-a)*(x-ax)/(bx-ax);}
  return .01;
 };
 // Paint is tessellated around the curved shell so the face follows the model.
 const patch=(name,points,color,side,lift=.025)=>{
  const contour=points.map(p=>new THREE.Vector2(...p)),triangles=THREE.ShapeUtils.triangulateShape(contour,[]),positions=[];
  const vertex=([x,y])=>{const r=radiusAt(x);positions.push(x,y,side*(Math.sqrt(Math.max(0,r*r-y*y))+lift));};
  const split=(a,b,c,depth)=>{
   if(!depth){vertex(a);vertex(side>0?b:c);vertex(side>0?c:b);return;}
   const mid=(u,v)=>[(u[0]+v[0])/2,(u[1]+v[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
   split(a,ab,ca,depth-1);split(ab,b,bc,depth-1);split(ca,bc,c,depth-1);split(ab,bc,ca,depth-1);
  };
  triangles.forEach(([a,b,c])=>split(points[a],points[b],points[c],2));
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
  return missilePart(root,name,geometry,paint(color));
 };
 for(const side of [-1,1]){
  patch('angry-eye-outline',[[.88,.24],[.62,.47],[.08,.43],[.21,.19],[.50,.13]],colors.eye,side);
  patch('angry-white-eye',[[.77,.26],[.57,.40],[.19,.385],[.29,.235],[.50,.20]],0xfffbed,side,.038);
  const mouth=tier===2?[[1.08,-.08],[.80,-.33],[.20,-.34],[-.03,-.11],[.20,.015],[.73,.02]]:[[1.08,-.065],[.86,-.32],[.35,-.53],[-.27,-.45],[-.56,-.19],[-.37,.035],[.20,.12],[.76,.08]];
  patch('shark-mouth-outline',mouth,colors.ink,side,.026);
  const inside=tier===2?[[.98,-.08],[.76,-.28],[.26,-.28],[.08,-.115],[.24,-.055],[.70,-.035]]:[[.99,-.07],[.81,-.29],[.34,-.46],[-.22,-.39],[-.45,-.20],[-.30,-.025],[.20,.05],[.72,.01]];
  patch('white-shark-jaw',inside,0xfffbed,side,.043);
  const jagged=tier===5?[[.75,-.13],[.46,-.11],[.57,-.25],[.13,-.14],[.24,-.31],[-.12,-.25],[-.04,-.36],[-.25,-.26],[-.26,-.18],[.01,-.18],[-.05,-.075],[.38,-.13],[.29,-.055],[.64,-.045]]:
   tier===3?[[.73,-.12],[.34,-.13],[.40,-.29],[.10,-.21],[.13,-.36],[-.16,-.30],[-.07,-.37],[.22,-.32],[.22,-.17],[.49,-.24],[.47,-.09],[.69,-.06]]:
   tier===4?[[.81,-.12],[.52,-.06],[.58,-.31],[.20,-.11],[.24,-.39],[-.15,-.18],[-.10,-.37],[-.27,-.22],[-.25,-.15],[.02,-.27],[-.03,-.08],[.39,-.24],[.35,-.035],[.68,-.23]]:
   [[.83,-.11],[.67,-.08],[.71,-.25],[.50,-.095],[.53,-.27],[.35,-.08],[.37,-.24],[.22,-.12],[.31,-.16],[.32,-.065],[.47,-.19],[.47,-.065],[.64,-.20],[.64,-.065]];
  patch('jagged-shark-teeth',jagged,colors.ink,side,.057);
  if(tier===5){
   patch('green-forehead-stripe',[[.92,.21],[.86,.32],[.53,.52],[.19,.55],[.13,.48],[.49,.46],[.79,.28]],colors.band,side,.026);
  }
 }
 return root;
}

export function makeBombMiddleTowerMesh(tier){
 if(!Number.isInteger(tier)||tier<1||tier>5)throw new RangeError('Invalid middle-path model tier');
 if(tier===1){
  const root=makeBombTopTowerMesh(0);root.name=middleNames[tier];
  Object.assign(root.userData,{bombBaseModel:false,bombModelPath:1,bombModelTier:1});
  Object.assign(root.userData.bombRig,{path:1,tier:1});addMissileFins(root.userData.weapon,0xe01418);return root;
 }
 const root=new THREE.Group(),body=new THREE.Group(),weapon=buildBombMissile(tier);root.name=middleNames[tier];root.add(body);body.add(weapon);
 const steel=missileMaterial(0x484d56),rim=missileMaterial(0x989ba0),black=missileMaterial(0x171b20),yellow=missileMaterial(0xefbf16);
 missilePart(body,'launcher-base-wall',new THREE.CylinderGeometry(.99,1.02,.55,16,1,true),steel,0,.33,0);
 missilePart(body,'launcher-floor',new THREE.CylinderGeometry(.96,.97,.08,16),black,0,.075,0);
 const floor=missilePart(body,'hazard-platform',new THREE.CircleGeometry(.84,32),black,0,.55,0);floor.rotation.x=-Math.PI/2;
 const lip=missilePart(body,'launcher-lip',new THREE.TorusGeometry(.925,.08,6,16),rim,0,.64,0);lip.rotation.x=Math.PI/2;
 missilePart(body,'launcher-inner-wall',new THREE.CylinderGeometry(.845,.845,.14,16,1,true),steel,0,.57,0);
 const clip=(points,offset,lower)=>{
  const out=[];
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],av=a[0]+a[1]-offset,bv=b[0]+b[1]-offset,inside=lower?av>=0:av<=0,nextInside=lower?bv>=0:bv<=0;
   if(inside)out.push(a);if(inside!==nextInside){const t=av/(av-bv);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
  }return out;
 };
 for(const offset of [-1.2,-.6,0,.6,1.2]){
  const circle=Array.from({length:32},(_,i)=>[Math.cos(i*Math.PI/16)*.82,Math.sin(i*Math.PI/16)*.82]);
  const points=clip(clip(circle,offset-.15,true),offset+.15,false);if(points.length<3)continue;
  const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(...p))),stripe=missilePart(body,'yellow-hazard-stripe',new THREE.ShapeGeometry(shape),yellow,0,.554,0);stripe.rotation.set(-Math.PI/2,0,.45);
 }
 for(const side of [-1,1]){
  missilePart(body,'launcher-cradle',new THREE.BoxGeometry(.38,.80,.15),steel,-.18,1.01,side*.48);
  const pivot=missilePart(body,'launcher-pivot',new THREE.CylinderGeometry(.21,.21,.20,10),rim,-.18,1.40,side*.52);pivot.rotation.x=Math.PI/2;
 }
 weapon.position.set(0,1.57,0);weapon.rotation.z=.14;weapon.scale.setScalar(tier>=4?1.06:1);
 weapon.userData.rest=weapon.position.clone();
 root.userData={body,weapon,aimOffset:-Math.PI/2,bombBaseModel:false,bombModelPath:1,bombModelTier:tier,
  bombRig:{path:1,tier,body,weapon,wheels:[],core:null,restRotationZ:.14}};
 return root;
}

export function makeBombMissileProjectile(tier){
 const root=new THREE.Group(),missile=buildBombMissile(tier);missile.rotation.y=-Math.PI/2;missile.scale.setScalar(.42);root.add(missile);
 const flame=missilePart(missile,'missile-flame',new THREE.ConeGeometry(.18,.50,6),new THREE.MeshBasicMaterial({color:0xffa324}),-1.48,0,0);flame.rotation.z=Math.PI/2;
 root.userData.exhaust=flame;root.userData.bombMissileTier=tier;return root;
}

const bottomNames=['','Extra Range','Frag Bombs','Cluster Bombs','Recursive Cluster','Bomb Blitz'];
const cannonProfile=[[0,-1.10],[.36,-1.06],[.62,-.87],[.75,-.54],[.78,-.08],[.76,.43],[.86,.68],[.86,.85]];
function addCannonMark(weapon,starburst){
 const material=new THREE.MeshBasicMaterial({color:0xf0121a,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),positions=[];
 const project=([x,z])=>{
  let r=.76;for(let i=1;i<cannonProfile.length;i++)if(x<=cannonProfile[i][1]){const [a,ax]=cannonProfile[i-1],[b,bx]=cannonProfile[i];r=a+(b-a)*(x-ax)/(bx-ax);break;}
  // Match the flat facets instead of floating the paint above a smooth cylinder.
  const angle=Math.asin(Math.max(-.99,Math.min(.99,z/r))),step=Math.PI/8,local=((angle%step)+step)%step;
  const surface=r*Math.cos(step/2)/Math.cos(local-step/2),actualZ=surface*Math.sin(angle);
  positions.push(x,surface*Math.cos(angle)+.007,actualZ);
 };
 const triangle=(a,b,c,depth=2)=>{
  if(!depth){project(a);project(b);project(c);return;}
  const mid=(u,v)=>[(u[0]+v[0])/2,(u[1]+v[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
  triangle(a,ab,ca,depth-1);triangle(ab,b,bc,depth-1);triangle(ca,bc,c,depth-1);triangle(ab,bc,ca,depth-1);
 };
 const center=[-.43,-.25],point=(angle,r)=>[center[0]+Math.cos(angle)*r,center[1]+Math.sin(angle)*r*.80];
 if(starburst){
  const points=Array.from({length:20},(_,i)=>point(i*Math.PI/10,i%2?.16:.40));
  THREE.ShapeUtils.triangulateShape(points.map(p=>new THREE.Vector2(...p)),[]).forEach(([a,b,c])=>triangle(points[a],points[b],points[c]));
 }else{
  for(let i=0;i<32;i++){
   const a=i*Math.PI/16,b=(i+1)*Math.PI/16,ao=point(a,.37),bo=point(b,.37),ai=point(a,.27),bi=point(b,.27);
   triangle(ao,bo,ai);triangle(bo,bi,ai);triangle(center,point(a,.13),point(b,.13));
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
 const mark=missilePart(weapon,starburst?'red-frag-starburst':'red-target-mark',geometry,material);mark.castShadow=false;mark.receiveShadow=false;
}
function bottomBarrel(weapon,tier){
 const green=0x70bc0a,yellow=0xffd321,navy=0x202849,body=missileMaterial(tier===2?0x252b44:tier===5?navy:green),gold=missileMaterial(yellow),black=missileMaterial(0x10121c);
 const lathe=(name,profile,material)=>{const mesh=missilePart(weapon,name,new THREE.LatheGeometry(profile.map(([r,x])=>new THREE.Vector2(r,x)),16),material);mesh.rotation.z=-Math.PI/2;return mesh;};
 const shellProfile=tier===2?[[0,-1.10],[.36,-1.06],[.62,-.87],[.75,-.54],[.78,-.08],[.74,.40],[.70,1.06],[.47,1.06],[.46,.93]]:
  [[0,-1.10],[.40,-1.04],[.63,-.87],[.72,-.57],[.73,.26],[.78,.45],[.79,1.07],[.53,1.07],[.52,.93]];
 lathe('rounded-cannon-shell',shellProfile,body);
 if(tier>=3)lathe('yellow-front-barrel',[[.745,.21],[.795,.36],[.80,1.10],[.53,1.10],[.52,.93]],gold);
 const muzzle=missilePart(weapon,'thick-muzzle-rim',new THREE.RingGeometry(tier===2?.47:.53,tier===2?.74:.84,16),tier===2?missileMaterial(0x343950):gold,tier===2?1.075:1.115);muzzle.rotation.y=Math.PI/2;
 const bore=missilePart(weapon,'hollow-bore',new THREE.CylinderGeometry(tier===2?.466:.525,.43,1.47,16,1,true),black,.34);bore.rotation.z=-Math.PI/2;
 const shadow=missilePart(weapon,'bore-shadow',new THREE.CircleGeometry(.44,16),black,-.40);shadow.rotation.y=Math.PI/2;
 if(tier===2){addCannonMark(weapon,true);return;}
 const bandMaterial=missileMaterial(tier===5?yellow:0x8cce16);
 lathe('green-center-band',[[.746,-.09],[.80,-.02],[.80,.18],[.75,.24]],bandMaterial);
 if(tier>=4){
  if(tier===5){
   // Blitz's dark sleeve distinguishes it from the yellow Recursive barrel.
   lathe('navy-front-sleeve',[[.805,.33],[.82,.39],[.82,.78],[.805,.83]],body);
   lathe('gold-front-ring',[[.82,.82],[.85,.85],[.85,.96],[.82,.99]],gold);
  }
  for(const x of [tier===5?.99:.92,.42])for(let i=0;i<8;i++){
   if(tier===5&&x===.42)continue;
   const a=i*Math.PI/4,bolt=missilePart(weapon,'yellow-barrel-bolt',new THREE.SphereGeometry(.073,6,4),gold,x,Math.cos(a)*.80,Math.sin(a)*.80);bolt.scale.set(1,1.2,1.2);
  }
 }
}

export function makeBombBottomTowerMesh(tier){
 if(!Number.isInteger(tier)||tier<1||tier>5)throw new RangeError('Invalid bottom-path model tier');
 let root,body,weapon,wheels,core=null,glow=null;
 if(tier<=3){
  root=makeBombTopTowerMesh(tier===1?0:2);({body,weapon,wheels}=root.userData.bombRig);
  if(tier===1)addCannonMark(weapon,false);
  else{
   const geometries=new Set(),materials=new Set();weapon.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
   weapon.clear();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());bottomBarrel(weapon,tier);
   weapon.scale.setScalar(1);weapon.position.y=1.38;
  }
 }else{
  root=new THREE.Group();body=new THREE.Group();weapon=new THREE.Group();root.add(body);body.add(weapon);wheels=[];
  const base=missileMaterial(tier===5?0x66af0b:0x1d2854),edge=missileMaterial(tier===5?0x477b08:0x111a39),trim=missileMaterial(tier===5?0x84c713:0x343d72),yellow=missileMaterial(0xffd522);
  missilePart(body,'pedestal-foot',new THREE.CylinderGeometry(1.02,1.10,.16,16),edge,0,.12);
  missilePart(body,'pedestal-wall',new THREE.CylinderGeometry(.94,1.02,.54,16),base,0,.43);
  const lip=missilePart(body,'pedestal-rim',new THREE.TorusGeometry(.95,.065,6,16),trim,0,.70);lip.rotation.x=Math.PI/2;
  const shape=new THREE.Shape();shape.moveTo(-.77,.66);shape.lineTo(.59,.66);shape.lineTo(.14,1.83);shape.lineTo(-.25,1.83);shape.closePath();
  for(const side of [-1,1]){
   missilePart(body,'triangular-cannon-cradle',new THREE.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:false}),base,0,0,side*.70-.085);
   const pivot=missilePart(body,'trunnion-ring',new THREE.CylinderGeometry(.27,.27,.21,12),trim,-.10,1.71,side*.73);pivot.rotation.x=Math.PI/2;
   const cap=missilePart(body,'yellow-trunnion-cap',new THREE.CylinderGeometry(.18,.21,.09,12),yellow,-.10,1.71,side*.88);cap.rotation.x=Math.PI/2;
  }
  if(tier===5)for(let i=0;i<12;i++){
   const a=i*Math.PI/6,bolt=missilePart(body,'pedestal-bolt',new THREE.CylinderGeometry(.065,.065,.045,6),trim,Math.cos(a)*1.00,.31,Math.sin(a)*1.00);
   bolt.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),0,Math.sin(a)));
  }
  weapon.position.set(0,1.74,0);weapon.rotation.z=.07;bottomBarrel(weapon,tier);
  if(tier===5){
   core=new THREE.MeshStandardMaterial({color:0xfff392,emissive:0xffdc2a,emissiveIntensity:.6,flatShading:true});
   const face=missilePart(weapon,'blitz-glowing-muzzle',new THREE.CircleGeometry(.52,16),new THREE.MeshBasicMaterial({color:0xfffdf0}),1.12);face.rotation.y=Math.PI/2;face.castShadow=false;
   const coronaMaterial=new THREE.MeshBasicMaterial({color:0xffeb18,transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
   const halo=missilePart(weapon,'blitz-muzzle-halo',new THREE.RingGeometry(.52,.98,32),coronaMaterial,1.13);halo.rotation.y=Math.PI/2;halo.castShadow=false;
   const bright=missilePart(weapon,'blitz-core-ring',new THREE.TorusGeometry(.53,.045,6,16),core,1.14);bright.rotation.y=Math.PI/2;
   const rays=new THREE.Group();rays.name='blitz-muzzle-rays';weapon.add(rays);rays.position.x=1.15;
   const rayMaterial=new THREE.MeshBasicMaterial({color:0xfffbc5,transparent:true,opacity:.75,depthWrite:false,side:THREE.DoubleSide});
   for(let i=0;i<6;i++){
    const a=i*Math.PI/3,ray=missilePart(rays,'blitz-light-ray',new THREE.PlaneGeometry(.025,i%2?.30:.43),rayMaterial,0,Math.cos(a)*.76,Math.sin(a)*.76);ray.rotation.set(a,Math.PI/2,0);ray.castShadow=false;
   }
   glow={halo,rays,coronaMaterial,rayMaterial};
  }
 }
 root.name=bottomNames[tier];body.name=tier>=4?'bomb-pedestal':'bomb-carriage';weapon.name='bomb-barrel';weapon.userData.rest=weapon.position.clone();
 root.userData={body,weapon,aimOffset:-Math.PI/2,bombBaseModel:false,bombModelPath:2,bombModelTier:tier,
  bombRig:{path:2,tier,body,weapon,wheels,core,glow,restRotationZ:tier>=4?.07:0}};
 return root;
}

export function animateBomb(t,dt){
 const rig=t.mesh.userData.bombRig;if(!rig)return;
 t.bombIdleTime=(t.bombIdleTime??t.id*.39)+dt;
 t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);
 const time=t.bombIdleTime,kick=Math.sin(t.fireAnim/.24*Math.PI);
 // Keep the carriage planted; only the barrel quietly rocks on its trunnions.
 rig.weapon.position.copy(rig.weapon.userData.rest);
 rig.weapon.position.x-=kick*(rig.tier===5?.36:.26);
 rig.weapon.position.y+=Math.sin(time*2.0)*.014;
 rig.weapon.rotation.z=(rig.restRotationZ||0)+Math.sin(time*1.7)*.014+kick*.035;
 rig.weapon.rotation.x=Math.sin(time*1.3)*.005;
 rig.body.rotation.z=kick*.012;
 rig.wheels.forEach(wheel=>{wheel.rotation.z=-kick*.035;});
 if(rig.core)rig.core.emissiveIntensity=.08+(Math.sin(time*2.1)+1)*.04+kick*.08;
 if(rig.glow){
  const pulse=(Math.sin(time*2.1)+1)*.5;
  rig.glow.coronaMaterial.opacity=.18+pulse*.10+kick*.12;
  rig.glow.rayMaterial.opacity=.55+pulse*.25;
  rig.glow.halo.scale.setScalar(1+pulse*.025+kick*.07);
  rig.glow.rays.rotation.x=time*.12;
 }
}
