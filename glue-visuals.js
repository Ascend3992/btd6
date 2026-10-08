import * as THREE from './assets/vendor/three.module.js';

// Faceted, fully rigged model based on the supplied brown monkey / yellow gun.
export function makeBaseGlueTowerMesh(){
 const root=new THREE.Group(),body=new THREE.Group(),pose=new THREE.Group(),weapon=new THREE.Group();root.add(body);body.add(pose);pose.add(weapon);
 root.name='reference-glue-gunner';
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.75,flatShading:true});
 const fur=material(0x8e421d),hair=material(0x6b2b13),skin=material(0xf4bd65),cream=material(0xffe5a2),green=material(0x3f841c),dark=material(0x293321),steel=material(0x69725c),glue=material(0xf0cf25),white=material(0xfffbdf);
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(parent,name,mat,x,y,z,w,h,d)=>part(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const tube=(parent,name,mat,points,radius)=>part(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,6,false),mat);
 const feet=[];
 for(const side of [-1,1]){
  oval(pose,'brown-leg',fur,side*.27,.49,.06,.19,.34,.21);
  const foot=oval(body,'planted-brown-foot',fur,side*.29,.18,.22,.24,.15,.38);feet.push(foot);
  for(let i=0;i<3;i++)box(body,'foot-toe',skin,side*.29+(i-1)*.10,.16,.51,.065,.08,.10);
 }
 oval(pose,'brown-monkey-body',fur,0,1.05,0,.48,.62,.37);
 oval(pose,'tan-belly',skin,0,.99,.31,.29,.35,.08);
 const head=new THREE.Group();head.position.set(0,2.13,.02);pose.add(head);
 oval(head,'brown-monkey-head',fur,0,0,0,.73,.76,.57);
 const eyes=[];
 for(const side of [-1,1]){
  oval(head,'round-monkey-ear',fur,side*.70,-.03,-.03,.24,.30,.15);
  oval(head,'tan-inner-ear',skin,side*.73,-.03,.09,.14,.20,.07);
  oval(head,'tan-eye-mask',skin,side*.24,.02,.46,.32,.39,.11);
  const eye=new THREE.Group();eye.position.set(side*.25,.06,.54);head.add(eye);eyes.push(eye);
  oval(eye,'white-eye',white,0,0,0,.20,.28,.065);
  oval(eye,'brown-pupil',hair,.04,-.025,.063,.080,.14,.028);
  oval(eye,'eye-highlight',white,.06,.015,.09,.024,.037,.014);
  const brow=box(head,'determined-brown-eyebrow',hair,side*.26,.37,.56,.35,.065,.065);brow.rotation.z=-side*.15;
 }
 oval(head,'tan-monkey-muzzle',cream,0,-.39,.48,.36,.22,.14);
 oval(head,'brown-nose',hair,0,-.29,.65,.061,.046,.030);
 tube(head,'monkey-smile',hair,[[-.13,-.45,.60],[0,-.50,.63],[.16,-.44,.60]],.018);
 for(const [x,y,z,tilt] of [[-.12,.73,-.09,-.35],[-.35,.66,-.11,-.75],[.07,.68,-.16,.15]]){const tuft=part(head,'pointed-brown-hair',new THREE.ConeGeometry(.18,.49,5),hair,x,y,z);tuft.rotation.z=tilt;}
 const tail=tube(pose,'curled-brown-tail',fur,[[0,.88,-.28],[-.44,.83,-.62],[-.74,1.1,-.61],[-.68,1.37,-.56],[-.46,1.33,-.55]],.115);
 const tank=part(pose,'yellow-backpack-glue-tank',new THREE.CylinderGeometry(.34,.34,.88,10),glue,-.45,1.22,-.43);
 for(const y of [.86,1.57])part(pose,'green-tank-band',new THREE.CylinderGeometry(.355,.355,.13,10),green,-.45,y,-.43);
 part(pose,'tank-filler-cap',new THREE.CylinderGeometry(.20,.24,.13,8),steel,-.45,1.74,-.43);
 for(const side of [-1,1])tube(pose,'green-backpack-strap',green,[[side*.36,.70,.25],[side*.40,1.26,.29],[side*.35,1.52,.05],[side*.35,1.32,-.36]],.07);
 const arms=[];
 // Hands stay attached to the gun during recoil.
 weapon.position.set(.25,1.36,.39);weapon.userData.rest=weapon.position.clone();
 for(const side of [-1,1]){
  const arm=tube(weapon,'brown-gun-arm',fur,[[side*.44,.12,-.35],[side*.48,-.18,-.10],[side*.24,-.17,.30]],.14);arms.push(arm);
  oval(weapon,'gun-gripping-hand',skin,side*.23,-.16,.33,.16,.14,.18);
 }
 box(weapon,'yellow-glue-gun-body',glue,0,.03,.35,.45,.32,.92);
 box(weapon,'green-gun-upper-trim',green,0,.22,.31,.47,.08,.91);
 box(weapon,'dark-trigger-grip',dark,.03,-.22,.05,.16,.35,.17);
 box(weapon,'yellow-glue-reservoir',glue,0,.38,.10,.33,.28,.38);
 box(weapon,'tank-window',cream,0,.38,.30,.24,.18,.015);
 const barrel=part(weapon,'green-glue-nozzle',new THREE.CylinderGeometry(.12,.18,.41,8),green,0,.03,.99);barrel.rotation.x=Math.PI/2;
 const rim=part(weapon,'steel-nozzle-rim',new THREE.TorusGeometry(.12,.035,5,10),steel,0,.03,1.20);
 part(weapon,'dark-nozzle-opening',new THREE.CircleGeometry(.095,10),dark,0,.03,1.205);
 const muzzle=new THREE.Object3D();muzzle.position.set(0,.03,1.25);weapon.add(muzzle);
 const droplet=oval(weapon,'yellow-muzzle-droplet',glue,0,-.15,1.21,.055,.13,.055);
 tube(pose,'green-tank-feed-hose',dark,[[-.43,.87,-.47],[-.70,.61,-.10],[-.65,.87,.43],[-.15,1.25,.52]],.055);
 Object.assign(root.userData,{body,weapon,glueRig:{pose,head,eyes,feet,arms,tail,tank,muzzle,droplet,glueMaterial:glue}});
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
 rig.droplet.scale.y=.13*(1+Math.sin(time*3)*.12+kick*.8);
}
