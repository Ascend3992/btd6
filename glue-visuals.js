import * as THREE from './assets/vendor/three.module.js';

// Faceted, fully rigged model based on the supplied brown monkey / yellow gun.
export function makeBaseGlueTowerMesh(){return makeGlueModel(0);}
export function makeGlueTopTowerMesh(tier){return makeGlueModel(Math.max(1,Math.min(5,tier)));}
function makeGlueModel(tier){
 const root=new THREE.Group(),body=new THREE.Group(),pose=new THREE.Group(),weapon=new THREE.Group();root.add(body);body.add(pose);pose.add(weapon);
 root.name=tier?'reference-glue-top-'+tier:'reference-glue-gunner';
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.75,flatShading:true});
 const suitColors=[0x8e421d,0x8e421d,0x8119be,0x1475c6,0x163f50,0x79a816];
 const fur=material(suitColors[tier]),hair=material(0x6b2b13),skin=material(tier===5?0x434d4c:0xf4bd65),cream=material(0xffe5a2),green=material(0x3f841c),dark=material(0x293321),steel=material(tier>=2?0x627c84:0x69725c),glue=material(tier>=3?0x79f336:0xf0cf25),white=material(0xfffbdf);
 const graphite=material(0x2d3c40),rimMat=material(tier===2?0x896118:0x8a9699);
 const lensMat=new THREE.MeshStandardMaterial({color:0x59e900,emissive:0x2b7900,emissiveIntensity:.16,roughness:.22,flatShading:true});
 const fluids=[],sprays=[],capsules=[];
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(parent,name,mat,x,y,z,w,h,d)=>part(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const tube=(parent,name,mat,points,radius)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,6,false),mat);
 const feet=[];
 for(const side of [-1,1]){
  oval(pose,'brown-leg',fur,side*.27,.49,.06,.19,.34,.21);
  const foot=oval(body,tier>=3?'planted-protective-boot':'planted-brown-foot',tier>=4?graphite:tier>=2?skin:fur,side*.29,.18,.22,.24,.15,.38);feet.push(foot);
  for(let i=0;i<3;i++)box(body,'foot-toe',tier>=4?steel:skin,side*.29+(i-1)*.10,.16,.51,.065,.08,.10);
 }
 oval(pose,'brown-monkey-body',fur,0,1.05,0,.48,.62,.37);
 if(tier<2)oval(pose,'tan-belly',skin,0,.99,.31,.29,.35,.08);
 else{
  box(pose,'hazmat-suit-zipper',graphite,0,1.02,.365,.06,.65,.04);
  const belt=part(pose,'gray-utility-belt',new THREE.TorusGeometry(.45,.065,5,12),graphite,0,.82,0);belt.rotation.x=Math.PI/2;belt.scale.y=.8;
  box(pose,'belt-buckle',steel,0,.83,.39,.14,.14,.06);
 }
 const head=new THREE.Group();head.position.set(0,2.13,.02);pose.add(head);
 oval(head,tier===2?'purple-corrosive-hood':tier===3?'blue-dissolver-hood':tier===4?'navy-liquefier-hood':tier===5?'green-solver-hood':'brown-monkey-head',fur,0,0,0,.73,.76,.57);
 const eyes=[];
 for(const side of [-1,1]){
  oval(head,'round-monkey-ear',fur,side*.70,-.03,-.03,.24,.30,.15);
  oval(head,'tan-inner-ear',tier>=3?steel:skin,side*.73,-.03,.09,.14,.20,.07);
  if(tier<2){
   oval(head,'tan-eye-mask',skin,side*.24,.02,.46,.32,.39,.11);
   const eye=new THREE.Group();eye.position.set(side*.25,.06,.54);head.add(eye);eyes.push(eye);
   oval(eye,'white-eye',white,0,0,0,.20,.28,.065);
   oval(eye,'brown-pupil',hair,.04,-.025,.063,.080,.14,.028);
   oval(eye,'eye-highlight',white,.06,.015,.09,.024,.037,.014);
   const brow=box(head,'determined-brown-eyebrow',hair,side*.26,.37,.56,.35,.065,.065);brow.rotation.z=-side*.15;
  }
 }
 if(tier<3){
  oval(head,'tan-monkey-muzzle',cream,0,-.39,.48,.36,.22,.14);
  oval(head,'brown-nose',hair,0,-.29,.65,.061,.046,.030);
  tube(head,'monkey-smile',hair,[[-.13,-.45,.60],[0,-.50,.63],[.16,-.44,.60]],.018);
 }
 if(!tier)for(const [x,y,z,tilt] of [[-.12,.73,-.09,-.35],[ -.35,.66,-.11,-.75],[.07,.68,-.16,.15]]){const tuft=part(head,'pointed-brown-hair',new THREE.ConeGeometry(.18,.49,5),hair,x,y,z);tuft.rotation.z=tilt;}
 if(tier===1){
  const cap=part(head,'gray-glue-soak-cap',new THREE.SphereGeometry(.76,10,6,0,Math.PI*2,0,Math.PI/2),graphite,0,.50,-.035);cap.scale.set(1,.48,.88);
  oval(head,'gray-cap-brim',steel,0,.50,.28,.77,.045,.51);
  for(const x of [-.33,.33])tube(head,'cap-panel-seam',steel,[[x,.52,.45],[x*.65,.77,.20],[0,.87,-.03],[x*.65,.73,-.43],[x,.51,-.59]],.012);
 }
 let respirator=null;
 if(tier>=2){
  if(tier>=3)oval(head,'gray-respirator-faceplate',graphite,0,-.03,.48,.62,.61,.12);
  for(const side of [-1,1]){
   part(head,tier===2?'bronze-corrosive-goggle':'gray-protective-goggle',new THREE.TorusGeometry(.285,.062,6,12),rimMat,side*.29,.06,.61);
   oval(head,'bright-green-goggle-lens',lensMat,side*.29,.06,.62,.253,.259,.08);
   const shine=box(head,'green-lens-reflection',glue,side*.29-.045,.12,.699,.038,.24,.009);shine.rotation.z=-.6;
  }
  box(head,'goggle-bridge',rimMat,0,.08,.65,.15,.07,.055);
  tube(head,'goggle-head-strap',graphite,[[-.59,.07,.43],[-.76,.06,.03],[-.48,.07,-.49],[0,.07,-.60],[.48,.07,-.49],[.76,.06,.03],[.59,.07,.43]],.054);
  if(tier>=3){
   respirator=new THREE.Group();respirator.name='perforated-gray-respirator';respirator.position.set(0,-.36,.69);head.add(respirator);
   const filter=part(respirator,'round-respirator-filter',new THREE.CylinderGeometry(.22,.25,.14,12),steel);filter.rotation.x=Math.PI/2;
   for(let i=0;i<7;i++){const a=i*Math.PI/3,r=i===6?0:.12;part(respirator,'dark-respirator-vent',new THREE.CircleGeometry(.035,6),graphite,Math.cos(a)*r,Math.sin(a)*r,.073);}
   for(const side of [-1,1])box(head,'respirator-side-latch',steel,side*.24,-.35,.64,.10,.13,.08);
  }
 }
 const tail=tube(pose,'curled-brown-tail',fur,[[0,.88,-.28],[-.44,.83,-.62],[-.74,1.1,-.61],[-.68,1.37,-.56],[-.46,1.33,-.55]],.115);
 const glass=new THREE.MeshStandardMaterial({color:0xdcf4ef,transparent:true,opacity:.22,depthWrite:false,roughness:.18,flatShading:true});
 function capsule(parent,name,x,y,z,r,h){
  const group=new THREE.Group();group.name=name;group.position.set(x,y,z);parent.add(group);capsules.push(group);
  const liquid=part(group,'lime-liquid-core',new THREE.CapsuleGeometry(r*.81,h*.52,3,8),glue,0,-h*.10,0);fluids.push(liquid);liquid.userData.restY=liquid.position.y;
  part(group,'clear-fluid-capsule',new THREE.CapsuleGeometry(r,h*.65,3,8),glass);
  for(const side of [-1,1])part(group,'gray-capsule-cap',new THREE.CylinderGeometry(r*1.03,r*1.03,.10,8),steel,0,side*(h*.325+r*.8),0);
  const glint=box(group,'white-capsule-reflection',white,-r*.45,0,r*.88,r*.16,h*.48,.012);glint.rotation.z=-.13;
  return group;
 }
 let tank;
 if(tier<3){
  tank=part(pose,'yellow-backpack-glue-tank',new THREE.CylinderGeometry(.34,.34,.88,10),glue,-.45,1.22,-.43);
  for(const y of [.86,1.57])part(pose,'green-tank-band',new THREE.CylinderGeometry(.355,.355,.13,10),tier===2?graphite:green,-.45,y,-.43);
  part(pose,'tank-filler-cap',new THREE.CylinderGeometry(.20,.24,.13,8),steel,-.45,1.74,-.43);
 }else{
  tank=new THREE.Group();tank.name=tier===5?'solver-backpack-reactor':'twin-green-solvent-tanks';pose.add(tank);
  box(tank,'gray-backpack-frame',graphite,0,1.30,-.48,.94,.88,.17);
  for(const side of [-1,1]){const cell=capsule(tank,'green-backpack-capsule',side*.48,1.48,-.53,.245,.92);cell.rotation.z=-side*.14;}
  box(tank,'tank-pressure-valve',steel,0,1.98,-.54,.24,.14,.16);
 }
 for(const side of [-1,1])tube(pose,'green-backpack-strap',tier>=1?graphite:green,[[side*.36,.70,.25],[side*.40,1.26,.29],[side*.35,1.52,.05],[side*.35,1.32,-.36]],.07);
 const arms=[];
 // Hands stay attached to the gun during recoil.
 weapon.position.set(.25,1.36,.39);weapon.userData.rest=weapon.position.clone();
 for(const side of [-1,1]){
  const arm=tube(weapon,'brown-gun-arm',fur,[[side*.44,.12,-.35],[side*.48,-.18,-.10],[side*.24,-.17,.30]],.14);arms.push(arm);
  oval(weapon,'gun-gripping-hand',skin,side*.23,-.16,.33,.16,.14,.18);
 }
 if(!tier){
 box(weapon,'yellow-glue-gun-body',glue,0,.03,.35,.45,.32,.92);
 box(weapon,'green-gun-upper-trim',green,0,.22,.31,.47,.08,.91);
 box(weapon,'dark-trigger-grip',dark,.03,-.22,.05,.16,.35,.17);
 box(weapon,'yellow-glue-reservoir',glue,0,.38,.10,.33,.28,.38);
 box(weapon,'tank-window',cream,0,.38,.30,.24,.18,.015);
 const barrel=part(weapon,'green-glue-nozzle',new THREE.CylinderGeometry(.12,.18,.41,8),green,0,.03,.99);barrel.rotation.x=Math.PI/2;
 const rim=part(weapon,'steel-nozzle-rim',new THREE.TorusGeometry(.12,.035,5,10),steel,0,.03,1.20);
 part(weapon,'dark-nozzle-opening',new THREE.CircleGeometry(.095,10),dark,0,.03,1.205);
 }
 let muzzleZ=1.25;
 if(tier){
  const barrelMat=tier===1?green:tier===5?graphite:steel,r=tier>=4?.32:tier===1?.24:.25;
  const chamber=part(weapon,tier===1?'green-glue-soak-gun':tier===2?'gray-corrosive-sprayer':tier===3?'blue-dissolver-atomizer':tier===4?'capsule-fed-liquefier-cannon':'black-bloon-solver-cannon',new THREE.CylinderGeometry(r,r*1.15,1.05,10),barrelMat,0,.02,.49);chamber.rotation.x=Math.PI/2;
  box(weapon,'dark-trigger-grip',graphite,0,-.23,.08,.18,.33,.19);
  const nozzle=part(weapon,'upgraded-gray-nozzle',new THREE.CylinderGeometry(r*.67,r, .43,10),barrelMat,0,.02,1.16);nozzle.rotation.x=Math.PI/2;
  muzzleZ=1.40;
  for(const z of [.04,.95,1.34])part(weapon,'gun-pressure-band',new THREE.TorusGeometry(z===1.34?r*.7:r*1.09,.032,5,10),tier===1?glue:tier===5?green:graphite,0,.02,z);
  part(weapon,'dark-nozzle-opening',new THREE.CircleGeometry(r*.60,10),graphite,0,.02,1.38);
  if(tier===1)box(weapon,'green-gun-upper-trim',glue,0,.31,.49,.20,.08,.68);
  if(tier>=4){
   for(const [i,x] of [-.31,0,.31].entries()){const cell=capsule(weapon,'gun-mounted-solvent-vial',x,.46,.52+(i%2)*.16,.135,.53);cell.rotation.z=-x*.35;}
   box(weapon,'gray-solvent-vial-cradle',graphite,0,.19,.52,.89,.12,.39);
  }
  if(tier===5){
   for(const side of [-1,1]){const ampoule=capsule(weapon,'solver-side-ampoule',side*.41,.05,.16,.13,.43);ampoule.rotation.z=-side*.5;}
   const collar=part(weapon,'solver-heavy-nozzle-collar',new THREE.CylinderGeometry(.32,.36,.22,10),graphite,0,.02,1.39);collar.rotation.x=Math.PI/2;
   part(weapon,'solver-nozzle-lime-ring',new THREE.TorusGeometry(.26,.04,5,10),green,0,.02,1.50);
   part(weapon,'solver-black-nozzle-opening',new THREE.CircleGeometry(.24,10),graphite,0,.02,1.505);muzzleZ=1.53;
  }
 }
 const muzzle=new THREE.Object3D();muzzle.name='glue-projectile-muzzle';muzzle.position.set(0,.03,muzzleZ);weapon.add(muzzle);
 const droplet=oval(weapon,'yellow-muzzle-droplet',glue,0,-.15,muzzleZ-.04,.055,.13,.055);droplet.userData.restScale=droplet.scale.clone();
 tube(pose,'green-tank-feed-hose',tier>=3?glue:tier?green:dark,[[-.43,.87,-.47],[-.70,.61,-.10],[-.65,.87,.43],[-.15,1.25,.52]],tier?.073:.055);
 if(tier){
  for(let i=0;i<3;i++){const spray=oval(muzzle,'shooting-glue-spray',glue,(i-1)*.075,.02,.16+i*.12,.035,.035,.14);spray.visible=false;spray.userData.index=i;spray.userData.rest=spray.position.clone();sprays.push(spray);}
 }
 const steam=tier>=3?tube(muzzle,'green-atomizer-vapor',glue,[[0,.07,.10],[.045,.20,.14],[-.05,.34,.13],[.03,.44,.10]],.026):null;
 Object.assign(root.userData,{body,weapon,glueModelPath:tier?0:-1,glueModelTier:tier,glueRig:{pose,head,eyes,feet,arms,tail,tank,muzzle,droplet,glueMaterial:glue,respirator,fluids,capsules,sprays,steam,topTier:tier}});
 return root;
}
export function glueMuzzleOrigin(t){
 const muzzle=t.mesh.userData.glueRig?.muzzle;
 if(!muzzle)return {x:t.x,y:1.8,z:t.z};
 t.mesh.updateWorldMatrix(true,true);return muzzle.getWorldPosition(new THREE.Vector3());
}
export function animateGlue(t,dt){
 const rig=t.mesh.userData.glueRig;if(!rig)return;
 t.glueIdleTime=(t.glueIdleTime||0)+dt;t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);
 const time=t.glueIdleTime+(t.id||0)*.73,kick=Math.sin(Math.min(1,t.fireAnim/.24)*Math.PI);
 rig.pose.position.y=Math.sin(time*2)*.035;rig.head.rotation.z=Math.sin(time*1.4)*.012;
 const w=t.mesh.userData.weapon;w.position.copy(w.userData.rest);w.position.z-=kick*.14;w.rotation.x=-kick*.06;
 rig.tail.rotation.y=Math.sin(time*1.7)*.07;
 const blink=time%5>4.80&&time%5<4.95;for(const eye of rig.eyes)eye.scale.y=blink?.1:1;
 rig.droplet.scale.y=(rig.droplet.userData.restScale?.y??.13)*(1+Math.sin(time*3)*.12+kick*.8);
 for(const [i,fluid] of (rig.fluids||[]).entries())fluid.position.y=fluid.userData.restY+Math.sin(time*2.3+i)*.016;
 for(const spray of rig.sprays||[]){spray.visible=t.fireAnim>0;const i=spray.userData.index;spray.position.copy(spray.userData.rest);spray.position.z+=kick*(.18+i*.055);spray.scale.z=.14*(.6+kick*1.4);}
 if(rig.respirator)rig.respirator.scale.setScalar(1+Math.sin(time*2.4)*.022+kick*.02);
 if(rig.steam){rig.steam.rotation.z=Math.sin(time*2)*.16;rig.steam.scale.setScalar(.8+Math.sin(time*3)*.1+kick*.4);}
}
