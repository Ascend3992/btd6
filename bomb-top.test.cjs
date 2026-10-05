const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function top(g,t,tier){while(t.paths[0]<tier)upgrade(g,t,0)}
function close(a,b){assert(Math.abs(a-b)<1e-9,`${a} != ${b}`)}
function shoot(g,t,target,others=[]){g.enemies=[target,...others];g.fireProjectile(t,target);g.updateProjectiles(2)}

test('top tiers apply supplied Medium prices, damage, pierce, blast and range',()=>{
 const g=game(),t=g.createTower('bomb',0,0);
 const prices=[250,650,1100,2800,55000],damage=[1,2,4,4,24],pierce=[28,38,80,80,80],radius=[18,18,27,27,27];
 let invest=600;
 for(let i=0;i<5;i++){
  upgrade(g,t,0);invest+=prices[i];assert.equal(t.invest,invest);
  assert.equal(t.damage,damage[i]);assert.equal(t.pierce,pierce[i]);close(t.splash,radius[i]*.32);
  close(t.range,(i>=3?43:40)*.32);assert.equal(t.rate,1.5);
 }
});

test('Really Big Bombs push every eligible regular target back exactly 20 units',()=>{
 const g=game(),t=g.createTower('bomb',0,0);top(g,t,3);
 const target=enemy(30),near=enemy(30+26.9*.32),outside=enemy(30+27.1*.32),black=enemy(30,'Black'),moab=enemy(31,'MOAB');
 shoot(g,t,target,[near,outside,black,moab]);
 for(const e of [target,near]){assert.equal(e.hp,9996);close(g.progress(e),e===target?30-20*.32:30+26.9*.32-20*.32);}
 assert.equal(outside.hp,10000);assert.equal(black.hp,10000);
 assert.equal(moab.hp,9996);assert.equal(g.progress(moab),31);assert(!moab.bombStunT);
});

test('Impact stuns regular bloons for 1.4 seconds without giving Ice freeze properties',()=>{
 const g=game(),t=g.createTower('bomb',0,0);top(g,t,4);
 const target=enemy(30),near=enemy(31),moab=enemy(32,'MOAB');shoot(g,t,target,[near,moab]);
 for(const e of [target,near]){
  assert.equal(e.bombStunT,1.4);assert.equal(e.freezeT,undefined);
  assert.equal(g.bombStunMotionDt(e,1),0);close(g.bombStunMotionDt(e,.6),.2);assert.equal(e.bombStunT,0);
 }
 assert(!moab.bombStunT);assert.equal(g.progress(moab),32);
});

test('Crush damages Black/Zebra and stuns/knocks back blimps but BADs resist control',()=>{
 const g=game(),t=g.createTower('bomb',0,0);top(g,t,5);t.camoDetect=true;
 const targets=['Red','Black','Zebra','MOAB','BFB','ZOMG','DDT','BAD'].map(type=>enemy(30,type));
 shoot(g,t,targets[0],targets.slice(1));
 for(const e of targets){
  assert.equal(e.hp,9976);
  if(e.type==='BAD'){assert(!e.bombStunT);assert.equal(g.progress(e),30);}
  else {assert.equal(e.bombStunT,2);close(g.progress(e),30-(e.isBlimp?5:20)*.32);}
 }
 const camo=enemy(30,'DDT');camo.camo=true;
 assert(!g.towerCanDamage({...t,camoDetect:false},camo),'Crush still needs Camo assistance');
});

test('stun refreshes and movement resumes only after the final fraction expires',()=>{
 const g=game(),t=g.createTower('bomb',0,0);top(g,t,4);const e=enemy(30);
 g.applyBombControl(t,e);assert.equal(g.bombStunMotionDt(e,.8),0);
 g.applyBombControl(t,e);assert.equal(e.bombStunT,1.4);
 assert.equal(g.bombStunMotionDt(e,1.2),0);close(g.bombStunMotionDt(e,.5),.3);
 const bad=enemy(30,'BAD');bad.bombStunT=2;assert.equal(g.bombStunMotionDt(bad,.5),.5);
});

test('crosspath order yields identical stats for every legal top-tier crosspath',()=>{
 for(let tier=1;tier<=5;tier++)for(const path of [1,2]){
  const g=game(),first=g.createTower('bomb',0,0),last=g.createTower('bomb',0,0);
  for(let i=0;i<2;i++)upgrade(g,first,path);top(g,first,tier);
  top(g,last,tier);for(let i=0;i<2;i++)upgrade(g,last,path);
  for(const key of ['damage','pierce','splash','range','rate','bonusMoab','stun','damageType','bombKnockback','bombMoabKnockback','invest'])assert.equal(first[key],last[key],`${tier},${path},${key}`);
 }
});

test('explosion hits 80 targets at most, using its original center before knockback',()=>{
 const g=game(),t=g.createTower('bomb',0,0);top(g,t,3);
 const targets=Array.from({length:85},()=>enemy(30));shoot(g,t,targets[0],targets.slice(1));
 assert.equal(targets.filter(e=>e.hp===9996).length,80);assert.equal(t.damageDealt,320);
});

test('Heavy Bombs damage carries through children while explosion immunity stops overflow',()=>{
 const g=game(),t=g.createTower('bomb',0,0);top(g,t,2);
 const blue=enemy(20,'Blue',1),red=enemy(20,'Red',1);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===blue?[red]:[]};shoot(g,t,blue);
 assert(!blue.alive);assert(!red.alive);assert.equal(t.damageDealt,2);
 const lead=enemy(20,'Lead',1),black=enemy(20,'Black',1);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===lead?[black]:[]};shoot(g,t,lead);
 assert(!lead.alive);assert(black.alive);assert.equal(black.hp,1);
});

test('in-flight bombs retain launch stats and credit damage to the purchased tower',()=>{
 const g=game(),t=g.createTower('bomb',0,0),target=enemy(30);
 g.enemies=[target];g.fireProjectile(t,target);top(g,t,5);g.updateProjectiles(2);
 assert.equal(target.hp,9999);assert.equal(t.damageDealt,1);assert(!target.bombStunT);
});

test('Frag Bombs start at the explosion center and improve with each specified top tier',()=>{
 const g=game(),t=g.createTower('bomb',0,0);
 upgrade(g,t,2);upgrade(g,t,2);
 const base={...t.fragStats};top(g,t,3);const big={...t.fragStats};
 for(const key of ['damage','pierce','count','life'])assert(big[key]>base[key],key);
 top(g,t,4);const impact={...t.fragStats};
 for(const key of ['pierce','count','life'])assert(impact[key]>big[key],key);
 top(g,t,5);assert(t.fragStats.damage>impact.damage);assert(t.fragStats.pierce>impact.pierce);
 const target=enemy(30);shoot(g,t,target);
 assert.equal(g.projectiles.length,t.fragStats.count);
 for(const p of g.projectiles){assert.equal(p.mesh.position.x,30);assert.equal(p.mesh.position.z,0);assert.equal(p.tower.sourceTower,t);assert.equal(p.cosmetic,false);assert.equal(p.mode,'linear');}
});

test('fragments damage Black but respect Lead immunity, pierce and lifespan without crowd control',()=>{
 const g=game(),t=g.createTower('bomb',0,0);upgrade(g,t,2);upgrade(g,t,2);top(g,t,3);
 const black=enemy(21,'Black'),lead=enemy(22,'Lead'),red=enemy(23),blue=enemy(24,'Blue'),beyond=enemy(30);
 g.enemies=[black,lead,red,blue,beyond];
 g.spawnBombFragments({tower:t},{x:20,z:0});g.updateProjectiles(1);
 for(const e of [black,red,blue]){assert.equal(e.hp,10000-t.fragStats.damage);assert(!e.bombStunT);assert.equal(g.progress(e),e===black?21:e===red?23:24);}
 assert.equal(lead.hp,10000);assert.equal(beyond.hp,10000);
 assert.equal(t.damageDealt,3*t.fragStats.damage);assert.equal(g.projectiles.length,0);
});
