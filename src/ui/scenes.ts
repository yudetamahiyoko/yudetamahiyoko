// Wide kitchen vignettes for the dish-completed moment.
//
// The tray cards are 78px, so their icons have to be single objects. This
// overlay is the one place with room for a situation — a cook at a stove, a
// plate being handed over — which is what makes finishing a dish feel like
// finishing a dish rather than scoring a point.
//
// The people and the dish come from the same Twemoji sprite the cards use, so
// the characters here are the drawings the player has been tapping. The kitchen
// around them is geometry.
//
// Built entirely from emoji this read as stickers on a shelf rather than a
// room: emoji are drawn to be understood alone at small size, so side by side
// they compete instead of composing, and several carry props that spill into
// their neighbours (🫕 comes with forks). There is also no oven emoji — ♨️ was
// standing in, and it reads as a hot spring. Equipment is therefore drawn.
//
// Each scene leaves a slot for the finished dish, and the dish's own icon is
// placed into it. That keeps the dish accurate — a 焼き鳥 stays a skewer —
// while the surroundings supply the cooking context, instead of the scene
// trying to depict 200 different dishes itself.
const WALL = '#2b2723';
const COUNTER_TOP = '#b5741f';
const COUNTER = '#8a5a2b';
const TRAY = '#f5ecd8';
const METAL = '#9fb6c9';
const CREAM = '#f5ecd8';
const FLAME = '#e0a527';
const DARK = '#5c3a1a';
const STEAM = '#9fb6c9';
const WHITE = '#ffffff';

const COUNTER_Y = 104;

export interface DishSlot {
  x: number;
  y: number;
  size: number;
}

const room = `
  <rect x="0" y="0" width="240" height="140" fill="${WALL}"/>
  <rect x="0" y="${COUNTER_Y}" width="240" height="8" fill="${COUNTER_TOP}"/>
  <rect x="0" y="${COUNTER_Y + 8}" width="240" height="28" fill="${COUNTER}"/>
`;

// Figures and props stand ON the counter line, so each is bottomed out at it.
function at(id: string, x: number, size: number, bottom = COUNTER_Y): string {
  return `<use href="#ci-${id}" x="${x}" y="${bottom - size}" width="${size}" height="${size}"/>`;
}

// Standing spot on the counter to the cook's right, used by every scene whose
// action happens at the hob rather than across a table.
const COUNTER_SLOT: DishSlot = { x: 172, y: 52, size: 52 };

interface Scene {
  shapes: string;
  slot: DishSlot;
}

const SCENES: Record<string, Scene> = {
  // Flames sit between the burner and the pot base so they stay visible instead
  // of being hidden behind the pot.
  stove: {
    shapes: `
      ${room}
      <rect x="30" y="96" width="60" height="8" rx="3" fill="${METAL}"/>
      <path d="M46 96c-4-7 3-9 0-15 8 4 10 10 6 15zM64 96c-4-7 3-9 0-15 8 4 10 10 6 15z" fill="${FLAME}"/>
      <rect x="34" y="54" width="52" height="24" rx="5" fill="${METAL}"/>
      <rect x="28" y="47" width="64" height="8" rx="4" fill="${CREAM}"/>
      <circle cx="46" cy="34" r="6" fill="${STEAM}"/>
      <circle cx="64" cy="24" r="8" fill="${STEAM}"/>
      ${at('chef', 100, 62)}
    `,
    slot: COUNTER_SLOT,
  },
  oven: {
    shapes: `
      ${room}
      <rect x="20" y="44" width="76" height="60" rx="6" fill="${METAL}"/>
      <rect x="28" y="60" width="60" height="38" rx="4" fill="${DARK}"/>
      <path d="M34 90a24 14 0 0 1 48 0z" fill="${FLAME}"/>
      <rect x="28" y="49" width="60" height="6" rx="3" fill="${CREAM}"/>
      ${at('chef', 104, 62)}
    `,
    slot: COUNTER_SLOT,
  },
  // Serving: the dish rides a tray between the cook and the person waiting, so
  // it belongs in the middle here rather than off to one side.
  serve: {
    shapes: `
      ${room}
      ${at('chef', 8, 60)}
      <rect x="80" y="96" width="70" height="8" rx="4" fill="${TRAY}"/>
      ${at('recipient', 172, 60)}
    `,
    slot: { x: 89, y: 44, size: 52 },
  },
  prep: {
    shapes: `
      ${room}
      <rect x="22" y="94" width="76" height="10" rx="3" fill="${CREAM}"/>
      <path d="M74 46l9 5-27 39-7-5z" fill="${METAL}"/>
      <path d="M49 85l7 5-11 5z" fill="${DARK}"/>
      ${at('vegetables', 24, 34, 94)}
      ${at('chef', 100, 62)}
    `,
    slot: COUNTER_SLOT,
  },
  // Waiting: a lidded pot and a clock while the food changes on its own.
  wait: {
    shapes: `
      ${room}
      <rect x="26" y="62" width="54" height="42" rx="6" fill="${METAL}"/>
      <rect x="20" y="54" width="66" height="9" rx="4.5" fill="${CREAM}"/>
      <rect x="48" y="44" width="10" height="12" rx="5" fill="${COUNTER}"/>
      <circle cx="200" cy="24" r="16" fill="${CREAM}"/>
      <circle cx="200" cy="24" r="11" fill="${WHITE}"/>
      <path d="M200 24V16M200 24l7 5" stroke="${DARK}" stroke-width="3.5" stroke-linecap="round"/>
      ${at('chef', 100, 62)}
    `,
    slot: COUNTER_SLOT,
  },
  taste: {
    shapes: `
      ${room}
      <rect x="24" y="66" width="50" height="38" rx="5" fill="${METAL}"/>
      <rect x="18" y="59" width="62" height="8" rx="4" fill="${CREAM}"/>
      <circle cx="40" cy="46" r="6" fill="${STEAM}"/>
      <circle cx="58" cy="36" r="7" fill="${STEAM}"/>
      ${at('taste', 84, 30, 96)}
      ${at('chef', 100, 62)}
    `,
    slot: COUNTER_SLOT,
  },
};

export const SCENE_IDS = Object.keys(SCENES);

export function sceneSpriteMarkup(): string {
  const symbols = Object.entries(SCENES)
    .map(([id, s]) => `<symbol id="sc-${id}" viewBox="0 0 240 140">${s.shapes}</symbol>`)
    .join('');
  return `<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`;
}

export function hasScene(id: string): boolean {
  return id in SCENES;
}

// Scenes reference the icon sprite, so they must be installed after it.
export function installSceneSprite(): void {
  if (document.getElementById('scene-sprite')) return;
  const holder = document.createElement('div');
  holder.id = 'scene-sprite';
  holder.innerHTML = sceneSpriteMarkup();
  document.body.prepend(holder);
}

// Which scene a sentence gets is decided by its verb, because the verb is the
// part that says what was actually done — "bakes" belongs at an oven, "gives"
// at the pass. Keyed by the verb's icon so every phrasing of an action lands on
// the same scene.
const VERB_SCENE: Record<string, string> = {
  cook: 'stove',
  fry: 'stove',
  boil: 'stove',
  hot: 'stove',
  make: 'stove',
  bake: 'oven',
  give: 'serve',
  bring: 'serve',
  pour: 'serve',
  pass: 'serve',
  send: 'serve',
  show: 'serve',
  sell: 'serve',
  buy: 'serve',
  teach: 'serve',
  tell: 'serve',
  cut: 'prep',
  mix: 'prep',
  add: 'prep',
  wash: 'prep',
  clean: 'prep',
  carry: 'prep',
  catch: 'prep',
  taste: 'taste',
  eat: 'taste',
  drink: 'taste',
  like: 'taste',
  want: 'taste',
  need: 'taste',
  find: 'taste',
  sour: 'taste',
  carefully: 'taste',
  become: 'wait',
  keep: 'wait',
  stay: 'wait',
  melt: 'wait',
  rise: 'wait',
  grow: 'wait',
  dry: 'wait',
  waitFor: 'wait',
  ring: 'wait',
  stop: 'wait',
  cry: 'wait',
  leave: 'wait',
};

export function sceneIdForVerbIcon(verbIconId: string | undefined): string {
  const scene = verbIconId ? VERB_SCENE[verbIconId] : undefined;
  return scene && hasScene(scene) ? scene : 'stove';
}

// Composes a scene with the finished dish sitting in that scene's slot.
export function sceneMarkup(sceneId: string, dishIconId: string | undefined): string {
  const scene = SCENES[sceneId] ?? SCENES.stove;
  const { x, y, size } = scene.slot;
  const dish = dishIconId
    ? `<use href="#ci-${dishIconId}" x="${x}" y="${y}" width="${size}" height="${size}"/>`
    : '';
  return `<svg class="scene-svg" viewBox="0 0 240 140" role="img">
      <use href="#sc-${sceneId}" width="240" height="140"/>
      ${dish}
    </svg>`;
}
