const routes=new WeakMap();
export function setRouteDirection(path,distances,reverse){
 if(!routes.has(path))routes.set(path,[...path]);const route=routes.get(path);path.splice(0,path.length,...(reverse?[...route].reverse():route));
 distances.splice(0,distances.length,0);for(let i=1;i<path.length;i++)distances.push(distances[i-1]+path[i-1].distanceTo(path[i]));
}
export function reverseRoundQueue(queue){return [...queue].reverse().map((entry,i)=>({...entry,spec:{...entry.spec},gap:queue[Math.max(0,queue.length-2-i)].gap}));}
export function apopalypseRoundQueue(queue,round,seed){
 let state=(seed^Math.imul(round,0x9e3779b9))>>>0;
 function random(){state=(state+0x6d2b79f5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
 const colors=['Red','Blue','Green','Yellow','Pink'],allowed=round<3?1:round<6?2:round<10?3:round<15?4:5,result=[];
 const groups=[];for(const entry of queue){const key=JSON.stringify(entry.spec);if(groups.at(-1)?.key===key)groups.at(-1).entries.push(entry);else groups.push({key,entries:[entry]});}
 for(const {entries} of groups){const spec=entries[0].spec,count=Math.max(1,Math.round(entries.length*(.75+random()*.5)));
  for(let i=0;i<count;i++){let type=spec.type;const index=colors.indexOf(type);if(index>=0&&random()<.4)type=colors[Math.max(0,Math.min(allowed-1,index+(random()<.5?-1:1)))];
   result.push({spec:{...spec,type,spawnRound:round,camo:!!spec.camo||!['MOAB','BFB','ZOMG','DDT','BAD'].includes(type)&&round>=24&&random()<.08,regrow:!!spec.regrow||!['MOAB','BFB','ZOMG','DDT','BAD'].includes(type)&&round>=15&&random()<.1,fort:!!spec.fort||round>=45&&['Lead','Ceramic','MOAB','BFB'].includes(type)&&random()<.08},gap:entries[i%entries.length].gap*(.75+random()*.4)});
  }
 }
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
