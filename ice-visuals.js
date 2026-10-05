import * as THREE from './assets/vendor/three.module.js';

// Original faceted meshes follow the supplied white-fur/cyan base reference.
export function makeBaseIceTowerMesh(){return makeIceModel(0);}
export function makeIceTopTowerMesh(tier){return makeIceModel(Math.max(1,Math.min(5,tier)));}
export function makeIceBottomTowerMesh(tier){
 tier=Math.max(1,Math.min(5,tier));
 const root=makeIceModel(0),rig=root.userData.iceRig,{body,weapon}=root.userData,{head}=rig;
 const pose=rig.body,materials=[];
 const material=color=>{const mat=new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.55});materials.push(mat);return mat;};
 const gray=material(0x51616d),dark=material(0x18354f),blue=material(0x1288ca),cyan=material(0x29dce9),pale=material(0xc5faff),navy=material(0x13569e);
 const glow=new THREE.MeshStandardMaterial({color:0xe2ffff,emissive:0x31e2ed,emissiveIntensity:.8,flatShading:true});materials.push(glow);
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const tube=(parent,name,mat,points,radius)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,radius,6,false),mat);
 const plate=(parent,name,mat,points,x,y,z,depth=.06)=>{const shape=new THREE.Shape();points.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();return part(parent,name,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),mat,x,y,z);};
 rig.bottomTier=tier;rig.handsMat.color.setHex(tier>=4?0x29cede:0x51616d);
 for(const arm of rig.arms){const side=arm.position.x<0?-1:1;arm.userData.restZ=-side*.22;arm.userData.restX=0;arm.rotation.z=arm.userData.restZ;}
 const mouth=root.getObjectByName('gentle-ice-smile');mouth.geometry.dispose();mouth.geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.1,-.54,.68),new THREE.Vector3(0,-.51,.70),new THREE.Vector3(.10,-.54,.68)]),8,.014,5,false);mouth.name='determined-ice-mouth';
 if(tier===2||tier===3){
  for(const eye of rig.eyes)eye.visible=false;
  const visor=new THREE.Group();visor.name='dark-cryo-sunglasses';head.add(visor);
  for(const side of [-1,1]){
   const points=[[-.29,.24],[.27,.20],[.25,-.26],[0,-.32],[-.25,-.20]];
   plate(visor,'blue-visor-lens',dark,points,side*.31,-.08,.65,.075);
   const shine=part(visor,'diagonal-visor-reflection',new THREE.BoxGeometry(.085,.50,.009),blue,side*.31,-.08,.731);shine.rotation.z=-.38;
  }
  part(visor,'visor-bridge',new THREE.BoxGeometry(.17,.09,.08),dark,0,.12,.71);
 }
 if(tier>=3){
  for(const arm of rig.arms){const side=arm.position.x<0?-1:1;arm.rotation.y=-side*1.25;arm.userData.restZ=-side*.16;}
  const belt=part(pose,'gray-cryo-utility-belt',new THREE.TorusGeometry(.43,.06,5,12),gray,0,.86,0);belt.rotation.x=Math.PI/2;belt.scale.y=.8;
  if(tier===3){
   tube(head,'gray-cryo-headphones',gray,[[-.86,-.02,0],[-.8,.48,0],[-.35,.78,0],[0,.82,0],[.35,.78,0],[.8,.48,0],[.86,-.02,0]],.095);
   for(const side of [-1,1])oval(head,'gray-cryo-earcup',gray,side*.85,-.11,0,.16,.33,.29);
  }else{
   oval(head,'blue-ice-helmet',blue,0,.02,-.04,.87,.79,.68);
   for(const object of [...head.children])if(object.name==='white-ear'||object.name==='blue-inner-ear'){object.geometry.dispose();object.removeFromParent();}
   head.children.filter(m=>m.name==='white-cheek-tuft').forEach(m=>m.material=cyan);
   oval(pose,'faceted-blue-chest-armor',blue,0,1.02,-.02,.53,.54,.42);
   for(const side of [-1,1]){
    const chest=part(pose,'cyan-chest-armor-panel',new THREE.OctahedronGeometry(.25,0),cyan,side*.28,1.06,.34);chest.scale.set(.95,1.35,.5);
    oval(pose,'blue-ice-leg-armor',blue,side*.30,.47,.07,.20,.29,.21);
   }

   for(let i=0;i<10;i++){
    const a=i*Math.PI/5,x=Math.sin(a)*.73,y=Math.cos(a)*.73;
    const panel=part(head,'faceted-ice-armor-panel',new THREE.OctahedronGeometry(.23,0),i%2?blue:cyan,x,y,.30);panel.scale.set(1,1.15,.62);panel.rotation.z=-a;
    plate(head,'white-ice-panel-edge',pale,[[-.12,.05],[0,.20],[.14,.07],[0,.13]],x,y,.453,.018);
   }
   root.getObjectByName('icy-fur-crown').traverse(m=>{if(m.isMesh)m.material=cyan;});
   for(const arm of rig.arms){const side=arm.position.x<0?-1:1;tube(arm,'crystal-arm-armor',blue,[[0,0,0],[side*.27,-.1,.035],[side*.60,-.1,.09]],.19);for(let i=0;i<3;i++)part(arm,'cyan-forearm-plate',new THREE.OctahedronGeometry(.17,0),cyan,side*(.2+i*.17),-.02,.19);}
   for(const foot of rig.feet)oval(body,'crystal-ice-boot',blue,foot.position.x,.17,.22,.28,.16,.37);
   for(const side of [-1,1]){head.children.filter(m=>m.name==='cyan-eyebrow'&&Math.sign(m.position.x)===side).forEach(m=>m.rotation.z=-side*.32);}
  }
  const cannon=new THREE.Group();cannon.name=tier===5?'icicle-impale-cannon':tier===4?'armored-icicles-cannon':'cryo-snowball-cannon';cannon.position.set(.10,1.23,.54);weapon.add(cannon);rig.cannon=cannon;rig.cannonRestZ=.54;rig.cannonGlow=glow;
  cannon.scale.setScalar(tier===5?1.12:tier===4?1.06:1);
  const barrel=part(cannon,'faceted-cyan-cannon-barrel',new THREE.CylinderGeometry(.37,.42,1.03,8),blue);barrel.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,ice=part(cannon,'cyan-cannon-armor',new THREE.OctahedronGeometry(.25,0),cyan,Math.sin(a)*.36,Math.cos(a)*.36,.1);ice.scale.set(.72,.74,1.55);
   const seam=part(cannon,'white-cannon-ice-seam',new THREE.BoxGeometry(.025,.018,.68),pale,Math.sin(a)*.40,Math.cos(a)*.40,.05);seam.rotation.z=-a;
  }
  const muzzle=part(cannon,'glowing-cryo-muzzle',new THREE.TorusGeometry(.33,.072,6,16),cyan,0,0,.57);
  const bore=part(cannon,'dark-cryo-bore',new THREE.CircleGeometry(.32,16),dark,0,0,.566);
  const inner=part(cannon,'icy-muzzle-light',new THREE.TorusGeometry(.285,.023,5,16),glow,0,0,.579);
  for(const side of [-1,1])oval(cannon,'cannon-gripping-glove',tier>=4?cyan:gray,side*.39,-.19,-.02,.19,.18,.23);
  rig.muzzle=new THREE.Object3D();rig.muzzle.position.set(0,0,.68);cannon.add(rig.muzzle);
  if(tier===5){
   rig.loadedIcicle=part(cannon,'loaded-white-impale-spike',new THREE.ConeGeometry(.24,.67,5),glow,0,0,.76);rig.loadedIcicle.rotation.x=Math.PI/2;
   const cape=new THREE.Group();cape.name='navy-icicle-mantle';cape.position.set(0,1.48,-.38);pose.add(cape);rig.iceCape=cape;
   for(const side of [-1,1])plate(cape,'angular-blue-ice-mantle',navy,[[0,.24],[side*.54,.45],[side*.75,-.51],[side*.40,-.42],[side*.60,-.78],[side*.18,-.56]],side*.11,0,-.12,.12);
   for(const [x,y] of [[-.34,.90],[0,1.07],[.36,.90]]){const spike=part(head,'impale-helmet-crystal',new THREE.ConeGeometry(.19,.51,4),cyan,x,y,-.04);spike.rotation.z=-x*.3;}
  }
 }
 const used=new Set();root.traverse(m=>{if(m.material)used.add(m.material);});for(const mat of materials)if(!used.has(mat))mat.dispose();
 root.userData.iceModelPath=2;root.userData.iceModelTier=tier;root.userData.iceBaseModel=false;
 return root;
}

export function iceMuzzleOrigin(t){
 const muzzle=t.mesh.userData.iceRig?.muzzle;if(!muzzle)return {x:t.x,y:1.8,z:t.z};
 t.mesh.updateWorldMatrix(true,true);return muzzle.getWorldPosition(new THREE.Vector3());
}
export function makeIceMiddleTowerMesh(tier){
 tier=Math.max(1,Math.min(5,tier));
 const root=makeIceModel(0),rig=root.userData.iceRig,{body,head}=rig,frame=root.userData.body;
 const createdMaterials=[],removedMaterials=new Set();
 const material=color=>{const mat=new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.72});createdMaterials.push(mat);return mat;};
 const white=material(0xf6fcff),cream=material(tier===4?0xe7e7dc:0xf6fcff),red=material(0xe91e39),orange=material(0xf28d24),slate=material(0x475463),brown=material(0x73695d),cyan=material(0x11cce9),blue=material(0x178dde),navy=material(0x103ed1);
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const tube=(parent,name,mat,points,radius)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,radius,6,false),mat);
 const plate=(parent,name,mat,points,x,y,z,depth=.06)=>{const shape=new THREE.Shape();points.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();return part(parent,name,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),mat,x,y,z);};
 const remove=name=>{const object=root.getObjectByName(name);if(!object)return;object.traverse(m=>{m.geometry?.dispose();if(m.material)removedMaterials.add(m.material);});object.removeFromParent();};
 rig.scarves=[];rig.middleTier=tier;
 for(const arm of rig.arms){arm.userData.restZ=(arm.position.x<0?-1:1)*-.22;arm.rotation.z=arm.userData.restZ;}
 if(tier<=2){
  tube(head,'dark-earmuff-headband',slate,[[-.86,-.02,0],[-.81,.47,-.01],[-.40,.77,-.02],[0,.84,-.03],[.40,.77,-.02],[.81,.47,-.01],[.86,-.02,0]],.09);
  for(const side of [-1,1])oval(head,'red-earmuff',red,side*.86,-.08,.04,.17,.37,.33);
 }
 if(tier>=2)remove('icy-fur-crown');
 if(tier===2){
  oval(head,'red-knit-beanie',red,0,.51,-.035,.83,.62,.67);
  const brim=part(head,'folded-red-hat-brim',new THREE.TorusGeometry(.71,.14,5,16),material(0xc43318),0,.34,.035);brim.rotation.x=Math.PI/2;brim.scale.y=.84;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const seam=part(head,'knit-brim-seam',new THREE.BoxGeometry(.02,.22,.025),material(0x9e2016),Math.sin(a)*.81,.34,Math.cos(a)*.64);seam.rotation.y=a;}
  oval(head,'white-hat-pompom',white,0,1.10,-.02,.19,.20,.19);
 }
 if(tier>=3){
  // Puffy coats and a faceted fur hood retain the same head/arm animation pivots.
  const coat=tier===3?orange:tier===4?cream:blue;
  oval(body,tier===3?'orange-arctic-parka':tier===4?'white-snowstorm-parka':'blue-absolute-zero-parka',coat,0,1.01,.015,.55,.66,.45);
  const hood=part(head,'outer-parka-hood',new THREE.TorusGeometry(.78,.20,6,14),tier===5?white:coat,0,0,-.10);hood.scale.y=1.04;
  for(let i=0;i<14;i++){
   const a=i*Math.PI*2/14,x=Math.sin(a)*.78,y=Math.cos(a)*.80;
   const tuft=part(head,'fur-hood-tuft',new THREE.ConeGeometry(.18,.32,5),cream,x,y,.20);tuft.rotation.z=-a;tuft.scale.z=.65;
   const puff=oval(head,'puffy-hood-fur',cream,x,y,.15,.22,.24,.18);puff.rotation.z=-a;
   if(tier===4){const tip=part(head,'brown-hood-fur-tip',new THREE.ConeGeometry(.065,.14,4),brown,x+Math.sin(a)*.19,y+Math.cos(a)*.19,.24);tip.rotation.z=-a;}
  }
  for(const arm of rig.arms){
   const side=arm.position.x<0?-1:1;
   tube(arm,'padded-parka-sleeve',coat,[[0,0,0],[side*.27,-.10,.035],[side*.61,-.095,.09]],.19);
   const cuff=part(arm,'fur-sleeve-cuff',new THREE.CylinderGeometry(.21,.21,.15,7),cream,side*.62,-.10,.09);cuff.rotation.z=Math.PI/2;
  }
  const zipper=part(body,'parka-front-zipper',new THREE.BoxGeometry(.025,.77,.025),tier===3?slate:cyan,0,1.05,.466);
  part(body,'parka-waist-band',new THREE.BoxGeometry(.83,.055,.06),tier===3?material(0xb75d17):white,0,.61,.39);
  const scarf=new THREE.Group();scarf.name=tier===3?'red-arctic-scarf':'blue-snow-scarf';scarf.position.set(0,1.58,-.29);body.add(scarf);rig.scarves.push(scarf);
  const scarfMat=tier===3?red:blue;
  plate(scarf,'scarf-long-tail',scarfMat,[[0,0],[.32,-.15],[.85,-.10],[.65,.13],[.92,.39],[.46,.24],[.04,.16]],.15,0,-.06,.09);
  plate(scarf,'scarf-short-tail',scarfMat,[[0,0],[-.36,-.12],[-.85,.01],[-.59,.18],[-.73,.35],[-.30,.17]],-.1,-.10,-.10,.09);
  if(tier>=4){
   rig.hover=true;rig.hoverBase=tier===4?.46:.34;
   for(const child of [...frame.children])if(child.name==='blue-foot'||child.name==='blue-toe')body.add(child);
   for(const eye of rig.eyes){
    for(const child of [...eye.children])if(child.name!=='white-eye'){child.geometry?.dispose();eye.remove(child);}
    if(tier===4)tube(eye,'closed-snowstorm-eye',cyan,[[-.11,-.025,.054],[0,.005,.063],[.11,-.025,.054]],.024);
   }
   if(tier===4){
    root.getObjectByName('cyan-eye-mask').material.color.setHex(0x25414b);rig.handsMat.color.setHex(0x73695d);root.getObjectByName('blue-foot').material.color.setHex(0x73695d);
    const mount=part(frame,'snowstorm-ice-mountain',new THREE.ConeGeometry(.91,.52,6),material(0x256074),0,.18,0);mount.scale.z=.7;
    const snow=part(frame,'snow-capped-mountain',new THREE.ConeGeometry(.61,.32,6),white,0,.39,0);snow.scale.z=.7;
   }else{
    for(const name of ['cyan-eye-mask','blue-mask-bridge','cyan-eyebrow','cyan-nose','white-muzzle','gentle-ice-smile'])while(root.getObjectByName(name))remove(name);
    for(const eye of rig.eyes){eye.position.z=.73;eye.scale.set(1,.73,1);const rim=part(eye,'cyan-zero-eye-rim',new THREE.TorusGeometry(.235,.038,5,14),cyan,0,0,.0);rim.scale.y=1.0;}
    plate(head,'faceted-absolute-zero-mask',blue,[[-.43,-.57],[-.64,-.37],[-.64,.34],[-.43,.58],[.40,.58],[.64,.35],[.64,-.35],[.43,-.57]],0,-.04,.39,.25);
    for(const x of [-.40,0,.40]){part(head,'zero-mask-cyan-stripe',new THREE.BoxGeometry(.025,1.08,.02),cyan,x,-.03,.653);part(head,'zero-mask-navy-stripe',new THREE.BoxGeometry(.035,1.10,.02),navy,x+.065,-.03,.655);}
    rig.handsMat.color.setHex(0xe7faff);rig.handsMat.emissive.setHex(0x18a8df);
    for(const foot of rig.feet){oval(body,'white-zero-boot-pad',white,foot.position.x,.17,.41,.22,.11,.23);part(body,'zero-boot-icicle',new THREE.ConeGeometry(.065,.25,4),cyan,foot.position.x,.02,.46).rotation.z=Math.PI;}
    for(const arm of rig.arms){const side=arm.position.x<0?-1:1;for(let i=0;i<2;i++)part(arm,'hanging-zero-icicle',new THREE.ConeGeometry(.07,.30,4),cyan,side*(.55+i*.18),-.32,.14).rotation.z=Math.PI;}
    for(const side of [-1,1])plate(body,'white-zero-parka-hem',white,[[0,0],[side*.35,-.16],[side*.25,.05],[side*.12,.15]],side*.07,.63,.43,.055);
    zipper.visible=false;
   }
  }
 }
 const usedMaterials=new Set();root.traverse(m=>{if(m.material)usedMaterials.add(m.material);});for(const mat of [...createdMaterials,...removedMaterials])if(!usedMaterials.has(mat))mat.dispose();
 root.userData.iceBaseModel=false;root.userData.iceModelPath=1;root.userData.iceModelTier=tier;
 return root;
}
function makeIceModel(tier){
 const root=new THREE.Group(),frame=new THREE.Group(),body=new THREE.Group(),head=new THREE.Group(),weapon=new THREE.Group();
 root.name='Ice Monkey';body.name='ice-body';head.name='ice-head';head.position.y=1.89;root.add(frame);frame.add(body);body.add(head,weapon);
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.68,metalness:.02,flatShading:true});
 const fur=material(0xf2fcff),white=material(0xffffff),cyan=material(0x08c5e4),blue=material(tier===5?0x64298d:tier===4?0xe52b4b:0x078fc7),dark=material(0x137daa);
 const accent=material(tier===5?0x71399e:tier===4?0xf02c48:0x08c5e4);
 const handsMat=material(0x0ab4de);handsMat.emissive.setHex(0x008eac);handsMat.emissiveIntensity=.05;
 const sparkleMat=new THREE.MeshBasicMaterial({color:0xb8f7ff});
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const mesh=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);mesh.scale.set(sx,sy,sz);return mesh;};
 const tube=(parent,name,mat,points,radius)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,radius,6,false),mat);
 const plate=(parent,name,mat,points,x,y,z,depth=.10)=>{const shape=new THREE.Shape();points.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();return part(parent,name,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),mat,x,y,z);};
 oval(body,'white-fur-torso',fur,0,1.02,0,tier===5?.59:.50,.64,.40);
 oval(body,'cyan-belly-patch',accent,0,1.00,.379,.205,.37,.055);
 const feet=[];
 for(const side of [-1,1]){
  oval(body,'white-fur-leg',fur,side*.30,.46,.04,.18,.36,.19);
  const foot=oval(frame,'blue-foot',accent,side*.33,.14,.22,.26,.14,.38);feet.push(foot);
  for(let i=0;i<3;i++)oval(frame,'blue-toe',accent,side*.33+(i-1)*.11,.115,.50,.069,.071,.13);
  for(let i=0;i<2;i++){const tuft=part(body,'ankle-fur-tuft',new THREE.ConeGeometry(.12,.28,5),white,side*(.29+i*.09),.40,.10);tuft.rotation.z=side*(2.7+i*.25);}
 }
 oval(head,'white-fur-head',fur,0,0,0,.78,.75,.61);
 const eyes=[];
 for(const side of [-1,1]){
  oval(head,'white-ear',white,side*.77,-.16,.02,.21,.25,.14);
  oval(head,'blue-inner-ear',cyan,side*.80,-.16,.136,.10,.15,.03);
  oval(head,'cyan-eye-mask',blue,side*.30,-.08,.52,.345,.47,.12);
  const eye=new THREE.Group();eye.name='ice-eye';eye.position.set(side*.31,-.06,.642);head.add(eye);eyes.push(eye);
  oval(eye,'white-eye',white,0,0,0,.225,.32,.045);
  if(tier<5)oval(eye,'cyan-pupil',cyan,.055,.045,.051,.066,.116,.025);
  oval(eye,'eye-highlight',white,.072,.079,.075,.022,.03,.009);
  const brow=part(head,'cyan-eyebrow',new THREE.BoxGeometry(.26,.12,.10),cyan,side*.31,.45,.52);brow.rotation.z=-side*(tier>=3?.35:.13);
  for(let i=0;i<2;i++){const tuft=part(head,'white-cheek-tuft',new THREE.ConeGeometry(.13,.34,5),white,side*(.54+i*.11),-.50+i*.09,.23);tuft.rotation.z=side*(2.0+i*.13);}
 }
 oval(head,'blue-mask-bridge',blue,0,-.37,.59,.19,.20,.10);
 oval(head,'white-muzzle',white,0,-.55,.46,.28,.11,.12);
 const mouth=tube(head,'gentle-ice-smile',dark,[[-.07,-.51,.687],[0,-.54,.698],[.07,-.51,.687]],.014);mouth.castShadow=false;mouth.visible=tier<3;
 const nose=part(head,'cyan-nose',new THREE.ConeGeometry(.049,.063,3),cyan,0,-.39,.698);nose.rotation.x=Math.PI;
 const crown=new THREE.Group();crown.name='icy-fur-crown';crown.position.set(0,.53,-.045);head.add(crown);
 const silhouette=[[-.40,0],[-.28,.22],[-.20,.13],[-.15,.43],[-.05,.31],[.04,.92],[.20,.65],[.25,.39],[.33,.19],[.40,0]];
 plate(crown,'cyan-tuft-outline',cyan,silhouette,0,0,-.10,.18);
 const tuft=plate(crown,'white-tall-tuft',white,silhouette,0,.027,.025,.13);tuft.scale.set(.81,.84,1);
 for(const side of [-1,1]){const spike=part(crown,'side-fur-spike',new THREE.ConeGeometry(.15,.36,5),white,side*.30,.10,.045);spike.rotation.z=-side*.35;}
 const arms=[],sparks=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.name=side===1?'ice-right-arm':'ice-left-arm';arm.position.set(side*.42,1.30,.015);body.add(arm);arms.push(arm);arm.userData.restZ=side*(tier>=3?.14:tier>=1?-.22:0);arm.userData.restX=tier>=3?-.28:0;arm.rotation.set(arm.userData.restX,0,arm.userData.restZ);
  tube(arm,'outstretched-white-arm',fur,[[0,0,0],[side*.27,-.10,.035],[side*.61,-.095,.09]],.145);
  for(let i=0;i<3;i++){const tuft=part(arm,'arm-fur-tuft',new THREE.ConeGeometry(.11,.27,5),white,side*(.16+i*.13),-.08,.12);tuft.rotation.z=side*(1.55+i*.12);}
  const hand=new THREE.Group();hand.name='blue-fist';hand.position.set(side*.79,-.085,.11);arm.add(hand);hand.scale.setScalar(tier>=5?1.9:tier>=4?1.8:tier>=3?1.55:1);
  oval(hand,'icy-palm',handsMat,0,0,0,.245,.22,.22);
  for(let i=0;i<3;i++){
   oval(hand,'blue-knuckle',handsMat,(i-1)*.105,.09,.18,.065,.079,.072);
   const crease=part(hand,'finger-crease',new THREE.BoxGeometry(.073,.012,.008),dark,(i-1)*.10,.031,.227);crease.castShadow=false;
  }
  oval(hand,'blue-thumb',handsMat,-side*.14,-.12,.13,.092,.11,.10);
  for(let i=0;i<3;i++){const spark=part(hand,'freeze-spark',new THREE.OctahedronGeometry(.065,0),sparkleMat,side*(.22+i*.08),.17+i*.09,.11);spark.visible=false;spark.userData.phase=i+side;spark.castShadow=false;sparks.push(spark);}
 }
 const tail=new THREE.Group();tail.name='ice-tail-pivot';tail.position.set(0,.66,-.32);body.add(tail);
 const curl=[[0,0,0],[-.38,-.13,.01],[-.78,-.34,.04],[-1.03,-.24,.11],[-1.02,.06,.15],[-.81,.19,.18],[-.66,.035,.19]];
 tube(tail,'curled-white-tail',fur,curl,.11);tube(tail,'cyan-tail-stripe',cyan,curl.map(([x,y,z])=>[x,y,z+.088]),.026);
 const steel=material(0x758995),silver=material(0xc9e1eb),frost=material(0x63d9f4),deepIce=material(0x238fbe);
 frost.emissive.setHex(0x148ab0);frost.emissiveIntensity=.04;
 const crystals=[];
 const crystal=(parent,name,x,y,z,radius,height,lean=0)=>{
  const mesh=part(parent,name,new THREE.ConeGeometry(radius,height,4),frost,x,y,z);mesh.rotation.z=lean;mesh.userData.baseY=y;mesh.userData.baseZ=lean;crystals.push(mesh);return mesh;
 };
 const snowflake=(parent,radius,z)=>{
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3,spoke=part(parent,'snowflake-spoke',new THREE.BoxGeometry(.034,radius*1.8,.028),frost,0,0,z);spoke.rotation.z=angle;
   for(const side of [-1,1]){const branch=part(parent,'snowflake-branch',new THREE.BoxGeometry(.028,radius*.42,.028),frost,Math.sin(angle)*radius*.60,Math.cos(angle)*radius*.60,z+.004);branch.rotation.z=-angle+side*.65;}
  }
 };
 if(tier===1){const emblem=new THREE.Group();emblem.name='permafrost-snowflake';emblem.position.set(.19,.48,.53);emblem.rotation.z=.2;head.add(emblem);snowflake(emblem,.18,.04);}
 if(tier>=2){
  const band=part(head,'slate-headband',new THREE.TorusGeometry(.69,.105,5,16),steel,0,.34,.015);band.rotation.x=Math.PI/2;band.scale.set(1, .86,1);
  if(tier===2){const crest=new THREE.Group();crest.name='cold-snap-medallion';crest.position.set(0,.37,.63);head.add(crest);const coin=part(crest,'silver-snowflake-medallion',new THREE.CylinderGeometry(.245,.245,.08,8),silver);coin.rotation.x=Math.PI/2;snowflake(crest,.20,.049);}
  else{
   if(tier===4){
    plate(head,'silver-lightning-crest',silver,[[-.06,.47],[.21,.56],[.08,.25],[.29,.32],[-.14,-.13],[-.05,.18],[-.23,.12]],0,.28,.65,.09);
    for(const side of [-1,1])plate(head,'cyan-lightning-wing',cyan,[[0,0],[side*.33,.12],[side*.55,.36],[side*.18,.24]],side*.11,.34,.60,.07);
   }else{
    const diamond=[[-.25,0],[0,.41],[.25,0],[0,-.31]];
    plate(head,'silver-diamond-crown',silver,diamond,0,.46,.64,.1);
    const inner=plate(head,'cyan-diamond-core',frost,diamond,0,.46,.751,.055);inner.scale.set(.62,.70,1);
    if(tier===5)for(const side of [-1,1])plate(head,'flared-ice-crown-wing',frost,[[0,0],[side*.27,.10],[side*.57,.49],[side*.24,.33],[side*.35,.61],[side*.12,.40]],side*.15,.39,.54,.08);
   }
  }
 }
 if(tier>=3){
  oval(head,'open-grinning-mouth',dark,0,-.51,.632,.23,.095,.06);
  for(const side of [-1,1]){const tooth=part(head,'white-ice-fang',new THREE.ConeGeometry(.047,tier===5?.14:.10,3),white,side*.13,-.495,.693);tooth.rotation.z=Math.PI;}
  for(const side of [-1,1])for(let i=0;i<4;i++){const tuft=part(body,'shaggy-shoulder-mane',new THREE.ConeGeometry(.15,.36,5),white,side*(.22+i*.11),1.40-i*.06,.25);tuft.rotation.z=side*(1.6+i*.16);}
  part(frame,'faceted-ice-platform',new THREE.CylinderGeometry(1.11,1.25,.17,7),deepIce,0,.02,0);
  part(frame,'frosted-platform-top',new THREE.CylinderGeometry(1.08,1.11,.045,7),frost,0,.118,0);
  for(let i=0;i<7;i++){const angle=i*Math.PI*2/7;crystal(frame,'platform-ice-shard',Math.cos(angle)*1.0,.22,Math.sin(angle)*.83,.19,.47,-Math.cos(angle)*.42);}
 }
 if(tier===3)for(const side of [-1,1])crystal(frame,'ice-shards-back-crystal',side*.82,.78,-.40,.23,1.10,-side*.22);
 if(tier===4)for(let i=0;i<6;i++){const angle=i*Math.PI/3;const shard=crystal(frame,'floating-embrittlement-shard',Math.cos(angle)*1.48,1.25+Math.sin(angle)*.83,-.08+Math.sin(angle)*.34,.14,.60,-Math.cos(angle)*.35);shard.userData.floating=true;}
 if(tier===5)for(const side of [-1,1]){
  const wall=plate(frame,'super-brittle-ice-wall',frost,[[0,0],[side*.65,.14],[side*.43,.68],[side*.74,1.00],[side*.45,1.64],[side*.55,2.42],[side*.20,2.05],[side*.14,1.35],[-side*.10,.92]],side*1.0,.16,-.58,.23);wall.userData.baseZ=0;wall.userData.baseY=.16;crystals.push(wall);
  crystal(frame,'super-brittle-tall-crystal',side*1.23,1.65,-.69,.23,2.65,-side*.16);
  crystal(frame,'super-brittle-side-crystal',side*1.45,.55,-.03,.30,1.08,-side*.35);
 }
 root.userData={body:frame,weapon,iceBaseModel:tier===0,iceModelPath:tier?0:-1,iceModelTier:tier,iceRig:{body,head,eyes,arms,tail,feet,sparks,handsMat,crystals,frost,tier}};
 return root;
}

export function animateIce(t,dt){
 const rig=t.mesh.userData.iceRig;if(!rig)return;
 t.iceIdleTime=(t.iceIdleTime??t.id*.43)+dt;t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);
 const time=t.iceIdleTime,idle=Math.sin(time*1.8),kick=Math.sin(Math.min(1,t.fireAnim/.24)*Math.PI);
 // Feet stay anchored while the torso breathes and the hands release a radial freeze.
 t.iceAbilityAnim=Math.max(0,(t.iceAbilityAnim||0)-dt);
 const storm=t.iceAbilityAnim>0?Math.sin(t.iceAbilityAnim/.8*Math.PI):0;
 rig.body.position.y=(rig.hover?rig.hoverBase+Math.sin(time*1.7)*.055:idle*.012)-kick*.03+storm*.05;rig.body.scale.set(1+kick*.025,1-kick*.025,1+kick*.025);
 rig.head.rotation.y=Math.sin(time*.8)*.055;rig.head.rotation.z=Math.sin(time*1.3)*.025;
 rig.head.rotation.x=-kick*.045;
 rig.arms.forEach((arm,i)=>{const side=i===0?-1:1;arm.rotation.z=(arm.userData.restZ||0)+side*(idle*.045+kick*.21);arm.rotation.x=(arm.userData.restX||0)-kick*.20;});
 rig.tail.rotation.y=Math.sin(time*1.5)*.12;rig.tail.rotation.z=Math.sin(time*1.9)*.055;
 const phase=time%4.8,blink=phase<.16?Math.max(.12,Math.abs(phase-.08)/.08):1;
 for(const eye of rig.eyes)eye.scale.y=blink;
 rig.handsMat.emissiveIntensity=.05+kick*.55+storm*.45;
 if(rig.cannon){rig.cannon.position.z=rig.cannonRestZ-kick*.12;rig.cannon.rotation.x=Math.sin(time*1.5)*.015-kick*.055;rig.cannonGlow.emissiveIntensity=.65+(idle+1)*.075+kick*.9;}
 if(rig.loadedIcicle)rig.loadedIcicle.visible=t.fireAnim<=.06;
 if(rig.iceCape){rig.iceCape.rotation.x=Math.sin(time*1.7)*.035;rig.iceCape.rotation.y=Math.sin(time*1.3)*.045;}
 for(const scarf of rig.scarves||[]){scarf.rotation.y=Math.sin(time*1.8)*.12+kick*.16;scarf.rotation.x=Math.sin(time*2.3)*.065+storm*.10;}
 if(rig.hover)for(const [i,foot] of rig.feet.entries())foot.rotation.x=Math.sin(time*1.6+i)*.05-kick*.06;
 if(rig.frost)rig.frost.emissiveIntensity=.04+kick*.40+(rig.tier===5?(idle+1)*.035:0);
 for(const [i,crystal] of (rig.crystals||[]).entries()){
  crystal.rotation.z=crystal.userData.baseZ+Math.sin(time*1.4+i)*.015+kick*(i%2?1:-1)*.06;
  if(crystal.userData.floating)crystal.position.y=crystal.userData.baseY+Math.sin(time*1.8+i)*.065+kick*.16;
 }
 for(const spark of rig.sparks){spark.visible=kick>.12;spark.scale.setScalar(.6+kick*.8);spark.rotation.y=time*2+spark.userData.phase;}
}
