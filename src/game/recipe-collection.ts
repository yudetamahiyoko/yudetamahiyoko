// Persisted (localStorage) set of completed dishes, keyed by the puzzle's
// unique `dish` name. Reaching a new level unlocks access to new stages'
// puzzles; actually completing one of those puzzles is what "collects" its
// dish into the recipe book — a tangible, permanent reward on top of the
// pure score/level-unlock loop.
const STORAGE_KEY = 'bunkei-kitchen-collection';

export class RecipeCollection {
  private collected: Set<string>;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    let parsed: unknown = [];
    try {
      parsed = saved ? JSON.parse(saved) : [];
    } catch {
      parsed = [];
    }
    this.collected = new Set(Array.isArray(parsed) ? parsed : []);
  }

  has(dish: string): boolean {
    return this.collected.has(dish);
  }

  get size(): number {
    return this.collected.size;
  }

  // Returns true only when this dish is newly added, so callers can trigger
  // a celebration exactly once per dish.
  collect(dish: string): boolean {
    if (this.collected.has(dish)) return false;
    this.collected.add(dish);
    this.persist();
    return true;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.collected]));
  }
}
