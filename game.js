const THREE_URL='./assets/vendor/three.module.js';
(async()=>{
try {
const THREE=await import(THREE_URL);
const {makeBoomerangTowerMesh,updateBoomerangAppearance,makeBoomerangWeapon,boomerangProjectileKind,triggerBoomerangThrow,animateBoomerang}=await import('./boomerang-visuals.js?v=1');
const {makeBaseBombTowerMesh,makeBombTopTowerMesh,makeBombMiddleTowerMesh,makeBombBottomTowerMesh,makeBombMissileProjectile,animateBomb}=await import('./bomb-visuals.js?v=4');
const {makeBaseTackTowerMesh,makeTackTopTowerMesh,makeTackMiddleTowerMesh,makeTackBottomTowerMesh,makeTackBladeProjectile,animateTack,tackMuzzleOrigin,tackAbilityOrigin}=await import('./tack-visuals.js?v=4');
const {makeBaseIceTowerMesh,makeIceTopTowerMesh,makeIceMiddleTowerMesh,makeIceBottomTowerMesh,iceMuzzleOrigin,animateIce}=await import('./ice-visuals.js?v=4');
const {makeBaseGlueTowerMesh,animateGlue,glueMuzzleOrigin}=await import('./glue-visuals.js?v=1');
const {BloonRenderer}=await import('./bloon-renderer.js?v=3');
const {makeReferenceBloonTemplate,paintBloonGeometry}=await import('./bloon-visuals.js?v=1');
const {MAP_W,MAP_H,ROAD_WIDTH,EDGE_WIDTH,meadowDepthScale,createMeadowMap,createMeadowPath}=await import('./meadow-map.js?v=1');
const canvas=document.getElementById('game');
const livesEl=document.getElementById('lives'),cashEl=document.getElementById('cash'),roundEl=document.getElementById('round');
const startBtn=document.getElementById('startBtn'),autoBtn=document.getElementById('autoBtn'),speedBtn=document.getElementById('speedBtn'),restartBtn=document.getElementById('restartBtn'),shopBtns=[...document.querySelectorAll('.towerBtn')];
const selPanel=document.getElementById('selectedPanel'),selName=document.getElementById('selName'),selStats=document.getElementById('selStats');
const upgradeBtns=[document.getElementById('upgrade0'),document.getElementById('upgrade1'),document.getElementById('upgrade2')];
const upgradeInfo=document.getElementById('upgradeInfo'),buyUpgradeBtn=document.getElementById('buyUpgradeBtn');
const camoPriorityBtn=document.getElementById('camoPriorityBtn');
const changeHandsBtn=document.getElementById('changeHandsBtn');
const targetBtn=document.getElementById('targetBtn'),sellBtn=document.getElementById('sellBtn'),closeSel=document.getElementById('closeSel');
const toast=document.getElementById('toast'),endScreen=document.getElementById('endScreen'),endTitle=document.getElementById('endTitle'),endText=document.getElementById('endText');
const abilityBar=document.getElementById('abilityBar'),abilityButtons=document.getElementById('abilityButtons'),towerAbilityBtn=document.getElementById('towerAbilityBtn');
const abilityNodes=new Map();
let nextTowerId=1,abilityUiTimer=0;

let lives=100,cash=650,round=1,speed=1,roundActive=false,autoStart=false,autoStartTimer=0,spawnQueue=[],spawnTimer=0,selectedType=null,selectedTower=null,selectedUpgradePath=null,heroPlaced=false,gameEnded=false;
const towers=[],enemies=[],projectiles=[],visualEffects=[],acidPuddles=[];
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();

const bloonSpeeds={Red:50,Blue:70,Green:90,Yellow:160,Pink:175,Black:90,White:100,Purple:150,Lead:50,Zebra:90,Rainbow:110,Ceramic:125,MOAB:50,BFB:12.5,ZOMG:9,DDT:132,BAD:9};
const layerNames=['Red','Blue','Green','Yellow','Pink','Black','White','Purple','Lead','Zebra','Rainbow','Ceramic'];
const layerColors=[0xe43c36,0x3387ff,0x39b855,0xffe33d,0xef72bb,0x25282d,0xf5f5f5,0x8c43d6,0x9aa1a8,0xffffff,0x5ee4e6,0xb86f3e];
const layerIndex=Object.fromEntries(layerNames.map((n,i)=>[n,i]));
const blimpStats={MOAB:{hp:200,speed:'MOAB',leak:200,color:0x4b83c3,scale:[1.15,1.2,2.1]},BFB:{hp:700,speed:'BFB',leak:700,color:0xc43c3c,scale:[1.45,1.5,2.65]},ZOMG:{hp:4000,speed:'ZOMG',leak:4000,color:0x4d8357,scale:[1.75,1.8,3.2]},DDT:{hp:400,speed:'DDT',leak:400,color:0x303239,scale:[1.25,1.3,2.3]},BAD:{hp:28000,speed:'BAD',leak:28000,color:0xa34f9f,scale:[2.05,2.05,3.75]}};
function cashPerPop(r){return r>60?.2:r>50?.5:1}
function formatCash(v){const n=Math.round(v*10)/10;return Number.isInteger(n)?String(n):n.toFixed(1)}


const exactRoundData={"1":[[20,"Red"]],"2":[[35,"Red"]],"3":[[25,"Red"],[5,"Blue"]],"4":[[35,"Red"],[18,"Blue"]],"5":[[5,"Red"],[27,"Blue"]],"6":[[15,"Red"],[15,"Blue"],[4,"Green"]],"7":[[20,"Red"],[20,"Blue"],[8,"Green"]],"8":[[10,"Red"],[20,"Blue"],[14,"Green"]],"9":[[30,"Blue"],[18,"Green"]],"10":[[102,"Red"],[30,"Blue"]],"11":[[10,"Red"],[10,"Blue"],[12,"Green"],[4,"Yellow"]],"12":[[15,"Red"],[10,"Blue"],[5,"Green"],[16,"Yellow"]],"13":[[50,"Red"],[23,"Blue"],[10,"Green"]],"14":[[49,"Red"],[15,"Blue"],[24,"Green"],[10,"Yellow"]],"15":[[20,"Red"],[15,"Blue"],[12,"Green"],[5,"Yellow"],[3,"Pink"]],"16":[[20,"Red"],[15,"Blue"],[10,"Green"],[18,"Yellow"]],"17":[[12,"Yellow"],[8,"Pink"]],"18":[[80,"Red"],[12,"Green"],[4,"Yellow"]],"19":[[10,"Blue"],[7,"Green"],[9,"Yellow"],[15,"Pink"]],"20":[[40,"Blue"],[6,"Black"]],"21":[[40,"Red"],[14,"Green"],[14,"Yellow"],[2,"Black"]],"22":[[16,"White"]],"23":[[16,"Black"],[16,"White"]],"24":[[1,"Camo Green"]],"25":[[25,"Purple"],[4,"Camo Red"]],"26":[[10,"Blue"],[12,"Pink"],[4,"Zebra"]],"27":[[100,"Red"],[60,"Blue"],[12,"Green"],[8,"Yellow"]],"28":[[6,"Lead"]],"29":[[50,"Yellow"],[15,"Regrow Yellow"]],"30":[[40,"Red"],[30,"Yellow"],[8,"Multi-Colored"],[4,"Zebra"]],"31":[[20,"Zebra"],[10,"Regrow Zebra"],[4,"Camo Regrow Red"]],"32":[[15,"Yellow"],[20,"Pink"],[10,"White"],[8,"Black"]],"33":[[20,"Camo Red"],[13,"Camo Yellow"]],"34":[[140,"Yellow"],[6,"Zebra"]],"35":[[35,"Pink"],[30,"Black"],[25,"White"],[5,"Rainbow"]],"36":[[140,"Pink"],[20,"Camo Regrow Green"],[2,"Regrow Lead"]],"37":[[25,"White"],[20,"Black"],[15,"Zebra"],[14,"Lead"],[4,"Camo White"]],"38":[[42,"White"],[28,"Lead"],[2,"Ceramic"]],"39":[[10,"Zebra"],[10,"Rainbow"],[20,"Black"],[20,"White"],[2,"Regrow Lead"],[2,"Camo Blue"]],"40":[[1,"MOAB"]],"41":[[60,"Black"],[60,"Zebra"],[2,"Ceramic"]],"42":[[6,"Camo Rainbow"],[5,"Camo Red"],[5,"Camo Green"],[2,"Camo Blue"]],"43":[[10,"Rainbow"],[10,"Blue"],[7,"Zebra"],[5,"Ceramic"]],"44":[[50,"Zebra"],[30,"Camo Zebra"]],"45":[[4,"Fortified Lead"],[20,"Camo Purple"],[40,"Pink"],[4,"Camo Rainbow"]],"46":[[6,"Fortified Ceramic"],[5,"Ceramic"]],"47":[[70,"Pink"],[12,"Camo Pink"],[40,"Camo Red"]],"48":[[40,"Red"],[30,"Blue"],[40,"Fortified Purple"],[15,"Rainbow"],[2,"Camo Ceramic"]],"49":[[300,"Green"],[30,"Zebra"],[15,"Rainbow"],[1,"Ceramic"]],"50":[[20,"Fortified Red"],[2,"MOAB"],[16,"Fortified Lead"],[18,"Ceramic"]],"51":[[10,"Camo Ceramic"],[5,"Camo Rainbow"]],"52":[[2,"MOAB"],[15,"Rainbow"]],"53":[[2,"MOAB"],[80,"Pink"],[3,"Camo Wood/Camo Ceramic"]],"54":[[2,"MOAB"],[35,"Ceramic"]],"55":[[1,"MOAB"],[45,"Ceramic"],[30,"Zebra"]],"56":[[1,"MOAB"],[40,"Rainbow"]],"57":[[4,"MOAB"],[40,"Fortified Lead"]],"58":[[1,"BFB"],[10,"Ceramic"]],"59":[[50,"Camo Lead"],[30,"Regrow Zebra"],[30,"Regrow Rainbow"]],"60":[[1,"BFB"]],"61":[[5,"MOAB"],[150,"Regrow Zebra"],[5,"Zebra"]],"62":[[2,"BFB"],[150,"Purple"],[10,"Camo Rainbow"]],"63":[[122,"Ceramic"],[75,"Lead"]],"64":[[6,"MOAB"],[2,"BFB"]],"65":[[3,"BFB"],[100,"Regrow Zebra"],[70,"Rainbow"],[3,"Camo Rainbow"]],"66":[[2,"MOAB"],[8,"Fortified MOAB"]],"67":[[8,"MOAB"],[3,"BFB"],[15,"Fortified Ceramic"]],"68":[[1,"BFB"],[4,"MOAB"],[8,"Fortified Ceramic"]],"69":[[70,"Regrow Lead"],[50,"Fortified Lead"],[40,"Regrow Ceramic"]],"70":[[4,"BFB"],[120,"White"],[60,"Camo White"]],"71":[[2,"BFB"],[30,"MOAB"]],"72":[[2,"BFB"],[38,"MOAB"]],"73":[[8,"BFB"],[4,"MOAB"]],"74":[[1,"BFB"],[48,"MOAB"],[85,"Ceramic"]],"75":[[3,"BFB"],[2,"Fortified BFB"],[14,"MOAB"]],"76":[[60,"Regrow Ceramic"]],"77":[[11,"BFB"],[5,"MOAB"]],"78":[[140,"Ceramic"],[75,"Camo Ceramic"],[1,"BFB"]],"79":[[4,"BFB"],[2,"Fortified BFB"],[500,"Regrow Rainbow"]],"80":[[1,"ZOMG"]],"81":[[17,"MOAB"],[18,"Super Ceramic"]],"82":[[2,"BFB"],[10,"Fortified MOAB"]],"83":[[40,"Super Ceramic"],[30,"Regrow Super Ceramic"]],"84":[[2,"ZOMG"],[10,"BFB"]],"85":[[2,"ZOMG"],[12,"BFB"]],"86":[[3,"ZOMG"],[4,"Fortified BFB"]],"87":[[4,"ZOMG"],[6,"BFB"]],"88":[[2,"ZOMG"],[8,"Fortified BFB"],[4,"MOAB"]],"89":[[4,"ZOMG"],[4,"Fortified BFB"],[40,"Super Ceramic"]],"90":[[3,"DDT"]],"91":[[6,"ZOMG"],[20,"BFB"]],"92":[[4,"ZOMG"],[50,"Fortified MOAB"]],"93":[[6,"DDT"],[24,"BFB"]],"94":[[6,"ZOMG"],[45,"BFB"],[40,"MOAB"]],"95":[[30,"DDT"],[50,"Fortified MOAB"],[90,"Fortified Super Ceramic"]],"96":[[6,"ZOMG"],[40,"BFB"],[30,"MOAB"]],"97":[[2,"Fortified ZOMG"]],"98":[[8,"ZOMG"],[30,"Fortified BFB"],[40,"Super Ceramic"]],"99":[[4,"Fortified DDT"],[8,"Fortified MOAB"]],"100":[[1,"BAD"]]};
const upgradeData={
 dart:[[['Sharp Shots',140],['Razor Sharp Shots',200],['Spike-o-pult',320],['Juggernaut',1800],['Ultra-Juggernaut',15000]],[['Quick Shots',100],['Very Quick Shots',190],['Triple Shot',450],['Super Monkey Fan Club',7200],['Plasma Monkey Fan Club',45000]],[['Long Range Darts',90],['Enhanced Eyesight',200],['Crossbow',575],['Sharp Shooter',2050],['Crossbow Master',21500]]],
 boomer:[[['Improved Rangs',200],['Glaives',280],['Glaive Ricochet',600],['M.O.A.R Glaives',2000],['Glaive Lord',32500]],[['Faster Throwing',175],['Faster Rangs',250],['Bionic Boomerang',1250],['Turbo Charge',4200],['Perma Charge',35000]],[['Long Range Rangs',100],['Red Hot Rangs',300],['Kylie Boomerang',1300],['MOAB Press',2700],['MOAB Domination',50000]]],
 bomb:[[['Bigger Bombs',250],['Heavy Bombs',650],['Really Big Bombs',1100],['Bloon Impact',2800],['Bloon Crush',55000]],[['Faster Reload',250],['Missile Launcher',400],['MOAB Mauler',1000],['MOAB Assassin',3450],['MOAB Eliminator',28000]],[['Extra Range',200],['Frag Bombs',300],['Cluster Bombs',700],['Recursive Cluster',2500],['Bomb Blitz',23000]]],
 tack:[[['Faster Shooting',150],['Even Faster Shooting',300],['Hot Shots',600],['Ring of Fire',3500],['Inferno Ring',45500]],[['Long Range Tacks',100],['Super Range Tacks',225],['Blade Shooter',550],['Blade Maelstrom',2700],['Super Maelstrom',15000]],[['More Tacks',110],['Even More Tacks',110],['Tack Sprayer',450],['Overdrive',3200],['The Tack Zone',20000]]],
 ice:[[['Permafrost',150],['Cold Snap',350],['Ice Shards',1500],['Embrittlement',2300],['Super Brittle',28000]],[['Enhanced Freeze',200],['Deep Freeze',300],['Arctic Wind',2750],['Snowstorm',4000],['Absolute Zero',21000]],[['Larger Radius',150],['Re-Freeze',200],['Cryo Cannon',1900],['Icicles',2750],['Icicle Impale',30000]]],
 glue:[[['Glue Soak',200],['Corrosive Glue',300],['Bloon Dissolver',2000],['Bloon Liquefier',5000],['The Bloon Solver',22500]],[['Bigger Globs',100],['Glue Splatter',970],['Glue Hose',1950],['Glue Strike',4000],['Glue Storm',16000]],[['Stickier Glue',280],['Stronger Glue',400],['MOAB Glue',3600],['Relentless Glue',4000],['Super Glue',24000]]]
};
const glueTopUpgradeMetadata=[
 {prices:[170,200,215,240],xp:150},{prices:[255,300,325,360],xp:550},
 {prices:[1700,2000,2160,2400],xp:2500},{prices:[4250,5000,5400,6000],xp:9000},
 {prices:[19125,22500,24300,27000],xp:37500}
];
const iceTopUpgradeMetadata=[
 {prices:[125,150,160,180],xp:160},{prices:[295,350,380,420],xp:500},
 {prices:[1275,1500,1620,1800],xp:2500},{prices:[1955,2300,2485,2760],xp:8250},
 {prices:[23800,28000,30240,33600],xp:25000}
];
const iceMiddleUpgradeMetadata=[
 {prices:[170,200,215,240],xp:160},{prices:[255,300,325,360],xp:500},
 {prices:[2335,2750,2970,3300],xp:2500},{prices:[3400,4000,4320,4800],xp:8500},
 {prices:[17850,21000,22680,25200],xp:27500}
];
const iceBottomUpgradeMetadata=[
 {prices:[125,150,160,180],xp:160},{prices:[170,200,215,240],xp:500},
 {prices:[1615,1900,2050,2280],xp:2500},{prices:[2335,2750,2970,3300],xp:9000},
 {prices:[25500,30000,32400,36000],xp:30000}
];
const upgradeDescriptions={
 dart:[
  ['Adds +1 pierce; Crossbow/Sharp Shooter gain +3, and Crossbow Master gains +8.','Adds +2 pierce; Crossbow/Sharp Shooter gain +5 more, and Crossbow Master gains +8 more.','Fires bouncing spiked balls: 2 damage, 18 pierce, +15% range, 1.15s attack interval. Pops Frozen, but not Lead.','Fires faster bouncing balls: 2 damage, +3 Ceramic, +2 Fortified, 60 pierce, 1s attack interval and 0.15s knockback. Pops Lead.','Fires 210-pierce balls: 5 damage, +8 Ceramic, +20 Lead, +5 Fortified. Splits into six 50-pierce mini Juggernauts at 105 and 210 hits.'],
  ['Reduces attack cooldown to 0.8075s (0.85× base).','Reduces attack cooldown to 0.633s.','Throws three accurately aimed darts every 0.47475s.','Attacks twice as fast as Triple Shot. Ability boosts itself and nine nearby non-special Dart Monkeys for 15s, with 40 range and rapid darts. 50s cooldown; models stay unchanged.','Ability boosts itself and up to twenty nearby non-special Dart Monkeys for 15s: twice-as-fast plasma attacks, 2 damage, 5 pierce and 40 range. Models stay unchanged.'],
  ['Adds 8 range and 35% projectile lifespan.','Adds another 8 range, 60% total extra lifespan, 16.67% projectile speed, Camo detection/prioritization and stronger Juggernaut knockback.','Crossbow: 3 damage, 4 base pierce, 60 range and slightly faster bolts.','Sharp Shooter: 6 damage, 0.475s base cooldown, faster bolts and a 50-damage critical hit every 10 shots.','Crossbow Master: 8 damage, 8 base pierce, 80 range, 0.2375s base cooldown and an 80-damage critical hit every 5 shots. Pops every Bloon type.']
 ],
 boomer:[
  ['Boomerangs travel through more bloons.','Upgrades to sharper glaives with improved popping.','Glaives ricochet between nearby bloons.','Throws many powerful ricocheting glaives very quickly.','Creates a deadly storm of glaives around the tower.'],
  ['Attacks 33% faster.','Attacks another 33% faster; boomerangs travel 50% faster.','Bionic arm attacks eight times faster than the base monkey and deals +1 damage to MOAB-class bloons.','Ability: attacks five times faster with +1 damage for 10 seconds. 45-second cooldown.','Permanently keeps Turbo Charge attack speed and deals 4 damage. Ability adds +8 damage for 15 seconds. Red Hot Rangs adds +4 permanent damage and +2 ability damage.'],
  ['Adds 14.19 range and widens the boomerang curve.','Pops Lead and Frozen bloons and adds +1 damage to the main attack and Glaive Lord orbitals. Perma Charge gains its larger damage bonus.','Throws straight out-and-back Kylies with 18 pierce. Each Kylie can hit a bloon again after 0.3 seconds.','Adds a separate 200-pierce throw that deals 1 damage to regular bloons and 5 to blimps, knocking blimps back. Can re-hit after 0.1 seconds. Top-path upgrades increase its pierce and knockback.','Adds +10 main damage and +36 pierce (+54 with Glaives). Both attacks fire twice as fast. Special throws gain +100 pierce, double range, stronger blimp damage and knockback, and explode in flames when they expire.']
 ],
 bomb:[
  ['Increases blast radius from 12 to 18 and adds +6 pierce.','Adds +1 damage and +10 pierce.','27 blast radius, 4 damage and 80 pierce. Pushes regular bloons back 20 units and improves Frag Bombs.','Stuns regular bloons for 1.4s, adds +3 range and improves fragment pierce, count and lifespan.','24 damage; pops Black and Zebra bloons. Stuns regular bloons and blimps for 2s and pushes blimps back 5 units. BADs resist crowd control. Improves fragment damage and pierce.'],
  ['Attacks 33% faster: 0.75× cooldown.','Uses missiles: another 0.7333× cooldown, +4 range and 50% faster projectiles.','Deals 16 damage to blimps, gains +5 range and gives fragments bonus blimp damage. Heavy Bombs adds +1 damage.','Deals 31 damage to blimps and 5 to Ceramics; gains +5 range. Ability instantly deals 750 damage to a blimp using this tower’s target priority, with a weaker explosion and stronger Frag Bombs.','Deals 100 damage to blimps. Ability instantly deals 4,500 damage with a 10s cooldown (3× faster). Improves Frag Bombs further.'],
  ['Adds +12 range.','Adds +2 range. Explosions release sharp 1-pierce fragments that cannot pop Lead. Top-path upgrades improve fragments.','Replaces fragments with 8 secondary bombs per shot; each secondary explosion has 8 pierce.','All explosions deal 2 damage. Every second shot creates 3 explosion stages: 73 visible explosions, up to 17 hits per target.','5 damage per explosion, 0.9s base cooldown and recursive explosions every shot. Bomb Storm triggers after a life is lost: 2,000 damage across the map, then clears MOABs and regular bloons.']
 ],
 tack:[
  ['0.75× attack cooldown; Maelstrom blade interval becomes 0.85×.','Another 0.75× attack cooldown and 0.85× Maelstrom blade interval.','Tacks gain +1 damage and pop Lead and Frozen.','Flame bursts deal 5 damage with 30 pierce every 0.315s; cannot pop Purple. Super Range adds pierce and bottom crosspaths add damage.','Flame bursts deal 8 damage (+4 to blimps), with 35 range and 45 pierce. Also launches 700-damage explosive meteors that burn for 50 damage per second.'],
  ['Adds +4 range and faster projectiles.','Adds +4 range and +3 pierce. Flame bursts gain +15 pierce; Inferno meteors gain +1 pierce. The Tack Zone gains +16 range and +8 pierce instead.','Adds +15 range and replaces tacks with 8-pierce blades that pop Frozen.','Main blades deal 2 damage. Ability sends two clockwise blade waves for 3 seconds.','Main blades deal 5 damage and pop all standard materials. Ability sends four stronger, higher-pierce clockwise waves for 9 seconds.'],
  ['10 tacks per volley, or +1 Ring of Fire damage. Maelstrom turns counter-clockwise and gains 0.5s duration; Super Maelstrom gains 1.5s.','12 tacks per volley, or +2 total Ring of Fire damage. Adds another 0.5s Maelstrom or 1.5s Super duration.','16 tacks per volley and +1 pierce.','Attacks three times as fast (one-third cooldown).','32 tacks per volley, 0.6× cooldown, +7 range and bonus blimp damage. Super Range adds +8 pierce and +16 range.']
 ],
 ice:[
  ['Bloons stay 50% slower after thawing, for as many layers as the freeze.','Detects Camo and freezes and pops Lead.','Adds 5 range. Removes Camo and Regrow on hit; popping its frozen bloons releases three equally spaced damaging shards.','Hits MOAB-class and DDTs. Removes Camo and Regrow; temporarily makes targets vulnerable to sharp/freezing attacks and adds 1 damage to incoming hits.','Attacks twice as fast. Targets take 4 extra damage; frozen bloons release six stronger shards. Deals extra Ceramic damage and slows blimps by 25%.'],
  ['0.75× attack cooldown and a 1.75s freeze.','45 pierce, 2.2s freeze and two frozen layers.','Freezable bloons in range move 40% slower. Enables initial land-tower placement on water within its radius.','30 range. Ability freezes ordinary bloons for 6s and blimps, White, Zebra and Camo for 3s; soaks two regular layers. Lead requires popping power. 30s cooldown.','300 pierce and 40 range. Main attacks briefly freeze freezable bloons everywhere; main and ability freezes soak eight regular layers. Ability freezes all materials for 10s and makes all Ice Monkeys attack 50% faster for 10s. 25s cooldown.'],
  ['Adds 7 range.','Can target and re-freeze already frozen bloons.','46 range. Shoots snowballs with a 20-unit blast radius, 40 pierce, 1 damage and a 1.2s freeze.','Faster 2-damage blasts, plus 8 damage to blimps without slowing them. Frozen regular bloons carry icicles for 2s: 3 damage to at most three non-frozen contacts.','Blasts deal 50 total damage to blimps and freeze them. Cold Snap is needed for Camo/Lead targets such as DDTs.']
 ],
 glue:[
  ['Soaks every non-blimp layer; cannot carry glue through blimp shells.','Deals 1 corrosion damage every 2s. Can glue blimps for half duration without slowing them.','Deals 1 damage every 0.5s, or 2 to Ceramics; +1 pierce and attacks twice as fast.','Deals 1 damage every 0.1s, or 3 to Ceramics. Directly glued Bloons leave acid puddles when popped.','Deals 8 damage per 0.1s to Ceramics and 6 to blimps. Twin splatters have 5 pierce each, stronger acid puddles and twice-as-fast attacks.'],
  ['Fires larger glue blobs.','Glue splashes onto several nearby bloons.','Sprays glue very quickly.','Unlocks an ability that coats bloons across the map.','A stronger global glue ability with better coverage and effects.'],
  ['Glue remains sticky for longer.','Glue slows bloons more strongly.','Special glue can slow MOAB-class bloons.','Glued bloons leave sticky traps when popped.','Extremely strong glue that can heavily slow powerful bloons.']
 ]
};
const RANGE_SCALE=.32;
// User tables override wiki differences (8 Ceramic damage, 520 puddle pierce 7,
// and 501 puddle duration +9.1s). Wiki supplies 7.7s life and Liquefier damage 4.
// Puddle collision radius uses the supplied base glue hitbox of 4 units.
const glueTopTuning={splatterRadius:12*RANGE_SCALE,
 liquefierPuddle:{damage:4,pierceByMiddle:[3,4,5],radius:4*RANGE_SCALE,life:7.7},
 solverPuddle:{damage:15,pierceByMiddle:[3,4,7],radius:4*RANGE_SCALE,life:7.7}};
const iceTopTuning={brittleDuration:3,shardDamage:1,superShardDamage:6,shardPierce:3,superShardPierce:6,shardSpeed:28,shardLife:.65,superCeramicBonus:2};
const iceMiddleTuning={secondaryFreeze:.3};
const iceBottomTuning={cryoCooldown:1,iciclesCooldown:.5,projectileSpeed:32,projectileLife:3,impaleFreeze:1.2,contactRadius:.85};
let absoluteZeroBuffT=0;
const waterRegions=[];
const towerDefs={
 dart:{name:'Dart Monkey',cost:200,range:32*RANGE_SCALE,displayRange:32,rate:.95,damage:1,projSpeed:34,color:0x8b5a2b,pierce:2,damageType:'Sharp',notes:'Cannot hit Lead or Camo natively'},
 boomer:{name:'Boomerang Monkey',cost:325,range:43*RANGE_SCALE,displayRange:43,rate:1.2,damage:1,projSpeed:31,color:0xb76a31,pierce:4,damageType:'Sharp',notes:'Cannot hit Camo natively'},
 bomb:{name:'Bomb Shooter',cost:600,range:40*RANGE_SCALE,displayRange:40,rate:1.5,damage:1,projSpeed:26,color:0x3d4147,pierce:22,splash:12*RANGE_SCALE,damageType:'Explosion',notes:'Pops Lead; cannot hit Black, Zebra, DDT, or Camo'},
 tack:{name:'Tack Shooter',cost:260,costByDifficulty:{easy:220,medium:260,hard:280,impoppable:310},range:23*RANGE_SCALE,displayRange:23,footprintRadius:6*RANGE_SCALE,displayFootprintRadius:6,rate:1.12,damage:1,color:0xfa398b,pierce:1,radial:true,tacks:8,damageType:'Sharp',notes:'8 tacks in a full ring; cannot hit Lead, Frozen, or Camo'},
 ice:{name:'Ice Monkey',cost:400,towerClass:'Primary',placementSurfaces:['land','water'],range:25*RANGE_SCALE,displayRange:25,rate:2.4,damage:1,color:0x6bcde9,pierce:40,freeze:1.5,radial:true,damageType:'Cold',notes:'Freezes bloons for 1.5s; cannot affect Lead, White, Zebra, or Camo'},
 glue:{name:'Glue Gunner',cost:270,range:46*RANGE_SCALE,displayRange:46,footprintRadius:6*RANGE_SCALE,displayFootprintRadius:6,rate:1,damage:0,projSpeed:300*RANGE_SCALE,displayProjectileSpeed:300,projectileLife:.43,projectileRadius:4*RANGE_SCALE,displayProjectileRadius:4,glueLevel:1,color:0xd1b034,pierce:1,slow:.5,slowDuration:11,glueLayers:3,damageType:'Acid',notes:'50% slow for 11s; soaks 3 layers; ignores Camo, blimps and already-glued Bloons'},
 hero:{name:'Quincy',cost:540,range:50*RANGE_SCALE,displayRange:50,rate:.95,damage:1,projSpeed:44,color:0x704527,hero:true,pierce:3,camoDetect:false}
};

// Ability balance belongs to this prototype; temporary buffs never rewrite upgrade stats.
const primaryAbilities={
 dart:[
  {kind:'fanClub',name:'Super Monkey Fan Club',cooldown:50,duration:15,maxTargets:10,color:0x55aaff,description:'Boost itself and up to 9 nearby non-special Dart Monkeys with rapid darts and 40 range for 15s. Models stay unchanged.'},
  {kind:'fanClub',name:'Plasma Monkey Fan Club',cooldown:50,duration:15,maxTargets:21,color:0xcc77ff,description:'Boost itself and up to 20 nearby non-special Dart Monkeys with twice-as-fast plasma, 2 damage, 5 pierce and 40 range for 15s. Models stay unchanged.'}
 ],
 boomer:[
  {kind:'turbo',name:'Turbo Charge',cooldown:45,duration:10,rateMult:5,damageBonus:1,color:0xffb93b,description:'Attack five times faster with +1 damage for 10s. 45s cooldown.'},
  {kind:'turbo',name:'Perma Charge',cooldown:45,duration:15,rateMult:1,damageBonus:8,color:0xffe35b,description:'Adds +8 damage for 15s while keeping permanent Turbo speed. Red Hot Rangs adds another +2 ability damage. 45s cooldown.'}
 ],
 bomb:[
  {kind:'assassin',name:'MOAB Assassin',cooldown:30,duration:0,damage:750,color:0xff6948,description:'Instantly deal 750 damage to a blimp anywhere on the map using First, Last, Close or Strong targeting, including Camo DDTs. Adds a weaker explosion and powerful Frag Bombs.'},
  {kind:'assassin',name:'MOAB Eliminator',cooldown:10,duration:0,damage:4500,color:0xff4b35,description:'Instantly deal 4,500 damage to a blimp using this tower’s target priority, including Camo DDTs. 10s cooldown and stronger Frag Bombs.'}
 ],
 tack:[
  {kind:'maelstrom',name:'Blade Maelstrom',cooldown:20,duration:3,tick:.15,damage:2,pierce:50,waves:2,color:0x9fd9ff,description:'Two clockwise waves of stronger blades for 3s. Pops Frozen and hits Camo; cannot pop Lead.'},
  {kind:'maelstrom',name:'Super Maelstrom',cooldown:20,duration:9,tick:.12,damage:4,pierce:100,waves:4,color:0xd9f4ff,description:'Four clockwise waves of stronger, higher-pierce blades for 9s. Pops all standard materials and hits Camo.'}
 ],
 ice:[
  {kind:'snowstorm',name:'Snowstorm',cooldown:30,duration:0,freezeDuration:6,specialFreezeDuration:3,freezeLayers:2,color:0x7ae5ff,description:'Freeze ordinary bloons for 6s, and White, Zebra, Camo and blimps for 3s. Lead requires popping power; BADs resist freezing. Soaks two regular layers.'},
  {kind:'snowstorm',name:'Absolute Zero',cooldown:25,duration:0,freezeDuration:10,specialFreezeDuration:10,freezeLayers:8,color:0xc4f8ff,description:'Freeze all materials for 10s, including blimps (except BADs). Soaks eight regular layers. All Ice Monkeys attack 50% faster for 10s.'}
 ],
 glue:[
  {kind:'glueStorm',name:'Glue Strike',cooldown:30,duration:0,coatDuration:12,color:0xffe550,description:'Glue all bloons, including Camo and blimps, for 12s. Glued targets take +2 damage per hit. BADs cannot be slowed.'},
  {kind:'glueStorm',name:'Glue Storm',cooldown:30,duration:15,tick:.5,coatDuration:15,color:0xfff27a,description:'For 15s, repeatedly glue the whole map, including newly arriving bloons. Glued targets take +2 damage per hit. BADs cannot be slowed.'}
 ]
};

// Prototype defaults for values not specified in the supplied bottom-path stats.
// Special cooldown scales with purchased attack speed, including Domination's 2x rate.
const boomerSpecialTuning={
 cooldown:3,
 press:{knockback:3*RANGE_SCALE,moabDamage:5,pierce:200,rangeMult:1},
 domination:{knockback:6*RANGE_SCALE,moabDamage:50,pierce:300,rangeMult:2,
  explosionDamage:20,explosionRadius:20*RANGE_SCALE,burnDamage:10,burnDuration:4}
};

// Provisional values: the supplied top-path table describes fragment improvements
// without their magnitudes. Replace these when exact Frag Bombs stats arrive.
const bombFragmentTuning={
 base:{damage:1,pierce:1,count:8,life:.15},
 big:{damage:2,pierce:3,count:12,life:.3},
 impact:{damage:2,pierce:4,count:16,life:.45},
 crush:{damage:12,pierce:10,count:16,life:.45},
 middleMoabBonus:[0,0,0,5,10,20],
 assassin:{damage:5,pierce:3,count:8,life:.3,moabBonus:50},
 eliminator:{damage:20,pierce:6,count:12,life:.45,moabBonus:100},
 speed:30
};

// The supplied table fixes counts, secondary pierce and the recursive hit limit.
// Spread, flight time and unspecified larger radii use these prototype defaults.
const bombClusterTuning={count:8,pierce:8,radius:12*RANGE_SCALE,
 recursiveRadius:20*RANGE_SCALE,spread:6*RANGE_SCALE,flightTime:.16,
 recursiveBlastMult:1.5,maxThirdStageHits:8};

// Exact supplied damage/range/pierce values are in syncTackStats. These values
// were omitted from the table and remain provisional until supplied.
const tackTopTuning={infernoCooldown:.1,bottomFlameDamagePerTier:1,
 meteorCooldown:4,meteorSpeed:28,meteorRange:Infinity,meteorExplosionDamage:50,
 meteorExplosionRadius:18*RANGE_SCALE,meteorExplosionPierce:10,meteorBurnDuration:5};
const tackTopUpgradeDetails=[
 {costs:[125,150,160,180],xp:150},{costs:[255,300,325,360],xp:550},
 {costs:[510,600,650,720],xp:2400},{costs:[2975,3500,3780,4200],xp:9500},
 {costs:[38675,45500,49140,54600],xp:32500}
];
// Magnitudes omitted from the middle-path table. Other Maelstrom prototype
// values (damage, pierce, tick and cooldown) remain in primaryAbilities.tack.
const tackMiddleTuning={longRangeProjectileSpeedMult:1.25,maelstromAngularStep:.31};
const tackMiddleUpgradeDetails=[
 {costs:[85,100,110,120],xp:140},{costs:[190,225,245,270],xp:500},
 {costs:[465,550,595,660],xp:2300},{costs:[2295,2700,2915,3240],xp:9000},
 {costs:[12750,15000,16200,18000],xp:28000}
];
// The supplied Tack Zone table does not give the magnitude of its blimp bonus.
const tackBottomTuning={zoneMoabDamage:2};
const tackBottomUpgradeDetails=[
 {costs:[95,110,120,130],xp:150},{costs:[95,110,120,130],xp:490},
 {costs:[380,450,485,540],xp:2450},{costs:[2720,3200,3455,3840],xp:8750},
 {costs:[17000,20000,21600,24000],xp:26500}
];

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x79c94e);
const camera=new THREE.OrthographicCamera(-34,34,19,-19,.1,200);
camera.position.set(0,68,36);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x52712e,1.8));
const sun=new THREE.DirectionalLight(0xffffff,1.8);sun.position.set(-20,40,-18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;scene.add(sun);
// Keep curved missile shells from shadowing their own surface into striped noise.
sun.shadow.normalBias=.03;sun.shadow.bias=-.0001;

// The rendering and combat route share the traced reference coordinates.
const PATH=createMeadowPath();
const {ground,obstacles:ballObstacles}=createMeadowMap(scene);

const rangeRing=new THREE.Mesh(new THREE.RingGeometry(.98,1,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false}));
rangeRing.rotation.x=-Math.PI/2;rangeRing.visible=false;scene.add(rangeRing);

function resize(){
 const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);
 // Fit the whole reference meadow beside the shop, including its entry and exit.
 const aspect=r.width/r.height,shop=document.getElementById('shop'),shopWidth=shop?shop.getBoundingClientRect().width+24:0;
 const playableWidth=Math.max(r.width*.40,r.width-shopWidth);
 const halfH=Math.max(23.3,35/(playableWidth/r.height));
 camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;
 const centerShift=halfH*shopWidth/r.height;
 camera.position.set(centerShift,68,36);camera.lookAt(centerShift,0,0);camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();
function toastMsg(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),1200)}
let uiDirty=true;
function updateUI(){uiDirty=true;}
function flushUI(){if(!uiDirty)return;uiDirty=false;livesEl.textContent=Math.max(0,Math.ceil(lives));cashEl.textContent=formatCash(cash);roundEl.textContent=round;shopBtns.forEach(b=>{const d=towerDefs[b.dataset.tower];b.disabled=cash<d.cost||(d.hero&&heroPlaced)})}
function selectShop(type){selectedType=type;selectedTower=null;rangeRing.visible=false;selPanel.classList.add('hidden');shopBtns.forEach(b=>b.classList.toggle('active',b.dataset.tower===type))}
shopBtns.forEach(b=>b.addEventListener('click',()=>selectShop(b.dataset.tower)));

function mat(color){return new THREE.MeshStandardMaterial({flatShading:true,color,roughness:.65,metalness:.02})}
// All models are original procedural meshes; no optional model downloads are needed.
function makeTowerMesh(type,legacyBomb=false,legacyTack=false,legacyIce=false){
 if(type==='glue')return makeBaseGlueTowerMesh();
 if(type==='boomer')return makeBoomerangTowerMesh();
 if(type==='bomb'&&!legacyBomb)return makeBaseBombTowerMesh();
 if(type==='tack'&&!legacyTack)return makeBaseTackTowerMesh();
 if(type==='ice'&&!legacyIce)return makeBaseIceTowerMesh();
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);g.userData.body=body;if(type==='dart')g.userData.appearanceKey='dart-legacy';
 if(type==='bomb')Object.assign(g.userData,{bombBaseModel:false,bombModelPath:-1,bombModelTier:-1,bombRig:null});
 if(type==='tack')Object.assign(g.userData,{tackBaseModel:false,tackModelPath:-1,tackModelTier:-1,tackModelPorts:0,tackRig:null});
 if(type==='ice')Object.assign(g.userData,{iceBaseModel:false,iceModelPath:null,iceModelTier:null,iceRig:null});
 const part=(geometry,color,x,y,z,parent=body)=>{const m=new THREE.Mesh(geometry,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const sphere=(r,color,x,y,z,parent=body)=>part(new THREE.SphereGeometry(r,10,6),color,x,y,z,parent);
 const cube=(w,h,d,color,x,y,z,parent=body)=>part(new THREE.BoxGeometry(w,h,d),color,x,y,z,parent);
 const skin=type==='ice'?0xa9e5ef:0xa97143,face=type==='ice'?0xe3faff:0xf5cb91;
 if(type==='bomb'||type==='tack'){
  part(new THREE.CylinderGeometry(1.15,1.3,.45,10),0x343d47,0,.25,0);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const foot=cube(.45,.3,.85,0x26313b,Math.sin(a)*1.1,.15,Math.cos(a)*1.1);foot.rotation.y=a;}
  if(type==='bomb'){
   sphere(.85,0x536573,0,.95,0).scale.set(1,.8,1);
   for(const z of [-.8,.8]){const wheel=part(new THREE.CylinderGeometry(.48,.48,.25,8),0x1f2933,0,.5,z);wheel.rotation.x=Math.PI/2;}
   g.userData.aimOffset=-Math.PI/2;
  }else{
   part(new THREE.CylinderGeometry(1.12,1.22,.95,10),0xc64e64,0,.85,0);
   part(new THREE.CylinderGeometry(.95,1.14,.3,10),0xf0919b,0,1.47,0);
   for(let i=0;i<8;i++){const a=i*Math.PI/4;const barrel=part(new THREE.CylinderGeometry(.13,.18,.6,6),0x343d47,Math.sin(a)*1.15,1.0,Math.cos(a)*1.15);barrel.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.sin(a),0,Math.cos(a)));}
   part(new THREE.CylinderGeometry(.28,.34,.22,8),0xf7d876,0,1.75,0);
  }
 }else{
  for(const x of [-.38,.38]){sphere(.36,skin,x,.27,.18).scale.set(.85,.65,1.4);cube(.32,.6,.36,towerDefs[type].color,x,.6,0);}
  sphere(.76,towerDefs[type].color,0,1.13,0).scale.set(.85,1.05,.72);
  part(new THREE.CylinderGeometry(.65,.69,.15,10),0x493b32,0,.94,0);
  cube(.2,.19,.12,0xf3c25f,0,.94,.58);
  sphere(.75,skin,0,2.03,0).scale.set(1,1,.85);
  for(const x of [-.73,.73]){sphere(.27,skin,x,2.03,0).scale.z=.5;sphere(.16,face,x,2.03,.13).scale.z=.4;}
  sphere(.46,face,0,1.86,.48).scale.set(1,.65,.48);
  for(const x of [-.25,.25]){sphere(.19,face,x,2.17,.53).scale.z=.45;sphere(.09,0x182730,x,2.18,.62);cube(.25,.065,.08,0x493626,x,2.38,.54);}
  sphere(.07,0x493626,0,1.95,.72);cube(.22,.035,.06,0x493626,0,1.77,.7);
  const tail=part(new THREE.TorusGeometry(.46,.13,5,10,Math.PI*1.4),skin,0,1.0,-.61);tail.rotation.y=Math.PI/2;
  for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.63,1.53,0);body.add(arm);sphere(.24,skin,0,-.18,.12,arm);cube(.25,.52,.27,towerDefs[type].color,0,-.3,.12,arm);sphere(.23,face,0,-.56,.22,arm);g.userData[side===1?'rightArm':'leftArm']=arm;}
  if(type==='ice'){for(let i=0;i<5;i++){const crystal=part(new THREE.ConeGeometry(.16,.55,4),0xe8fcff,Math.sin(i*1.256)*.52,2.67,Math.cos(i*1.256)*.52);crystal.rotation.z=Math.sin(i)*.2;}}
  if(type==='hero'){part(new THREE.CylinderGeometry(.7,.77,.18,10),0x456443,0,2.56,0);cube(.9,.85,.1,0x456443,0,1.3,-.55);const quiver=cube(.35,.9,.35,0x684327,-.55,1.6,-.45);quiver.rotation.z=-.2;for(const x of [-.65,-.5,-.35])cube(.045,.65,.045,0xf2d49d,x,2.19,-.45);}
  if(type==='glue'){const tank=part(new THREE.CylinderGeometry(.35,.35,.9,8),0xf2cf4b,-.55,1.4,-.5);part(new THREE.CylinderGeometry(.25,.35,.15,8),0x465460,-.55,1.93,-.5);}
 }
 const weapon=new THREE.Group();body.add(weapon);g.userData.weapon=weapon;
 return g;
}
// Reference-based Dart top-path bodies. The tower root stays stable for selection,
// targeting and temporary ability attachments; the entire model beneath it swaps.
function dartTopModelTier(t){
 const [top,middle,bottom]=t.paths;
 return top>=1&&top<=5&&middle<=2&&bottom<=2?top:0;
}
function replaceTowerBody(t,replacement){
 const root=t.mesh;
 removeUpgradeVisuals(root);
 disposeTransientMesh(root.userData.body);
 const body=replacement.userData.body;body.removeFromParent();root.add(body);
 for(const key of ['body','weapon','rightArm','leftArm','loadedAmmo','dartTopTier','dartMiddleTier','dartBottomTier','headbandTies','uniformCape'])delete root.userData[key];
 Object.assign(root.userData,replacement.userData);
 // Position, heading, tower ID, cooldowns, purchased paths and ability state survive.
}
function makeDartTopMesh(t,tier,middleTier=0,bottomTier=0){
 const g=new THREE.Group(),body=new THREE.Group();g.add(body);
 g.userData.body=body;g.userData.dartTopTier=tier;g.userData.dartMiddleTier=middleTier;g.userData.dartBottomTier=bottomTier;
 const colors={fur:0x914a21,dark:0x64351c,face:0xeba94e,belly:0xf4b85e,steel:0x707b80,wood:0xc58b36};
 const add=(geometry,color,x,y,z,parent=body)=>{const m=new THREE.Mesh(geometry,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const sphere=(r,color,x,y,z,parent)=>add(new THREE.SphereGeometry(r,10,6),color,x,y,z,parent);
 const cube=(w,h,d,color,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),color,x,y,z,parent);
 const monkey=new THREE.Group();body.add(monkey);
 if(tier===3){
  // Compact wood-and-steel wheeled carriage; a separate operator beside the sling.
  monkey.position.set(.84,.3,-.25);monkey.scale.setScalar(.72);
  cube(1.75,.3,2.05,colors.wood,-.2,.55,0);
  for(const x of [-.76,.36])cube(.24,.3,2.2,colors.dark,x,.62,0);
  for(const x of [-1.05,.72])for(const z of [-.73,.73]){
   const wheel=add(new THREE.CylinderGeometry(.49,.49,.22,10),colors.dark,x,.48,z);wheel.rotation.z=Math.PI/2;
   const hub=add(new THREE.CylinderGeometry(.22,.22,.26,8),colors.steel,x,.48,z);hub.rotation.z=Math.PI/2;
  }
  for(const z of [-.73,.73])cube(1.7,.18,.19,colors.steel,-.2,.77,z);
  for(const x of [-.8,.4])cube(.2,.8,.28,colors.wood,x,1.04,-.35);
 }
 if(tier>=4){
  const ultra=tier===5,armor=ultra?0x171c20:0x525e63,trim=ultra?0x3d464c:0x7f8d93;
  monkey.position.set(.87,.3,ultra?.1:-.72);monkey.scale.setScalar(.67);
  cube(2.05,.3,2.0,trim,-.15,.55,0);
  if(ultra){
   const shape=new THREE.Shape();shape.moveTo(-1,.58);shape.lineTo(1,.58);shape.lineTo(.74,1.64);shape.lineTo(-.74,1.64);shape.closePath();
   const hull=add(new THREE.ExtrudeGeometry(shape,{depth:1.94,bevelEnabled:false}),armor,-.15,0,-1.0);
   for(const x of [-1.25,.95]){
    const wheel=add(new THREE.CylinderGeometry(.73,.73,.29,12),0x14191d,x,.65,-.25);wheel.rotation.z=Math.PI/2;
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.56,.055,4,12),mat(0x4b545b));rim.rotation.y=Math.PI/2;rim.position.set(x+(x<0?-.17:.17),.65,-.25);body.add(rim);
    const hub=add(new THREE.CylinderGeometry(.2,.2,.35,8),trim,x,.65,-.25);hub.rotation.z=Math.PI/2;
   }
   // A single integrated lightning emblem, rather than overlapping upgrade rings.
   const bolt=new THREE.Shape();for(const [i,point] of [[.08,.52],[-.23,.16],[-.02,.16],[-.27,-.23],[-.05,-.23],[-.3,-.55],[.28,-.04],[.07,-.04],[.34,.34],[.14,.34]].entries()){if(i===0)bolt.moveTo(...point);else bolt.lineTo(...point);}bolt.closePath();
   add(new THREE.ExtrudeGeometry(bolt,{depth:.035,bevelEnabled:false}),0xf2df35,-.35,1.12,1.0);
   for(const x of [-.87,.58])cube(.07,.62,.065,0x64727a,x,.94,1.01);
   cube(1.78,.28,.45,0x101519,-.15,1.83,-.79);
   // Compact orange firing control held by the operator, independent of the sprite pose.
   cube(.12,.13,.26,0xec7434,.89,1.02,.51);
  }else{
   cube(1.87,.6,1.76,armor,-.15,.96,0);
   for(const x of [-1.24,.94])for(const z of [-.69,.69]){
    const wheel=add(new THREE.CylinderGeometry(.52,.52,.26,10),0x323b41,x,.5,z);wheel.rotation.z=Math.PI/2;
    const ring=add(new THREE.CylinderGeometry(.4,.4,.29,10),0xf4c631,x,.5,z);ring.rotation.z=Math.PI/2;
    const hub=add(new THREE.CylinderGeometry(.24,.24,.32,8),trim,x,.5,z);hub.rotation.z=Math.PI/2;
   }
   for(const x of [-.78,.48]){
    const plate=cube(.48,.46,.11,0xf4c631,x,1.25,.91);plate.rotation.z=x<0?-.12:.12;
    cube(.1,.63,.13,trim,x-.23,1.25,.96);
   }
   for(const x of [-1.1,.8])cube(.08,.3,.64,0xf4c631,x,1.07,-.18);
   for(const x of [-.83,.54])for(const y of [.85,1.05]){const bolt=add(new THREE.CylinderGeometry(.035,.035,.08,6),0xabb5b8,x,y,.92);bolt.rotation.x=Math.PI/2;}
  }
 }
 for(const x of [-.31,.31]){
  sphere(.3,colors.fur,x,.22,.16,monkey).scale.set(.9,.62,1.3);
  sphere(.26,colors.fur,x,.5,0,monkey).scale.y=1.25;
  for(const dx of [-.1,0,.1])sphere(.065,colors.face,x+dx,.19,.47,monkey);
 }
 sphere(.63,colors.fur,0,1.04,0,monkey).scale.set(.85,1.2,.7);
 sphere(.41,colors.belly,0,1.03,.39,monkey).scale.set(.8,1.18,.3);
 sphere(.79,colors.fur,0,2.0,0,monkey).scale.set(1,.95,.84);
 for(const x of [-.72,.72]){
  sphere(.25,colors.dark,x,1.92,-.02,monkey).scale.z=.45;
  sphere(.17,colors.face,x,1.93,.11,monkey).scale.z=.35;
 }
 sphere(.59,colors.face,0,1.9,.44,monkey).scale.set(.97,.92,.38);
 for(const x of [-.23,.23]){
  sphere(.225,0xfff9e9,x,2.12,.65,monkey).scale.set(.81,1.23,.3);
  sphere(.083,0x231e19,x,2.11,.73,monkey).scale.set(.76,1.25,.38);
  const brow=cube(.31,.105,.11,colors.dark,x,2.42,.61,monkey);brow.rotation.z=x<0?-.17:.17;
 }
 cube(.14,.045,.07,colors.dark,0,1.76,.69,monkey);
 if(bottomTier>=3){
  const purple=bottomTier===5?0x171b20:0x8323a6;
  sphere(.61,purple,0,1.94,.46,monkey).scale.set(1.02,.65,.4);
  for(const side of [-1,1]){const scarf=cube(.23,.7,.085,purple,side*.23,1.2,.4,monkey);scarf.rotation.z=side*.09;}
  if(bottomTier>=4){
   sphere(.66,0x252b30,0,1.1,-.02,monkey).scale.set(.85,.83,.74);
   for(const x of [-.31,.31])sphere(.32,0x191d22,x,.23,.17,monkey).scale.set(.95,.7,1.3);
   if(bottomTier===4){
    const ties=new THREE.Group();ties.position.set(.54,2.18,-.43);monkey.add(ties);g.userData.headbandTies=ties;
    for(const [y,angle] of [[.14,-.18],[-.13,.17]]){const ribbon=cube(.18,.16,.92,0x8323a6,.13,y,-.42,ties);ribbon.rotation.x=angle;ribbon.rotation.y=-.4;}
   }else{
    const hood=add(new THREE.SphereGeometry(.87,12,8,0,Math.PI*2,0,Math.PI*.8),0x171b20,0,2.04,0,monkey);hood.scale.set(1.05,1.13,.96);
    cube(1.03,.73,.13,0x14191e,0,1.98,.78,monkey);
    cube(.82,.08,.035,0xf2c233,0,2.08,.86,monkey);
    cube(.74,.075,.035,0x5b3621,0,2.18,.86,monkey);
    for(const side of [-1,1]){const trim=cube(.09,.57,.06,0xf2c233,side*.47,1.94,.81,monkey);trim.rotation.z=side*.15;}
    cube(.75,.1,.06,0xf2c233,0,1.63,.81,monkey);
    cube(.73,.31,.09,0x20262b,0,1.24,.49,monkey);
    for(const x of [-.26,.26])cube(.09,.33,.055,0xf2c233,x,1.25,.55,monkey);
   }
  }
  const belt=cube(.74,.16,.65,bottomTier===5?0x171b20:0x604024,0,.79,0,monkey);
  for(const x of [-.25,0,.25]){const arrow=add(new THREE.ConeGeometry(.09,.2,4),0xaeb8ba,x,.79,.44,monkey);arrow.rotation.z=Math.PI;}
 }
 // Swept, angular hair rather than a helmet, band or accumulated upgrade rings.
 for(let i=0;i<(middleTier>=4||bottomTier>=5?0:5);i++){
  const tuft=add(new THREE.ConeGeometry(.23,.63,4),colors.fur,-.48+i*.24,2.65,-.12-i*.025,monkey);
  tuft.rotation.set(-.55,0,-.35+i*.13);
 }
 if(middleTier){
  const color=middleTier===1?0x6cbe20:middleTier===2?0xe01b15:middleTier===3?0x36251e:middleTier===4?0x315eae:0x171c22,highlight=middleTier===1?0x9cdb40:middleTier===2?0xff4934:middleTier===3?0x594035:middleTier===4?0x4b75bb:0x30363d;
  const band=add(new THREE.CylinderGeometry(.57,.7,.25,12,1,true),color,0,2.45,0,monkey);band.scale.z=.84;band.material.side=THREE.DoubleSide;
  sphere(.16,highlight,.58,2.46,-.39,monkey).scale.set(1,.8,.7);
  if(middleTier===3||middleTier===4){
   cube(.88,.28,.13,0xc91918,0,2.5,.58,monkey);
   for(const x of [-.23,0,.23])cube(.1,.19,.035,middleTier===4?0xffd62e:0xfff1de,x,2.5,.665,monkey);
  }
  if(middleTier>=4){
   const plasma=middleTier===5,suit=plasma?0xb41b22:0x315eae,trim=plasma?0xd2aa36:0xf4c738;
   const helmet=add(new THREE.SphereGeometry(.81,12,6,0,Math.PI*2,0,Math.PI/2),color,0,2.02,0,monkey);helmet.scale.set(1.03,1.02,.88);
   sphere(.64,suit,0,1.12,0,monkey).scale.set(.87,.76,.73);
   // Stitched chin straps frame the face, with gold seams and a small clasp.
   for(const side of [-1,1]){
    const strap=cube(.115,.65,.115,color,side*.57,1.83,.42,monkey);strap.rotation.z=side*.25;
    for(let i=0;i<4;i++)cube(.07,.055,.035,trim,side*(.57+(1-i)*.035),1.58+i*.13,.49,monkey);
   }
   cube(.89,.11,.1,color,0,1.5,.52,monkey);
   for(const x of [-.35,-.15,.05,.25])cube(.075,.045,.025,trim,x,1.5,.58,monkey);
   cube(.5,.39,.08,plasma?0x29232b:suit,0,1.26,.51,monkey);
   const emblem=new THREE.Group();emblem.position.set(-.03,1.26,.575);monkey.add(emblem);
   cube(.055,.31,.035,trim,-.065,0,0,emblem);
   for(const y of [-.075,.075]){const stroke=add(new THREE.TorusGeometry(.073,.025,4,8,Math.PI),trim,-.04,y,0,emblem);stroke.rotation.z=-Math.PI/2;}
   const cape=new THREE.Group();cape.position.set(0,1.44,-.39);monkey.add(cape);
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.43,0,0,.43,0,0,.66,-.85,-.4,-.43,0,0,.66,-.85,-.4,-.66,-.85,-.4],3));geometry.computeVertexNormals();
   const material=mat(plasma?0x87101d:0xc72425);material.side=THREE.DoubleSide;const cloth=new THREE.Mesh(geometry,material);cloth.castShadow=true;cape.add(cloth);g.userData.uniformCape=cape;
   if(plasma){
    cube(1.02,.58,.14,0x242126,0,2.12,.7,monkey);
    for(const [x,y] of [[-.34,2.04],[0,2.32],[.34,2.04]]){
     const rim=add(new THREE.CylinderGeometry(.235,.235,.16,10),0xe0b82e,x,y,.82,monkey);rim.rotation.x=Math.PI/2;
     const lens=add(new THREE.SphereGeometry(.173,10,6),0xb82ee0,x,y,.93,monkey);lens.scale.z=.35;
     sphere(.045,0xf7c6ff,x-.045,y+.065,.995,monkey).scale.z=.3;
    }
    cube(.71,.15,.73,trim,0,.83,0,monkey);cube(.28,.19,.08,0xe6bd3d,0,.83,.44,monkey);
   }
  }
  const ties=new THREE.Group();ties.position.set(.59,2.46,-.42);monkey.add(ties);g.userData.headbandTies=ties;
  // Angular cloth ribbons with their own neutral silhouette, rather than the reference pose.
  for(const [points,tint] of [
   [[[0,0,0],[.28,.19,-.18],[.56,.23,-.41],[.76,.12,-.63]],color],
   [[[0,-.05,0],[.21,-.21,-.2],[.5,-.25,-.37],[.7,-.11,-.59]],highlight]
  ]){
   const vertices=[];
   for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1],wa=i===0?.1:.085,wb=i===points.length-2?.025:.085;
    vertices.push(a[0],a[1]-wa,a[2],b[0],b[1]-wb,b[2],b[0],b[1]+wb,b[2],a[0],a[1]-wa,a[2],b[0],b[1]+wb,b[2],a[0],a[1]+wa,a[2]);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
   const material=mat(tint);material.side=THREE.DoubleSide;const ribbon=new THREE.Mesh(geometry,material);ribbon.castShadow=true;ties.add(ribbon);
  }
 }
 const tail=add(new THREE.TorusGeometry(.45,.12,5,12,Math.PI*1.65),colors.fur,0,1.0,-.63,monkey);tail.rotation.y=Math.PI/2;
 // The first two supplied references distinguish their colored tail tip.
 if(tier<=2&&!middleTier&&!bottomTier){const tip=sphere(.17,tier===1?0x65a334:0xb93e27,0,1.38,-.95,monkey);tip.scale.set(.75,.6,1.15);}
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.56,1.45,.05);monkey.add(arm);
  sphere(.23,middleTier>=4?(middleTier===5?0xb41b22:0x315eae):colors.fur,0,-.18,.06,arm);sphere(.21,middleTier>=4?(middleTier===5?0xb41b22:0x315eae):colors.fur,0,-.4,.13,arm).scale.y=1.3;
  if(bottomTier>=1){const cuff=cyl(.24,.24,.19,bottomTier===1?0x58a92f:bottomTier===2?0xd4201b:bottomTier===5?0xf2c233:0x8323a6,0,-.43,.14);cuff.rotation.x=-.3;arm.add(cuff);}
  sphere(.23,colors.fur,0,-.58,.21,arm);cube(.2,.1,.12,colors.face,0,-.59,.38,arm);
  g.userData[side===1?'rightArm':'leftArm']=arm;
 }
 const weapon=new THREE.Group();body.add(weapon);g.userData.weapon=weapon;
 buildDartTopWeapon({...t,mesh:g});
 return g;
}
function buildDartTopWeapon(t){
 const data=t.mesh.userData,w=data.weapon;
 for(const child of [...w.children])disposeTransientMesh(child);
 data.loadedAmmo=null;w.position.set(0,0,0);w.rotation.set(0,0,0);w.scale.setScalar(1);
 if(data.dartBottomTier>=3){
  const bottom=data.dartBottomTier,black=bottom>=4,master=bottom===5;
  w.position.set(master?.38:.57,1.18,.42);
  w.add(box(.18,.2,1.16,black?0x20272c:0x88582e,0,0,.18));
  w.add(box(.23,.24,.24,0x59676e,0,.06,.56));
  for(const side of [-1,1]){const limb=box(.66,.13,.16,master?0xf2c233:black?0x333e45:0x78868d,side*.4,.09,.57);limb.rotation.y=-side*.25;w.add(limb);const tip=box(.2,.17,.14,master?0xf2c233:black?0x171e23:0xb6c0c2,side*.77,.09,.47);tip.rotation.y=-side*.45;w.add(tip);}
  w.add(box(1.5,.025,.025,0xb9b4a3,0,.08,.39));w.add(box(.12,.33,.15,0x654126,0,-.2,-.05));
  const bolt=makeProjectileMesh('crossbowBolt');bolt.scale.setScalar(.75);bolt.position.set(0,.18,.4);w.add(bolt);data.loadedAmmo=bolt;
  if(black){
   const scope=cyl(.2,.2,.58,0x20272c,0,.38,.12);scope.rotation.x=Math.PI/2;w.add(scope);
   const rim=cyl(.19,.19,.065,master?0xd4aa28:0x4b525a,0,.38,.435);rim.rotation.x=Math.PI/2;w.add(rim);
   const lens=cyl(.145,.145,.075,master?0xffda3a:0x8323a6,0,.38,.48);lens.rotation.x=Math.PI/2;w.add(lens);
   w.add(box(.31,.38,.48,0x20272c,0,.02,.11));
   if(master)for(const x of [-.53,.53])w.add(box(.24,.11,.42,0xf2c233,x,.08,.53));
  }
  w.scale.setScalar(master?1.3:black?1.15:1);
 }else if(data.dartTopTier===3){
  w.position.set(-.2,1.04,-.34);
  // Wooden sling arm, steel open bucket and dark cup interior, angled upward.
  const shaft=cyl(.15,.21,1.5,0xc58b36,0,.38,.22);shaft.rotation.x=.8;w.add(shaft);
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(.62,.46,.72,10,1,true),mat(0x7f898e));
  cup.rotation.x=1.14;cup.position.set(0,.93,.71);w.add(cup);
  const direction=new THREE.Vector3(0,.42,.91),rim=new THREE.Mesh(new THREE.TorusGeometry(.62,.09,5,12),mat(0xadb7ba));
  rim.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction.clone().normalize());rim.position.copy(cup.position).addScaledVector(direction,.36);w.add(rim);
  const inside=new THREE.Mesh(new THREE.CircleGeometry(.51,10),mat(0x202629));inside.quaternion.copy(rim.quaternion);inside.position.copy(cup.position).addScaledVector(direction,.12);w.add(inside);
  const ammo=makeProjectileMesh('spikeball');ammo.scale.setScalar(.79);ammo.position.copy(cup.position).addScaledVector(direction,.2);w.add(ammo);data.loadedAmmo=ammo;
 }else if(data.dartTopTier>=4){
  const ultra=data.dartTopTier===5;
  w.position.set(-.24,1.3,ultra?-.65:.02);
  const cradle=cyl(ultra?.82:.68,ultra?.67:.57,.36,ultra?0x252e33:0x69777d,0,.21,.12);w.add(cradle);
  const rim=ring(ultra?.81:.68,.07,ultra?0x515b62:0x9aa6ab,.4);rim.position.z=.12;w.add(rim);
  for(const x of [-(ultra?.77:.6),ultra?.77:.6])w.add(box(.15,.62,.34,ultra?0x11171b:0x536269,x,.21,.12));
  const ammo=makeProjectileMesh(ultra?'ultraJuggernautBall':'juggernautBall');ammo.scale.setScalar(ultra?2.25:1.92);ammo.position.set(0,ultra?1.28:1.11,.12);w.add(ammo);data.loadedAmmo=ammo;
 }else{
  w.position.set(.57,1.18,.42);
  const ammo=makeProjectileMesh('sharpDart');ammo.scale.setScalar(.9);w.add(ammo);data.loadedAmmo=ammo;
  if(t.paths[1]>=3){
   const bundle=new THREE.Group();w.add(bundle);bundle.add(ammo);data.loadedAmmo=bundle;
   for(const x of [-.3,.3]){const dart=makeProjectileMesh('sharpDart');dart.position.x=x;dart.rotation.y=x<0?-.18:.18;dart.scale.setScalar(.8);bundle.add(dart);}
   if(data.dartMiddleTier>=3)bundle.traverse(o=>{if(o.material?.color?.getHex()===0xe7bf58)o.material.color.setHex(0xc91918);});
  }
 }
 w.userData.rest=w.position.clone();
}

function updateWeaponAppearance(t){
 if(t.mesh.userData.glueRig){
  const rig=t.mesh.userData.glueRig,[a,,c]=t.paths;rig.glueMaterial.color.setHex(a>=2?0x83d961:c>=3?0xba8ce3:0xf0cf25);return;
 }
 if(t.mesh.userData.bombRig||t.mesh.userData.tackRig||t.mesh.userData.iceRig)return;
 if(t.mesh.userData.dartTopTier){buildDartTopWeapon(t);return;}
 const w=t.mesh.userData.weapon;for(const child of [...w.children])disposeTransientMesh(child);
 const add=(o)=>{w.add(o);return o};const [a,b,c]=t.paths;
 w.position.set(0,0,0);w.rotation.set(0,0,0);
 if(t.type==='bomb'){
  const barrel=cyl(b>=2?.31:.38,.5,b>=2?2.2:1.8, a>=5?0xc5ced3:0x293842,1.05,1.12,0);barrel.rotation.z=-Math.PI/2;add(barrel);
  const rim=cyl(.44,.44,.16,b>=3?0xc95143:0x8d9aa1,1.93,1.12,0);rim.rotation.z=-Math.PI/2;add(rim);
  if(b>=2){const rocket=makeProjectileMesh('missile');rocket.rotation.y=Math.PI/2;rocket.position.set(1.4,1.12,0);rocket.scale.setScalar(1.5);add(rocket);}
 }else if(t.type==='dart'){
  w.position.set(.67,1.18,.5);
  if(a>=3){for(const x of [-.35,.35])add(box(.12,.8,.14,0x6b4833,x,.2,0));add(box(.8,.08,.1,0x283848,0,.52,0));const ammo=makeProjectileMesh('spikeball');ammo.position.y=.4;ammo.scale.setScalar(.7);add(ammo);}
  else if(c>=3){add(box(.85,.12,.12,c>=5?0xf6cd65:0x68452d,0,.1,.12));add(box(.14,.16,.85,0x384552,0,.1,.2));}
  else{const dart=makeProjectileMesh('dart');dart.scale.setScalar(.65);add(dart);}
 }else if(t.type==='boomer'){
  w.position.set(.8,1.25,.5);const rang=makeProjectileMesh(c>=3?'kylie':c>=2?'hotBoomer':a>=2?'glaive':'boomer');rang.scale.setScalar(.8);add(rang);
 }else if(t.type==='hero'){
  w.position.set(.72,1.55,.55);const bow=new THREE.Mesh(new THREE.TorusGeometry(.62,.065,5,12,Math.PI),mat(t.level>=10?0xe7bf65:0x785034));bow.rotation.z=-Math.PI/2;add(bow);add(box(.03,1.23,.03,0xe7e5c7,0,0,0));
 }else if(t.type==='glue'||(t.type==='ice'&&c>=3)){
  w.position.set(.65,1.22,.48);add(box(.4,.3,.85,t.type==='ice'?0x609cae:a>=2?0x69b954:0xe6c544,0,0,.15));const barrel=cyl(.12,.19,.7,0x354a55,0,0,.65);barrel.rotation.x=Math.PI/2;add(barrel);add(box(.28,.2,.3,0xe4f4f4,0,.25,0));
 }else if(t.type==='ice'){
  w.position.set(.8,1.17,.48);add(new THREE.Mesh(new THREE.OctahedronGeometry(.3),mat(0xb1f5ff)));
 }
 w.userData.rest=w.position.clone();
}

function removeUpgradeVisuals(mesh){
 [...mesh.children].filter(c=>c.userData&&c.userData.upgradeVisual).forEach(disposeTransientMesh);
}
function addVisual(mesh,obj){obj.userData.upgradeVisual=true;mesh.add(obj);return obj}
function box(w,h,d,color,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));o.position.set(x,y,z);return o}
function cyl(rt,rb,h,color,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,12),mat(color));o.position.set(x,y,z);return o}
function ring(r,t,color,y=1.2){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,24),mat(color));o.rotation.x=Math.PI/2;o.position.y=y;return o}
function updateTowerAppearance(t){
 if(t.type==='boomer'){updateBoomerangAppearance(t,disposeTransientMesh);return}
 if(t.type==='ice'){
  const tier=Math.max(...t.paths),path=t.paths.indexOf(tier);
  if(t.mesh.userData.iceModelTier!==tier||t.mesh.userData.iceModelPath!==(tier?path:-1)){
   const factory=[makeIceTopTowerMesh,makeIceMiddleTowerMesh,makeIceBottomTowerMesh][path];
   replaceTowerBody(t,tier?factory(tier):makeBaseIceTowerMesh());
  }
  return;
 }
 if(t.type==='tack'){
  const tier=Math.max(...t.paths),path=t.paths.indexOf(tier);
  const portCount=path===0&&tier>=4?8:t.tacks;
  if(t.mesh.userData.tackModelPath!==path||t.mesh.userData.tackModelTier!==tier||t.mesh.userData.tackModelPorts!==portCount){
   const factory=[makeTackTopTowerMesh,makeTackMiddleTowerMesh,makeTackBottomTowerMesh][path];
   replaceTowerBody(t,factory(tier,portCount));
  }
  return;
 }
 if(t.type==='bomb'){
  const tier=Math.max(...t.paths),path=t.paths.indexOf(tier);
  if(t.mesh.userData.bombModelPath!==path||t.mesh.userData.bombModelTier!==tier){
   const factory=[makeBombTopTowerMesh,makeBombMiddleTowerMesh,makeBombBottomTowerMesh][path];
   replaceTowerBody(t,factory(tier));
  }
  return;
 }
 if(t.type==='dart'){
  const [top,middle,bottom]=t.paths;
  const middleTier=middle>=1&&middle<=5&&top<=2&&bottom<=2?middle:0;
  const bottomTier=bottom>=1&&bottom<=5&&top<=2?bottom:0;
  const tier=middleTier||bottomTier?(top||1):dartTopModelTier(t),key=middleTier?`dart-middle-${middleTier}-top-${top}-bottom-${bottomTier}`:bottomTier?`dart-bottom-${bottomTier}-top-${top}`:tier?`dart-top-${tier}`:'dart-legacy';let replaced=false;
  if(t.mesh.userData.appearanceKey!==key){
   replaceTowerBody(t,tier?makeDartTopMesh(t,tier,middleTier,bottomTier):makeTowerMesh('dart'));
   t.mesh.userData.appearanceKey=key;replaced=true;
  }
  if(tier){if(!replaced)updateWeaponAppearance(t);return;}
 }
 const g=t.mesh;removeUpgradeVisuals(g);updateWeaponAppearance(t);
 const [a,b,c]=t.paths;
 // Small path-colored rank studs make every purchased tier readable at a glance.
 for(let path=0;path<3;path++)for(let tier=0;tier<t.paths[path];tier++){
  const stud=new THREE.Mesh(new THREE.OctahedronGeometry(tier===4?.095:.065),mat([0xf4ab55,0x69d0df,0xb797ee][path]));stud.position.set(-.4+path*.4,.45+tier*.16,.84);addVisual(g,stud);
 }
 if(t.type==='dart'){
  if(a>=1)addVisual(g,ring(.77,.07,0x2f9f45,1.65));
  if(a>=3){const fork=box(.18,.8,.18,0x4b3c2e,.52,2.0,0);fork.rotation.z=-.35;addVisual(g,fork);const fork2=fork.clone();fork2.position.x=-.52;fork2.rotation.z=.35;fork2.userData.upgradeVisual=true;g.add(fork2);const ammo=makeProjectileMesh('spikeball');ammo.scale.setScalar(.8);ammo.position.set(-1.0,.95,.55);addVisual(g,ammo);}
  if(a>=4)addVisual(g,cyl(.55,.68,.34,0x7f8b94,0,2.35,0));
  if(a>=5)addVisual(g,ring(.92,.12,0xc4d2dc,2.18));
  if(b>=1)addVisual(g,box(.28,.16,.38,0x1d77d3,.72,1.22,.2));
  if(b>=3){for(const z of [-.28,0,.28])addVisual(g,box(.7,.06,.08,0xd9d9d9,.85,1.38,z));}
  if(b>=4)addVisual(g,box(1.45,.08,.9,0xd13a36,0,1.3,-.42));
  if(c>=2){for(const x of [-.3,.3])addVisual(g,new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:0x5fdcff}))).position.set(x,1.82,.73);}
  if(c>=3){const limb=box(1.8,.1,.1,0x4b2d20,.2,1.35,.45);limb.rotation.z=.15;addVisual(g,limb);}
  if(c>=4)addVisual(g,cyl(.9,.82,.25,0x243746,0,2.22,0));
 }
 if(t.type==='bomb'){
  if(a>=1)addVisual(g,ring(1.0,.12,0x757d83,.72));
  if(a>=3)addVisual(g,cyl(.58,.68,.45,0x555d64,.8,1.15,0));
  if(a>=4)addVisual(g,box(.38,.22,1.5,0xc94d42,0,.82,0));
  if(a>=5)addVisual(g,ring(1.35,.15,0xb9c1c8,.75));
  if(b>=2){const nose=new THREE.Mesh(new THREE.ConeGeometry(.42,1.1,12),mat(0xcfcfcf));nose.rotation.z=-Math.PI/2;nose.position.set(2.0,1.15,0);addVisual(g,nose)}
  if(b>=3)addVisual(g,box(.22,.55,.75,0xb52f2f,.25,1.15,0));
  if(c>=2){for(const z of [-.7,.7])addVisual(g,cyl(.18,.22,.75,0x33383c,-.7,.75,z));}
  if(c>=3)addVisual(g,ring(1.2,.09,0xd7a23a,.72));
 }
 if(t.type==='tack'){
  if(a>=3){addVisual(g,ring(1.15,.1,0xff8b2e,1.0));for(let i=0;i<8;i++){const a0=i*Math.PI/4;const tip=new THREE.Mesh(new THREE.ConeGeometry(.09,.45,6),mat(0xff9b3d));tip.position.set(Math.cos(a0)*1.45,.82,Math.sin(a0)*1.45);tip.rotation.z=Math.PI/2;tip.rotation.y=-a0;addVisual(g,tip)}}
  if(a>=4)addVisual(g,ring(1.45,.16,0xff5438,1.25));
  if(a>=5)addVisual(g,ring(1.7,.12,0xffd66a,1.45));
  if(b>=3){const disc=cyl(1.0,1.0,.18,0x9ba7b0,0,1.28,0);addVisual(g,disc)}
  if(b>=4)addVisual(g,ring(1.55,.1,0x73c9e8,1.18));
  if(c>=1){for(let i=0;i<Math.min(8,(c*2));i++){const a0=(i+.5)*Math.PI/4;const barrel=box(.5,.12,.12,0x4d5358,Math.cos(a0)*1.15,1.02,Math.sin(a0)*1.15);barrel.rotation.y=-a0;addVisual(g,barrel)}}
  if(c>=4)addVisual(g,cyl(1.3,1.42,.26,0x30353a,0,1.2,0));
 }
 if(t.type==='ice'){
  if(a>=1)addVisual(g,ring(.85,.08,0x9cecff,1.55));
  if(a>=3){for(let i=0;i<5;i++){const q=new THREE.Mesh(new THREE.ConeGeometry(.12,.7,6),mat(0xc9f8ff));q.position.set(Math.cos(i*1.256)*.7,2.35,Math.sin(i*1.256)*.7);addVisual(g,q)}}
  if(a>=4)addVisual(g,ring(1.05,.12,0x6fd6ff,1.82));
  if(b>=3){const aura=ring(1.4,.08,0xa8efff,.75);addVisual(g,aura)}
  if(b>=5)addVisual(g,ring(1.7,.1,0xe5fbff,1.15));
  if(c>=3){const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,1.5,10),mat(0x9fe8ff));barrel.rotation.z=Math.PI/2;barrel.position.set(1.0,1.5,.25);addVisual(g,barrel)}
  if(c>=4)addVisual(g,cyl(.72,.82,.28,0x4f7f9f,0,2.14,0));
 }
 if(t.type==='glue'){
  if(a>=1)addVisual(g,cyl(.48,.5,.9,0x92a6a8,-.72,1.2,-.18));
  if(a>=2)addVisual(g,cyl(.35,.38,.78,0x57c96d,-.78,1.25,.4));
  if(a>=4)addVisual(g,ring(.9,.08,0x80e86d,1.65));
  if(b>=2){for(const z of [-.35,.35])addVisual(g,box(.85,.18,.18,0xf0d24e,.75,1.35,z));}
  if(b>=3)addVisual(g,cyl(.55,.62,.25,0xf3df69,0,2.12,0));
  if(c>=2)addVisual(g,cyl(.48,.52,.95,0x6b4b8e,-.72,1.18,0));
  if(c>=4)addVisual(g,ring(.92,.11,0x8d5bc3,1.6));
 }
 if(t.type==='hero')updateHeroAppearance(t);
}
function updateHeroAppearance(t){
 const g=t.mesh;removeUpgradeVisuals(g);updateWeaponAppearance(t);
 if(t.level>=5)addVisual(g,box(.95,.08,.62,0x4c713d,0,1.32,-.45));
 if(t.level>=7)addVisual(g,cyl(.55,.65,.24,0x854331,0,2.18,0));
 if(t.level>=10)addVisual(g,ring(.82,.07,0xe3bd55,2.02));
 if(t.level>=20)addVisual(g,ring(1.0,.09,0xffe89a,1.75));
}
function createTower(type,x,z){const d=towerDefs[type];const mesh=makeTowerMesh(type);mesh.position.set(x,.66,z);scene.add(mesh);return{id:nextTowerId++,type,x,z,mesh,throwHand:1,damageDealt:0,abilityCd:0,blitzCd:0,abilityTimer:0,abilityTick:0,abilityAngle:0,activeAbility:null,fanBuffs:[],fanTier:0,glueLevel:d.glueLevel||0,projSpeed:d.projSpeed,projectileLife:d.projectileLife,projectileRadius:d.projectileRadius,glueLayers:d.glueLayers||0,range:d.range,rate:d.rate,damage:d.damage||0,cool:0,pressCool:0,invest:d.cost,target:'first',paths:[0,0,0],level:d.hero?1:0,pierce:d.pierce||1,splash:d.splash||0,slow:d.slow||0,slowDuration:d.slowDuration||2.8,freeze:d.freeze||0,tacks:d.tacks||8,shots:1,bonusMoab:0,shotCounter:0,rapidCd:0,rapidTimer:0,stormCd:0,stormTimer:0,stormTick:0,damageType:d.damageType||'',notes:d.notes||'',camoDetect:!!d.camoDetect,recoil:0,fireAnim:0}}
function damageTypeNotes(t){
 if(t.type==='hero')return '';
 const camo=t.camoDetect?'Can detect Camo':'Cannot hit Camo';
 if(t.damageType==='Normal')return `Pops all standard bloon materials • ${camo}`;
 if(t.damageType==='Heat')return `Pops Lead natively • ${camo}`;
 if(t.damageType==='Flame')return `Pops Lead and Frozen; cannot pop Purple • ${camo}`;
 if(t.damageType==='Plasma')return `Pops Lead but not Purple • ${camo}`;
 if(t.damageType==='Explosion')return `Pops Lead; cannot pop Black or Zebra • ${camo}`;
 if(t.type==='ice'&&t.brittle)return `Hits blimps and DDTs; strips Camo/Regrow; targets take +${t.brittle} damage • ${camo}`;
 if(t.damageType==='Cold Snap')return `Can freeze Lead; cannot affect White or Zebra • ${camo}`;
 if(t.damageType==='Cold')return `Cannot affect Lead, White, or Zebra • ${camo}`;
 if(t.damageType==='Shatter')return `Pops Frozen; cannot pop Lead • ${camo}`;
 if(t.damageType==='Sharp')return `Cannot pop Lead • ${camo}`;
 return camo;
}

function getTowerAbilities(t){
 if(t.type==='hero'){
  const abilities=[];
  if(t.level>=3)abilities.push({key:'rapid',name:'Rapid Shot',description:'Temporarily increases Quincy\'s attack speed.'});
  if(t.level>=10)abilities.push({key:'storm',name:'Storm of Arrows',description:'Rain damaging arrows over the whole track.'});
  return abilities;
 }
 const tier=t.paths[1];
 if(t.type==='bomb'&&t.paths[2]>=5)return [{key:'blitz',kind:'blitz',name:'Bomb Storm',passive:true,description:'After a life is lost, instantly deal 2,000 damage across the map, then clear surviving MOABs and regular bloons. 45s cooldown.'}];
 if(tier<4)return [];
 const ability={...primaryAbilities[t.type][tier>=5?1:0],tier,key:'primary'};
 if(t.type==='tack'){
  ability.tick*=Math.pow(.85,Math.min(2,t.paths[0]));
  ability.duration+=Math.min(2,t.paths[2])*(tier>=5?1.5:.5);
  ability.direction=tier===4&&t.paths[2]>=1?-1:1;
  ability.description=`${ability.waves} ${ability.direction<0?'counter-clockwise':'clockwise'} blade waves for ${ability.duration}s. Pops Frozen and hits Camo${tier>=5?' and Lead':'; cannot pop Lead'}.`;
 }
 return [ability];
}
function abilityState(t,ability){
 const cooldown=ability.key==='rapid'?t.rapidCd:ability.key==='storm'?t.stormCd:ability.key==='blitz'?t.blitzCd:t.abilityCd;
 const remaining=ability.key==='rapid'?t.rapidTimer:ability.key==='storm'?t.stormTimer:t.abilityTimer;
 const noBlimp=ability.kind==='assassin'&&!enemies.some(e=>e.alive&&e.isBlimp);
 const disabled=ability.passive||gameEnded||!roundActive||cooldown>0||remaining>0||noBlimp;
 const text=gameEnded?'Game finished':remaining>0?'Active '+remaining.toFixed(1)+'s':cooldown>0?'Cooldown '+Math.ceil(cooldown)+'s':ability.passive?'Automatic on leak':!roundActive?'Start a round':noBlimp?'Needs a blimp':'Ready';
 return {disabled,text,active:remaining>0};
}
function refreshAbilityUI(){
 const liveKeys=new Set();
 for(const t of towers)for(const ability of getTowerAbilities(t)){
  const key=t.id+':'+ability.key;liveKeys.add(key);
  let button=abilityNodes.get(key);
  if(!button){
   button=document.createElement('button');button.type='button';button.className='abilityButton';
   button.innerHTML='<b></b><small></small>';
   button.addEventListener('click',()=>activateTowerAbility(t,ability.key));
   abilityNodes.set(key,button);abilityButtons.appendChild(button);
  }
  const state=abilityState(t,ability);
  button.firstElementChild.textContent=ability.name;
  button.lastElementChild.textContent=towerDefs[t.type].name+' #'+t.id+' • '+state.text;
  button.disabled=state.disabled;button.title=ability.description;
  button.classList.toggle('abilityActive',state.active);
 }
 for(const [key,button] of abilityNodes)if(!liveKeys.has(key)){button.remove();abilityNodes.delete(key)}
 abilityBar.classList.toggle('hidden',abilityNodes.size===0);
 abilityBar.classList.toggle('withSelection',!!selectedTower);
 const ability=selectedTower&&getTowerAbilities(selectedTower).find(a=>a.key==='primary');
 towerAbilityBtn.classList.toggle('hidden',!ability);
 if(ability){
  const state=abilityState(selectedTower,ability);
  towerAbilityBtn.textContent=ability.name+' • '+state.text;
  towerAbilityBtn.disabled=state.disabled;towerAbilityBtn.title=ability.description;
  towerAbilityBtn.classList.toggle('abilityActive',state.active);
 }
}
towerAbilityBtn.addEventListener('click',()=>{if(selectedTower)activateTowerAbility(selectedTower,'primary')});

function disposeTransientMesh(mesh){
 if(!mesh)return;
 mesh.removeFromParent();
 const geometries=new Set(),materials=new Set();
 mesh.traverse(o=>{o.userData?.bloonInstance?.renderer.release(o);if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)}});
 for(const geometry of geometries)geometry.dispose();
 for(const material of materials)material.dispose();
}
function spawnAbilityPulse(x,z,color,radius=8){
 const meshes=[];
 for(const [r,opacity] of [[radius,.75],[radius*.76,.3]]){
  const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,.1,6,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
  mesh.rotation.x=Math.PI/2;mesh.position.set(x,.72,z);mesh.scale.setScalar(.12);scene.add(mesh);meshes.push(mesh);
 }
 visualEffects.push({kind:'abilityPulse',meshes,life:.8,maxLife:.8,opacities:[.75,.3]});
}
function setAbilityHalo(t,ability){
 disposeTransientMesh(t.abilityHalo);
 t.abilityHalo=new THREE.Mesh(new THREE.TorusGeometry(1.55,.12,8,32),new THREE.MeshBasicMaterial({color:ability.color,transparent:true,opacity:.85}));
 t.abilityHalo.rotation.x=Math.PI/2;t.abilityHalo.position.y=.18;t.mesh.add(t.abilityHalo);
}
function setFanBoostTier(t,tier){
 // Fan Club is a stat boost: retain the purchased tower model and weapon.
 t.fanTier=tier;
}
function getAttackTower(t){
 let attack=t;
 if(t.fanTier){
  const plasma=t.fanTier>=5;
  attack={...t,sourceTower:t,range:40*RANGE_SCALE,rate:plasma?.0325:.065,damage:plasma?2:1,pierce:plasma?5:t.pierce,shots:1,damageType:plasma?'Plasma':'Sharp'};
 }
 if(t.abilityTimer>0&&t.activeAbility?.kind==='turbo'){
  const hotBonus=t.type==='boomer'&&t.paths[1]>=5&&t.paths[2]>=2?2:0;
  attack={...attack,sourceTower:t,rate:attack.rate/t.activeAbility.rateMult,damage:attack.damage+t.activeAbility.damageBonus+hotBonus};
 }
 return attack;
}
function strongestBlimp(){
 return enemies.filter(e=>e.alive&&e.isBlimp).sort((a,b)=>b.hp-a.hp||progress(b)-progress(a))[0]||null;
}
function chooseBombAbilityTarget(t){
 const candidates=enemies.filter(e=>e.alive&&e.isBlimp);
 if(t.target==='strong')return candidates.sort((a,b)=>b.hp-a.hp||progress(b)-progress(a))[0]||null;
 if(t.target==='close')return candidates.sort((a,b)=>Math.hypot(a.mesh.position.x-t.x,a.mesh.position.z-t.z)-Math.hypot(b.mesh.position.x-t.x,b.mesh.position.z-t.z))[0]||null;
 return candidates.sort((a,b)=>t.target==='last'?progress(a)-progress(b):progress(b)-progress(a))[0]||null;
}
function fireBombAbility(t,ability){
 const target=chooseBombAbilityTarget(t);if(!target)return;
 const position=target.mesh.position.clone();
 // Damage resolves immediately. The flying missile only illustrates the strike.
 aimTower(t,target);
 fireProjectile(t,{alive:true,mesh:{position}},0,{visualType:'missile',abilityMissile:true,cosmetic:true,speed:55,splash:0,pierce:1});
 hitEnemy(target,ability.damage,{tower:t});
 const attack={...t,sourceTower:t,paths:[...t.paths],camoDetect:true,
  fragStats:t.paths[2]>=2?bombFragmentTuning[ability.tier>=5?'eliminator':'assassin']:null};
 spawnAbilityPulse(position.x,position.z,ability.color,t.splash);
 spawnImpactVisual({type:'bomb',visualType:'missile',tower:attack,splash:t.splash},position);
 // The unspecified weaker explosion uses the normal attack's damage/radius/pierce.
 explodeBomb({tower:attack,target,damage:t.damage,splash:t.splash,pierce:t.pierce},position);
}
function emitMaelstrom(t,ability){
 const attack={...t,sourceTower:t,paths:[...t.paths],damage:ability.damage,bonusMoab:0,camoDetect:true,damageType:ability.tier>=5?'Normal':'Shatter'};
 const waves=ability.waves??(ability.tier>=5?4:2);
 const direction=ability.tier===4&&t.paths[2]>=1?-1:1;
 t.abilityAngle+=direction*tackMiddleTuning.maelstromAngularStep;
 for(let i=0;i<waves;i++){
  const angle=t.abilityAngle+i*Math.PI*2/waves;
  const origin=t.mesh.userData.tackRig?.rotor?tackAbilityOrigin(t,angle):null;
  fireLinearProjectile(attack,angle,{visualType:'blade',cosmetic:false,damage:ability.damage,pierce:ability.pierce,speed:45,life:1.8,radius:.8,origin});
 }
 t.recoil=.11;t.fireAnim=.24;
}
function coatMapWithGlue(t,ability){
 for(const e of enemies){
  if(!e.alive)continue;
  const slow=e.isBlimp?Math.max(.75,t.slow||.5):(t.slow||.5);
  hitEnemy(e,0,{tower:t,glue:true,slow,slowDuration:ability.coatDuration,allowBlimpSlow:true,damageAmp:2,glueLayers:99,glueDps:t.glueDps||0});
 }
}
function applyMapIceFreeze(t,ability){
 const absolute=ability.tier>=5;
 if(absolute)absoluteZeroBuffT=Math.max(absoluteZeroBuffT,10);
 t.fireAnim=.24;t.iceAbilityAnim=.8;
 for(const e of enemies){
  if(!e.alive||e.type==='BAD'||(!absolute&&['Lead','DDT'].includes(e.type)&&t.damageType!=='Cold Snap'&&t.damageType!=='Normal'))continue;
  const duration=e.isBlimp||e.camo||['White','Zebra'].includes(e.type)?ability.specialFreezeDuration:ability.freezeDuration;
  e.abilityFreezeT=Math.max(e.abilityFreezeT||0,duration);
  if(!e.isBlimp){e.abilityFreezeLayers=Math.max(e.abilityFreezeLayers||0,ability.freezeLayers);if(t.postFreezeSlow<1){e.permafrostLayers=Math.max(e.permafrostLayers||0,ability.freezeLayers);e.permafrostSlow=Math.min(e.permafrostSlow||1,t.postFreezeSlow);}}
  ensureFreezeMarker(e);
 }
}
function activateTowerAbility(t,key){
 if(!towers.includes(t))return false;
 const ability=getTowerAbilities(t).find(a=>a.key===key);
 if(!ability)return false;
 const state=abilityState(t,ability);
 if(state.disabled){toastMsg(state.text);return false}
 if(key==='rapid'){
  t.rapidTimer=t.level>=13?12:8;t.rapidCd=t.level>=15?45:60;t.cool=0;
 }else if(key==='storm'){
  t.stormTimer=3;t.stormTick=0;t.stormCd=t.level>=18?55:70;
 }else{
  t.abilityCd=ability.cooldown;t.abilityTimer=ability.duration;t.activeAbility={...ability};t.abilityTick=ability.tick||0;
  if(ability.kind==='fanClub'){
   const targets=towers.filter(a=>a.type==='dart'&&a.paths[0]<3&&a.paths[2]<3&&(ability.tier>=5||a.paths[1]<5)&&Math.hypot(a.x-t.x,a.z-t.z)<=t.range)
    .sort((a,b)=>(a===t?-1:b===t?1:Math.hypot(a.x-t.x,a.z-t.z)-Math.hypot(b.x-t.x,b.z-t.z))).slice(0,ability.maxTargets);
   for(const ally of targets){
    ally.fanBuffs=ally.fanBuffs.filter(buff=>buff.sourceId!==t.id);
    ally.fanBuffs.push({sourceId:t.id,tier:ability.tier,remaining:ability.duration});
    setFanBoostTier(ally,Math.max(...ally.fanBuffs.map(buff=>buff.tier)));ally.cool=0;
   }
  }else if(ability.kind==='turbo')t.cool=0;
  else if(ability.kind==='assassin'){
   fireBombAbility(t,ability);
  }else if(ability.kind==='maelstrom')emitMaelstrom(t,ability);
  else if(ability.kind==='snowstorm'){
   applyMapIceFreeze(t,ability);
  }else if(ability.kind==='glueStorm')coatMapWithGlue(t,ability);
  if(ability.duration>0&&ability.kind!=='fanClub')setAbilityHalo(t,ability);
  spawnAbilityPulse(t.x,t.z,ability.color,['snowstorm','glueStorm'].includes(ability.kind)?Math.hypot(MAP_W,MAP_H):t.range);
  if(ability.duration===0)t.activeAbility=null;
 }
 toastMsg(ability.name+'!');refreshAbilityUI();if(selectedTower)refreshSelected();return true;
}
function updateTowerAbility(t,dt){
 t.abilityCd=Math.max(0,t.abilityCd-dt);
 t.blitzCd=Math.max(0,t.blitzCd-dt);
 t.fanBuffs=t.fanBuffs.map(buff=>({...buff,remaining:buff.remaining-dt})).filter(buff=>buff.remaining>0);
 setFanBoostTier(t,t.fanBuffs.reduce((tier,buff)=>Math.max(tier,buff.tier),0));
 if(t.abilityTimer>0){
  const ability=t.activeAbility,activeDt=Math.min(dt,t.abilityTimer);
  t.abilityTimer=Math.max(0,t.abilityTimer-dt);
  if(ability?.tick&&activeDt>0){
   t.abilityTick-=activeDt;
   while(t.abilityTick<=0){
    if(ability.kind==='maelstrom')emitMaelstrom(t,ability);
    else if(ability.kind==='glueStorm')coatMapWithGlue(t,ability);
    const tick=ability.kind==='maelstrom'?primaryAbilities.tack[ability.tier>=5?1:0].tick*Math.pow(.85,Math.min(2,t.paths[0])):ability.tick;
    t.abilityTick+=tick;
   }
  }
  if(t.abilityHalo)t.abilityHalo.scale.setScalar(1+.08*Math.sin(t.abilityTimer*8));
  if(t.abilityTimer<=0){disposeTransientMesh(t.abilityHalo);t.abilityHalo=null;t.activeAbility=null}
 }
}
function loseLives(amount){
 if(amount<=0)return;
 lives=Math.max(0,lives-amount);triggerBombBlitz();
}
function triggerBombBlitz(){
 for(const t of towers){
  if(t.type!=='bomb'||t.paths[2]<5||t.blitzCd>0)continue;
  t.blitzCd=45;
  for(const e of [...enemies])if(e.alive)hitEnemy(e,2000,{tower:t,ignoreGlueAmp:true});
  // Process children created by both phases too, so the storm leaves no MOAB or
  // regular layers alive. Larger surviving blimps keep their remaining HP.
  for(const e of enemies)if(e.alive&&(!e.isBlimp||e.type==='MOAB'))hitEnemy(e,e.hp,{tower:t,ignoreGlueAmp:true});
  spawnAbilityPulse(t.x,t.z,0xff7538,Math.hypot(MAP_W,MAP_H));toastMsg('Bomb Storm!');
 }
}
function pointSegDist(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1;let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(x-(a.x+t*dx),z-(a.z+t*dz))}
function onPath(x,z,clearance=.25){return PATH.some((p,i)=>i<PATH.length-1&&pointSegDist(x,z/meadowDepthScale,{x:p.x,z:p.z/meadowDepthScale},{x:PATH[i+1].x,z:PATH[i+1].z/meadowDepthScale})<EDGE_WIDTH/2+clearance)}
function towerFootprintRadius(type){return towerDefs[type].footprintRadius??1.2}
function towerFootprintsOverlap(type,x,z){return towers.some(t=>Math.hypot(t.x-x,t.z-z)<towerFootprintRadius(type)+towerFootprintRadius(t.type))}
function placementSurface(x,z){return waterRegions.some(r=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ)?'water':'land';}
function frozenWaterSource(x,z){return towers.find(t=>t.type==='ice'&&t.paths[1]>=3&&(t.x-x)**2+(t.z-z)**2<=t.range*t.range)||null;}
function surfacePlacement(type,x,z){
 const surface=placementSurface(x,z),native=(towerDefs[type].placementSurfaces||['land']).includes(surface);
 const source=surface==='water'&&!native?frozenWaterSource(x,z):null;
 return {allowed:native||!!source,surface,frozenBy:source?.id??null};
}
function placeTower(x,z){if(!selectedType)return;const d=towerDefs[selectedType],edgeClearance=d.footprintRadius??1;if(Math.abs(x)>MAP_W/2-edgeClearance||Math.abs(z)>MAP_H/2-edgeClearance)return toastMsg('Place towers on the meadow');if(cash<d.cost)return toastMsg('Not enough cash');if(d.hero&&heroPlaced)return toastMsg('Only one hero');if(onPath(x,z,d.footprintRadius??.25))return toastMsg('Cannot place on the path');if(towerFootprintsOverlap(selectedType,x,z))return toastMsg('Too close to another tower');const placement=surfacePlacement(selectedType,x,z);if(!placement.allowed)return toastMsg('Place this tower on land or frozen water');cash-=d.cost;const t=createTower(selectedType,x,z);t.placementSurface=placement.surface;t.frozenWaterSourceId=placement.frozenBy;updateTowerAppearance(t);towers.push(t);if(d.hero)heroPlaced=true;selectedType=null;shopBtns.forEach(b=>b.classList.remove('active'));selectTower(t);updateUI()}

function selectTower(t){selectedTower=t;selectedUpgradePath=null;selectedType=null;shopBtns.forEach(b=>b.classList.remove('active'));rangeRing.visible=true;rangeRing.position.set(t.x,.7,t.z);rangeRing.scale.set(t.range,t.range,t.range);selPanel.classList.remove('hidden');refreshSelected()}
// Preserve the elements under the pointer between pointerdown and click.
// Replacing innerHTML during the periodic panel refresh can swallow that click.
function setUpgradeLabel(button,title,detail){
 if(!button.firstElementChild){button.append(document.createElement('b'),document.createElement('small'));}
 const heading=button.firstElementChild,caption=button.lastElementChild;
 if(heading.textContent!==title)heading.textContent=title;
 if(caption.textContent!==detail)caption.textContent=detail;
}
function tierFiveTaken(t,p){return t.paths[p]===4&&towers.some(other=>other!==t&&other.type===t.type&&other.paths[p]===5)}
function refreshSelected(){
 const t=selectedTower;if(!t)return;const d=towerDefs[t.type];selName.textContent=d.name+(d.hero?` • Lv.${t.level}`:'');
 const attack=getAttackTower(t);
 rangeRing.scale.setScalar(attack.range);
 const shownRange=Math.round(attack.range/RANGE_SCALE*10)/10;
 selStats.innerHTML=`<b>Damage dealt: ${Math.floor(t.damageDealt||0).toLocaleString()}</b><br>Range ${shownRange} • Cooldown ${(attack.rate/(t.type==='ice'&&absoluteZeroBuffT>0?1.5:1)).toFixed(2)}s • Damage ${attack.damage} • Pierce ${attack.pierce}<br><b>${attack.damageType||'Hero'}</b>${t.type==='hero'?'':' • '+damageTypeNotes(attack)}`;
 if(t.type==='tack'){
  selStats.innerHTML+=`<br>${t.paths[0]>=4?'Flame burst':t.tacks+' nearby bloons per burst'} • Footprint radius 6`;
  if(t.paths[2]>=5)selStats.innerHTML+=`<br>Tack damage to blimps: ${t.damage+(t.bonusMoab||0)}`;
  if(t.paths[0]>=5)selStats.innerHTML+='<br>Flames: +4 blimp damage • Meteors: 700 impact damage • Burn: 50 damage/s';
 }
 if(t.type==='ice'&&t.cryo)selStats.innerHTML+=`<br>Blast radius 20 • Blimp damage ${t.damage+t.bonusMoab}${t.icicles?' • Icicles: 3 damage / 3 contacts / 2s':''}${t.canFreezeBlimps?' • Blimp freeze '+t.blimpFreeze+'s':''}`;
 if(t.type==='ice')selStats.innerHTML+=`<br>${d.towerClass} • Freeze ${t.freeze}s • ${t.freezeLayers||1} frozen layer${(t.freezeLayers||1)>1?'s':''}${t.auraSlow?' • Aura: 40% slower':''}${absoluteZeroBuffT>0?' • Absolute Zero: +50% attack speed':''}`;
 if(t.type==='bomb')selStats.innerHTML+=`<br>Blast radius ${Math.round(attack.splash/RANGE_SCALE*10)/10}${attack.stun?' • '+attack.stun+'s stun'+(attack.stunBlimps?' (bloons & blimps)':' (regular bloons)'):''}${attack.bombKnockback?' • 20-unit bloon knockback':''}${attack.bombMoabKnockback?' • 5-unit blimp knockback':''}`;
 if(t.type==='bomb'&&t.paths[1]>=2)selStats.innerHTML+=`<br>Missile speed ${attack.projSpeed}${attack.bonusMoab?' • Blimp damage '+(attack.damage+attack.bonusMoab):''}${attack.ceramicBonus?' • Ceramic damage '+(attack.damage+attack.ceramicBonus):''}`;
 if(t.type==='bomb'&&t.paths[2]>=3)selStats.innerHTML+=`<br>8 secondary bombs • 8 pierce each${t.paths[2]>=4?' • Recursive '+(t.paths[2]>=5?'every shot':'every second shot')+' (max 17 hits/target)':''}`;
 if(t.type==='dart'&&t.paths[0]>=3)selStats.innerHTML+=`<br>Projectile speed ${t.projSpeed||34} • Bounces off map edges, rocks and trunks${t.ceramicBonus?' • +'+t.ceramicBonus+' Ceramic':''}${t.leadBonus?' • +'+t.leadBonus+' Lead':''}${t.fortifiedBonus?' • +'+t.fortifiedBonus+' Fortified':''}${t.knockbackDuration?' • 0.15s knockback':''}${t.paths[0]>=5?' • Splits at 105 / 210 hits':''}`;
 if(t.fanTier)selStats.innerHTML+='<br>Fan Club attack boost active';
 if(t.type==='bomb'&&t.paths[2]>=5)selStats.innerHTML+='<br>Bomb Blitz: '+(t.blitzCd>0?'Cooldown '+Math.ceil(t.blitzCd)+'s':'Automatic on leak');
 upgradeBtns.forEach(b=>b.classList.remove('selectedUpgrade'));
 if(d.hero){
  const rapidState=abilityState(t,{key:'rapid'}),stormState=abilityState(t,{key:'storm'});
  upgradeBtns[0].disabled=t.level<3||rapidState.disabled;setUpgradeLabel(upgradeBtns[0],'Rapid Shot',t.level<3?'Unlocks at Lv.3':rapidState.text+' • temporary attack-speed boost');
  upgradeBtns[1].disabled=t.level<10||stormState.disabled;setUpgradeLabel(upgradeBtns[1],'Storm of Arrows',t.level<10?'Unlocks at Lv.10':stormState.text+' • rains arrows over the track');
  upgradeBtns[2].disabled=true;setUpgradeLabel(upgradeBtns[2],`Level ${t.level}`,t.camoDetect?'Camo detection active':'Camo detection unlocks at Lv.5');
  upgradeInfo.textContent='Quincy levels automatically. His level changes arrow count, pierce, range, attack speed, MOAB damage, and abilities.';buyUpgradeBtn.disabled=true;buyUpgradeBtn.textContent='Hero levels automatically'
 }
 else upgradeBtns.forEach((b,p)=>{const tier=t.paths[p];const next=upgradeData[t.type][p][tier];const otherHigh=t.paths.some((v,i)=>i!==p&&v>2);const used=t.paths.filter(v=>v>0).length;const lock=(tier>=2&&otherHigh)||(tier===0&&used>=2)||tier>=5||tierFiveTaken(t,p);b.disabled=lock||!next;b.classList.toggle('maxed',tier>=5);setUpgradeLabel(b,tier>=5?`Path ${p+1} MAX`:`${next[0]} — $${next[1]}`,tier>=5?'Tier 5 purchased':tierFiveTaken(t,p)?'Only one of this Tier 5 at a time':`Path ${p+1} • Tier ${tier+1} • Click for info`);if(selectedUpgradePath===p&&!b.disabled)b.classList.add('selectedUpgrade')});
 if(!d.hero){
  if(selectedUpgradePath===null){upgradeInfo.textContent='Click an available upgrade to read a short description before buying it.';buyUpgradeBtn.disabled=true;buyUpgradeBtn.textContent='Buy selected upgrade'}
  else {const p=selectedUpgradePath,tier=t.paths[p],next=upgradeData[t.type][p][tier];if(!next){upgradeInfo.textContent='This path is already maxed.';buyUpgradeBtn.disabled=true;buyUpgradeBtn.textContent='Path maxed'}else{upgradeInfo.innerHTML=`<b>${next[0]}</b><br>${upgradeDescriptions[t.type][p][tier]}`;buyUpgradeBtn.textContent=`Buy ${next[0]} — $${next[1]}`;buyUpgradeBtn.disabled=cash<next[1]||upgradeBtns[p].disabled}}
 }
 changeHandsBtn.classList.toggle('hidden',t.type!=='boomer');changeHandsBtn.textContent='Change Hands: '+(t.throwHand===-1?'Left':'Right');
 camoPriorityBtn.classList.toggle('hidden',!(t.type==='dart'&&t.paths[2]>=2));camoPriorityBtn.textContent='Prioritize Camo: '+(t.camoPriority?'On':'Off');camoPriorityBtn.setAttribute('aria-pressed',String(!!t.camoPriority));
 if(t.critEvery)selStats.innerHTML+=`<br>Critical: ${t.critDamage} damage every ${t.critEvery} shots`;
 targetBtn.textContent='Target: '+t.target[0].toUpperCase()+t.target.slice(1);sellBtn.textContent='Sell $'+Math.floor(t.invest*.7);refreshAbilityUI()
}
function syncDartStats(t){
 const [top,middle,bottom]=t.paths;
 const speedMult=middle>=2?.633/.95:middle>=1?.85:1;
 t.projectileLifeMult=bottom>=2?1.6:bottom>=1?1.35:1;
 t.projSpeed=34*(bottom>=2?7/6:1)*(bottom>=3?1.1:1)*(bottom>=4?1.15:1);
 t.camoDetect=bottom>=2;t.ceramicBonus=0;t.leadBonus=0;t.fortifiedBonus=0;t.knockbackDuration=0;t.knockbackMult=bottom>=2?7/6:1;
 t.critEvery=bottom>=5?5:bottom>=4?10:0;t.critDamage=bottom>=5?80:bottom>=4?50:0;
 t.damageType=bottom>=5?'Normal':'Sharp';t.range=[32,40,48,60,60,80][bottom]*RANGE_SCALE;
 if(top>=3){
  t.damage=top===5?5:2;t.pierce=top===5?210:top===4?60:18;
  t.rate=(top===3?1.15:1)*speedMult;t.range*=1.15;t.shots=1;
  t.damageType=top>=4?'Normal':'Shatter';
  t.projSpeed=(top===5?85:top===4?68:34)*(bottom>=2?7/6:1);
  if(top>=4){t.ceramicBonus=top===5?8:3;t.fortifiedBonus=top===5?5:2;t.leadBonus=top===5?20:0;t.knockbackDuration=.15;}
 }else{
  const base=bottom>=5?8:bottom>=3?4:2;
  const topBonus=top>=2?(bottom>=5?16:bottom>=3?8:3):top>=1?(bottom>=5?8:bottom>=3?3:1):0;
  t.pierce=base+topBonus;t.damage=bottom>=5?8:bottom>=4?6:bottom>=3?3:1;
  t.rate=bottom>=3?(bottom>=5?.2375:bottom>=4?.475:.95)*speedMult:middle>=4?.47475*.5:middle>=3?.47475:middle>=2?.633:middle>=1?.8075:.95;
  t.shots=middle>=3?3:1;
 }
}
function syncBombStats(t){
 const [top,middle,bottom]=t.paths;
 // Recompute from paths so buying a crosspath first gives the same final stats.
 t.damage=top>=5?24:top>=3?4:(bottom>=5?5:bottom>=4?2:1)+(top>=2?1:0);
 t.pierce=top>=3?80:22+(top>=1?6:0)+(top>=2?10:0);
 t.splash=(top>=3?27:top>=1?18:12)*RANGE_SCALE;
 t.range=(40+(top>=4?3:0)+(middle>=2?4:0)+(middle>=3?5:0)+(middle>=4?5:0)+(bottom>=1?12:0)+(bottom>=2?2:0))*RANGE_SCALE;
 t.rate=1.5*(middle>=1?.75:1)*(middle>=2?.7333:1)*(bottom>=5?.6:1);
 t.projSpeed=towerDefs.bomb.projSpeed*(middle>=2?1.5:1);
 t.bonusMoab=middle>=5?99:middle>=4?30:middle>=3?15:0;
 t.ceramicBonus=middle>=4?4:0;
 t.damageType=top>=5?'Normal':'Explosion';
 t.stun=top>=5?2:top>=4?1.4:0;t.stunBlimps=top>=5;
 t.bombKnockback=top>=3?20*RANGE_SCALE:0;t.bombMoabKnockback=top>=5?5*RANGE_SCALE:0;
 t.fragStats=bottom===2?{...bombFragmentTuning[top>=5?'crush':top>=4?'impact':top>=3?'big':'base'],moabBonus:bombFragmentTuning.middleMoabBonus[middle]}:null;
}
function syncTackStats(t){
 const [top,middle,bottom]=t.paths,base=towerDefs.tack,flame=top>=4;
 t.range=((top>=5?35:23)+(middle>=1?4:0)+(middle>=2?(bottom>=5?16:4):0)+(middle>=3?15:0)+(bottom>=5?7:0))*RANGE_SCALE;
 t.rate=top>=5?tackTopTuning.infernoCooldown:top>=4?.315:base.rate*Math.pow(.75,Math.min(top,2));
 if(bottom>=4)t.rate/=3;if(bottom>=5)t.rate*=.6;
 t.tacks=flame?0:bottom>=5?32:bottom>=3?16:bottom>=2?12:bottom>=1?10:8;
 t.pierce=flame?(top>=5?45:30)+(middle>=2?15:0):Math.max(base.pierce+(middle>=2?(bottom>=5?8:3):0)+(bottom>=3?1:0),middle>=3?8:0);
 t.meteorPierce=top>=5?1+(middle>=2?1:0):0;
 t.projSpeed=(middle>=3?32:36)*(middle>=1?tackMiddleTuning.longRangeProjectileSpeedMult:1);
 t.damage=flame?(top>=5?8:5)+Math.min(bottom,2)*(top>=5?tackTopTuning.bottomFlameDamagePerTier:1):top>=3?2:1;
 if(!flame){if(middle>=4)t.damage=Math.max(t.damage,2);if(middle>=5)t.damage=Math.max(t.damage,5);}
 t.bonusMoab=top>=5?4:bottom>=5?tackBottomTuning.zoneMoabDamage:0;
 t.damageType=flame?'Flame':middle>=5?'Normal':top>=3?'Heat':middle>=3?'Shatter':'Sharp';
 if(t.activeAbility?.kind==='maelstrom'&&t.abilityTimer>0){
  const ability=t.activeAbility,baseAbility=primaryAbilities.tack[ability.tier>=5?1:0];
  const duration=baseAbility.duration+Math.min(2,bottom)*(ability.tier>=5?1.5:.5);
  t.abilityTimer+=Math.max(0,duration-ability.duration);
  ability.duration=duration;ability.direction=ability.tier===4&&bottom>=1?-1:1;
 }
}
function syncIceStats(t){
 const [top,middle,bottom]=t.paths,base=towerDefs.ice;
 let range=bottom>=3?46:(middle>=5?40:middle>=4?30:25)+(bottom>=1?7:0);
 range+=top>=3?5:0;
 t.range=range*RANGE_SCALE;t.rate=(bottom>=4?iceBottomTuning.iciclesCooldown:bottom>=3?iceBottomTuning.cryoCooldown:base.rate)*(top>=5?.5:1)*(middle>=1?.75:1);
 t.damage=bottom>=4?2:base.damage;t.bonusMoab=bottom>=5?48:bottom>=4?8:0;
 t.pierce=middle>=5?300:middle>=2?45:40;
 t.freeze=(bottom>=3?1.2:base.freeze)+(middle>=2?.7:middle>=1?.25:0);
 t.refreeze=bottom>=2;t.cryo=bottom>=3;t.icicles=bottom>=4;t.canFreezeBlimps=bottom>=5;
 t.blimpFreeze=bottom>=5?iceBottomTuning.impaleFreeze:0;
 t.splash=bottom>=3?20*RANGE_SCALE:0;t.projSpeed=bottom>=3?iceBottomTuning.projectileSpeed:0;
 t.freezeLayers=middle>=5?8:middle>=2?2:1;t.postFreezeSlow=top>=1?.5:1;
 t.brittle=top>=5?4:top>=4?1:0;t.canHitBlimps=top>=4||bottom>=4;
 t.iceCeramicBonus=top>=5?iceTopTuning.superCeramicBonus:0;
 t.shardCount=top>=5?6:top>=3?3:0;t.shardDamage=top>=5?iceTopTuning.superShardDamage:iceTopTuning.shardDamage;
 t.shardPierce=top>=5?iceTopTuning.superShardPierce:iceTopTuning.shardPierce;
 t.stripIceProperties=top>=3;t.camoDetect=top>=2;t.damageType=t.camoDetect?'Cold Snap':'Cold';
 t.auraSlow=middle>=3?.6:0;
}
function syncGlueStats(t){
 const [top,middle,bottom]=t.paths,d=towerDefs.glue;
 t.glueLayers=top>=1?99:3;t.canGlueBlimps=top>=2||bottom>=3;t.moabGlue=bottom>=3;
 t.slow=bottom>=5?.05:bottom>=2?.25:d.slow;t.slowDuration=(bottom>=1?24:d.slowDuration)*(middle>=5?2:1);
 t.rate=d.rate*(top>=3?.5:1)*(top>=5?.5:1)/(middle>=3?3:1);
 t.pierce=1+(top>=3?1:0)+(middle>=1?1:0);if(middle>=2||top>=5)t.pierce=Math.max(5,t.pierce);if(bottom>=5)t.pierce+=6;
 t.shots=top>=5?2:1;t.glueSplash=top>=5?glueTopTuning.splatterRadius:0;
 t.corrosionInterval=top>=4?.1:top>=3?.5:top>=2?2:0;t.corrosionDamage=top>=2?1:0;
 t.corrosionCeramicDamage=top>=5?8:top>=4?3:top>=3?2:t.corrosionDamage;t.corrosionMoabDamage=top>=5?6:t.corrosionDamage;
 t.glueDps=t.corrosionInterval?t.corrosionDamage/t.corrosionInterval:0;t.gluePuddleTier=top>=4?top:0;
 const puddle=top>=5?glueTopTuning.solverPuddle:top>=4?glueTopTuning.liquefierPuddle:null;
 t.gluePuddleSettings=puddle?.radius&&puddle.life?{...puddle,pierce:puddle.pierceByMiddle?.[Math.min(2,middle)]??puddle.pierce,life:Math.round((puddle.life+((top>=5?bottom>=1:bottom>=2)?9.1:0))*10)/10,roundCarry:bottom>=1?1:0}:null;
 t.damage=bottom>=5?2:0;t.damageAmp=middle>=4?2:0;t.relentless=bottom>=4;t.superGlue=bottom>=5;
 t.gluePriority=gluePriority(t);t.notes=top>=2?'Timed corrosion; blimp coats last half duration; no native Camo detection':d.notes;
}
function applyUpgrade(t,p,tier){
 t.invest+=upgradeData[t.type][p][tier][1];
 const T=tier+1;
 if(t.type==='dart'){
  if(p===2&&T>=4)t.critShotCounter=0;
  syncDartStats(t);
 }
 if(t.type==='boomer'){
  if(p===0){if(T===1)t.pierce+=4;if(T===2)t.pierce+=5;if(T===3){t.pierce=15;t.bounceRange=80*RANGE_SCALE}if(T===4){t.pierce=60;t.rate/=3;t.ceramicBonus=1;t.bounceRange=160*RANGE_SCALE}if(T===5){t.damage+=7;t.ceramicBonus=8;t.bounceRange=Infinity;t.orbitTick=0}}
  if(p===1){if(T===1)t.rate*=.75;if(T===2){t.rate*=.75;t.projectileSpeedMult=1.5}if(T===3){t.rate=towerDefs.boomer.rate*.125;t.bonusMoab+=1}if(T===5){t.rate=towerDefs.boomer.rate*.125/5;t.damage=4+(t.paths[2]>=2?4:0);if(t.activeAbility?.kind==='turbo')t.activeAbility={...t.activeAbility,...primaryAbilities.boomer[1],tier:5}}}
  if(p===2){
   if(T===1)t.range+=14.19*RANGE_SCALE;
   if(T===2){t.damage+=t.paths[1]>=5?4:1;t.damageType='Heat'}
   if(T===4)t.pressCool=0;
   if(T===5){t.damage+=10;t.rate*=.5;t.pressCool=Math.min(t.pressCool,boomerSpecialTuning.cooldown*t.rate/towerDefs.boomer.rate)}
  }
  if(t.paths[2]>=3){
   const topPierce=t.paths[0]>=2?9:t.paths[0]>=1?4:0;
   t.pierce=18+topPierce+(t.paths[2]>=5?36+(t.paths[0]>=2?18:0):0);
  }
 }
 if(t.type==='bomb'){
  if(p===2&&T===4)t.bombShotCounter=0;
  syncBombStats(t);
 }
 if(t.type==='tack'){
  syncTackStats(t);if(p===0&&T===5)t.meteorCool=0;
 }
 if(t.type==='ice')syncIceStats(t);
 if(t.type==='glue'){
  syncGlueStats(t);
 }
 updateTowerAppearance(t);
}
upgradeBtns.forEach((b,p)=>b.addEventListener('click',()=>{const t=selectedTower;if(!t||b.disabled)return;if(towerDefs[t.type].hero){activateTowerAbility(t,p===0?'rapid':'storm');return;}selectedUpgradePath=p;refreshSelected()}));
buyUpgradeBtn.addEventListener('click',()=>{const t=selectedTower,p=selectedUpgradePath;if(!t||p===null||towerDefs[t.type].hero)return;const tier=t.paths[p],u=upgradeData[t.type][p][tier];if(tierFiveTaken(t,p)){toastMsg('Only one of this Tier 5 at a time');refreshSelected();return}if(!u||cash<u[1]||upgradeBtns[p].disabled)return;cash-=u[1];t.paths[p]++;applyUpgrade(t,p,tier);selectedUpgradePath=null;refreshSelected();updateUI()});
changeHandsBtn.addEventListener('click',()=>{if(selectedTower?.type!=='boomer')return;selectedTower.throwHand=selectedTower.throwHand===-1?1:-1;selectedTower.mesh.scale.x=selectedTower.throwHand;refreshSelected()});
camoPriorityBtn.addEventListener('click',()=>{if(selectedTower?.type==='dart'&&selectedTower.paths[2]>=2){selectedTower.camoPriority=!selectedTower.camoPriority;refreshSelected();}});
targetBtn.addEventListener('click',()=>{if(!selectedTower)return;const modes=['first','last','strong','close'];selectedTower.target=modes[(modes.indexOf(selectedTower.target)+1)%modes.length];refreshSelected()});
sellBtn.addEventListener('click',()=>{const t=selectedTower;if(!t)return;cash+=Math.floor(t.invest*.7);disposeTransientMesh(t.mesh);const i=towers.indexOf(t);if(i>=0)towers.splice(i,1);if(towerDefs[t.type].hero)heroPlaced=false;selectedTower=null;selectedUpgradePath=null;rangeRing.visible=false;selPanel.classList.add('hidden');updateUI()});closeSel.addEventListener('click',()=>{selectedTower=null;selectedUpgradePath=null;rangeRing.visible=false;selPanel.classList.add('hidden')});

function pointerGround(ev){const r=canvas.getBoundingClientRect();pointer.x=((ev.clientX-r.left)/r.width)*2-1;pointer.y=-((ev.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObject(ground);return hits[0]?.point||null}
canvas.addEventListener('pointerdown',ev=>{const p=pointerGround(ev);if(!p)return;if(selectedType){placeTower(p.x,p.z);return}let nearest=null,nd=2.1;for(const t of towers){const d=Math.hypot(t.x-p.x,t.z-p.z);if(d<nd){nd=d;nearest=t}}if(nearest)selectTower(nearest);else{selectedTower=null;rangeRing.visible=false;selPanel.classList.add('hidden')}});

const bloonRenderer=new BloonRenderer(scene,makeBloonTemplate);
function makeBloonMesh(layer,opts={}){return bloonRenderer.create(layer,opts);}
function makeBloonTemplate(layer,opts={}){return makeReferenceBloonTemplate(layer,opts);}
function finishBlimpMesh(g,type,opts={}){
 if(opts.camo||type==='DDT'){
  const replaced=new Set();g.traverse(part=>{
   if(part.geometry?.type!=='SphereGeometry')return;
   const old=part.material,base=old.color.clone();replaced.add(old);part.material=old.clone();part.material.color.setHex(0xffffff);part.material.vertexColors=true;
   part.geometry=paintBloonGeometry(part.geometry,base,{type,camo:true});part.name='painted-camo-blimp-hull';
  });
  const used=new Set();g.traverse(part=>{if(part.material)used.add(part.material);});for(const material of replaced)if(!used.has(material))material.dispose();
 }

 const length={MOAB:2.6,BFB:3.15,ZOMG:3.7,DDT:2.75,BAD:4.55}[type]||2.6;
 const height={MOAB:1.55,BFB:1.72,ZOMG:1.92,DDT:1.48,BAD:2.18}[type]||1.55;
 const rotor=new THREE.Group();rotor.position.set(0,height,-length-.2);
 const size=type==='BAD'?1.35:type==='ZOMG'?1.15:.8;
 rotor.add(box(.1,size,.1,0xc7d4d9),box(size,.1,.1,0xc7d4d9));g.add(rotor);g.userData.rotor=rotor;return g;
}
function makeBlimpMesh(type,opts={}){
 const s=blimpStats[type],g=new THREE.Group();
 const std=(c,r=.42,m=.1)=>new THREE.MeshStandardMaterial({flatShading:true,color:c,roughness:r,metalness:m});
 const addFin=(parent,mat,x,y,z,scale=[1,1,1],rx=Math.PI/2,rz=0)=>{const fin=new THREE.Mesh(new THREE.ConeGeometry(.52,1.08,4),mat);fin.position.set(x,y,z);fin.rotation.x=rx;fin.rotation.z=rz;fin.scale.set(...scale);fin.castShadow=true;parent.add(fin);return fin};
 const addFortArmor=(parent,width,length,y)=>{if(!opts.fort)return;const armor=std(0x96613d,.31,.48),edge=std(0xe0ded4,.28,.58);for(const z of [-length*.28,length*.28]){const plate=new THREE.Mesh(new THREE.BoxGeometry(width,.29,.55),armor);plate.name='fortified-bronze-blimp-armor';plate.position.set(0,y,z);plate.castShadow=true;parent.add(plate);for(const side of [-1,1]){const rim=new THREE.Mesh(new THREE.BoxGeometry(width+.035,.31,.055),edge);rim.position.set(0,y,z+side*.255);parent.add(rim)}}};

 if(type==='MOAB'){
  const blueMat=std(0x397fbe,.38,.12),blueDark=std(0x235f98,.45,.08),darkMat=std(0x20252b,.48,.16),panelMat=std(0xc9ced1,.42,.42),panelDark=std(0x737a80,.45,.28);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),blueMat);body.scale.set(1.2,1.08,2.55);body.position.y=1.55;body.castShadow=true;g.add(body);
  const belly=new THREE.Mesh(new THREE.SphereGeometry(1.01,12,8,0,Math.PI*2,Math.PI*.5,Math.PI*.5),blueDark);belly.scale.set(1.17,1.03,2.48);belly.position.set(0,1.47,0);belly.rotation.z=Math.PI;g.add(belly);
  const harness=new THREE.Mesh(new THREE.TorusGeometry(1.205,.13,5,12),darkMat);harness.rotation.x=0;harness.position.y=1.55;harness.scale.z=.92;g.add(harness);
  for(const z of [-.62,-.20,.22,.64]){const plate=new THREE.Mesh(new THREE.BoxGeometry(1.34,.20,.34),panelMat);plate.position.set(0,2.46,z);plate.castShadow=true;g.add(plate)}
  const centerPlate=new THREE.Mesh(new THREE.BoxGeometry(1.52,.24,.40),panelDark);centerPlate.position.set(0,2.48,.02);g.add(centerPlate);
  for(const x of [-1.08,1.08]){const strip=new THREE.Mesh(new THREE.BoxGeometry(.18,.55,1.34),panelMat);strip.position.set(x,1.78,.04);strip.rotation.z=x<0?-.16:.16;g.add(strip)}
  for(const [x,y,rz] of [[0,2.38,0],[0,.76,Math.PI],[.92,1.55,-Math.PI/2],[-.92,1.55,Math.PI/2]]) addFin(g,blueDark,x,y,-2.25,[.78,1,.46],Math.PI/2,rz);
  const rearCap=new THREE.Mesh(new THREE.CylinderGeometry(.62,.82,.34,16),darkMat);rearCap.rotation.x=Math.PI/2;rearCap.position.set(0,1.55,-2.48);g.add(rearCap);
  addFortArmor(g,1.65,3.7,2.38);
  g.userData.blimpVisualScale=1;
  return finishBlimpMesh(g,type,opts);
 }

 if(type==='BFB'){
  // Bigger, heavy red blimp with white crescent markings and side engine pods.
  const red=std(0xc91919,.34,.12),redDark=std(0x861010,.43,.08),white=std(0xf4f4f1,.35,.24),dark=std(0x2a2527,.5,.12);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),red);body.scale.set(1.48,1.30,3.15);body.position.y=1.72;body.castShadow=true;g.add(body);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),redDark);nose.scale.set(1.18,1.03,.92);nose.position.set(0,1.68,2.72);g.add(nose);
  // white crescent-like stripes made from offset torus arcs across the upper hull
  for(const z of [.35,.95]){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,.10,5,12,Math.PI*1.15),white);ring.rotation.set(Math.PI/2,0,.38);ring.position.set(0,2.25,z);ring.scale.set(1,1.18,1);g.add(ring)}
  // twin side pods near the rear
  for(const x of [-1.38,1.38]){const pod=new THREE.Group();const cyl=new THREE.Mesh(new THREE.CylinderGeometry(.48,.56,1.38,18),red);cyl.rotation.x=Math.PI/2;pod.add(cyl);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.22,18),white);cap.rotation.x=Math.PI/2;cap.position.z=.78;pod.add(cap);pod.position.set(x,1.78,-1.72);pod.rotation.z=x<0?.15:-.15;g.add(pod)}
  addFin(g,redDark,0,2.75,-2.35,[1.05,1.25,.55],Math.PI/2,0);addFin(g,redDark,0,.74,-2.30,[1.02,1.2,.55],Math.PI/2,Math.PI);
  addFin(g,redDark,1.22,1.68,-2.18,[.9,1.15,.48],Math.PI/2,-Math.PI/2);addFin(g,redDark,-1.22,1.68,-2.18,[.9,1.15,.48],Math.PI/2,Math.PI/2);
  addFortArmor(g,2.05,4.7,2.73);
  g.userData.blimpVisualScale=1.28;
  return finishBlimpMesh(g,type,opts);
 }

 if(type==='ZOMG'){
  // Massive green armored blimp with dark plates and orange mechanical accents.
  const green=std(0x476c27,.38,.16),greenDark=std(0x243b19,.46,.12),black=std(0x242427,.38,.36),orange=std(0xd57924,.35,.28),steel=std(0x6e7478,.34,.5);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),green);body.scale.set(1.78,1.55,3.70);body.position.y=1.92;body.castShadow=true;g.add(body);
  // segmented black armor bands
  for(const z of [-1.3,-.45,.45,1.3]){const band=new THREE.Mesh(new THREE.TorusGeometry(1.62,.12,5,12),black);band.rotation.x=0;band.position.set(0,1.93,z);band.scale.set(1,1,.95);g.add(band)}
  // top armored spine
  for(const z of [-1.25,-.55,.15,.85]){const plate=new THREE.Mesh(new THREE.BoxGeometry(1.55,.25,.52),greenDark);plate.position.set(0,3.28,z);plate.castShadow=true;g.add(plate)}
  // orange mechanical side blocks
  for(const x of [-1.58,1.58])for(const z of [-.95,.05,.95]){const block=new THREE.Mesh(new THREE.BoxGeometry(.30,.62,.54),orange);block.position.set(x,2.02,z);block.rotation.z=x<0?-.13:.13;g.add(block)}
  const rear=new THREE.Mesh(new THREE.CylinderGeometry(.90,1.10,.42,18),steel);rear.rotation.x=Math.PI/2;rear.position.set(0,1.92,-3.58);g.add(rear);
  addFin(g,greenDark,0,3.05,-3.08,[1.18,1.4,.62],Math.PI/2,0);addFin(g,greenDark,0,.82,-3.08,[1.18,1.4,.62],Math.PI/2,Math.PI);addFin(g,greenDark,1.48,1.92,-3.0,[1.05,1.35,.56],Math.PI/2,-Math.PI/2);addFin(g,greenDark,-1.48,1.92,-3.0,[1.05,1.35,.56],Math.PI/2,Math.PI/2);
  addFortArmor(g,2.45,5.6,3.35);
  g.userData.blimpVisualScale=1.62;
  return finishBlimpMesh(g,type,opts);
 }

 if(type==='DDT'){
  // Slim, black stealth blimp: roughly MOAB sized but much narrower and faster-looking.
  const black=std(0x24272d,.28,.40),black2=std(0x0d0f12,.38,.28),gray=std(0x7a8086,.34,.45),red=std(0x9e2424,.35,.22);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),black);body.scale.set(1.00,.92,2.62);body.position.y=1.48;body.castShadow=true;g.add(body);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.58,1.10,18),black2);nose.rotation.x=Math.PI/2;nose.position.set(0,1.48,2.73);g.add(nose);
  // stealth gray bands and red pinstripe
  for(const z of [-.85,.15,.95]){const band=new THREE.Mesh(new THREE.TorusGeometry(.99,.075,5,12),gray);band.rotation.x=0;band.position.set(0,1.48,z);g.add(band)}
  const redBand=new THREE.Mesh(new THREE.TorusGeometry(1.02,.045,5,12),red);redBand.rotation.x=0;redBand.position.set(0,1.48,.52);g.add(redBand);
  for(const [x,y,rz] of [[0,2.30,0],[0,.66,Math.PI],[.82,1.48,-Math.PI/2],[-.82,1.48,Math.PI/2]]) addFin(g,black2,x,y,-2.25,[.62,.95,.38],Math.PI/2,rz);
  // DDT is always camo; subtle green scanner strip.
  const cam=new THREE.Mesh(new THREE.TorusGeometry(1.04,.05,5,12),new THREE.MeshBasicMaterial({color:0x587d55}));cam.rotation.x=0;cam.position.set(0,1.48,-.32);g.add(cam);
  addFortArmor(g,1.42,3.8,2.31);
  g.userData.blimpVisualScale=.98;
  return finishBlimpMesh(g,type,opts);
 }

 if(type==='BAD'){
  // Huge purple boss blimp, clearly larger than the ZOMG, with reinforced plates and engines.
  const purple=std(0x8f3ca8,.32,.18),purpleDark=std(0x4a235d,.42,.14),black=std(0x232229,.36,.35),orange=std(0xe38b31,.34,.25),steel=std(0x92969d,.33,.52);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),purple);body.scale.set(2.18,1.88,4.55);body.position.y=2.18;body.castShadow=true;g.add(body);
  // Heavy black/purple ribbing
  for(const z of [-1.65,-.75,.15,1.05,1.85]){const band=new THREE.Mesh(new THREE.TorusGeometry(1.98,.15,5,12),black);band.rotation.x=0;band.position.set(0,2.18,z);g.add(band)}
  // armored dorsal plates
  for(const z of [-1.35,-.55,.25,1.05]){const plate=new THREE.Mesh(new THREE.BoxGeometry(1.95,.32,.60),purpleDark);plate.position.set(0,3.82,z);plate.castShadow=true;g.add(plate)}
  // side engine/armor modules with orange accents
  for(const x of [-1.98,1.98])for(const z of [-1.25,0,1.25]){const block=new THREE.Mesh(new THREE.BoxGeometry(.42,.74,.70),steel);block.position.set(x,2.18,z);block.rotation.z=x<0?-.12:.12;g.add(block);const stripe=new THREE.Mesh(new THREE.BoxGeometry(.44,.16,.74),orange);stripe.position.set(x,2.18,z+.02);stripe.rotation.z=x<0?-.12:.12;g.add(stripe)}
  const rear=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.40,.56,20),black);rear.rotation.x=Math.PI/2;rear.position.set(0,2.18,-4.35);g.add(rear);
  addFin(g,purpleDark,0,3.58,-3.70,[1.42,1.68,.72],Math.PI/2,0);addFin(g,purpleDark,0,.82,-3.70,[1.42,1.68,.72],Math.PI/2,Math.PI);addFin(g,purpleDark,1.82,2.18,-3.60,[1.25,1.6,.68],Math.PI/2,-Math.PI/2);addFin(g,purpleDark,-1.82,2.18,-3.60,[1.25,1.6,.68],Math.PI/2,Math.PI/2);
  addFortArmor(g,3.0,6.7,3.92);
  g.userData.blimpVisualScale=2.05;
  return finishBlimpMesh(g,type,opts);
 }

 // Fallback, should only be reached for future blimp classes.
 const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),std(s.color,.48,.08));body.scale.set(...s.scale);body.position.y=1.55;body.castShadow=true;g.add(body);
 return finishBlimpMesh(g,type,opts);
}
function normalizeSpawnName(raw){
 let name=String(raw).replace(/\s+/g,' ').trim(),camo=/\bCamo\b/i.test(name),regrow=/\bRegrow\b/i.test(name),fort=/\bFortified\b/i.test(name),superCeramic=/Super Ceramic/i.test(name);
 name=name.replace(/\b(Camo|Regrow|Fortified|Super)\b/gi,'').replace(/Wood\//gi,'').trim();
 name=name.replace(/\s*\(.*$/,'').replace(/\b(MOAB|BFB|ZOMG|DDT|BAD)s\b/gi,'$1').trim();
 if(name==='Multi-Colored')name='Rainbow';
 if(name.includes('Ceramic'))name='Ceramic';
 name=[...layerNames,...Object.keys(blimpStats)].find(n=>n.toLowerCase()===name.toLowerCase());
 if(!name)throw new Error('Unknown bloon type: '+raw);
 return {type:name,camo,regrow,fort,superCeramic};
}
function blimpHealthMultiplier(r){
 if(r<=80)return 1;
 if(r<=100)return 1+(r-80)*.02;
 if(r<=124)return 1.4+(r-100)*.05;
 if(r<=150)return 2.6+(r-124)*.15;
 if(r<=250)return 6.5+(r-150)*.35;
 if(r<=300)return 41.5+(r-250);
 if(r<=400)return 91.5+(r-300)*1.5;
 if(r<=500)return 241.5+(r-400)*2.5;
 return 491.5+(r-500)*5;
}
function enemyBaseHp(type,opts={}){
 const spawnRound=opts.spawnRound??round;
 if(blimpStats[type])return Math.round(blimpStats[type].hp*blimpHealthMultiplier(spawnRound));
 if(type==='Ceramic')return opts.superCeramic||spawnRound>=81?60:10;
 return 1;
}
function placeEnemyOnTrack(e){
 const a=PATH[e.seg]||PATH[0],b=PATH[e.seg+1]||a,l=a.distanceTo(b)||1,t=Math.max(0,Math.min(1,e.dist/l));
 const x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t);
 const dx=(b.x-a.x)/l,dz=(b.z-a.z)/l;
 e.mesh.position.set(x-dz*(e.laneOffset||0),.65,z+dx*(e.laneOffset||0));
}
function spawnEnemy(spec,trackState=null){
 const o=typeof spec==='string'?normalizeSpawnName(spec):{...spec};
 if(!blimpStats[o.type]&&!Object.hasOwn(layerIndex,o.type))throw new Error('Unknown bloon type: '+o.type);
 if(o.type==='DDT')o.camo=true;
 o.spawnRound=o.spawnRound??round;
 if(o.type==='Ceramic'&&o.spawnRound>=81)o.superCeramic=true;
 const isBlimp=!!blimpStats[o.type];
 const layer=isBlimp?null:(layerIndex[o.type]??0);
 const mesh=isBlimp?makeBlimpMesh(o.type,o):makeBloonMesh(layer,o);scene.add(mesh);
 const hp=enemyBaseHp(o.type,o)*(o.fort?2:1);
 const e={type:o.type,layer,fort:!!o.fort,camo:!!o.camo,regrow:!!o.regrow,superCeramic:!!o.superCeramic,spawnRound:o.spawnRound,isBlimp,mesh,seg:trackState?.seg??0,dist:trackState?.dist??0,laneOffset:trackState?.laneOffset??0,alive:true,knockbackT:0,knockbackSpeed:0,slowT:0,slowMult:1,freezeT:0,abilityFreezeT:0,abilitySlowT:0,abilitySlowMult:1,glueT:0,glueSlow:1,glueDamageAmp:0,glueAmpT:0,glueDps:0,glueCarry:0,glueLayers:0,glueLevel:0,hp,maxHp:hp,maxLayer:layer,regrowTimer:0,regrowStack:[...(o.regrowStack||[])]};
 enemies.push(e);placeEnemyOnTrack(e);return e;
}
function childProps(parent,type,regrowStack){
 return {type,camo:parent.camo,regrow:parent.regrow,fort:parent.fort,superCeramic:!!parent.superCeramic,spawnRound:parent.spawnRound??round,regrowStack};
}
function spawnChildSet(parent,types){
 const made=[];
 const total=types.length;
 types.forEach((type,i)=>{
  const stack=parent.regrow?[parent.type,...(parent.regrowStack||[])]:[];
  const lane=(i-(total-1)/2)*.22;
  const child=spawnEnemy(childProps(parent,type,stack),{seg:parent.seg,dist:parent.dist,laneOffset:(parent.laneOffset||0)+lane});
  if(!parent.isBlimp&&!child.isBlimp&&parent.abilityFreezeLayers>1){child.abilityFreezeT=parent.abilityFreezeT;child.abilityFreezeLayers=parent.abilityFreezeLayers-1;}
  child.abilitySlowT=parent.abilitySlowT;child.abilitySlowMult=parent.abilitySlowMult;
  if(child.abilityFreezeT>0||child.abilitySlowT>0)ensureFreezeMarker(child);
  if(parent.glueCoatings&&!parent.isBlimp){
   child.glueCoatings=parent.glueCoatings.filter(coat=>coat.remaining>0&&coat.layers>1).map(coat=>({...coat,layers:coat.layers-1,direct:false}));
   syncGlueCoatings(child);if(child.glueT>0){child.glueDamageAmp=parent.glueDamageAmp;child.glueAmpT=parent.glueAmpT;child.glued=true;ensureGlueMarker(child);}
  }else if(!parent.isBlimp&&parent.glueT>0&&parent.glueLayers>1){
   child.glueT=parent.glueT;child.glueSlow=parent.glueSlow;child.glueDamageAmp=parent.glueDamageAmp;child.glueAmpT=parent.glueAmpT;child.glueDps=parent.glueDps;child.glueSource=parent.glueSource;child.glueLayers=parent.glueLayers-1;child.glueLevel=parent.glueLevel||1;child.gluePriority=parent.gluePriority||1;
   child.glued=true;ensureGlueMarker(child);
  }
  if(parent.permafrostLayers>1){child.permafrostLayers=parent.permafrostLayers-1;child.permafrostSlow=parent.permafrostSlow;}
  if(parent.freezeT>0&&parent.freezeLayers>1){child.freezeT=parent.freezeT;child.freezeLayers=parent.freezeLayers-1;child.iceShards=parent.iceShards;ensureFreezeMarker(child);}
  if(parent.brittleT>0){child.brittleT=parent.brittleT;child.brittleDamage=parent.brittleDamage;}
  if(parent.burns?.length)child.burns=parent.burns.map(burn=>({...burn}));
  made.push(child);
 });
 return made;
}
const regularChildren={
 Blue:['Red'],Green:['Blue'],Yellow:['Green'],Pink:['Yellow'],
 Black:['Pink','Pink'],White:['Pink','Pink'],Purple:['Pink','Pink'],Lead:['Black','Black'],
 Zebra:['Black','White'],Rainbow:['Zebra','Zebra'],Ceramic:['Rainbow','Rainbow']
};
const blimpChildren={MOAB:['Ceramic','Ceramic','Ceramic','Ceramic'],BFB:['MOAB','MOAB','MOAB','MOAB'],ZOMG:['BFB','BFB','BFB','BFB'],DDT:['Ceramic','Ceramic','Ceramic','Ceramic'],BAD:['ZOMG','ZOMG','ZOMG','ZOMG']};
function destroyEnemyAndSpawnChildren(e){
 if(!e.alive)return[];
 if(e.freezeT>0&&e.iceShards)releaseIceShards(e);
 const acid=e.glueCoatings?.find(coat=>coat.direct&&coat.puddleTier>=4);if(acid)spawnAcidPuddle(e,acid);
 spawnPopVisual(e);e.alive=false;disposeTransientMesh(e.mesh);
 const normalKids=regularChildren[e.type];
 const kids=e.isBlimp?blimpChildren[e.type]:e.superCeramic?normalKids?.slice(0,1):normalKids;
 return kids?spawnChildSet(e,kids):[];
}
// Distance along the whole track stays monotonic across corners.
const trackDistances=[0];for(let i=1;i<PATH.length;i++)trackDistances[i]=trackDistances[i-1]+PATH[i-1].distanceTo(PATH[i]);
function progress(e){return trackDistances[e.seg]+e.dist}
function enemySpeed(e){
 const key=e.isBlimp?e.type:layerNames[Math.min(e.layer,layerNames.length-1)],base=(bloonSpeeds[key]||75)/9.5;
 if(e.type==='BAD')return base;
 if(e.abilityFreezeT>0||e.freezeT>0)return 0;
 const slow=Math.min(e.auraSlowMult||1,e.permafrostLayers>0?(e.permafrostSlow||1):1,e.slowT>0?e.slowMult:1,e.glueT>0?e.glueSlow:1,e.abilitySlowT>0?e.abilitySlowMult:1);
 return base*slow;
}
function leakDamage(e){if(e.isBlimp)return Math.max(1,Math.ceil(e.hp));return Math.max(1,(e.layer??0)+1)}
function setEnemyType(e,newType){
 const old=e.mesh;disposeTransientMesh(old);e.glueMarker=null;e.freezeMarker=null;e.icicleMarker=null;
 e.type=newType;e.layer=layerIndex[newType]??0;e.isBlimp=!!blimpStats[newType];
 e.hp=enemyBaseHp(newType,e)*(e.fort?2:1);e.maxHp=e.hp;e.maxLayer=e.layer;
 e.mesh=e.isBlimp?makeBlimpMesh(newType,e):makeBloonMesh(e.layer,e);scene.add(e.mesh);placeEnemyOnTrack(e);
 if(e.glueT>0)ensureGlueMarker(e);
 if(e.abilityFreezeT>0||e.abilitySlowT>0||e.freezeT>0)ensureFreezeMarker(e);
 if(e.icicles){const state=e.icicles;addIcicles(e,state.attack);e.icicles=state;}
}
function updateRegrow(e,dt){
 if(!e.regrow||e.isBlimp||!e.alive)return;
 e.regrowTimer+=dt;
 while(e.regrowTimer>=3){
  if(e.type==='Ceramic'&&e.hp<e.maxHp){
   // A ceramic shell is one layer, even when it has sixty hit points.
   e.hp=e.maxHp;e.regrowTimer-=3;
  }else if(e.regrowStack?.length){
   const next=e.regrowStack.shift();setEnemyType(e,next);e.regrowTimer-=3;
  }else{e.regrowTimer=0;break;}
 }
}
function damageIcicleFamily(state,e,damage,initial=true){
 if(!e.alive)return;state.hitEnemies.add(e);
 const result=hitEnemy(e,damage,{tower:state.attack,ignoreGlueAmp:!initial});
 for(const child of result?.children||[]){state.hitEnemies.add(child);if(result.remainingDamage>0)damageIcicleFamily(state,child,result.remainingDamage,false);}
}
function updateIcicleContacts(dt){
 const hosts=enemies.filter(e=>e.alive&&e.icicles);if(!hosts.length||dt<=0)return;
 // Index swept bounds so even fast bloons crossing an icicle can be found.
 const grid=new Map(),size=2,radius=iceBottomTuning.contactRadius;
 for(const e of enemies){
  if(!e.alive||e.freezeT>0||e.abilityFreezeT>0)continue;
  const p=e.mesh.position,px=e.previousX??p.x,pz=e.previousZ??p.z;
  for(let x=Math.floor(Math.min(px,p.x)/size);x<=Math.floor(Math.max(px,p.x)/size);x++)for(let z=Math.floor(Math.min(pz,p.z)/size);z<=Math.floor(Math.max(pz,p.z)/size);z++){
   const key=x+':'+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);
  }
 }
 for(const host of hosts){
  if(!host.alive)continue;const state=host.icicles,activeDt=Math.min(dt,state.remaining);state.remaining=Math.max(0,state.remaining-dt);
  const fraction=activeDt/dt,p=host.mesh.position,px=host.previousX??p.x,pz=host.previousZ??p.z;
  const hx=px+(p.x-px)*fraction,hz=pz+(p.z-pz)*fraction,visited=new Set();
  for(let x=Math.floor((Math.min(px,hx)-radius)/size);x<=Math.floor((Math.max(px,hx)+radius)/size)&&state.pierceLeft>0;x++)for(let z=Math.floor((Math.min(pz,hz)-radius)/size);z<=Math.floor((Math.max(pz,hz)+radius)/size)&&state.pierceLeft>0;z++){
   for(const e of grid.get(x+':'+z)||[]){
    if(state.pierceLeft<=0)break;
    if(visited.has(e))continue;visited.add(e);
    if(e===host||!e.alive||e.freezeT>0||e.abilityFreezeT>0||state.hitEnemies.has(e)||!towerCanDamage(state.attack,e))continue;
    const ep=e.mesh.position,ex=e.previousX??ep.x,ez=e.previousZ??ep.z;
    if(pointSegDist(0,0,{x:ex-px,z:ez-pz},{x:ex+(ep.x-ex)*fraction-hx,z:ez+(ep.z-ez)*fraction-hz})>radius)continue;
    state.pierceLeft--;damageIcicleFamily(state,e,3);
   }
  }
  if(state.remaining<=0||state.pierceLeft<=0){host.icicles=null;clearIcicles(host);}
 }
}
// Keep independent coatings; the latest active coating determines movement slow.
function glueCorrosionDamage(coat,e){return e.isBlimp?(coat.moabDamage??coat.damage):e.type==='Ceramic'?(coat.ceramicDamage??coat.damage):coat.damage;}
function syncGlueCoatings(e){
 const coats=e.glueCoatings||[],last=coats.at(-1);
 e.glueT=0;e.gluePriority=0;e.glueLayers=0;e.glueDps=0;e.glueSlow=e.type==='BAD'?1:(last?.slow??1);
 for(const coat of coats){
  e.glueT=Math.max(e.glueT,coat.remaining);e.gluePriority=Math.max(e.gluePriority,coat.priority);e.glueLayers=Math.max(e.glueLayers,coat.layers);
  const dps=coat.interval?glueCorrosionDamage(coat,e)/coat.interval:0;
  if(dps>=e.glueDps){e.glueDps=dps;e.glueSource=coat.source;}
 }
 e.glueLevel=last?1:0;
}
function applyGlueCoating(e,fx){
 const t=fx.tower,priority=t?.type==='glue'?gluePriority(t):1;
 const key=t?.type==='glue'?`${t.paths?.[0]||0}:${t.paths?.[2]||0}:${fx.damageAmp?'ability':'shot'}`:'external';
 e.glueCoatings=(e.glueCoatings||[]).filter(coat=>coat.key!==key&&coat.remaining>0);
 const corrosion=(fx.glueDps||0)>0,interval=corrosion?(t?.corrosionInterval||1/fx.glueDps):0;
 const duration=(fx.slowDuration||2.8)*(e.isBlimp&&!fx.damageAmp&&t?.paths?.[0]>=2?.5:1);
 const slow=e.isBlimp&&!t?.moabGlue&&!fx.damageAmp?1:(fx.slow??1);
 e.glueCoatings.push({key,priority,remaining:duration,slow,layers:fx.glueLayers||3,interval,tick:0,damage:corrosion?(t?.corrosionDamage||1):0,
  ceramicDamage:t?.corrosionCeramicDamage,moabDamage:t?.corrosionMoabDamage,source:sourceTowerForDamage(t),
  direct:!!fx.directGlue,puddleTier:t?.gluePuddleTier||0,puddleSettings:t?.gluePuddleSettings?{...t.gluePuddleSettings}:null,camoDetect:!!t?.camoDetect});
 syncGlueCoatings(e);
}
function damageGlueFamily(coat,e,damage){
 if(!e.alive)return;
 const result=hitEnemy(e,damage,{tower:coat.source,ignoreGlueAmp:true});
 for(const child of result?.children||[])if(result.remainingDamage>0)damageGlueFamily(coat,child,Math.min(result.remainingDamage,coat.damage));
}
function updateGlueCoatings(e,dt){
 let left=dt;
 while(left>1e-9&&e.glueCoatings.length&&e.alive){
  let best=null,bestDps=0;
  for(const coat of e.glueCoatings){const dps=coat.interval?glueCorrosionDamage(coat,e)/coat.interval:0;if(dps>bestDps){bestDps=dps;best=coat;}}
  const step=Math.min(left,...e.glueCoatings.map(coat=>coat.remaining),best?Math.max(0,best.interval-best.tick):Infinity);
  for(const coat of e.glueCoatings){coat.remaining=Math.max(0,coat.remaining-step);if(coat.interval){coat.tick+=step;if(coat!==best&&coat.tick>=coat.interval)coat.tick%=coat.interval;}}
  left-=step;
  if(best&&best.tick+1e-9>=best.interval){best.tick=Math.max(0,best.tick-best.interval);damageGlueFamily(best,e,glueCorrosionDamage(best,e));}
  e.glueCoatings=e.glueCoatings.filter(coat=>coat.remaining>1e-9);syncGlueCoatings(e);
 }
}
function hitGlueTarget(t,e){
 return hitEnemy(e,t.damage,{tower:t,glue:true,directGlue:true,slow:t.slow,slowDuration:t.slowDuration,glueLayers:t.glueLayers,glueDps:t.glueDps,allowBlimpSlow:!!(t.canGlueBlimps||t.moabGlue)});
}
function explodeGlueSplatter(p,position){
 const targets=enemies.filter(e=>e.alive&&towerCanDamage(p.tower,e)&&(e.mesh.position.x-position.x)**2+(e.mesh.position.z-position.z)**2<=p.glueSplash*p.glueSplash);
 for(const e of targets.slice(0,p.splashPierce))hitGlueTarget(p.tower,e);
 spawnImpactVisual({...p,splash:p.glueSplash},position);
}
function spawnAcidPuddle(e,coat){
 const stats=coat.puddleSettings;if(!stats)return;
 const mesh=acidPuddleRenderer.create(0);mesh.position.set(e.mesh.position.x,.73,e.mesh.position.z);mesh.scale.setScalar(stats.radius);scene.add(mesh);
 acidPuddles.push({mesh,x:e.mesh.position.x,z:e.mesh.position.z,radius:stats.radius,life:stats.life,totalLife:stats.life,pierceLeft:stats.pierce,damage:stats.damage,roundCarry:stats.roundCarry,
  attack:{type:'acidPuddle',damageType:'Acid',camoDetect:coat.camoDetect,sourceTower:coat.source},hitEnemies:new Set()});
}
function damageAcidPuddleFamily(p,e,damage){
 if(!e.alive)return;p.hitEnemies.add(e);
 const result=hitEnemy(e,damage,{tower:p.attack,ignoreGlueAmp:true});
 for(const child of result?.children||[]){p.hitEnemies.add(child);if(result.remainingDamage>0)damageAcidPuddleFamily(p,child,result.remainingDamage);}
}
function updateAcidPuddles(dt){
 if(!roundActive||dt<=0||!acidPuddles.length)return;
 const cellSize=4,grid=new Map();
 for(const e of enemies)if(e.alive){const key=`${Math.floor(e.mesh.position.x/cellSize)},${Math.floor(e.mesh.position.z/cellSize)}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e);}
 for(const p of acidPuddles){
  if(p.life<=0||p.pierceLeft<=0)continue;
  const x0=Math.floor((p.x-p.radius)/cellSize),x1=Math.floor((p.x+p.radius)/cellSize),z0=Math.floor((p.z-p.radius)/cellSize),z1=Math.floor((p.z+p.radius)/cellSize);
  for(let x=x0;x<=x1&&p.pierceLeft>0;x++)for(let z=z0;z<=z1&&p.pierceLeft>0;z++)for(const e of grid.get(`${x},${z}`)||[]){
   if(p.pierceLeft<=0)break;
   if(!e.alive||p.hitEnemies.has(e)||!towerCanDamage(p.attack,e)||(e.mesh.position.x-p.x)**2+(e.mesh.position.z-p.z)**2>p.radius*p.radius)continue;
   p.pierceLeft--;damageAcidPuddleFamily(p,e,p.damage);
  }
  p.life=Math.max(0,p.life-dt);
  p.mesh.scale.setScalar(p.radius*(.85+.15*Math.min(1,p.life/.5)));
 }
 let write=0;for(const p of acidPuddles){if(p.life<=0||p.pierceLeft<=0)disposeTransientMesh(p.mesh);else acidPuddles[write++]=p;}acidPuddles.length=write;
}
function endRoundAcidPuddles(){
 let write=0;for(const p of acidPuddles){if(p.roundCarry>0){p.roundCarry--;acidPuddles[write++]=p;}else disposeTransientMesh(p.mesh);}acidPuddles.length=write;
}
function moveEnemies(dt){
 for(const e of enemies){
  if(!e.alive)continue;
  e.previousX=e.mesh.position.x;e.previousZ=e.mesh.position.z;
  const frozenDt=Math.min(dt,Math.max(e.freezeT||0,e.abilityFreezeT||0));
  tickDominationBurns(e,dt);
  if(!e.alive)continue;
  if(e.shredT>0){
   const activeDt=Math.min(dt,e.shredT);e.shredT=Math.max(0,e.shredT-dt);e.shredTick=(e.shredTick||0)+activeDt;
   while(e.shredTick>=1&&e.alive){e.shredTick-=1;hitEnemy(e,100,{tower:e.shredSource,ignoreGlueAmp:true})}
   if(!e.alive)continue;
  }
  e.glueAmpT=Math.max(0,e.glueAmpT-dt);if(e.glueAmpT<=0)e.glueDamageAmp=0;
  if(e.glueCoatings){updateGlueCoatings(e,dt);if(!e.alive)continue;}
  else{
   const gluedDt=Math.min(dt,e.glueT);e.glueT=Math.max(0,e.glueT-dt);
   if(gluedDt>0&&e.glueDps>0){
    e.glueCarry+=gluedDt*e.glueDps;const damage=Math.floor(e.glueCarry);e.glueCarry-=damage;
    if(damage>0)hitEnemy(e,damage,{ignoreGlueAmp:true,tower:e.glueSource});
    if(!e.alive)continue;
   }
  }
  if(e.glueT<=0&&e.glued){e.glued=false;e.gluePriority=0;e.glueLevel=0;e.glueLayers=0;e.glueSlow=1;e.glueDamageAmp=0;e.glueAmpT=0;e.glueDps=0;e.glueCarry=0;clearGlueMarker(e)}
  e.abilityFreezeT=Math.max(0,e.abilityFreezeT-dt);e.abilitySlowT=Math.max(0,e.abilitySlowT-dt);
  if(e.abilitySlowT<=0)e.abilitySlowMult=1;
  e.brittleT=Math.max(0,(e.brittleT||0)-dt);if(e.brittleT<=0)e.brittleDamage=0;
  e.slowT=Math.max(0,e.slowT-dt);e.freezeT=Math.max(0,e.freezeT-dt);updateRegrow(e,dt);
  if(e.abilityFreezeT<=0&&e.abilitySlowT<=0&&e.freezeT<=0&&e.freezeMarker){disposeTransientMesh(e.freezeMarker);e.freezeMarker=null}
  e.auraSlowMult=1;
  if(!e.isBlimp){
   for(const t of towers){
    if(t.type==='ice'&&t.auraSlow&&towerCanDamage(t,e)&&Math.hypot(e.mesh.position.x-t.x,e.mesh.position.z-t.z)<=t.range){
     e.auraSlowMult=Math.min(e.auraSlowMult,t.auraSlow);
    }
   }
  }
  if(e.slowT<=0)e.slowMult=1;
  const motionDt=bombStunMotionDt(e,dt);
  const knockDt=e.isBlimp?0:Math.min(motionDt,e.knockbackT||0);e.knockbackT=Math.max(0,(e.knockbackT||0)-dt);
  if(knockDt>0)retreatEnemy(e,e.knockbackSpeed*knockDt);
  let move=enemySpeed(e)*Math.min(motionDt-knockDt,dt-frozenDt);
  while(move>0&&e.alive){
   const a=PATH[e.seg],b=PATH[e.seg+1];
   if(!b){e.alive=false;disposeTransientMesh(e.mesh);loseLives(leakDamage(e));if(lives<=0)endGame(false);break}
   const len=a.distanceTo(b),remain=len-e.dist;
   if(move<remain){e.dist+=move;move=0}else{move-=remain;e.seg++;e.dist=0}
   if(e.alive){placeEnemyOnTrack(e);e.mesh.rotation.y=e.isBlimp?Math.atan2(b.x-a.x,b.z-a.z):Math.sin(animationTime*1.5+e.laneOffset)*.12}
  }
 }
 for(const e of enemies){if(e.alive){if(e.mesh.userData.rotor)e.mesh.userData.rotor.rotation.z+=dt*(e.type==='DDT'?22:9);e.mesh.position.y=.65+Math.sin(animationTime*2.4+progress(e)*.21)*(e.isBlimp?.045:.09);e.hitFlash=Math.max(0,(e.hitFlash||0)-dt);const squash=1-Math.sin(e.hitFlash/.16*Math.PI)*.09;e.mesh.scale.set(1/squash,squash,1/squash);}}
 updateIcicleContacts(dt);
 let write=0;for(const enemy of enemies)if(enemy.alive)enemies[write++]=enemy;enemies.length=write;updateUI()
}
// Ranking follows the supplied newer prioritization diagram, including crosspaths.
function gluePriority(t){
 const [top,,bottom]=t.paths||[0,0,0],corrosive=top>=2;
 if(bottom>=5&&!corrosive)return 9;
 if(bottom>=4&&!corrosive)return 8;
 if(bottom>=5&&corrosive||top>=5)return 7;
 if(bottom>=3&&!corrosive)return 6;
 if(top>=4)return 5;
 if(top>=3)return 4;
 if(bottom>=3&&corrosive)return 2;
 if(corrosive)return 3;
 return 1;
}
function towerCanDamage(t,e){
 if(t.type==='glue'){
  if(e.isBoss||e.boss||e.isBlimp&&!(t.canGlueBlimps||t.moabGlue))return false;
  if(e.glueT>0&&(e.gluePriority||1)>=gluePriority(t))return false;
 }
 const n=e.isBlimp?e.type:layerNames[e.layer];
 if(t.type==='ice'&&e.isBlimp&&!t.canHitBlimps)return false;
 const brittle=e.brittleT>0;
 if(t.type==='ice'&&!t.refreeze&&!brittle&&!e.isBlimp&&(e.freezeT>0||e.abilityFreezeT>0))return false;
 if(e.camo&&!t.camoDetect&&t.type!=='hero')return false;
 if(t.type==='hero'&&t.level<5&&e.camo)return false;
 // DDTs carry Camo + Lead + Black properties. Camo is checked above; material immunities are checked here.
 if(t.damageType==='Explosion'&&(n==='Black'||n==='Zebra'||n==='DDT'))return false;
 if(!brittle&&t.damageType==='Cold'&&(n==='White'||n==='Zebra'||n==='Lead'||n==='DDT'))return false;
 if(!brittle&&!t.brittle&&t.damageType==='Cold Snap'&&(n==='White'||n==='Zebra'||(n==='DDT'&&!t.canHitBlimps)))return false;
 if(!brittle&&t.damageType==='Sharp'&&(n==='Lead'||n==='DDT'||(!e.isBlimp&&(e.freezeT>0||e.abilityFreezeT>0))))return false;
 if(!brittle&&t.damageType==='Shatter'&&(n==='Lead'||n==='DDT'))return false;
 if(t.damageType==='Plasma'&&n==='Purple')return false;
 if(t.damageType==='Flame'&&n==='Purple')return false;
 return true;
}
function ensureGlueMarker(e){
 if(!e?.mesh||e.glueMarker)return;
 const g=new THREE.Group();
 const mat=new THREE.MeshStandardMaterial({flatShading:true,color:0xf3df32,emissive:0x6e6200,emissiveIntensity:.18,roughness:.35,transparent:true,opacity:.95});
 const splat=new THREE.Mesh(new THREE.SphereGeometry(.22,10,7),mat);splat.scale.set(1.6,.35,1.2);g.add(splat);
 for(const [x,z,r] of [[.26,.05,.09],[-.22,.1,.075],[.08,-.2,.065]]){const d=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat);d.position.set(x,-.03,z);g.add(d)}
 g.position.y=enemyMarkerHeight(e);if(e.isBlimp)g.scale.setScalar(2);
 e.mesh.add(g);e.glueMarker=g;
}
function clearGlueMarker(e){if(e?.glueMarker){disposeTransientMesh(e.glueMarker);e.glueMarker=null}}
function enemyMarkerHeight(e){return ({MOAB:2.8,BFB:3.2,ZOMG:3.6,DDT:2.6,BAD:4.25})[e.type]||2.05}
const icicleMarkerRenderer=new BloonRenderer(scene,()=>{
 const template=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:0x8deaff,flatShading:true});
 for(const x of [-.28,0,.28]){const spike=new THREE.Mesh(new THREE.ConeGeometry(.14,.55,4),material);spike.position.set(x,0,Math.abs(x)*.4);spike.rotation.z=-x*.5;template.add(spike);}return template;
},{worldMatrices:true,castShadow:false});
function addIcicles(e,t){
 e.icicles={remaining:2,pierceLeft:3,hitEnemies:new Set(),attack:{type:'iceIcicle',damageType:'Sharp',camoDetect:t.camoDetect,sourceTower:sourceTowerForDamage(t)}};
 if(!e.icicleMarker){e.icicleMarker=icicleMarkerRenderer.create(0);e.icicleMarker.position.y=enemyMarkerHeight(e)+.24;e.mesh.add(e.icicleMarker);}
}
function clearIcicles(e){if(e.icicleMarker){disposeTransientMesh(e.icicleMarker);e.icicleMarker=null;}}
const acidPuddleRenderer=new BloonRenderer(scene,()=>{
 const g=new THREE.Group(),material=new THREE.MeshBasicMaterial({color:0x73d82e});
 const pool=new THREE.Mesh(new THREE.CircleGeometry(1,16),material);pool.rotation.x=-Math.PI/2;g.add(pool);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.86,.10,4,16),new THREE.MeshBasicMaterial({color:0xb8f64b}));rim.rotation.x=Math.PI/2;rim.scale.z=.12;g.add(rim);return g;
},{castShadow:false,materialFactory:()=>new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.82,depthWrite:false})});
const freezeMarkerRenderer=new BloonRenderer(scene,()=>{
 const template=new THREE.Group(),ring=new THREE.Mesh(new THREE.TorusGeometry(.75,.065,6,20),new THREE.MeshBasicMaterial({color:0xb9f3ff}));ring.rotation.x=Math.PI/2;template.add(ring);return template;
},{worldMatrices:true,castShadow:false,materialFactory:()=>new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthWrite:false})});
function ensureFreezeMarker(e){
 if(!e?.mesh||e.freezeMarker)return;
 const marker=freezeMarkerRenderer.create(0);
 marker.position.y=enemyMarkerHeight(e)+.12;if(e.isBlimp)marker.scale.setScalar(1.5);e.mesh.add(marker);e.freezeMarker=marker;
}

function moveEnemyBackward(e,distance){
 while(distance>0){
  if(distance<=e.dist){e.dist-=distance;break}
  distance-=e.dist;
  if(e.seg<=0){e.dist=0;break}
  e.seg--;e.dist=PATH[e.seg].distanceTo(PATH[e.seg+1]);
 }
}
function sourceTowerForDamage(t){return t?.sourceTower||t}
function projectileBounds(a,b,radius){return {minX:Math.min(a.x,b.x)-radius-1e-8,maxX:Math.max(a.x,b.x)+radius+1e-8,minZ:Math.min(a.z,b.z)-radius-1e-8,maxZ:Math.max(a.z,b.z)+radius+1e-8};}
function inProjectileBounds(e,bounds){const p=e.mesh.position;return p.x>=bounds.minX&&p.x<=bounds.maxX&&p.z>=bounds.minZ&&p.z<=bounds.maxZ;}
function hitEnemy(e,dmg,fx={}){
 if(!e||!e.alive)return;
 if(dmg>0){e.regrowTimer=0;e.hitFlash=.16;}
 if(fx.glue&&(!e.isBlimp||fx.allowBlimpSlow)){
  applyGlueCoating(e,fx);
  if(fx.damageAmp){e.glueDamageAmp=Math.max(e.glueDamageAmp||0,fx.damageAmp);e.glueAmpT=Math.max(e.glueAmpT||0,fx.ampDuration||fx.slowDuration||2.8)}
  e.glued=true;ensureGlueMarker(e);
 }else if(fx.slow&&e.type!=='BAD'&&(!e.isBlimp||fx.allowBlimpSlow)){
  e.slowT=Math.max(e.slowT,fx.slowDuration||2.8);e.slowMult=Math.min(e.slowMult,fx.slow);
 }
 const source=sourceTowerForDamage(fx.tower),ice=fx.tower?.type==='ice'?fx.tower:null;
 if(ice?.stripIceProperties){e.camo=false;e.regrow=false;e.regrowStack=[];e.mesh.userData?.bloonInstance?.renderer.restyle(e.mesh,e.layer,e);}
 if(ice&&e.type==='Ceramic')dmg+=ice.iceCeramicBonus||0;
 let dealt=0,children=[];
 let left=dmg>0?Math.max(0,Math.floor(dmg+(fx.ignoreGlueAmp?0:(e.glueDamageAmp||0)+(e.brittleT>0?e.brittleDamage||0:0)))):0;
 if(left>0&&e.alive){
  const taken=Math.min(left,e.hp);if(!e.isBlimp)cash+=taken*cashPerPop(round);
  e.hp-=taken;left-=taken;dealt=taken;
  if(e.hp<=0){if(e.isBlimp)cash+=1;children=destroyEnemyAndSpawnChildren(e)||[];}
 }
 for(const target of e.alive?[e]:children){
  if(ice){
   if(ice.brittle){target.brittleT=Math.max(target.brittleT||0,iceTopTuning.brittleDuration);target.brittleDamage=Math.max(target.brittleDamage||0,ice.brittle);}
   if(ice.postFreezeSlow<1&&(!target.isBlimp||ice.paths[0]>=5)&&target.type!=='BAD'){
    target.permafrostLayers=Math.max(target.permafrostLayers||0,ice.freezeLayers||1);
    target.permafrostSlow=Math.min(target.permafrostSlow||1,target.isBlimp?.75:ice.postFreezeSlow);
   }
  }
  if(!fx.freeze||(target.isBlimp&&!ice?.canFreezeBlimps)||target.type==='BAD'||(fx.tower&&!towerCanDamage(fx.tower,target)))continue;
  target.freezeT=Math.max(target.freezeT||0,target.isBlimp?ice.blimpFreeze:fx.freeze);target.freezeLayers=Math.max(target.freezeLayers||0,ice?.freezeLayers||1);
  if(ice?.shardCount)target.iceShards={tower:source,count:ice.shardCount,damage:ice.shardDamage,pierce:ice.shardPierce,camoDetect:ice.camoDetect};
  ensureFreezeMarker(target);if(ice?.icicles&&!target.isBlimp)addIcicles(target,ice);
 }
 if(source)source.damageDealt=(source.damageDealt||0)+dealt;
 updateUI();return {children,remainingDamage:left};
}
function releaseIceShards(e){
 const stats=e.iceShards,origin=e.mesh.position;
 const attack={type:'iceShard',sourceTower:stats.tower,damage:stats.damage,range:iceTopTuning.shardSpeed*iceTopTuning.shardLife,damageType:'Sharp',camoDetect:stats.camoDetect};
 for(let i=0;i<stats.count;i++)fireLinearProjectile(attack,i*Math.PI*2/stats.count,{visualType:'ice',origin:{x:origin.x,y:origin.y+1,z:origin.z},cosmetic:false,damage:stats.damage,pierce:stats.pierce,speed:iceTopTuning.shardSpeed,life:iceTopTuning.shardLife,radius:.32});
}
function chooseTarget(t,candidates=enemies){
 let best=null,bestScore=-Infinity,preferCamo=false;const rangeSquared=t.range*t.range;
 for(const e of candidates){
  if(!e.alive||!towerCanDamage(t,e))continue;
  const dx=e.mesh.position.x-t.x,dz=e.mesh.position.z-t.z,distanceSquared=dx*dx+dz*dz;
  if(distanceSquared>rangeSquared)continue;
  const priority=!!(t.camoPriority&&t.camoDetect&&e.camo);
  if(preferCamo&&!priority)continue;
  if(priority&&!preferCamo){best=null;bestScore=-Infinity;preferCamo=true;}
  const score=t.target==='first'?progress(e):t.target==='last'?-progress(e):t.target==='strong'?(e.isBlimp?1000+e.hp:e.layer||0):-distanceSquared;
  if(score>bestScore){best=e;bestScore=score;}
 }
 return best;
}
function makeProjectileMesh(kind,angle=0){
 if(kind==='iceSnowball')return new THREE.Mesh(new THREE.IcosahedronGeometry(.25,1),new THREE.MeshStandardMaterial({color:0xe4fbff,emissive:0x21b9d0,emissiveIntensity:.35,flatShading:true}));
 if(kind==='iceImpale'){
  const g=new THREE.Group(),tip=new THREE.Mesh(new THREE.ConeGeometry(.23,.94,5),new THREE.MeshStandardMaterial({color:0xd9faff,emissive:0x17bada,emissiveIntensity:.55,flatShading:true}));tip.rotation.x=Math.PI/2;g.add(tip);return g;
 }
 if(kind==='infernoMeteor'){
  const g=new THREE.Group();
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.38,1),new THREE.MeshStandardMaterial({color:0xffcb3c,emissive:0xff8b15,emissiveIntensity:1.5,flatShading:true}));g.add(core);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.30,1.35,7),new THREE.MeshBasicMaterial({color:0xff4a17}));tail.rotation.x=-Math.PI/2;tail.position.z=-.73;g.add(tail);g.userData.exhaust=tail;
  const hot=new THREE.Mesh(new THREE.IcosahedronGeometry(.23,0),new THREE.MeshBasicMaterial({color:0xfff1a0}));hot.position.set(.08,.08,.22);g.add(hot);return g;
 }
 if(/^bombMissile[2-5]$/.test(kind))return makeBombMissileProjectile(Number(kind.at(-1)));
 if(['boomer','hotBoomer','glaive','hotGlaive','lordGlaive','hotLordGlaive','kylie','pressKylie','dominationKylie','bionicRang','turboRang','permaRang'].includes(kind))return makeBoomerangWeapon(kind);
 if(kind==='sharpDart'){
  const g=new THREE.Group();
  const shaft=cyl(.045,.045,.74,0x936334);shaft.rotation.x=Math.PI/2;shaft.position.z=-.12;g.add(shaft);
  const head=new THREE.Mesh(new THREE.ConeGeometry(.19,.43,5),mat(0x303737));head.rotation.x=Math.PI/2;head.position.z=.46;g.add(head);
  const collar=cyl(.09,.09,.12,0xe7bf58);collar.rotation.x=Math.PI/2;collar.position.z=.2;g.add(collar);
  for(const angle of [0,Math.PI/2]){const fin=box(.28,.04,.23,0xb7c4c6,0,0,-.44);fin.rotation.z=angle;g.add(fin);}
  return g;
 }
 if(kind==='dart'){
  const g=new THREE.Group();
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.78,7),new THREE.MeshStandardMaterial({flatShading:true,color:0xf5d7a2,roughness:.45,emissive:0x6b4a22,emissiveIntensity:.08}));
  shaft.rotation.x=Math.PI/2;g.add(shaft);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.13,.32,7),new THREE.MeshStandardMaterial({flatShading:true,color:0xe5e7eb,metalness:.35,roughness:.3}));tip.rotation.x=Math.PI/2;tip.position.z=.54;g.add(tip);
  const fletch=new THREE.Mesh(new THREE.BoxGeometry(.28,.045,.2),new THREE.MeshStandardMaterial({flatShading:true,color:0xe34b3f,roughness:.5}));fletch.position.z=-.42;g.add(fletch);
  g.scale.setScalar(1.45);return g;
 }
 if(kind==='missile'){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.72,10),new THREE.MeshStandardMaterial({flatShading:true,color:0xcfd4d8,metalness:.55,roughness:.25}));body.rotation.x=Math.PI/2;g.add(body);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.16,.32,10),new THREE.MeshStandardMaterial({flatShading:true,color:0xd83b32,roughness:.35}));nose.rotation.x=Math.PI/2;nose.position.z=.52;g.add(nose);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.10,.28,8),new THREE.MeshStandardMaterial({flatShading:true,color:0xff9c28,emissive:0xff4b00,emissiveIntensity:.9}));flame.rotation.x=-Math.PI/2;flame.position.z=-.5;g.add(flame);
  return g;
 }
 if(kind==='tack'){
  const mesh=new THREE.Mesh(new THREE.ConeGeometry(.11,.56,8),new THREE.MeshStandardMaterial({flatShading:true,color:0x111111,roughness:.38,metalness:.35}));
  mesh.rotation.z=-Math.PI/2;mesh.rotation.y=-angle;return mesh;
 }
 if(kind==='hotTack'){
  const mesh=new THREE.Mesh(new THREE.ConeGeometry(.13,.62,8),new THREE.MeshStandardMaterial({flatShading:true,color:0xff6b21,emissive:0xff3b00,emissiveIntensity:.65,roughness:.28,metalness:.15}));
  mesh.rotation.z=-Math.PI/2;mesh.rotation.y=-angle;return mesh;
 }
 if(kind==='blade')return makeTackBladeProjectile();
 if(kind==='fire'){
  const g=new THREE.Group();
  const core=new THREE.Mesh(new THREE.SphereGeometry(.21,10,8),new THREE.MeshStandardMaterial({flatShading:true,color:0xffb02e,emissive:0xff4b00,emissiveIntensity:1,roughness:.25}));g.add(core);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.16,.52,8),new THREE.MeshStandardMaterial({flatShading:true,color:0xff4a1f,emissive:0xff2a00,emissiveIntensity:.85,roughness:.3}));flame.rotation.z=Math.PI/2;flame.position.x=-.30;g.add(flame);
  g.rotation.y=-angle;return g;
 }
 if(kind==='juggernautBall'||kind==='ultraJuggernautBall'){
  const ultra=kind==='ultraJuggernautBall',g=new THREE.Group(),bandColor=ultra?0xed5825:0xf5c52e;
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.43,1),mat(0x202629)));
  for(const angle of [0,Math.PI/2]){
   const band=new THREE.Mesh(new THREE.TorusGeometry(.438,.032,4,16),mat(bandColor));band.rotation.y=angle;g.add(band);
  }
  const equator=new THREE.Mesh(new THREE.TorusGeometry(.438,.032,4,16),mat(bandColor));equator.rotation.x=Math.PI/2;g.add(equator);
  for(const raw of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.65,.65,.3],[-.65,.65,-.3]]){
   const dir=new THREE.Vector3(...raw).normalize();
   const spike=new THREE.Mesh(new THREE.ConeGeometry(.11,.34,4),mat(0xaab7bc));spike.position.copy(dir).multiplyScalar(.54);spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);g.add(spike);
  }
  // Steel hub on a colored collar reflects the reference ball's mechanical detail.
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,4,12),mat(bandColor));collar.position.z=.42;g.add(collar);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.06,8),mat(0x7f8c92));hub.rotation.x=Math.PI/2;hub.position.z=.43;g.add(hub);
  return g;
 }
 if(kind==='spikeball'){
  const g=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({flatShading:true,color:0x343b3e,metalness:.35,roughness:.48});
  const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.33,1),m);g.add(ball);
  const dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.7,.7,0],[-.7,.7,0],[0,.7,.7],[0,.7,-.7]];
  for(const [x,y,z] of dirs){const sp=new THREE.Mesh(new THREE.ConeGeometry(.075,.38,6),m);sp.position.set(x*.43,y*.43,z*.43);sp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(x,y,z).normalize());g.add(sp)}
  return g;
 }
 if(kind==='crossbowBolt'){
  const g=new THREE.Group();const m=new THREE.MeshStandardMaterial({flatShading:true,color:0x6a4326,roughness:.55});
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1.0,6),m);shaft.rotation.x=Math.PI/2;g.add(shaft);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.11,.28,6),new THREE.MeshStandardMaterial({flatShading:true,color:0xd9dde1,metalness:.5,roughness:.25}));tip.rotation.x=Math.PI/2;tip.position.z=.63;g.add(tip);g.scale.setScalar(1.2);return g;
 }
 if(kind==='plasma'){
  const g=new THREE.Group();
  const core=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:0xdcb8ff}));g.add(core);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),new THREE.MeshBasicMaterial({color:0x9d63ff,transparent:true,opacity:.35,depthWrite:false}));g.add(glow);
  return g;
 }
 if(kind==='ice'){
  const mesh=new THREE.Mesh(new THREE.OctahedronGeometry(.24,0),new THREE.MeshStandardMaterial({flatShading:true,color:0xc9f6ff,emissive:0x3b7e90,emissiveIntensity:.28,roughness:.25,metalness:.05}));
  return mesh;
 }
 if(kind==='bomb')return new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),new THREE.MeshStandardMaterial({flatShading:true,color:0x222222,roughness:.7}));
 if(kind==='bombFrag')return new THREE.Mesh(new THREE.OctahedronGeometry(.13),new THREE.MeshStandardMaterial({flatShading:true,color:0x8b929c,metalness:.35,roughness:.5}));
 if(kind==='glue'){
  const g=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({flatShading:true,color:0xf1df32,emissive:0x6e5f00,emissiveIntensity:.12,roughness:.38});
  const a=new THREE.Mesh(new THREE.SphereGeometry(.25,12,9),m);a.scale.set(1.15,.9,1);g.add(a);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),m);b.position.set(.18,.08,-.12);g.add(b);
  return g;
 }
 if(kind==='hero'){
  const g=new THREE.Group();
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.8,6),new THREE.MeshStandardMaterial({flatShading:true,color:0x7a4d24,roughness:.7}));shaft.rotation.x=Math.PI/2;g.add(shaft);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.09,.24,6),new THREE.MeshStandardMaterial({flatShading:true,color:0x3c4148,metalness:.35,roughness:.45}));tip.rotation.x=Math.PI/2;tip.position.z=.5;g.add(tip);
  const fletch=new THREE.Mesh(new THREE.BoxGeometry(.22,.03,.18),new THREE.MeshStandardMaterial({flatShading:true,color:0xd94f3d,roughness:.6}));fletch.position.z=-.42;g.add(fletch);
  return g;
 }
 return new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color:0xf0d2a2}));
}
function retreatEnemy(e,distance){
 while(distance>e.dist&&e.seg>0){distance-=e.dist;e.seg--;e.dist=PATH[e.seg].distanceTo(PATH[e.seg+1]);}
 e.dist=Math.max(0,e.dist-distance);placeEnemyOnTrack(e);
}
function launchRicochet(t,target,kind){
 const speed=t.projSpeed||34;
 let aim=target.mesh.position;
 // Lead moving targets along the track; preserve off-track scripted targets.
 const a=PATH[target.seg],b=PATH[target.seg+1];
 if(a&&b&&pointSegDist(aim.x,aim.z,a,b)<1){
  let distance=progress(target)+enemySpeed(target)*Math.hypot(aim.x-t.x,aim.z-t.z)/speed;
  let segment=0;while(segment<PATH.length-2&&distance>trackDistances[segment+1])segment++;
  const start=PATH[segment],end=PATH[segment+1],length=start.distanceTo(end),fraction=Math.min(1,(distance-trackDistances[segment])/length);
  aim={x:THREE.MathUtils.lerp(start.x,end.x,fraction),z:THREE.MathUtils.lerp(start.z,end.z,fraction)};
 }
 const dx=aim.x-t.x,dz=aim.z-t.z,d=Math.hypot(dx,dz)||1;
 const mesh=makeProjectileMesh(kind);mesh.scale.setScalar(kind==='ultraJuggernautBall'?1.5:kind==='juggernautBall'?1.25:1.2);
 mesh.position.set(t.x,1.8,t.z);scene.add(mesh);
 const p={mesh,tower:{...t,sourceTower:sourceTowerForDamage(t),paths:[...t.paths]},type:'dart',visualType:kind,mode:'ricochet',logicalPosition:{x:t.x,z:t.z},flightTime:0,launchOffset:new THREE.Vector3(),vx:dx/d*speed,vz:dz/d*speed,speed,damage:t.damage,pierceLeft:t.pierce,hits:0,splits:0,life:3*(t.projectileLifeMult||1),radius:kind==='ultraJuggernautBall'?.8:kind==='juggernautBall'?.65:.45,hitEnemies:new Set(),ceramicBonus:t.ceramicBonus||0,leadBonus:t.leadBonus||0,fortifiedBonus:t.fortifiedBonus||0,knockbackDuration:t.knockbackDuration||0,knockbackMult:t.knockbackMult||1};
 if(t.mesh.userData.loadedAmmo){t.mesh.updateWorldMatrix(true,true);const origin=t.mesh.userData.loadedAmmo.getWorldPosition(new THREE.Vector3());p.launchOffset.copy(origin).sub(mesh.position);mesh.position.copy(origin);t.mesh.userData.loadedAmmo.visible=false;}
 projectiles.push(p);
}
function circleEntry(a,v,length,x,z,r){
 const dx=a.x-x,dz=a.z-z,b=dx*v.x+dz*v.z,c=dx*dx+dz*dz-r*r;
 if(c<=0)return 0;
 const disc=b*b-c;if(disc<0)return Infinity;
 const distance=-b-Math.sqrt(disc);return distance>=0&&distance<=length?distance:Infinity;
}
function splitJuggernaut(p){
 p.splits++;
 const heading=Math.atan2(p.vz,p.vx);
 for(let i=0;i<6;i++){
  const angle=heading+i*Math.PI/3,mesh=makeProjectileMesh('juggernautBall');mesh.scale.setScalar(.75);mesh.position.set(p.logicalPosition.x,1.8,p.logicalPosition.z);scene.add(mesh);
  projectiles.push({...p,mesh,visualType:'juggernautBall',logicalPosition:{...p.logicalPosition},launchOffset:new THREE.Vector3(),flightTime:0,vx:Math.cos(angle)*68,vz:Math.sin(angle)*68,speed:68,damage:2,ceramicBonus:3,leadBonus:0,fortifiedBonus:2,pierceLeft:50,hits:0,splits:0,life:1.8*(p.tower.projectileLifeMult||1),radius:.45,mini:true,hitEnemies:new Set(),dead:false});
 }
}
function applyBallKnockback(p,e){
 if(e.isBlimp||!p.knockbackDuration)return;
 const ultra=p.tower.paths[0]>=5;
 const multiplier=ultra?(e.fort||e.type==='Ceramic'||e.type==='Lead'?2:6):1;
 e.knockbackSpeed=enemySpeed(e)*multiplier*(p.knockbackMult||1);
 e.knockbackT=Math.max(e.knockbackT||0,p.knockbackDuration);
}
function damageBallFamily(p,e,damage,initial=true){
 if(!e.alive)return;p.hitEnemies.add(e);
 const result=hitEnemy(e,damage,{tower:p.tower,ignoreGlueAmp:!initial});
 if(e.alive)applyBallKnockback(p,e);
 for(const child of result?.children||[]){p.hitEnemies.add(child);if(result.remainingDamage>0)damageBallFamily(p,child,result.remainingDamage,false);else applyBallKnockback(p,child);}
}
function updateRicochet(p,dt){
 let remaining=p.speed*Math.min(dt,p.life);p.life-=dt;p.flightTime+=dt;
 for(let bounce=0;remaining>1e-6&&bounce<12&&!p.dead;bounce++){
  const a=p.logicalPosition,v={x:p.vx/p.speed,z:p.vz/p.speed};let wall=remaining,normal=null;
  const bx=MAP_W/2-p.radius,bz=MAP_H/2-p.radius;
  for(const [distance,n] of [[v.x>0?(bx-a.x)/v.x:v.x<0?(-bx-a.x)/v.x:Infinity,{x:v.x>0?-1:1,z:0}],[v.z>0?(bz-a.z)/v.z:v.z<0?(-bz-a.z)/v.z:Infinity,{x:0,z:v.z>0?-1:1}]])if(distance>=0&&distance<=wall){wall=distance;normal=n;}
  for(const obstacle of ballObstacles){
   const radius=obstacle.radius+p.radius,distance=circleEntry(a,v,wall,obstacle.x,obstacle.z,radius);
   if(distance<wall){const hx=a.x+v.x*distance-obstacle.x,hz=a.z+v.z*distance-obstacle.z,h=Math.hypot(hx,hz)||1;if(v.x*hx+v.z*hz<0){wall=distance;normal={x:hx/h,z:hz/h};}}
  }
  const hits=[],bounds=projectileBounds(a,{x:a.x+v.x*wall,z:a.z+v.z*wall},p.radius+2.18);
  for(const e of enemies){if(!e.alive||!inProjectileBounds(e,bounds)||p.hitEnemies.has(e)||!towerCanDamage(p.tower,e))continue;const radius=p.radius+({MOAB:1.15,BFB:1.48,ZOMG:1.78,DDT:1,BAD:2.18}[e.type]||.55);const distance=circleEntry(a,v,wall,e.mesh.position.x,e.mesh.position.z,radius);if(Number.isFinite(distance))hits.push({e,distance});}
  hits.sort((a,b)=>a.distance-b.distance);
  const start={...a};
  for(const {e,distance} of hits){if(!e.alive||p.hitEnemies.has(e))continue;a.x=start.x+v.x*distance;a.z=start.z+v.z*distance;
   damageBallFamily(p,e,p.damage+(e.type==='Ceramic'?p.ceramicBonus:0)+(['Lead','DDT'].includes(e.type)?p.leadBonus:0)+(e.fort?p.fortifiedBonus:0));
   p.pierceLeft--;p.hits++;
   if(p.visualType==='ultraJuggernautBall'&&!p.mini&&p.splits<2&&p.hits>=(p.splits+1)*105)splitJuggernaut(p);
   if(p.pierceLeft<=0){p.dead=true;break;}
  }
  if(p.dead)break;
  a.x=start.x+v.x*wall;a.z=start.z+v.z*wall;remaining-=wall;
  if(!normal)break;
  const dot=p.vx*normal.x+p.vz*normal.z;p.vx-=2*dot*normal.x;p.vz-=2*dot*normal.z;
  a.x+=normal.x*.002;a.z+=normal.z*.002;p.hitEnemies.clear();remaining=Math.max(0,remaining-.002);
 }
 const fade=Math.max(0,1-p.flightTime/.16);p.mesh.position.set(p.logicalPosition.x+p.launchOffset.x*fade,1.8+p.launchOffset.y*fade,p.logicalPosition.z+p.launchOffset.z*fade);p.mesh.rotation.x+=dt*10;p.mesh.rotation.z+=dt*8;
 if(p.life<=0)p.dead=true;
}

function fireProjectile(t,target,damage=t.damage,extra={}){
 if(t.type==='glue'&&!extra.cosmetic){
  const origin=glueMuzzleOrigin(t),angle=Math.atan2(target.mesh.position.z-origin.z,target.mesh.position.x-origin.x);
  if(extra.visualSpread){origin.x-=Math.sin(angle)*extra.visualSpread;origin.z+=Math.cos(angle)*extra.visualSpread;}
  const attack={...t,paths:[...t.paths],sourceTower:sourceTowerForDamage(t)};
  fireLinearProjectile(attack,angle,{visualType:'glue',cosmetic:false,damage,pierce:t.glueSplash?1:t.pierce,speed:t.projSpeed,life:t.projectileLife,radius:t.projectileRadius,slow:t.slow,slowDuration:t.slowDuration,glueSplash:t.glueSplash,splashPierce:t.pierce,origin});return;
 }
 if(t.type==='ice'&&t.cryo&&!extra.cosmetic){fireIceProjectile(t,target);return;}
 let critical=false;
 if(t.type==='dart'&&t.critEvery&&!extra.cosmetic&&!extra.visualType){
  const source=t.sourceTower||t;source.critShotCounter=(source.critShotCounter||0)+1;
  critical=source.critShotCounter%t.critEvery===0;if(critical)damage=t.critDamage;
 }

 let kind=extra.visualType||t.type;
 if(!extra.visualType&&t.type==='dart'){if(t.fanTier>=5)kind='plasma';else if((t.paths?.[0]||0)>=5)kind='ultraJuggernautBall';else if((t.paths?.[0]||0)>=4)kind='juggernautBall';else if((t.paths?.[0]||0)>=3)kind='spikeball';else if((t.paths?.[2]||0)>=3)kind='crossbowBolt';else if((t.paths?.[0]||0)>=1)kind='sharpDart';}
 if(!extra.visualType&&t.type==='boomer')kind=boomerangProjectileKind(t);
 if(!extra.visualType&&t.type==='bomb'&&(t.paths?.[1]||0)>=2)kind='missile';
 if(t.type==='bomb'&&kind==='missile'&&(t.paths?.[1]||0)>=2)kind='bombMissile'+Math.min(5,t.paths[1]);
 if(!extra.visualType&&t.type==='glue')kind='glue';
 if(t.type==='dart'&&['spikeball','juggernautBall','ultraJuggernautBall'].includes(kind)&&!extra.cosmetic){launchRicochet(t,target,kind);return;}
 const mesh=makeProjectileMesh(kind);
 if(t.type==='boomer'&&t.paths[2]>=3&&!extra.mode){
  fireKylieProjectile(t,target,{mesh,damage});return;
 }
 if(t.type==='boomer')triggerBoomerangThrow(t,target);
 if(t.type==='boomer'&&t.paths[0]>=3&&!extra.mode){
  mesh.position.set(t.x,2,t.z);scene.add(mesh);
  projectiles.push({mesh,tower:t,type:t.type,mode:'ricochet',target,damage,speed:46.5*(t.projectileSpeedMult||1),pierceLeft:extra.pierce??t.pierce,bounceRange:t.bounceRange,elapsed:0,hitTimes:new Map(),radius:.55});return;
 }
 if(t.type==='boomer'&&!extra.mode){
  const dx=target.mesh.position.x-t.x,dz=target.mesh.position.z-t.z,len=Math.hypot(dx,dz)||1;
  mesh.position.set(t.x,2,t.z);scene.add(mesh);
  projectiles.push({mesh,tower:t,type:t.type,mode:'boomerArc',damage,speed:extra.speed||towerDefs[t.type].projSpeed*(t.paths[0]>=2?1.5:1)*(t.projectileSpeedMult||1),origin:{x:t.x,z:t.z},forward:{x:dx/len,z:dz/len},hand:t.throwHand===-1?-1:1,arcRadius:t.range/2,angle:0,pierceLeft:extra.pierce??t.pierce,hitEnemies:new Set(),radius:.55});
  return;
 }
 if(critical)mesh.traverse(o=>{if(o.material?.emissive){o.material.emissive.setHex(0xffbd32);o.material.emissiveIntensity=.65;}});
 if(kind==='spikeball')mesh.scale.setScalar(1.2);
 if(kind==='juggernautBall'||kind==='ultraJuggernautBall')mesh.scale.setScalar(kind==='ultraJuggernautBall'?1.5:1.25);
 if(t.type==='glue'){const color=(t.paths?.[0]||0)>=2?0x83d961:(t.paths?.[2]||0)>=3?0xba8ce3:0xf1df32;mesh.traverse(o=>{if(o.material)o.material.color.setHex(color);});}
 if(extra.visualSpread)for(const child of mesh.children)child.position.x+=extra.visualSpread;
 mesh.position.set(t.x,kind==='ice'?1.8:(kind==='hero'?2.15:2), t.z);
 let logicalPosition=null,launchOffset=null;
 if(t.type==='dart'&&t.mesh.userData.dartTopTier&&t.mesh.userData.loadedAmmo){
  // Draw the shot at its hand/cup while keeping the original collision trajectory.
  t.mesh.updateWorldMatrix(true,true);const origin=t.mesh.userData.loadedAmmo.getWorldPosition(new THREE.Vector3());
  logicalPosition={x:t.x,z:t.z};launchOffset=origin.clone().sub(new THREE.Vector3(t.x,1.8,t.z));
  mesh.position.copy(origin);mesh.rotation.y=t.mesh.rotation.y;t.mesh.userData.loadedAmmo.visible=false;
 }
 if(t.type==='glue'&&(t.paths?.[1]||0)>=1)mesh.scale.setScalar(1.35);
 if(extra.abilityMissile)mesh.scale.setScalar(1.8);
 scene.add(mesh);
 const mode=extra.mode||(t.type==='boomer'?'boomer':'homing');
 let recursive=false;
 if(t.type==='bomb'&&!extra.abilityMissile&&!extra.cosmetic){
  const source=sourceTowerForDamage(t);source.bombShotCounter=(source.bombShotCounter||0)+1;
  recursive=t.paths[2]>=5||(t.paths[2]>=4&&source.bombShotCounter%2===0);
  t={...t,sourceTower:source,paths:[...t.paths]};
 }
 projectiles.push({mesh,target,logicalPosition,launchOffset,flightTime:0,tower:t,damage,critical,recursive,speed:extra.speed||t.projSpeed||towerDefs[t.type].projSpeed||32,type:t.type,splash:extra.splash??(t.splash*(recursive?bombClusterTuning.recursiveBlastMult:1)),slow:t.slow,freeze:t.freeze,pierce:extra.pierce??t.pierce,slowDuration:t.slowDuration,cosmetic:!!extra.cosmetic,abilityMissile:!!extra.abilityMissile,mode,life:extra.life||(1.4*(t.projectileLifeMult||1)),vx:extra.vx||0,vz:extra.vz||0,visualType:kind,radius:extra.radius||.5,curvePhase:Math.random()*Math.PI*2,travel:0});
}
function fireKylieProjectile(t,target,{mesh=null,damage=t.damage,special=false}={}){
 const tuning=t.paths[2]>=5?boomerSpecialTuning.domination:boomerSpecialTuning.press;
 mesh=mesh||makeProjectileMesh(boomerangProjectileKind(t,special));
 triggerBoomerangThrow(t,target,special);
 if(special)mesh.scale.setScalar(t.paths[2]>=5?2.2:1.8);
 mesh.position.set(t.x,2,t.z);scene.add(mesh);
 const dx=target.mesh.position.x-t.x,dz=target.mesh.position.z-t.z,len=Math.hypot(dx,dz)||1;
 const topPierce=t.paths[0]>=2?9:t.paths[0]>=1?4:0;
 const knockMult=t.paths[0]>=2?1.5:t.paths[0]>=1?1.25:1;
 projectiles.push({mesh,tower:t,type:t.type,mode:'kylie',origin:{x:t.x,z:t.z},forward:{x:dx/len,z:dz/len},
  range:t.range*(special?tuning.rangeMult:1),speed:towerDefs.boomer.projSpeed*(t.projectileSpeedMult||1)*(t.paths[0]>=2?1.5:1),
  travel:0,elapsed:0,hitTimes:new Map(),rehitCooldown:special?.1:.3,radius:special?.75:.55,
  damage:special?1:damage,moabDamage:special?tuning.moabDamage:damage+(t.bonusMoab||0),
  pierceLeft:special?tuning.pierce+topPierce:t.pierce,knockback:special?tuning.knockback*knockMult:0,
  special,explodes:special&&t.paths[2]>=5,tuning});
}
function fireIceProjectile(t,target){
 const attack={...t,paths:[...t.paths],sourceTower:sourceTowerForDamage(t)};
 const kind=t.paths[2]>=5?'iceImpale':'iceSnowball',mesh=makeProjectileMesh(kind),origin=iceMuzzleOrigin(t);
 mesh.position.set(origin.x,origin.y,origin.z);scene.add(mesh);
 projectiles.push({mesh,tower:attack,type:'ice',visualType:kind,mode:'iceBomb',target,targetPoint:{x:target.mesh.position.x,z:target.mesh.position.z},logicalPosition:{x:t.x,z:t.z},launchOffset:{x:origin.x-t.x,y:origin.y-1.8,z:origin.z-t.z},flightTime:0,speed:t.projSpeed,life:iceBottomTuning.projectileLife,damage:t.damage,pierce:t.pierce});
}
function damageIceFamily(attack,e,damage,initial=true){
 if(!e.alive)return;
 const result=hitEnemy(e,damage,{tower:attack,freeze:attack.freeze,ignoreGlueAmp:!initial});
 for(const child of result?.children||[])if(result.remainingDamage>0)damageIceFamily(attack,child,Math.min(result.remainingDamage,attack.damage+(child.isBlimp?attack.bonusMoab:0)),false);
}
function explodeIceProjectile(p,position){
 const attack=p.tower,targets=enemies.filter(e=>e.alive&&towerCanDamage(attack,e)&&(e.mesh.position.x-position.x)**2+(e.mesh.position.z-position.z)**2<=attack.splash*attack.splash);
 if(targets.includes(p.target)){targets.splice(targets.indexOf(p.target),1);targets.unshift(p.target);}
 for(const e of targets.slice(0,p.pierce))if(e.alive)damageIceFamily(attack,e,p.damage+(e.isBlimp?attack.bonusMoab:0));
 spawnImpactVisual({...p,splash:attack.splash},{...position,y:1.4});
 if(visualEffects.length<80)spawnIceAuraVisual({x:position.x,z:position.z,range:attack.splash});
}
function updateIceProjectile(p,dt){
 const travelDt=Math.min(dt,Math.max(0,p.life));p.life-=dt;p.flightTime+=travelDt;
 if(p.target?.alive){p.targetPoint.x=p.target.mesh.position.x;p.targetPoint.z=p.target.mesh.position.z;}
 const motion=p.logicalPosition,dx=p.targetPoint.x-motion.x,dz=p.targetPoint.z-motion.z,d=Math.hypot(dx,dz),step=p.speed*travelDt;
 if(d<=step+.25){explodeIceProjectile(p,p.targetPoint);p.dead=true;return;}
 motion.x+=dx/d*step;motion.z+=dz/d*step;p.mesh.rotation.y=Math.atan2(dx,dz);
 const fade=Math.max(0,1-p.flightTime/.12);p.mesh.position.set(motion.x+p.launchOffset.x*fade,1.8+p.launchOffset.y*fade,motion.z+p.launchOffset.z*fade);
 if(p.visualType==='iceSnowball')p.mesh.rotation.x+=travelDt*5;
 if(p.life<=0)p.dead=true;
}
function fireLinearProjectile(t,angle,extra={}){
 const kind=extra.visualType||'tack';
 const mesh=makeProjectileMesh(kind,angle);
 mesh.position.set(extra.origin?.x??t.x,extra.origin?.y??(kind==='tack'?1.15:1.55),extra.origin?.z??t.z);
 if(t.type==='dart')mesh.rotation.y=Math.PI/2-angle;
 scene.add(mesh);
 const speed=extra.speed||34;
 projectiles.push({mesh,tower:t,damage:extra.damage??t.damage,type:t.type,cosmetic:extra.cosmetic!==false,mode:'linear',life:extra.life||Math.max(.22,t.range/(speed*1.15)),vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,visualType:kind,glueSplash:extra.glueSplash||0,splashPierce:extra.splashPierce||0,radius:extra.radius||.45,pierceLeft:extra.pierce??1,hitEnemies:new Set(),slow:extra.slow,slowDuration:extra.slowDuration,freeze:extra.freeze});
}
function spawnTackVolleyVisual(t){
 t.recoil=.11;t.fireAnim=.24;
 const count=Math.max(1,Math.round(t.tacks||8));
 const referenceBase=!!t.mesh.userData.tackRig;
 const heading=t.mesh.rotation.y+(t.mesh.userData.body?.rotation.y||0);
 const offset=Math.PI/2-heading;
 let visualType='tack';
 if((t.paths?.[0]||0)>=4)visualType='fire';
 else if((t.paths?.[1]||0)>=3)visualType='blade';
 else if((t.paths?.[0]||0)>=3)visualType='hotTack';
 const speed=visualType==='fire'?28:t.projSpeed||(visualType==='blade'?32:36);
 const visibleCount=visualType==='fire'?Math.min(16,count):count;
 const attack={...t,sourceTower:t,paths:[...t.paths]};
 for(let i=0;i<visibleCount;i++){
  const angle=offset+i*Math.PI*2/visibleCount;
  const origin=referenceBase?tackMuzzleOrigin(t,(count-i)%count):{x:t.x+Math.cos(angle)*1.45,y:1.66,z:t.z+Math.sin(angle)*1.45};
  const muzzleDistance=origin?Math.hypot(origin.x-t.x,origin.z-t.z):0;
  fireLinearProjectile(attack,angle,{visualType,cosmetic:true,speed,life:Math.max(.001,(t.range-muzzleDistance)/speed),radius:visualType==='blade'?.8:.35,pierce:t.pierce,origin});
 }
}
function spawnIceAuraVisual(t){
 const radius=Math.max(.5,t.range);
 const geo=new THREE.CylinderGeometry(radius,radius,.055,64);
 const matl=new THREE.MeshBasicMaterial({color:0x63d7ff,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide});
 const disc=new THREE.Mesh(geo,matl);disc.position.set(t.x,.52,t.z);scene.add(disc);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(radius,.09,8,64),new THREE.MeshBasicMaterial({color:0xb9f3ff,transparent:true,opacity:.72,depthWrite:false}));edge.rotation.x=Math.PI/2;edge.position.set(t.x,.58,t.z);scene.add(edge);
 visualEffects.push({kind:'iceAura',meshes:[disc,edge],life:.34,maxLife:.34});
}
// Cosmetic effects never participate in collision or damage. Cap bursts on dense rounds.
function spawnBurst(position,color,count=5,spread=2,life=.3,kind='pop'){
 if(visualEffects.length>=80)return;
 const meshes=[],velocities=[];
 for(let i=0;i<count;i++){
  const m=new THREE.Mesh(new THREE.OctahedronGeometry(kind==='pop'?.095:.13),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false}));
  m.position.copy(position);m.position.y+=kind==='pop'?1.05:.6;scene.add(m);meshes.push(m);
  const angle=i*Math.PI*2/count;velocities.push(new THREE.Vector3(Math.cos(angle)*spread,1.5+(i%2),Math.sin(angle)*spread));
 }
 visualEffects.push({kind,meshes,velocities,life,maxLife:life,opacities:meshes.map(()=>.9)});
}
function spawnPopVisual(e){spawnBurst(e.mesh.position,e.isBlimp?blimpStats[e.type].color:layerColors[e.layer],e.isBlimp?10:5,e.isBlimp?5:2,e.isBlimp?.5:.3);}
function spawnArrowRainVisual(e){
 if(visualEffects.length>=80)return;
 const arrow=makeProjectileMesh('hero');arrow.rotation.x=Math.PI/2;arrow.position.copy(e.mesh.position);arrow.position.y+=8;scene.add(arrow);
 visualEffects.push({kind:'arrowRain',meshes:[arrow],velocities:[new THREE.Vector3(0,-26,0)],life:.25,maxLife:.25});
}
function spawnImpactVisual(p,position){
 if(p.critical)spawnBurst(position,0xffd151,5,2,.3,'impact');
 const colors={bomb:0xffb657,missile:0xffb657,infernoMeteor:0xff9522,glue:0xf6dd4e,ice:0xb8f4ff,iceSnowball:0xb8f4ff,iceImpale:0x7eefff,hotBoomer:0xff7138,plasma:0xcb93ff};
 const color=p.type==='glue'?((p.tower.paths?.[0]||0)>=2?0x83d961:(p.tower.paths?.[2]||0)>=3?0xba8ce3:0xf6dd4e):p.visualType?.startsWith('bombMissile')?0xffb657:colors[p.visualType];if(color)spawnBurst(position,color,p.splash?8:4,p.splash?4:1.5,.25,'impact');
}
function updateVisualEffects(dt){
 for(const fx of visualEffects){
  fx.life-=dt;const k=Math.max(0,fx.life/fx.maxLife);
  fx.meshes.forEach((m,i)=>{
   if(m.material)m.material.opacity=(fx.opacities?.[i]??(m.geometry.type==='TorusGeometry'?.72:.30))*k;
   if(fx.kind==='arrowRain'){m.position.addScaledVector(fx.velocities[i],dt);}
   else if(fx.velocities){m.position.addScaledVector(fx.velocities[i],dt);fx.velocities[i].y-=dt*5;m.rotation.x+=dt*8;m.rotation.z+=dt*6;m.scale.setScalar(.4+k*.6);}
   else m.scale.setScalar(fx.kind==='abilityPulse'?.12+(1-k)*1.15:1+(1-k)*.035);
  });
 }
 for(let i=visualEffects.length-1;i>=0;i--)if(visualEffects[i].life<=0){for(const m of visualEffects[i].meshes)disposeTransientMesh(m);visualEffects.splice(i,1)}
}

let animationTime=0;
function animateTower(t,dt){
 t.fireAnim=Math.max(0,t.fireAnim-dt);const phase=t.fireAnim/.24,kick=Math.sin(phase*Math.PI);const idle=Math.sin(animationTime*2+t.id*.8);
 const body=t.mesh.userData.body,w=t.mesh.userData.weapon;body.position.y=idle*.035;
 if(t.mesh.userData.loadedAmmo)t.mesh.userData.loadedAmmo.visible=t.fireAnim<=.06;
 if(t.type==='tack'){body.scale.set(1+kick*.08,1-kick*.12,1+kick*.08);body.rotation.y+=dt*(t.activeAbility?.kind==='maelstrom'?8*(t.activeAbility.direction??1):.12);}
 else{body.rotation.x=-kick*.055;if(w.userData.rest){w.position.copy(w.userData.rest);if(t.type==='bomb')w.position.x-=kick*.25;else w.position.z-=kick*.16;w.rotation.x=t.mesh.userData.dartTopTier>=3?-kick*.34:t.type==='boomer'?kick*.7:t.type==='hero'?-kick*.22:-kick*.08;}
 if(t.type==='hero'&&w.children[1])w.children[1].position.z=-kick*.2;
 if(t.mesh.userData.uniformCape)t.mesh.userData.uniformCape.rotation.x=Math.sin(animationTime*2+t.id)*.045;
 if(t.mesh.userData.headbandTies){t.mesh.userData.headbandTies.rotation.x=Math.sin(animationTime*2.2+t.id)*.045;t.mesh.userData.headbandTies.rotation.y=Math.sin(animationTime*1.7+t.id)*.04;}
 if(t.mesh.userData.rightArm)t.mesh.userData.rightArm.rotation.x=(t.mesh.userData.dartTopTier<=2?-.65:-.25)-kick*(t.type==='boomer'?1.1:.5)+idle*.025;
 if(t.mesh.userData.leftArm)t.mesh.userData.leftArm.rotation.x=t.type==='ice'?-kick*.9:-.2+idle*.025;
 }
 for(const child of t.mesh.children)if(child.userData.upgradeVisual&&child.geometry?.type==='TorusGeometry'&&(t.type==='ice'||t.type==='boomer'))child.rotation.z+=dt*.22;
}
function aimTower(t,e){t.mesh.rotation.y=Math.atan2(e.mesh.position.x-t.x,e.mesh.position.z-t.z)+(t.mesh.userData.aimOffset||0);t.fireAnim=.24;}
function updateMOABPress(t,dt){
 if(dt<=0||t.paths[2]<4)return;
 t.pressCool=(t.pressCool||0)-dt;
 const tuning=t.paths[2]>=5?boomerSpecialTuning.domination:boomerSpecialTuning.press;
 while(t.pressCool<=0){
  const targeting={...t,range:t.range*tuning.rangeMult};
  // Use the tower's target priority, filtering out regular bloons for this attack only.
  const targets=enemies.filter(e=>e.alive&&e.isBlimp&&towerCanDamage(targeting,e)&&Math.hypot(e.mesh.position.x-t.x,e.mesh.position.z-t.z)<=targeting.range);
  if(!targets.length){t.pressCool=0;break}
  targets.sort((a,b)=>t.target==='strong'?b.hp-a.hp:t.target==='close'?Math.hypot(a.mesh.position.x-t.x,a.mesh.position.z-t.z)-Math.hypot(b.mesh.position.x-t.x,b.mesh.position.z-t.z):t.target==='last'?progress(a)-progress(b):progress(b)-progress(a));
  fireKylieProjectile(t,targets[0],{special:true});
  t.pressCool+=boomerSpecialTuning.cooldown*t.rate/towerDefs.boomer.rate;
 }
}
function damageTackFamily(p,e,damage,initial=true){
 if(!e.alive||p.hitEnemies.has(e)||!towerCanDamage(p.tower,e))return;
 p.hitEnemies.add(e);const result=hitEnemy(e,damage,{tower:p.tower,ignoreGlueAmp:!initial});
 for(const child of result?.children||[]){
  p.hitEnemies.add(child);
  if(result.remainingDamage>0){
   p.hitEnemies.delete(child);
   damageTackFamily(p,child,Math.min(result.remainingDamage,p.tower.damage+(child.isBlimp?p.tower.bonusMoab||0:0)),false);
  }
 }
}
function spawnTackFlameVisual(t){
 if(visualEffects.length>=80)return;
 const material=new THREE.MeshBasicMaterial({color:t.paths[0]>=5?0xffbf25:0xff6625,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide});
 const disc=new THREE.Mesh(new THREE.CircleGeometry(t.range,48),material);disc.rotation.x=-Math.PI/2;disc.position.set(t.x,.62,t.z);scene.add(disc);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(t.range,.14,6,48),new THREE.MeshBasicMaterial({color:0xffd452,transparent:true,opacity:.72,depthWrite:false}));edge.rotation.x=Math.PI/2;edge.position.set(t.x,.66,t.z);scene.add(edge);
 visualEffects.push({kind:'tackFlame',meshes:[disc,edge],life:.20,maxLife:.20});
}
function fireTackFlameBurst(t){
 const candidates=enemies.filter(e=>e.alive&&towerCanDamage(t,e)&&Math.hypot(e.mesh.position.x-t.x,e.mesh.position.z-t.z)<=t.range).sort((a,b)=>progress(b)-progress(a));
 if(!candidates.length)return false;
 const p={tower:t,hitEnemies:new Set()};let hits=0;
 for(const e of candidates){if(hits>=t.pierce)break;if(!e.alive||p.hitEnemies.has(e))continue;hits++;damageTackFamily(p,e,t.damage+(e.isBlimp?t.bonusMoab||0:0));}
 t.fireAnim=.24;t.recoil=.11;spawnTackFlameVisual(t);return true;
}
function fireTackRadialBurst(t){
 // Resolve normal volleys throughout the range circle; flying tacks are cosmetic.
 const count=Math.max(1,Math.round(t.tacks||8));
 const targets=enemies.filter(e=>e.alive&&towerCanDamage(t,e)&&Math.hypot(e.mesh.position.x-t.x,e.mesh.position.z-t.z)<=t.range).slice(0,count);
 if(!targets.length)return false;
 const p={tower:t,hitEnemies:new Set()};
 for(const e of targets)damageTackFamily(p,e,t.damage+(e.isBlimp?t.bonusMoab||0:0));
 spawnTackVolleyVisual(t);return true;
}
function addInfernoBurn(e,t){
 const source=sourceTowerForDamage(t);e.burns=e.burns||[];
 const burn=e.burns.find(b=>b.source===source);
 if(burn){burn.remaining=Math.max(burn.remaining,tackTopTuning.meteorBurnDuration);burn.damage=Math.max(burn.damage,50);}
 else e.burns.push({source,remaining:tackTopTuning.meteorBurnDuration,tick:0,damage:50});
}
function launchInfernoMeteor(t,target){
 t.meteorAnim=.30;
 const attack={...t,sourceTower:t,paths:[...t.paths],damage:700,bonusMoab:0,damageType:'Normal'};
 const mesh=makeProjectileMesh('infernoMeteor');mesh.position.set(t.x,2.45,t.z);scene.add(mesh);
 projectiles.push({mode:'infernoMeteor',type:'tack',visualType:'infernoMeteor',mesh,tower:attack,target,targetPosition:target.mesh.position.clone(),damage:700,pierceLeft:t.meteorPierce||1,hitEnemies:new Set(),splash:tackTopTuning.meteorExplosionRadius,speed:tackTopTuning.meteorSpeed,life:Math.hypot(MAP_W,MAP_H)/tackTopTuning.meteorSpeed+1});
}
function updateInfernoMeteor(t,dt){
 if(t.paths[0]<5||dt<=0)return;
 t.meteorCool=(t.meteorCool||0)-dt;
 while(t.meteorCool<=0){
  const target=chooseTarget({...t,range:tackTopTuning.meteorRange,damageType:'Normal'});
  if(!target){t.meteorCool=0;break;}launchInfernoMeteor(t,target);t.meteorCool+=tackTopTuning.meteorCooldown;
 }
}
function explodeInfernoMeteor(p){
 const position=p.mesh.position;
 const blast={tower:{...p.tower,damage:tackTopTuning.meteorExplosionDamage},hitEnemies:new Set()};let hits=0;
 for(const e of [...enemies]){
  if(hits>=tackTopTuning.meteorExplosionPierce)break;
  if(!e.alive||blast.hitEnemies.has(e)||!towerCanDamage(blast.tower,e)||Math.hypot(e.mesh.position.x-position.x,e.mesh.position.z-position.z)>p.splash)continue;
  hits++;addInfernoBurn(e,p.tower);damageTackFamily(blast,e,tackTopTuning.meteorExplosionDamage);
 }
 spawnImpactVisual(p,position);spawnAbilityPulse(position.x,position.z,0xff8820,p.splash);p.dead=true;
}
function updateInfernoMeteorProjectile(p,dt){
 if(p.dead)return;
 const nextTarget=()=>chooseTarget({...p.tower,range:tackTopTuning.meteorRange},enemies.filter(e=>!p.hitEnemies.has(e)));
 if(!p.target?.alive)p.target=nextTarget();
 if(p.target?.alive)p.targetPosition=p.target.mesh.position.clone();
 const travelDt=Math.min(dt,Math.max(0,p.life));p.life-=dt;
 let distanceBudget=p.speed*travelDt;
 while(distanceBudget>=0){
  const dx=p.targetPosition.x-p.mesh.position.x,dz=p.targetPosition.z-p.mesh.position.z,d=Math.hypot(dx,dz);
  p.mesh.rotation.y=Math.atan2(dx,dz);
  if(d>distanceBudget+.35){p.mesh.position.x+=dx/d*distanceBudget;p.mesh.position.z+=dz/d*distanceBudget;break;}
  p.mesh.position.x=p.targetPosition.x;p.mesh.position.z=p.targetPosition.z;distanceBudget=Math.max(0,distanceBudget-d);
  if(p.target?.alive&&!p.hitEnemies.has(p.target)&&towerCanDamage(p.tower,p.target)){
   addInfernoBurn(p.target,p.tower);damageTackFamily(p,p.target,700);p.pierceLeft--;
  }
  const target=p.pierceLeft>0?nextTarget():null;
  if(!target){explodeInfernoMeteor(p);return;}
  p.target=target;p.targetPosition=target.mesh.position.clone();
  if(distanceBudget<=0)break;
 }
 p.mesh.position.y=2.3+Math.sin(animationTime*8)*.15;
 if(p.mesh.userData.exhaust)p.mesh.userData.exhaust.scale.setScalar(.85+.15*Math.sin(animationTime*35));
 if(p.life<=0)p.dead=true;
}
function updateTowers(dt){
 const iceBuffDt=roundActive?Math.min(dt,absoluteZeroBuffT):0;if(roundActive)absoluteZeroBuffT=Math.max(0,absoluteZeroBuffT-dt);
 for(const t of towers){
  const combatDt=roundActive?dt:0;
  updateTowerAbility(t,combatDt);
  if(t.type==='boomer'){animateBoomerang(t,dt);updateMOABPress(t,combatDt);if(t.paths[0]>=5)updateGlaiveLord(t,combatDt,dt)}else if(t.type==='bomb'&&t.mesh.userData.bombRig)animateBomb(t,dt);else if(t.type==='tack'&&t.mesh.userData.tackRig)animateTack(t,dt);else if(t.type==='ice'&&t.mesh.userData.iceRig)animateIce(t,dt);else if(t.type==='glue'&&t.mesh.userData.glueRig)animateGlue(t,dt);else animateTower(t,dt);
  if(t.type==='hero'){
   t.rapidCd=Math.max(0,(t.rapidCd||0)-combatDt);t.rapidTimer=Math.max(0,(t.rapidTimer||0)-combatDt);t.stormCd=Math.max(0,(t.stormCd||0)-combatDt);t.stormTimer=Math.max(0,(t.stormTimer||0)-combatDt);
   if(t.stormTimer>0&&combatDt>0){t.stormTick-=combatDt;if(t.stormTick<=0){t.stormTick=.05;const chance=t.level>=20?.10:t.level>=18?.075:.05;const stormDamage=t.level>=20?10:6;for(const e of enemies){if(!e.alive)continue;if(Math.random()>Math.min(1,chance*3))continue;const d=stormDamage+(e.isBlimp?(t.level>=20?10:6):0);spawnArrowRainVisual(e);hitEnemy(e,d,{tower:t});}}}
  }
  if(t.type==='tack')updateInfernoMeteor(t,combatDt);
  const pausedRadial=(t.type==='tack'||t.type==='ice')&&combatDt<=0;
  t.cool-=t.type==='ice'?combatDt+iceBuffDt*.5:t.type==='tack'?combatDt:dt;if(pausedRadial)continue;if(t.cool>0)continue;
  if(towerDefs[t.type].hero){
   const prev=t.level;
   t.level=Math.min(20,1+Math.floor((round-1)/5));
   t.damage=1;
   t.pierce=t.level>=19?9:t.level>=12?7:t.level>=9?6:t.level>=2?4:3;
   t.shots=t.level>=19?3:t.level>=6?2:1;
   t.rate=t.level>=20?.2:t.level>=18?.25:t.level>=16?.4:t.level>=11?.6:.95;
   t.range=(t.level>=13?54:t.level>=4?52:50)*RANGE_SCALE;
   t.camoDetect=t.level>=5;
   t.bonusMoab=t.level>=14?3:t.level>=8?2:0;
   t.explosionEvery=t.level>=7?3:0;
   if(prev!==t.level)updateHeroAppearance(t);
  }
  if(t.type==='tack'){
   if(t.paths[0]>=4){
    while(t.cool<=0){if(!fireTackFlameBurst(t)){t.cool=0;break;}t.cool+=t.rate;}
    continue;
   }
   while(t.cool<=0){
    if(!fireTackRadialBurst(t)){t.cool=0;break;}t.cool+=t.rate;
   }
   continue;
  }else if(t.type==='ice'){
   if((t.paths?.[2]||0)>=3){
    const e=chooseTarget(t);if(e){aimTower(t,e);fireProjectile(t,e,t.damage,{visualType:'ice'});t.cool=t.rate}
   }else{
    const targets=enemies.filter(e=>e.alive&&towerCanDamage(t,e)&&Math.hypot(e.mesh.position.x-t.x,e.mesh.position.z-t.z)<=t.range).slice(0,t.pierce);
    const global=t.paths[1]>=5?enemies.filter(e=>e.alive&&!e.isBlimp&&towerCanDamage(t,e)):[];
    if(targets.length||global.length){
     aimTower(t,targets[0]||global[0]);targets.forEach(e=>hitEnemy(e,t.damage,{tower:t,freeze:t.freeze}));
     for(const e of global)if(e.alive)hitEnemy(e,0,{tower:t,freeze:iceMiddleTuning.secondaryFreeze});
     spawnIceAuraVisual(t);t.cool=t.rate;
    }
   }
  }else if(t.type==='boomer'){
   const attack=getAttackTower(t);
   while(t.cool<=0){
    const e=chooseTarget(attack);
    if(!e){t.cool=0;break}
    fireProjectile(attack,e);
    t.shotCounter=(t.shotCounter||0)+1;
    t.cool+=attack.rate;
   }
  }else{
   const attack=getAttackTower(t),e=chooseTarget(attack);if(e){
    aimTower(t,e);
    const count=Math.max(1,attack.shots||1);
    for(let i=0;i<count;i++)fireProjectile(attack,e,attack.damage,{visualSpread:(i-(count-1)/2)*.18});
    t.shotCounter=(t.shotCounter||0)+1;
    if(t.type==='hero'&&t.explosionEvery&&t.shotCounter%t.explosionEvery===0){
      const nearby=enemies.filter(x=>x.alive&&towerCanDamage(t,x)&&Math.hypot(x.mesh.position.x-e.mesh.position.x,x.mesh.position.z-e.mesh.position.z)<3.2).slice(0,10);
      nearby.forEach(x=>hitEnemy(x,1+(t.bonusMoab&&x.isBlimp?t.bonusMoab:0),{tower:t}));
    }
    const rapidMult=(t.type==='hero'&&t.rapidTimer>0)?(t.level>=15?4:3):1;t.cool=attack.rate/rapidMult
   }
  }
 }
}
function dealGlaiveHit(p,e){
 hitEnemy(e,p.damage+(e.type==='Ceramic'?(p.tower.ceramicBonus||0):0)+(e.isBlimp?(p.tower.bonusMoab||0):0),{tower:p.tower});
 if(e.alive&&e.isBlimp&&p.tower.paths[0]>=5){e.shredT=10;e.shredTick=e.shredTick||0;e.shredSource=sourceTowerForDamage(p.tower)}
}
function nextGlaiveTarget(p){
 return enemies.filter(e=>e.alive&&towerCanDamage(p.tower,e)&&(!p.hitTimes.has(e)||(p.tower.paths[0]>=5&&p.elapsed-p.hitTimes.get(e)>=.6))&&Math.hypot(e.mesh.position.x-p.mesh.position.x,e.mesh.position.z-p.mesh.position.z)<=p.bounceRange).sort((a,b)=>Math.hypot(a.mesh.position.x-p.mesh.position.x,a.mesh.position.z-p.mesh.position.z)-Math.hypot(b.mesh.position.x-p.mesh.position.x,b.mesh.position.z-p.mesh.position.z))[0];
}
function updateGlaiveRicochet(p,dt){
 p.elapsed+=dt;
 let travel=p.speed*dt;
 while(travel>0&&p.pierceLeft>0){
  if(!p.target?.alive||!towerCanDamage(p.tower,p.target))p.target=nextGlaiveTarget(p);
  if(!p.target){p.dead=true;break}
  const pos=p.target.mesh.position,dx=pos.x-p.mesh.position.x,dz=pos.z-p.mesh.position.z,d=Math.hypot(dx,dz);
  if(d<=travel+p.radius){
   p.mesh.position.x=pos.x;p.mesh.position.z=pos.z;travel=Math.max(0,travel-d);
   const e=p.target;p.hitTimes.set(e,p.elapsed);p.pierceLeft--;dealGlaiveHit(p,e);p.target=nextGlaiveTarget(p);
   if(!p.target)p.dead=true;
  }else{p.mesh.position.x+=dx/d*travel;p.mesh.position.z+=dz/d*travel;travel=0}
  if(p.dead)break;
 }
 p.mesh.rotation.y+=dt*18;
 if(p.pierceLeft<=0)p.dead=true;
}
function updateGlaiveLord(t,combatDt,visualDt){
 const hot=t.paths[2]>=2;
 if(!t.orbitGlaives||t.orbitVisualHot!==hot){
  for(const mesh of t.orbitGlaives||[])disposeTransientMesh(mesh);
  t.orbitGlaives=[];
  t.orbitVisualHot=hot;
  for(let i=0;i<3;i++){const mesh=makeProjectileMesh(hot?'hotLordGlaive':'lordGlaive');mesh.scale.setScalar(1.1);t.mesh.add(mesh);t.orbitGlaives.push(mesh)}
 }
 t.orbitAngle=(t.orbitAngle||0)+visualDt*3;
 t.orbitGlaives.forEach((mesh,i)=>{const angle=t.orbitAngle+i*Math.PI*2/3;mesh.position.set(Math.cos(angle)*2.3,1.55+Math.sin(angle*2)*.10,Math.sin(angle)*2.3);mesh.rotation.y+=visualDt*12});
 if(combatDt<=0)return;
 t.orbitTick=(t.orbitTick||0)+combatDt;
 const attack={...t,sourceTower:t,camoDetect:true,damageType:hot?'Heat':'Sharp'};
 while(t.orbitTick>=.08){
  t.orbitTick-=.08;
  for(const e of [...enemies])if(e.alive&&towerCanDamage(attack,e)&&Math.hypot(e.mesh.position.x-t.x,e.mesh.position.z-t.z)<=30*RANGE_SCALE)hitEnemy(e,2+(hot?1:0)+(e.type==='Ceramic'?8:0)+(e.isBlimp?5:0),{tower:t});
 }
}
function tickDominationBurns(e,dt){
 if(!e.burns)return;
 for(const burn of e.burns){
  const activeDt=Math.min(dt,burn.remaining);
  burn.remaining=Math.max(0,burn.remaining-dt);burn.tick+=activeDt;
  while(burn.tick>=1&&e.alive){burn.tick-=1;hitEnemy(e,burn.damage,{tower:burn.source,ignoreGlueAmp:true})}
  if(!e.alive)break;
 }
 e.burns=e.burns.filter(burn=>burn.remaining>0);
}
function explodeDominationKylie(p){
 const {explosionRadius,explosionDamage,burnDamage,burnDuration}=p.tuning;
 const attack={...p.tower,damageType:'Heat'};
 spawnAbilityPulse(p.mesh.position.x,p.mesh.position.z,0xff6626,explosionRadius);
 for(const e of [...enemies]){
  if(!e.alive||!towerCanDamage(attack,e)||Math.hypot(e.mesh.position.x-p.mesh.position.x,e.mesh.position.z-p.mesh.position.z)>explosionRadius)continue;
  hitEnemy(e,explosionDamage,{tower:p.tower});
  if(!e.alive)continue;
  const source=sourceTowerForDamage(p.tower);
  e.burns=e.burns||[];
  const burn=e.burns.find(b=>b.source===source);
  if(burn){burn.remaining=Math.max(burn.remaining,burnDuration);burn.damage=Math.max(burn.damage,burnDamage)}
  else e.burns.push({source,remaining:burnDuration,tick:0,damage:burnDamage});
 }
}
function finishKylieProjectile(p){
 if(p.dead)return;
 p.dead=true;
 if(p.explodes)explodeDominationKylie(p);
}
function updateKylieProjectile(p,dt){
 const end=Math.min(p.range*2,p.travel+p.speed*dt);
 while(p.travel<end&&p.pierceLeft>0){
  const previous={x:p.mesh.position.x,z:p.mesh.position.z};
  // Split at the turnaround and use short steps for accurate re-hit cooldowns.
  const legEnd=p.travel<p.range?p.range:p.range*2;
  const next=Math.min(end,legEnd,p.travel+p.speed*.025);
  p.elapsed+=(next-p.travel)/p.speed;p.travel=next;
  const along=p.travel<=p.range?p.travel:p.range*2-p.travel;
  p.mesh.position.x=p.origin.x+p.forward.x*along;p.mesh.position.z=p.origin.z+p.forward.z*along;
  const bounds=projectileBounds(previous,p.mesh.position,p.radius);
  for(const e of [...enemies]){
   if(p.pierceLeft<=0)break;
   if(!e.alive||!inProjectileBounds(e,bounds)||!towerCanDamage(p.tower,e)||(p.hitTimes.has(e)&&p.elapsed-p.hitTimes.get(e)<p.rehitCooldown-1e-9))continue;
   if(pointSegDist(e.mesh.position.x,e.mesh.position.z,previous,p.mesh.position)>p.radius)continue;
   p.hitTimes.set(e,p.elapsed);p.pierceLeft--;
   hitEnemy(e,e.isBlimp?p.moabDamage:p.damage,{tower:p.tower});
   if(e.alive&&e.isBlimp&&e.type!=='BAD'&&p.knockback>0){moveEnemyBackward(e,p.knockback);placeEnemyOnTrack(e)}
  }
 }
 p.mesh.rotation.y+=dt*18;
 if(p.travel>=p.range*2||p.pierceLeft<=0)finishKylieProjectile(p);
}
function boomerArcPosition(p,angle){
 const along=p.arcRadius*(1-Math.cos(angle)),side=p.hand*p.arcRadius*Math.sin(angle);
 return {x:p.origin.x+p.forward.x*along-p.forward.z*side,z:p.origin.z+p.forward.z*along+p.forward.x*side};
}
function updateBoomerArc(p,dt){
 const end=Math.min(Math.PI*2,p.angle+p.speed*dt/p.arcRadius);
 while(p.angle<end&&p.pierceLeft>0){
  const previous=boomerArcPosition(p,p.angle);
  p.angle=Math.min(end,p.angle+.05);
  const next=boomerArcPosition(p,p.angle);
  p.mesh.position.x=next.x;p.mesh.position.z=next.z;
  const bounds=projectileBounds(previous,next,p.radius);
  for(const e of enemies){
   if(p.pierceLeft<=0)break;
   if(!e.alive||!inProjectileBounds(e,bounds)||p.hitEnemies.has(e)||!towerCanDamage(p.tower,e))continue;
   if(pointSegDist(e.mesh.position.x,e.mesh.position.z,previous,next)<p.radius){
    p.hitEnemies.add(e);p.pierceLeft--;
    hitEnemy(e,p.damage+(e.isBlimp?p.tower.bonusMoab||0:0),{tower:p.tower});
   }
  }
 }
 p.mesh.rotation.y+=dt*18;
 if(p.angle>=Math.PI*2||p.pierceLeft<=0)p.dead=true;
}
function bombStunMotionDt(e,dt){
 const stopped=e.type==='BAD'?0:Math.min(dt,e.bombStunT||0);
 e.bombStunT=Math.max(0,(e.bombStunT||0)-dt);
 return dt-stopped;
}
function applyBombControl(t,e){
 if(!e.alive||e.type==='BAD')return;
 if(t.stun&&(!e.isBlimp||t.stunBlimps))e.bombStunT=Math.max(e.bombStunT||0,t.stun);
 const distance=e.isBlimp?t.bombMoabKnockback:t.bombKnockback;
 if(distance){moveEnemyBackward(e,distance);placeEnemyOnTrack(e);}
}
function damageBombFamily(p,e,damage,initial=true){
 if(!e.alive||p.hitEnemies.has(e)||!towerCanDamage(p.tower,e))return;
 if(p.clusterStage===2&&(p.thirdHitLedger.get(e)||0)>=bombClusterTuning.maxThirdStageHits)return;
 p.hitEnemies.add(e);
 if(p.clusterStage===2)p.thirdHitLedger.set(e,(p.thirdHitLedger.get(e)||0)+1);
 const result=hitEnemy(e,damage,{tower:p.tower,ignoreGlueAmp:!initial});
 if(e.alive)applyBombControl(p.tower,e);
 for(const child of result?.children||[]){
  if(result.remainingDamage>0)damageBombFamily(p,child,Math.min(result.remainingDamage,bombHitDamage(p,child)),false);
  else if(towerCanDamage(p.tower,child)){p.hitEnemies.add(child);applyBombControl(p.tower,child);}
 }
}
function bombHitDamage(p,e){
 const bonus=p.visualType==='bombFrag'?(e.isBlimp?p.tower.fragMoabBonus||0:0):(e.isBlimp?p.tower.bonusMoab||0:e.type==='Ceramic'?p.tower.ceramicBonus||0:0);
 return p.damage+bonus;
}
function spawnBombFragments(p,position){
 const stats=p.tower.fragStats;if(!stats)return;
 // Sharp attacks have independent pierce/lifetime and do not explode or stun.
 const attack={...p.tower,sourceTower:sourceTowerForDamage(p.tower),damageType:'Sharp',stun:0,stunBlimps:false,bombKnockback:0,bombMoabKnockback:0,fragMoabBonus:stats.moabBonus||0};
 const offset=Math.atan2(position.z-p.tower.z,position.x-p.tower.x);
 for(let i=0;i<stats.count;i++)fireLinearProjectile(attack,offset+i*Math.PI*2/stats.count,{visualType:'bombFrag',cosmetic:false,origin:position,damage:stats.damage,pierce:stats.pierce,life:stats.life,speed:bombFragmentTuning.speed,radius:.18});
}
function spawnBombClusters(p,position,stage=1){
 const tuning=bombClusterTuning,ledger=p.thirdHitLedger||new Map();
 const spread=tuning.spread*(p.recursive?1.5:1);
 for(let i=0;i<tuning.count;i++){
  const angle=i*Math.PI*2/tuning.count,mesh=makeProjectileMesh('bomb');mesh.scale.setScalar(stage===1?.7:.5);
  mesh.position.set(position.x,1.6,position.z);scene.add(mesh);
  projectiles.push({mesh,tower:p.tower,type:'bomb',visualType:'bomb',mode:'bombCluster',damage:p.damage,
   clusterStage:stage,recursive:p.recursive,thirdHitLedger:ledger,elapsed:0,
   origin:{x:position.x,z:position.z},destination:{x:position.x+Math.cos(angle)*spread,z:position.z+Math.sin(angle)*spread},
   splash:p.recursive?tuning.recursiveRadius:tuning.radius,pierce:tuning.pierce});
 }
}
function updateBombCluster(p,dt){
 p.elapsed+=dt;const fraction=Math.min(1,p.elapsed/bombClusterTuning.flightTime);
 p.mesh.position.set(p.origin.x+(p.destination.x-p.origin.x)*fraction,1.6+Math.sin(fraction*Math.PI)*.8,p.origin.z+(p.destination.z-p.origin.z)*fraction);
 p.mesh.rotation.x+=dt*12;
 if(fraction>=1){spawnImpactVisual(p,p.mesh.position);explodeBomb(p,p.mesh.position);p.dead=true;}
}
function explodeBomb(p,position){
 p.hitEnemies=new Set();
 const candidates=[p.target,...enemies.filter(e=>e!==p.target)],radius=p.splash;
 let hits=0;
 for(const e of candidates){
  if(hits>=p.pierce)break;
  if(!e?.alive||p.hitEnemies.has(e)||!towerCanDamage(p.tower,e)||Math.hypot(e.mesh.position.x-position.x,e.mesh.position.z-position.z)>radius)continue;
  if(p.clusterStage===2&&(p.thirdHitLedger.get(e)||0)>=bombClusterTuning.maxThirdStageHits)continue;
  damageBombFamily(p,e,bombHitDamage(p,e));hits++;
 }
 if(p.mode==='bombCluster'){
  if(p.recursive&&p.clusterStage===1)spawnBombClusters(p,position,2);
 }else if(p.tower.paths[2]>=3)spawnBombClusters(p,position);
 else spawnBombFragments(p,position);
}
function updateProjectiles(dt){
 const frameProjectiles=[...projectiles];
 for(const p of frameProjectiles){
  if(p.mode==='iceBomb'){updateIceProjectile(p,dt);continue;}
  if(p.mode==='infernoMeteor'){updateInfernoMeteorProjectile(p,dt);continue;}
  if(p.mode==='bombCluster'){updateBombCluster(p,dt);continue;}
  if(p.mode==='kylie'){updateKylieProjectile(p,dt);continue}
  if(p.mode==='ricochet'&&p.type==='boomer'){updateGlaiveRicochet(p,dt);continue}
  if(p.mode==='boomerArc'){updateBoomerArc(p,dt);continue}
  if(p.mode==='ricochet'){updateRicochet(p,dt);continue;}
  if(p.visualType==='missile'||p.visualType?.startsWith('bombMissile')){const flame=p.mesh.userData.exhaust||(p.visualType==='missile'?p.mesh.children.at(-1):null);if(flame)flame.scale.setScalar(.8+Math.sin(animationTime*45)*.2);}
  if(p.visualType==='glue')p.mesh.scale.y=.85+Math.sin(animationTime*20)*.13;
  if(p.visualType==='plasma')p.mesh.rotation.z+=dt*8;
  if(p.mode==='linear'){
   const realTack=p.type==='tack'&&!p.cosmetic;
   const travelDt=p.type==='glue'||p.type==='dart'||p.type==='iceShard'||p.visualType==='bombFrag'||realTack?Math.min(dt,Math.max(0,p.life)):dt;
   p.life-=dt;
   const previous={x:p.mesh.position.x,z:p.mesh.position.z};
   p.mesh.position.x+=p.vx*travelDt;
   p.mesh.position.z+=p.vz*travelDt;
   if(p.mesh.children?.length&&p.type!=='dart'&&p.type!=='glue')p.mesh.rotation.y+=dt*14;
   if(!p.cosmetic){
    const bounds=projectileBounds(previous,p.mesh.position,p.radius||.45);
    const collisionEnemies=realTack||p.type==='glue'?enemies.filter(e=>e.alive&&inProjectileBounds(e,bounds)).sort((a,b)=>Math.hypot(a.mesh.position.x-previous.x,a.mesh.position.z-previous.z)-Math.hypot(b.mesh.position.x-previous.x,b.mesh.position.z-previous.z)):enemies;
    for(const e of collisionEnemies){
     if(p.pierceLeft<=0)break;
     if(!e.alive||!inProjectileBounds(e,bounds)||p.hitEnemies.has(e)||!towerCanDamage(p.tower,e))continue;
     if(pointSegDist(e.mesh.position.x,e.mesh.position.z,previous,p.mesh.position)<(p.radius||.45)){
      if(p.visualType==='bombFrag')damageBombFamily(p,e,bombHitDamage(p,e));
      else if(p.type==='tack')damageTackFamily(p,e,p.damage+(e.isBlimp?p.tower.bonusMoab||0:0));
      else if(p.type==='glue'){if(p.glueSplash)explodeGlueSplatter(p,{x:e.mesh.position.x,y:1.4,z:e.mesh.position.z});else hitGlueTarget(p.tower,e);}
      else hitEnemy(e,p.damage,{tower:p.tower,slow:p.slow,slowDuration:p.slowDuration,freeze:p.freeze,glue:p.type==='glue',glueLayers:p.tower.glueLayers,glueDps:p.tower.glueDps,allowBlimpSlow:p.type==='glue'&&p.tower?.moabGlue});
      p.hitEnemies.add(e);p.pierceLeft--;
     }
    }
   }
   if(p.life<=0||Math.abs(p.mesh.position.x)>MAP_W/2+3||Math.abs(p.mesh.position.z)>MAP_H/2+3||(!p.cosmetic&&p.pierceLeft<=0))p.dead=true;
   continue;
  }
  if(p.type==='dart'){p.life-=dt;if(p.life<=0){p.dead=true;continue;}}
  if(!p.target?.alive&&p.abilityMissile)p.target=strongestBlimp();
  if(!p.target?.alive&&p.type==='dart'&&p.tower.shots>=3)p.target=chooseTarget(p.tower);
  if(!p.target?.alive){p.dead=true;continue}
  const motion=p.logicalPosition||p.mesh.position;
  const dx=p.target.mesh.position.x-motion.x,dz=p.target.mesh.position.z-motion.z,d=Math.hypot(dx,dz),step=p.speed*dt;
  if(p.mode==='boomer'){
   p.travel+=dt;
   p.mesh.rotation.y+=dt*18;p.mesh.rotation.z+=dt*4;
   // Side-to-side curve makes the rang visibly loop while it closes on the target.
   if(d>0.001){const px=-dz/d,pz=dx/d;const wave=Math.sin(p.travel*9+p.curvePhase)*step*.72;p.mesh.position.x+=px*wave;p.mesh.position.z+=pz*wave;}
  }
  if(d<step+.5){
   if(p.cosmetic){p.dead=true;continue}
   const hitPos=p.target.mesh.position.clone();spawnImpactVisual(p,hitPos);
   if(p.type==='bomb'&&!p.abilityMissile){explodeBomb(p,hitPos);p.dead=true;continue;}
   const crossbow=p.type==='dart'&&p.tower.paths[2]>=3;
   if(crossbow)p.hitEnemies=new Set();
   if(p.abilityMissile||towerCanDamage(p.tower,p.target)){const dealt=p.damage+(p.abilityMissile?0:((p.target.isBlimp&&p.tower.bonusMoab)||0));if(crossbow)damageBallFamily(p,p.target,dealt);else hitEnemy(p.target,dealt,{tower:p.tower,slow:p.slow,slowDuration:p.slowDuration,freeze:p.freeze,glue:p.type==='glue',glueLayers:p.tower.glueLayers,glueDps:p.tower.glueDps,allowBlimpSlow:p.type==='glue'&&p.tower?.moabGlue});}
   if(p.abilityMissile)spawnAbilityPulse(hitPos.x,hitPos.z,0xff8540,3);
   if(p.splash){let hits=1;for(const e of enemies){if(hits>=p.pierce)break;if(e.alive&&e!==p.target&&towerCanDamage(p.tower,e)&&Math.hypot(e.mesh.position.x-hitPos.x,e.mesh.position.z-hitPos.z)<p.splash){hitEnemy(e,p.damage,{tower:p.tower});hits++}}}
   else if(p.pierce>1){let hits=1;for(const e of enemies){if(hits>=p.pierce)break;if(e.alive&&e!==p.target&&!p.hitEnemies?.has(e)&&towerCanDamage(p.tower,e)&&Math.hypot(e.mesh.position.x-hitPos.x,e.mesh.position.z-hitPos.z)<2.2){if(crossbow)damageBallFamily(p,e,p.damage);else hitEnemy(e,p.damage,{tower:p.tower,slow:p.slow,slowDuration:p.slowDuration,freeze:p.freeze,glue:p.type==='glue',glueLayers:p.tower.glueLayers,glueDps:p.tower.glueDps,allowBlimpSlow:p.type==='glue'&&p.tower?.moabGlue});hits++}}}
   p.dead=true;
  }else{
   motion.x+=dx/d*step;
   motion.z+=dz/d*step;
   if(p.mode!=='boomer')p.mesh.rotation.y=Math.atan2(dx,dz);
   if(p.mesh.children?.length&&p.tower?.type==='dart'&&(p.tower.paths?.[0]||0)>=3){p.mesh.rotation.x+=dt*10;p.mesh.rotation.z+=dt*8;}
   if((p.target.mesh.position.y||0)>p.mesh.position.y-.2)p.mesh.position.y=1.8+Math.sin(performance.now()/90)*.15;
   if(p.mesh.geometry?.type==='OctahedronGeometry'){p.mesh.rotation.x+=dt*12;p.mesh.rotation.z+=dt*10;p.mesh.position.y=1.65+Math.sin(performance.now()/80)*.08}
   else p.mesh.position.y=1.8+Math.sin(performance.now()/90)*.15;
   if(p.logicalPosition){
    p.flightTime+=dt;const launchFade=Math.max(0,1-p.flightTime/.16);
    p.mesh.position.x=motion.x+p.launchOffset.x*launchFade;p.mesh.position.z=motion.z+p.launchOffset.z*launchFade;
    p.mesh.position.y+=p.launchOffset.y*launchFade;
   }
  }
 }
 for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].dead){disposeTransientMesh(projectiles[i].mesh);projectiles.splice(i,1)}
}

function buildRound(n){
 const q=[],groups=exactRoundData[n]||[];
 const addGroup=(count,raw,groupIndex)=>{
  const spec=normalizeSpawnName(raw);
  let gap=.2;
  if(blimpStats[spec.type])gap=spec.type==='DDT'?.22:.72;
  else if(count>=120)gap=.045;
  else if(count>=60)gap=.075;
  else if(count>=30)gap=.11;
  else if(count<=6)gap=.32;
  if(n===63&&spec.type==='Ceramic')gap=.035;
  if(n===76&&spec.type==='Ceramic')gap=.025;
  if(n===78&&spec.type==='Ceramic')gap=.035;
  if(n===79&&spec.type==='Rainbow')gap=.025;
  for(let i=0;i<count;i++)q.push({spec:{...spec},gap:(i===count-1&&groupIndex<groups.length-1)?Math.max(gap,.55):gap});
 };
 groups.forEach(([count,name],i)=>addGroup(count,name,i));
 return q;
}
function beginRound(){if(roundActive||gameEnded)return;autoStartTimer=0;roundActive=true;spawnQueue=buildRound(round);spawnTimer=0;startBtn.disabled=true;startBtn.textContent='Round Running';updateUI()}
function spawnStep(dt){
 if(!roundActive){
  if(autoStart&&autoStartTimer>0&&!gameEnded){autoStartTimer-=dt;if(autoStartTimer<=0)beginRound()}
  return;
 }
 if(spawnQueue.length){spawnTimer-=dt;if(spawnTimer<=0){const s=spawnQueue.shift();spawnEnemy(s.spec);spawnTimer=s.gap}}
 else if(!enemies.length){
  roundActive=false;endRoundAcidPuddles();cash+=100+round;
  if(round>=100){endGame(true);return}
  round++;startBtn.disabled=false;startBtn.textContent='Start Round';
  if(autoStart){autoStartTimer=.8;startBtn.textContent='Next round soon…'}
  updateUI();if(selectedTower)refreshSelected();
 }
}
startBtn.addEventListener('click',beginRound);
autoBtn.addEventListener('click',()=>{autoStart=!autoStart;autoBtn.textContent='Auto Start: '+(autoStart?'On':'Off');autoBtn.classList.toggle('active',autoStart);if(autoStart&&!roundActive&&!gameEnded)autoStartTimer=.35;else if(!autoStart)autoStartTimer=0});
speedBtn.addEventListener('click',()=>{speed=speed===1?2:speed===2?3:1;speedBtn.textContent='Speed ×'+speed});
restartBtn.addEventListener('click',()=>location.reload());
function endGame(win){gameEnded=true;roundActive=false;endScreen.classList.remove('hidden');endTitle.textContent=win?'Round 100 cleared!':'Game Over';endText.textContent=win?'You survived all 100 rounds.':'The balloons made it through the meadow.';refreshAbilityUI()}

let last=performance.now();function loop(now){const dt=Math.min(.04,(now-last)/1000)*speed;last=now;animationTime+=dt;if(!gameEnded){spawnStep(dt);moveEnemies(dt);updateTowers(dt);updateProjectiles(dt);updateAcidPuddles(dt);updateVisualEffects(dt)}abilityUiTimer-=dt;if(abilityUiTimer<=0){abilityUiTimer=.12;if(selectedTower)refreshSelected();else refreshAbilityUI()}flushUI();bloonRenderer.flush();freezeMarkerRenderer.flush();icicleMarkerRenderer.flush();acidPuddleRenderer.flush();renderer.render(scene,camera);requestAnimationFrame(loop)}
updateUI();flushUI();refreshAbilityUI();requestAnimationFrame(loop);
} catch (err) {
 console.error(err);
 const box=document.createElement('div');
 box.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99;background:#171d18ee;color:white;border:2px solid #ffffff55;border-radius:14px;padding:18px 22px;max-width:520px;font:700 14px system-ui;line-height:1.45;text-align:center';
 box.textContent='3D renderer failed to start. Enable WebGL in your browser and reload. Error: '+(err&&err.message?err.message:String(err));
 document.getElementById('gameWrap')?.appendChild(box);
}
})();
