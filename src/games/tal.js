// @ts-check
import { ANIMALS } from "../data.js";
import { $, pick, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";
import { icon } from "../icon.js";

const LEVEL_MAX = [3, 5, 10];

/** Byg 3 distinkte svarmuligheder inkl. n, alle i [1,max]. Terminerer altid.
 * @param {number} n @param {number} max @returns {number[]} */
export function numberOptions(n, max) {
  const set = new Set([n]);
  const pool = [];
  for (let v = 1; v <= max; v++) if (v !== n) pool.push(v);
  // nære værdier først (lettere at forveksle), men bland lidt for variation
  pool.sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || Math.random() - 0.5);
  for (const v of pool) {
    if (set.size >= 3) break;
    set.add(v);
  }
  return shuffle([...set]);
}

/** @param {number} lvl */
export function gen(lvl) {
  const max = LEVEL_MAX[lvl] ?? LEVEL_MAX[0];
  const n = 1 + ((Math.random() * max) | 0);
  const dyr = pick(ANIMALS);
  const opts = numberOptions(n, max);
  return { max, n, dyr, opts };
}

export const tal = {
  id: "tal",
  navn: "Tæl med",
  ikon: "🔢",
  gen,
  task() {
    const { n, dyr, opts } = gen(level(this.id));
    const herd = document.createElement("div");
    herd.id = "herd";
    herd.innerHTML = Array(n).fill(icon(dyr.sym)).join("");
    $("stage")?.appendChild(herd);
    opts.forEach((v) => addChoice(String(v), v === n, "number"));
    this.promptText = `Hvor mange ${dyr.flertal} er der?`;
    this.say = `Hvor mange ${dyr.flertal} er der? Tæl dem, og tryk på tallet.`;
  },
};
