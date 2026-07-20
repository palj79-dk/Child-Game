// @ts-check
/* ---------- Indholdsdata (dansk) ----------
   Emoji bruges som midlertidig grafik i I1; erstattes af egen SVG via icon()-laget
   i I2. Felterne 'sym' peger på symbol-id i spritesheetet (bruges fra I2). */

export const LETTERS = "ABCDEFGHIJKLMNOPRSTUVYÆØÅ".split("");

/** Konkret dansk eksempelord pr. bogstav – "S som i slange" hjælper indlæringen.
 * Vælg børnevenlige, konkrete ord. Rettes ét sted her. */
export const LETTER_EKSEMPEL = {
  A: "abe", B: "bil", C: "citron", D: "due", E: "elefant", F: "fisk",
  G: "gris", H: "hund", I: "is", J: "jordbær", K: "kat", L: "løve",
  M: "mus", N: "næse", O: "ost", P: "pige", R: "ræv", S: "slange",
  T: "tog", U: "ugle", V: "vand", Y: "yoghurt", Æ: "æble", Ø: "ørn", Å: "ål",
};

/** @typedef {{ e:string, sym:string, navn:string, ubest:string, flertal:string, lyd:string }} Animal */
/** @type {Animal[]} */
export const ANIMALS = [
  { e: "🐄", sym: "dyr-ko",    navn: "koen",   ubest: "en ko",   flertal: "køer",  lyd: "muh" },
  { e: "🐑", sym: "dyr-faar",  navn: "fåret",  ubest: "et får",  flertal: "får",   lyd: "mæh" },
  { e: "🐷", sym: "dyr-gris",  navn: "grisen", ubest: "en gris", flertal: "grise", lyd: "øf øf" },
  { e: "🐴", sym: "dyr-hest",  navn: "hesten", ubest: "en hest", flertal: "heste", lyd: "vrinsk" },
  { e: "🐔", sym: "dyr-hoene", navn: "hønen",  ubest: "en høne", flertal: "høns",  lyd: "gok gok" },
  { e: "🦆", sym: "dyr-and",   navn: "anden",  ubest: "en and",  flertal: "ænder", lyd: "rap rap" },
  { e: "🐶", sym: "dyr-hund",  navn: "hunden", ubest: "en hund", flertal: "hunde", lyd: "vov vov" },
  { e: "🐱", sym: "dyr-kat",   navn: "katten", ubest: "en kat",  flertal: "katte", lyd: "miav" },
  { e: "🐸", sym: "dyr-froe",  navn: "frøen",  ubest: "en frø",  flertal: "frøer", lyd: "kvæk" },
  { e: "🐝", sym: "dyr-bi",    navn: "bien",   ubest: "en bi",   flertal: "bier",  lyd: "summ" },
];

/** @typedef {{ navn:string, css:string }} Color */
/** @type {Color[]} */
export const COLORS = [
  { navn: "røde",   css: "#e74c3c" },
  { navn: "blå",    css: "#2980d9" },
  { navn: "gule",   css: "#e6ac00" }, // T2: mørkere gul for bedre kontrast mod hvid
  { navn: "grønne", css: "#2ecc71" },
  { navn: "lilla",  css: "#9b59b6" },
  { navn: "orange", css: "#e67e22" },
];

/** @typedef {{ navn:string, tegn:(c:string)=>string }} Shape */
/** @type {Shape[]} */
export const SHAPES = [
  { navn: "cirkel",  tegn: (c) => `<circle cx="50" cy="50" r="40" fill="${c}"/>` },
  { navn: "firkant", tegn: (c) => `<rect x="12" y="12" width="76" height="76" rx="8" fill="${c}"/>` },
  { navn: "trekant", tegn: (c) => `<polygon points="50,10 92,88 8,88" fill="${c}"/>` },
  { navn: "stjerne", tegn: (c) => `<polygon points="50,6 61,38 95,38 67,58 77,92 50,71 23,92 33,58 5,38 39,38" fill="${c}"/>` },
  { navn: "hjerte",  tegn: (c) => `<path d="M50 88 C10 58 10 24 32 20 C44 18 50 30 50 30 C50 30 56 18 68 20 C90 24 90 58 50 88Z" fill="${c}"/>` },
];

/** @typedef {{ e:string, sym:string, navn:string }} Thing */
/** Ting til skygge-leg. sym peger på symbol-id i spritesheetet (I2). */
/** @type {Thing[]} */
export const THINGS = [
  { e: "🍎", sym: "ting-aeble", navn: "æble" },
  { e: "🌳", sym: "ting-trae",  navn: "træ" },
  { e: "🚗", sym: "ting-bil",   navn: "bil" },
  { e: "☂️", sym: "ting-paraply", navn: "paraply" },
  { e: "🦋", sym: "ting-sommerfugl", navn: "sommerfugl" },
  { e: "🐘", sym: "ting-elefant", navn: "elefant" },
  { e: "🚲", sym: "ting-cykel", navn: "cykel" },
  { e: "🌻", sym: "ting-blomst", navn: "blomst" },
  { e: "🐠", sym: "ting-fisk",  navn: "fisk" },
  { e: "✈️", sym: "ting-fly",   navn: "fly" },
  { e: "🧸", sym: "ting-bamse", navn: "bamse" },
  { e: "🥕", sym: "ting-gulerod", navn: "gulerod" },
  { e: "🍄", sym: "ting-svamp", navn: "svamp" },
  { e: "⛵", sym: "ting-baad",  navn: "båd" },
  { e: "🦀", sym: "ting-krabbe", navn: "krabbe" },
];

/** @typedef {{ ord:string, e:string, sym:string, rimOrd:string, rimE:string, rimSym:string, fam:string }} RimPar */
/* Kuraterede danske rim-par. 'fam' = rim-familie (O5 i I5: distraktorer må ikke
   dele familie med målordet). */
/** @type {RimPar[]} */
export const RIM = [
  { ord: "kat",  e: "🐱", sym: "dyr-kat",   rimOrd: "hat",   rimE: "🎩", rimSym: "ting-hat",   fam: "-at" },
  { ord: "mus",  e: "🐭", sym: "dyr-mus",   rimOrd: "hus",   rimE: "🏠", rimSym: "ting-hus",   fam: "-us" },
  { ord: "ko",   e: "🐄", sym: "dyr-ko",    rimOrd: "sko",   rimE: "👟", rimSym: "ting-sko",   fam: "-o" },
  { ord: "gris", e: "🐷", sym: "dyr-gris",  rimOrd: "is",    rimE: "🍦", rimSym: "ting-is",    fam: "-is" },
  { ord: "sol",  e: "☀️", sym: "ting-sol",  rimOrd: "stol",  rimE: "🪑", rimSym: "ting-stol",  fam: "-ol" },
  { ord: "hund", e: "🐶", sym: "dyr-hund",  rimOrd: "mund",  rimE: "👄", rimSym: "ting-mund",  fam: "-und" },
  { ord: "and",  e: "🦆", sym: "dyr-and",   rimOrd: "spand", rimE: "🪣", rimSym: "ting-spand", fam: "-and" },
  { ord: "bi",   e: "🐝", sym: "dyr-bi",    rimOrd: "ski",   rimE: "🎿", rimSym: "ting-ski",   fam: "-i" },
  { ord: "frø",  e: "🐸", sym: "dyr-froe",  rimOrd: "ø",     rimE: "🏝️", rimSym: "ting-oe",    fam: "-oe" },
  { ord: "bold", e: "⚽", sym: "ting-bold", rimOrd: "trold", rimE: "🧌", rimSym: "ting-trold", fam: "-old" },
];

/* Sporingsbaner (viewBox 0 0 100 100). Flere delstreger er ok –
   barnet må gerne løfte fingeren og fortsætte. */
export const GLYPHS = {
  "1": "M40,25 L55,12 L55,88",
  "2": "M32,32 Q32,12 50,12 Q68,12 68,32 Q68,45 40,70 L32,88 L70,88",
  "3": "M32,22 Q50,8 62,22 Q72,35 52,47 Q74,58 64,76 Q52,92 32,78",
  "4": "M58,12 L28,58 L74,58 M58,12 L58,88",
  "5": "M68,12 L36,12 L33,45 Q52,38 62,50 Q72,65 58,80 Q45,90 32,78",
  "7": "M30,14 L70,14 L46,88",
  "I": "M50,12 L50,88",
  "L": "M36,12 L36,88 L70,88",
  "T": "M26,14 L74,14 M50,14 L50,88",
  "V": "M28,12 L50,88 L72,12",
  "O": "M50,12 Q22,12 22,50 Q22,88 50,88 Q78,88 78,50 Q78,12 50,12",
  "A": "M26,88 L50,12 L74,88 M36,62 L64,62",
  "S": "M66,22 Q50,8 38,20 Q28,34 48,46 Q70,56 62,74 Q50,90 32,76",
  "M": "M26,88 L26,14 L50,55 L74,14 L74,88",
};

export const GLYPH_LEVELS = [
  ["1", "7", "2", "3"], // tal først
  ["4", "5", "I", "L", "T", "V", "O"], // + flere tal og lette bogstaver
  ["A", "S", "M"], // + svære bogstaver
];
