const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {game,upgrade,enemy}=require('./helpers/game.cjs');

test('base Ice Monkey uses the supplied cost, range, rate, damage, pierce and freeze duration',()=>{
 const g=game(),t=g.createTower('ice',0,0);
 assert.equal(t.invest,400);assert.equal(t.range,25*.32);assert.equal(t.rate,2.4);assert.equal(t.damage,1);assert.equal(t.pierce,40);assert.equal(t.freeze,1.5);assert.equal(t.damageType,'Cold');assert.equal(t.camoDetect,false);
 assert.equal(vm.runInContext('towerDefs.ice.towerClass',g),'Primary');
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(towerDefs.ice.placementSurfaces)',g)),['land','water']);
});

test('base Ice freezes at most forty eligible bloons in its full range circle, with the correct cooldown',()=>{
 const g=game(),t=g.createTower('ice',0,0);g.towers.push(t);
 const targets=Array.from({length:41},()=>enemy(t.range,'Ceramic',10)),outside=enemy(t.range+.01,'Ceramic',10);
 const immune=['Lead','White','Zebra'].map(type=>enemy(3,type,10)),camo=enemy(3,'Ceramic',10);camo.camo=true;
 g.enemies=[...immune,camo,...targets,outside];g.roundActive=false;g.updateTowers(.1);assert(targets.every(e=>e.hp===10));
 g.roundActive=true;g.updateTowers(.01);assert.equal(targets.filter(e=>e.hp===9).length,40);assert(targets.slice(0,40).every(e=>e.freezeT===1.5));assert.equal(t.damageDealt,40);assert.equal(g.projectiles.length,0);
 for(const e of [...immune,camo,outside,targets[40]])assert.equal(e.hp,10);
 g.updateTowers(2.39);assert.equal(targets[0].hp,9);targets.forEach(e=>e.freezeT=0);g.updateTowers(.02);assert.equal(targets[0].hp,8);
 g.roundActive=false;g.updateTowers(5);assert.equal(targets[0].hp,8);
});

test('frozen bloons stop completely and a frame spanning thaw moves them only for its unfrozen portion',()=>{
 const g=game(),t=g.createTower('ice',0,0),e=enemy(3,'Ceramic',10);
 Object.assign(e,{freezeT:0,abilityFreezeT:0,abilitySlowT:0,abilitySlowMult:1,slowT:0,slowMult:1,glueT:0,glueAmpT:0,glueCarry:0,glueSlow:1,knockbackT:0,laneOffset:0});
 Object.assign(e.mesh,{rotation:{y:0},scale:{set(){}},userData:{}});g.enemies=[e];
 const speed=g.enemySpeed(e),start=g.progress(e);g.hitEnemy(e,1,{tower:t,freeze:t.freeze});assert.equal(e.freezeT,1.5);assert.equal(g.enemySpeed(e),0);
 g.moveEnemies(1);assert.equal(g.progress(e),start);assert.equal(e.freezeT,.5);
 g.moveEnemies(.6);assert.equal(e.freezeT,0);assert(Math.abs(g.progress(e)-start-speed*.1)<1e-10);assert.equal(g.enemySpeed(e),speed);
});

test('the newly exposed child layer receives the freeze when Ice pops its parent',()=>{
 const g=game(),t=g.createTower('ice',0,0),parent=enemy(3,'Blue',1),child=enemy(3,'Red',1);
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return e===parent?[child]:[]};g.hitEnemy(parent,t.damage,{tower:t,freeze:t.freeze});
 assert.equal(parent.alive,false);assert.equal(child.hp,1);assert.equal(child.freezeT,1.5);assert.equal(g.enemySpeed(child),0);assert.equal(t.damageDealt,1);
});

test('existing upgrades inherit the revised base range and freeze duration',()=>{
 const g=game(),range=g.createTower('ice',0,0),freeze=g.createTower('ice',0,0);
 upgrade(g,range,2);assert(Math.abs(range.range-32*.32)<1e-10);assert.equal(range.freeze,1.5);
 upgrade(g,freeze,1);upgrade(g,freeze,1);assert.equal(freeze.freeze,2.2);assert.equal(freeze.range,25*.32);
});
