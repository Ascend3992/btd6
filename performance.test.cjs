const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {game,enemy}=require('./helpers/game.cjs');

test('linear target selection preserves all targeting modes, stable ties and Camo priority',()=>{
 const g=game();
 const candidates=[enemy(4,'Pink'),enemy(8,'Ceramic'),enemy(6,'MOAB',500),enemy(3,'Blue'),enemy(3,'Blue')];candidates[0].camo=true;
 const t={type:'dart',damageType:'Normal',camoDetect:true,range:10,x:0,z:0};
 for(const [mode,index] of [['first',1],['last',3],['strong',2],['close',3]]){t.target=mode;assert.equal(g.chooseTarget(t,candidates),candidates[index]);}
 t.camoPriority=true;for(const mode of ['first','last','strong','close']){t.target=mode;assert.equal(g.chooseTarget(t,candidates),candidates[0]);}
 candidates[0].alive=false;t.target='first';assert.equal(g.chooseTarget(t,candidates),candidates[1]);
});

test('bulk damage preserves hp, pop income, damage credit and excess damage for child processing',()=>{
 const g=game(),source=g.createTower('bomb',0,0),parent=enemy(2,'MOAB',28000),children=[enemy(2,'Ceramic',10),enemy(2,'Ceramic',10)];
 g.destroyEnemyAndSpawnChildren=e=>{e.alive=false;return children;};
 const result=g.hitEnemy(parent,50000,{tower:source});assert.equal(source.damageDealt,28000);assert.equal(result.remainingDamage,22000);assert.equal(result.children,children);assert.equal(g.cash,1);
 g.round=98;const ceramic=enemy(2,'Ceramic',60);g.hitEnemy(ceramic,60,{tower:source});assert(Math.abs(g.cash-13)<1e-10);assert.equal(source.damageDealt,28060);
});

test('many hits coalesce their HUD updates into one frame',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');let writes=0;
 const el=()=>({set textContent(value){writes++;}}),button={dataset:{tower:'dart'},set disabled(value){writes++;}};
 const context={lives:100,cash:650,round:98,heroPlaced:false,livesEl:el(),cashEl:el(),roundEl:el(),shopBtns:[button],towerDefs:{dart:{cost:200}},formatCash:String};vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('let uiDirty='),source.indexOf('function selectShop(')),context);
 for(let i=0;i<3200;i++)context.updateUI();assert.equal(writes,0);context.flushUI();assert.equal(writes,4);context.flushUI();assert.equal(writes,4);
});

test('collision filtering preserves swept hits near the path edge and clips travel to projectile lifetime',()=>{
 const g=game(),t={type:'dart',x:0,z:0,damage:1,range:50,damageType:'Normal',camoDetect:true};
 const hit=enemy(8,'Ceramic',10),outside=enemy(8,'Ceramic',10),pastLifetime=enemy(15,'Ceramic',10);
 hit.mesh.position.z=.44;outside.mesh.position.z=.451;g.enemies=[hit,outside,pastLifetime];
 g.fireLinearProjectile(t,0,{cosmetic:false,speed:100,life:.1,radius:.45,pierce:3});g.updateProjectiles(.2);
 assert.equal(hit.hp,9);assert.equal(outside.hp,10);assert.equal(pastLifetime.hp,10);
});
