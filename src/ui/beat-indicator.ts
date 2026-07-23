// Drains beats that have reached their scheduled audio time and flashes the
// visual pulse in sync. Beats are queued by the scheduler ahead of time, but
// we only *draw* them once audioContext.currentTime actually catches up —
// this keeps the animation locked to the audio clock instead of the timer.
export class BeatIndicator {
  private queue: { beatNumber: number; time: number }[] = [];
  private lastDrawnBeat = -1;
  private readonly dots: HTMLDivElement[] = [];
  private audioContext: AudioContext;
  private indicatorEl: HTMLDivElement;
  private beatsPerMeasure: number;

  constructor(
    audioContext: AudioContext,
    indicatorEl: HTMLDivElement,
    dotsContainer: HTMLDivElement,
    beatsPerMeasure: number,
  ) {
    this.audioContext = audioContext;
    this.indicatorEl = indicatorEl;
    this.beatsPerMeasure = beatsPerMeasure;
    for (let i = 0; i < beatsPerMeasure; i++) {
      const dot = document.createElement('div');
      dot.className = 'beat-dot';
      dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }

  reset(): void {
    this.queue = [];
    this.lastDrawnBeat = -1;
    this.dots.forEach((dot) => dot.classList.remove('active'));
  }

  enqueue(beatNumber: number, time: number): void {
    this.queue.push({ beatNumber, time });
  }

  update(): void {
    const now = this.audioContext.currentTime;
    while (this.queue.length && this.queue[0].time <= now) {
      const beat = this.queue.shift()!;
      if (beat.beatNumber > this.lastDrawnBeat) {
        this.lastDrawnBeat = beat.beatNumber;
        this.flash(beat.beatNumber);
      }
    }
  }

  private flash(beatNumber: number): void {
    const posInMeasure = beatNumber % this.beatsPerMeasure;
    this.indicatorEl.classList.remove('pulse');
    void this.indicatorEl.offsetWidth; // force reflow to restart the CSS animation
    this.indicatorEl.classList.add('pulse');
    this.dots.forEach((dot, i) => dot.classList.toggle('active', i === posInMeasure));
  }
}
