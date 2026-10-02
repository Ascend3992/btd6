import * as THREE from './assets/vendor/three.module.js';

// Visuals only: attack timing, damage, targeting and collision stay in game.js.
const names=[
 ['Improved Rangs','Glaives','Glaive Ricochet','M.O.A.R Glaives','Glaive Lord'],
 ['Faster Throwing','Faster Rangs','Bionic Boomerang','Turbo Charge','Perma Charge'],
 ['Long Range Rangs','Red Hot Rangs','Kylie Boomerang','MOAB Press','MOAB Domination']
];
const suits=[
 [[0xffd628,0xea3023],[0xe83526,0x35d9e3],[0x7b29bb,0x35d9e3],[0x9c9fa5,0x424751],[0x52267c,0x211f2c]],
 [[0xffd628,0xea3023],[0x979ca2,0xea3023],[0x737d85,0xea3023],[0x434b54,0xffd04d],[0x343a47,0x9997d9]],
 [[0xffd628,0xea3023],[0xf98b25,0xffd628],[0xa56a35,0xf5c57c],[0x636a3c,0xb62c22],[0xa4602e,0xffce50]]
];
function material(color,glow=false){return new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.02,flatShading:true,...(glow?{emissive:color,emissiveIntensity:.35}:{})})}
function addMesh(parent,name,geometry,mat,x=0,y=0,z=0){
 const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function oval(parent,name,mat,x,y,z,sx,sy,sz){const mesh=addMesh(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);mesh.scale.set(sx,sy,sz);return mesh}
function block(parent,name,mat,x,y,z,w,h,d){return addMesh(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z)}
function tube(parent,name,mat,points,radius){return addMesh(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,6,false),mat)}
function plate(parent,name,mat,points,depth=.10){
 const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const mesh=addMesh(parent,name,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1}),mat);mesh.rotation.x=-Math.PI/2;return mesh;
}

export function boomerangProjectileKind(t,special=false){
 const [top,middle,bottom]=t.paths;
 if(bottom>=3)return bottom>=5?'dominationKylie':special?'pressKylie':'kylie';
 if(top>=5)return bottom>=2?'hotLordGlaive':'lordGlaive';
 if(top>=2)return bottom>=2?'hotGlaive':'glaive';
 if(middle>=5)return 'permaRang';
 if(bottom>=2)return 'hotBoomer';
 if(middle>=4)return 'turboRang';
 if(middle>=3)return 'bionicRang';
 return 'boomer';
}

export function makeBoomerangWeapon(kind){
 const weapon=new THREE.Group();weapon.name=kind;weapon.userData.weaponKind=kind;
 const hot=kind.startsWith('hot'),glaive=kind.toLowerCase().includes('glaive'),lord=kind.toLowerCase().includes('lord');
 const metal=material(0xd2dde1),cyan=material(hot?0xffa333:0x35dbe8,true);
 if(glaive){
  for(let i=0;i<4;i++){
   const blade=plate(weapon,'glaive-blade',metal,[[.10,.15],[.39,.27],[.72,.78],[.72,.26],[.43,-.08],[.13,-.13]]);
   blade.rotation.z=i*Math.PI/2;
  }
  const star=[];for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.20:.34;star.push([Math.cos(a)*r,Math.sin(a)*r])}
  plate(weapon,'glaive-hub',material(lord?0x333743:0xf4c638),star,.13);
  oval(weapon,'glaive-gem',cyan,0,.17,0,.17,.10,.17);
  return weapon;
 }
 const kylie=kind.toLowerCase().includes('kylie'),perma=kind==='permaRang';
 const wood=material(perma?0x404751:hot?0xef4a26:kind==='dominationKylie'?0xe99035:0xaf742e);
 const outline=material(perma?0xff39da:kind==='dominationKylie'?0x3d3027:0xe6aa50,perma);
 const points=kylie?[[.25,-.87],[.04,-.94],[-.30,.15],[-.64,.43],[-.81,.61],[-.68,.78],[-.37,.61],[-.10,.26]]:[[-.79,.46],[-.65,.65],[-.12,.29],[.07,.19],[.48,-.53],[.27,-.70],[-.22,-.10]];
 plate(weapon,'rang-edge',outline,points,.14);
 const inner=plate(weapon,'rang-body',wood,points,.16);inner.scale.set(.83,.83,1);inner.position.y=.012;
 const band=material(perma||kind==='bionicRang'||kind==='turboRang'?0x60e333:hot?0xffdf57:0xffedb1,perma);
 const tip=block(weapon,'rang-tip',band,-.65,.12,-.50,.17,.075,.22);tip.rotation.y=-.6;
 if(kylie){const stripe=block(weapon,'kylie-red-band',material(0xcc3323),-.44,.16,-.47,.19,.04,.25);stripe.rotation.y=-.6}
 if(perma){const pulse=block(weapon,'perma-core',band,.24,.17,.38,.16,.06,.22);pulse.rotation.y=-.45}
 return weapon;
}

function buildModel(paths,path){
 const tier=paths[path],root=new THREE.Group();root.name=tier?names[path][tier-1]:'Boomerang Monkey';
 const body=new THREE.Group();body.name='body-pivot';root.add(body);
 const [suitColor,stripeColor]=tier?suits[path][tier-1]:[0xb76a31,0xe8aa58];
 const suit=material(suitColor),stripe=material(stripeColor),fur=material(0x975e31),skin=material(0xd99a5f),dark=material(0x33251d);
 const white=material(0xfff0d1),steel=material(0x697580),green=material(0x54e72d,true),pink=material(0xff39da,true);
 const hood=path===0&&tier>=4,cowboy=path===2&&tier>=3,tech=path===1&&tier>=3,lord=path===0&&tier===5;
 addMesh(body,'monkey-body',new THREE.CylinderGeometry(.72,.86,1.15,12),cowboy?fur:suit,0,.82,0);
 for(const side of [-1,1])oval(root,'foot',lord?dark:fur,side*.43,.15,.30,.31,.17,.42);
 if(tier&&!cowboy)block(body,'chest-stripe',stripe,0,.87,.79,.15,.88,.055);
 if(hood){
  const cape=block(body,'hooded-cloak',suit,0,1.04,-.57,1.52,1.48,.18);cape.rotation.x=-.12;
  block(body,'cloak-collar',stripe,0,1.42,.60,.97,.16,.15);
 }
 if(cowboy){
  for(const side of [-1,1])block(body,'vest',path===2&&tier===4?suit:stripe,side*.39,.90,.66,.34,.95,.18);
  block(body,'vest-button',white,0,1.10,.82,.12,.12,.04);
  if(tier===5){const cape=block(body,'domination-cape',dark,0,1.05,-.64,1.57,1.36,.14);cape.rotation.x=-.18}
 }
 const head=new THREE.Group();head.name='head-pivot';head.position.y=1.82;body.add(head);
 oval(head,'head',tier&&!cowboy?suit:skin,0,0,0,.81,.77,.75);
 for(const side of [-1,1]){oval(head,'ear',fur,side*.79,-.03,0,.19,.24,.14);oval(head,'inner-ear',skin,side*.82,-.03,.13,.10,.14,.025)}
 if(tier&&!cowboy)oval(head,'face',skin,0,-.14,.60,.64,.48,.17);
 oval(head,'muzzle',skin,0,-.35,.73,.32,.19,.12);
 const eyes=[];
 for(const side of [-1,1]){
  const eye=oval(head,'eye',dark,side*.28,.05,.746,.077,.11,.042);eyes.push(eye);
  if(tier>=3){const brow=block(head,'eyebrow',dark,side*.29,.23,.70,.27,.065,.10);brow.rotation.z=side*.17}
 }
 const mouth=block(head,'mouth',dark,0,-.40,.855,.13,.025,.012);mouth.rotation.z=.06;
 if(tier&&!cowboy){
  if(path===2){
   for(const side of [-1,1])tube(head,'v-head-stripe',stripe,[[side*.47,.57,.26],[side*.25,.42,.58],[0,.26,.73]],.065);
  }else{
   tube(head,'crown-stripe',stripe,[[0,.28,.73],[0,.66,.39],[0,.79,0],[0,.64,-.40],[0,.24,-.73]],.058);
   if(path===0&&tier<4)tube(head,'crossing-stripe',stripe,[[-.77,.16,0],[-.50,.61,0],[0,.79,0],[.5,.61,0],[.77,.16,0]],.058);
   if(path===1&&tier===2)tube(head,'second-red-stripe',stripe,[[.38,.34,.62],[.38,.67,.2],[.38,.62,-.35]],.058);
  }
 }
 if(hood){
  for(const side of [-1,1]){const trim=block(head,'hood-rim',stripe,side*.66,-.03,.44,.16,1.12,.19);trim.rotation.z=side*.15}
 }
 if(cowboy){
  const hat=new THREE.Group();hat.name='hat';hat.position.y=.51;hat.rotation.z=tier===5?-.17:.04;head.add(hat);
  const hatMat=material(tier===3?0xe7b16c:tier===4?0x65693c:0xeaa347);
  const brim=addMesh(hat,'hat-brim',new THREE.CylinderGeometry(1.07,1.10,.13,12),hatMat);brim.scale.z=.85;
  addMesh(hat,'hat-crown',new THREE.CylinderGeometry(.52,.72,.44,8),hatMat,0,.26,-.04);
  addMesh(hat,'hat-band',new THREE.CylinderGeometry(.72,.75,.13,12),tier===4?stripe:dark,0,.10,-.04);
  for(const x of [-.38,0,.38])addMesh(hat,'hat-spike',new THREE.ConeGeometry(.10,.28,4),white,x,.26,.61);
  if(tier===5)block(head,'yellow-headband',stripe,0,-.13,.76,1.18,.12,.06);
 }
 const glowMaterials=[];
 if(tech){
  const rim=addMesh(head,'bionic-lens-rim',new THREE.TorusGeometry(.28,.08,6,12),steel,-.28,.07,.77);
  rim.rotation.y=-.05;oval(head,'bionic-lens',green,-.28,.07,.81,.25,.25,.09);glowMaterials.push(green);
  if(tier>=4){
   block(head,'helmet-plate',steel,0,.59,.32,.75,.25,.48);
   for(let i=0;i<3;i++)block(head,'helmet-vent',dark,0,.48+i*.09,.585,.32,.035,.025);
  }
  if(tier===5){
   for(const side of [-1,1])for(let i=0;i<3;i++)block(head,'green-helmet-light',green,side*.60,.30+i*.12,.44,.13,.065,.12);
   const crest=addMesh(head,'perma-crest',new THREE.ConeGeometry(.13,.43,4),steel,.13,.93,0);crest.rotation.z=-.15;
   tube(head,'pink-helmet-trim',pink,[[-.68,.35,-.17],[-.38,.72,-.25],[.15,.85,-.23],[.69,.41,-.14]],.065);glowMaterials.push(pink);
  }
 }
 const tailPivot=new THREE.Group();tailPivot.name='tail-pivot';tailPivot.position.set(0,.54,-.60);body.add(tailPivot);
 tube(tailPivot,'curled-tail',cowboy||hood?fur:suit,[[0,0,0],[-.6,-.06,-.20],[-1.06,-.08,-.08],[-1.18,.12,.13],[-.99,.23,.27]],.11);
 function arm(side){
  const pivot=new THREE.Group();pivot.name=side===1?'throwing-arm-pivot':'off-arm-pivot';pivot.position.set(side*.67,1.29,0);body.add(pivot);
  const sleeve=addMesh(pivot,'sleeve',new THREE.CylinderGeometry(.19,.22,.60,8),cowboy?fur:suit,side*.23,-.20,.02);sleeve.rotation.z=side*.83;
  oval(pivot,'hand',lord||tier===5&&cowboy?dark:path===2&&tier===2?material(0xd43324):fur,side*.48,-.40,.16,.24,.25,.23);
  return pivot;
 }
 const throwArm=arm(1),offArm=arm(-1);
 if(tech){
  block(throwArm,'bionic-arm',steel,.37,-.17,.06,tier>=4?.76:.61,.53,.57);
  block(throwArm,'bionic-fist',steel,.52,-.39,.23,tier===5?.78:.62,.51,.63);
  block(throwArm,'arm-light',green,.52,-.09,.57,.31,.08,.035);
  for(let i=0;i<3;i++)block(throwArm,'metal-knuckle',dark,.30+i*.20,-.34,.56,.12,.21,.04);
  if(tier===5)tube(throwArm,'pink-gauntlet',pink,[[.13,-.64,.58],[.13,-.13,.58],[.86,-.13,.58],[.86,-.64,.58],[.13,-.64,.58]],.052);
 }
 const weaponKind=boomerangProjectileKind({paths}),weapon=makeBoomerangWeapon(weaponKind);
 weapon.position.set(.55,-.27,.47);weapon.rotation.x=Math.PI/2;weapon.scale.setScalar(.85);throwArm.add(weapon);
 if(path===0&&tier===4){const spare=makeBoomerangWeapon('glaive');spare.position.set(-.50,-.25,.43);spare.rotation.x=Math.PI/2;spare.scale.setScalar(.7);offArm.add(spare)}
 if(paths[2]>=2&&!cowboy)block(throwArm,'red-hot-wristband',material(0xe74d25),.42,-.25,.14,.12,.33,.44);
 return {root,body,head,eyes,throwArm,offArm,tail:tailPivot,weapon,weaponKind,glowMaterials,path,tier};
}

export function makeBoomerangTowerMesh(){
 const mesh=new THREE.Group(),rig=buildModel([0,0,0],0);mesh.add(rig.root);mesh.userData.boomerRig=rig;return mesh;
}
export function updateBoomerangAppearance(t,dispose){
 const data=t.mesh.userData;let path=data.boomerRig?.path??0;
 for(let p=0;p<3;p++)if(t.paths[p]>t.paths[path])path=p;
 const key=path+':'+t.paths.join(':');if(data.boomerVisualKey===key)return;
 if(data.boomerRig)dispose(data.boomerRig.root);
 const rig=buildModel(t.paths,path);t.mesh.add(rig.root);data.boomerRig=rig;data.boomerVisualKey=key;
}
export function triggerBoomerangThrow(t,target,special=false){
 const source=t.sourceTower||t;
 const duration=Math.max(.16,Math.min(.32,(t.rate||.3)*.65));
 source.boomerThrowDuration=duration;source.boomerThrowTimer=duration;source.boomerRapidThrow=t.rate<.12;
 source.boomerAim=Math.atan2(target.mesh.position.x-source.x,target.mesh.position.z-source.z);
 source.boomerSpecialThrow=special;
}
export function animateBoomerang(t,dt){
 const rig=t.mesh.userData?.boomerRig;if(!rig)return;
 t.boomerIdleTime=(t.boomerIdleTime??t.id*.37)+dt;const time=t.boomerIdleTime;
 t.boomerThrowTimer=Math.max(0,(t.boomerThrowTimer||0)-dt);
 const active=t.boomerThrowTimer>0,phase=active?1-t.boomerThrowTimer/t.boomerThrowDuration:0;
 // A continuous arm cycle stays visible when Perma Charge emits several throws per frame.
 const swing=!active?0:t.boomerRapidThrow?.45+.5*Math.sin(time*28):phase<.25?-phase*2:.85*Math.sin((phase-.25)/.75*Math.PI);
 if(Number.isFinite(t.boomerAim)){
  const delta=Math.atan2(Math.sin(t.boomerAim-t.mesh.rotation.y),Math.cos(t.boomerAim-t.mesh.rotation.y));t.mesh.rotation.y+=delta*Math.min(1,dt*14);
 }
 rig.body.position.y=Math.sin(time*2.3)*.028;rig.body.rotation.x=-swing*.055;rig.body.rotation.z=Math.sin(time*1.7)*.018;
 rig.head.rotation.y=Math.sin(time*1.2)*.045;rig.head.rotation.z=Math.sin(time*1.6)*.025;
 rig.throwArm.rotation.x=-swing*(t.boomerSpecialThrow?1.1:.85);rig.throwArm.rotation.y=-swing*.35;rig.throwArm.rotation.z=Math.sin(time*2)*.04;
 rig.offArm.rotation.x=swing*.23+Math.sin(time*2+.8)*.06;
 rig.tail.rotation.y=Math.sin(time*1.8)*.15;rig.tail.rotation.x=Math.sin(time*2.1)*.07;
 const blink=(time%4.1)>3.96?.12:1;rig.eyes.forEach(eye=>eye.scale.y=.11*blink);
 rig.weapon.visible=!active||t.boomerRapidThrow||phase<.32||phase>.73;
 rig.weapon.rotation.z=active?swing*.35:Math.sin(time*1.4)*.045;
 const turbo=t.abilityTimer>0&&t.activeAbility?.kind==='turbo';
 rig.glowMaterials.forEach(mat=>mat.emissiveIntensity=(turbo?.9:.3)+(.10+(turbo?.35:.08))*Math.sin(time*(turbo?15:3)));
}
