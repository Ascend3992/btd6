const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function bottom(g,t,tier){while(t.paths[2]<tier)upgrade(g,t,2)}
function close(a,b){assert(Math.abs(a-b)<1e-9,`${a} != ${b}`)}
function volley(g,t,target){
 g.fireProjectile(t,target);const recursive=g.projectiles.at(-1).recursive;
 for(let i=0;g.projectiles.length&&i<10;i++)g.updateProjectiles(1);
 assert.equal(g.projectiles.length,0);return recursive;
}
function blitz(){const g=game(),t=g.createTower('bomb',0,0);bottom(g,t,5);g.towers.push(t);return {g,t};}

test('bottom tiers use supplied Medium prices, range, damage and cooldown',()=>{
 const g=game(),t=g.createTower('bomb',0,0),prices=[200,300,700,2500,23000],damage=[1,1,1,2,5];let invest=600;
 for(let i=0;i<5;i++){
  upgrade(g,t,2);invest+=prices[i];assert.equal(t.invest,invest);close(t.range,(i===0?52:54)*.32);
  assert.equal(t.damage,damage[i]);close(t.rate,i===4?.9:1.5);
  assert.equal(t.pierce,22,'Fragments and clusters have their own pierce');
 }
});

test('Frag Bombs use Sharp damage and one pierce; Cluster Bombs replace fragments',()=>{
 const g=game(),t=g.createTower('bomb',0,0);bottom(g,t,2);
 const target=enemy(20);g.enemies=[target];g.fireProjectile(t,target);g.updateProjectiles(1);
 assert(g.projectiles.every(p=>p.visualType==='bombFrag'&&p.pierceLeft===1&&p.tower.damageType==='Sharp'));
 const lead=enemy(20,'Lead');assert(!g.towerCanDamage(g.projectiles[0].tower,lead));
 g.projectiles.length=0;bottom(g,t,3);assert.equal(t.fragStats,null);
 g.fireProjectile(t,target);g.updateProjectiles(1);
 assert.equal(g.projectiles.length,8);assert(g.projectiles.every(p=>p.mode==='bombCluster'&&p.pierce===8));
});

test('eight secondary explosions deal real damage with their own 8-target caps',()=>{
 const g=game(),t=g.createTower('bomb',0,0);bottom(g,t,3);
 const targets=Array.from({length:30},()=>enemy(20));g.enemies=targets;
 volley(g,t,targets[0]);
 assert(targets.slice(0,8).every(e=>e.hp===9991));assert(targets.slice(8,22).every(e=>e.hp===9999));
 assert(targets.slice(22).every(e=>e.hp===10000));assert.equal(t.damageDealt,22+8*8);
});

test('Recursive alternates 9/73 visual explosions with 9/17 maximum target hits',()=>{
 const g=game(),t=g.createTower('bomb',0,0);bottom(g,t,4);
 const target=enemy(20);g.enemies=[target];let effects=0;g.spawnImpactVisual=()=>effects++;
 assert.equal(volley(g,t,target),false);assert.equal(effects,9);assert.equal(target.hp,9982);
 effects=0;assert.equal(volley(g,t,target),true);assert.equal(effects,73);assert.equal(target.hp,9948);
 effects=0;assert.equal(volley(g,t,target),false);assert.equal(effects,9);assert.equal(target.hp,9930);
});

test('Blitz recursively explodes every shot for at most 17 hits of 5 damage',()=>{
 const {g,t}=blitz(),target=enemy(20);g.enemies=[target];
 for(let i=1;i<=3;i++){assert(volley(g,t,target));assert.equal(target.hp,10000-85*i);}
 assert.equal(t.damageDealt,255);
});

test('larger recursive explosions cover targets beyond normal secondary blast reach',()=>{
 const g=game(),t=g.createTower('bomb',0,0);bottom(g,t,4);
 const target=enemy(20),distant=enemy(28);g.enemies=[target,distant];
 volley(g,t,target);assert.equal(distant.hp,10000);
 volley(g,t,target);assert(distant.hp<10000);
});

test('bottom crosspaths preserve purchase order and Heavy Bombs adds damage to every wave',()=>{
 for(const tier of [3,4,5])for(const path of [0,1]){
  const g=game(),a=g.createTower('bomb',0,0),b=g.createTower('bomb',0,0);
  for(let i=0;i<2;i++)upgrade(g,a,path);bottom(g,a,tier);
  bottom(g,b,tier);for(let i=0;i<2;i++)upgrade(g,b,path);
  for(const key of ['damage','pierce','range','splash','rate','projSpeed','damageType','invest'])assert.equal(a[key],b[key]);
  const target=enemy(20);g.enemies=[target];volley(g,a,target);
  assert.equal(target.hp,10000-(tier===5?17:9)*(tier===5?5:tier===4?2:1)-(path===0?(tier===5?17:9):0));
 }
 const {g,t}=blitz();upgrade(g,t,1);upgrade(g,t,1);close(t.rate,.9*.75*.7333);
});

test('cluster explosions keep Explosion immunity and Camo restrictions',()=>{
 const {g,t}=blitz(),red=enemy(20),black=enemy(20,'Black'),zebra=enemy(20,'Zebra'),lead=enemy(20,'Lead'),ddt=enemy(20,'DDT'),camo=enemy(20);camo.camo=true;
 g.enemies=[red,black,zebra,lead,ddt,camo];volley(g,t,red);
 for(const e of [black,zebra,ddt,camo])assert.equal(e.hp,10000);
 assert.equal(lead.hp,9915);assert.equal(red.hp,9915);
});

test('in-flight bombs retain Cluster behavior when Recursive is purchased',()=>{
 const g=game(),t=g.createTower('bomb',0,0);bottom(g,t,3);
 const target=enemy(20);g.enemies=[target];g.fireProjectile(t,target);bottom(g,t,4);
 for(let i=0;g.projectiles.length&&i<10;i++)g.updateProjectiles(1);
 assert.equal(target.hp,9991);assert.equal(t.bombShotCounter,0);
 assert(!volley(g,t,target));assert.equal(target.hp,9973);
});

test('losing a life triggers 2000 damage and then wipes surviving MOABs and regular bloons',()=>{
 const {g,t}=blitz(),targets=['Red','Black','Lead','Ceramic','MOAB','BFB','ZOMG','DDT','BAD'].map(type=>enemy(20,type,10000));
 targets.forEach(e=>{e.camo=true;e.glueDamageAmp=10});g.enemies=targets;g.loseLives(1);
 assert.equal(g.lives,99);assert.equal(t.blitzCd,45);
 for(const e of targets){
  if(!e.isBlimp||e.type==='MOAB')assert(!e.alive,e.type);
  else {assert(e.alive,e.type);assert.equal(e.hp,8000,'Storm damage is exactly 2000 regardless of glue amplification');}
 }
 const survivor=targets.at(-1);g.loseLives(1);assert.equal(survivor.hp,8000);assert.equal(g.lives,98);
 g.updateTowerAbility(t,45);g.loseLives(1);assert.equal(survivor.hp,6000);assert.equal(t.blitzCd,45);
});

test('Bomb Storm clears children created by both the initial strike and cleanup',()=>{
 const {g,t}=blitz(),bfb=enemy(20,'BFB',1000),moab=enemy(20,'MOAB',3000),ceramic=enemy(20,'Ceramic',4000),rainbow=enemy(20,'Rainbow',1);
 g.enemies=[bfb];g.destroyEnemyAndSpawnChildren=e=>{
  e.alive=false;const kids=e===bfb?[moab]:e===moab?[ceramic]:e===ceramic?[rainbow]:[];g.enemies.push(...kids);return kids;
 };
 g.loseLives(3);assert.equal(g.lives,97);assert([bfb,moab,ceramic,rainbow].every(e=>!e.alive));
 assert.equal(t.damageDealt,8001);
});

test('zero life loss and unavailable Blitz towers do not trigger a storm',()=>{
 const {g,t}=blitz(),target=enemy(20,'MOAB');g.enemies=[target];g.loseLives(0);
 assert.equal(t.blitzCd,0);assert.equal(target.hp,10000);
 g.towers.length=0;g.loseLives(1);assert.equal(target.hp,10000);assert.equal(g.lives,99);
});
