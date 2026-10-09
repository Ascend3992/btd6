const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {game,upgrade,mesh}=require('./helpers/game.cjs');
function simulation(){const g=game();Object.assign(g,{THREE:{MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}},makeBloonMesh:mesh,makeBlimpMesh:mesh,makeProjectileMesh:mesh,spawnPopVisual(){}});g.PATH=Array.from({length:10},(_,i)=>({x:i*10,z:0,distanceTo:()=>10}));const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');vm.runInContext(source.slice(source.indexOf('function normalizeSpawnName('),source.indexOf('// Distance along the whole track')),g);return g;}
function glue(g,middle,top=0,bottom=0){const t=g.createTower('glue',0,0);for(let i=0;i<top;i++)upgrade(g,t,0);for(let i=0;i<middle;i++)upgrade(g,t,1);for(let i=0;i<bottom;i++)upgrade(g,t,2);return t;}
function ability(g,t){g.towers.push(t);assert(g.activateTowerAbility(t,'primary'));}
test('middle path has supplied prices, XP, pierce, splash, cooldown and Storm timing',()=>{
 const g=simulation(),data=JSON.parse(vm.runInContext('JSON.stringify(glueMiddleUpgradeMetadata)',g));assert.deepEqual(data.map(x=>x.prices),[[85,100,110,120],[825,970,1050,1165],[1655,1950,2105,2340],[3400,4000,4320,4800],[13600,16000,17280,19200]]);assert.deepEqual(data.map(x=>x.xp),[120,900,2500,8500,25000]);
 for(let tier=1;tier<=5;tier++){const t=glue(g,tier);assert.equal(t.pierce,tier===1?2:5);assert.equal(t.glueSplash>0,tier>=2);assert.equal(t.rate,tier>=3?1/3:1);assert.equal(t.slowDuration,11,'Storm extends only ability coats');assert.equal(t.damage,0);}
 const strike=g.getTowerAbilities(glue(g,4))[0],storm=g.getTowerAbilities(glue(g,5))[0];assert.equal(strike.coatDuration,12);assert.equal(storm.coatDuration,strike.coatDuration*2);assert.equal(storm.duration,20);assert.equal(storm.tick,1);
});
test('Bigger Globs pierces two eligible Bloons; Splatter coats a spatial cluster of at most five',()=>{
 const g=simulation(),t=glue(g,1),targets=['Red','Blue','Green'].map((type,i)=>{const e=g.spawnEnemy(type);e.mesh.position.set(4+i*2,.65,0);return e;});g.fireProjectile(t,targets[0]);g.updateProjectiles(.12);assert.equal(targets.filter(e=>e.glueT>0).length,2);
 const s=glue(g,2),cluster=Array.from({length:7},(_,i)=>{const e=g.spawnEnemy('Ceramic');e.mesh.position.set(4+i*.05,.65,5);return e;}),outside=g.spawnEnemy('Ceramic');outside.mesh.position.set(4,.65,10);g.enemies=[...cluster,outside];g.fireProjectile(s,cluster[0]);g.updateProjectiles(.15);assert.equal(cluster.filter(e=>e.glueT>0).length,5);assert.equal(outside.glueT,0);assert(cluster.every(e=>e.hp===10));
});
test('middle crosspath increases secondary puddle pierce and preserves top-path speed multipliers',()=>{
 const g=simulation();assert.equal(glue(g,0,4).gluePuddleSettings.pierce,3);assert.equal(glue(g,1,4).gluePuddleSettings.pierce,4);assert.equal(glue(g,2,4).gluePuddleSettings.pierce,5);assert.equal(glue(g,2,5).gluePuddleSettings.pierce,7);assert.equal(glue(g,3,2).rate,1/3);assert.equal(glue(g,2,3).rate,.5);
});
test('Strike covers every on-screen Bloon without damage and temporarily suppresses only Lead and Frozen properties',()=>{
 const g=simulation(),t=glue(g,4),targets=['Lead','White','Camo Lead','DDT','BAD','Purple'].map(x=>g.spawnEnemy(x));targets[1].freezeT=100;const frozen=g.spawnEnemy('Ceramic');frozen.freezeT=100;targets.push(frozen);
 const sharp=g.createTower('dart',0,0),cold=g.createTower('ice',0,0),bomb=g.createTower('bomb',0,0);assert.equal(g.towerCanDamage(sharp,targets[0]),false);assert.equal(g.towerCanDamage(sharp,frozen),false);const hp=targets.map(e=>e.hp);ability(g,t);
 assert.deepEqual(targets.map(e=>e.hp),hp);assert(targets.every(e=>e.glueT===12&&e.glueStrikeDamageAmp===2&&e.glueVulnerableT===12));assert.equal(targets[4].glueSlow,1);assert(g.towerCanDamage(sharp,targets[0]));assert(g.towerCanDamage(sharp,frozen));assert(g.towerCanDamage(cold,targets[0]));assert.equal(g.towerCanDamage(cold,targets[1]),false,'White immunity remains');assert.equal(g.towerCanDamage(sharp,targets[2]),false,'Camo remains');assert.equal(g.towerCanDamage(bomb,targets[3]),false,'DDT Camo/Black remain');assert.equal(frozen.freezeT,100,'movement freeze is preserved');
 for(const e of targets)g.updateGlueCoatings(e,12);assert.equal(g.towerCanDamage(sharp,targets[0]),false);assert.equal(g.towerCanDamage(sharp,frozen),false);assert(targets.every(e=>e.glueStrikeDamageAmp===0&&e.glueVulnerableT===0));
});
test('Strike adds exactly two to projectiles, corrosion and puddles, without multiplying child damage or zero-damage glue',()=>{
 const g=simulation(),t=glue(g,4,2),e=g.spawnEnemy('Ceramic');e.hp=1000;ability(g,t);g.hitEnemy(e,0,{tower:t});assert.equal(e.hp,1000);g.hitEnemy(e,1,{tower:g.createTower('dart',0,0)});assert.equal(e.hp,997);g.updateGlueCoatings(e,2);assert.equal(e.hp,994,'1 corrosion +2');g.damageAcidPuddleFamily({attack:{type:'acidPuddle',damageType:'Acid'},hitEnemies:new Set()},e,15);assert.equal(e.hp,977,'15 puddle +2');g.hitEnemy(e,1,{ignoreGlueAmp:true});assert.equal(e.hp,974,'periodic source receives +2');
 const blue=g.spawnEnemy('Blue');g.coatMapWithGlue(t,g.getTowerAbilities(t)[0]);const before=t.damageDealt;g.damageGlueFamily({source:t,damage:1},blue,1);assert.equal(t.damageDealt-before,2,'one bonus per hit, no re-amplification on Red');
});
test('ability vulnerability expires while a longer normal coating remains, and applies to soaked child layers',()=>{
 const g=simulation(),t=glue(g,4,2),e=g.spawnEnemy('Ceramic');e.hp=1000;e.freezeT=100;ability(g,t);t.slowDuration=60;g.hitGlueTarget(t,e);g.updateGlueCoatings(e,12);assert(e.glueT>0);assert.equal(e.glueVulnerableT,0);assert.equal(e.glueStrikeDamageAmp,0);assert.equal(g.towerCanDamage(g.createTower('dart',0,0),e),false);
 const blue=g.spawnEnemy('Blue');g.coatMapWithGlue(t,g.getTowerAbilities(t)[0]);const child=g.destroyEnemyAndSpawnChildren(blue)[0];assert.equal(child.glueVulnerableT,12);assert.equal(child.glueStrikeDamageAmp,2);
});
test('Storm runs for twenty seconds, pulses once per second, includes new arrivals and stops at expiry',()=>{
 const g=simulation(),t=glue(g,5),first=g.spawnEnemy('Lead');let pulses=0;const original=g.coatMapWithGlue;g.coatMapWithGlue=(...args)=>{pulses++;original(...args);};ability(g,t);assert.equal(pulses,1);assert.equal(first.glueT,24);assert.equal(t.abilityTimer,20);
 g.updateTowerAbility(t,.99);const newArrival=g.spawnEnemy('Camo Ceramic');assert.equal(newArrival.glueT,0);assert.equal(pulses,1);g.updateTowerAbility(t,.01);assert.equal(pulses,2);assert.equal(newArrival.glueT,24);g.updateTowerAbility(t,19);assert.equal(t.abilityTimer,0);assert.equal(pulses,20);assert.equal(t.activeAbility,null);assert.equal(t.abilityCd,10);const after=g.spawnEnemy('Red');g.updateTowerAbility(t,1);assert.equal(after.glueT,0);assert.equal(pulses,20);assert.equal(g.activateTowerAbility(t,'primary'),false);
 const h=simulation(),other=glue(h,5);let longPulses=0;h.coatMapWithGlue=()=>longPulses++;ability(h,other);h.updateTowerAbility(other,25);assert.equal(longPulses,20);assert.equal(other.abilityTimer,0);
});
