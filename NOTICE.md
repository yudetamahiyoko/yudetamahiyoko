# Third-party assets

## Twemoji

The ingredient, action and character artwork in this game is
[Twemoji](https://github.com/jdecked/twemoji), copyright the Twemoji
contributors, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The artwork is fetched by `scripts/fetch-twemoji.mjs` and baked into
`src/ui/twemoji-shapes.ts` so the game ships as a single self-contained page.
Which emoji represents which concept is chosen in that script; the game itself
resolves a word to a concept first (see `src/ui/icon-map.ts`), so the artwork is
selected by meaning rather than by whatever emoji happens to sit in the puzzle
data.

The credit is also shown in-game on the あそびかた (how to play) screen.
