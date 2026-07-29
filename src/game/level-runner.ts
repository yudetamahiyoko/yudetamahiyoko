import type { Puzzle, Stage } from './stage-data';

// Stage order (see stage-data.ts): 0 SV, 1 SVM, 2 SVC, 3 SVCM, 4 SVO,
// 5 SVOM, 6 SVOO, 7 SVOOM, 8 SVOC, 9 SVOCM.
//
// 入門 = just plain SV, to get comfortable with the tap/keyboard controls.
// レベル1 mixes the three simplest patterns, with and without a modifier
// (SV/SVM/SVC/SVCM/SVO/SVOM); レベル2 the two harder ones, with and without
// a modifier (SVOO/SVOOM/SVOC/SVOCM); レベル3 mixes all ten. Each level
// draws its puzzles from the given stage indices into one shuffled pool,
// rather than working through stages one at a time.
export interface LevelDef {
  label: string;
  stageIndices: number[];
  unlockScore: number;
}

export const LEVELS: LevelDef[] = [
  { label: '入門', stageIndices: [0], unlockScore: 0 },
  { label: 'レベル1', stageIndices: [0, 1, 2, 3, 4, 5], unlockScore: 500 },
  { label: 'レベル2', stageIndices: [6, 7, 8, 9], unlockScore: 2000 },
  { label: 'レベル3', stageIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], unlockScore: 5000 },
];

interface PoolEntry {
  stage: Stage;
  puzzle: Puzzle;
}

export class LevelRunner {
  private stages: Stage[];
  private levelIdx = 0;
  private pool: PoolEntry[] = [];
  private poolIdx = 0;

  constructor(stages: Stage[]) {
    this.stages = stages;
    this.loadLevelPool();
  }

  get levelLabel(): string {
    return LEVELS[this.levelIdx].label;
  }

  get levelIndex(): number {
    return this.levelIdx;
  }

  selectLevel(index: number): void {
    if (index < 0 || index >= LEVELS.length || index === this.levelIdx) return;
    this.levelIdx = index;
    this.loadLevelPool();
  }

  get stage(): Stage {
    return this.pool[this.poolIdx].stage;
  }

  get puzzle(): Puzzle {
    return this.pool[this.poolIdx].puzzle;
  }

  advanceToNextPuzzle(): void {
    if (this.poolIdx + 1 < this.pool.length) {
      this.poolIdx += 1;
    } else if (this.levelIdx + 1 < LEVELS.length) {
      this.levelIdx += 1;
      this.loadLevelPool();
    } else {
      this.levelIdx = 0;
      this.loadLevelPool();
    }
  }

  private loadLevelPool(): void {
    const def = LEVELS[this.levelIdx];
    const entries: PoolEntry[] = [];
    for (const stageIdx of def.stageIndices) {
      const stage = this.stages[stageIdx];
      for (const puzzle of stage.puzzles) {
        entries.push({ stage, puzzle });
      }
    }
    this.pool = shuffle(entries);
    this.poolIdx = 0;
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
