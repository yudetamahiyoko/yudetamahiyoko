// Self-synthesized SFX via oscillator + gain envelopes — no external audio
// files needed. Every sound connects through the caller-supplied
// `destination` node (main.ts routes this through one shared master gain)
// rather than straight to audioContext.destination, so a single mute
// toggle can silence everything at once without touching each call site.
//
// The click plays a real kick/hihat/snare/hihat groove instead of one
// repeated tone. Kick and snare need actual percussion synthesis (a pitch-
// dropping sine for the kick, filtered noise for the snare/hihat) — layering
// plain oscillator beeps at different pitches reads as a handful of
// unrelated beeps, not a cohesive drum pattern.
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

function getNoiseBuffer(audioContext: AudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(audioContext);
  if (!buffer) {
    buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(audioContext, buffer);
  }
  return buffer;
}

function playNoiseHit(
  audioContext: AudioContext,
  destination: AudioNode,
  time: number,
  filterType: BiquadFilterType,
  filterFreq: number,
  q: number,
  peakGain: number,
  decay: number,
): void {
  const noise = audioContext.createBufferSource();
  noise.buffer = getNoiseBuffer(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  filter.Q.value = q;
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(peakGain, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(time);
  noise.stop(time + decay + 0.02);
}

function playKick(audioContext: AudioContext, destination: AudioNode, time: number): void {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(48, time + 0.11);
  gain.gain.setValueAtTime(0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(time);
  osc.stop(time + 0.18);
}

function playSnare(audioContext: AudioContext, destination: AudioNode, time: number): void {
  // A real snare is noise (the "crack") plus a soft tonal body — either
  // alone sounds thin/disconnected from the kick and hihat around it.
  playNoiseHit(audioContext, destination, time, 'bandpass', 1800, 0.8, 0.2, 0.09);
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 190;
  gain.gain.setValueAtTime(0.14, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(time);
  osc.stop(time + 0.1);
}

function playHihat(audioContext: AudioContext, destination: AudioNode, time: number): void {
  playNoiseHit(audioContext, destination, time, 'highpass', 8000, 0.7, 0.08, 0.035);
}

// beatInMeasure cycles kick(0) / hihat(1) / snare(2) / hihat(3) — the same
// basic four-on-the-floor groove countless real songs use, so it reads as
// music rather than a metronome.
export function playClick(audioContext: AudioContext, destination: AudioNode, time: number, beatInMeasure: number): void {
  switch (beatInMeasure % 4) {
    case 0:
      playKick(audioContext, destination, time);
      break;
    case 2:
      playSnare(audioContext, destination, time);
      break;
    default:
      playHihat(audioContext, destination, time);
      break;
  }
}

function playTone(
  audioContext: AudioContext,
  destination: AudioNode,
  time: number,
  freq: number,
  peakGain: number,
  duration: number,
  type: OscillatorType,
): void {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peakGain, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + duration + 0.02);
}

// Bright two-note "ding-ding" for a precisely-timed hit — the reward sound
// that should make players want to chase the beat.
export function playJust(audioContext: AudioContext, destination: AudioNode): void {
  const t = audioContext.currentTime;
  playTone(audioContext, destination, t, 1400, 0.35, 0.1, 'triangle');
  playTone(audioContext, destination, t + 0.06, 1900, 0.28, 0.12, 'triangle');
}

// A single softer note — correct, but noticeably less sparkly than Just.
export function playOk(audioContext: AudioContext, destination: AudioNode): void {
  playTone(audioContext, destination, audioContext.currentTime, 950, 0.28, 0.1, 'triangle');
}

// Landed anyway (bad timing) — a flatter, duller tone than Just/OK.
export function playMissLand(audioContext: AudioContext, destination: AudioNode): void {
  playTone(audioContext, destination, audioContext.currentTime, 260, 0.22, 0.14, 'sawtooth');
}

// Wrong ingredient tapped — a short, harmless "bonk" (no punishment, just
// a clear "not that one" cue).
export function playWrongWord(audioContext: AudioContext, destination: AudioNode): void {
  playTone(audioContext, destination, audioContext.currentTime, 180, 0.18, 0.08, 'square');
}
