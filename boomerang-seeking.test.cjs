const {test}=require('node:test'),assert=require('node:assert/strict');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function simulate({paths=[0,0,0],hand=1,dt=.02,special=false,velocity=9}){
 const g=game(),t=g.createTower('boomer',0,0);t.throwHand=hand;paths.forEach((n,p)=>{for(let i=0;i<n;i++)upgrade(g,t,p)});const e=enemy(6,'Pink');e.mesh.position.z=-4;g.enemies.push(e);if(special){e.type='MOAB';e.isBlimp=true;g.fireKylieProjectile(t,e,{special:true})}else g.fireProjectile(t,e);const p=g.projectiles[0];
 let steps=0;for(;steps<200&&!p.dead;steps++){e.mesh.position.z+=velocity*dt;g.updateProjectiles(dt)}return {g,t,e,p,steps};
}
test('ordinary, glaive, middle and Kylie rangs hit Bloons moving across their aim at normal and fast-forward steps',()=>{
 for(const paths of [[0,0,0],[2,0,0],[0,3,0],[0,5,0],[0,0,3],[0,0,5],[3,0,0]])for(const hand of [-1,1])for(const dt of [.01,.04,.12]){const {t,e,p}=simulate({paths,hand,dt});assert(t.damageDealt>0,`${paths} hand ${hand} dt ${dt} missed`);assert(e.hp<10000);assert(p.dead,'finite throw lifecycle');}
 const {t}=simulate({paths:[0,0,4],special:true});assert(t.damageDealt>=5,'Press special tracks its moving blimp');
});
test('a base rang reaches close stationary targets and preserves pierce, one hit per enemy and return to the source',()=>{
 for(const hand of [-1,1]){const g=game(),t=g.createTower('boomer',0,0);t.throwHand=hand;const e=enemy(4);g.enemies.push(e);g.fireProjectile(t,e);const p=g.projectiles[0];for(let i=0;i<200&&!p.dead;i++)g.updateProjectiles(.02);assert.equal(e.hp,9999);assert.equal(p.pierceLeft,3);assert(p.dead);assert(Math.hypot(p.mesh.position.x,p.mesh.position.z)<1e-7);}
 const g=game(),t=g.createTower('boomer',0,0);for(let i=1;i<=8;i++)g.enemies.push(enemy(i));g.fireProjectile(t,g.enemies[0]);const p=g.projectiles[0];for(let i=0;i<200&&!p.dead;i++)g.updateProjectiles(.02);assert.equal(t.damageDealt,4);assert.equal(p.pierceLeft,0);
});
test('lost targets reacquire eligible Bloons without bypassing Camo, Lead, Frozen or range restrictions',()=>{
 for(const kylie of [false,true]){const g=game(),t=g.createTower('boomer',0,0);if(kylie)for(let i=0;i<3;i++)upgrade(g,t,2);const first=enemy(6),live=enemy(4),camo=enemy(2),lead=enemy(2,'Lead'),frozen=enemy(2),outside=enemy(100);camo.camo=true;frozen.freezeT=10;g.enemies.push(first,camo,lead,frozen,outside,live);g.fireProjectile(t,first);const p=g.projectiles[0];first.alive=false;for(let i=0;i<200&&!p.dead;i++)g.updateProjectiles(.02);assert(live.hp<10000);for(const e of (kylie?[camo,outside]:[camo,lead,frozen,outside]))assert.equal(e.hp,10000);assert(p.dead);}
});
