// Hand-authored flat-vector icon sprite, replacing the emoji on chunk cards.
//
// Why SVG symbols rather than image files: matches this project's "synthesize
// everything, ship no binary assets" approach (see audio/synth.ts) — icons
// stay crisp at any size, cost one shared definition each no matter how many
// cards reference them, and can be recolored from CSS.
//
// Style rules every icon follows, so a batch authored later still matches:
//   - 64x64 viewBox, artwork inset ~6 units from the edges
//   - flat filled shapes only (no gradients, no filters, no strokes thinner
//     than 3 units — they vanish at the 40px display size)
//   - 2-5 shapes max; the card overlays text on top of the icon, so detail
//     below that budget survives and detail above it turns to mud
//   - food keeps its real-world hue (a grey banana stops reading as a banana);
//     abstract concepts use the app's mustard/cream palette
const P = {
  cream: '#f5ecd8',
  white: '#ffffff',
  mustard: '#e0a527',
  deepGold: '#b5741f',
  brown: '#8a5a2b',
  darkBrown: '#5c3a1a',
  red: '#c15b4a',
  green: '#6fae5a',
  blue: '#5aa9e6',
  steam: '#9fb6c9',
  skin: '#e8b98f',
  pink: '#e0918f',
  grey: '#8a8578',
};

// Each entry is the inner markup of one <symbol>; ids get a `ci-` prefix.
const ICON_SHAPES: Record<string, string> = {
  // ---- People ----
  chef: `
    <circle cx="32" cy="36" r="15" fill="${P.skin}"/>
    <path d="M14 26a8 8 0 0 1 8-8 11 11 0 0 1 20 0 8 8 0 0 1 8 8v4H14z" fill="${P.white}"/>
    <rect x="15" y="28" width="34" height="6" rx="3" fill="${P.cream}"/>
    <circle cx="26" cy="38" r="2.2" fill="${P.darkBrown}"/>
    <circle cx="38" cy="38" r="2.2" fill="${P.darkBrown}"/>
  `,
  mother: `
    <path d="M13 40a19 19 0 0 1 38 0v10H13z" fill="${P.brown}"/>
    <circle cx="32" cy="32" r="14" fill="${P.skin}"/>
    <path d="M18 30a14 14 0 0 1 28 0v-3a14 14 0 0 0-28 0z" fill="${P.darkBrown}"/>
    <circle cx="27" cy="33" r="2.2" fill="${P.darkBrown}"/>
    <circle cx="37" cy="33" r="2.2" fill="${P.darkBrown}"/>
  `,
  father: `
    <path d="M14 52a18 18 0 0 1 36 0z" fill="${P.blue}"/>
    <circle cx="32" cy="30" r="14" fill="${P.skin}"/>
    <path d="M18 26a14 14 0 0 1 28 0z" fill="${P.grey}"/>
    <circle cx="27" cy="31" r="2.2" fill="${P.darkBrown}"/>
    <circle cx="37" cy="31" r="2.2" fill="${P.darkBrown}"/>
  `,
  person: `
    <path d="M14 52a18 18 0 0 1 36 0z" fill="${P.mustard}"/>
    <circle cx="32" cy="28" r="14" fill="${P.skin}"/>
    <circle cx="27" cy="29" r="2.2" fill="${P.darkBrown}"/>
    <circle cx="37" cy="29" r="2.2" fill="${P.darkBrown}"/>
  `,
  group: `
    <circle cx="20" cy="28" r="11" fill="${P.skin}"/>
    <path d="M6 52a14 14 0 0 1 28 0z" fill="${P.blue}"/>
    <circle cx="44" cy="26" r="12" fill="${P.skin}"/>
    <path d="M29 52a15 15 0 0 1 30 0z" fill="${P.mustard}"/>
  `,

  // ---- Ingredients / dishes ----
  bread: `
    <path d="M10 34a12 10 0 0 1 12-10h20a12 10 0 0 1 12 10v14a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="${P.deepGold}"/>
    <path d="M15 34a8 7 0 0 1 8-6h18a8 7 0 0 1 8 6z" fill="${P.mustard}"/>
  `,
  egg: `
    <ellipse cx="32" cy="36" rx="17" ry="21" fill="${P.white}"/>
    <circle cx="32" cy="38" r="8" fill="${P.mustard}"/>
  `,
  // Vessel icons must not share a silhouette: at card size a shallow ellipse
  // reads the same whether it held rice, soup, or was a frying pan. So rice
  // gets a tall heaped mound, soup a wide shallow bowl with steam, and the
  // cooking verbs below get side-on hardware instead of another bowl.
  rice: `
    <path d="M13 30a19 15 0 0 1 38 0z" fill="${P.white}"/>
    <path d="M12 32h40a20 20 0 0 1-40 0z" fill="${P.cream}"/>
    <rect x="9" y="29" width="46" height="5" rx="2.5" fill="${P.white}"/>
    <circle cx="26" cy="22" r="2.4" fill="${P.cream}"/>
    <circle cx="34" cy="19" r="2.4" fill="${P.cream}"/>
    <circle cx="41" cy="24" r="2.4" fill="${P.cream}"/>
  `,
  soup: `
    <path d="M8 30h48a24 15 0 0 1-48 0z" fill="${P.cream}"/>
    <path d="M13 32h38a19 10 0 0 1-38 0z" fill="${P.red}"/>
    <path d="M24 22c0-5 4-5 4-10M36 22c0-5 4-5 4-10" stroke="${P.steam}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `,
  tea: `
    <path d="M12 26h30v14a15 15 0 0 1-30 0z" fill="${P.cream}"/>
    <path d="M15 29h24v10a12 12 0 0 1-24 0z" fill="${P.green}"/>
    <path d="M42 30h5a6 6 0 0 1 0 12h-5" stroke="${P.cream}" stroke-width="4" fill="none"/>
    <path d="M22 18c0-4 4-4 4-8" stroke="${P.steam}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `,
  cake: `
    <path d="M12 34h40v16a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="${P.cream}"/>
    <path d="M12 34h40v7H12z" fill="${P.pink}"/>
    <path d="M12 34a20 8 0 0 1 40 0z" fill="${P.white}"/>
    <circle cx="32" cy="26" r="4" fill="${P.red}"/>
  `,

  // ---- Actions ----
  make: `
    <path d="M10 30h44a22 20 0 0 1-44 0z" fill="${P.cream}"/>
    <path d="M14 33h36a18 14 0 0 1-36 0z" fill="${P.mustard}"/>
    <path d="M40 12l8 6-20 22-8-6z" fill="${P.grey}"/>
  `,
  // Side-on pan with a long handle: a flat bar plus flames, deliberately
  // nothing like the round bowls above.
  cook: `
    <rect x="8" y="28" width="34" height="8" rx="3" fill="${P.grey}"/>
    <rect x="40" y="30" width="18" height="4.5" rx="2.25" fill="${P.darkBrown}"/>
    <path d="M16 26c-3-6 2-8 0-13 6 4 7 9 4 13zM28 26c-3-6 2-8 0-13 6 4 7 9 4 13z" fill="${P.mustard}"/>
    <path d="M12 40c-2-4 1-6 0-9 4 3 5 6 3 9zM24 42c-2-5 1-7 0-11 5 3 6 8 3 11zM36 40c-2-4 1-6 0-9 4 3 5 6 3 9z" fill="${P.red}"/>
  `,
  // Tall lidded pot with side handles — a distinct tower-ish silhouette.
  boil: `
    <rect x="16" y="26" width="32" height="26" rx="4" fill="${P.grey}"/>
    <rect x="10" y="21" width="44" height="6" rx="3" fill="${P.cream}"/>
    <rect x="8" y="32" width="7" height="5" rx="2.5" fill="${P.darkBrown}"/>
    <rect x="49" y="32" width="7" height="5" rx="2.5" fill="${P.darkBrown}"/>
    <circle cx="25" cy="14" r="4.5" fill="${P.steam}"/>
    <circle cx="38" cy="9" r="5.5" fill="${P.steam}"/>
  `,
  bake: `
    <rect x="10" y="12" width="44" height="42" rx="5" fill="${P.grey}"/>
    <rect x="16" y="24" width="32" height="24" rx="3" fill="${P.darkBrown}"/>
    <path d="M20 40a12 8 0 0 1 24 0z" fill="${P.mustard}"/>
    <rect x="16" y="16" width="32" height="4" rx="2" fill="${P.cream}"/>
  `,
  cut: `
    <rect x="8" y="42" width="48" height="8" rx="3" fill="${P.brown}"/>
    <path d="M44 10l8 4-26 24-6-4z" fill="${P.cream}"/>
    <path d="M20 34l6 4-8 6z" fill="${P.grey}"/>
    <circle cx="18" cy="38" r="4" fill="${P.red}"/>
  `,
  // A spoon lifted to an open mouth: "tasting" reads from the action, whereas a
  // bare tongue shape was being mistaken for a ribbon.
  taste: `
    <path d="M20 14h28a5 5 0 0 1 5 5 19 13 0 0 1-38 0 5 5 0 0 1 5-5z" fill="${P.pink}"/>
    <path d="M25 24h18a9 9 0 0 1-18 0z" fill="${P.red}"/>
    <ellipse cx="20" cy="42" rx="11" ry="7" fill="${P.cream}"/>
    <rect x="29" y="44" width="26" height="5" rx="2.5" fill="${P.grey}" transform="rotate(-14 29 44)"/>
  `,
  keep: `
    <rect x="12" y="30" width="40" height="22" rx="4" fill="${P.cream}"/>
    <path d="M8 26h48a4 4 0 0 1 0 6H8a4 4 0 0 1 0-6z" fill="${P.mustard}"/>
    <rect x="29" y="14" width="6" height="12" rx="3" fill="${P.grey}"/>
  `,

  // ---- States ----
  hot: `
    <path d="M32 8c8 10 14 14 14 24a14 14 0 0 1-28 0c0-10 6-14 14-24z" fill="${P.red}"/>
    <path d="M32 26c4 5 7 7 7 12a7 7 0 0 1-14 0c0-5 3-7 7-12z" fill="${P.mustard}"/>
  `,
  cold: `
    <path d="M29 8h6v48h-6z" fill="${P.blue}"/>
    <path d="M8 29h48v6H8z" fill="${P.blue}"/>
    <path d="M14 14l4-4 36 36-4 4z" fill="${P.blue}"/>
    <path d="M50 10l4 4-36 36-4-4z" fill="${P.blue}"/>
  `,
  soft: `
    <path d="M18 44a12 12 0 0 1 1-24 15 15 0 0 1 28 4 10 10 0 0 1-3 20z" fill="${P.white}"/>
  `,
  fresh: `
    <path d="M32 54C32 30 40 14 56 10c2 22-8 40-24 44z" fill="${P.green}"/>
    <path d="M32 54C24 34 16 22 8 20c0 20 10 32 24 34z" fill="#8bc46f"/>
  `,
  sweet: `
    <circle cx="32" cy="32" r="14" fill="${P.pink}"/>
    <path d="M18 26l-10-6v24l10-6z" fill="${P.red}"/>
    <path d="M46 26l10-6v24l-10-6z" fill="${P.red}"/>
  `,

  // ---- Modifiers (time / place) ----
  morning: `
    <circle cx="32" cy="34" r="13" fill="${P.mustard}"/>
    <rect x="6" y="44" width="52" height="5" rx="2.5" fill="${P.deepGold}"/>
    <path d="M32 8v8M12 20l6 6M52 20l-6 6" stroke="${P.mustard}" stroke-width="4" stroke-linecap="round"/>
  `,
  night: `
    <path d="M40 8a24 24 0 1 0 0 48 26 26 0 0 1 0-48z" fill="${P.cream}"/>
    <circle cx="50" cy="16" r="3" fill="${P.mustard}"/>
    <circle cx="44" cy="48" r="2.5" fill="${P.mustard}"/>
  `,
  minutes: `
    <circle cx="32" cy="34" r="21" fill="${P.cream}"/>
    <circle cx="32" cy="34" r="15" fill="${P.white}"/>
    <path d="M32 34V22M32 34l9 7" stroke="${P.darkBrown}" stroke-width="4" stroke-linecap="round"/>
    <rect x="27" y="6" width="10" height="5" rx="2.5" fill="${P.grey}"/>
  `,
  kitchen: `
    <path d="M32 8l24 18H8z" fill="${P.red}"/>
    <rect x="14" y="26" width="36" height="28" rx="3" fill="${P.cream}"/>
    <ellipse cx="32" cy="38" rx="11" ry="5" fill="${P.grey}"/>
    <path d="M28 48c-2-4 1-5 0-9 4 2 5 5 3 9z" fill="${P.mustard}"/>
  `,

  // ---- Ingredients, batch 2 ----
  // These were drawn against the same palette, but spell the colors as literal
  // hex rather than P.* references — they came in as one bulk batch and
  // rewriting every fill by hand would risk silently changing a color.
  fish: `
    <path d="M40 32 L60 18 L58 32 L60 46 Z" fill="#5aa9e6"/>
    <path d="M6 32 C14 14 34 12 46 22 C52 26 52 38 46 42 C34 52 14 50 6 32 Z" fill="#9fb6c9"/>
    <path d="M20 15 L30 8 L34 18 Z" fill="#5aa9e6"/>
    <circle cx="17" cy="29" r="3.5" fill="#5c3a1a"/>
  `,
  chicken: `
    <path d="M52 12 C60 20 56 32 46 34 C38 36 32 32 28 38 C24 44 26 50 20 52 C14 54 8 50 8 44 C8 38 14 34 18 30 C24 24 28 16 36 12 C42 9 48 8 52 12 Z" fill="#e08a3c"/>
    <path d="M46 8 C52 6 58 10 58 16 C58 20 55 23 51 23 C46 23 43 19 44 14 Z" fill="#f5ecd8"/>
    <circle cx="55" cy="9" r="6" fill="#f5ecd8"/>
    <circle cx="16" cy="46" r="7" fill="#b5741f"/>
  `,
  meat: `
    <path d="M10 22 L44 12 L58 26 L50 50 L18 54 L6 40 Z" fill="#c15b4a"/>
    <path d="M18 28 L40 21 L48 30 L42 44 L22 46 L15 37 Z" fill="#e0918f"/>
    <path d="M52 46 C58 46 62 50 62 55 C62 59 58 62 54 60 L46 56 C44 55 44 51 46 50 Z" fill="#f5ecd8"/>
  `,
  vegetables: `
    <circle cx="22" cy="20" r="13" fill="#6fae5a"/>
    <circle cx="42" cy="18" r="12" fill="#8bc46f"/>
    <circle cx="32" cy="32" r="13" fill="#6fae5a"/>
    <circle cx="47" cy="33" r="9" fill="#8bc46f"/>
    <path d="M26 38 L38 38 L36 60 L28 60 Z" fill="#8bc46f"/>
  `,
  onion: `
    <path d="M32 14 C46 14 54 26 54 38 C54 50 44 58 32 58 C20 58 10 50 10 38 C10 26 18 14 32 14 Z" fill="#f5ecd8"/>
    <path d="M32 14 C36 24 37 44 32 58 C27 44 28 24 32 14 Z" fill="#e0a527"/>
    <path d="M20 17 C22 28 22 46 18 55 C12 48 10 30 20 17 Z" fill="#e0a527"/>
    <path d="M44 17 C42 28 42 46 46 55 C52 48 54 30 44 17 Z" fill="#e0a527"/>
    <path d="M32 14 C30 6 24 2 18 2 C24 6 26 10 26 14 Z" fill="#6fae5a"/>
    <path d="M32 14 C34 6 40 2 46 2 C40 6 38 10 38 14 Z" fill="#6fae5a"/>
  `,
  tomato: `
    <circle cx="32" cy="38" r="22" fill="#c15b4a"/>
    <path d="M32 12 L38 22 L48 20 L42 28 L32 30 L22 28 L16 20 L26 22 Z" fill="#6fae5a"/>
    <rect x="29" y="8" width="6" height="10" rx="3" fill="#6fae5a"/>
  `,
  potato: `
    <path d="M12 30 C10 18 22 10 36 12 C50 14 58 24 56 36 C54 48 42 56 28 54 C16 52 14 42 12 30 Z" fill="#b5741f"/>
    <ellipse cx="26" cy="26" rx="4" ry="3" fill="#5c3a1a"/>
    <ellipse cx="42" cy="38" rx="4" ry="3" fill="#5c3a1a"/>
    <ellipse cx="31" cy="44" rx="3.5" ry="2.5" fill="#5c3a1a"/>
  `,
  carrot: `
    <path d="M20 22 L44 22 L34 60 L30 60 Z" fill="#e08a3c"/>
    <path d="M32 20 L14 8 L18 4 L32 12 Z" fill="#6fae5a"/>
    <path d="M32 20 L50 8 L46 4 L32 12 Z" fill="#6fae5a"/>
    <rect x="29" y="2" width="6" height="20" rx="3" fill="#8bc46f"/>
  `,
  apple: `
    <path d="M32 18 C42 12 56 18 56 34 C56 48 44 60 32 60 C20 60 8 48 8 34 C8 18 22 12 32 18 Z" fill="#c15b4a"/>
    <rect x="30" y="6" width="5" height="14" rx="2.5" fill="#5c3a1a"/>
    <path d="M34 12 C40 4 52 4 54 8 C50 18 40 18 34 12 Z" fill="#6fae5a"/>
  `,
  banana: `
    <path d="M8 20 C8 44 26 60 50 56 C58 54 60 46 54 44 C36 44 22 30 22 14 C22 8 12 10 8 20 Z" fill="#f0d264"/>
    <path d="M22 14 C22 30 36 44 54 44 C58 45 59 49 57 51 C34 52 16 34 16 14 Z" fill="#e0a527"/>
    <path d="M8 20 C10 12 14 9 19 9 L22 14 C17 13 12 15 8 20 Z" fill="#8a5a2b"/>
  `,
  orange: `
    <circle cx="32" cy="34" r="23" fill="#e08a3c"/>
    <path d="M32 34 L32 11 A23 23 0 0 1 52 24 Z" fill="#f0d264"/>
    <path d="M32 34 L52 24 A23 23 0 0 1 53 26 Z" fill="#ffffff"/>
    <rect x="29" y="6" width="6" height="8" rx="3" fill="#6fae5a"/>
  `,
  fruit: `
    <circle cx="32" cy="24" r="9" fill="#9459c9"/>
    <circle cx="18" cy="34" r="9" fill="#9459c9"/>
    <circle cx="46" cy="34" r="9" fill="#9459c9"/>
    <circle cx="32" cy="42" r="9" fill="#9459c9"/>
    <circle cx="32" cy="56" r="8" fill="#9459c9"/>
    <path d="M30 4 L36 4 L36 18 L30 18 Z M36 6 C44 4 50 8 52 14 C44 14 38 12 36 8 Z" fill="#6fae5a"/>
  `,
  cheese: `
    <path d="M6 48 L6 24 L58 12 L58 38 Z" fill="#e0a527"/>
    <path d="M6 24 L58 12 L58 20 L6 32 Z" fill="#f0d264"/>
    <circle cx="20" cy="40" r="4.5" fill="#b5741f"/>
    <circle cx="36" cy="38" r="5" fill="#b5741f"/>
    <circle cx="49" cy="31" r="4" fill="#b5741f"/>
  `,
  butter: `
    <path d="M8 30 L46 18 L58 26 L20 40 Z" fill="#f0d264"/>
    <path d="M20 40 L58 26 L58 40 L20 52 Z" fill="#e0a527"/>
    <path d="M8 30 L20 40 L20 52 L8 42 Z" fill="#b5741f"/>
    <path d="M2 52 L62 52 L56 62 L8 62 Z" fill="#ffffff"/>
  `,
  milk: `
    <path d="M18 22 L46 22 L46 60 L18 60 Z" fill="#ffffff"/>
    <path d="M18 22 L32 4 L46 22 Z" fill="#5aa9e6"/>
    <rect x="18" y="34" width="28" height="12" fill="#5aa9e6"/>
    <rect x="28" y="2" width="8" height="8" fill="#5aa9e6"/>
  `,
  juice: `
    <path d="M16 20 L48 20 L44 60 L20 60 Z" fill="#f0d264"/>
    <path d="M16 20 L48 20 L47 30 L17 30 Z" fill="#ffffff"/>
    <path d="M36 18 L52 2 L58 6 L42 20 Z" fill="#c15b4a"/>
    <rect x="14" y="14" width="36" height="7" rx="3.5" fill="#ffffff"/>
  `,
  water: `
    <path d="M32 4 C32 4 54 30 54 42 C54 53 44 62 32 62 C20 62 10 53 10 42 C10 30 32 4 32 4 Z" fill="#5aa9e6"/>
    <path d="M22 40 C22 32 28 24 32 18 C28 30 26 36 26 42 C26 48 30 52 36 54 C28 56 22 49 22 40 Z" fill="#ffffff"/>
  `,
  chocolate: `
    <rect x="10" y="8" width="44" height="48" rx="3" fill="#8a5a2b"/>
    <rect x="14" y="12" width="16" height="18" fill="#b5741f"/>
    <rect x="34" y="12" width="16" height="18" fill="#b5741f"/>
    <rect x="14" y="34" width="16" height="18" fill="#b5741f"/>
    <rect x="34" y="34" width="16" height="18" fill="#b5741f"/>
  `,
  iceCream: `
    <path d="M14 26 L50 26 L32 62 Z" fill="#e0a527"/>
    <path d="M20 30 L38 62 L32 62 Z" fill="#b5741f"/>
    <circle cx="32" cy="18" r="15" fill="#e0918f"/>
    <circle cx="26" cy="13" r="5" fill="#f5ecd8"/>
  `,
  salad: `
    <circle cx="20" cy="24" r="11" fill="#6fae5a"/>
    <circle cx="40" cy="20" r="12" fill="#8bc46f"/>
    <circle cx="48" cy="30" r="8" fill="#c15b4a"/>
    <path d="M2 32 L62 32 L54 56 C50 60 14 60 10 56 Z" fill="#ffffff"/>
    <path d="M8 42 L56 42 L54 56 C50 60 14 60 10 56 Z" fill="#5aa9e6"/>
  `,
  sandwich: `
    <path d="M4 54 L28 10 L52 54 Z" fill="#e0a527"/>
    <path d="M12 40 L28 12 L44 40 Z" fill="#f5ecd8"/>
    <path d="M14 36 L42 36 L38 44 L18 44 Z" fill="#6fae5a"/>
    <path d="M18 26 L38 26 L42 34 L14 34 Z" fill="#e0918f"/>
    <path d="M36 58 L56 22 L62 58 Z" fill="#b5741f"/>
  `,
  hamburger: `
    <path d="M6 26 C6 12 20 6 32 6 C44 6 58 12 58 26 Z" fill="#e0a527"/>
    <rect x="4" y="27" width="56" height="8" rx="4" fill="#6fae5a"/>
    <rect x="6" y="34" width="52" height="11" rx="4" fill="#8a5a2b"/>
    <path d="M6 46 L58 46 C58 58 44 60 32 60 C20 60 6 58 6 46 Z" fill="#b5741f"/>
    <circle cx="22" cy="16" r="3" fill="#f5ecd8"/>
    <circle cx="40" cy="14" r="3" fill="#f5ecd8"/>
  `,
  sushi: `
    <path d="M8 36 C8 28 20 24 32 24 C44 24 56 28 56 36 L56 46 C56 52 44 54 32 54 C20 54 8 52 8 46 Z" fill="#ffffff"/>
    <path d="M6 30 C6 20 20 12 32 12 C46 12 58 20 58 30 C58 36 46 32 32 32 C18 32 6 36 6 30 Z" fill="#e0918f"/>
    <path d="M10 24 C18 18 44 16 54 22 C46 20 20 21 10 24 Z" fill="#f5ecd8"/>
    <rect x="24" y="34" width="16" height="24" rx="3" fill="#5c3a1a"/>
  `,
  onigiri: `
    <path d="M32 6 C36 6 58 46 58 52 C58 58 6 58 6 52 C6 46 28 6 32 6 Z" fill="#ffffff"/>
    <path d="M14 42 L50 42 L57 54 C56 58 8 58 7 54 Z" fill="#5c3a1a"/>
    <circle cx="26" cy="26" r="3.5" fill="#e0918f"/>
  `,
  tempura: `
    <path d="M18 8 C36 8 52 20 52 36 C52 48 42 56 32 54 C24 52 22 44 28 40 C36 34 34 22 22 20 C14 19 12 12 18 8 Z" fill="#e0a527"/>
    <path d="M22 14 C34 16 42 24 44 34 C45 42 40 47 35 45 C31 43 32 38 36 35 C40 31 38 24 26 22 Z" fill="#f0d264"/>
    <circle cx="46" cy="18" r="6" fill="#b5741f"/>
    <circle cx="26" cy="47" r="5.5" fill="#b5741f"/>
    <path d="M14 6 L4 2 L6 12 L2 20 L14 16 Z" fill="#e0918f"/>
  `,
  noodles: `
    <path d="M6 30 L58 30 L50 54 C46 60 18 60 14 54 Z" fill="#c15b4a"/>
    <path d="M12 30 C16 22 20 26 24 20 C28 14 34 18 38 12" fill="none" stroke="#f0d264" stroke-width="4.5"/>
    <path d="M22 30 C26 24 30 26 34 20 C38 14 44 16 48 10" fill="none" stroke="#f5ecd8" stroke-width="4.5"/>
    <rect x="40" y="2" width="5" height="26" rx="2" fill="#8a5a2b" transform="rotate(18 42 15)"/>
    <rect x="50" y="2" width="5" height="26" rx="2" fill="#8a5a2b" transform="rotate(26 52 15)"/>
  `,
  spaghetti: `
    <circle cx="32" cy="32" r="30" fill="#ffffff"/>
    <circle cx="32" cy="32" r="23" fill="#f0d264"/>
    <path d="M32 14 C42 14 48 22 48 30 C48 40 40 46 32 46 C24 46 19 40 19 34 C19 28 24 24 30 24 C35 24 38 28 38 32 C38 36 35 38 32 38" fill="none" stroke="#e0a527" stroke-width="4"/>
    <circle cx="24" cy="20" r="4" fill="#c15b4a"/>
    <circle cx="44" cy="42" r="4" fill="#c15b4a"/>
  `,
  pizza: `
    <path d="M10 8 L54 8 L32 60 Z" fill="#e0a527"/>
    <path d="M12 14 L52 14 L32 52 Z" fill="#f0d264"/>
    <rect x="8" y="4" width="48" height="9" rx="4" fill="#b5741f"/>
    <circle cx="22" cy="22" r="5" fill="#c15b4a"/>
    <circle cx="40" cy="24" r="5" fill="#c15b4a"/>
    <circle cx="32" cy="38" r="5" fill="#c15b4a"/>
  `,
  cookies: `
    <circle cx="22" cy="26" r="19" fill="#e0a527"/>
    <circle cx="42" cy="42" r="19" fill="#b5741f"/>
    <circle cx="17" cy="20" r="3.8" fill="#5c3a1a"/>
    <circle cx="27" cy="31" r="3.8" fill="#5c3a1a"/>
    <circle cx="45" cy="35" r="3.8" fill="#5c3a1a"/>
    <circle cx="38" cy="49" r="3.8" fill="#5c3a1a"/>
  `,
  curry: `
    <circle cx="32" cy="32" r="30" fill="#f5ecd8"/>
    <path d="M8 48 C4 38 6 22 18 12 C28 4 46 6 54 16 Z" fill="#ffffff"/>
    <path d="M10 50 C18 60 40 62 52 52 C60 44 62 28 54 18 Z" fill="#b5741f"/>
    <circle cx="42" cy="36" r="5" fill="#e08a3c"/>
    <circle cx="28" cy="48" r="4.5" fill="#6fae5a"/>
  `,
  sugar: `
    <path d="M6 26 L34 26 L30 58 L10 58 Z" fill="#ffffff"/>
    <rect x="4" y="20" width="32" height="8" rx="3" fill="#5aa9e6"/>
    <rect x="38" y="24" width="20" height="18" fill="#f5ecd8"/>
    <rect x="38" y="42" width="20" height="18" fill="#ffffff"/>
    <rect x="43" y="8" width="18" height="16" fill="#f5ecd8"/>
  `,
  salt: `
    <path d="M20 22 L44 22 L46 58 C46 61 18 61 18 58 Z" fill="#ffffff"/>
    <path d="M20 10 C20 6 24 4 32 4 C40 4 44 6 44 10 L44 22 L20 22 Z" fill="#5aa9e6"/>
    <circle cx="26" cy="11" r="3" fill="#1c1a17"/>
    <circle cx="38" cy="11" r="3" fill="#1c1a17"/>
    <circle cx="32" cy="16" r="3" fill="#1c1a17"/>
    <rect x="18" y="36" width="28" height="9" fill="#5aa9e6"/>
  `,
  spice: `
    <path d="M40 14 C54 18 58 34 50 46 C42 58 26 60 18 52 C12 46 14 38 22 38 C32 38 36 30 34 20 C33 15 36 13 40 14 Z" fill="#c15b4a"/>
    <path d="M40 20 C48 24 50 34 44 42 C40 47 34 49 31 46 C29 43 32 41 36 39 C41 36 42 28 38 22 Z" fill="#e0918f"/>
    <path d="M34 14 L28 4 L22 8 L30 18 Z" fill="#6fae5a"/>
    <rect x="18" y="2" width="8" height="10" rx="4" fill="#8bc46f"/>
  `,
  lemon: `
    <ellipse cx="32" cy="32" rx="28" ry="22" fill="#f0d264"/>
    <ellipse cx="32" cy="32" rx="21" ry="16" fill="#ffffff"/>
    <path d="M32 32 L54 26 A28 22 0 0 0 44 12 Z" fill="#e0a527"/>
    <path d="M32 32 L44 52 A28 22 0 0 0 56 38 Z" fill="#e0a527"/>
    <path d="M32 32 L10 38 A28 22 0 0 0 20 52 Z" fill="#e0a527"/>
    <path d="M32 32 L20 12 A28 22 0 0 0 8 26 Z" fill="#e0a527"/>
  `,

  // ---- Actions, batch 2 ----
  // Drawn as a hand, a tool in use, or a directional cue rather than another
  // vessel, so verbs stay distinguishable from the food icons above.
  fry: `
    <rect x="4" y="44" width="56" height="8" rx="4" fill="#b5741f"/>
    <ellipse cx="32" cy="32" rx="21" ry="12" fill="#ffffff"/>
    <circle cx="32" cy="31" r="7.5" fill="#e0a527"/>
    <path d="M12,18 l4,6 -3,5 M50,16 l-4,6 3,5" stroke="#f0d264" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  mix: `
    <polygon points="41,4 52,12 35,36 26,30" fill="#b5741f"/>
    <path d="M30,30 C14,38 12,54 26,58 M32,32 C26,42 24,52 26,58 M34,32 C40,42 38,54 26,58" stroke="#f5ecd8" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <circle cx="26" cy="58" r="4" fill="#f5ecd8"/>
  `,
  add: `
    <polygon points="26,20 38,20 38,32 50,32 50,44 38,44 38,56 26,56 26,44 14,44 14,32 26,32" fill="#6fae5a"/>
    <circle cx="14" cy="12" r="5" fill="#c15b4a"/>
    <circle cx="47" cy="14" r="4" fill="#f0d264"/>
    <circle cx="32" cy="7" r="3.5" fill="#8bc46f"/>
  `,
  wash: `
    <rect x="4" y="8" width="30" height="9" rx="3" fill="#9fb6c9"/>
    <rect x="26" y="15" width="10" height="9" fill="#9fb6c9"/>
    <path d="M27,26 l-3,11 M31,26 v13 M36,26 l3,11" stroke="#5aa9e6" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <circle cx="32" cy="50" r="12" fill="#6fae5a"/>
  `,
  carry: `
    <rect x="4" y="18" width="56" height="9" rx="4" fill="#f5ecd8"/>
    <path d="M10,27 h16 v9 c0,5 -4,8 -8,8 s-8,-3 -8,-8 Z" fill="#e8b98f"/>
    <path d="M38,27 h16 v9 c0,5 -4,8 -8,8 s-8,-3 -8,-8 Z" fill="#e8b98f"/>
    <path d="M14,42 h8 v16 h-8 Z M42,42 h8 v16 h-8 Z" fill="#5aa9e6"/>
  `,
  drink: `
    <polygon points="22,10 46,16 40,58 24,52" fill="#ffffff"/>
    <polygon points="25,30 43,35 39,55 26,50" fill="#e08a3c"/>
    <path d="M43,5 L31,28" stroke="#c15b4a" stroke-width="5.5" stroke-linecap="round" fill="none"/>
  `,
  eat: `
    <path d="M18,6 h4 v14 h2 V6 h4 v14 h2 V6 h4 v18 c0,3 -2,5 -5,6 l2,28 h-8 l2,-28 c-3,-1 -5,-3 -5,-6 Z" fill="#f5ecd8"/>
    <polygon points="52,4 57,9 31,41 27,37" fill="#f5ecd8"/>
    <polygon points="27,37 31,41 15,58 9,53" fill="#b5741f"/>
  `,
  pour: `
    <path d="M22,8 L48,18 L40,40 L14,30 Z" fill="#e0a527"/>
    <polygon points="14,30 25,34 8,44" fill="#b5741f"/>
    <path d="M45,20 c8,3 10,11 3,17" stroke="#b5741f" stroke-width="5" fill="none"/>
    <path d="M10,44 c-3,6 -1,11 2,15" stroke="#5aa9e6" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="14" cy="60" rx="9" ry="3.5" fill="#5aa9e6"/>
  `,
  send: `
    <polygon points="6,28 58,6 30,58 24,36" fill="#f5ecd8"/>
    <polygon points="24,36 58,6 30,58" fill="#5aa9e6"/>
    <path d="M4,44 h12" stroke="#9fb6c9" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  pass: `
    <path d="M2,30 h18 c5,0 9,4 9,9 s-4,9 -9,9 H2 Z" fill="#e8b98f"/>
    <path d="M62,30 H44 c-5,0 -9,4 -9,9 s4,9 9,9 h18 Z" fill="#e8b98f"/>
    <circle cx="26" cy="14" r="9" fill="#c15b4a"/>
    <polygon points="42,5 57,15 42,25" fill="#f0d264"/>
  `,
  show: `
    <circle cx="33" cy="8" r="6" fill="#f0d264"/>
    <path d="M20,20 h6 v20 h-6 Z M28,16 h6 v24 h-6 Z M36,18 h6 v22 h-6 Z M44,24 h6 v16 h-6 Z" fill="#e8b98f"/>
    <rect x="18" y="36" width="32" height="22" rx="7" fill="#e8b98f"/>
    <path d="M18,40 c-7,0 -10,4 -10,8 0,4 4,7 10,6 Z" fill="#e8b98f"/>
  `,
  teach: `
    <polygon points="6,24 30,18 30,52 6,46" fill="#f5ecd8"/>
    <polygon points="58,24 34,18 34,52 58,46" fill="#ffffff"/>
    <rect x="29" y="18" width="6" height="34" fill="#b5741f"/>
    <path d="M50,3 L35,15" stroke="#c15b4a" stroke-width="5" stroke-linecap="round" fill="none"/>
    <circle cx="33" cy="16" r="3.5" fill="#f0d264"/>
  `,
  tell: `
    <rect x="4" y="8" width="56" height="34" rx="9" fill="#f5ecd8"/>
    <polygon points="18,38 36,38 20,58" fill="#f5ecd8"/>
    <circle cx="18" cy="25" r="4.5" fill="#5c3a1a"/>
    <circle cx="32" cy="25" r="4.5" fill="#5c3a1a"/>
    <circle cx="46" cy="25" r="4.5" fill="#5c3a1a"/>
  `,
  buy: `
    <polygon points="8,28 56,28 49,57 15,57" fill="#c15b4a"/>
    <path d="M21,28 c0,-11 4,-16 11,-16 s11,5 11,16" stroke="#b5741f" stroke-width="5" fill="none"/>
    <circle cx="45" cy="10" r="8" fill="#f0d264"/>
    <path d="M45,20 v4" stroke="#f0d264" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  sell: `
    <polygon points="26,8 58,8 58,52 26,52 6,30" fill="#e0a527"/>
    <circle cx="18" cy="30" r="5" fill="#8a5a2b"/>
    <circle cx="46" cy="45" r="12" fill="#f0d264"/>
    <circle cx="46" cy="45" r="5" fill="#b5741f"/>
  `,
  give: `
    <rect x="8" y="26" width="48" height="30" rx="3" fill="#c15b4a"/>
    <rect x="4" y="17" width="56" height="10" rx="3" fill="#e0918f"/>
    <rect x="28" y="17" width="8" height="39" fill="#f0d264"/>
    <circle cx="24" cy="11" r="6.5" fill="#f0d264"/>
    <circle cx="40" cy="11" r="6.5" fill="#f0d264"/>
  `,
  bring: `
    <circle cx="20" cy="10" r="7" fill="#e8b98f"/>
    <path d="M12,20 h16 v4 h10 v6 H28 v8 H12 Z" fill="#5aa9e6"/>
    <path d="M12,38 h7 l-1,20 h-7 Z M22,38 h7 l8,17 -6,3 Z" fill="#8a5a2b"/>
    <path d="M34,26 h26 c0,-9 -6,-15 -13,-15 s-13,6 -13,15 Z" fill="#f5ecd8"/>
    <rect x="32" y="26" width="30" height="6" rx="2" fill="#e0a527"/>
  `,
  want: `
    <path d="M32,56 C10,40 4,27 13,18 c6,-6 14,-4 19,4 5,-8 13,-10 19,-4 9,9 3,22 -19,38 Z" fill="#c15b4a"/>
    <path d="M6,12 l6,6 M58,12 l-6,6 M2,34 h7 M62,34 h-7 M32,4 v6" stroke="#f0d264" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  need: `
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#e0a527"/>
    <rect x="28" y="17" width="8" height="21" rx="4" fill="#5c3a1a"/>
    <circle cx="32" cy="46" r="5" fill="#5c3a1a"/>
  `,
  like: `
    <rect x="14" y="30" width="32" height="24" rx="6" fill="#e8b98f"/>
    <path d="M20,32 l4,-20 c1,-5 9,-4 8,2 l-2,12 h7 c5,0 7,4 6,8 l-1,4 H20 Z" fill="#e8b98f"/>
    <path d="M16,40 h30 M16,47 h30" stroke="#b5741f" stroke-width="3.5" fill="none"/>
    <rect x="12" y="52" width="36" height="9" rx="3" fill="#5aa9e6"/>
  `,
  find: `
    <circle cx="26" cy="24" r="15" fill="none" stroke="#f0d264" stroke-width="7"/>
    <circle cx="26" cy="24" r="11" fill="#5aa9e6"/>
    <circle cx="26" cy="24" r="4.5" fill="#c15b4a"/>
    <path d="M37,37 L55,55" stroke="#b5741f" stroke-width="8" stroke-linecap="round" fill="none"/>
  `,
  catch: `
    <path d="M12,4 c10,8 14,14 16,22" stroke="#f5ecd8" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M28,26 v9 c0,7 -5,11 -11,11 s-10,-5 -9,-11" stroke="#9fb6c9" stroke-width="5" stroke-linecap="round" fill="none"/>
    <ellipse cx="40" cy="48" rx="12" ry="7.5" fill="#5aa9e6"/>
    <polygon points="51,48 61,42 61,54" fill="#5aa9e6"/>
    <circle cx="33" cy="45" r="2.5" fill="#f5ecd8"/>
  `,
  leave: `
    <rect x="6" y="6" width="30" height="52" fill="#b5741f"/>
    <rect x="12" y="12" width="18" height="46" fill="#f5ecd8"/>
    <polygon points="24,28 44,28 44,20 60,34 44,48 44,40 24,40" fill="#6fae5a"/>
  `,
  stay: `
    <rect x="10" y="28" width="44" height="28" rx="6" fill="#f0d264"/>
    <path d="M20,28 v-6 c0,-7 5,-12 12,-12 s12,5 12,12 v6" stroke="#9fb6c9" stroke-width="6" fill="none"/>
    <circle cx="32" cy="39" r="5" fill="#8a5a2b"/>
    <rect x="29.5" y="41" width="5" height="9" fill="#8a5a2b"/>
  `,
  become: `
    <path d="M11,32 A21,21 0 0 1 32,11" stroke="#9459c9" stroke-width="6.5" fill="none"/>
    <polygon points="30,3 46,12 30,21" fill="#9459c9"/>
    <path d="M53,32 A21,21 0 0 1 32,53" stroke="#8bc46f" stroke-width="6.5" fill="none"/>
    <polygon points="34,43 18,52 34,61" fill="#8bc46f"/>
  `,
  rise: `
    <path d="M8,57 h48 c0,-15 -11,-23 -24,-23 S8,42 8,57 Z" fill="#f5ecd8"/>
    <polygon points="32,2 47,21 38,21 38,30 26,30 26,21 17,21" fill="#6fae5a"/>
  `,
  grow: `
    <rect x="6" y="48" width="52" height="10" rx="4" fill="#8a5a2b"/>
    <rect x="29" y="16" width="6" height="34" fill="#6fae5a"/>
    <path d="M30,32 c-13,-2 -19,-11 -17,-20 11,-2 18,7 17,20 Z" fill="#8bc46f"/>
    <path d="M34,26 c13,-2 19,-11 17,-20 -11,-2 -18,7 -17,20 Z" fill="#6fae5a"/>
  `,
  melt: `
    <rect x="12" y="10" width="40" height="26" rx="4" fill="#f0d264"/>
    <path d="M16,34 h7 v12 a3.5,3.5 0 0 1 -7,0 Z M28,34 h7 v20 a3.5,3.5 0 0 1 -7,0 Z M41,34 h7 v14 a3.5,3.5 0 0 1 -7,0 Z" fill="#f0d264"/>
    <ellipse cx="32" cy="61" rx="20" ry="3.5" fill="#e0a527"/>
  `,
  cry: `
    <path d="M32,5 c10,17 16,23 16,31 0,9 -7,16 -16,16 s-16,-7 -16,-16 c0,-8 6,-14 16,-31 Z" fill="#5aa9e6"/>
    <ellipse cx="32" cy="59" rx="15" ry="3.5" fill="#9fb6c9"/>
    <circle cx="14" cy="54" r="3.5" fill="#5aa9e6"/>
    <circle cx="50" cy="54" r="3.5" fill="#5aa9e6"/>
  `,
  ring: `
    <path d="M32,8 c-10,0 -16,8 -16,18 0,8 -2,12 -4,16 h40 c-2,-4 -4,-8 -4,-16 0,-10 -6,-18 -16,-18 Z" fill="#e0a527"/>
    <circle cx="32" cy="7" r="4.5" fill="#b5741f"/>
    <circle cx="32" cy="48" r="5.5" fill="#b5741f"/>
    <path d="M7,16 c-3,6 -3,13 0,19 M57,16 c3,6 3,13 0,19" stroke="#f0d264" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  stop: `
    <polygon points="22,4 42,4 60,22 60,42 42,60 22,60 4,42 4,22" fill="#c15b4a"/>
    <rect x="14" y="28" width="36" height="8" rx="2" fill="#ffffff"/>
  `,
  waitFor: `
    <rect x="12" y="5" width="40" height="8" rx="3" fill="#b5741f"/>
    <path d="M18,13 H46 L34,32 L46,51 H18 L30,32 Z" fill="#f5ecd8"/>
    <polygon points="22,48 42,48 32,36" fill="#e0a527"/>
    <rect x="12" y="51" width="40" height="8" rx="3" fill="#b5741f"/>
  `,

  // ---- People, states and modifiers, batch 2 ----
  // The people follow the same face construction as chef/mother/father above so
  // the cast reads as one family of characters.
  boy: `
    <circle cx="32" cy="36" r="17" fill="#e8b98f"/>
    <path d="M15 36 A17 17 0 0 1 49 36 Z" fill="#5c3a1a"/>
    <rect x="8" y="31" width="33" height="7" rx="3.5" fill="#5aa9e6"/>
    <circle cx="26" cy="42" r="2.8" fill="#5c3a1a"/>
    <circle cx="38" cy="42" r="2.8" fill="#5c3a1a"/>
  `,
  girl: `
    <circle cx="11" cy="38" r="7" fill="#8a5a2b"/>
    <circle cx="53" cy="38" r="7" fill="#8a5a2b"/>
    <circle cx="32" cy="36" r="17" fill="#e8b98f"/>
    <path d="M15 36 A17 17 0 0 1 49 36 Z" fill="#8a5a2b"/>
    <circle cx="26" cy="42" r="2.8" fill="#5c3a1a"/>
    <circle cx="38" cy="42" r="2.8" fill="#5c3a1a"/>
  `,
  grandmother: `
    <circle cx="32" cy="13" r="8" fill="#f5ecd8"/>
    <circle cx="32" cy="36" r="17" fill="#e8b98f"/>
    <path d="M15 36 A17 17 0 0 1 49 36 Z" fill="#f5ecd8"/>
    <circle cx="25" cy="41" r="2.6" fill="#5c3a1a"/>
    <circle cx="41" cy="41" r="2.6" fill="#5c3a1a"/>
    <path d="M18 41 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M34 41 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M32 41 h2" fill="none" stroke="#5c3a1a" stroke-width="3.6"/>
  `,
  teacher: `
    <circle cx="26" cy="36" r="16" fill="#e8b98f"/>
    <path d="M10 36 A16 16 0 0 1 42 36 Z" fill="#8a5a2b"/>
    <circle cx="20" cy="42" r="2.6" fill="#5c3a1a"/>
    <circle cx="32" cy="42" r="2.6" fill="#5c3a1a"/>
    <polygon points="47,15 52,13 58,52 53,54" fill="#e0a527"/>
    <circle cx="48" cy="12" r="4" fill="#b5741f"/>
  `,
  children: `
    <circle cx="19" cy="32" r="12" fill="#e8b98f"/>
    <circle cx="15" cy="31" r="2.4" fill="#5c3a1a"/>
    <circle cx="23" cy="31" r="2.4" fill="#5c3a1a"/>
    <circle cx="45" cy="32" r="12" fill="#f5ecd8"/>
    <circle cx="41" cy="31" r="2.4" fill="#5c3a1a"/>
    <circle cx="49" cy="31" r="2.4" fill="#5c3a1a"/>
  `,
  students: `
    <circle cx="32" cy="40" r="15" fill="#e8b98f"/>
    <path d="M19 30 A13 13 0 0 1 45 30 Z" fill="#5aa9e6"/>
    <polygon points="32,19 58,28 32,37 6,28" fill="#5aa9e6"/>
    <rect x="52" y="28" width="4.5" height="14" rx="2.2" fill="#e0a527"/>
    <circle cx="27" cy="44" r="2.6" fill="#5c3a1a"/>
    <circle cx="37" cy="44" r="2.6" fill="#5c3a1a"/>
  `,
  warm: `
    <rect x="25" y="6" width="13" height="38" rx="6.5" fill="#f5ecd8"/>
    <circle cx="31.5" cy="48" r="11" fill="#c15b4a"/>
    <rect x="28" y="24" width="7" height="24" fill="#c15b4a"/>
    <rect x="40" y="16" width="9" height="4" fill="#b5741f"/>
    <rect x="40" y="26" width="9" height="4" fill="#b5741f"/>
  `,
  brown: `
    <path d="M33 9 C47 9 57 19 57 32 C57 46 44 55 31 55 C17 55 7 45 7 31 C7 18 18 9 33 9 Z" fill="#b5741f"/>
    <path d="M33 17 C43 17 49 24 49 32 C49 43 40 47 31 47 C20 47 15 41 15 31 C15 22 23 17 33 17 Z" fill="#8a5a2b"/>
  `,
  clean: `
    <path d="M26 4 L32 24 L52 30 L32 36 L26 56 L20 36 L0 30 L20 24 Z" fill="#ffffff"/>
    <path d="M50 8 L52.5 15.5 L60 18 L52.5 20.5 L50 28 L47.5 20.5 L40 18 L47.5 15.5 Z" fill="#f0d264"/>
    <path d="M52 40 L54 46 L60 48 L54 50 L52 56 L50 50 L44 48 L50 46 Z" fill="#f0d264"/>
  `,
  tasty: `
    <circle cx="32" cy="32" r="24" fill="#e0a527"/>
    <circle cx="23" cy="25" r="3.5" fill="#5c3a1a"/>
    <circle cx="41" cy="25" r="3.5" fill="#5c3a1a"/>
    <path d="M18 36 A14 14 0 0 0 46 36 Z" fill="#5c3a1a"/>
    <path d="M26 46 A6 6 0 0 0 38 46 L38 43 L26 43 Z" fill="#e0918f"/>
  `,
  salty: `
    <polygon points="20,6 26,12 20,18 14,12" fill="#ffffff"/>
    <rect x="34" y="9" width="9" height="9" fill="#f5ecd8"/>
    <polygon points="47,20 53,26 47,32 41,26" fill="#ffffff"/>
    <rect x="23" y="26" width="8" height="8" fill="#f5ecd8"/>
    <polygon points="34,38 40,44 34,50 28,44" fill="#ffffff"/>
    <rect x="15" y="42" width="9" height="9" fill="#f5ecd8"/>
  `,
  sour: `
    <circle cx="26" cy="32" r="18" fill="#8bc46f"/>
    <circle cx="20" cy="27" r="3" fill="#5c3a1a"/>
    <circle cx="32" cy="27" r="3" fill="#5c3a1a"/>
    <ellipse cx="26" cy="41" rx="4.5" ry="3" fill="#5c3a1a"/>
    <path d="M50 24 A12 12 0 0 1 50 48 Z" fill="#f0d264"/>
  `,
  hard: `
    <polygon points="8,44 16,20 34,9 52,18 58,40 44,55 20,55" fill="#9fb6c9"/>
    <polygon points="34,9 52,18 40,30 24,26" fill="#f5ecd8"/>
    <polygon points="40,30 58,40 44,55 34,50" fill="#8a8578"/>
  `,
  dry: `
    <polygon points="4,26 60,19 58,48 6,44" fill="#e0a527"/>
    <polygon points="29,21 34,21 30,32 37,34 33,47 28,47 32,35 25,32" fill="#8a5a2b"/>
    <polygon points="6,33 23,30 23,34.5 6,37.5" fill="#8a5a2b"/>
    <polygon points="40,32 58,28 58,32.5 40,36.5" fill="#8a5a2b"/>
  `,
  open: `
    <polygon points="16,32 4,20 10,13 23,26" fill="#e0a527"/>
    <polygon points="48,32 60,20 54,13 41,26" fill="#e0a527"/>
    <polygon points="14,30 50,30 47,57 17,57" fill="#b5741f"/>
    <polygon points="14,30 50,30 44,37 20,37" fill="#f5ecd8"/>
  `,
  closed: `
    <polygon points="32,8 56,21 32,34 8,21" fill="#e0a527"/>
    <polygon points="8,21 32,34 32,58 8,45" fill="#b5741f"/>
    <polygon points="56,21 56,45 32,58 32,34" fill="#8a5a2b"/>
    <polygon points="8,31 32,44 32,50 8,37" fill="#f5ecd8"/>
    <polygon points="56,31 56,37 32,50 32,44" fill="#f5ecd8"/>
  `,
  red: `
    <path d="M32 5 C32 5 52 29 52 40 A20 20 0 0 1 12 40 C12 29 32 5 32 5 Z" fill="#c15b4a"/>
    <ellipse cx="24" cy="40" rx="5" ry="8" fill="#e0918f"/>
  `,
  lunch: `
    <rect x="5" y="13" width="54" height="38" rx="5" fill="#b5741f"/>
    <rect x="10" y="18" width="23" height="28" rx="3" fill="#f5ecd8"/>
    <rect x="37" y="18" width="17" height="12" rx="3" fill="#6fae5a"/>
    <rect x="37" y="34" width="17" height="12" rx="3" fill="#c15b4a"/>
    <circle cx="21.5" cy="32" r="5" fill="#c15b4a"/>
  `,
  spicyState: `
    <path d="M32 2 C40 16 54 22 54 38 C54 50 44 60 32 60 C20 60 10 50 10 38 C10 22 24 16 32 2 Z" fill="#e08a3c"/>
    <path d="M38 30 C46 36 44 50 31 55 C25 46 28 34 38 30 Z" fill="#c15b4a"/>
    <polygon points="38,31 32,22 37,19 44,28" fill="#6fae5a"/>
  `,
  afternoon: `
    <circle cx="32" cy="24" r="13" fill="#f0d264"/>
    <path d="M29 1 L35 1 L35 9 L29 9 Z M2 21 L10 21 L10 27 L2 27 Z M54 21 L62 21 L62 27 L54 27 Z M13 8 L17 4 L23 10 L19 14 Z M51 8 L47 4 L41 10 L45 14 Z" fill="#e0a527"/>
    <rect x="4" y="47" width="56" height="7" rx="3.5" fill="#6fae5a"/>
  `,
  evening: `
    <path d="M12 44 A20 20 0 0 1 52 44 Z" fill="#e08a3c"/>
    <rect x="2" y="44" width="60" height="7" rx="3.5" fill="#b5741f"/>
    <rect x="14" y="55" width="36" height="5" rx="2.5" fill="#e0a527"/>
  `,
  mealtime: `
    <circle cx="32" cy="32" r="15" fill="#ffffff"/>
    <circle cx="32" cy="32" r="9" fill="#f5ecd8"/>
    <path d="M5 8 L9 8 L9 20 L11 20 L11 8 L15 8 L15 26 L12 29 L12 56 L8 56 L8 29 L5 26 Z" fill="#9fb6c9"/>
    <path d="M53 8 C59 12 59 24 56 28 L56 56 L52 56 L52 28 C49 24 49 12 53 8 Z" fill="#9fb6c9"/>
  `,
  calendar: `
    <path d="M18 3 h5 v11 h-5 Z M41 3 h5 v11 h-5 Z" fill="#8a5a2b"/>
    <rect x="8" y="11" width="48" height="45" rx="4" fill="#f5ecd8"/>
    <rect x="8" y="11" width="48" height="12" rx="4" fill="#c15b4a"/>
    <path d="M14 29 h9 v7 h-9 Z M27.5 29 h9 v7 h-9 Z M41 29 h9 v7 h-9 Z M14 41 h9 v7 h-9 Z M27.5 41 h9 v7 h-9 Z M41 41 h9 v7 h-9 Z" fill="#b5741f"/>
  `,
  weekend: `
    <rect x="5" y="5" width="40" height="40" rx="4" fill="#e0a527"/>
    <rect x="19" y="19" width="40" height="40" rx="4" fill="#f5ecd8"/>
    <rect x="19" y="19" width="40" height="10" rx="4" fill="#6fae5a"/>
    <circle cx="46" cy="46" r="8" fill="none" stroke="#c15b4a" stroke-width="4.5"/>
  `,
  sunday: `
    <rect x="8" y="9" width="48" height="47" rx="5" fill="#ffffff"/>
    <rect x="8" y="9" width="48" height="12" rx="5" fill="#5aa9e6"/>
    <path d="M13 26 h11 v5 h-11 Z M40 26 h11 v5 h-11 Z" fill="#9fb6c9"/>
    <circle cx="32" cy="39" r="11" fill="#c15b4a"/>
  `,
  school: `
    <rect x="5" y="30" width="54" height="27" fill="#c15b4a"/>
    <rect x="24" y="12" width="16" height="19" fill="#e0a527"/>
    <polygon points="22,13 32,2 42,13" fill="#b5741f"/>
    <rect x="51" y="8" width="4.5" height="24" fill="#f5ecd8"/>
    <polygon points="51,10 51,21 40,15.5" fill="#5aa9e6"/>
    <path d="M11 37 h9 v11 h-9 Z M27 37 h10 v20 h-10 Z M44 37 h9 v11 h-9 Z" fill="#f5ecd8"/>
  `,
  quickly: `
    <polygon points="61,32 39,17 39,47" fill="#e0a527"/>
    <rect x="5" y="27" width="33" height="9" rx="4.5" fill="#f0d264"/>
    <rect x="13" y="12" width="23" height="8" rx="4" fill="#f0d264"/>
    <rect x="13" y="43" width="23" height="8" rx="4" fill="#f0d264"/>
  `,
  slowly: `
    <path d="M5 55 C5 47 12 44 22 44 L45 44 C49 44 52 41 54 37 C56 34 61 35 60 40 C57 49 50 55 42 55 Z" fill="#f0d264"/>
    <polygon points="55,38 53,27 57,26 59,37" fill="#f0d264"/>
    <circle cx="55" cy="25" r="3.5" fill="#8a5a2b"/>
    <circle cx="28" cy="31" r="15" fill="#c15b4a"/>
    <path d="M28 31 C24 31 22 35 26 38 C32 41 37 35 34 28 C30 19 18 21 16 31" fill="none" stroke="#f5ecd8" stroke-width="4.5"/>
  `,
  carefully: `
    <ellipse cx="32" cy="21" rx="11" ry="14" fill="#ffffff"/>
    <ellipse cx="27" cy="17" rx="3" ry="5" fill="#f5ecd8"/>
    <path d="M6 36 C6 31 12 29 16 33 L48 33 C52 29 58 31 58 36 C58 47 47 56 32 56 C17 56 6 47 6 36 Z" fill="#e8b98f"/>
  `,
  together: `
    <circle cx="18" cy="32" r="13" fill="none" stroke="#5aa9e6" stroke-width="6"/>
    <circle cx="46" cy="32" r="13" fill="none" stroke="#e0a527" stroke-width="6"/>
    <circle cx="32" cy="32" r="13" fill="none" stroke="#6fae5a" stroke-width="6"/>
  `,
  fridge: `
    <rect x="16" y="4" width="32" height="56" rx="4" fill="#9fb6c9"/>
    <rect x="16" y="21" width="32" height="4.5" fill="#f5ecd8"/>
    <rect x="38" y="9" width="5" height="9" rx="2.5" fill="#b5741f"/>
    <rect x="38" y="29" width="5" height="15" rx="2.5" fill="#b5741f"/>
  `,
  stove: `
    <rect x="6" y="6" width="52" height="52" rx="6" fill="#f5ecd8"/>
    <circle cx="21" cy="21" r="8" fill="#c15b4a"/>
    <circle cx="43" cy="21" r="8" fill="#c15b4a"/>
    <circle cx="21" cy="43" r="8" fill="#e08a3c"/>
    <circle cx="43" cy="43" r="8" fill="#e08a3c"/>
  `,

  // ---- Finished dishes ----
  // The recipe book rewards a *dish*, and several dishes look nothing like the
  // raw ingredient they're made from — 焼き鳥 is meat on a skewer, not the
  // drumstick that the `chicken` ingredient icon shows. These exist so a
  // collected recipe can be pictured as the dish it actually is.
  yakitori: `
    <rect x="6" y="50" width="52" height="6" rx="3" fill="#f5ecd8" transform="rotate(-32 32 53)"/>
    <rect x="14" y="12" width="17" height="15" rx="5" fill="#b5741f"/>
    <rect x="22" y="26" width="17" height="15" rx="5" fill="#8a5a2b"/>
    <rect x="30" y="40" width="17" height="15" rx="5" fill="#b5741f"/>
    <path d="M18 20h9M26 34h9M34 48h9" stroke="#5c3a1a" stroke-width="3.5" stroke-linecap="round"/>
  `,
  toast: `
    <path d="M10 20a8 8 0 0 1 8-8h28a8 8 0 0 1 8 8v28a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#e0a527"/>
    <path d="M17 24a5 5 0 0 1 5-4h20a5 5 0 0 1 5 4v22H17z" fill="#f0d264"/>
    <rect x="24" y="28" width="16" height="11" rx="2" fill="#f5ecd8"/>
  `,
  pie: `
    <path d="M6 34h52a26 22 0 0 1-52 0z" fill="#b5741f"/>
    <ellipse cx="32" cy="32" rx="26" ry="9" fill="#e0a527"/>
    <path d="M12 30h40M20 22l24 18M44 22L20 40" stroke="#f0d264" stroke-width="4" stroke-linecap="round"/>
  `,
  omelette: `
    <rect x="8" y="22" width="48" height="26" rx="7" fill="#f0d264"/>
    <path d="M42 22a13 13 0 0 1 0 26 13 13 0 0 0 0-26z" fill="#e0a527"/>
    <path d="M46 28a7 7 0 1 0 0 14 5 5 0 0 1 0-9 3 3 0 0 0 0-5z" fill="#f0d264"/>
    <rect x="10" y="30" width="16" height="4" rx="2" fill="#e0a527"/>
  `,
  misoSoup: `
    <path d="M8 28h48a24 20 0 0 1-48 0z" fill="#5c3a1a"/>
    <path d="M13 30h38a19 13 0 0 1-38 0z" fill="#b5741f"/>
    <rect x="22" y="33" width="9" height="9" rx="2" fill="#f5ecd8"/>
    <rect x="34" y="35" width="8" height="8" rx="2" fill="#f5ecd8"/>
    <path d="M24 20c0-5 4-5 4-10M38 20c0-5 4-5 4-10" stroke="#9fb6c9" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `,
  friedNoodles: `
    <ellipse cx="32" cy="42" rx="28" ry="13" fill="#f5ecd8"/>
    <path d="M8 40c8-12 16-4 24-14 8-10 16-2 24-12" stroke="#e0a527" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M8 46c8-11 16-3 24-13 8-10 16-2 24-11" stroke="#b5741f" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="30" r="4" fill="#6fae5a"/>
    <circle cx="44" cy="34" r="4" fill="#c15b4a"/>
  `,
  patty: `
    <ellipse cx="32" cy="36" rx="26" ry="17" fill="#8a5a2b"/>
    <ellipse cx="32" cy="32" rx="26" ry="16" fill="#b5741f"/>
    <path d="M14 26c8 4 28 4 36 0" stroke="#5c3a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M12 34c9 5 31 5 40 0" stroke="#5c3a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
  `,
  friedFish: `
    <path d="M8 32c6-14 22-18 34-12 10 5 14 12 14 12s-4 7-14 12c-12 6-28 2-34-12z" fill="#e0a527"/>
    <path d="M14 32c5-9 18-12 27-7 7 4 10 7 10 7s-3 3-10 7c-9 5-22 2-27-7z" fill="#f0d264"/>
    <circle cx="20" cy="27" r="3" fill="#b5741f"/>
    <circle cx="30" cy="36" r="3" fill="#b5741f"/>
    <circle cx="41" cy="28" r="3" fill="#b5741f"/>
  `,
};

export const ICON_IDS = Object.keys(ICON_SHAPES);

// One <defs> block injected once; every card then references a symbol by id
// instead of duplicating its geometry.
export function iconSpriteMarkup(): string {
  const symbols = Object.entries(ICON_SHAPES)
    .map(([id, shapes]) => `<symbol id="ci-${id}" viewBox="0 0 64 64">${shapes}</symbol>`)
    .join('');
  return `<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

// How much of the 64-unit canvas an icon's artwork should span once normalized,
// leaving a small margin so neighbouring cards don't look crowded.
const TARGET_SPAN = 58;

// Hand-drawn icons never agree on how much of the canvas they fill — measuring
// this batch found artwork spanning anywhere from 38 to 53 units, so the small
// ones (all the people) rendered as tiny stickers while the big ones filled
// their card. Rather than hand-tuning coordinates for every icon (and again for
// every icon added later), measure the real bounding box once at startup and
// scale each to a shared target span. This also re-centers artwork that was
// drawn slightly off-center.
function normalizeIconScales(root: HTMLElement): void {
  root.querySelectorAll('symbol').forEach((sym) => {
    const g = document.createElementNS(SVG_NS, 'g');
    while (sym.firstChild) g.appendChild(sym.firstChild);
    sym.appendChild(g);

    const box = g.getBBox();
    // A zero box means the browser couldn't measure it; leaving the icon
    // untransformed is better than dividing by zero.
    if (!box.width || !box.height) return;

    const scale = TARGET_SPAN / Math.max(box.width, box.height);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    g.setAttribute(
      'transform',
      `translate(32 32) scale(${scale.toFixed(3)}) translate(${-cx.toFixed(2)} ${-cy.toFixed(2)})`,
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
  return id in ICON_SHAPES;
}
