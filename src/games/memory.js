// @ts-check
import { ANIMALS } from "../data.js";
import { $, pickN, shuffle } from "../util.js";
import { ROUND_LEN, state, level, renderProgress, finishRound } from "../engine.js";
import { speak } from "../speech.js";
import { sfxFlip, sfxRight } from "../sfx.js";

const LEVEL_PAIRS = [3, 4, 6];

/** Byg et blandet kortsæt (par → to kort). Testbar.
 * @param {number} lvl */
export function gen(lvl) {
  const pairs = LEVEL_PAIRS[lvl] ?? LEVEL_PAIRS[0];
  const deck = shuffle(
    pickN(ANIMALS, pairs)
      .flatMap((a) => [a, a])
      .map((a, i) => ({ a, key: i }))
  );
  return { pairs, deck };
}

export const memory = {
  id: "memory",
  navn: "Vendespil",
  ikon: "🃏",
  gen,
  task() {
    const { pairs, deck } = gen(level(this.id));
    state.solved = 0; // progression = fundne par
    let openCard = /** @type {HTMLElement|null} */ (null);
    let busy = false;
    let found = 0;
    this.promptText = "Find to ens!";
    this.say = "Vendespil! Vend kortene, og find to ens.";
    deck.forEach((card) => {
      const b = document.createElement("button");
      b.className = "choice mem-card";
      b.innerHTML = `<div class="face back-face">?</div><div class="face front-face">${card.a.e}</div>`;
      b.addEventListener("pointerdown", () => {
        if (busy || b.classList.contains("open")) return;
        sfxFlip();
        b.classList.add("open");
        speak(card.a.ubest);
        if (!openCard) {
          openCard = b;
          /** @type {any} */ (openCard)._animal = card.a;
          return;
        }
        busy = true;
        if (/** @type {any} */ (openCard)._animal === card.a) {
          openCard.classList.add("matched");
          b.classList.add("matched");
          sfxRight();
          found++;
          state.solved = Math.min(ROUND_LEN, Math.round((found / pairs) * ROUND_LEN));
          renderProgress();
          openCard = null;
          busy = false;
          if (found === pairs) setTimeout(finishRound, 900);
        } else {
          const prev = openCard;
          openCard = null;
          setTimeout(() => {
            prev.classList.remove("open");
            b.classList.remove("open");
            busy = false;
          }, 900);
        }
      });
      $("stage")?.appendChild(b);
    });
  },
};
