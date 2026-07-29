// localStorage access that can't crash the game.
//
// Every persisted feature (score, recipe book, exam result, mute) reads storage
// during start-up, so an environment that refuses it would take the whole app
// down before the first frame. That happens for real: private-browsing modes,
// blocked third-party storage, and sandboxed iframes all throw on access rather
// than returning null. Progress not being saved is an acceptable degradation;
// a blank screen is not.
export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore: the session simply won't persist.
  }
}
