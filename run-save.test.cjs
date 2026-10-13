const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {game,upgrade}=require('./helpers/game.cjs');
function codec(){const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','run-save.js'),'utf8').replaceAll('export const','const').replaceAll('export function','function'),context);return context;}
function fixture(){
 const g=game(),c=codec(),definitions=Object.fromEntries(['dart','boomer','bomb','tack','ice','glue','hero'].map(type=>[type,{hero:type==='hero'}]));
 const paths=[[2,5,0],[2,4,0],[5,0,2],[0,5,2],[2,0,5],[4,2,0],[0,0,0]];
 for(const [i,type] of Object.keys(definitions).entries()){const t=g.createTower(type,-21+i*6,3);g.towers.push(t);paths[i].forEach((count,p)=>{for(let n=0;n<count;n++)upgrade(g,t,p);});t.damageDealt=1000+i;t.cool=.13;t.target='strong';}
 g.syncQuincyStats(g.towers[6],12);g.towers[1].throwHand=-1;g.towers[1].abilityTimer=7;g.towers[1].abilityCd=40;g.towers[1].activeAbility=g.getTowerAbilities(g.towers[1])[0];g.towers[0].fanBuffs=[{sourceId:99,tier:5,remaining:9}];
 const rules={definitions,width:66,height:54};
 const state={round:60,cash:1234.5,lives:72,speed:3,autoStart:true,roundInProgress:true,effectsVolume:.35,musicVolume:0,absoluteZeroBuffT:8,nextTowerId:100,selectedTowerId:g.towers[1].id,towers:g.towers,usage:{dart:1719,glue:26},
  puddles:[{x:4,z:3,radius:1.28,life:6,totalLife:7.7,pierceLeft:3,damage:15,roundCarry:0,attack:{sourceTower:g.towers[5],camoDetect:false},hitEnemies:new Set()}]};
 return {g,c,rules,state,saved:c.captureRunSave(state,rules)};
}
const clone=s=>JSON.parse(JSON.stringify(s));
test('round 60 snapshot round-trips all towers, upgrades, resources, timers, XP, hand, buffs and persistent puddles without meshes',()=>{
 const {c,rules,saved}=fixture();assert(saved);const restored=c.validateRunSave(clone(saved),rules);assert(restored);assert.equal(restored.round,60);assert.equal(restored.cash,1234.5);assert.equal(restored.lives,72);assert.equal(restored.towers.length,7);assert.equal(restored.towers[1].throwHand,-1);assert.equal(restored.towers[1].activeAbilityKey,'primary');assert.equal(restored.towers[1].runtime.abilityCd,40);assert.equal(restored.towers[6].level,12);assert.equal(restored.nextTowerId,100);assert.equal(restored.towers[0].fanBuffs[0].sourceId,99);assert.equal(restored.usage.dart,1719);assert.equal(restored.puddles[0].sourceId,restored.towers[5].id);assert.equal(restored.puddles[0].pierceLeft,3);assert.equal(JSON.stringify(restored),JSON.stringify(saved));assert(!JSON.stringify(saved).includes('mesh'));
});
test('snapshot owns its arrays and counters; subsequent combat and purchases cannot mutate the round-start checkpoint',()=>{
 const {state,saved}=fixture(),original=JSON.stringify(saved);state.towers[0].paths[0]=5;state.towers[0].damageDealt+=999;state.towers[0].fanBuffs[0].remaining=0;state.cash+=50;state.usage.dart+=20;state.puddles[0].pierceLeft=0;assert.equal(JSON.stringify(saved),original);
});
test('invalid versions, map, money, towers, crosspaths, duplicate Tier 5s, IDs, coordinates, timers and XP are rejected',()=>{
 const {c,rules,saved}=fixture();
 for(const mutate of [s=>s.version=99,s=>s.map='unknown',s=>s.round=101,s=>s.cash=-1,s=>s.lives=0,s=>s.speed=4,s=>s.towers[0].type='constructor',s=>s.towers[0].paths=[1,1,1],s=>s.towers[0].paths=[3,3,0],s=>s.towers[1].id=s.towers[0].id,s=>s.towers[0].x=1e8,s=>s.towers[0].runtime.cool=null,s=>s.usage.dart=-5,s=>s.selectedTowerId=500,s=>s.nextTowerId=8,s=>s.towers.push({...s.towers[0],id:8}),s=>s.towers.push({...s.towers[6],id:8})]){const bad=clone(saved);mutate(bad);assert.equal(c.validateRunSave(bad,rules),null);}
 const raw=clone(saved);raw.cash=NaN;assert.equal(c.validateRunSave(raw,rules),null);
});
test('storage operations are atomic, use only the run key, tolerate corrupt/oversized/blocked storage and keep the last good save on quota failure',()=>{
 const {c,rules,saved}=fixture(),data=new Map([['unrelated','keep']]),errors=[];let fail=false;
 const storage={getItem:key=>data.get(key)??null,setItem(key,value){if(fail)throw Error('QuotaExceededError');data.set(key,value)},removeItem:key=>data.delete(key)};
 const store=c.createRunStorage({rules,storage:()=>storage,onError:kind=>errors.push(kind)});assert.equal(store.read(),null);assert.equal(store.write(saved),true);assert.equal(store.read().round,60);const key=[...data.keys()].find(k=>k!=='unrelated'),good=data.get(key);fail=true;assert.equal(store.write({...saved,cash:999}),false);assert.equal(data.get(key),good);assert.equal(errors.pop(),'unavailable');fail=false;
 data.set(key,'{broken');assert.equal(store.read(),null);assert.equal(errors.pop(),'invalid');data.set(key,'x'.repeat(2_000_001));assert.equal(store.read(),null);assert.equal(errors.pop(),'invalid');store.clear();assert.equal(data.get('unrelated'),'keep');assert.equal(store.read(),null);
 const blocked=c.createRunStorage({rules,storage(){throw Error('SecurityError')},onError:kind=>errors.push(kind)});assert.equal(blocked.read(),null);assert.equal(blocked.write(saved),false);assert.equal(blocked.clear(),false);assert(errors.every(e=>e==='unavailable'));
});
test('unrecognized runtime properties are stripped before restoring, and sold puddle owners are serialized without stale references',()=>{
 const {c,rules,state,saved}=fixture(),raw=clone(saved);raw.towers[0].runtime.damage=999999;raw.towers[0].runtime.__proto__={polluted:true};const normalized=c.validateRunSave(raw,rules);assert(normalized);assert.equal(normalized.towers[0].runtime.damage,undefined);assert.equal(normalized.towers[0].runtime.polluted,undefined);
 state.puddles[0].attack.sourceTower={id:1000,type:'glue'};assert.equal(c.captureRunSave(state,rules).puddles[0].sourceId,null);
});
test('an ability activated at tier 4 retains its tier after a tier 5 purchase, and Storm retains the stats from activation',()=>{
 const {c,g,rules,state}=fixture(),tack=g.towers[3],hero=g.towers[6];tack.activeAbility=g.getTowerAbilities({...tack,paths:[0,4,2]})[0];tack.abilityTimer=2;hero.stormTimer=1;hero.stormStats=g.quincyStormStats(18);const saved=c.captureRunSave(state,rules);assert(saved);assert.equal(saved.towers[3].activeAbilityTier,4);assert.equal(saved.towers[3].paths[1],5);assert.equal(saved.towers[6].stormStats.chance,.075);assert.equal(saved.towers[6].stormStats.ceramicBonus,18);
});
