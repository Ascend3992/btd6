const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {game,enemy}=require('./helpers/game.cjs');
function hero(g,level=1){const t=g.createTower('hero',0,0);g.towers.push(t);g.syncQuincyStats(t,level);return t;}
function target(g,x,type='Red',z=0){const e=enemy(x,type);e.mesh.position.z=z;g.enemies.push(e);return e;}
test('all 20 supplied Quincy levels have the correct metadata and cumulative attack stats',()=>{
 const g=game(),t=hero(g),data=JSON.parse(vm.runInContext('JSON.stringify(quincyLevelMetadata)',g));
 assert.deepEqual(data.map(d=>d.cost),[540,180,460,1000,1860,3280,5180,8320,9380,13620,16380,14400,16650,14940,16380,17820,19260,20700,16470,17280]);assert.deepEqual(data.map(d=>d.xp),[0,...data.slice(1).map(d=>d.cost)]);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(quincyTuning.costs)',g)),[460,540,585,650]);
 for(let level=1;level<=20;level++){
  g.syncQuincyStats(t,level);assert.equal(t.damage,1);assert.equal(t.damageType,'Sharp');assert.equal(t.pierce,level>=19?9:level>=12?7:level>=9?6:level>=2?4:3);assert.equal(t.shots,level>=19?3:level>=6?2:1);assert.equal(t.rate,level>=20?.2:level>=18?.25:level>=16?.4:level>=11?.6:.95);assert.equal(t.range,(level>=13?54:level>=4?52:50)*.32);assert.equal(t.camoDetect,level>=5);assert.equal(t.bonusMoab,level>=14?3:level>=8?2:0);assert.equal(t.explosionEvery,level>=17?2:level>=7?3:0);assert.equal(t.projectileLifeMult,level>=17?1.25:1);assert(!t.camoPriority);
 }
});
test('Rapid Shot and Storm unlock with initial cooldowns; Rapid upgrades preserve their exact durations and multipliers',()=>{
 const g=game(),t=hero(g);g.syncQuincyStats(t,3);assert.equal(t.rapidCd,16.7);assert.equal(g.activateTowerAbility(t,'rapid'),false);g.updateQuincyAbilities(t,16.7);assert(g.activateTowerAbility(t,'rapid'));assert.equal(t.rapidTimer,8);assert.equal(t.rapidCd,60);
 g.syncQuincyStats(t,10);assert.equal(t.stormCd,23.33);assert.equal(g.activateTowerAbility(t,'storm'),false);g.updateQuincyAbilities(t,23.33);assert(g.activateTowerAbility(t,'storm'));assert.equal(t.stormTimer,3);assert.equal(t.stormCd,70);
 for(const [level,duration,cooldown,multiplier] of [[13,12,60,3],[15,12,45,4],[20,12,45,4]]){const h=game(),q=hero(h,level);q.rapidCd=0;assert(h.activateTowerAbility(q,'rapid'));assert.equal(q.rapidTimer,duration);assert.equal(q.rapidCd,cooldown);h.round=1+(level-1)*5;target(h,4);h.updateTowers(.01);assert(Math.abs(q.cool-(q.rate/multiplier-.01))<1e-9);}
 const old=t.stormCd;g.syncQuincyStats(t,11);assert.equal(t.stormCd,old,'level changes do not restart initial cooldowns');
});
test('arrows really bounce within 50 units, use their own pierce budget, avoid repeat hits and expire at level-17 lifetime',()=>{
 const g=game(),t=hero(g,2),a=target(g,4),b=target(g,12),c=target(g,24),far=target(g,41);g.fireProjectile(t,a);const p=g.projectiles[0];assert.equal(p.mode,'quincyArrow');assert.equal(p.bounceRange,16);g.updateQuincyArrow(p,1.3);assert.equal(a.hp,9999);assert.equal(b.hp,9999);assert.equal(c.hp,9999);assert.equal(far.hp,10000);assert(p.dead);assert.equal(p.hitEnemies.size,3);
 const h=game(),q=hero(h,19),targets=Array.from({length:10},(_,i)=>target(h,4+i*.5));h.fireProjectile(q,targets[0]);const arrow=h.projectiles[0];h.updateQuincyArrow(arrow,1);assert.equal(targets.filter(e=>e.hp===9999).length,9);assert(arrow.dead);assert.equal(arrow.pierceLeft,0);
 const life=game(),before=hero(life,16),e=target(life,20);life.fireProjectile(before,e);assert.equal(life.projectiles[0].life,1.4);life.syncQuincyStats(before,17);life.fireProjectile(before,e);assert.equal(life.projectiles[1].life,1.75);life.updateQuincyArrow(life.projectiles[1],2);assert(life.projectiles[1].dead);
});
test('each arrow in the third/second volley explodes on impact and continues bouncing, with independent 10-pierce bursts',()=>{
 for(const [level,every,bonus] of [[7,3,0],[8,3,2],[14,3,3],[17,2,3]]){
  const g=game(),t=hero(g,level),moab=target(g,8,'MOAB');t.shotCounter=every-1;
  for(let i=0;i<t.shots;i++)g.fireProjectile(t,moab,t.damage,{visualSpread:(i-(t.shots-1)/2)*.18});assert(g.projectiles.every(p=>p.explosive));assert.equal(moab.hp,10000,'no damage at launch');g.updateQuincyArrow(g.projectiles[0],.3);assert.equal(moab.hp,10000-2*(1+bonus));
  t.shotCounter=every;g.fireProjectile(t,moab);assert.equal(g.projectiles.at(-1).explosive,false);
 }
 const g=game(),t=hero(g,7),host=target(g,4),near=Array.from({length:12},()=>target(g,6)),out=target(g,13);t.shotCounter=2;g.fireProjectile(t,host);const p=g.projectiles[0];g.updateQuincyArrow(p,.09);assert.equal(host.hp,9998,'original target takes the arrow and its independent explosion');assert.equal(near.filter(e=>e.hp===9999).length,9);assert.equal(out.hp,10000);assert(p.pierceLeft>0);assert(!p.dead);
 const hostHp=host.hp;g.updateQuincyArrow(p,.5);assert.equal(host.hp,hostHp,'the same arrow explodes only on its initial impact');assert(p.dead);
});
test('Storm centers on the chosen First/Last/Close/Strong target, stays fixed, and hits new arrivals within its area',()=>{
 for(const [mode,index] of [['first',2],['last',0],['close',0],['strong',1]]){
  const g=game(),t=hero(g,10),targets=[target(g,4),target(g,40,'MOAB'),target(g,80)];t.target=mode;t.stormCd=0;assert(g.activateTowerAbility(t,'storm'));assert.equal(t.stormCenter.x,targets[index].mesh.position.x);
 }
 const g=game(),t=hero(g,10),chosen=target(g,80);t.stormCd=0;g.Math=Object.create(Math);g.Math.random=()=>0;assert(g.activateTowerAbility(t,'storm'));chosen.mesh.position.x=150;const late=target(g,81),outside=target(g,40);g.updateQuincyAbilities(t,.1);assert(late.hp<10000);assert.equal(outside.hp,10000);assert.equal(chosen.hp,10000);assert.equal(t.stormCenter.x,80);
});
test('automatic level stats and initial ability cooldowns update even while the normal attack is cooling down',()=>{
 const g=game(),t=hero(g);g.updateHeroAppearance=()=>{};t.cool=100;g.round=11;g.updateTowers(.1);assert.equal(t.level,3);assert(Math.abs(t.rapidCd-16.6)<1e-9);g.updateTowers(.1);assert(Math.abs(t.rapidCd-16.5)<1e-9);g.round=46;g.updateTowers(.1);assert.equal(t.level,10);assert(Math.abs(t.stormCd-23.23)<1e-9);g.roundActive=false;const cd=t.stormCd;g.updateTowers(.5);assert.equal(t.stormCd,cd);
});
test('Rapid Shot keeps its full firing rate at different frame sizes and game speeds, and pauses between rounds',()=>{
 const counts=[];for(const dt of [1/30,1/60,1/120,.04,.12]){const g=game(),t=hero(g,20);g.round=96;target(g,4);t.rapidTimer=12;for(let elapsed=0;elapsed<1-1e-9;elapsed+=dt)g.updateTowers(Math.min(dt,1-elapsed));counts.push(t.shotCounter);assert.equal(g.projectiles.length,t.shotCounter*3);g.roundActive=false;const count=t.shotCounter,cool=t.cool;g.updateTowers(1);assert.equal(t.shotCounter,count);assert.equal(t.cool,cool);}assert(counts.every(count=>count===21),counts.join(','));
});
test('Quincy gains Camo detection at 5 without priority; exploding arrows can acquire Lead while ordinary arrows cannot',()=>{
 const g=game(),t=hero(g,4),camo=target(g,4);camo.camo=true;assert.equal(g.towerCanDamage(t,camo),false);g.syncQuincyStats(t,5);assert(g.towerCanDamage(t,camo));assert(!t.camoPriority);
 g.syncQuincyStats(t,7);const lead=target(g,4,'Lead'),black=target(g,4,'Black');assert.equal(g.quincyCanTarget(t,lead),false);t.shotCounter=2;assert(g.quincyCanTarget(t,lead));g.fireProjectile(t,lead);g.updateQuincyArrow(g.projectiles[0],.09);assert.equal(lead.hp,9999);assert.equal(black.hp,10000,'explosion retains Black immunity');
});
function storm(level,dt,random=()=>0){const g=game(),t=hero(g,level);g.Math=Object.create(Math);g.Math.random=random;t.stormCd=0;const center=target(g,0);t.target='close';const ordinary=target(g,4),ceramic=target(g,8,'Ceramic'),moab=target(g,12,'MOAB'),edge=target(g,32),far=target(g,32.01),camo=target(g,6);camo.camo=true;assert(g.activateTowerAbility(t,'storm'));for(let elapsed=0;elapsed<3-1e-9;elapsed+=dt)g.updateQuincyAbilities(t,Math.min(dt,3-elapsed));return {g,t,ordinary,ceramic,moab,edge,far,camo};}
test('Storm uses a 100-unit radius, exact class damage, full 3-second window and 0.05-second rehit limit',()=>{
 for(const [level,normal,ceramic,moab,cooldown] of [[10,6,6,12,70],[18,6,24,12,55],[20,10,34,20,55]]){const s=storm(level,3);assert.equal(s.ordinary.hp,10000-60*normal);assert.equal(s.ceramic.hp,10000-60*ceramic);assert.equal(s.moab.hp,10000-60*moab);assert.equal(s.edge.hp,s.ordinary.hp);assert.equal(s.far.hp,10000);assert.equal(s.camo.hp,s.ordinary.hp);assert.equal(s.t.stormTimer,0);assert(Math.abs(s.t.stormClock-3)<1e-9);assert.equal(s.t.stormCd,cooldown-3);assert.equal(s.t.stormHits.size,0);const hp=s.moab.hp;s.g.updateQuincyAbilities(s.t,1);assert.equal(s.moab.hp,hp);}
});
test('Storm probabilities match supplied 60-FPS chances and give identical seeded damage at 30/60/120 FPS and speed multipliers',()=>{
 for(const [level,roll,hits] of [[10,.06,false],[18,.06,true],[18,.08,false],[20,.08,true],[20,.11,false]])assert.equal(storm(level,.1,()=>roll).ordinary.hp<10000,hits);
 const results=[];for(const dt of [1/30,1/60,1/120,.04,.12,3]){let seed=123;const s=storm(20,dt,()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296});results.push([s.ordinary.hp,s.ceramic.hp,s.moab.hp,s.camo.hp]);}for(const r of results)assert.deepEqual(r,results[0]);
 const g=game(),t=hero(g,10);t.stormCd=0;assert(g.activateTowerAbility(t,'storm'));g.updateQuincyAbilities(t,0);assert.equal(t.stormTimer,3);assert.equal(t.stormCd,70);
});
