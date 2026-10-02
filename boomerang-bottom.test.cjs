const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function bottom(g,t,tier){while(t.paths[2]<tier)upgrade(g,t,2)}
function top(g,t,tier){while(t.paths[0]<tier)upgrade(g,t,0)}
function close(actual,expected){assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`)}

test('Long Range Rangs adds 14.19 range and widens curved throws',()=>{
 const g=game(),t=g.createTower('boomer',0,0),e=enemy(5);g.fireProjectile(t,e);const before=g.projectiles.pop();
 upgrade(g,t,2);close(t.range,57.19*.32);g.fireProjectile(t,e);const after=g.projectiles.pop();assert(after.arcRadius>before.arcRadius);
});

test('Kylies fly straight, re-hit on return, finish at the tower and cap pierce',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,3);const e=enemy(5);g.enemies=[e];g.fireProjectile(t,e);const p=g.projectiles.pop();
 assert.equal(p.mode,'kylie');assert.equal(p.pierceLeft,18);g.updateKylieProjectile(p,2);
 assert(p.dead);close(p.mesh.position.x,0);close(p.mesh.position.z,0);assert.equal(e.hp,9996);assert.equal(t.damageDealt,4);assert.equal(p.pierceLeft,16);
 g.enemies=Array.from({length:30},(_,i)=>enemy((i+1)*.5));g.fireProjectile(t,g.enemies[0]);const capped=g.projectiles.pop();g.updateKylieProjectile(capped,2);assert.equal(capped.pierceLeft,0);assert(capped.dead);
});

test('Kylie 0.3s and special 0.1s re-hit cooldowns prevent repeated frame hits',()=>{
 for(const [special,before,after] of [[false,.29,.09],[true,.09,.06]]){
  const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,4);const e=enemy(.1);g.enemies=[e];g.fireKylieProjectile(t,e,{special});const p=g.projectiles.pop();p.speed=1;p.range=100;
  g.updateKylieProjectile(p,before);const damage=special?1:2;assert.equal(e.hp,10000-damage);
  g.updateKylieProjectile(p,after);assert.equal(e.hp,10000-damage*2);
 }
});

test('main Kylies never knock blimps back; special throws do and exclude BADs',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,4);const moab=enemy(5,'MOAB');g.enemies=[moab];
 g.fireProjectile(t,moab);g.updateKylieProjectile(g.projectiles.pop(),.17);assert.equal(moab.hp,9998);close(moab.dist,5);assert.equal(g.cash,0);
 g.fireKylieProjectile(t,moab,{special:true});g.updateKylieProjectile(g.projectiles.pop(),.17);assert.equal(moab.hp,9993);close(moab.dist,5-3*.32);assert.equal(g.cash,0);
 const bad=enemy(5,'BAD');g.enemies=[bad];g.fireKylieProjectile(t,bad,{special:true});g.updateKylieProjectile(g.projectiles.pop(),.17);assert.equal(bad.hp,9995);close(bad.dist,5);
});

test('Press has an independent cooldown and targets blimps with the chosen priority',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,4);const red=enemy(16),moab=enemy(5,'MOAB'),bfb=enemy(8,'BFB');g.enemies=[red,moab,bfb];
 t.cool=100;g.towers=[t];g.updateTowers(.1);assert.equal(g.projectiles.length,1);assert(g.projectiles[0].special);assert.equal(g.projectiles[0].pierceLeft,200);
 const direction=g.projectiles[0].forward;assert.equal(direction.x,1);
 g.projectiles=[];g.updateTowers(1);assert.equal(g.projectiles.length,0);
 g.updateTowers(2);assert.equal(g.projectiles.length,1);
 g.roundActive=false;const cooldown=t.pressCool;g.updateTowers(10);assert.equal(t.pressCool,cooldown);
 g.enemies=[red];g.projectiles=[];g.updateMOABPress(t,10);assert.equal(g.projectiles.length,0);assert.equal(t.pressCool,0);
 const strong=enemy(10,'ZOMG');strong.hp=20000;t.target='strong';g.enemies=[moab,strong];let selected;g.fireKylieProjectile=(_,e)=>selected=e;g.updateMOABPress(t,.1);assert.equal(selected,strong);
});

test('top crosspaths preserve Kylie pierce and increase Press pierce/knockback in either order',()=>{
 for(const topFirst of [true,false])for(const tiers of [0,1,2]){
  const g=game(),t=g.createTower('boomer',0,0);
  if(topFirst)top(g,t,tiers);bottom(g,t,3);if(!topFirst)top(g,t,tiers);
  assert.equal(t.pierce,18+[0,4,9][tiers]);upgrade(g,t,2);g.fireKylieProjectile(t,enemy(5,'MOAB'),{special:true});const press=g.projectiles.pop();assert.equal(press.pierceLeft,200+[0,4,9][tiers]);close(press.knockback,3*.32*[1,1.25,1.5][tiers]);
  upgrade(g,t,2);assert.equal(t.pierce,18+[0,4,9][tiers]+(tiers===2?54:36));
 }
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,5);top(g,t,2);assert.equal(t.pierce,81);
});

test('Domination doubles both attack rates and only special throws have doubled range and explosions',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,4);const rate=t.rate;upgrade(g,t,2);close(t.rate,rate/2);assert.equal(t.damage,12);assert.equal(t.pierce,54);
 const e=enemy(t.range*1.5,'MOAB');g.enemies=[e];g.fireProjectile(t,e);const main=g.projectiles.pop();close(main.range,t.range);assert(!main.explodes);
 g.updateMOABPress(t,.1);const special=g.projectiles.pop();close(special.range,t.range*2);assert(special.explodes);assert.equal(special.pierceLeft,300);assert(special.moabDamage>5);assert(special.knockback>3*.32);close(t.pressCool,1.4);
});

test('Domination expiration produces one explosion, burn damage and tower credit',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,5);const e=enemy(1,'MOAB');g.enemies=[e];g.fireKylieProjectile(t,e,{special:true});const p=g.projectiles.pop();
 g.finishKylieProjectile(p);assert.equal(e.hp,9980);assert.equal(t.damageDealt,20);assert.equal(e.burns.length,1);assert.equal(g.cash,0);
 g.finishKylieProjectile(p);assert.equal(e.hp,9980);g.tickDominationBurns(e,.5);assert.equal(e.hp,9980);g.tickDominationBurns(e,3.5);assert.equal(e.hp,9940);assert.equal(t.damageDealt,60);assert.equal(e.burns.length,0);assert.equal(g.cash,0);
});

test('pierce exhaustion also triggers Domination explosion',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,5);const e=enemy(.5,'MOAB');g.enemies=[e];g.fireKylieProjectile(t,e,{special:true});const p=g.projectiles.pop();p.pierceLeft=1;g.updateKylieProjectile(p,.025);assert(p.dead);assert(e.burns?.length);assert.equal(t.damageDealt,70);
});

test('Red Hot Rangs increases Glaive Lord orbital damage and pops Lead/Frozen/Camo',()=>{
 const g=game(),t=g.createTower('boomer',0,0);top(g,t,5);t.orbitGlaives=Array.from({length:3},()=>({position:{set(){}},rotation:{y:0}}));
 const red=enemy(1),lead=enemy(2,'Lead');lead.camo=true;lead.freezeT=1;g.enemies=[red,lead];g.updateGlaiveLord(t,.08,.08);assert.equal(red.hp,9998);assert.equal(lead.hp,10000);
 bottom(g,t,2);g.updateGlaiveLord(t,.08,.08);assert.equal(red.hp,9995);assert.equal(lead.hp,9997);assert.equal(t.damageDealt,8);
});

test('special Kylie collision is swept at fast-forward and respects Camo detection',()=>{
 const g=game(),t=g.createTower('boomer',0,0);bottom(g,t,4);const e=enemy(3,'MOAB'),camo=enemy(2,'DDT');camo.camo=true;g.enemies=[e,camo];g.fireKylieProjectile(t,e,{special:true});const p=g.projectiles.pop();g.updateKylieProjectile(p,.12);assert.equal(e.hp,9995);assert.equal(camo.hp,10000);
});
