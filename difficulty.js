export const gameModes={
 easy:{key:'easy',label:'Easy',lives:200,startRound:1,endRound:40,costMultiplier:.85,bloonSpeed:1},
 medium:{key:'medium',label:'Normal',lives:150,startRound:1,endRound:60,costMultiplier:1,bloonSpeed:1.1},
 hard:{key:'hard',label:'Hard',lives:100,startRound:3,endRound:80,costMultiplier:1.08,bloonSpeed:1.25}
};
export function getGameMode(key='medium',legacy=false,variant='standard'){
 if(!Object.hasOwn(gameModes,key))throw Error('Unknown difficulty');
 const branchParents={deflation:'easy',sandbox:'easy',reverse:'medium',apopalypse:'medium','double-hp-moabs':'hard','half-cash':'hard',alternate:'hard',impoppable:'hard',chimps:'hard'};
 if(variant!=='standard'&&(!Object.hasOwn(branchParents,variant)||key!==branchParents[variant]||legacy))throw Error('Invalid mode branch');
 const mode={...gameModes[key],legacy:false,variant,startCash:650,incomeMultiplier:1,blimpHealthMultiplier:1,canSell:true,extraIncome:true};
 if(legacy){if(key!=='medium')throw Error('Invalid legacy difficulty');return {...mode,lives:100,endRound:100,bloonSpeed:1,legacy:true};}
 if(variant==='deflation')return {...mode,label:'Deflation',startRound:31,endRound:60,startCash:20000};
 if(variant==='sandbox')return {...mode,label:'Easy Sandbox',lives:999999,endRound:999,startCash:9999999};
 if(variant==='reverse')return {...mode,label:'Reverse'};
 if(variant==='apopalypse')return {...mode,label:'Apopalypse'};
 if(variant==='double-hp-moabs')return {...mode,label:'Double HP MOABs',blimpHealthMultiplier:2};
 if(variant==='half-cash')return {...mode,label:'Half Cash',startCash:325,incomeMultiplier:.5};
 if(variant==='alternate')return {...mode,label:'Alternate Bloons Rounds',endRound:100};
 if(variant==='impoppable')return {...mode,label:'Impoppable',lives:1,startRound:6,endRound:100,costMultiplier:1.2};
 if(variant==='chimps')return {...mode,label:'CHIMPS',lives:1,startRound:6,endRound:100,canSell:false,extraIncome:false};
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
export function modeIncome(amount,kind,mode){return mode.variant==='deflation'||mode.extraIncome===false&&kind==='generated'?0:amount*(mode.incomeMultiplier??1);}
export function modeUnlocked(key,variant,wins){
 if(variant==='standard')return Object.hasOwn(gameModes,key);
 const parents={deflation:['easy','easy'],sandbox:['easy','easy'],reverse:['medium','medium'],apopalypse:['medium','medium'],'double-hp-moabs':['hard','hard'],'half-cash':['hard','double-hp-moabs'],alternate:['hard','hard'],impoppable:['hard','alternate'],chimps:['hard','impoppable']};
 const entry=parents[variant];return !!(entry&&entry[0]===key&&wins[entry[1]]);
}
export const MAP_MEDALS_KEY='meadow-btd6.map-medals';
export function createMapMedals(storage=()=>window.localStorage){
 const keys=['easy','medium','hard','deflation','reverse','apopalypse','double-hp-moabs','half-cash','alternate','impoppable','chimps'];
 function normalize(saved={}){const wins=Object.fromEntries(keys.map(key=>[key,saved[key]===true]));return {...wins,chimpsBadge:wins.chimps?(saved.chimpsBadge==='black'?'black':'red'):'none'};}
 function read(){try{const raw=storage().getItem(MAP_MEDALS_KEY);return normalize(raw&&raw.length<=2000?JSON.parse(raw):{});}catch{return normalize();}}
 return {read,award(key,{cleanChimps=false}={}){if(!keys.includes(key))return false;try{const wins=read();storage().setItem(MAP_MEDALS_KEY,JSON.stringify({...wins,[key]:true,...(key==='chimps'?{chimpsBadge:cleanChimps||wins.chimpsBadge==='black'?'black':'red'}:{})}));return true;}catch{return false;}}};
}
