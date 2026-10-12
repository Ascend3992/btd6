const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {game,enemy}=require('./helpers/game.cjs');
function usage(){const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','tower-usage.js'),'utf8').replaceAll('export function','function'),context);return context;}
test('each tower earns one usage XP per normal volley; idle, cooldown and paused radial towers earn none',()=>{
 for(const type of ['dart','boomer','bomb','tack','ice','glue','hero']){
  const g=game(),xp=usage(),t=g.createTower(type,0,0);g.recordTowerUse=xp.recordTowerUse;g.towers.push(t);
  g.updateTowers(.01);assert.equal(xp.towerUsageXP(type),0,type+' idle');
  const e=enemy(1,'Pink');g.enemies.push(e);g.updateTowers(.01);assert.equal(xp.towerUsageXP(type),1,type+' first volley');
  g.updateTowers(.01);assert.equal(xp.towerUsageXP(type),1,type+' cooldown');
  assert.equal(t.damageDealt||0,type==='tack'||type==='ice'?1:0,'usage does not add damage');
 }
 const g=game(),xp=usage(),t=g.createTower('ice',0,0);g.recordTowerUse=xp.recordTowerUse;g.towers.push(t);g.enemies.push(enemy(1));g.roundActive=false;g.updateTowers(1);assert.equal(xp.towerUsageXP('ice'),0);
});
test('usage aggregates by type across instances and selling without affecting cash, upgrades or other towers',()=>{
 const xp=usage(),a={type:'glue'},b={type:'glue'};xp.recordTowerUse(a);xp.recordTowerUse(b);xp.recordTowerUse({type:'dart'});assert.equal(xp.towerUsageXP('glue'),2);assert.equal(xp.towerUsageXP('dart'),1);assert.equal(xp.towerUsageXP('ice'),0);assert.deepEqual(a,{type:'glue'});
});
