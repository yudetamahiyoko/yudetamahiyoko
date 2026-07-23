import { judgeTapTiming } from './judge';
import type { TimingJudgment } from './judge';
import type { Chunk, Puzzle } from './stage-data';
import { playJust, playOk, playMissLand, playWrongWord } from '../audio/synth';

export type LandEvent =
  | { kind: 'wrong-word' }
  | { kind: 'landed'; timing: TimingJudgment; diffMs: number; complete: boolean };

const MAX_BEAT_MEMORY = 4;
const FLIGHT_DURATION_MS = 420;

interface TrayItem {
  seq: number;
  chunk: Chunk;
  el: HTMLDivElement;
}

// Owns the tray (shuffled chunks waiting to be placed) and the tower (chunks
// stacked in order). Grammar is the only thing that can fail here: tapping
// the WRONG chunk just bounces it in place, no tower effect. Tapping the
// RIGHT chunk always flies up and lands on the tower, no matter how far off
// the beat you are — rhythm timing never blocks progress. Timing only
// affects score/combo (see ScoreTracker) and a cosmetic wobble on a bad hit,
// so beginners can focus entirely on word order while more confident players
// can chase the beat for a higher score.
export class TowerGame {
  private root: HTMLDivElement;
  private trayEl: HTMLDivElement;
  private towerAreaEl: HTMLDivElement;
  private towerWrapEl: HTMLDivElement;
  private towerStackEl: HTMLDivElement;
  private onLand: (event: LandEvent) => void;

  private audioContext: AudioContext;
  private beatTimes: number[] = [];
  private pulseQueue: number[] = [];
  private puzzle: Puzzle | undefined;
  private items: TrayItem[] = [];
  private nextSeq = 0;
  private awaitingFirstTap = true;

  constructor(audioContext: AudioContext, root: HTMLDivElement, onLand: (event: LandEvent) => void) {
    this.audioContext = audioContext;
    this.root = root;
    this.onLand = onLand;

    this.root.innerHTML = `
      <div class="tower-area" id="tower-area">
        <div class="tower-wrap" id="tower-wrap">
          <div class="tower-stack" id="tower-stack"></div>
          <div class="tower-base"></div>
        </div>
      </div>
      <div class="tray" id="tray"></div>
    `;
    this.towerAreaEl = this.root.querySelector('#tower-area')!;
    this.towerWrapEl = this.root.querySelector('#tower-wrap')!;
    this.towerStackEl = this.root.querySelector('#tower-stack')!;
    this.trayEl = this.root.querySelector('#tray')!;
  }

  loadPuzzle(puzzle: Puzzle): void {
    this.puzzle = puzzle;
    this.nextSeq = 0;
    this.awaitingFirstTap = true;
    this.beatTimes = [];
    this.pulseQueue = [];
    this.towerStackEl.innerHTML = '';
    this.trayEl.innerHTML = '';
    this.towerAreaEl.classList.remove('zoomed-out');

    const order = puzzle.chunks.map((chunk, seq) => ({ chunk, seq }));
    this.items = shuffle(order).map(({ chunk, seq }) => {
      const el = document.createElement('div');
      el.className = `tray-chunk tray-chunk-role-${chunk.r}`;
      el.innerHTML = `
        <span class="tray-chunk-icon" aria-hidden="true">${chunk.e}</span>
        <span class="tray-chunk-word">${chunk.t}</span>
        <span class="tray-chunk-role">${chunk.r}</span>
      `;
      el.addEventListener('click', () => this.attemptTap(seq));
      this.trayEl.appendChild(el);
      return { seq, chunk, el };
    });
  }

  // Lets keyboard shortcuts (S/V/O/C/M) act as a proxy for clicking a tray
  // chunk, picking the lowest-seq pending match so a key always targets the
  // most relevant chunk of that role — same semantics as clicking it by hand.
  tapFirstPendingWithRole(roles: Chunk['r'][]): void {
    const candidates = this.items
      .filter((i) => i.seq >= this.nextSeq && roles.includes(i.chunk.r))
      .sort((a, b) => a.seq - b.seq);
    const match = candidates[0];
    if (match) this.attemptTap(match.seq);
  }

  registerBeat(time: number): void {
    this.beatTimes.push(time);
    if (this.beatTimes.length > MAX_BEAT_MEMORY) this.beatTimes.shift();
    this.pulseQueue.push(time);
  }

  update(): void {
    const now = this.audioContext.currentTime;
    while (this.pulseQueue.length && this.pulseQueue[0] <= now) {
      this.pulseQueue.shift();
      this.pulseExpectedChunk();
    }
  }

  private pulseExpectedChunk(): void {
    const item = this.items.find((i) => i.seq === this.nextSeq);
    if (!item) return;
    item.el.classList.remove('bob', 'beat-ring');
    void item.el.offsetWidth; // restart the CSS animations
    item.el.classList.add('bob', 'beat-ring');
  }

  private nearestBeatDiffMs(tapTime: number): number {
    if (this.beatTimes.length === 0) return 0;
    let nearest = this.beatTimes[0];
    let nearestDiff = Math.abs(tapTime - nearest);
    for (const t of this.beatTimes) {
      const diff = Math.abs(tapTime - t);
      if (diff < nearestDiff) {
        nearest = t;
        nearestDiff = diff;
      }
    }
    return (tapTime - nearest) * 1000;
  }

  private attemptTap(seq: number): void {
    if (!this.puzzle) return;
    const item = this.items.find((i) => i.seq === seq);
    if (!item) return;

    if (seq !== this.nextSeq) {
      item.el.classList.remove('bounce');
      void item.el.offsetWidth;
      item.el.classList.add('bounce');
      playWrongWord(this.audioContext);
      this.onLand({ kind: 'wrong-word' });
      return;
    }

    const tapTime = this.audioContext.currentTime;
    const diffMs = this.nearestBeatDiffMs(tapTime);
    // The first tap of a freshly-loaded puzzle always counts as perfectly
    // timed: the player needs a moment to read the new tray before acting,
    // and the background beat clock doesn't wait for them. Every tap after
    // that is judged normally against the beat.
    const timing = this.awaitingFirstTap ? 'just' : judgeTapTiming(diffMs);
    this.awaitingFirstTap = false;

    if (timing === 'just') {
      playJust(this.audioContext);
    } else if (timing === 'ok') {
      playOk(this.audioContext);
    } else {
      playMissLand(this.audioContext);
      this.towerWrapEl.classList.remove('wobble');
      void this.towerWrapEl.offsetWidth;
      this.towerWrapEl.classList.add('wobble');
    }

    this.nextSeq += 1;
    const puzzle = this.puzzle;
    const complete = this.nextSeq >= puzzle.chunks.length;

    this.flyToTarget(item, () => {
      item.el.classList.add('placed', `landed-${timing}`);
      if (complete) this.towerAreaEl.classList.add('zoomed-out');
    });

    this.onLand({ kind: 'landed', timing, diffMs, complete });
  }

  // Keeps the element absolutely positioned (relative to `root`) for the
  // full flight, and only reparents it into the tower stack once the
  // animation has actually finished — reparenting mid-flight would strand
  // stale left/top values computed for the wrong positioning context.
  private flyToTarget(item: TrayItem, onArrive: () => void): void {
    const fromRect = item.el.getBoundingClientRect();
    const toRect = this.towerStackEl.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();

    const fromX = fromRect.left - rootRect.left;
    const fromY = fromRect.top - rootRect.top;
    const toX = toRect.left - rootRect.left + toRect.width / 2 - fromRect.width / 2;
    const toY = toRect.top - rootRect.top;
    const peakY = Math.min(fromY, toY) - 100;
    const midX = (fromX + toX) / 2;

    item.el.classList.add('flying');
    item.el.style.position = 'absolute';
    item.el.style.left = `${fromX}px`;
    item.el.style.top = `${fromY}px`;
    item.el.style.margin = '0';
    this.root.appendChild(item.el);

    const animation = item.el.animate(
      [
        { left: `${fromX}px`, top: `${fromY}px`, offset: 0 },
        { left: `${midX}px`, top: `${peakY}px`, offset: 0.5 },
        { left: `${toX}px`, top: `${toY}px`, offset: 1 },
      ],
      { duration: FLIGHT_DURATION_MS, easing: 'ease-out' },
    );

    // Settle exactly once, via whichever fires first: the animation actually
    // finishing, or a fallback timer. WAAPI's `finished` promise depends on
    // the browser driving animation frames, which some environments suspend
    // for backgrounded/non-composited tabs — the timer keeps the game from
    // permanently stranding a chunk mid-flight if that happens.
    let settled = false;
    const settle = (): void => {
      if (settled) return;
      settled = true;
      animation.cancel();
      item.el.classList.remove('flying');
      item.el.style.position = '';
      item.el.style.left = '';
      item.el.style.top = '';
      item.el.style.margin = '';
      this.towerStackEl.appendChild(item.el);
      onArrive();
    };

    animation.finished.then(settle).catch(settle);
    window.setTimeout(settle, FLIGHT_DURATION_MS + 100);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
