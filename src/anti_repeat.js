// @ts-check
/* O1: anti-gentagelses-buffer. Husk de sidste par mål pr. spil og træk om, så
   den samme opgave ikke kommer to gange i træk (eller tre gange). */

/** @type {Map<string, string[]>} */
const recent = new Map();

/**
 * Kald produce() indtil resultatet har en nøgle der ikke er set for nyligt.
 * @template T
 * @param {string} id spilets id (egen buffer pr. spil)
 * @param {() => T} produce generatoren
 * @param {(r:T) => string} keyOf nøgle for et resultat (fx målordet)
 * @param {number} [keep] hvor mange seneste nøgler der undgås
 * @param {number} [tries] maks forsøg (undgår uendelig løkke ved lille pulje)
 * @returns {T}
 */
export function fresh(id, produce, keyOf, keep = 2, tries = 12) {
  const buf = recent.get(id) || [];
  let res = produce();
  let key = keyOf(res);
  for (let i = 0; i < tries && buf.includes(key); i++) {
    res = produce();
    key = keyOf(res);
  }
  buf.push(key);
  while (buf.length > keep) buf.shift();
  recent.set(id, buf);
  return res;
}

/** Nulstil bufferne (bruges i test). */
export function _resetRecent() {
  recent.clear();
}
