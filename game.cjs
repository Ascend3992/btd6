const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','..','game.js'),'utf8');
const visuals=fs.readFileSync(path.join(__dirname,'..','..','boomerang-visuals.js'),'utf8');

// Exercise the game's existing combat functions without requiring a WebGL context.
function game(){
 const context={RANGE_SCALE:.32,meadowDepthScale:1,towers:[],enemies:[],projectiles:[],roundActive:true,gameEnded:false,selectedTower:null,
  round:1,cash:0,lives:100,MAP_W:100,MAP_H:100,nextTowerId:1,animationTime:0,performance:{now:()=>0},
  updateTowerAppearance(){},setFanVisual(){},disposeTransientMesh(){},refreshAbilityUI(){},toastMsg(){},spawnAbilityPulse(){},setAbilityHalo(){},
  iceMuzzleOrigin:t=>({x:t.x,y:1.8,z:t.z}),addIcicles(){},clearIcicles(){},
  animateTower(){},animateTack(){},animateIce(){},aimTower(){},spawnIceAuraVisual(){},spawnArrowRainVisual(){},spawnImpactVisual(){},ensureFreezeMarker(){},
  updateUI(){},ensureGlueMarker(){},destroyEnemyAndSpawnChildren(e){e.alive=false},
  PATH:Array.from({length:10},()=>({distanceTo:()=>10})),
  trackDistances:Array.from({length:10},(_,i)=>i*10),
  placeEnemyOnTrack(e){e.mesh.position.x=e.seg*10+e.dist;e.mesh.position.z=0},
  scene:{add(){}},makeTowerMesh:mesh,makeProjectileMesh:mesh};
 vm.createContext(context);
 // Use the real visual selectors and throw hooks; mock meshes simply have no rig.
 for(const [start,end] of [['export function boomerangProjectileKind','export function makeBoomerangWeapon'],['export function triggerBoomerangThrow',null]]){
  const from=visuals.indexOf(start),to=end?visuals.indexOf(end,from):visuals.length;
  vm.runInContext(visuals.slice(from,to).replaceAll('export function','function'),context);
 }
 function include(start,end){
  const from=source.indexOf(start),to=source.indexOf(end,from);
  if(from<0||to<0)throw Error(`Missing game function boundary: ${start} / ${end}`);
  vm.runInContext(source.slice(from,to),context);
 }
 include('const bloonSpeeds=','const exactRoundData=');
 include('const upgradeData=','const upgradeDescriptions=');
 include('const iceTopTuning=','const renderer=');
 include('function createTower(','function damageTypeNotes(');
 include('function getTowerAbilities(','function refreshAbilityUI(');
 include('function setFanBoostTier(','function strongestBlimp(');
 include('function strongestBlimp(','function emitMaelstrom(');
 include('function emitMaelstrom(','function coatMapWithGlue(');
 include('function applyMapIceFreeze(','function loseLives(');
 include('function loseLives(','function pointSegDist(');
 include('function syncDartStats(','function applyUpgrade(');
 include('function applyUpgrade(','upgradeBtns.forEach((b,p)=>b.addEventListener');
 include('function pointSegDist(','function placeTower(');
 include('function progress(','function enemySpeed(');
 include('function enemySpeed(','function leakDamage(');
 include('function updateRegrow(','function towerCanDamage(');
 include('function tierFiveTaken(','function refreshSelected(');
 include('function applyBallKnockback(','function updateRicochet(');
 include('function towerCanDamage(','function ensureGlueMarker(');
 include('function moveEnemyBackward(','function makeProjectileMesh(');
 include('function fireProjectile(','function fireLinearProjectile(');
 include('function fireLinearProjectile(','function spawnTackVolleyVisual(');
 include('function spawnTackVolleyVisual(','function spawnIceAuraVisual(');
 include('function updateMOABPress(','function dealGlaiveHit(');
 context.spawnTackFlameVisual=()=>{};context.visualEffects=[];
 include('function dealGlaiveHit(','function buildRound(');
 return context;
}
function position(x=0,y=0,z=0){return {x,y,z,set(x,y,z){Object.assign(this,{x,y,z})},clone(){return position(this.x,this.y,this.z)}}}
function mesh(){return {position:position(),rotation:{x:0,y:0,z:0},scale:{setScalar(){},set(){}},userData:{},children:[],traverse(callback){callback(this)},add(){}}}
function upgrade(g,t,p){const tier=t.paths[p]++;g.applyUpgrade(t,p,tier)}
function enemy(x,type='Red',hp=10000){return {alive:true,type,isBlimp:['MOAB','BFB','ZOMG','DDT','BAD'].includes(type),layer:['Red','Blue','Green','Yellow','Pink','Black','White','Purple','Lead','Zebra','Rainbow','Ceramic'].indexOf(type),hp,glueDamageAmp:0,seg:Math.floor(x/10),dist:x%10,mesh:{position:position(x,0,0)}}}
module.exports={game,mesh,upgrade,enemy};
