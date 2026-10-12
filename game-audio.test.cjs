const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('overlapping pops reuse decoded audio; independent sliders mute effects and loop all four music tracks',async()=>{
 const sources=[],tracks=[],labels={},output={gain:{value:0},connect(){}};let decodes=0;
 class AudioContext{state='running';destination={};async resume(){}createDynamicsCompressor(){return {connect(){}}}createGain(){return output}async decodeAudioData(){decodes++;return {duration:.2}}createBufferSource(){const source={connect(){},disconnect(){},start(){sources.push(this)}};return source;}}
 class Audio{constructor(src){this.src=src;this.paused=true;this.handlers={};tracks.push(this)}addEventListener(name,handler){this.handlers[name]=handler}async play(){this.paused=false}pause(){this.paused=true}}
 const context={window:{AudioContext},Audio,document:{getElementById:()=>labels},fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(3)})};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','pop-audio.js'),'utf8').replaceAll('export async function','async function').replaceAll('export function','function'),context);
 context.playBloonPop();assert.equal(sources.length,0,'no autoplay before audio unlock');await context.unlockPopAudio();await context.unlockPopAudio();assert.equal(decodes,1);assert.equal(tracks.length,1);
 context.playBloonPop();context.playBloonPop();assert.equal(sources.length,2);assert.notEqual(sources[0],sources[1]);assert.equal(sources[0].buffer,sources[1].buffer);
 const music=tracks[0],names=[];for(let i=0;i<5;i++){names.push(labels.textContent);music.handlers.ended();}assert.deepEqual(names,['Sunset Samba','Winter Is Coming','Sunshine Serenade','Fiesta Flamenco','Sunset Samba']);
 context.setEffectsVolume(0);context.playBloonPop();assert.equal(sources.length,2);assert.equal(music.paused,false);context.setEffectsVolume(.5);context.playBloonPop();assert.equal(sources.length,3);
 context.setMusicVolume(0);assert.equal(music.paused,true);context.setMusicVolume(.65);assert.equal(music.paused,false);assert.equal(music.volume,.65);
});
