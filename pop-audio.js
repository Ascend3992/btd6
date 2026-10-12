// Decode the supplied recording once; independent sources allow overlapping pops.
let context,buffer,output,loading;
let effectsVolume=.35,musicVolume=.3;
const tracks=['sunset-samba.mp3','winter-is-coming.mp3','sunshine-serenade.mp3','fiesta-flamenco.mp3'];
const trackNames=['Sunset Samba','Winter Is Coming','Sunshine Serenade','Fiesta Flamenco'];
let music,track=0;
function showTrack(){const label=document.getElementById('musicTrack');if(label)label.textContent=trackNames[track];}
function startMusic(){
 if(!music){music=new Audio('./assets/audio/'+tracks[track]);music.volume=musicVolume;music.preload='none';music.addEventListener('ended',()=>{track=(track+1)%tracks.length;music.src='./assets/audio/'+tracks[track];showTrack();if(musicVolume>0)music.play().catch(()=>{});});showTrack();}
 if(musicVolume>0&&music.paused)music.play().catch(()=>{});
}
export async function unlockPopAudio(){
 startMusic();
 try{
  const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
  if(!context){context=new AudioContext();const compressor=context.createDynamicsCompressor();compressor.connect(context.destination);output=context.createGain();output.gain.value=effectsVolume*.63;output.connect(compressor);}
  await context.resume();
  if(!loading)loading=fetch('./assets/audio/btd-bloon-pop.mp3').then(r=>{if(!r.ok)throw Error('Pop audio unavailable');return r.arrayBuffer();}).then(data=>context.decodeAudioData(data)).then(decoded=>buffer=decoded).catch(()=>{loading=null;});
  await loading;
 }catch{/* Audio support never blocks gameplay. */}
}
export function playBloonPop(){
 if(effectsVolume===0||!buffer||context?.state!=='running')return;
 const source=context.createBufferSource();source.buffer=buffer;source.connect(output);source.onended=()=>source.disconnect();source.start();
}
export function setEffectsVolume(value){effectsVolume=Math.max(0,Math.min(1,value));if(output)output.gain.value=effectsVolume*.63;}
export function setMusicVolume(value){musicVolume=Math.max(0,Math.min(1,value));if(music){music.volume=musicVolume;if(musicVolume===0)music.pause();else startMusic();}}
