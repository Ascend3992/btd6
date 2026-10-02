const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,upgrade}=require('./helpers/game.cjs');
function middle(g,t,tier){while(t.paths[1]<tier)upgrade(g,t,1)}
function close(actual,expected){assert(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`)}

test('middle upgrades set cooldowns and blimp bonus without permanently applying Turbo',()=>{
 const g=game(),t=g.createTower('boomer',0,0);
 upgrade(g,t,1);close(t.rate,.9);
 upgrade(g,t,1);close(t.rate,.675);assert.equal(t.projectileSpeedMult,1.5);
 upgrade(g,t,1);close(t.rate,.15);assert.equal(t.bonusMoab,1);
 upgrade(g,t,1);close(t.rate,.15);assert.equal(t.damage,1);
 upgrade(g,t,1);close(t.rate,.03);assert.equal(t.damage,4);assert.equal(t.bonusMoab,1);
 assert.equal(t.invest,325+175+250+1250+4200+35000);
});

test('Turbo activation, expiry and cooldown preserve purchased stats',()=>{
 const g=game(),t=g.createTower('boomer',0,0);g.towers.push(t);middle(g,t,4);
 assert(g.activateTowerAbility(t,'primary'));
 let attack=g.getAttackTower(t);close(attack.rate,.03);assert.equal(attack.damage,2);assert.equal(attack.sourceTower,t);
 assert.equal(t.abilityTimer,10);assert.equal(t.abilityCd,45);assert(!g.activateTowerAbility(t,'primary'));
 g.updateTowerAbility(t,0);assert.equal(t.abilityTimer,10);
 g.updateTowerAbility(t,10);attack=g.getAttackTower(t);close(attack.rate,.15);assert.equal(attack.damage,1);assert.equal(t.abilityCd,35);
 g.updateTowerAbility(t,35);assert(g.activateTowerAbility(t,'primary'));
});

test('Perma Charge Red Hot Rangs works in either purchase order',()=>{
 for(const hotFirst of [true,false]){
  const g=game(),t=g.createTower('boomer',0,0);g.towers.push(t);
  if(hotFirst){upgrade(g,t,2);upgrade(g,t,2)}
  middle(g,t,5);
  if(!hotFirst){upgrade(g,t,2);upgrade(g,t,2)}
  assert.equal(t.damage,8);assert.equal(t.damageType,'Heat');close(t.rate,.03);
  assert(g.activateTowerAbility(t,'primary'));const attack=g.getAttackTower(t);assert.equal(attack.damage,18);close(attack.rate,.03);assert.equal(t.abilityTimer,15);
  g.updateTowerAbility(t,15);assert.equal(g.getAttackTower(t).damage,8);close(g.getAttackTower(t).rate,.03);
 }
 const g=game(),t=g.createTower('boomer',0,0);g.towers.push(t);middle(g,t,5);g.activateTowerAbility(t,'primary');assert.equal(g.getAttackTower(t).damage,12);
});

test('upgrading during Turbo keeps Perma attack speed from multiplying again',()=>{
 const g=game(),t=g.createTower('boomer',0,0);g.towers.push(t);middle(g,t,4);g.activateTowerAbility(t,'primary');upgrade(g,t,1);
 close(g.getAttackTower(t).rate,.03);assert.equal(g.getAttackTower(t).damage,12);assert.equal(t.abilityTimer,10);
});

test('Faster Rangs speeds up both looping and ricocheting projectiles',()=>{
 for(const top of [0,2,3]){
  const g=game(),t=g.createTower('boomer',0,0),target={mesh:{position:{x:10,z:0}}};
  while(t.paths[0]<top)upgrade(g,t,0);
  g.fireProjectile(t,target);const before=g.projectiles.pop().speed;
  middle(g,t,2);g.fireProjectile(t,target);close(g.projectiles.pop().speed,before*1.5);
 }
});

test('fast-forward fires multiple throws per frame without storing idle volleys',()=>{
 const g=game(),t=g.createTower('boomer',0,0);g.towers.push(t);middle(g,t,5);
 const target={alive:true,mesh:{position:{x:10,z:0}}};let shots=0;g.chooseTarget=()=>target;g.fireProjectile=()=>shots++;
 for(let i=0;i<25;i++)g.updateTowers(.12);
 assert(shots>=100&&shots<=101,`Expected roughly 100 throws in 3 seconds, got ${shots}`);
 g.chooseTarget=()=>null;for(let i=0;i<100;i++)g.updateTowers(.12);
 g.chooseTarget=()=>target;shots=0;g.updateTowers(.12);assert(shots<=5);
});
