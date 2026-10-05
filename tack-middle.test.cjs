const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function path(g,t,p,n){for(let i=0;i<n;i++)upgrade(g,t,p);return t;}
function values(t){return [t.damage,t.pierce,t.range,t.rate,t.projSpeed,t.meteorPierce,t.damageType];}

test('middle Tack prices, cumulative range, blade pierce and main damage follow the supplied stats',()=>{
 const g=game(),t=g.createTower('tack',0,0),costs=[100,225,550,2700,15000],range=[27,31,46,46,46];let invest=260;
 for(let i=0;i<5;i++){
  upgrade(g,t,1);invest+=costs[i];assert.equal(t.invest,invest);assert.equal(t.range,range[i]*.32);assert.equal(t.pierce,i===0?1:i===1?4:8);
  assert.equal(t.damage,i===4?5:i===3?2:1);assert.equal(t.damageType,i>=4?'Normal':i>=2?'Shatter':'Sharp');assert.equal(t.camoDetect,false);
 }
});

test('Long Range increases visual tack speed and Super Range preserves its supplied pierce stat',()=>{
 const g=game(),t=path(g,g.createTower('tack',0,0),1,1);g.spawnTackVolleyVisual(t);
 assert.equal(g.projectiles.length,8);assert(g.projectiles.every(p=>p.cosmetic&&Math.hypot(p.vx,p.vz)>36));
 g.projectiles.length=0;upgrade(g,t,1);g.spawnTackVolleyVisual(t);assert(g.projectiles.every(p=>p.pierceLeft===4));
});

test('Blade Shooter hits nearby Frozen bloons with cosmetic blades, while retaining Lead and Camo limitations',()=>{
 const g=game(),t=path(g,g.createTower('tack',0,0),1,3),targets=Array.from({length:9},(_,i)=>{const e=enemy(4),a=(i+.5)*Math.PI*2/9;e.mesh.position.set(Math.cos(a)*4,1.8,Math.sin(a)*4);return e;}),lead=enemy(1.9,'Lead'),camo=enemy(2.2);camo.camo=true;targets[0].freezeT=1;
 g.enemies=[lead,camo,...targets];g.fireTackRadialBurst(t);assert(g.projectiles.every(p=>p.cosmetic&&p.visualType==='blade'&&p.pierceLeft===8&&p.radius===.8));
 assert.equal(targets.filter(e=>e.hp===9999).length,8);g.updateProjectiles(.25);assert.equal(targets.filter(e=>e.hp===9999).length,8);assert.equal(targets[0].hp,9999);assert.equal(lead.hp,10000);assert.equal(camo.hp,10000);assert.equal(t.damageDealt,8);
});

test('Super Maelstrom main attack pops all standard materials but still needs Camo detection',()=>{
 const g=game(),t=path(g,g.createTower('tack',0,0),1,5),frozen=enemy(4);frozen.freezeT=1;
 for(const type of ['Lead','Black','Purple','Zebra'])assert(g.towerCanDamage(t,enemy(4,type)),type);assert(g.towerCanDamage(t,frozen));
 const camo=enemy(4,'Lead');camo.camo=true;assert(!g.towerCanDamage(t,camo));
});

test('Maelstrom emits two or four clockwise waves, lasts exactly three or nine seconds, and retains top-path speed bonuses',()=>{
 for(const tier of [4,5]){
  const g=game(),t=path(g,g.createTower('tack',0,0),1,tier),ability=g.getTowerAbilities(t)[0],waves=tier===4?2:4;
  assert.equal(ability.waves,waves);assert.equal(ability.duration,tier===4?3:9);
  g.emitMaelstrom(t,ability);const first=g.projectiles[0];assert.equal(g.projectiles.length,waves);assert(first.vz>0,'Positive X-to-Z sweep is clockwise in the top view');
  for(let i=1;i<waves;i++){
   const a=Math.atan2(first.vz,first.vx)+i*Math.PI*2/waves,p=g.projectiles[i];assert(Math.abs(p.vx-45*Math.cos(a))<1e-10);assert(Math.abs(p.vz-45*Math.sin(a))<1e-10);
  }
  const old=t.abilityAngle;g.emitMaelstrom(t,ability);assert(t.abilityAngle>old);assert.equal(g.projectiles.length,waves*2);
  const frozen=enemy(4);frozen.freezeT=1;assert(g.towerCanDamage(first.tower,frozen));assert(first.tower.camoDetect);
  assert.equal(g.towerCanDamage(first.tower,enemy(4,'Lead')),tier===5);
  path(g,t,0,2);const boosted=g.getTowerAbilities(t)[0];assert(Math.abs(boosted.tick-ability.tick*.85*.85)<1e-10);
  t.activeAbility=boosted;t.abilityTimer=boosted.duration;t.abilityTick=boosted.tick;g.updateTowerAbility(t,boosted.duration+1);assert.equal(t.abilityTimer,0);assert.equal(t.activeAbility,null);
 }
 const g=game(),a=path(g,g.createTower('tack',0,0),1,4),b=path(g,g.createTower('tack',0,0),1,5);
 assert(g.getTowerAbilities(b)[0].damage>g.getTowerAbilities(a)[0].damage);assert(g.getTowerAbilities(b)[0].pierce>g.getTowerAbilities(a)[0].pierce);
});

test('Super Range grants exact flame, meteor and Tack Zone bonuses in either purchase order',()=>{
 for(const [p,tier] of [[0,4],[0,5],[2,5]]){
  const g=game(),a=g.createTower('tack',0,0),b=g.createTower('tack',0,0);
  path(g,a,p,tier);path(g,a,1,2);path(g,b,1,2);path(g,b,p,tier);assert.deepEqual(values(a),values(b));
  if(p===0){assert.equal(a.pierce,(tier===4?30:45)+15);if(tier===5)assert.equal(a.meteorPierce,2);}
  else{
   const base=path(g,g.createTower('tack',0,0),2,5);path(g,base,1,1);
   assert.equal(a.pierce,base.pierce+8);assert(Math.abs(a.range-base.range-16*.32)<1e-10);
  }
 }
});

test('a Super Range Inferno meteor hits two distinct targets with 700 impact damage, then explodes once',()=>{
 const g=game(),t=path(g,path(g,g.createTower('tack',0,0),0,5),1,2);t.target='close';
 const first=enemy(30,'ZOMG'),second=enemy(40,'ZOMG'),third=enemy(50,'ZOMG');g.enemies=[first,second,third];
 g.updateInfernoMeteor(t,.01);const p=g.projectiles[0];assert.equal(p.pierceLeft,2);g.updateProjectiles(2);
 assert.equal(first.hp,9300);assert.equal(second.hp,9250);assert.equal(third.hp,10000);assert.equal(t.damageDealt,1450);assert.equal(g.projectiles.length,0);assert.equal(p.pierceLeft,0);
 assert.equal(first.burns[0].damage,50);assert.equal(second.burns[0].damage,50);
});
