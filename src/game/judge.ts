// Timing judgment windows. Widened from the design doc's initial values —
// this game's focus is grammar/word order, not precision rhythm-game
// timing, so taps get generous leeway before landing outside Just/OK.
export type TimingJudgment = 'just' | 'ok' | 'miss';

export const JUST_WINDOW_MS = 90;
export const OK_WINDOW_MS = 220;

export const OK_WINDOW_SECONDS = OK_WINDOW_MS / 1000;

export function judgeTapTiming(diffMs: number): TimingJudgment {
  const abs = Math.abs(diffMs);
  if (abs <= JUST_WINDOW_MS) return 'just';
  if (abs <= OK_WINDOW_MS) return 'ok';
  return 'miss';
}
