const {test}=require('node:test'),assert=require('node:assert/strict');
const {game,enemy}=require('./helpers/game.cjs');
function setup(type='dart'){const g=game(),m=g.createTower('mib',0,0),t=g.createTower(type,4,0);g.towers.push(m,t);return {g,m,t};}
test('MIB enables every attacker against all materials, Camo, Frozen and blimps without changing attack stats',()=>{
 for(const type of ['dart','boomer','bomb','tack','ice','glue','hero']){
  const {g,t}=setup(type),before=JSON.stringify([t.damage,t.range,t.rate,t.pierce,t.camoDetect,t.damageType]);
  for(const name of ['Red','Black','White','Purple','Lead','Zebra','Ceramic','MOAB','BFB','ZOMG','DDT','BAD']){const e=enemy(6,name);e.camo=true;e.freezeT=1;assert(g.towerCanDamage(t,e),`${type} cannot hit ${name}`);}
  assert.equal(JSON.stringify([t.damage,t.range,t.rate,t.pierce,t.camoDetect,t.damageType]),before);
 }
 const {g,t}=setup();const lead=enemy(6,'Lead');g.enemies.push(lead);g.fireProjectile(t,lead);for(let i=0;i<100;i++)g.updateProjectiles(.02);assert.equal(lead.hp,9999,'real Sharp projectile damages Lead');assert.equal(t.damageDealt,1);
});
test('MIB radius uses source tower position, includes its edge, and disappears immediately when removed',()=>{
 const {g,m,t}=setup(),e=enemy(100,'DDT');e.camo=true;
 assert.equal(m.range,8);t.x=8;assert(g.towerCanDamage(t,e));t.x=8.001;assert(!g.towerCanDamage(t,e));t.x=4;
 assert(g.towerCanDamage({type:'iceShard',sourceTower:t,x:100,z:100,damageType:'Sharp'},e));g.enemies.push(e);assert.equal(g.chooseTarget(t),null,'aura does not extend attack range');
 const m2=g.createTower('mib',0,0);g.towers.push(m2);g.towers.splice(g.towers.indexOf(m),1);assert(g.towerCanDamage(t,e));g.towers.splice(g.towers.indexOf(m2),1);assert(!g.towerCanDamage(t,e));assert.equal(t.camoDetect,false);
});
test('MIB is free in every mode and never fires; existing freeze and zero-damage glue mechanics remain',()=>{
 const {g,m}=setup();for(const [key,variant] of [['easy','standard'],['medium','standard'],['hard','standard'],['hard','impoppable'],['hard','chimps'],['hard','half-cash'],['easy','deflation'],['easy','sandbox']]){g.setDifficultyForTest(key,false,variant);assert.equal(g.createTower('mib',0,0).invest,0);}
 g.setDifficultyForTest('medium');g.towers.splice(1);const e=enemy(2,'BAD');g.enemies.push(e);g.updateTowers(.5);assert.equal(g.projectiles.length,0);assert.equal(m.damageDealt,0);assert(!g.towerCanDamage(m,e));
 const ice=g.createTower('ice',4,0);g.towers.push(ice);g.hitEnemy(e,ice.damage,{tower:ice,freeze:ice.freeze});assert.equal(e.hp,9999);assert(!e.freezeT,'MIB does not invent blimp freezing');
 const glue=g.createTower('glue',4,0);g.towers.push(glue);e.camo=true;g.hitGlueTarget(glue,e);assert.equal(e.hp,9999);assert(e.glueCoatings.length>0);assert.equal(e.glueCoatings[0].camoDetect,true);
});
test('MIB model has two dishes, orange windows and a stable building with only the radar rotating',async()=>{
 const {makeMIBTowerMesh,animateMIB}=await import('../mib-visuals.js'),{Box3,Vector3}=await import('../assets/vendor/three.module.js');const mesh=makeMIBTowerMesh(),t={mesh};mesh.position.set(4,.66,3);const building=mesh.getObjectByName('blue-office'),position=building.position.clone(),anchor=mesh.position.clone(),rotor=mesh.userData.mibRig.rotor;
 assert.equal(rotor.children.filter(c=>c.name==='radar-dish').length,2);assert(mesh.getObjectByName('orange-front-window'));assert(mesh.getObjectByName('mast-x-brace'));
 const size=new Box3().setFromObject(mesh).getSize(new Vector3());assert(size.y>4&&size.y<6&&size.x<4);animateMIB(t,.5);assert.equal(rotor.rotation.y,.35);animateMIB(t,0);assert.equal(rotor.rotation.y,.35);assert(building.position.equals(position));assert(mesh.position.equals(anchor));
 const second=makeMIBTowerMesh();building.material.opacity=.2;assert.equal(second.getObjectByName('blue-office').material.opacity,1,'placement preview materials are independent');
});
