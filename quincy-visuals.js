import * as THREE from './assets/vendor/three.module.js';

export function quincyModelLevel(level){return level>=20?20:level>=10?10:level>=7?7:level>=3?3:1;}
export function makeQuincyArrowMesh(explosive=false){
 const group=new THREE.Group(),mat=color=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.65});
 const wood=mat(0x79401c),silver=mat(0xe1e7e7),orange=mat(0xff7709),yellow=mat(0xffd72f),red=mat(0xe33b16);
 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.94,6),wood);shaft.rotation.x=Math.PI/2;group.add(shaft);
 const tip=new THREE.Mesh(new THREE.ConeGeometry(.12,.32,4),silver);tip.rotation.x=Math.PI/2;tip.position.z=.60;group.add(tip);
 for(const angle of [0,Math.PI/2]){const fin=new THREE.Mesh(new THREE.BoxGeometry(.25,.022,.28),explosive?yellow:orange);fin.position.z=-.35;fin.rotation.z=angle;group.add(fin);}
 if(explosive){for(const angle of [0,Math.PI/2])for(const z of [-.42,-.32]){const stripe=new THREE.Mesh(new THREE.BoxGeometry(.252,.026,.038),red);stripe.position.z=z;stripe.rotation.z=angle;group.add(stripe);}const cap=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.14,6),red);cap.rotation.x=Math.PI/2;cap.position.z=.40;group.add(cap);}
 group.name=explosive?'quincy-explosive-arrow':'quincy-orange-fletched-arrow';return group;
}
export function makeQuincyTowerMesh(level=1){
 const milestone=quincyModelLevel(level),root=new THREE.Group(),body=new THREE.Group(),pose=new THREE.Group(),weapon=new THREE.Group();root.add(body);body.add(pose);pose.add(weapon);root.name='reference-quincy-level-'+milestone;
 const material=color=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.7});
 const black=material(0x24282d),dark=material(0x41464c),gray=material(0x727a80),silver=material(0xc4cace),orange=material(0xff7908),brown=material(0x884118),skin=material(0xf4af48),white=material(0xfff7de),pupil=material(0x4e2815),leather=material(0x925a35);
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(parent,name,mat,x,y,z,w,h,d)=>part(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const tube=(parent,name,mat,points,r)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,r,6,false),mat);
 const segment=(parent,name,mat,a,b,width,depth)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from),m=box(parent,name,mat,0,0,0,width,delta.length(),depth);m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;};
 const fin=(parent,name,mat,points,depth=.08)=>{const shape=new THREE.Shape();shape.moveTo(...points[0]);for(const p of points.slice(1))shape.lineTo(...p);shape.closePath();return part(parent,name,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),mat);};
 const feet=[];
 for(const side of [-1,1]){
  oval(pose,'black-archer-leg',black,side*.26,.48,.05,.19,.32,.20);
  const foot=box(body,'planted-quincy-boot',black,side*.28,.17,.20,.39,.28,.57);feet.push(foot);box(body,'boot-silver-toe-plate',dark,side*.28,.23,.47,.34,.14,.07);
  for(const y of [.28,.39])box(body,'boot-armor-ridge',gray,side*.28,y,.36,.34,.05,.09);
 }
 oval(pose,'black-archer-suit',black,0,1.08,0,.47,.62,.36);oval(pose,'gray-chest-armor',dark,0,1.20,.28,.37,.40,.10);
 for(const side of [-1,1]){const strap=box(pose,'gray-archer-harness',gray,side*.26,1.25,.35,.085,.67,.045);strap.rotation.z=side*.18;}
 const belt=part(pose,'black-quincy-belt',new THREE.TorusGeometry(.43,.065,5,12),black,0,.86,0);belt.rotation.x=Math.PI/2;belt.scale.y=.8;
 for(const x of [-.27,0,.27]){box(pose,'brown-belt-pouch',leather,x,.90,.39,.23,.30,.15);box(pose,'pouch-flap',brown,x,1.01,.48,.22,.13,.035);oval(pose,'silver-pouch-button',silver,x,.965,.51,.034,.034,.016);}
 const tail=tube(pose,'curled-quincy-tail',brown,[[0,.83,-.29],[-.44,.78,-.60],[-.65,1.02,-.64],[-.60,1.22,-.60]],.10);oval(pose,'orange-tail-band',orange,-.44,.80,-.59,.12,.08,.12);
 const head=new THREE.Group();head.position.set(0,2.12,0);pose.add(head);
 oval(head,'segmented-gray-quincy-helmet',dark,0,0,0,.79,.80,.64);
 oval(head,'gray-helmet-crown',gray,0,.30,-.035,.73,.54,.60);
 for(const side of [-1,1]){
  tube(head,'helmet-panel-seam',dark,[[side*.59,.17,.38],[side*.52,.51,.25],[side*.30,.75,-.05],[side*.41,.56,-.49]],.027);
  box(head,'orange-helmet-side-band',orange,side*.72,.16,-.02,.085,.16,.62);
  oval(head,'black-helmet-cheek-guard',black,side*.62,-.38,.22,.17,.36,.25);
 }
 const eyes=[];
 if(milestone<20){
  oval(head,'brown-hair-under-helmet',brown,0,.20,.48,.62,.46,.18);
  for(const side of [-1,1]){
   oval(head,'golden-quincy-face-mask',skin,side*.24,-.04,.55,.32,.43,.13);
   const eye=new THREE.Group();eye.position.set(side*.25,-.055,.66);head.add(eye);
   if(side===1){eyes.push(eye);oval(eye,'open-white-quincy-eye',white,0,0,0,.19,.24,.035);oval(eye,'brown-quincy-pupil',pupil,-.035,-.02,.04,.082,.13,.024);oval(eye,'quincy-eye-highlight',white,-.045,.04,.066,.021,.029,.008);}
   else{oval(eye,'aiming-squint-white-eye',white,0,0,0,.19,.22,.035);const squint=box(eye,'aiming-squint-line',pupil,0,0,.044,.31,.031,.02);squint.rotation.z=-.32;}
   const brow=box(head,'brown-quincy-eyebrow',brown,side*.25,.27,.65,.31,.10,.08);brow.rotation.z=-side*.2;
  }
  oval(head,'tan-quincy-smiling-muzzle',skin,0,-.43,.57,.29,.16,.10);oval(head,'quincy-smile',pupil,0,-.46,.66,.17,.07,.02);oval(head,'white-quincy-teeth',white,0,-.44,.686,.13,.035,.01);
 }else{
  oval(head,'black-sealed-quincy-faceplate',black,0,-.03,.53,.65,.62,.11);
  for(const side of [-1,1]){oval(head,'black-visor-rim',black,side*.27,.02,.63,.35,.36,.10);const lens=oval(head,'orange-level-20-visor',orange,side*.27,.02,.69,.31,.30,.07);lens.material=new THREE.MeshStandardMaterial({color:0xff8a0b,emissive:0x762800,emissiveIntensity:.12,roughness:.2,flatShading:true});const shine=box(head,'golden-visor-reflection',skin,side*.26,.035,.766,.10,.48,.009);shine.rotation.z=-.65;}
  box(head,'level-20-visor-bridge',orange,0,.025,.71,.13,.18,.06);
 }
 if(milestone>=10){
  for(const side of [-1,1]){const wing=fin(head,'level-10-helmet-wing',dark,[[0,-.10],[side*.77,.13],[side*.63,-.18],[0,-.36]]);wing.position.set(side*.58,.03,-.22);const stripe=fin(head,'orange-helmet-wing-stripe',orange,[[0,-.13],[side*.65,.07],[side*.55,-.08],[0,-.29]],.086);stripe.position.copy(wing.position);}
  if(milestone===20){const crest=fin(head,'level-20-orange-helmet-crest',gray,[[-.08,.55],[.55,1.16],[.51,.76],[.10,.44]]);crest.position.z=-.32;const tip=fin(head,'orange-crest-tip',orange,[[.24,.92],[.55,1.16],[.48,.88]],.086);tip.position.z=-.32;}
 }
 const quiver=new THREE.Group();quiver.name='black-quincy-quiver';quiver.position.set(.45,1.43,-.41);quiver.rotation.z=-.30;pose.add(quiver);
 box(quiver,'dark-quiver-case',dark,0,0,0,.40,.91,.35);box(quiver,'quiver-silver-strap',gray,0,-.04,.19,.45,.13,.055);
 const arrowCount=milestone>=3?5:3;
 for(let i=0;i<arrowCount;i++){const arrow=makeQuincyArrowMesh(milestone>=7&&i===arrowCount-1);arrow.name=milestone>=7&&i===arrowCount-1?'yellow-striped-explosive-quiver-arrow':'orange-quiver-arrow';arrow.scale.setScalar(.68);arrow.rotation.x=Math.PI/2;arrow.position.set((i%3-1)*.12,.86+(i>=3?.20:0),(i>=3?-.11:.08));quiver.add(arrow);}
 if(milestone>=7)box(quiver,'red-explosive-arrow-cap',orange,.11,.74,-.12,.11,.12,.11);
 weapon.name='quincy-bow-and-arms';weapon.position.set(0,1.48,.25);weapon.userData.rest=weapon.position.clone();
 const bow=new THREE.Group();bow.name='compound-quincy-bow';bow.position.set(-.62,0,.85);weapon.add(bow);
 const bowMat=milestone===20?orange:dark,tipMat=milestone>=10?orange:gray;
 for(const side of [-1,1]){
  segment(bow,'faceted-compound-bow-limb',bowMat,[0,0,0],[-.22,side*.72,0],.21,.18);
  segment(bow,'faceted-compound-bow-tip',tipMat,[-.22,side*.72,0],[.055,side*1.26,0],.20,.18);
  segment(bow,'orange-bow-limb-stripe',orange,[-.08,side*.32,.095],[-.19,side*.72,.095],.052,.013);
  const cam=new THREE.Group();cam.name='compound-bow-cam';cam.position.set(.055,side*1.26,0);bow.add(cam);
  const disk=part(cam,'bow-cam-wheel',new THREE.CylinderGeometry(.17,.17,.10,8),tipMat);disk.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;part(cam,'silver-cam-hole-rim',new THREE.TorusGeometry(.029,.009,4,6),silver,Math.cos(angle)*.08,Math.sin(angle)*.08,.062);}
  for(const y of [side*.37,side*.56])part(bow,'silver-bow-limb-hole',new THREE.TorusGeometry(.047,.013,4,8),milestone===20?skin:silver,-.10,y,.104);
 }
 box(bow,'black-compound-bow-grip',black,0,0,0,.19,.31,.22);
 const stringGeometry=new THREE.BufferGeometry();stringGeometry.setAttribute('position',new THREE.Float32BufferAttribute([.055,1.26,.06,0,0,-.32,.055,-1.26,.06],3));
 const string=new THREE.Line(stringGeometry,new THREE.LineBasicMaterial({color:0xdce3e4}));string.name='animated-quincy-bowstring';bow.add(string);
 tube(weapon,'left-arm-holding-bow',black,[[-.37,.13,-.18],[-.66,-.06,.33],[-.62,0,.78]],.13);oval(weapon,'left-bow-gripping-hand',brown,-.62,0,.85,.13,.14,.15);
 for(const z of [.30,.49])oval(weapon,'gray-left-arm-armor',gray,-.65,-.045,z,.145,.125,.13);box(weapon,'orange-left-wrist-band',orange,-.63,-.01,.63,.25,.18,.075);
 const drawArm=new THREE.Group();drawArm.name='right-arrow-drawing-arm';drawArm.userData.restZ=0;weapon.add(drawArm);
 tube(drawArm,'right-arm-armor-sleeve',black,[[.38,.17,-.18],[.43,-.15,.11],[-.35,-.12,.30],[-.62,0,.24]],.14);
 for(const x of [-.25,-.02,.22])oval(drawArm,'gray-right-arm-armor',gray,x,-.12,.25,.14,.13,.13);
 box(drawArm,'orange-drawing-wrist-band',orange,-.48,-.025,.24,.15,.20,.16);oval(drawArm,'right-arrow-nocking-hand',brown,-.62,0,.24,.14,.15,.14);
 const loadedArrow=makeQuincyArrowMesh();loadedArrow.name='loaded-quincy-bow-arrow';loadedArrow.position.set(-.62,0,.58);weapon.add(loadedArrow);loadedArrow.userData.restZ=.58;
 const muzzle=new THREE.Object3D();muzzle.name='quincy-arrow-launch-point';muzzle.position.set(-.62,0,1.25);weapon.add(muzzle);
 const abilityArrows=[];
 for(let i=0;i<3;i++){const arrow=makeQuincyArrowMesh();arrow.name='cosmetic-storm-cast-arrow';arrow.scale.setScalar(.5);arrow.rotation.x=Math.PI/2;arrow.position.set((i-1)*.38,3.25,-.05);arrow.visible=false;pose.add(arrow);abilityArrows.push(arrow);}
 Object.assign(root.userData,{body,weapon,quincyModelLevel:milestone,quincyRig:{pose,head,feet,eyes,tail,quiver,bow,string,drawArm,loadedArrow,muzzle,orange,abilityArrows}});return root;
}
export function quincyMuzzleOrigin(t){const muzzle=t.mesh.userData.quincyRig?.muzzle;if(!muzzle)return{x:t.x,y:2.15,z:t.z};t.mesh.updateWorldMatrix(true,true);return muzzle.getWorldPosition(new THREE.Vector3());}
export function animateQuincy(t,dt){
 const rig=t.mesh.userData.quincyRig;if(!rig)return;t.quincyIdleTime=(t.quincyIdleTime||0)+dt;t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);t.quincyAbilityAnim=Math.max(0,(t.quincyAbilityAnim||0)-dt);
 const time=t.quincyIdleTime+(t.id||0)*.61,draw=Math.min(1,t.fireAnim/.24),rapid=t.rapidTimer>0,cast=t.quincyAbilityAnim/.65;
 rig.pose.position.y=Math.sin(time*2)*.028;rig.head.rotation.z=Math.sin(time*1.3)*.012;rig.tail.rotation.y=Math.sin(time*1.7)*.08;rig.quiver.rotation.x=Math.sin(time*1.5)*.018;
 const weapon=t.mesh.userData.weapon;weapon.position.copy(weapon.userData.rest);weapon.position.z-=draw*.055;weapon.rotation.x=-draw*.025-cast*.10;
 rig.drawArm.position.z=-draw*.30;rig.loadedArrow.position.z=rig.loadedArrow.userData.restZ-draw*.30;rig.loadedArrow.visible=t.fireAnim<=.16;
 rig.string.geometry.attributes.position.setXYZ(1,0,0,-.61-draw*.30);rig.string.geometry.attributes.position.needsUpdate=true;
 for(const child of rig.bow.children)if(child.name==='compound-bow-cam')child.rotation.z=draw*.18;
 const blink=time%5>4.8&&time%5<4.95;for(const eye of rig.eyes)eye.scale.y=blink?.12:1;
 rig.orange.emissive.setHex(rapid?0xff6500:cast>0?0xc14700:0);rig.orange.emissiveIntensity=rapid?.12+Math.sin(time*24)*.06:cast*.20;
 for(const [i,arrow] of rig.abilityArrows.entries()){arrow.visible=t.stormTimer>0;arrow.position.y=3.25-((time*2+i*.33)%1)*.42;arrow.rotation.z=Math.sin(time*3+i)*.08;}
}
