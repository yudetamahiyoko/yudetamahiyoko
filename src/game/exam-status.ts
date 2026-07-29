// Persisted (localStorage) record of whether the player has passed the
// graduation exam (卒業試験) — a permanent milestone distinct from score/
// level progress, shown as a badge once earned.
import { readStored, writeStored } from '../util/storage';

const STORAGE_KEY = 'bunkei-kitchen-graduated';

export class ExamStatus {
  graduated: boolean;

  constructor() {
    this.graduated = readStored(STORAGE_KEY) === '1';
  }

  markGraduated(): void {
    this.graduated = true;
    writeStored(STORAGE_KEY, '1');
  }
}
