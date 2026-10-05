const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {game,mesh}=require('./helpers/game.cjs');
const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
function simulation(){
 const g=game();Object.assign(g,{THREE:{MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}},makeBloonMesh:mesh,makeBlimpMesh:mesh,spawnPopVisual(){},endGame(){}});
 g.PATH=Array.from({length:10},(_,i)=>({x:i*10,z:0,distanceTo:()=>10}));
 vm.runInContext(source.slice(source.indexOf('function normalizeSpawnName('),source.indexOf('// Distance along the whole track')),g);
 vm.runInContext(source.slice(source.indexOf('function setEnemyType('),source.indexOf('function damageIcicleFamily(')),g);
 return g;
}

test('blimp multiplier matches all supplied boundaries and grows continuously after Round 80',()=>{
 const g=simulation();
 for(const [round,m] of [[1,1],[80,1],[81,1.02],[100,1.4],[101,1.45],[124,2.6],[125,2.75],[150,6.5],[151,6.85],[250,41.5],[251,42.5],[300,91.5],[301,93],[400,241.5],[401,244],[500,491.5],[501,496.5],[600,991.5]])assert(Math.abs(g.blimpHealthMultiplier(round)-m)<1e-10,`${round}: ${m}`);
 for(let round=81;round<601;round++)assert(g.blimpHealthMultiplier(round)>g.blimpHealthMultiplier(round-1));
});

test('all blimp classes use the round multiplier, with Fortified doubling and unchanged pre-81 health',()=>{
 const g=simulation(),base={MOAB:200,BFB:700,ZOMG:4000,DDT:400,BAD:28000};
 for(const round of [80,81,100,124,150,250,500,501])for(const [type,hp] of Object.entries(base))for(const fort of [false,true]){
  g.round=round;const e=g.spawnEnemy({type,fort});assert(Math.abs(e.hp-hp*g.blimpHealthMultiplier(round)*(fort?2:1))<1e-7);assert.equal(e.maxHp,e.hp);
 }
});

test('every ceramic mutates at Round 81, remains flat later, and blimp children follow the same rule',()=>{
 const g=simulation();
 for(const round of [1,80,81,100,150,500,999])for(const fort of [false,true]){
  g.round=round;const e=g.spawnEnemy({type:'Ceramic',fort});assert.equal(e.hp,(round>=81?60:10)*(fort?2:1));assert.equal(e.superCeramic,round>=81);
  const moab=g.spawnEnemy({type:'MOAB',fort});const children=g.destroyEnemyAndSpawnChildren(moab);assert.equal(children.length,4);assert(children.every(e=>e.type==='Ceramic'&&e.hp===(round>=81?60:10)*(fort?2:1)));
 }
});

test('super ceramic children never duplicate, carry their properties, and keep a single lane down to Red',()=>{
 const g=simulation();g.round=81;let family=[g.spawnEnemy({type:'Ceramic',fort:true,camo:true,regrow:true})];const types=[];
 while(family.length){
  assert.equal(family.length,1);const e=family[0];types.push(e.type);assert.equal(e.superCeramic,true);assert.equal(e.fort,true);assert.equal(e.camo,true);assert.equal(e.regrow,true);assert.equal(e.laneOffset,0);
  family=g.destroyEnemyAndSpawnChildren(e);
 }
 assert.deepEqual(types,['Ceramic','Rainbow','Zebra','Black','Pink','Yellow','Green','Blue','Red']);
 g.round=80;const regular=g.spawnEnemy('Ceramic');assert.equal(g.destroyEnemyAndSpawnChildren(regular).length,2);
});

test('pre-81 branching and blimp families remain intact while scaled child blimps retain their spawn round',()=>{
 const g=simulation();g.round=80;let family=[g.spawnEnemy('Ceramic')];for(let i=0;i<4;i++)family=family.flatMap(e=>g.destroyEnemyAndSpawnChildren(e));assert.equal(family.length,16);assert(family.every(e=>e.type==='Pink'));
 g.round=100;const bfb=g.spawnEnemy('Fortified BFB');g.round=101;const kids=g.destroyEnemyAndSpawnChildren(bfb);assert.equal(kids.length,4);assert(kids.every(e=>e.hp===200*2*1.4&&e.spawnRound===100));
});

test('Regrow restores one lost layer per three seconds, keeps the ceiling, and preserves Super Ceramic rules',()=>{
 const g=simulation();g.round=81;const parent=g.spawnEnemy('Camo Regrow Fortified Ceramic');const [rainbow]=g.destroyEnemyAndSpawnChildren(parent);const [zebra]=g.destroyEnemyAndSpawnChildren(rainbow);
 g.updateRegrow(zebra,2.99);assert.equal(zebra.type,'Zebra');g.updateRegrow(zebra,.01);assert.equal(zebra.type,'Rainbow');assert.equal(zebra.regrowStack.length,1);
 g.updateRegrow(zebra,3);assert.equal(zebra.type,'Ceramic');assert.equal(zebra.hp,120);assert.equal(zebra.superCeramic,true);g.updateRegrow(zebra,30);assert.equal(zebra.type,'Ceramic');assert.equal(zebra.regrowStack.length,0);
 assert.equal(g.destroyEnemyAndSpawnChildren(zebra).length,1);
 const red=g.spawnEnemy({type:'Red',regrow:true,regrowStack:['Blue','Green']});g.updateRegrow(red,6.1);assert.equal(red.type,'Green');assert(Math.abs(red.regrowTimer-.1)<1e-10);
});

test('a damaged Regrow ceramic restores its shell after three seconds and fresh damage resets the timer',()=>{
 const g=simulation();g.round=81;const e=g.spawnEnemy('Regrow Ceramic');g.hitEnemy(e,7);g.updateRegrow(e,2);assert.equal(e.hp,53);g.hitEnemy(e,1);assert.equal(e.regrowTimer,0);g.updateRegrow(e,2.99);assert.equal(e.hp,52);g.updateRegrow(e,.01);assert.equal(e.hp,60);
 e.regrowTimer=2;g.hitEnemy(e,0);assert.equal(e.regrowTimer,2,'non-damaging status effects do not restart Regrow');
});
