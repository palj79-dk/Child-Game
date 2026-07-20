// @ts-check
/* ---------- AudioManager ----------
   Afløser speak(): koden kalder audio.say(id | [ids]). Promise-baseret med kø,
   så hint-timere og låse kan vente på, at talen er færdig. Fallback-kæde pr.
   replik: indspillet fil (base64 i AUDIO_DATA) → Web Speech på manifest-teksten →
   stilhed + visuel hint (appen fungerer helt uden lyd). Effektlyde forbliver
   Web Audio-genererede (sfx.js). */

import { store } from "./store.js";
import { speak as webSpeak, cancelSpeech } from "./speech.js";
import { MANIFEST } from "./audio-manifest.generated.js";
import { AUDIO_DATA } from "./audio-data.generated.js";

/** @type {Map<string, HTMLAudioElement>} */
const cache = new Map();
/** @type {HTMLAudioElement|null} */
let currentEl = null;
let seq = 0; // stigende token; ny say() afbryder tidligere sekvens

/** @param {string} id */
function clipUrl(id) {
  return AUDIO_DATA[id] || null;
}

/** @param {string} id */
function getEl(id) {
  let el = cache.get(id);
  if (!el) {
    const url = clipUrl(id);
    if (!url) return null;
    el = new Audio(url);
    el.preload = "auto";
    cache.set(id, el);
  }
  return el;
}

/** Anslå varighed til fallback-timing når vi bruger Web Speech. @param {string} t */
function estimateMs(t) {
  return Math.min(6000, 500 + t.length * 70);
}

/**
 * Afspil én replik. Resolver når den er færdig (eller sekvensen er afbrudt).
 * @param {string} id @param {number} token
 */
function playOne(id, token) {
  return new Promise((resolve) => {
    if (token !== seq) return resolve(undefined);
    const entry = MANIFEST[id];
    const el = getEl(id);
    if (el) {
      currentEl = el;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        el.onended = el.onerror = null;
        resolve(undefined);
      };
      el.onended = finish;
      el.onerror = () => {
        // filen fejlede → Web Speech-fallback
        if (entry) webSpeak(entry.tekst);
        finish();
      };
      try {
        el.currentTime = 0;
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => el.onerror && el.onerror(new Event("error")));
      } catch (_e) {
        if (entry) webSpeak(entry.tekst);
        finish();
      }
    } else {
      // ingen fil → Web Speech på manifest-teksten (eller stilhed)
      const tekst = entry ? entry.tekst : "";
      if (tekst) webSpeak(tekst);
      setTimeout(() => resolve(undefined), tekst ? estimateMs(tekst) : 0);
    }
  });
}

export const audio = {
  /** @param {string} id */
  has(id) {
    return !!MANIFEST[id];
  },
  /** @param {string} id */
  tekst(id) {
    return MANIFEST[id] ? MANIFEST[id].tekst : "";
  },
  /** Forudindlæs replikker for et spil (kun dem der har en fil). @param {string[]} ids */
  preload(ids) {
    for (const id of ids) getEl(id);
  },
  stop() {
    seq++;
    cancelSpeech();
    if (currentEl) {
      try {
        currentEl.pause();
      } catch (_e) {}
      currentEl = null;
    }
  },
  /**
   * Afspil én eller flere replikker i sekvens. Afbryder igangværende tale.
   * @param {string|string[]} idOrIds
   * @returns {Promise<void>}
   */
  async say(idOrIds) {
    if (!store.voiceOn) return;
    this.stop();
    const token = seq; // stop() øgede seq; brug den nye værdi som vores token
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    for (const id of ids) {
      if (token !== seq) return;
      await playOne(id, token);
    }
  },
};
