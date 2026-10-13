// Usage in this run: one XP per normal attack volley, including glue and ice.
const usage=new Map();
export function recordTowerUse(t){usage.set(t.type,(usage.get(t.type)||0)+1);}
export function towerUsageXP(type){return usage.get(type)||0;}
export function exportTowerUsage(){return Object.fromEntries(usage);}
export function restoreTowerUsage(saved){usage.clear();for(const [type,xp] of Object.entries(saved))usage.set(type,xp);}
