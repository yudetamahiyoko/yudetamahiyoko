// Downloads the Twemoji artwork for every icon concept and bakes it into
// src/ui/twemoji-shapes.ts.
//
// Run once (or after changing CONCEPT_EMOJI); the generated file is committed so
// the game still builds offline and ships as one self-contained page.
//
// Twemoji is CC BY 4.0 — see NOTICE.md and the credit shown in-game.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

// Most of these came from the puzzle data itself: each concept inherits the
// emoji the content most often attached to the words resolving to it. The
// entries commented below were changed by hand, either because two concepts had
// landed on the same picture or because the concept only appears in dish names
// and so had no chunk to learn from.
const CONCEPT_EMOJI = {
  chef: '👨‍🍳', mother: '👩', father: '👨',
  person: '🧑', // was 👩, which made every pronoun look like the mother
  group: '👥', boy: '👦', girl: '👧', grandmother: '👵',
  teacher: '👩‍🏫', children: '🧒', students: '🧑‍🎓',
  // Object pronouns get their own picture. Sharing `person` put two identical
  // cards in one puzzle for sentences like "He gives her chocolate."
  recipient: '🙋',
  // Maria and Tom appear in the same sentence ("Tom passes Maria bread"), so
  // the two named characters cannot share one figure either.
  personB: '🧑‍🦰',

  bread: '🍞', egg: '🥚', rice: '🍚', soup: '🍲', tea: '🍵', cake: '🍰',
  fish: '🐟', chicken: '🍗', meat: '🥩', vegetables: '🥦', onion: '🧅',
  tomato: '🍅', potato: '🥔', carrot: '🥕', apple: '🍎', banana: '🍌',
  orange: '🍊', fruit: '🍇', cheese: '🧀', butter: '🧈', milk: '🥛',
  juice: '🧃', water: '💧', chocolate: '🍫', iceCream: '🍨', salad: '🥗',
  sandwich: '🥪', hamburger: '🍔', sushi: '🍣', onigiri: '🍙', tempura: '🍤',
  noodles: '🍜', spaghetti: '🍝', pizza: '🍕', cookies: '🍪', curry: '🍛',
  sugar: '🍬', salt: '🧂', spice: '🌶️', lemon: '🍋',

  // Dish shapes that only ever come from a dish name, so there was no chunk to
  // derive them from.
  yakitori: '🍢', toast: '🥯', pie: '🥧', omelette: '🍳',
  misoSoup: '🥣', friedNoodles: '🥘', patty: '🍖', friedFish: '🍥',

  make: '🔄',
  // A cooking sentence often names both the action and the hob it happens on
  // ("I cook chicken on the stove"), so these must not share a picture: the
  // person cooks, the pan sits on the stove.
  cook: '🧑‍🍳', stove: '🫕',
  boil: '🫧', // was ♨️, which is now the oven
  bake: '🔥', cut: '🔪', taste: '👅',
  keep: '🔒', fry: '🍳',
  // Sentences name the action and the tool used for it ("mixes ... with a
  // spoon", "cuts ... with a knife"), so tool and action are separate pictures.
  mix: '🥣', spoon: '🥄', knife: '🍴',
  add: '➕', wash: '🚿', carry: '🚚',
  drink: '🥤', eat: '🍽️', pour: '🫗', send: '📨', pass: '🤝', show: '📋',
  teach: '📖',
  // Objects that appear alongside the verb that acts on them.
  recipe: '📝', menu: '🗒️', story: '📕',
  tell: '💬', buy: '🛒', sell: '💴', give: '🎁', bring: '🚶',
  want: '💭', need: '❗', like: '👍', // was 🤲, which read as "feels", not "likes"
  find: '🔍', catch: '🎣', leave: '👋', stay: '🟰',
  become: '🔁', // was 📉, a downward chart, which reads as getting worse
  rise: '⬆️', grow: '🌱', melt: '💧', cry: '😢', ring: '🔔', stop: '🛑',
  waitFor: '⏳',

  hot: '🥵', // was 🔥, which "Heat makes the soup hot" then showed twice
  cold: '🥶', soft: '☁️', fresh: '🌿',
  sweet: '🍭', // distinct from the sugar that causes it
  warm: '🌡️', brown: '🟤', clean: '✨', tasty: '😋',
  salty: '🧂', sour: '😖', // was 👃, the smelling nose rather than the taste
  hard: '🪨', dry: '🏜️',
  // "leaves the door closed" names the object and its state, so the door is its
  // own picture and the states are locks.
  door: '🚪', open: '🔓', closed: '🔐',
  red: '🔴', lunch: '🍱',
  spicyState: '🥴', // distinct from the spice that causes it

  morning: '🌅', night: '🌙', minutes: '⏱️', kitchen: '🏠',
  afternoon: '☀️',
  evening: '🌇', // was 🍽️, identical to mealtime
  mealtime: '🪑', // "at the table" — was 🍽️, identical to eat
  oven: '♨️', // its own concept, so "bakes in the oven" isn't one picture twice
  calendar: '📅',
  weekend: '🗓️', // was 📅, identical to calendar
  sunday: '⛪', school: '🏫', quickly: '⚡', slowly: '🐢',
  carefully: '👀', together: '🤝', fridge: '🧊',
  party: '🎉', // "gives us cake at the party" names both the giving and the party

  // The waiting customer's head. Drawn from the same set as the cards so the
  // figure beside them doesn't read as art from a different game.
  faceWaiting: '🙂', faceHappy: '😋', faceSad: '😞',
};

// Twemoji filenames are the emoji's codepoints, lowercase hex, dash-joined,
// with the variation selector dropped — that suffix is a text/emoji rendering
// hint and is not part of the artwork's name.
function codepoints(emoji) {
  return [...emoji]
    .map((c) => c.codePointAt(0))
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-');
}

const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg';

const entries = Object.entries(CONCEPT_EMOJI);
const shapes = {};
const failures = [];

for (const [id, emoji] of entries) {
  const file = `${codepoints(emoji)}.svg`;
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) {
    failures.push(`${id} (${emoji}) -> ${file} : HTTP ${res.status}`);
    continue;
  }
  const svg = await res.text();

  const viewBox = (svg.match(/viewBox="([^"]+)"/) ?? [, '0 0 36 36'])[1];
  let inner = svg.replace(/[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

  // Several Twemoji files define gradients with generic ids. Inlining 130+ of
  // them into one document would collide, and a collision silently repaints an
  // icon with another icon's gradient, so every id is namespaced per concept.
  const ids = [...inner.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const rawId of new Set(ids)) {
    const safe = `${id}-${rawId}`;
    inner = inner
      .replaceAll(`id="${rawId}"`, `id="${safe}"`)
      .replaceAll(`url(#${rawId})`, `url(#${safe})`)
      .replaceAll(`href="#${rawId}"`, `href="#${safe}"`);
  }

  shapes[id] = { viewBox, inner };
}

if (failures.length) {
  console.error('FAILED:\n' + failures.join('\n'));
  process.exit(1);
}

const out = `// GENERATED by scripts/fetch-twemoji.mjs — do not edit by hand.
//
// Twemoji artwork (https://github.com/jdecked/twemoji), CC BY 4.0.
// Each entry is one emoji's SVG contents, with its internal ids namespaced so
// that inlining every icon into a single sprite cannot cross-wire gradients.
export interface IconArt {
  viewBox: string;
  inner: string;
}

export const TWEMOJI_ART: Record<string, IconArt> = ${JSON.stringify(shapes, null, 2)};
`;

const outPath = path.join(root, 'src/ui/twemoji-shapes.ts');
fs.writeFileSync(outPath, out, 'utf8');
console.log(`wrote ${outPath}`);
console.log(`icons: ${Object.keys(shapes).length}`);
console.log(`size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} kB`);
