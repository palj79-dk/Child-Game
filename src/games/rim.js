// @ts-check
import { RIM } from "../data.js";
import { pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";
import { icon } from "../icon.js";
import { rimSpm } from "../audio-ids.js";
import { fresh } from "../anti_repeat.js";

const LEVEL_DISTRACT = [2, 3, 4];

/** @typedef {{ ord:string, e:string, sym:string, fam:string, rigtig?:boolean }} RimOpt */

/** Ren generator. O5: distraktorer må ALDRIG dele rim-familie med målordet
 * (ellers ville et "forkert" svar faktisk rime). Hvert rim-par deler familie,
 * så det er nok at udelukke par med samme fam som målet.
 * @param {number} lvl @returns {{ target: import("../data.js").RimPar, options: RimOpt[] }} */
export function gen(lvl) {
  const nDistract = LEVEL_DISTRACT[lvl] ?? LEVEL_DISTRACT[0];
  const target = pick(RIM);
  const pool = RIM.filter((r) => r !== target && r.fam !== target.fam);
  const distractors = pickN(pool, nDistract).map((r) =>
    Math.random() < 0.5
      ? { ord: r.ord, e: r.e, sym: r.sym, fam: r.fam }
      : { ord: r.rimOrd, e: r.rimE, sym: r.rimSym, fam: r.fam }
  );
  const options = shuffle([
    { ord: target.rimOrd, e: target.rimE, sym: target.rimSym, fam: target.fam, rigtig: true },
    ...distractors,
  ]);
  return { target, options };
}

export const rim = {
  id: "rim",
  navn: "Rim-tid",
  ikon: "🎵",
  gen,
  task() {
    const { target, options } = fresh(this.id, () => gen(level(this.id)), (r) => r.target.ord);
    const el = document.createElement("div");
    el.className = "rim-target";
    el.innerHTML = `<div class="emo">${icon(target.sym)}</div><div class="word">${target.ord}</div>`;
    document.getElementById("stage")?.appendChild(el);
    options.forEach((o) => addChoice(`${icon(o.sym)}<div class="rim-word">${o.ord}</div>`, !!o.rigtig, "rim"));
    this.promptText = `Hvad rimer på ${target.ord}?`;
    this.say = rimSpm(target.ord);
  },
};
