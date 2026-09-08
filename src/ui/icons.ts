// The chunk-card icon sprite.
//
// The artwork is Twemoji (CC BY 4.0), baked into src/ui/twemoji-shapes.ts by
// scripts/fetch-twemoji.mjs. It replaced a hand-drawn set: 133 icons is a lot of
// illustration to carry, and a professionally drawn, internally consistent set
// reads better at the 38px card size than shapes assembled from primitives.
//
// It is still inline SVG rather than image files, so the game keeps shipping as
// one self-contained page with no sub-resource requests, and every card that
// uses the same concept shares a single <symbol> definition.
//
// Which emoji stands for which concept is decided in scripts/fetch-twemoji.mjs.
// Note that icons are keyed by CONCEPT, not by the emoji sitting in the puzzle
// data: ui/icon-map.ts resolves a chunk's word first, so "bakes" and "The oven"
// still get different pictures even though the content gave both a 🔥.
import { TWEMOJI_ART } from './twemoji-shapes';

export const ICON_IDS = Object.keys(TWEMOJI_ART);

export function iconSpriteMarkup(): string {
  const symbols = Object.entries(TWEMOJI_ART)
    .map(([id, art]) => `<symbol id="ci-${id}" viewBox="${art.viewBox}">${art.inner}</symbol>`)
    .join('');
  return `<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// Share of its own canvas each icon's artwork should fill once normalized.
const TARGET_FILL = 0.92;

// Artwork does not agree on how much of its canvas it uses — some emoji are
// drawn edge to edge, others sit in generous padding — so the same nominal size
// can look noticeably smaller for one icon than another. Measuring the real
// bounding box once at startup and scaling each to a shared share of its canvas
// makes them optically consistent, and keeps that true for any icon added later
// without hand-tuning coordinates.
function normalizeIconScales(root: HTMLElement): void {
  root.querySelectorAll('symbol').forEach((sym) => {
    const vb = (sym.getAttribute('viewBox') ?? '0 0 36 36').split(/\s+/).map(Number);
    const [vbX, vbY, vbW, vbH] = vb;
    if (!vbW || !vbH) return;

    const g = document.createElementNS(SVG_NS, 'g');
    while (sym.firstChild) g.appendChild(sym.firstChild);
    sym.appendChild(g);

    const box = g.getBBox();
    // A zero box means the browser could not measure it; leaving the icon
    // untransformed beats dividing by zero.
    if (!box.width || !box.height) return;

    const target = TARGET_FILL * Math.min(vbW, vbH);
    const scale = target / Math.max(box.width, box.height);
    // Skip transforms that would not visibly change anything, so art already
    // drawn to fill its canvas is left exactly as its designer drew it.
    if (Math.abs(scale - 1) < 0.02) return;

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const toX = vbX + vbW / 2;
    const toY = vbY + vbH / 2;
    g.setAttribute(
      'transform',
      `translate(${toX} ${toY}) scale(${scale.toFixed(3)}) translate(${-cx.toFixed(2)} ${-cy.toFixed(2)})`,
    );
  });
}

export function installIconSprite(): void {
  if (document.getElementById('chunk-icon-sprite')) return;
  const holder = document.createElement('div');
  holder.id = 'chunk-icon-sprite';
  holder.innerHTML = iconSpriteMarkup();
  document.body.prepend(holder);
  normalizeIconScales(holder);
}

export function hasIcon(id: string): boolean {
  return id in TWEMOJI_ART;
}
