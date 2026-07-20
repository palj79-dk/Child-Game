// @ts-check
import { THINGS } from "../data.js";
import { $, pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";
import { icon } from "../icon.js";

const LEVEL_N = [3, 4, 5];

/** @param {number} lvl */
export function gen(lvl) {
  const n = LEVEL_N[lvl] ?? LEVEL_N[0];
  const opts = pickN(THINGS, n);
  const target = pick(opts);
  return { n, target, opts };
}

export const skygge = {
  id: "skygge",
  navn: "Skygge-leg",
  ikon: "👤",
  gen,
  task() {
    const { target, opts } = gen(level(this.id));
    const wrap = document.createElement("div");
    wrap.style.cssText = "width:100%;text-align:center";
    wrap.innerHTML = `<span class="shadow-target">${icon(target.sym)}</span>`;
    $("stage")?.appendChild(wrap);
    shuffle(opts.slice()).forEach((t) => addChoice(icon(t.sym), t === target));
    this.promptText = "Hvem gemmer sig i skyggen?";
    this.say = "Se på skyggen. Hvilken ting gemmer sig? Tryk på den rigtige.";
  },
};
