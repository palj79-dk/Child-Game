// @ts-check
/* ---------- Forside, navigation, forældre-gate ---------- */

import { $ } from "./util.js";
import { store } from "./store.js";
import { GAMES } from "./games/index.js";
import { state, startGame, showScreen, clearHint } from "./engine.js";
import { ensureAudio } from "./sfx.js";
import { speak, cancelSpeech } from "./speech.js";

export function renderMenu() {
  const menu = $("menu");
  if (!menu) return;
  menu.innerHTML = "";
  GAMES.forEach((g) => {
    const b = document.createElement("button");
    b.className = "game-card";
    const s = store.stars(g.id);
    const stars = s ? "⭐".repeat(Math.min(s, 8)) + (s > 8 ? " +" + (s - 8) : "") : "";
    b.innerHTML = `<div class="icon">${g.ikon}</div><div class="name">${g.navn}</div><div class="stars">${stars}</div>`;
    b.addEventListener("pointerdown", () => {
      ensureAudio();
      startGame(g);
    });
    menu.appendChild(b);
  });
}

export function goHome() {
  cancelSpeech();
  clearHint();
  $("party")?.classList.remove("active");
  renderMenu();
  showScreen("home");
}

/* Forældre-gate: hold knappen i 3 sekunder */
let holdT0 = 0;
/** @type {number} */
let holdRAF = 0;
function holdStep() {
  const p = Math.min(1, (performance.now() - holdT0) / 3000);
  const fill = $("holdFill");
  if (fill) fill.style.width = p * 100 + "%";
  if (p >= 1) {
    $("gate")?.classList.remove("active");
    if (fill) fill.style.width = "0";
    const vt = $("voiceToggle");
    if (vt) vt.textContent = store.voiceOn ? "Til" : "Fra";
    $("settings")?.classList.add("active");
  } else {
    holdRAF = requestAnimationFrame(holdStep);
  }
}

export function initUI() {
  $("homeBtn")?.addEventListener("pointerdown", goHome);
  $("partyHomeBtn")?.addEventListener("pointerdown", goHome);
  $("againBtn")?.addEventListener("pointerdown", () => {
    $("party")?.classList.remove("active");
    if (state.current) startGame(state.current);
  });
  $("repeatBtn")?.addEventListener("pointerdown", () => {
    ensureAudio();
    speak(state.current?.say ?? "");
  });

  $("gearBtn")?.addEventListener("pointerdown", () => $("gate")?.classList.add("active"));
  $("gateClose")?.addEventListener("pointerdown", () => $("gate")?.classList.remove("active"));

  const holdBtn = $("holdBtn");
  holdBtn?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    holdT0 = performance.now();
    holdRAF = requestAnimationFrame(holdStep);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
    holdBtn?.addEventListener(ev, () => {
      cancelAnimationFrame(holdRAF);
      const fill = $("holdFill");
      if (fill) fill.style.width = "0";
    })
  );

  $("settingsClose")?.addEventListener("pointerdown", () => {
    $("settings")?.classList.remove("active");
    goHome();
  });
  $("voiceToggle")?.addEventListener("pointerdown", () => {
    store.voiceOn = !store.voiceOn;
    const vt = $("voiceToggle");
    if (vt) vt.textContent = store.voiceOn ? "Til" : "Fra";
  });
  $("resetBtn")?.addEventListener("pointerdown", () => {
    store.reset();
    renderMenu();
  });

  renderMenu();
}
