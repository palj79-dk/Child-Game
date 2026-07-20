// @ts-check
import { COLORS, SHAPES } from "../data.js";
import { pick, pickN, shuffle } from "../util.js";
import { level, addChoice } from "../engine.js";
import { formSaetning } from "../audio-ids.js";
import { fresh } from "../anti_repeat.js";

const LEVEL_N = [4, 5, 6];

/** @param {number} lvl */
export function gen(lvl) {
  const n = LEVEL_N[lvl] ?? LEVEL_N[0];
  const combos = [];
  SHAPES.forEach((s) => COLORS.forEach((c) => combos.push({ s, c })));
  const opts = pickN(combos, n);
  const target = pick(opts);
  return { n, target, opts };
}

export const form = {
  id: "form",
  navn: "Farver & former",
  ikon: "🔺",
  gen,
  task() {
    const { target, opts } = fresh(
      this.id,
      () => gen(level(this.id)),
      (r) => r.target.c.navn + "|" + r.target.s.navn
    );
    // Signal er aldrig kun farve: der spørges altid efter farve OG form (farveblind-sikkert)
    this.promptText = `Tryk på den ${target.c.navn} ${target.s.navn}`;
    this.say = formSaetning(target.c.navn, target.s.navn);
    shuffle(opts.slice()).forEach((o) =>
      addChoice(`<svg viewBox="0 0 100 100" width="80%" height="80%">${o.s.tegn(o.c.css)}</svg>`, o === target)
    );
  },
};
