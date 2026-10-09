import * as THREE from './assets/vendor/three.module.js';

// Faceted, fully rigged model based on the supplied brown monkey / yellow gun.
export function makeBaseGlueTowerMesh(){return makeGlueModel(0);}
export function makeGlueTopTowerMesh(tier){return makeGlueModel(Math.max(1,Math.min(5,tier)));}
export function makeGlueMiddleTowerMesh(tier){return makeGlueModel(Math.max(1,Math.min(5,tier)),true);}
export function makeGlueBottomTowerMesh(tier){return makeGlueModel(Math.max(1,Math.min(5,tier)),false,true);}
function makeGlueModel(tier,middle=false,bottom=false){
 const root=new THREE.Group(),body=new THREE.Group(),pose=new THREE.Group(),weapon=new THREE.Group();root.add(body);body.add(pose);pose.add(weapon);
 root.name=tier?'reference-glue-'+(bottom?'bottom-':middle?'middle-':'top-')+tier:'reference-glue-gunner';
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.75,flatShading:true});
 const suitColors=bottom?[0x8e421d,0x8e421d,0xe80087,0xf9eaf1,0xa3c4e9,0x303846]:middle?[0x8e421d,0x8e421d,0xff4a08,0xffdc08,0xffdc08,0xff9708]:[0x8e421d,0x8e421d,0x8119be,0x1475c6,0x163f50,0x79a816];
 const fur=material(suitColors[tier]),hair=material(0x6b2b13),skin=material(tier===5?0x434d4c:0xf4bd65),cream=material(0xffe5a2),green=material(0x3f841c),dark=material(0x293321),steel=material(tier>=2?0x627c84:0x69725c),glue=material(tier>=3?0x79f336:0xf0cf25),white=material(0xfffbdf);
 const graphite=material(0x2d3c40),rimMat=material(tier===2?0x896118:0x8a9699);
 const orange=material(0xff7809),packMat=material(0x303c51),bootMat=material(0x19252e),hoseSteel=material(0x526f7b);
 if(middle){steel.color.setHex(0x627d89);glue.color.setHex(0xffde12);rimMat.color.setHex(tier===2?0x896118:0x29353b);}
 if(bottom){steel.color.setHex(0x657887);glue.color.setHex(tier>=3?0xff6cc7:0xffdf16);rimMat.color.setHex(tier===2?0x896118:0x3c4850);skin.color.setHex(0xf4bd65);}
 const yellow=bottom?material(0xf7d524):glue,pink=bottom?material(0xee58b5):glue,visorMat=bottom?material(tier===3?0x444b5f:0x151f25):graphite;
 const lensMat=new THREE.MeshStandardMaterial({color:0x59e900,emissive:0x2b7900,emissiveIntensity:.16,roughness:.22,flatShading:true});
 const fluids=[],sprays=[],capsules=[];
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(parent,name,mat,x,y,z,w,h,d)=>part(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const tube=(parent,name,mat,points,radius)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,6,false),mat);
 const roundedPanel=(parent,name,mat,x,y,z,w,h,r)=>{
  const s=new THREE.Shape(),a=-w/2,b=-h/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  return part(parent,name,new THREE.ExtrudeGeometry(s,{depth:.035,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.015,curveSegments:5}),mat,x,y,z);
 };
 const feet=[];
 for(const side of [-1,1]){
  oval(pose,'brown-leg',fur,side*.27,.49,.06,.19,.34,.21);
  const foot=oval(body,tier>=3?'planted-protective-boot':'planted-brown-foot',bottom?(tier>=4?bootMat:skin):middle?(tier>=3?bootMat:skin):tier>=4?graphite:tier>=2?skin:fur,side*.29,.18,.22,.24,.15,.38);feet.push(foot);
  for(let i=0;i<3;i++)box(body,'foot-toe',bottom?(tier>=4?steel:skin):middle&&tier>=3?bootMat:tier>=4?steel:skin,side*.29+(i-1)*.10,.16,.51,.065,.08,.10);
  if(bottom&&tier>=4)part(body,tier===5?'yellow-super-glue-boot-cuff':'blue-relentless-boot-cuff',new THREE.CylinderGeometry(.205,.225,.22,8),tier===5?yellow:steel,side*.27,.37,.05);
 }
 oval(pose,'brown-monkey-body',fur,0,1.05,0,.48,.62,.37);
 if(tier<2)oval(pose,'tan-belly',skin,0,.99,.31,.29,.35,.08);
 else{
  box(pose,'hazmat-suit-zipper',graphite,0,1.02,.365,.06,.65,.04);
  const belt=part(pose,'gray-utility-belt',new THREE.TorusGeometry(.45,.065,5,12),graphite,0,.82,0);belt.rotation.x=Math.PI/2;belt.scale.y=.8;
  box(pose,'belt-buckle',steel,0,.83,.39,.14,.14,.06);
 }
 if(bottom&&tier===3){for(const side of [-1,1])box(pose,'black-moab-glue-vest',graphite,side*.22,1.15,.34,.29,.53,.075);}
 if(bottom&&tier===5){oval(pose,'slate-super-glue-body-armor',steel,0,1.06,.02,.49,.48,.38);box(pose,'super-glue-armor-neck',graphite,0,1.54,.10,.33,.23,.37);}
 const head=new THREE.Group();head.position.set(0,2.13,.02);pose.add(head);
 oval(head,bottom?['','brown-stickier-glue-head','magenta-stronger-glue-hood','white-moab-glue-hood','blue-relentless-glue-helmet','dark-super-glue-helmet'][tier]:middle?['','brown-bigger-globs-head','orange-splatter-hood','yellow-hose-hood','yellow-strike-hood','orange-storm-hood'][tier]:tier===2?'purple-corrosive-hood':tier===3?'blue-dissolver-hood':tier===4?'navy-liquefier-hood':tier===5?'green-solver-hood':'brown-monkey-head',fur,0,0,0,.73,.76,.57);
 const eyes=[];
 for(const side of [-1,1]){
  if(!bottom||tier<4){oval(head,'round-monkey-ear',fur,side*.70,-.03,-.03,.24,.30,.15);
  oval(head,'tan-inner-ear',bottom?skin:middle&&tier>=3?orange:tier>=3?steel:skin,side*.73,-.03,.09,.14,.20,.07);}
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
 if(!tier||(middle||bottom)&&tier===1)for(const [x,y,z,tilt] of [[-.12,.73,-.09,-.35],[ -.35,.66,-.11,-.75],[.07,.68,-.16,.15]]){const tuft=part(head,'pointed-brown-hair',new THREE.ConeGeometry(.18,.49,5),hair,x,y,z);tuft.rotation.z=tilt;}
 if(bottom&&tier===1){
  oval(head,'yellow-sticky-head-splat',glue,-.24,.51,.32,.40,.16,.25);
  for(const [x,y,z,sx,sy] of [[-.49,.37,.45,.15,.21],[-.22,.31,.55,.14,.20],[.02,.42,.47,.13,.16]])oval(head,'sticky-splat-drip',glue,x,y,z,sx,sy,.065);
  oval(head,'sticky-splat-highlight',white,-.28,.62,.44,.12,.025,.045);
 }
 if(tier===1&&!middle&&!bottom){
  const cap=part(head,'gray-glue-soak-cap',new THREE.SphereGeometry(.76,10,6,0,Math.PI*2,0,Math.PI/2),graphite,0,.50,-.035);cap.scale.set(1,.48,.88);
  oval(head,'gray-cap-brim',steel,0,.50,.28,.77,.045,.51);
  for(const x of [-.33,.33])tube(head,'cap-panel-seam',steel,[[x,.52,.45],[x*.65,.77,.20],[0,.87,-.03],[x*.65,.73,-.43],[x,.51,-.59]],.012);
 }
 let respirator=null;
 if(tier>=2&&!(bottom&&tier>=3)){
  if(tier>=3&&!middle&&!bottom)oval(head,'gray-respirator-faceplate',graphite,0,-.03,.48,.62,.61,.12);
  for(const side of [-1,1]){
   part(head,bottom?'bronze-stronger-glue-goggle':middle?(tier===2?'bronze-splatter-goggle':'black-hazmat-goggle'):tier===2?'bronze-corrosive-goggle':'gray-protective-goggle',new THREE.TorusGeometry(.285,.062,6,12),rimMat,side*.29,.06,.61);
   oval(head,'bright-green-goggle-lens',lensMat,side*.29,.06,.62,.253,.259,.08);
   const shine=box(head,'green-lens-reflection',glue,side*.29-.045,.12,.699,.038,.24,.009);shine.rotation.z=-.6;
  }
  box(head,'goggle-bridge',rimMat,0,.08,.65,.15,.07,.055);
  tube(head,'goggle-head-strap',graphite,[[-.59,.07,.43],[-.76,.06,.03],[-.48,.07,-.49],[0,.07,-.60],[.48,.07,-.49],[.76,.06,.03],[.59,.07,.43]],.054);
  if(tier>=3&&!middle&&!bottom){
   respirator=new THREE.Group();respirator.name='perforated-gray-respirator';respirator.position.set(0,-.36,.69);head.add(respirator);
   const filter=part(respirator,'round-respirator-filter',new THREE.CylinderGeometry(.22,.25,.14,12),steel);filter.rotation.x=Math.PI/2;
   for(let i=0;i<7;i++){const a=i*Math.PI/3,r=i===6?0:.12;part(respirator,'dark-respirator-vent',new THREE.CircleGeometry(.035,6),graphite,Math.cos(a)*r,Math.sin(a)*r,.073);}
   for(const side of [-1,1])box(head,'respirator-side-latch',steel,side*.24,-.35,.64,.10,.13,.08);
  }
 }
 if(bottom&&tier>=3){
  roundedPanel(head,tier===3?'wide-black-moab-glue-visor':'bolted-armored-visor-frame',tier===3?bootMat:rimMat,0,-.04,.52,1.38,.77,tier===3?.27:.13);
  roundedPanel(head,'dark-bottom-visor-pane',visorMat,0,-.04,.58,1.17,.57,tier===3?.21:.085);
  for(const x of [-.29,.20]){const reflection=box(head,'visor-reflection',steel,x,-.04,.645,.08,.49,.01);reflection.rotation.z=-.55;}
  if(tier>=4){
   for(const x of [-.57,.57])for(const y of [-.32,.23])oval(head,'visor-frame-bolt',steel,x,y,.61,.047,.047,.028);
   tube(head,'armored-helmet-center-seam',tier===5?bootMat:steel,[[0,-.71,.20],[0,-.48,.46],[0,.45,.43],[0,.74,.07],[0,.54,-.43]],.023);
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
 if(bottom&&tier>=3){
  tank=new THREE.Group();tank.name=tier===3?'pink-moab-glue-backpack':tier===4?'pink-spilled-relentless-tank':'white-super-glue-pressure-tank';pose.add(tank);
  part(tank,'bottom-pressure-reservoir',new THREE.CylinderGeometry(.39,.39,1.12,10),tier===3?pink:tier===4?steel:white,-.36,1.45,-.55);
  for(const y of [1.01,1.88])part(tank,'bottom-reservoir-steel-band',new THREE.CylinderGeometry(.405,.405,.16,10),graphite,-.36,y,-.55);
  part(tank,'bottom-tank-filler-cap',new THREE.CylinderGeometry(.20,.22,.17,10),steel,-.36,2.10,-.55);
  if(tier===4){oval(tank,'pink-reservoir-spill',pink,-.45,1.91,-.25,.25,.12,.09);tube(tank,'pink-tank-spill-drip',pink,[[-.55,1.92,-.25],[-.61,1.60,-.25],[-.51,1.45,-.25]],.045);}
  if(tier===5){
   const valve=new THREE.Group();valve.name='red-super-glue-pressure-wheel';valve.position.set(-.36,2.30,-.55);tank.add(valve);const red=material(0xe71d20);
   const wheel=part(valve,'red-valve-rim',new THREE.TorusGeometry(.28,.045,6,12),red);wheel.rotation.x=Math.PI/2;
   for(let i=0;i<3;i++){const spoke=box(valve,'red-valve-spoke',red,0,0,0,.48,.04,.045);spoke.rotation.y=i*Math.PI/3;}
  }
 }else if(middle){
  tank=new THREE.Group();tank.name=tier>=4?'twin-dark-glue-reservoirs':'dark-middle-glue-backpack';pose.add(tank);
  box(tank,'gray-backpack-frame',steel,0,1.30,-.43,.83,.72,.18);
  const centers=tier>=4?[-.34,.34]:[-.40];
  for(const x of centers){
   part(tank,'dark-pressure-tank',new THREE.CylinderGeometry(tier>=4?.30:.36,tier>=4?.30:.36,tier>=4?1.30:1.08,10),packMat,x,tier>=4?1.67:1.38,-.57);
   for(const y of tier>=4?[1.14,2.17]:[.94,1.81])part(tank,'steel-tank-band',new THREE.CylinderGeometry(tier>=4?.315:.375,tier>=4?.315:.375,.13,10),steel,x,y,-.57);
   const capY=tier>=4?2.39:2.04,capMat=tier<=2?orange:steel;
   part(tank,'ridged-reservoir-cap',new THREE.CylinderGeometry(.24,.25,.19,12),capMat,x,capY,-.57);
   for(let i=0;i<12;i++){const a=i*Math.PI/6;const ridge=box(tank,'cap-grip-ridge',tier<=2?fur:graphite,x+Math.cos(a)*.245,capY,-.57+Math.sin(a)*.245,.045,.17,.04);ridge.rotation.y=-a;}
  }
  if(tier>=4)tube(tank,'twin-reservoir-carry-handle',steel,[[-.34,2.39,-.57],[-.34,2.70,-.57],[.34,2.70,-.57],[.34,2.39,-.57]],.06);
 }else if(tier<3){
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
  const handX=bottom&&tier>=4?side*.78:side*.23;
  const arm=tube(weapon,'brown-gun-arm',fur,[[side*.44,.12,-.35],[side*(bottom&&tier>=4?.73:.48),-.18,-.10],[handX,-.17,.30]],.14);arms.push(arm);
  oval(weapon,'gun-gripping-hand',bottom&&tier>=4||middle&&tier>=3?bootMat:skin,handX,-.16,.33,.16,.14,.18);
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
 const muzzles=[];
 if(bottom){
  if(tier>=4)weapon.position.x=0;weapon.userData.rest=weapon.position.clone();
  const centers=tier===3?[-.20,.20]:tier>=4?[-.78,.78]:[0],r=tier>=4?.34:tier===3?.18:.25,length=tier>=3?1.22:1.05;muzzleZ=length+.09;
  for(const [i,x] of centers.entries()){
   const cannon=new THREE.Group();cannon.name=tier>=4?'bottom-twin-cannon':tier===3?'moab-glue-twin-barrel':'bottom-glue-sprayer';cannon.position.set(x,0,0);weapon.add(cannon);
   const barrel=part(cannon,['','green-stickier-glue-cannon','gray-stronger-glue-sprayer','moab-glue-double-barrel','relentless-glue-cannon','super-glue-heavy-cannon'][tier],new THREE.CylinderGeometry(r,r*1.13,length,12),tier===1?green:steel,0,.03,length*.5-.04);barrel.rotation.x=Math.PI/2;
   for(const z of [.06,length-.28])part(cannon,'bottom-cannon-pressure-band',new THREE.TorusGeometry(r*1.06,.042,5,12),tier===3?pink:graphite,0,.03,z);
   part(cannon,'bottom-nozzle-rim',new THREE.TorusGeometry(r,.04,5,12),tier>=4?pink:tier===1?green:steel,0,.03,muzzleZ-.02);
   part(cannon,'bottom-nozzle-opening',new THREE.CircleGeometry(r*.90,12),tier>=4?material(0x9e216b):bootMat,0,.03,muzzleZ-.012);
   for(let n=0;n<5;n++){const a=n*Math.PI*2/5;box(cannon,'bottom-barrel-panel',tier===1?glue:hoseSteel,Math.cos(a)*r*.94,.03+Math.sin(a)*r*.94,length*.53,.029,.029,length*.74);}
   const outlet=new THREE.Object3D();outlet.name='bottom-projectile-muzzle-'+i;outlet.position.set(0,.03,muzzleZ);cannon.add(outlet);muzzles.push(outlet);
   if(tier>=4){oval(cannon,'pink-nozzle-glue-spill',glue,-.10,-.18,muzzleZ,.16,.10,.06);tube(cannon,'hanging-pink-nozzle-glue',glue,[[-.10,-.20,muzzleZ],[-.08,-.42,muzzleZ+.04],[-.13,-.59,muzzleZ+.03]],.047);}
  }
  box(weapon,'bottom-trigger-grip',graphite,0,-.24,.11,.20,.32,.22);
 }else if(middle){
  const radius=tier===1?.26:tier===2?.29:tier===3?.40:tier===4?.43:.48,length=tier>=4?1.40:1.08;
  const chamber=part(weapon,['','green-bigger-globs-cannon','gray-glue-splatter-sprayer','wide-glue-hose-cannon','long-glue-strike-cannon','heavy-glue-storm-cannon'][tier],new THREE.CylinderGeometry(radius,radius*1.12,length,12),tier===1?green:steel,0,.03,length*.5-.07);chamber.rotation.x=Math.PI/2;
  box(weapon,'dark-trigger-grip',graphite,0,-.25,.08,.18,.38,.19);
  const front=length-.03,muzzleRadius=tier<=2?radius*1.32:radius;
  const nozzle=part(weapon,tier<=2?'oversized-orange-nozzle':'broad-steel-hose-nozzle',new THREE.CylinderGeometry(muzzleRadius,muzzleRadius*1.04,.33,12),tier<=2?orange:hoseSteel,0,.03,front);nozzle.rotation.x=Math.PI/2;
  muzzleZ=front+.18;
  part(weapon,'hose-nozzle-lip',new THREE.TorusGeometry(muzzleRadius,.042,6,12),tier<=2?orange:steel,0,.03,muzzleZ-.015);
  part(weapon,'dark-nozzle-opening',new THREE.CircleGeometry(muzzleRadius*.89,12),bootMat,0,.03,muzzleZ-.008);
  for(const z of [.06,front-.20])part(weapon,'middle-cannon-pressure-band',new THREE.TorusGeometry(radius*1.04,.04,5,12),tier===1?graphite:hoseSteel,0,.03,z);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const rail=box(weapon,'long-cannon-panel',tier<=2?glue:hoseSteel,Math.cos(a)*radius*.98,.03+Math.sin(a)*radius*.98,length*.51,.035,.035,length*.76);rail.rotation.z=a;}
 }else if(tier){
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
 const muzzle=muzzles[0]||new THREE.Object3D();if(!muzzles.length){muzzle.name='glue-projectile-muzzle';muzzle.position.set(0,.03,muzzleZ);weapon.add(muzzle);muzzles.push(muzzle);}
 const droplets=[];
 for(const outlet of muzzles){const drop=oval(outlet,'yellow-muzzle-droplet',glue,0,-.18,-.04,.055,.13,.055);drop.userData.restScale=drop.scale.clone();droplets.push(drop);}
 const droplet=droplets[0];
 tube(pose,'green-tank-feed-hose',bottom?(tier>=3?yellow:green):middle?(tier<=2?green:hoseSteel):tier>=3?glue:tier?green:dark,[[-.43,.87,-.47],[-.70,.61,-.10],[-.65,.87,.43],[-.15,1.25,.52]],tier?.073:.055);
 if(bottom&&tier>=4)tube(pose,'yellow-secondary-glue-feed',yellow,[[.21,1.22,-.48],[.66,.88,-.13],[.86,1.03,.25],[.77,1.32,.52]],.08);
 if(tier){
  for(const outlet of muzzles)for(let i=0;i<3;i++){const spray=oval(outlet,'shooting-glue-spray',glue,(i-1)*.075,.02,.16+i*.12,.035,.035,.14);spray.visible=false;spray.userData.index=i;spray.userData.rest=spray.position.clone();sprays.push(spray);}
 }
 const steam=tier>=3&&!middle&&!bottom?tube(muzzle,'green-atomizer-vapor',glue,[[0,.07,.10],[.045,.20,.14],[-.05,.34,.13],[.03,.44,.10]],.026):null;
 const stormHoses=[];
 if(middle&&tier===5){
  // Fixed geometry on pivots: articulated idle/cast motion without rebuilding tubes.
  for(const [i,side,upper] of [[0,-1,true],[1,1,true],[2,-1,false],[3,1,false]]){
   const pivot=new THREE.Group();pivot.name='articulated-storm-hose';pivot.position.set(side*.37,upper?1.96:1.18,-.57);pose.add(pivot);
   const points=upper?[[0,0,0],[side*.61,.20,-.03],[side*.94,.77,.09],[side*1.02,1.15,.39],[side*.84,1.24,.69]]:[[0,0,0],[side*.67,-.24,-.06],[side*1.04,-.26,.27],[side*1.04,-.03,.67],[side*.81,.09,.89]];
   const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
   part(pivot,'segmented-storm-feed-hose',new THREE.TubeGeometry(curve,20,.13,8,false),hoseSteel);
   for(let n=1;n<10;n++){const u=n/10,ring=part(pivot,'storm-hose-segment-ring',new THREE.TorusGeometry(.132,.021,5,8),graphite);ring.position.copy(curve.getPoint(u));ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangent(u));}
   const tip=new THREE.Group();tip.name='storm-auxiliary-nozzle';tip.position.copy(curve.getPoint(1));pivot.add(tip);
   const barrel=part(tip,'storm-hose-steel-nozzle',new THREE.CylinderGeometry(.19,.21,.32,10),steel,0,0,.13);barrel.rotation.x=Math.PI/2;
   part(tip,'storm-hose-dark-opening',new THREE.CircleGeometry(.16,10),bootMat,0,0,.295);
   part(tip,'storm-hose-nozzle-lip',new THREE.TorusGeometry(.18,.032,5,10),hoseSteel,0,0,.30);
   const drip=oval(tip,'storm-hose-glue-drip',glue,0,-.16,.31,.055,.16,.055);
   const jet=oval(tip,'storm-ability-glue-jet',glue,0,-.02,.48,.055,.055,.25);jet.visible=false;
   stormHoses.push({pivot,drip,jet,index:i});
  }
 }
 Object.assign(root.userData,{body,weapon,glueModelPath:tier?(bottom?2:middle?1:0):-1,glueModelTier:tier,glueRig:{pose,head,eyes,feet,arms,tail,tank,muzzle,muzzles,droplet,droplets,glueMaterial:glue,respirator,fluids,capsules,sprays,steam,stormHoses,bottomTier:bottom?tier:0,middleTier:middle?tier:0,topTier:middle||bottom?0:tier}});
 return root;
}
export function glueMuzzleOrigin(t){
 const rig=t.mesh.userData.glueRig,muzzle=rig?.muzzles?.[t.glueMuzzleIndex||0]||rig?.muzzle;
 if(!muzzle)return {x:t.x,y:1.8,z:t.z};
 t.mesh.updateWorldMatrix(true,true);return muzzle.getWorldPosition(new THREE.Vector3());
}
export function animateGlue(t,dt){
 const rig=t.mesh.userData.glueRig;if(!rig)return;
 t.glueIdleTime=(t.glueIdleTime||0)+dt;t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);
 t.glueAbilityAnim=Math.max(0,(t.glueAbilityAnim||0)-dt);
 const time=t.glueIdleTime+(t.id||0)*.73,cast=rig.middleTier>=4?Math.sin(Math.min(1,t.glueAbilityAnim/.65)*Math.PI):0,kick=Math.max(Math.sin(Math.min(1,t.fireAnim/.24)*Math.PI),cast);
 rig.pose.position.y=Math.sin(time*2)*.035;rig.head.rotation.z=Math.sin(time*1.4)*.012;
 const w=t.mesh.userData.weapon;w.position.copy(w.userData.rest);w.position.z-=kick*.14;w.rotation.x=-kick*.06;
 rig.tail.rotation.y=Math.sin(time*1.7)*.07;
 const blink=time%5>4.80&&time%5<4.95;for(const eye of rig.eyes)eye.scale.y=blink?.1:1;
 for(const [i,drop] of (rig.droplets||[rig.droplet]).entries())drop.scale.y=(drop.userData.restScale?.y??.13)*(1+Math.sin(time*3+i)*.12+kick*.8);
 for(const [i,fluid] of (rig.fluids||[]).entries())fluid.position.y=fluid.userData.restY+Math.sin(time*2.3+i)*.016;
 for(const spray of rig.sprays||[]){spray.visible=t.fireAnim>0||cast>0;const i=spray.userData.index;spray.position.copy(spray.userData.rest);spray.position.z+=kick*(.18+i*.055);spray.scale.z=.14*(.6+kick*1.4);}
 for(const hose of rig.stormHoses||[]){const phase=time*1.8+hose.index;hose.pivot.rotation.z=Math.sin(phase)*.035+cast*(hose.index%2?-.10:.10);hose.pivot.rotation.y=Math.sin(phase*.8)*.045;hose.drip.scale.y=.16*(1+Math.sin(phase*1.6)*.15+cast*.8);hose.jet.visible=cast>0;hose.jet.position.z=.48+cast*.28;hose.jet.scale.z=.25*(.7+cast*1.7);}
 if(rig.respirator)rig.respirator.scale.setScalar(1+Math.sin(time*2.4)*.022+kick*.02);
 if(rig.steam){rig.steam.rotation.z=Math.sin(time*2)*.16;rig.steam.scale.setScalar(.8+Math.sin(time*3)*.1+kick*.4);}
}
