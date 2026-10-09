import * as THREE from './assets/vendor/three.module.js';
import {upgradeIcons} from './upgrade-icons.js?v=1';
let portraitRenderer,portraitScene,portraitCamera;
const portraits=new Map(),unavailableIcons=new Set();
export function renderTowerPortrait(t){
 const key=t.type+':'+(t.type==='hero'?t.mesh.userData.quincyModelLevel:t.paths.join('-'))+':'+(t.fanTier||0)+':'+(t.throwHand||1);
 if(portraits.has(key))return portraits.get(key);
 if(!portraitRenderer){
  portraitRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});portraitRenderer.setSize(360,280,false);portraitRenderer.setPixelRatio(1);portraitRenderer.outputColorSpace=THREE.SRGBColorSpace;portraitRenderer.setClearColor(0,0);
  portraitScene=new THREE.Scene();portraitScene.add(new THREE.HemisphereLight(0xffffff,0x6f7750,2.2));const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(-4,8,6);portraitScene.add(sun);
  portraitCamera=new THREE.OrthographicCamera(-2,2,1.6,-1.6,.1,100);portraitCamera.position.set(0,2.7,9);portraitCamera.lookAt(0,0,0);
 }
 // Clone transforms only. Geometry and materials stay owned by the game's model.
 const wrapper=new THREE.Group();if(t.mesh.userData.body)wrapper.add(t.mesh.userData.body.clone(true));else for(const child of t.mesh.children)wrapper.add(child.clone(true));wrapper.rotation.y=-.42;wrapper.scale.x=t.mesh.scale.x;portraitScene.add(wrapper);
 const box=new THREE.Box3().setFromObject(wrapper),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());wrapper.position.sub(center);
 const half=Math.max(size.y*.59,size.x/1.286*.59,size.z*.35,1);portraitCamera.top=half;portraitCamera.bottom=-half;portraitCamera.left=-half*360/280;portraitCamera.right=half*360/280;portraitCamera.updateProjectionMatrix();
 portraitRenderer.render(portraitScene,portraitCamera);const url=portraitRenderer.domElement.toDataURL('image/png');portraitScene.remove(wrapper);
 if(portraits.size>=64)portraits.delete(portraits.keys().next().value);portraits.set(key,url);return url;
}
const badge={dart:'dart',boomer:'boomer',bomb:'bomb',tack:'tack',ice:'ice',glue:'flask',hero:'dart'};
function setArt(node,type,path,tier,locked=false){
 const registered=upgradeIcons[type+'-'+(path+1)+'-'+tier],file=!locked&&!unavailableIcons.has(registered)&&registered,key=locked?'lock':file||badge[type];
 if(node.dataset.art===key)return;node.dataset.art=key;node.replaceChildren();
 if(file){const img=document.createElement('img');img.src=file;img.alt='';node.appendChild(img);img.addEventListener('error',()=>{unavailableIcons.add(file);delete node.dataset.art;setArt(node,type,path,tier,locked);},{once:true});}
 else setFallback(node,key);
}
function setFallback(node,key){node.innerHTML='<svg aria-hidden="true"><use href="assets/ui/interface.svg#'+key+'"></use></svg>';}
export function renderUpgradeRows(t,data,cash,selectedPath,uniqueTierTaken){
 const hero=t.type==='hero',panel=document.getElementById('selectedPanel');panel.classList.toggle('heroPanel',hero);panel.classList.toggle('inspecting',!hero&&selectedPath!==null);
 for(let path=0;path<3;path++){
  const b=document.getElementById('upgrade'+path),row=b.parentElement,owned=row.querySelector('.ownedUpgrade'),tier=t.paths[path],next=data[t.type]?.[path]?.[tier],current=data[t.type]?.[path]?.[tier-1];
  if(hero){row.classList.remove('pathLocked','maxed');b.classList.remove('unaffordable');setArt(b.querySelector('.upgradeArt'),'hero',path,1);continue;}
  const blocked=tier<5&&(tier>=2&&t.paths.some((v,i)=>i!==path&&v>2)||tier===0&&t.paths.filter(v=>v>0).length>=2);
  const maxed=tier>=5||blocked&&tier>0,locked=blocked&&tier===0;
  row.classList.toggle('pathLocked',locked);row.classList.toggle('maxed',maxed);
  [...row.querySelectorAll('.tierMarkers i')].forEach((el,i)=>el.classList.toggle('owned',i<tier));
  owned.querySelector('b').textContent=current?.[0]||'NOT UPGRADED';owned.querySelector('strong').textContent=tier?'OWNED':'';
  setArt(owned.querySelector('.upgradeArt'),t.type,path,Math.max(1,tier));
  b.querySelector('b').textContent=locked?'PATH CLOSED':maxed?'MAX UPGRADES':next?.[0]||'MAX UPGRADES';
  b.querySelector('small').textContent=locked||maxed?'':uniqueTierTaken(t,path)?'LIMIT REACHED':'$'+next[1].toLocaleString();
  b.classList.toggle('unaffordable',!!next&&cash<next[1]);setArt(b.querySelector('.upgradeArt'),t.type,path,tier+1,locked||maxed);
  b.title=locked?'Only two upgrade paths can be used':maxed?'This path cannot be upgraded further':uniqueTierTaken(t,path)?'Only one of this Tier 5 can be placed':next[0]+' — $'+next[1].toLocaleString();
  b.setAttribute('aria-label',b.title);row.setAttribute('aria-label','Path '+(path+1)+', '+tier+' of 5 tiers owned');
 }
}
