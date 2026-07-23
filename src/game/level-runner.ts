import type { Puzzle, Stage } from './stage-data';

// 入門 = just SV, to get comfortable with the tap/keyboard controls.
// レベル1 mixes the three simplest patterns (SV/SVC/SVO); レベル2 the two
// harder ones (SVOO/SVOC); レベル3 mixes all five. Each level draws its
// puzzles from the given stage indices into one shuffled pool, rather than
// working through stages one at a time.
export interface LevelDef {
  label: string;
  stageIndices: number[];
  unlockScore: number;
}

export const LEVELS: LevelDef[] = [
  { label: '入門', stageIndices: [0], unlockScore: 0 },
  { label: 'レベル1', stageIndices: [0, 1, 2], unlockScore: 500 },
  { label: 'レベル2', stageIndices: [3, 4], unlockScore: 2000 },
  { label: 'レベル3', stageIndices: [0, 1, 2, 3, 4], unlockScore: 5000 },
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
