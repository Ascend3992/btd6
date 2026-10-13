const test=require('node:test'),assert=require('node:assert/strict');const {game}=require('./helpers/game.cjs');
test('hero round XP matches the formula at every boundary and all rounds 1–100',()=>{
 const g=game();for(let r=1;r<=100;r++)assert.equal(g.heroRoundXP(r),r<=20?20*r+20:r<=50?40*(r-20)+420:90*(r-50)+1620);assert.equal(g.heroRoundXP(20),420);assert.equal(g.heroRoundXP(21),460);assert.equal(g.heroRoundXP(50),1620);assert.equal(g.heroRoundXP(51),1710);
});
test('Quincy uses each saved per-level requirement with exact thresholds, overflow and the level-20 cap',()=>{
 const g=game();for(let level=2;level<=20;level++){const threshold=g.heroXPAtLevel(level);assert.equal(g.heroXPProgress(threshold-1).level,level-1);assert.equal(g.heroXPProgress(threshold).level,level);assert.equal(g.heroXPProgress(threshold).current,0);}assert.equal(g.heroXPProgress(1e9).level,20);assert.equal(g.heroXPProgress(1e9).required,0);
});
test('only a placed hero receives completion XP, buying late starts from zero, and Sandbox never earns XP',()=>{
 const g=game();g.awardHeroRoundXP(50);const t=g.createTower('hero',0,0);g.towers.push(t);assert.equal(t.level,1);assert.equal(t.heroXP,0);g.awardHeroRoundXP(1);assert.equal(t.heroXP,40);assert.equal(t.level,1);g.awardHeroRoundXP(20);assert.equal(t.heroXP,460);assert.equal(t.level,2);assert.equal(g.heroXPProgress(t.heroXP).current,280);g.awardHeroRoundXP(50);assert.equal(t.level,4);g.setDifficultyForTest('easy',false,'sandbox');const before=t.heroXP;g.awardHeroRoundXP(100);assert.equal(t.heroXP,before);g.updateTowers(0);assert.equal(t.level,4,'round number never levels the hero');
});
