const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {game,upgrade,mesh}=require('./helpers/game.cjs');
function simulation(){
 const g=game();Object.assign(g,{THREE:{MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}},makeBloonMesh:mesh,makeBlimpMesh:mesh,makeProjectileMesh:mesh,spawnPopVisual(){},spawnImpactVisual(){}});
 g.PATH=Array.from({length:10},(_,i)=>({x:i*10,z:0,distanceTo:()=>10}));
 const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function normalizeSpawnName('),source.indexOf('// Distance along the whole track')),g);return g;
}
function tower(g,top,middle=0,bottom=0){const t=g.createTower('glue',0,0);for(let i=0;i<top;i++)upgrade(g,t,0);for(let i=0;i<middle;i++)upgrade(g,t,1);for(let i=0;i<bottom;i++)upgrade(g,t,2);return t;}
function coat(g,t,e){g.hitGlueTarget(t,e);return e.glueCoatings[0];}
test('all five top upgrades have supplied prices, unlock XP and attack stats',()=>{
 const g=simulation(),expected=[[0,0,0,0,1,1],[2,1,1,1,1,1],[.5,1,2,1,2,.5],[.1,1,3,1,2,.5],[.1,1,8,6,5,.25]];
 const metadata=JSON.parse(vm.runInContext('JSON.stringify(glueTopUpgradeMetadata)',g));
 assert.deepEqual(metadata.map(x=>x.prices),[[170,200,215,240],[255,300,325,360],[1700,2000,2160,2400],[4250,5000,5400,6000],[19125,22500,24300,27000]]);assert.deepEqual(metadata.map(x=>x.xp),[150,550,2500,9000,37500]);
 for(let tier=1;tier<=5;tier++){const t=tower(g,tier),[interval,damage,ceramic,moab,pierce,rate]=expected[tier-1];assert.equal(t.glueLayers,99);assert.equal(t.corrosionInterval,interval);assert.equal(t.corrosionDamage,damage);assert.equal(t.corrosionCeramicDamage,ceramic);assert.equal(t.corrosionMoabDamage,moab);assert.equal(t.pierce,pierce);assert.equal(t.rate,rate);assert.equal(t.damage,0);assert.equal(t.shots,tier===5?2:1);}
});
test('corrosion ticks at supplied intervals and applies class-specific damage without damaging on impact',()=>{
 const g=simulation();g.round=81;
 for(const [tier,interval,ceramicDamage,moabDamage] of [[2,2,1,1],[3,.5,2,1],[4,.1,3,1],[5,.1,8,6]])for(const [type,damage] of [['Rainbow',1],['Ceramic',ceramicDamage],['MOAB',moabDamage]]){
  const t=tower(g,tier),e=g.spawnEnemy(type);t.slowDuration=20;e.hp=1000;e.maxHp=1000;coat(g,t,e);assert.equal(e.hp,1000);
  g.updateGlueCoatings(e,interval-.001);assert.equal(e.hp,1000,`${tier} ${type} early tick`);g.updateGlueCoatings(e,.001);assert.equal(e.hp,1000-damage,`${tier} ${type}`);
  g.updateGlueCoatings(e,interval*2);assert.equal(e.hp,1000-damage*3);
 }
});
test('corrosive glue targets blimps without slowing, halves duration and cannot soak through their shells',()=>{
 const g=simulation(),base=tower(g,1),t=tower(g,2),moab=g.spawnEnemy('MOAB');assert.equal(g.towerCanDamage(base,moab),false);assert(g.towerCanDamage(t,moab));
 coat(g,t,moab);assert.equal(moab.glueT,5.5);assert.equal(moab.glueSlow,1);g.updateGlueCoatings(moab,5.5);assert.equal(moab.hp,198);assert.equal(moab.glueT,0);
 coat(g,t,moab);const children=g.destroyEnemyAndSpawnChildren(moab);assert.equal(children.length,4);assert(children.every(e=>e.glueT===0&&e.glueLayers===0));
 const zebra=g.spawnEnemy('Zebra');coat(g,t,zebra);const regular=g.destroyEnemyAndSpawnChildren(zebra);assert(regular.every(e=>e.glueT===11&&e.glueLayers===98));
 const cross=tower(g,2,0,3),bfb=g.spawnEnemy('BFB');coat(g,cross,bfb);assert.equal(bfb.glueSlow,.625);assert.equal(bfb.glueT,24);
});
test('Ceramic corrosion bonuses do not spill into descendant damage',()=>{
 const g=simulation();g.round=81;const t=tower(g,5),e=g.spawnEnemy('Ceramic');e.hp=1;coat(g,t,e);g.updateGlueCoatings(e,.1);
 const children=g.enemies.filter(x=>x.alive);assert.equal(children.length,1);assert.equal(children[0].type,'Zebra','8-damage ceramic bonus becomes only 1 damage against Rainbow');assert.equal(children[0].glueT,10.9);
});
test('directly glued pops spawn one puddle; soaked child pops do not duplicate it',()=>{
 const g=simulation(),t=tower(g,4),e=g.spawnEnemy('Zebra');coat(g,t,e);const children=g.destroyEnemyAndSpawnChildren(e);assert.equal(g.acidPuddles.length,1);assert.equal(g.acidPuddles[0].damage,4);
 for(const child of children)g.destroyEnemyAndSpawnChildren(child);assert.equal(g.acidPuddles.length,1);
});
test('Solver puddles have supplied flat damage, crosspath pierce, lifetime extension and one-round carry',()=>{
 const g=simulation();
 for(const [middle,bottom,pierce,life,carry] of [[0,0,3,7.7,0],[1,0,4,7.7,0],[2,0,7,7.7,0],[0,1,3,16.8,1],[0,2,3,16.8,1]]){
  const t=tower(g,5,middle,bottom),e=g.spawnEnemy('Red');coat(g,t,e);g.destroyEnemyAndSpawnChildren(e);const p=g.acidPuddles.pop();assert.equal(p.damage,15);assert.equal(p.pierceLeft,pierce);assert.equal(p.life,life);assert.equal(p.roundCarry,carry);
 }
 const normal=g.spawnEnemy('Red'),sticky=g.spawnEnemy('Red');coat(g,tower(g,5),normal);coat(g,tower(g,5,0,1),sticky);g.destroyEnemyAndSpawnChildren(normal);g.destroyEnemyAndSpawnChildren(sticky);g.endRoundAcidPuddles();assert.equal(g.acidPuddles.length,1);assert.equal(g.acidPuddles[0].roundCarry,0);g.endRoundAcidPuddles();assert.equal(g.acidPuddles.length,0);
});
test('puddles damage already-glued Bloons only once, consume exact pierce and expire without removing Bloons',()=>{
 const g=simulation();g.round=81;const t=tower(g,5),e=g.spawnEnemy('Red');e.mesh.position.set(5,.65,0);coat(g,t,e);g.destroyEnemyAndSpawnChildren(e);
 const targets=Array.from({length:4},()=>{const x=g.spawnEnemy('Ceramic');x.mesh.position.set(5,.65,0);coat(g,t,x);return x;});g.updateAcidPuddles(.01);assert.equal(targets.filter(x=>x.hp===45).length,3);assert.equal(targets.filter(x=>x.hp===60).length,1);assert(targets.every(x=>x.alive));assert.equal(g.acidPuddles.length,0);
 const origin=g.spawnEnemy('Red');origin.mesh.position.set(9,.65,0);coat(g,t,origin);g.destroyEnemyAndSpawnChildren(origin);const target=g.spawnEnemy('Ceramic');target.mesh.position.set(9,.65,0);g.updateAcidPuddles(.01);assert.equal(target.hp,45);g.updateAcidPuddles(.01);assert.equal(target.hp,45);g.updateAcidPuddles(8);assert.equal(g.acidPuddles.length,0);assert(target.alive);
});
test('Solver launches two independently limited splatters and coats at most five per impact',()=>{
 const g=simulation(),t=tower(g,5);g.towers.push(t);
 const targets=Array.from({length:12},(_,i)=>{const e=g.spawnEnemy('Ceramic');e.mesh.position.set(8+i*.02,.65,0);return e;});g.updateTowers(.01);assert.equal(g.projectiles.length,2);assert(g.projectiles.every(p=>p.splashPierce===5&&p.pierceLeft===1&&p.glueSplash>0));g.updateProjectiles(.15);assert.equal(targets.filter(e=>e.glueT>0).length,10);assert(targets.every(e=>e.hp===10));
});
test('crosspath purchase order produces identical stats without compounding speed or pierce',()=>{
 const g=simulation();for(const [other,count] of [[1,2],[2,2]]){const a=tower(g,5,other===1?count:0,other===2?count:0),b=g.createTower('glue',0,0);for(let i=0;i<count;i++)upgrade(g,b,other);for(let i=0;i<5;i++)upgrade(g,b,0);
  for(const field of ['rate','pierce','shots','slow','slowDuration','corrosionInterval','corrosionCeramicDamage','corrosionMoabDamage'])assert.equal(a[field],b[field],field);assert.deepEqual(JSON.stringify(a.gluePuddleSettings),JSON.stringify(b.gluePuddleSettings));
 }
});
