// @ts-check
/* =====================================================================
   Leg & Lær – indgang. Wires UI'en op når DOM er klar.
   Ingen netværkskald, ingen dataindsamling. Tale: Web Speech (fallback);
   indspillede danske speaks tilføjes i I3/I4.
   ===================================================================== */
import { initUI } from "./ui.js";

// T4: forhindr at langt tryk markerer tekst / åbner kontekstmenu på børns skærm
document.addEventListener("contextmenu", (e) => e.preventDefault());

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}
