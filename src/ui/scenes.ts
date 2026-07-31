// Wide kitchen vignettes for the dish-completed moment.
//
// The tray cards are 78px, so their icons have to be single objects. This
// overlay is the one place with room for a situation — a cook at a stove, a
// plate being handed over — which is what makes finishing a dish feel like
// finishing a dish rather than scoring a point.
//
// Each scene leaves a clear space for the finished dish and the dish's own icon
// is placed into it. That keeps the dish accurate (a 焼き鳥 stays a skewer)
// while the surroundings supply the cooking context, instead of the scene
// trying to depict 200 different dishes itself.
//
// Layout contract for the 240x140 canvas: the counter surface is at y=104, so
// anything resting on it bottoms out there and figures extend down to it rather
// than floating. Each scene declares its own dish slot, because where the dish
// belongs depends on the composition — on the counter beside the cook for the
// cooking scenes, on the tray between two people for the serving one.
const S = {
  wall: '#2b2723',
  counter: '#8a5a2b',
  counterTop: '#b5741f',
  metal: '#9fb6c9',
  cream: '#f5ecd8',
  white: '#ffffff',
  mustard: '#e0a527',
  red: '#c15b4a',
  green: '#6fae5a',
  skin: '#e8b98f',
  dark: '#5c3a1a',
  steam: '#9fb6c9',
  blue: '#5aa9e6',
};

const COUNTER_Y = 104;

export interface DishSlot {
  x: number;
  y: number;
  size: number;
}

// A cook drawn once and reused, so the same character appears across scenes.
// The torso runs all the way down to the counter so the figure reads as
// standing behind it rather than hovering.
function cook(x: number, armPath: string): string {
  const headCy = 42;
  return `
    <path d="M${x - 21} ${COUNTER_Y + 2} V${headCy + 30} a21 21 0 0 1 42 0 V${COUNTER_Y + 2} Z" fill="${S.white}"/>
    <circle cx="${x}" cy="${headCy}" r="17" fill="${S.skin}"/>
    <path d="M${x - 18} 32 a10 10 0 0 1 9-10 13 13 0 0 1 18 0 10 10 0 0 1 9 10 v4 h-36 z" fill="${S.white}"/>
    <rect x="${x - 17}" y="33" width="34" height="7" rx="3.5" fill="${S.cream}"/>
    <circle cx="${x - 6}" cy="45" r="2.6" fill="${S.dark}"/>
    <circle cx="${x + 6}" cy="45" r="2.6" fill="${S.dark}"/>
    <path d="${armPath}" stroke="${S.skin}" stroke-width="9" stroke-linecap="round" fill="none"/>
  `;
}

const room = `
  <rect x="0" y="0" width="240" height="140" fill="${S.wall}"/>
  <rect x="0" y="${COUNTER_Y}" width="240" height="8" fill="${S.counterTop}"/>
  <rect x="0" y="${COUNTER_Y + 8}" width="240" height="28" fill="${S.counter}"/>
`;

// Standing spot on the counter to the cook's right, used by every scene whose
// action happens at the hob rather than across a table.
//
// The y is set so the artwork's own bottom edge meets the counter. Icons are
// normalized to fill 58 of their 64-unit canvas centred, which leaves a margin
// of size*3/64 inside the slot box — ignoring it left every dish hovering a few
// pixels above the surface.
const COUNTER_SLOT: DishSlot = { x: 166, y: 54, size: 52 };

interface Scene {
  shapes: string;
  slot: DishSlot;
}

const SCENES: Record<string, Scene> = {
  // Cooking over heat: flames sit between the burner and the pot base so they
  // stay visible rather than being covered by the pot.
  stove: {
    shapes: `
      ${room}
      <rect x="30" y="96" width="60" height="8" rx="3" fill="${S.metal}"/>
      <path d="M46 96c-4-7 3-9 0-15 8 4 10 10 6 15zM64 96c-4-7 3-9 0-15 8 4 10 10 6 15z" fill="${S.mustard}"/>
      <rect x="34" y="54" width="52" height="24" rx="5" fill="${S.metal}"/>
      <rect x="28" y="47" width="64" height="8" rx="4" fill="${S.cream}"/>
      <circle cx="46" cy="34" r="6" fill="${S.steam}"/>
      <circle cx="64" cy="24" r="8" fill="${S.steam}"/>
      ${cook(118, 'M100 66 L84 58')}
    `,
    slot: COUNTER_SLOT,
  },

  oven: {
    shapes: `
      ${room}
      <rect x="20" y="44" width="76" height="60" rx="6" fill="${S.metal}"/>
      <rect x="28" y="60" width="60" height="38" rx="4" fill="${S.dark}"/>
      <path d="M34 90a24 14 0 0 1 48 0z" fill="${S.mustard}"/>
      <rect x="28" y="49" width="60" height="6" rx="3" fill="${S.cream}"/>
      ${cook(130, 'M112 66 L100 74')}
    `,
    slot: COUNTER_SLOT,
  },

  // Serving: the dish rides the tray between the cook and the guest, so it goes
  // in the middle here rather than off to one side.
  serve: {
    shapes: `
      ${room}
      ${cook(44, 'M62 64 L96 60')}
      <rect x="86" y="62" width="52" height="7" rx="3.5" fill="${S.cream}"/>
      <path d="M185 ${COUNTER_Y + 2} V72 a21 21 0 0 1 42 0 V${COUNTER_Y + 2} Z" fill="${S.blue}"/>
      <circle cx="206" cy="42" r="16" fill="${S.skin}"/>
      <circle cx="200" cy="42" r="2.6" fill="${S.dark}"/>
      <circle cx="212" cy="42" r="2.6" fill="${S.dark}"/>
      <path d="M199 50a9 9 0 0 0 14 0z" fill="${S.red}"/>
    `,
    slot: { x: 89, y: 16, size: 46 },
  },

  prep: {
    shapes: `
      ${room}
      <rect x="22" y="94" width="76" height="10" rx="3" fill="${S.cream}"/>
      <path d="M74 46l9 5-27 39-7-5z" fill="${S.metal}"/>
      <path d="M49 85l7 5-11 5z" fill="${S.dark}"/>
      <circle cx="34" cy="88" r="6" fill="${S.red}"/>
      <circle cx="50" cy="90" r="5" fill="${S.green}"/>
      ${cook(118, 'M100 66 L80 56')}
    `,
    slot: COUNTER_SLOT,
  },

  // Waiting: a lidded pot and a clock while the food changes on its own. The
  // clock is kept above the dish slot so the two never collide.
  wait: {
    shapes: `
      ${room}
      <rect x="26" y="62" width="54" height="42" rx="6" fill="${S.metal}"/>
      <rect x="20" y="54" width="66" height="9" rx="4.5" fill="${S.cream}"/>
      <rect x="48" y="44" width="10" height="12" rx="5" fill="${S.counter}"/>
      <circle cx="200" cy="24" r="16" fill="${S.cream}"/>
      <circle cx="200" cy="24" r="11" fill="${S.white}"/>
      <path d="M200 24V16M200 24l7 5" stroke="${S.dark}" stroke-width="3.5" stroke-linecap="round"/>
      ${cook(118, 'M100 68 L88 76')}
    `,
    slot: COUNTER_SLOT,
  },

  taste: {
    shapes: `
      ${room}
      <rect x="24" y="66" width="50" height="38" rx="5" fill="${S.metal}"/>
      <rect x="18" y="59" width="62" height="8" rx="4" fill="${S.cream}"/>
      <circle cx="40" cy="46" r="6" fill="${S.steam}"/>
      <circle cx="58" cy="36" r="7" fill="${S.steam}"/>
      ${cook(118, 'M102 64 L110 52')}
      <ellipse cx="109" cy="50" rx="8" ry="5.5" fill="${S.cream}"/>
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
