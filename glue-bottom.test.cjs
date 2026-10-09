const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {game,upgrade,mesh}=require('./helpers/game.cjs');
function simulation(){const g=game();Object.assign(g,{THREE:{MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}},makeBloonMesh:mesh,makeBlimpMesh:mesh,makeProjectileMesh:mesh,spawnPopVisual(){}});g.PATH=Array.from({length:10},(_,i)=>({x:i*10,z:0,distanceTo:()=>10}));const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function normalizeSpawnName('),source.indexOf('// Distance along the whole track')),g);return g;}
function glue(g,bottom,top=0,middle=0){const t=g.createTower('glue',0,0);for(let i=0;i<top;i++)upgrade(g,t,0);for(let i=0;i<middle;i++)upgrade(g,t,1);for(let i=0;i<bottom;i++)upgrade(g,t,2);return t;}
function spawn(g,type,x=0,z=0){const e=g.spawnEnemy(type);e.dist=x;e.laneOffset=z;g.placeEnemyOnTrack(e);return e;}
test('all five upgrades have supplied prices, XP, duration, slowdown and additive Super Glue pierce',()=>{
 const g=simulation(),data=JSON.parse(vm.runInContext('JSON.stringify(glueBottomUpgradeMetadata)',g));assert.deepEqual(data.map(x=>x.prices),[[240,280,300,335],[340,400,430,480],[3060,3600,3890,4320],[3400,4000,4320,4800],[20400,24000,25920,28800]]);assert.deepEqual(data.map(x=>x.xp),[130,600,2500,8000,30000]);
 for(let tier=1;tier<=5;tier++){const t=glue(g,tier);assert.equal(t.slowDuration,24);assert.equal(t.slow,tier>=2?.25:.5);assert.equal(t.pierce,tier===5?7:1);assert.equal(t.damage,0);assert.equal(t.bonusMoab,tier===5?30:0);assert.equal(t.rate,1);}
 assert.equal(glue(g,5,0,1).pierce,8);assert.equal(glue(g,5,0,2).pierce,11);
});
test('MOAB Glue slows ordinary Bloons by 75% and every eligible blimp by 37.5% for full duration, including Corrosive crosspaths',()=>{
 const g=simulation();for(const top of [0,1,2])for(const type of ['Ceramic','MOAB','BFB','ZOMG','DDT','BAD']){
  const t=glue(g,3,top),e=spawn(g,type);e.hp=1000;e.camo=false;assert(g.towerCanDamage(t,e));g.hitGlueTarget(t,e);assert.equal(e.glueT,24);assert.equal(e.glueSlow,type==='BAD'?1:e.isBlimp?.625:.25);assert.equal(e.hp,1000);g.updateGlueCoatings(e,23.9);assert(e.glueT>0);g.updateGlueCoatings(e,.1);assert.equal(e.glueT,0);
 }
});
test('Relentless pop stun affects nearby ordinary Bloons, MOAB and visible DDT, with exact radius, pierce and class durations',()=>{
 const g=simulation(),t=glue(g,4),host=spawn(g,'Red'),ordinary=spawn(g,'Ceramic',1),moab=spawn(g,'MOAB',2),ddt=spawn(g,'DDT',3),camo=spawn(g,'Camo Ceramic',1),hidden=spawn(g,'DDT',2),bfb=spawn(g,'BFB',2),zomg=spawn(g,'ZOMG',2),bad=spawn(g,'BAD',2),far=spawn(g,'Ceramic',4);ddt.camo=false;
 g.hitGlueTarget(t,host);g.hitEnemy(host,1);assert.equal(ordinary.glueStunT,1);assert.equal(moab.glueStunT,.25);assert.equal(ddt.glueStunT,.25);for(const e of [camo,hidden,bfb,zomg,bad,far])assert.equal(e.glueStunT||0,0);assert.equal(ordinary.hp,10);assert.equal(ordinary.glueT,0,'stun does not create a new glue coating');
 assert.equal(g.glueStunMotionDt(moab,.1),0);assert(Math.abs(g.glueStunMotionDt(moab,.2)-.05)<1e-9);
 for(const [middle,limit] of [[0,6],[1,7],[2,9]]){const h=simulation(),gun=glue(h,4,0,middle),origin=spawn(h,'Red'),targets=Array.from({length:12},()=>spawn(h,'Ceramic',1));h.hitGlueTarget(gun,origin);h.hitEnemy(origin,1);assert.equal(targets.filter(e=>e.glueStunT>0).length,limit);}
});
test('pop stuns follow inherited glue layers and expire with the source coating rather than leaving sticky traps',()=>{
 const g=simulation(),t=glue(g,4),host=spawn(g,'Pink'),near=spawn(g,'Ceramic',1);g.hitGlueTarget(t,host);let current=host;
 for(const type of ['Yellow','Green','Blue']){current=g.destroyEnemyAndSpawnChildren(current)[0];assert.equal(current.type,type);assert.equal(near.glueStunT,1);near.glueStunT=0;}
 g.destroyEnemyAndSpawnChildren(current);assert.equal(near.glueStunT,0,'fourth layer is not glued');assert.equal(g.acidPuddles.length,0);
 const expired=spawn(g,'Red');g.hitGlueTarget(t,expired);g.updateGlueCoatings(expired,24);g.hitEnemy(expired,1);assert.equal(near.glueStunT,0);
});
test('Super Glue applies class-specific temporary immobilization and slow, returns to MOAB Glue, and preserves BAD movement',()=>{
 const g=simulation(),t=glue(g,5);for(const [type,slow,stuck] of [['Ceramic',0,24],['MOAB',0,5],['DDT',0,5],['BFB',.05,2.5],['ZOMG',.1,.75],['BAD',1,0]]){
  const e=spawn(g,type);e.camo=false;e.hp=10000;const base=g.enemySpeed(e);g.hitGlueTarget(t,e);assert.equal(e.hp,10000-(e.isBlimp?30:0));assert.equal(e.glueT,24);assert.equal(e.glueSlow,slow);assert.equal(g.enemySpeed(e),base*slow);
  if(stuck&&e.isBlimp){g.updateGlueCoatings(e,stuck-.01);assert.equal(e.glueSlow,slow);g.updateGlueCoatings(e,.01);assert.equal(e.glueSlow,.625);assert.equal(g.enemySpeed(e),base*.625);}
 }
});
test('Super Glue deals periodic damage and rehit refreshes its slow without resetting corrosion or multiplying coats',()=>{
 const g=simulation(),t=glue(g,5),moab=spawn(g,'MOAB');moab.hp=1000;g.hitGlueTarget(t,moab);assert.equal(moab.hp,970);g.updateGlueCoatings(moab,1);assert.equal(moab.hp,970);assert(g.towerCanDamage(t,moab));g.hitGlueTarget(t,moab);assert.equal(moab.hp,940);assert.equal(moab.glueCoatings.length,1);assert.equal(moab.glueT,24);assert.equal(moab.glueCoatings[0].stuckRemaining,5);g.updateGlueCoatings(moab,1);assert.equal(moab.hp,920,'20 DoT ticks even with 1s reapplication');
 const regular=spawn(g,'Ceramic');regular.hp=1000;g.hitGlueTarget(t,regular);assert.equal(regular.hp,1000);g.updateGlueCoatings(regular,2);assert.equal(regular.hp,980);assert(g.towerCanDamage(t,regular));
 const corrosive=glue(g,5,2),target=spawn(g,'Ceramic');target.hp=1000;g.hitGlueTarget(corrosive,target);g.updateGlueCoatings(target,1.8);assert.equal(target.hp,979);
 const stronger=spawn(g,'Ceramic');stronger.hp=1000;g.hitGlueTarget(t,stronger);assert.equal(g.towerCanDamage(corrosive,stronger),false,'higher-ranked glue remains protected');const solver=glue(g,0,5),solved=spawn(g,'Ceramic');g.hitGlueTarget(solver,solved);assert.equal(g.towerCanDamage(corrosive,solved),false,'equal Solver coating does not grant Super Glue rehit');
});
test('Super Glue pop stuns include BFB and ZOMG for the full ordinary duration, retain visibility and exact pierce limits',()=>{
 for(const [middle,limit] of [[0,11],[1,12],[2,14]]){const g=simulation(),t=glue(g,5,0,middle),host=spawn(g,'Red'),bfb=spawn(g,'BFB',1),zomg=spawn(g,'ZOMG',1),moab=spawn(g,'MOAB',1),ddt=spawn(g,'DDT',1),hidden=spawn(g,'DDT',1),bad=spawn(g,'BAD',1),targets=Array.from({length:16},()=>spawn(g,'Ceramic',1));ddt.camo=false;g.hitGlueTarget(t,host);g.hitEnemy(host,1);assert([bfb,zomg,moab,ddt].every(e=>e.glueStunT===1));assert.equal(hidden.glueStunT||0,0);assert.equal(bad.glueStunT||0,0);assert.equal(targets.filter(e=>e.glueStunT>0).length,limit-4);}
});
test('spatial stun index tracks moving targets and new child families without repeated full-array scans',()=>{
 const g=simulation(),t=glue(g,4),host=spawn(g,'Red'),moving=spawn(g,'Ceramic',8);g.hitGlueTarget(t,host);g.hitEnemy(host,1);assert.equal(moving.glueStunT||0,0);moving.dist=1;g.placeEnemyOnTrack(moving);const next=spawn(g,'Blue');g.hitGlueTarget(t,next);
 let positionReads=0;for(let i=0;i<2000;i++){const e=spawn(g,'Ceramic',60);const original=e.mesh.position;Object.defineProperty(e.mesh,'position',{get(){positionReads++;return original;}});}
 positionReads=0;const child=g.destroyEnemyAndSpawnChildren(next)[0];assert.equal(moving.glueStunT,1);assert.equal(child.glueStunT,1);assert.equal(positionReads,0,'occupied nearby cells do not read distant Bloons');assert.equal(g.enemies.filter(e=>e.alive).length,2002);
});
test('Relentless stuns stop actual movement and end exactly, without adding Frozen immunity',()=>{
 const g=simulation(),e=spawn(g,'Ceramic',1),dart=g.createTower('dart',0,0);e.glueStunT=.25;assert(g.towerCanDamage(dart,e));g.moveEnemies(.1);assert.equal(e.dist,1);g.moveEnemies(.2);assert(Math.abs(e.dist-(1+125/9.5*.05))<1e-9);assert.equal(e.glueStunT,0);
});
