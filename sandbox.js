export const SANDBOX_MAX=9999999,TEST_BLOON_HP=1e12;
export const sandboxTypes=['Red','Blue','Green','Yellow','Pink','Black','White','Purple','Lead','Zebra','Rainbow','Ceramic','MOAB','BFB','ZOMG','DDT','BAD','Test Bloon','MOAB Test Bloon'];
export function boundedInteger(value,min,max){const n=Number(value);return String(value).trim()!==''&&Number.isInteger(n)&&n>=min&&n<=max?n:null;}
export function sandboxSpawnQueue({type,count,spacing,camo=false,regrow=false,fort=false},spawnRound){
 if(!sandboxTypes.includes(type)||boundedInteger(count,1,999)===null||boundedInteger(spacing,0,999)===null)throw Error('Invalid Bloon send');
 return Array.from({length:Number(count)},()=>({spec:{type,spawnRound,camo:!!camo,regrow:!!regrow,fort:!!fort},gap:Number(spacing)/10}));
}
export function sandboxBlimpHp(type,spawnRound,multiplier){
 if(type==='DDT'&&spawnRound<90)return 480;
 if(type==='BAD'&&spawnRound<100)return 28000;
 return Math.round((type==='DDT'?400:28000)*multiplier);
}
export const MAP_PROGRESS_KEY='meadow-btd6.map-progress';
export function createMapProgress(medals,storage=()=>window.localStorage){
 let highest=1;
 function read(){const wins=medals.read();highest=Math.max(highest,wins.easy?40:1,wins.medium?60:1,wins.hard?80:1);try{const saved=JSON.parse(storage().getItem(MAP_PROGRESS_KEY));if(Number.isInteger(saved?.highestRound)&&saved.highestRound>=1&&saved.highestRound<=999)highest=Math.max(highest,saved.highestRound);}catch{}return highest;}
 return {read,record(round){if(!Number.isInteger(round)||round<1)return false;highest=Math.min(999,Math.max(read(),round));try{storage().setItem(MAP_PROGRESS_KEY,JSON.stringify({highestRound:highest}));return true;}catch{return false;}}};
}
