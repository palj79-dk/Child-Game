// @ts-check
/* ---------- Play-log (KUN lokal, ingen dataindsamling) ----------
   Registrerer hvordan en spilsession forløber – tid pr. opgave, forsøg og
   niveau – så en voksen/QC-tester kan vurdere om sværhedsgraden passer, og
   hvor lang tid barnet bruger. Alt bliver i hukommelsen + localStorage på
   ENHEDEN; intet sendes nogen steder.

   ⚠️ UDVIKLINGS-/QC-FUNKTION. Skal fjernes før udgivelse: se docs/QC-LOG.md.
   Kill-switch: sæt DEV_INSTRUMENTATION = false herunder, så bliver hele loggen
   (og dens UI) inaktiv i hele appen. */
export const DEV_INSTRUMENTATION = true;

const KEY = "legr_qclog";
const MAX = 800;

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
    if (!this.enabled || !DEV_INSTRUMENTATION) return;
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

  /** Aggregér pr. spil: antal, rigtige/forkerte, snit-løsetid, aktuelt niveau.
   * Bruges til at vurdere om sværhedsgraden passer. */
  summary() {
    /** @type {Record<string, {opgaver:number,rigtige:number,forkerte:number,tidSum:number,tidN:number,niveau:number|null}>} */
    const per = {};
    for (const e of mem) {
      const spil = e.spil;
      if (!spil) continue;
      const s = (per[spil] = per[spil] || { opgaver: 0, rigtige: 0, forkerte: 0, tidSum: 0, tidN: 0, niveau: null });
      if (e.type === "opgave") s.opgaver++;
      else if (e.type === "rigtigt") {
        s.rigtige++;
        if (typeof e.ms === "number") { s.tidSum += e.ms; s.tidN++; }
      } else if (e.type === "forkert") s.forkerte++;
      if (typeof e.niveau === "number") s.niveau = e.niveau;
    }
    return per;
  },

  /** Resumé som læsbar tekst (snit-løsetid i sekunder, fejlrate, niveau). */
  summaryText() {
    const per = this.summary();
    const rows = Object.entries(per).map(([spil, s]) => {
      const snit = s.tidN ? (s.tidSum / s.tidN / 1000).toFixed(1) + " s" : "–";
      const forsøgt = s.rigtige + s.forkerte;
      const fejl = forsøgt ? Math.round((s.forkerte / forsøgt) * 100) : 0;
      return `${spil.padEnd(8)} niveau ${s.niveau ?? "?"} · ${s.rigtige} rigtige · ${fejl}% fejl · snit ${snit}`;
    });
    return rows.length ? "RESUMÉ (er niveauet rigtigt?)\n" + rows.join("\n") + "\n\n" : "";
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
