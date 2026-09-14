// The customer waiting at the end of the counter.
//
// Gives the plated sentence somewhere to go: words are assembled left to right
// and handed to a person, so a finished sentence lands as "someone got their
// order" rather than "a counter is now full".
//
// The head is a Twemoji face from the same sprite the cards use, so the figure
// standing next to them belongs to the same drawing. Only the body is drawn
// here, and only to give the face somewhere to stand — a bare floating head
// beside the counter read as a sticker rather than a customer.
//
// Which events move them is a design decision, not a cosmetic one. Grammar is
// the only thing that can fail in this game — a mistimed tap has never blocked
// progress — so the customer only slumps when the WRONG INGREDIENT goes in.
// A broken combo leaves them waiting patiently, because punishing rhythm here
// would quietly reintroduce the failure state the game deliberately removed.
export type CustomerMood = 'waiting' | 'happy' | 'sad';

const FACE_ICON: Record<CustomerMood, string> = {
  waiting: 'faceWaiting',
  happy: 'faceHappy',
  sad: 'faceSad',
};

const SHIRT = '#5aa9e6';
const SPILL = '#b5741f';
const SPILL_FOOD = '#e0a527';
const HAIR = '#6d4523';

function customerSvg(mood: CustomerMood): string {
  // A dropped dish only appears in the sad state; that is what makes the
  // mistake legible as "the order was ruined" rather than just a mood swing.
  const spill =
    mood === 'sad'
      ? `<ellipse cx="70" cy="128" rx="20" ry="5" fill="${SPILL}"/>
         <path d="M58 122a12 6 0 0 1 24 0z" fill="${SPILL_FOOD}"/>
         <circle cx="88" cy="126" r="3.5" fill="${SPILL}"/>
         <circle cx="52" cy="127" r="2.8" fill="${SPILL}"/>`
      : '';
  return `
    <svg class="customer-svg" viewBox="0 0 96 136" role="img" aria-label="お客さん">
      <path d="M18 132V104a30 30 0 0 1 60 0v28z" fill="${SHIRT}"/>
      <use href="#ci-${FACE_ICON[mood]}" x="14" y="12" width="68" height="68"/>
      <!-- The emoji faces are bare heads. Hair is drawn over the top of the
           skull only, stopping well above the brows so it never hides the
           expression that carries the reaction. -->
      <path d="M21.5 31 A31 31 0 0 1 74.5 31 Z" fill="${HAIR}"/>
      ${spill}
    </svg>
  `;
}

export function customerMarkup(): string {
  return `
    <div class="customer" id="customer" data-mood="waiting">
      <div class="customer-bubble" id="customer-bubble"></div>
      <div class="customer-figure" id="customer-figure">${customerSvg('waiting')}</div>
    </div>
  `;
}

let clearMoodTimer: number | undefined;

// Moods are transient: the customer returns to waiting so the next order starts
// from a neutral read, and a stale "おいしい！" never sits over a fresh puzzle.
export function setCustomerMood(root: ParentNode, mood: CustomerMood, line = '', holdMs = 1400): void {
  const el = root.querySelector<HTMLDivElement>('#customer');
  const figure = root.querySelector<HTMLDivElement>('#customer-figure');
  const bubble = root.querySelector<HTMLDivElement>('#customer-bubble');
  if (!el || !figure || !bubble) return;

  if (clearMoodTimer !== undefined) clearTimeout(clearMoodTimer);

  el.dataset.mood = mood;
  figure.innerHTML = customerSvg(mood);
  bubble.textContent = line;
  bubble.classList.toggle('show', line !== '');

  // Restart the reaction animation even when the same mood fires twice.
  el.classList.remove('react-happy', 'react-sad');
  void el.offsetWidth;
  if (mood === 'happy') el.classList.add('react-happy');
  if (mood === 'sad') el.classList.add('react-sad');

  if (mood !== 'waiting') {
    clearMoodTimer = window.setTimeout(() => setCustomerMood(root, 'waiting'), holdMs);
  }
}
