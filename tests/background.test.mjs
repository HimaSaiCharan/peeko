import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, fresh } from "../core.mjs";
// Browser API contract harness: exercises the actual service worker, including
// simultaneous messages from tabs. This does not replace a live Chrome check.
const event = () => ({
  listeners: [],
  addListener(fn) {
    this.listeners.push(fn);
  },
});
const data = {},
  alarms = new Map(),
  audio = [];
let offscreen = false;
globalThis.chrome = {
  storage: {
    local: {
      async get(keys) {
        return structuredClone(
          Object.fromEntries(
            keys.filter((k) => k in data).map((k) => [k, data[k]]),
          ),
        );
      },
      async set(patch) {
        Object.assign(data, structuredClone(patch));
      },
    },
  },
  alarms: {
    onAlarm: event(),
    async create(name, value) {
      alarms.set(name, value);
    },
    async clear(name) {
      alarms.delete(name);
    },
  },
  action: { async setBadgeText() {}, async setBadgeBackgroundColor() {} },
  runtime: {
    onInstalled: event(),
    onStartup: event(),
    onMessage: event(),
    async getContexts() {
      return offscreen ? [{}] : [];
    },
    async sendMessage(message) {
      audio.push(message);
      return { ok: true };
    },
    async openOptionsPage() {},
  },
  idle: {
    onStateChanged: event(),
    async queryState() {
      return "active";
    },
  },
  offscreen: {
    async createDocument() {
      offscreen = true;
    },
  },
};
await import("../background.js");
const send = (message) =>
  new Promise((resolve) =>
    chrome.runtime.onMessage.listeners[0](message, {}, resolve),
  );
test("service worker coordinates cross-tab commands, alarm recovery, and sound", async () => {
  let result = await send({ type: "get" });
  assert.equal(result.settings.minutes, 20);
  await send({ type: "save", patch: { sound: "silent" } });
  await Promise.all([
    send({ type: "save", patch: { theme: "panther" } }),
    send({ type: "save", patch: { corner: "bottom-left" } }),
  ]);
  assert.equal(data.settings.theme, "panther");
  assert.equal(data.settings.corner, "bottom-left");
  const before = data.timer.deadline;
  await send({ type: "save", patch: { font: "verdana", textSize: "extra" } });
  assert.equal(data.timer.deadline, before);
  assert.equal(data.settings.font, "verdana");
  assert.equal(data.settings.textSize, "extra");
  await send({ type: "save", patch: { theme: "nightfury" } });
  const selected = await send({ type: "get" });
  assert.equal(selected.settings.theme, "nightfury");
  assert.equal(selected.timer.deadline, before);
  await send({ type: "save", patch: { showWidget: false } });
  const hiddenTabs = await Promise.all([
    send({ type: "get" }),
    send({ type: "get" }),
  ]);
  assert.ok(
    hiddenTabs.every(
      (tab) =>
        tab.settings.showWidget === false && tab.timer.deadline === before,
    ),
  );
  await send({ type: "save", patch: { showWidget: true } });
  assert.equal(data.settings.showWidget, true);
  assert.equal(data.timer.deadline, before);
  data.timer = { ...fresh(data.settings), deadline: Date.now() - 100 };
  const replies = await Promise.all(
    Array.from({ length: 5 }, () => send({ type: "tick" })),
  );
  assert.ok(replies.every((r) => r.timer.phase === "break"));
  assert.equal(data.timer.phase, "break");
  assert.ok(data.timer.deadline > Date.now());
  data.timer.deadline = Date.now() - 10;
  await Promise.all([
    send({ type: "tick" }),
    send({ type: "tick" }),
    send({ type: "tick" }),
  ]);
  assert.equal(data.timer.completed, 1);
  assert.equal(data.timer.phase, "work");
  await send({ type: "action", action: "pause" });
  const remaining = data.timer.remaining;
  assert.equal(data.timer.deadline, null);
  assert.equal(alarms.has("focus-deadline"), false);
  await send({ type: "action", action: "pause" });
  assert.ok(data.timer.deadline - Date.now() <= remaining);
  await send({ type: "save", patch: { minutes: 12 } });
  assert.equal(data.timer.total, 12 * 60000);
  await send({ type: "save", patch: { seconds: 30 } });
  await send({ type: "action", action: "preview" });
  assert.equal(data.timer.total, 30000);
  await send({ type: "action", action: "skip" });
  assert.equal(data.timer.phase, "work");
  assert.equal(data.timer.completed, 1);
  await send({ type: "save", patch: { sound: "buzzer" } });
  data.timer.deadline = Date.now() - 1;
  await Promise.all([
    send({ type: "tick" }),
    send({ type: "tick" }),
    send({ type: "tick" }),
  ]);
  assert.equal(audio.length, 1);
  assert.equal(audio[0].sound, "buzzer");
  await send({ type: "action", action: "skip" });
  await send({ type: "action", action: "pause" });
  assert.ok(!("error" in result));
});

test("lock reset, late alarms, manual pauses and restarts preserve one shared timer", async () => {
  const originalNow = Date.now;
  let clock = new Date(2026, 8, 24, 12).getTime();
  Date.now = () => clock;
  let presence = "active";
  chrome.idle.queryState = async () => presence;
  const change = async (state) => {
    presence = state;
    await chrome.idle.onStateChanged.listeners[0](state);
  };
  try {
    await chrome.runtime.onInstalled.listeners[0]();
    assert.equal(alarms.get("focus-recover").periodInMinutes, 0.5);
    await send({ type: "action", action: "reset" });
    clock += 12345;
    const expected = data.timer.deadline - clock;
    const beforeAudio = audio.length;
    await change("locked");
    assert.equal(data.timer.remaining, expected);
    assert.equal(data.timer.systemPaused, true);
    assert.equal(alarms.has("focus-deadline"), false);
    clock += 3600000;
    const locked = await Promise.all([
      send({ type: "tick" }),
      send({ type: "get" }),
    ]);
    assert.ok(
      locked.every((r) => r.timer.paused && r.timer.remaining === expected),
    );
    assert.equal(audio.length, beforeAudio);
    // Ordinary settings changes cannot accidentally resume an automatic pause.
    await send({ type: "save", patch: { theme: "iron" } });
    assert.equal(data.timer.systemPaused, true);
    await change("active");
    assert.equal(data.timer.deadline, clock + data.settings.minutes * 60000);
    assert.equal(alarms.get("focus-deadline").when, data.timer.deadline);
    // Intentional pause remains paused on unlock.
    await send({ type: "action", action: "pause" });
    await change("locked");
    clock += 3600000;
    await change("active");
    assert.equal(data.timer.paused, true);
    assert.equal(data.timer.systemPaused, false);
    await send({ type: "action", action: "pause" });
    // Exactly two minutes is tolerated; obsolete v1.6 checkpoints are ignored.
    const originalDeadline = data.timer.deadline;
    data.presenceCheckedAt = clock - 7200000;
    clock += 120000;
    await change("idle");
    const tabs = await Promise.all([
      send({ type: "tick" }),
      send({ type: "get" }),
    ]);
    assert.ok(tabs.every((r) => r.timer.deadline === originalDeadline));
    // A longer gap resets once before any stale reminder, across all tabs.
    clock += 120001;
    const resetTabs = await Promise.all([
      send({ type: "get" }),
      send({ type: "tick" }),
      send({ type: "get" }),
    ]);
    const resetDeadline = clock + data.settings.minutes * 60000;
    assert.ok(
      resetTabs.every(
        (r) => r.timer.deadline === resetDeadline && r.timer.phase === "work",
      ),
    );
    assert.equal(data.timerCheckedAt, clock);
    assert.equal(audio.length, beforeAudio);
    assert.equal(alarms.get("focus-deadline").when, resetDeadline);
    clock += 30000;
    await send({ type: "tick" });
    assert.equal(data.timer.deadline, resetDeadline);
    // A normally monitored deadline still starts a break and plays exactly once.
    clock = resetDeadline + 100;
    data.timerCheckedAt = clock - 30000;
    await chrome.alarms.onAlarm.listeners[0]({ name: "focus-deadline" });
    await Promise.all([send({ type: "tick" }), send({ type: "tick" })]);
    assert.equal(data.timer.phase, "break");
    assert.equal(audio.length, beforeAudio + 1);
    await send({ type: "action", action: "skip" });
    // Editing duration while locked keeps the automatic resume marker.
    await change("locked");
    await send({ type: "save", patch: { minutes: 8 } });
    assert.equal(data.timer.remaining, 480000);
    assert.equal(data.timer.systemPaused, true);
    clock += 3600000;
    await change("idle");
    assert.equal(data.timer.deadline, clock + 480000);
    assert.equal(data.timer.paused, false);
    // Locking during a break discards it on unlock without a completion sound.
    await send({ type: "action", action: "preview" });
    const count = data.timer.completed,
      breakAudio = audio.length;
    clock += 5000;
    await change("locked");
    clock += 3600000;
    await chrome.alarms.onAlarm.listeners[0]({ name: "focus-deadline" });
    assert.equal(data.timer.paused, true);
    assert.equal(audio.length, breakAudio);
    const blocked = await send({ type: "action", action: "skip" });
    assert.match(blocked.error, /Unlock/);
    await change("active");
    const freshDeadline = clock + 480000;
    assert.equal(data.timer.phase, "work");
    assert.equal(data.timer.deadline, freshDeadline);
    assert.equal(data.timer.completed, count);
    assert.equal(audio.length, breakAudio);
    clock += 1000;
    await Promise.all([send({ type: "tick" }), send({ type: "get" })]);
    await change("active");
    assert.equal(data.timer.deadline, freshDeadline);
    // A gap during a break starts fresh focus without a completion or sound.
    await send({ type: "action", action: "preview" });
    const gapAudio = audio.length,
      gapCount = data.timer.completed;
    clock += 120001;
    await chrome.alarms.onAlarm.listeners[0]({ name: "focus-recover" });
    assert.equal(data.timer.phase, "work");
    assert.equal(data.timer.deadline, clock + 480000);
    assert.equal(data.timer.completed, gapCount);
    assert.equal(audio.length, gapAudio);
    // An intentional pause survives a gap and does not reset immediately on resume.
    await send({ type: "action", action: "pause" });
    const held = data.timer.remaining;
    clock += 7200000;
    await send({ type: "get" });
    assert.equal(data.timer.paused, true);
    assert.equal(data.timer.remaining, held);
    await send({ type: "action", action: "pause" });
    assert.equal(data.timer.deadline, clock + held);
    // A browser restart retains saved manual/automatic pauses correctly.
    await change("locked");
    await chrome.runtime.onStartup.listeners[0]();
    assert.equal(data.timer.systemPaused, true);
    clock += 1000;
    await change("active");
    assert.equal(data.timer.deadline, clock + 480000);
    await send({ type: "action", action: "pause" });
    const paused = structuredClone(data.timer);
    await chrome.runtime.onStartup.listeners[0]();
    assert.deepEqual(data.timer, paused);
    await send({ type: "action", action: "pause" });
    clock += 1000;
    await chrome.runtime.onStartup.listeners[0]();
    assert.equal(data.timer.deadline, clock + 480000);
    await send({ type: "action", action: "pause" });
  } finally {
    Date.now = originalNow;
  }
});
