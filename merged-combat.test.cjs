const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');

test('blimp layer pays exactly $1, regular damage retains round scaling and counts cap at HP',()=>{
 for(const round of [1,55,65]){
  const g=game(),t=g.createTower('dart',0,0),moab=enemy(5,'MOAB',200);g.round=round;
  g.hitEnemy(moab,199,{tower:t});assert.equal(g.cash,0);assert.equal(t.damageDealt,199);
  g.hitEnemy(moab,1000,{tower:t});assert.equal(g.cash,1);assert.equal(t.damageDealt,200);
  const regular=enemy(5);g.hitEnemy(regular,3,{tower:t});
  assert(Math.abs(g.cash-(1+3*(round>60?.2:round>50?.5:1)))<1e-10);assert.equal(t.damageDealt,203);
 }
});

test('Dart family damage credits the original tower and preserves child overflow',()=>{
 const g=game(),t=g.createTower('dart',0,0);for(let i=0;i<5;i++)upgrade(g,t,0);
 const moab=enemy(5,'MOAB',200),children=Array.from({length:4},()=>enemy(5,'Ceramic',10));
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===moab?children:[]};
 const p={tower:{...t,sourceTower:t},hitEnemies:new Set(),knockbackDuration:.15,knockbackMult:1};
 g.damageBallFamily(p,moab,201);
 assert.equal(t.damageDealt,204);assert.equal(p.tower.damageDealt,0);assert.equal(g.cash,5);
 assert(children.every(child=>child.hp===9&&child.knockbackT===.15));
 assert.equal(moab.knockbackT,undefined);
});

test('Ultra Juggernaut knocks back light bloons 6x and heavy bloons 2x, excluding every blimp class',()=>{
 const g=game(),t=g.createTower('dart',0,0);for(let i=0;i<5;i++)upgrade(g,t,0);
 const p={tower:t,hitEnemies:new Set(),knockbackDuration:.15,knockbackMult:1};
 for(const [type,fort,multiplier] of [['Red',false,6],['Ceramic',false,2],['Lead',false,2],['Blue',true,2]]){
  const e=enemy(5,type);e.fort=fort;const speed=g.enemySpeed(e);g.damageBallFamily(p,e,1);
  assert.equal(e.knockbackT,.15);assert.equal(e.knockbackSpeed,speed*multiplier);
  e.knockbackT=.02;g.damageBallFamily(p,e,1);assert.equal(e.knockbackT,.15,'Re-hits refresh knockback');
 }
 for(const type of ['MOAB','BFB','ZOMG','DDT','BAD']){
  const e=enemy(5,type);g.damageBallFamily(p,e,1);assert.equal(e.knockbackT,undefined);assert.equal(e.knockbackSpeed,undefined);
 }
});

test('Triple Shot uses accurate projectiles and retargets surviving darts after a pop',()=>{
 const g=game(),t=g.createTower('dart',0,0);for(let i=0;i<3;i++)upgrade(g,t,1);
 const first=enemy(3,'Red',1),next=enemy(8,'Green',100);g.enemies=[first,next];
 for(let i=0;i<3;i++)g.fireProjectile(t,first,t.damage,{visualSpread:(i-1)*.18});
 assert(g.projectiles.every(p=>p.mode==='homing'));
 g.updateProjectiles(1);assert.equal(first.alive,false);assert.equal(next.hp,98);assert.equal(t.damageDealt,3);
});

test('restored Crossbow Master stats and critical shots survive the Boomerang merge',()=>{
 const g=game(),t=g.createTower('dart',0,0);for(let i=0;i<5;i++)upgrade(g,t,2);
 assert.equal(t.damage,8);assert.equal(t.pierce,8);assert.equal(t.range,80*.32);assert.equal(t.rate,.2375);assert(t.camoDetect);
 const target=enemy(5),damages=[];for(let i=0;i<5;i++){g.fireProjectile(t,target);damages.push(g.projectiles.pop().damage)}
 assert.deepEqual(damages,[8,8,8,8,80]);assert.equal(t.critShotCounter,5);
});

test('each tower type/path allows one Tier 5 and selling releases the restriction',()=>{
 const g=game(),one=g.createTower('boomer',0,0),two=g.createTower('boomer',4,0),dart=g.createTower('dart',8,0);
 one.paths=[5,0,0];two.paths=[4,0,0];dart.paths=[4,0,0];g.towers.push(one,two,dart);
 assert(g.tierFiveTaken(two,0));assert(!g.tierFiveTaken(dart,0));
 two.paths=[0,4,0];assert(!g.tierFiveTaken(two,1));two.paths=[4,0,0];
 g.towers.splice(g.towers.indexOf(one),1);assert(!g.tierFiveTaken(two,0));
});
