// @ts-check
/* ---------- Tale (dansk) via Web Speech API ----------
   I prototypen er dette den primære stemme. Fra I3 bliver det kun fallback for
   replikker uden en indspillet lydfil (se audio.js). R4: vent på voiceschanged
   før første replik, så vi ikke rammer en forkert/tom stemmeliste. */

import { store } from "./store.js";

/** @type {SpeechSynthesisVoice|null} */
let daVoice = null;

function pickVoice() {
  if (typeof speechSynthesis === "undefined") return;
  const vs = speechSynthesis.getVoices();
  daVoice = vs.find((v) => v.lang && v.lang.toLowerCase().startsWith("da")) || null;
}

if (typeof speechSynthesis !== "undefined") {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

/**
 * Læs en tekst højt (afbryder igangværende tale).
 * @param {string} text
 */
export function speak(text) {
  if (!store.voiceOn || typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "da-DK";
  if (daVoice) u.voice = daVoice;
  u.rate = 0.85; // roligt tempo til små børn
  u.pitch = 1.1;
  speechSynthesis.speak(u);
}

export function cancelSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
