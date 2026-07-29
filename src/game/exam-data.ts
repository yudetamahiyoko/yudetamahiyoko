// Content helpers for the graduation exam (卒業試験): reuses the existing
// 200-puzzle pool rather than requiring separately-authored exam content.
import type { Chunk, Puzzle } from './stage-data';
import { STAGES } from './stage-data';

export type BasePattern = 'SV' | 'SVC' | 'SVO' | 'SVOO' | 'SVOC';

export const BASE_PATTERNS: BasePattern[] = ['SV', 'SVC', 'SVO', 'SVOO', 'SVOC'];

export const PATTERN_LABELS: Record<BasePattern, string> = {
  SV: 'SV',
  SVC: 'SVC',
  SVO: 'SVO',
  SVOO: 'SVO₁O₂',
  SVOC: 'SVOC',
};

// M is an optional add-on, not one of the 5 core patterns, so a puzzle's
// "identity" for recognition purposes ignores whether it has an M chunk.
export function basePatternOf(puzzle: Puzzle): BasePattern {
  const roles = new Set(puzzle.chunks.map((c) => c.r));
  if (roles.has('O1') || roles.has('O2')) return 'SVOO';
  if (roles.has('O') && roles.has('C')) return 'SVOC';
  if (roles.has('C')) return 'SVC';
  if (roles.has('O')) return 'SVO';
  return 'SV';
}

const ALL_PUZZLES: Puzzle[] = STAGES.flatMap((stage) => stage.puzzles);

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function bucketByPattern(puzzles: Puzzle[]): Record<BasePattern, Puzzle[]> {
  const buckets: Record<BasePattern, Puzzle[]> = { SV: [], SVC: [], SVO: [], SVOO: [], SVOC: [] };
  for (const p of puzzles) buckets[basePatternOf(p)].push(p);
  return buckets;
}

export interface RecognitionQuestion {
  puzzle: Puzzle;
  answer: BasePattern;
}

// Draws `count` questions round-robin across the 5 pattern buckets (rather
// than pure random) so the set can't accidentally skew toward one pattern.
export function buildRecognitionSet(count: number): RecognitionQuestion[] {
  const buckets = bucketByPattern(ALL_PUZZLES);
  for (const key of BASE_PATTERNS) buckets[key] = shuffle(buckets[key]);

  const questions: RecognitionQuestion[] = [];
  let round = 0;
  while (questions.length < count && round < BASE_PATTERNS.length * 20) {
    const pattern = BASE_PATTERNS[round % BASE_PATTERNS.length];
    const pool = buckets[pattern];
    const idx = Math.floor(round / BASE_PATTERNS.length);
    if (pool[idx]) questions.push({ puzzle: pool[idx], answer: pattern });
    round += 1;
  }
  return questions;
}

export interface PracticalOrder {
  puzzle: Puzzle;
  decoys: Chunk[];
}

// One order per base pattern (5 total), each with a couple of decoy chunks
// borrowed from unrelated puzzles mixed into the tray — the player must
// recognize which words actually belong, not just tap everything shown.
export function buildPracticalSet(decoysPerOrder = 2): PracticalOrder[] {
  const buckets = bucketByPattern(ALL_PUZZLES);

  return BASE_PATTERNS.map((pattern) => {
    const pool = shuffle(buckets[pattern]);
    const puzzle = pool[0];
    const decoyCandidates = shuffle(ALL_PUZZLES.filter((p) => p !== puzzle)).flatMap((p) => p.chunks);
    return { puzzle, decoys: pickDistinctDecoys(decoyCandidates, puzzle, decoysPerOrder) };
  });
}

function pickDistinctDecoys(pool: Chunk[], puzzle: Puzzle, n: number): Chunk[] {
  const used = new Set(puzzle.chunks.map((c) => c.t.toLowerCase()));
  const picked: Chunk[] = [];
  for (const c of pool) {
    if (picked.length >= n) break;
    const key = c.t.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    picked.push(c);
  }
  return picked;
}
