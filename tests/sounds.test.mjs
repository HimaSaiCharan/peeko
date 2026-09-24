import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { settings } from "../core.mjs";
import "../sounds.js";

test("all selectable sounds persist, including short and long options", () => {
  for (const sound of FocusSounds.choices)
    assert.equal(settings({ sound: sound.id }).sound, sound.id);
  assert.equal(FocusSounds.duration(FocusSounds.get("ping")), 0.3);
  assert.equal(FocusSounds.duration(FocusSounds.get("warm")), 2);
  assert.equal(FocusSounds.duration(FocusSounds.get("silent")), 0);
  assert.equal(settings({ sound: "melody" }).sound, "buzzer");
  assert.equal(FocusSounds.get("melody").id, "buzzer");
});

test("audio context remains open through every note; silence creates no context", async () => {
  let listener,
    contexts = 0;
  const stops = [],
    timeouts = [];
  class AudioContext {
    constructor() {
      contexts++;
      this.currentTime = 0;
      this.destination = {};
    }
    async resume() {}
    async close() {}
    createOscillator() {
      return {
        frequency: {},
        connect() {},
        start() {},
        stop(t) {
          stops.push(t);
        },
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
      };
    }
  }
  const context = vm.createContext({
    AudioContext,
    FocusSounds,
    setTimeout(fn, ms) {
      timeouts.push(ms);
    },
    chrome: {
      runtime: {
        onMessage: {
          addListener(fn) {
            listener = fn;
          },
        },
      },
    },
  });
  vm.runInContext(
    readFileSync(new URL("../offscreen.js", import.meta.url), "utf8"),
    context,
  );
  for (const sound of FocusSounds.choices.filter((s) => s.id !== "silent")) {
    stops.length = 0;
    let response;
    listener(
      { target: "audio", sound: sound.id, volume: 45 },
      {},
      (r) => (response = r),
    );
    await new Promise(setImmediate);
    assert.equal(response.ok, true);
    assert.equal(stops.length, sound.notes.length);
    assert.ok(
      timeouts.at(-1) / 1000 > Math.max(...stops),
      sound.id + " must finish before cleanup",
    );
  }
  const before = contexts;
  listener({ target: "audio", sound: "silent", volume: 45 }, {}, () => {});
  listener({ target: "audio", sound: "warm", volume: 0 }, {}, () => {});
  assert.equal(contexts, before);
});
