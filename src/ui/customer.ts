// The customer waiting at the end of the counter.
//
// Gives the plated sentence somewhere to go: words are assembled left to right
// and handed to a person, so a finished sentence lands as "someone got their
// order" rather than "a counter is now full".
//
// Which events move them is a design decision, not a cosmetic one. Grammar is
// the only thing that can fail in this game — a mistimed tap has never blocked
// progress — so the customer only slumps when the WRONG INGREDIENT goes in.
// A broken combo leaves them waiting patiently, because punishing rhythm here
// would quietly reintroduce the failure state the game deliberately removed.
export type CustomerMood = 'waiting' | 'happy' | 'sad';

const C = {
  skin: '#e8b98f',
  hair: '#5c3a1a',
  shirt: '#5aa9e6',
  cream: '#f5ecd8',
  white: '#ffffff',
  dark: '#2b2620',
  red: '#c15b4a',
  mustard: '#e0a527',
  spill: '#b5741f',
};

// One head, three expressions. Only the mouth and brows change, so the
// character stays recognizably the same person across moods.
function face(mood: CustomerMood): string {
  if (mood === 'happy') {
    return `
      <path d="M30 44a5 5 0 0 1 10 0" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M56 44a5 5 0 0 1 10 0" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M36 56a13 13 0 0 0 24 0z" fill="${C.red}"/>
    `;
  }
  if (mood === 'sad') {
    // Brows rise toward the middle. Sloping them the other way reads as anger,
    // which is a different feeling from the disappointment this is for.
    return `
      <circle cx="35" cy="47" r="3.2" fill="${C.dark}"/>
      <circle cx="61" cy="47" r="3.2" fill="${C.dark}"/>
      <path d="M28 43l12-5M68 43l-12-5" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 61a8 8 0 0 1 16 0" stroke="${C.dark}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    `;
  }
  return `
    <circle cx="35" cy="45" r="3.2" fill="${C.dark}"/>
    <circle cx="61" cy="45" r="3.2" fill="${C.dark}"/>
    <path d="M40 57h16" stroke="${C.dark}" stroke-width="3.4" stroke-linecap="round"/>
  `;
}

function customerSvg(mood: CustomerMood): string {
  // A dropped dish only appears in the sad state, which is what makes the
  // mistake legible as "the order was ruined" instead of a mood swing.
  const spill =
    mood === 'sad'
      ? `<ellipse cx="70" cy="128" rx="20" ry="5" fill="${C.spill}"/>
         <path d="M58 122a12 6 0 0 1 24 0z" fill="${C.mustard}"/>
         <circle cx="88" cy="126" r="3.5" fill="${C.spill}"/>
         <circle cx="52" cy="127" r="2.8" fill="${C.spill}"/>`
      : '';
  return `
    <svg class="customer-svg" viewBox="0 0 96 136" role="img" aria-label="お客さん">
      <path d="M18 132V104a30 30 0 0 1 60 0v28z" fill="${C.shirt}"/>
      <circle cx="48" cy="48" r="30" fill="${C.skin}"/>
      <!-- Hair stops at y=34, above the brow line, so the expression stays
           readable — drawn any lower it covers the eyes like a visor. -->
      <path d="M21.5 34 A30 30 0 0 1 74.5 34 Z" fill="${C.hair}"/>
      ${face(mood)}
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
