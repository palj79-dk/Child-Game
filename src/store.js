// @ts-check
/* ---------- Lagring (kun lokalt) — R1: fejlhåndtering + versioneret skema ----------
   localStorage kan kaste (inkognito, fuld disk, blokeret af browser). Vi fanger alt
   og falder tilbage til en ren in-memory-kopi, så spillet aldrig går ned. Skemaet er
   versioneret ({ v: 1, … }) så fremtidige migreringer kan ske sikkert. */

const KEY = "legr";
const SCHEMA_VERSION = 1;

/** @typedef {{ level:number, window:boolean[], locked:boolean }} Adapt */
/** @typedef {{ v:number, stars?:Record<string,number>, voiceOn?:boolean,
 *   lockLevel?:boolean, adapt?:Record<string,Adapt> }} SaveData */

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

  /* ---- O2: adaptiv sværhedsgrad ---- */
  /** Startniveau ud fra optjente stjerner (0-2). @param {string} id */
  starLevel(id) {
    const s = this.stars(id);
    return s < 3 ? 0 : s < 6 ? 1 : 2;
  },
  /** Hent (og initialisér) det adaptive niveau-objekt for et spil. @param {string} id */
  adapt(id) {
    this.data.adapt = this.data.adapt || {};
    if (!this.data.adapt[id]) {
      this.data.adapt[id] = { level: this.starLevel(id), window: [], locked: false };
    }
    return this.data.adapt[id];
  },
  /** Aktuelt sværhedsniveau 0-2. @param {string} id */
  level(id) {
    return Math.max(0, Math.min(2, this.adapt(id).level));
  },
  /** Forældre-lås: når true justeres niveauet ikke automatisk. */
  get lockLevel() {
    return this.data.lockLevel === true;
  },
  set lockLevel(v) {
    this.data.lockLevel = v;
    this.save();
  },
  /**
   * Registrér udfaldet af én opgave og justér niveauet (glidende vindue).
   * >40 % fejl → et trin ned; høj succesrate → et trin op. @param {string} id
   * @param {boolean} success (løst uden fejlforsøg)
   */
  recordTask(id, success) {
    const a = this.adapt(id);
    if (this.lockLevel) return;
    a.window.push(!!success);
    if (a.window.length > 10) a.window.shift();
    const w = a.window;
    if (w.length >= 4) {
      const rate = w.filter((x) => !x).length / w.length;
      if (rate > 0.4 && a.level > 0) {
        a.level--;
        a.window = [];
      } else if (w.length >= 6 && rate < 0.15 && a.level < 2) {
        a.level++;
        a.window = [];
      }
    }
    this.save();
  },

  reset() {
    this.data = { v: SCHEMA_VERSION };
    this.save();
  },
};
