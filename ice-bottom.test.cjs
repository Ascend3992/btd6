const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function ice(g,tier,top=0,middle=0){const t=g.createTower('ice',0,0);for(let i=0;i<tier;i++)upgrade(g,t,2);for(let i=0;i<top;i++)upgrade(g,t,0);for(let i=0;i<middle;i++)upgrade(g,t,1);return t;}
function pile(g,t,host){host.freezeT=1.2;host.icicles={remaining:2,pierceLeft:3,hitEnemies:new Set(),attack:{type:'iceIcicle',damageType:'Sharp',camoDetect:t.camoDetect,sourceTower:t}};return host.icicles;}

test('bottom prices, XP, range, blast, damage and freeze match the supplied table',()=>{
 const g=game();assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(iceBottomUpgradeMetadata)',g)),[
  {prices:[125,150,160,180],xp:160},{prices:[170,200,215,240],xp:500},{prices:[1615,1900,2050,2280],xp:2500},{prices:[2335,2750,2970,3300],xp:9000},{prices:[25500,30000,32400,36000],xp:30000}]);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(upgradeData.ice[2])',g)),[['Larger Radius',150],['Re-Freeze',200],['Cryo Cannon',1900],['Icicles',2750],['Icicle Impale',30000]]);
 for(let tier=1;tier<=5;tier++){
  const t=ice(g,tier);assert.equal(t.range,(tier>=3?46:32)*.32);assert.equal(t.pierce,40);assert.equal(t.freeze,tier>=3?1.2:1.5);assert.equal(t.damage,tier>=4?2:1);
  assert.equal(t.bonusMoab,tier===5?48:tier===4?8:0);assert.equal(t.refreeze,tier>=2);assert.equal(t.splash,tier>=3?20*.32:0);assert.equal(t.canHitBlimps,tier>=4);assert.equal(t.camoDetect,false);
  if(tier<=2)assert.equal(t.rate,2.4);
 }
 assert(ice(g,3).rate<ice(g,2).rate);assert(ice(g,4).rate<ice(g,3).rate);
});

test('Re-Freeze can target and refresh native and ability-frozen bloons without a speed bonus',()=>{
 const g=game(),base=ice(g,1),refreeze=ice(g,2),e=enemy(3,'Ceramic',10);e.freezeT=.25;
 assert.equal(g.towerCanDamage(base,e),false);assert.equal(g.towerCanDamage(refreeze,e),true);
 g.hitEnemy(e,1,{tower:refreeze,freeze:refreeze.freeze});assert.equal(e.hp,9);assert.equal(e.freezeT,1.5);
 e.freezeT=0;e.abilityFreezeT=.3;assert.equal(g.towerCanDamage(base,e),false);assert.equal(g.towerCanDamage(refreeze,e),true);assert.equal(refreeze.rate,base.rate);
});

test('Cryo flies before damaging and its 20-unit blast hits at most forty eligible bloons',()=>{
 const g=game(),t=ice(g,3),targets=Array.from({length:41},()=>enemy(10,'Ceramic',10));
 const immune=['Lead','White','Zebra','MOAB'].map(type=>enemy(10,type,100)),outside=enemy(10+t.splash+.001,'Ceramic',10),camo=enemy(10,'Ceramic',10);camo.camo=true;
 g.enemies=[...immune,camo,...targets,outside];g.towers.push(t);g.updateTowers(.01);
 assert.equal(g.projectiles.length,1);assert.equal(g.projectiles[0].mode,'iceBomb');assert(targets.every(e=>e.hp===10));
 g.updateProjectiles(.4);assert.equal(g.projectiles.length,0);assert.equal(targets.filter(e=>e.hp===9).length,40);assert(targets.slice(0,40).every(e=>e.freezeT===1.2));
 for(const e of [...immune,camo,targets[40],outside])assert.equal(e.hp,e.isBlimp?100:immune.includes(e)?100:10);
 assert.equal(t.damageDealt,40);
});

test('snowball snapshots survive an upgrade and explode at the last known point after target death',()=>{
 const g=game(),t=ice(g,3),target=enemy(10,'Blue',1),child=enemy(10,'Ceramic',10);g.fireIceProjectile(t,target);upgrade(g,t,2);
 target.alive=false;g.enemies=[child];g.updateProjectiles(.4);assert.equal(child.hp,9);assert.equal(child.freezeT,1.2);assert.equal(t.damageDealt,1);
});

test('Icicles does ten blimp damage without slowing; Impale does fifty and freezes eligible blimps',()=>{
 for(const tier of [3,4,5]){
  const g=game(),t=ice(g,tier),moab=enemy(5,'MOAB',200),bad=enemy(5,'BAD',200),ddt=enemy(5,'DDT',200);ddt.camo=true;
  g.enemies=[moab,bad,ddt];assert.equal(g.towerCanDamage(t,ddt),false);
  g.fireIceProjectile(t,moab);g.updateProjectiles(.3);
  const damage=tier===5?50:tier===4?10:0;assert.equal(moab.hp,200-damage);assert.equal(bad.hp,200-damage);assert.equal(ddt.hp,200);
  assert.equal(moab.freezeT||0,tier===5?t.blimpFreeze:0);assert.equal(bad.freezeT||0,0);assert.equal(moab.slowT||0,0);assert.equal(moab.icicles,undefined);
  if(tier>=4){upgrade(g,t,0);upgrade(g,t,0);assert.equal(g.towerCanDamage(t,ddt),true);g.fireIceProjectile(t,ddt);g.updateProjectiles(.3);assert.equal(ddt.hp,200-damage);assert.equal(ddt.freezeT||0,tier===5?t.blimpFreeze:0);}
 }
});

test('blimp bonus cannot wash into regular children and credit stays with the firing tower',()=>{
 const g=game(),t=ice(g,5),parent=enemy(5,'MOAB',1),child=enemy(5,'Ceramic',20);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===parent?[child]:[]};g.enemies=[parent];g.fireIceProjectile(t,parent);g.updateProjectiles(.3);
 assert.equal(child.hp,18);assert.equal(child.freezeT,1.2);assert.equal(t.damageDealt,3);
});

test('icicle contacts deal three damage to three non-frozen targets, once each, for two seconds',()=>{
 const g=game(),t=ice(g,4),host=enemy(5,'Ceramic',10),targets=Array.from({length:4},()=>enemy(5.5,'Ceramic',10)),frozen=enemy(5.5,'Ceramic',10),lead=enemy(5.5,'Lead',10);frozen.freezeT=1;
 let cleared=0;g.clearIcicles=()=>cleared++;pile(g,t,host);g.enemies=[host,frozen,lead,...targets];g.updateIcicleContacts(.1);
 assert.equal(targets.filter(e=>e.hp===7).length,3);assert.equal(frozen.hp,10);assert.equal(lead.hp,10);assert.equal(t.damageDealt,9);assert.equal(host.icicles,null);assert.equal(cleared,1);
 const fresh=enemy(20,'Ceramic',10);pile(g,t,host);g.enemies=[host,fresh];g.updateIcicleContacts(1.9);assert(host.icicles);fresh.mesh.position.x=5.5;g.updateIcicleContacts(.11);assert.equal(fresh.hp,7);assert.equal(host.icicles,null);
 fresh.hp=10;g.updateIcicleContacts(.1);assert.equal(fresh.hp,10);
});

test('swept icicle contacts catch fast crossings and carry layer damage without spending extra contacts',()=>{
 const g=game(),t=ice(g,4),host=enemy(5,'Ceramic',10),parent=enemy(10,'Blue',1),child=enemy(10,'Red',10);
 parent.previousX=0;parent.previousZ=0;const state=pile(g,t,host);g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===parent?[child]:[]};g.enemies=[host,parent];g.updateIcicleContacts(.1);
 assert.equal(parent.alive,false);assert.equal(child.hp,8);assert.equal(state.pierceLeft,2);assert.equal(t.damageDealt,3);assert(state.hitEnemies.has(child));
 child.mesh.position.x=5;child.previousX=5;g.enemies.push(child);g.updateIcicleContacts(.1);assert.equal(child.hp,8);
});

test('bottom crosspaths recompute identically in either purchase order',()=>{
 for(const path of [0,1]){
  const g=game(),a=ice(g,5,path===0?2:0,path===1?2:0),b=ice(g,0,path===0?2:0,path===1?2:0);for(let i=0;i<5;i++)upgrade(g,b,2);
  for(const key of ['range','rate','pierce','freeze','freezeLayers','damage','bonusMoab','refreeze','camoDetect'])assert.equal(a[key],b[key],key);
  if(path===1){assert.equal(a.pierce,45);assert.equal(a.freeze,1.9);assert.equal(a.freezeLayers,2);}else assert.equal(a.camoDetect,true);
 }
});
