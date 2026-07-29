import './style.css';
import { Scheduler } from './audio/scheduler';
import { playClick } from './audio/synth';
import { BeatIndicator } from './ui/beat-indicator';
import { STAGES } from './game/stage-data';
import { LevelRunner, LEVELS } from './game/level-runner';
import { TowerGame } from './game/tower-game';
import type { LandEvent } from './game/tower-game';
import type { Role } from './game/stage-data';
import { ScoreTracker } from './game/score-tracker';
import { RecipeCollection } from './game/recipe-collection';
import { ExamStatus } from './game/exam-status';
import { installIconSprite } from './ui/icons';
import { dishFaceMarkup } from './ui/dish-icon';
import { readStored, writeStored } from './util/storage';
import { buildRecognitionSet, buildPracticalSet, PATTERN_LABELS } from './game/exam-data';
import type { BasePattern } from './game/exam-data';

const ROLE_KEY_MAP: Record<string, Role[]> = {
  S: ['S'],
  V: ['V'],
  O: ['O'],
  C: ['C'],
  M: ['M'],
  '1': ['O1'],
  '2': ['O2'],
};

const BPM = 90;
const BEATS_PER_MEASURE = 4;
const PUZZLE_COMPLETE_PAUSE_MS = 2200;

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="title-screen" id="title-screen">
    <div class="title-card">
      <p class="title-eyebrow">ORDER UP · 英文法トレーニング</p>
      <h1 class="title-heading">🍳 文型キッチン</h1>
      <p class="title-sub">具材をタップしてタワーに積み上げ、英語の5文型をマスターしよう</p>
      <button id="title-next-btn">あそびかたを見る ▶</button>
    </div>
  </div>

  <div class="tutorial-screen hidden" id="tutorial-screen">
    <div class="tutorial-card">
      <h2>📖 あそびかた</h2>
      <ul class="tutorial-list">
        <li><span class="tutorial-icon">👆</span>拍に合わせて浮き上がる具材をタップしよう</li>
        <li><span class="tutorial-icon">🏗️</span>正しい順番でタップすると、タワーに積み上がっていく</li>
        <li><span class="tutorial-icon">🎵</span>タイミングがぴったりだとコンボが繋がって高得点！</li>
        <li><span class="tutorial-icon">🔓</span>スコアを貯めてレベルを解放し、レシピ帳を集めよう</li>
      </ul>
      <p class="tutorial-goal">🍽️ 美味しい料理をたくさん作ろう！を目指そう！</p>
      <button id="tutorial-start-btn">はじめる</button>
    </div>
  </div>

  <div class="stage">
    <p class="order-slip">M2: タワー積み上げ プロトタイプ</p>
    <h1>文型キッチン</h1>

    <div class="level-tabs" id="level-tabs"></div>

    <div class="stage-meta">
      <span class="stage-pattern" id="stage-pattern"></span>
      <span class="bpm">BPM ${BPM}</span>
      <span class="score-value" id="score-value">⭐ 0</span>
      <span class="combo-value" id="combo-value"></span>
      <button class="recipe-book-btn" id="recipe-book-btn">📖 <span id="recipe-count">0/0</span></button>
      <button class="help-btn" id="help-btn">？</button>
      <button class="mute-btn" id="mute-btn">🔊</button>
      <button class="exam-entry-btn" id="exam-entry-btn">🔒 卒業試験</button>
    </div>

    <div class="metronome-row">
      <div class="beat-indicator" id="beat-indicator"></div>
      <div class="beat-dots" id="beat-dots"></div>
    </div>

    <div class="game-board" id="game-board"></div>

    <div class="ticket">
      <div class="ticket-label">ORDER</div>
      <div class="ticket-text-en" id="ticket-text-en"></div>
      <div class="ticket-text-jp" id="ticket-text-jp"></div>
    </div>

    <div class="dish-name" id="dish-name"></div>
    <div class="judgment-popup" id="judgment-popup"></div>
    <p class="tally" id="tally">Just: 0 / OK: 0 / Miss: 0</p>
  </div>

  <div class="bottom-bar">
    <label class="mode-toggle">
      <input type="checkbox" id="mode-toggle" checked />
      <span id="mode-toggle-label">基礎編(役割ラベル表示あり)</span>
    </label>
    <button id="start-btn">スタート</button>
    <p class="hint">拍に合わせて浮き上がった具材をクリック、またはS/V/O/Cキー(O1は1、O2は2)でタップ</p>
  </div>

  <div class="recipe-modal" id="recipe-modal">
    <div class="recipe-modal-inner">
      <div class="recipe-modal-header">
        <h2>📖 レシピ帳 <span id="recipe-modal-count">0/0</span></h2>
        <button class="recipe-modal-close" id="recipe-modal-close">✕</button>
      </div>
      <div class="recipe-grid" id="recipe-grid"></div>
    </div>
  </div>

  <div class="delicious-overlay" id="delicious-overlay">
    <div class="delicious-emojis" id="delicious-emojis"></div>
    <div class="delicious-label">😋 美味しい！</div>
    <div class="delicious-dish" id="delicious-dish"></div>
  </div>

  <div class="levelup-overlay" id="levelup-overlay">
    <div class="levelup-emoji">🎉</div>
    <div class="levelup-label" id="levelup-label"></div>
    <div class="levelup-sub" id="levelup-sub"></div>
  </div>

  <div class="exam-modal" id="exam-modal">
    <div class="exam-modal-inner">
      <button class="exam-close-btn" id="exam-close-btn">✕</button>

      <div class="exam-phase" id="exam-intro">
        <h2>🎓 卒業試験</h2>
        <div class="exam-master">
          <div class="exam-master-avatar">🧑‍🍳<span class="exam-master-name">師匠</span></div>
          <div class="exam-master-bubble"><p>お前が一人前かどうか、ワシが見極めてやる。</p></div>
        </div>
        <p class="exam-desc">一次試験：文型を見抜け（10問）<br>二次試験：本番の注文をこなせ（5皿・ヒントなし）</p>
        <button id="exam-start-btn">試験を受ける</button>
      </div>

      <div class="exam-phase hidden" id="exam-recognition">
        <p class="exam-phase-label">一次試験：文型判定</p>
        <div class="exam-progress" id="exam-rec-progress">問題 1/10</div>
        <div class="exam-timer-bar"><div class="exam-timer-fill" id="exam-timer-fill"></div></div>
        <div class="exam-order-card">
          <p class="exam-sentence-en" id="exam-sentence-en"></p>
          <p class="exam-sentence-jp" id="exam-sentence-jp"></p>
        </div>
        <div class="exam-pattern-buttons" id="exam-pattern-buttons">
          <button data-pattern="SV">SV</button>
          <button data-pattern="SVC">SVC</button>
          <button data-pattern="SVO">SVO</button>
          <button data-pattern="SVOO">SVO₁O₂</button>
          <button data-pattern="SVOC">SVOC</button>
        </div>
        <div class="exam-feedback" id="exam-rec-feedback"></div>
      </div>

      <div class="exam-phase hidden" id="exam-practical">
        <p class="exam-phase-label">二次試験：本番調理</p>
        <div class="exam-progress" id="exam-prac-progress">注文 1/5</div>
        <p class="exam-mistakes" id="exam-prac-mistakes">ちがう具材: 0/4</p>
        <div class="exam-order-card">
          <p class="exam-sentence-en" id="exam-prac-en"></p>
          <p class="exam-sentence-jp" id="exam-prac-jp"></p>
        </div>
        <div class="exam-tower" id="exam-tower"></div>
      </div>

      <div class="exam-phase hidden" id="exam-result">
        <div id="exam-result-body"></div>
        <button id="exam-result-close-btn">もどる</button>
      </div>
    </div>
  </div>
`;

const levelTabsEl = document.querySelector<HTMLDivElement>('#level-tabs')!;
const stagePatternEl = document.querySelector<HTMLSpanElement>('#stage-pattern')!;
const scoreValueEl = document.querySelector<HTMLSpanElement>('#score-value')!;
const comboValueEl = document.querySelector<HTMLSpanElement>('#combo-value')!;
const ticketTextEnEl = document.querySelector<HTMLDivElement>('#ticket-text-en')!;
const ticketTextJpEl = document.querySelector<HTMLDivElement>('#ticket-text-jp')!;
const indicatorEl = document.querySelector<HTMLDivElement>('#beat-indicator')!;
const dotsContainer = document.querySelector<HTMLDivElement>('#beat-dots')!;
const gameBoardEl = document.querySelector<HTMLDivElement>('#game-board')!;
const dishNameEl = document.querySelector<HTMLDivElement>('#dish-name')!;
const popupEl = document.querySelector<HTMLDivElement>('#judgment-popup')!;
const tallyEl = document.querySelector<HTMLParagraphElement>('#tally')!;
const startBtn = document.querySelector<HTMLButtonElement>('#start-btn')!;
const modeToggleEl = document.querySelector<HTMLInputElement>('#mode-toggle')!;
const modeToggleLabelEl = document.querySelector<HTMLSpanElement>('#mode-toggle-label')!;
const recipeBookBtn = document.querySelector<HTMLButtonElement>('#recipe-book-btn')!;
const recipeCountEl = document.querySelector<HTMLSpanElement>('#recipe-count')!;
const recipeModalEl = document.querySelector<HTMLDivElement>('#recipe-modal')!;
const recipeModalCountEl = document.querySelector<HTMLSpanElement>('#recipe-modal-count')!;
const recipeModalCloseBtn = document.querySelector<HTMLButtonElement>('#recipe-modal-close')!;
const recipeGridEl = document.querySelector<HTMLDivElement>('#recipe-grid')!;
const titleScreenEl = document.querySelector<HTMLDivElement>('#title-screen')!;
const tutorialScreenEl = document.querySelector<HTMLDivElement>('#tutorial-screen')!;
const titleNextBtn = document.querySelector<HTMLButtonElement>('#title-next-btn')!;
const tutorialStartBtn = document.querySelector<HTMLButtonElement>('#tutorial-start-btn')!;
const helpBtn = document.querySelector<HTMLButtonElement>('#help-btn')!;
const muteBtn = document.querySelector<HTMLButtonElement>('#mute-btn')!;
const deliciousOverlayEl = document.querySelector<HTMLDivElement>('#delicious-overlay')!;
const deliciousEmojisEl = document.querySelector<HTMLDivElement>('#delicious-emojis')!;
const deliciousDishEl = document.querySelector<HTMLDivElement>('#delicious-dish')!;
const levelupOverlayEl = document.querySelector<HTMLDivElement>('#levelup-overlay')!;
const levelupLabelEl = document.querySelector<HTMLDivElement>('#levelup-label')!;
const levelupSubEl = document.querySelector<HTMLDivElement>('#levelup-sub')!;

const examEntryBtn = document.querySelector<HTMLButtonElement>('#exam-entry-btn')!;
const examModalEl = document.querySelector<HTMLDivElement>('#exam-modal')!;
const examCloseBtn = document.querySelector<HTMLButtonElement>('#exam-close-btn')!;
const examIntroEl = document.querySelector<HTMLDivElement>('#exam-intro')!;
const examStartBtn = document.querySelector<HTMLButtonElement>('#exam-start-btn')!;
const examRecognitionEl = document.querySelector<HTMLDivElement>('#exam-recognition')!;
const examRecProgressEl = document.querySelector<HTMLDivElement>('#exam-rec-progress')!;
const examTimerFillEl = document.querySelector<HTMLDivElement>('#exam-timer-fill')!;
const examSentenceEnEl = document.querySelector<HTMLParagraphElement>('#exam-sentence-en')!;
const examSentenceJpEl = document.querySelector<HTMLParagraphElement>('#exam-sentence-jp')!;
const examPatternButtonsEl = document.querySelector<HTMLDivElement>('#exam-pattern-buttons')!;
const examRecFeedbackEl = document.querySelector<HTMLDivElement>('#exam-rec-feedback')!;
const examPracticalEl = document.querySelector<HTMLDivElement>('#exam-practical')!;
const examPracProgressEl = document.querySelector<HTMLDivElement>('#exam-prac-progress')!;
const examPracMistakesEl = document.querySelector<HTMLParagraphElement>('#exam-prac-mistakes')!;
const examPracEnEl = document.querySelector<HTMLParagraphElement>('#exam-prac-en')!;
const examPracJpEl = document.querySelector<HTMLParagraphElement>('#exam-prac-jp')!;
const examTowerEl = document.querySelector<HTMLDivElement>('#exam-tower')!;
const examResultEl = document.querySelector<HTMLDivElement>('#exam-result')!;
const examResultBodyEl = document.querySelector<HTMLDivElement>('#exam-result-body')!;
const examResultCloseBtn = document.querySelector<HTMLButtonElement>('#exam-result-close-btn')!;

titleNextBtn.addEventListener('click', () => {
  titleScreenEl.classList.add('hidden');
  tutorialScreenEl.classList.remove('hidden');
});

tutorialStartBtn.addEventListener('click', () => {
  tutorialScreenEl.classList.add('hidden');
});

helpBtn.addEventListener('click', () => {
  tutorialScreenEl.classList.remove('hidden');
});

let audioContext: AudioContext | undefined;
let masterGain: GainNode | undefined;
// Remembered across reloads: without this, muting is undone by every page
// refresh, which is tedious for anyone who just wants to play in silence.
const MUTE_STORAGE_KEY = 'bunkei-kitchen-muted';
let muted = readStored(MUTE_STORAGE_KEY) === '1';
let scheduler: Scheduler | undefined;
let indicator: BeatIndicator | undefined;
let tower: TowerGame | undefined;
let examTower: TowerGame | undefined;
let dishRevealTimer: number | undefined;
let puzzleTransitionTimer: number | undefined;
let deliciousOverlayTimer: number | undefined;
let levelUpTimer: number | undefined;
let examTimerTimeout: number | undefined;
let examTransitionTimer: number | undefined;
const tally = { just: 0, ok: 0, miss: 0, wrongWord: 0 };
let puzzleStats = { just: 0, ok: 0, miss: 0, wrongWord: 0 };
const runner = new LevelRunner(STAGES);
const scoreTracker = new ScoreTracker();
const recipeCollection = new RecipeCollection();
const examStatus = new ExamStatus();
const ALL_PUZZLES = STAGES.flatMap((stage) => stage.puzzles.map((puzzle) => ({ stage, puzzle })));

const RECOGNITION_QUESTION_MS = 6000;
const RECOGNITION_PASS_THRESHOLD = 8;
const PRACTICAL_MISTAKE_BUDGET = 4;

interface RecognitionState {
  questions: ReturnType<typeof buildRecognitionSet>;
  index: number;
  correct: number;
  answered: boolean;
}
interface PracticalState {
  orders: ReturnType<typeof buildPracticalSet>;
  index: number;
  mistakes: number;
}
let recState: RecognitionState | undefined;
let pracState: PracticalState | undefined;

function isUnlocked(levelIdx: number): boolean {
  return scoreTracker.score >= LEVELS[levelIdx].unlockScore;
}

function renderLevelTabs(): void {
  levelTabsEl.innerHTML = LEVELS.map((lvl, i) => {
    const locked = !isUnlocked(i);
    const classes = ['level-tab'];
    if (i === runner.levelIndex) classes.push('active');
    if (locked) classes.push('locked');
    const label = locked ? `🔒 ${lvl.label}（${lvl.unlockScore}点）` : lvl.label;
    return `<button class="${classes.join(' ')}" data-level="${i}" ${locked ? 'disabled' : ''}>${label}</button>`;
  }).join('');
}

// The exam unlocks once the player has actually completed at least one
// dish from every one of the 10 patterns — a direct check that they've
// been exposed to all of them, rather than an indirect score proxy (score
// can be padded by replaying the same easy pattern for combo bonuses
// without ever touching the harder ones).
function masteredStageCount(): number {
  return STAGES.filter((stage) => stage.puzzles.some((p) => recipeCollection.has(p.dish))).length;
}

function isExamUnlocked(): boolean {
  return masteredStageCount() >= STAGES.length;
}

function renderExamEntry(): void {
  const unlocked = isExamUnlocked();
  examEntryBtn.disabled = !unlocked;
  examEntryBtn.textContent = examStatus.graduated
    ? '🎓 一人前シェフ'
    : unlocked
      ? '🎓 卒業試験'
      : `🔒 卒業試験（${masteredStageCount()}/${STAGES.length}種類）`;
}

function renderScore(): void {
  scoreValueEl.textContent = `⭐ ${scoreTracker.score}`;
  comboValueEl.textContent = scoreTracker.combo >= 2 ? `🔥${scoreTracker.combo}連続 ×${scoreTracker.multiplier}` : '';
}

function flashNewlyUnlockedTabs(previouslyUnlocked: boolean[]): void {
  LEVELS.forEach((_, i) => {
    if (!previouslyUnlocked[i] && isUnlocked(i)) {
      const el = levelTabsEl.querySelector<HTMLButtonElement>(`[data-level="${i}"]`);
      el?.classList.add('just-unlocked');
    }
  });
}

function renderRecipeButton(): void {
  const text = `${recipeCollection.size}/${ALL_PUZZLES.length}`;
  recipeCountEl.textContent = text;
  recipeModalCountEl.textContent = text;
}

function renderRecipeGallery(): void {
  recipeGridEl.innerHTML = ALL_PUZZLES.map(({ stage, puzzle }) => {
    if (!recipeCollection.has(puzzle.dish)) {
      return `
        <div class="recipe-card locked">
          <span class="recipe-card-icon">❓</span>
          <span class="recipe-card-name">？？？</span>
        </div>`;
    }
    return `
      <div class="recipe-card">
        <span class="recipe-card-icon">${dishFaceMarkup(puzzle.dish)}</span>
        <span class="recipe-card-name">${puzzle.dish}</span>
        <span class="recipe-card-en">${puzzle.en}</span>
        <span class="recipe-card-stage">${stage.emoji} ${stage.key}</span>
      </div>`;
  }).join('');
}

recipeBookBtn.addEventListener('click', () => {
  renderRecipeGallery();
  recipeModalEl.classList.add('show');
});

recipeModalCloseBtn.addEventListener('click', () => {
  recipeModalEl.classList.remove('show');
});

recipeModalEl.addEventListener('click', (e) => {
  if (e.target === recipeModalEl) recipeModalEl.classList.remove('show');
});

function renderTicket(): void {
  renderLevelTabs();
  renderScore();
  stagePatternEl.textContent = `${runner.stage.emoji} ${runner.stage.key} (${runner.stage.pattern})`;
  ticketTextEnEl.textContent = runner.puzzle.en;
  ticketTextJpEl.textContent = runner.puzzle.jp;
  dishNameEl.textContent = '';
  dishNameEl.classList.remove('show');
  puzzleStats = { just: 0, ok: 0, miss: 0, wrongWord: 0 };
}

// Grades how the CURRENT puzzle went (not lifetime stats) — a quick,
// per-dish quality readout distinct from the cumulative score/level system.
function gradeForPuzzle(stats: typeof puzzleStats): { emoji: string; label: string } {
  if (stats.wrongWord === 0 && stats.miss === 0) {
    return { emoji: '😋', label: '美味しい！' };
  }
  if (stats.wrongWord <= 1 && stats.miss <= 2) {
    return { emoji: '🙂', label: '普通' };
  }
  return { emoji: '😅', label: 'まずい…' };
}

levelTabsEl.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLButtonElement>('.level-tab');
  if (!target || target.disabled) return;
  const idx = Number(target.dataset.level);
  runner.selectLevel(idx);
  tower?.loadPuzzle(runner.puzzle);
  renderTicket();
});

function renderTally(): void {
  tallyEl.textContent = `Just: ${tally.just} / OK: ${tally.ok} / コンボ途切れ: ${tally.miss} / ちがう具材: ${tally.wrongWord}`;
}

function showPopup(text: string, cls: string): void {
  popupEl.textContent = text;
  popupEl.className = `judgment-popup ${cls}`;
}

function handleLand(event: LandEvent): void {
  if (event.kind === 'wrong-word') {
    tally.wrongWord += 1;
    puzzleStats.wrongWord += 1;
    showPopup('ちがう具材！', 'miss');
    renderTally();
    return;
  }

  const previouslyUnlocked = LEVELS.map((_, i) => isUnlocked(i));

  const gained = scoreTracker.registerLanding(event.timing);
  if (event.timing === 'just') {
    showPopup(`Just! +${gained}`, 'just');
  } else if (event.timing === 'ok') {
    showPopup(`OK +${gained}`, 'ok');
  } else {
    showPopup(`おしい… +${gained}（コンボ途切れ）`, 'combo-break');
  }
  tally[event.timing] += 1;
  puzzleStats[event.timing] += 1;
  renderTally();
  renderScore();
  renderLevelTabs();
  renderExamEntry();
  flashNewlyUnlockedTabs(previouslyUnlocked);

  if (event.complete) {
    const finishedPuzzle = runner.puzzle;
    const isNewRecipe = recipeCollection.collect(finishedPuzzle.dish);
    const grade = gradeForPuzzle(puzzleStats);
    renderRecipeButton();
    renderExamEntry();

    dishRevealTimer = window.setTimeout(() => {
      const base = `${grade.emoji} ${finishedPuzzle.dish}、完成！(${grade.label}) "${finishedPuzzle.en}"`;
      dishNameEl.textContent = isNewRecipe ? `${base} ・ 🆕レシピ帳に追加！` : base;
      dishNameEl.classList.add('show');
      if (isNewRecipe) {
        recipeBookBtn.classList.remove('just-collected');
        void recipeBookBtn.offsetWidth;
        recipeBookBtn.classList.add('just-collected');
      }

      if (grade.label === '美味しい！') {
        deliciousEmojisEl.innerHTML = dishFaceMarkup(finishedPuzzle.dish, 'dish-icon-large');
        deliciousDishEl.textContent = finishedPuzzle.dish;
        deliciousOverlayEl.classList.add('show');
        deliciousOverlayTimer = window.setTimeout(() => {
          deliciousOverlayEl.classList.remove('show');
        }, 1600);
      }
    }, 650);

    puzzleTransitionTimer = window.setTimeout(() => {
      const levelBefore = runner.levelIndex;
      runner.advanceToNextPuzzle();

      if (runner.levelIndex !== levelBefore) {
        levelupLabelEl.textContent = `🎉 ${LEVELS[runner.levelIndex].label} 突入！`;
        levelupSubEl.textContent = `${runner.stage.emoji} ${runner.stage.key} (${runner.stage.pattern}) が新登場`;
        levelupOverlayEl.classList.add('show');
        levelUpTimer = window.setTimeout(() => {
          levelupOverlayEl.classList.remove('show');
          tower!.loadPuzzle(runner.puzzle);
          renderTicket();
        }, 2400);
      } else {
        tower!.loadPuzzle(runner.puzzle);
        renderTicket();
      }
    }, PUZZLE_COMPLETE_PAUSE_MS);
  }
}

function drawLoop(): void {
  requestAnimationFrame(drawLoop);
  indicator?.update();
  tower?.update();
  examTower?.update();
}

// Lazily creates the shared AudioContext/masterGain (and the practice-mode
// tower/beat-indicator, which depend on it) — used by both the practice
// "スタート" button and the exam's "試験を受ける" button, since either can
// be the very first thing the player clicks.
async function ensureAudioContext(): Promise<void> {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    applyMute();
    indicator = new BeatIndicator(audioContext, indicatorEl, dotsContainer, BEATS_PER_MEASURE);
    tower = new TowerGame(audioContext, masterGain, gameBoardEl, handleLand);
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

startBtn.addEventListener('click', async () => {
  await ensureAudioContext();

  scheduler?.stop();
  if (dishRevealTimer !== undefined) {
    clearTimeout(dishRevealTimer);
    dishRevealTimer = undefined;
  }
  if (puzzleTransitionTimer !== undefined) {
    clearTimeout(puzzleTransitionTimer);
    puzzleTransitionTimer = undefined;
  }
  if (deliciousOverlayTimer !== undefined) {
    clearTimeout(deliciousOverlayTimer);
    deliciousOverlayTimer = undefined;
  }
  if (levelUpTimer !== undefined) {
    clearTimeout(levelUpTimer);
    levelUpTimer = undefined;
  }
  deliciousOverlayEl.classList.remove('show');
  levelupOverlayEl.classList.remove('show');
  indicator!.reset();
  scoreTracker.combo = 0;
  tally.just = 0;
  tally.ok = 0;
  tally.miss = 0;
  tally.wrongWord = 0;
  renderTally();
  popupEl.textContent = '';
  popupEl.className = 'judgment-popup';
  renderTicket();
  tower!.loadPuzzle(runner.puzzle);

  scheduler = new Scheduler(audioContext!, BPM, (beatNumber, time) => {
    playClick(audioContext!, masterGain!, time, beatNumber % BEATS_PER_MEASURE);
    indicator!.enqueue(beatNumber, time);
    tower!.registerBeat(time);
  });
  scheduler.start();

  startBtn.textContent = '再スタート';
});

function applyMode(): void {
  const showLabels = modeToggleEl.checked;
  gameBoardEl.classList.toggle('hide-role-labels', !showLabels);
  modeToggleLabelEl.textContent = showLabels ? '基礎編(役割ラベル表示あり)' : '応用編(役割ラベル非表示)';
}

modeToggleEl.addEventListener('change', applyMode);
applyMode();

function applyMute(): void {
  if (masterGain) masterGain.gain.value = muted ? 0 : 1;
  muteBtn.textContent = muted ? '🔇' : '🔊';
}

muteBtn.addEventListener('click', () => {
  muted = !muted;
  writeStored(MUTE_STORAGE_KEY, muted ? '1' : '0');
  applyMute();
});
applyMute();

window.addEventListener('keydown', (e) => {
  const roles = ROLE_KEY_MAP[e.key.toUpperCase()];
  if (!roles) return;
  e.preventDefault();
  tower?.tapFirstPendingWithRole(roles);
});

// ---- Graduation exam (卒業試験) ----
// Two stages, judged narratively by a "師匠" (master): a recognition quiz
// (pick the pattern of a given sentence) then a practical build (assemble
// the sentence with decoy words mixed in, no role-label hints). Passing
// both is the one place in this game with a real fail state — everywhere
// else, grammar order is the only thing that can fail, but a graduation
// exam without stakes wouldn't read as an exam.
function ensureExamTower(): void {
  if (!examTower) {
    examTower = new TowerGame(audioContext!, masterGain!, examTowerEl, handleExamLand);
  }
}

// Renders 師匠's line as a portrait + speech bubble (matching the static
// markup used on the intro phase) so every dialogue moment in the exam
// looks like the same character talking, not a stray line of text.
function masterBubble(line: string): string {
  return `
    <div class="exam-master">
      <div class="exam-master-avatar">🧑‍🍳<span class="exam-master-name">師匠</span></div>
      <div class="exam-master-bubble"><p>${line}</p></div>
    </div>
  `;
}

function showExamPhase(phase: 'intro' | 'recognition' | 'practical' | 'result'): void {
  examIntroEl.classList.toggle('hidden', phase !== 'intro');
  examRecognitionEl.classList.toggle('hidden', phase !== 'recognition');
  examPracticalEl.classList.toggle('hidden', phase !== 'practical');
  examResultEl.classList.toggle('hidden', phase !== 'result');
}

function clearExamTimers(): void {
  if (examTimerTimeout !== undefined) {
    clearTimeout(examTimerTimeout);
    examTimerTimeout = undefined;
  }
  if (examTransitionTimer !== undefined) {
    clearTimeout(examTransitionTimer);
    examTransitionTimer = undefined;
  }
}

function closeExamModal(): void {
  examModalEl.classList.remove('show');
  clearExamTimers();
  recState = undefined;
  pracState = undefined;
}

examEntryBtn.addEventListener('click', () => {
  if (examEntryBtn.disabled) return;
  examModalEl.classList.add('show');
  showExamPhase('intro');
});

examCloseBtn.addEventListener('click', closeExamModal);
examResultCloseBtn.addEventListener('click', closeExamModal);

examStartBtn.addEventListener('click', async () => {
  await ensureAudioContext();
  ensureExamTower();
  startRecognitionPhase();
});

function startRecognitionPhase(): void {
  recState = { questions: buildRecognitionSet(10), index: 0, correct: 0, answered: false };
  showExamPhase('recognition');
  renderRecognitionQuestion();
}

function renderRecognitionQuestion(): void {
  if (!recState) return;
  const q = recState.questions[recState.index];
  examRecProgressEl.textContent = `問題 ${recState.index + 1}/${recState.questions.length}`;
  examSentenceEnEl.textContent = q.puzzle.en;
  examSentenceJpEl.textContent = q.puzzle.jp;
  examRecFeedbackEl.textContent = '';
  recState.answered = false;
  examPatternButtonsEl.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
    b.disabled = false;
    b.classList.remove('correct', 'wrong');
  });

  examTimerFillEl.classList.remove('run');
  void examTimerFillEl.offsetWidth;
  examTimerFillEl.classList.add('run');

  if (examTimerTimeout !== undefined) clearTimeout(examTimerTimeout);
  examTimerTimeout = window.setTimeout(() => answerRecognition(undefined), RECOGNITION_QUESTION_MS);
}

function answerRecognition(chosen: BasePattern | undefined): void {
  if (!recState || recState.answered) return;
  recState.answered = true;
  if (examTimerTimeout !== undefined) {
    clearTimeout(examTimerTimeout);
    examTimerTimeout = undefined;
  }

  const q = recState.questions[recState.index];
  const isCorrect = chosen === q.answer;
  if (isCorrect) recState.correct += 1;

  examPatternButtonsEl.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
    b.disabled = true;
    if (b.dataset.pattern === q.answer) b.classList.add('correct');
    else if (b.dataset.pattern === chosen) b.classList.add('wrong');
  });
  examRecFeedbackEl.innerHTML = masterBubble(
    isCorrect
      ? 'うむ、正しい。'
      : chosen === undefined
        ? `遅い！正解は${PATTERN_LABELS[q.answer]}だ。`
        : `違う。正解は${PATTERN_LABELS[q.answer]}だ。`,
  );

  examTransitionTimer = window.setTimeout(() => {
    if (!recState) return;
    recState.index += 1;
    if (recState.index >= recState.questions.length) {
      finishRecognitionPhase();
    } else {
      renderRecognitionQuestion();
    }
  }, 1000);
}

examPatternButtonsEl.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-pattern]');
  if (!btn || btn.disabled) return;
  answerRecognition(btn.dataset.pattern as BasePattern);
});

function finishRecognitionPhase(): void {
  if (!recState) return;
  const passed = recState.correct >= RECOGNITION_PASS_THRESHOLD;
  const correct = recState.correct;
  const total = recState.questions.length;
  recState = undefined;
  if (passed) {
    startPracticalPhase();
  } else {
    showExamResult(false, `一次試験 ${correct}/${total}問正解 — ${RECOGNITION_PASS_THRESHOLD}問以上が合格ライン。`);
  }
}

function startPracticalPhase(): void {
  pracState = { orders: buildPracticalSet(2), index: 0, mistakes: 0 };
  showExamPhase('practical');
  ensureExamTower();
  loadPracticalOrder();
}

function loadPracticalOrder(): void {
  if (!pracState) return;
  const order = pracState.orders[pracState.index];
  examPracProgressEl.textContent = `注文 ${pracState.index + 1}/${pracState.orders.length}`;
  examPracMistakesEl.textContent = `ちがう具材: ${pracState.mistakes}/${PRACTICAL_MISTAKE_BUDGET}`;
  examPracEnEl.textContent = order.puzzle.en;
  examPracJpEl.textContent = order.puzzle.jp;
  examTower!.loadPuzzle(order.puzzle, order.decoys);
}

function handleExamLand(event: LandEvent): void {
  if (!pracState) return;
  if (event.kind === 'wrong-word') {
    pracState.mistakes += 1;
    examPracMistakesEl.textContent = `ちがう具材: ${pracState.mistakes}/${PRACTICAL_MISTAKE_BUDGET}`;
    return;
  }
  if (!event.complete) return;

  examTransitionTimer = window.setTimeout(() => {
    if (!pracState) return;
    pracState.index += 1;
    if (pracState.index >= pracState.orders.length) {
      finishPracticalPhase();
    } else {
      loadPracticalOrder();
    }
  }, 900);
}

function finishPracticalPhase(): void {
  if (!pracState) return;
  const mistakes = pracState.mistakes;
  const passed = mistakes <= PRACTICAL_MISTAKE_BUDGET;
  pracState = undefined;
  if (passed) {
    examStatus.markGraduated();
    renderExamEntry();
  }
  showExamResult(passed, passed ? '' : `ちがう具材が${mistakes}回 — ${PRACTICAL_MISTAKE_BUDGET}回以内が合格ライン。`);
}

function showExamResult(passed: boolean, detail: string): void {
  showExamPhase('result');
  examResultBodyEl.innerHTML = passed
    ? `
      <p class="exam-result-emoji">🎉</p>
      <h3>合格！一人前シェフ認定</h3>
      ${masterBubble('よくやった。今日からお前は一人前だ。')}
      <p class="exam-result-sub">第1ステージ完了</p>
    `
    : `
      <p class="exam-result-emoji">🤔</p>
      <h3>まだ早い…</h3>
      ${masterBubble('まだ早い。修行を続けろ。')}
      <p class="exam-result-sub">${detail}</p>
    `;
}

installIconSprite();
renderTicket();
renderRecipeButton();
renderExamEntry();
requestAnimationFrame(drawLoop);
