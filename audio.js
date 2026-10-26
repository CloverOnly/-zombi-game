/* A short original electronic emergency alert, synthesized locally with Web Audio. */
window.createPoyuAlertAudio = function createPoyuAlertAudio() {
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  let context = null, master = null, enabled = true, paused = false, motor = null;
  async function unlock() {
    if (!AudioContextType) return false;
    try {
      if (!context) {
        context = new AudioContextType();
        master = context.createGain();
        master.gain.value = enabled ? .24 : 0;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') await context.resume();
      return context.state === 'running';
    } catch (_) { return false; }
  }
  function play(level = 1) {
    if (!context || context.state !== 'running' || !enabled || paused) return false;
    const base = context.currentTime + .025;
    for (let i = 0; i < 6; i++) {
      const begin = base + i * .52, end = begin + .40;
      for (const [type, frequency, volume] of [
        ['triangle', i % 2 ? 940 : 690, .19 * level],
        ['sine', i % 2 ? 470 : 345, .09 * level]
      ]) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, begin);
        oscillator.frequency.linearRampToValueAtTime(i % 2 ? 710 : 920, end);
        envelope.gain.setValueAtTime(.0001, begin);
        envelope.gain.linearRampToValueAtTime(volume, begin + .035);
        envelope.gain.setValueAtTime(volume, end - .065);
        envelope.gain.exponentialRampToValueAtTime(.0001, end);
        oscillator.connect(envelope);
        envelope.connect(master);
        oscillator.start(begin);
        oscillator.stop(end + .02);
      }
    }
    return true;
  }
  function setEnabled(value) {
    enabled = !!value;
    if (context && master) master.gain.setTargetAtTime(enabled && !paused ? .24 : 0, context.currentTime, .035);
    return enabled;
  }
  function effect(kind){
    if(!context||context.state!=='running'||!enabled||paused)return false;
    const spec={swing:['sawtooth',260,75,.17,.11],hit:['triangle',115,42,.13,.34],doorOpen:['triangle',145,70,.22,.13],doorClose:['triangle',75,32,.21,.30],cabinet:['triangle',210,110,.16,.12],pickup:['sine',620,920,.12,.14],growl:['sawtooth',94,58,.42,.12],hurt:['triangle',140,60,.20,.21],fall:['triangle',70,26,.31,.25],knock:['triangle',170,65,.08,.22],liftDing:['sine',880,660,.65,.15],liftMove:['sine',65,80,1.6,.06],carUnlock:['sine',1100,850,.15,.12],carEnter:['triangle',120,80,.22,.1],carDoorClose:['triangle',95,36,.27,.25],engineStart:['sawtooth',42,82,1.25,.12]}[kind];
    if(!spec)return false;
    const [type,from,to,duration,volume]=spec,count=kind==='knock'?3:1;
    for(let i=0;i<count;i++){
      const begin=context.currentTime+.01+i*.18,end=begin+duration,o=context.createOscillator(),gain=context.createGain();
      o.type=type;o.frequency.setValueAtTime(from,begin);o.frequency.linearRampToValueAtTime(to,end);
      gain.gain.setValueAtTime(.0001,begin);gain.gain.linearRampToValueAtTime(volume,begin+.012);gain.gain.exponentialRampToValueAtTime(.0001,end);
      o.connect(gain);gain.connect(master);o.start(begin);o.stop(end+.02);
    }
    return true;
  }
  function setPaused(value) {
    paused = !!value;
    if (context && master) master.gain.setTargetAtTime(enabled && !paused ? .24 : 0, context.currentTime, .035);
  }
  function setEngine(on,speed=0){
    if(!context||context.state!=='running')return;
    if(!on){if(motor){motor.gain.gain.setTargetAtTime(.0001,context.currentTime,.04);for(const o of motor.oscillators)o.stop(context.currentTime+.2);motor=null;}return;}
    if(!motor){const gain=context.createGain();gain.gain.value=.0001;gain.connect(master);const oscillators=['triangle','sine'].map(type=>{const o=context.createOscillator();o.type=type;o.connect(gain);o.start();return o;});motor={gain,oscillators};}
    const rpm=43+Math.min(7,Math.abs(speed))*10;motor.oscillators[0].frequency.setTargetAtTime(rpm,context.currentTime,.12);motor.oscillators[1].frequency.setTargetAtTime(rpm*2.02,context.currentTime,.12);motor.gain.gain.setTargetAtTime(.035+Math.min(7,Math.abs(speed))*.004,context.currentTime,.1);
  }
  return {unlock, play, effect, setEngine, setEnabled, setPaused, get enabled(){return enabled;}, get available(){return !!AudioContextType;}};
};
