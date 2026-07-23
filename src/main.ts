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

let audioContext: AudioContext | undefined;
let scheduler: Scheduler | undefined;
let indicator: BeatIndicator | undefined;
let tower: TowerGame | undefined;
let dishRevealTimer: number | undefined;
let puzzleTransitionTimer: number | undefined;
const tally = { just: 0, ok: 0, miss: 0, wrongWord: 0 };
const runner = new LevelRunner(STAGES);
const scoreTracker = new ScoreTracker();
const recipeCollection = new RecipeCollection();
const ALL_PUZZLES = STAGES.flatMap((stage) => stage.puzzles.map((puzzle) => ({ stage, puzzle })));

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
    const icons = puzzle.chunks.map((c) => c.e).join(' ');
    return `
      <div class="recipe-card">
        <span class="recipe-card-icon">${icons}</span>
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
  renderTally();
  renderScore();
  renderLevelTabs();
  flashNewlyUnlockedTabs(previouslyUnlocked);

  if (event.complete) {
    const finishedPuzzle = runner.puzzle;
    const isNewRecipe = recipeCollection.collect(finishedPuzzle.dish);
    renderRecipeButton();

    dishRevealTimer = window.setTimeout(() => {
      dishNameEl.textContent = isNewRecipe
        ? `🍽️ ${finishedPuzzle.dish}、完成！ "${finishedPuzzle.en}" ・ 🆕レシピ帳に追加！`
        : `🍽️ ${finishedPuzzle.dish}、完成！ "${finishedPuzzle.en}"`;
      dishNameEl.classList.add('show');
      if (isNewRecipe) {
        recipeBookBtn.classList.remove('just-collected');
        void recipeBookBtn.offsetWidth;
        recipeBookBtn.classList.add('just-collected');
      }
    }, 650);

    puzzleTransitionTimer = window.setTimeout(() => {
      runner.advanceToNextPuzzle();
      tower!.loadPuzzle(runner.puzzle);
      renderTicket();
    }, PUZZLE_COMPLETE_PAUSE_MS);
  }
}

function drawLoop(): void {
  requestAnimationFrame(drawLoop);
  indicator?.update();
  tower?.update();
}

startBtn.addEventListener('click', async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
    indicator = new BeatIndicator(audioContext, indicatorEl, dotsContainer, BEATS_PER_MEASURE);
    tower = new TowerGame(audioContext, gameBoardEl, handleLand);
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  scheduler?.stop();
  if (dishRevealTimer !== undefined) {
    clearTimeout(dishRevealTimer);
    dishRevealTimer = undefined;
  }
  if (puzzleTransitionTimer !== undefined) {
    clearTimeout(puzzleTransitionTimer);
    puzzleTransitionTimer = undefined;
  }
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

  scheduler = new Scheduler(audioContext, BPM, (beatNumber, time) => {
    const accent = beatNumber % BEATS_PER_MEASURE === 0;
    playClick(audioContext!, time, accent);
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

window.addEventListener('keydown', (e) => {
  const roles = ROLE_KEY_MAP[e.key.toUpperCase()];
  if (!roles) return;
  e.preventDefault();
  tower?.tapFirstPendingWithRole(roles);
});

renderTicket();
renderRecipeButton();
requestAnimationFrame(drawLoop);
