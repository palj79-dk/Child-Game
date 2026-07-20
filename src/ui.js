// @ts-check
/* ---------- Forside, navigation, forældre-gate ---------- */

import { $ } from "./util.js";
import { store } from "./store.js";
import { GAMES } from "./games/index.js";
import { state, startGame, showScreen, clearHint } from "./engine.js";
import { ensureAudio } from "./sfx.js";
import { audio } from "./audio.js";
import { icon } from "./icon.js";
import { playlog } from "./playlog.js";

export function renderMenu() {
  const menu = $("menu");
  if (!menu) return;
  menu.innerHTML = "";
  GAMES.forEach((g) => {
    const b = document.createElement("button");
    b.className = "game-card";
    const s = store.stars(g.id);
    const stars = s ? "⭐".repeat(Math.min(s, 8)) + (s > 8 ? " +" + (s - 8) : "") : "";
    b.innerHTML = `<div class="icon">${icon("spil-" + g.id)}</div><div class="name">${g.navn}</div><div class="stars">${stars}</div>`;
    b.addEventListener("pointerdown", () => {
      ensureAudio();
      startGame(g);
    });
    menu.appendChild(b);
  });
}

export function goHome() {
  playlog.log("hjem");
  audio.stop();
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
    const lt = $("lockToggle");
    if (lt) lt.textContent = store.lockLevel ? "Låst" : "Automatisk";
    const ct = $("calmToggle");
    if (ct) ct.textContent = store.calm ? "Til" : "Fra";
    $("settings")?.classList.add("active");
  } else {
    holdRAF = requestAnimationFrame(holdStep);
  }
}

/** Anvend en valgt rolle (barn/voksen/qc). */
function applyRole(r) {
  store.role = r;
  playlog.enabled = store.qc;
  document.body.classList.toggle("qc", store.qc);
  if (store.qc) playlog.log("qc-start", { rolle: r });
}

function renderQcLog() {
  const el = $("qclogText");
  if (el) el.textContent = playlog.dump() || "(ingen hændelser endnu – spil en runde)";
}

export function initUI() {
  document.body.classList.toggle("calm", store.calm); // rolig tilstand fra start

  // Rolle + QC play-log (kun lokalt)
  playlog.load();
  playlog.enabled = store.qc;
  document.body.classList.toggle("qc", store.qc);
  if (!store.role) $("role")?.classList.add("active"); // rolle-vælger ved første start

  document.querySelectorAll("#role .role-btn").forEach((b) =>
    b.addEventListener("pointerdown", () => {
      applyRole(/** @type {HTMLElement} */ (b).dataset.role || "barn");
      $("role")?.classList.remove("active");
      $("settings")?.classList.remove("active");
    })
  );
  $("roleBtn")?.addEventListener("pointerdown", () => $("role")?.classList.add("active"));

  $("qcBtn")?.addEventListener("pointerdown", () => {
    renderQcLog();
    $("qclog")?.classList.add("active");
  });
  $("qclogClose")?.addEventListener("pointerdown", () => $("qclog")?.classList.remove("active"));
  $("qclogClear")?.addEventListener("pointerdown", () => {
    playlog.clear();
    renderQcLog();
  });
  $("qclogCopy")?.addEventListener("pointerdown", () => {
    const txt = playlog.dump();
    navigator.clipboard?.writeText(txt).catch(() => {});
  });
  window.addEventListener("qclog", () => {
    if ($("qclog")?.classList.contains("active")) renderQcLog();
  });

  $("homeBtn")?.addEventListener("pointerdown", goHome);
  $("partyHomeBtn")?.addEventListener("pointerdown", goHome);
  $("againBtn")?.addEventListener("pointerdown", () => {
    $("party")?.classList.remove("active");
    if (state.current) startGame(state.current);
  });
  $("repeatBtn")?.addEventListener("pointerdown", () => {
    ensureAudio();
    audio.say(state.current?.say ?? []);
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
  $("aboutBtn")?.addEventListener("pointerdown", () => $("about")?.classList.add("active"));
  $("aboutClose")?.addEventListener("pointerdown", () => $("about")?.classList.remove("active"));
  $("voiceToggle")?.addEventListener("pointerdown", () => {
    store.voiceOn = !store.voiceOn;
    const vt = $("voiceToggle");
    if (vt) vt.textContent = store.voiceOn ? "Til" : "Fra";
  });

  // Rolig tilstand: dæmpet fejring (styres via body.calm i CSS + logik i motor)
  $("calmToggle")?.addEventListener("pointerdown", () => {
    store.calm = !store.calm;
    document.body.classList.toggle("calm", store.calm);
    const ct = $("calmToggle");
    if (ct) ct.textContent = store.calm ? "Til" : "Fra";
  });
  $("resetBtn")?.addEventListener("pointerdown", () => {
    store.reset();
    renderMenu();
  });

  // O2: forældre-lås af sværhedsgrad
  $("lockToggle")?.addEventListener("pointerdown", () => {
    store.lockLevel = !store.lockLevel;
    const lt = $("lockToggle");
    if (lt) lt.textContent = store.lockLevel ? "Låst" : "Automatisk";
  });

  // T3: fuldskærm + landscape-lås (browser; Capacitor låser natively i fase 2)
  $("fullscreenBtn")?.addEventListener("pointerdown", async () => {
    const btn = $("fullscreenBtn");
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        try {
          await /** @type {any} */ (screen.orientation)?.lock?.("landscape");
        } catch (_e) {
          /* orientation-lås ikke understøttet – ignorér */
        }
        if (btn) btn.textContent = "Slå fra";
      } else {
        await document.exitFullscreen?.();
        if (btn) btn.textContent = "Slå til";
      }
    } catch (_e) {
      /* fullscreen ikke tilladt (fx desktop-gestus) – ignorér stille */
    }
  });

  renderMenu();
}
