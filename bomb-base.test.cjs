const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game,enemy}=require('./helpers/game.cjs');

test('base Bomb Shooter uses Medium pricing and scaled range/radius',()=>{
 const g=game(),t=g.createTower('bomb',0,0);
 assert.equal(t.invest,600);assert.equal(t.damage,1);assert.equal(t.pierce,22);
 assert.equal(t.rate,1.5);assert.equal(t.range,40*.32);assert.equal(t.splash,12*.32);
 assert.equal(t.damageType,'Explosion');assert.equal(t.camoDetect,false);
});

test('base explosions pop Lead but respect Black, Zebra, DDT and Camo immunities',()=>{
 const g=game(),t=g.createTower('bomb',0,0);
 assert(g.towerCanDamage(t,enemy(4,'Lead')));
 for(const type of ['Black','Zebra','DDT'])assert(!g.towerCanDamage(t,enemy(4,type)),type);
 const camo=enemy(4,'Red');camo.camo=true;assert(!g.towerCanDamage(t,camo));
 assert(!g.towerCanDamage({...t,camoDetect:true},enemy(4,'DDT')),'Camo detection alone does not bypass DDT explosion immunity');
});

test('base explosion damages at most 22 eligible bloons within 12 game units',()=>{
 const g=game(),t=g.createTower('bomb',0,0),target=enemy(5);
 const immune=enemy(5,'Black'),near=Array.from({length:24},()=>enemy(5+11.9*.32));
 const outside=enemy(5+12.1*.32),camo=enemy(5);camo.camo=true;
 g.enemies=[target,immune,camo,...near,outside];
 g.fireProjectile(t,target);g.updateProjectiles(1);
 assert.equal(target.hp,9999);assert.equal(near.filter(e=>e.hp===9999).length,21);
 assert.equal(immune.hp,10000);assert.equal(camo.hp,10000);assert.equal(outside.hp,10000);
 assert.equal(t.damageDealt,22);
});
