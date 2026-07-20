// @ts-check
/* Rene logik-tests (R3). Kører i Node uden browser: tester opgave-generatorerne
   for invarianter (ingen dubletter i svarmuligheder, korrekt niveau-pool, ét rigtigt
   svar, rim-regler). Kør: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";

import { gen as bogstavGen } from "../src/games/bogstav.js";
import { gen as talGen, numberOptions } from "../src/games/tal.js";
import { gen as formGen } from "../src/games/form.js";
import { gen as memoryGen } from "../src/games/memory.js";
import { gen as skyggeGen } from "../src/games/dyr.js";
import { gen as dyrGen } from "../src/games/dyr.js";
import { gen as rimGen } from "../src/games/rim.js";
import { gen as sporGen } from "../src/games/spor.js";
import { GAMES } from "../src/games/index.js";
import { store } from "../src/store.js";

const REPS = 400;
const LEVELS = [0, 1, 2];

/** @param {any[]} a */
const uniq = (a) => new Set(a).size === a.length;

test("GAMES: 8 spil med unikke id'er", () => {
  assert.equal(GAMES.length, 8);
  assert.ok(uniq(GAMES.map((g) => g.id)));
  for (const g of GAMES) {
    assert.ok(g.id && g.navn && g.ikon && typeof g.task === "function");
  }
});

test("bogstav: rigtigt antal, mål med i opts, ingen dubletter", () => {
  const N = [3, 4, 6];
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { opts, target } = bogstavGen(lvl);
      assert.equal(opts.length, N[lvl]);
      assert.ok(opts.includes(target));
      assert.ok(uniq(opts));
    }
  }
});

test("tal.numberOptions: 3 distinkte, inkl. n, i [1,max]", () => {
  for (let max = 3; max <= 10; max++) {
    for (let n = 1; n <= max; n++) {
      const o = numberOptions(n, max);
      assert.equal(o.length, 3);
      assert.ok(uniq(o));
      assert.ok(o.includes(n));
      assert.ok(o.every((v) => v >= 1 && v <= max));
    }
  }
});

test("tal.gen: n i [1,max], opts korrekte", () => {
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { n, max, opts } = talGen(lvl);
      assert.ok(n >= 1 && n <= max);
      assert.equal(opts.length, 3);
      assert.ok(opts.includes(n));
      assert.ok(uniq(opts));
    }
  }
});

test("form: distinkte farve/form-kombinationer, mål med i opts", () => {
  const N = [4, 5, 6];
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { opts, target } = formGen(lvl);
      assert.equal(opts.length, N[lvl]);
      assert.ok(opts.includes(target));
      const keys = opts.map((o) => o.s.navn + "|" + o.c.navn);
      assert.ok(uniq(keys), "ingen ens farve+form-kombination");
    }
  }
});

test("memory: deck = par*2, hvert dyr præcis to gange", () => {
  const P = [3, 4, 6];
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { pairs, deck } = memoryGen(lvl);
      assert.equal(pairs, P[lvl]);
      assert.equal(deck.length, pairs * 2);
      const counts = new Map();
      for (const c of deck) counts.set(c.a, (counts.get(c.a) || 0) + 1);
      for (const v of counts.values()) assert.equal(v, 2);
      assert.equal(counts.size, pairs);
    }
  }
});

test("skygge/dyr: mål med i opts, ingen dubletter", () => {
  const N = [3, 4, 6]; // dyr-niveauer
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const d = dyrGen(lvl);
      assert.equal(d.opts.length, N[lvl]);
      assert.ok(d.opts.includes(d.target));
      assert.ok(uniq(d.opts));
      const s = skyggeGen(lvl);
      assert.ok(s.opts.includes(s.target));
      assert.ok(uniq(s.opts));
    }
  }
});

test("rim: præcis ét rigtigt svar, og det rimer på målet", () => {
  const N = [3, 4, 5]; // 1 rigtig + distraktorer
  for (const lvl of LEVELS) {
    for (let r = 0; r < REPS; r++) {
      const { target, options } = rimGen(lvl);
      assert.equal(options.length, N[lvl]);
      const rigtige = options.filter((o) => o.rigtig);
      assert.equal(rigtige.length, 1);
      assert.equal(rigtige[0].ord, target.rimOrd);
    }
  }
});

test("spor: glyf i niveau-pool, pool vokser med niveau", () => {
  let prevLen = 0;
  for (const lvl of LEVELS) {
    let poolLen = 0;
    for (let r = 0; r < REPS; r++) {
      const { g, pool, erTal } = sporGen(lvl);
      assert.ok(pool.includes(g));
      assert.equal(erTal, "1234567890".includes(g));
      poolLen = pool.length;
    }
    assert.ok(poolLen > prevLen, "poolen vokser med niveauet");
    prevLen = poolLen;
  }
});

test("store: addStar øger, reset nulstiller (in-memory i Node)", () => {
  store.reset();
  assert.equal(store.stars("bogstav"), 0);
  store.addStar("bogstav");
  store.addStar("bogstav");
  assert.equal(store.stars("bogstav"), 2);
  store.reset();
  assert.equal(store.stars("bogstav"), 0);
});
