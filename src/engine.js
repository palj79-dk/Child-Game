// @ts-check
/* ---------- Spilmotor: 5 opgaver pr. runde → stjerne ---------- */

import { $, pick, ros } from "./util.js";
import { store } from "./store.js";
import { audio } from "./audio.js";
import { ROS_IDS, PROEV_IDS, SYS } from "./audio-ids.js";
import { sfxRight, sfxWrong, sfxStar } from "./sfx.js";

export const ROUND_LEN = 5;

/** @typedef {{ id:string, navn:string, ikon:string, promptText?:string, say?:string|string[], task:()=>void }} Game */

/** Delt, muterbar tilstand (moduler mutere state.solved i vendespil/spor). */
export const state = {
  /** @type {Game|null} */
  current: null,
  solved: 0,
  locked: false,
};

/** Sværhedsgrad 0-2 ud fra optjente stjerner (adaptiv styring tilføjes i I5/O2).
 * @param {string} id */
export function level(id) {
  const s = store.stars(id);
  return s < 3 ? 0 : s < 6 ? 1 : 2;
}

export function renderProgress() {
  const p = $("progress");
  if (!p) return;
  p.innerHTML = Array.from(
    { length: ROUND_LEN },
    (_, i) => `<div class="dot ${i < state.solved ? "done" : ""}"></div>`
  ).join("");
}

/** @param {string} id */
export function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id)?.classList.add("active");
}

/* Puls-hint på svarmuligheder efter inaktivitet (O4 udvides i I5). */
/** @type {ReturnType<typeof setTimeout>|undefined} */
let hintTimer;
export function armHint() {
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    document.querySelectorAll("#stage .choice").forEach((c) => c.classList.add("idle-hint"));
  }, 6000);
}
export function clearHint() {
  clearTimeout(hintTimer);
  document.querySelectorAll("#stage .choice").forEach((c) => c.classList.remove("idle-hint"));
}

/**
 * Byg en svar-knap og tilføj til scenen.
 * @param {string} html @param {boolean} isRight @param {string} [cls]
 */
export function addChoice(html, isRight, cls = "") {
  const b = document.createElement("button");
  b.className = "choice " + cls;
  b.innerHTML = html;
  b.addEventListener("pointerdown", () => answer(b, isRight));
  $("stage")?.appendChild(b);
  return b;
}

/** @param {Game} game */
export function startGame(game) {
  state.current = game;
  state.solved = 0;
  state.locked = false;
  showScreen("game");
  nextTask();
}

export function nextTask() {
  state.locked = false;
  renderProgress();
  const stage = $("stage");
  if (stage) stage.innerHTML = "";
  const g = state.current;
  if (!g) return;
  g.task(); // spillet bygger scenen og sætter g.promptText + g.say
  const prompt = $("prompt");
  if (prompt) prompt.textContent = g.promptText ?? "";
  audio.say(g.say ?? []);
  armHint();
}

/**
 * Behandl et svar. isRight=true → ros + fremdrift; ellers blid "prøv igen".
 * @param {HTMLElement|null} el @param {boolean} isRight
 */
export function answer(el, isRight) {
  if (state.locked) return;
  clearHint();
  if (isRight) {
    state.locked = true;
    sfxRight();
    audio.say(pick(ROS_IDS));
    if (el) el.style.background = "#e2f7d9";
    state.solved++;
    renderProgress();
    setTimeout(() => (state.solved >= ROUND_LEN ? finishRound() : nextTask()), 1100);
  } else {
    sfxWrong();
    audio.say(pick(PROEV_IDS));
    if (el) {
      el.classList.remove("wrong");
      void el.offsetWidth; // genstart animationen
      el.classList.add("wrong");
    }
    armHint();
  }
}

export function finishRound() {
  const g = state.current;
  if (!g) return;
  store.addStar(g.id);
  sfxStar();
  audio.say(SYS.stjerne);
  const msg = $("partyMsg");
  if (msg) msg.textContent = pick(ros) + " Du fik en stjerne! ⭐";
  showScreen("game");
  $("party")?.classList.add("active");
  confetti();
}

export function confetti() {
  const bits = ["🎉", "⭐", "🎈", "✨", "🟡", "🔵"];
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("div");
    s.className = "confetti";
    s.textContent = pick(bits);
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
    s.style.animationDelay = Math.random() * 0.5 + "s";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 4000);
  }
}
