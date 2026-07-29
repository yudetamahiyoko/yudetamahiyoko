// Score is cumulative for the lifetime of the browser tab (persisted to
// localStorage) since it gates level unlocks — restarting a puzzle or
// switching levels must not wipe out progress already unlocked.
//
// Grammar (word order) is the only thing that can fail in this game — every
// correctly-ordered tap always lands on the tower. Timing is purely a score
// bonus: a well-timed streak (Just/OK) builds combo and a growing score
// multiplier, while a mistimed hit (Miss) breaks the combo without ever
// costing tower progress. A wrong-word tap doesn't touch score or combo at
// all, since it never even reached the tower.
import { readStored, writeStored } from '../util/storage';

const STORAGE_KEY = 'bunkei-kitchen-score';

const BASE_POINTS: Record<'just' | 'ok' | 'miss', number> = {
  just: 100,
  ok: 50,
  miss: 10,
};

export class ScoreTracker {
  score = 0;
  combo = 0;

  constructor() {
    const saved = Number(readStored(STORAGE_KEY));
    this.score = Number.isFinite(saved) && saved > 0 ? saved : 0;
  }

  get multiplier(): number {
    if (this.combo >= 10) return 4;
    if (this.combo >= 6) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }

  registerLanding(timing: 'just' | 'ok' | 'miss'): number {
    const gained = BASE_POINTS[timing] * this.multiplier;
    this.score += gained;
    this.combo = timing === 'miss' ? 0 : this.combo + 1;
    this.persist();
    return gained;
  }

  private persist(): void {
    writeStored(STORAGE_KEY, String(this.score));
  }
}
