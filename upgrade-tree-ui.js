import {setArt} from './tower-ui.js?v=5';
import {towerUsageXP} from './tower-usage.js?v=2';
const summaries={dart:'Throws darts at nearby Bloons. Cheap, reliable and versatile.',boomer:'Throws curved boomerangs that strike multiple Bloons.',bomb:'Fires explosive bombs that damage groups of Bloons.',tack:'Sprays tacks around itself to pop nearby Bloons.',ice:'Freezes nearby Bloons, holding them in place.',glue:'Coats Bloons with glue to slow them down.',hero:'Quincy fires bouncing arrows and gains levels automatically every 5 rounds.'};
export function createUpgradeTree({definitions,upgrades,descriptions,heroLevels}){
 const dialog=document.getElementById('upgradeTreeDialog'),grid=document.getElementById('treePaths'),tooltip=document.getElementById('treeTooltip'),types=Object.keys(definitions);
 let type='dart',activeNode;
 function hideDetails(){tooltip.hidden=true;activeNode?.removeAttribute('aria-describedby');activeNode=null;}
 function details(node,name,description,cost){
  hideDetails();activeNode=node;tooltip.replaceChildren();const title=document.createElement('strong'),body=document.createElement('p'),price=document.createElement('small');title.textContent=name;body.textContent=description;price.textContent=cost===undefined?'Levels automatically · no XP purchase':'In-game cost: $'+cost.toLocaleString();tooltip.append(title,body,price);tooltip.hidden=false;node.setAttribute('aria-describedby','treeTooltip');
  const rect=node.getBoundingClientRect(),width=Math.min(330,innerWidth-24);tooltip.style.width=width+'px';tooltip.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.left+rect.width/2-width/2))+'px';tooltip.style.top='0px';const height=tooltip.offsetHeight;tooltip.style.top=Math.max(12,Math.min(innerHeight-height-12,rect.bottom+8+height>innerHeight?rect.top-height-8:rect.bottom+8))+'px';
 }
 function node(name,path,tier,description,cost){
  const button=document.createElement('button');button.type='button';button.className='treeNode'+(tier===5&&type!=='hero'?' finalTier':'');button.dataset.path=path+1;button.dataset.tier=tier;button.setAttribute('aria-label',name);const art=document.createElement('span');art.className='treeArt';setArt(art,type,path,tier);const label=document.createElement('span');label.className='treeLabel';label.textContent=name;button.append(art,label);
  const show=()=>details(button,name,description,cost);button.addEventListener('pointerenter',show);button.addEventListener('pointerleave',()=>{if(document.activeElement!==button)hideDetails();});button.addEventListener('focus',show);button.addEventListener('blur',hideDetails);button.addEventListener('click',show);return button;
 }
 function render(){
  hideDetails();document.getElementById('treeName').textContent=definitions[type].name.toUpperCase();document.getElementById('treeXP').textContent='XP: '+towerUsageXP(type).toLocaleString();document.getElementById('treeDescription').textContent=summaries[type];grid.replaceChildren();grid.classList.toggle('heroLevels',type==='hero');
  if(type==='hero'){for(const level of heroLevels)grid.append(node('Level '+level.level,0,level.level,level.description));}
  else upgrades[type].forEach((path,p)=>{const row=document.createElement('section');row.className='treePath';row.setAttribute('aria-label',['Top','Middle','Bottom'][p]+' upgrade path');const label=document.createElement('h3');label.textContent=['TOP PATH','MIDDLE PATH','BOTTOM PATH'][p];row.append(label);path.forEach(([name,cost],i)=>row.append(node(name,p,i+1,descriptions[type][p][i],cost)));grid.append(row);});
  document.getElementById('treePrev').setAttribute('aria-label','Previous tower: '+definitions[types[(types.indexOf(type)-1+types.length)%types.length]].name);document.getElementById('treeNext').setAttribute('aria-label','Next tower: '+definitions[types[(types.indexOf(type)+1)%types.length]].name);
 }
 function navigate(direction){type=types[(types.indexOf(type)+direction+types.length)%types.length];render();}
 document.getElementById('treePrev').addEventListener('click',()=>navigate(-1));document.getElementById('treeNext').addEventListener('click',()=>navigate(1));document.getElementById('treeBack').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',hideDetails);dialog.addEventListener('keydown',ev=>{if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){ev.preventDefault();navigate(ev.key==='ArrowLeft'?-1:1);}});dialog.addEventListener('scroll',hideDetails);addEventListener('resize',hideDetails);
 return {open(nextType){type=types.includes(nextType)?nextType:'dart';render();if(!dialog.open)dialog.showModal();},dialog};
}
