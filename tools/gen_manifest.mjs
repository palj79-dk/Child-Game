// @ts-check
/* =====================================================================
   Genererer audio/manifest.json (kontrakten mellem indhold og kode) OG
   src/audio-manifest.generated.js (indlejres i app-bundlen, så teksten er
   tilgængelig til Web Speech-fallback uden netværk).
   Hver replik = { id: { fil, tekst, kategori } }. Kør: node tools/gen_manifest.mjs
   ===================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { LETTERS, ANIMALS, COLORS, SHAPES, RIM, GLYPHS } from "../src/data.js";
import {
  SYS, ROS_IDS, PROEV_IDS, SPIL,
  bogstavNavn, bogstavLyd, talOrd, talHvormange, formSaetning,
  dyrUbest, dyrFlertal, dyrLyd, dyrelydSpm, rimSpm, rimOrd, sporGlyf,
} from "../src/audio-ids.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** @type {Record<string, {fil:string, tekst:string, kategori:string}>} */
const clips = {};
/** @param {string} id @param {string} tekst @param {string} kategori */
function add(id, tekst, kategori) {
  if (clips[id]) return; // dedupliker (fx rim-ord der optræder flere steder)
  clips[id] = { fil: `${id}.mp3`, tekst, kategori };
}

/* --- System --- */
add(SYS.velkomst, "Velkommen til Leg og Lær!", "system");
add(SYS.vaelg, "Vælg et spil, og leg med.", "system");
add(SYS.stjerne, "Hurra! Du har vundet en stjerne!", "system");
add(SYS.hold, "Bed en voksen om at holde knappen inde.", "system");

/* --- Ros --- */
const ROS_TEKST = ["Flot!", "Sikke godt!", "Super!", "Hurra for dig!", "Nemlig!", "Godt klaret!"];
ROS_IDS.forEach((id, i) => add(id, ROS_TEKST[i], "ros"));

/* --- Prøv igen --- */
const PROEV_TEKST = ["Prøv igen!", "Næsten! Prøv en gang til.", "Prøv en gang til.", "Kom så — prøv igen!"];
PROEV_IDS.forEach((id, i) => add(id, PROEV_TEKST[i], "proev"));

/* --- Bogstaver: navn + lyd ---
   NAVN = det danske BOGSTAVNAVN stavet fonetisk, så TTS'en siger "bæ" for B
   (ikke bare lyden "b"). Det gør bogstav-jagt langt tydeligere. */
const NAVN = {
  A: "a", B: "bæ", C: "sæ", D: "dæ", E: "e", F: "æf", G: "gæ", H: "hå",
  I: "i", J: "jåd", K: "kå", L: "æl", M: "æm", N: "æn", O: "o", P: "pæ",
  R: "ær", S: "æs", T: "tæ", U: "u", V: "væ", Y: "y", Æ: "æ", Ø: "ø", Å: "å",
};
const LYD = {
  A: "a", B: "bø", C: "s", D: "dø", E: "e", F: "føh", G: "gø", H: "hø",
  I: "i", J: "jø", K: "kø", L: "lø", M: "mø", N: "nø", O: "o", P: "pø",
  R: "rø", S: "søh", T: "tø", U: "u", V: "vø", Y: "y", Æ: "æ", Ø: "ø", Å: "å",
};
for (const L of LETTERS) {
  add(bogstavNavn(L), NAVN[L] || L.toLowerCase(), "bogstav");
  add(bogstavLyd(L), `${NAVN[L] || L} siger ${LYD[L] || L.toLowerCase()}`, "bogstav");
}

/* --- Tal 1-10 --- */
const TAL = ["", "en", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];
for (let n = 1; n <= 10; n++) add(talOrd(n), TAL[n], "tal");

/* --- Spil-instruktioner --- */
add(SPIL.bogstavFind, "Find bogstavet.", "instruks");
add(SPIL.memory, "Vendespil! Vend kortene, og find to ens.", "instruks");
add(SPIL.skygge, "Se på skyggen. Hvilken ting gemmer sig? Tryk på den rigtige.", "instruks");
add(SPIL.sporFoelg, "Følg prikkerne med fingeren.", "instruks");

/* --- Tæl med: helsætning pr. dyr --- */
for (const a of ANIMALS) {
  add(talHvormange(a.sym), `Hvor mange ${a.flertal} er der? Tæl dem, og tryk på tallet.`, "tal");
}

/* --- Farver & former: 6×5 helsætninger --- */
for (const c of COLORS) {
  for (const s of SHAPES) {
    add(formSaetning(c.navn, s.navn), `Tryk på den ${c.navn} ${s.navn}.`, "form");
  }
}

/* --- Dyr: ubestemt, flertal, lyd --- */
for (const a of ANIMALS) {
  add(dyrUbest(a.sym), a.ubest, "dyr");
  add(dyrFlertal(a.sym), a.flertal, "dyr");
  add(dyrLyd(a.sym), `${a.lyd}!`, "dyr");
  add(dyrelydSpm(a.sym), `Hvilket dyr siger ${a.lyd}?`, "dyrelyd");
}

/* --- Rim: spørgsmål pr. målord + alle 20 ordnavne --- */
for (const r of RIM) {
  add(rimSpm(r.ord), `Hvad rimer på ${r.ord}? Tryk på det, der rimer.`, "rim");
  add(rimOrd(r.ord), r.ord, "rim");
  add(rimOrd(r.rimOrd), r.rimOrd, "rim");
}

/* --- Spor & skriv: helsætning pr. glyf --- */
for (const g of Object.keys(GLYPHS)) {
  const erTal = "1234567890".includes(g);
  const hvad = erTal ? `tallet ${g}` : `bogstavet ${g}`;
  add(sporGlyf(g), `Skriv ${hvad}. Følg prikkerne med fingeren.`, "spor");
}

/* --- Skriv output --- */
const manifest = {
  version: 1,
  voice: "da_DK-talesyntese-medium (Piper, MIT/OFL-fri, neural dansk)",
  format: "mp3 (64 kbps mono, 22.05 kHz, trimmet + peak-normaliseret)",
  clips,
};

mkdirSync(join(root, "audio"), { recursive: true });
writeFileSync(join(root, "audio", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const jsHeader =
  "// @ts-nocheck\n/* AUTO-GENERERET af tools/gen_manifest.mjs – rediger ikke i hånden.\n" +
  "   Indlejres i app-bundlen; giver AudioManager teksten til Web Speech-fallback. */\n";
writeFileSync(
  join(root, "src", "audio-manifest.generated.js"),
  jsHeader + "export const MANIFEST = " + JSON.stringify(clips, null, 0) + ";\n"
);

console.log(`✔ Genereret ${Object.keys(clips).length} replikker → audio/manifest.json + src/audio-manifest.generated.js`);
