const {test}=require('node:test'),assert=require('node:assert/strict');
const {game,upgrade}=require('./helpers/game.cjs');
const orders=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
test('normal crosspath locks remain; Ultimate allows all three paths without removing Tier 5 limits',()=>{
 const g=game();for(const [paths,p,blocked] of [[[5,0,0],1,false],[[5,2,0],1,true],[[5,2,0],2,true],[[2,2,0],2,true],[[2,2,0],0,false],[[3,3,0],0,true]]){
  assert.equal(g.upgradePathBlocked(paths,p),blocked);assert.equal(g.upgradePathBlocked(paths,p,true),false);
 }
 const a=g.createTower('dart',0,0),b=g.createTower('dart',5,0);g.towers.push(a,b);a.paths=[5,0,0];b.paths=[4,5,5];g.ultimateCrosspathing=true;assert(g.tierFiveTaken(b,0));assert(!g.tierFiveTaken(b,1));
});
test('every primary tower reaches 5-5-5 in any purchase order with deterministic, finite stats and retained abilities',()=>{
 for(const type of ['dart','boomer','bomb','tack','ice','glue']){
  let expected;
  for(const order of orders){const g=game(),t=g.createTower(type,0,0);g.towers.push(t);for(const p of order)for(let i=0;i<5;i++)upgrade(g,t,p);
   assert.deepEqual(Array.from(t.paths),[5,5,5]);for(const key of ['damage','range','pierce','rate','invest'])assert(Number.isFinite(t[key]),`${type} invalid ${key}`);assert(t.rate>0&&t.range>0&&t.pierce>0);
   const stats=JSON.stringify(['damage','range','pierce','rate','invest','bonusMoab','ceramicBonus','damageType','camoDetect','shots'].map(k=>t[k]));if(expected)assert.equal(stats,expected,`${type} purchase order ${order}`);expected=stats;
   assert(g.getTowerAbilities(t).some(a=>a.key==='primary'),`${type} middle-path ability missing`);if(type==='bomb')assert(g.getTowerAbilities(t).some(a=>a.key==='blitz'));
  }
 }
});
test('Place Anywhere bypasses paths, water, overlaps and edge clearance while preserving bounds, prices and hero limit',()=>{
 const g=game();g.EDGE_WIDTH=4;g.cash=10000;const e=g.createTower('mib',10,10);g.towers.push(e);
 assert.equal(g.placementProblem('dart',10,10),'Too close to another tower');g.placeAnywhere=true;assert.equal(g.placementProblem('dart',10,10),'');g.placeAnywhere=false;
 g.PATH=[{x:-10,z:0},{x:10,z:0}];assert.equal(g.placementProblem('dart',0,0),'Cannot place on the path');g.placeAnywhere=true;assert.equal(g.placementProblem('dart',0,0),'');
 assert.equal(g.placementProblem('dart',50,50),'');assert(g.placementProblem('dart',50.001,0));assert(g.placementProblem('dart',0,-50.001));assert(g.placementProblem('dart',NaN,0));
 g.cash=0;assert.equal(g.placementProblem('dart',0,0),'Not enough cash');assert.equal(g.placementProblem('mib',0,0),'');g.cash=10000;g.heroPlaced=true;assert.equal(g.placementProblem('hero',0,0),'Only one hero');
 g.placeAnywhere=false;g.PATH=[];g.heroPlaced=false;require('node:vm').runInContext('waterRegions.push({minX:20,maxX:30,minZ:20,maxZ:30})',g);assert.equal(g.placementProblem('dart',25,25),'Place this tower on land or frozen water');g.placeAnywhere=true;assert.equal(g.placementProblem('dart',25,25),'');g.placeAnywhere=false;assert(g.placementProblem('dart',50,50));assert.equal(g.towers.length,1,'switching off retains placed towers');
});
test('clicking an overlapping stack cycles every tower, even after switching Place Anywhere off',()=>{
 const g=game(),stack=['dart','boomer','hero'].map(type=>g.createTower(type,4,6));g.towers.push(...stack);g.placeAnywhere=false;
 for(let i=0;i<7;i++){const selected=g.towerAtPoint(4,6);assert.equal(selected,stack[i%3]);g.selectedTower=selected;}
 assert.equal(g.towerAtPoint(40,40),null);g.towers.splice(1);g.selectedTower=stack[0];assert.equal(g.towerAtPoint(4,6),null,'single tower retains click-again deselection');
});
