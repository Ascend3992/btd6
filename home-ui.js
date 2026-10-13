import {gameModes,getGameMode} from './difficulty.js?v=2';
export function createHomeUI({savedRun,onResume,onStart,medals}){
 const screen=document.getElementById('homeScreen'),home=document.getElementById('homeView'),maps=document.getElementById('mapView'),dialog=document.getElementById('modeDialog'),branches=document.getElementById('branchDialog'),resume=document.getElementById('homeResumeBtn');let activeMode='easy';
 function refresh(){
  const wins=medals.read(),silver=wins.easy&&wins.medium;document.getElementById('meadowMapBtn').classList.toggle('silverBorder',silver);document.getElementById('mapBorderLabel').hidden=!silver;
  for(const key of Object.keys(gameModes)){const marker=document.querySelector('[data-medal="'+key+'"]');marker.classList.toggle('earned',wins[key]);marker.setAttribute('aria-label',gameModes[key].label+(wins[key]?' completed':' not completed'));marker.title=gameModes[key].label+(wins[key]?' completed':' not completed');}
  document.getElementById('homePlayBtn').textContent=savedRun?'NEW GAME':'PLAY';resume.hidden=!savedRun;if(savedRun){document.getElementById('homeResumeLabel').textContent='RESUME ROUND '+savedRun.round;const mode=getGameMode(savedRun.difficulty,savedRun.legacyMode,savedRun.variant||'standard');document.getElementById('homeSaveSummary').textContent='Monkey Meadow · '+mode.label+' · '+(savedRun.legacyMode?'100-round saved run':'Saved run');}
  for(const note of document.querySelectorAll('.replaceSaveNote'))note.hidden=!savedRun;
 }
 function showBranches(key){
  activeMode=key;refresh();const wins=medals.read();document.getElementById('branchTitle').textContent=gameModes[key].label.toUpperCase()+' MODES';const root=document.getElementById('standardModeBtn');root.querySelector('.modeBadge').className='modeBadge '+({easy:'easyBadge',medium:'normalBadge',hard:'hardBadge'}[key]);root.querySelector('b').textContent='STANDARD '+gameModes[key].label.toUpperCase();root.querySelector('.branchDetails').textContent=gameModes[key].lives+' lives · Rounds '+gameModes[key].startRound+'–'+gameModes[key].endRound;root.querySelector('.branchStatus').textContent=wins[key]?'COMPLETED · PLAY AGAIN':'PLAY';root.classList.toggle('completed',wins[key]);document.getElementById('easyBranches').hidden=key!=='easy';document.getElementById('branchConnections').hidden=key!=='easy';document.getElementById('branchHelp').textContent=key==='easy'?(wins.easy?'Deflation and Sandbox are unlocked. Pick your next challenge.':'Beat Standard Easy to unlock both paths.'):'Choose Standard '+gameModes[key].label+' to begin.';
  for(const variant of ['deflation','sandbox']){const b=document.querySelector('[data-variant="'+variant+'"]');b.disabled=!wins.easy;b.classList.toggle('locked',!wins.easy);b.classList.toggle('completed',variant==='deflation'&&wins.deflation);b.querySelector('.branchStatus').textContent=!wins.easy?'LOCKED · BEAT EASY':variant==='deflation'&&wins.deflation?'COMPLETED · PLAY AGAIN':'PLAY';}
  dialog.close();branches.showModal();
 }
 function showHome(){screen.hidden=false;home.hidden=false;maps.hidden=true;refresh();document.getElementById('homePlayBtn').focus();}
 function showMaps(){screen.hidden=false;home.hidden=true;maps.hidden=false;refresh();document.getElementById('meadowMapBtn').focus();}
 document.getElementById('homePlayBtn').addEventListener('click',showMaps);document.getElementById('mapBackBtn').addEventListener('click',showHome);
 document.getElementById('meadowMapBtn').addEventListener('click',()=>{refresh();dialog.showModal();});document.getElementById('modeBackBtn').addEventListener('click',()=>dialog.close());
 for(const button of document.querySelectorAll('.modeChoice'))button.addEventListener('click',()=>showBranches(button.dataset.mode));
 function backToModes(){branches.close();dialog.showModal();}
 document.getElementById('branchBackBtn').addEventListener('click',backToModes);branches.addEventListener('cancel',ev=>{ev.preventDefault();backToModes();});
 for(const button of document.querySelectorAll('[data-variant]'))button.addEventListener('click',()=>{const variant=button.dataset.variant;if(variant!=='standard'&&!medals.read().easy)return;onStart(activeMode,variant);branches.close();});
 resume.addEventListener('click',onResume);screen.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!dialog.open&&!branches.open&&!maps.hidden)showHome();});showHome();
 return {hide(){screen.hidden=true;},showHome,showMaps,setSavedRun(saved){savedRun=saved;refresh();}};
}
