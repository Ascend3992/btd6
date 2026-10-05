const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function top(g,t,n){for(let i=0;i<n;i++)upgrade(g,t,0);return t;}
function stats(t){return [t.rate,t.range,t.damage,t.pierce,t.tacks,t.bonusMoab,t.damageType];}

test('top Tack prices and exact supplied cooldown, damage, range and pierce values',()=>{
 const g=game(),t=g.createTower('tack',0,0),prices=[150,300,600,3500,45500];
 let invest=260;
 for(let i=0;i<5;i++){
  upgrade(g,t,0);invest+=prices[i];assert.equal(t.invest,invest);
  if(i<3){assert(Math.abs(t.rate-1.12*Math.pow(.75,Math.min(i+1,2)))<1e-10);assert.equal(t.damage,i===2?2:1);assert.equal(t.pierce,1);}
  if(i===3){assert.equal(t.rate,.315);assert.equal(t.damage,5);assert.equal(t.pierce,30);assert.equal(t.range,23*.32);}
  if(i===4){assert(t.rate<.315);assert.equal(t.damage,8);assert.equal(t.bonusMoab,4);assert.equal(t.pierce,45);assert.equal(t.range,35*.32);}
 }
});

test('Hot Shots pops Lead and Frozen; flame bursts cannot pop Purple or detect Camo',()=>{
 const g=game(),t=top(g,g.createTower('tack',0,0),3),frozen=enemy(4);frozen.freezeT=1;
 assert(g.towerCanDamage(t,enemy(4,'Lead')));assert(g.towerCanDamage(t,frozen));assert(g.towerCanDamage(t,enemy(4,'Purple')));
 for(const tier of [4,5]){
  upgrade(g,t,0);assert(!g.towerCanDamage(t,enemy(4,'Purple')));assert(g.towerCanDamage(t,enemy(4,'Lead')));assert(g.towerCanDamage(t,frozen));
  const camo=enemy(4);camo.camo=true;assert(!g.towerCanDamage(t,camo));
 }
});

test('Ring of Fire hits at most 30 eligible bloons inside its true range',()=>{
 const g=game(),t=top(g,g.createTower('tack',0,0),4),purple=enemy(4,'Purple'),camo=enemy(4);camo.camo=true;
 const targets=Array.from({length:45},()=>enemy(t.range-.01)),outside=enemy(t.range+.01);g.enemies=[purple,camo,...targets,outside];
 assert(g.fireTackFlameBurst(t));assert.equal(targets.filter(e=>e.hp===9995).length,30);assert.equal(t.damageDealt,150);
 assert.equal(purple.hp,10000);assert.equal(camo.hp,10000);assert.equal(outside.hp,10000);assert.equal(g.projectiles.length,0,'Area burst does not also launch damaging tacks');
});

test('Inferno flame damage distinguishes blimps and respects 45 pierce',()=>{
 const g=game(),t=top(g,g.createTower('tack',0,0),5),moab=enemy(4,'MOAB'),regular=Array.from({length:50},()=>enemy(4));g.enemies=[moab,...regular];
 g.fireTackFlameBurst(t);assert.equal(moab.hp,9988);assert.equal(regular.filter(e=>e.hp===9992).length,44);assert.equal(t.damageDealt,12+44*8);
});

test('top Tack crosspaths produce the same final stats in either purchase order',()=>{
 for(const tier of [3,4,5])for(const path of [1,2]){
  const g=game(),a=g.createTower('tack',0,0),b=g.createTower('tack',0,0);
  top(g,a,tier);upgrade(g,a,path);upgrade(g,a,path);upgrade(g,b,path);upgrade(g,b,path);top(g,b,tier);
  assert.deepEqual(stats(a),stats(b));
  if(tier>=4&&path===1)assert(a.pierce>(tier===4?30:45));
  if(tier>=4&&path===2)assert(a.damage>(tier===4?5:8));
 }
});

test('both speed tiers multiply Maelstrom intervals by 0.85 each, including active storms',()=>{
 for(const tier of [4,5]){
  const g=game(),t=g.createTower('tack',0,0);for(let i=0;i<tier;i++)upgrade(g,t,1);
  const baseTick=g.getTowerAbilities(t)[0].tick;
  for(let i=1;i<=2;i++){
   upgrade(g,t,0);const ability=g.getTowerAbilities(t)[0];assert(Math.abs(ability.tick-baseTick*Math.pow(.85,i))<1e-10);
   t.activeAbility=ability;t.abilityTimer=1;t.abilityTick=ability.tick;const before=g.projectiles.length;
   g.updateTowerAbility(t,ability.tick);assert.equal(g.projectiles.length,before+ability.waves);assert(Math.abs(t.abilityTick-ability.tick)<1e-10);
  }
 }
});

test('Hot Shot radial damage carries through child layers and visual tacks cannot damage again after an upgrade',()=>{
 const g=game(),t=top(g,g.createTower('tack',0,0),3),parent=enemy(3,'Blue',1),child=enemy(3,'Red',1);g.enemies.push(parent);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===parent?[child]:[]};
 g.fireTackRadialBurst(t);const p=g.projectiles.find(p=>Math.abs(p.vx-36)<1e-8);assert(p&&p.cosmetic);assert.equal(g.projectiles.length,8);assert(!parent.alive&&!child.alive);
 const newcomer=enemy(4);g.enemies.push(newcomer);upgrade(g,t,0);g.updateProjectiles(.08);assert.equal(newcomer.hp,10000);assert.equal(t.damageDealt,2);assert.equal(p.damage,2);assert.equal(p.tower.damage,2);
});

test('Inferno meteors fire independently, deal 700 impact damage, and burn at 50 per second',()=>{
 const g=game(),t=top(g,g.createTower('tack',0,0),5),target=enemy(30,'ZOMG'),near=enemy(31),outside=enemy(37);t.target='strong';g.enemies=[target,near,outside];
 g.updateInfernoMeteor(t,.01);assert.equal(g.projectiles.length,1);const p=g.projectiles[0];assert.equal(p.damage,700);assert.equal(p.target,target);assert.equal(p.tower.damageType,'Normal');
 g.updateInfernoMeteor(t,.5);assert.equal(g.projectiles.length,1,'Meteor cooldown is independent of fast flame attacks');
 g.updateProjectiles(2);assert.equal(target.hp,9250);assert.equal(near.hp,9950);assert.equal(outside.hp,10000);assert.equal(target.burns[0].damage,50);
 g.tickDominationBurns(target,.5);assert.equal(target.hp,9250);g.tickDominationBurns(target,.5);assert.equal(target.hp,9200);
 assert.equal(t.damageDealt,850);g.tickDominationBurns(target,10);assert.equal(target.hp,9000);assert.equal(target.burns.length,0);
});

test('Inferno burns survive child-layer splits and meteors do not detect Camo',()=>{
 const g=game(),t=top(g,g.createTower('tack',0,0),5),camo=enemy(30,'ZOMG');camo.camo=true;g.enemies.push(camo);
 g.updateInfernoMeteor(t,.1);assert.equal(g.projectiles.length,0);
 const parent=enemy(4,'Blue',1),child=enemy(4,'Red',100);g.addInfernoBurn(parent,t);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;child.burns=e.burns.map(b=>({...b}));return [child]};
 g.damageTackFamily({tower:{...t,sourceTower:t,damage:1},hitEnemies:new Set()},parent,1);g.tickDominationBurns(child,1);assert.equal(child.hp,50);assert.equal(t.damageDealt,51);
});
