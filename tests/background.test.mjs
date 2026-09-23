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
  notifications = [],
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
  notifications: {
    onClicked: event(),
    async create(id, value) {
      notifications.push({ id, ...value });
    },
    async clear() {},
  },
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
  await send({
    type: "save",
    patch: { sound: "silent", notifications: false },
  });
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
  await send({ type: "save", patch: { sound: "buzzer", notifications: true } });
  data.timer.deadline = Date.now() - 1;
  await Promise.all([
    send({ type: "tick" }),
    send({ type: "tick" }),
    send({ type: "tick" }),
  ]);
  assert.equal(notifications.length, 1);
  assert.equal(audio.length, 1);
  assert.equal(audio[0].sound, "buzzer");
  await send({ type: "action", action: "skip" });
  await send({ type: "action", action: "pause" });
  assert.ok(!("error" in result));
});
