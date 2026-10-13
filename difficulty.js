export const gameModes={
 easy:{key:'easy',label:'Easy',lives:200,startRound:1,endRound:40,costMultiplier:.85,bloonSpeed:1},
 medium:{key:'medium',label:'Normal',lives:150,startRound:1,endRound:60,costMultiplier:1,bloonSpeed:1.1},
 hard:{key:'hard',label:'Hard',lives:100,startRound:3,endRound:80,costMultiplier:1.08,bloonSpeed:1.25}
};
export function getGameMode(key='medium',legacy=false){
 if(!Object.hasOwn(gameModes,key))throw Error('Unknown difficulty');
 if(legacy){if(key!=='medium')throw Error('Invalid legacy difficulty');return {...gameModes.medium,lives:100,endRound:100,bloonSpeed:1,legacy:true};}
 return {...gameModes[key],legacy:false};
}
export function modePrice(price,mode){return mode.costMultiplier===1?price:Math.max(5,Math.ceil(price*mode.costMultiplier/5-.5-1e-9)*5);}
const basePrices=new WeakMap();
export function applyModePrices(definitions,upgrades,mode){
 if(!basePrices.has(definitions))basePrices.set(definitions,{towers:Object.fromEntries(Object.entries(definitions).map(([type,d])=>[type,d.cost])),upgrades:Object.fromEntries(Object.entries(upgrades).map(([type,paths])=>[type,paths.map(path=>path.map(u=>u[1]))]))});
 const base=basePrices.get(definitions);
 for(const [type,d] of Object.entries(definitions))d.cost=modePrice(base.towers[type],mode);
 for(const [type,paths] of Object.entries(upgrades))paths.forEach((path,p)=>path.forEach((u,tier)=>u[1]=modePrice(base.upgrades[type][p][tier],mode)));
}
export function modeBloonHealth(type,base,spawnRound,mode){return !mode.legacy&&mode.key==='easy'&&type==='MOAB'&&spawnRound===40?133:base;}
export const MAP_MEDALS_KEY='meadow-btd6.map-medals';
export function createMapMedals(storage=()=>window.localStorage){
 function read(){try{const raw=storage().getItem(MAP_MEDALS_KEY);if(!raw||raw.length>1000)return {easy:false,medium:false,hard:false};const saved=JSON.parse(raw);return {easy:saved.easy===true,medium:saved.medium===true,hard:saved.hard===true};}catch{return {easy:false,medium:false,hard:false};}}
 return {read,award(key){if(!Object.hasOwn(gameModes,key))return false;try{storage().setItem(MAP_MEDALS_KEY,JSON.stringify({...read(),[key]:true}));return true;}catch{return false;}}};
}
