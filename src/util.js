// @ts-check
/* Små hjælpere uden sideeffekter (kan testes i Node). */

/** @param {string} id */
export const $ = (id) => document.getElementById(id);

/**
 * Fisher-Yates blanding – muterer og returnerer arrayet.
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tilfældigt element.
 * @template T
 * @param {T[]} a
 * @returns {T}
 */
export const pick = (a) => a[(Math.random() * a.length) | 0];

/**
 * n tilfældige elementer (uden gentagelse).
 * @template T
 * @param {T[]} a
 * @param {number} n
 * @returns {T[]}
 */
export const pickN = (a, n) => shuffle(a.slice()).slice(0, n);

/** Rosende tilbagemeldinger (bruges også som audio-id ros_01 … i I3). */
export const ros = ["Flot!", "Sikke godt!", "Super!", "Hurra for dig!", "Nemlig!", "Godt klaret!"];
