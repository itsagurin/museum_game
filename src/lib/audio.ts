export type AudioTarget = 'off' | 'quiet' | 'normal';
export type ColoringSound = 'select' | 'correct' | 'wrong' | 'complete';
export const coloringSoundEvent = 'dom-opowiesci:coloring-sound';
export function playColoringSound(kind: ColoringSound) {
  window.dispatchEvent(new CustomEvent(coloringSoundEvent, { detail: kind }));
}
export function audioTarget(enabled: boolean, unlocked: boolean, hidden: boolean, reading: boolean): AudioTarget {
  return !enabled || !unlocked || hidden ? 'off' : reading ? 'quiet' : 'normal';
}

/** Small self-contained soundscape. No media downloads, microphone or external service. */
export class AmbientSound {
  private context: AudioContext;
  private master: GainNode;
  private voices: OscillatorNode[] = [];
  constructor() {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);
    // Widely spaced fifths, gently detuned: a soft, non-rhythmic ambient bed.
    for (const [index, frequency] of [130.81, 196, 261.63, 392].entries()) {
      const voice = this.context.createOscillator();
      const level = this.context.createGain();
      voice.type = 'sine'; voice.frequency.value = frequency; voice.detune.value = index % 2 ? 3 : -3;
      level.gain.value = .17 / (index + 1);
      voice.connect(level); level.connect(this.master); voice.start();
      this.voices.push(voice);
    }
  }
  async update(target: AudioTarget) {
    if (this.context.state === 'closed') return;
    if (target === 'off') { await this.context.suspend(); return; }
    await this.context.resume();
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(target === 'quiet' ? .035 : .09, this.context.currentTime, .8);
  }
  chime() {
    if (this.context.state !== 'running') return;
    const now = this.context.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, i) => {
      const voice = this.context.createOscillator();
      const envelope = this.context.createGain();
      voice.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, now + i * .1);
      envelope.gain.linearRampToValueAtTime(.018, now + i * .1 + .03);
      envelope.gain.exponentialRampToValueAtTime(.0001, now + i * .1 + 1.6);
      voice.connect(envelope); envelope.connect(this.context.destination);
      voice.start(now + i * .1); voice.stop(now + i * .1 + 1.7);
      voice.onended = () => { voice.disconnect(); envelope.disconnect(); };
    });
  }
  feedback(kind: ColoringSound) {
    if (this.context.state !== 'running') return;
    if (kind === 'complete') {
      this.chime();
      return;
    }
    if (kind === 'select') this.tone(700, 460, 0, .09, .025, 'sine');
    if (kind === 'wrong') {
      this.tone(260, 190, 0, .2, .035, 'triangle');
      this.tone(195, 165, .07, .18, .018, 'sine');
    }
    if (kind === 'correct') {
      this.tone(523.25, 523.25, 0, .32, .035, 'sine');
      this.tone(783.99, 1046.5, .075, .48, .025, 'sine');
      const buffer = this.context.createBuffer(1, Math.floor(this.context.sampleRate * .22), this.context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
      const brush = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
      brush.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 1500; filter.Q.value = .6; gain.gain.value = .035;
      brush.connect(filter); filter.connect(gain); gain.connect(this.context.destination);
      brush.start(); brush.onended = () => { brush.disconnect(); filter.disconnect(); gain.disconnect(); };
    }
  }
  private tone(frequency: number, endFrequency: number, delay: number, duration: number, volume: number, type: OscillatorType) {
    const start = this.context.currentTime + delay;
    const voice = this.context.createOscillator(), gain = this.context.createGain();
    voice.type = type;
    voice.frequency.setValueAtTime(frequency, start);
    voice.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    voice.connect(gain); gain.connect(this.context.destination);
    voice.start(start); voice.stop(start + duration + .02);
    voice.onended = () => { voice.disconnect(); gain.disconnect(); };
  }
  async dispose() {
    this.voices.forEach((voice) => { voice.stop(); voice.disconnect(); });
    this.master.disconnect();
    await this.context.close();
  }
}
