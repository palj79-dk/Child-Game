// @ts-check
import { ANIMALS } from "../data.js";
import { pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";
import { icon } from "../icon.js";
import { dyrelydSpm } from "../audio-ids.js";

const LEVEL_N = [3, 4, 6];

/** @param {number} lvl */
export function gen(lvl) {
  const n = LEVEL_N[lvl] ?? LEVEL_N[0];
  const opts = pickN(ANIMALS, n);
  const target = pick(opts);
  return { n, target, opts };
}

export const dyr = {
  id: "dyr",
  navn: "Dyrelyde",
  ikon: "🐄",
  gen,
  task() {
    const { target, opts } = gen(level(this.id));
    this.promptText = `Hvilket dyr siger ${target.lyd}?`;
    this.say = dyrelydSpm(target.sym);
    shuffle(opts.slice()).forEach((a) => addChoice(icon(a.sym), a === target));
  },
};
