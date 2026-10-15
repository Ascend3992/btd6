// Round checkpoints, with logical live Bloons for continuous Apopalypse. Never meshes or projectiles.
import {getGameMode} from './difficulty.js?v=5';
import {heroXPAtLevel,heroXPProgress} from './hero-xp.js?v=1';
import {captureApopalypse,validateApopalypse} from './apopalypse-save.js?v=1';
export const RUN_SAVE_KEY='meadow-btd6.saved-run';
const SAVE_VERSION=5,MAP_VERSION='meadow-reference-v1',MAX_BYTES=2_000_000;
const runtimeFields=['damageDealt','cool','pressCool','shotCounter','critShotCounter','bombShotCounter','meteorCool','orbitTick','abilityCd','blitzCd','abilityTimer','abilityTick','abilityAngle','rapidCd','rapidTimer','stormCd','stormTimer','stormTick','stormClock'];
const signedFields=new Set(['cool','pressCool','meteorCool','abilityTick','abilityAngle']);
function requireValue(value){if(!value)throw Error('Invalid saved run');}
function number(value,min=0,max=1e12){requireValue(Number.isFinite(value)&&value>=min&&value<=max);return value;}
function integer(value,min=0,max=1e12){requireValue(Number.isInteger(value));return number(value,min,max);}
function point(value,rules,margin=0){requireValue(value&&typeof value==='object');return {x:number(value.x,-rules.width/2-margin,rules.width/2+margin),z:number(value.z,-rules.height/2-margin,rules.height/2+margin)};}
function optionalId(value){return value==null?null:integer(value,1,1e9);}
export function validateRunSave(raw,rules){
 try{
  requireValue(raw&&[1,2,3,4,SAVE_VERSION].includes(raw.version)&&raw.map===MAP_VERSION);
  const difficulty=raw.version===1?'medium':raw.difficulty,legacyMode=raw.version===1?true:raw.legacyMode,variant=raw.version<3?'standard':raw.variant;requireValue(typeof difficulty==='string'&&typeof legacyMode==='boolean');const mode=getGameMode(difficulty,legacyMode,variant);requireValue(typeof variant==='string'&&(!['reverse','apopalypse'].includes(variant)||raw.version>=4));
  requireValue(Array.isArray(raw.towers)&&raw.towers.length<=1000);
  const ids=new Set(),tierFives=new Set();let heroes=0;
  const towers=raw.towers.map(saved=>{
   requireValue(saved&&Object.hasOwn(rules.definitions,saved.type));
   const id=integer(saved.id,1,1e9);requireValue(!ids.has(id));ids.add(id);
   const position=point(saved,rules),hero=!!rules.definitions[saved.type].hero;
   requireValue(Array.isArray(saved.paths)&&saved.paths.length===3);
   const paths=saved.paths.map(t=>integer(t,0,5));
   requireValue(paths.filter(t=>t>0).length<=2&&paths.filter(t=>t>2).length<=1);
   if(hero){requireValue(paths.every(t=>t===0)&&++heroes<=1);}
   if(rules.definitions[saved.type].support)requireValue(paths.every(t=>t===0));
   paths.forEach((tier,path)=>{if(tier===5){const key=saved.type+'-'+path;requireValue(!tierFives.has(key));tierFives.add(key);}});
   requireValue(['first','last','strong','close'].includes(saved.target));
   requireValue(saved.throwHand===1||saved.throwHand===-1);
   requireValue(typeof saved.camoPriority==='boolean');
   const runtime={};requireValue(saved.runtime&&typeof saved.runtime==='object'&&!Array.isArray(saved.runtime));
   for(const key of ['damageDealt','cool','abilityCd','blitzCd','abilityTimer','rapidCd','rapidTimer','stormCd','stormTimer'])number(saved.runtime[key],signedFields.has(key)?-1e12:0);
   for(const key of runtimeFields)if(saved.runtime[key]!==undefined)runtime[key]=number(saved.runtime[key],signedFields.has(key)?-1e12:0);
   requireValue(Array.isArray(saved.fanBuffs)&&saved.fanBuffs.length<=1000);
   const fanBuffs=saved.fanBuffs.map(buff=>{requireValue(buff&&(buff.tier===4||buff.tier===5));return {sourceId:integer(buff.sourceId,1,1e9),tier:buff.tier,remaining:number(buff.remaining,0,1e6)};});
   const activeAbilityKey=saved.activeAbilityKey??null;requireValue(activeAbilityKey===null||activeAbilityKey==='primary'&&!hero&&paths[1]>=4);
   const activeAbilityTier=saved.activeAbilityTier??null;requireValue(activeAbilityKey===null?activeAbilityTier===null:(activeAbilityTier===4||activeAbilityTier===5)&&activeAbilityTier<=paths[1]);
   requireValue(!(runtime.abilityTimer>0)||activeAbilityKey==='primary');
   let stormStats=null;if(saved.stormStats){requireValue(hero);stormStats={};for(const key of ['chance','damage','moabBonus','ceramicBonus','cooldown'])stormStats[key]=number(saved.stormStats[key],0,key==='chance'?1:1000);}
   const placementSurface=saved.placementSurface??'land';requireValue(['land','water'].includes(placementSurface));
   const level=integer(saved.level,hero?1:0,hero?20:0),heroXP=hero?(raw.version<3?heroXPAtLevel(level):integer(saved.heroXP)):0;requireValue(!hero||heroXPProgress(heroXP).level===level);
   const heroLevelSpend=integer(saved.heroLevelSpend??0,0,1e12);requireValue(hero||heroLevelSpend===0);
   return {id,type:saved.type,...position,paths,target:saved.target,throwHand:saved.throwHand,camoPriority:saved.camoPriority,
    level,heroXP,heroLevelSpend,rotationY:number(saved.rotationY,-1e12,1e12),runtime,fanBuffs,activeAbilityKey,activeAbilityTier,stormStats,
    stormCenter:saved.stormCenter==null?null:point(saved.stormCenter,rules,10),placementSurface,frozenWaterSourceId:optionalId(saved.frozenWaterSourceId)};
  });
  requireValue(Array.isArray(raw.puddles)&&raw.puddles.length<=2000);
  const puddles=raw.puddles.map(saved=>{
   const position=point(saved,rules,10),sourceId=optionalId(saved.sourceId);requireValue(sourceId===null||ids.has(sourceId));requireValue(typeof saved.camoDetect==='boolean');
   return {...position,sourceId,camoDetect:saved.camoDetect,radius:number(saved.radius,.001,1000),life:number(saved.life),totalLife:number(saved.totalLife,.001),pierceLeft:number(saved.pierceLeft),damage:number(saved.damage),roundCarry:integer(saved.roundCarry,0,1)};
  });
  const usage={};requireValue(raw.usage&&typeof raw.usage==='object'&&!Array.isArray(raw.usage));
  for(const type of Object.keys(rules.definitions))usage[type]=integer(raw.usage[type]??0);
  requireValue(typeof raw.autoStart==='boolean'&&typeof raw.roundInProgress==='boolean');
  const selectedTowerId=optionalId(raw.selectedTowerId);requireValue(selectedTowerId===null||ids.has(selectedTowerId));
  const nextTowerId=integer(raw.nextTowerId,1,1e9);requireValue(towers.every(t=>t.id<nextTowerId&&t.fanBuffs.every(b=>b.sourceId<nextTowerId)&&(t.frozenWaterSourceId===null||t.frozenWaterSourceId<nextTowerId)));
  const sandbox=variant==='sandbox',apopalypse=variant==='apopalypse',chimps=variant==='chimps';requireValue(!['double-hp-moabs','half-cash','alternate','impoppable','chimps'].includes(variant)||raw.version===5);if(chimps)requireValue(typeof raw.chimpsClean==='boolean');if(chimps||variant==='impoppable')requireValue(raw.lives===1);requireValue(!apopalypse||raw.version>=4);const apop=apopalypse?validateApopalypse(raw.apop,{round:raw.round,pathLengths:rules.pathLengths,towerIds:ids,puddleCount:puddles.length,active:raw.roundInProgress}):null;
  return {version:SAVE_VERSION,map:MAP_VERSION,difficulty,legacyMode,variant,apop,chimpsClean:chimps?raw.chimpsClean:false,sandboxLivesTarget:sandbox?integer(raw.sandboxLivesTarget,0,9999999):0,savedAt:number(raw.savedAt,0,1e15),round:integer(raw.round,mode.startRound,mode.endRound),lives:number(raw.lives,sandbox?0:.001,sandbox?9999999:1e9),cash:number(raw.cash,0,sandbox?9999999:1e12),speed:integer(raw.speed,1,3),autoStart:sandbox||apopalypse?false:raw.autoStart,roundInProgress:sandbox?false:raw.roundInProgress,
   effectsVolume:number(raw.effectsVolume,0,1),musicVolume:number(raw.musicVolume,0,1),absoluteZeroBuffT:number(raw.absoluteZeroBuffT,0,10),nextTowerId,selectedTowerId,towers,puddles,usage};
 }catch{return null;}
}
export function captureRunSave(state,rules){
 const apop=state.variant==='apopalypse'?captureApopalypse({...state.apop,enemies:state.enemies,puddles:state.puddles,towers:state.towers}):null;
 const raw={apop,chimpsClean:!!state.chimpsClean,version:SAVE_VERSION,map:MAP_VERSION,difficulty:state.difficulty||'medium',legacyMode:!!state.legacyMode,variant:state.variant||'standard',sandboxLivesTarget:state.sandboxLivesTarget??999999,savedAt:Date.now(),round:state.round,lives:state.lives,cash:state.cash,speed:state.speed,autoStart:state.autoStart,roundInProgress:!!state.roundInProgress,
  effectsVolume:state.effectsVolume,musicVolume:state.musicVolume,absoluteZeroBuffT:state.absoluteZeroBuffT,nextTowerId:state.nextTowerId,selectedTowerId:state.selectedTowerId??null,usage:state.usage,
  towers:state.towers.map(t=>{const runtime={};for(const key of runtimeFields)if(t[key]!==undefined)runtime[key]=t[key];return {id:t.id,type:t.type,x:t.x,z:t.z,paths:[...t.paths],target:t.target,throwHand:t.throwHand||1,camoPriority:!!t.camoPriority,level:t.level||0,rotationY:t.mesh.rotation.y,
    heroLevelSpend:t.type==='hero'?t.heroLevelSpend||0:0,heroXP:t.type==='hero'?Math.max(t.heroXP??0,heroXPAtLevel(t.level)):0,runtime,fanBuffs:t.fanBuffs.map(b=>({sourceId:b.sourceId,tier:b.tier,remaining:b.remaining})),activeAbilityKey:t.activeAbility?.key??null,activeAbilityTier:t.activeAbility?.tier??null,stormStats:t.stormStats??null,stormCenter:t.stormCenter?{x:t.stormCenter.x,z:t.stormCenter.z}:null,placementSurface:t.placementSurface||'land',frozenWaterSourceId:t.frozenWaterSourceId??null};}),
  puddles:state.puddles.filter(p=>p.life>0&&p.pierceLeft>0).map(p=>({x:p.x,z:p.z,radius:p.radius,life:p.life,totalLife:p.totalLife,pierceLeft:p.pierceLeft,damage:p.damage,roundCarry:p.roundCarry,sourceId:state.towers.some(t=>t===p.attack.sourceTower)?p.attack.sourceTower.id:null,camoDetect:!!p.attack.camoDetect}))};
 return validateRunSave(raw,rules);
}
export function createRunStorage({rules,storage=()=>window.localStorage,onError=()=>{},onSaved=()=>{}}){
 return {
  read(){
   try{const text=storage().getItem(RUN_SAVE_KEY);if(text===null)return null;
    const saved=text.length<=MAX_BYTES&&validateRunSave(JSON.parse(text),rules);if(!saved){onError('invalid');return null;}return saved;
   }catch(error){onError(error instanceof SyntaxError?'invalid':'unavailable');return null;}
  },
  write(state){
   const saved=validateRunSave(state,rules);if(!saved){onError('unavailable');return false;}
   try{const text=JSON.stringify(saved);if(text.length>MAX_BYTES){onError('unavailable');return false;}storage().setItem(RUN_SAVE_KEY,text);onSaved(saved);return true;}catch{onError('unavailable');return false;}
  },
  clear(){try{storage().removeItem(RUN_SAVE_KEY);return true;}catch{onError('unavailable');return false;}}
 };
}
