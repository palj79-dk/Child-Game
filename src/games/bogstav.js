// @ts-check
import { LETTERS } from "../data.js";
import { pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";

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
    const { target, opts } = gen(level(this.id));
    this.promptText = `Find bogstavet ${target}`;
    this.say = this.promptText;
    shuffle(opts.slice()).forEach((L) => addChoice(L, L === target, "letter"));
  },
};
