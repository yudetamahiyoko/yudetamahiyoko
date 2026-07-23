// Ported from the original bunkei_kitchen.html prototype's STAGES array.
// Every example sentence is itself about cooking, so completing the sentence
// literally completes the dish it describes.
export type Role = 'S' | 'V' | 'O' | 'O1' | 'O2' | 'C' | 'M';

export interface Chunk {
  t: string; // word / phrase text
  r: Role;
  e: string; // emoji icon
}

export interface Puzzle {
  jp: string;
  en: string;
  dish: string;
  chunks: Chunk[];
}

export interface Stage {
  key: string;
  emoji: string;
  name: string;
  pattern: string;
  desc: string;
  puzzles: Puzzle[];
}

export const STAGES: Stage[] = [
  {
    key: 'SV',
    emoji: '🍚',
    name: '下ごしらえ：食材が変わりだす',
    pattern: 'S + V',
    desc: '食材(S)が動詞(V)だけで変化していく、いちばんシンプルな調理。',
    puzzles: [
      {
        jp: '米は15分で炊ける。',
        en: 'Rice cooks in 15 minutes.',
        dish: 'ほかほかご飯',
        chunks: [
          { t: 'Rice', r: 'S', e: '🍚' },
          { t: 'cooks', r: 'V', e: '🔥' },
          { t: 'in 15 minutes', r: 'M', e: '⏱️' },
        ],
      },
      {
        jp: 'お湯が沸く。',
        en: 'Water boils.',
        dish: 'ぐつぐつのお湯',
        chunks: [
          { t: 'Water', r: 'S', e: '💧' },
          { t: 'boils', r: 'V', e: '♨️' },
        ],
      },
      {
        jp: 'パン生地が膨らむ。',
        en: 'The dough rises.',
        dish: 'ふっくらパン生地',
        chunks: [
          { t: 'The dough', r: 'S', e: '🫓' },
          { t: 'rises', r: 'V', e: '⬆️' },
        ],
      },
    ],
  },
  {
    key: 'SVC',
    emoji: '🍜',
    name: '味見チェック：仕上がりの一皿',
    pattern: 'S + V + C',
    desc: '動詞のあとの言葉(C)が食材(S)の状態そのものを言い換える。S ＝ C の関係だよ。',
    puzzles: [
      {
        jp: 'スープはいい香りがする。',
        en: 'The soup smells great.',
        dish: 'いい香りのスープ',
        chunks: [
          { t: 'The soup', r: 'S', e: '🍲' },
          { t: 'smells', r: 'V', e: '👃' },
          { t: 'great', r: 'C', e: '✨' },
        ],
      },
      {
        jp: 'クッキーは10分で黄金色になる。',
        en: 'The cookies turn golden in ten minutes.',
        dish: '黄金色のクッキー',
        chunks: [
          { t: 'The cookies', r: 'S', e: '🍪' },
          { t: 'turn', r: 'V', e: '🔄' },
          { t: 'golden', r: 'C', e: '🟡' },
          { t: 'in ten minutes', r: 'M', e: '⏱️' },
        ],
      },
      {
        jp: 'シチューが辛くなる。',
        en: 'The stew becomes spicy.',
        dish: 'ピリ辛シチュー',
        chunks: [
          { t: 'The stew', r: 'S', e: '🍛' },
          { t: 'becomes', r: 'V', e: '🔄' },
          { t: 'spicy', r: 'C', e: '🌶️' },
        ],
      },
    ],
  },
  {
    key: 'SVO',
    emoji: '🍳',
    name: 'メイン：具材を加える一皿',
    pattern: 'S + V + O',
    desc: '調理する人(S)が具材(O)を１つ加える、基本の組み立て。',
    puzzles: [
      {
        jp: '私は塩を加える。',
        en: 'I add salt.',
        dish: 'ひとつまみの塩味',
        chunks: [
          { t: 'I', r: 'S', e: '🧑‍🍳' },
          { t: 'add', r: 'V', e: '➕' },
          { t: 'salt', r: 'O', e: '🧂' },
        ],
      },
      {
        jp: '彼女は手早く玉ねぎを刻む。',
        en: 'She chops onions quickly.',
        dish: '刻み玉ねぎ',
        chunks: [
          { t: 'She', r: 'S', e: '👩‍🍳' },
          { t: 'chops', r: 'V', e: '🔪' },
          { t: 'onions', r: 'O', e: '🧅' },
          { t: 'quickly', r: 'M', e: '⚡' },
        ],
      },
      {
        jp: '私たちは生地をこねる。',
        en: 'We knead the dough.',
        dish: 'こね上げた生地',
        chunks: [
          { t: 'We', r: 'S', e: '👥' },
          { t: 'knead', r: 'V', e: '👐' },
          { t: 'the dough', r: 'O', e: '🫓' },
        ],
      },
    ],
  },
  {
    key: 'SVOO',
    emoji: '🍱',
    name: 'おもてなし：二品盛り合わせ',
    pattern: 'S + V + O1 + O2',
    desc: '「誰に(O1)」「何を(O2)」を、シェフ(S)が一気に振る舞うおもてなし料理。',
    puzzles: [
      {
        jp: '私は毎朝彼にご飯を出す。',
        en: 'I serve him rice every morning.',
        dish: '湯気の立つご飯',
        chunks: [
          { t: 'I', r: 'S', e: '🧑‍🍳' },
          { t: 'serve', r: 'V', e: '🍽️' },
          { t: 'him', r: 'O1', e: '🙆‍♂️' },
          { t: 'rice', r: 'O2', e: '🍚' },
          { t: 'every morning', r: 'M', e: '🌅' },
        ],
      },
      {
        jp: '彼女は私たちにお茶を注ぐ。',
        en: 'She pours us tea.',
        dish: 'あたたかいお茶',
        chunks: [
          { t: 'She', r: 'S', e: '👩‍🍳' },
          { t: 'pours', r: 'V', e: '🫖' },
          { t: 'us', r: 'O1', e: '👥' },
          { t: 'tea', r: 'O2', e: '🍵' },
        ],
      },
      {
        jp: '彼は私にデザートをくれる。',
        en: 'He gives me dessert.',
        dish: '甘いデザート',
        chunks: [
          { t: 'He', r: 'S', e: '🧑' },
          { t: 'gives', r: 'V', e: '🎁' },
          { t: 'me', r: 'O1', e: '🙋‍♀️' },
          { t: 'dessert', r: 'O2', e: '🍰' },
        ],
      },
    ],
  },
  {
    key: 'SVOC',
    emoji: '🔥',
    name: '変化球メニュー：ひと手間の一皿',
    pattern: 'S + V + O + C',
    desc: '火加減(S)がひと手間で具材(O)を(C)の状態に変える、上級コース。O ＝ C の関係だよ。',
    puzzles: [
      {
        jp: '熱がご飯をふっくらさせる。',
        en: 'The heat makes the rice fluffy.',
        dish: 'ふっくらご飯',
        chunks: [
          { t: 'The heat', r: 'S', e: '🔥' },
          { t: 'makes', r: 'V', e: '🔄' },
          { t: 'the rice', r: 'O', e: '🍚' },
          { t: 'fluffy', r: 'C', e: '☁️' },
        ],
      },
      {
        jp: '私たちはこの料理をたこ焼きと呼ぶ。',
        en: 'We call this dish Takoyaki.',
        dish: 'たこ焼き',
        chunks: [
          { t: 'We', r: 'S', e: '👥' },
          { t: 'call', r: 'V', e: '📣' },
          { t: 'this dish', r: 'O', e: '🍽️' },
          { t: 'Takoyaki', r: 'C', e: '🐙' },
        ],
      },
      {
        jp: 'オーブンは20分でパンを黄金色にする。',
        en: 'The oven turns the bread golden in 20 minutes.',
        dish: '黄金色のパン',
        chunks: [
          { t: 'The oven', r: 'S', e: '🔥' },
          { t: 'turns', r: 'V', e: '🔄' },
          { t: 'the bread', r: 'O', e: '🍞' },
          { t: 'golden', r: 'C', e: '🟡' },
          { t: 'in 20 minutes', r: 'M', e: '⏱️' },
        ],
      },
    ],
  },
];
