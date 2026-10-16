import * as THREE from './assets/vendor/three.module.js';
// Base Sniper: supplied camouflage beret, yellow badge, bare fur and long gray rifle.
export function makeSniperTowerMesh(){
 const root=new THREE.Group(),body=new THREE.Group(),pose=new THREE.Group();root.name='reference-base-sniper';root.add(body);body.add(pose);root.userData.body=body;
 const material=color=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.7});
 const fur=material(0x95471b),darkFur=material(0x6c3010),skin=material(0xe7a344),black=material(0x18201a),white=material(0xfffbe7),pupil=material(0x40200e),green=material(0x416d0e),yellow=material(0xffc20b),steel=material(0x9ba6ac),gunmetal=material(0x3b4248);
 function part(parent,name,geometry,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const oval=(parent,name,mat,x,y,z,sx,sy,sz)=>{const m=part(parent,name,new THREE.SphereGeometry(1,12,8),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(parent,name,mat,x,y,z,w,h,d)=>part(parent,name,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const feet=[];
 for(const side of [-1,1]){oval(pose,'brown-sniper-leg',fur,side*.25,.48,.01,.19,.34,.20);feet.push(oval(body,'planted-bare-sniper-foot',darkFur,side*.27,.14,.23,.26,.14,.37));for(let i=0;i<3;i++)oval(body,'tan-sniper-toe',skin,side*.27+(i-1)*.11,.13,.53,.063,.09,.10);}
 oval(pose,'bare-brown-sniper-body',fur,0,1.12,0,.44,.65,.34);oval(pose,'tan-belly-patch',skin,0,1.12,.31,.25,.35,.055);oval(pose,'belly-button',darkFur,.03,1.07,.368,.025,.026,.012);
 const tail=part(pose,'curled-brown-sniper-tail',new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0,.7,-.28],[.43,.59,-.52],[.65,.76,-.54],[.56,.93,-.49]].map(p=>new THREE.Vector3(...p))),12,.085,6,false),fur);
 const head=new THREE.Group();head.position.y=2.2;pose.add(head);
 oval(head,'angular-brown-sniper-head',fur,0,0,0,.73,.72,.56);
 for(const side of [-1,1]){oval(head,'round-sniper-ear',darkFur,side*.69,-.02,.04,.25,.28,.14);oval(head,'tan-inner-ear',skin,side*.73,-.03,.15,.14,.17,.045);oval(head,'tan-face-patch',skin,side*.25,-.09,.49,.35,.43,.12);}
 const eyes=[];for(const side of [-1,1]){const eye=new THREE.Group();eye.position.set(side*.27,-.04,.6);head.add(eye);eyes.push(eye);oval(eye,'large-white-sniper-eye',white,0,0,0,.23,.27,.035);oval(eye,'brown-sniper-pupil',pupil,-side*.035,-.015,.038,.088,.14,.025);oval(eye,'sniper-eye-highlight',white,-side*.025,.045,.063,.023,.032,.009);const brow=box(head,'angular-sniper-eyebrow',darkFur,side*.28,.26,.62,.42,.13,.08);brow.rotation.z=side*.35;}
 oval(head,'small-tan-sniper-muzzle',skin,0,-.39,.53,.27,.17,.12);oval(head,'sniper-smile',pupil,.015,-.43,.646,.09,.036,.014);oval(head,'smile-cover',skin,.008,-.40,.66,.083,.031,.018);
 const hair=part(head,'pointed-brown-forelock',new THREE.ConeGeometry(.16,.46,4),darkFur,-.39,.37,.51);hair.rotation.z=.37;
 const beret=new THREE.Group();beret.position.set(.04,.57,-.015);beret.rotation.z=-.13;head.add(beret);
 const band=part(beret,'black-beret-headband',new THREE.CylinderGeometry(.75,.73,.16,16),black,0,-.13,0);band.scale.z=.79;
 const geometry=new THREE.SphereGeometry(1,18,9).toNonIndexed(),positions=geometry.getAttribute('position'),colors=[];
 const palette=[new THREE.Color(0x254d09),new THREE.Color(0x436f0d),new THREE.Color(0x648e19),new THREE.Color(0x83a52c)];
 for(let i=0;i<positions.count;i+=3){const x=(positions.getX(i)+positions.getX(i+1)+positions.getX(i+2))/3,y=(positions.getY(i)+positions.getY(i+1)+positions.getY(i+2))/3,z=(positions.getZ(i)+positions.getZ(i+1)+positions.getZ(i+2))/3;const patch=Math.sin(x*6+z*8)+Math.sin(y*9-z*5);const c=palette[patch>1?3:patch>.15?2:patch>-.9?1:0];for(let j=0;j<3;j++)colors.push(c.r,c.g,c.b);}
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const cap=part(beret,'green-camouflage-beret',geometry,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.85}),0,.04,0);cap.scale.set(.94,.40,.73);
 const badge=part(beret,'round-yellow-beret-badge',new THREE.CylinderGeometry(.22,.22,.055,18),yellow,.18,.055,.69);badge.rotation.x=Math.PI/2;
 const rifle=new THREE.Group();rifle.name='long-gray-sniper-rifle';rifle.position.set(-.67,1.35,.25);pose.add(rifle);
 const stock=box(rifle,'dark-gray-rifle-stock',gunmetal,0,-.62,0,.27,1.2,.28);stock.rotation.z=-.07;box(rifle,'black-rifle-butt',black,.04,-1.18,0,.32,.13,.31);box(rifle,'gray-rifle-receiver',gunmetal,0,.16,0,.26,.43,.25);
 part(rifle,'long-silver-rifle-barrel',new THREE.CylinderGeometry(.065,.075,1.94,10),steel,0,1.28,0);part(rifle,'dark-rifle-barrel-side',new THREE.CylinderGeometry(.032,.032,1.85,8),gunmetal,.045,1.3,-.025);
 part(rifle,'silver-rifle-muzzle',new THREE.CylinderGeometry(.10,.10,.12,10),steel,0,2.3,0);part(rifle,'black-rifle-muzzle-opening',new THREE.CylinderGeometry(.063,.063,.006,10),black,0,2.363,0);
 box(rifle,'front-rifle-sight',black,0,2.12,.085,.055,.065,.10);box(rifle,'rear-rifle-sight',black,0,.48,.12,.10,.10,.06);box(rifle,'rifle-bolt-handle',steel,.19,.27,0,.22,.055,.055);
 oval(rifle,'left-sniper-gripping-hand',skin,.015,.02,.19,.18,.24,.12);for(const y of [-.11,.01,.13])box(rifle,'sniper-grip-finger',skin,-.05,y,.29,.23,.08,.05);
 const flash=part(rifle,'sniper-muzzle-flash',new THREE.OctahedronGeometry(.22,0),new THREE.MeshBasicMaterial({color:0xffe56b}),0,2.48,0);flash.scale.set(.55,1.5,.55);flash.visible=false;
 const rightArm=new THREE.Group();rightArm.position.set(.38,1.47,0);pose.add(rightArm);oval(rightArm,'right-brown-sniper-arm',fur,.12,-.33,.06,.17,.42,.18);oval(rightArm,'right-bare-sniper-hand',skin,.14,-.69,.13,.18,.23,.13);const leftArm=oval(pose,'left-brown-sniper-arm',fur,-.40,1.4,.11,.20,.35,.19);leftArm.rotation.z=-.55;
 root.userData.sniperRig={pose,head,eyes,feet,tail,rifle,flash,rightArm,leftArm,idleTime:0};return root;
}
export function animateSniper(t,dt){
 const rig=t.mesh.userData.sniperRig;if(!rig)return;rig.idleTime+=dt;t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);const aim=Math.min(1,t.fireAnim/.06),kick=Math.sin(Math.min(1,t.fireAnim/.24)*Math.PI),idle=Math.sin(rig.idleTime*2+(t.id||0));
 rig.pose.position.y=idle*.025;rig.rifle.rotation.x=aim*Math.PI/2;rig.rifle.position.y=1.35+aim*.75;rig.rifle.position.z=.25-kick*.12;rig.rightArm.rotation.x=-aim*1.12;rig.leftArm.position.y=1.4+aim*.45;rig.tail.rotation.y=idle*.05;rig.flash.visible=t.fireAnim>.205;
 for(const eye of rig.eyes)eye.scale.y=rig.idleTime%5.2>5.02?.12:aim?.78:1;
}
export function sniperMuzzleOrigin(t){const rig=t.mesh.userData.sniperRig;if(!rig)return new THREE.Vector3(t.x,2.1,t.z);t.mesh.updateWorldMatrix(true,true);return rig.flash.getWorldPosition(new THREE.Vector3());}
