const apopTypes=['Red','Blue','Green','Yellow','Pink','Black','White','Purple','Lead','Zebra','Rainbow','Ceramic','MOAB','BFB','ZOMG','DDT','BAD'];
const apopEnemyFields=['knockbackT','knockbackSpeed','slowT','slowMult','freezeT','freezeLayers','abilityFreezeT','abilityFreezeLayers','abilitySlowT','abilitySlowMult','glueT','glueSlow','glueDamageAmp','glueAmpT','glueStrikeDamageAmp','glueVulnerableT','glueDps','glueCarry','glueLayers','glueLevel','gluePriority','glueStunT','bombStunT','permafrostLayers','permafrostSlow','brittleT','brittleDamage','regrowTimer','shredT','shredTick'];
const coatNumbers=['priority','remaining','slow','layers','interval','tick','damage','stuckSlow','stuckRemaining','relentlessTier','stunPierce','ceramicDamage','moabDamage','damageAmp','puddleTier'];
const coatFlags=['superGlue','suppressProperties','direct','camoDetect'];
const puddleNumbers=['radius','life','pierce','damage','roundCarry'];
function apopNeed(value){if(!value)throw Error('Invalid Apopalypse save');}
function apopNumber(value,min=0,max=1e12){apopNeed(Number.isFinite(value)&&value>=min&&value<=max);return value;}
function apopInteger(value,min=0,max=1e12){apopNeed(Number.isInteger(value));return apopNumber(value,min,max);}
function apopScalars(source,keys){return Object.fromEntries(keys.filter(key=>source[key]!==undefined).map(key=>[key,apopNumber(source[key]) ]));}
function apopFlags(source,keys){return Object.fromEntries(keys.map(key=>{apopNeed(typeof source[key]==='boolean');return [key,source[key]];}));}
export function captureApopalypse({seed,pendingRounds,queue,spawnTimer,enemies,puddles,towers}){
 const alive=enemies.filter(e=>e.alive),indexes=new Map(alive.map((e,i)=>[e,i]));
 const sourceId=source=>{const t=source?.sourceTower||source;return towers.includes(t)?t.id:null;};
 const hits=set=>[...(set||[])].filter(e=>indexes.has(e)).map(e=>indexes.get(e));
 return {seed,pendingRounds:[...pendingRounds],queue:queue.map(e=>({spec:{...e.spec},gap:e.gap})),spawnTimer,
  enemies:alive.map(e=>({type:e.type,camo:!!e.camo,regrow:!!e.regrow,fort:!!e.fort,superCeramic:!!e.superCeramic,spawnRound:e.spawnRound,seg:e.seg,dist:e.dist,laneOffset:e.laneOffset||0,hp:e.hp,maxHp:e.maxHp,maxLayer:e.maxLayer,regrowStack:[...e.regrowStack],glued:!!e.glued,runtime:Object.fromEntries(apopEnemyFields.filter(key=>e[key]!==undefined&&e[key]!==0).map(key=>[key,e[key]])),glueSourceId:sourceId(e.glueSource),shredSourceId:sourceId(e.shredSource),
   coatings:(e.glueCoatings||[]).filter(c=>c.remaining>0).map(c=>({key:c.key,...Object.fromEntries(coatNumbers.filter(k=>c[k]!==undefined).map(k=>[k,c[k]])),...Object.fromEntries(coatFlags.map(k=>[k,!!c[k]])),sourceId:sourceId(c.source),puddleSettings:c.puddleSettings?Object.fromEntries(puddleNumbers.map(k=>[k,c.puddleSettings[k]])):null})),
   burns:(e.burns||[]).filter(b=>b.remaining>0).map(b=>({sourceId:sourceId(b.source),remaining:b.remaining,tick:b.tick,damage:b.damage})),
   iceShards:e.iceShards?{sourceId:sourceId(e.iceShards.tower),count:e.iceShards.count,damage:e.iceShards.damage,pierce:e.iceShards.pierce,camoDetect:!!e.iceShards.camoDetect}:null,
   icicles:e.icicles?{sourceId:sourceId(e.icicles.attack),remaining:e.icicles.remaining,pierceLeft:e.icicles.pierceLeft,camoDetect:!!e.icicles.attack.camoDetect,hits:hits(e.icicles.hitEnemies)}:null})),
  puddleHits:puddles.filter(p=>p.life>0&&p.pierceLeft>0).map(p=>hits(p.hitEnemies))};
}
export function validateApopalypse(raw,{round,pathLengths,towerIds,puddleCount,active}){
 apopNeed(raw&&typeof raw==='object');const sourceId=id=>{if(id===null)return null;apopNeed(towerIds.has(id));return apopInteger(id,1,1e9);};
 apopNeed(Array.isArray(raw.pendingRounds)&&raw.pendingRounds.length<=60);const pendingRounds=raw.pendingRounds.map(r=>apopInteger(r,1,round));apopNeed(new Set(pendingRounds).size===pendingRounds.length);
 apopNeed(Array.isArray(raw.enemies)&&raw.enemies.length<=20000);const hitIds=list=>{apopNeed(Array.isArray(list)&&list.length<=raw.enemies.length);return [...new Set(list.map(id=>apopInteger(id,0,raw.enemies.length-1)))];};
 const enemies=raw.enemies.map(e=>{
  apopNeed(e&&apopTypes.includes(e.type)&&Array.isArray(e.regrowStack)&&e.regrowStack.length<=64&&e.regrowStack.every(type=>apopTypes.includes(type)));const spawnRound=apopInteger(e.spawnRound,1,round);apopNeed(pendingRounds.includes(spawnRound));
  const seg=apopInteger(e.seg,0,pathLengths.length-1),hp=apopNumber(e.hp,.001),maxHp=apopNumber(e.maxHp,hp);apopNeed(e.runtime&&typeof e.runtime==='object'&&!Array.isArray(e.runtime));
  apopNeed(Array.isArray(e.coatings)&&e.coatings.length<=64&&Array.isArray(e.burns)&&e.burns.length<=1000);
  const coatings=e.coatings.map(c=>{apopNeed(c&&typeof c.key==='string'&&c.key.length<=32);const numeric=apopScalars(c,coatNumbers);for(const key of ['remaining','slow','layers','interval','tick','damage'])apopNumber(c[key]);let puddleSettings=null;if(c.puddleSettings){puddleSettings=apopScalars(c.puddleSettings,puddleNumbers);for(const key of puddleNumbers)apopNumber(puddleSettings[key]);apopNeed(puddleSettings.radius>0&&puddleSettings.life>0);apopInteger(puddleSettings.roundCarry,0,1);}return {key:c.key,...numeric,...apopFlags(c,coatFlags),sourceId:sourceId(c.sourceId),puddleSettings};});
  const burns=e.burns.map(b=>({sourceId:sourceId(b.sourceId),remaining:apopNumber(b.remaining),tick:apopNumber(b.tick),damage:apopNumber(b.damage)}));
  const iceShards=e.iceShards?{sourceId:sourceId(e.iceShards.sourceId),count:apopInteger(e.iceShards.count,1,1000),damage:apopNumber(e.iceShards.damage),pierce:apopNumber(e.iceShards.pierce),...apopFlags(e.iceShards,['camoDetect'])}:null;
  const icicles=e.icicles?{sourceId:sourceId(e.icicles.sourceId),remaining:apopNumber(e.icicles.remaining),pierceLeft:apopNumber(e.icicles.pierceLeft),...apopFlags(e.icicles,['camoDetect']),hits:hitIds(e.icicles.hits)}:null;
  return {type:e.type,...apopFlags(e,['camo','regrow','fort','superCeramic','glued']),spawnRound,seg,dist:apopNumber(e.dist,0,pathLengths[seg]+1e-6),laneOffset:apopNumber(e.laneOffset,-100,100),hp,maxHp,maxLayer:e.maxLayer===null?null:apopInteger(e.maxLayer,0,11),regrowStack:[...e.regrowStack],runtime:apopScalars(e.runtime,apopEnemyFields),glueSourceId:sourceId(e.glueSourceId),shredSourceId:sourceId(e.shredSourceId),coatings,burns,iceShards,icicles};
 });
 apopNeed(Array.isArray(raw.queue)&&raw.queue.length<=20000);const queue=raw.queue.map(entry=>{const spec=entry.spec;apopNeed(spec&&apopTypes.includes(spec.type)&&spec.spawnRound===round&&pendingRounds.includes(round));return {spec:{type:spec.type,spawnRound:round,camo:!!spec.camo,regrow:!!spec.regrow,fort:!!spec.fort,superCeramic:!!spec.superCeramic},gap:apopNumber(entry.gap,0,100)};});
 apopNeed(Array.isArray(raw.puddleHits)&&raw.puddleHits.length===puddleCount);const puddleHits=raw.puddleHits.map(hitIds);if(!active)apopNeed(!enemies.length&&!queue.length&&!pendingRounds.length);
 return {seed:apopInteger(raw.seed,0,0xffffffff),pendingRounds,spawnTimer:apopNumber(raw.spawnTimer,-100,100),queue,enemies,puddleHits};
}
