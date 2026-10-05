import * as THREE from './assets/vendor/three.module.js';

export function makeBaseTackTowerMesh(){return makeTackTopTowerMesh(0);}

function tackSawGeometry(radius,hole,teeth=16){
 const shape=new THREE.Shape();
 for(let i=0;i<teeth*3;i++){const a=i*Math.PI*2/(teeth*3),r=i%3===0?radius:radius*.78,x=Math.sin(a)*r,y=Math.cos(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();
 const opening=new THREE.Path();opening.absarc(0,0,hole,0,Math.PI*2,false);shape.holes.push(opening);
 return new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:false,curveSegments:12});
}

export function makeTackBladeProjectile(){
 const root=new THREE.Group();root.name='tack-saw-projectile';
 const blade=new THREE.Mesh(tackSawGeometry(.42,.12,12),new THREE.MeshStandardMaterial({color:0xd0d7dc,metalness:.5,roughness:.62,flatShading:true,side:THREE.DoubleSide}));
 blade.rotation.x=-Math.PI/2;root.add(blade);return root;
}

// Faceted pressure vessels share a grounded chassis; furnace tiers expose live fire.
export function makeTackTopTowerMesh(tier,portCount=8){
 tier=Math.max(0,Math.min(5,Math.floor(tier)));
 portCount=tier>=4?8:Math.max(8,Math.min(32,Math.round(portCount)));
 const hot=tier>=3,furnace=tier>=4,inferno=tier===5;
 const root=new THREE.Group(),body=new THREE.Group(),weapon=new THREE.Group();
 root.name='Tack Shooter';body.name='tack-chassis';root.add(body);body.add(weapon);
 const material=(color,metalness=.12)=>new THREE.MeshStandardMaterial({color,roughness:.65,metalness,flatShading:true,side:THREE.DoubleSide});
 const pink=material(inferno?0xef2914:furnace?0xff6113:hot?0xffc400:0xfa398b),lidPink=material(hot?0xffcb19:0xff71b9),lightPink=material(hot?0xffd536:0xff94ca),dark=material(0x2b2c30),edge=material(0x181a1c),rivets=material(inferno?0xffc927:0x46494c,.25),silver=material(0xd6dbdc,.4),steel=material(0x8e979c,.35),bore=material(0x151b1e);
 const fireOrange=new THREE.MeshBasicMaterial({color:0xff7808}),fireYellow=new THREE.MeshBasicMaterial({color:0xffd820}),fireCore=new THREE.MeshBasicMaterial({color:0xfff6ad});
 const flameGradient=new THREE.MeshBasicMaterial({vertexColors:true});
 const glow=material(0xffdb22);glow.emissive.setHex(0xffa300);glow.emissiveIntensity=1.1;
 const flames=[],jets=[];
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{
  const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const lathe=(parent,name,profile,mat)=>part(parent,name,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),16),mat);
 lathe(body,'tack-foot',[[0,.04],[.86,.04],[1.06,.12],[1.08,.22],[1.02,.29],[0,.29]],edge);
 lathe(body,'lower-riveted-band',[[0,.23],[.98,.23],[1.02,.31],[1.02,.59],[.94,.68],[0,.68]],dark);
 const lowerLip=part(body,'lower-steel-edge',new THREE.TorusGeometry(1.005,.045,6,16),rivets,0,.31);lowerLip.rotation.x=Math.PI/2;
 const housing=new THREE.Group();housing.name=hot?'heated-pressure-housing':'pink-pressure-housing';body.add(housing);
 lathe(housing,'pink-shell',[[0,.53],[.83,.53],[1.06,.71],[1.12,.98],[1.10,1.25],[.97,1.48],[.87,1.55],[0,1.55]],pink);
 const ports=[];
 for(let i=0;i<portCount;i++){
  const angle=i*Math.PI*2/portCount,port=new THREE.Group();port.name='tack-port';port.position.set(Math.sin(angle)*1.04,1.13,Math.cos(angle)*1.04);port.rotation.y=angle;port.userData.rest=port.position.clone();housing.add(port);ports.push(port);
  const mount=part(port,'pink-port-mount',new THREE.CylinderGeometry(.31,.34,.19,10),lightPink,0,0,.02);mount.rotation.x=Math.PI/2;
  const tube=part(port,'steel-port-tube',new THREE.CylinderGeometry(.26,.29,.46,10,1,true),hot?dark:silver,0,0,.23);tube.rotation.x=Math.PI/2;
  const inside=part(port,'dark-port-bore',new THREE.CylinderGeometry(.196,.18,.43,10,1,true),bore,0,0,.23);inside.rotation.x=Math.PI/2;
  const rim=part(port,'silver-port-lip',new THREE.RingGeometry(.196,.26,10),hot?steel:silver,0,0,.466);
  const shadow=part(port,'port-bore-shadow',new THREE.CircleGeometry(.2,10),furnace?glow:bore,0,0,furnace?.461:.15);shadow.rotation.y=Math.PI;
  if(furnace){const core=part(port,'white-hot-port-core',new THREE.CircleGeometry(.133,10),fireCore,0,0,.465);core.castShadow=false;core.receiveShadow=false;}
  const seam=part(port,'port-steel-collar',new THREE.TorusGeometry(.28,.026,4,10),steel,0,0,.045);
  rim.castShadow=false;seam.receiveShadow=true;
  if(hot)for(let j=0;j<4;j++){
   const a=j*Math.PI/2,vent=part(port,furnace?'glowing-port-stud':'port-vent',new THREE.CircleGeometry(.043,6),furnace?glow:bore,Math.sin(a)*.28,Math.cos(a)*.28,.26);
   vent.lookAt(port.localToWorld(new THREE.Vector3(Math.sin(a),Math.cos(a),.26))); // radial surface vent
  }
  if(inferno)port.visible=i%2===0;
 }
 const lid=new THREE.Group();lid.name='tack-lid';lid.position.y=1.43;body.add(lid);
 lathe(lid,'upper-riveted-band',furnace?[[.80,0],[.89,0],[.96,.07],[.96,.34],[.91,.41],[.80,.41],[.80,0]]:[[0,0],[.89,0],[.96,.07],[.96,.34],[.91,.41],[0,.41]],inferno?lightPink:dark);
 if(!furnace)lathe(lid,'pink-top-cap',[[0,.31],[.89,.31],[.98,.39],[.97,.46],[.84,.54],[0,.54]],lidPink);
 const capRim=part(lid,furnace?'furnace-rim':'pink-cap-edge',new THREE.TorusGeometry(furnace?.87:.95,furnace?.065:.022,6,16),lightPink,0,furnace?.38:.45);capRim.rotation.x=Math.PI/2;
 // Flat black tack silhouettes stay readable from the overhead game camera.
 const tackShape=new THREE.Shape();tackShape.moveTo(-.19,.55);tackShape.lineTo(.19,.55);tackShape.lineTo(.19,.40);tackShape.lineTo(.06,.40);tackShape.lineTo(.06,-.22);tackShape.lineTo(0,-.60);tackShape.lineTo(-.06,-.22);tackShape.lineTo(-.06,.40);tackShape.lineTo(-.19,.40);tackShape.closePath();
 const ink=new THREE.MeshBasicMaterial({color:0x101014,side:THREE.DoubleSide});
 if(tier<=2)for(const angle of tier===0?[-Math.PI/4,Math.PI/4]:Array.from({length:tier+2},(_,i)=>(i-(tier+1)/2)*.48)){
  const geometry=new THREE.ShapeGeometry(tackShape);if(tier>0)geometry.translate(0,.60,0);
  const mark=part(lid,tier===0?'crossed-tack-emblem':'fanned-tack-emblem',geometry,ink,0,.545);mark.rotation.set(-Math.PI/2,0,angle);mark.castShadow=false;mark.receiveShadow=false;
  if(tier>0){mark.scale.set(.8,.92,1);mark.position.z=.49;}
 }
 if(tier===3){
  const flameShape=new THREE.Shape();flameShape.moveTo(0,.68);flameShape.bezierCurveTo(-.2,.3,-.07,.30,-.30,.48);flameShape.bezierCurveTo(-.27,.18,-.56,.08,-.45,-.20);flameShape.bezierCurveTo(-.35,-.59,.38,-.59,.46,-.14);flameShape.bezierCurveTo(.48,.12,.24,.21,.26,.46);flameShape.bezierCurveTo(.21,.26,.08,.22,0,.68);
  for(const [name,mat,scale,height] of [['flame-emblem',fireOrange,1,.546],['flame-emblem-core',fireYellow,.53,.548]]){
   const mark=part(lid,name,new THREE.ShapeGeometry(flameShape),mat,0,height);mark.rotation.x=-Math.PI/2;mark.scale.setScalar(scale);mark.castShadow=false;mark.receiveShadow=false;
  }
 }
 const addFlame=(parent,x,y,z,height,width,phase)=>{
  const flame=new THREE.Group();flame.name='furnace-flame';flame.position.set(x,y,z);flame.userData={phase,rest:flame.position.clone()};parent.add(flame);
  // Curved taper gives each flame a pointed, asymmetric silhouette without textures.
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(-width*.25,height*.4,0),new THREE.Vector3(width*.3,height*.72,0),new THREE.Vector3(-width*.1,height,0)]);
  const geo=new THREE.TubeGeometry(curve,6,width,6,false);
  const pos=geo.attributes.position;
  const colors=[];
  for(let i=0;i<pos.count;i++){
   const h=Math.floor(i/7)/6,c=curve.getPointAt(h),p=new THREE.Vector3().fromBufferAttribute(pos,i).sub(c).multiplyScalar(1-h*.995).add(c);pos.setXYZ(i,p.x,p.y,p.z);
   const color=new THREE.Color(h<.4?0xfff6ad:0xffd820).lerp(new THREE.Color(h<.4?0xffd820:0xff7808),h<.4?h/.4:(h-.4)/.6);colors.push(color.r,color.g,color.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const outer=part(flame,'orange-flame-tongue',geo,flameGradient);outer.castShadow=false;outer.receiveShadow=false;
  const inner=part(flame,'yellow-flame-core',new THREE.ConeGeometry(width*.72,height*.73,6),fireYellow,0,height*.32);inner.castShadow=false;inner.receiveShadow=false;
  const core=part(flame,'white-hot-core',new THREE.ConeGeometry(width*.42,height*.44,6),fireCore,0,height*.17);core.castShadow=false;core.receiveShadow=false;
  flames.push(flame);return flame;
 };
 if(furnace){
  lathe(lid,'furnace-interior',[[0,.08],[.76,.08],[.80,.38]],bore);
  const ember=part(lid,'furnace-coals',new THREE.CircleGeometry(.79,16),fireYellow,0,.11);ember.rotation.x=-Math.PI/2;ember.castShadow=false;
  addFlame(lid,0,.16,0,inferno?1.65:1.32,.30,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;addFlame(lid,Math.sin(a)*.48,.15,Math.cos(a)*.48,(inferno?1.30:.87)+(i%3)*.10,.17,i*1.7);}
 }
 if(inferno){
  // Four low elbow exhausts distinguish Inferno from the eight straight tack ports.
  for(let i=0;i<4;i++){
   const a=Math.PI/4+i*Math.PI/2,exhaust=new THREE.Group();exhaust.name='inferno-elbow-exhaust';exhaust.rotation.y=a;housing.add(exhaust);
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.11,.97),new THREE.Vector3(0,1.10,1.33),new THREE.Vector3(0,.88,1.56),new THREE.Vector3(0,.58,1.56)]);
   part(exhaust,'black-elbow-pipe',new THREE.TubeGeometry(curve,8,.26,8,false),dark);
   const band=part(exhaust,'gold-exhaust-collar',new THREE.TorusGeometry(.265,.044,4,8),lightPink,0,1.09,1.27);band.rotation.x=.2;
   const rim=part(exhaust,'exhaust-tip-rim',new THREE.TorusGeometry(.26,.03,4,8),steel,0,.57,1.56);rim.rotation.x=Math.PI/2;
   const mouth=part(exhaust,'exhaust-hot-mouth',new THREE.CircleGeometry(.235,8),glow,0,.567,1.56);mouth.rotation.x=Math.PI/2;mouth.castShadow=false;
   const jet=addFlame(exhaust,0,.55,1.56,.49,.19,i+1);jet.rotation.x=Math.PI;jets.push(jet);
  }
  for(const y of [.64,1.40]){const band=part(housing,'gold-armor-ring',new THREE.TorusGeometry(y<1?1.01:.98,.035,4,16),lightPink,0,y);band.rotation.x=Math.PI/2;}
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,panel=part(housing,'red-armor-panel',new THREE.BoxGeometry(.49,.56,.06),pink,Math.sin(a)*1.10,1.02,Math.cos(a)*1.10);panel.rotation.y=a;
   part(housing,'gold-armor-bolt',new THREE.SphereGeometry(.044,6,4),lightPink,Math.sin(a)*1.15,1.37,Math.cos(a)*1.15);
  }
 }
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6;
  part(body,'lower-band-rivet',new THREE.SphereGeometry(.061,6,4),rivets,Math.sin(a)*1.02,.47,Math.cos(a)*1.02);
  part(lid,'upper-band-rivet',new THREE.SphereGeometry(.059,6,4),rivets,Math.sin(a)*.96,.18,Math.cos(a)*.96);
 }
 lid.userData.rest=lid.position.clone();
 // Materials absent from a tier have no meshes to dispose during a later upgrade.
 if(tier!==3)fireOrange.dispose();
 if(tier<3)fireYellow.dispose();
 if(furnace)lidPink.dispose();
 if(!furnace){fireCore.dispose();glow.dispose();flameGradient.dispose();}
 if(tier>2)ink.dispose();
 if(hot)silver.dispose();
 root.userData={body,weapon,tackBaseModel:tier===0,tackModelPath:0,tackModelTier:tier,tackModelPorts:portCount,tackRig:{body,housing,lid,ports,flames,jets,glow:furnace?glow:null,tier}};
 return root;
}

export function makeTackMiddleTowerMesh(tier,portCount=8){
 tier=Math.max(1,Math.min(5,Math.floor(tier)));
 const root=makeTackTopTowerMesh(0,portCount),rig=root.userData.tackRig;
 const oldMaterials=new Set();root.traverse(o=>{if(o.material)oldMaterials.add(o.material);});
 const material=(color,metalness=.2)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.62,flatShading:true,side:THREE.DoubleSide});
 const armor=material(0x32373c),trim=material(0x79838a,.4),silver=material(0xd0d7dc,.5),dark=material(0x171d22),ink=new THREE.MeshBasicMaterial({color:0x101519,side:THREE.DoubleSide});
 const blue=material(0x0094ff),cyan=new THREE.MeshBasicMaterial({color:0x27d9ff,side:THREE.DoubleSide});
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const remove=o=>{o.traverse(child=>child.geometry?.dispose());o.removeFromParent();};
 const ring=(parent,name,radius,width,mat,y)=>{const mesh=part(parent,name,new THREE.TorusGeometry(radius,width,6,16),mat,0,y);mesh.rotation.x=Math.PI/2;return mesh;};
 const flatSaw=(parent,name,radius,hole,mat,x,y,z)=>{const blade=part(parent,name,tackSawGeometry(radius,hole),mat,x,y,z);blade.rotation.x=-Math.PI/2;return blade;};
 // Silver-edged dark lid clamps are the Long Range reference's silhouette.
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2,clamp=new THREE.Group();clamp.name='range-lid-clamp';clamp.rotation.y=a;rig.lid.add(clamp);
  part(clamp,'clamp-steel-border',new THREE.BoxGeometry(.39,.48,.17),trim,0,.25,.97);
  part(clamp,'clamp-dark-face',new THREE.BoxGeometry(.31,.40,.045),armor,0,.23,1.07);
 }
 if(tier>=2){
  const skirt=part(rig.body,'armored-flared-skirt',new THREE.CylinderGeometry(.93,1.15,.61,12),armor,0,.39);
  ring(rig.body,'skirt-upper-trim',.97,.026,trim,.70);
  for(let i=0;i<4;i++){
   const a=Math.PI/4+i*Math.PI/2,foot=new THREE.Group();foot.name='reinforced-foot';foot.rotation.y=a;rig.body.add(foot);
   const plate=part(foot,'foot-steel-border',new THREE.BoxGeometry(.47,.68,.15),trim,0,.45,1.02);plate.rotation.x=-.27;
   const face=part(foot,'foot-dark-face',new THREE.BoxGeometry(.37,.58,.10),armor,0,.45,1.12);face.rotation.x=-.27;
  }
  skirt.receiveShadow=true;
 }
 const blades=[];
 if(tier>=3){
  rig.housing.getObjectByName('pink-shell').material=blue;
  rig.lid.getObjectByName('pink-top-cap').material=blue;
  rig.lid.getObjectByName('pink-cap-edge').material=cyan;
  for(const mark of [...rig.lid.children].filter(o=>o.name==='crossed-tack-emblem'))remove(mark);
  for(const port of rig.ports){
   for(const child of [...port.children])remove(child);
   const slot=part(port,'blade-launch-slot',new THREE.BoxGeometry(.48,.15,.17),dark,0,0,.08);
   const lip=part(port,'blade-slot-rim',new THREE.BoxGeometry(.52,.055,.23),trim,0,.10,.12);
   const blade=flatSaw(port,'port-cutting-blade',.46,.125,silver,0,.12,.24);blades.push(blade);port.userData.muzzle=.72;
   slot.castShadow=false;lip.receiveShadow=true;
  }
  const emblem=part(rig.lid,'blade-lid-emblem',tackSawGeometry(.55,.15,8),ink,0,.548);emblem.rotation.x=-Math.PI/2;
  const eye=part(rig.lid,'blue-blade-eye',new THREE.CircleGeometry(.143,12),cyan,0,.549);eye.rotation.x=-Math.PI/2;eye.castShadow=false;
 }
 let rotor=null,vortex=null;const satellites=[];
 if(tier>=4){
  remove(rig.lid.getObjectByName('blade-lid-emblem'));remove(rig.lid.getObjectByName('blue-blade-eye'));
  rotor=new THREE.Group();rotor.name='maelstrom-rotor';rotor.position.y=.87;rotor.userData.rest=rotor.position.clone();rig.lid.add(rotor);
  part(rig.lid,'rotor-drive-axle',new THREE.CylinderGeometry(.20,.24,.52,10),trim,0,.63);
  part(rotor,'dark-rotor-disc',new THREE.CylinderGeometry(1.03,1.03,.16,16),armor);
  ring(rotor,'silver-rotor-rim',1.01,.035,silver,.055);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,vane=new THREE.Group();vane.name='rotor-cutting-vane';vane.rotation.y=a;rotor.add(vane);
   const shape=new THREE.Shape();shape.moveTo(-.16,0);shape.lineTo(.22,.02);shape.lineTo(.08,.52);shape.lineTo(-.20,.25);shape.closePath();
   const blade=part(vane,'silver-underslung-vane',new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:false}),silver,0,-.08,.45);blade.rotation.set(Math.PI/2+.5,0,.16);
  }
  if(tier===4)flatSaw(rotor,'maelstrom-cap-saw',.84,.21,silver,0,.105,0);
  else{
   const inset=part(rotor,'blue-vortex-inset',new THREE.CylinderGeometry(.89,.89,.018,16),blue,0,.091);
   vortex=new THREE.Group();vortex.name='super-maelstrom-vortex';vortex.position.y=.112;rotor.add(vortex);
   ring(vortex,'cyan-vortex-center',.25,.032,cyan,0);
   for(let i=0;i<10;i++){
    const a=i*Math.PI/5,shape=new THREE.Shape();shape.moveTo(.32,0);shape.quadraticCurveTo(.47,.18,.80,.05);shape.quadraticCurveTo(.66,.36,.39,.30);shape.quadraticCurveTo(.55,.12,.32,0);
    const petal=part(vortex,'swept-cyan-vortex-blade',new THREE.ShapeGeometry(shape),cyan);petal.rotation.set(-Math.PI/2,0,a);petal.castShadow=false;petal.receiveShadow=false;
   }
   inset.receiveShadow=false;
   // Four saws orbit the machine in idle and flare outward during the ability.
   const orbit=new THREE.Group();orbit.name='super-saw-orbit';rig.body.add(orbit);
   for(let i=0;i<4;i++){
    const a=Math.PI/4+i*Math.PI/2,front=i===0||i===3,carrier=new THREE.Group();carrier.name='orbiting-saw-carrier';carrier.userData={angle:a,phase:i*Math.PI/2,height:front ? .73 : 2.45};carrier.position.set(Math.sin(a)*1.42,carrier.userData.height,Math.cos(a)*1.42);orbit.add(carrier);
    const saw=flatSaw(carrier,'orbiting-super-saw',front ? .60 : .34,front ? .17 : .10,silver,0,0,0);blades.push(saw);satellites.push(carrier);
   }
   rig.orbit=orbit;
  }
 }
 Object.assign(rig,{middleTier:tier,blades,rotor,vortex,satellites});
 Object.assign(root.userData,{tackBaseModel:false,tackModelPath:1,tackModelTier:tier});
 // Reusing the base chassis keeps all tiers consistent; release replaced pieces.
 const used=new Set();root.traverse(o=>{if(o.material)used.add(o.material);});
 for(const mat of new Set([...oldMaterials,armor,trim,silver,dark,ink,blue,cyan]))if(!used.has(mat))mat.dispose();
 return root;
}

export function makeTackBottomTowerMesh(tier){
 tier=Math.max(1,Math.min(5,Math.floor(tier)));
 const count=[10,12,16,16,32][tier-1],root=makeTackTopTowerMesh(0,count),rig=root.userData.tackRig;
 const oldMaterials=new Set();root.traverse(o=>{if(o.material)oldMaterials.add(o.material);});
 const armored=tier>=4,zone=tier===5;
 const material=(color,metalness=.22)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.62,flatShading:true,side:THREE.DoubleSide});
 const red=material(0xff3014),lightRed=material(0xff6245),gunmetal=material(0x343543),steel=material(0x92999f,.4),black=material(0x11151b);
 const whiteInk=new THREE.MeshBasicMaterial({color:0xe0e5e7,side:THREE.DoubleSide}),redInk=new THREE.MeshBasicMaterial({color:0xff1c18,side:THREE.DoubleSide});
 const redMouth=material(0xff1018);redMouth.emissive.setHex(0xe0060b);redMouth.emissiveIntensity=1.1;
 const part=(parent,name,geometry,mat,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const remove=o=>{o.traverse(child=>child.geometry?.dispose());o.removeFromParent();};
 const ring=(parent,name,radius,width,mat,y)=>{const mesh=part(parent,name,new THREE.TorusGeometry(radius,width,6,16),mat,0,y);mesh.rotation.x=Math.PI/2;return mesh;};
 if(tier>=3){
  rig.housing.getObjectByName('pink-shell').material=armored?gunmetal:red;
  rig.lid.getObjectByName('pink-top-cap').material=armored?gunmetal:red;
  rig.lid.getObjectByName('pink-cap-edge').material=armored?steel:lightRed;
  // Alternate radial directions between two rows, so every real tack has a port.
  for(let i=0;i<count;i++){
   const port=rig.ports[i];port.position.y=i%2?1.23:.83;port.userData.rest.copy(port.position);
   port.scale.set(zone ? .76 : .92,zone ? .76 : .92,1);
   port.getObjectByName('pink-port-mount').material=armored?steel:lightRed;
  }
 }
 const sensors=[];
 if(tier<=2)for(const port of rig.ports)port.scale.set(tier===1 ? .94 : .85,tier===1 ? .94 : .85,1);
 if(armored){
  rig.body.getObjectByName('lower-riveted-band').material=steel;
  rig.lid.getObjectByName('upper-riveted-band').material=steel;
  for(const name of ['pink-top-cap','pink-cap-edge'])remove(rig.lid.getObjectByName(name));
  for(const mark of [...rig.lid.children].filter(o=>o.name==='crossed-tack-emblem'))remove(mark);
  const profile=[[0,.31],[.89,.31],[.99,.37],[.97,.50],[.87,.69],[.64,.83],[.34,.91],[0,.94]];
  part(rig.lid,'armored-tack-dome',new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),24),gunmetal);
  ring(rig.lid,'dome-steel-rim',.965,.038,steel,.38);
  ring(rig.housing,'lower-armor-rim',1.01,.035,steel,.64);
  ring(rig.housing,'upper-armor-rim',1.015,.035,steel,1.43);
  for(const port of rig.ports){
   port.getObjectByName('port-bore-shadow').material=redMouth;
   port.getObjectByName('port-bore-shadow').position.z=.462;
   port.getObjectByName('steel-port-tube').material=steel;
  }
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,sensor=new THREE.Group();sensor.name='tack-armor-spike';sensor.rotation.y=a;sensor.position.y=.49;rig.body.add(sensor);sensors.push(sensor);
   const stem=part(sensor,'black-spike-stem',new THREE.CylinderGeometry(.043,.06,.35,6),black,0,-.025,1.40);stem.rotation.x=Math.PI/2+.25;
   const tip=part(sensor,'black-spike-tip',new THREE.ConeGeometry(.055,.16,6),black,0,-.08,1.62);tip.rotation.x=Math.PI/2+.25;
   const socket=part(sensor,'spike-steel-socket',new THREE.TorusGeometry(.10,.025,4,8),steel,0,.018,1.21);
   socket.rotation.x=.25;
  }
  // Paint follows the dome curvature, keeping the star and skull legible overhead.
  const domeHeight=radius=>{
   const curve=profile.slice(3).reverse();
   for(let i=1;i<curve.length;i++)if(radius<=curve[i][0]){
    const [r0,y0]=curve[i-1],[r1,y1]=curve[i];return y0+(y1-y0)*(radius-r0)/(r1-r0);
   }
   return .50;
  };
  const decal=(name,geometry,mat,offset=.012)=>{
   const pos=geometry.attributes.position,index=geometry.index,vertices=[];
   const paintTriangle=(a,b,c,depth=0)=>{
    const edges=[a.distanceToSquared(b),b.distanceToSquared(c),c.distanceToSquared(a)],longest=edges.indexOf(Math.max(...edges));
    if(edges[longest]>.0225&&depth<7){
     const points=[a,b,c],p=points[longest],q=points[(longest+1)%3],r=points[(longest+2)%3],mid=p.clone().add(q).multiplyScalar(.5);
     paintTriangle(p,mid,r,depth+1);paintTriangle(mid,q,r,depth+1);return;
    }
    for(const p of [a,b,c])vertices.push(p.x,domeHeight(p.length())+offset,-p.y);
   };
   for(let i=0;i<(index?.count??pos.count);i+=3){const points=[0,1,2].map(j=>{const v=index?index.getX(i+j):i+j;return new THREE.Vector2(pos.getX(v),pos.getY(v));});paintTriangle(...points);}
   geometry.dispose();const curved=new THREE.BufferGeometry();curved.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));curved.computeVertexNormals();
   const mesh=part(rig.lid,name,curved,mat);mesh.castShadow=false;mesh.receiveShadow=false;return mesh;
  };
  if(zone){
   const skull=new THREE.Shape();skull.moveTo(0,.65);skull.bezierCurveTo(.40,.65,.66,.42,.52,.06);skull.lineTo(.38,-.06);skull.lineTo(.33,-.40);skull.lineTo(.20,-.40);skull.lineTo(.15,-.21);skull.lineTo(.08,-.45);skull.lineTo(-.08,-.45);skull.lineTo(-.15,-.21);skull.lineTo(-.20,-.40);skull.lineTo(-.33,-.40);skull.lineTo(-.38,-.06);skull.bezierCurveTo(-.66,.02,-.66,.65,0,.65);
   decal('tack-zone-skull',new THREE.ShapeGeometry(skull).scale(1.2,1.2,1),whiteInk);
   for(const x of [-.24,.24]){
    const eye=new THREE.Shape();eye.absellipse(x,.24,.185,.155,0,Math.PI*2,false,0);
    decal('skull-dark-eye-socket',new THREE.ShapeGeometry(eye).scale(1.2,1.2,1),black,.018);
    const iris=new THREE.Shape();iris.absellipse(x,.24,.127,.108,0,Math.PI*2,false,0);
    decal('skull-red-eye',new THREE.ShapeGeometry(iris).scale(1.2,1.2,1),redInk,.024);
   }
   const nose=new THREE.Shape();nose.moveTo(0,.04);nose.lineTo(.09,-.08);nose.lineTo(-.09,-.08);nose.closePath();decal('skull-nose',new THREE.ShapeGeometry(nose).scale(1.2,1.2,1),black,.024);
   for(const side of [-1,1]){
    const arrow=new THREE.Shape();arrow.moveTo(.59,.12);arrow.lineTo(.78,.20);arrow.lineTo(.84,-.01);arrow.lineTo(.56,-.38);arrow.lineTo(.31,-.70);arrow.lineTo(.40,-.33);arrow.lineTo(.65,-.10);arrow.closePath();
    decal('white-skull-chevrons',new THREE.ShapeGeometry(arrow).scale(side,1,1),whiteInk);
   }
   ring(rig.lid,'red-skull-dome-band',.975,.023,redInk,.465);
  }else{
   const star=new THREE.Shape();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?.14:.83,x=Math.sin(a)*r,y=Math.cos(a)*r;if(i===0)star.moveTo(x,y);else star.lineTo(x,y);}star.closePath();
   decal('overdrive-red-star',new THREE.ShapeGeometry(star),redInk);
  }
  for(const a of zone?[]:[0,Math.PI]){
   const points=[new THREE.Vector3(Math.sin(a)*.985,.50,Math.cos(a)*.985),new THREE.Vector3(Math.sin(a)*.876,.70,Math.cos(a)*.876),new THREE.Vector3(Math.sin(a)*.645,.846,Math.cos(a)*.645),new THREE.Vector3(0,.955,0)];
   const stripe=part(rig.lid,'red-dome-meridian',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),10,.018,4,false),redInk);stripe.castShadow=false;
  }
  if(!zone)for(const a of [0,Math.PI]){
   const stripe=part(rig.housing,'red-chassis-stripe',new THREE.BoxGeometry(.035,.83,.022),redInk,Math.sin(a)*1.122,1.02,Math.cos(a)*1.122);stripe.rotation.y=a;stripe.castShadow=false;
  }
 }
 Object.assign(rig,{bottomTier:tier,sensors,glow:armored?redMouth:null});
 Object.assign(root.userData,{tackBaseModel:false,tackModelPath:2,tackModelTier:tier,tackModelPorts:count});
 const used=new Set();root.traverse(o=>{if(o.material)used.add(o.material);});
 for(const mat of new Set([...oldMaterials,red,lightRed,gunmetal,steel,black,whiteInk,redInk,redMouth]))if(!used.has(mat))mat.dispose();
 return root;
}

export function animateTack(t,dt){
 const rig=t.mesh.userData.tackRig;if(!rig)return;
 t.tackIdleTime=(t.tackIdleTime??t.id*.47)+dt;t.fireAnim=Math.max(0,(t.fireAnim||0)-dt);
 t.meteorAnim=Math.max(0,(t.meteorAnim||0)-dt);
 const idle=Math.sin(t.tackIdleTime*1.8),kick=Math.sin(Math.min(1,t.fireAnim/.24)*Math.PI),meteor=Math.sin(t.meteorAnim/.30*Math.PI);
 rig.housing.scale.set(1+idle*.003+kick*.015,1-idle*.003-kick*.025,1+idle*.003+kick*.015);
 rig.lid.position.copy(rig.lid.userData.rest);rig.lid.position.y+=idle*.006-kick*.025;
 for(const port of rig.ports){
  port.position.copy(port.userData.rest);
  const distance=idle*.006-kick*.095;
  port.position.x+=Math.sin(port.rotation.y)*distance;port.position.z+=Math.cos(port.rotation.y)*distance;
 }
 for(const flame of rig.flames){
  const flicker=Math.sin(t.tackIdleTime*6+flame.userData.phase),surge=kick*.20+meteor*.28;
  flame.scale.set(1+flicker*.06+surge*.25,1+flicker*.12+surge,1-flicker*.04+surge*.25);
  flame.rotation.z=Math.sin(t.tackIdleTime*3.2+flame.userData.phase)*.085;
 }
 if(rig.glow)rig.glow.emissiveIntensity=1.1+idle*.12+kick*.7+meteor*.8;
 const active=t.activeAbility?.kind==='maelstrom'&&t.abilityTimer>0,direction=active?(t.activeAbility.direction??1):1;
 const spin=(.65+kick*5+(active?13:0))*dt*direction;
 for(const blade of rig.blades||[])blade.rotation.z-=spin;
 if(rig.rotor){
  rig.rotor.rotation.y-=spin;rig.rotor.position.copy(rig.rotor.userData.rest);rig.rotor.position.y+=idle*.007+kick*.035+(active ? .06 : 0);
 }
 if(rig.vortex){rig.vortex.rotation.y-=dt*(active?5:1.1)*direction;rig.vortex.scale.setScalar(1+idle*.025+kick*.06);}
 if(rig.orbit){
  rig.orbit.rotation.y-=dt*(active?3.5:.20)*direction;
  for(const carrier of rig.satellites){const {angle,phase,height}=carrier.userData,radius=1.42+(active ? .10 : 0);carrier.position.set(Math.sin(angle)*radius,height+Math.sin(t.tackIdleTime*2+phase)*.035+(active ? .10 : 0),Math.cos(angle)*radius);}
 }
}

export function tackMuzzleOrigin(t,index){
 const port=t.mesh.userData.tackRig?.ports[index];if(!port)return null;
 port.updateWorldMatrix(true,false);return port.localToWorld(new THREE.Vector3(0,port.userData.muzzle ? .12 : 0,port.userData.muzzle??.47));
}

export function tackAbilityOrigin(t,angle){
 const rotor=t.mesh.userData.tackRig?.rotor;if(!rotor)return null;
 rotor.updateWorldMatrix(true,false);const center=rotor.getWorldPosition(new THREE.Vector3());
 return center.add(new THREE.Vector3(Math.cos(angle)*.95,.02,Math.sin(angle)*.95));
}
