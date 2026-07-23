// Lookahead scheduler (a la Chris Wilson's "A Tale of Two Clocks").
// setTimeout drives *when we schedule*, but the actual beat time is always
// read from audioContext.currentTime so playback never drifts from the audio clock.
export type BeatCallback = (beatNumber: number, time: number) => void;

export class Scheduler {
  private readonly lookaheadMs = 25.0;
  private readonly scheduleAheadTime: number;
  private nextBeatTime = 0;
  private beatNumber = 0;
  private timerId: number | undefined;
  private running = false;
  private audioContext: AudioContext;
  private bpm: number;
  private onBeat: BeatCallback;

  // scheduleAheadTime should be >= any visual travel duration driven by onBeat,
  // since Web Audio API scheduling that far ahead is still sample-accurate.
  constructor(audioContext: AudioContext, bpm: number, onBeat: BeatCallback, scheduleAheadTime = 0.1) {
    this.audioContext = audioContext;
    this.bpm = bpm;
    this.onBeat = onBeat;
    this.scheduleAheadTime = scheduleAheadTime;
  }

  get secondsPerBeat(): number {
    return 60 / this.bpm;
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.beatNumber = 0;
    this.nextBeatTime = this.audioContext.currentTime + 0.1;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
  }

  private tick = (): void => {
    while (this.nextBeatTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.onBeat(this.beatNumber, this.nextBeatTime);
      this.nextBeatTime += this.secondsPerBeat;
      this.beatNumber += 1;
    }
    this.timerId = window.setTimeout(this.tick, this.lookaheadMs);
  };
}
