// @ts-check
import { LETTERS, LETTER_EKSEMPEL, LETTER_EKSEMPEL_SYM } from "../data.js";
import { $, pick, pickN, shuffle } from "../util.js";
import { store } from "../store.js";
import { level, addChoice } from "../engine.js";
import { icon } from "../icon.js";
import { SPIL, bogstavEksempel, bogstavLydEksempel } from "../audio-ids.js";
import { fresh } from "../anti_repeat.js";

const LEVEL_N = [3, 4, 6];

/** Ren generator (testbar): vælg n bogstaver og et mål.
 * @param {number} lvl @returns {{ n:number, target:string, opts:string[] }} */
export function gen(lvl) {
  const n = LEVEL_N[lvl] ?? LEVEL_N[0];
  const opts = pickN(LETTERS, n);
  const target = pick(opts);
  return { n, target, opts };
}

export const bogstav = {
  id: "bogstav",
  navn: "Bogstav-jagt",
  ikon: "🔤",
  gen,
  task() {
    const { target, opts } = fresh(this.id, () => gen(level(this.id)), (r) => r.target);
    const ord = LETTER_EKSEMPEL[target];
    const sym = LETTER_EKSEMPEL_SYM[target];
    const lyd = store.letterMode === "lyd";

    // Vis og sig eksemplet. Navn-tilstand: "Find bogstavet S · S som sol".
    // Lyd-tilstand (fonem): "Find bogstavet der siger sss, som i sol".
    this.promptText = lyd
      ? ord ? `Lyt – hvilket bogstav? · som ${ord}` : "Lyt – hvilket bogstav?"
      : ord ? `Find bogstavet ${target} · ${target} som ${ord}` : `Find bogstavet ${target}`;
    this.say = lyd ? [bogstavLydEksempel(target)] : [SPIL.bogstavFind, bogstavEksempel(target)];

    // Billede-hint af eksempelordet (fx en sol for S)
    if (sym) {
      const hint = document.createElement("div");
      hint.className = "eks-hint";
      hint.innerHTML = `${icon(sym)}<div class="w">${ord}</div>`;
      $("stage")?.appendChild(hint);
    }

    shuffle(opts.slice()).forEach((L) => addChoice(L, L === target, "letter"));
  },
};
