const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {game,upgrade,enemy}=require('./helpers/game.cjs');
function modes(){const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','difficulty.js'),'utf8').replaceAll('export const','const').replaceAll('export function','function'),context);return context;}
test('difficulty profiles match the supplied lives, starting/ending rounds and speed rules',()=>{
 const m=modes();for(const [key,lives,start,end,speed] of [['easy',200,1,40,1],['medium',150,1,60,1.1],['hard',100,3,80,1.25]]){const mode=m.getGameMode(key);assert.equal(mode.lives,lives);assert.equal(mode.startRound,start);assert.equal(mode.endRound,end);assert.equal(mode.bloonSpeed,speed);}
 const old=m.getGameMode('medium',true);assert.equal(old.lives,100);assert.equal(old.endRound,100);assert.equal(old.bloonSpeed,1);assert.throws(()=>m.getGameMode('hard',true));
});
test('actual tower prices, upgrade investment and resale values use the selected profile without compounding discounts',()=>{
 const g=game();for(const [key,placement,sharp] of [['easy',170,120],['medium',200,140],['hard',215,150],['easy',170,120],['medium',200,140]]){g.setDifficultyForTest(key);const t=g.createTower('dart',0,0);assert.equal(t.invest,placement);upgrade(g,t,0);assert.equal(t.invest,placement+sharp);assert.equal(Math.floor(t.invest*.7),Math.floor((placement+sharp)*.7));assert.equal(t.pierce,3,'mode prices never change combat stats');}
 g.setDifficultyForTest('easy');assert.equal(g.createTower('hero',0,0).invest,460);g.setDifficultyForTest('hard');assert.equal(g.createTower('hero',0,0).invest,585);
 const m=modes();assert.equal(m.modePrice(150,m.getGameMode('easy')),125,'halfway prices round down to $5');assert.equal(m.modePrice(1950,m.getGameMode('easy')),1655);
});
test('Bloon speeds scale ordinary Bloons and blimps once, retain slows/freeze and preserve v65 legacy speed',()=>{
 const g=game(),e=enemy(0,'Red'),blimp=enemy(0,'MOAB');const base=g.enemySpeed(e),moab=g.enemySpeed(blimp);
 for(const [key,mult] of [['easy',1],['medium',1.1],['hard',1.25]]){g.setDifficultyForTest(key);assert(Math.abs(g.enemySpeed(e)-base*mult)<1e-10);assert(Math.abs(g.enemySpeed(blimp)-moab*mult)<1e-10);e.slowT=2;e.slowMult=.5;assert(Math.abs(g.enemySpeed(e)-base*mult*.5)<1e-10);e.freezeT=1;assert.equal(g.enemySpeed(e),0);e.freezeT=0;e.slowT=0;}
 g.setDifficultyForTest('medium',true);assert.equal(g.enemySpeed(e),base);
});
test('only Easy round-40 MOABs receive 133 base health, including correct fortified scaling at spawn',()=>{
 const g=game();g.setDifficultyForTest('easy');assert.equal(g.enemyBaseHp('MOAB',{spawnRound:40}),133);assert.equal(g.enemyBaseHp('MOAB',{spawnRound:39}),200);assert.equal(g.enemyBaseHp('BFB',{spawnRound:40}),700);
 for(const key of ['medium','hard']){g.setDifficultyForTest(key);assert.equal(g.enemyBaseHp('MOAB',{spawnRound:40}),200);}g.setDifficultyForTest('medium',true);assert.equal(g.enemyBaseHp('MOAB',{spawnRound:40}),200);
});
test('map medals persist separately from run saves, tolerate blocked storage and never clear unrelated data',()=>{
 const m=modes(),data=new Map([['meadow-btd6.saved-run','run']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};const medals=m.createMapMedals(()=>storage);assert.equal(medals.read().easy,false);assert(medals.award('easy'));assert(medals.award('medium'));assert(medals.read().easy&&medals.read().medium);assert.equal(medals.read().hard,false);assert.equal(data.get('meadow-btd6.saved-run'),'run');const blocked=m.createMapMedals(()=>{throw Error('Blocked')});assert.equal(blocked.award('hard'),false);assert.equal(blocked.read().hard,false);
});
