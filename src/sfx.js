// @ts-check
/* ---------- Effektlyde (Web Audio, ingen filer) ----------
   Genereres i browseren – ingen assets, ingen netværk. Startes altid af
   brugerens første tryk (ensureAudio) pga. autoplay-regler i WebView. */

/** @type {AudioContext|null} */
let audioCtx = null;

/**
 * @param {number} freq @param {number} t0 @param {number} dur
 * @param {OscillatorType} [type] @param {number} [gain]
 */
function tone(freq, t0, dur, type = "sine", gain = 0.18) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, audioCtx.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t0 + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(audioCtx.currentTime + t0);
  o.stop(audioCtx.currentTime + t0 + dur);
}

export function ensureAudio() {
  if (!audioCtx) {
    try {
      const Ctx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      audioCtx = new Ctx();
    } catch (_e) {
      /* ingen lyd – appen fungerer stadig visuelt */
    }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

export function sfxRight() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.25)); }
export function sfxWrong() { tone(180, 0, 0.3, "triangle", 0.12); }
export function sfxStar() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.35)); }
export function sfxFlip() { tone(700, 0, 0.08, "square", 0.05); }
/** Rolig tilstand: én blød to-tone "pling" i stedet for fanfaren. */
export function sfxChime() { tone(660, 0, 0.45, "sine", 0.1); tone(880, 0.12, 0.55, "sine", 0.07); }
