// Requirements are XP for the next level, from the supplied Quincy table.
export const quincyXPRequirements=[0,180,460,1000,1860,3280,5180,8320,9380,13620,16380,14400,16650,14940,16380,17820,19260,20700,16470,17280];
export function heroRoundXP(round){return round<=20?20*round+20:round<=50?40*(round-20)+420:90*(round-50)+1620;}
export function heroXPAtLevel(level){return quincyXPRequirements.slice(0,Math.max(1,Math.min(20,level))).reduce((sum,n)=>sum+n,0);}
export function heroXPProgress(total){
 let level=1,spent=0;while(level<20&&total>=spent+quincyXPRequirements[level]){spent+=quincyXPRequirements[level];level++;}
 return {level,current:Math.max(0,total-spent),required:level===20?0:quincyXPRequirements[level],total};
}
