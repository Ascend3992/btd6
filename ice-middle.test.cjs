const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function ice(g,tier,top=0,bottom=0){const t=g.createTower('ice',0,0);for(let i=0;i<tier;i++)upgrade(g,t,1);for(let i=0;i<top;i++)upgrade(g,t,0);for(let i=0;i<bottom;i++)upgrade(g,t,2);return t;}
function mobile(e){return Object.assign(e,{freezeT:0,abilityFreezeT:0,abilitySlowT:0,abilitySlowMult:1,slowT:0,slowMult:1,glueT:0,glueAmpT:0,glueCarry:0,glueSlow:1,knockbackT:0,laneOffset:0,mesh:{...e.mesh,rotation:{y:0},scale:{set(){}},userData:{}}});}

test('middle upgrades use supplied prices, XP, freeze durations, cooldown, pierce and ranges',()=>{
 const g=game(),t=g.createTower('ice',0,0);let invest=400;
 for(let tier=1;tier<=5;tier++){
  upgrade(g,t,1);invest+=[200,300,2750,4000,21000][tier-1];assert.equal(t.invest,invest);
  assert(Math.abs(t.rate-1.8)<1e-10);assert.equal(t.freeze,tier===1?1.75:2.2);assert.equal(t.pierce,tier===1?40:tier===5?300:45);
  assert.equal(t.range,(tier===5?40:tier===4?30:25)*.32);assert.equal(t.freezeLayers,tier===5?8:tier>=2?2:1);
 }
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(iceMiddleUpgradeMetadata)',g)),[
  {prices:[170,200,215,240],xp:160},{prices:[255,300,325,360],xp:500},{prices:[2335,2750,2970,3300],xp:2500},{prices:[3400,4000,4320,4800],xp:8500},{prices:[17850,21000,22680,25200],xp:27500}]);
});

test('Arctic Wind slows only eligible bloons inside its radius by 40%, without lingering outside',()=>{
 const g=game(),t=ice(g,3);g.towers.push(t);const inside=mobile(enemy(3,'Ceramic',100)),white=mobile(enemy(3,'White',100)),camo=mobile(enemy(3,'Ceramic',100)),outside=mobile(enemy(t.range+.01,'Ceramic',100));camo.camo=true;g.enemies=[inside,white,camo,outside];
 const speeds=g.enemies.map(e=>g.enemySpeed(e));g.moveEnemies(0);assert.equal(g.enemySpeed(inside),speeds[0]*.6);[white,camo,outside].forEach((e,i)=>assert.equal(g.enemySpeed(e),speeds[i+1]));
 inside.mesh.position.x=t.range+.01;g.moveEnemies(0);assert.equal(g.enemySpeed(inside),speeds[0]);
});

test('Snowstorm uses 6s ordinary and 3s special/blimp freezes; Lead and DDT require popping power',()=>{
 const g=game(),t=ice(g,4);g.towers.push(t);const types=['Ceramic','White','Zebra','Lead','MOAB','DDT','BAD'];g.enemies=types.map(type=>mobile(enemy(30,type,100)));const camo=mobile(enemy(30,'Ceramic',100));camo.camo=true;g.enemies.push(camo);
 assert.equal(g.activateTowerAbility(t,'primary'),true);assert.equal(t.abilityCd,30);
 assert.deepEqual(g.enemies.map(e=>e.abilityFreezeT),[6,3,3,0,3,0,0,3]);assert.equal(g.enemies[0].abilityFreezeLayers,2);assert.equal(g.enemies[4].abilityFreezeLayers,undefined);assert.equal(g.enemySpeed(g.enemies[4]),0);
 const dart={type:'dart',damageType:'Sharp',camoDetect:true};assert.equal(g.towerCanDamage(dart,g.enemies[0]),false);assert.equal(g.towerCanDamage(dart,g.enemies[4]),true);
 const snap=ice(g,4,2);g.towers.push(snap);g.activateTowerAbility(snap,'primary');assert.equal(g.enemies[3].abilityFreezeT,6);assert.equal(g.enemies[5].abilityFreezeT,3);
 assert.equal(g.activateTowerAbility(snap,'primary'),false);g.updateTowerAbility(snap,30);assert.equal(snap.abilityCd,0);
});

test('Snowstorm soaks two regular layers and Absolute Zero soaks eight, stopping at the next layer and at blimp boundaries',()=>{
 const g=game(),source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function childProps('),source.indexOf('const regularChildren=')),g);
 g.spawnEnemy=spec=>mobile(enemy(3,spec.type,100));
 for(const tier of [4,5]){
  const t=ice(g,tier),e=mobile(enemy(3,'Ceramic',100));g.enemies=[e];g.towers=[t];g.activateTowerAbility(t,'primary');let parent=e;
  for(let layer=1;layer<(tier===5?8:2);layer++){const [child]=g.spawnChildSet(parent,['Rainbow']);assert.equal(child.abilityFreezeLayers,(tier===5?8:2)-layer);assert.equal(child.abilityFreezeT,tier===5?10:6);parent=child;}
  const [thawed]=g.spawnChildSet(parent,['Red']);assert.equal(thawed.abilityFreezeT,0);
 }
 const blimp=mobile(enemy(3,'MOAB',100));blimp.abilityFreezeT=10;blimp.abilityFreezeLayers=8;assert.equal(g.spawnChildSet(blimp,['Ceramic'])[0].abilityFreezeT,0);
});

test('Absolute Zero freezes immune materials for 10s and gives all Ice Monkeys +50% speed for exactly 10s',()=>{
 const g=game(),zero=ice(g,5),base=g.createTower('ice',0,0),dart=g.createTower('dart',0,0);g.towers.push(zero,base,dart);
 g.enemies=['White','Zebra','Lead','DDT','MOAB','BAD'].map(type=>mobile(enemy(30,type,100)));g.enemies[3].camo=true;
 assert(g.activateTowerAbility(zero,'primary'));assert.equal(zero.abilityCd,25);assert.deepEqual(g.enemies.map(e=>e.abilityFreezeT),[10,10,10,10,10,0]);
 for(const t of g.towers)t.cool=100;g.updateTowers(2);assert.equal(base.cool,97);assert.equal(zero.cool,97);assert.equal(dart.cool,98);
 g.roundActive=false;g.updateTowers(20);assert.equal(base.cool,97);assert.equal(vm.runInContext('absoluteZeroBuffT',g),8);
 g.roundActive=true;g.updateTowers(9);assert.equal(base.cool,84);assert.equal(vm.runInContext('absoluteZeroBuffT',g),0);g.updateTowers(1);assert.equal(base.cool,83);
});

test('Absolute Zero attacks with no local targets, briefly freezing distant freezable bloons without global damage',()=>{
 const g=game(),zero=ice(g,5),far=mobile(enemy(30,'Ceramic',100)),white=mobile(enemy(30,'White',100));g.towers.push(zero);g.enemies=[far,white];g.updateTowers(.01);
 assert.equal(far.hp,100);assert.equal(far.freezeT,.3);assert.equal(far.freezeLayers,8);assert.equal(white.freezeT,0);assert(Math.abs(zero.cool-1.8)<1e-10);
});

test('middle crosspaths recompute consistently and frozen water permission applies only at initial placement',()=>{
 const g=game(),first=ice(g,5,2,0),second=ice(g,0,2,0);for(let i=0;i<5;i++)upgrade(g,second,1);
 for(const key of ['range','rate','freeze','pierce','freezeLayers','camoDetect'])assert.equal(first[key],second[key]);
 vm.runInContext('waterRegions.push({minX:0,maxX:20,minZ:0,maxZ:20})',g);assert.equal(g.surfacePlacement('dart',4,4).allowed,false);
 const arctic=ice(g,3);g.towers.push(arctic);assert.equal(g.surfacePlacement('dart',4,4).frozenBy,arctic.id);assert.equal(g.surfacePlacement('dart',18,18).allowed,false);assert.equal(g.surfacePlacement('ice',18,18).allowed,true);
 const existing=g.createTower('dart',4,4);existing.placementSurface='land';g.towers.push(existing);assert.equal(existing.frozenWaterSourceId,undefined);
});
