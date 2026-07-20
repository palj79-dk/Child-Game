// @ts-check
/* =====================================================================
   Leg & Lær – indgang. Wires UI'en op når DOM er klar.
   Ingen netværkskald, ingen dataindsamling. Tale: Web Speech (fallback);
   indspillede danske speaks tilføjes i I3/I4.
   ===================================================================== */
import { initUI } from "./ui.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}
