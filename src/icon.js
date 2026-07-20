// @ts-check
/* ---------- icon()-lag ----------
   Central abstraktion: koden beder om et symbol-navn, ikke en fil. Returnerer et
   inline <svg> der refererer et <symbol> i spritesheetet (assets/sprites.svg,
   inlines af build.mjs). Én asset kan forbedres uden at røre spillene. */

/**
 * @param {string} name symbol-id i spritesheetet (fx "dyr-ko")
 * @param {string} [cls] ekstra CSS-klasse(r)
 * @returns {string} HTML for et inline SVG-ikon
 */
export function icon(name, cls = "") {
  return `<svg class="ico ${cls}" viewBox="0 0 100 100" aria-hidden="true"><use href="#${name}"></use></svg>`;
}
