// @ts-check
/* ---------- Lagring (kun lokalt) — R1: fejlhåndtering + versioneret skema ----------
   localStorage kan kaste (inkognito, fuld disk, blokeret af browser). Vi fanger alt
   og falder tilbage til en ren in-memory-kopi, så spillet aldrig går ned. Skemaet er
   versioneret ({ v: 1, … }) så fremtidige migreringer kan ske sikkert. */

const KEY = "legr";
const SCHEMA_VERSION = 1;

/** @typedef {{ v:number, stars?:Record<string,number>, voiceOn?:boolean }} SaveData */

/** @returns {SaveData} */
function migrate(raw) {
  if (!raw || typeof raw !== "object") return { v: SCHEMA_VERSION };
  const d = /** @type {SaveData} */ (raw);
  if (!d.v) d.v = SCHEMA_VERSION; // v0 → v1: skemaet er bagudkompatibelt
  // Fremtidige migreringer: if (d.v === 1) { …; d.v = 2; }
  return d;
}

/** @returns {SaveData} */
function load() {
  try {
    const rawStr = localStorage.getItem(KEY);
    if (!rawStr) return { v: SCHEMA_VERSION };
    return migrate(JSON.parse(rawStr));
  } catch (_e) {
    return { v: SCHEMA_VERSION }; // korrupt eller utilgængelig → frisk in-memory
  }
}

export const store = {
  /** @type {SaveData} */
  data: load(),
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (_e) {
      /* in-memory-fallback: this.data beholdes i hukommelsen for sessionen */
    }
  },
  /** @param {string} id */
  stars(id) {
    return (this.data.stars || {})[id] || 0;
  },
  /** @param {string} id */
  addStar(id) {
    this.data.stars = this.data.stars || {};
    this.data.stars[id] = this.stars(id) + 1;
    this.save();
  },
  get voiceOn() {
    return this.data.voiceOn !== false;
  },
  set voiceOn(v) {
    this.data.voiceOn = v;
    this.save();
  },
  reset() {
    this.data = { v: SCHEMA_VERSION };
    this.save();
  },
};
