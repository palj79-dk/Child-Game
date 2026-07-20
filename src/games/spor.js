// @ts-check
import { GLYPHS, GLYPH_LEVELS } from "../data.js";
import { $, pick } from "../util.js";
import { state, level, answer } from "../engine.js";
import { sfxFlip } from "../sfx.js";

/** Vælg en glyf fra niveau-poolen. Testbar.
 * @param {number} lvl */
export function gen(lvl) {
  const pool = GLYPH_LEVELS.slice(0, lvl + 1).flat();
  const g = pick(pool);
  const erTal = "1234567890".includes(g);
  return { g, erTal, pool };
}

export const spor = {
  id: "spor",
  navn: "Spor & skriv",
  ikon: "✏️",
  task() {
    const { g, erTal } = gen(level(this.id));
    this.promptText = erTal ? `Skriv tallet ${g}` : `Skriv bogstavet ${g}`;
    this.say = this.promptText + ". Følg prikkerne med fingeren.";

    const wrap = document.createElement("div");
    wrap.id = "traceWrap";
    wrap.innerHTML = `<svg viewBox="0 0 100 100"><path class="trace-path" d="${GLYPHS[g]}"/></svg>`;
    $("stage")?.appendChild(wrap);
    const svg = /** @type {SVGSVGElement} */ (wrap.querySelector("svg"));
    const path = /** @type {SVGPathElement} */ (svg.querySelector(".trace-path"));

    // Prikker langs banen
    const len = path.getTotalLength();
    const n = Math.max(8, Math.min(22, Math.round(len / 11)));
    const pts = Array.from({ length: n }, (_, i) => {
      const p = path.getPointAtLength((len * i) / (n - 1));
      return { x: p.x, y: p.y };
    });
    const dots = pts.map((p) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(p.x));
      c.setAttribute("cy", String(p.y));
      c.setAttribute("r", "5");
      c.setAttribute("class", "wp");
      svg.appendChild(c);
      return c;
    });
    let next = 0;
    dots[0].classList.add("next");

    /** @param {{clientX:number, clientY:number}} e */
    const toSvg = (e) => {
      const p = svg.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM()?.inverse());
    };
    let down = false;
    const HIT = 11; // generøs radius til små fingre
    /** @param {PointerEvent} e */
    const tryHit = (e) => {
      if (!down || state.locked || next >= pts.length) return;
      const p = toSvg(e);
      while (next < pts.length && Math.hypot(p.x - pts[next].x, p.y - pts[next].y) < HIT) {
        dots[next].classList.remove("next");
        dots[next].classList.add("hit");
        sfxFlip();
        next++;
        if (next < pts.length) dots[next].classList.add("next");
      }
      if (next >= pts.length) {
        down = false;
        answer(null, true);
      }
    };
    svg.addEventListener("pointerdown", (e) => {
      down = true;
      tryHit(e);
    });
    svg.addEventListener("pointermove", tryHit);
    ["pointerup", "pointercancel"].forEach((ev) =>
      svg.addEventListener(ev, () => {
        down = false;
      })
    );
  },
};
