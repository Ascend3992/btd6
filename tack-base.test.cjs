const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {game,enemy}=require('./helpers/game.cjs');

test('base Tack stats match the supplied values and enforce its six-unit footprint',()=>{
 const g=game(),t=g.createTower('tack',0,0);
 assert.equal(t.invest,260);assert.equal(t.rate,1.12);assert.equal(t.tacks,8);assert.equal(t.range,23*.32);
 assert.equal(t.pierce,1);assert.equal(t.damage,1);assert.equal(t.damageType,'Sharp');assert.equal(t.camoDetect,false);
 assert.equal(g.towerFootprintRadius('tack'),6*.32);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(towerDefs.tack.costByDifficulty)',g)),{easy:220,medium:260,hard:280,impoppable:310});
 g.towers.push(t);assert(g.towerFootprintsOverlap('tack',3.83,0));assert(!g.towerFootprintsOverlap('tack',3.85,0));
 assert(g.towerFootprintsOverlap('dart',3.11,0));assert(!g.towerFootprintsOverlap('dart',3.13,0));
});

test('base tacks pop regular bloons but cannot pop Lead, Frozen or Camo',()=>{
 const g=game(),t=g.createTower('tack',0,0);assert(g.towerCanDamage(t,enemy(4,'Black')));assert(g.towerCanDamage(t,enemy(4,'Purple')));
 assert(!g.towerCanDamage(t,enemy(4,'Lead')));assert(!g.towerCanDamage(t,enemy(4,'DDT')));
 const frozen=enemy(4),camo=enemy(4);frozen.freezeT=1;camo.camo=true;
 assert(!g.towerCanDamage(t,frozen));assert(!g.towerCanDamage(t,camo));
});

test('base Tack hits eligible bloons anywhere in its radius immediately, while flying tacks never deal damage',()=>{
 const g=game(),t=g.createTower('tack',0,0),targets=Array.from({length:9},(_,i)=>{const e=enemy(4),a=(i+.5)*Math.PI*2/9;e.mesh.position.set(Math.cos(a)*4,1.8,Math.sin(a)*4);return e;});
 const lead=enemy(3,'Lead'),frozen=enemy(3),camo=enemy(3),outside=enemy(t.range+.01);frozen.freezeT=1;camo.camo=true;
 g.enemies=[lead,frozen,camo,...targets,outside];g.towers.push(t);g.updateTowers(.01);
 assert.equal(targets.filter(e=>e.hp===9999).length,8);assert.equal(t.damageDealt,8);assert(g.projectiles.every(p=>p.cosmetic));assert.equal(g.projectiles.length,8);
 for(const e of [lead,frozen,camo,outside])assert.equal(e.hp,10000);
 const crossed=enemy(2);g.enemies.push(crossed);g.updateProjectiles(1);
 assert.equal(crossed.hp,10000);assert.equal(targets.filter(e=>e.hp===9999).length,8);assert.equal(t.damageDealt,8);assert.equal(g.projectiles.length,0);
});

test('radial Tack damage respects range, cooldown and the pause between rounds',()=>{
 const g=game(),t=g.createTower('tack',0,0),inside=enemy(t.range),outside=enemy(t.range+.01);g.towers.push(t);g.enemies=[inside,outside];
 g.roundActive=false;g.updateTowers(1);assert.equal(inside.hp,10000);assert.equal(g.projectiles.length,0);
 g.roundActive=true;g.updateTowers(.01);assert.equal(inside.hp,9999);assert.equal(outside.hp,10000);
 g.updateTowers(.5);assert.equal(inside.hp,9999);g.updateTowers(.621);assert.equal(inside.hp,9998);assert.equal(outside.hp,10000);
 g.roundActive=false;g.updateTowers(5);assert.equal(inside.hp,9998);
});
