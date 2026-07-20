// @ts-check
import { LETTERS } from "../data.js";
import { pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";
import { SPIL, bogstavNavn } from "../audio-ids.js";
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
    this.promptText = `Find bogstavet ${target}`;
    this.say = [SPIL.bogstavFind, bogstavNavn(target)];
    shuffle(opts.slice()).forEach((L) => addChoice(L, L === target, "letter"));
  },
};
