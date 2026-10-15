import * as THREE from './assets/vendor/three.module.js';
// Temporary support building based on the supplied blue twin-dish reference.
export function makeMIBTowerMesh(){
 const root=new THREE.Group(),body=new THREE.Group();root.name='mib-support-building';root.add(body);root.userData.body=body;
 const material=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:.58,metalness});
 const blue=material(0x377fba),light=material(0x70c7ea),dark=material(0x235379),stone=material(0x74728c),rim=material(0xb5d0de,.3),silver=material(0x9da6ad,.45),orange=material(0xff9b12),black=material(0x111b2b);
 function box(name,w,h,d,mat,x,y,z,parent=body){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
 box('concrete-foundation',2.9,.18,2.7,stone,0,.09,0);box('blue-office',2.25,2.35,2.05,blue,0,1.35,0);
 box('front-door-recess',.8,1.15,.08,black,0,.76,1.055);box('door-frame-left',.16,1.3,.22,stone,-.48,.83,1.12);box('door-frame-right',.16,1.3,.22,stone,.48,.83,1.12);box('door-frame-lintel',1.12,.18,.22,stone,0,1.51,1.12);
 for(const x of [-.76,0,.76]){box('front-window-frame',.62,.72,.1,light,x,2.02,1.065);box('orange-front-window',.47,.57,.13,orange,x,2.02,1.11);}
 for(const side of [-1,1])for(const z of [-.53,.35]){box('side-window-frame',.1,.72,.62,light,side*1.15,2.02,z);box('orange-side-window',.13,.56,.47,orange,side*1.2,2.02,z);}
 box('roof-lower-rim',2.6,.15,2.4,dark,0,2.6,0);box('roof-blue-parapet',2.7,.17,2.5,light,0,2.73,0);box('roof-upper-slab',2.38,.16,2.18,blue,0,2.86,0);box('radar-plinth',1.65,.13,1.55,light,0,3,0);
 box('mast-dark-core',.82,1.15,.7,dark,0,3.6,0);
 for(const x of [-.44,.44])box('mast-upright',.12,1.28,.12,blue,x,3.63,.43);
 for(const y of [3.05,3.62,4.23])box('mast-crossbar',.98,.12,.12,light,0,y,.43);
 for(const y of [3.34,3.94])for(const sign of [-1,1]){const brace=box('mast-x-brace',1.02,.1,.1,blue,0,y,.45);brace.rotation.z=sign*.54;}
 const rotor=new THREE.Group();rotor.name='spinning-twin-radar';rotor.position.set(0,4.18,0);body.add(rotor);
 const axle=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1.8,10),dark);axle.rotation.z=Math.PI/2;rotor.add(axle);
 for(const [x,angle] of [[-.73,-.22],[.73,Math.PI-.22]]){
  const dish=new THREE.Group();dish.name='radar-dish';dish.position.x=x;dish.rotation.y=angle;rotor.add(dish);
  const profile=[new THREE.Vector2(0,-.18),new THREE.Vector2(.28,-.16),new THREE.Vector2(.57,-.04),new THREE.Vector2(.82,.15)];
  const bowl=new THREE.Mesh(new THREE.LatheGeometry(profile,16),silver);bowl.name='faceted-silver-dish';bowl.material.side=THREE.DoubleSide;bowl.rotation.x=Math.PI/2;dish.add(bowl);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(.82,.055,5,20),rim);lip.position.z=.15;lip.name='silver-dish-rim';dish.add(lip);
  const horn=new THREE.Mesh(new THREE.ConeGeometry(.2,.7,10),silver);horn.name='dish-feed-horn';horn.rotation.x=Math.PI/2;horn.position.z=.22;dish.add(horn);
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.08,8),dark);tip.rotation.x=Math.PI/2;tip.position.z=.59;dish.add(tip);
 }
 root.userData.mibRig={rotor};root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return root;
}
export function animateMIB(t,dt){const rotor=t.mesh.userData.mibRig?.rotor;if(rotor)rotor.rotation.y=(rotor.rotation.y+dt*.7)%(Math.PI*2);}
