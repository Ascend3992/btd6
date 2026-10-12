// Session usage only: one XP per normal attack volley, including glue and ice.
const usage=new Map();
export function recordTowerUse(t){usage.set(t.type,(usage.get(t.type)||0)+1);}
export function towerUsageXP(type){return usage.get(type)||0;}
