// @ts-check
import { bogstav } from "./bogstav.js";
import { tal } from "./tal.js";
import { form } from "./form.js";
import { memory } from "./memory.js";
import { skygge } from "./skygge.js";
import { dyr } from "./dyr.js";
import { rim } from "./rim.js";
import { spor } from "./spor.js";

/** Rækkefølgen på forsiden. @type {import("../engine.js").Game[]} */
export const GAMES = [bogstav, tal, form, memory, skygge, dyr, rim, spor];
