// Tier caps and the one-per-path Tier 5 limit are checked separately.
export function upgradePathBlocked(paths,path,ultimateCrosspathing=false){
 if(ultimateCrosspathing)return false;
 return paths[path]>=2&&paths.some((tier,i)=>i!==path&&tier>2)||paths[path]===0&&paths.filter(tier=>tier>0).length>=2;
}
