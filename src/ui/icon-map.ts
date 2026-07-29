// Maps a chunk to an icon id from ui/icons.ts.
//
// Keyed on the chunk's WORD, not its emoji, because the same emoji means
// different things depending on the word it was attached to: 🔥 is an oven on
// "The oven" but heat on "bakes", and 🍵 is a drink on "tea" but an action on
// "makes". Going by word also collapses the accidental synonyms the content
// picked up (❄️ and 🥶 both meant "cold"; ⏱️ and ⏲️ both meant "in ten
// minutes"), so one icon covers every phrasing of a concept.
//
// Anything not listed here falls back to the chunk's original emoji, so the
// game stays fully playable while the icon set is still being filled in.
import type { Chunk, Role } from '../game/stage-data';
import { hasIcon } from './icons';

type RoleFamily = 'S' | 'V' | 'O' | 'C' | 'M';

function roleFamily(r: Role): RoleFamily {
  if (r === 'O1' || r === 'O2') return 'O';
  return r as RoleFamily;
}

// Articles and possessives carry no visual meaning, so "the bread" / "bread"
// and "my mother" / "mother" collapse to one lookup key.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an|my|his|her)\s+/, '')
    .replace(/[.'"]/g, '');
}

// Nouns share one table: "the bread" appears as a subject in SV stages and as
// an object in SVO stages, and wants the same loaf either way.
const NOUN_ICONS: Record<string, string> = {
  // people — the pronouns all collapse onto one generic face, since a card
  // saying "him" only needs to signal "a person", not a specific character.
  cook: 'chef',
  chef: 'chef',
  waiter: 'chef',
  mother: 'mother',
  father: 'father',
  grandmother: 'grandmother',
  teacher: 'teacher',
  brother: 'boy',
  boy: 'boy',
  sister: 'girl',
  girl: 'girl',
  children: 'children',
  students: 'students',
  i: 'person',
  me: 'person',
  he: 'person',
  him: 'person',
  she: 'person',
  her: 'person',
  tom: 'person',
  maria: 'person',
  friend: 'person',
  we: 'group',
  us: 'group',
  they: 'group',
  them: 'group',
  class: 'group',
  family: 'group',
  // food and objects
  bread: 'bread',
  egg: 'egg',
  eggs: 'egg',
  rice: 'rice',
  'rice ball': 'onigiri',
  onigiri: 'onigiri',
  soup: 'soup',
  'miso soup': 'soup',
  tea: 'tea',
  cake: 'cake',
  fish: 'fish',
  chicken: 'chicken',
  meat: 'meat',
  vegetables: 'vegetables',
  onion: 'onion',
  onions: 'onion',
  tomato: 'tomato',
  tomatoes: 'tomato',
  potato: 'potato',
  potatoes: 'potato',
  carrot: 'carrot',
  apple: 'apple',
  apples: 'apple',
  banana: 'banana',
  bananas: 'banana',
  orange: 'orange',
  oranges: 'orange',
  fruit: 'fruit',
  cheese: 'cheese',
  butter: 'butter',
  milk: 'milk',
  juice: 'juice',
  'lemon juice': 'lemon',
  lemon: 'lemon',
  water: 'water',
  chocolate: 'chocolate',
  'ice cream': 'iceCream',
  salad: 'salad',
  sandwich: 'sandwich',
  hamburger: 'hamburger',
  sushi: 'sushi',
  tempura: 'tempura',
  noodles: 'noodles',
  ramen: 'noodles',
  spaghetti: 'spaghetti',
  pizza: 'pizza',
  cookies: 'cookies',
  curry: 'curry',
  sugar: 'sugar',
  salt: 'salt',
  spice: 'spice',
  lunch: 'lunch',
  // fixtures and abstractions that show up as subjects
  oven: 'bake',
  stove: 'stove',
  refrigerator: 'fridge',
  fridge: 'fridge',
  kitchen: 'kitchen',
  timer: 'minutes',
  time: 'minutes',
  sun: 'afternoon',
  heat: 'hot',
  door: 'closed',
  room: 'kitchen',
  menu: 'teach',
  recipe: 'teach',
  story: 'teach',
};

const VERB_ICONS: Record<string, string> = {
  make: 'make',
  makes: 'make',
  cook: 'cook',
  cooks: 'cook',
  fry: 'fry',
  fries: 'fry',
  boil: 'boil',
  boils: 'boil',
  bake: 'bake',
  bakes: 'bake',
  cut: 'cut',
  cuts: 'cut',
  taste: 'taste',
  tastes: 'taste',
  keep: 'keep',
  keeps: 'keep',
  mix: 'mix',
  mixes: 'mix',
  add: 'add',
  adds: 'add',
  wash: 'wash',
  washes: 'wash',
  clean: 'clean',
  cleans: 'clean',
  carry: 'carry',
  carries: 'carry',
  drink: 'drink',
  drinks: 'drink',
  eat: 'eat',
  eats: 'eat',
  pour: 'pour',
  pours: 'pour',
  send: 'send',
  sends: 'send',
  pass: 'pass',
  passes: 'pass',
  show: 'show',
  shows: 'show',
  teach: 'teach',
  teaches: 'teach',
  tell: 'tell',
  tells: 'tell',
  call: 'tell',
  calls: 'tell',
  buy: 'buy',
  buys: 'buy',
  sell: 'sell',
  sells: 'sell',
  give: 'give',
  gives: 'give',
  bring: 'bring',
  brings: 'bring',
  want: 'want',
  wants: 'want',
  need: 'need',
  needs: 'need',
  like: 'like',
  likes: 'like',
  find: 'find',
  finds: 'find',
  catch: 'catch',
  catches: 'catch',
  leave: 'leave',
  leaves: 'leave',
  stay: 'stay',
  stays: 'stay',
  become: 'become',
  becomes: 'become',
  turn: 'become',
  turns: 'become',
  get: 'become',
  gets: 'become',
  rise: 'rise',
  rises: 'rise',
  grow: 'grow',
  grows: 'grow',
  melt: 'melt',
  melts: 'melt',
  cry: 'cry',
  cries: 'cry',
  ring: 'ring',
  rings: 'ring',
  stop: 'stop',
  stops: 'stop',
  wait: 'waitFor',
  waits: 'waitFor',
  smell: 'sour',
  smells: 'sour',
  look: 'carefully',
  looks: 'carefully',
  feel: 'like',
  feels: 'like',
  burn: 'hot',
  burns: 'hot',
  dry: 'dry',
  dries: 'dry',
};

const STATE_ICONS: Record<string, string> = {
  hot: 'hot',
  cold: 'cold',
  soft: 'soft',
  fresh: 'fresh',
  sweet: 'sweet',
  warm: 'warm',
  brown: 'brown',
  clean: 'clean',
  good: 'tasty',
  delicious: 'tasty',
  tasty: 'tasty',
  nice: 'tasty',
  salty: 'salty',
  sour: 'sour',
  hard: 'hard',
  dry: 'dry',
  open: 'open',
  closed: 'closed',
  red: 'red',
  lunch: 'lunch',
  spicy: 'spicyState',
};

const MODIFIER_ICONS: Record<string, string> = {
  'every morning': 'morning',
  'in the morning': 'morning',
  'every night': 'night',
  'in ten minutes': 'minutes',
  'in five minutes': 'minutes',
  soon: 'minutes',
  'for an hour': 'waitFor',
  'in the kitchen': 'kitchen',
  'at home': 'kitchen',
  'every afternoon': 'afternoon',
  'before dinner': 'evening',
  'after dinner': 'night',
  'at the table': 'mealtime',
  'every day': 'calendar',
  'every weekend': 'weekend',
  'on sundays': 'sunday',
  'after school': 'school',
  'at school': 'school',
  quickly: 'quickly',
  slowly: 'slowly',
  carefully: 'carefully',
  together: 'together',
  'in the fridge': 'fridge',
  'on the stove': 'stove',
  'in the oven': 'bake',
  'in the pot': 'boil',
  'with a spoon': 'mix',
  'with a knife': 'cut',
  'at the party': 'give',
};

const TABLES: Record<RoleFamily, Record<string, string>> = {
  S: NOUN_ICONS,
  O: NOUN_ICONS,
  V: VERB_ICONS,
  C: STATE_ICONS,
  M: MODIFIER_ICONS,
};

export function iconIdFor(chunk: Chunk): string | undefined {
  const id = TABLES[roleFamily(chunk.r)][normalize(chunk.t)];
  return id && hasIcon(id) ? id : undefined;
}

// Renders the icon for a chunk, or the original emoji when no icon exists yet.
export function chunkFaceMarkup(chunk: Chunk): string {
  const id = iconIdFor(chunk);
  if (!id) return `<span class="chunk-emoji">${chunk.e}</span>`;
  return `<svg class="chunk-icon" viewBox="0 0 64 64"><use href="#ci-${id}"/></svg>`;
}
