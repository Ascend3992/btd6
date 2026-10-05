const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function middle(g,t,tier){while(t.paths[1]<tier)upgrade(g,t,1)}
function close(a,b){assert(Math.abs(a-b)<1e-9,`${a} != ${b}`)}
function abilityTower(tier=4){const g=game(),t=g.createTower('bomb',0,0);g.towers.push(t);middle(g,t,tier);return {g,t};}

test('middle tiers apply prices, compounded cooldown, missile speed and range',()=>{
 const g=game(),t=g.createTower('bomb',0,0),prices=[250,400,1000,3450,28000],ranges=[40,44,49,54,54];let invest=600;
 for(let i=0;i<5;i++){
  upgrade(g,t,1);invest+=prices[i];assert.equal(t.invest,invest);close(t.range,ranges[i]*.32);
  close(t.rate,i===0?1.125:1.5*.75*.7333);assert.equal(t.projSpeed,i===0?26:39);
  const target=enemy(10);g.fireProjectile(t,target);assert.equal(g.projectiles.pop().speed,t.projSpeed);
 }
});

test('all targets in missile splash receive correct MOAB, Ceramic or regular damage',()=>{
 for(const [tier,moabDamage,ceramicDamage] of [[3,16,1],[4,31,5],[5,100,5]]){
  const g=game(),t=g.createTower('bomb',0,0);middle(g,t,tier);
  const targets=[enemy(20,'Red'),enemy(20,'MOAB'),enemy(21,'BFB'),enemy(21,'Ceramic'),enemy(21,'Lead')];
  g.enemies=targets;g.fireProjectile(t,targets[0]);g.updateProjectiles(1);
  for(const e of targets)assert.equal(e.hp,10000-(e.isBlimp?moabDamage:e.type==='Ceramic'?ceramicDamage:1),`${tier},${e.type}`);
 }
});

test('middle crosspath results are order independent and Heavy Bombs adds one damage',()=>{
 for(let tier=1;tier<=5;tier++)for(const path of [0,2]){
  const g=game(),one=g.createTower('bomb',0,0),two=g.createTower('bomb',0,0);
  for(let i=0;i<2;i++)upgrade(g,one,path);middle(g,one,tier);
  middle(g,two,tier);for(let i=0;i<2;i++)upgrade(g,two,path);
  for(const key of ['damage','pierce','rate','range','splash','projSpeed','bonusMoab','ceramicBonus','damageType','invest'])assert.equal(one[key],two[key],key);
  assert.deepEqual(one.fragStats,two.fragStats);
  if(path===0&&tier>=3){const target=enemy(20,'MOAB');g.enemies=[target];g.fireProjectile(one,target);g.updateProjectiles(1);assert.equal(target.hp,10000-([0,0,0,17,32,101][tier]));}
 }
});

test('ordinary middle-path missiles retain Black/Zebra/DDT and Camo restrictions',()=>{
 for(const tier of [3,4,5]){
  const g=game(),t=g.createTower('bomb',0,0);middle(g,t,tier);
  for(const type of ['Black','Zebra','DDT'])assert(!g.towerCanDamage({...t,camoDetect:true},enemy(20,type)));
  const camo=enemy(20);camo.camo=true;assert(!g.towerCanDamage(t,camo));
 }
});

test('ability selects First, Last, Close or Strong anywhere on the map',()=>{
 for(const [priority,index] of [['first',0],['last',1],['close',2],['strong',3]]){
  const {g,t}=abilityTower();t.target=priority;
  const targets=[enemy(40,'MOAB'),enemy(10,'MOAB'),enemy(20,'MOAB'),enemy(30,'BFB',20000)];
  targets[2].mesh.position.x=1;targets[1].mesh.position.x=70;
  g.enemies=[...targets,enemy(90,'Red',50000)];assert.equal(g.chooseBombAbilityTarget(t),targets[index]);
  assert(g.activateTowerAbility(t,'primary'));
  assert.equal(targets[index].hp,(index===3?20000:10000)-750-31);
  assert.equal(t.abilityCd,30);assert(!g.activateTowerAbility(t,'primary'));
  assert(g.projectiles.every(p=>p.cosmetic),'Flying missile cannot apply the ability damage again');
  const before=targets[index].hp;g.updateProjectiles(3);assert.equal(targets[index].hp,before);
 }
});

test('Assassin/Eliminator strike instantly and Eliminator cooldown is three times faster',()=>{
 for(const [tier,damage,cooldown,explosion] of [[4,750,30,31],[5,4500,10,100]]){
  const {g,t}=abilityTower(tier),target=enemy(20,'ZOMG',10000);g.enemies=[target];
  assert(g.activateTowerAbility(t,'primary'));assert.equal(target.hp,10000-damage-explosion);
  assert.equal(t.damageDealt,damage+explosion);assert.equal(t.abilityCd,cooldown);
  g.updateTowerAbility(t,0);assert.equal(t.abilityCd,cooldown);
  g.updateTowerAbility(t,cooldown);assert.equal(t.abilityCd,0);assert(g.activateTowerAbility(t,'primary'));
 }
});

test('ability needs a live blimp and an active round and can strike Camo DDTs',()=>{
 const {g,t}=abilityTower();assert(!g.activateTowerAbility(t,'primary'));assert.equal(t.abilityCd,0);
 const ddt=enemy(30,'DDT');ddt.camo=true;g.enemies=[ddt];g.roundActive=false;
 assert(!g.activateTowerAbility(t,'primary'));assert.equal(t.abilityCd,0);
 g.roundActive=true;assert(g.activateTowerAbility(t,'primary'));assert.equal(ddt.hp,9250);
});

test('ability explosion damages nearby bloons and leaves the distant map untouched',()=>{
 const {g,t}=abilityTower(),target=enemy(20,'MOAB'),near=enemy(21,'Ceramic'),far=enemy(30,'MOAB');
 t.target='close';g.enemies=[target,near,far];assert(g.activateTowerAbility(t,'primary'));
 assert.equal(target.hp,9219);assert.equal(near.hp,9995);assert.equal(far.hp,10000);
});

test('MOAB bonus damage does not carry unchanged into spawned regular children',()=>{
 const g=game(),t=g.createTower('bomb',0,0);middle(g,t,4);
 const moab=enemy(20,'MOAB',1),ceramic=enemy(20,'Ceramic',100);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===moab?[ceramic]:[]};g.enemies=[moab];
 g.fireProjectile(t,moab);g.updateProjectiles(1);assert.equal(ceramic.hp,95);assert.equal(t.damageDealt,6);
});

test('middle fragments gain MOAB bonuses and abilities use stronger independent fragments',()=>{
 const damage=[];
 for(const tier of [2,3,4,5]){
  const g=game(),t=g.createTower('bomb',0,0);middle(g,t,tier);upgrade(g,t,2);upgrade(g,t,2);
  const moab=enemy(21,'MOAB');g.enemies=[moab];g.spawnBombFragments({tower:t},{x:20,z:0});g.updateProjectiles(.1);
  damage.push(10000-moab.hp);assert.equal(t.damageDealt,damage.at(-1));
 }
 for(let i=1;i<damage.length;i++)assert(damage[i]>damage[i-1]);
 const stats=[];
 for(const tier of [4,5]){
  const {g,t}=abilityTower(tier);upgrade(g,t,2);upgrade(g,t,2);const target=enemy(20,'MOAB');g.enemies=[target];
  assert(g.activateTowerAbility(t,'primary'));const fragments=g.projectiles.filter(p=>p.visualType==='bombFrag');
  assert(fragments.length>0);assert(fragments.every(p=>p.tower.sourceTower===t&&p.mesh.position.x===20));
  assert(fragments[0].damage>t.fragStats.damage);assert(fragments[0].tower.fragMoabBonus>t.fragStats.moabBonus);
  stats.push({damage:fragments[0].damage,pierce:fragments[0].pierceLeft,count:fragments.length});
 }
 assert(stats[1].damage>stats[0].damage);assert(stats[1].pierce>stats[0].pierce);assert(stats[1].count>stats[0].count);
});
