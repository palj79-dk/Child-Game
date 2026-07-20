// @ts-check
import { RIM } from "../data.js";
import { pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";

const LEVEL_DISTRACT = [2, 3, 4];

/** @typedef {{ ord:string, e:string, rigtig?:boolean }} RimOpt */

/** Ren generator. I1: original logik. O5 (rim-familie-regel) tilføjes i I5.
 * @param {number} lvl @returns {{ target: import("../data.js").RimPar, options: RimOpt[] }} */
export function gen(lvl) {
  const nDistract = LEVEL_DISTRACT[lvl] ?? LEVEL_DISTRACT[0];
  const target = pick(RIM);
  const distractors = pickN(RIM.filter((r) => r !== target), nDistract).map((r) =>
    Math.random() < 0.5 ? { ord: r.ord, e: r.e } : { ord: r.rimOrd, e: r.rimE }
  );
  const options = shuffle([{ ord: target.rimOrd, e: target.rimE, rigtig: true }, ...distractors]);
  return { target, options };
}

export const rim = {
  id: "rim",
  navn: "Rim-tid",
  ikon: "🎵",
  gen,
  task() {
    const { target, options } = gen(level(this.id));
    const el = document.createElement("div");
    el.className = "rim-target";
    el.innerHTML = `<div class="emo">${target.e}</div><div class="word">${target.ord}</div>`;
    document.getElementById("stage")?.appendChild(el);
    options.forEach((o) => addChoice(`${o.e}<div class="rim-word">${o.ord}</div>`, !!o.rigtig, "rim"));
    this.promptText = `Hvad rimer på ${target.ord}?`;
    this.say = `Hvad rimer på ${target.ord}? ... ${target.ord}. Tryk på det, der rimer.`;
  },
};
