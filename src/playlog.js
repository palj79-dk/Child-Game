// @ts-check
/* ---------- QC play-log (KUN lokal, ingen dataindsamling) ----------
   Registrerer hvordan en spilsession forløber, så en QC-tester/voksen kan
   forstå spillet. Alt bliver i hukommelsen + valgfrit i localStorage på ENHEDEN;
   intet sendes nogen steder. Kun aktiv når rollen er "QC-tester". */

const KEY = "legr_qclog";
const MAX = 500;

/** @type {Array<Record<string, any>>} */
let mem = [];

function stamp() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

export const playlog = {
  enabled: false,

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) mem = JSON.parse(raw);
    } catch (_e) {
      mem = [];
    }
  },

  /** @param {string} type @param {Record<string, any>} [data] */
  log(type, data) {
    if (!this.enabled) return;
    mem.push({ t: stamp(), type, ...(data || {}) });
    if (mem.length > MAX) mem.shift();
    try {
      localStorage.setItem(KEY, JSON.stringify(mem));
    } catch (_e) {
      /* fuld disk/inkognito – behold i hukommelsen */
    }
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("qclog"));
  },

  entries() {
    return mem;
  },

  clear() {
    mem = [];
    try {
      localStorage.removeItem(KEY);
    } catch (_e) {}
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("qclog"));
  },

  /** Læsbar tekst til visning/kopiering. */
  dump() {
    return mem
      .map((e) => {
        const rest = Object.entries(e)
          .filter(([k]) => k !== "t" && k !== "type")
          .map(([k, v]) => `${k}=${v}`)
          .join("  ");
        return `${e.t}  ${e.type}${rest ? "  " + rest : ""}`;
      })
      .join("\n");
  },
};
