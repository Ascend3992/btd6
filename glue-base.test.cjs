const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {game,enemy,mesh}=require('./helpers/game.cjs');
function simulation(){
 const g=game();Object.assign(g,{THREE:{MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}},makeBloonMesh:mesh,makeBlimpMesh:mesh,makeProjectileMesh:mesh,spawnPopVisual(){}});
 g.PATH=Array.from({length:10},(_,i)=>({x:i*10,z:0,distanceTo:()=>10}));
 const source=fs.readFileSync(require('node:path').join(__dirname,'..','game.js'),'utf8');
 vm.runInContext(source.slice(source.indexOf('function normalizeSpawnName('),source.indexOf('// Distance along the whole track')),g);return g;
}
test('base Glue Gunner has all supplied stats and ignores Camo, bosses, blimps and equal glue',()=>{
 const g=simulation(),t=g.createTower('glue',0,0);
 assert.equal(t.invest,270);assert.equal(t.range,46*.32);assert.equal(t.rate,1);assert.equal(t.damage,0);assert.equal(t.glueLevel,1);assert.equal(t.slow,.5);assert.equal(t.slowDuration,11);assert.equal(t.glueLayers,3);assert.equal(t.pierce,1);assert.equal(t.projSpeed,300*.32);assert.equal(t.projectileLife,.43);assert.equal(t.projectileRadius,4*.32);
 assert.equal(vm.runInContext('towerDefs.glue.footprintRadius',g),6*.32);
 for(const spec of ['Red','Lead','White','Purple','Ceramic'])assert(g.towerCanDamage(t,g.spawnEnemy(spec)));
 for(const spec of ['MOAB','BFB','ZOMG','DDT','BAD','Camo Red'])assert.equal(g.towerCanDamage(t,g.spawnEnemy(spec)),false);
 const boss=g.spawnEnemy('Red');boss.isBoss=true;assert.equal(g.towerCanDamage(t,boss),false);
 const e=g.spawnEnemy('Red');g.hitEnemy(e,0,{tower:t,glue:true,slow:t.slow,slowDuration:t.slowDuration,glueLayers:t.glueLayers});
 assert.equal(e.hp,1);assert.equal(g.cash,0);assert.equal(e.glueT,11);assert.equal(e.glueSlow,.5);assert.equal(e.glueLayers,3);assert.equal(e.glueLevel,1);assert.equal(g.towerCanDamage(t,e),false);
 g.updateGlueCoatings(e,11);assert.equal(g.towerCanDamage(t,e),true);
});
test('First, Last, Close and Strong choose among unglued eligible Bloons',()=>{
 const g=simulation(),t=g.createTower('glue',0,0);
 const targets=[g.spawnEnemy('Red'),g.spawnEnemy('Ceramic'),g.spawnEnemy('Blue'),g.spawnEnemy('Green')];
 targets.forEach((e,i)=>{e.dist=[5,9,2,12][i];g.placeEnemyOnTrack(e);});
 for(const [mode,index] of [['first',3],['last',2],['close',2],['strong',1]]){t.target=mode;assert.equal(g.chooseTarget(t,targets),targets[index]);}
 g.hitEnemy(targets[1],0,{tower:t,glue:true,slow:.5,slowDuration:11,glueLayers:3});t.target='strong';assert.equal(g.chooseTarget(t,targets),targets[3]);
});
test('every ranking and crosspath combination in the newer diagram obeys the precedence matrix',()=>{
 const g=simulation();
 const cases=[[[0,0,0],1],[[1,0,0],1],[[0,5,2],1],[[2,0,3],2],[[2,0,4],2],[[2,5,0],3],[[3,0,2],4],[[4,2,0],5],[[0,0,3],6],[[1,2,3],6],[[2,0,5],7],[[5,0,0],7],[[5,0,2],7],[[0,0,4],8],[[1,0,4],8],[[0,2,5],9],[[1,0,5],9]];
 for(const [paths,rank] of cases){
  const t={...g.createTower('glue',0,0),paths,moabGlue:paths[2]>=3};assert.equal(g.gluePriority(t),rank,paths.toString());
  for(const [otherPaths,otherRank] of cases){
   const e=g.spawnEnemy('Red'),other={...t,paths:otherPaths};g.hitEnemy(e,0,{tower:other,glue:true,slow:.5,slowDuration:11,glueLayers:3});
   const sameSuper=paths[2]>=5&&otherPaths[2]>=5&&rank===otherRank;
   assert.equal(g.towerCanDamage(t,e),rank>otherRank||sameSuper,`${paths} over ${otherPaths}`);
  }
 }
});
test('multiple coatings retain individual timers, latest slowdown, corrosion and rank after expiry',()=>{
 const g=simulation(),e=g.spawnEnemy('Ceramic'),acid={...g.createTower('glue',0,0),paths:[3,0,0]},strong={...g.createTower('glue',0,0),paths:[0,0,4]},base=g.createTower('glue',0,0);
 g.hitEnemy(e,0,{tower:acid,glue:true,slow:.5,slowDuration:11,glueLayers:99,glueDps:2});
 g.hitEnemy(e,0,{tower:strong,glue:true,slow:.25,slowDuration:3,glueLayers:3});
 assert.equal(e.glueCoatings.length,2);assert.equal(e.glueSlow,.25);assert.equal(e.glueDps,2);assert.equal(e.gluePriority,8);assert.equal(g.towerCanDamage(acid,e),false);
 g.updateGlueCoatings(e,3);assert.equal(e.hp,4);assert.equal(e.glueCoatings.length,1);assert.equal(e.glueT,8);assert.equal(e.glueSlow,.5);assert.equal(e.gluePriority,4);assert.equal(g.towerCanDamage(strong,e),true);assert.equal(g.towerCanDamage(base,e),false);
});
test('base glue soaks exactly three layers and propagates priority and remaining duration',()=>{
 const g=simulation(),t=g.createTower('glue',0,0);let e=g.spawnEnemy('Pink');
 g.hitEnemy(e,0,{tower:t,glue:true,slow:.5,slowDuration:11,glueLayers:3});g.updateGlueCoatings(e,2);
 for(const [type,layers] of [['Yellow',2],['Green',1],['Blue',0]]){
  e=g.destroyEnemyAndSpawnChildren(e)[0];assert.equal(e.type,type);assert.equal(e.glueLayers,layers);assert.equal(e.glueT,layers?9:0);assert.equal(g.towerCanDamage(t,e),layers===0);
 }
});
test('straight glue shots respect pierce, swept radius, speed and lifetime even on long frames',()=>{
 const g=simulation(),t=g.createTower('glue',0,0),far=g.spawnEnemy('Red'),near=g.spawnEnemy('Blue');far.dist=10;near.dist=5;near.laneOffset=1.20;g.placeEnemyOnTrack(far);g.placeEnemyOnTrack(near);g.enemies=[far,near];
 g.fireProjectile(t,far);const p=g.projectiles[0];assert.equal(p.mode,'linear');assert.equal(p.life,.43);assert.equal(p.radius,1.28);assert.equal(p.vx,96);assert.equal(p.pierceLeft,1);g.updateProjectiles(.2);assert.equal(near.glueT,11);assert.equal(far.glueT,0);assert.equal(near.hp,1);assert.equal(g.cash,0);
 const out=g.spawnEnemy('Red');out.seg=4;out.dist=4;g.placeEnemyOnTrack(out);g.enemies=[out];g.fireProjectile(t,out);g.updateProjectiles(1);assert.equal(out.glueT,0);
});
