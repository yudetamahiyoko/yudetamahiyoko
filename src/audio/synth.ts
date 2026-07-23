// Self-synthesized metronome click via oscillator + gain envelope.
// No external SFX files needed for the prototype; swap for sample playback later.
export function playClick(audioContext: AudioContext, time: number, accent: boolean): void {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'square';
  osc.frequency.value = accent ? 1000 : 700;

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.35 : 0.2, time + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(time);
  osc.stop(time + 0.07);
}

function playTone(
  audioContext: AudioContext,
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
  gain.connect(audioContext.destination);

  osc.start(time);
  osc.stop(time + duration + 0.02);
}

// Bright two-note "ding-ding" for a precisely-timed hit — the reward sound
// that should make players want to chase the beat.
export function playJust(audioContext: AudioContext): void {
  const t = audioContext.currentTime;
  playTone(audioContext, t, 1400, 0.35, 0.1, 'triangle');
  playTone(audioContext, t + 0.06, 1900, 0.28, 0.12, 'triangle');
}

// A single softer note — correct, but noticeably less sparkly than Just.
export function playOk(audioContext: AudioContext): void {
  playTone(audioContext, audioContext.currentTime, 950, 0.28, 0.1, 'triangle');
}

// Landed anyway (bad timing) — a flatter, duller tone than Just/OK.
export function playMissLand(audioContext: AudioContext): void {
  playTone(audioContext, audioContext.currentTime, 260, 0.22, 0.14, 'sawtooth');
}

// Wrong ingredient tapped — a short, harmless "bonk" (no punishment, just
// a clear "not that one" cue).
export function playWrongWord(audioContext: AudioContext): void {
  playTone(audioContext, audioContext.currentTime, 180, 0.18, 0.08, 'square');
}
