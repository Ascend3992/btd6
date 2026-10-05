const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function path(g,t,p,n){for(let i=0;i<n;i++)upgrade(g,t,p);return t;}
function values(t){return [t.rate,t.damage,t.range,t.pierce,t.tacks,t.bonusMoab,t.damageType];}

test('bottom Tack costs, volley counts, pierce and attack intervals follow the supplied table',()=>{
 const g=game(),t=g.createTower('tack',0,0),costs=[110,110,450,3200,20000],counts=[10,12,16,16,32];let invest=260;
 for(let i=0;i<5;i++){
  upgrade(g,t,2);invest+=costs[i];assert.equal(t.invest,invest);assert.equal(t.tacks,counts[i]);assert.equal(t.pierce,i>=2?2:1);assert.equal(t.damage,1);
  assert(Math.abs(t.rate-(i===4?1.12/3*.6:i===3?1.12/3:1.12))<1e-10);assert.equal(t.range,(i===4?30:23)*.32);
  g.projectiles.length=0;const targets=Array.from({length:counts[i]+1},()=>enemy(4));g.enemies=targets;
  g.fireTackRadialBurst(t);assert.equal(targets.filter(e=>e.hp===9999).length,counts[i]);assert.equal(g.projectiles.length,counts[i]);assert(g.projectiles.every(p=>p.cosmetic&&p.pierceLeft===t.pierce));
 }
});

test('Tack Sprayer hits sixteen nearby bloons per radial volley without duplicate projectile damage',()=>{
 const g=game(),t=path(g,g.createTower('tack',0,0),2,3),targets=Array.from({length:17},()=>enemy(4));g.enemies=targets;
 assert(g.fireTackRadialBurst(t));assert.equal(targets.filter(e=>e.hp===9999).length,16);assert.equal(t.damageDealt,16);
 g.updateProjectiles(.15);assert.equal(targets.filter(e=>e.hp===9999).length,16);assert.equal(t.damageDealt,16);
});

test('Tack Zone adds damage only against blimps and its bonus does not carry into regular child layers',()=>{
 const g=game(),t=path(g,g.createTower('tack',0,0),2,5),moab=enemy(3,'MOAB'),regular=enemy(5);g.enemies=[moab,regular];
 g.fireTackRadialBurst(t);g.updateProjectiles(.15);assert(t.bonusMoab>0);assert.equal(moab.hp,10000-1-t.bonusMoab);assert.equal(regular.hp,9999);assert.equal(t.damageDealt,2+t.bonusMoab);
 const dying=enemy(3,'MOAB',1),child=enemy(3,'Ceramic',10);g.enemies=[dying];g.projectiles.length=0;
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===dying?[child]:[]};g.fireTackRadialBurst(t);g.updateProjectiles(.08);assert.equal(child.hp,9);
});

test('bottom speed tiers honor top speed crosspaths and catch up volleys during a long frame',()=>{
 const g=game(),t=path(g,path(g,g.createTower('tack',0,0),2,5),0,2);g.towers.push(t);g.enemies.push(enemy(4,'MOAB'));
 assert(Math.abs(t.rate-1.12/3*.6*.75*.75)<1e-10);g.updateTowers(.5);assert.equal(g.projectiles.length,32*4);assert.equal(g.enemies[0].hp,10000-4*(t.damage+t.bonusMoab));
});

test('More Tacks gives exact Ring of Fire damage instead of more projectiles in either upgrade order',()=>{
 for(const n of [1,2]){
  const g=game(),a=path(g,path(g,g.createTower('tack',0,0),0,4),2,n),b=path(g,path(g,g.createTower('tack',0,0),2,n),0,4);
  assert.deepEqual(values(a),values(b));assert.equal(a.damage,5+n);assert.equal(a.tacks,0);
  const e=enemy(4);g.enemies=[e];g.fireTackFlameBurst(a);assert.equal(e.hp,10000-5-n);assert.equal(g.projectiles.length,0);
 }
});

test('bottom Maelstrom crosspaths change the correct durations and reverse only Blade Maelstrom',()=>{
 for(const tier of [4,5])for(const n of [0,1,2]){
  const g=game(),t=path(g,path(g,g.createTower('tack',0,0),1,tier),2,n),ability=g.getTowerAbilities(t)[0];
  assert.equal(ability.duration,(tier===4?3:9)+n*(tier===4?.5:1.5));assert.equal(ability.direction,tier===4&&n>=1?-1:1);
  g.emitMaelstrom(t,ability);assert.equal(Math.sign(t.abilityAngle),ability.direction);assert.equal(g.projectiles.length,tier===4?2:4);
  t.activeAbility=ability;t.abilityTimer=ability.duration;t.abilityTick=ability.tick;g.updateTowerAbility(t,ability.duration-.1);assert(t.abilityTimer>0);g.updateTowerAbility(t,.2);assert.equal(t.abilityTimer,0);assert.equal(t.activeAbility,null);
 }
});

test('buying bottom crosspaths during an active Maelstrom preserves elapsed time and extends the storm once per tier',()=>{
 for(const tier of [4,5]){
  const g=game(),t=path(g,g.createTower('tack',0,0),1,tier),ability=g.getTowerAbilities(t)[0];t.activeAbility=ability;t.abilityTimer=ability.duration-1;
  upgrade(g,t,2);assert.equal(t.abilityTimer,ability.duration-1);assert.equal(ability.duration,(tier===4?3:9)+(tier===4?.5:1.5));
  upgrade(g,t,2);assert.equal(t.abilityTimer,(tier===4?3:9)+2*(tier===4?.5:1.5)-1);
  const before=t.abilityTimer;upgrade(g,t,0);assert.equal(t.abilityTimer,before,'Unrelated upgrades do not reapply the extension');
  assert.equal(ability.direction,tier===4?-1:1);
 }
});

test('bottom crosspath stats and Maelstrom bonuses remain independent of purchase order',()=>{
 for(const [p,tier] of [[0,2],[1,2],[1,4],[1,5]]){
  const g=game(),a=g.createTower('tack',0,0),b=g.createTower('tack',0,0);
  path(g,a,2,p===1&&tier>=4?2:5);path(g,a,p,tier);path(g,b,p,tier);path(g,b,2,p===1&&tier>=4?2:5);assert.deepEqual(values(a),values(b));
  if(p===1&&tier>=4){assert.equal(g.getTowerAbilities(a)[0].duration,g.getTowerAbilities(b)[0].duration);assert.equal(g.getTowerAbilities(a)[0].direction,g.getTowerAbilities(b)[0].direction);}
 }
});
