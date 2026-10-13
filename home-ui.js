import {gameModes} from './difficulty.js?v=1';
export function createHomeUI({savedRun,onResume,onStart,medals}){
 const screen=document.getElementById('homeScreen'),home=document.getElementById('homeView'),maps=document.getElementById('mapView'),dialog=document.getElementById('modeDialog'),resume=document.getElementById('homeResumeBtn');
 function refresh(){
  const wins=medals.read(),silver=wins.easy&&wins.medium;document.getElementById('meadowMapBtn').classList.toggle('silverBorder',silver);document.getElementById('mapBorderLabel').hidden=!silver;
  for(const key of Object.keys(gameModes)){const marker=document.querySelector('[data-medal="'+key+'"]');marker.classList.toggle('earned',wins[key]);marker.setAttribute('aria-label',gameModes[key].label+(wins[key]?' completed':' not completed'));marker.title=gameModes[key].label+(wins[key]?' completed':' not completed');}
  document.getElementById('homePlayBtn').textContent=savedRun?'NEW GAME':'PLAY';resume.hidden=!savedRun;if(savedRun){document.getElementById('homeResumeLabel').textContent='RESUME ROUND '+savedRun.round;document.getElementById('homeSaveSummary').textContent='Monkey Meadow · '+(gameModes[savedRun.difficulty||'medium']?.label||'Normal')+' · '+(savedRun.legacyMode?'100-round saved run':'Saved run');}
  document.getElementById('modeReplaceNote').hidden=!savedRun;
 }
 function showHome(){screen.hidden=false;home.hidden=false;maps.hidden=true;refresh();document.getElementById('homePlayBtn').focus();}
 function showMaps(){screen.hidden=false;home.hidden=true;maps.hidden=false;refresh();document.getElementById('meadowMapBtn').focus();}
 document.getElementById('homePlayBtn').addEventListener('click',showMaps);document.getElementById('mapBackBtn').addEventListener('click',showHome);
 document.getElementById('meadowMapBtn').addEventListener('click',()=>{refresh();dialog.showModal();});
 document.getElementById('modeBackBtn').addEventListener('click',()=>dialog.close());
 for(const button of document.querySelectorAll('.modeChoice'))button.addEventListener('click',()=>{const key=button.dataset.mode;if(!Object.hasOwn(gameModes,key))return;onStart(key);dialog.close();});
 resume.addEventListener('click',onResume);
 screen.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!dialog.open&&!maps.hidden)showHome();});
 showHome();
 return {hide(){screen.hidden=true;},showHome,showMaps,setSavedRun(saved){savedRun=saved;refresh();}};
}
