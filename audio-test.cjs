const fs=require('fs'),vm=require('vm'),assert=require('assert');
let started=0,stopped=0,resumed=0;
class Param{setValueAtTime(){}linearRampToValueAtTime(){}exponentialRampToValueAtTime(){}setTargetAtTime(){}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();}connect(){return this;}start(){started++;}stop(){stopped++;}}
class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=1;this.destination=new Node();}createGain(){return new Node();}createOscillator(){return new Node();}resume(){this.state='running';resumed++;return Promise.resolve();}}
const window={AudioContext:FakeAudioContext};
vm.runInNewContext(fs.readFileSync(__dirname+'/audio.js','utf8'),{window,Math});
(async()=>{
  const audio=window.createPoyuAlertAudio();
  assert(audio.available);
  assert(await audio.unlock());
  assert(audio.play(1));
  assert.equal(started,12);assert.equal(stopped,12);
  audio.setEnabled(false);assert(!audio.play());
  audio.setEnabled(true);audio.setPaused(true);assert(!audio.play());
  audio.setPaused(false);assert(audio.play(.5));
  assert.equal(started,24);assert.equal(resumed,1);
  assert(audio.effect('swing'));assert(audio.effect('hit'));assert(audio.effect('knock'));assert.equal(started,29);assert.equal(stopped,29);
  for(const cue of ['liftDing','liftMove','carUnlock','carEnter','carDoorClose','engineStart'])assert(audio.effect(cue),'new story sound: '+cue);assert.equal(started,stopped);
  audio.setEngine(true,2);const engineVoices=started;audio.setEngine(true,5);assert.equal(started,engineVoices,'engine voices are reused while driving');audio.setEngine(false);assert.equal(started,stopped,'engine voices are stopped after exiting');
  audio.setEnabled(false);assert(!audio.effect('growl'));audio.setEnabled(true);audio.setPaused(true);assert(!audio.effect('doorClose'));
  console.log('audio test passed: alert, effects, mute and pause');
})().catch(e=>{console.error(e);process.exitCode=1;});
