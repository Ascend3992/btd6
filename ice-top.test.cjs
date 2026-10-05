const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs'),path=require('node:path');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function ice(g,tier,middle=0,bottom=0){const t=g.createTower('ice',0,0);for(let i=0;i<tier;i++)upgrade(g,t,0);for(let i=0;i<middle;i++)upgrade(g,t,1);for(let i=0;i<bottom;i++)upgrade(g,t,2);return t;}
function movable(e){return Object.assign(e,{freezeT:0,abilityFreezeT:0,abilitySlowT:0,abilitySlowMult:1,slowT:0,slowMult:1,glueT:0,glueAmpT:0,glueCarry:0,glueSlow:1,knockbackT:0,laneOffset:0,mesh:{...e.mesh,rotation:{y:0},scale:{set(){}},userData:{}}});}

test('Ice top path uses all supplied prices and XP, range, cooldown and vulnerability',()=>{
 const g=game(),t=ice(g,5);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(upgradeData.ice[0])',g)),[['Permafrost',150],['Cold Snap',350],['Ice Shards',1500],['Embrittlement',2300],['Super Brittle',28000]]);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(iceTopUpgradeMetadata)',g)),[
  {prices:[125,150,160,180],xp:160},{prices:[295,350,380,420],xp:500},{prices:[1275,1500,1620,1800],xp:2500},{prices:[1955,2300,2485,2760],xp:8250},{prices:[23800,28000,30240,33600],xp:25000}]);
 assert.equal(t.range,30*.32);assert.equal(t.rate,1.2);assert.equal(t.brittle,4);assert.equal(t.shardCount,6);
 assert.equal(t.pierce,40);assert.equal(t.freeze,1.5);assert.equal(t.camoDetect,true);
});

test('Permafrost freezes then slows by half, with layer-limited inheritance',()=>{
 const g=game(),t=ice(g,1),e=movable(enemy(3,'Ceramic',10));g.enemies=[e];
 const speed=g.enemySpeed(e);g.hitEnemy(e,1,{tower:t,freeze:t.freeze});assert.equal(g.enemySpeed(e),0);
 g.moveEnemies(1.5);assert.equal(g.enemySpeed(e),speed*.5);assert.equal(e.permafrostLayers,1);
 const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
 vm.runInContext(source.slice(source.indexOf('function childProps('),source.indexOf('const regularChildren=')),g);
 g.spawnEnemy=()=>enemy(3,'Rainbow',1);e.abilityFreezeT=0;e.abilitySlowT=0;
 const [child]=g.spawnChildSet(e,['Rainbow']);assert.equal(child.permafrostLayers,undefined);
 const deep=ice(g,1,2),frozen=movable(enemy(3,'Ceramic',10));g.hitEnemy(frozen,1,{tower:deep,freeze:deep.freeze});
 const [deepChild]=g.spawnChildSet(frozen,['Rainbow']);assert.equal(deepChild.freezeLayers,1);assert.equal(deepChild.freezeT,deep.freeze);assert.equal(deepChild.permafrostLayers,1);
});

test('Cold Snap detects Camo and pops Lead; Shards removes Camo and Regrow before spawning children',()=>{
 const g=game(),base=ice(g,1),snap=ice(g,2),shards=ice(g,3),lead=enemy(3,'Lead',5);lead.camo=true;
 assert.equal(g.towerCanDamage(base,lead),false);assert.equal(g.towerCanDamage(snap,lead),true);g.hitEnemy(lead,1,{tower:snap,freeze:snap.freeze});assert.equal(lead.hp,4);assert.equal(lead.freezeT,1.5);
 const parent=enemy(3,'Blue',1);parent.camo=true;parent.regrow=true;parent.regrowStack=['Ceramic'];
 let inherited;g.destroyEnemyAndSpawnChildren=e=>{inherited={camo:e.camo,regrow:e.regrow,stack:e.regrowStack.length};e.alive=false;return [enemy(3,'Red',1)];};
 const result=g.hitEnemy(parent,1,{tower:shards,freeze:shards.freeze});assert.deepEqual(inherited,{camo:false,regrow:false,stack:0});assert.equal(result.children[0].iceShards.count,3);
});

test('Embrittlement hits DDTs, strips Camo, grants +1 damage and temporary sharp/freeze vulnerability',()=>{
 const g=game(),t=ice(g,4),ddt=movable(enemy(3,'DDT',100));ddt.camo=true;ddt.regrow=true;
 const dart={type:'dart',damageType:'Sharp',camoDetect:false},cold=g.createTower('ice',0,0);
 assert.equal(g.towerCanDamage(ice(g,3),ddt),false);assert.equal(g.towerCanDamage(t,ddt),true);
 g.hitEnemy(ddt,1,{tower:t,freeze:t.freeze});assert.equal(ddt.hp,99);assert.equal(ddt.camo,false);assert.equal(ddt.regrow,false);assert.equal(ddt.freezeT,0);
 assert.equal(g.towerCanDamage(dart,ddt),true);g.hitEnemy(ddt,2,{tower:dart});assert.equal(ddt.hp,96);
 const lead=movable(enemy(3,'Lead',10));g.hitEnemy(lead,1,{tower:t,freeze:t.freeze});assert.equal(g.towerCanDamage(cold,lead),true);assert.equal(g.towerCanDamage(dart,lead),true);
 g.enemies=[lead,ddt];g.moveEnemies(3.01);assert.equal(g.towerCanDamage(cold,lead),false);assert.equal(g.towerCanDamage(dart,lead),false);assert.equal(g.towerCanDamage(dart,ddt),false);assert.equal(ddt.camo,false);
});

test('Super Brittle grants +4, slows blimps by 25%, increases Ceramic damage and preserves BAD slow immunity',()=>{
 const g=game(),t=ice(g,5),moab=enemy(3,'MOAB',100),bad=enemy(3,'BAD',100),ceramic=enemy(3,'Ceramic',10);
 const speed=g.enemySpeed(moab);g.hitEnemy(moab,1,{tower:t,freeze:t.freeze});assert.equal(g.enemySpeed(moab),speed*.75);assert.equal(moab.freezeT,undefined);
 g.hitEnemy(moab,2,{tower:{type:'dart'}});assert.equal(moab.hp,93);
 const badSpeed=g.enemySpeed(bad);g.hitEnemy(bad,1,{tower:t,freeze:t.freeze});assert.equal(g.enemySpeed(bad),badSpeed);assert.equal(bad.brittleDamage,4);
 g.hitEnemy(ceramic,1,{tower:t,freeze:t.freeze});assert(ceramic.hp<9);assert.equal(ceramic.iceShards.count,6);assert(ceramic.iceShards.damage>ice(g,3).shardDamage);
});

test('frozen pops release three or six real, equally-spaced shards, with damage credited to the freezing monkey',()=>{
 for(const tier of [3,5]){
  const g=game(),t=ice(g,tier),parent=enemy(0,'Ceramic',20);g.hitEnemy(parent,1,{tower:t,freeze:t.freeze});
  g.releaseIceShards(parent);assert.equal(g.projectiles.length,tier===5?6:3);
  const count=g.projectiles.length;
  g.projectiles.forEach((p,i)=>{assert.equal(p.cosmetic,false);assert(Math.abs(p.vx-Math.cos(i*Math.PI*2/count)*28)<1e-10);assert.equal(p.tower.sourceTower,t);});
  const target=enemy(2,'Ceramic',20);g.enemies=[target];const before=t.damageDealt;g.updateProjectiles(.1);assert(target.hp<20);assert(t.damageDealt>before);
 }
});

test('top crosspaths have identical stats in either purchase order',()=>{
 const g=game(),first=ice(g,5,2),second=ice(g,0,2);for(let i=0;i<5;i++)upgrade(g,second,0);
 for(const key of ['range','rate','damage','pierce','freeze','freezeLayers','brittle','shardCount'])assert.equal(first[key],second[key],key);
 assert.equal(first.rate,2.4*.5*.75);assert.equal(first.freezeLayers,2);
});
