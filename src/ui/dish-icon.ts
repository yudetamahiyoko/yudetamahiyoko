// Picks the illustration for a FINISHED DISH (recipe book, completion overlay).
//
// This deliberately ignores the sentence's grammar chunks. Showing those was
// wrong: "焼き鳥" was pictured as a drumstick plus a frying pan, because that's
// what "The chicken cooks." is made of — but the dish the player earned is meat
// on a skewer. A recipe card should picture the dish, not the sentence.
//
// Matching is on the Japanese dish name, longest/most-specific rule first, so
// "チーズトースト" resolves to toast rather than cheese and "バナナケーキ" to
// cake rather than banana. Order is therefore load-bearing — when adding a
// rule, put it above every more general term it contains.
import { hasIcon } from './icons';

const DISH_RULES: [string, string][] = [
  // Dishes whose form differs from their main ingredient.
  ['焼き鳥', 'yakitori'],
  ['やきとり', 'yakitori'],
  ['目玉焼き', 'fry'],
  ['卵焼き', 'omelette'],
  ['たまご焼き', 'omelette'],
  ['みそ汁', 'misoSoup'],
  ['やきそば', 'friedNoodles'],
  ['ハンバーガー', 'hamburger'],
  ['ハンバーグ', 'patty'],
  ['フライ', 'friedFish'],
  ['揚げ', 'friedFish'],
  ['天ぷら', 'tempura'],
  ['トースト', 'toast'],
  ['バターぬりパン', 'toast'],
  ['パイ', 'pie'],
  // Composite names: the dish type wins over the ingredient in it.
  ['ずし', 'sushi'],
  ['寿司', 'sushi'],
  ['おにぎり', 'onigiri'],
  ['スパゲッティ', 'spaghetti'],
  ['ラーメン', 'noodles'],
  ['麺', 'noodles'],
  ['ケーキ', 'cake'],
  ['クッキー', 'cookies'],
  ['アイス', 'iceCream'],
  ['ピザ', 'pizza'],
  ['サンド', 'sandwich'],
  ['カレー', 'curry'],
  ['サラダ', 'salad'],
  ['スープ', 'soup'],
  ['ジュース', 'juice'],
  ['ティー', 'tea'],
  ['メニュー', 'teach'],
  ['レシピ', 'teach'],
  ['はなし', 'teach'],
  // 「おやすみばなし」— the compound voices the h to b, so it needs its own rule.
  ['ばなし', 'teach'],
  ['アラーム', 'ring'],
  // Plain ingredients and drinks.
  ['ご飯', 'rice'],
  ['ごはん', 'rice'],
  ['ライス', 'rice'],
  ['パン', 'bread'],
  ['チョコ', 'chocolate'],
  ['オニオン', 'onion'],
  ['たまねぎ', 'onion'],
  ['玉ねぎ', 'onion'],
  ['エッグ', 'egg'],
  ['たまご', 'egg'],
  ['卵', 'egg'],
  ['トマト', 'tomato'],
  ['ポテト', 'potato'],
  ['じゃがいも', 'potato'],
  ['にんじん', 'carrot'],
  ['野菜', 'vegetables'],
  ['やさい', 'vegetables'],
  ['りんご', 'apple'],
  ['バナナ', 'banana'],
  ['オレンジ', 'orange'],
  ['フルーツ', 'fruit'],
  ['レモン', 'lemon'],
  ['チーズ', 'cheese'],
  ['バター', 'butter'],
  ['紅茶', 'tea'],
  ['お茶', 'tea'],
  ['緑茶', 'tea'],
  ['牛乳', 'milk'],
  ['ミルク', 'milk'],
  ['鶏肉', 'chicken'],
  ['チキン', 'chicken'],
  ['鳥', 'chicken'],
  ['ミート', 'meat'],
  ['魚', 'fish'],
  ['さかな', 'fish'],
  ['糖', 'sugar'],
  ['塩', 'salt'],
  ['お湯', 'water'],
  ['おゆ', 'water'],
  // Places and non-food rewards.
  ['キッチン', 'kitchen'],
  ['台所', 'kitchen'],
  ['だいどころ', 'kitchen'],
  ['部屋', 'kitchen'],
  ['へや', 'kitchen'],
  // Door dishes come in both states, and the sentence's meaning is the point —
  // picturing "leaves the door open" as a shut door would contradict the
  // grammar the card is teaching. The open ones are matched first.
  ['あけっぱなしドア', 'open'],
  ['ゆうしょくごのドア', 'open'],
  ['ドア', 'closed'],
  ['給食', 'lunch'],
  ['きゅうしょく', 'lunch'],
  ['ランチ', 'lunch'],
  ['おやつ', 'cookies'],
  ['夜ごはん', 'mealtime'],
  ['夕食', 'mealtime'],
  ['ゆうしょく', 'mealtime'],
];

export function dishIconId(dish: string): string | undefined {
  for (const [needle, id] of DISH_RULES) {
    if (dish.includes(needle) && hasIcon(id)) return id;
  }
  return undefined;
}

export function dishFaceMarkup(dish: string, className = 'dish-icon'): string {
  const id = dishIconId(dish);
  if (!id) return `<span class="${className} dish-icon-fallback">🍽️</span>`;
  return `<svg class="${className}" viewBox="0 0 64 64"><use href="#ci-${id}"/></svg>`;
}
