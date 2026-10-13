export const gameModes={
 easy:{key:'easy',label:'Easy',lives:200,startRound:1,endRound:40,costMultiplier:.85,bloonSpeed:1},
 medium:{key:'medium',label:'Normal',lives:150,startRound:1,endRound:60,costMultiplier:1,bloonSpeed:1.1},
 hard:{key:'hard',label:'Hard',lives:100,startRound:3,endRound:80,costMultiplier:1.08,bloonSpeed:1.25}
};
export function getGameMode(key='medium',legacy=false,variant='standard'){
 if(!Object.hasOwn(gameModes,key))throw Error('Unknown difficulty');
 const branchParents={deflation:'easy',sandbox:'easy',reverse:'medium',apopalypse:'medium'};
 if(variant!=='standard'&&(!Object.hasOwn(branchParents,variant)||key!==branchParents[variant]||legacy))throw Error('Invalid mode branch');
 const mode={...gameModes[key],legacy:false,variant,startCash:650};
 if(legacy){if(key!=='medium')throw Error('Invalid legacy difficulty');return {...mode,lives:100,endRound:100,bloonSpeed:1,legacy:true};}
 if(variant==='deflation')return {...mode,label:'Deflation',startRound:31,endRound:60,startCash:20000};
 if(variant==='sandbox')return {...mode,label:'Easy Sandbox',lives:999999,endRound:999,startCash:9999999};
 if(variant==='reverse')return {...mode,label:'Reverse'};
 if(variant==='apopalypse')return {...mode,label:'Apopalypse'};
 return mode;
}
export function modePrice(price,mode){return mode.costMultiplier===1?price:Math.max(5,Math.ceil(price*mode.costMultiplier/5-.5-1e-9)*5);}
const basePrices=new WeakMap();
export function applyModePrices(definitions,upgrades,mode){
 if(!basePrices.has(definitions))basePrices.set(definitions,{towers:Object.fromEntries(Object.entries(definitions).map(([type,d])=>[type,d.cost])),upgrades:Object.fromEntries(Object.entries(upgrades).map(([type,paths])=>[type,paths.map(path=>path.map(u=>u[1]))]))});
 const base=basePrices.get(definitions);
 for(const [type,d] of Object.entries(definitions))d.cost=modePrice(base.towers[type],mode);
 for(const [type,paths] of Object.entries(upgrades))paths.forEach((path,p)=>path.forEach((u,tier)=>u[1]=modePrice(base.upgrades[type][p][tier],mode)));
}
export function modeBloonHealth(type,base,spawnRound,mode){return mode.variant!=='sandbox'&&!mode.legacy&&mode.key==='easy'&&type==='MOAB'&&spawnRound===40?133:base;}
export const MAP_MEDALS_KEY='meadow-btd6.map-medals';
export function createMapMedals(storage=()=>window.localStorage){
 const keys=['easy','medium','hard','deflation','reverse','apopalypse'];
 function read(){try{const raw=storage().getItem(MAP_MEDALS_KEY),saved=raw&&raw.length<=1000?JSON.parse(raw):{};return Object.fromEntries(keys.map(key=>[key,saved[key]===true]));}catch{return Object.fromEntries(keys.map(key=>[key,false]));}}
 return {read,award(key){if(!keys.includes(key))return false;try{storage().setItem(MAP_MEDALS_KEY,JSON.stringify({...read(),[key]:true}));return true;}catch{return false;}}};
}
