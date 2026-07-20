// @ts-check
/* ---------- Stabile lyd-id'er ----------
   Delt mellem spillene (der beder om et id ved runtime) og manifest-generatoren
   (der producerer teksten pr. id). Koden refererer ALDRIG en filsti – kun et id –
   så hele stemmen kan udskiftes uden kodeændring (jf. FORBEDRINGSPLAN §1.2). */

/** Gør en streng til en fil-/URL-sikker nøgle. æøå → ae/oe/aa.
 * @param {string} s */
export function asciiKey(s) {
  return String(s)
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/* System */
export const SYS = {
  velkomst: "sys_velkomst",
  vaelg: "sys_vaelg_spil",
  stjerne: "sys_stjerne",
  hold: "sys_hold_knap",
};

/* Ros og prøv-igen (motoren vælger tilfældigt) */
export const ROS_IDS = ["ros_01", "ros_02", "ros_03", "ros_04", "ros_05", "ros_06"];
export const PROEV_IDS = ["proev_01", "proev_02", "proev_03", "proev_04"];

/* Faste spil-instruktioner */
export const SPIL = {
  bogstavFind: "spil_bogstav_find",
  memory: "spil_memory_instruks",
  skygge: "spil_skygge_instruks",
  sporFoelg: "spor_foelg",
};

/* Byggere */
/** @param {string} L */ export const bogstavNavn = (L) => `bogstav_${asciiKey(L)}_navn`;
/** @param {string} L */ export const bogstavLyd = (L) => `bogstav_${asciiKey(L)}_lyd`;
/** @param {number} n */ export const talOrd = (n) => `tal_${n}`;
/** @param {string} sym */ export const talHvormange = (sym) => `tal_hvormange_${asciiKey(sym)}`;
/** @param {string} farve @param {string} form */
export const formSaetning = (farve, form) => `form_${asciiKey(farve)}_${asciiKey(form)}`;
/** @param {string} sym */ export const dyrUbest = (sym) => `dyr_${asciiKey(sym)}_ubest`;
/** @param {string} sym */ export const dyrFlertal = (sym) => `dyr_${asciiKey(sym)}_flertal`;
/** @param {string} sym */ export const dyrLyd = (sym) => `dyr_${asciiKey(sym)}_lyd`;
/** @param {string} sym */ export const dyrelydSpm = (sym) => `dyrelyd_spm_${asciiKey(sym)}`;
/** @param {string} ord */ export const rimSpm = (ord) => `rim_spm_${asciiKey(ord)}`;
/** @param {string} ord */ export const rimOrd = (ord) => `rim_ord_${asciiKey(ord)}`;
/** @param {string} g */ export const sporGlyf = (g) => `spor_${asciiKey(g)}`;
